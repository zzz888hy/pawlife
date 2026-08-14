import { create } from 'zustand';
import type { UserProfile, VipPlan } from '@/types';
import { login as cloudLogin } from '@/services/auth';

interface UserState extends UserProfile {
  isLoggedIn: boolean;
  fetchUser: () => Promise<void>;
  login: (nickname?: string) => Promise<void>;
  setUser: (user: Partial<UserProfile>) => void;
  addCoins: (amount: number) => void;
  setVip: (plan: VipPlan) => void;
}

const defaultUser: UserProfile = {
  userId: 'PL20240192',
  nickname: '宠物主人',
  avatar: '😎',
  companionDays: 826,
  isVip: false,
  vipExpireDate: null,
  coins: 386,
  petCount: 2,
  recordCount: 142,
};

export const useUserStore = create<UserState>((set) => ({
  ...defaultUser,
  isLoggedIn: false,

  fetchUser: async () => {
    try {
      const user = await cloudLogin();
      if (user) {
        set({
          userId: user._id || user.openid,
          nickname: user.nickname,
          avatar: user.avatarUrl,
          coins: user.coins,
          isVip: user.isVip,
          vipExpireDate: user.vipExpireDate,
          petCount: user.petCount,
          isLoggedIn: true,
        });
      }
    } catch {
      // 登录失败，使用默认游客状态
    }
  },

  login: async (nickname?: string) => {
    try {
      const user = await cloudLogin(nickname);
      if (user) {
        set({
          userId: user._id || user.openid,
          nickname: user.nickname,
          avatar: user.avatarUrl,
          coins: user.coins,
          isVip: user.isVip,
          vipExpireDate: user.vipExpireDate,
          petCount: user.petCount,
          isLoggedIn: true,
        });
      }
    } catch {
      // 登录失败，保持游客状态
    }
  },

  setUser: (user) => set((s) => ({ ...s, ...user })),

  addCoins: (amount) => set((s) => ({ coins: s.coins + amount })),

  setVip: (_plan) =>
    set({
      isVip: true,
      vipExpireDate: new Date(Date.now() + 365 * 86400000).toISOString(),
    }),
}));
