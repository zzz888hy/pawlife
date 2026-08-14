import type { QuickReply } from '@/types';

interface AiInitMsg {
  role: 'bot' | 'me';
  text: string;
}

export const mockAiInitMessages: AiInitMsg[] = [
  {
    role: 'bot',
    text: '你好呀，我是豆豆的AI助手～ 🐶 我已经学习了豆豆826天的成长记录，知道它爱吃球、怕下雨、3岁了。有什么想聊的吗？',
  },
  {
    role: 'bot',
    text: '你可以问我："豆豆第一次吃什么？"、"豆豆最怕什么？"、"帮我写一篇豆豆的日记"',
  },
];

export const mockQuickReplies: QuickReply[] = [
  { text: '豆豆第一次吃什么？' },
  { text: '豆豆最怕什么？' },
  { text: '写一篇豆豆的日记' },
  { text: '豆豆今天该打疫苗吗？' },
];

const aiReplies: Record<string, string> = {
  '豆豆第一次吃什么？':
    '根据记录，豆豆第一次吃的是皇家幼犬粮，2021年5月8日，也就是它到家第2天。当时它还不太会用食盆，把粮食撒了一地🤣 后来慢慢学会了。它的食量从最初的30g/餐增长到现在180g/餐。',
  '豆豆最怕什么？':
    '根据成长记录分析，豆豆最怕的是：1️⃣ 下雨天（每次打雷都会钻到沙发底下）2️⃣ 吸尘器的声音 3️⃣ 兽医的白大褂。不过它最喜欢的是球、散步和你的怀抱 💛',
  '写一篇豆豆的日记':
    '【豆豆的日记 · 2024年7月19日】\n今天又是元气满满的一天！早上7点准时叫醒了铲屎官（他才不想起床呢哼）。散步时遇到了一只小柯基，我们互相闻了闻鼻子，是好朋友啦。下午啃了心爱的洁齿骨，吃了180g狗粮。晚上主人给我刷毛的时候，我幸福得差点睡着。这就是一只金毛完美的一天呀 🐾',
  '豆豆今天该打疫苗吗？':
    '💊 查看了豆豆的健康档案：狂犬疫苗和六联疫苗都已在2024.5.06完成，下次接种时间为2025.05.06。但【犬副流感】疫苗尚未接种，建议本月内安排。需要我帮你预约附近的宠物医院吗？',
};

export function getMockAiReply(query: string): string {
  // Exact match
  if (aiReplies[query]) {
    return aiReplies[query];
  }

  // Fuzzy match
  if (query.includes('疫苗') || query.includes('体检') || query.includes('健康')) {
    return '💊 我已查看豆豆的健康档案。建议定期体检，目前犬副流感疫苗待接种。详细情况可以打开健康档案查看哦～';
  }
  if (query.includes('故事') || query.includes('日记')) {
    return '📖 我可以根据豆豆的成长记录生成专属故事！要不要现在就去"宠物故事"板块试试？多种风格任选～';
  }
  if (query.includes('吃') || query.includes('食')) {
    return '根据记录，豆豆现在每天吃180g皇家成犬粮，分2餐。它最爱的是洁齿骨零食，但要注意控制量哦～避免贪吃变胖 🐶';
  }

  return '关于豆豆，我还在持续学习中～试试问我它第一次吃什么、最怕什么，或者让我写一篇它的日记？我是基于豆豆826天成长记录训练的专属AI 🐾';
}
