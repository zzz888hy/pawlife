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
      const listRes = await friendsCol().limit(100).get();
      const myFriends = await friendshipsCol().where({ openid: OPENID }).get();
      const mySet = new Set(myFriends.data.map((f) => f.friendId));
      const myReqs = await requestsCol().where({ openid: OPENID, direction: 'outgoing', status: 'pending' }).get();
      const reqSet = new Set(myReqs.data.map((r) => r.friendId));
      const list = listRes.data.map((f) => ({
        ...f,
        isFriend: mySet.has(f._id),
        isRequested: reqSet.has(f._id),
      }));
      return { code: 0, data: list };
    }

    case 'sendRequest': {
      // 发出好友申请
      const target = await friendsCol().doc(data.friendId).get();
      const f = target.data;
      const exist = await requestsCol().where({ openid: OPENID, friendId: data.friendId }).get();
      if (exist.data.length === 0 && f) {
        await requestsCol().add({
          data: {
            openid: OPENID,
            direction: 'outgoing',
            friendId: data.friendId,
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
      }
      return { code: 0, data: { ok: true } };
    }

    case 'listRequests': {
      const res = await requestsCol().where({ openid: OPENID }).orderBy('createdAt', 'desc').get();
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

    default:
      return { code: 400, message: '未知操作' };
  }
};
