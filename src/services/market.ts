/**
 * 商城服务层：商品 / 购物车 / 订单
 */
import type { Product, CartItem, Order, OrderItem, OrderStatus } from '@/types';
import { MOCK_ENABLED } from './mock';
import { mockProducts } from './mock/market.mock';
import { callCloudFunction } from './cloud';
import { generateId } from '@/utils/format';

const BG_GRADIENTS = [
  'linear-gradient(135deg,#FFF0EA,#FFE4D6)',
  'linear-gradient(135deg,#E8F5E9,#C8E6C9)',
  'linear-gradient(135deg,#FFF3E0,#FFE0B2)',
  'linear-gradient(135deg,#E3F2FD,#BBDEFB)',
  'linear-gradient(135deg,#FFEBEE,#FFCDD2)',
  'linear-gradient(135deg,#F3E5F5,#E1BEE7)',
];

function pickBg(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 997;
  return BG_GRADIENTS[h % BG_GRADIENTS.length];
}

function formatSold(n: number): string {
  if (!n) return '0';
  if (n >= 10000) return `${(n / 10000).toFixed(1)}万`;
  return `${n}`;
}

function toProduct(raw: any): Product {
  return {
    id: raw._id,
    emoji: raw.emoji || raw.image || '🐾',
    name: raw.name,
    price: raw.price,
    oldPrice: raw.oldPrice || raw.price,
    sold: formatSold(raw.soldCount || 0),
    bg: raw.bg || pickBg(raw._id),
    category: raw.category,
    sellerType: raw.sellerType === 'personal' ? 'personal' : 'merchant',
    description: raw.description,
    rating: raw.rating,
    tags: raw.tags || [],
    images: raw.images || undefined,
  };
}

function toOrder(raw: any): Order {
  return {
    id: raw._id,
    orderNo: raw.orderNo,
    items: raw.items || [],
    totalPrice: raw.totalPrice,
    status: raw.status,
    createdAt: raw.createdAt,
  };
}

function toCartItem(raw: any): CartItem {
  return { productId: raw.productId, quantity: raw.quantity };
}

export async function fetchProducts(category?: string): Promise<Product[]> {
  if (MOCK_ENABLED) return [...mockProducts];
  const list = await callCloudFunction<any[]>('product', { action: 'list', data: { category } });
  return (list || []).map(toProduct);
}

export async function createProduct(data: Record<string, unknown>): Promise<Product> {
  if (MOCK_ENABLED) {
    return {
      id: generateId(),
      emoji: (data.emoji as string) || '🐾',
      name: (data.name as string) || '商品',
      price: (data.price as number) || 0,
      oldPrice: (data.oldPrice as number) || (data.price as number) || 0,
      sold: '0',
      bg: (data.bg as string) || pickBg('mock'),
      category: (data.category as string) || '用品',
      sellerType: (data.sellerType as 'merchant' | 'personal') || 'merchant',
      description: data.description as string | undefined,
      images: (data.images as string[]) || undefined,
    };
  }
  const raw = await callCloudFunction<any>('product', { action: 'create', data });
  return toProduct(raw);
}

export async function addToCart(productId: string): Promise<void> {
  if (MOCK_ENABLED) return;
  await callCloudFunction('order', { action: 'cartAdd', data: { productId, quantity: 1 } });
}

export async function removeFromCart(productId: string): Promise<void> {
  if (MOCK_ENABLED) return;
  await callCloudFunction('order', { action: 'cartRemove', data: { productId } });
}

export async function clearCart(): Promise<void> {
  if (MOCK_ENABLED) return;
  await callCloudFunction('order', { action: 'cartClear', data: {} });
}

export async function fetchCart(): Promise<CartItem[]> {
  if (MOCK_ENABLED) return [];
  const list = await callCloudFunction<any[]>('order', { action: 'cartList', data: {} });
  return (list || []).map(toCartItem);
}

export async function placeOrder(items: OrderItem[], totalPrice: number): Promise<Order> {
  if (MOCK_ENABLED) {
    return {
      id: generateId(),
      orderNo: `PL${Date.now()}`,
      items,
      totalPrice: Math.round(totalPrice * 10) / 10,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
  }
  const raw = await callCloudFunction<any>('order', { action: 'create', data: { items, totalPrice } });
  return toOrder(raw);
}

export async function fetchOrders(): Promise<Order[]> {
  if (MOCK_ENABLED) return [];
  const list = await callCloudFunction<any[]>('order', { action: 'list', data: {} });
  return (list || []).map(toOrder);
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
  if (MOCK_ENABLED) return;
  await callCloudFunction('order', { action: 'updateStatus', data: { orderId, status } });
}
