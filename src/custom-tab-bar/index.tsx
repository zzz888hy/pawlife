import { View, Text, CoverView, CoverImage } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState, useEffect } from 'react';
import './index.scss';

const TABS = [
  { key: 'hall', icon: '🏠', label: '大厅', path: '/pages/hall/index' },
  { key: 'pet-center', icon: '🐾', label: '宠物馆', path: '/pages/pet-center/index' },
  { key: 'marketplace', icon: '🛍️', label: '集市', path: '/pages/marketplace/index' },
  { key: 'friends', icon: '🤝', label: '宠友广场', path: '/pages/friends/index' },
  { key: 'profile', icon: '👤', label: '我的', path: '/pages/profile/index' },
];

export default function CustomTabBar() {
  const [activeKey, setActiveKey] = useState('hall');

  useEffect(() => {
    const pages = Taro.getCurrentPages();
    if (pages.length > 0) {
      const current = pages[pages.length - 1];
      const route = current?.route || '';
      for (const tab of TABS) {
        if (route.includes(tab.key)) {
          setActiveKey(tab.key);
          break;
        }
      }
    }
  }, []);

  const handleTabClick = (tab: typeof TABS[0]) => {
    if (tab.key === activeKey) return;
    setActiveKey(tab.key);
    Taro.switchTab({ url: tab.path });
  };

  return (
    <View className='custom-tabbar'>
      {TABS.map((tab) => (
        <View
          key={tab.key}
          className={`tab-item ${activeKey === tab.key ? 'active' : ''}`}
          onClick={() => handleTabClick(tab)}
        >
          <Text className='tab-icon'>{tab.icon}</Text>
          <Text className='tab-label'>{tab.label}</Text>
        </View>
      ))}
    </View>
  );
}
