import { useState } from 'react';
import { View, Text, Input, Switch, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import SubPageHeader from '@/components/SubPageHeader';
import { useUserStore } from '@/stores/useUserStore';
import { useAppStore } from '@/stores/useAppStore';
import './index.scss';

const AVATAR_EMOJIS = ['😎', '🐱', '🐶', '🐰', '🐹', '🦊', '🐻', '🐼', '🦁', '🐯', '🐨', '🐷'];

const AGREEMENT_TEXT =
  '欢迎使用 PawLife 宠物数字生命空间。\n\n1. 服务内容：为用户提供宠物数字档案、社区互动、健康管理等功能。\n2. 账号管理：请妥善保管账号信息，勿向他人泄露。\n3. 内容规范：发布内容需符合法律法规，不得包含违法违规信息。\n4. 数据说明：宠物档案数据仅用于提供个性化服务。';

const PRIVACY_TEXT =
  '我们高度重视你的隐私。\n\n1. 信息收集：仅在提供服务必要范围内收集信息。\n2. 信息使用：用于身份识别、功能实现及服务优化。\n3. 信息保护：采用加密等方式保护你的数据安全。\n4. 你的权利：可随时查看、修改或删除你的个人信息。';

export default function SettingsPage() {
  const nickname = useUserStore((s) => s.nickname);
  const avatar = useUserStore((s) => s.avatar);
  const setUser = useUserStore((s) => s.setUser);
  const showToast = useAppStore((s) => s.showToast);

  const [notifyEnabled, setNotifyEnabled] = useState(true);
  const [privacyEnabled, setPrivacyEnabled] = useState(true);
  const [language, setLanguage] = useState('简体中文');
  const [cacheSize, setCacheSize] = useState('0KB');
  const [editing, setEditing] = useState(false);
  const [editNickname, setEditNickname] = useState(nickname);
  const [editAvatar, setEditAvatar] = useState(avatar);

  const handleProfileTap = () => {
    if (!editing) {
      setEditing(true);
      setEditNickname(nickname);
      setEditAvatar(avatar);
    }
  };

  const handleSaveProfile = () => {
    const name = editNickname.trim();
    if (!name) {
      showToast('昵称不能为空');
      return;
    }
    setUser({ nickname: name, avatar: editAvatar });
    setEditing(false);
    showToast('已保存');
  };

  const handleClearCache = () => {
    try {
      const info = Taro.getStorageInfoSync();
      setCacheSize(`${Math.ceil(info.currentSize)}KB`);
    } catch {
      // 忽略
    }
    Taro.clearStorageSync();
    setCacheSize('0KB');
    showToast('已清除缓存');
  };

  const handleLanguage = () => {
    Taro.showActionSheet({
      itemList: ['简体中文', 'English'],
      success: (res) => {
        setLanguage(res.tapIndex === 0 ? '简体中文' : 'English');
      },
    });
  };

  const handleAgreement = () => {
    Taro.showModal({ title: '用户协议', content: AGREEMENT_TEXT, showCancel: false });
  };

  const handlePrivacy = () => {
    Taro.showModal({ title: '隐私政策', content: PRIVACY_TEXT, showCancel: false });
  };

  return (
    <View className='settings-page'>
      <SubPageHeader title='设置' />

      <ScrollView className='settings-scroll' scrollY showScrollbar={false}>
        {/* 个人资料 */}
        <View className='settings-section'>
          <View className='settings-item' onClick={handleProfileTap}>
            <Text className='settings-item-icon'>👤</Text>
            <Text className='settings-item-title'>个人资料</Text>
            <Text className='settings-item-value'>{nickname}</Text>
            <Text className='settings-item-arrow'>›</Text>
          </View>

          {/* 编辑态展开 */}
          {editing && (
            <View className='settings-edit'>
              <View className='settings-edit-row'>
                <Text className='settings-edit-label'>头像</Text>
                <View className='settings-avatar-grid'>
                  {AVATAR_EMOJIS.map((emoji) => (
                    <View
                      key={emoji}
                      className={`settings-avatar-option ${editAvatar === emoji ? 'active' : ''}`}
                      onClick={() => setEditAvatar(emoji)}
                    >
                      <Text>{emoji}</Text>
                    </View>
                  ))}
                </View>
              </View>
              <View className='settings-edit-row'>
                <Text className='settings-edit-label'>昵称</Text>
                <Input
                  className='settings-edit-input'
                  value={editNickname}
                  onInput={(e) => setEditNickname(e.detail.value)}
                  maxlength={20}
                />
              </View>
              <View className='settings-edit-actions'>
                <View className='settings-edit-btn settings-edit-btn-ghost' onClick={() => setEditing(false)}>
                  <Text>取消</Text>
                </View>
                <View className='settings-edit-btn settings-edit-btn-primary' onClick={handleSaveProfile}>
                  <Text>保存</Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* 通知与隐私 */}
        <View className='settings-section'>
          <View className='settings-item'>
            <Text className='settings-item-icon'>🔔</Text>
            <Text className='settings-item-title'>消息通知</Text>
            <Switch
              checked={notifyEnabled}
              color='#FF7A59'
              onChange={(e) => setNotifyEnabled(e.detail.value)}
            />
          </View>
          <View className='settings-item'>
            <Text className='settings-item-icon'>🔒</Text>
            <Text className='settings-item-title'>隐私设置</Text>
            <Switch
              checked={privacyEnabled}
              color='#FF7A59'
              onChange={(e) => setPrivacyEnabled(e.detail.value)}
            />
          </View>
          <View className='settings-item' onClick={handleLanguage}>
            <Text className='settings-item-icon'>🌐</Text>
            <Text className='settings-item-title'>语言</Text>
            <Text className='settings-item-value'>{language}</Text>
            <Text className='settings-item-arrow'>›</Text>
          </View>
        </View>

        {/* 通用 */}
        <View className='settings-section'>
          <View className='settings-item' onClick={handleClearCache}>
            <Text className='settings-item-icon'>🗑️</Text>
            <Text className='settings-item-title'>清除缓存</Text>
            <Text className='settings-item-value'>{cacheSize}</Text>
            <Text className='settings-item-arrow'>›</Text>
          </View>
          <View className='settings-item' onClick={handleAgreement}>
            <Text className='settings-item-icon'>📋</Text>
            <Text className='settings-item-title'>用户协议</Text>
            <Text className='settings-item-arrow'>›</Text>
          </View>
          <View className='settings-item' onClick={handlePrivacy}>
            <Text className='settings-item-icon'>📄</Text>
            <Text className='settings-item-title'>隐私政策</Text>
            <Text className='settings-item-arrow'>›</Text>
          </View>
        </View>

        <View className='settings-footer'>
          <Text className='settings-version'>PawLife v1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}
