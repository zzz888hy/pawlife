import { View } from '@tarojs/components';
import './index.scss';

interface ProgressBarProps {
  total: number;
  current: number;
}

export default function ProgressBar({ total, current }: ProgressBarProps) {
  return (
    <View className='progress-bar'>
      {Array.from({ length: total }, (_, i) => (
        <View key={i} className={`progress-step ${i < current ? 'done' : ''}`} />
      ))}
    </View>
  );
}
