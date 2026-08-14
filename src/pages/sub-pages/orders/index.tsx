import { useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import SubPageHeader from '@/components/SubPageHeader';
import EmptyState from '@/components/EmptyState';
import { useMarketStore } from '@/stores/useMarketStore';
import { useAppStore } from '@/stores/useAppStore';
import type { Order, OrderStatus } from '@/types';
import './index.scss';

const ORDER_TABS: { key: 'all' | OrderStatus; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待付款' },
  { key: 'paid', label: '待发货' },
  { key: 'shipped', label: '待收货' },
  { key: 'completed', label: '已完成' },
];

const STATUS_TEXT: Record<OrderStatus, string> = {
  pending: '待付款',
  paid: '待发货',
  shipped: '待收货',
  completed: '已完成',
  cancelled: '已取消',
};

function formatTime(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function OrdersPage() {
  const orders = useMarketStore((s) => s.orders);
  const updateOrderStatus = useMarketStore((s) => s.updateOrderStatus);
  const showToast = useAppStore((s) => s.showToast);
  const [activeTab, setActiveTab] = useState<'all' | OrderStatus>('all');

  const filteredOrders = activeTab === 'all'
    ? orders
    : orders.filter((o) => o.status === activeTab);

  const handlePay = (orderId: string) => {
    updateOrderStatus(orderId, 'paid');
    showToast('支付成功，等待发货');
  };

  const handleCancel = (orderId: string) => {
    updateOrderStatus(orderId, 'cancelled');
    showToast('订单已取消');
  };

  const handleConfirmReceipt = (orderId: string) => {
    updateOrderStatus(orderId, 'completed');
    showToast('交易完成 🎉');
  };

  const handleRemindShip = () => {
    showToast('已提醒商家尽快发货');
  };

  const renderActions = (order: Order) => {
    switch (order.status) {
      case 'pending':
        return (
          <View className='order-actions'>
            <View className='order-btn order-btn--ghost' onClick={() => handleCancel(order.id)}>
              <Text>取消订单</Text>
            </View>
            <View className='order-btn order-btn--primary' onClick={() => handlePay(order.id)}>
              <Text>去支付</Text>
            </View>
          </View>
        );
      case 'paid':
        return (
          <View className='order-actions'>
            <View className='order-btn order-btn--ghost' onClick={handleRemindShip}>
              <Text>提醒发货</Text>
            </View>
          </View>
        );
      case 'shipped':
        return (
          <View className='order-actions'>
            <View className='order-btn order-btn--primary' onClick={() => handleConfirmReceipt(order.id)}>
              <Text>确认收货</Text>
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View className='orders-page'>
      <SubPageHeader title='我的订单' />

      {/* 状态筛选 */}
      <View className='order-tabs'>
        {ORDER_TABS.map((tab) => (
          <View
            key={tab.key}
            className={`order-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            <Text>{tab.label}</Text>
          </View>
        ))}
      </View>

      {/* 订单列表 */}
      {filteredOrders.length === 0 ? (
        <View className='orders-body'>
          <EmptyState
            icon='📦'
            text={activeTab === 'all' ? '暂无订单，快去逛逛吧' : '该状态下暂无订单'}
          />
        </View>
      ) : (
        <ScrollView className='orders-body' scrollY>
          {filteredOrders.map((order) => (
            <View key={order.id} className='order-card'>
              <View className='order-card-head'>
                <Text className='order-no'>订单号 {order.orderNo}</Text>
                <Text className={`order-status order-status--${order.status}`}>
                  {STATUS_TEXT[order.status]}
                </Text>
              </View>

              {order.items.map((item) => (
                <View key={item.productId} className='order-item'>
                  <View className='order-item-img' style={{ background: item.bg }}>
                    <Text>{item.emoji}</Text>
                  </View>
                  <View className='order-item-info'>
                    <Text className='order-item-name'>{item.name}</Text>
                    <Text className='order-item-price'>¥{item.price}</Text>
                  </View>
                  <Text className='order-item-qty'>×{item.quantity}</Text>
                </View>
              ))}

              <View className='order-card-foot'>
                <Text className='order-time'>{formatTime(order.createdAt)}</Text>
                <View className='order-total'>
                  <Text className='order-total-label'>共{order.items.reduce((n, i) => n + i.quantity, 0)}件 合计</Text>
                  <Text className='order-total-price'>¥{order.totalPrice}</Text>
                </View>
              </View>

              {renderActions(order)}
            </View>
          ))}
          <View className='orders-bottom-safe' />
        </ScrollView>
      )}
    </View>
  );
}
