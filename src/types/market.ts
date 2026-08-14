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

export type OrderStatus =
  | 'pending' // 待付款
  | 'paid' // 待发货
  | 'shipped' // 待收货
  | 'completed' // 已完成
  | 'cancelled'; // 已取消

export interface OrderItem {
  productId: string;
  name: string;
  emoji: string;
  bg: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  orderNo: string;
  items: OrderItem[];
  totalPrice: number;
  status: OrderStatus;
  createdAt: string;
}
