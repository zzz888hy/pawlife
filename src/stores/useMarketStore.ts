import { create } from 'zustand';
import type { Product, MarketCategory, CartItem } from '@/types';
import { mockProducts, mockMarketCategories } from '@/services/mock/market.mock';

interface MarketState {
  products: Product[];
  categories: MarketCategory[];
  activeCategory: string;
  cart: CartItem[];
  loading: boolean;
  fetchProducts: (category?: string) => void;
  setCategory: (cat: string) => void;
  addToCart: (productId: string) => void;
  removeFromCart: (productId: string) => void;
  getProductById: (id: string) => Product | undefined;
}

export const useMarketStore = create<MarketState>((set, get) => ({
  products: [],
  categories: mockMarketCategories,
  activeCategory: '用品',
  cart: [],
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

  getProductById: (id: string) => {
    return get().products.find((p) => p.id === id);
  },
}));
