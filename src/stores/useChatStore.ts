import { create } from 'zustand';
import type { ChatMessage, QuickReply } from '@/types';
import { mockAiInitMessages, mockQuickReplies } from '@/services/mock/ai.mock';
import { generateId } from '@/utils/format';
import { getAiReply } from '@/services/ai';

interface ChatState {
  messages: ChatMessage[];
  quickReplies: QuickReply[];
  sending: boolean;
  initChat: () => void;
  sendMessage: (text: string) => Promise<void>;
  clearChat: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  quickReplies: mockQuickReplies,
  sending: false,

  initChat: () => {
    set({
      messages: mockAiInitMessages.map((m, i) => ({
        id: `init-${i}`,
        role: m.role,
        avatar: m.role === 'bot' ? '🤖' : '😎',
        text: m.text,
        timestamp: Date.now() - (mockAiInitMessages.length - i) * 60000,
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
      const replyText = await getAiReply(text);
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
