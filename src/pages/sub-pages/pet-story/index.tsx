import { useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAppStore } from '@/stores/useAppStore';
import SubPageHeader from '@/components/SubPageHeader';
import './index.scss';

const STYLES = ['温情回忆', '童话冒险', '日记体', '搞笑日常', '第一人称'] as const;

type StoryStyle = (typeof STYLES)[number];

const STORY_CONTENT = `那是一个阳光明媚的午后，门口突然传来一阵轻轻的挠门声。

打开门的瞬间，一只毛茸茸的小金毛正仰着头，用湿漉漉的大眼睛看着我，尾巴欢快地摇成了"直升机"。

那时候的豆豆还只有巴掌大，走路摇摇晃晃，每摔一跤都会回头看看我有没有跟上。它喜欢追着自己的尾巴转圈，转晕了就趴在地上，吐着粉红色的小舌头喘气。

第一天晚上，豆豆睡在临时搭的小窝里，半夜却偷偷爬到了床边。我假装睡着，感觉到一团毛茸茸的小家伙悄悄蜷缩在脚边，还轻轻叹了口气——像是在说：新家还不错嘛。

从那一天起，我再也没有孤单过。`;

export default function PetStoryPage() {
  const [selectedStyle, setSelectedStyle] = useState<StoryStyle>('温情回忆');
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const showToast = useAppStore((s) => s.showToast);

  const handleGenerate = () => {
    if (loading) return;
    setLoading(true);
    Taro.showToast({ title: 'AI正在创作中...', icon: 'loading', duration: 2000 });
    setTimeout(() => {
      setLoading(false);
      setShowPreview(true);
      showToast('故事生成完成！');
    }, 2000);
  };

  const handleSave = () => {
    showToast('故事已保存到日记本');
  };

  const handleShare = () => {
    showToast('分享功能开发中～');
  };

  return (
    <View className='pet-story-page'>
      <SubPageHeader title='AI宠物故事' />

      <ScrollView className='ps-scroll' scrollY showScrollbar={false}>
        {/* Story Header */}
        <View className='ps-head'>
          <Text className='ps-head-icon'>📖</Text>
          <Text className='ps-head-title'>生成豆豆的故事</Text>
          <Text className='ps-head-sub'>基于 826 天的生活数据，AI 为你创作独一无二的宠物故事</Text>
        </View>

        {/* Style Selector */}
        <View className='ps-gen-card'>
          <Text className='ps-gen-title'>选择故事风格</Text>
          <View className='ps-styles'>
            {STYLES.map((style) => (
              <View
                key={style}
                className={`ps-style-chip ${selectedStyle === style ? 'selected' : ''}`}
                onClick={() => setSelectedStyle(style)}
              >
                <Text>{style}</Text>
              </View>
            ))}
          </View>

          <View className='ps-gen-btn' onClick={handleGenerate}>
            <Text className='ps-gen-btn-text'>
              {loading ? '✨ 生成中...' : '✨ 生成故事'}
            </Text>
          </View>
        </View>

        {/* Story Preview */}
        {showPreview && (
          <View className='ps-preview'>
            <View className='ps-preview-header'>
              <Text className='ps-preview-icon'>📖</Text>
              <Text className='ps-preview-title'>《豆豆来到家的第一天》</Text>
              <Text className='ps-preview-style-badge'>{selectedStyle}</Text>
            </View>
            <View className='ps-preview-body'>
              {STORY_CONTENT.split('\n\n').map((paragraph, i) => (
                <Text key={i} className='ps-preview-paragraph'>
                  {paragraph.trim()}
                </Text>
              ))}
            </View>
            <View className='ps-preview-actions'>
              <View className='ps-preview-btn ps-preview-btn-save' onClick={handleSave}>
                <Text>💾 保存</Text>
              </View>
              <View className='ps-preview-btn ps-preview-btn-share' onClick={handleShare}>
                <Text>📤 分享</Text>
              </View>
            </View>
          </View>
        )}

        <View className='ps-bottom-safe' />
      </ScrollView>
    </View>
  );
}
