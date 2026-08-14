import { useRef, useCallback } from 'react';

export function useScrollToBottom() {
  const scrollViewRef = useRef<any>(null);

  const scrollToBottom = useCallback(() => {
    // Use setTimeout to wait for the next render cycle
    setTimeout(() => {
      if (scrollViewRef.current) {
        // For ScrollView in Taro, we can use the scrollTop prop
        // but it's a controlled prop. Instead, we can use
        // the createSelectorQuery API
        const query = wx.createSelectorQuery();
        query.select('.chat-area').boundingClientRect();
        query.select('.chat-bottom').boundingClientRect();
        query.exec((res) => {
          if (res[0] && res[1]) {
            // Logic to scroll to bottom
          }
        });
      }
    }, 100);
  }, []);

  return { scrollViewRef, scrollToBottom };
}
