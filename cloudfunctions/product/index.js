/**
 * 云函数：product
 * 商品：列表 / 分类 / 上架
 */
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async (event) => {
  const { action, data } = event || {};
  const products = db.collection('products');

  try {
    switch (action) {
      case 'list': {
        let query = products.where({ status: 'active' });
        if (data && data.category) query = query.where({ category: data.category });
        const res = await query.orderBy('soldCount', 'desc').limit(100).get();
        return { code: 0, data: res.data };
      }

      case 'categories': {
        const res = await db.collection('categories').get();
        return { code: 0, data: res.data };
      }

      case 'create': {
        const product = {
          ...(data || {}),
          soldCount: 0,
          rating: 0,
          status: 'active',
          createdAt: new Date(),
        };
        const addRes = await products.add({ data: product });
        return { code: 0, data: { _id: addRes._id, ...product } };
      }

      default:
        return { code: 400, message: '未知操作' };
    }
  } catch (err) {
    return { code: -1, message: err.message };
  }
};
