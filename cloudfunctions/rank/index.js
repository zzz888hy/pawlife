/**
 * 云函数：rank
 * 星光宠榜：从动态 feed 实时聚合「摸摸」热度排名 + 每日快照计算趋势
 */
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const _ = db.command;

// 把 cloud:// 文件ID 批量替换成临时 https 链接
async function toTempUrls(ids) {
  const fileIds = [...new Set((ids || []).filter((id) => typeof id === 'string' && id.startsWith('cloud://')))];
  if (fileIds.length === 0) return {};
  try {
    const res = await cloud.getTempFileURL({ fileList: fileIds });
    const map = {};
    (res.fileList || []).forEach((f) => {
      if (f.status === 0 && f.tempFileURL) map[f.fileID] = f.tempFileURL;
    });
    return map;
  } catch (err) {
    console.error('getTempFileURL error:', err);
    return {};
  }
}

const BG_GRADIENTS = [
  'linear-gradient(135deg,#FFF0EA,#FFE4D6)',
  'linear-gradient(135deg,#FFE4C4,#FFD9B0)',
  'linear-gradient(135deg,#E8F5E9,#C8E6C9)',
  'linear-gradient(135deg,#E3F2FD,#BBDEFB)',
];

function pickBg(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 997;
  return BG_GRADIENTS[h % BG_GRADIENTS.length];
}

// 北京时间（UTC+8）的日期字符串，offsetDays 为相对今天的天数（-1 表示昨天）
function dateStr(offsetDays) {
  const d = new Date(Date.now() + 8 * 3600 * 1000 + (offsetDays || 0) * 86400 * 1000);
  return d.toISOString().slice(0, 10);
}

exports.main = async (event) => {
  const { action } = event || {};
  switch (action) {
    case 'list': {
      // 1. 拉取全部动态，按宠物名聚合当前摸摸数
      const res = await db.collection('feed').limit(1000).get();
      const map = {};
      res.data.forEach((f) => {
        const key = f.petName || '未命名';
        if (!map[key]) {
          map[key] = {
            petName: key,
            pet: f.pet || '🐾',
            breed: f.breed || '',
            owner: f.owner || '@宠物主人',
            likes: 0,
          };
        }
        map[key].likes += (f.likeOpenids || []).length;
      });
      const pets = Object.values(map).sort((a, b) => b.likes - a.likes);

      const today = dateStr(0);
      const snapshots = db.collection('rank_snapshots');

      // 2. 取今天之前的最新快照，按 petName 建立历史基线（同一宠物取最近一次）
      const prevRes = await snapshots.where({ date: _.lt(today) }).orderBy('date', 'desc').limit(1000).get();
      const prevMap = {};
      prevRes.data.forEach((s) => {
        if (!(s.petName in prevMap)) prevMap[s.petName] = s.likes;
      });

      // 3. 今日已有快照（用于 upsert，避免同一天重复插入）
      const todayRes = await snapshots.where({ date: today }).get();
      const todayMap = {};
      todayRes.data.forEach((s) => {
        todayMap[s.petName] = s._id;
      });

      // 4. 计算趋势 + 写入/更新今日快照
      const writes = [];
      const data = pets.map((p, i) => {
        const prev = prevMap[p.petName];
        const trend =
          prev === undefined ? 'same' : p.likes > prev ? 'up' : p.likes < prev ? 'down' : 'same';

        if (todayMap[p.petName]) {
          writes.push(snapshots.doc(todayMap[p.petName]).update({ data: { likes: p.likes } }));
        } else {
          writes.push(snapshots.add({ data: { petName: p.petName, likes: p.likes, date: today } }));
        }

        return {
          _id: 'rank_' + i,
          rank: i + 1,
          pet: p.pet,
          petName: p.petName,
          breed: p.breed,
          owner: p.owner,
          likes: p.likes,
          trend,
          bg: pickBg(p.petName),
        };
      });
      await Promise.all(writes);

      // pet 头像（可能是 cloud://）转临时链接，其他用户才能看到
      const urlMap = await toTempUrls(data.map((d) => d.pet));
      data.forEach((d) => {
        if (urlMap[d.pet]) d.pet = urlMap[d.pet];
      });

      return { code: 0, data };
    }
    default:
      return { code: 400, message: '未知操作' };
  }
};
