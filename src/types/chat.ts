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

export interface PetActivityRecord {
  title: string;
  desc: string;
  date: string;
}

// AI 助手回答宠物问题时所依赖的上下文
export interface PetAiContext {
  name: string;
  type: string;
  breed: string;
  age: string;
  gender: string;
  personality: string;
  hobbies: string;
  records: PetActivityRecord[];  // 成长/运动记录
  feeds: string[];               // 日常动态文本
}

export type StoryStyle = '温情回忆' | '童话冒险' | '日记体' | '搞笑日常' | '第一人称';

export interface StoryResult {
  title: string;
  paragraphs: string[];
}
