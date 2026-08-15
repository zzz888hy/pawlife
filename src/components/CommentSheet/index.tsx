import { useState } from 'react';
import { View, Text, ScrollView, Input } from '@tarojs/components';
import { useCommentStore } from '@/stores/useCommentStore';
import { useFeedStore } from '@/stores/useFeedStore';
import { useUserStore } from '@/stores/useUserStore';
import './index.scss';

interface CommentSheetProps {
  feedId: string;
  visible: boolean;
  onClose: () => void;
}

export default function CommentSheet({ feedId, visible, onClose }: CommentSheetProps) {
  const { getByFeedId, addComment } = useCommentStore();
  const incrementCmts = useFeedStore((s) => s.incrementCmts);
  const { nickname, avatar } = useUserStore();
  const [text, setText] = useState('');

  if (!visible) return null;

  const comments = getByFeedId(feedId);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    addComment(feedId, trimmed, nickname || '宠物主人', avatar || '😎');
    incrementCmts(feedId);
    setText('');
  };

  return (
    <View className='cmt-page'>
      <View className='cmt-overlay' onClick={onClose} />

      <View className='cmt-sheet'>
        <View className='cmt-handle-wrap' onClick={onClose}>
          <View className='cmt-handle' />
        </View>

        <View className='cmt-header'>
          <Text className='cmt-title'>评论 {comments.length}</Text>
          <Text className='cmt-close' onClick={onClose}>✕</Text>
        </View>

        <ScrollView className='cmt-list' scrollY showScrollbar={false}>
          {comments.length === 0 ? (
            <View className='cmt-empty'>
              <Text className='cmt-empty-icon'>💬</Text>
              <Text className='cmt-empty-text'>还没有评论，快来抢沙发～</Text>
            </View>
          ) : (
            comments.map((c) => (
              <View key={c.id} className='cmt-item'>
                <View className='cmt-avatar'>
                  <Text>{c.avatar}</Text>
                </View>
                <View className='cmt-body'>
                  <View className='cmt-body-top'>
                    <Text className='cmt-name'>{c.userName}</Text>
                    <Text className='cmt-time'>{c.time}</Text>
                  </View>
                  <Text className='cmt-text'>{c.text}</Text>
                  <View className='cmt-like'>
                    <Text>👍 {c.likes}</Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </ScrollView>

        <View className='cmt-input-bar'>
          <Input
            className='cmt-input'
            placeholder='说点什么...'
            placeholderClass='cmt-input-placeholder'
            value={text}
            onInput={(e) => setText(e.detail.value)}
            confirmType='send'
            onConfirm={handleSend}
            maxlength={100}
          />
          <View className='cmt-send-btn' onClick={handleSend}>
            <Text>发送</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
