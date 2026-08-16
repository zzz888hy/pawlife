import { useEffect, useState } from 'react';
import { View, Text, Input, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import SubPageHeader from '@/components/SubPageHeader';
import FeedItem from '@/components/FeedItem';
import { useFeedStore } from '@/stores/useFeedStore';
import { useAppStore } from '@/stores/useAppStore';
import './index.scss';

const HOT_KEYWORDS = ['金毛', '橘猫', '柯基', '兔子', '穿搭', '饲养经验', '圣诞', '海边'];

export default function SearchPage() {
  const { feedItems, fetchFeed, toggleLike, toggleCollect } = useFeedStore();
  const showToast = useAppStore((s) => s.showToast);
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    fetchFeed();
  }, []);

  const normalized = keyword.trim().toLowerCase();
  const results = normalized
    ? feedItems.filter((f) =>
        [f.petName, f.breed, f.txt, f.owner, ...f.tags].some((s) =>
          s.toLowerCase().includes(normalized)
        )
      )
    : [];

  const handleLike = (id: string) => {
    toggleLike(id);
    showToast('已发送摸摸～');
  };

  const handleCollect = (id: string) => {
    toggleCollect(id);
    showToast('收藏成功');
  };

  const handleComment = () => {
    showToast('评论请前往广场参与～');
  };

  const handleOpen = (id: string) => {
    Taro.navigateTo({ url: `/pages/sub-pages/feed-detail/index?feedId=${id}` });
  };

  return (
    <View className='search-page'>
      <SubPageHeader title='搜索' />

      {/* Search Input */}
      <View className='search-top'>
        <View className='search-bar'>
          <Text className='search-bar-icon'>🔍</Text>
          <Input
            className='search-bar-input'
            placeholder='搜索宠物、帖子、话题...'
            placeholderClass='search-bar-placeholder'
            value={keyword}
            onInput={(e) => setKeyword(e.detail.value)}
            confirmType='search'
            focus
          />
          {keyword && (
            <Text className='search-bar-clear' onClick={() => setKeyword('')}>✕</Text>
          )}
        </View>
      </View>

      <ScrollView className='search-body' scrollY showScrollbar={false}>
        {!normalized ? (
          <View className='search-hot'>
            <Text className='search-hot-title'>🔥 热门搜索</Text>
            <View className='search-hot-grid'>
              {HOT_KEYWORDS.map((kw) => (
                <View
                  key={kw}
                  className='search-hot-chip'
                  onClick={() => setKeyword(kw)}
                >
                  <Text>{kw}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : results.length === 0 ? (
          <View className='search-empty'>
            <Text className='search-empty-icon'>🔍</Text>
            <Text className='search-empty-text'>没有找到「{keyword}」相关的内容</Text>
          </View>
        ) : (
          <View className='search-results'>
            <Text className='search-result-count'>共 {results.length} 条结果</Text>
            {results.map((item) => (
              <FeedItem
                key={item.id}
                item={item}
                onLike={handleLike}
                onCollect={handleCollect}
                onComment={handleComment}
                onOpen={() => handleOpen(item.id)}
              />
            ))}
          </View>
        )}

        <View className='search-bottom-safe' />
      </ScrollView>
    </View>
  );
}
