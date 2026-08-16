import { create } from 'zustand';
import type { PetIdentity } from '@/types';
import {
  fetchRecords as fetchRecordsApi,
  applyIdentity as applyIdentityApi,
} from '@/services/identity';

interface IdentityState {
  records: PetIdentity[];
  fetchRecords: () => Promise<void>;
  applyIdentity: (data: Omit<PetIdentity, 'id' | 'status' | 'submittedAt'>) => Promise<void>;
  getByIdentityPetId: (petId: string) => PetIdentity | undefined;
}

export const useIdentityStore = create<IdentityState>((set, get) => ({
  records: [],

  fetchRecords: async () => {
    const records = await fetchRecordsApi();
    set({ records });
  },

  applyIdentity: async (data) => {
    const record = await applyIdentityApi(data);
    set((s) => ({
      records: [record, ...s.records.filter((r) => r.petId !== record.petId)],
    }));
  },

  getByIdentityPetId: (petId) => get().records.find((r) => r.petId === petId),
}));
