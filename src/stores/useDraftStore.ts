import { create } from 'zustand';
import Taro from '@tarojs/taro';
import type { PublishTarget } from '@/constants/record';
import { generateId } from '@/utils/format';

const STORAGE_KEY = 'pet_record_drafts';

export interface PetRecordDraft {
  id: string;
  petId: string;
  activityKey: string;
  text: string;
  tags: string[];
  images: string[]; // 临时路径（wxfile://），可能失效
  target: PublishTarget;
  savedAt: number;
}

interface DraftState {
  drafts: PetRecordDraft[];
  loadDrafts: () => void;
  saveDraft: (data: Omit<PetRecordDraft, 'id' | 'savedAt'>) => void;
  removeDraft: (id: string) => void;
}

function readStorage(): PetRecordDraft[] {
  try {
    const v = Taro.getStorageSync(STORAGE_KEY);
    return Array.isArray(v) ? (v as PetRecordDraft[]) : [];
  } catch {
    return [];
  }
}

function writeStorage(drafts: PetRecordDraft[]) {
  try {
    Taro.setStorageSync(STORAGE_KEY, drafts);
  } catch {
    /* ignore */
  }
}

export const useDraftStore = create<DraftState>((set, get) => ({
  drafts: [],

  loadDrafts: () => {
    set({ drafts: readStorage() });
  },

  saveDraft: (data) => {
    const draft: PetRecordDraft = { ...data, id: generateId(), savedAt: Date.now() };
    const next = [draft, ...get().drafts];
    set({ drafts: next });
    writeStorage(next);
  },

  removeDraft: (id) => {
    const next = get().drafts.filter((d) => d.id !== id);
    set({ drafts: next });
    writeStorage(next);
  },
}));
