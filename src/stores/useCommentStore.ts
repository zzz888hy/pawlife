import { create } from 'zustand';
import type { Comment } from '@/types';
import { mockComments } from '@/services/mock/comment.mock';
import { generateId } from '@/utils/format';

interface CommentState {
  comments: Comment[];
  getByFeedId: (feedId: string) => Comment[];
  addComment: (feedId: string, text: string, userName: string, avatar: string) => Comment;
}

export const useCommentStore = create<CommentState>((set, get) => ({
  comments: mockComments,

  getByFeedId: (feedId) => get().comments.filter((c) => c.feedId === feedId),

  addComment: (feedId, text, userName, avatar) => {
    const comment: Comment = {
      id: generateId(),
      feedId,
      userId: 'me',
      userName,
      avatar,
      text,
      time: '刚刚',
      likes: 0,
    };
    set((s) => ({ comments: [...s.comments, comment] }));
    return comment;
  },
}));
