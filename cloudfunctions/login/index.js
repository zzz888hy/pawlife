const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const { nickname, avatarUrl } = event;

  if (!OPENID) {
    return { code: -1, message: '获取用户信息失败' };
  }

  try {
    // 查找用户是否已存在
    const userResult = await db.collection('users').where({ openid: OPENID }).get();

    if (userResult.data.length === 0) {
      // 新用户，创建记录
      const newUser = {
        openid: OPENID,
        nickname: nickname || '宠物主人',
        avatarUrl: avatarUrl || '😎',
        coins: 0,
        isVip: false,
        vipExpireDate: null,
        petCount: 0,
        recordCount: 0,
        createdAt: db.serverDate(),
        updatedAt: db.serverDate(),
      };
      const addResult = await db.collection('users').add({ data: newUser });
      return {
        code: 0,
        data: { ...newUser, _id: addResult._id, isNew: true },
      };
    }

    // 老用户，更新登录时间
    const user = userResult.data[0];
    await db.collection('users').doc(user._id).update({
      data: { updatedAt: db.serverDate() },
    });

    return {
      code: 0,
      data: { ...user, isNew: false },
    };
  } catch (err) {
    console.error('Login error:', err);
    return { code: -1, message: err.message };
  }
};
