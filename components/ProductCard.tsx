'use client';

import React from 'react';
import Image from 'next/image';
import { Plus, Minus, Check, Coffee } from 'lucide-react';
import { Product } from '@/types';
import { formatRupiah } from '@/lib/utils';
import { useCartStore } from '@/store/useCartStore';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const items = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);

  const cartItem = items.find((item) => item.product.id === product.id);
  const quantity = cartItem ? cartItem.quantity : 0;

  return (
    <article
      className={`group relative rounded-2xl border bg-white dark:bg-zinc-950 p-4 transition-all duration-300 flex flex-col justify-between ${
        product.isAvailable
          ? 'border-zinc-200/90 dark:border-zinc-800/90 hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-md'
          : 'border-zinc-200 dark:border-zinc-850 opacity-60 grayscale'
      }`}
    >
      <div>
        {/* Product image container */}
        <div className="relative w-full h-44 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 mb-3.5">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400">
              <Coffee className="w-8 h-8 stroke-1 mb-1" />
              <span className="text-[11px] font-mono tracking-widest uppercase">Noir Blanc</span>
            </div>
          )}

          {/* Availability badge */}
          <div className="absolute top-2.5 left-2.5">
            {product.isAvailable ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/75 backdrop-blur-md text-white border border-white/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Tersedia
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-800 text-zinc-300">
                Habis
              </span>
            )}
          </div>
        </div>

        {/* Product details */}
        <div className="space-y-1">
          <h3 className="font-semibold text-base text-zinc-950 dark:text-zinc-100 tracking-tight line-clamp-1">
            {product.name}
          </h3>
          {product.description && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-2 min-h-[32px]">
              {product.description}
            </p>
          )}
        </div>
      </div>

      {/* Footer: Price & Add / Stepper button */}
      <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block font-medium">
            Harga
          </span>
          <span className="text-sm md:text-base font-bold text-zinc-900 dark:text-white">
            {formatRupiah(product.price)}
          </span>
        </div>

        <div>
          {!product.isAvailable ? (
            <button
              disabled
              className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-400 text-xs font-medium cursor-not-allowed"
            >
              Kosong
            </button>
          ) : quantity > 0 ? (
            <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg p-0.5 shadow-sm">
              <button
                onClick={() => updateQuantity(product.id, -1)}
                className="w-7 h-7 rounded-md bg-white dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white flex items-center justify-center transition-colors active:scale-90"
                aria-label="Kurangi kuantitas"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-6 text-center text-xs font-bold text-zinc-900 dark:text-white font-mono">
                {quantity}
              </span>
              <button
                onClick={() => updateQuantity(product.id, 1)}
                className="w-7 h-7 rounded-md bg-black dark:bg-white text-white dark:text-black flex items-center justify-center transition-colors active:scale-90"
                aria-label="Tambah kuantitas"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => addItem(product)}
              className="px-3.5 py-1.5 rounded-lg bg-black hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black text-xs font-semibold tracking-wide flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Tambah
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
