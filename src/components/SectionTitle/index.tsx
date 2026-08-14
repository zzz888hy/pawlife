import { View, Text } from '@tarojs/components';
import './index.scss';

interface SectionTitleProps {
  title: string;
  more?: string;
  onMore?: () => void;
}

export default function SectionTitle({ title, more, onMore }: SectionTitleProps) {
  return (
    <View className='section-title'>
      <Text className='section-title-text'>{title}</Text>
      {more && (
        <Text className='section-title-more' onClick={onMore}>
          {more}
        </Text>
      )}
    </View>
  );
}
