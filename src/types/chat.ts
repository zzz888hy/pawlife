export type MessageRole = 'bot' | 'me';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  avatar: string;
  text: string;
  timestamp: number;
}

export interface QuickReply {
  text: string;
}

export type StoryStyle = '温情回忆' | '童话冒险' | '日记体' | '搞笑日常' | '第一人称';

export interface StoryResult {
  title: string;
  paragraphs: string[];
}
