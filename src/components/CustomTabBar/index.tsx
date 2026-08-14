import { View, Text } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { useState } from 'react';
import './index.scss';

const TABS = [
  { key: 'hall', icon: '🏠', label: '大厅', path: '/pages/hall/index' },
  { key: 'pet-center', icon: '🐾', label: '宠物馆', path: '/pages/pet-center/index' },
  { key: 'post-modal', icon: '', label: '', path: '/pages/post-modal/index', isPost: true },
  { key: 'marketplace', icon: '🛍️', label: '集市', path: '/pages/marketplace/index' },
  { key: 'profile', icon: '👤', label: '我的', path: '/pages/profile/index' },
];

export default function CustomTabBar() {
  const [activeKey, setActiveKey] = useState('hall');

  useDidShow(() => {
    const pages = Taro.getCurrentPages();
    const currentPage = pages[pages.length - 1];
    if (currentPage) {
      const route = currentPage.route || '';
      for (const tab of TABS) {
        if (route.includes(tab.key)) {
          setActiveKey(tab.key);
          break;
        }
      }
    }
  });

  const handleTabClick = (tab: typeof TABS[0]) => {
    setActiveKey(tab.key);
    Taro.switchTab({ url: tab.path });
  };

  // 仅 H5 使用此组件；小程序端由 custom-tab-bar 原生机制渲染
  if (process.env.TARO_ENV !== 'h5') {
    return null;
  }

  return (
    <View className='custom-tabbar'>
      {TABS.map((tab) => {
        if (tab.isPost) {
          return (
            <View
              key={tab.key}
              className='tab-item tab-post'
              onClick={() => handleTabClick(tab)}
            >
              <View className='post-btn'>
                <Text>＋</Text>
              </View>
            </View>
          );
        }
        return (
          <View
            key={tab.key}
            className={`tab-item ${activeKey === tab.key ? 'active' : ''}`}
            onClick={() => handleTabClick(tab)}
          >
            <Text className='tab-icon'>{tab.icon}</Text>
            <Text className='tab-label'>{tab.label}</Text>
          </View>
        );
      })}
    </View>
  );
}
