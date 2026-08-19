export type FeedVisibility = 'public' | 'friends' | 'private';

export interface FeedItem {
  id: string;
  pet: string;          // emoji
  petName: string;
  breed: string;
  age: string;
  owner: string;
  ownerId: string;      // 作者 openid
  ownerAvatar: string;  // 主人头像（emoji 或图片路径）
  time: string;
  bg: string;           // gradient background
  txt: string;
  tags: string[];
  pics: number;         // 1 or 2
  picsEmoji: string[];
  images?: string[];    // 真实图片路径(可选)
  likes: number;
  cmts: number;
  liked: boolean;
  collected: boolean;
  category: string;
  visibility?: FeedVisibility;  // 公开/好友/仅自己可见
}

export interface Comment {
  id: string;
  feedId: string;
  userId: string;
  userName: string;
  avatar: string;
  text: string;
  time: string;
  likes: number;
}
