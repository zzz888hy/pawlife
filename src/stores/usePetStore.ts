import { create } from 'zustand';
import type { Pet, TimelineEntry, CreatePetInput } from '@/types';
import {
  fetchPetData,
  createPet as createPetApi,
  updatePet as updatePetApi,
  addRecord as addRecordApi,
  type AddRecordInput,
} from '@/services/pet';

interface PetState {
  pets: Pet[];
  currentPetId: string | null;
  timeline: TimelineEntry[];
  loading: boolean;
  fetchPets: () => Promise<void>;
  switchPet: (petId: string) => void;
  createPet: (data: CreatePetInput) => Promise<void>;
  updatePet: (petId: string, data: CreatePetInput) => Promise<void>;
  addRecord: (data: AddRecordInput) => Promise<void>;
  getCurrentPet: () => Pet | null;
}

export const usePetStore = create<PetState>((set, get) => ({
  pets: [],
  currentPetId: null,
  timeline: [],
  loading: false,

  fetchPets: async () => {
    set({ loading: true });
    try {
      const { pets, timeline } = await fetchPetData();
      set({
        pets,
        currentPetId: pets[0]?.id || null,
        timeline,
        loading: false,
      });
    } catch {
      set({ loading: false });
    }
  },

  switchPet: (petId: string) => {
    set({ currentPetId: petId });
  },

  createPet: async (data: CreatePetInput) => {
    const newPet = await createPetApi(data);
    set((s) => ({ pets: [...s.pets, newPet], currentPetId: newPet.id }));
  },

  updatePet: async (petId: string, data: CreatePetInput) => {
    const updated = await updatePetApi(petId, data);
    set((s) => ({
      pets: s.pets.map((p) =>
        p.id === petId ? { ...p, ...updated, age: p.age, createdAt: p.createdAt } : p
      ),
    }));
  },

  addRecord: async (data: AddRecordInput) => {
    const entry = await addRecordApi(data);
    set((s) => ({ timeline: [entry, ...s.timeline] }));
  },

  getCurrentPet: () => {
    const { pets, currentPetId } = get();
    return pets.find((p) => p.id === currentPetId) || null;
  },
}));
