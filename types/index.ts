export interface Category {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  isAvailable: boolean;
  categoryId: number;
  category?: Category;
  imageUrl?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  notes?: string;
}

export interface OrderDetails {
  customerName: string;
  tableNumber: string;
  orderType: 'dine-in' | 'takeaway';
  generalNotes?: string;
}

export type OrderStatus = 'pending' | 'diproses' | 'selesai' | 'dibatalkan';

export interface OrderItemRecord {
  id?: number;
  productId?: number;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
  notes?: string;
}

export interface OrderRecord {
  id: number;
  orderCode: string;
  tableNumber: string;
  customerName: string;
  orderType: 'dine-in' | 'takeaway';
  generalNotes?: string;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  items: OrderItemRecord[];
}

