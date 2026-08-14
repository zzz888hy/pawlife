import { useState } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import './index.scss';

export default function SplashPage() {
  const [animating, setAnimating] = useState(true);

  const handleEnter = () => {
    setAnimating(false);
    Taro.switchTab({ url: '/pages/hall/index' });
  };

  return (
    <View className='splash'>
      <View className={`splash-content ${animating ? 'pop-in' : ''}`}>
        <Text className='splash-logo'>🐾</Text>
        <Text className='splash-title'>PawLife</Text>
        <Text className='splash-slogan'>
          让每一只宠物，都拥有一个永远的家{'\n'}AI时代宠物数字生命空间
        </Text>
        <View className='splash-btn' onClick={handleEnter}>
          <Text>开启宠物数字生命</Text>
        </View>
        <Text className='splash-version'>MVP v1.0 · 微信小程序</Text>
      </View>
    </View>
  );
}
