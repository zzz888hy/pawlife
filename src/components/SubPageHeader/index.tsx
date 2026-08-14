import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import './index.scss';

interface SubPageHeaderProps {
  title: string;
  dark?: boolean;
  onBack?: () => void;
}

export default function SubPageHeader({ title, dark = false, onBack }: SubPageHeaderProps) {
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      Taro.navigateBack();
    }
  };

  return (
    <View className={`sub-header ${dark ? 'sub-header--dark' : ''}`}>
      <View className='sub-header-back' onClick={handleBack}>
        <Text>‹</Text>
      </View>
      <Text className='sub-header-title'>{title}</Text>
      <View className='sub-header-spacer' />
    </View>
  );
}
