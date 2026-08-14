import Taro from '@tarojs/taro';

export const storage = {
  get<T>(key: string, defaultValue?: T): T | undefined {
    try {
      const raw = Taro.getStorageSync(key);
      return raw ? (JSON.parse(raw) as T) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  set(key: string, value: unknown): void {
    try {
      Taro.setStorageSync(key, JSON.stringify(value));
    } catch (e) {
      console.error('Storage set error:', e);
    }
  },

  remove(key: string): void {
    try {
      Taro.removeStorageSync(key);
    } catch (e) {
      console.error('Storage remove error:', e);
    }
  },

  clear(): void {
    try {
      Taro.clearStorageSync();
    } catch (e) {
      console.error('Storage clear error:', e);
    }
  },
};
