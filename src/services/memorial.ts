/**
 * 纪念馆服务层
 */
import type { MemorialPet } from '@/types';
import { MOCK_ENABLED } from './mock';
import { mockMemorialPets } from './mock/memorial.mock';
import { callCloudFunction } from './cloud';

interface RawMemorial {
  _id: string;
  emoji: string;
  name: string;
  dateRange: string;
  message: string;
}

export async function fetchMemorials(): Promise<MemorialPet[]> {
  if (MOCK_ENABLED) return [...mockMemorialPets];
  const list = await callCloudFunction<RawMemorial[]>('memorial', { action: 'list', data: {} });
  return (list || []).map((r) => ({
    id: r._id,
    emoji: r.emoji,
    name: r.name,
    dateRange: r.dateRange,
    message: r.message,
  }));
}
