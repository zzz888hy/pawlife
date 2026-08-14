const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const { action, data, petId } = event;

  if (!OPENID) return { code: -1, message: '未登录' };

  try {
    switch (action) {
      case 'list':
        return await listPets(OPENID);
      case 'create':
        return await createPet(OPENID, data);
      case 'update':
        return await updatePet(OPENID, petId, data);
      case 'delete':
        return await deletePet(OPENID, petId);
      case 'timeline':
        return await getTimeline(petId);
      default:
        return { code: -1, message: '未知操作' };
    }
  } catch (err) {
    return { code: -1, message: err.message };
  }
};

async function listPets(openid) {
  const res = await db.collection('pets').where({ openid }).orderBy('createdAt', 'desc').get();
  return { code: 0, data: res.data };
}

async function createPet(openid, data) {
  const pet = {
    openid,
    ...data,
    createdAt: db.serverDate(),
    updatedAt: db.serverDate(),
  };
  const res = await db.collection('pets').add({ data: pet });

  // 更新用户宠物数量
  const _ = db.command;
  await db.collection('users').where({ openid }).update({
    data: { petCount: _.inc(1) },
  });

  return { code: 0, data: { ...pet, _id: res._id } };
}

async function updatePet(openid, petId, data) {
  await db.collection('pets').where({ _id: petId, openid }).update({
    data: { ...data, updatedAt: db.serverDate() },
  });
  return { code: 0, message: '更新成功' };
}

async function deletePet(openid, petId) {
  await db.collection('pets').where({ _id: petId, openid }).remove();
  const _ = db.command;
  await db.collection('users').where({ openid }).update({
    data: { petCount: _.inc(-1) },
  });
  return { code: 0, message: '删除成功' };
}

async function getTimeline(petId) {
  const res = await db.collection('timeline').where({ petId }).orderBy('date', 'desc').get();
  return { code: 0, data: res.data };
}
