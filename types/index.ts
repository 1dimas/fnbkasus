export interface Category {
  id: number;
  name: string;
}

export interface ProductCustomizationConfig {
  allowsTemperature?: boolean; // Hot (Panas) or Cold (Dingin)
  allowsSugarLevel?: boolean; // Normal, Less Sugar, No Sugar
  allowsIceLevel?: boolean; // Normal, Less Ice, No Ice
  allowsHeating?: boolean; // Hangat (Dipanaskan) or Standar
  allowsSpiciness?: boolean; // Level pedas
  isComboPackage?: boolean; // Paket hemat makan & minum
  comboFoodOptions?: string[];
  comboDrinkOptions?: string[];
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
  customizationConfig?: ProductCustomizationConfig;
}

export interface SelectedItemOptions {
  temperature?: 'Panas (Hot)' | 'Dingin (Ice)';
  sugarLevel?: 'Normal Sugar' | 'Less Sugar (50%)' | 'No Sugar (0%)';
  iceLevel?: 'Normal Ice' | 'Less Ice' | 'No Ice';
  servingTemp?: 'Hangat (Dipanaskan)' | 'Fresh Saji (Langsung Saji)';
  spiciness?: 'Tidak Pedas' | 'Sedang' | 'Pedas';
  selectedFood?: string;
  selectedDrink?: string;
  comboDrinkTemperature?: 'Panas (Hot)' | 'Dingin (Ice)';
  comboSugarLevel?: 'Normal Sugar' | 'Less Sugar' | 'No Sugar';
}

export interface CartItem {
  id: string; // Unique cart item identifier
  product: Product;
  quantity: number;
  notes?: string;
  optionsSummary?: string; // e.g. "Panas • Less Sugar (50%)"
  options?: SelectedItemOptions;
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


