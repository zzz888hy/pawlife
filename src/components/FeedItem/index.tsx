import { View, Text, Image } from '@tarojs/components';
import type { FeedItem as FeedItemType } from '@/types';
import { isImageUrl } from '@/utils/format';
import './index.scss';

interface FeedItemProps {
  item: FeedItemType;
  onLike: (id: string) => void;
  onCollect: (id: string) => void;
  onComment: (id: string) => void;
  onOpen: () => void;
  onOpenOwner?: () => void;
}

export default function FeedItem({ item, onLike, onCollect, onComment, onOpen, onOpenOwner }: FeedItemProps) {
  const imgs = item.images && item.images.length > 0 ? item.images : null;
  return (
    <View className='feed-item' onClick={onOpen}>
      {/* Header */}
      <View className='feed-head'>
        <View
          className='feed-avatar'
          style={{ background: item.bg }}
          onClick={(e) => { e.stopPropagation(); onOpenOwner?.(); }}
        >
          {isImageUrl(item.ownerAvatar) ? (
            <Image className='feed-avatar-img' src={item.ownerAvatar} mode='aspectFill' />
          ) : (
            <Text>{item.ownerAvatar || item.pet}</Text>
          )}
        </View>
        <View className='feed-info'>
          <Text className='feed-name'>
            {item.petName} <Text className='feed-tag'>{item.breed}</Text>
          </Text>
          <Text className='feed-meta'>{item.owner} · {item.time}</Text>
        </View>
      </View>

      {/* Photos：4 张 → 2×2；其余 → 每行 3 张往下排（9 张即 3×3 九宫格） */}
      {imgs && imgs.length > 0 ? (
        <View className={`feed-pics grid cols-${imgs.length === 4 ? 2 : 3}`}>
          {imgs.map((img, i) => (
            <View key={i} className='feed-pic' style={{ background: item.bg }}>
              <Image className='feed-pic-img' src={img} mode='aspectFill' />
            </View>
          ))}
        </View>
      ) : item.pics === 2 ? (
        <View className='feed-pics two'>
          <View className='feed-pic' style={{ background: item.bg }}>
            <Text>{item.picsEmoji[0]}</Text>
          </View>
          <View className='feed-pic' style={{ background: item.bg }}>
            <Text>{item.picsEmoji[1]}</Text>
          </View>
        </View>
      ) : (
        <View className='feed-pics one'>
          <View className='feed-pic feed-pic--large' style={{ background: item.bg }}>
            {isImageUrl(item.pet) ? (
              <Image className='feed-pic-img' src={item.pet} mode='aspectFill' />
            ) : (
              <Text>{item.pet}</Text>
            )}
          </View>
        </View>
      )}

      {/* Body */}
      <View className='feed-body'>
        <Text className='feed-txt'>{item.txt}</Text>
        <View className='feed-tags'>
          {item.tags.map((tag) => (
            <Text key={tag} className='feed-tag-item'>{tag}</Text>
          ))}
        </View>
      </View>

      {/* Actions */}
      <View className='feed-actions'>
        <View
          className={`feed-act ${item.liked ? 'liked' : ''}`}
          onClick={(e) => { e.stopPropagation(); onLike(item.id); }}
        >
          <Text className='feed-act-ico'>🐾</Text>
          <Text>{item.likes}</Text>
          <Text> 摸摸</Text>
        </View>
        <View className='feed-act' onClick={(e) => { e.stopPropagation(); onComment(item.id); }}>
          <Text className='feed-act-ico'>💬</Text>
          <Text>{item.cmts}</Text>
          <Text> 蹭蹭</Text>
        </View>
        <View
          className={`feed-act ${item.collected ? 'liked' : ''}`}
          onClick={(e) => { e.stopPropagation(); onCollect(item.id); }}
        >
          <Text className='feed-act-ico'>⭐</Text>
          <Text>收藏</Text>
        </View>
        <View className='feed-act feed-act--right'>
          <Text className='feed-act-ico'>📤</Text>
        </View>
      </View>
    </View>
  );
}
