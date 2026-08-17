/**
 * 云函数：ai
 * 宠物 AI 助手：结合宠物档案 / 成长运动记录 / 日常动态，回答宠物情况
 */
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

function getReply(text, ctx) {
  const name = (ctx && ctx.name) || '宝贝';
  const breed = (ctx && ctx.breed) || '宠物';
  const age = (ctx && ctx.age) ? `${ctx.age}岁` : '';
  const gender = (ctx && ctx.gender) || '';
  const personality = (ctx && ctx.personality) || '';
  const hobbies = (ctx && ctx.hobbies) || '';
  const records = (ctx && ctx.records) || [];
  const feeds = (ctx && ctx.feeds) || [];

  const base = `${name}是${breed}${age ? '，' + age : ''}${gender ? '，' + gender : ''}`;

  if (text.includes('疫苗') || text.includes('体检') || text.includes('健康') || text.includes('打针')) {
    return `💊 ${base}。建议每年定期体检，狂犬疫苗和六联疫苗通常每年接种一次，快到接种时间记得提前预约哦～`;
  }

  if (text.includes('性格') || text.includes('怕') || text.includes('习惯') || text.includes('行为')) {
    const pDesc = personality ? `根据档案，${name}性格「${personality}」。` : '';
    return `🐾 ${pDesc}${hobbies ? `它平时的爱好是「${hobbies}」。` : ''}多记录它的日常，我就能更懂它～`;
  }

  if (text.includes('运动') || text.includes('活动') || text.includes('最近') || text.includes('做了什么') || text.includes('记录')) {
    if (records.length > 0) {
      const list = records.slice(0, 3).map((r) => `· ${r.date} ${r.title}：${r.desc}`).join('\n');
      return `🏃 ${name}最近的成长/运动记录：\n${list}`;
    }
    return `🏃 关于${name}的活动记录我还在积累中～`;
  }

  if (text.includes('动态') || text.includes('日常') || text.includes('发了') || text.includes('表现')) {
    if (feeds.length > 0) {
      const list = feeds.slice(0, 3).map((t) => `· ${t}`).join('\n');
      return `📸 ${name}最近的日常动态：\n${list}`;
    }
    return `📸 关于${name}的动态我还在积累中～`;
  }

  if (text.includes('吃') || text.includes('食') || text.includes('零食')) {
    return `🍖 ${base}。建议按品种和体重选择口粮、控制零食量。`;
  }

  if (text.includes('日记') || text.includes('故事')) {
    const recent = records[0];
    return `📖 【${name}的日记】${name}是${breed}${age ? '，' + age : ''}。${hobbies ? `它最爱${hobbies}。` : ''}${recent ? `最近一次记录是「${recent.title}」——${recent.desc}。` : ''}`;
  }

  if (text.includes('介绍') || text.includes('情况') || text.includes('怎么样') || text.includes('档案')) {
    const lines = [`🐶 ${name} · ${breed}${age ? ' · ' + age : ''}${gender ? ' · ' + gender : ''}`];
    if (personality) lines.push(`性格：${personality}`);
    if (hobbies) lines.push(`爱好：${hobbies}`);
    if (records.length > 0) lines.push(`最近记录：${records[0].title}`);
    return lines.join('\n');
  }

  if (text.includes('你好') || text.includes('hi') || text.includes('在吗') || text.includes('哈喽')) {
    return `你好呀～我是${name}的AI助手，${base}。有什么想聊的都可以问我哦！`;
  }

  return `关于${name}（${breed}${age ? '，' + age : ''}），你可以问我它的性格、最近活动、日常动态、健康、饮食等，我会结合它的档案和记录回答～`;
}

exports.main = async (event) => {
  const { action, data } = event || {};
  switch (action) {
    case 'chat':
      return {
        code: 0,
        data: { reply: getReply((data && data.text) || '', (data && data.context) || null) },
      };
    default:
      return { code: 400, message: '未知操作' };
  }
};
