import { View, ScrollView, Text } from '@tarojs/components';
import './index.scss';

interface CategoryTabsProps {
  items: string[];
  activeItem: string;
  onChange: (item: string) => void;
}

export default function CategoryTabs({ items, activeItem, onChange }: CategoryTabsProps) {
  return (
    <ScrollView className='category-tabs' scrollX showScrollbar={false}>
      <View className='category-tabs-inner'>
        {items.map((item) => (
          <View
            key={item}
            className={`category-tab ${activeItem === item ? 'active' : ''}`}
            onClick={() => onChange(item)}
          >
            <Text>{item}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
