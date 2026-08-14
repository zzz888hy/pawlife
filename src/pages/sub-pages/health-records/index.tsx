import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import SubPageHeader from '@/components/SubPageHeader';
import './index.scss';

interface VaccineRecord {
  name: string;
  date: string;
  status: 'completed' | 'pending' | 'overdue';
}

interface DewormingRecord {
  name: string;
  date: string;
  type: string;
}

interface WeightRecord {
  month: string;
  weight: number;
}

const mockVaccines: VaccineRecord[] = [
  { name: '狂犬疫苗（年度）', date: '2025-01-15', status: 'completed' },
  { name: '犬瘟热-细小-副流感 六联', date: '2025-02-20', status: 'completed' },
  { name: '犬钩端螺旋体 二价', date: '2025-07-01', status: 'pending' },
];

const mockDeworming: DewormingRecord[] = [
  { name: '体内驱虫', date: '2025-06-10', type: '拜宠清' },
  { name: '体外驱虫', date: '2025-07-05', type: '福来恩滴剂' },
];

const mockWeights: WeightRecord[] = [
  { month: '4月', weight: 28.5 },
  { month: '5月', weight: 29.2 },
  { month: '6月', weight: 29.8 },
  { month: '7月', weight: 30.1 },
  { month: '8月', weight: 30.7 },
];

const maxWeight = Math.max(...mockWeights.map((w) => w.weight));

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  completed: { label: '已完成', color: '#52c41a' },
  pending: { label: '待接种', color: '#faad14' },
  overdue: { label: '已逾期', color: '#ff4d4f' },
};

export default function HealthRecordsPage() {
  const handleConsultAI = () => {
    Taro.navigateTo({ url: '/pages/sub-pages/ai-assistant/index' });
  };

  return (
    <View className='health-records-page'>
      <SubPageHeader title='健康档案' />

      <ScrollView className='hr-scroll' scrollY showScrollbar={false}>
        {/* Health Alert Banner */}
        <View className='hr-alert'>
          <Text className='hr-alert-icon'>⚠️</Text>
          <View className='hr-alert-content'>
            <Text className='hr-alert-title'>健康提醒</Text>
            <Text className='hr-alert-text'>豆豆已有6个月未体检，建议尽快安排一次全面体检</Text>
          </View>
          <Text className='hr-alert-arrow'>›</Text>
        </View>

        {/* Vaccine Records */}
        <View className='hr-card'>
          <View className='hr-card-header'>
            <Text className='hr-card-icon'>💉</Text>
            <Text className='hr-card-title'>疫苗接种记录</Text>
          </View>
          {mockVaccines.map((v, i) => (
            <View key={i} className='hr-record-row'>
              <View className='hr-record-info'>
                <Text className='hr-record-name'>{v.name}</Text>
                <Text className='hr-record-date'>{v.date}</Text>
              </View>
              <View
                className='hr-record-status'
                style={{ backgroundColor: STATUS_MAP[v.status].color + '1a' }}
              >
                <Text style={{ color: STATUS_MAP[v.status].color, fontSize: '24rpx' }}>
                  {STATUS_MAP[v.status].label}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Deworming Records */}
        <View className='hr-card'>
          <View className='hr-card-header'>
            <Text className='hr-card-icon'>💊</Text>
            <Text className='hr-card-title'>驱虫记录</Text>
          </View>
          {mockDeworming.map((d, i) => (
            <View key={i} className='hr-record-row'>
              <View className='hr-record-info'>
                <Text className='hr-record-name'>{d.name}</Text>
                <Text className='hr-record-sub'>{d.type}</Text>
              </View>
              <Text className='hr-record-date'>{d.date}</Text>
            </View>
          ))}
        </View>

        {/* Weight Chart */}
        <View className='hr-card'>
          <View className='hr-card-header'>
            <Text className='hr-card-icon'>⚖️</Text>
            <Text className='hr-card-title'>体重变化趋势</Text>
          </View>
          <View className='hr-weight-chart'>
            {mockWeights.map((w) => (
              <View key={w.month} className='hr-weight-bar-wrap'>
                <Text className='hr-weight-value'>{w.weight}kg</Text>
                <View className='hr-weight-bar-bg'>
                  <View
                    className='hr-weight-bar-fill'
                    style={{ height: `${(w.weight / maxWeight) * 100}%` }}
                  />
                </View>
                <Text className='hr-weight-month'>{w.month}</Text>
              </View>
            ))}
          </View>
          <View className='hr-ai-comment'>
            <Text className='hr-ai-comment-icon'>🤖</Text>
            <Text className='hr-ai-comment-text'>
              AI分析：豆豆近5个月体重稳定增长，从28.5kg增至30.7kg，增长趋势健康，符合金毛标准体重范围。建议保持当前饮食和运动习惯。
            </Text>
          </View>
        </View>

        {/* AI Health Assistant */}
        <View className='hr-card hr-ai-card'>
          <View className='hr-ai-card-header'>
            <Text className='hr-ai-card-icon'>🤖</Text>
            <View className='hr-ai-card-title-wrap'>
              <Text className='hr-ai-card-title'>AI 健康助手</Text>
              <Text className='hr-ai-card-desc'>
                基于豆豆的健康数据，AI 提供个性化的健康建议和预警提醒
              </Text>
            </View>
          </View>
          <View className='hr-ai-card-btn' onClick={handleConsultAI}>
            <Text>咨询AI医生</Text>
          </View>
        </View>

        <View className='hr-bottom-safe' />
      </ScrollView>
    </View>
  );
}
