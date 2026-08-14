import { create } from 'zustand';
import type { Pet, TimelineEntry, CreatePetInput } from '@/types';
import { mockPets, mockTimeline } from '@/services/mock/pet.mock';
import { generateId } from '@/utils/format';

interface PetState {
  pets: Pet[];
  currentPetId: string | null;
  timeline: TimelineEntry[];
  loading: boolean;
  fetchPets: () => void;
  switchPet: (petId: string) => void;
  createPet: (data: CreatePetInput) => void;
  getCurrentPet: () => Pet | null;
}

export const usePetStore = create<PetState>((set, get) => ({
  pets: [],
  currentPetId: null,
  timeline: [],
  loading: false,

  fetchPets: () => {
    set({ loading: true });
    // Simulate async
    setTimeout(() => {
      set({
        pets: mockPets,
        currentPetId: mockPets[0]?.id || null,
        timeline: mockTimeline,
        loading: false,
      });
    }, 200);
  },

  switchPet: (petId: string) => {
    set({ currentPetId: petId });
  },

  createPet: (data: CreatePetInput) => {
    const newPet: Pet = {
      id: generateId(),
      ...data,
      avatar: data.photos[0] || '🐾',
      age: 0,
      createdAt: new Date().toISOString(),
    };
    set((s) => ({ pets: [...s.pets, newPet], currentPetId: newPet.id }));
  },

  getCurrentPet: () => {
    const { pets, currentPetId } = get();
    return pets.find((p) => p.id === currentPetId) || null;
  },
}));
