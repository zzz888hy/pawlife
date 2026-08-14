// API endpoint constants
export const API = {
  // Auth
  AUTH_LOGIN: '/api/auth/login',
  USER_PROFILE: '/api/user/profile',

  // Pets
  PETS: '/api/pets',
  PET_DETAIL: (id: string) => `/api/pets/${id}`,
  PET_TIMELINE: (id: string) => `/api/pets/${id}/timeline`,

  // Feed
  FEED_LIST: '/api/feed',
  FEED_LIKE: (id: string) => `/api/feed/${id}/like`,
  FEED_COMMENT: (id: string) => `/api/feed/${id}/comment`,

  // Market
  MARKET_PRODUCTS: '/api/market/products',
  MARKET_PRODUCT: (id: string) => `/api/market/products/${id}`,
  MARKET_CART: '/api/market/cart',
  MARKET_ORDERS: '/api/market/orders',

  // Tasks
  TASKS: '/api/tasks',
  TASK_COMPLETE: (id: string) => `/api/tasks/${id}/complete`,

  // AI
  AI_CHAT: '/api/ai/chat',
  AI_STORY: '/api/ai/story',
  AI_HEALTH: '/api/ai/health',
  AI_HISTORY: (petId: string) => `/api/ai/history/${petId}`,

  // Memorial
  MEMORIAL: '/api/memorial',
  MEMORIAL_SERVICE: '/api/memorial/service',
} as const;
