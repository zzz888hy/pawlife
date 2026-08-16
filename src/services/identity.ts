/**
 * 宠物身份认证服务层
 */
import type { PetIdentity } from '@/types';
import { MOCK_ENABLED } from './mock';
import { callCloudFunction } from './cloud';
import { generateId } from '@/utils/format';

interface RawIdentity {
  _id: string;
  petId: string;
  status: PetIdentity['status'];
  chipNo: string;
  vaccineNo: string;
  pedigree: string;
  submittedAt?: string;
}

function toIdentity(raw: RawIdentity): PetIdentity {
  return {
    id: raw._id,
    petId: raw.petId,
    status: raw.status,
    chipNo: raw.chipNo,
    vaccineNo: raw.vaccineNo,
    pedigree: raw.pedigree,
    submittedAt: raw.submittedAt || '',
  };
}

export async function fetchRecords(): Promise<PetIdentity[]> {
  if (MOCK_ENABLED) return [];
  const list = await callCloudFunction<RawIdentity[]>('identity', { action: 'list', data: {} });
  return (list || []).map(toIdentity);
}

export async function applyIdentity(
  data: Omit<PetIdentity, 'id' | 'status' | 'submittedAt'>
): Promise<PetIdentity> {
  if (MOCK_ENABLED) {
    return { ...data, id: generateId(), status: 'reviewing', submittedAt: new Date().toISOString() };
  }
  const raw = await callCloudFunction<RawIdentity>('identity', { action: 'apply', data });
  return toIdentity(raw);
}
