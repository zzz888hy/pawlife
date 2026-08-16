/**
 * 云函数：order
 * 购物车 / 订单
 */
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const _ = db.command;

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const { action, data } = event || {};
  if (!OPENID) return { code: -1, message: '未登录' };

  const cart = db.collection('cart');
  const orders = db.collection('orders');
  const products = db.collection('products');

  try {
    switch (action) {
      case 'cartAdd': {
        const productId = data.productId;
        const quantity = data.quantity || 1;
        const exist = await cart.where({ openid: OPENID, productId }).get();
        if (exist.data.length > 0) {
          await cart.doc(exist.data[0]._id).update({
            data: { quantity: exist.data[0].quantity + quantity },
          });
        } else {
          await cart.add({ data: { openid: OPENID, productId, quantity, createdAt: db.serverDate() } });
        }
        return { code: 0, data: { ok: true } };
      }

      case 'cartList': {
        const res = await cart.where({ openid: OPENID }).get();
        return { code: 0, data: res.data };
      }

      case 'cartRemove': {
        await cart.where({ openid: OPENID, productId: data.productId }).remove();
        return { code: 0, data: { ok: true } };
      }

      case 'cartClear': {
        await cart.where({ openid: OPENID }).remove();
        return { code: 0, data: { ok: true } };
      }

      case 'create': {
        const orderNo = 'PL' + Date.now();
        const createdAt = new Date();
        const order = {
          openid: OPENID,
          orderNo,
          items: data.items,
          totalPrice: data.totalPrice,
          status: 'pending',
          createdAt,
        };
        const res = await orders.add({ data: order });

        const productIds = (data.items || []).map((i) => i.productId);
        if (productIds.length) {
          await cart.where({ openid: OPENID, productId: _.in(productIds) }).remove();
          for (const item of data.items) {
            await products.doc(item.productId).update({ data: { soldCount: _.inc(item.quantity) } });
          }
        }
        return {
          code: 0,
          data: { _id: res._id, orderNo, items: data.items, totalPrice: data.totalPrice, status: 'pending', createdAt },
        };
      }

      case 'list': {
        const res = await orders.where({ openid: OPENID }).orderBy('createdAt', 'desc').limit(100).get();
        return { code: 0, data: res.data };
      }

      case 'updateStatus': {
        await orders.where({ _id: data.orderId, openid: OPENID }).update({ data: { status: data.status } });
        return { code: 0, data: { ok: true } };
      }

      default:
        return { code: 400, message: '未知操作' };
    }
  } catch (err) {
    return { code: -1, message: err.message };
  }
};
