import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import SubPageHeader from '@/components/SubPageHeader';
import './index.scss';

export default function SettingsPage() {
  const menuItems = [
    { icon: '👤', title: '个人资料', action: () => Taro.showToast({ title: '功能开发中', icon: 'none' }) },
    { icon: '🔔', title: '消息通知', action: () => Taro.showToast({ title: '功能开发中', icon: 'none' }) },
    { icon: '🔒', title: '隐私设置', action: () => Taro.showToast({ title: '功能开发中', icon: 'none' }) },
    { icon: '🌐', title: '语言', value: '简体中文', action: () => Taro.showToast({ title: '功能开发中', icon: 'none' }) },
    { icon: '🗑️', title: '清除缓存', value: '12.3MB', action: () => Taro.showToast({ title: '已清除缓存', icon: 'success' }) },
    { icon: '📋', title: '用户协议', action: () => Taro.showToast({ title: '功能开发中', icon: 'none' }) },
    { icon: '📄', title: '隐私政策', action: () => Taro.showToast({ title: '功能开发中', icon: 'none' }) },
  ];

  return (
    <View className='settings-page'>
      <SubPageHeader title='设置' />
      <View className='settings-body'>
        <View className='settings-section'>
          {menuItems.map((item, i) => (
            <View key={i} className='settings-item' onClick={item.action}>
              <Text className='settings-item-icon'>{item.icon}</Text>
              <Text className='settings-item-title'>{item.title}</Text>
              {item.value && <Text className='settings-item-value'>{item.value}</Text>}
              <Text className='settings-item-arrow'>›</Text>
            </View>
          ))}
        </View>
        <View className='settings-footer'>
          <Text className='settings-version'>PawLife v1.0.0</Text>
        </View>
      </View>
    </View>
  );
}
