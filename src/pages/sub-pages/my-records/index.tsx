import { useEffect } from 'react';
import { View, Text, ScrollView, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import SubPageHeader from '@/components/SubPageHeader';
import { usePetStore } from '@/stores/usePetStore';
import { useUserStore } from '@/stores/useUserStore';
import { isImageUrl } from '@/utils/format';
import type { TimelineEntry } from '@/types';
import './index.scss';

export default function MyRecordsPage() {
  const timeline = usePetStore((s) => s.timeline);
  const fetchPets = usePetStore((s) => s.fetchPets);
  const removeRecord = usePetStore((s) => s.removeRecord);
  const recordCount = useUserStore((s) => s.recordCount);
  const setUser = useUserStore((s) => s.setUser);

  useEffect(() => {
    fetchPets();
  }, []);

  const sorted = [...timeline].sort((a, b) => b.date.localeCompare(a.date));

  const handleEdit = (id: string) => {
    Taro.navigateTo({ url: `/pages/sub-pages/create-post/index?mode=record&editId=${id}` });
  };

  const handleDelete = (item: TimelineEntry) => {
    Taro.showModal({
      title: '删除记录',
      content: '删除后不可恢复，确定删除这条记录吗？',
      confirmText: '删除',
      confirmColor: '#FF5A5A',
      success: async (res) => {
        if (!res.confirm) return;
        try {
          await removeRecord(item.id);
          setUser({ recordCount: Math.max(0, recordCount - 1) });
          Taro.showToast({ title: '已删除', icon: 'success' });
        } catch {
          Taro.showToast({ title: '删除失败，请重试', icon: 'none' });
        }
      },
    });
  };

  return (
    <View className='my-records-page'>
      <SubPageHeader title='个人记录' />
      <ScrollView className='mr-scroll' scrollY showScrollbar={false}>
        {sorted.length === 0 ? (
          <View className='mr-empty'>
            <Text className='mr-empty-icon'>🗂️</Text>
            <Text className='mr-empty-text'>还没有记录</Text>
          </View>
        ) : (
          <View className='mr-list'>
            {sorted.map((item) => (
              <View key={item.id} className='mr-item'>
                <View className='mr-item-main' onClick={() => handleEdit(item.id)}>
                  {item.imageUrl && isImageUrl(item.imageUrl) ? (
                    <Image className='mr-thumb' src={item.imageUrl} mode='aspectFill' />
                  ) : (
                    <View className='mr-thumb mr-thumb-emoji'><Text>{item.emoji}</Text></View>
                  )}
                  <View className='mr-info'>
                    <Text className='mr-title'>{item.title}</Text>
                    {item.desc ? <Text className='mr-desc'>{item.desc}</Text> : null}
                    <Text className='mr-date'>{item.date}</Text>
                  </View>
                </View>
                <View className='mr-actions'>
                  <View className='mr-action' onClick={() => handleEdit(item.id)}><Text>编辑</Text></View>
                  <View className='mr-action mr-action-danger' onClick={() => handleDelete(item)}><Text>删除</Text></View>
                </View>
              </View>
            ))}
          </View>
        )}
        <View className='mr-bottom-safe' />
      </ScrollView>
    </View>
  );
}
