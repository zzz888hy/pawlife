import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import SubPageHeader from '@/components/SubPageHeader';
import { useAppStore } from '@/stores/useAppStore';
import './index.scss';

const APP_VERSION = '1.0.0';

export default function AboutPage() {
  const showToast = useAppStore((s) => s.showToast);

  const handleAgreement = () => {
    Taro.showModal({
      title: '用户协议',
      content:
        '欢迎使用 PawLife。使用本应用即表示你同意遵守相关社区规范，善待每一只宠物，文明发言，共同维护温暖的宠物社区。',
      showCancel: false,
      confirmText: '我知道了',
    });
  };

  const handlePrivacy = () => {
    Taro.showModal({
      title: '隐私政策',
      content:
        '我们非常重视你的隐私。你的宠物档案、照片等数据仅用于提供更好的服务，未经你的授权不会向第三方披露。',
      showCancel: false,
      confirmText: '我知道了',
    });
  };

  const handleCheckUpdate = () => {
    showToast('当前已是最新版本');
  };

  return (
    <View className='about-page'>
      <SubPageHeader title='关于PawLife' />

      <ScrollView className='about-scroll' scrollY showScrollbar={false}>
        {/* Hero */}
        <View className='about-hero'>
          <View className='about-logo'>
            <Text>🐾</Text>
          </View>
          <Text className='about-name'>PawLife</Text>
          <Text className='about-slogan'>宠物数字生命空间</Text>
          <Text className='about-version'>v{APP_VERSION}</Text>
        </View>

        {/* Intro */}
        <View className='about-card'>
          <Text className='about-card-title'>关于我们</Text>
          <Text className='about-card-desc'>
            PawLife 是一个专注于宠物数字生命记录与社区互动的空间。我们相信每一只宠物都值得被认真记录、被温柔对待。
          </Text>
          <Text className='about-card-desc'>
            在这里，你可以建立宠物档案、记录成长瞬间、分享日常、结识更多爱宠同好，为离世的伙伴点亮星光纪念。
          </Text>
        </View>

        {/* Menu */}
        <View className='about-menu'>
          <View className='about-menu-item' onClick={handleAgreement}>
            <Text className='about-menu-label'>用户协议</Text>
            <Text className='about-menu-arrow'>›</Text>
          </View>
          <View className='about-menu-item' onClick={handlePrivacy}>
            <Text className='about-menu-label'>隐私政策</Text>
            <Text className='about-menu-arrow'>›</Text>
          </View>
          <View className='about-menu-item' onClick={handleCheckUpdate}>
            <Text className='about-menu-label'>检查更新</Text>
            <Text className='about-menu-arrow'>›</Text>
          </View>
        </View>

        {/* Copyright */}
        <View className='about-copyright'>
          <Text>© 2026 PawLife · 让每一份陪伴都有迹可循</Text>
        </View>

        <View className='about-bottom-safe' />
      </ScrollView>
    </View>
  );
}
