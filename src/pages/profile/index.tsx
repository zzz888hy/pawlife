import { useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useUserStore } from '@/stores/useUserStore';
import { useTaskStore } from '@/stores/useTaskStore';
import CustomTabBar from '@/components/CustomTabBar';
import './index.scss';

const MENU_SECTION_1 = [
  { key: 'vip', label: 'Pro会员', icon: '👑', url: '/pages/sub-pages/vip-membership/index' },
  { key: 'orders', label: '我的订单', icon: '📦', url: '/pages/sub-pages/orders/index' },
  { key: 'coins', label: '宠物金币', icon: '💰', url: '/pages/sub-pages/wallet/index' },
  { key: 'memorial', label: '星光纪念馆', icon: '🕯️', url: '/pages/sub-pages/memorial-hall/index' },
  { key: 'cert', label: '宠物身份认证', icon: '🪪', url: '/pages/sub-pages/pet-identity/index' },
];

const MENU_SECTION_2 = [
  { key: 'settings', label: '设置', icon: '⚙️', url: '/pages/sub-pages/settings/index' },
  { key: 'help', label: '帮助与反馈', icon: '💬', url: '' },
  { key: 'about', label: '关于PawLife', icon: 'ℹ️', url: '' },
];

const STATS = [
  { key: 'days', label: '陪伴天数', value: '0', unit: '天' },
  { key: 'records', label: '成长记录', value: '0', unit: '条' },
  { key: 'pets', label: '我的宠物', value: '0', unit: '只' },
  { key: 'coins', label: '宠物金币', value: '0', unit: '个' },
];

export default function ProfilePage() {
  const { userInfo } = useUserStore();
  const { tasks, fetchTasks } = useTaskStore();

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleMenuTap = (url: string, label: string) => {
    if (!url) {
      Taro.showToast({ title: `${label}开发中`, icon: 'none' });
      return;
    }
    Taro.navigateTo({ url });
  };

  const handleTaskTap = (task: any) => {
    if (task.completed) return;
    if (task.url) {
      Taro.navigateTo({ url: task.url });
    } else {
      Taro.showToast({ title: '任务进行中...', icon: 'none' });
    }
  };

  const handleVipCardTap = () => {
    Taro.navigateTo({ url: '/pages/sub-pages/vip-membership/index' });
  };

  return (
    <ScrollView className="profile-page" scrollY>
      {/* Header */}
      <View className="mine-header">
        <View className="header-avatar-wrap">
          <View className="header-avatar">
            <Text className="avatar-placeholder">
              {userInfo?.avatar ? '' : '🐱'}
            </Text>
          </View>
        </View>
        <Text className="header-name">{userInfo?.nickName || 'PawLife用户'}</Text>
        <Text className="header-id">ID: {userInfo?.id || 'PL000000'}</Text>
        <View className="header-companion">
          <Text className="companion-icon">⏱️</Text>
          <Text className="companion-text">
            已陪伴 {userInfo?.companionDays || 0} 天
          </Text>
        </View>
      </View>

      {/* VIP Card */}
      <View className="vip-card" onClick={handleVipCardTap}>
        <View className="vip-card-left">
          <Text className="vip-icon">👑</Text>
          <View className="vip-info">
            <Text className="vip-title">PawLife Pro 会员</Text>
            <Text className="vip-desc">解锁全部特权功能</Text>
          </View>
        </View>
        <View className="vip-card-right">
          <Text className="vip-price">¥19.9</Text>
          <Text className="vip-unit">/月</Text>
        </View>
      </View>

      {/* Body */}
      <View className="mine-body">
        {/* Stats Bar */}
        <View className="mine-stats">
          {STATS.map((stat) => (
            <View key={stat.key} className="stat-item">
              <Text className="stat-value">{stat.value}</Text>
              <Text className="stat-unit">{stat.unit}</Text>
              <Text className="stat-label">{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Task Card */}
        <View className="task-card">
          <View className="task-card-header">
            <View className="task-title-row">
              <Text className="task-title-icon">🎯</Text>
              <Text className="task-title">每日任务</Text>
            </View>
            <View className="task-coin-display">
              <Text className="coin-icon">🪙</Text>
              <Text className="coin-count">{userInfo?.coins || 0}</Text>
            </View>
          </View>
          <View className="task-list">
            {tasks && tasks.length > 0 ? (
              tasks.map((task) => (
                <View
                  key={task.id}
                  className={`task-item ${task.completed ? 'done' : ''}`}
                  onClick={() => handleTaskTap(task)}
                >
                  <View className="task-item-left">
                    <Text className="task-item-icon">{task.icon || '📋'}</Text>
                    <Text className="task-item-name">{task.name}</Text>
                  </View>
                  <View className="task-item-right">
                    <Text className="task-item-reward">+{task.reward || 0}</Text>
                    {task.completed ? (
                      <Text className="task-done-check">✓</Text>
                    ) : (
                      <View className="task-go-btn">去完成</View>
                    )}
                  </View>
                </View>
              ))
            ) : (
              <View className="task-empty">
                <Text className="task-empty-text">今日任务已完成，明天再来吧~</Text>
              </View>
            )}
          </View>
        </View>

        {/* Menu Section 1 */}
        <View className="mine-section">
          {MENU_SECTION_1.map((item, index) => (
            <View
              key={item.key}
              className={`menu-item ${index === MENU_SECTION_1.length - 1 ? 'last' : ''}`}
              onClick={() => handleMenuTap(item.url, item.label)}
            >
              <View className="menu-item-left">
                <Text className="menu-icon">{item.icon}</Text>
                <Text className="menu-label">{item.label}</Text>
              </View>
              <Text className="menu-arrow">›</Text>
            </View>
          ))}
        </View>

        {/* Menu Section 2 */}
        <View className="mine-section">
          {MENU_SECTION_2.map((item, index) => (
            <View
              key={item.key}
              className={`menu-item ${index === MENU_SECTION_2.length - 1 ? 'last' : ''}`}
              onClick={() => handleMenuTap(item.url, item.label)}
            >
              <View className="menu-item-left">
                <Text className="menu-icon">{item.icon}</Text>
                <Text className="menu-label">{item.label}</Text>
              </View>
              <Text className="menu-arrow">›</Text>
            </View>
          ))}
        </View>

        {/* Bottom Spacer */}
        <View className="bottom-spacer" />
      </View>

      <CustomTabBar />
    </ScrollView>
  );
}
