// App-wide constants

export const APP_NAME = 'PawLife';
export const APP_VERSION = '1.0.0';

// Coin rewards
export const COIN_REWARD_FEED = 5;
export const COIN_REWARD_WALK = 5;
export const COIN_REWARD_PHOTO = 10;

// VIP
export const VIP_MONTHLY_PRICE = 19.9;
export const VIP_YEARLY_PRICE = 199;
export const VIP_MONTHLY_PER_DAY = '0.66';
export const VIP_YEARLY_PER_DAY = '0.55';

// Memorial
export const MEMORIAL_SERVICE_PRICE = 199;
export const MEMORIAL_SERVICE_ORIGINAL_PRICE = 999;

// Pagination
export const PAGE_SIZE = 20;

// Storage keys
export const STORAGE_KEYS = {
  SPLASH_SHOWN: 'pawlife_splash_shown',
  USER_TOKEN: 'pawlife_token',
  ACTIVE_TAB: 'pawlife_active_tab',
} as const;
