/**
 * 云函数：message
 * 消息通知：列表 / 标记已读（首次进入自动种下演示通知）
 */
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

// 演示通知：首次打开消息中心时写入，让通知列表/铃铛角标有内容
const DEMO_MESSAGES = [
  { type: 'like', avatar: '🦌', title: '小鹿 赞了你的动态', content: '「和豆豆的周末」', url: '/pages/hall/index', tab: true, minutesAgo: 5 },
  { type: 'comment', avatar: '🍊', title: '阿橙 评论了你', content: '豆豆也太可爱了吧！', url: '/pages/hall/index', tab: true, minutesAgo: 20 },
  { type: 'friend-request', avatar: '🍓', title: '草莓 请求加你为好友', content: '你好呀，我家毛球想和你家宝做朋友～', url: '/pages/friends/index', tab: true, minutesAgo: 35 },
  { type: 'system', avatar: '🐾', title: 'PawLife 系统通知', content: '恭喜你完成今日全部任务，获得 20 金币', minutesAgo: 120, read: true },
  { type: 'like', avatar: '🌙', title: '晚风 赞了你的动态', content: '「兔兔的下午茶」', url: '/pages/hall/index', tab: true, minutesAgo: 180, read: true },
  { type: 'system', avatar: '🐾', title: 'PawLife 系统通知', content: '你的宠物身份认证已通过审核', minutesAgo: 1440, read: true },
];

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const { action, data } = event || {};
  const messages = db.collection('messages');

  switch (action) {
    case 'list': {
      // 首次进入：若该用户还没有任何通知，写入演示通知
      const count = (await messages.where({ openid: OPENID }).count()).total;
      if (count === 0) {
        const now = Date.now();
        for (const m of DEMO_MESSAGES) {
          await messages.add({
            data: {
              openid: OPENID,
              type: m.type,
              avatar: m.avatar,
              title: m.title,
              content: m.content,
              read: !!m.read,
              url: m.url || '',
              tab: !!m.tab,
              createdAt: new Date(now - (m.minutesAgo || 0) * 60000),
            },
          });
        }
      }

      const res = await messages.where({ openid: OPENID }).orderBy('createdAt', 'desc').limit(100).get();
      return { code: 0, data: res.data };
    }

    case 'markRead': {
      await messages.doc(data.id).update({ data: { read: true } });
      return { code: 0, data: { ok: true } };
    }

    case 'markAllRead': {
      await messages.where({ openid: OPENID }).update({ data: { read: true } });
      return { code: 0, data: { ok: true } };
    }

    default:
      return { code: 400, message: '未知操作' };
  }
};
