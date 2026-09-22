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
 * 本次前端构建期望的云函数版本号。
 * 必须与 cloudfunctions/{login,user,friend}/index.js 里的 BUILD 保持一致：
 * 改动云函数后，把三处 BUILD 和这里的值一起 +1，再重新部署。
 */
export const EXPECTED_CLOUD_BUILD = '2026-09-22.1';

/**
 * 探测某个云函数当前部署的版本号。
 * 返回 '' 表示云端是旧版代码（没有 build 字段，说明还没重新部署）；
 * 返回 null 表示调用失败（函数不存在或网络异常）。
 */
export async function probeCloudBuild(name: string): Promise<string | null> {
  if (MOCK_ENABLED) return EXPECTED_CLOUD_BUILD; // mock 模式没有云函数，视为一致
  try {
    const res = await Taro.cloud.callFunction({ name, data: { action: '__ping' } });
    const result = res.result as { build?: string } | undefined;
    return (result && result.build) || '';
  } catch {
    return null;
  }
}

/**
 * 初始化云开发环境
 * 在 app.tsx 中调用
 */
export function initCloud() {
  if (Taro.cloud && !MOCK_ENABLED) {
    Taro.cloud.init({
      env: 'cloud1-d0g65xdsg79dc9e22',
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

/**
 * 将临时图片路径转成 base64 data URL，用于本地预览
 * 避免开发者工具里直接渲染 http 临时路径触发 CORS 报错
 */
export function toDataUrl(filePath: string): Promise<string> {
  return new Promise((resolve) => {
    if (!filePath || filePath.startsWith('cloud://') || filePath.startsWith('data:')) {
      resolve(filePath);
      return;
    }
    try {
      const fs = Taro.getFileSystemManager();
      fs.readFile({
        filePath,
        encoding: 'base64',
        success: (res) => {
          const ext = (filePath.split('?')[0].split('.').pop() || '').toLowerCase();
          const mime =
            ext === 'png' ? 'image/png'
              : ext === 'gif' ? 'image/gif'
              : ext === 'webp' ? 'image/webp'
              : 'image/jpeg';
          resolve(`data:${mime};base64,${res.data as string}`);
        },
        fail: () => resolve(filePath),
      });
    } catch {
      resolve(filePath);
    }
  });
}
