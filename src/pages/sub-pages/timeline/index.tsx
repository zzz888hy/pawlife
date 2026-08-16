import { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import SubPageHeader from '@/components/SubPageHeader';
import TimelineItem from '@/components/TimelineItem';
import { usePetStore } from '@/stores/usePetStore';
import './index.scss';

export default function TimelinePage() {
  const { pets, timeline, fetchPets } = usePetStore();
  const [activePetId, setActivePetId] = useState<string>('all');

  useEffect(() => {
    fetchPets();
  }, []);

  const filtered = useMemo(() => {
    const list =
      activePetId === 'all'
        ? timeline
        : timeline.filter((t) => t.petId === activePetId);
    return [...list].sort((a, b) => b.date.localeCompare(a.date));
  }, [timeline, activePetId]);

  return (
    <View className='timeline-page'>
      <SubPageHeader title='成长时间轴' />

      {/* Pet Filter */}
      <View className='timeline-filter'>
        <ScrollView className='timeline-filter-scroll' scrollX showScrollbar={false}>
          <View className='timeline-filter-inner'>
            <View
              className={`timeline-filter-chip ${activePetId === 'all' ? 'active' : ''}`}
              onClick={() => setActivePetId('all')}
            >
              <Text>全部</Text>
            </View>
            {pets.map((pet) => (
              <View
                key={pet.id}
                className={`timeline-filter-chip ${activePetId === pet.id ? 'active' : ''}`}
                onClick={() => setActivePetId(pet.id)}
              >
                <Text>{pet.avatar} {pet.name}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      <ScrollView className='timeline-scroll' scrollY showScrollbar={false}>
        <View className='timeline-list'>
          {filtered.length === 0 ? (
            <View className='timeline-empty'>
              <Text className='timeline-empty-icon'>📅</Text>
              <Text className='timeline-empty-text'>还没有成长记录</Text>
            </View>
          ) : (
            filtered.map((entry, idx) => (
              <TimelineItem
                key={entry.id}
                item={entry}
                isLast={idx === filtered.length - 1}
              />
            ))
          )}
        </View>
        <View className='timeline-bottom-safe' />
      </ScrollView>
    </View>
  );
}
