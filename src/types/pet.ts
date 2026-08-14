export type PetType = '狗' | '猫' | '兔' | '其他';

export interface Pet {
  id: string;
  name: string;
  type: PetType;
  breed: string;
  birthday: string;
  gender: '♂ 男孩' | '♀ 女孩';
  personality: string;
  hobbies: string;
  avatar: string;       // emoji or image url
  photos: string[];
  age: number;
  createdAt: string;
}

export interface TimelineEntry {
  id: string;
  petId: string;
  date: string;
  title: string;
  desc: string;
  emoji: string;
  imageUrl?: string;
}

export interface CreatePetInput {
  name: string;
  type: PetType;
  breed: string;
  birthday: string;
  gender: '♂ 男孩' | '♀ 女孩';
  personality: string;
  hobbies: string;
  photos: string[];
}

export interface HealthRecord {
  id: string;
  petId: string;
  type: 'vaccine' | 'deworming' | 'weight' | 'other';
  name: string;
  date: string;
  nextDate?: string;
  status: 'completed' | 'pending' | 'overdue';
  notes?: string;
}

export interface WeightRecord {
  month: string;
  weight: number;
  unit: string;
}
