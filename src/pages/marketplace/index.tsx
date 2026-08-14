import { useEffect, useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useMarketStore } from '@/stores/useMarketStore';
import { useAppStore } from '@/stores/useAppStore';
import ProductCard from '@/components/ProductCard';
import SectionTitle from '@/components/SectionTitle';
import CustomTabBar from '@/components/CustomTabBar';
import './index.scss';

const MARKET_CATEGORIES = [
  { key: 'supplies', label: '用品', emoji: '🦴' },
  { key: 'food', label: '食品', emoji: '🍖' },
  { key: 'service', label: '服务', emoji: '✂️' },
  { key: 'fashion', label: '穿搭', emoji: '👕' },
  { key: 'memorial', label: '纪念', emoji: '🖼️' },
  { key: 'medical', label: '医疗', emoji: '💊' },
];

export default function MarketplacePage() {
  const { products, fetchProducts } = useMarketStore();
  const { isLoggedIn } = useAppStore();
  const [activeCategory, setActiveCategory] = useState('supplies');

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleCategoryTap = (key: string) => {
    setActiveCategory(key);
    fetchProducts(key);
  };

  const handleProductTap = (id: string) => {
    Taro.navigateTo({ url: `/pages/sub-pages/product-detail/index?id=${id}` });
  };

  const filteredProducts = products.filter(
    (p) => !activeCategory || p.category === activeCategory
  );

  return (
    <View className="marketplace-page">
      {/* Section Title */}
      <SectionTitle
        title="🐾 宠物生活馆"
        moreText="社区种草·商城变现"
      />

      {/* Market Banner */}
      <View className="market-banner">
        <View className="banner-content">
          <View className="banner-tag">新用户专享</View>
          <Text className="banner-title">首单立减 ¥10 · 全场包邮</Text>
        </View>
        <Text className="banner-gift">🎁</Text>
      </View>

      {/* Category Tabs */}
      <ScrollView className="market-cats" scrollX enableFlex>
        {MARKET_CATEGORIES.map((cat) => (
          <View
            key={cat.key}
            className={`cat-item ${activeCategory === cat.key ? 'active' : ''}`}
            onClick={() => handleCategoryTap(cat.key)}
          >
            <Text className="cat-emoji">{cat.emoji}</Text>
            <Text className="cat-label">{cat.label}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Product Grid */}
      <View className="product-grid">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={() => handleProductTap(product.id)}
            />
          ))
        ) : (
          <View className="empty-state">
            <Text className="empty-icon">📦</Text>
            <Text className="empty-text">暂无商品</Text>
          </View>
        )}
      </View>

      <CustomTabBar />
    </View>
  );
}
