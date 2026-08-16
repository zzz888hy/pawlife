import { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import SubPageHeader from '@/components/SubPageHeader';
import { useMessageStore } from '@/stores/useMessageStore';
import type { MessageItem } from '@/types';
import './index.scss';

type FilterKey = 'all' | 'interaction' | 'chat' | 'friend-request' | 'system';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'interaction', label: '互动' },
  { key: 'chat', label: '私信' },
  { key: 'friend-request', label: '好友' },
  { key: 'system', label: '系统' },
];

const matchFilter = (m: MessageItem, key: FilterKey) => {
  if (key === 'all') return true;
  if (key === 'interaction') return m.type === 'like' || m.type === 'comment';
  return m.type === key;
};

export default function MessagesPage() {
  const { messages, fetchMessages, markRead, markAllRead } = useMessageStore();
  const [filter, setFilter] = useState<FilterKey>('all');

  useEffect(() => {
    fetchMessages();
  }, []);

  const list = useMemo(() => messages.filter((m) => matchFilter(m, filter)), [messages, filter]);

  const handleTap = (m: MessageItem) => {
    markRead(m.id);
    if (!m.url) return;
    if (m.tab) {
      Taro.switchTab({ url: m.url });
    } else {
      Taro.navigateTo({ url: m.url });
    }
  };

  const handleMarkAllRead = () => {
    markAllRead();
    Taro.showToast({ title: '已全部标为已读', icon: 'none' });
  };

  return (
    <View className='messages-page'>
      <SubPageHeader title='消息中心' />

      {/* Toolbar */}
      <View className='msg-toolbar'>
        <View className='msg-tabs'>
          {FILTERS.map((f) => (
            <View
              key={f.key}
              className={`msg-tab ${filter === f.key ? 'msg-tab--active' : ''}`}
              onClick={() => setFilter(f.key)}
            >
              <Text className='msg-tab-text'>{f.label}</Text>
            </View>
          ))}
        </View>
        <View className='msg-read-all' onClick={handleMarkAllRead}>
          <Text className='msg-read-all-text'>全部已读</Text>
        </View>
      </View>

      <ScrollView className='msg-scroll' scrollY showScrollbar={false}>
        {list.length > 0 ? (
          <View className='msg-list'>
            {list.map((m) => (
              <View
                key={m.id}
                className={`msg-item ${!m.read ? 'msg-item--unread' : ''}`}
                onClick={() => handleTap(m)}
              >
                <View className='msg-avatar'>
                  <Text className='msg-avatar-emoji'>{m.avatar}</Text>
                  {!m.read && <View className='msg-dot' />}
                </View>
                <View className='msg-body'>
                  <View className='msg-title-row'>
                    <Text className='msg-title'>{m.title}</Text>
                    <Text className='msg-time'>{m.time}</Text>
                  </View>
                  <Text className='msg-content'>{m.content}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View className='msg-empty'>
            <Text className='msg-empty-emoji'>📭</Text>
            <Text className='msg-empty-text'>暂无消息</Text>
          </View>
        )}

        <View className='msg-bottom-safe' />
      </ScrollView>
    </View>
  );
}
