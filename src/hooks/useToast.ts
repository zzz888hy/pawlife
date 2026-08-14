import Taro from '@tarojs/taro';

export function useToast() {
  const showToast = (msg: string, icon: 'success' | 'error' | 'none' = 'none') => {
    Taro.showToast({
      title: msg,
      icon,
      duration: 2000,
    });
  };

  const hideToast = () => {
    Taro.hideToast();
  };

  return { showToast, hideToast };
}
