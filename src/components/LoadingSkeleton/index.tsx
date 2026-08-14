import { View } from '@tarojs/components';
import './index.scss';

interface LoadingSkeletonProps {
  count?: number;
}

export default function LoadingSkeleton({ count = 3 }: LoadingSkeletonProps) {
  return (
    <View className='skeleton-list'>
      {Array.from({ length: count }, (_, i) => (
        <View key={i} className='skeleton-card'>
          <View className='skeleton-line skeleton-line--short' />
          <View className='skeleton-line' />
          <View className='skeleton-line skeleton-line--long' />
        </View>
      ))}
    </View>
  );
}
