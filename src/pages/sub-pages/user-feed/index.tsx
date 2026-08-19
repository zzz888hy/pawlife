import { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import SubPageHeader from '@/components/SubPageHeader';
import FeedItem from '@/components/FeedItem';
import { useFeedStore } from '@/stores/useFeedStore';
import { listFeedByUser } from '@/services/feed';
import { isImageUrl } from '@/utils/format';
import type { FeedItem as FeedItemType } from '@/types';
import './index.scss';

export default function UserFeedPage() {
  const router = useRouter();
  const ownerId = (router.params?.ownerId as string) || '';
  const ownerName = decodeURIComponent((router.params?.ownerName as string) || '宠友');
  const ownerAvatar = decodeURIComponent((router.params?.ownerAvatar as string) || '😎');

  const [posts, setPosts] = useState<FeedItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const toggleLike = useFeedStore((s) => s.toggleLike);
  const toggleCollect = useFeedStore((s) => s.toggleCollect);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      setPosts(await listFeedByUser(ownerId));
    } catch {
      // 拉取失败保持空
    } finally {
      setLoading(false);
    }
  };

  const handleLike = (id: string) => {
    setPosts((prev) => prev.map((p) =>
      p.id === id ? { ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) } : p
    ));
    toggleLike(id);
    Taro.showToast({ title: '已发送摸摸～', icon: 'none' });
  };

  const handleCollect = (id: string) => {
    setPosts((prev) => prev.map((p) =>
      p.id === id ? { ...p, collected: !p.collected } : p
    ));
    toggleCollect(id);
    Taro.showToast({ title: '收藏成功', icon: 'none' });
  };

  const handleComment = () => {
    Taro.showToast({ title: '评论请前往广场参与～', icon: 'none' });
  };

  const handleOpen = (id: string) => {
    Taro.navigateTo({ url: `/pages/sub-pages/feed-detail/index?feedId=${id}` });
  };

  return (
    <View className='user-feed-page'>
      <SubPageHeader title='个人主页' />
      <ScrollView className='uf-scroll' scrollY showScrollbar={false}>
        <View className='uf-head'>
          <View className='uf-avatar'>
            {isImageUrl(ownerAvatar) ? (
              <Image className='uf-avatar-img' src={ownerAvatar} mode='aspectFill' />
            ) : (
              <Text className='uf-avatar-emoji'>{ownerAvatar}</Text>
            )}
          </View>
          <Text className='uf-name'>{ownerName}</Text>
          <Text className='uf-sub'>共 {posts.length} 条公开动态</Text>
        </View>

        {loading ? (
          <View className='uf-empty'><Text className='uf-empty-text'>加载中...</Text></View>
        ) : posts.length === 0 ? (
          <View className='uf-empty'>
            <Text className='uf-empty-icon'>🍃</Text>
            <Text className='uf-empty-text'>Ta 还没有公开动态</Text>
          </View>
        ) : (
          <View className='uf-list'>
            {posts.map((item) => (
              <FeedItem
                key={item.id}
                item={item}
                onLike={() => handleLike(item.id)}
                onCollect={() => handleCollect(item.id)}
                onComment={handleComment}
                onOpen={() => handleOpen(item.id)}
              />
            ))}
          </View>
        )}
        <View className='uf-bottom-safe' />
      </ScrollView>
    </View>
  );
}
