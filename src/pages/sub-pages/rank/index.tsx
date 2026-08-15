import { View, Text, ScrollView } from '@tarojs/components';
import SubPageHeader from '@/components/SubPageHeader';
import { mockRankEntries, RankEntry } from '@/services/mock/rank.mock';
import './index.scss';

const MEDALS = ['🥇', '🥈', '🥉'];

const TREND_MAP: Record<RankEntry['trend'], { icon: string; text: string }> = {
  up: { icon: '↗', text: '上升' },
  down: { icon: '↘', text: '下降' },
  same: { icon: '→', text: '持平' },
};

export default function RankPage() {
  const top3 = mockRankEntries.slice(0, 3);
  const rest = mockRankEntries.slice(3);

  return (
    <View className='rank-page'>
      <SubPageHeader title='星光宠榜' dark />

      <ScrollView className='rank-scroll' scrollY showScrollbar={false}>
        {/* Hero */}
        <View className='rank-hero'>
          <Text className='rank-hero-icon'>🏆</Text>
          <Text className='rank-hero-title'>本月星光宠榜</Text>
          <Text className='rank-hero-sub'>按宠物获得的「摸摸」热度实时排名</Text>
        </View>

        {/* Top 3 Podium */}
        <View className='rank-podium'>
          {top3.map((entry, idx) => (
            <View
              key={entry.id}
              className={`rank-podium-item rank-podium-${idx + 1}`}
            >
              <View className='rank-podium-medal'>
                <Text>{MEDALS[idx]}</Text>
              </View>
              <View className='rank-podium-avatar' style={{ background: entry.bg }}>
                <Text>{entry.pet}</Text>
              </View>
              <Text className='rank-podium-name'>{entry.petName}</Text>
              <Text className='rank-podium-likes'>🐾 {entry.likes}</Text>
            </View>
          ))}
        </View>

        {/* Full List */}
        <View className='rank-list'>
          {rest.map((entry) => (
            <View key={entry.id} className='rank-item'>
              <Text className='rank-item-no'>{entry.rank}</Text>
              <View className='rank-item-avatar' style={{ background: entry.bg }}>
                <Text>{entry.pet}</Text>
              </View>
              <View className='rank-item-info'>
                <Text className='rank-item-name'>{entry.petName}</Text>
                <Text className='rank-item-meta'>{entry.breed} · {entry.owner}</Text>
              </View>
              <View className='rank-item-right'>
                <Text className='rank-item-likes'>🐾 {entry.likes}</Text>
                <Text className='rank-item-trend'>{TREND_MAP[entry.trend].icon}</Text>
              </View>
            </View>
          ))}
        </View>

        <View className='rank-bottom-safe' />
      </ScrollView>
    </View>
  );
}
