/**
 * 云函数：user
 * 用户信息操作：getProfile / updateProfile / addCoins / setVip
 */
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

// 部署版本号：每次改动这个文件后要把它 +1，并在微信开发者工具里重新上传部署。
// 前端「关于 → 检查更新」会回读这个值，用来确认云端跑的是不是最新代码。
const BUILD = '2026-09-22.1';

const db = cloud.database();

// 用 openid 生成确定性的 4 位数字，作为昵称冲突时的后缀
function nickSuffix(openid) {
  let h = 0;
  const s = openid || '';
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return 1000 + (h % 9000);
}

const handler = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const { action, data } = event || {};

  const users = db.collection('users');

  // 版本探测：不碰数据库，前端「检查更新」用它读 build
  if (action === '__ping') {
    return { code: 0, data: { ok: true } };
  }

  // 维护操作：不依赖当前用户，直接执行（云端测试时 OPENID 为空也能跑）
  if (action === 'fixNicknames') {
    return await fixDuplicateNicknames(users);
  }

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
      // 保证昵称唯一：改昵称时若已被他人占用，追加数字后缀
      if (patch.nickname && patch.nickname !== user.nickname) {
        const same = await users.where({ nickname: patch.nickname }).get();
        if (same.data.some((u) => u._id !== user._id)) {
          patch.nickname = patch.nickname + nickSuffix(OPENID);
        }
      }
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

// 统一在返回体里带上 BUILD，供前端探测云端部署版本
exports.main = async (event) => {
  const res = await handler(event);
  return { ...res, build: BUILD };
};

// 一次性修复：把所有重复昵称改成唯一（裸「宠物主人」全部加序号；自定义重复名保留第一个、其余加序号）
async function fixDuplicateNicknames(users) {
  const all = [];
  const MAX = 100;
  let skip = 0;
  while (true) {
    const page = await users.skip(skip).limit(MAX).get();
    all.push(...page.data);
    if (page.data.length < MAX) break;
    skip += MAX;
  }
  const groups = new Map();
  all.forEach((u) => {
    const n = (u.nickname || '宠物主人').trim() || '宠物主人';
    if (!groups.has(n)) groups.set(n, []);
    groups.get(n).push(u);
  });
  let fixed = 0;
  for (const [name, list] of groups) {
    for (let i = 0; i < list.length; i++) {
      const u = list[i];
      const needsFix = name === '宠物主人' || i > 0;
      if (!needsFix) continue;
      const suffix = nickSuffix(u.openid || u._id);
      const newName = name === '宠物主人' ? '宠物主人' + suffix : name + suffix;
      await users.doc(u._id).update({ data: { nickname: newName } });
      fixed++;
    }
  }
  return { code: 0, data: { fixed } };
}
