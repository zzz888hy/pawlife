import { useState } from 'react';
import { View, Text, Input, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { usePetStore } from '@/stores/usePetStore';
import { useAppStore } from '@/stores/useAppStore';
import SubPageHeader from '@/components/SubPageHeader';
import type { PetType } from '@/types';
import './index.scss';

const PET_TYPES: { type: PetType; emoji: string; label: string }[] = [
  { type: '狗', emoji: '🐕', label: '狗' },
  { type: '猫', emoji: '🐱', label: '猫' },
  { type: '兔', emoji: '🐰', label: '兔' },
  { type: '其他', emoji: '🐾', label: '其他' },
];

const PHOTO_EMOJIS = ['🐶', '🐱', '🐾', '🌟', '💖', '🎉', '🌸', '🦴', '🎾', '🏠', '☀️', '🌈'];

interface FormData {
  name: string;
  type: PetType;
  breed: string;
  birthday: string;
  gender: '♂ 男孩' | '♀ 女孩';
  personality: string;
  hobbies: string;
  photoSlots: string[];
}

const INITIAL_FORM: FormData = {
  name: '',
  type: '狗',
  breed: '',
  birthday: '',
  gender: '♂ 男孩',
  personality: '',
  hobbies: '',
  photoSlots: ['', '', '', '', '', ''],
};

export default function CreatePetPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const createPet = usePetStore((s) => s.createPet);
  const showToast = useAppStore((s) => s.showToast);

  const updateField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handlePhotoTap = (index: number) => {
    if (formData.photoSlots[index]) {
      // Remove photo
      const newSlots = [...formData.photoSlots];
      newSlots[index] = '';
      updateField('photoSlots', newSlots);
      return;
    }
    // Fill with random emoji
    const randomEmoji = PHOTO_EMOJIS[Math.floor(Math.random() * PHOTO_EMOJIS.length)];
    const newSlots = [...formData.photoSlots];
    newSlots[index] = randomEmoji;
    updateField('photoSlots', newSlots);
  };

  const handleNext = () => {
    if (currentStep === 0) {
      if (!formData.name.trim()) {
        Taro.showToast({ title: '请输入宠物名字', icon: 'none' });
        return;
      }
      if (!formData.breed.trim()) {
        Taro.showToast({ title: '请输入品种', icon: 'none' });
        return;
      }
    }
    if (currentStep === 1) {
      if (!formData.birthday) {
        Taro.showToast({ title: '请选择生日', icon: 'none' });
        return;
      }
    }
    if (currentStep < 2) {
      setCurrentStep((s) => s + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  };

  const handleFinish = () => {
    const photos = formData.photoSlots.filter(Boolean);
    createPet({
      name: formData.name,
      type: formData.type,
      breed: formData.breed,
      birthday: formData.birthday,
      gender: formData.gender,
      personality: formData.personality,
      hobbies: formData.hobbies,
      photos,
    });
    showToast('🎉 宠物创建成功！');
    setTimeout(() => {
      Taro.navigateBack();
    }, 600);
  };

  const progressPercent = ((currentStep + 1) / 3) * 100;

  return (
    <View className='create-pet-page'>
      <SubPageHeader title='创建宠物' />

      {/* Progress Bar */}
      <View className='cp-progress-wrap'>
        <View className='cp-progress-bar'>
          <View className='cp-progress-fill' style={{ width: `${progressPercent}%` }} />
        </View>
        <View className='cp-progress-steps'>
          {['基础信息', '详细资料', '照片上传'].map((label, i) => (
            <View key={label} className={`cp-step-label ${i <= currentStep ? 'active' : ''}`}>
              <View className={`cp-step-dot ${i <= currentStep ? 'filled' : ''}`}>
                {i < currentStep ? (
                  <Text className='cp-step-check'>✓</Text>
                ) : (
                  <Text>{i + 1}</Text>
                )}
              </View>
              <Text className='cp-step-text'>{label}</Text>
            </View>
          ))}
        </View>
      </View>

      <ScrollView className='cp-form-scroll' scrollY showScrollbar={false}>
        {/* Step 1: Basic Info */}
        {currentStep === 0 && (
          <View className='cp-step-content'>
            <View className='cp-form-group'>
              <Text className='cp-label'>宠物名字</Text>
              <Input
                className='cp-input'
                placeholder='给你的宝贝起个名字'
                placeholderClass='cp-placeholder'
                value={formData.name}
                onInput={(e) => updateField('name', e.detail.value)}
                maxlength={20}
              />
            </View>

            <View className='cp-form-group'>
              <Text className='cp-label'>宠物类型</Text>
              <View className='cp-type-grid'>
                {PET_TYPES.map((item) => (
                  <View
                    key={item.type}
                    className={`cp-type-item ${formData.type === item.type ? 'selected' : ''}`}
                    onClick={() => updateField('type', item.type)}
                  >
                    <Text className='cp-type-emoji'>{item.emoji}</Text>
                    <Text className='cp-type-label'>{item.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View className='cp-form-group'>
              <Text className='cp-label'>品种</Text>
              <Input
                className='cp-input'
                placeholder='例如：金毛、橘猫、垂耳兔'
                placeholderClass='cp-placeholder'
                value={formData.breed}
                onInput={(e) => updateField('breed', e.detail.value)}
                maxlength={20}
              />
            </View>

            <View className='cp-btn-wrap'>
              <View className='cp-btn cp-btn-primary' onClick={handleNext}>
                <Text>下一步</Text>
              </View>
            </View>
          </View>
        )}

        {/* Step 2: Details */}
        {currentStep === 1 && (
          <View className='cp-step-content'>
            <View className='cp-form-group'>
              <Text className='cp-label'>生日</Text>
              <Input
                className='cp-input'
                placeholder='选择日期，如：2024-03-15'
                placeholderClass='cp-placeholder'
                value={formData.birthday}
                onInput={(e) => updateField('birthday', e.detail.value)}
              />
              <Text className='cp-hint'>格式：YYYY-MM-DD</Text>
            </View>

            <View className='cp-form-group'>
              <Text className='cp-label'>性别</Text>
              <View className='cp-gender-row'>
                {(['♂ 男孩', '♀ 女孩'] as const).map((g) => (
                  <View
                    key={g}
                    className={`cp-gender-item ${formData.gender === g ? 'selected' : ''}`}
                    onClick={() => updateField('gender', g)}
                  >
                    <Text>{g}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View className='cp-form-group'>
              <Text className='cp-label'>性格特点</Text>
              <Input
                className='cp-input'
                placeholder='例如：活泼、粘人、贪吃'
                placeholderClass='cp-placeholder'
                value={formData.personality}
                onInput={(e) => updateField('personality', e.detail.value)}
                maxlength={50}
              />
            </View>

            <View className='cp-form-group'>
              <Text className='cp-label'>兴趣爱好</Text>
              <Input
                className='cp-input'
                placeholder='例如：玩球、散步、睡觉'
                placeholderClass='cp-placeholder'
                value={formData.hobbies}
                onInput={(e) => updateField('hobbies', e.detail.value)}
                maxlength={50}
              />
            </View>

            <View className='cp-btn-wrap cp-btn-wrap-double'>
              <View className='cp-btn cp-btn-outline' onClick={handlePrev}>
                <Text>上一步</Text>
              </View>
              <View className='cp-btn cp-btn-primary' onClick={handleNext}>
                <Text>下一步</Text>
              </View>
            </View>
          </View>
        )}

        {/* Step 3: Photos */}
        {currentStep === 2 && (
          <View className='cp-step-content'>
            <View className='cp-form-group'>
              <Text className='cp-label'>宠物照片</Text>
              <Text className='cp-hint'>点击空格添加照片（最多6张）</Text>
              <View className='cp-photo-grid'>
                {formData.photoSlots.map((emoji, i) => (
                  <View
                    key={i}
                    className={`cp-photo-slot ${emoji ? 'filled' : ''}`}
                    onClick={() => handlePhotoTap(i)}
                  >
                    {emoji ? (
                      <Text className='cp-photo-emoji'>{emoji}</Text>
                    ) : (
                      <Text className='cp-photo-plus'>+</Text>
                    )}
                  </View>
                ))}
              </View>
            </View>

            <View className='cp-ai-tip'>
              <Text className='cp-ai-tip-icon'>🤖</Text>
              <View className='cp-ai-tip-content'>
                <Text className='cp-ai-tip-title'>AI 智能生成提示</Text>
                <Text className='cp-ai-tip-text'>
                  添加真实照片后，AI 将自动为你的宠物生成专属故事和人格模型，让每一次互动都独一无二
                </Text>
              </View>
            </View>

            <View className='cp-btn-wrap cp-btn-wrap-double'>
              <View className='cp-btn cp-btn-outline' onClick={handlePrev}>
                <Text>上一步</Text>
              </View>
              <View className='cp-btn cp-btn-primary' onClick={handleFinish}>
                <Text>✨ 创建完成</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
