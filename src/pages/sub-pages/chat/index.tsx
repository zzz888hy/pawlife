import { useState, useEffect } from 'react';
import { View, Text, Input, ScrollView } from '@tarojs/components';
import { useRouter } from '@tarojs/taro';
import SubPageHeader from '@/components/SubPageHeader';
import { useFriendStore } from '@/stores/useFriendStore';
import { useAppStore } from '@/stores/useAppStore';
import './index.scss';

export default function ChatPage() {
  const router = useRouter();
  const urlId = (router.params && router.params.id) || '';
  const currentChatId = useFriendStore((s) => s.currentChatId);
  const friendId = urlId || currentChatId || '';
  const friend = useFriendStore((s) => s.friends.find((f) => f.id === friendId));
  const chats = useFriendStore((s) => s.chats);
  const sendMessage = useFriendStore((s) => s.sendMessage);
  const fetchMessages = useFriendStore((s) => s.fetchMessages);
  const showToast = useAppStore((s) => s.showToast);

  const [inputValue, setInputValue] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (friendId) fetchMessages(friendId);
  }, [friendId]);

  const messages = chats[friendId] || [];

  const handleSend = async () => {
    const text = inputValue.trim();
    if (!text || sending) return;
    setInputValue('');
    setSending(true);
    try {
      await sendMessage(friendId, text);
    } catch {
      showToast('发送失败，请重试');
    } finally {
      setSending(false);
    }
  };

  const handleInputConfirm = () => {
    handleSend();
  };

  if (!friend) {
    return <View className='chat-page'><SubPageHeader title='私聊' /></View>;
  }

  const anchorId = `chat-anchor-${messages.length}`;

  return (
    <View className='chat-page'>
      <SubPageHeader title={friend.nickname} />

      {/* Friend Info Bar */}
      <View className='chat-head'>
        <View className='chat-head-avatar'>
          <Text className='chat-head-avatar-emoji'>{friend.avatar}</Text>
        </View>
        <View className='chat-head-info'>
          <Text className='chat-head-name'>{friend.nickname}</Text>
          <Text className='chat-head-sub'>
            {friend.petEmoji} {friend.petName} · {friend.breed} · {friend.online ? '在线' : '离线'}
          </Text>
        </View>
      </View>

      {/* Messages */}
      <ScrollView
        className='chat-scroll'
        scrollY
        scrollWithAnimation
        scrollIntoView={anchorId}
      >
        <View className='chat-inner'>
          {messages.map((msg) => (
            <View
              key={msg.id}
              className={`chat-msg ${msg.role === 'me' ? 'chat-msg--me' : 'chat-msg--friend'}`}
            >
              {msg.role !== 'me' && (
                <View className='chat-msg-avatar'>
                  <Text className='chat-msg-avatar-emoji'>{friend.avatar}</Text>
                </View>
              )}
              <View className={`chat-msg-bubble ${msg.role === 'me' ? 'chat-msg-bubble--me' : 'chat-msg-bubble--friend'}`}>
                <Text className='chat-msg-text'>{msg.text}</Text>
              </View>
              {msg.role === 'me' && (
                <View className='chat-msg-avatar'>
                  <Text className='chat-msg-avatar-emoji'>😎</Text>
                </View>
              )}
            </View>
          ))}

          {/* Typing indicator */}
          {sending && (
            <View className='chat-msg chat-msg--friend'>
              <View className='chat-msg-avatar'>
                <Text className='chat-msg-avatar-emoji'>{friend.avatar}</Text>
              </View>
              <View className='chat-msg-bubble chat-msg-bubble--friend chat-msg-bubble--typing'>
                <View className='chat-typing-dots'>
                  <View className='chat-typing-dot' />
                  <View className='chat-typing-dot' />
                  <View className='chat-typing-dot' />
                </View>
              </View>
            </View>
          )}

          <View id={anchorId} />
        </View>
      </ScrollView>

      {/* Input Bar */}
      <View className='chat-input'>
        <View className='chat-input-box'>
          <Input
            className='chat-input-field'
            value={inputValue}
            onInput={(e) => setInputValue(e.detail.value)}
            onConfirm={handleInputConfirm}
            placeholder='输入消息...'
            confirmType='send'
            placeholderClass='chat-input-placeholder'
            adjustPosition
          />
        </View>
        <View
          className={`chat-input-send ${inputValue.trim() && !sending ? 'chat-input-send--active' : ''}`}
          onClick={handleSend}
        >
          <Text className='chat-input-send-icon'>➤</Text>
        </View>
      </View>
    </View>
  );
}
