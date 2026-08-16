/**
 * 好友服务层：发现 / 发申请 / 收到申请 / 私聊
 */
import type { PetFriend, FriendRequest, DirectMessage } from '@/types';
import { MOCK_ENABLED } from './mock';
import { mockPetFriends, mockFriendRequests, mockChatHistory, getMockFriendReply } from './mock/friend.mock';
import { callCloudFunction } from './cloud';
import { generateId } from '@/utils/format';

function formatRelativeTime(iso?: string): string {
  if (!iso) return '刚刚';
  const diff = Date.now() - new Date(iso).getTime();
  if (isNaN(diff)) return '刚刚';
  const min = Math.floor(diff / 60000);
  if (min < 1) return '刚刚';
  if (min < 60) return `${min}分钟前`;
  const hour = Math.floor(min / 60);
  if (hour < 24) return `${hour}小时前`;
  return `${Math.floor(hour / 24)}天前`;
}

function toFriend(raw: any): PetFriend {
  return {
    id: raw._id,
    nickname: raw.nickname,
    avatar: raw.avatar,
    petName: raw.petName,
    petEmoji: raw.petEmoji,
    breed: raw.breed,
    distance: raw.distance,
    signature: raw.signature,
    online: !!raw.online,
    isFriend: !!raw.isFriend,
    isRequested: !!raw.isRequested,
    tags: raw.tags || [],
  };
}

function toFriendRequest(raw: any): FriendRequest {
  const friend: PetFriend = {
    id: raw.friendId,
    nickname: raw.nickname,
    avatar: raw.avatar,
    petName: raw.petName,
    petEmoji: raw.petEmoji,
    breed: raw.breed,
    distance: raw.distance || '',
    signature: raw.signature || '',
    online: !!raw.online,
    isFriend: false,
    tags: raw.tags || [],
  };
  return {
    id: raw._id,
    friend,
    message: raw.message || '',
    time: formatRelativeTime(raw.createdAt),
    status: raw.status,
  };
}

function toDirectMessage(raw: any): DirectMessage {
  return {
    id: raw._id,
    role: raw.role,
    text: raw.text,
    timestamp: new Date(raw.createdAt).getTime(),
  };
}

export async function fetchFriends(): Promise<PetFriend[]> {
  if (MOCK_ENABLED) return [...mockPetFriends];
  const list = await callCloudFunction<any[]>('friend', { action: 'discover', data: {} });
  return (list || []).map(toFriend);
}

export async function fetchRequests(): Promise<FriendRequest[]> {
  if (MOCK_ENABLED) return [...mockFriendRequests];
  const list = await callCloudFunction<any[]>('friend', { action: 'listRequests', data: {} });
  return (list || []).map(toFriendRequest);
}

export async function sendRequest(friendId: string): Promise<void> {
  if (MOCK_ENABLED) return;
  await callCloudFunction('friend', { action: 'sendRequest', data: { friendId } });
}

export async function acceptRequest(requestId: string): Promise<void> {
  if (MOCK_ENABLED) return;
  await callCloudFunction('friend', { action: 'acceptRequest', data: { requestId } });
}

export async function rejectRequest(requestId: string): Promise<void> {
  if (MOCK_ENABLED) return;
  await callCloudFunction('friend', { action: 'rejectRequest', data: { requestId } });
}

export async function fetchMessages(friendId: string): Promise<DirectMessage[]> {
  if (MOCK_ENABLED) return mockChatHistory[friendId] || [];
  const list = await callCloudFunction<any[]>('friend', { action: 'listMessages', data: { friendId } });
  return (list || []).map(toDirectMessage);
}

export async function sendMessage(
  friendId: string,
  text: string
): Promise<{ me: DirectMessage; reply?: DirectMessage }> {
  if (MOCK_ENABLED) {
    await new Promise((r) => setTimeout(r, 600));
    return {
      me: { id: generateId(), role: 'me', text, timestamp: Date.now() },
      reply: { id: generateId(), role: 'friend', text: getMockFriendReply(text), timestamp: Date.now() },
    };
  }
  const raw = await callCloudFunction<any>('friend', { action: 'sendMessage', data: { friendId, text } });
  // 稍作延迟，让「对方正在输入」有呼吸感
  await new Promise((r) => setTimeout(r, 500));
  return {
    me: toDirectMessage(raw.me),
    reply: raw.reply ? toDirectMessage(raw.reply) : undefined,
  };
}
