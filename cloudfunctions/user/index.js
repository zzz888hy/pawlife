const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const { action, data } = event;

  if (!OPENID) return { code: -1, message: '未登录' };

  try {
    switch (action) {
      case 'getProfile':
        return await getProfile(OPENID);
      case 'updateProfile':
        return await updateProfile(OPENID, data);
      case 'addCoins':
        return await addCoins(OPENID, data.amount);
      case 'setVip':
        return await setVip(OPENID, data.plan);
      default:
        return { code: -1, message: '未知操作' };
    }
  } catch (err) {
    return { code: -1, message: err.message };
  }
};

async function getProfile(openid) {
  const res = await db.collection('users').where({ openid }).get();
  if (res.data.length === 0) return { code: -1, message: '用户不存在' };
  return { code: 0, data: res.data[0] };
}

async function updateProfile(openid, data) {
  await db.collection('users').where({ openid }).update({ data });
  return { code: 0, message: '更新成功' };
}

async function addCoins(openid, amount) {
  await db.collection('users').where({ openid }).update({
    data: { coins: _.inc(amount) },
  });
  return { code: 0, message: '金币已更新' };
}

async function setVip(openid, plan) {
  const expireDate = new Date();
  expireDate.setFullYear(expireDate.getFullYear() + (plan === 'yearly' ? 1 : 0));
  expireDate.setMonth(expireDate.getMonth() + (plan === 'monthly' ? 1 : 0));

  await db.collection('users').where({ openid }).update({
    data: { isVip: true, vipExpireDate: expireDate.toISOString() },
  });
  return { code: 0, message: '会员开通成功' };
}
