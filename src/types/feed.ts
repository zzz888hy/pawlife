export interface FeedItem {
  id: string;
  pet: string;          // emoji
  petName: string;
  breed: string;
  age: string;
  owner: string;
  ownerId: string;
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
