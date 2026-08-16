/**
 * 云函数：user
 * 用户信息操作：getProfile / updateProfile / addCoins / setVip
 */
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const { action, data } = event || {};

  const users = db.collection('users');
  const res = await users.where({ openid: OPENID }).get();
  if (res.data.length === 0) {
    return { code: 404, message: '用户不存在，请先登录' };
  }
  const user = res.data[0];

  switch (action) {
    case 'getProfile':
      return { code: 0, data: user };

    case 'updateProfile': {
      const patch = { ...(data || {}), updatedAt: db.serverDate() };
      await users.doc(user._id).update({ data: patch });
      return { code: 0, data: { ...user, ...patch } };
    }

    case 'addCoins': {
      const amount = (data && data.amount) || 0;
      const newCoins = (user.coins || 0) + amount;
      await users.doc(user._id).update({
        data: { coins: newCoins, updatedAt: db.serverDate() },
      });
      return { code: 0, data: { coins: newCoins } };
    }

    case 'setVip': {
      const plan = data && data.plan;
      const days = plan === 'yearly' ? 365 : 30;
      const expireAt = Date.now() + days * 24 * 3600 * 1000;
      const vipExpireDate = new Date(expireAt).toISOString();
      await users.doc(user._id).update({
        data: { isVip: true, vipExpireDate, updatedAt: db.serverDate() },
      });
      return { code: 0, data: { isVip: true, vipExpireDate } };
    }

    default:
      return { code: 400, message: '未知操作' };
  }
};
