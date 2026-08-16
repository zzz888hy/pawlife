import { create } from 'zustand';
import type { MessageItem } from '@/types';
import {
  fetchMessages as fetchMessagesApi,
  markRead as markReadApi,
  markAllRead as markAllReadApi,
} from '@/services/message';

interface MessageState {
  messages: MessageItem[];
  fetchMessages: () => Promise<void>;
  markRead: (id: string) => void;
  markAllRead: () => void;
}

export const useMessageStore = create<MessageState>((set) => ({
  messages: [],

  fetchMessages: async () => {
    const messages = await fetchMessagesApi();
    set({ messages });
  },

  markRead: (id) => {
    set((s) => ({
      messages: s.messages.map((m) => (m.id === id ? { ...m, read: true } : m)),
    }));
    markReadApi(id).catch(() => {});
  },

  markAllRead: () => {
    set((s) => ({
      messages: s.messages.map((m) => ({ ...m, read: true })),
    }));
    markAllReadApi().catch(() => {});
  },
}));
