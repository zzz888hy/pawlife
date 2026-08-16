/**
 * 云函数：login
 * 微信登录：拿 openid，查找/创建用户，返回用户信息
 */
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

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
      nickname: nickname || '宠物主人',
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

  // 老用户：可更新昵称/头像
  const user = existing.data[0];
  if (nickname || avatarUrl) {
    const patch = {};
    if (nickname) patch.nickname = nickname;
    if (avatarUrl) patch.avatarUrl = avatarUrl;
    patch.updatedAt = db.serverDate();
    await users.doc(user._id).update({ data: patch });
    user.nickname = nickname || user.nickname;
    user.avatarUrl = avatarUrl || user.avatarUrl;
  }

  return { code: 0, data: { ...user, isNew: false } };
};
