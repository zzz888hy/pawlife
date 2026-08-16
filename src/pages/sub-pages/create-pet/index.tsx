import { useEffect, useRef, useState } from 'react';
import { View, Text, Input, ScrollView, Image } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { usePetStore } from '@/stores/usePetStore';
import { useAppStore } from '@/stores/useAppStore';
import { chooseImage, uploadFile, toDataUrl } from '@/services/cloud';
import { isImageUrl } from '@/utils/format';
import SubPageHeader from '@/components/SubPageHeader';
import type { PetType } from '@/types';
import './index.scss';

const PET_TYPES: { type: PetType; emoji: string; label: string }[] = [
  { type: '狗', emoji: '🐕', label: '狗' },
  { type: '猫', emoji: '🐱', label: '猫' },
  { type: '兔', emoji: '🐰', label: '兔' },
  { type: '其他', emoji: '🐾', label: '其他' },
];

// 可选卡通头像
const AVATAR_EMOJIS = ['🐕', '🐶', '🐱', '🐈', '🐰', '🐇', '🐹', '🐢', '🐦', '🦜', '🐠', '🐾'];

interface FormData {
  name: string;
  type: PetType;
  breed: string;
  birthday: string;
  gender: '♂ 男孩' | '♀ 女孩';
  personality: string;
  hobbies: string;
  avatar: string;   // emoji 或图片路径（空 = 按类型默认）
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
  avatar: '',
  photoSlots: ['', '', '', '', '', ''],
};

export default function CreatePetPage() {
  const router = useRouter();
  const editId = (router.params?.petId as string) || '';
  const isEdit = !!editId;

  const pets = usePetStore((s) => s.pets);
  const createPet = usePetStore((s) => s.createPet);
  const updatePet = usePetStore((s) => s.updatePet);
  const fetchPets = usePetStore((s) => s.fetchPets);
  const showToast = useAppStore((s) => s.showToast);

  const editingPet = isEdit ? pets.find((p) => p.id === editId) : undefined;

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const prefillDone = useRef(false);
  const [avatarPreview, setAvatarPreview] = useState('');       // 拍照头像的 base64 预览
  const [photoPreviews, setPhotoPreviews] = useState<Record<number, string>>({});

  // 编辑模式：用宠物信息回填表单（若尚未加载则先拉取）
  useEffect(() => {
    if (!isEdit || prefillDone.current) return;
    if (editingPet) {
      setFormData({
        name: editingPet.name,
        type: editingPet.type,
        breed: editingPet.breed,
        birthday: editingPet.birthday,
        gender: editingPet.gender,
        personality: editingPet.personality,
        hobbies: editingPet.hobbies,
        avatar: editingPet.avatar || '',
        photoSlots: [...(editingPet.photos || []), '', '', '', '', '', ''].slice(0, 6),
      });
      prefillDone.current = true;
    } else {
      fetchPets();
    }
  }, [isEdit, editingPet, fetchPets]);

  const updateField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handlePhotoTap = async (index: number) => {
    if (formData.photoSlots[index]) {
      // Remove photo
      const newSlots = [...formData.photoSlots];
      newSlots[index] = '';
      updateField('photoSlots', newSlots);
      setPhotoPreviews((prev) => {
        const next = { ...prev };
        delete next[index];
        return next;
      });
      return;
    }
    // Choose real photo from camera/album
    const paths = await chooseImage(1);
    if (paths.length > 0) {
      const fp = paths[0];
      const newSlots = [...formData.photoSlots];
      newSlots[index] = fp;
      updateField('photoSlots', newSlots);
      const preview = await toDataUrl(fp);
      setPhotoPreviews((prev) => ({ ...prev, [index]: preview }));
    }
  };

  // 头像：拍照/相册上传
  const handleAvatarPhoto = async () => {
    const paths = await chooseImage(1);
    if (paths.length > 0) {
      const fp = paths[0];
      updateField('avatar', fp);
      setAvatarPreview(await toDataUrl(fp));
    }
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

  const handleFinish = async () => {
    const rawPhotos = formData.photoSlots.filter(Boolean);
    const typeEmoji = PET_TYPES.find((t) => t.type === formData.type)?.emoji || '🐾';
    let avatar = formData.avatar;
    if (!avatar) {
      avatar = typeEmoji; // 未选头像：按宠物类型默认
    } else if (isImageUrl(avatar) && !avatar.startsWith('cloud://')) {
      // 新上传的拍照头像：上传到云存储（已是 fileID 的跳过）
      try {
        avatar = await uploadFile(avatar, `avatars/${Date.now()}.jpg`);
      } catch {
        avatar = typeEmoji; // 上传失败回退到类型默认
      }
    }

    // 宠物照片：上传到云存储（已是 cloud:// 的跳过）
    const photos: string[] = [];
    for (let i = 0; i < rawPhotos.length; i++) {
      const p = rawPhotos[i];
      if (isImageUrl(p) && !p.startsWith('cloud://')) {
        try {
          photos.push(await uploadFile(p, `pets/${Date.now()}_${i}.jpg`));
        } catch {
          // 单张上传失败则跳过
        }
      } else {
        photos.push(p);
      }
    }

    const payload = {
      name: formData.name,
      type: formData.type,
      breed: formData.breed,
      birthday: formData.birthday,
      gender: formData.gender,
      personality: formData.personality,
      hobbies: formData.hobbies,
      avatar,
      photos,
    };

    if (isEdit) {
      await updatePet(editId, payload);
      showToast('✅ 宠物信息已更新');
    } else {
      await createPet(payload);
      showToast('🎉 宠物创建成功！');
    }
    setTimeout(() => {
      Taro.navigateBack();
    }, 600);
  };

  const progressPercent = ((currentStep + 1) / 3) * 100;

  return (
    <View className='create-pet-page'>
      <SubPageHeader title={isEdit ? '编辑宠物' : '创建宠物'} />

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
              <Text className='cp-label'>宠物头像</Text>
              <Text className='cp-hint'>可选卡通头像，或拍照上传</Text>
              <View className='cp-avatar-grid'>
                {AVATAR_EMOJIS.map((emoji) => (
                  <View
                    key={emoji}
                    className={`cp-avatar-item ${formData.avatar === emoji ? 'selected' : ''}`}
                    onClick={() => { updateField('avatar', emoji); setAvatarPreview(''); }}
                  >
                    <Text className='cp-avatar-emoji'>{emoji}</Text>
                  </View>
                ))}
                <View
                  className={`cp-avatar-item cp-avatar-photo ${isImageUrl(formData.avatar) ? 'selected' : ''}`}
                  onClick={handleAvatarPhoto}
                >
                  {isImageUrl(formData.avatar) ? (
                    <Image className='cp-avatar-img' src={avatarPreview || formData.avatar} mode='aspectFill' />
                  ) : (
                    <Text className='cp-avatar-camera'>📷</Text>
                  )}
                </View>
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
                {formData.photoSlots.map((photo, i) => (
                  <View
                    key={i}
                    className={`cp-photo-slot ${photo ? 'filled' : ''}`}
                    onClick={() => handlePhotoTap(i)}
                  >
                    {photo ? (
                      <Image className='cp-photo-img' src={photoPreviews[i] || photo} mode='aspectFill' />
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
                <Text>{isEdit ? '保存修改' : '✨ 创建完成'}</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
