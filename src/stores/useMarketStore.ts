import { create } from 'zustand';
import type { Product, MarketCategory, CartItem, Order, OrderItem, OrderStatus } from '@/types';
import { mockMarketCategories } from '@/services/mock/market.mock';
import {
  fetchProducts as fetchProductsApi,
  createProduct as createProductApi,
  addToCart as addToCartApi,
  removeFromCart as removeFromCartApi,
  clearCart as clearCartApi,
  fetchCart as fetchCartApi,
  placeOrder as placeOrderApi,
  fetchOrders as fetchOrdersApi,
  updateOrderStatus as updateOrderStatusApi,
} from '@/services/market';

interface MarketState {
  products: Product[];
  categories: MarketCategory[];
  activeCategory: string;
  cart: CartItem[];
  orders: Order[];
  loading: boolean;
  fetchProducts: (category?: string) => Promise<void>;
  fetchCart: () => Promise<void>;
  fetchOrders: () => Promise<void>;
  setCategory: (cat: string) => void;
  addToCart: (productId: string) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  getProductById: (id: string) => Product | undefined;
  addProduct: (data: Omit<Product, 'id' | 'sold'>) => Promise<Product>;
  placeOrder: (items: OrderItem[], totalPrice: number) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
}

export const useMarketStore = create<MarketState>((set, get) => ({
  products: [],
  categories: mockMarketCategories,
  activeCategory: '用品',
  cart: [],
  orders: [],
  loading: false,

  fetchProducts: async (category) => {
    set({ loading: true });
    try {
      const products = await fetchProductsApi(category);
      set({ products, activeCategory: category || '用品', loading: false });
    } catch {
      set({ loading: false });
    }
  },

  fetchCart: async () => {
    try {
      const cart = await fetchCartApi();
      set({ cart });
    } catch {
      /* ignore */
    }
  },

  fetchOrders: async () => {
    try {
      const orders = await fetchOrdersApi();
      set({ orders });
    } catch {
      /* ignore */
    }
  },

  setCategory: (cat) => set({ activeCategory: cat }),

  addToCart: (productId) => {
    set((s) => {
      const existing = s.cart.find((c) => c.productId === productId);
      if (existing) {
        return {
          cart: s.cart.map((c) =>
            c.productId === productId ? { ...c, quantity: c.quantity + 1 } : c
          ),
        };
      }
      return { cart: [...s.cart, { productId, quantity: 1 }] };
    });
    addToCartApi(productId).catch(() => {});
  },

  removeFromCart: (productId) => {
    set((s) => ({ cart: s.cart.filter((c) => c.productId !== productId) }));
    removeFromCartApi(productId).catch(() => {});
  },

  clearCart: () => {
    set({ cart: [] });
    clearCartApi().catch(() => {});
  },

  getProductById: (id) => get().products.find((p) => p.id === id),

  addProduct: async (data) => {
    const product = await createProductApi(data);
    set((s) => ({ products: [product, ...s.products] }));
    return product;
  },

  placeOrder: async (items, totalPrice) => {
    const order = await placeOrderApi(items, totalPrice);
    set((s) => ({ orders: [order, ...s.orders] }));
    return order;
  },

  updateOrderStatus: (orderId, status) => {
    set((s) => ({
      orders: s.orders.map((o) => (o.id === orderId ? { ...o, status } : o)),
    }));
    updateOrderStatusApi(orderId, status).catch(() => {});
  },
}));
