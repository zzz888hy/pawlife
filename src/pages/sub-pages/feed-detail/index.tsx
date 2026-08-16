import { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, Image } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { useFeedStore } from '@/stores/useFeedStore';
import { useAppStore } from '@/stores/useAppStore';
import { isImageUrl } from '@/utils/format';
import SubPageHeader from '@/components/SubPageHeader';
import CommentSheet from '@/components/CommentSheet';
import './index.scss';

export default function FeedDetailPage() {
  const router = useRouter();
  const feedId = (router.params.feedId as string) || '';

  const feedItems = useFeedStore((s) => s.feedItems);
  const fetchFeed = useFeedStore((s) => s.fetchFeed);
  const toggleLike = useFeedStore((s) => s.toggleLike);
  const toggleCollect = useFeedStore((s) => s.toggleCollect);
  const showToast = useAppStore((s) => s.showToast);

  const [commentVisible, setCommentVisible] = useState(false);

  const feed = useMemo(() => feedItems.find((f) => f.id === feedId), [feedItems, feedId]);

  // 若从其它入口进入（store 尚未加载），补拉一次列表
  useEffect(() => {
    if (feedId && !feed) fetchFeed();
  }, [feedId, feed, fetchFeed]);

  if (!feed) {
    return (
      <View className='feed-detail-page'>
        <SubPageHeader title='动态详情' />
        <View className='fd-empty'>
          <Text className='fd-empty-icon'>📭</Text>
          <Text className='fd-empty-text'>动态不存在或已删除</Text>
        </View>
      </View>
    );
  }

  const imgs = feed.images && feed.images.length > 0 ? feed.images : [];

  const handleLike = () => {
    toggleLike(feed.id);
    showToast('已发送摸摸～');
  };

  const handleCollect = () => {
    toggleCollect(feed.id);
    showToast('收藏成功');
  };

  const handlePreview = (current: string) => {
    if (imgs.length > 0) {
      Taro.previewImage({ urls: imgs, current });
    }
  };

  return (
    <View className='feed-detail-page'>
      <SubPageHeader title='动态详情' />

      <ScrollView className='fd-scroll' scrollY showScrollbar={false}>
        {/* 作者信息 */}
        <View className='fd-head'>
          <View className='fd-avatar' style={{ background: feed.bg }}>
            {isImageUrl(feed.pet) ? (
              <Image className='fd-avatar-img' src={feed.pet} mode='aspectFill' />
            ) : (
              <Text>{feed.pet}</Text>
            )}
          </View>
          <View className='fd-info'>
            <Text className='fd-name'>
              {feed.petName} <Text className='fd-tag'>{feed.breed}</Text>
            </Text>
            <Text className='fd-meta'>{feed.owner} · {feed.time}</Text>
          </View>
        </View>

        {/* 图片（全部） */}
        {imgs.length > 0 && (
          <View className={`fd-imgs ${imgs.length === 1 ? 'fd-imgs--one' : ''}`}>
            {imgs.map((img, i) => (
              <Image
                key={i}
                className='fd-img'
                src={img}
                mode='aspectFill'
                onClick={() => handlePreview(img)}
              />
            ))}
          </View>
        )}

        {/* 无图时的宠物大图占位 */}
        {imgs.length === 0 && (
          <View className='fd-noimg' style={{ background: feed.bg }}>
            {isImageUrl(feed.pet) ? (
              <Image className='fd-noimg-img' src={feed.pet} mode='aspectFill' />
            ) : (
              <Text className='fd-noimg-emoji'>{feed.pet}</Text>
            )}
          </View>
        )}

        {/* 正文 + 标签 */}
        <View className='fd-body'>
          <Text className='fd-txt'>{feed.txt}</Text>
          {feed.tags.length > 0 && (
            <View className='fd-tags'>
              {feed.tags.map((tag) => (
                <Text key={tag} className='fd-tag-item'>{tag}</Text>
              ))}
            </View>
          )}
        </View>

        <View className='fd-bottom-safe' />
      </ScrollView>

      {/* 底部操作栏 */}
      <View className='fd-bar'>
        <View className={`fd-act ${feed.liked ? 'liked' : ''}`} onClick={handleLike}>
          <Text className='fd-act-ico'>🐾</Text>
          <Text>{feed.likes} 摸摸</Text>
        </View>
        <View className='fd-act' onClick={() => setCommentVisible(true)}>
          <Text className='fd-act-ico'>💬</Text>
          <Text>{feed.cmts} 蹭蹭</Text>
        </View>
        <View className={`fd-act ${feed.collected ? 'liked' : ''}`} onClick={handleCollect}>
          <Text className='fd-act-ico'>⭐</Text>
          <Text>收藏</Text>
        </View>
      </View>

      <CommentSheet
        feedId={feed.id}
        visible={commentVisible}
        onClose={() => setCommentVisible(false)}
      />
    </View>
  );
}
