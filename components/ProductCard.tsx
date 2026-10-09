'use client';

import React from 'react';
import { Plus, Coffee, Sparkles, SlidersHorizontal } from 'lucide-react';
import { Product } from '@/types';
import { formatRupiah } from '@/lib/utils';
import { useCartStore } from '@/store/useCartStore';

interface ProductCardProps {
  product: Product;
  onOpenDetail: (product: Product) => void;
}

export function ProductCard({ product, onOpenDetail }: ProductCardProps) {
  const getProductCartQuantity = useCartStore((state) => state.getProductCartQuantity);
  const cartCount = getProductCartQuantity(product.id);
  const [imageError, setImageError] = React.useState(false);

  const isCombo = product.categoryId === 7 || Boolean(product.customizationConfig?.isComboPackage);
  const isDrink = product.categoryId === 2 || product.categoryId === 3;

  return (
    <article
      onClick={() => product.isAvailable && onOpenDetail(product)}
      className={`group relative rounded-xl sm:rounded-2xl border bg-white dark:bg-zinc-950 p-2.5 sm:p-4 transition-all duration-300 flex flex-col justify-between cursor-pointer active:scale-[0.98] ${
        product.isAvailable
          ? 'border-zinc-200/90 dark:border-zinc-800/90 hover:border-black dark:hover:border-zinc-500 hover:shadow-lg hover:-translate-y-0.5'
          : 'border-zinc-200 dark:border-zinc-850 opacity-60 grayscale cursor-not-allowed'
      }`}
    >
      <div>
        {/* Product image container */}
        <div className="relative w-full h-28 sm:h-40 md:h-44 rounded-lg sm:rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 mb-2 sm:mb-3">
          {product.imageUrl && !imageError ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
              decoding="async"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400">
              <Coffee className="w-6 h-6 sm:w-8 sm:h-8 stroke-1 mb-1" />
              <span className="text-[9px] sm:text-[11px] font-mono tracking-widest uppercase">Noir Blanc</span>
            </div>
          )}

          {/* Top badges: availability & combo/category */}
          <div className="absolute top-1.5 left-1.5 sm:top-2.5 sm:left-2.5 flex items-center gap-1 sm:gap-1.5 flex-wrap">
            {product.isAvailable ? (
              <span className="inline-flex items-center gap-1 px-1.5 sm:px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-black/80 backdrop-blur-md text-white border border-white/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span className="hidden xs:inline sm:inline">Tersedia</span>
              </span>
            ) : (
              <span className="inline-flex items-center px-1.5 sm:px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-zinc-800 text-zinc-300">
                Habis
              </span>
            )}

            {isCombo && (
              <span className="inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider bg-amber-500 text-black shadow-sm">
                <Sparkles className="w-2.5 h-2.5" />
                <span>Hemat</span>
              </span>
            )}
          </div>

          {/* Cart Count Badge if added */}
          {cartCount > 0 && (
            <div className="absolute top-1.5 right-1.5 sm:top-2.5 sm:right-2.5 bg-black text-white dark:bg-white dark:text-black text-[10px] sm:text-[11px] font-extrabold px-1.5 sm:px-2.5 py-0.5 rounded-full shadow-lg border border-white/30 dark:border-black/30 flex items-center gap-1">
              <span>{cartCount}x</span>
            </div>
          )}
        </div>

        {/* Product details */}
        <div className="space-y-0.5 sm:space-y-1">
          <h3 className="font-bold text-xs sm:text-base text-zinc-950 dark:text-zinc-100 tracking-tight line-clamp-1 group-hover:text-black dark:group-hover:text-white transition-colors">
            {product.name}
          </h3>
          {product.description && (
            <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 leading-snug line-clamp-1 sm:line-clamp-2 sm:min-h-[32px]">
              {product.description}
            </p>
          )}

          {/* Tag hint for customizable options */}
          <div className="pt-0.5 flex items-center gap-1 text-[10px] sm:text-[11px] text-zinc-400 font-medium truncate">
            {isDrink && <span>Panas / Dingin</span>}
            {isCombo && <span>Makanan + Minuman</span>}
            {!isDrink && !isCombo && <span>Kustom Porsi & Rasa</span>}
          </div>
        </div>
      </div>

      {/* Footer: Price & Add / Detail Button */}
      <div className="mt-2.5 sm:mt-4 pt-2 sm:pt-3 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between gap-1">
        <div className="min-w-0">
          <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block font-medium">
            Harga
          </span>
          <span className="text-xs sm:text-sm md:text-base font-black text-zinc-900 dark:text-white truncate block">
            {formatRupiah(product.price)}
          </span>
        </div>

        <div className="shrink-0">
          {!product.isAvailable ? (
            <button
              disabled
              className="px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-400 text-[10px] sm:text-xs font-medium cursor-not-allowed"
            >
              Kosong
            </button>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenDetail(product);
              }}
              className="px-2 py-1.5 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl bg-black hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black text-[11px] sm:text-xs font-bold tracking-wide flex items-center gap-1 transition-all active:scale-95 shadow-sm"
            >
              <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>{cartCount > 0 ? '+Lagi' : 'Pilih'}</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

