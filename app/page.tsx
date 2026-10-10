'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { TableBanner } from '@/components/TableBanner';
import { CategoryTabs } from '@/components/CategoryTabs';
import { ProductCard } from '@/components/ProductCard';
import { ProductDetailModal } from '@/components/ProductDetailModal';
import { CartDrawer } from '@/components/CartDrawer';
import { FloatingCartBar } from '@/components/FloatingCartBar';
import { useCartStore } from '@/store/useCartStore';
import { Category, Product } from '@/types';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS } from '@/lib/mock-data';
import { UtensilsCrossed, Sparkles } from 'lucide-react';

function CatalogContent() {
  const searchParams = useSearchParams();
  const setIsCartOpen = useCartStore((state) => state.setIsCartOpen);
  const setOrderDetails = useCartStore((state) => state.setOrderDetails);

  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [activeCategoryId, setActiveCategoryId] = useState<number>(1); // 1 = Semua Menu
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  
  // Product Detail Modal state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [scannedTableToast, setScannedTableToast] = useState<string | null>(null);

  // Check URL query parameters for table number (e.g. ?table=05 or ?meja=05 from QR code)
  useEffect(() => {
    const tableFromUrl = searchParams.get('table') || searchParams.get('meja');
    if (tableFromUrl) {
      setOrderDetails({ tableNumber: tableFromUrl });
      setScannedTableToast(tableFromUrl);
      try {
        localStorage.setItem('cafe_scanned_table', tableFromUrl);
      } catch (e) {
        // ignore
      }
    } else {
      // Check if table was previously saved in this browser session
      try {
        const saved = localStorage.getItem('cafe_scanned_table');
        if (saved) {
          setOrderDetails({ tableNumber: saved });
        }
      } catch (e) {
        // ignore
      }
    }
  }, [searchParams, setOrderDetails]);

  // Fetch live products and categories from API
  useEffect(() => {
    async function loadCatalog() {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch('/api/products').then((r) => r.json()),
          fetch('/api/categories').then((r) => r.json()),
        ]);

        if (prodRes?.products) {
          setProducts(prodRes.products);
        }
        if (catRes?.categories) {
          setCategories(catRes.categories);
        }
      } catch (err) {
        console.error('Failed to fetch catalog from API, using fallback:', err);
      } finally {
        setLoading(false);
      }
    }

    loadCatalog();
  }, []);

  // Filter products based on active category and search query
  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      activeCategoryId === 1 || activeCategoryId === 0 || product.categoryId === activeCategoryId;

    const matchesSearch =
      !searchQuery.trim() ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100">
      {/* Top Navigation */}
      <Navbar onOpenCart={() => setIsCartOpen(true)} />

      {/* Scanned QR Table Welcome Banner */}
      {scannedTableToast && (
        <div className="bg-emerald-950/90 text-emerald-200 border-b border-emerald-800/80 px-4 py-2.5 text-xs backdrop-blur-md">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span>
                <strong>QR Meja Berhasil Terhubung:</strong> Anda sedang memesan dari <strong>Meja {scannedTableToast}</strong>. Nomor meja otomatis terisi saat pesan.
              </span>
            </div>
            <button
              onClick={() => setScannedTableToast(null)}
              className="text-[11px] text-emerald-400 hover:text-white underline shrink-0 cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 pb-28 sm:pb-24">
        {/* Hero & Table Indicator */}
        <TableBanner
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Category Tabs */}
        <div className="sticky top-16 z-30 bg-zinc-50/95 dark:bg-black/95 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80">
          <CategoryTabs
            categories={categories}
            activeCategoryId={activeCategoryId}
            onSelectCategory={setActiveCategoryId}
          />
        </div>

        {/* Product Grid */}
        <div className="max-w-4xl mx-auto px-3 sm:px-4 mt-4 sm:mt-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              {searchQuery ? `Hasil Pencarian ("${searchQuery}")` : 'Katalog Menu'}
            </h2>
            <span className="text-xs text-zinc-500 font-mono">
              {filteredProducts.length} item
            </span>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 px-4 bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-400">
                <UtensilsCrossed className="w-6 h-6 stroke-1" />
              </div>
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
                Tidak ada menu yang cocok
              </h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Coba gunakan kata kunci pencarian yang lain atau pilih kategori menu yang berbeda.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4 md:gap-5">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onOpenDetail={(prod) => {
                    setSelectedProduct(prod);
                    setIsDetailOpen(true);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-900 py-6 text-center text-xs text-zinc-500 dark:text-zinc-600 space-y-1">
        <p className="font-medium tracking-tight">
          NOIR & BLANC COFFEE • Self-Service Order System
        </p>
        <p className="text-[11px] text-zinc-400 dark:text-zinc-700">
          Pesanan terkirim langsung ke kasir secara real-time. Powered by Next.js & Supabase.
        </p>
      </footer>

      {/* Floating Cart Button (Mobile & Desktop) */}
      <FloatingCartBar onOpenCart={() => setIsCartOpen(true)} />

      {/* Slide-over Cart & Checkout Drawer */}
      <CartDrawer />

      {/* Detailed Customization Modal for Food & Drinks */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedProduct(null);
        }}
      />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black text-white flex items-center justify-center font-mono text-xs">Memuat katalog...</div>}>
      <CatalogContent />
    </Suspense>
  );
}
