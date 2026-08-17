/**
 * 宠物记录：活动类型 + 发布目标
 */

export interface ActivityType {
  key: string;
  emoji: string;
  label: string;
}

export const ACTIVITY_TYPES: ActivityType[] = [
  { key: 'walk', emoji: '🚶', label: '散步' },
  { key: 'feed', emoji: '🍖', label: '喂食' },
  { key: 'play', emoji: '🎾', label: '玩耍' },
  { key: 'water', emoji: '💦', label: '玩水' },
  { key: 'interact', emoji: '🤗', label: '互动' },
  { key: 'bath', emoji: '🛁', label: '洗澡' },
  { key: 'health', emoji: '💉', label: '体检' },
  { key: 'sleep', emoji: '😴', label: '睡觉' },
];

export type PublishTarget = 'record' | 'feed' | 'draft';

export interface PublishTargetOption {
  key: PublishTarget;
  label: string;
  desc: string;
}

export const PUBLISH_TARGETS: PublishTargetOption[] = [
  { key: 'record', label: '个人记录', desc: '记进成长时间轴' },
  { key: 'feed', label: '动态发布', desc: '分享到广场' },
  { key: 'draft', label: '存草稿', desc: '稍后再发' },
];

export function getActivity(key?: string): ActivityType | undefined {
  return ACTIVITY_TYPES.find((a) => a.key === key);
}

/** 今天的日期字符串 YYYY.MM.DD（用于个人记录的展示日期） */
export function todayStr(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}.${m}.${day}`;
}
