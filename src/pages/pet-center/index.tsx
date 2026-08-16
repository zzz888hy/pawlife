import { useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { usePetStore } from '@/stores/usePetStore';
import { useAppStore } from '@/stores/useAppStore';
import TimelineItem from '@/components/TimelineItem';
import SectionTitle from '@/components/SectionTitle';
import CustomTabBar from '@/components/CustomTabBar';
import type { Pet } from '@/types';
import './index.scss';

const QUICK_GRID = [
  { icon: '🤖', label: 'AI助手', url: '/pages/sub-pages/ai-assistant/index' },
  { icon: '📖', label: '宠物故事', url: '/pages/sub-pages/pet-story/index' },
  { icon: '💊', label: '健康档案', url: '/pages/sub-pages/health-records/index' },
  { icon: '🕯️', label: '星光纪念馆', url: '/pages/sub-pages/memorial-hall/index' },
];

export default function PetCenterPage() {
  const { pets, currentPetId, timeline, loading, fetchPets, switchPet, getCurrentPet } =
    usePetStore();
  const showToast = useAppStore((s) => s.showToast);

  useEffect(() => {
    fetchPets();
  }, []);

  const currentPet: Pet | null = getCurrentPet();

  const handleSwitchPet = (petId: string) => {
    switchPet(petId);
    showToast('已切换宠物');
  };

  const handleAddPet = () => {
    Taro.navigateTo({ url: '/pages/sub-pages/create-pet/index' });
  };

  const handleEditProfile = () => {
    if (currentPet) {
      Taro.navigateTo({ url: `/pages/sub-pages/pet-identity/index?petId=${currentPet.id}` });
    }
  };

  const handleQuickAction = (item: (typeof QUICK_GRID)[number]) => {
    Taro.navigateTo({ url: item.url });
  };

  const handleViewAllTimeline = () => {
    Taro.navigateTo({ url: '/pages/sub-pages/timeline/index' });
  };

  if (loading && pets.length === 0) {
    return (
      <View className='pet-center-page'>
        <View className='pet-center-loading'>
          <Text>加载中...</Text>
        </View>
        <CustomTabBar />
      </View>
    );
  }

  if (!currentPet) {
    return (
      <View className='pet-center-page'>
        <View className='pet-center-empty'>
          <Text className='pet-center-empty-icon'>🐾</Text>
          <Text className='pet-center-empty-text'>还没有添加宠物</Text>
          <View className='pet-center-add-btn' onClick={handleAddPet}>
            <Text>添加我的宠物</Text>
          </View>
        </View>
        <CustomTabBar />
      </View>
    );
  }

  const currentTimeline = timeline.filter((t) => t.petId === currentPet.id).slice(0, 3);

  return (
    <View className='pet-center-page'>
      <ScrollView className='pet-center-scroll' scrollY showScrollbar={false}>
        {/* Hero Section */}
        <View className='pet-hero'>
          <View className='pet-hero-bg'>
            <Text className='pet-hero-bg-emoji'>🐾</Text>
            <Text className='pet-hero-bg-emoji'>🌿</Text>
            <Text className='pet-hero-bg-emoji'>✨</Text>
            <Text className='pet-hero-bg-emoji'>🌸</Text>
            <Text className='pet-hero-bg-emoji'>🐾</Text>
          </View>
          <View className='pet-hero-content'>
            <View className='pet-hero-avatar-wrap'>
              <View className='pet-hero-avatar'>
                <Text className='pet-hero-avatar-emoji'>{currentPet.avatar}</Text>
              </View>
            </View>
            <View className='pet-hero-info'>
              <Text className='pet-hero-name'>{currentPet.name}</Text>
              <Text className='pet-hero-breed'>
                {currentPet.breed} · {currentPet.age}岁
              </Text>
            </View>
            <View className='pet-hero-edit' onClick={handleEditProfile}>
              <Text className='pet-hero-edit-text'>编辑档案 ✏️</Text>
            </View>
          </View>
        </View>

        {/* Pet Switch Carousel */}
        <View className='pet-switch'>
          <ScrollView className='pet-switch-scroll' scrollX showScrollbar={false}>
            <View className='pet-switch-inner'>
              {pets.map((pet) => (
                <View
                  key={pet.id}
                  className={`pet-switch-item ${currentPetId === pet.id ? 'active' : ''}`}
                  onClick={() => handleSwitchPet(pet.id)}
                >
                  <View
                    className='pet-switch-avatar'
                    style={{
                      background:
                        currentPetId === pet.id
                          ? 'linear-gradient(135deg, #FF7A59, #FF9A76)'
                          : '#F0ECE6',
                    }}
                  >
                    <Text className='pet-switch-avatar-emoji'>{pet.avatar}</Text>
                  </View>
                  <Text
                    className={`pet-switch-name ${currentPetId === pet.id ? 'active' : ''}`}
                  >
                    {pet.name}
                  </Text>
                </View>
              ))}
              {/* Add Pet Button */}
              <View className='pet-switch-item' onClick={handleAddPet}>
                <View className='pet-switch-avatar pet-switch-add'>
                  <Text className='pet-switch-add-icon'>+</Text>
                </View>
                <Text className='pet-switch-name'>添加</Text>
              </View>
            </View>
          </ScrollView>
        </View>

        {/* Pet Profile Card */}
        <View className='pet-profile'>
          <View className='pet-profile-row'>
            <Text className='pet-profile-label'>品种</Text>
            <Text className='pet-profile-value highlight'>{currentPet.breed}</Text>
          </View>
          <View className='pet-profile-row'>
            <Text className='pet-profile-label'>生日</Text>
            <Text className='pet-profile-value'>{currentPet.birthday}</Text>
          </View>
          <View className='pet-profile-row'>
            <Text className='pet-profile-label'>性别</Text>
            <Text className='pet-profile-value'>{currentPet.gender}</Text>
          </View>
          <View className='pet-profile-row'>
            <Text className='pet-profile-label'>性格</Text>
            <Text className='pet-profile-value'>{currentPet.personality}</Text>
          </View>
          <View className='pet-profile-row'>
            <Text className='pet-profile-label'>爱好</Text>
            <Text className='pet-profile-value'>{currentPet.hobbies}</Text>
          </View>
        </View>

        {/* Quick Grid */}
        <View className='quick-grid'>
          {QUICK_GRID.map((item) => (
            <View
              key={item.label}
              className='quick-grid-item'
              onClick={() => handleQuickAction(item)}
            >
              <View className='quick-grid-icon-wrap'>
                <Text className='quick-grid-icon'>{item.icon}</Text>
              </View>
              <Text className='quick-grid-label'>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* Timeline Section */}
        <View className='timeline-section'>
          <SectionTitle title='成长时间轴' more='查看全部' onMore={handleViewAllTimeline} />
          <View className='timeline-list'>
            {currentTimeline.map((entry, idx) => (
              <TimelineItem
                key={entry.id}
                item={entry}
                isLast={idx === currentTimeline.length - 1}
              />
            ))}
          </View>
        </View>

        {/* Bottom Safe Area */}
        <View className='pet-bottom-safe' />
      </ScrollView>

      <CustomTabBar />
    </View>
  );
}
