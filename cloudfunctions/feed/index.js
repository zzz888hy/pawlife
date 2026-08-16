/**
 * 云函数：feed
 * 动态广场：列表 / 发布 / 点赞 / 评论
 */
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const _ = db.command;

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
