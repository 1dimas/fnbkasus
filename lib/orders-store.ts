import { OrderRecord } from '@/types';

// In-memory global store across API requests for local development
declare global {
  // eslint-disable-next-line no-var
  var __GLOBAL_ORDERS__: OrderRecord[] | undefined;
}

if (!global.__GLOBAL_ORDERS__) {
  // Pre-fill with a couple of aesthetic initial sample orders so cashier dashboard isn't empty when opened!
  global.__GLOBAL_ORDERS__ = [
    {
      id: 1,
      orderCode: 'NB-2026-001',
      tableNumber: '02',
      customerName: 'Arya',
      orderType: 'dine-in',
      generalNotes: 'Disajikan hangat ya kak',
      totalAmount: 50000,
      status: 'diproses',
      createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      items: [
        {
          id: 1,
          productId: 1,
          productName: 'Monochrome Black Espresso',
          quantity: 1,
          price: 22000,
          subtotal: 22000,
          notes: 'Double shot',
        },
        {
          id: 2,
          productId: 2,
          productName: 'Noir Flat White',
          quantity: 1,
          price: 28000,
          subtotal: 28000,
          notes: 'Oat milk',
        },
      ],
    },
    {
      id: 2,
      orderCode: 'NB-2026-002',
      tableNumber: '05',
      customerName: 'Siti',
      orderType: 'dine-in',
      generalNotes: 'Disajikan langsung ke meja',
      totalAmount: 67000,
      status: 'pending',
      createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      items: [
        {
          id: 3,
          productId: 4,
          productName: 'Kyoto Ceremonial Matcha Latte',
          quantity: 1,
          price: 35000,
          subtotal: 35000,
          notes: 'Less sweet',
        },
        {
          id: 4,
          productId: 7,
          productName: 'Dark Choco Almond Pain',
          quantity: 1,
          price: 32000,
          subtotal: 32000,
        },
      ],
    },
  ];
}

export function getLocalOrders(): OrderRecord[] {
  return global.__GLOBAL_ORDERS__ || [];
}

export function addLocalOrder(order: OrderRecord): void {
  if (!global.__GLOBAL_ORDERS__) {
    global.__GLOBAL_ORDERS__ = [];
  }
  global.__GLOBAL_ORDERS__.unshift(order);
}

export function updateLocalOrderStatus(id: number, status: OrderRecord['status']): OrderRecord | null {
  if (!global.__GLOBAL_ORDERS__) return null;
  const target = global.__GLOBAL_ORDERS__.find((o) => o.id === id);
  if (target) {
    target.status = status;
    return target;
  }
  return null;
}
