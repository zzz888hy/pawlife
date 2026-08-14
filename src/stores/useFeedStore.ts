import { create } from 'zustand';
import type { FeedItem } from '@/types';
import { mockFeedItems } from '@/services/mock/feed.mock';
import { generateId } from '@/utils/format';

const CATEGORIES = ['推荐', '最萌猫咪', '最帅狗狗', '最佳穿搭', '最搞笑', '饲养经验'];

interface CreateFeedData {
  petName: string;
  petEmoji: string;
  breed: string;
  text: string;
  tags: string[];
  images: string[];
  category: string;
}

interface FeedState {
  feedItems: FeedItem[];
  categories: string[];
  activeCategory: string;
  loading: boolean;
  fetchFeed: (category?: string) => void;
  addFeed: (data: CreateFeedData) => void;
  toggleLike: (feedId: string) => void;
  toggleCollect: (feedId: string) => void;
  setCategory: (cat: string) => void;
}

export const useFeedStore = create<FeedState>((set) => ({
  feedItems: [],
  categories: CATEGORIES,
  activeCategory: '推荐',
  loading: false,

  fetchFeed: (category?: string) => {
    set({ loading: true });
    const cat = category || '推荐';
    setTimeout(() => {
      set({
        feedItems: mockFeedItems,
        activeCategory: cat,
        loading: false,
      });
    }, 200);
  },

  addFeed: (data: CreateFeedData) => {
    const newFeed: FeedItem = {
      id: generateId(),
      pet: data.petEmoji,
      petName: data.petName,
      breed: data.breed,
      age: '3岁',
      owner: '@宠物主人',
      ownerId: 'me',
      time: '刚刚',
      bg: 'linear-gradient(135deg,#FFF0EA,#FFE4D6)',
      txt: data.text,
      tags: data.tags,
      pics: data.images.length >= 2 ? 2 : 1,
      picsEmoji: data.images.length > 0 ? data.images.slice(0, 2) : [data.petEmoji],
      likes: 0,
      cmts: 0,
      liked: false,
      collected: false,
      category: data.category,
    };
    set((s) => ({
      feedItems: [newFeed, ...s.feedItems],
    }));
  },

  toggleLike: (feedId: string) => {
    set((s) => ({
      feedItems: s.feedItems.map((f) =>
        f.id === feedId
          ? { ...f, liked: !f.liked, likes: f.likes + (f.liked ? -1 : 1) }
          : f
      ),
    }));
  },

  toggleCollect: (feedId: string) => {
    set((s) => ({
      feedItems: s.feedItems.map((f) =>
        f.id === feedId ? { ...f, collected: !f.collected } : f
      ),
    }));
  },

  setCategory: (cat: string) => set({ activeCategory: cat }),
}));
