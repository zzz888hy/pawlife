import { useEffect, useState } from 'react';
import { View, Text, Textarea, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAppStore } from '@/stores/useAppStore';
import { useFeedStore } from '@/stores/useFeedStore';
import { usePetStore } from '@/stores/usePetStore';
import { useUserStore } from '@/stores/useUserStore';
import { chooseImage, uploadFile } from '@/services/cloud';
import { addUserCoins } from '@/services/auth';
import { isImageUrl } from '@/utils/format';
import './index.scss';

const TAG_OPTIONS = ['#金毛日常', '#猫咪日常', '#第一次', '#今日份快乐', '#最佳穿搭', '#饲养经验', '#宠物美食', '#健康记录'];

export default function CreatePostPage() {
  const [text, setText] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [selectedPetId, setSelectedPetId] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [publishing, setPublishing] = useState(false);
  const [aiCaption, setAiCaption] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const showToast = useAppStore((s) => s.showToast);
  const addFeed = useFeedStore((s) => s.addFeed);
  const addCoins = useUserStore((s) => s.addCoins);
  const pets = usePetStore((s) => s.pets);
  const fetchPets = usePetStore((s) => s.fetchPets);

  useEffect(() => {
    if (pets.length === 0) fetchPets();
  }, []);

  // 选中的宠物：优先按 id 找，找不到则回退到第一只
  const selectedPet = pets.find((p) => p.id === selectedPetId) || pets[0];

  // 选择图片
  const handleChooseImage = async () => {
    if (images.length >= 9) {
      showToast('最多选择9张图片');
      return;
    }
    const paths = await chooseImage(9 - images.length);
    if (paths.length > 0) {
      setImages([...images, ...paths]);
    }
  };

  // 移除图片
  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // AI 生成配文
  const handleAiCaption = async () => {
    if (!text && images.length === 0) {
      showToast('请先写点文字或上传照片');
      return;
    }
    setAiLoading(true);
    // Mock AI 配文生成
    const petName = selectedPet?.name || '宝贝';
    setTimeout(() => {
      const captions = [
        `${petName}今天太可爱了！忍不住分享～🐾`,
        `记录${petName}的美好时光 ✨`,
        `${petName}的第${Math.floor(Math.random() * 1000)}天陪伴 💛`,
        `今天又是被${petName}治愈的一天 🥰`,
        `${petName}的小日常，每一刻都值得记录 📸`,
      ];
      const caption = captions[Math.floor(Math.random() * captions.length)];
      setAiCaption(caption);
      setAiLoading(false);
      showToast('AI 配文已生成！点击可替换正文');
    }, 800);
  };

  // 使用 AI 配文
  const handleUseAiCaption = () => {
    setText(aiCaption);
    setAiCaption('');
  };

  // 切换标签
  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else if (selectedTags.length < 5) {
      setSelectedTags([...selectedTags, tag]);
    } else {
      showToast('最多选择5个标签');
    }
  };

  // 发布
  const handlePublish = async () => {
    if (!text.trim() && images.length === 0) {
      showToast('请写点文字或上传照片');
      return;
    }
    setPublishing(true);

    try {
      // 上传图片到云存储
      const uploadedUrls: string[] = [];
      for (let i = 0; i < images.length; i++) {
        const cloudPath = `feeds/${Date.now()}_${i}.jpg`;
        const url = await uploadFile(images[i], cloudPath);
        uploadedUrls.push(url);
      }

      // 创建动态
      const feedData = {
        petName: selectedPet?.name || '宝贝',
        petEmoji: selectedPet?.avatar || '🐾',
        breed: selectedPet?.breed || '',
        text: text.trim() || (uploadedUrls.length > 0 ? '分享照片 📸' : ''),
        tags: selectedTags,
        images: uploadedUrls,
        category: selectedTags.length > 0 ? selectedTags[0].replace('#', '') : '推荐',
      };

      addFeed(feedData);
      addCoins(5);                 // 本地即时 +5
      addUserCoins(5).catch(() => {});  // 后端持久化
      Taro.showToast({ title: '发布成功！+5 金币', icon: 'success' });
      setTimeout(() => Taro.navigateBack(), 1500);
    } catch (err) {
      showToast('发布失败，请重试');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <View className='create-post-page'>
      {/* 选择宠物 */}
      <View className='cp-section'>
        <Text className='cp-label'>选择宠物</Text>
        <View className='cp-pet-options'>
          {pets.length > 0 ? (
            pets.map((pet) => (
              <View
                key={pet.id}
                className={`cp-pet-btn ${selectedPet?.id === pet.id ? 'active' : ''}`}
                onClick={() => setSelectedPetId(pet.id)}
              >
                  {isImageUrl(pet.avatar) ? (
                    <Image className='cp-pet-avatar' src={pet.avatar} mode='aspectFill' />
                  ) : (
                    <Text>{pet.avatar}</Text>
                  )}
                  <Text>{pet.name}</Text>
              </View>
            ))
          ) : (
            <Text className='cp-no-pet'>暂无宠物，请先创建</Text>
          )}
        </View>
      </View>

      {/* 文本输入 */}
      <View className='cp-section'>
        <View className='cp-label-row'>
          <Text className='cp-label'>写点什么</Text>
          <View className='cp-ai-btn' onClick={handleAiCaption}>
            <Text>{aiLoading ? '⏳ AI思考中…' : '🤖 AI帮我写'}</Text>
          </View>
        </View>
        <Textarea
          className='cp-textarea'
          value={text}
          onInput={(e) => setText(e.detail.value)}
          placeholder={`记录${selectedPet?.name || '宝贝'}的精彩瞬间...`}
          placeholderClass='cp-placeholder'
          maxlength={500}
          autoHeight
        />
        {aiCaption && (
          <View className='cp-ai-caption' onClick={handleUseAiCaption}>
            <Text className='cp-ai-caption-label'>💡 AI 生成的配文（点击使用）：</Text>
            <Text className='cp-ai-caption-text'>{aiCaption}</Text>
          </View>
        )}
      </View>

      {/* 图片上传 */}
      <View className='cp-section'>
        <Text className='cp-label'>添加图片 ({images.length}/9)</Text>
        <View className='cp-images'>
          {images.map((img, i) => (
            <View key={i} className='cp-image-item'>
              <Image className='cp-image' src={img} mode='aspectFill' />
              <View className='cp-image-remove' onClick={() => handleRemoveImage(i)}>
                <Text>✕</Text>
              </View>
            </View>
          ))}
          {images.length < 9 && (
            <View className='cp-image-add' onClick={handleChooseImage}>
              <Text className='cp-add-icon'>+</Text>
              <Text className='cp-add-text'>拍照/相册</Text>
            </View>
          )}
        </View>
      </View>

      {/* 标签选择 */}
      <View className='cp-section'>
        <Text className='cp-label'>添加标签 ({selectedTags.length}/5)</Text>
        <View className='cp-tags'>
          {TAG_OPTIONS.map((tag) => (
            <View
              key={tag}
              className={`cp-tag ${selectedTags.includes(tag) ? 'active' : ''}`}
              onClick={() => handleToggleTag(tag)}
            >
              <Text>{tag}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 发布按钮 */}
      <View className='cp-footer'>
        <View className='cp-publish-btn' onClick={handlePublish}>
          <Text>{publishing ? '发布中…' : '📸 发布动态'}</Text>
        </View>
      </View>
    </View>
  );
}
