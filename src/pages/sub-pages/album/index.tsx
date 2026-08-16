import { useState } from 'react';
import { View, Text, ScrollView, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import SubPageHeader from '@/components/SubPageHeader';
import { useAppStore } from '@/stores/useAppStore';
import { chooseImage } from '@/services/cloud';
import './index.scss';

const MOCK_TAGS = ['萌宠日常', '户外运动', '美食时刻', '睡姿大赏', '节日装扮', '玩伴互动', '成长记录', '搞笑瞬间'];

export default function AlbumPage() {
  const [photos, setPhotos] = useState<string[]>([]);
  const [aiTags, setAiTags] = useState<string[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const showToast = useAppStore((s) => s.showToast);

  const handleAddPhotos = async () => {
    const paths = await chooseImage(9 - photos.length);
    if (paths.length > 0) {
      setPhotos([...photos, ...paths]);
    }
  };

  const handleRemove = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleAiOrganize = () => {
    if (photos.length === 0) {
      showToast('请先添加照片');
      return;
    }
    setAiLoading(true);
    setTimeout(() => {
      const shuffled = [...MOCK_TAGS].sort(() => Math.random() - 0.5);
      setAiTags(shuffled.slice(0, 3));
      setAiLoading(false);
      showToast('AI 整理完成！');
    }, 1200);
  };

  const handleSave = () => {
    if (photos.length === 0) {
      showToast('请先添加照片');
      return;
    }
    showToast('已保存到相册');
    setTimeout(() => {
      Taro.navigateBack();
    }, 800);
  };

  return (
    <View className='album-page'>
      <SubPageHeader title='上传相册' />

      <ScrollView className='album-scroll' scrollY showScrollbar={false}>
        {/* Photo Grid */}
        <View className='album-section'>
          <Text className='album-label'>我的照片 ({photos.length}/9)</Text>
          <View className='album-grid'>
            {photos.map((photo, i) => (
              <View key={i} className='album-photo'>
                <Image className='album-photo-img' src={photo} mode='aspectFill' />
                <View className='album-photo-remove' onClick={() => handleRemove(i)}>
                  <Text>✕</Text>
                </View>
              </View>
            ))}
            {photos.length < 9 && (
              <View className='album-add' onClick={handleAddPhotos}>
                <Text className='album-add-plus'>+</Text>
                <Text className='album-add-text'>拍照/相册</Text>
              </View>
            )}
          </View>
        </View>

        {/* AI Organize */}
        <View className='album-section'>
          <View className='album-ai-card'>
            <View className='album-ai-head'>
              <Text className='album-ai-icon'>🤖</Text>
              <View className='album-ai-info'>
                <Text className='album-ai-title'>AI 智能整理</Text>
                <Text className='album-ai-desc'>自动识别照片内容，生成标签并归档</Text>
              </View>
            </View>
            {aiTags.length > 0 && (
              <View className='album-ai-tags'>
                {aiTags.map((tag) => (
                  <Text key={tag} className='album-ai-tag'>#{tag}</Text>
                ))}
              </View>
            )}
            <View className='album-ai-btn' onClick={handleAiOrganize}>
              <Text>{aiLoading ? '⏳ AI 整理中…' : '✨ AI 智能整理'}</Text>
            </View>
          </View>
        </View>

        {/* Save */}
        <View className='album-footer'>
          <View className='album-save-btn' onClick={handleSave}>
            <Text>保存到相册</Text>
          </View>
        </View>

        <View className='album-bottom-safe' />
      </ScrollView>
    </View>
  );
}
