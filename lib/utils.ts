import { CartItem, OrderDetails } from '@/types';

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function generateWhatsAppMessage(
  items: CartItem[],
  orderDetails: OrderDetails,
  cafeName: string = 'NOIR & BLANC COFFEE'
): string {
  const totalAmount = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const orderTypeLabel = orderDetails.orderType === 'dine-in' ? 'Dine In (Makan di Tempat)' : 'Takeaway (Bungkus)';

  let message = `*PESANAN BARU - ${cafeName.toUpperCase()}*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `📍 *No. Meja:* ${orderDetails.tableNumber || '-'}\n`;
  message += `👤 *Nama:* ${orderDetails.customerName || 'Tamu'}\n`;
  message += `🍽️ *Tipe:* ${orderTypeLabel}\n`;
  if (orderDetails.generalNotes?.trim()) {
    message += `📝 *Catatan Meja:* ${orderDetails.generalNotes.trim()}\n`;
  }
  message += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
  message += `*DAFTAR PESANAN:*\n`;

  items.forEach((item, index) => {
    const subtotal = item.product.price * item.quantity;
    message += `${index + 1}. *${item.product.name}*\n`;
    message += `   ${item.quantity}x @ ${formatRupiah(item.product.price)} = *${formatRupiah(subtotal)}*\n`;
    if (item.notes?.trim()) {
      message += `   _(Note: ${item.notes.trim()})_\n`;
    }
  });

  message += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `*TOTAL BAYAR: ${formatRupiah(totalAmount)}*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `_Mohon segera diproses ya kak. Terima kasih!_ 🙏✨`;

  return message;
}

export function createWhatsAppUrl(
  phoneNumber: string,
  message: string
): string {
  // Clean phone number: remove non-digits, replace leading '0' with '62'
  let cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
  if (cleanNumber.startsWith('0')) {
    cleanNumber = '62' + cleanNumber.slice(1);
  }
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}
