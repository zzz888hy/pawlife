/**
 * 云函数：feed
 * 动态广场：列表 / 发布 / 点赞 / 评论
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

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const { action, data } = event || {};

  const feed = db.collection('feed');
  const comments = db.collection('comments');

  switch (action) {
    case 'list': {
      const res = await feed.orderBy('createdAt', 'desc').limit(50).get();
      const list = res.data.map((item) => ({
        ...item,
        likes: (item.likeOpenids || []).length,
        cmts: item.commentCount || 0,
        liked: (item.likeOpenids || []).includes(OPENID),
      }));

      // 图片 / 宠物头像转临时链接，其他用户才能看到
      const fileIds = [];
      list.forEach((f) => {
        if (Array.isArray(f.images)) fileIds.push(...f.images);
        if (f.pet) fileIds.push(f.pet);
      });
      const urlMap = await toTempUrls(fileIds);
      list.forEach((f) => {
        if (Array.isArray(f.images)) f.images = f.images.map((id) => urlMap[id] || id);
        if (urlMap[f.pet]) f.pet = urlMap[f.pet];
      });

      return { code: 0, data: list };
    }

    case 'create': {
      const now = db.serverDate();
      const item = {
        openid: OPENID,
        ...(data || {}),
        likeOpenids: [],
        commentCount: 0,
        createdAt: now,
      };
      const addRes = await feed.add({ data: item });
      return {
        code: 0,
        data: { _id: addRes._id, ...(data || {}), likes: 0, cmts: 0, liked: false },
      };
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
