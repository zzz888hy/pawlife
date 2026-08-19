/**
 * 云函数：feed
 * 动态广场：列表 / 发布 / 编辑 / 删除 / 我的动态 / 他人主页 / 点赞 / 评论
 */
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const _ = db.command;

// 把 cloud:// 文件ID 批量替换成临时 https 链接（云函数签发，不受存储「仅创建者可读写」限制）
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

// 公共装饰：点赞计数 / 是否已赞 + 主人昵称头像回填 + cloud:// 转临时链接
async function decorate(list, OPENID) {
  const decorated = list.map((item) => ({
    ...item,
    likes: (item.likeOpenids || []).length,
    cmts: item.commentCount || 0,
    liked: (item.likeOpenids || []).includes(OPENID),
  }));

  // 主人昵称与头像：按 openid 批量查询 users 集合
  const openids = [...new Set(decorated.map((f) => f.openid).filter(Boolean))];
  const userMap = {};
  if (openids.length > 0) {
    try {
      const uRes = await db.collection('users').where({ openid: _.in(openids) }).get();
      uRes.data.forEach((u) => { userMap[u.openid] = u; });
    } catch (e) {
      console.error('查询用户失败:', e);
    }
  }
  decorated.forEach((f) => {
    const u = userMap[f.openid];
    if (u) {
      if (u.nickname) f.owner = u.nickname;
      if (u.avatarUrl) f.ownerAvatar = u.avatarUrl;
    }
  });

  // 图片 / 宠物头像 / 主人头像转临时链接，其他用户才能看到
  const fileIds = [];
  decorated.forEach((f) => {
    if (Array.isArray(f.images)) fileIds.push(...f.images);
    if (f.pet) fileIds.push(f.pet);
    if (f.ownerAvatar) fileIds.push(f.ownerAvatar);
  });
  const urlMap = await toTempUrls(fileIds);
  decorated.forEach((f) => {
    if (Array.isArray(f.images)) f.images = f.images.map((id) => urlMap[id] || id);
    if (urlMap[f.pet]) f.pet = urlMap[f.pet];
    if (urlMap[f.ownerAvatar]) f.ownerAvatar = urlMap[f.ownerAvatar];
  });

  return decorated;
}

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const { action, data } = event || {};

  const feed = db.collection('feed');
  const comments = db.collection('comments');

  switch (action) {
    case 'list': {
      const res = await feed.orderBy('createdAt', 'desc').limit(50).get();
      // 隐私过滤：公开可见，或作者本人可见。
      // 「好友可见」暂按作者可见处理——演示好友体系（friend 云函数）是 openid → 内置演示角色，
      // 无真实用户间好友关系；接入真实好友后在此补好友判定即可。
      const visible = res.data.filter(
        (f) => (f.visibility || 'public') === 'public' || f.openid === OPENID
      );
      const list = await decorate(visible, OPENID);
      return { code: 0, data: list };
    }

    case 'listMine': {
      const res = await feed.where({ openid: OPENID }).orderBy('createdAt', 'desc').get();
      const list = await decorate(res.data, OPENID);
      return { code: 0, data: list };
    }

    case 'listByUser': {
      const res = await feed.where({ openid: data.openid }).orderBy('createdAt', 'desc').get();
      // 他人主页只显示公开动态；作者本人访问时也能看到自己的私密动态
      const publicList = res.data.filter(
        (f) => (f.visibility || 'public') === 'public' || f.openid === OPENID
      );
      const list = await decorate(publicList, OPENID);
      return { code: 0, data: list };
    }

    case 'create': {
      // 读取发布者昵称与头像，一并写入动态
      let owner = '宠物主人';
      let ownerAvatar = '😎';
      try {
        const uRes = await db.collection('users').where({ openid: OPENID }).get();
        if (uRes.data.length > 0) {
          owner = uRes.data[0].nickname || owner;
          ownerAvatar = uRes.data[0].avatarUrl || ownerAvatar;
        }
      } catch (e) {
        console.error('查询发布者失败:', e);
      }

      const visibility = (data && data.visibility) || 'public';
      const now = db.serverDate();
      const item = {
        openid: OPENID,
        ...(data || {}),
        visibility,
        owner,
        ownerAvatar,
        likeOpenids: [],
        commentCount: 0,
        createdAt: now,
      };
      const addRes = await feed.add({ data: item });
      return {
        code: 0,
        data: {
          _id: addRes._id,
          ...(data || {}),
          openid: OPENID,
          visibility,
          owner,
          ownerAvatar,
          likes: 0,
          cmts: 0,
          liked: false,
        },
      };
    }

    case 'update': {
      const { feedId, ...patch } = data || {};
      const doc = await feed.doc(feedId).get();
      if (doc.data.openid !== OPENID) {
        return { code: 403, message: '无权操作' };
      }
      const upd = {};
      ['txt', 'tags', 'images', 'visibility'].forEach((k) => {
        if (patch[k] !== undefined) upd[k] = patch[k];
      });
      upd.updatedAt = db.serverDate();
      await feed.doc(feedId).update({ data: upd });
      return { code: 0, data: { _id: feedId, ...upd } };
    }

    case 'remove': {
      const doc = await feed.doc(data.feedId).get();
      if (doc.data.openid !== OPENID) {
        return { code: 403, message: '无权操作' };
      }
      await feed.doc(data.feedId).remove();
      // best-effort 清理该动态的评论
      try {
        await comments.where({ feedId: data.feedId }).remove();
      } catch (e) {
        console.error('清理评论失败:', e);
      }
      return { code: 0, data: { removed: true } };
    }

    case 'like': {
      const doc = await feed.doc(data.feedId).get();
      const likeOpenids = doc.data.likeOpenids || [];
      const liked = likeOpenids.includes(OPENID);
      if (liked) {
        await feed.doc(data.feedId).update({ data: { likeOpenids: _.pull(OPENID) } });
      } else {
        await feed.doc(data.feedId).update({ data: { likeOpenids: _.push([OPENID]) } });
      }
      return { code: 0, data: { liked: !liked } };
    }

    case 'comment': {
      const now = db.serverDate();
      const comment = {
        openid: OPENID,
        feedId: data.feedId,
        content: data.content,
        userName: data.userName || '宠物主人',
        avatar: data.avatar || '😎',
        createdAt: now,
      };
      const addRes = await comments.add({ data: comment });
      await feed.doc(data.feedId).update({ data: { commentCount: _.inc(1) } });
      return {
        code: 0,
        data: {
          _id: addRes._id,
          feedId: data.feedId,
          openid: OPENID,
          content: data.content,
          userName: data.userName || '宠物主人',
          avatar: data.avatar || '😎',
        },
      };
    }

    case 'listComments': {
      const res = await comments.where({ feedId: data.feedId }).orderBy('createdAt', 'asc').get();
      return { code: 0, data: res.data };
    }

    default:
      return { code: 400, message: '未知操作' };
  }
};
