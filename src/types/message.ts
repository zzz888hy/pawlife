export type MessageType = 'like' | 'comment' | 'friend-request' | 'chat' | 'system';

export interface MessageItem {
  id: string;
  type: MessageType;
  avatar: string;
  title: string;
  content: string;
  time: string;
  read: boolean;
  url?: string;
  tab?: boolean;
}
