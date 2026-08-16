import { View, Text, Image } from '@tarojs/components';
import type { FeedItem as FeedItemType } from '@/types';
import { isImageUrl } from '@/utils/format';
import './index.scss';

interface FeedItemProps {
  item: FeedItemType;
  onLike: (id: string) => void;
  onCollect: (id: string) => void;
  onComment: (id: string) => void;
}

export default function FeedItem({ item, onLike, onCollect, onComment }: FeedItemProps) {
  const imgs = item.images && item.images.length > 0 ? item.images : null;
  return (
    <View className='feed-item'>
      {/* Header */}
      <View className='feed-head'>
        <View className='feed-avatar' style={{ background: item.bg }}>
          {isImageUrl(item.pet) ? (
            <Image className='feed-avatar-img' src={item.pet} mode='aspectFill' />
          ) : (
            <Text>{item.pet}</Text>
          )}
        </View>
        <View className='feed-info'>
          <Text className='feed-name'>
            {item.petName} <Text className='feed-tag'>{item.breed}</Text>
          </Text>
          <Text className='feed-meta'>{item.owner} · {item.time}</Text>
        </View>
      </View>

      {/* Photos */}
      {imgs && imgs.length >= 2 ? (
        <View className='feed-pics two'>
          <View className='feed-pic' style={{ background: item.bg }}>
            <Image className='feed-pic-img' src={imgs[0]} mode='aspectFill' />
          </View>
          <View className='feed-pic' style={{ background: item.bg }}>
            <Image className='feed-pic-img' src={imgs[1]} mode='aspectFill' />
          </View>
        </View>
      ) : imgs && imgs.length === 1 ? (
        <View className='feed-pics one'>
          <View className='feed-pic feed-pic--large' style={{ background: item.bg }}>
            <Image className='feed-pic-img' src={imgs[0]} mode='aspectFill' />
          </View>
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
          onClick={() => onLike(item.id)}
        >
          <Text className='feed-act-ico'>🐾</Text>
          <Text>{item.likes}</Text>
          <Text> 摸摸</Text>
        </View>
        <View className='feed-act' onClick={() => onComment(item.id)}>
          <Text className='feed-act-ico'>💬</Text>
          <Text>{item.cmts}</Text>
          <Text> 蹭蹭</Text>
        </View>
        <View
          className={`feed-act ${item.collected ? 'liked' : ''}`}
          onClick={() => onCollect(item.id)}
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
