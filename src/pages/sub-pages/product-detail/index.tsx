import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { useEffect, useState } from 'react';
import { useMarketStore } from '@/stores/useMarketStore';
import { useAppStore } from '@/stores/useAppStore';
import SubPageHeader from '@/components/SubPageHeader';
import type { Product, CommunityReview } from '@/types';
import './index.scss';

const MOCK_REVIEW: CommunityReview = {
  id: 'rev-1',
  userName: '豆豆主人',
  userAvatar: '🐕',
  text: '给豆豆买了这款，质量很好，金毛咬东西厉害但这个很耐咬！已经第二次回购了，豆豆超喜欢～',
  purchased: true,
};

export default function ProductDetailPage() {
  const router = useRouter();
  const productId = (router.params.id as string) || 'p-1';
  const getProductById = useMarketStore((s) => s.getProductById);
  const addToCart = useMarketStore((s) => s.addToCart);
  const showToast = useAppStore((s) => s.showToast);

  const [product, setProduct] = useState<Product | undefined>(undefined);

  useEffect(() => {
    // Fetch product — if store is empty, load products first
    const p = getProductById(productId);
    setProduct(p);
  }, [productId]);

  if (!product) {
    return (
      <View className='product-detail-page'>
        <SubPageHeader title='商品详情' />
        <View className='pd-empty'>
          <Text className='pd-empty-icon'>📦</Text>
          <Text className='pd-empty-text'>商品不存在或已下架</Text>
        </View>
      </View>
    );
  }

  const handleAddToCart = () => {
    addToCart(product.id);
    Taro.showToast({ title: '已加入购物车', icon: 'success' });
  };

  const handleBuyNow = () => {
    showToast('正在跳转下单...');
    setTimeout(() => {
      Taro.navigateTo({ url: '/pages/sub-pages/orders/index' });
    }, 600);
  };

  const handleCart = () => {
    Taro.showToast({ title: '购物车功能开发中', icon: 'none' });
  };

  return (
    <View className='product-detail-page'>
      <SubPageHeader title='商品详情' />

      <ScrollView className='pd-scroll' scrollY showScrollbar={false}>
        {/* Product Image Area */}
        <View className='pd-img' style={{ background: product.bg }}>
          <Text className='pd-img-emoji'>{product.emoji}</Text>
        </View>

        {/* Product Info Card */}
        <View className='pd-info'>
          <View className='pd-price-row'>
            <Text className='pd-price'>¥{product.price}</Text>
            {product.oldPrice > product.price && (
              <Text className='pd-old-price'>¥{product.oldPrice}</Text>
            )}
            <Text className='pd-sold'>已售 {product.sold}</Text>
          </View>
          <Text className='pd-name'>{product.name}</Text>
          {product.tags && product.tags.length > 0 && (
            <View className='pd-tags'>
              {product.tags.map((tag, i) => (
                <Text key={i} className='pd-tag'>
                  {tag}
                </Text>
              ))}
            </View>
          )}
        </View>

        {/* Product Description */}
        {product.description && (
          <View className='pd-section'>
            <Text className='pd-section-title'>商品描述</Text>
            <Text className='pd-desc-text'>{product.description}</Text>
          </View>
        )}

        {/* Default Description if none provided */}
        {!product.description && (
          <View className='pd-section'>
            <Text className='pd-section-title'>商品描述</Text>
            <Text className='pd-desc-text'>
              精选优质材料，专为宠物设计。安全无毒，让毛孩子用得开心，主人放心。
              本品已通过多项安全检测，适用于各类宠物日常使用。
            </Text>
          </View>
        )}

        {/* Community Review */}
        <View className='pd-section'>
          <View className='pd-section-header'>
            <Text className='pd-section-title'>用户评价</Text>
            <Text className='pd-section-more'>查看全部 ›</Text>
          </View>
          <View className='pd-review'>
            <View className='pd-review-user'>
              <Text className='pd-review-avatar'>{MOCK_REVIEW.userAvatar}</Text>
              <View className='pd-review-user-info'>
                <Text className='pd-review-name'>{MOCK_REVIEW.userName}</Text>
                {MOCK_REVIEW.purchased && (
                  <Text className='pd-review-badge'>已购买</Text>
                )}
              </View>
            </View>
            <Text className='pd-review-text'>{MOCK_REVIEW.text}</Text>
          </View>
        </View>

        <View className='pd-bottom-safe' />
      </ScrollView>

      {/* Bottom Action Bar */}
      <View className='pd-bar'>
        <View className='pd-bar-cart' onClick={handleCart}>
          <Text className='pd-bar-cart-icon'>🛒</Text>
          <Text className='pd-bar-cart-text'>购物车</Text>
        </View>
        <View className='pd-bar-btn pd-bar-btn-outline' onClick={handleAddToCart}>
          <Text>加入购物车</Text>
        </View>
        <View className='pd-bar-btn pd-bar-btn-primary' onClick={handleBuyNow}>
          <Text>立即购买</Text>
        </View>
      </View>
    </View>
  );
}
