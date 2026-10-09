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
      className={`group relative rounded-2xl border bg-white dark:bg-zinc-950 p-4 transition-all duration-300 flex flex-col justify-between cursor-pointer ${
        product.isAvailable
          ? 'border-zinc-200/90 dark:border-zinc-800/90 hover:border-black dark:hover:border-zinc-500 hover:shadow-lg hover:-translate-y-0.5'
          : 'border-zinc-200 dark:border-zinc-850 opacity-60 grayscale cursor-not-allowed'
      }`}
    >
      <div>
        {/* Product image container */}
        <div className="relative w-full h-44 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 mb-3.5">
          {product.imageUrl && !imageError ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400">
              <Coffee className="w-8 h-8 stroke-1 mb-1" />
              <span className="text-[11px] font-mono tracking-widest uppercase">Noir Blanc</span>
            </div>
          )}

          {/* Top badges: availability & combo/category */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
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

            {isCombo && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500 text-black shadow-sm">
                <Sparkles className="w-2.5 h-2.5" />
                Paket Hemat
              </span>
            )}
          </div>

          {/* Cart Count Badge if added */}
          {cartCount > 0 && (
            <div className="absolute top-2.5 right-2.5 bg-black text-white dark:bg-white dark:text-black text-[11px] font-extrabold px-2.5 py-0.5 rounded-full shadow-lg border border-white/30 dark:border-black/30 flex items-center gap-1">
              <span>{cartCount} di keranjang</span>
            </div>
          )}
        </div>

        {/* Product details */}
        <div className="space-y-1">
          <h3 className="font-bold text-base text-zinc-950 dark:text-zinc-100 tracking-tight line-clamp-1 group-hover:text-black dark:group-hover:text-white transition-colors">
            {product.name}
          </h3>
          {product.description && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-2 min-h-[32px]">
              {product.description}
            </p>
          )}

          {/* Tag hint for customizable options */}
          <div className="pt-1 flex items-center gap-2 text-[11px] text-zinc-400 font-medium">
            {isDrink && <span>Panas / Dingin</span>}
            {isCombo && <span>Pilihan Makanan & Minuman</span>}
            {!isDrink && !isCombo && <span>Pilihan Sajian & Catatan</span>}
          </div>
        </div>
      </div>

      {/* Footer: Price & Add / Detail Button */}
      <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block font-medium">
            Harga
          </span>
          <span className="text-sm md:text-base font-black text-zinc-900 dark:text-white">
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
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenDetail(product);
              }}
              className="px-3 py-1.5 rounded-xl bg-black hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black text-xs font-semibold tracking-wide flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{cartCount > 0 ? '+ Tambah Lagi' : 'Pilih / Tambah'}</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

