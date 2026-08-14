import { useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAppStore } from '@/stores/useAppStore';
import SubPageHeader from '@/components/SubPageHeader';
import './index.scss';

type PlanType = 'monthly' | 'yearly';

interface Benefit {
  icon: string;
  title: string;
  desc: string;
}

const BENEFITS: Benefit[] = [
  { icon: '🧠', title: 'AI记忆模型', desc: '智能学习宠物习惯与偏好' },
  { icon: '📖', title: '无限宠物故事', desc: 'AI生成专属冒险故事' },
  { icon: '🎭', title: '宠物人格模型', desc: '深度分析宠物性格特征' },
  { icon: '📅', title: 'AI日记', desc: '自动记录每日精彩瞬间' },
  { icon: '💊', title: 'AI健康助手', desc: '个性化健康预警与建议' },
  { icon: '🎨', title: '虚拟装扮', desc: '解锁全部虚拟装扮道具' },
];

export default function VipMembershipPage() {
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('monthly');
  const showToast = useAppStore((s) => s.showToast);

  const handleActivate = () => {
    const price = selectedPlan === 'monthly' ? '19.9' : '199';
    const period = selectedPlan === 'monthly' ? '月' : '年';
    showToast(`正在开通 ${price}元/${period} 会员...`);
    setTimeout(() => {
      showToast('🎉 Pro会员开通成功！');
    }, 1500);
  };

  return (
    <View className='vip-membership-page'>
      <SubPageHeader title='Pro会员' dark />

      <ScrollView className='vip-scroll' scrollY showScrollbar={false}>
        {/* Hero Section */}
        <View className='vip-hero'>
          <Text className='vip-hero-icon'>👑</Text>
          <Text className='vip-hero-title'>PawLife Pro</Text>
          <Text className='vip-hero-sub'>解锁全部AI功能，给宠物最好的陪伴</Text>
          <View className='vip-hero-glow' />
        </View>

        {/* Plan Cards */}
        <View className='vip-plans'>
          <View
            className={`vip-plan ${selectedPlan === 'monthly' ? 'selected' : ''}`}
            onClick={() => setSelectedPlan('monthly')}
          >
            <View className='vip-plan-tag'>
              <Text className='vip-plan-tag-text'>超值</Text>
            </View>
            <Text className='vip-plan-period'>月度会员</Text>
            <View className='vip-plan-price-row'>
              <Text className='vip-plan-currency'>¥</Text>
              <Text className='vip-plan-price'>19.9</Text>
              <Text className='vip-plan-unit'>/月</Text>
            </View>
            <Text className='vip-plan-desc'>按月订阅，随时取消</Text>
          </View>

          <View
            className={`vip-plan ${selectedPlan === 'yearly' ? 'selected' : ''}`}
            onClick={() => setSelectedPlan('yearly')}
          >
            <View className='vip-plan-tag vip-plan-tag-save'>
              <Text className='vip-plan-tag-text'>省 ¥39.8</Text>
            </View>
            <Text className='vip-plan-period'>年度会员</Text>
            <View className='vip-plan-price-row'>
              <Text className='vip-plan-currency'>¥</Text>
              <Text className='vip-plan-price'>199</Text>
              <Text className='vip-plan-unit'>/年</Text>
            </View>
            <Text className='vip-plan-desc'>日均仅需 ¥0.55</Text>
          </View>
        </View>

        {/* Benefits List */}
        <View className='vip-benefits'>
          <Text className='vip-benefits-title'>Pro会员专属权益</Text>
          {BENEFITS.map((b) => (
            <View key={b.title} className='vip-benefit-item'>
              <Text className='vip-benefit-icon'>{b.icon}</Text>
              <View className='vip-benefit-info'>
                <Text className='vip-benefit-name'>{b.title}</Text>
                <Text className='vip-benefit-desc'>{b.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <View className='vip-bottom-safe' />
      </ScrollView>

      {/* Bottom CTA */}
      <View className='vip-bottom-bar'>
        <View className='vip-cta-btn' onClick={handleActivate}>
          <Text className='vip-cta-text'>
            立即开通 ¥{selectedPlan === 'monthly' ? '19.9' : '199'}/{selectedPlan === 'monthly' ? '月' : '年'}
          </Text>
        </View>
      </View>
    </View>
  );
}
