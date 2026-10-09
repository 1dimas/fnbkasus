import { create } from 'zustand';
import { CartItem, OrderDetails, Product, SelectedItemOptions } from '@/types';

interface CartStore {
  items: CartItem[];
  isCartOpen: boolean;
  orderDetails: OrderDetails;
  
  addItem: (
    product: Product,
    quantity?: number,
    notes?: string,
    optionsSummary?: string,
    options?: SelectedItemOptions
  ) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  setItemQuantity: (cartItemId: string, quantity: number) => void;
  updateItemNotes: (cartItemId: string, notes: string) => void;
  clearCart: () => void;
  setIsCartOpen: (open: boolean) => void;
  setOrderDetails: (details: Partial<OrderDetails>) => void;
  
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getProductCartQuantity: (productId: number) => number;
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

  addItem: (product, quantity = 1, notes = '', optionsSummary = '', options) => {
    set((state) => {
      // Find if an item with EXACT same product id, options summary, and notes already exists
      const existingIndex = state.items.findIndex(
        (item) =>
          item.product.id === product.id &&
          (item.optionsSummary || '') === (optionsSummary || '') &&
          (item.notes || '').trim() === (notes || '').trim()
      );

      if (existingIndex > -1) {
        const updatedItems = [...state.items];
        updatedItems[existingIndex].quantity += quantity;
        return { items: updatedItems };
      }

      const newItemId = `${product.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

      return {
        items: [
          ...state.items,
          {
            id: newItemId,
            product,
            quantity,
            notes,
            optionsSummary,
            options,
          },
        ],
      };
    });
  },

  removeItem: (cartItemId) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== cartItemId),
    }));
  },

  updateQuantity: (cartItemId, delta) => {
    set((state) => {
      const updatedItems = state.items
        .map((item) => {
          if (item.id === cartItemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];

      return { items: updatedItems };
    });
  },

  setItemQuantity: (cartItemId, quantity) => {
    set((state) => {
      if (quantity <= 0) {
        return {
          items: state.items.filter((item) => item.id !== cartItemId),
        };
      }
      return {
        items: state.items.map((item) =>
          item.id === cartItemId ? { ...item, quantity } : item
        ),
      };
    });
  },

  updateItemNotes: (cartItemId, notes) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.id === cartItemId ? { ...item, notes } : item
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

  getProductCartQuantity: (productId: number) => {
    return get()
      .items.filter((item) => item.product.id === productId)
      .reduce((sum, item) => sum + item.quantity, 0);
  },
}));

