import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import SubPageHeader from '@/components/SubPageHeader';
import './index.scss';

export default function PetIdentityPage() {
  return (
    <View className='identity-page'>
      <SubPageHeader title='宠物身份认证' />
      <View className='identity-body'>
        <View className='identity-card'>
          <Text className='identity-icon'>🪪</Text>
          <Text className='identity-title'>宠物数字身份认证</Text>
          <Text className='identity-desc'>
            为你的宠物建立官方数字身份，包含品种、血统、疫苗记录等信息。
            认证后可享受更多社区权益。
          </Text>
        </View>
        <View className='identity-status'>
          <Text className='identity-status-label'>认证状态</Text>
          <Text className='identity-status-value pending'>未认证</Text>
        </View>
        <View className='identity-btn' onClick={() => Taro.showToast({ title: '认证功能开发中', icon: 'none' })}>
          <Text>申请认证</Text>
        </View>
      </View>
    </View>
  );
}
