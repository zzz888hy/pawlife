import { create } from 'zustand';
import type { Comment } from '@/types';
import { fetchComments as fetchCommentsApi, addComment as addCommentApi } from '@/services/feed';

interface CommentState {
  comments: Comment[];
  fetchComments: (feedId: string) => Promise<void>;
  getByFeedId: (feedId: string) => Comment[];
  addComment: (feedId: string, text: string, userName: string, avatar: string) => Promise<Comment>;
}

export const useCommentStore = create<CommentState>((set, get) => ({
  comments: [],

  fetchComments: async (feedId) => {
    const list = await fetchCommentsApi(feedId);
    set((s) => ({
      comments: [...s.comments.filter((c) => c.feedId !== feedId), ...list],
    }));
  },

  getByFeedId: (feedId) => get().comments.filter((c) => c.feedId === feedId),

  addComment: async (feedId, text, userName, avatar) => {
    const comment = await addCommentApi(feedId, text, userName, avatar);
    set((s) => ({ comments: [...s.comments, comment] }));
    return comment;
  },
}));
