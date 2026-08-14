import { create } from 'zustand';
import type { Product, MarketCategory, CartItem, Order, OrderItem, OrderStatus } from '@/types';
import { mockProducts, mockMarketCategories } from '@/services/mock/market.mock';
import { generateId } from '@/utils/format';

interface MarketState {
  products: Product[];
  categories: MarketCategory[];
  activeCategory: string;
  cart: CartItem[];
  orders: Order[];
  loading: boolean;
  fetchProducts: (category?: string) => void;
  setCategory: (cat: string) => void;
  addToCart: (productId: string) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  getProductById: (id: string) => Product | undefined;
  addProduct: (data: Omit<Product, 'id' | 'sold'>) => Product;
  placeOrder: (items: OrderItem[], totalPrice: number) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
}

export const useMarketStore = create<MarketState>((set, get) => ({
  products: [],
  categories: mockMarketCategories,
  activeCategory: '用品',
  cart: [],
  orders: [],
  loading: false,

  fetchProducts: (category?: string) => {
    set({ loading: true });
    const cat = category || '用品';
    setTimeout(() => {
      set({
        products: mockProducts,
        activeCategory: cat,
        loading: false,
      });
    }, 200);
  },

  setCategory: (cat: string) => set({ activeCategory: cat }),

  addToCart: (productId: string) => {
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
  },

  removeFromCart: (productId: string) => {
    set((s) => ({
      cart: s.cart.filter((c) => c.productId !== productId),
    }));
  },

  clearCart: () => set({ cart: [] }),

  getProductById: (id: string) => {
    return get().products.find((p) => p.id === id);
  },

  addProduct: (data: Omit<Product, 'id' | 'sold'>) => {
    const product: Product = {
      ...data,
      id: generateId(),
      sold: '0',
    };
    set((s) => ({ products: [product, ...s.products] }));
    return product;
  },

  placeOrder: (items: OrderItem[], totalPrice: number) => {
    const order: Order = {
      id: generateId(),
      orderNo: `PL${Date.now()}`,
      items,
      totalPrice: Math.round(totalPrice * 10) / 10,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    set((s) => ({ orders: [order, ...s.orders] }));
    return order;
  },

  updateOrderStatus: (orderId: string, status: OrderStatus) => {
    set((s) => ({
      orders: s.orders.map((o) => (o.id === orderId ? { ...o, status } : o)),
    }));
  },
}));
