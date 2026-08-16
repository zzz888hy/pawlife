import { useRef, useCallback } from 'react';
import Taro from '@tarojs/taro';

export function useScrollToBottom() {
  const scrollViewRef = useRef<any>(null);

  const scrollToBottom = useCallback(() => {
    // Use setTimeout to wait for the next render cycle
    setTimeout(() => {
      if (scrollViewRef.current) {
        // 用 Taro 的 createSelectorQuery 替代全局 wx
        const query = Taro.createSelectorQuery();
        query.select('.chat-area').boundingClientRect();
        query.select('.chat-bottom').boundingClientRect();
        query.exec((res: any[]) => {
          if (res[0] && res[1]) {
            // Logic to scroll to bottom
          }
        });
      }
    }, 100);
  }, []);

  return { scrollViewRef, scrollToBottom };
}
