import Taro from '@tarojs/taro';

type SubPageName =
  | 'ai-assistant'
  | 'memorial-hall'
  | 'create-pet'
  | 'health-records'
  | 'vip-membership'
  | 'product-detail'
  | 'pet-story'
  | 'orders'
  | 'wallet'
  | 'settings'
  | 'pet-identity'
  | 'rank'
  | 'search';

type TabName = 'hall' | 'pet-center' | 'post-modal' | 'marketplace' | 'profile';

const TAB_PATHS: Record<TabName, string> = {
  'hall': '/pages/hall/index',
  'pet-center': '/pages/pet-center/index',
  'post-modal': '/pages/post-modal/index',
  'marketplace': '/pages/marketplace/index',
  'profile': '/pages/profile/index',
};

/**
 * Navigate to a sub-page
 */
export function navigateTo(page: SubPageName, params?: Record<string, string>) {
  const basePath = `/pages/sub-pages/${page}/index`;
  if (params) {
    const query = Object.entries(params)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join('&');
    return Taro.navigateTo({ url: `${basePath}?${query}` });
  }
  return Taro.navigateTo({ url: basePath });
}

/**
 * Switch to a tab
 */
export function switchTab(tab: TabName) {
  return Taro.switchTab({ url: TAB_PATHS[tab] });
}

/**
 * Go back
 */
export function goBack(delta = 1) {
  return Taro.navigateBack({ delta });
}

/**
 * Navigate to product detail
 */
export function goToProduct(productId: string) {
  return navigateTo('product-detail', { id: productId });
}
