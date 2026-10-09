'use client';

import React from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { formatRupiah } from '@/lib/utils';

interface FloatingCartBarProps {
  onOpenCart: () => void;
}

export function FloatingCartBar({ onOpenCart }: FloatingCartBarProps) {
  const totalItems = useCartStore((state) => state.getTotalItems());
  const totalPrice = useCartStore((state) => state.getTotalPrice());
  const isCartOpen = useCartStore((state) => state.isCartOpen);

  if (totalItems === 0 || isCartOpen) {
    return null;
  }

  return (
    <aside aria-label="Bilah ringkasan keranjang" className="fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-0 right-0 z-30 px-3 sm:px-4 max-w-lg mx-auto pointer-events-auto animate-float-bar">
      <button
        onClick={onOpenCart}
        className="w-full bg-black/95 dark:bg-white/95 backdrop-blur-md text-white dark:text-black p-3 sm:p-3.5 rounded-2xl shadow-2xl flex items-center justify-between border border-zinc-700/50 dark:border-zinc-300 hover:scale-[1.01] active:scale-[0.98] transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-zinc-800 text-white dark:bg-zinc-200 dark:text-black flex items-center justify-center font-bold text-xs">
            {totalItems}
          </div>
          <div className="text-left">
            <p className="text-[11px] text-zinc-400 dark:text-zinc-600 font-medium leading-none">
              Total Pesanan
            </p>
            <p className="text-base font-extrabold tracking-tight mt-0.5">
              {formatRupiah(totalPrice)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-white/10 dark:bg-black/10 px-3 py-2 rounded-xl">
          <span>Checkout</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </button>
    </aside>
  );
}
