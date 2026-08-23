/**
 * 云函数：login
 * 微信登录：拿 openid，查找/创建用户，返回用户信息
 */
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

// 用 openid 生成确定性的 4 位数字，作为默认昵称后缀（保证不同用户默认昵称不重复）
function nickSuffix(openid) {
  let h = 0;
  const s = openid || '';
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return 1000 + (h % 9000);
}

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const { nickname, avatarUrl } = event || {};

  const users = db.collection('users');
  const existing = await users.where({ openid: OPENID }).get();

  // 新用户：创建
  if (existing.data.length === 0) {
    const now = db.serverDate();
    const newUser = {
      openid: OPENID,
      nickname: nickname || ('宠物主人' + nickSuffix(OPENID)),
      avatarUrl: avatarUrl || '😎',
      coins: 0,
      isVip: false,
      vipExpireDate: null,
      petCount: 0,
      recordCount: 0,
      createdAt: now,
      updatedAt: now,
    };
    const addRes = await users.add({ data: newUser });
    // createdAt 返回干净的时间字符串（DB 里存 serverDate，响应用 ISO 字符串）
    return { code: 0, data: { _id: addRes._id, ...newUser, createdAt: new Date().toISOString(), isNew: true } };
  }

  // 老用户：可更新昵称/头像；仍是默认昵称时自愈成唯一默认昵称
  const user = existing.data[0];
  const patch = {};
  if (nickname) patch.nickname = nickname;
  if (avatarUrl) patch.avatarUrl = avatarUrl;
  if (!patch.nickname && (!user.nickname || user.nickname === '宠物主人')) {
    patch.nickname = '宠物主人' + nickSuffix(OPENID);
  }
  if (Object.keys(patch).length > 0) {
    await users.doc(user._id).update({ data: { ...patch, updatedAt: db.serverDate() } });
    Object.assign(user, patch);
  }

  return { code: 0, data: { ...user, isNew: false } };
};
