import { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useFriendStore } from '@/stores/useFriendStore';
import { useAppStore } from '@/stores/useAppStore';
import type { PetFriend } from '@/types';
import './index.scss';

type TabKey = 'nearby' | 'friends' | 'requests';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'nearby', label: '附近宠友' },
  { key: 'friends', label: '我的好友' },
  { key: 'requests', label: '好友申请' },
];

export default function FriendsPage() {
  const { friends, requests, fetchFriends, sendRequest, acceptRequest, rejectRequest, openChat } = useFriendStore();
  const showToast = useAppStore((s) => s.showToast);
  const [tab, setTab] = useState<TabKey>('nearby');

  useEffect(() => {
    fetchFriends();
  }, []);

  const pendingCount = useMemo(
    () => requests.filter((r) => r.status === 'pending').length,
    [requests],
  );

  const myFriends = useMemo(() => friends.filter((f) => f.isFriend), [friends]);
  const pendingRequests = useMemo(
    () => requests.filter((r) => r.status === 'pending'),
    [requests],
  );

  const handleChat = (friend: PetFriend) => {
    openChat(friend.id);
    Taro.navigateTo({ url: `/pages/sub-pages/chat/index?id=${friend.id}` });
  };

  const handleAdd = (friend: PetFriend) => {
    sendRequest(friend.id);
    showToast(`已向 ${friend.nickname} 发送申请`);
  };

  const handleAccept = (requestId: string, nickname: string) => {
    acceptRequest(requestId);
    showToast(`已通过 ${nickname} 的申请`);
  };

  const handleReject = (requestId: string) => {
    rejectRequest(requestId);
    showToast('已忽略');
  };

  const renderFriendCard = (friend: PetFriend) => (
    <View key={friend.id} className='friend-card' onClick={() => friend.isFriend && handleChat(friend)}>
      <View className='friend-avatar'>
        <Text className='friend-avatar-emoji'>{friend.avatar}</Text>
        {friend.online && <View className='friend-online-dot' />}
      </View>
      <View className='friend-body'>
        <View className='friend-name-row'>
          <Text className='friend-name'>{friend.nickname}</Text>
          <Text className='friend-distance'>{friend.distance}</Text>
        </View>
        <View className='friend-pet-row'>
          <Text className='friend-pet'>{friend.petEmoji} {friend.petName} · {friend.breed}</Text>
        </View>
        <Text className='friend-signature'>{friend.signature}</Text>
        <View className='friend-tags'>
          {friend.tags.map((tag) => (
            <Text key={tag} className='friend-tag'>#{tag}</Text>
          ))}
        </View>
      </View>
      {!friend.isFriend && !friend.isRequested && (
        <View className='friend-add-btn' onClick={(e) => { e.stopPropagation(); handleAdd(friend); }}>
          <Text className='friend-add-text'>＋ 加好友</Text>
        </View>
      )}
      {!friend.isFriend && friend.isRequested && (
        <View className='friend-add-btn friend-add-btn--pending' onClick={(e) => e.stopPropagation()}>
          <Text className='friend-add-text'>已申请</Text>
        </View>
      )}
      {friend.isFriend && (
        <View className='friend-chat-btn' onClick={(e) => { e.stopPropagation(); handleChat(friend); }}>
          <Text className='friend-chat-text'>私聊</Text>
        </View>
      )}
    </View>
  );

  return (
    <View className='friends-page'>
      {/* Tabs */}
      <View className='friends-tabs'>
        {TABS.map((t) => (
          <View
            key={t.key}
            className={`friends-tab ${tab === t.key ? 'friends-tab--active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            <Text className='friends-tab-text'>{t.label}</Text>
            {t.key === 'requests' && pendingCount > 0 && (
              <View className='friends-tab-badge'>
                <Text className='friends-tab-badge-text'>{pendingCount}</Text>
              </View>
            )}
          </View>
        ))}
      </View>

      <ScrollView className='friends-scroll' scrollY showScrollbar={false}>
        {tab === 'nearby' && (
          <View className='friends-list'>
            {friends.map(renderFriendCard)}
          </View>
        )}

        {tab === 'friends' && (
          <View className='friends-list'>
            {myFriends.length > 0 ? (
              myFriends.map(renderFriendCard)
            ) : (
              <View className='friends-empty'>
                <Text className='friends-empty-emoji'>🐾</Text>
                <Text className='friends-empty-text'>还没有好友，去附近找找吧～</Text>
              </View>
            )}
          </View>
        )}

        {tab === 'requests' && (
          <View className='friends-list'>
            {pendingRequests.length > 0 ? (
              pendingRequests.map((req) => (
                <View key={req.id} className='request-card'>
                  <View className='friend-avatar'>
                    <Text className='friend-avatar-emoji'>{req.friend.avatar}</Text>
                  </View>
                  <View className='friend-body'>
                    <View className='friend-name-row'>
                      <Text className='friend-name'>{req.friend.nickname}</Text>
                      <Text className='friend-distance'>{req.time}</Text>
                    </View>
                    <Text className='request-message'>{req.message}</Text>
                    <View className='request-actions'>
                      <View className='request-accept' onClick={() => handleAccept(req.id, req.friend.nickname)}>
                        <Text className='request-accept-text'>同意</Text>
                      </View>
                      <View className='request-reject' onClick={() => handleReject(req.id)}>
                        <Text className='request-reject-text'>忽略</Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <View className='friends-empty'>
                <Text className='friends-empty-emoji'>📭</Text>
                <Text className='friends-empty-text'>暂无新的好友申请</Text>
              </View>
            )}
          </View>
        )}

        <View className='friends-bottom-safe' />
      </ScrollView>
    </View>
  );
}
