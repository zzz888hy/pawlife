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
  return {
    pets: (list || []).map(toPet),
    timeline: [], // 成长记录后续单独接，先返回空
  };
}

export async function createPet(data: CreatePetInput): Promise<Pet> {
  if (MOCK_ENABLED) {
    return {
      id: generateId(),
      ...data,
      avatar: TYPE_EMOJI[data.type] || '🐾',
      age: 0,
      createdAt: new Date().toISOString(),
    };
  }

  const raw = await callCloudFunction<RawPet>('pet', {
    action: 'create',
    data: { ...data, avatar: TYPE_EMOJI[data.type] || '🐾', age: 0 },
  });
  return toPet(raw);
}
