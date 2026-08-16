/**
 * 云函数：identity
 * 宠物数字身份认证：查询 / 提交申请
 */
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const { action, data } = event || {};
  const records = db.collection('identities');

  switch (action) {
    case 'list': {
      const res = await records.where({ openid: OPENID }).get();
      return { code: 0, data: res.data };
    }

    case 'apply': {
      const exist = await records.where({ openid: OPENID, petId: data.petId }).get();
      const doc = {
        openid: OPENID,
        petId: data.petId,
        chipNo: data.chipNo,
        vaccineNo: data.vaccineNo,
        pedigree: data.pedigree || '',
        status: 'reviewing',
        submittedAt: new Date(),
      };
      if (exist.data.length > 0) {
        await records.doc(exist.data[0]._id).update({ data: doc });
        return { code: 0, data: { _id: exist.data[0]._id, ...doc } };
      }
      const addRes = await records.add({ data: doc });
      return { code: 0, data: { _id: addRes._id, ...doc } };
    }

    default:
      return { code: 400, message: '未知操作' };
  }
};
