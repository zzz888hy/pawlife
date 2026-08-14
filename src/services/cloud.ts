/**
 * 微信云开发服务层
 * 封装云函数调用，统一处理返回格式
 */
import Taro from '@tarojs/taro';
import { MOCK_ENABLED } from './mock';

interface CloudResult<T = unknown> {
  code: number;
  data?: T;
  message?: string;
}

/**
 * 调用云函数
 */
export async function callCloudFunction<T = unknown>(
  name: string,
  data?: Record<string, unknown>
): Promise<T> {
  if (MOCK_ENABLED) {
    // Mock 模式下，延迟后返回 null，由 service 层使用 mock 数据
    await new Promise((r) => setTimeout(r, 300));
    return null as T;
  }

  try {
    const res = await Taro.cloud.callFunction({
      name,
      data: data || {},
    });

    const result = res.result as CloudResult<T>;

    if (result.code === 0) {
      return (result.data || result) as T;
    }
    throw new Error(result.message || '云函数调用失败');
  } catch (err) {
    console.error(`Cloud function [${name}] error:`, err);
    throw err;
  }
}

/**
 * 初始化云开发环境
 * 在 app.tsx 中调用
 */
export function initCloud() {
  if (Taro.cloud && !MOCK_ENABLED) {
    Taro.cloud.init({
      env: 'your-env-id', // 替换为你的云开发环境 ID
      traceUser: true,
    });
  }
}

/**
 * 上传文件到云存储
 */
export async function uploadFile(filePath: string, cloudPath: string): Promise<string> {
  if (MOCK_ENABLED) {
    await new Promise((r) => setTimeout(r, 500));
    return filePath; // Mock 模式返回原路径
  }

  try {
    const res = await Taro.cloud.uploadFile({
      cloudPath,
      filePath,
    });
    return res.fileID;
  } catch (err) {
    console.error('Upload error:', err);
    throw err;
  }
}

/**
 * 选择图片
 */
export async function chooseImage(count = 1): Promise<string[]> {
  if (MOCK_ENABLED) {
    // Mock 模式下返回空数组
    return [];
  }

  try {
    const res = await Taro.chooseImage({
      count,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
    });
    return res.tempFilePaths;
  } catch (err) {
    console.error('Choose image error:', err);
    return [];
  }
}
