import { useState } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import SubPageHeader from '@/components/SubPageHeader';
import { useUserStore } from '@/stores/useUserStore';
import { useAppStore } from '@/stores/useAppStore';
import { chooseImage, uploadFile, toDataUrl } from '@/services/cloud';
import { updateUserProfile } from '@/services/auth';
import { isImageUrl } from '@/utils/format';
import './index.scss';

// 可选卡通头像
const OWNER_AVATARS = [
  '😎', '🐶', '🐱', '🐰', '🐹', '🐻', '🐼', '🐨', '🐯', '🦊',
  '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🦄', '🐢',
  '🦜', '🐠', '🐙', '🦋', '🐾',
];

export default function EditAvatarPage() {
  const avatar = useUserStore((s) => s.avatar);
  const setUser = useUserStore((s) => s.setUser);
  const showToast = useAppStore((s) => s.showToast);

  const [current, setCurrent] = useState(avatar);   // emoji 或图片路径
  const [preview, setPreview] = useState('');       // 拍照头像的 base64 预览
  const [saving, setSaving] = useState(false);

  const pickEmoji = (emoji: string) => {
    setCurrent(emoji);
    setPreview('');
  };

  const pickPhoto = async () => {
    const paths = await chooseImage(1);
    if (paths.length > 0) {
      const fp = paths[0];
      setCurrent(fp);
      setPreview(await toDataUrl(fp));
    }
  };

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      let next = current;
      // 新上传的照片：上传到云存储（已是 cloud:// 的跳过）
      if (isImageUrl(current) && !current.startsWith('cloud://')) {
        try {
          next = await uploadFile(current, `avatars/user-${Date.now()}.jpg`);
        } catch {
          // 上传失败保留原路径
        }
      }
      setUser({ avatar: next });
      await updateUserProfile({ avatarUrl: next });
      showToast('头像已更新');
      setTimeout(() => Taro.navigateBack(), 600);
    } catch {
      showToast('保存失败，请重试');
      setSaving(false);
    }
  };

  const showAsImage = isImageUrl(current);

  return (
    <View className='edit-avatar-page'>
      <SubPageHeader title='更换头像' />

      <View className='ea-body'>
        {/* 当前头像预览 */}
        <View className='ea-preview-wrap'>
          <View className='ea-preview'>
            {showAsImage ? (
              <Image className='ea-preview-img' src={preview || current} mode='aspectFill' />
            ) : (
              <Text className='ea-preview-emoji'>{current || '😎'}</Text>
            )}
          </View>
          <Text className='ea-preview-hint'>点击下方图标或上传照片更换头像</Text>
        </View>

        {/* 上传照片 */}
        <View className='ea-section'>
          <Text className='ea-label'>上传照片</Text>
          <View className='ea-upload-btn' onClick={pickPhoto}>
            <Text className='ea-upload-icon'>📷</Text>
            <Text>从相册 / 拍照选择</Text>
          </View>
        </View>

        {/* 卡通图标 */}
        <View className='ea-section'>
          <Text className='ea-label'>选择卡通图标</Text>
          <View className='ea-emoji-grid'>
            {OWNER_AVATARS.map((emoji) => (
              <View
                key={emoji}
                className={`ea-emoji-item ${current === emoji ? 'selected' : ''}`}
                onClick={() => pickEmoji(emoji)}
              >
                <Text className='ea-emoji'>{emoji}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* 保存 */}
      <View className='ea-footer'>
        <View className={`ea-save-btn ${saving ? 'disabled' : ''}`} onClick={handleSave}>
          <Text>{saving ? '保存中...' : '保存'}</Text>
        </View>
      </View>
    </View>
  );
}
