import { useEffect, useState } from 'react';
import { View, Text, ScrollView, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useFeedStore } from '@/stores/useFeedStore';
import { useAppStore } from '@/stores/useAppStore';
import FeedItem from '@/components/FeedItem';
import CommentSheet from '@/components/CommentSheet';
import CustomTabBar from '@/components/CustomTabBar';
import './index.scss';

export default function HallPage() {
  const {
    feedItems,
    categories,
    activeCategory,
    loading,
    fetchFeed,
    toggleLike,
    toggleCollect,
    setCategory,
  } = useFeedStore();

  const showToast = useAppStore((s) => s.showToast);
  const [commentFeedId, setCommentFeedId] = useState<string | null>(null);

  useEffect(() => {
    fetchFeed();
  }, []);

  const handleCategoryTap = (cat: string) => {
    setCategory(cat);
    fetchFeed(cat);
  };

  const handleLike = (id: string) => {
    toggleLike(id);
    showToast('已发送摸摸～');
  };

  const handleCollect = (id: string) => {
    toggleCollect(id);
    showToast('收藏成功');
  };

  const handleComment = (id: string) => {
    setCommentFeedId(id);
  };

  const handleRankClick = () => {
    Taro.navigateTo({ url: '/pages/sub-pages/rank/index' });
  };

  const handleSearchFocus = () => {
    Taro.navigateTo({ url: '/pages/sub-pages/search/index' });
  };

  return (
    <View className='hall-page'>
      {/* Sticky Header */}
      <View className='hall-header'>
        <View className='hall-top-bar'>
          <Text className='hall-logo'>🐾 PawLife</Text>
          <View className='hall-icons'>
            <Text className='hall-icon'>🔔</Text>
            <Text className='hall-icon'>📷</Text>
          </View>
        </View>

        {/* Category Tabs */}
        <ScrollView className='hall-cats' scrollX showScrollbar={false}>
          <View className='hall-cats-inner'>
            {categories.map((cat) => (
              <View
                key={cat}
                className={`hall-cat-item ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => handleCategoryTap(cat)}
              >
                <Text className='hall-cat-text'>{cat}</Text>
                {activeCategory === cat && <View className='hall-cat-bar' />}
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Search Bar */}
        <View className='search-bar'>
          <Text className='search-icon'>🔍</Text>
          <Input
            className='search-input'
            placeholder='搜索宠物、帖子、话题...'
            placeholderClass='search-placeholder'
            onFocus={handleSearchFocus}
          />
        </View>

        {/* Rank Banner */}
        <View className='rank-banner' onClick={handleRankClick}>
          <View className='rank-banner-left'>
            <Text className='rank-banner-icon'>🏆</Text>
            <View className='rank-banner-info'>
              <Text className='rank-banner-title'>PawLife 星光宠榜</Text>
              <Text className='rank-banner-sub'>查看本月最受欢迎宠物 &gt;</Text>
            </View>
          </View>
          <View className='rank-banner-right'>
            <Text className='rank-banner-emoji'>🐕</Text>
            <Text className='rank-banner-emoji'>🐈</Text>
            <Text className='rank-banner-emoji'>🐰</Text>
          </View>
        </View>
      </View>

      {/* Feed Section */}
      <ScrollView className='feed-section' scrollY showScrollbar={false}>
        {loading ? (
          <View className='feed-loading'>
            <Text>加载中...</Text>
          </View>
        ) : feedItems.length === 0 ? (
          <View className='feed-empty'>
            <Text className='feed-empty-icon'>📭</Text>
            <Text className='feed-empty-text'>还没有动态，快来发布第一条吧</Text>
          </View>
        ) : (
          feedItems.map((item) => (
            <FeedItem
              key={item.id}
              item={item}
              onLike={handleLike}
              onCollect={handleCollect}
              onComment={handleComment}
            />
          ))
        )}

        {/* Bottom Safe Area */}
        <View className='feed-bottom-safe' />
      </ScrollView>

      <CommentSheet
        feedId={commentFeedId || ''}
        visible={commentFeedId !== null}
        onClose={() => setCommentFeedId(null)}
      />

      <CustomTabBar />
    </View>
  );
}
