import { create } from 'zustand';
import type { PetFriend, FriendRequest, DirectMessage } from '@/types';
import {
  fetchFriends as fetchFriendsApi,
  fetchRequests as fetchRequestsApi,
  sendRequest as sendRequestApi,
  acceptRequest as acceptRequestApi,
  rejectRequest as rejectRequestApi,
  fetchMessages as fetchMessagesApi,
  sendMessage as sendMessageApi,
} from '@/services/friend';

interface FriendState {
  friends: PetFriend[];
  requests: FriendRequest[];
  chats: Record<string, DirectMessage[]>;
  currentChatId: string | null;
  fetchFriends: () => Promise<void>;
  sendRequest: (friendId: string) => void;
  acceptRequest: (requestId: string) => void;
  rejectRequest: (requestId: string) => void;
  fetchMessages: (friendId: string) => Promise<void>;
  sendMessage: (friendId: string, text: string) => Promise<void>;
  openChat: (friendId: string) => void;
}

export const useFriendStore = create<FriendState>((set) => ({
  friends: [],
  requests: [],
  chats: {},
  currentChatId: null,

  fetchFriends: async () => {
    // 先拉发现列表（内部会种默认好友/申请），再拉申请，避免并发抢种
    const friends = await fetchFriendsApi();
    const requests = await fetchRequestsApi();
    set({ friends, requests });
  },

  openChat: (friendId) => set({ currentChatId: friendId }),

  sendRequest: (friendId) => {
    set((s) => ({
      friends: s.friends.map((f) => (f.id === friendId ? { ...f, isRequested: true } : f)),
    }));
    sendRequestApi(friendId).catch(() => {});
  },

  acceptRequest: (requestId) => {
    set((s) => {
      const req = s.requests.find((r) => r.id === requestId);
      if (!req) return {};
      // 对方可能已在「附近宠友」列表里（isFriend=false），这里要把它翻成 true，而不是判断是否新增
      const inList = s.friends.some((f) => f.id === req.friend.id);
      return {
        requests: s.requests.map((r) => (r.id === requestId ? { ...r, status: 'accepted' as const } : r)),
        friends: inList
          ? s.friends.map((f) => (f.id === req.friend.id ? { ...f, isFriend: true } : f))
          : [...s.friends, { ...req.friend, isFriend: true }],
      };
    });
    acceptRequestApi(requestId).catch(() => {});
  },

  rejectRequest: (requestId) => {
    set((s) => ({
      requests: s.requests.map((r) => (r.id === requestId ? { ...r, status: 'rejected' as const } : r)),
    }));
    rejectRequestApi(requestId).catch(() => {});
  },

  fetchMessages: async (friendId) => {
    const messages = await fetchMessagesApi(friendId);
    set((s) => ({ chats: { ...s.chats, [friendId]: messages } }));
  },

  sendMessage: async (friendId, text) => {
    const { me, reply } = await sendMessageApi(friendId, text);
    set((s) => {
      const list = [...(s.chats[friendId] || []), me];
      if (reply) list.push(reply);
      return { chats: { ...s.chats, [friendId]: list } };
    });
  },
}));
