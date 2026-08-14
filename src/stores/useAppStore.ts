import { create } from 'zustand';

interface ToastMessage {
  id: string;
  text: string;
}

interface AppState {
  splashShown: boolean;
  toasts: ToastMessage[];
  dismissSplash: () => void;
  showToast: (text: string) => void;
  removeToast: (id: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  splashShown: false,
  toasts: [],

  dismissSplash: () => set({ splashShown: true }),

  showToast: (text: string) => {
    const id = Date.now().toString(36);
    set((s) => ({ toasts: [...s.toasts, { id, text }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 2000);
  },

  removeToast: (id: string) => {
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
  },
}));
