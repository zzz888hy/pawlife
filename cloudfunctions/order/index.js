const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const { action, data, orderId, productId } = event;

  if (!OPENID) return { code: -1, message: '未登录' };

  try {
    switch (action) {
      case 'cartAdd':
        return await addToCart(OPENID, productId, data?.quantity || 1);
      case 'cartList':
        return await getCart(OPENID);
      case 'cartRemove':
        return await removeFromCart(OPENID, productId);
      case 'create':
        return await createOrder(OPENID, data);
      case 'list':
        return await listOrders(OPENID);
      case 'detail':
        return await getOrder(orderId, OPENID);
      default:
        return { code: -1, message: '未知操作' };
    }
  } catch (err) {
    return { code: -1, message: err.message };
  }
};

async function addToCart(openid, productId, quantity) {
  // 检查是否已在购物车
  const exist = await db.collection('cart').where({ openid, productId }).get();
  if (exist.data.length > 0) {
    await db.collection('cart').doc(exist.data[0]._id).update({
      data: { quantity: exist.data[0].quantity + quantity },
    });
  } else {
    await db.collection('cart').add({
      data: { openid, productId, quantity, createdAt: db.serverDate() },
    });
  }
  return { code: 0, message: '已加入购物车' };
}

async function getCart(openid) {
  const res = await db.collection('cart').where({ openid }).get();
  // 关联商品详情
  const items = [];
  for (const item of res.data) {
    const product = await db.collection('products').doc(item.productId).get();
    if (product.data) {
      items.push({ ...item, product: product.data });
    }
  }
  return { code: 0, data: items };
}

async function removeFromCart(openid, productId) {
  await db.collection('cart').where({ openid, productId }).remove();
  return { code: 0, message: '已移除' };
}

async function createOrder(openid, data) {
  const order = {
    openid,
    items: data.items,
    totalPrice: data.totalPrice,
    status: 'pending',
    address: data.address || {},
    createdAt: db.serverDate(),
  };
  const res = await db.collection('orders').add({ data: order });

  // 清空购物车中已下单的商品
  const productIds = data.items.map((i) => i.productId);
  await db.collection('cart').where({ openid, productId: db.command.in(productIds) }).remove();

  // 更新商品销量
  for (const item of data.items) {
    await db.collection('products').doc(item.productId).update({
      data: { soldCount: db.command.inc(item.quantity) },
    });
  }

  return { code: 0, data: { ...order, _id: res._id } };
}

async function listOrders(openid) {
  const res = await db.collection('orders').where({ openid }).orderBy('createdAt', 'desc').get();
  return { code: 0, data: res.data };
}

async function getOrder(orderId, openid) {
  const res = await db.collection('orders').where({ _id: orderId, openid }).get();
  if (res.data.length === 0) return { code: -1, message: '订单不存在' };
  return { code: 0, data: res.data[0] };
}
