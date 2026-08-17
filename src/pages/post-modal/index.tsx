import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAppStore } from '@/stores/useAppStore';
import './index.scss';

interface PostOption {
  emoji: string;
  title: string;
  desc: string;
  action: () => void;
}

export default function PostModalPage() {
  const showToast = useAppStore((s) => s.showToast);

  const handleClose = () => {
    Taro.navigateBack();
  };

  const options: PostOption[] = [
    {
      emoji: '📝',
      title: '记录宠物',
      desc: '散步·喂食·玩耍',
      action: () => {
        Taro.navigateTo({ url: '/pages/sub-pages/create-post/index?mode=record' });
      },
    },
    {
      emoji: '📸',
      title: '发动态',
      desc: '分享日常照片',
      action: () => {
        Taro.navigateTo({ url: '/pages/sub-pages/create-post/index' });
      },
    },
    {
      emoji: '📖',
      title: 'AI故事',
      desc: '生成宠物故事',
      action: () => {
        Taro.navigateTo({ url: '/pages/sub-pages/pet-story/index' });
      },
    },
    {
      emoji: '💊',
      title: '健康记录',
      desc: '疫苗·驱虫·体重',
      action: () => {
        Taro.navigateTo({ url: '/pages/sub-pages/health-records/index' });
      },
    },
    {
      emoji: '🖼️',
      title: '上传相册',
      desc: 'AI自动整理',
      action: () => {
        Taro.navigateTo({ url: '/pages/sub-pages/album/index' });
      },
    },
  ];

  return (
    <View className='post-modal-page'>
      {/* Overlay */}
      <View className='pm-overlay' onClick={handleClose} />

      {/* Bottom Sheet */}
      <View className='pm-sheet'>
        {/* Handle */}
        <View className='pm-handle-wrap' onClick={handleClose}>
          <View className='pm-handle' />
        </View>

        {/* Title */}
        <Text className='pm-title'>记录豆豆的精彩瞬间</Text>

        {/* Options Grid */}
        <View className='pm-opts'>
          {options.map((opt) => (
            <View key={opt.title} className='pm-opt-item' onClick={opt.action}>
              <Text className='pm-opt-emoji'>{opt.emoji}</Text>
              <View className='pm-opt-info'>
                <Text className='pm-opt-title'>{opt.title}</Text>
                <Text className='pm-opt-desc'>{opt.desc}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

    </View>
  );
}
