import { create } from 'zustand';
import type { PetIdentity } from '@/types';
import { generateId } from '@/utils/format';

interface IdentityState {
  records: PetIdentity[];
  applyIdentity: (data: Omit<PetIdentity, 'id' | 'status' | 'submittedAt'>) => PetIdentity;
  getByIdentityPetId: (petId: string) => PetIdentity | undefined;
}

export const useIdentityStore = create<IdentityState>((set, get) => ({
  records: [],

  applyIdentity: (data) => {
    const record: PetIdentity = {
      ...data,
      id: generateId(),
      status: 'reviewing',
      submittedAt: new Date().toISOString(),
    };
    set((s) => ({ records: [record, ...s.records] }));
    return record;
  },

  getByIdentityPetId: (petId) => get().records.find((r) => r.petId === petId),
}));
