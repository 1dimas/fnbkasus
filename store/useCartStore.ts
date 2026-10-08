import { create } from 'zustand';
import { CartItem, OrderDetails, Product } from '@/types';

interface CartStore {
  items: CartItem[];
  isCartOpen: boolean;
  orderDetails: OrderDetails;
  
  addItem: (product: Product, quantity?: number, notes?: string) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, delta: number) => void;
  setItemQuantity: (productId: number, quantity: number) => void;
  updateItemNotes: (productId: number, notes: string) => void;
  clearCart: () => void;
  setIsCartOpen: (open: boolean) => void;
  setOrderDetails: (details: Partial<OrderDetails>) => void;
  
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  isCartOpen: false,
  orderDetails: {
    customerName: '',
    tableNumber: '',
    orderType: 'dine-in',
    generalNotes: '',
  },

  addItem: (product, quantity = 1, notes = '') => {
    set((state) => {
      const existingIndex = state.items.findIndex(
        (item) => item.product.id === product.id
      );

      if (existingIndex > -1) {
        const updatedItems = [...state.items];
        updatedItems[existingIndex].quantity += quantity;
        if (notes) {
          updatedItems[existingIndex].notes = notes;
        }
        return { items: updatedItems };
      }

      return {
        items: [...state.items, { product, quantity, notes }],
      };
    });
  },

  removeItem: (productId) => {
    set((state) => ({
      items: state.items.filter((item) => item.product.id !== productId),
    }));
  },

  updateQuantity: (productId, delta) => {
    set((state) => {
      const updatedItems = state.items
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];

      return { items: updatedItems };
    });
  },

  setItemQuantity: (productId, quantity) => {
    set((state) => {
      if (quantity <= 0) {
        return {
          items: state.items.filter((item) => item.product.id !== productId),
        };
      }
      return {
        items: state.items.map((item) =>
          item.product.id === productId ? { ...item, quantity } : item
        ),
      };
    });
  },

  updateItemNotes: (productId, notes) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.product.id === productId ? { ...item, notes } : item
      ),
    }));
  },

  clearCart: () => {
    set({ items: [] });
  },

  setIsCartOpen: (open) => {
    set({ isCartOpen: open });
  },

  setOrderDetails: (details) => {
    set((state) => ({
      orderDetails: { ...state.orderDetails, ...details },
    }));
  },

  getTotalItems: () => {
    return get().items.reduce((total, item) => total + item.quantity, 0);
  },

  getTotalPrice: () => {
    return get().items.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  },
}));
