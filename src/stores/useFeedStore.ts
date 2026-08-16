import { create } from 'zustand';
import type { FeedItem } from '@/types';
import {
  fetchFeed as fetchFeedApi,
  createFeed as createFeedApi,
  toggleLike as toggleLikeApi,
  type CreateFeedData,
} from '@/services/feed';

const CATEGORIES = ['推荐', '最萌猫咪', '最帅狗狗', '最佳穿搭', '最搞笑', '饲养经验'];

interface FeedState {
  feedItems: FeedItem[];
  categories: string[];
  activeCategory: string;
  loading: boolean;
  fetchFeed: (category?: string) => Promise<void>;
  addFeed: (data: CreateFeedData) => Promise<void>;
  toggleLike: (feedId: string) => void;
  toggleCollect: (feedId: string) => void;
  incrementCmts: (feedId: string) => void;
  setCategory: (cat: string) => void;
}

export const useFeedStore = create<FeedState>((set) => ({
  feedItems: [],
  categories: CATEGORIES,
  activeCategory: '推荐',
  loading: false,

  fetchFeed: async (category) => {
    set({ loading: true });
    try {
      const items = await fetchFeedApi();
      set({ feedItems: items, activeCategory: category || '推荐', loading: false });
    } catch {
      set({ loading: false });
    }
  },

  addFeed: async (data) => {
    const newFeed = await createFeedApi(data);
    set((s) => ({ feedItems: [newFeed, ...s.feedItems] }));
  },

  toggleLike: (feedId) => {
    set((s) => ({
      feedItems: s.feedItems.map((f) =>
        f.id === feedId ? { ...f, liked: !f.liked, likes: f.likes + (f.liked ? -1 : 1) } : f
      ),
    }));
    toggleLikeApi(feedId).catch(() => {});
  },

  toggleCollect: (feedId) => {
    set((s) => ({
      feedItems: s.feedItems.map((f) =>
        f.id === feedId ? { ...f, collected: !f.collected } : f
      ),
    }));
  },

  incrementCmts: (feedId) => {
    set((s) => ({
      feedItems: s.feedItems.map((f) =>
        f.id === feedId ? { ...f, cmts: f.cmts + 1 } : f
      ),
    }));
  },

  setCategory: (cat) => set({ activeCategory: cat }),
}));
