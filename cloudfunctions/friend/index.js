/**
 * 云函数：friend
 * 好友：附近宠友 / 发申请 / 收到申请 / 私聊（自动回复）
 */
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

const friendsCol = () => db.collection('friends');
const friendshipsCol = () => db.collection('friendships');
const requestsCol = () => db.collection('friendRequests');
const messagesCol = () => db.collection('directMessages');
const usersCol = () => db.collection('users');

// 私聊自动回复：关键词匹配
function autoReply(text) {
  if (/遛|散步|出门|公园/.test(text)) return '好呀，周末一起去公园遛狗呀～';
  if (/吃|零食|狗粮|猫粮|化毛/.test(text)) return '我家宝最近在吃这个，效果不错，安利给你！';
  if (/生病|医院|打针|疫苗/.test(text)) return '别担心，带它去正规医院看看，很快会好的。';
  if (/照片|可爱|好看|萌/.test(text)) return '嘿嘿，你家宝也超可爱呀！';
  if (/你好|hi|在吗|哈喽/.test(text)) return '在的在的，怎么啦～';
  if (/睡|发呆|懒/.test(text)) return '哈哈哈我家这位也是整天睡觉';
  return '哈哈哈对呀，养宠物的快乐就是这样～';
}

// 正则特殊字符转义，避免用户输入破坏查询
function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// 把 users 集合里的真实用户映射成宠友卡片所需的字段
function userToFriend(u, id) {
  return {
    _id: id || u._id,
    nickname: u.nickname || '宠友',
    avatar: u.avatarUrl || '🐾',
    petName: u.petName || '',
    petEmoji: u.petEmoji || '🐾',
    breed: u.breed || '',
    distance: u.distance || '',
    signature: u.signature || '',
    online: false,
    tags: u.tags || [],
  };
}

// 根据 id 在「种子宠友 friends」或「真实用户 users」里解析目标
async function resolveTarget(id) {
  try {
    const fr = await friendsCol().doc(id).get();
    if (fr.data) return { ...fr.data, _id: id, openid: fr.data.openid || '' };
  } catch (e) { /* 非 friends 集合的 id，继续往下找 */ }
  try {
    const ur = await usersCol().doc(id).get();
    if (ur.data) return { ...userToFriend(ur.data, id), openid: ur.data.openid || '' };
  } catch (e) { /* 找不到 */ }
  return null;
}

// 两个经纬度点之间的球面距离（米）
function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return 2 * R * Math.asin(Math.sqrt(a));
}

function formatDistance(meters) {
  if (meters == null) return '';
  if (meters < 1000) return `${Math.round(meters)}m`;
  const km = meters / 1000;
  if (km < 10) return `${km.toFixed(1)}km`;
  return `${Math.round(km)}km`;
}

// 种子宠友没有真实坐标，按 _id 生成一个确定性的「假距离」，让附近列表始终有东西可排
function mockDistanceMeters(id) {
  let h = 0;
  const s = id || '';
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 997;
  return 200 + (h % 4800); // 200m ~ 5000m
}

// 首次进入：种下默认好友（小鹿/阿橙）+ 收到的申请（草莓/阿树）
// 逐个按 friendId 幂等判断，历史脏数据不影响，可自愈
async function ensureSeeded(OPENID) {
  // 默认好友
  for (const nick of ['小鹿', '阿橙']) {
    const r = await friendsCol().where({ nickname: nick }).get();
    const f = r.data[0];
    if (!f) continue;
    const exist = await friendshipsCol().where({ openid: OPENID, friendId: f._id }).get();
    if (exist.data.length === 0) {
      await friendshipsCol().add({ data: { openid: OPENID, friendId: f._id, createdAt: db.serverDate() } });
    }
  }

  // 收到的申请
  const seedReqs = [
    { nickname: '草莓', message: '你好呀，我家毛球想和你家宝做朋友～' },
    { nickname: '阿树', message: '看到你家宝好可爱，认识一下！' },
  ];
  let idx = 0;
  for (const sr of seedReqs) {
    const r = await friendsCol().where({ nickname: sr.nickname }).get();
    const f = r.data[0];
    if (!f) { idx++; continue; }
    const exist = await requestsCol().where({ openid: OPENID, friendId: f._id }).get();
    if (exist.data.length === 0) {
      await requestsCol().add({
        data: {
          openid: OPENID,
          direction: 'incoming',
          friendId: f._id,
          nickname: f.nickname,
          avatar: f.avatar,
          petName: f.petName,
          petEmoji: f.petEmoji,
          breed: f.breed,
          distance: f.distance,
          signature: f.signature,
          online: !!f.online,
          tags: f.tags || [],
          message: sr.message,
          status: 'pending',
          createdAt: new Date(Date.now() - (20 + idx * 40) * 60000),
        },
      });
    }
    idx++;
  }
}

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const { action, data } = event || {};

  switch (action) {
    case 'discover': {
      await ensureSeeded(OPENID);
      const loc = (data && data.location) || null;
      const listRes = await friendsCol().limit(100).get();
      const myFriends = await friendshipsCol().where({ openid: OPENID }).get();
      const mySet = new Set(myFriends.data.map((f) => f.friendId));
      const myReqs = await requestsCol().where({ openid: OPENID, direction: 'outgoing', status: 'pending' }).get();
      const reqSet = new Set(myReqs.data.map((r) => r.friendId));

      const seedIds = new Set(listRes.data.map((f) => f._id));

      // 种子附近宠友
      const items = listRes.data.map((f) => ({
        ...f,
        isFriend: mySet.has(f._id),
        isRequested: reqSet.has(f._id),
        _loc: f.location || null,
        _isReal: false,
      }));

      // 真实好友（users 集合里已是好友的人）也补进列表
      const realFriendIds = myFriends.data.map((f) => f.friendId).filter((id) => !seedIds.has(id));
      if (realFriendIds.length > 0) {
        const _ = db.command;
        const usersRes = await usersCol().where({ _id: _.in(realFriendIds) }).get();
        usersRes.data.forEach((u) => {
          items.push({
            ...userToFriend(u, u._id),
            isFriend: true,
            isRequested: false,
            _loc: u.location || null,
            _isReal: true,
          });
        });
      }

      // 距离计算 + 排序（无定位则保留原有 distance 字符串与顺序）
      items.forEach((f) => {
        let meters = null;
        if (loc && loc.lat != null && loc.lng != null) {
          if (f._loc && f._loc.lat != null && f._loc.lng != null) {
            meters = haversine(loc.lat, loc.lng, f._loc.lat, f._loc.lng);
          } else if (!f._isReal) {
            meters = mockDistanceMeters(f._id);
          }
          if (meters != null) f.distance = formatDistance(meters);
        }
        f._meters = meters;
      });
      if (loc && loc.lat != null && loc.lng != null) {
        items.sort((a, b) => (a._meters == null ? 1 : b._meters == null ? -1 : a._meters - b._meters));
      }
      items.forEach((f) => { delete f._meters; delete f._loc; delete f._isReal; });

      return { code: 0, data: items };
    }

    case 'sendRequest': {
      // 发出好友申请（兼容种子宠友 + 真实用户）
      const f = await resolveTarget(data.friendId);
      if (!f) return { code: 404, message: '未找到该用户' };
      const exist = await requestsCol().where({ openid: OPENID, friendId: data.friendId }).get();
      if (exist.data.length === 0) {
        await requestsCol().add({
          data: {
            openid: OPENID,
            direction: 'outgoing',
            friendId: data.friendId,
            fromOpenid: OPENID,
            toOpenid: f.openid || '',
            nickname: f.nickname,
            avatar: f.avatar,
            petName: f.petName,
            petEmoji: f.petEmoji,
            breed: f.breed,
            distance: f.distance,
            signature: f.signature,
            online: !!f.online,
            tags: f.tags || [],
            message: '申请加你为好友',
            status: 'pending',
            createdAt: new Date(),
          },
        });

        // 目标是真实用户时，给对方种一条 incoming 申请，让对方在「好友申请」里看到并处理
        if (f.openid && f.openid !== OPENID) {
          const meRes = await usersCol().where({ openid: OPENID }).get();
          const meDoc = meRes.data[0];
          if (meDoc) {
            const incomingExist = await requestsCol()
              .where({ openid: f.openid, friendId: meDoc._id, direction: 'incoming' })
              .get();
            if (incomingExist.data.length === 0) {
              await requestsCol().add({
                data: {
                  openid: f.openid,
                  direction: 'incoming',
                  friendId: meDoc._id,
                  fromOpenid: OPENID,
                  toOpenid: f.openid,
                  nickname: meDoc.nickname || '宠友',
                  avatar: meDoc.avatarUrl || '🐾',
                  petName: meDoc.petName || '',
                  petEmoji: meDoc.petEmoji || '🐾',
                  breed: meDoc.breed || '',
                  distance: '',
                  signature: meDoc.signature || '',
                  online: false,
                  tags: meDoc.tags || [],
                  message: '申请加你为好友',
                  status: 'pending',
                  createdAt: new Date(),
                },
              });
            }
          }
        }
      }
      return { code: 0, data: { ok: true } };
    }

    case 'searchUser': {
      // 按 ID（_id / openid）或昵称搜索真实用户
      const kw = ((data && data.keyword) || '').trim();
      if (!kw) return { code: 0, data: [] };

      const found = new Map();
      // 精确匹配 _id
      try {
        const r = await usersCol().doc(kw).get();
        if (r.data) found.set(r.data._id, r.data);
      } catch (e) { /* 非法 _id */ }
      // 精确匹配 openid
      const byOpenid = await usersCol().where({ openid: kw }).get();
      byOpenid.data.forEach((u) => found.set(u._id, u));
      // 昵称模糊匹配
      const byNick = await usersCol()
        .where({ nickname: db.RegExp({ regexp: escapeRegExp(kw), options: 'i' }) })
        .limit(20)
        .get();
      byNick.data.forEach((u) => found.set(u._id, u));

      const myFriends = await friendshipsCol().where({ openid: OPENID }).get();
      const mySet = new Set(myFriends.data.map((f) => f.friendId));
      const myReqs = await requestsCol().where({ openid: OPENID, direction: 'outgoing', status: 'pending' }).get();
      const reqSet = new Set(myReqs.data.map((r) => r.friendId));

      const list = [...found.values()]
        .filter((u) => u.openid !== OPENID)
        .map((u) => ({
          ...userToFriend(u),
          isFriend: mySet.has(u._id),
          isRequested: reqSet.has(u._id),
        }));
      return { code: 0, data: list };
    }

    case 'listRequests': {
      // 只返回「收到的」申请（outgoing 由 discover/searchUser 计算 isRequested 用）
      const res = await requestsCol()
        .where({ openid: OPENID, direction: 'incoming' })
        .orderBy('createdAt', 'desc')
        .get();
      return { code: 0, data: res.data };
    }

    case 'acceptRequest': {
      const req = await requestsCol().doc(data.requestId).get();
      const r = req.data;
      await requestsCol().doc(data.requestId).update({ data: { status: 'accepted' } });
      // 真正建立好友关系
      if (r && r.friendId) {
        const exist = await friendshipsCol().where({ openid: OPENID, friendId: r.friendId }).get();
        if (exist.data.length === 0) {
          await friendshipsCol().add({ data: { openid: OPENID, friendId: r.friendId, createdAt: db.serverDate() } });
        }
        // 真实用户互加：也给对方建立反向好友关系
        if (r.fromOpenid && r.fromOpenid !== OPENID) {
          const meRes = await usersCol().where({ openid: OPENID }).get();
          const meDoc = meRes.data[0];
          if (meDoc) {
            const rev = await friendshipsCol().where({ openid: r.fromOpenid, friendId: meDoc._id }).get();
            if (rev.data.length === 0) {
              await friendshipsCol().add({ data: { openid: r.fromOpenid, friendId: meDoc._id, createdAt: db.serverDate() } });
            }
          }
        }
      }
      return { code: 0, data: { ok: true } };
    }

    case 'rejectRequest': {
      await requestsCol().doc(data.requestId).update({ data: { status: 'rejected' } });
      return { code: 0, data: { ok: true } };
    }

    case 'listMessages': {
      const res = await messagesCol()
        .where({ openid: OPENID, friendId: data.friendId })
        .orderBy('createdAt', 'asc')
        .get();
      return { code: 0, data: res.data };
    }

    case 'sendMessage': {
      const me = {
        openid: OPENID,
        friendId: data.friendId,
        role: 'me',
        text: data.text,
        createdAt: new Date(),
      };
      const addRes = await messagesCol().add({ data: me });

      const reply = {
        openid: OPENID,
        friendId: data.friendId,
        role: 'friend',
        text: autoReply(data.text),
        createdAt: new Date(),
      };
      const replyRes = await messagesCol().add({ data: reply });

      return {
        code: 0,
        data: {
          me: { _id: addRes._id, ...me },
          reply: { _id: replyRes._id, ...reply },
        },
      };
    }

    case 'updateLocation': {
      // 上报当前用户坐标，供别人计算附近距离
      const loc = (data && data.location) || null;
      if (loc && loc.lat != null && loc.lng != null) {
        await usersCol().where({ openid: OPENID }).update({
          data: { location: { lat: loc.lat, lng: loc.lng }, updatedAt: db.serverDate() },
        });
      }
      return { code: 0, data: { ok: true } };
    }

    default:
      return { code: 400, message: '未知操作' };
  }
};
