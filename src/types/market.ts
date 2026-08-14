export interface Product {
  id: string;
  emoji: string;
  name: string;
  price: number;
  oldPrice: number;
  sold: string;         // "3.2万"
  bg: string;           // gradient
  category: string;
  description?: string;
  rating?: number;
  tags?: string[];
}

export interface MarketCategory {
  id: string;
  emoji: string;
  name: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface CommunityReview {
  id: string;
  userName: string;
  userAvatar: string;
  text: string;
  purchased: boolean;
}
