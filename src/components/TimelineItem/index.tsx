import { View, Text } from '@tarojs/components';
import type { TimelineEntry } from '@/types';
import './index.scss';

interface TimelineItemProps {
  item: TimelineEntry;
  isLast: boolean;
}

export default function TimelineItem({ item, isLast }: TimelineItemProps) {
  return (
    <View className='tl-item'>
      <View className='tl-dot-col'>
        <View className='tl-dot' />
        {!isLast && <View className='tl-line' />}
      </View>
      <View className='tl-content'>
        <Text className='tl-date'>{item.date}</Text>
        <Text className='tl-title'>{item.emoji} {item.title}</Text>
        <Text className='tl-desc'>{item.desc}</Text>
        <View className='tl-img'>
          <Text>{item.emoji}</Text>
        </View>
      </View>
    </View>
  );
}
