import { View, Text } from '@tarojs/components';
import SubPageHeader from '@/components/SubPageHeader';
import EmptyState from '@/components/EmptyState';
import './index.scss';

export default function OrdersPage() {
  return (
    <View className='orders-page'>
      <SubPageHeader title='我的订单' />
      <View className='orders-body'>
        <EmptyState icon='📦' text='暂无订单' />
        <View className='order-tabs'>
          <Text className='order-tab active'>全部</Text>
          <Text className='order-tab'>待付款</Text>
          <Text className='order-tab'>待发货</Text>
          <Text className='order-tab'>待收货</Text>
          <Text className='order-tab'>已完成</Text>
        </View>
      </View>
    </View>
  );
}
