import { View, Text } from '@tarojs/components';
import SubPageHeader from '@/components/SubPageHeader';
import { useUserStore } from '@/stores/useUserStore';
import './index.scss';

export default function WalletPage() {
  const coins = useUserStore((s) => s.coins);

  return (
    <View className='wallet-page'>
      <SubPageHeader title='宠物金币' />
      <View className='wallet-body'>
        <View className='wallet-balance-card'>
          <Text className='wallet-label'>金币余额</Text>
          <View className='wallet-balance'>
            <Text className='wallet-coin-icon'>🪙</Text>
            <Text className='wallet-amount'>{coins}</Text>
          </View>
          <Text className='wallet-hint'>宠物金币可用于兑换商城优惠券和专属装扮</Text>
        </View>
        <View className='wallet-history'>
          <Text className='wallet-section-title'>金币记录</Text>
          <View className='wallet-record'>
            <Text className='wallet-record-icon'>📸</Text>
            <View className='wallet-record-info'>
              <Text className='wallet-record-name'>上传今日照片</Text>
              <Text className='wallet-record-date'>2024-07-19</Text>
            </View>
            <Text className='wallet-record-amount'>+10</Text>
          </View>
          <View className='wallet-record'>
            <Text className='wallet-record-icon'>🍽️</Text>
            <View className='wallet-record-info'>
              <Text className='wallet-record-name'>记录喂食</Text>
              <Text className='wallet-record-date'>2024-07-19</Text>
            </View>
            <Text className='wallet-record-amount'>+5</Text>
          </View>
          <View className='wallet-record'>
            <Text className='wallet-record-icon'>🚶</Text>
            <View className='wallet-record-info'>
              <Text className='wallet-record-name'>记录散步</Text>
              <Text className='wallet-record-date'>2024-07-18</Text>
            </View>
            <Text className='wallet-record-amount'>+5</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
