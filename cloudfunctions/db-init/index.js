const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async () => {
  try {
    // 初始化商品分类
    const categories = [
      { name: '用品', emoji: '🦴', sort: 1 },
      { name: '食品', emoji: '🍖', sort: 2 },
      { name: '服务', emoji: '✂️', sort: 3 },
      { name: '穿搭', emoji: '👕', sort: 4 },
      { name: '纪念', emoji: '🖼️', sort: 5 },
      { name: '医疗', emoji: '💊', sort: 6 },
    ];

    // 清空旧数据
    await clearCollection('categories');
    await clearCollection('products');

    // 插入分类
    for (const cat of categories) {
      await db.collection('categories').add({ data: cat });
    }

    // 初始化商品
    const products = [
      { name: '天然磨牙洁齿骨 大号装', emoji: '🦴', price: 39.9, oldPrice: 59.9, category: '用品', soldCount: 32000, rating: 4.9, status: 'active', image: '🦴', tags: ['🦴 用品', '⭐ 4.9分'] },
      { name: '云朵记忆棉猫窝 四季通用', emoji: '🏠', price: 89, oldPrice: 129, category: '用品', soldCount: 18000, rating: 4.8, status: 'active', image: '🏠', tags: ['🏠 用品', '⭐ 4.8分'] },
      { name: '冻干双拼粮 金毛专用 5kg', emoji: '🍖', price: 259, oldPrice: 329, category: '食品', soldCount: 56000, rating: 4.9, status: 'active', image: '🍖', tags: ['🍖 食品', '⭐ 4.9分'] },
      { name: '圣诞节日装扮套装 狗狗', emoji: '👕', price: 19.9, oldPrice: 39.9, category: '穿搭', soldCount: 21000, rating: 4.7, status: 'active', image: '👕', tags: ['👕 穿搭', '⭐ 4.7分'] },
      { name: '发光弹力球玩具 3只装', emoji: '🎾', price: 15.9, oldPrice: 29.9, category: '用品', soldCount: 48000, rating: 4.8, status: 'active', image: '🎾', tags: ['🎾 用品', '⭐ 4.8分'] },
      { name: '专业宠物美容 到家服务', emoji: '✂️', price: 128, oldPrice: 198, category: '服务', soldCount: 6800, rating: 4.9, status: 'active', image: '✂️', tags: ['✂️ 服务', '⭐ 4.9分'] },
    ];

    for (const p of products) {
      await db.collection('products').add({ data: { ...p, createdAt: new Date() } });
    }

    return { code: 0, message: `数据库初始化完成：${categories.length} 个分类，${products.length} 个商品` };
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
