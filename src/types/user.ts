export interface UserProfile {
  userId: string;
  nickname: string;
  avatar: string;
  companionDays: number;
  isVip: boolean;
  vipExpireDate: string | null;
  coins: number;
  petCount: number;
  recordCount: number;
}

export interface MemorialPet {
  id: string;
  emoji: string;
  name: string;
  dateRange: string;
  message: string;
}
