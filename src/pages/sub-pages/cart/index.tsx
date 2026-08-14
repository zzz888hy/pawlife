import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAppStore } from '@/stores/useAppStore';
import { useMarketStore } from '@/stores/useMarketStore';
import './index.scss';

export default function CartPage() {
  const cart = useMarketStore((s) => s.cart);
  const products = useMarketStore((s) => s.products);
  const removeFromCart = useMarketStore((s) => s.removeFromCart);
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
          // 模拟下单成功
          showToast('下单成功！');
          // 清空购物车中已下单的商品
          cartItems.forEach((item) => {
            if (item?.product) {
              removeFromCart(item.product.id);
            }
          });
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
