/**
 * 宠物服务层：封装宠物 + 成长记录的获取/创建
 * MOCK_ENABLED = true 走本地 mock，false 走云函数
 */
import type { Pet, TimelineEntry, CreatePetInput, PetType } from '@/types';
import { MOCK_ENABLED } from './mock';
import { mockPets, mockTimeline } from './mock/pet.mock';
import { callCloudFunction } from './cloud';
import { generateId } from '@/utils/format';

const TYPE_EMOJI: Record<PetType, string> = { '狗': '🐕', '猫': '🐱', '兔': '🐰', '其他': '🐾' };

interface RawPet {
  _id: string;
  name: string;
  type: PetType;
  breed: string;
  birthday: string;
  gender: Pet['gender'];
  personality: string;
  hobbies: string;
  avatar?: string;
  photos?: string[];
  age?: number;
  createdAt?: string;
}

interface RawRecord {
  _id: string;
  petId: string;
  date?: string;
  title?: string;
  desc?: string;
  emoji?: string;
  imageUrl?: string;
  activityKey?: string;
  createdAt?: string;
}

export interface AddRecordInput {
  petId: string;
  date: string;
  title: string;
  desc: string;
  emoji: string;
  imageUrl?: string;
  activityKey?: string;
}

function toTimeline(raw: RawRecord): TimelineEntry {
  return {
    id: raw._id,
    petId: raw.petId,
    date: raw.date || '',
    title: raw.title || raw.emoji || '记录',
    desc: raw.desc || '',
    emoji: raw.emoji || '🐾',
    imageUrl: raw.imageUrl,
    activityKey: raw.activityKey,
  };
}

// 云数据库记录 → 前端 Pet 类型（_id → id）
function toPet(raw: RawPet): Pet {
  return {
    id: raw._id,
    name: raw.name,
    type: raw.type,
    breed: raw.breed,
    birthday: raw.birthday,
    gender: raw.gender,
    personality: raw.personality,
    hobbies: raw.hobbies,
    avatar: raw.avatar || TYPE_EMOJI[raw.type] || '🐾',
    photos: raw.photos || [],
    age: raw.age || 0,
    createdAt: raw.createdAt || '',
  };
}

export async function fetchPetData(): Promise<{ pets: Pet[]; timeline: TimelineEntry[] }> {
  if (MOCK_ENABLED) {
    return {
      pets: [...mockPets],
      timeline: [...mockTimeline].sort((a, b) => b.date.localeCompare(a.date)),
    };
  }

  const list = await callCloudFunction<RawPet[]>('pet', { action: 'list' });
  let timeline: TimelineEntry[] = [];
  try {
    const records = await callCloudFunction<RawRecord[]>('pet', { action: 'listRecords' });
    timeline = (records || []).map(toTimeline);
  } catch {
    // listRecords 尚未部署或拉取失败时，不影响宠物列表展示
  }
  return {
    pets: (list || []).map(toPet),
    timeline,
  };
}

export async function createPet(data: CreatePetInput): Promise<Pet> {
  const avatar = data.avatar || TYPE_EMOJI[data.type] || '🐾';
  if (MOCK_ENABLED) {
    return {
      id: generateId(),
      ...data,
      avatar,
      age: 0,
      createdAt: new Date().toISOString(),
    };
  }

  const raw = await callCloudFunction<RawPet>('pet', {
    action: 'create',
    data: { ...data, avatar, age: 0 },
  });
  return toPet(raw);
}

export async function updatePet(id: string, data: CreatePetInput): Promise<Pet> {
  const avatar = data.avatar || TYPE_EMOJI[data.type] || '🐾';
  if (MOCK_ENABLED) {
    return { id, ...data, avatar, age: 0, createdAt: new Date().toISOString() };
  }

  const raw = await callCloudFunction<RawPet>('pet', {
    action: 'update',
    data: { _id: id, ...data, avatar },
  });
  return toPet(raw);
}

export async function addRecord(data: AddRecordInput): Promise<TimelineEntry> {
  if (MOCK_ENABLED) {
    return { id: generateId(), ...data };
  }

  const raw = await callCloudFunction<RawRecord>('pet', {
    action: 'addRecord',
    data,
  });
  return toTimeline(raw);
}
