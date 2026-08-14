import { useState, useEffect, useRef } from 'react';
import { View, Text, Input, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useChatStore } from '@/stores/useChatStore';
import { useAppStore } from '@/stores/useAppStore';
import SubPageHeader from '@/components/SubPageHeader';
import './index.scss';

export default function AiAssistantPage() {
  const { messages, quickReplies, sending, initChat, sendMessage } = useChatStore();
  const { showToast } = useAppStore();
  const [inputValue, setInputValue] = useState('');
  const scrollViewRef = useRef<any>(null);
  const bottomRef = useRef<any>(null);

  useEffect(() => {
    initChat();
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    setTimeout(() => {
      if (bottomRef.current) {
        bottomRef.current.scrollIntoView?.();
      }
    }, 100);
  }, [messages]);

  const handleSend = async () => {
    const text = inputValue.trim();
    if (!text || sending) return;
    setInputValue('');
    try {
      await sendMessage(text);
    } catch {
      showToast('发送失败，请重试');
    }
  };

  const handleQuickReply = async (repliesText: string) => {
    if (sending) return;
    try {
      await sendMessage(repliesText);
    } catch {
      showToast('发送失败，请重试');
    }
  };

  const handleInputConfirm = () => {
    handleSend();
  };

  return (
    <View className='ai-page'>
      {/* Header */}
      <SubPageHeader title='AI宠物助手' />

      {/* AI Head Banner */}
      <View className='ai-head-bar'>
        <View className='ai-head-left'>
          <View className='ai-head-avatar'>
            <Text className='ai-head-avatar-emoji'>🤖</Text>
          </View>
          <View className='ai-head-info'>
            <View className='ai-head-name-row'>
              <Text className='ai-head-name'>AI宠物助手</Text>
              <View className='ai-head-vip-badge'>
                <Text className='ai-head-vip-text'>PRO</Text>
              </View>
            </View>
            <Text className='ai-head-subtitle'>基于豆豆的专属记忆模型</Text>
          </View>
        </View>
      </View>

      {/* Chat Messages */}
      <ScrollView
        className='ai-chat'
        scrollY
        scrollWithAnimation
        scrollIntoView='ai-bottom-anchor'
        ref={scrollViewRef}
      >
        <View className='ai-chat-inner'>
          {messages.map((msg) => (
            <View
              key={msg.id}
              className={`ai-msg ${msg.role === 'bot' ? 'ai-msg--bot' : 'ai-msg--me'}`}
            >
              {msg.role === 'bot' && (
                <View className='ai-msg-avatar'>
                  <Text className='ai-msg-avatar-emoji'>{msg.avatar}</Text>
                </View>
              )}
              <View
                className={`ai-msg-bubble ${msg.role === 'bot' ? 'ai-msg-bubble--bot' : 'ai-msg-bubble--me'}`}
              >
                <Text className='ai-msg-text'>{msg.text}</Text>
              </View>
              {msg.role === 'me' && (
                <View className='ai-msg-avatar'>
                  <Text className='ai-msg-avatar-emoji'>{msg.avatar}</Text>
                </View>
              )}
            </View>
          ))}

          {/* Sending indicator */}
          {sending && (
            <View className='ai-msg ai-msg--bot'>
              <View className='ai-msg-avatar'>
                <Text className='ai-msg-avatar-emoji'>🤖</Text>
              </View>
              <View className='ai-msg-bubble ai-msg-bubble--bot ai-msg-bubble--typing'>
                <View className='ai-typing-dots'>
                  <View className='ai-typing-dot' />
                  <View className='ai-typing-dot' />
                  <View className='ai-typing-dot' />
                </View>
              </View>
            </View>
          )}

          <View id='ai-bottom-anchor' ref={bottomRef} />
        </View>
      </ScrollView>

      {/* Quick Reply Chips */}
      <View className='ai-quick'>
        <ScrollView className='ai-quick-scroll' scrollX showScrollbar={false}>
          {quickReplies.map((qr) => (
            <View
              key={qr.text}
              className='ai-quick-chip'
              onClick={() => handleQuickReply(qr.text)}
            >
              <Text className='ai-quick-chip-text'>{qr.text}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Input Bar */}
      <View className='ai-input'>
        <View className='ai-input-box'>
          <Input
            className='ai-input-field'
            value={inputValue}
            onInput={(e) => setInputValue(e.detail.value)}
            onConfirm={handleInputConfirm}
            placeholder='输入消息...'
            confirmType='send'
            placeholderClass='ai-input-placeholder'
            adjustPosition
          />
        </View>
        <View
          className={`ai-input-send ${inputValue.trim() && !sending ? 'ai-input-send--active' : ''}`}
          onClick={handleSend}
        >
          <Text className='ai-input-send-icon'>➤</Text>
        </View>
      </View>
    </View>
  );
}
