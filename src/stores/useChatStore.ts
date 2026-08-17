import { create } from 'zustand';
import type { ChatMessage, QuickReply, PetAiContext } from '@/types';
import { buildAiInitMessages, buildQuickReplies } from '@/services/mock/ai.mock';
import { generateId } from '@/utils/format';
import { getAiReply } from '@/services/ai';
import { usePetStore } from './usePetStore';
import { useFeedStore } from './useFeedStore';

interface ChatState {
  messages: ChatMessage[];
  quickReplies: QuickReply[];
  sending: boolean;
  initChat: () => Promise<void>;
  sendMessage: (text: string) => Promise<void>;
  clearChat: () => void;
}

// 从宠物档案 + 成长/运动记录 + 日常动态里聚合 AI 上下文
function buildContext(): PetAiContext {
  const { pets, currentPetId, timeline } = usePetStore.getState();
  const pet = pets.find((p) => p.id === currentPetId) || pets[0];
  const feedItems = useFeedStore.getState().feedItems;

  if (!pet) {
    return {
      name: '宝贝', type: '', breed: '', age: '', gender: '',
      personality: '', hobbies: '', records: [], feeds: [],
    };
  }

  const records = (timeline || [])
    .filter((t) => t.petId === pet.id)
    .map((t) => ({ title: t.title, desc: t.desc, date: t.date }))
    .slice(0, 6);

  const feeds = feedItems
    .filter((f) => f.petName === pet.name && f.txt)
    .map((f) => f.txt)
    .slice(0, 5);

  return {
    name: pet.name,
    type: pet.type,
    breed: pet.breed,
    age: String(pet.age),
    gender: pet.gender,
    personality: pet.personality,
    hobbies: pet.hobbies,
    records,
    feeds,
  };
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  quickReplies: [],
  sending: false,

  initChat: async () => {
    const petState = usePetStore.getState();
    if (petState.pets.length === 0) {
      await petState.fetchPets().catch(() => {});
    }
    // 预取动态供 AI 参考（不阻塞）
    useFeedStore.getState().fetchFeed().catch(() => {});

    const ctx = buildContext();
    const initMsgs = buildAiInitMessages(ctx.name);
    set({
      quickReplies: buildQuickReplies(ctx.name),
      messages: initMsgs.map((m, i) => ({
        id: `init-${i}`,
        role: m.role,
        avatar: m.role === 'bot' ? '🤖' : '😎',
        text: m.text,
        timestamp: Date.now() - (initMsgs.length - i) * 60000,
      })),
    });
  },

  sendMessage: async (text) => {
    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'me',
      avatar: '😎',
      text,
      timestamp: Date.now(),
    };
    set((s) => ({ messages: [...s.messages, userMsg], sending: true }));

    try {
      const replyText = await getAiReply(text, buildContext());
      const botMsg: ChatMessage = {
        id: generateId(),
        role: 'bot',
        avatar: '🤖',
        text: replyText,
        timestamp: Date.now(),
      };
      set((s) => ({ messages: [...s.messages, botMsg], sending: false }));
    } catch (e) {
      set({ sending: false });
      throw e;
    }
  },

  clearChat: () => set({ messages: [] }),
}));
