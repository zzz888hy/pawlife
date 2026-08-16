/**
 * 云函数：ai
 * 宠物 AI 助手：关键词问答（演示版）
 */
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

function getReply(text) {
  if (text.includes('疫苗') || text.includes('体检') || text.includes('健康') || text.includes('打针')) {
    return '💊 建议定期体检，并留意宠物的疫苗记录。狂犬疫苗和六联疫苗通常每年接种一次，快到期时记得提前预约哦～';
  }
  if (text.includes('日记') || text.includes('故事')) {
    return '📖 我可以根据宠物的成长记录生成专属故事！你可以去「宠物故事」板块，选择喜欢的风格，我会把点滴回忆写成温暖的故事～';
  }
  if (text.includes('吃') || text.includes('食') || text.includes('零食')) {
    return '🍖 建议根据宠物的品种和体重选择口粮，注意控制零食量，避免贪吃变胖。坚持记录每天喂食量，能帮你更好地掌握它的饮食～';
  }
  if (text.includes('怕') || text.includes('害怕') || text.includes('习惯') || text.includes('行为')) {
    return '🐾 每只宠物都有自己的小习惯和小害怕。多记录它的日常，我就能更好地帮你分析它的行为啦～';
  }
  if (text.includes('你好') || text.includes('hi') || text.includes('在吗') || text.includes('哈喽')) {
    return '你好呀～我是你的宠物AI助手，有什么想聊的都可以问我哦！';
  }
  return '关于你的宠物，我还在持续学习中～试着问我关于喂食、疫苗、健康、故事等话题，我会尽力帮你！🐾';
}

exports.main = async (event) => {
  const { action, data } = event || {};
  switch (action) {
    case 'chat':
      return { code: 0, data: { reply: getReply((data && data.text) || '') } };
    default:
      return { code: 400, message: '未知操作' };
  }
};
