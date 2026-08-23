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
  searchFriends as searchFriendsApi,
  updateLocation as updateLocationApi,
} from '@/services/friend';

interface FriendState {
  friends: PetFriend[];
  requests: FriendRequest[];
  chats: Record<string, DirectMessage[]>;
  currentChatId: string | null;
  searchResults: PetFriend[];
  searchKeyword: string;
  searching: boolean;
  fetchFriends: (location?: { lat: number; lng: number }) => Promise<void>;
  updateLocation: (location: { lat: number; lng: number }) => void;
  sendRequest: (friendId: string) => Promise<void>;
  acceptRequest: (requestId: string) => Promise<void>;
  rejectRequest: (requestId: string) => Promise<void>;
  fetchMessages: (friendId: string) => Promise<void>;
  sendMessage: (friendId: string, text: string) => Promise<void>;
  openChat: (friendId: string) => void;
  searchFriends: (keyword: string) => Promise<void>;
  clearSearch: () => void;
}

export const useFriendStore = create<FriendState>((set) => ({
  friends: [],
  requests: [],
  chats: {},
  currentChatId: null,
  searchResults: [],
  searchKeyword: '',
  searching: false,

  fetchFriends: async (location) => {
    // 先拉发现列表（内部会种默认好友/申请），再拉申请，避免并发抢种
    const friends = await fetchFriendsApi(location);
    const requests = await fetchRequestsApi();
    set({ friends, requests });
  },

  updateLocation: (location) => {
    updateLocationApi(location).catch(() => {});
  },

  openChat: (friendId) => set({ currentChatId: friendId }),

  sendRequest: async (friendId) => {
    set((s) => ({
      friends: s.friends.map((f) => (f.id === friendId ? { ...f, isRequested: true } : f)),
      searchResults: s.searchResults.map((f) => (f.id === friendId ? { ...f, isRequested: true } : f)),
    }));
    try {
      await sendRequestApi(friendId);
    } catch (e) {
      // 失败回滚，避免误显示「已申请」
      set((s) => ({
        friends: s.friends.map((f) => (f.id === friendId ? { ...f, isRequested: false } : f)),
        searchResults: s.searchResults.map((f) => (f.id === friendId ? { ...f, isRequested: false } : f)),
      }));
      throw e;
    }
  },

  searchFriends: async (keyword) => {
    const kw = keyword.trim();
    if (!kw) {
      set({ searchResults: [], searchKeyword: '', searching: false });
      return;
    }
    set({ searchKeyword: kw, searching: true });
    try {
      const results = await searchFriendsApi(kw);
      set({ searchResults: results, searching: false });
    } catch {
      set({ searchResults: [], searching: false });
    }
  },

  clearSearch: () => set({ searchResults: [], searchKeyword: '', searching: false }),

  acceptRequest: async (requestId) => {
    let wasNew = false;
    let friendId = '';
    set((s) => {
      const req = s.requests.find((r) => r.id === requestId);
      if (!req) return {};
      friendId = req.friend.id;
      // 对方可能已在「附近宠友」列表里（isFriend=false），这里要把它翻成 true，而不是判断是否新增
      const inList = s.friends.some((f) => f.id === friendId);
      wasNew = !inList;
      return {
        requests: s.requests.map((r) => (r.id === requestId ? { ...r, status: 'accepted' as const } : r)),
        friends: inList
          ? s.friends.map((f) => (f.id === friendId ? { ...f, isFriend: true } : f))
          : [...s.friends, { ...req.friend, isFriend: true }],
      };
    });
    try {
      await acceptRequestApi(requestId);
    } catch (e) {
      // 失败回滚：申请恢复待处理，好友恢复原状
      set((s) => ({
        requests: s.requests.map((r) => (r.id === requestId ? { ...r, status: 'pending' as const } : r)),
        friends: wasNew
          ? s.friends.filter((f) => f.id !== friendId)
          : s.friends.map((f) => (f.id === friendId ? { ...f, isFriend: false } : f)),
      }));
      throw e;
    }
  },

  rejectRequest: async (requestId) => {
    set((s) => ({
      requests: s.requests.map((r) => (r.id === requestId ? { ...r, status: 'rejected' as const } : r)),
    }));
    try {
      await rejectRequestApi(requestId);
    } catch (e) {
      set((s) => ({
        requests: s.requests.map((r) => (r.id === requestId ? { ...r, status: 'pending' as const } : r)),
      }));
      throw e;
    }
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
