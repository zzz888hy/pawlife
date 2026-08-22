import { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, Input } from '@tarojs/components';
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
  const {
    friends,
    requests,
    fetchFriends,
    sendRequest,
    acceptRequest,
    rejectRequest,
    openChat,
    searchResults,
    searchKeyword,
    searching,
    searchFriends,
    clearSearch,
    updateLocation,
  } = useFriendStore();
  const showToast = useAppStore((s) => s.showToast);
  const [tab, setTab] = useState<TabKey>('nearby');
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    Taro.getLocation({ type: 'gcj02' })
      .then((res) => {
        const loc = { lat: res.latitude, lng: res.longitude };
        updateLocation(loc);
        fetchFriends(loc);
      })
      .catch(() => {
        // 定位失败或未授权：不传坐标，走兜底（种子宠友的硬编码距离）
        fetchFriends();
      });
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

  const handleSearch = () => {
    searchFriends(keyword);
  };

  const handleClearSearch = () => {
    setKeyword('');
    clearSearch();
  };

  const renderSearchResult = (u: PetFriend) => (
    <View key={u.id} className='friend-card'>
      <View className='friend-avatar'>
        <Text className='friend-avatar-emoji'>{u.avatar}</Text>
      </View>
      <View className='friend-body'>
        <View className='friend-name-row'>
          <Text className='friend-name'>{u.nickname}</Text>
        </View>
        <Text className='search-result-id'>ID: {u.id}</Text>
      </View>
      {!u.isFriend && !u.isRequested && (
        <View className='friend-add-btn' onClick={() => handleAdd(u)}>
          <Text className='friend-add-text'>＋ 加好友</Text>
        </View>
      )}
      {!u.isFriend && u.isRequested && (
        <View className='friend-add-btn friend-add-btn--pending'>
          <Text className='friend-add-text'>已申请</Text>
        </View>
      )}
      {u.isFriend && (
        <View className='friend-chat-btn' onClick={() => handleChat(u)}>
          <Text className='friend-chat-text'>私聊</Text>
        </View>
      )}
    </View>
  );

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
      {/* 搜索 */}
      <View className='friends-search'>
        <Input
          className='friends-search-input'
          placeholder='搜索 ID 或昵称添加好友'
          placeholderClass='friends-search-placeholder'
          value={keyword}
          onInput={(e) => setKeyword(e.detail.value)}
          onConfirm={handleSearch}
          confirmType='search'
        />
        {keyword && (
          <View className='friends-search-btn' onClick={handleSearch}>
            <Text className='friends-search-btn-text'>搜索</Text>
          </View>
        )}
      </View>

      {searchKeyword ? (
        <ScrollView className='friends-scroll' scrollY showScrollbar={false}>
          <View className='friends-list'>
            <View className='friends-search-header'>
              <Text className='friends-search-header-text'>搜索“{searchKeyword}”的结果</Text>
              <Text className='friends-search-clear' onClick={handleClearSearch}>清除</Text>
            </View>
            {searching ? (
              <View className='friends-empty'>
                <Text className='friends-empty-text'>搜索中…</Text>
              </View>
            ) : searchResults.length > 0 ? (
              searchResults.map(renderSearchResult)
            ) : (
              <View className='friends-empty'>
                <Text className='friends-empty-emoji'>🔍</Text>
                <Text className='friends-empty-text'>没有找到匹配的宠友</Text>
              </View>
            )}
          </View>
          <View className='friends-bottom-safe' />
        </ScrollView>
      ) : (
        <>
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
        </>
      )}
    </View>
  );
}
