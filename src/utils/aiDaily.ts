import type { Pet, TimelineEntry } from '@/types';

export interface DailyAiLine {
  icon: string;
  title: string;
  text: string;
}

// 一年中的第几天（1-366），用于按天稳定轮换文案
function dayOfYear(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d.getTime() - start.getTime()) / 86400000);
}

// 把「贪吃、爱撒娇、怕下雨」这类字符串拆成列表
function splitList(s?: string): string[] {
  return (s || '')
    .split(/[、,，/；;\s]+/)
    .map((x) => x.trim())
    .filter(Boolean);
}

/**
 * 生成「AI 每日一句」：结合宠物档案与最近的成长/运动记录，
 * 按天确定性挑选一条个性化寄语（用于宠物馆顶部卡片，后续可升级为真实推送）。
 */
export function getDailyAiLine(pet: Pet, records: TimelineEntry[]): DailyAiLine {
  const name = pet.name;
  const age = pet.age;
  const hobbies = splitList(pet.hobbies);
  const hobby = hobbies[0] || '玩';
  const recent = records[0];

  const templates: DailyAiLine[] = [
    {
      icon: '🤖',
      title: '今日 AI 寄语',
      text: `${name}今天看起来很有精神～记得带它去${hobby}，这是它最喜欢的事 🐾`,
    },
    {
      icon: '💛',
      title: '陪伴提醒',
      text: `陪伴是最长情的告白——${name}今天也想你了，回家多抱抱它吧`,
    },
    {
      icon: '💪',
      title: '健康小贴士',
      text: `${name}已经${age}岁了，${pet.breed}在这个阶段要定期体检、保持适量运动哦`,
    },
    {
      icon: '🥰',
      title: '今日 AI 寄语',
      text: `${name}性格「${pet.personality || '温顺'}」，今天也多夸夸它，它会特别有安全感`,
    },
    {
      icon: '✨',
      title: '成长档案',
      text: `${name}的成长档案又更新了一点，去时间轴看看它一路走来的样子吧`,
    },
  ];

  if (recent) {
    templates.push({
      icon: '🕰️',
      title: '回忆时刻',
      text: `还记得吗？${recent.date}那天「${recent.title}」。这些回忆，我都会替你们好好记着 🐾`,
    });
  }

  const idx = dayOfYear(new Date()) % templates.length;
  return templates[idx];
}
