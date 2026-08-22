/**
 * 云函数：product
 * 商品：列表 / 分类 / 上架
 */
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

// 把 cloud:// 文件ID 批量替换成临时 https 链接，前端 <image> 才能直接渲染
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
  const { action, data } = event || {};
  const products = db.collection('products');

  try {
    switch (action) {
      case 'list': {
        let query = products.where({ status: 'active' });
        if (data && data.category) query = query.where({ category: data.category });
        const res = await query.orderBy('soldCount', 'desc').limit(100).get();
        // 商品照片转临时链接
        const fileIds = [];
        res.data.forEach((p) => { if (Array.isArray(p.images)) fileIds.push(...p.images); });
        const urlMap = await toTempUrls(fileIds);
        const list = res.data.map((p) => ({
          ...p,
          images: (p.images || []).map((id) => urlMap[id] || id),
        }));
        return { code: 0, data: list };
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
        // 数据库仍存 cloud:// 长期文件ID，返回体里转成临时链接供前端即时显示
        const urlMap = await toTempUrls((data && data.images) || []);
        const images = ((data && data.images) || []).map((id) => urlMap[id] || id);
        return { code: 0, data: { _id: addRes._id, ...product, images } };
      }

      default:
        return { code: 400, message: '未知操作' };
    }
  } catch (err) {
    return { code: -1, message: err.message };
  }
};
