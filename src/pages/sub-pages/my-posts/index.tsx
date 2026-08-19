import { useState } from 'react';
import { View, Text, ScrollView, Image } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import SubPageHeader from '@/components/SubPageHeader';
import { useFeedStore } from '@/stores/useFeedStore';
import { listMyFeed } from '@/services/feed';
import type { FeedItem, FeedVisibility } from '@/types';
import './index.scss';

const VIS_LABEL: Record<FeedVisibility, string> = {
  public: '公开',
  friends: '好友可见',
  private: '仅自己',
};

const VIS_ACTIONS = ['公开', '好友可见', '仅自己可见'];
const VIS_KEYS: FeedVisibility[] = ['public', 'friends', 'private'];

export default function MyPostsPage() {
  const [posts, setPosts] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const removeFeed = useFeedStore((s) => s.removeFeed);
  const updateFeed = useFeedStore((s) => s.updateFeed);

  // 每次页面显示时重新拉取，确保从编辑页返回后能看到最新的隐私/文案/图片
  useDidShow(() => {
    load();
  });

  const load = async () => {
    try {
      setPosts(await listMyFeed());
    } catch {
      // 拉取失败保持现有列表
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id: string) => {
    Taro.navigateTo({ url: `/pages/sub-pages/create-post/index?mode=feed&editId=${id}` });
  };

  const handleVisibility = (item: FeedItem) => {
    Taro.showActionSheet({
      itemList: VIS_ACTIONS,
      success: async (res) => {
        const next = VIS_KEYS[res.tapIndex];
        if (!next || next === (item.visibility || 'public')) return;
        try {
          await updateFeed(item.id, { visibility: next });
          setPosts((prev) => prev.map((p) => (p.id === item.id ? { ...p, visibility: next } : p)));
          Taro.showToast({ title: '已更新', icon: 'success' });
        } catch {
          Taro.showToast({ title: '更新失败，请重试', icon: 'none' });
        }
      },
    });
  };

  const handleDelete = (item: FeedItem) => {
    Taro.showModal({
      title: '删除动态',
      content: '删除后不可恢复，确定删除这条动态吗？',
      confirmText: '删除',
      confirmColor: '#FF5A5A',
      success: async (res) => {
        if (!res.confirm) return;
        try {
          await removeFeed(item.id);
          setPosts((prev) => prev.filter((p) => p.id !== item.id));
          Taro.showToast({ title: '已删除', icon: 'success' });
        } catch {
          Taro.showToast({ title: '删除失败，请重试', icon: 'none' });
        }
      },
    });
  };

  return (
    <View className='my-posts-page'>
      <SubPageHeader title='我的动态' />
      <ScrollView className='mp-scroll' scrollY showScrollbar={false}>
        {loading ? (
          <View className='mp-empty'><Text className='mp-empty-text'>加载中...</Text></View>
        ) : posts.length === 0 ? (
          <View className='mp-empty'>
            <Text className='mp-empty-icon'>📝</Text>
            <Text className='mp-empty-text'>还没有动态</Text>
          </View>
        ) : (
          <View className='mp-list'>
            {posts.map((item) => (
              <View key={item.id} className='mp-item'>
                <View className='mp-item-main' onClick={() => handleEdit(item.id)}>
                  {item.images && item.images.length > 0 ? (
                    <Image className='mp-thumb' src={item.images[0]} mode='aspectFill' />
                  ) : (
                    <View className='mp-thumb mp-thumb-emoji' style={{ background: item.bg }}>
                      <Text>{item.pet}</Text>
                    </View>
                  )}
                  <View className='mp-info'>
                    <Text className='mp-txt'>{item.txt}</Text>
                    <Text className='mp-meta'>{item.time}</Text>
                  </View>
                </View>
                <View className='mp-actions'>
                  <View className='mp-badge'><Text>{VIS_LABEL[item.visibility || 'public']}</Text></View>
                  <View className='mp-spacer' />
                  <View className='mp-action' onClick={() => handleVisibility(item)}><Text>隐私</Text></View>
                  <View className='mp-action' onClick={() => handleEdit(item.id)}><Text>编辑</Text></View>
                  <View className='mp-action mp-action-danger' onClick={() => handleDelete(item)}><Text>删除</Text></View>
                </View>
              </View>
            ))}
          </View>
        )}
        <View className='mp-bottom-safe' />
      </ScrollView>
    </View>
  );
}
