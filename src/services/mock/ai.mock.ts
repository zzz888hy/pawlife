import type { QuickReply, PetAiContext } from '@/types';

interface AiInitMsg {
  role: 'bot' | 'me';
  text: string;
}

export function buildAiInitMessages(petName: string): AiInitMsg[] {
  return [
    {
      role: 'bot',
      text: `你好呀，我是${petName}的AI助手～ 🤖 我已经学习了${petName}的宠物档案、成长/运动记录和日常动态，随时可以回答关于它的情况。`,
    },
    {
      role: 'bot',
      text: `你可以问我："${petName}最近做了什么？"、"${petName}的性格怎么样？"、"介绍一下${petName}"、"${petName}该注意什么健康问题？"`,
    },
  ];
}

export function buildQuickReplies(petName: string): QuickReply[] {
  return [
    { text: `${petName}最近做了什么？` },
    { text: `${petName}的性格怎么样？` },
    { text: `介绍一下${petName}` },
    { text: `${petName}该注意什么健康问题？` },
  ];
}

export function getMockAiReply(query: string, context?: PetAiContext): string {
  const name = context?.name || '宝贝';
  const breed = context?.breed || '宠物';
  const age = context?.age ? `${context.age}岁` : '';
  const gender = context?.gender || '';
  const personality = context?.personality || '';
  const hobbies = context?.hobbies || '';
  const records = context?.records || [];
  const feeds = context?.feeds || [];

  const base = `${name}是${breed}${age ? '，' + age : ''}${gender ? '，' + gender : ''}`;

  // 健康 / 疫苗
  if (query.includes('疫苗') || query.includes('体检') || query.includes('健康') || query.includes('打针')) {
    return `💊 ${base}。建议每年定期体检，狂犬疫苗和六联疫苗通常每年接种一次，快到接种时间记得提前预约哦～（具体可在「健康档案」查看）`;
  }

  // 性格 / 习惯
  if (query.includes('性格') || query.includes('怕') || query.includes('习惯') || query.includes('行为')) {
    const pDesc = personality ? `根据档案，${name}性格「${personality}」。` : '';
    return `🐾 ${pDesc}${hobbies ? `它平时的爱好是「${hobbies}」。` : ''}多陪它互动、记录它的日常，我就能帮你更了解它～`;
  }

  // 运动 / 活动 / 最近记录
  if (query.includes('运动') || query.includes('活动') || query.includes('最近') || query.includes('做了什么') || query.includes('记录')) {
    if (records.length > 0) {
      const list = records.slice(0, 3).map((r) => `· ${r.date} ${r.title}：${r.desc}`).join('\n');
      return `🏃 我翻了翻${name}的成长/运动记录，最近这些时刻值得回忆：\n${list}`;
    }
    return `🏃 关于${name}的活动记录我还在积累中～多带它出去运动、记录日常，我会慢慢更了解它。`;
  }

  // 日常动态表现
  if (query.includes('动态') || query.includes('日常') || query.includes('发了') || query.includes('表现')) {
    if (feeds.length > 0) {
      const list = feeds.slice(0, 3).map((t) => `· ${t}`).join('\n');
      return `📸 ${name}最近的日常动态有：\n${list}`;
    }
    return `📸 关于${name}的动态我还在积累中～在广场发布它的日常，我就能帮你总结它的表现啦。`;
  }

  // 饮食
  if (query.includes('吃') || query.includes('食') || query.includes('零食')) {
    const greedy = personality.includes('贪吃') ? '它档案里写着「贪吃」，要控制零食量哦～' : '';
    return `🍖 ${base}。建议按品种和体重选择口粮、控制零食量。${greedy}`;
  }

  // 日记 / 故事
  if (query.includes('日记') || query.includes('故事')) {
    const recent = records[0];
    return `📖 【${name}的日记】\n${name}是${breed}${age ? '，' + age : ''}。${hobbies ? `它最爱${hobbies}。` : ''}${recent ? `最近一次记录是「${recent.title}」——${recent.desc}。` : ''}这就是${name}美好的一天呀 🐾`;
  }

  // 介绍 / 情况
  if (query.includes('介绍') || query.includes('情况') || query.includes('怎么样') || query.includes('档案')) {
    const lines = [`🐶 ${name} · ${breed}${age ? ' · ' + age : ''}${gender ? ' · ' + gender : ''}`];
    if (personality) lines.push(`性格：${personality}`);
    if (hobbies) lines.push(`爱好：${hobbies}`);
    if (records.length > 0) lines.push(`最近记录：${records[0].title}（${records[0].date}）`);
    return lines.join('\n');
  }

  // 打招呼
  if (query.includes('你好') || query.includes('hi') || query.includes('在吗') || query.includes('哈喽')) {
    return `你好呀～我是${name}的AI助手，${base}。有什么想了解的都可以问我哦！`;
  }

  return `关于${name}（${breed}${age ? '，' + age : ''}），${personality ? `它性格「${personality}」，` : ''}${hobbies ? `爱好「${hobbies}」。` : ''}你可以问我它的性格、最近活动、日常动态、健康、饮食等，我会结合它的档案和记录回答～`;
}
