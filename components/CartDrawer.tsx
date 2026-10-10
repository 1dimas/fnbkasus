'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  Send, 
  UtensilsCrossed, 
  ShoppingBag,
  AlertCircle,
  FileText,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { formatRupiah } from '@/lib/utils';
import { OrderRecord } from '@/types';

export function CartDrawer() {
  const isCartOpen = useCartStore((state) => state.isCartOpen);
  const setIsCartOpen = useCartStore((state) => state.setIsCartOpen);
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateItemNotes = useCartStore((state) => state.updateItemNotes);
  const clearCart = useCartStore((state) => state.clearCart);
  const orderDetails = useCartStore((state) => state.orderDetails);
  const setOrderDetails = useCartStore((state) => state.setOrderDetails);
  const totalPrice = useCartStore((state) => state.getTotalPrice());

  const [tableError, setTableError] = useState(false);
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<OrderRecord | null>(null);

  // Lock body scroll while cart is open
  useEffect(() => {
    if (isCartOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  const handleClose = () => {
    setIsCartOpen(false);
    setCompletedOrder(null);
  };

  const handleSendOrderToCashier = async () => {
    if (!orderDetails.tableNumber.trim()) {
      setTableError(true);
      const tableInput = document.getElementById('table-number-input');
      tableInput?.focus();
      return;
    }

    setTableError(false);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableNumber: orderDetails.tableNumber,
          customerName: orderDetails.customerName || 'Tamu',
          orderType: 'dine-in',
          generalNotes: orderDetails.generalNotes,
          items,
          totalAmount: totalPrice,
        }),
      });

      const data = await res.json();

      if (data.success && data.order) {
        setCompletedOrder(data.order);
        clearCart();
      } else {
        alert(data.message || 'Gagal mengirim pesanan. Silakan coba lagi.');
      }
    } catch (err) {
      console.error('Failed to submit order directly to cashier:', err);
      alert('Terjadi kendala jaringan saat mengirim pesanan ke kasir.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop with smooth fade */}
      <div 
        onClick={handleClose}
        className="absolute inset-0 bg-black/65 backdrop-blur-sm animate-backdrop cursor-pointer" 
      />

      {/* Drawer Panel with fluid slide motion */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-full sm:max-w-md bg-white dark:bg-zinc-950 shadow-2xl flex flex-col border-l border-zinc-200 dark:border-zinc-800 animate-drawer-right">
          
          {/* Header */}
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-black dark:text-white" />
              <h2 className="font-bold text-lg text-zinc-900 dark:text-white tracking-tight">
                {completedOrder ? 'Status Pesanan' : 'Keranjang Pesanan'}
              </h2>
              {!completedOrder && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 font-semibold text-zinc-600 dark:text-zinc-400">
                  {items.length} item
                </span>
              )}
            </div>
            
            <button
              onClick={handleClose}
              className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 hover:text-black dark:hover:text-white transition-colors"
              aria-label="Tutup Keranjang"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content with contained momentum scroll */}
          <div className="flex-1 overflow-y-auto overscroll-contain touch-scroll p-4 space-y-6">
            {completedOrder ? (
              /* Order Success View */
              <div className="py-6 px-2 space-y-6 text-center animate-pop-in">
                <div className="w-20 h-20 mx-auto rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center shadow-xl">
                  <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
                </div>

                <div className="space-y-1.5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    Pesanan Terkirim ke Kasir!
                  </span>
                  <h3 className="text-2xl font-black text-zinc-950 dark:text-white tracking-tight uppercase">
                    Terima Kasih!
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto leading-relaxed">
                    Pesanan Anda telah langsung masuk ke monitor kasir & barista. Silakan santai menunggu di meja.
                  </p>
                </div>

                {/* Order Summary Details Card */}
                <div className="text-left p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-zinc-200 dark:border-zinc-800">
                    <span className="text-xs font-semibold text-zinc-500">Nomor Meja</span>
                    <span className="text-sm font-extrabold px-2.5 py-0.5 rounded-lg bg-black text-white dark:bg-white dark:text-black">
                      MEJA {completedOrder.tableNumber}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-500">Kode Pesanan</span>
                    <span className="font-mono font-bold text-zinc-900 dark:text-white">
                      #{completedOrder.orderCode}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-500">Tipe Pesanan</span>
                    <span className="font-semibold text-zinc-900 dark:text-white uppercase text-[11px]">
                      Dine In (Makan di Tempat)
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-500">Nama Pemesan</span>
                    <span className="font-semibold text-zinc-900 dark:text-white">
                      {completedOrder.customerName || 'Tamu'}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
                    <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                      Menu yang Dipesan:
                    </span>
                    <div className="space-y-1">
                      {completedOrder.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-xs text-zinc-700 dark:text-zinc-300">
                          <span>{item.quantity}x {item.productName}</span>
                          <span className="font-mono">{formatRupiah(item.subtotal)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                    <span className="text-xs font-bold text-zinc-900 dark:text-white">Total Bayar</span>
                    <span className="text-base font-black text-zinc-950 dark:text-white">
                      {formatRupiah(completedOrder.totalAmount)}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleClose}
                    className="w-full py-3.5 rounded-xl bg-black hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black font-bold text-sm tracking-wide transition-all shadow-md active:scale-[0.99]"
                  >
                    Kembali ke Menu
                  </button>
                </div>
              </div>
            ) : items.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-400">
                  <UtensilsCrossed className="w-8 h-8 stroke-1" />
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-800 dark:text-zinc-200">
                    Keranjang Masih Kosong
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1 max-w-[220px]">
                    Silakan pilih menu minuman atau makanan lezat favorit Anda dari katalog.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* List of items */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                      Rincian Item
                    </span>
                    <button
                      onClick={clearCart}
                      className="text-xs text-zinc-500 hover:text-red-500 transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Kosongkan
                    </button>
                  </div>

                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800/90 bg-zinc-50/60 dark:bg-zinc-900/50 space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 line-clamp-1">
                            {item.product.name}
                          </h4>
                          {item.optionsSummary && (
                            <p className="text-[11px] text-zinc-600 dark:text-zinc-300 mt-0.5 font-medium flex items-center gap-1.5 flex-wrap">
                              <span className="px-2 py-0.5 rounded bg-zinc-200/80 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-300/50 dark:border-zinc-700/50">
                                {item.optionsSummary}
                              </span>
                            </p>
                          )}
                          <p className="text-xs font-bold text-zinc-900 dark:text-white mt-1">
                            {formatRupiah(item.product.price)}
                          </p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-0.5">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-6 h-6 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700 flex items-center justify-center text-zinc-700 dark:text-zinc-300 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-5 text-center text-xs font-bold font-mono">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-6 h-6 rounded-md bg-black text-white dark:bg-white dark:text-black flex items-center justify-center transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Item Notes */}
                      <div className="pt-1.5 border-t border-zinc-200/50 dark:border-zinc-800/50">
                        {editingNotesId === item.id ? (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={item.notes || ''}
                              placeholder="Contoh: Less ice, saus dipisah..."
                              onChange={(e) => updateItemNotes(item.id, e.target.value)}
                              className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                              autoFocus
                            />
                            <button
                              onClick={() => setEditingNotesId(null)}
                              className="text-xs px-2.5 py-1 rounded-lg bg-black text-white dark:bg-white dark:text-black font-medium"
                            >
                              Selesai
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <p className="text-[11px] text-zinc-500 italic truncate max-w-[200px]">
                              {item.notes ? `Catatan: ${item.notes}` : 'Belum ada catatan khusus'}
                            </p>
                            <button
                              onClick={() => setEditingNotesId(item.id)}
                              className="text-[11px] text-zinc-900 dark:text-zinc-200 hover:underline font-medium flex items-center gap-1"
                            >
                              <FileText className="w-3 h-3" />
                              {item.notes ? 'Ubah' : '+ Catatan'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Customer & Table details form */}
                <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 space-y-3.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">
                    Informasi Meja & Pelanggan
                  </span>

                  {/* Order Method: Dine In Only */}
                  <div className="flex items-center justify-between px-3.5 py-2.5 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                      <UtensilsCrossed className="w-4 h-4 text-zinc-900 dark:text-zinc-100" />
                      <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        Metode Pesanan
                      </span>
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider bg-black text-white dark:bg-white dark:text-black px-2.5 py-1 rounded-lg shadow-sm">
                      Dine In (Makan di Tempat)
                    </span>
                  </div>

                  {/* Table Number */}
                  <div>
                    <label 
                      className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1"
                    >
                      Nomor Meja <span className="text-red-500">*</span>
                    </label>

                    {orderDetails.tableNumber ? (
                      <div className="px-3.5 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-xs font-mono">
                            {orderDetails.tableNumber}
                          </div>
                          <div>
                            <span className="text-xs font-black text-zinc-900 dark:text-white block">
                              Meja {orderDetails.tableNumber}
                            </span>
                            <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                              Terkunci dari scan QR meja (tidak dapat diubah)
                            </span>
                          </div>
                        </div>
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/80">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          Terkunci
                        </span>
                      </div>
                    ) : (
                      <>
                        <input
                          id="table-number-input"
                          type="text"
                          placeholder="Scan QR di meja atau ketik nomor meja"
                          value={orderDetails.tableNumber}
                          onChange={(e) => {
                            setOrderDetails({ tableNumber: e.target.value });
                            if (e.target.value.trim()) setTableError(false);
                          }}
                          className={`w-full px-3.5 py-2.5 rounded-xl text-sm border bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white ${
                            tableError
                              ? 'border-red-500 ring-1 ring-red-500'
                              : 'border-zinc-300 dark:border-zinc-700 font-semibold'
                          }`}
                        />
                        {tableError && (
                          <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1 font-medium">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Wajib mengisi nomor meja atau scan QR di meja Anda!
                          </p>
                        )}
                      </>
                    )}
                  </div>

                  {/* Customer Name */}
                  <div>
                    <label 
                      htmlFor="customer-name-input" 
                      className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1"
                    >
                      Nama Pemesan (Opsional)
                    </label>
                    <input
                      id="customer-name-input"
                      type="text"
                      placeholder="Masukkan nama Anda"
                      value={orderDetails.customerName}
                      onChange={(e) => setOrderDetails({ customerName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                    />
                  </div>

                  {/* General Notes */}
                  <div>
                    <label 
                      htmlFor="general-notes-input" 
                      className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1"
                    >
                      Catatan Tambahan untuk Kasir
                    </label>
                    <textarea
                      id="general-notes-input"
                      rows={2}
                      placeholder="Contoh: Tolong disajikan bersamaan, bawa tisu..."
                      value={orderDetails.generalNotes || ''}
                      onChange={(e) => setOrderDetails({ generalNotes: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl text-xs border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white resize-none"
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer Checkout Bar */}
          {!completedOrder && items.length > 0 && (
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 space-y-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-medium tracking-wider text-zinc-500">
                  Total Pembayaran
                </span>
                <span className="text-lg font-black text-zinc-950 dark:text-white">
                  {formatRupiah(totalPrice)}
                </span>
              </div>

              <button
                onClick={handleSendOrderToCashier}
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-xl bg-black hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black font-bold text-sm tracking-wide flex items-center justify-center gap-2.5 transition-all active:scale-[0.99] shadow-lg disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Mengirim ke Kasir...' : 'Kirim Pesanan Langsung ke Kasir'}</span>
              </button>

              <p className="text-[10px] text-center text-zinc-400 dark:text-zinc-500">
                Pesanan akan langsung masuk secara real-time ke layar monitor kasir.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
