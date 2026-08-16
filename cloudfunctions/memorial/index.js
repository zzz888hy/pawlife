/**
 * 云函数：memorial
 * 星光纪念馆：纪念列表
 */
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async (event) => {
  const { action } = event || {};
  switch (action) {
    case 'list': {
      const res = await db.collection('memorials').orderBy('createdAt', 'asc').limit(100).get();
      return { code: 0, data: res.data };
    }
    default:
      return { code: 400, message: '未知操作' };
  }
};
