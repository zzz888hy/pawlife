const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

// 北京时间（UTC+8）的日期字符串，offsetDays 为相对今天的天数（-1 表示昨天）
function dateStr(offsetDays) {
  const d = new Date(Date.now() + 8 * 3600 * 1000 + (offsetDays || 0) * 86400 * 1000);
  return d.toISOString().slice(0, 10);
}

exports.main = async () => {
  try {
    await clearCollection('categories');
    await clearCollection('products');
    await clearCollection('friends');
    await clearCollection('memorials');
    await clearCollection('rank_snapshots');
    await clearCollection('friendships');
    await clearCollection('friendRequests');

    // 商品分类
    const categories = [
      { name: '用品', emoji: '🦴', sort: 1 },
      { name: '食品', emoji: '🍖', sort: 2 },
      { name: '服务', emoji: '✂️', sort: 3 },
      { name: '穿搭', emoji: '👕', sort: 4 },
      { name: '纪念', emoji: '🖼️', sort: 5 },
      { name: '医疗', emoji: '💊', sort: 6 },
    ];
    for (const cat of categories) await db.collection('categories').add({ data: cat });

    // 商品
    const products = [
      { name: '天然磨牙洁齿骨 大号装', emoji: '🦴', price: 39.9, oldPrice: 59.9, category: '用品', soldCount: 32000, rating: 4.9, status: 'active', tags: ['🦴 用品', '⭐ 4.9分'] },
      { name: '云朵记忆棉猫窝 四季通用', emoji: '🏠', price: 89, oldPrice: 129, category: '用品', soldCount: 18000, rating: 4.8, status: 'active', tags: ['🏠 用品', '⭐ 4.8分'] },
      { name: '冻干双拼粮 金毛专用 5kg', emoji: '🍖', price: 259, oldPrice: 329, category: '食品', soldCount: 56000, rating: 4.9, status: 'active', tags: ['🍖 食品', '⭐ 4.9分'] },
      { name: '圣诞节日装扮套装 狗狗', emoji: '👕', price: 19.9, oldPrice: 39.9, category: '穿搭', soldCount: 21000, rating: 4.7, status: 'active', tags: ['👕 穿搭', '⭐ 4.7分'] },
      { name: '发光弹力球玩具 3只装', emoji: '🎾', price: 15.9, oldPrice: 29.9, category: '用品', soldCount: 48000, rating: 4.8, status: 'active', tags: ['🎾 用品', '⭐ 4.8分'] },
      { name: '专业宠物美容 到家服务', emoji: '✂️', price: 128, oldPrice: 198, category: '服务', soldCount: 6800, rating: 4.9, status: 'active', tags: ['✂️ 服务', '⭐ 4.9分'] },
    ];
    for (const p of products) await db.collection('products').add({ data: { ...p, createdAt: new Date() } });

    // 附近宠友（发现列表）——固定 _id，好友关系/申请按此 id 关联，避免重跑 db-init 后失联
    // 坐标以西安钟楼附近为中心（34.2610, 108.9425），按各自 distance 在四周散开；换城市改这里 location 即可
    const friends = [
      { _id: 'f-xiaolu', nickname: '小鹿', avatar: '🦌', petName: '豆豆', petEmoji: '🐕', breed: '柯基', distance: '500m', signature: '和豆豆一起散步的第800天', online: true, tags: ['柯基', '户外'], location: { lat: 34.2655, lng: 108.9425 } },
      { _id: 'f-aco', nickname: '阿橙', avatar: '🍊', petName: '团子', petEmoji: '🐱', breed: '英短', distance: '800m', signature: '喵星人铲屎官，欢迎来撸', online: true, tags: ['英短', '宅家'], location: { lat: 34.2610, lng: 108.9512 } },
      { _id: 'f-wanfeng', nickname: '晚风', avatar: '🌙', petName: '雪球', petEmoji: '🐰', breed: '垂耳兔', distance: '1.2km', signature: '兔兔也可以交朋友哦', online: false, tags: ['兔兔', '安静'], location: { lat: 34.2718, lng: 108.9425 } },
      { _id: 'f-nuomi', nickname: '糯米', avatar: '🍡', petName: '布丁', petEmoji: '🐕', breed: '泰迪', distance: '1.5km', signature: '泰迪精力旺盛，求遛', online: true, tags: ['泰迪', '遛狗'], location: { lat: 34.2475, lng: 108.9425 } },
      { _id: 'f-dabai', nickname: '大白', avatar: '🐻', petName: '可乐', petEmoji: '🐕', breed: '金毛', distance: '2km', signature: '金毛暖男本男', online: true, tags: ['金毛', '暖男'], location: { lat: 34.2610, lng: 108.9643 } },
      { _id: 'f-tangtang', nickname: '糖糖', avatar: '🍬', petName: '奶昔', petEmoji: '🐱', breed: '布偶', distance: '2.3km', signature: '布偶奶昔的日常', online: false, tags: ['布偶', '拍照'], location: { lat: 34.2817, lng: 108.9425 } },
      { _id: 'f-youzi', nickname: '柚子', avatar: '🍋', petName: '球球', petEmoji: '🐕', breed: '柴犬', distance: '3km', signature: '柴犬的倔强你不懂', online: true, tags: ['柴犬', '搞笑'], location: { lat: 34.2341, lng: 108.9425 } },
      { _id: 'f-xiaoman', nickname: '小满', avatar: '🌿', petName: '汤圆', petEmoji: '🐱', breed: '橘猫', distance: '3.5km', signature: '橘猫减肥中，监督我', online: false, tags: ['橘猫', '减肥'], location: { lat: 34.2610, lng: 108.9806 } },
      { _id: 'f-strawberry', nickname: '草莓', avatar: '🍓', petName: '毛球', petEmoji: '🐱', breed: '美短', distance: '900m', signature: '美短小粘人精', online: true, tags: ['美短', '粘人'], location: { lat: 34.2610, lng: 108.9327 } },
      { _id: 'f-ashu', nickname: '阿树', avatar: '🌲', petName: '蛋挞', petEmoji: '🐕', breed: '边牧', distance: '1.8km', signature: '边牧的智商碾压我', online: false, tags: ['边牧', '聪明'], location: { lat: 34.2772, lng: 108.9425 } },
    ];
    for (const f of friends) await db.collection('friends').add({ data: f });

    // 纪念馆
    const memorials = [
      { emoji: '🐈', name: '小白', dateRange: '2010.03 — 2023.08', message: '"谢谢你13年的陪伴"' },
      { emoji: '🐕', name: '大黄', dateRange: '2015.06 — 2024.01', message: '"永远的好朋友"' },
    ];
    for (const m of memorials) await db.collection('memorials').add({ data: { ...m, createdAt: new Date() } });

    // 榜单历史快照（写入「昨天」的基线，让趋势立即可见）
    const yesterday = dateStr(-1);
    const rankSnapshots = [
      { petName: '团子', likes: 690 },
      { petName: '橘子', likes: 550 },
      { petName: '豆豆', likes: 286 },
      { petName: '雪球', likes: 180 },
      { petName: '花生', likes: 160 },
      { petName: '啾啾', likes: 80 },
    ];
    for (const s of rankSnapshots) {
      await db.collection('rank_snapshots').add({ data: { petName: s.petName, likes: s.likes, date: yesterday } });
    }

    // 动态种子数据（仅当广场为空时写入，避免覆盖真实动态）
    const feedCount = (await db.collection('feed').count()).total;
    if (feedCount === 0) {
      const feeds = [
        { pet: '🐶', petName: '团子', breed: '柯基·1岁', owner: '@短腿大魔王', category: '最帅狗狗', likes: 500, tags: ['柯基', '短腿', '户外'], txt: '今天带团子去公园，小短腿跑起来超可爱！' },
        { pet: '🐶', petName: '团子', breed: '柯基·1岁', owner: '@短腿大魔王', category: '最搞笑', likes: 234, tags: ['柯基', '搞笑'], txt: '团子偷吃被抓包，一脸无辜……' },
        { pet: '🐱', petName: '橘子', breed: '橘猫·2岁', owner: '@橘子大人', category: '最萌猫咪', likes: 300, tags: ['橘猫', '猫咪'], txt: '橘子的午后慵懒时光。' },
        { pet: '🐱', petName: '橘子', breed: '橘猫·2岁', owner: '@橘子大人', category: '最萌猫咪', likes: 212, tags: ['橘猫', '吃货'], txt: '大橘为重，减肥计划又失败了。' },
        { pet: '🐕', petName: '豆豆', breed: '金毛·3岁', owner: '@豆豆麻麻', category: '最帅狗狗', likes: 286, tags: ['金毛', '暖男'], txt: '金毛豆豆，治愈系暖男本男。' },
        { pet: '🐰', petName: '雪球', breed: '荷兰垂耳兔', owner: '@雪球麻麻', category: '最佳穿搭', likes: 198, tags: ['垂耳兔', '可爱'], txt: '给雪球戴了个小蝴蝶结。' },
        { pet: '🐹', petName: '花生', breed: '仓鼠·6个月', owner: '@花生酱', category: '最萌猫咪', likes: 156, tags: ['仓鼠', '萌宠'], txt: '花生的腮帮子永远是鼓鼓的。' },
        { pet: '🦜', petName: '啾啾', breed: '玄凤鹦鹉·2岁', owner: '@鸟语花香', category: '饲养经验', likes: 98, tags: ['鹦鹉', '养鸟'], txt: '啾啾学会了新口哨，分享给大家。' },
      ];
      feeds.forEach((f, i) => {
        const likeOpenids = [];
        for (let k = 0; k < f.likes; k++) likeOpenids.push('seed_like_' + k);
        db.collection('feed').add({
          data: {
            openid: 'seed',
            pet: f.pet,
            petName: f.petName,
            breed: f.breed,
            owner: f.owner,
            txt: f.txt,
            tags: f.tags,
            images: [],
            category: f.category,
            likeOpenids,
            commentCount: 0,
            createdAt: new Date(Date.now() - i * 60000),
          },
        });
      });
    }

    return { code: 0, message: `初始化完成：${categories.length}分类 ${products.length}商品 ${friends.length}宠友 ${memorials.length}纪念` };
  } catch (err) {
    return { code: -1, message: err.message };
  }
};

async function clearCollection(name) {
  const MAX_LIMIT = 100;
  const countResult = await db.collection(name).count();
  const total = countResult.total;
  const batchTimes = Math.ceil(total / MAX_LIMIT);
  for (let i = 0; i < batchTimes; i++) {
    const res = await db.collection(name).skip(i * MAX_LIMIT).limit(MAX_LIMIT).get();
    for (const item of res.data) {
      await db.collection(name).doc(item._id).remove();
    }
  }
}
