import Taro from '@tarojs/taro';
import { MOCK_ENABLED } from './mock';

const BASE_URL = 'https://api.pawlife.app';

interface RequestOptions {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: Record<string, unknown>;
  header?: Record<string, string>;
  showLoading?: boolean;
}

export async function request<T>(options: RequestOptions): Promise<T> {
  if (MOCK_ENABLED) {
    throw new Error('Mock mode: request should not be called directly. Use service modules.');
  }

  const { url, method = 'GET', data, header = {}, showLoading = false } = options;

  if (showLoading) {
    Taro.showLoading({ title: '加载中...', mask: true });
  }

  try {
    const token = Taro.getStorageSync('pawlife_token');
    const res = await Taro.request({
      url: `${BASE_URL}${url}`,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...header,
      },
    });

    if (res.statusCode === 200) {
      const body = res.data as { code: number; data: T; message: string };
      if (body.code === 0) {
        return body.data;
      }
      throw new Error(body.message || 'Request failed');
    } else if (res.statusCode === 401) {
      // Token expired, redirect to login
      Taro.removeStorageSync('pawlife_token');
      throw new Error('请重新登录');
    } else {
      throw new Error(`Request failed: ${res.statusCode}`);
    }
  } finally {
    if (showLoading) {
      Taro.hideLoading();
    }
  }
}
