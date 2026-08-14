const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const { action, data, feedId, category } = event;

  try {
    switch (action) {
      case 'list':
        return await listFeeds(category, OPENID);
      case 'create':
        return await createFeed(OPENID, data);
      case 'like':
        return await toggleLike(feedId, OPENID);
      case 'comment':
        return await addComment(feedId, OPENID, data.text);
      case 'my':
        return await myFeeds(OPENID);
      default:
        return { code: -1, message: '未知操作' };
    }
  } catch (err) {
    return { code: -1, message: err.message };
  }
};

async function listFeeds(category, openid) {
  let query = db.collection('feeds');
  if (category && category !== '推荐') {
    query = query.where({ category });
  }
  const res = await query.orderBy('createdAt', 'desc').limit(50).get();

  // 检查当前用户是否已点赞/收藏
  const feeds = res.data.map((f) => ({
    ...f,
    liked: (f.likedBy || []).includes(openid),
    collected: (f.collectedBy || []).includes(openid),
  }));

  return { code: 0, data: feeds };
}

async function createFeed(openid, data) {
  const feed = {
    openid,
    petName: data.petName,
    petEmoji: data.petEmoji,
    breed: data.breed,
    text: data.text,
    tags: data.tags || [],
    images: data.images || [],
    category: data.category || '推荐',
    likes: 0,
    comments: 0,
    likedBy: [],
    collectedBy: [],
    createdAt: db.serverDate(),
  };
  const res = await db.collection('feeds').add({ data: feed });

  // 奖励金币
  await db.collection('users').where({ openid }).update({
    data: { coins: _.inc(5) },
  });

  return { code: 0, data: { ...feed, _id: res._id } };
}

async function toggleLike(feedId, openid) {
  const feed = await db.collection('feeds').doc(feedId).get();
  if (!feed.data) return { code: -1, message: '动态不存在' };

  const likedBy = feed.data.likedBy || [];
  const isLiked = likedBy.includes(openid);

  await db.collection('feeds').doc(feedId).update({
    data: {
      likes: _.inc(isLiked ? -1 : 1),
      likedBy: isLiked ? _.pull(openid) : _.push(openid),
    },
  });

  return { code: 0, data: { liked: !isLiked } };
}

async function addComment(feedId, openid, text) {
  if (!text) return { code: -1, message: '评论内容不能为空' };

  const comment = {
    feedId,
    openid,
    text,
    createdAt: db.serverDate(),
  };
  await db.collection('comments').add({ data: comment });

  await db.collection('feeds').doc(feedId).update({
    data: { comments: _.inc(1) },
  });

  return { code: 0, message: '评论成功' };
}

async function myFeeds(openid) {
  const res = await db.collection('feeds').where({ openid }).orderBy('createdAt', 'desc').get();
  return { code: 0, data: res.data };
}
