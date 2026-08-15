export interface RankEntry {
  id: string;
  rank: number;
  pet: string;
  petName: string;
  breed: string;
  owner: string;
  likes: number;
  trend: 'up' | 'down' | 'same';
  bg: string;
}

export const mockRankEntries: RankEntry[] = [
  {
    id: 'r1',
    rank: 1,
    pet: '🐶',
    petName: '团子',
    breed: '柯基·1岁',
    owner: '@短腿大魔王',
    likes: 734,
    trend: 'up',
    bg: 'linear-gradient(135deg,#FFB6C1,#FF9A9E)',
  },
  {
    id: 'r2',
    rank: 2,
    pet: '🐱',
    petName: '橘子',
    breed: '橘猫·2岁',
    owner: '@橘子大人',
    likes: 512,
    trend: 'up',
    bg: 'linear-gradient(135deg,#FFE8B0,#FFD93D)',
  },
  {
    id: 'r3',
    rank: 3,
    pet: '🐕',
    petName: '豆豆',
    breed: '金毛·3岁',
    owner: '@豆豆麻麻',
    likes: 286,
    trend: 'down',
    bg: 'linear-gradient(135deg,#FFE4C4,#FFD9B0)',
  },
  {
    id: 'r4',
    rank: 4,
    pet: '🐰',
    petName: '雪球',
    breed: '荷兰垂耳兔',
    owner: '@雪球麻麻',
    likes: 198,
    trend: 'same',
    bg: 'linear-gradient(135deg,#E8F5E9,#C8E6C9)',
  },
  {
    id: 'r5',
    rank: 5,
    pet: '🐹',
    petName: '花生',
    breed: '仓鼠·6个月',
    owner: '@花生酱',
    likes: 156,
    trend: 'up',
    bg: 'linear-gradient(135deg,#FFF0EA,#FFE4D6)',
  },
  {
    id: 'r6',
    rank: 6,
    pet: '🦜',
    petName: '啾啾',
    breed: '玄凤鹦鹉·2岁',
    owner: '@鸟语花香',
    likes: 98,
    trend: 'down',
    bg: 'linear-gradient(135deg,#E3F2FD,#BBDEFB)',
  },
];
