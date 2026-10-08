'use client';

import React from 'react';
import { ShoppingBag, Coffee, Sparkles } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

interface NavbarProps {
  onOpenCart: () => void;
  cafeName?: string;
}

export function Navbar({ onOpenCart, cafeName }: NavbarProps) {
  const totalItems = useCartStore((state) => state.getTotalItems());
  const orderDetails = useCartStore((state) => state.orderDetails);

  const displayName = cafeName || process.env.NEXT_PUBLIC_CAFE_NAME || 'NOIR & BLANC';

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/85 dark:bg-black/85 border-b border-zinc-200 dark:border-zinc-800 transition-colors">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-black tracking-wider text-sm shadow-sm">
            <Coffee className="w-4 h-4" />
          </div>
          <div>
            <h1 className="font-bold text-base md:text-lg tracking-tight uppercase text-zinc-950 dark:text-white flex items-center gap-1.5">
              {displayName}
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                <Sparkles className="w-2.5 h-2.5 text-zinc-800 dark:text-zinc-200" />
                Self-Order
              </span>
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 -mt-0.5 font-medium">
              Digital Menu & Direct Order
            </p>
          </div>
        </div>

        {/* Right action controls */}
        <div className="flex items-center gap-2.5">
          {orderDetails.tableNumber && (
            <div className="hidden sm:flex items-center px-3 py-1 rounded-full border border-zinc-300 dark:border-zinc-700 bg-zinc-100/80 dark:bg-zinc-900 text-xs font-semibold text-zinc-800 dark:text-zinc-200 tracking-wide">
              <span>MEJA #{orderDetails.tableNumber}</span>
            </div>
          )}

          <a
            href="/kasir"
            aria-label="Portal Kasir"
            title="Portal Kasir"
            className="p-2.5 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-all active:scale-95 border border-zinc-200/80 dark:border-zinc-800"
          >
            <span className="sr-only">Portal Kasir</span>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </a>

          <button
            onClick={onOpenCart}
            id="open-cart-btn"
            aria-label="Buka Keranjang Pesanan"
            className="relative p-2.5 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 transition-all active:scale-95 border border-zinc-200/80 dark:border-zinc-800"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-black text-white dark:bg-white dark:text-black text-[11px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-black animate-scale-in">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
