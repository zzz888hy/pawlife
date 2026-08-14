import { PropsWithChildren } from 'react';
import { useLaunch } from '@tarojs/taro';
import { initCloud } from '@/services/cloud';
import { useUserStore } from '@/stores/useUserStore';
import './app.scss';

function App({ children }: PropsWithChildren) {
  const fetchUser = useUserStore((s) => s.fetchUser);

  useLaunch(() => {
    console.log('PawLife App launched.');
    // 初始化云开发
    initCloud();

    // 尝试自动登录
    fetchUser().catch(() => {
      console.log('未登录或登录失败，使用游客模式');
    });
  });

  return <>{children}</>;
}

export default App;
