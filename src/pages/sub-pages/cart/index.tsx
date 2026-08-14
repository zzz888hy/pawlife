import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAppStore } from '@/stores/useAppStore';
import { useMarketStore } from '@/stores/useMarketStore';
import './index.scss';

export default function CartPage() {
  const cart = useMarketStore((s) => s.cart);
  const products = useMarketStore((s) => s.products);
  const removeFromCart = useMarketStore((s) => s.removeFromCart);
  const placeOrder = useMarketStore((s) => s.placeOrder);
  const showToast = useAppStore((s) => s.showToast);

  const cartItems = cart
    .map((c) => {
      const product = products.find((p) => p.id === c.productId);
      return product ? { ...c, product } : null;
    })
    .filter(Boolean);

  const totalPrice = cartItems.reduce((sum, item) => {
    return sum + (item?.product?.price || 0) * (item?.quantity || 0);
  }, 0);

  const handleRemove = (productId: string) => {
    removeFromCart(productId);
    showToast('已移除');
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      showToast('购物车是空的');
      return;
    }
    Taro.showModal({
      title: '确认下单',
      content: `共 ${cartItems.length} 件商品，合计 ¥${totalPrice.toFixed(1)}`,
      success: (res) => {
        if (res.confirm) {
          // 生成订单
          const orderItems = cartItems
            .filter((item) => item?.product)
            .map((item) => ({
              productId: item!.product!.id,
              name: item!.product!.name,
              emoji: item!.product!.emoji,
              bg: item!.product!.bg,
              price: item!.product!.price,
              quantity: item!.quantity,
            }));
          placeOrder(orderItems, totalPrice);
          // 清空购物车
          cartItems.forEach((item) => {
            if (item?.product) {
              removeFromCart(item.product.id);
            }
          });
          showToast('下单成功！');
          setTimeout(() => {
            Taro.navigateTo({ url: '/pages/sub-pages/orders/index' });
          }, 600);
        }
      },
    });
  };

  return (
    <View className='cart-page'>
      {cartItems.length === 0 ? (
        <View className='cart-empty'>
          <Text className='cart-empty-icon'>🛒</Text>
          <Text className='cart-empty-text'>购物车是空的</Text>
          <View className='cart-go-btn' onClick={() => Taro.switchTab({ url: '/pages/marketplace/index' })}>
            <Text>去逛逛</Text>
          </View>
        </View>
      ) : (
        <>
          <ScrollView className='cart-list' scrollY>
            {cartItems.map((item) => (
              <View key={item?.product?.id} className='cart-item'>
                <View className='cart-item-img' style={{ background: item?.product?.bg }}>
                  <Text>{item?.product?.emoji}</Text>
                </View>
                <View className='cart-item-info'>
                  <Text className='cart-item-name'>{item?.product?.name}</Text>
                  <Text className='cart-item-price'>¥{item?.product?.price} × {item?.quantity}</Text>
                </View>
                <View className='cart-item-remove' onClick={() => item?.product && handleRemove(item.product.id)}>
                  <Text>删除</Text>
                </View>
              </View>
            ))}
          </ScrollView>

          <View className='cart-footer'>
            <View className='cart-total'>
              <Text className='cart-total-label'>合计：</Text>
              <Text className='cart-total-price'>¥{totalPrice.toFixed(1)}</Text>
            </View>
            <View className='cart-checkout-btn' onClick={handleCheckout}>
              <Text>立即下单</Text>
            </View>
          </View>
        </>
      )}
    </View>
  );
}
