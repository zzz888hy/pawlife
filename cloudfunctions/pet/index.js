/**
 * 云函数：pet
 * 宠物 CRUD + 成长记录
 */
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const _ = db.command;

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const { action, data } = event || {};

  const pets = db.collection('pets');
  const records = db.collection('pet_records');
  const users = db.collection('users');

  switch (action) {
    case 'list': {
      const res = await pets.where({ openid: OPENID }).orderBy('createdAt', 'asc').get();
      return { code: 0, data: res.data };
    }

    case 'create': {
      const now = db.serverDate();
      const pet = { openid: OPENID, ...(data || {}), createdAt: now, updatedAt: now };
      const addRes = await pets.add({ data: pet });
      await users.where({ openid: OPENID }).update({ data: { petCount: _.inc(1) } });
      return { code: 0, data: { _id: addRes._id, ...pet } };
    }

    case 'update': {
      const { _id, ...patch } = data || {};
      await pets.doc(_id).update({ data: { ...patch, updatedAt: db.serverDate() } });
      return { code: 0, data: { _id, ...patch } };
    }

    case 'remove': {
      await pets.doc(data._id).remove();
      await users.where({ openid: OPENID }).update({ data: { petCount: _.inc(-1) } });
      return { code: 0, data: { removed: true } };
    }

    case 'timeline': {
      const res = await records.where({ petId: data.petId }).orderBy('createdAt', 'desc').get();
      return { code: 0, data: res.data };
    }

    case 'addRecord': {
      const now = db.serverDate();
      const rec = { openid: OPENID, ...(data || {}), createdAt: now };
      const addRes = await records.add({ data: rec });
      await users.where({ openid: OPENID }).update({ data: { recordCount: _.inc(1) } });
      return { code: 0, data: { _id: addRes._id, ...rec } };
    }

    default:
      return { code: 400, message: '未知操作' };
  }
};
