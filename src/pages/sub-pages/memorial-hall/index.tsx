import { useState } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import SubPageHeader from '@/components/SubPageHeader';
import { useAppStore } from '@/stores/useAppStore';
import { mockMemorialPets } from '@/services/mock/memorial.mock';
import type { MemorialPet } from '@/types';
import './index.scss';

export default function MemorialHallPage() {
  const { showToast } = useAppStore();
  const [pets] = useState<MemorialPet[]>(mockMemorialPets);

  const handleServicePurchase = () => {
    showToast('功能开发中，敬请期待');
  };

  const handleCardTap = (pet: MemorialPet) => {
    Taro.showToast({
      title: `${pet.name} 的纪念空间`,
      icon: 'none',
      duration: 1500,
    });
  };

  return (
    <View className='memorial-page'>
      {/* Dark Header */}
      <SubPageHeader title='星光纪念馆' dark />

      {/* Top Hero Section */}
      <View className='memorial-top'>
        <Text className='memorial-top-star'>✨</Text>
        <Text className='memorial-top-heading'>每一颗星，都曾是温暖的陪伴</Text>
        <Text className='memorial-top-subtitle'>
          在这里，为已逝的毛孩子点一盏不灭的灯{'\n'}它们的故事，将永远保存在数字星河之中
        </Text>
      </View>

      {/* Memorial Cards Grid */}
      <View className='memorial-grid'>
        {pets.map((pet) => (
          <View
            key={pet.id}
            className='mem-card'
            onClick={() => handleCardTap(pet)}
          >
            <View className='mem-card-emoji-wrap'>
              <Text className='mem-card-emoji'>{pet.emoji}</Text>
            </View>
            <Text className='mem-card-name'>{pet.name}</Text>
            <Text className='mem-card-date'>{pet.dateRange}</Text>
            <Text className='mem-card-message'>{pet.message}</Text>
          </View>
        ))}

        {/* Empty state: add new memorial card */}
        <View className='mem-card mem-card--add'>
          <View className='mem-card-add-icon'>
            <Text className='mem-card-add-plus'>+</Text>
          </View>
          <Text className='mem-card-add-text'>添加纪念</Text>
        </View>
      </View>

      {/* Memorial Service Banner */}
      <View className='mem-service'>
        <View className='mem-service-glow' />
        <View className='mem-service-content'>
          <View className='mem-service-header'>
            <Text className='mem-service-icon'>🕯️</Text>
            <Text className='mem-service-title'>永久纪念服务</Text>
          </View>
          <Text className='mem-service-desc'>
            为爱宠创建专属数字纪念馆，上传照片、故事与回忆，{'\n'}
            AI将为您生成永恒的纪念篇章。永久保存，可随时访问。
          </Text>
          <View className='mem-service-pricing'>
            <Text className='mem-service-price'>¥199</Text>
            <Text className='mem-service-original'>¥999</Text>
          </View>
          <View className='mem-service-btn' onClick={handleServicePurchase}>
            <Text className='mem-service-btn-text'>建立永久纪念</Text>
          </View>
        </View>
      </View>

      {/* Bottom safe area */}
      <View className='memorial-bottom-safe' />
    </View>
  );
}
