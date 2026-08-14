import { View, Text } from '@tarojs/components';
import type { Product } from '@/types';
import './index.scss';

interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
}

export default function ProductCard({ product, onClick }: ProductCardProps) {
  return (
    <View className='product-card' onClick={() => onClick(product)}>
      <View className='product-img' style={{ background: product.bg }}>
        <Text>{product.emoji}</Text>
      </View>
      <View className='product-info'>
        <Text className='product-name'>{product.name}</Text>
        <View className='product-price-row'>
          <Text className='product-price'>¥{product.price}</Text>
          <Text className='product-old-price'>¥{product.oldPrice}</Text>
        </View>
        <Text className='product-sold'>已售 {product.sold}</Text>
      </View>
    </View>
  );
}
