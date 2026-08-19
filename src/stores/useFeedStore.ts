import { create } from 'zustand';
import type { FeedItem } from '@/types';
import {
  fetchFeed as fetchFeedApi,
  createFeed as createFeedApi,
  toggleLike as toggleLikeApi,
  updateFeed as updateFeedApi,
  removeFeed as removeFeedApi,
  type CreateFeedData,
  type UpdateFeedInput,
} from '@/services/feed';

const SORT_TABS = ['推荐', '摸摸最多'];

// 从动态里统计热门关键词（去掉 # 前缀），作为分类 tab
export function deriveCategories(items: FeedItem[]): string[] {
  const counts: Record<string, number> = {};
  items.forEach((f) =>
    (f.tags || []).forEach((t) => {
      const key = t.replace(/^#/, '');
      counts[key] = (counts[key] || 0) + 1;
    })
  );
  const top = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([k]) => k);
  return [...SORT_TABS, ...top];
}

// 根据当前分类排序 / 筛选动态
export function applyCategory(items: FeedItem[], cat: string): FeedItem[] {
  if (cat === '推荐') return items;
  if (cat === '摸摸最多') return [...items].sort((a, b) => b.likes - a.likes);
  return items.filter((f) => (f.tags || []).some((t) => t.replace(/^#/, '') === cat));
}

interface FeedState {
  feedItems: FeedItem[];
  activeCategory: string;
  loading: boolean;
  fetchFeed: () => Promise<void>;
  addFeed: (data: CreateFeedData) => Promise<void>;
  toggleLike: (feedId: string) => void;
  toggleCollect: (feedId: string) => void;
  incrementCmts: (feedId: string) => void;
  updateFeed: (feedId: string, patch: UpdateFeedInput) => Promise<void>;
  removeFeed: (feedId: string) => Promise<void>;
  setCategory: (cat: string) => void;
}

export const useFeedStore = create<FeedState>((set) => ({
  feedItems: [],
  activeCategory: '推荐',
  loading: false,

  fetchFeed: async () => {
    set({ loading: true });
    try {
      const items = await fetchFeedApi();
      set({ feedItems: items, loading: false });
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

  updateFeed: async (feedId, patch) => {
    await updateFeedApi(feedId, patch);
    set((s) => ({
      feedItems: s.feedItems.map((f) =>
        f.id === feedId ? { ...f, ...patch } : f
      ),
    }));
  },

  removeFeed: async (feedId) => {
    await removeFeedApi(feedId);
    set((s) => ({ feedItems: s.feedItems.filter((f) => f.id !== feedId) }));
  },

  setCategory: (cat) => set({ activeCategory: cat }),
}));
