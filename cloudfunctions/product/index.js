const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event) => {
  const { action, data, productId, category } = event;

  try {
    switch (action) {
      case 'list':
        return await listProducts(category);
      case 'detail':
        return await getProduct(productId);
      case 'categories':
        return await getCategories();
      default:
        return { code: -1, message: '未知操作' };
    }
  } catch (err) {
    return { code: -1, message: err.message };
  }
};

async function listProducts(category) {
  let query = db.collection('products').where({ status: 'active' });
  if (category) query = query.where({ category });
  const res = await query.orderBy('soldCount', 'desc').get();
  return { code: 0, data: res.data };
}

async function getProduct(productId) {
  const res = await db.collection('products').doc(productId).get();
  if (!res.data) return { code: -1, message: '商品不存在' };
  return { code: 0, data: res.data };
}

async function getCategories() {
  const res = await db.collection('categories').get();
  return { code: 0, data: res.data };
}
