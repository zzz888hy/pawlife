/**
 * 消息通知服务层
 */
import type { MessageItem } from '@/types';
import { MOCK_ENABLED } from './mock';
import { mockMessages } from './mock/message.mock';
import { callCloudFunction } from './cloud';

interface RawMessage {
  _id: string;
  type: MessageItem['type'];
  avatar: string;
  title: string;
  content: string;
  read: boolean;
  url?: string;
  tab?: boolean;
  createdAt?: string;
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

function toMessage(raw: RawMessage): MessageItem {
  return {
    id: raw._id,
    type: raw.type,
    avatar: raw.avatar,
    title: raw.title,
    content: raw.content,
    time: formatRelativeTime(raw.createdAt),
    read: !!raw.read,
    url: raw.url,
    tab: raw.tab,
  };
}

export async function fetchMessages(): Promise<MessageItem[]> {
  if (MOCK_ENABLED) return [...mockMessages];
  const list = await callCloudFunction<RawMessage[]>('message', { action: 'list', data: {} });
  return (list || []).map(toMessage);
}

export async function markRead(id: string): Promise<void> {
  if (MOCK_ENABLED) return;
  await callCloudFunction('message', { action: 'markRead', data: { id } });
}

export async function markAllRead(): Promise<void> {
  if (MOCK_ENABLED) return;
  await callCloudFunction('message', { action: 'markAllRead', data: {} });
}
