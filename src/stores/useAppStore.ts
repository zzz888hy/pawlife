import { create } from 'zustand';
import Taro from '@tarojs/taro';

interface AppState {
  splashShown: boolean;
  dismissSplash: () => void;
  /**
   * 弹一条轻提示。
   * 直接走 Taro.showToast，保证全局可见——不要改回「存进 store 等某个组件渲染」，
   * 项目里没有渲染 toast 列表的组件，那样写会变成点了没反应。
   */
  showToast: (text: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  splashShown: false,

  dismissSplash: () => set({ splashShown: true }),

  showToast: (text: string) => {
    Taro.showToast({ title: text, icon: 'none', duration: 2000 });
  },
}));
