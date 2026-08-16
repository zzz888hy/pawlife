/**
 * 用户认证与登录服务
 */
import Taro from '@tarojs/taro';
import { callCloudFunction } from './cloud';
import { MOCK_ENABLED } from './mock';

interface UserData {
  _id: string;
  openid: string;
  nickname: string;
  avatarUrl: string;
  coins: number;
  isVip: boolean;
  vipExpireDate: string | null;
  petCount: number;
  recordCount: number;
  createdAt?: string;
  isNew?: boolean;
}

/**
 * 微信登录
 */
export async function login(nickname?: string, avatarUrl?: string): Promise<UserData> {
  if (MOCK_ENABLED) {
    await new Promise((r) => setTimeout(r, 300));
    return {
      _id: 'mock-user-id',
      openid: 'mock-openid',
      nickname: nickname || '宠物主人',
      avatarUrl: avatarUrl || '😎',
      coins: 386,
      isVip: false,
      vipExpireDate: null,
      petCount: 2,
      recordCount: 142,
      isNew: false,
    };
  }

  return callCloudFunction<UserData>('login', { nickname, avatarUrl });
}

/**
 * 获取用户信息
 */
export async function getUserProfile(): Promise<UserData> {
  return callCloudFunction<UserData>('user', { action: 'getProfile' });
}

/**
 * 更新用户信息
 */
export async function updateUserProfile(data: Record<string, unknown>): Promise<void> {
  await callCloudFunction('user', { action: 'updateProfile', data });
}

/**
 * 添加金币
 */
export async function addUserCoins(amount: number): Promise<void> {
  await callCloudFunction('user', { action: 'addCoins', data: { amount } });
}

/**
 * 开通VIP
 */
export async function activateVip(plan: 'monthly' | 'yearly'): Promise<void> {
  await callCloudFunction('user', { action: 'setVip', data: { plan } });
}

/**
 * 微信支付（模拟）
 */
export async function requestPayment(total: number, description: string): Promise<boolean> {
  if (MOCK_ENABLED) {
    await new Promise((r) => setTimeout(r, 500));
    Taro.showToast({ title: `已支付 ¥${total}`, icon: 'success' });
    return true;
  }

  // 实际微信支付流程需要调用云函数获取支付参数
  try {
    const res = await Taro.cloud.callFunction({
      name: 'order',
      data: { action: 'pay', data: { total, description } },
    });
    const payParams = (res.result as any)?.data;
    if (payParams) {
      await Taro.requestPayment(payParams);
      return true;
    }
    return false;
  } catch (err) {
    console.error('Payment error:', err);
    return false;
  }
}
