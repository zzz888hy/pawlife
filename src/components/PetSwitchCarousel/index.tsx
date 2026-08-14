import { View, ScrollView, Text } from '@tarojs/components';
import type { Pet } from '@/types';
import './index.scss';

interface PetSwitchCarouselProps {
  pets: Pet[];
  activePetId: string | null;
  onSwitch: (petId: string) => void;
  onAdd: () => void;
}

export default function PetSwitchCarousel({
  pets,
  activePetId,
  onSwitch,
  onAdd,
}: PetSwitchCarouselProps) {
  return (
    <ScrollView className='pet-switch' scrollX showScrollbar={false}>
      <View className='pet-switch-inner'>
        {pets.map((pet) => (
          <View
            key={pet.id}
            className={`pet-switch-item ${activePetId === pet.id ? 'active' : ''}`}
            onClick={() => onSwitch(pet.id)}
          >
            <View className='pet-switch-avatar'><Text style={{ fontSize: '56rpx' }}>{pet.avatar}</Text></View>
            <Text className='pet-switch-name'>{pet.name}</Text>
          </View>
        ))}
        <View className='pet-switch-item pet-switch-add' onClick={onAdd}>
          <View className='pet-switch-avatar add'>
            <Text>＋</Text>
          </View>
          <Text className='pet-switch-name'>添加</Text>
        </View>
      </View>
    </ScrollView>
  );
}
