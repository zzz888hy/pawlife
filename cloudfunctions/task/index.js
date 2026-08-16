/**
 * 云函数：task
 * 每日任务：查询完成情况 / 完成任务领金币
 */
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const _ = db.command;

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const { action, data } = event || {};

  const tasks = db.collection('tasks');
  const users = db.collection('users');

  switch (action) {
    case 'list': {
      const res = await tasks.where({ openid: OPENID }).get();
      return { code: 0, data: res.data };
    }

    case 'complete': {
      // 防止重复领取
      const existing = await tasks.where({ openid: OPENID, taskId: data.taskId }).get();
      if (existing.data.length > 0) {
        return { code: 0, data: { ok: true, reward: 0, already: true } };
      }

      const now = db.serverDate();
      const doc = {
        openid: OPENID,
        taskId: data.taskId,
        completed: true,
        date: data.date || '',
        completedAt: now,
      };
      await tasks.add({ data: doc });
      const reward = data.reward || 0;
      if (reward > 0) {
        await users.where({ openid: OPENID }).update({ data: { coins: _.inc(reward) } });
      }
      return { code: 0, data: { ok: true, reward } };
    }

    default:
      return { code: 400, message: '未知操作' };
  }
};
