/**
 * 动态/评论服务层：列表 / 发布 / 点赞 / 评论
 */
import type { FeedItem, Comment } from '@/types';
import { MOCK_ENABLED } from './mock';
import { mockFeedItems } from './mock/feed.mock';
import { mockComments } from './mock/comment.mock';
import { callCloudFunction } from './cloud';
import { generateId } from '@/utils/format';

interface RawFeed {
  _id: string;
  pet: string;
  petName: string;
  breed: string;
  owner?: string;
  ownerAvatar?: string;
  txt: string;
  tags?: string[];
  images?: string[];
  category: string;
  likes: number;
  cmts: number;
  liked: boolean;
  createdAt?: string;
}

interface RawComment {
  _id: string;
  feedId: string;
  openid?: string;
  userName?: string;
  avatar?: string;
  content?: string;
  createdAt?: string;
}

export interface CreateFeedData {
  petName: string;
  petEmoji: string;
  breed: string;
  text: string;
  tags: string[];
  images: string[];
  category: string;
}

const BG_GRADIENTS = [
  'linear-gradient(135deg,#FFF0EA,#FFE4D6)',
  'linear-gradient(135deg,#FFE4C4,#FFD9B0)',
  'linear-gradient(135deg,#E8F5E9,#C8E6C9)',
  'linear-gradient(135deg,#E3F2FD,#BBDEFB)',
];

function pickBg(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 997;
  return BG_GRADIENTS[h % BG_GRADIENTS.length];
}

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

function toFeed(raw: RawFeed): FeedItem {
  const images = raw.images || [];
  return {
    id: raw._id,
    pet: raw.pet,
    petName: raw.petName,
    breed: raw.breed,
    age: '',
    owner: raw.owner || '@宠物主人',
    ownerId: 'me',
    ownerAvatar: raw.ownerAvatar || raw.pet,
    time: formatRelativeTime(raw.createdAt),
    bg: pickBg(raw._id),
    txt: raw.txt,
    tags: raw.tags || [],
    pics: images.length >= 2 ? 2 : 1,
    picsEmoji: images.length > 0 ? images.slice(0, 2) : [raw.pet],
    images: images.length > 0 ? images : undefined,
    likes: raw.likes,
    cmts: raw.cmts,
    liked: raw.liked,
    collected: false,
    category: raw.category,
  };
}

function toComment(raw: RawComment): Comment {
  return {
    id: raw._id,
    feedId: raw.feedId,
    userId: raw.openid || 'me',
    userName: raw.userName || '宠物主人',
    avatar: raw.avatar || '😎',
    text: raw.content || '',
    time: formatRelativeTime(raw.createdAt),
    likes: 0,
  };
}

export async function fetchFeed(): Promise<FeedItem[]> {
  if (MOCK_ENABLED) return [...mockFeedItems];
  const list = await callCloudFunction<RawFeed[]>('feed', { action: 'list' });
  return (list || []).map(toFeed);
}

export async function createFeed(data: CreateFeedData): Promise<FeedItem> {
  if (MOCK_ENABLED) {
    return {
      id: generateId(),
      pet: data.petEmoji,
      petName: data.petName,
      breed: data.breed,
      age: '3岁',
      owner: '@宠物主人',
      ownerId: 'me',
      ownerAvatar: '😎',
      time: '刚刚',
      bg: 'linear-gradient(135deg,#FFF0EA,#FFE4D6)',
      txt: data.text,
      tags: data.tags,
      pics: data.images.length >= 2 ? 2 : 1,
      picsEmoji: data.images.length > 0 ? data.images.slice(0, 2) : [data.petEmoji],
      images: data.images.length > 0 ? data.images : undefined,
      likes: 0,
      cmts: 0,
      liked: false,
      collected: false,
      category: data.category,
    };
  }

  const raw = await callCloudFunction<RawFeed>('feed', {
    action: 'create',
    data: {
      pet: data.petEmoji,
      petName: data.petName,
      breed: data.breed,
      txt: data.text,
      tags: data.tags,
      images: data.images,
      category: data.category,
    },
  });
  return toFeed(raw);
}

export async function toggleLike(feedId: string): Promise<void> {
  if (MOCK_ENABLED) return;
  await callCloudFunction('feed', { action: 'like', data: { feedId } });
}

export async function fetchComments(feedId: string): Promise<Comment[]> {
  if (MOCK_ENABLED) return mockComments.filter((c) => c.feedId === feedId);
  const list = await callCloudFunction<RawComment[]>('feed', { action: 'listComments', data: { feedId } });
  return (list || []).map(toComment);
}

export async function addComment(
  feedId: string,
  text: string,
  userName: string,
  avatar: string
): Promise<Comment> {
  if (MOCK_ENABLED) {
    return { id: generateId(), feedId, userId: 'me', userName, avatar, text, time: '刚刚', likes: 0 };
  }
  const raw = await callCloudFunction<RawComment>('feed', {
    action: 'comment',
    data: { feedId, content: text, userName, avatar },
  });
  return toComment(raw);
}
