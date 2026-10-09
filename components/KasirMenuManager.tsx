'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Coffee, 
  Check, 
  X, 
  Sparkles, 
  RefreshCw, 
  Eye, 
  SlidersHorizontal,
  Layers,
  UtensilsCrossed
} from 'lucide-react';
import { Product, Category } from '@/types';
import { formatRupiah } from '@/lib/utils';
import { INITIAL_CATEGORIES } from '@/lib/mock-data';

export function KasirMenuManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [activeCategoryId, setActiveCategoryId] = useState<number>(1); // 1 = Semua
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState<number | ''>('');
  const [formCategoryId, setFormCategoryId] = useState<number>(2);
  const [formDescription, setFormDescription] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formIsAvailable, setFormIsAvailable] = useState(true);
  
  // Customization options checkboxes
  const [formAllowsTemperature, setFormAllowsTemperature] = useState(true);
  const [formAllowsHeating, setFormAllowsHeating] = useState(false);
  const [formAllowsSpiciness, setFormAllowsSpiciness] = useState(false);
  const [formComboFoods, setFormComboFoods] = useState('Classic Butter Croissant, Dark Choco Almond Pain');
  const [formComboDrinks, setFormComboDrinks] = useState('Noir Flat White, Monochrome Black Espresso, Kyoto Ceremonial Matcha Latte');

  const fetchCatalog = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setRefreshing(true);
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
      console.error('Failed to fetch catalog:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormPrice('');
    setFormCategoryId(2);
    setFormDescription('');
    setFormImageUrl('');
    setFormIsAvailable(true);
    setFormAllowsTemperature(true);
    setFormAllowsHeating(false);
    setFormAllowsSpiciness(false);
    setFormComboFoods('Classic Butter Croissant, Dark Choco Almond Pain');
    setFormComboDrinks('Noir Flat White, Monochrome Black Espresso, Kyoto Ceremonial Matcha Latte');
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormPrice(product.price);
    setFormCategoryId(product.categoryId);
    setFormDescription(product.description || '');
    setFormImageUrl(product.imageUrl || '');
    setFormIsAvailable(product.isAvailable);

    const cfg = product.customizationConfig;
    setFormAllowsTemperature(cfg?.allowsTemperature ?? [2, 3, 7].includes(product.categoryId));
    setFormAllowsHeating(cfg?.allowsHeating ?? [4, 5, 6].includes(product.categoryId));
    setFormAllowsSpiciness(cfg?.allowsSpiciness ?? [5, 6].includes(product.categoryId));
    setFormComboFoods(cfg?.comboFoodOptions?.join(', ') || 'Classic Butter Croissant, Dark Choco Almond Pain');
    setFormComboDrinks(cfg?.comboDrinkOptions?.join(', ') || 'Noir Flat White, Monochrome Black Espresso');
    setIsModalOpen(true);
  };

  const handleToggleAvailability = async (productId: number) => {
    try {
      // Optimistic update
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, isAvailable: !p.isAvailable } : p))
      );

      const res = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: productId, action: 'toggle-availability' }),
      });
      const data = await res.json();
      if (!data.success) {
        fetchCatalog(false);
      }
    } catch (err) {
      console.error('Failed to toggle availability:', err);
      fetchCatalog(false);
    }
  };

  const handleDeleteProduct = async (productId: number, productName: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus menu "${productName}"?`)) {
      return;
    }

    try {
      // Optimistic update
      setProducts((prev) => prev.filter((p) => p.id !== productId));

      const res = await fetch(`/api/products?id=${productId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.message || 'Gagal menghapus menu.');
        fetchCatalog(false);
      }
    } catch (err) {
      console.error('Failed to delete product:', err);
      alert('Kendala jaringan saat menghapus menu.');
      fetchCatalog(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || formPrice === '') {
      alert('Nama menu dan harga harus diisi.');
      return;
    }

    setSubmitting(true);
    const isCombo = Number(formCategoryId) === 7;

    const customizationConfig = {
      allowsTemperature: formAllowsTemperature || isCombo,
      allowsSugarLevel: formAllowsTemperature || isCombo,
      allowsIceLevel: formAllowsTemperature && !isCombo,
      allowsHeating: formAllowsHeating,
      allowsSpiciness: formAllowsSpiciness,
      isComboPackage: isCombo,
      comboFoodOptions: isCombo
        ? formComboFoods.split(',').map((s) => s.trim()).filter(Boolean)
        : undefined,
      comboDrinkOptions: isCombo
        ? formComboDrinks.split(',').map((s) => s.trim()).filter(Boolean)
        : undefined,
    };

    const payload = {
      id: editingProduct?.id,
      name: formName.trim(),
      price: Number(formPrice),
      categoryId: Number(formCategoryId),
      description: formDescription.trim(),
      imageUrl: formImageUrl.trim() || undefined,
      isAvailable: formIsAvailable,
      customizationConfig,
    };

    try {
      const url = '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        fetchCatalog(false);
      } else {
        alert(data.message || 'Gagal menyimpan menu.');
      }
    } catch (err) {
      console.error('Failed to save product:', err);
      alert('Terjadi kesalahan jaringan saat menyimpan menu.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter products based on search and category
  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      activeCategoryId === 1 || activeCategoryId === 0 || p.categoryId === activeCategoryId;
    const matchesSearch =
      !searchQuery.trim() ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Prototype Mode Info Alert */}
      <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-white shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-white">Mode Prototype Langsung (In-Memory Prototype)</p>
            <p className="text-zinc-400 mt-0.5">
              Anda bisa menambah menu baru, mengedit harga/kategori, dan mengubah stok habis tanpa setup database. Perubahan langsung aktif di katalog pelanggan.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => fetchCatalog(false)}
            disabled={refreshing}
            className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center gap-1.5 font-medium transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Perbarui</span>
          </button>
          <button
            onClick={openCreateModal}
            className="px-4 py-1.5 rounded-xl bg-white text-black font-bold flex items-center gap-1.5 hover:bg-zinc-200 transition-all shadow-sm active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Menu</span>
          </button>
        </div>
      </div>

      {/* Search & Category Filter Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Category Pill Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => {
            const isActive = activeCategoryId === cat.id;
            const count = products.filter(
              (p) => cat.id === 1 || cat.id === 0 || p.categoryId === cat.id
            ).length;

            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryId(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  isActive
                    ? 'bg-white text-black border-white shadow-sm'
                    : 'bg-zinc-950 text-zinc-400 border-zinc-850 hover:border-zinc-700 hover:text-white'
                }`}
              >
                <span>{cat.name}</span>
                <span className="ml-1.5 opacity-60 font-mono text-[10px]">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Cari menu kafe..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-white"
          />
        </div>
      </div>

      {/* Product List Cards */}
      {loading ? (
        <div className="text-center py-16 text-zinc-500 font-mono text-xs">
          Memuat daftar menu...
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-16 px-4 bg-zinc-950 rounded-2xl border border-zinc-850 space-y-3">
          <UtensilsCrossed className="w-10 h-10 text-zinc-600 mx-auto stroke-1" />
          <h3 className="font-bold text-sm text-zinc-300">Tidak ada menu yang ditemukan</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Coba pilih kategori lain atau klik tombol Tambah Menu Baru di atas.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => {
            const isCombo = product.categoryId === 7;
            const categoryName =
              categories.find((c) => c.id === product.categoryId)?.name ||
              (isCombo ? 'Paket Makan & Minum' : 'Menu');

            return (
              <KasirProductCard
                key={product.id}
                product={product}
                categoryName={categoryName}
                onToggleAvailability={handleToggleAvailability}
                onEdit={openEditModal}
                onDelete={handleDeleteProduct}
              />
            );
          })}
        </div>
      )}

      {/* Modal Tambah / Edit Menu */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div
            onClick={() => !submitting && setIsModalOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-backdrop cursor-pointer"
          />

          <div className="relative w-full max-w-lg bg-zinc-950 rounded-3xl border border-zinc-800 shadow-2xl overflow-hidden z-10 animate-pop-in">
            {/* Modal Header */}
            <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-white tracking-tight">
                  {editingProduct ? 'Edit Menu Kafe' : 'Tambah Menu Baru'}
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Menu langsung tersedia di katalog pemesanan pelanggan
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full hover:bg-zinc-900 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveProduct} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto overscroll-contain touch-scroll">
              {/* Nama Menu */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Nama Menu <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Iced Salted Caramel Latte"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-white"
                />
              </div>

              {/* Kategori & Harga */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Kategori <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formCategoryId}
                    onChange={(e) => {
                      const cid = Number(e.target.value);
                      setFormCategoryId(cid);
                      if (cid === 2 || cid === 3) {
                        setFormAllowsTemperature(true);
                      }
                      if (cid === 4 || cid === 5 || cid === 6) {
                        setFormAllowsHeating(true);
                      }
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-white"
                  >
                    <option value={7}>Paket Makan & Minum</option>
                    <option value={2}>Coffee</option>
                    <option value={3}>Non-Coffee</option>
                    <option value={4}>Pastry & Bakery</option>
                    <option value={5}>Main Course</option>
                    <option value={6}>Snacks</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Harga (Rp) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    step={1000}
                    placeholder="Contoh: 30000"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              {/* Deskripsi Menu */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Deskripsi Menu
                </label>
                <textarea
                  rows={2}
                  placeholder="Penjelasan bahan, rasa, atau notes penyajian..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-white resize-none"
                />
              </div>

              {/* URL Foto */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  URL Foto Produk (Opsional)
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-white"
                />
              </div>

              {/* Checkbox Ketersediaan Langsung */}
              <div className="flex items-center gap-2 p-3 bg-zinc-900 rounded-xl border border-zinc-800">
                <input
                  id="availability-check"
                  type="checkbox"
                  checked={formIsAvailable}
                  onChange={(e) => setFormIsAvailable(e.target.checked)}
                  className="w-4 h-4 rounded text-black focus:ring-0 cursor-pointer"
                />
                <label htmlFor="availability-check" className="text-xs text-zinc-300 cursor-pointer">
                  Menu Tersedia (Centang jika stok siap disajikan)
                </label>
              </div>

              {/* Opsi Kustomisasi Dinamis */}
              <div className="p-3.5 bg-zinc-900/60 rounded-xl border border-zinc-850 space-y-2.5">
                <span className="text-[11px] uppercase tracking-wider font-bold text-zinc-400 block">
                  Pilihan Kustomisasi Pelanggan
                </span>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formAllowsTemperature}
                      onChange={(e) => setFormAllowsTemperature(e.target.checked)}
                      className="w-4 h-4 rounded"
                    />
                    <span>Opsi Suhu: Panas (Hot) / Dingin (Ice) & Level Gula</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formAllowsHeating}
                      onChange={(e) => setFormAllowsHeating(e.target.checked)}
                      className="w-4 h-4 rounded"
                    />
                    <span>Opsi Makanan: Dipanaskan (Hangat) / Suhu Ruang</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formAllowsSpiciness}
                      onChange={(e) => setFormAllowsSpiciness(e.target.checked)}
                      className="w-4 h-4 rounded"
                    />
                    <span>Opsi Tingkat Kepedasan: Tidak Pedas, Sedang, Pedas</span>
                  </label>
                </div>

                {/* If Paket Makan & Minum is selected, allow configuring choices */}
                {Number(formCategoryId) === 7 && (
                  <div className="pt-2 border-t border-zinc-800 space-y-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                        Pilihan Makanan Paket (Pisahkan dengan koma):
                      </label>
                      <input
                        type="text"
                        value={formComboFoods}
                        onChange={(e) => setFormComboFoods(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg text-xs bg-zinc-950 border border-zinc-800 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                        Pilihan Minuman Paket (Pisahkan dengan koma):
                      </label>
                      <input
                        type="text"
                        value={formComboDrinks}
                        onChange={(e) => setFormComboDrinks(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg text-xs bg-zinc-950 border border-zinc-800 text-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-white text-black text-xs font-bold hover:bg-zinc-200 transition-all shadow-md active:scale-95 disabled:opacity-50"
                >
                  {submitting ? 'Menyimpan...' : editingProduct ? 'Simpan Perubahan' : 'Tambah Menu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function KasirProductCard({
  product,
  categoryName,
  onToggleAvailability,
  onEdit,
  onDelete,
}: {
  product: Product;
  categoryName: string;
  onToggleAvailability: (id: number) => void;
  onEdit: (product: Product) => void;
  onDelete: (id: number, name: string) => void;
}) {
  const [imageError, setImageError] = useState(false);

  return (
    <div
      className={`p-4 rounded-2xl border bg-zinc-950 flex flex-col justify-between transition-all ${
        product.isAvailable
          ? 'border-zinc-850 hover:border-zinc-700'
          : 'border-zinc-900 opacity-60 grayscale'
      }`}
    >
      <div>
        {/* Thumbnail & Badges */}
        <div className="relative w-full h-36 rounded-xl overflow-hidden bg-zinc-900 mb-3">
          {product.imageUrl && !imageError ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600">
              <Coffee className="w-8 h-8 stroke-1 mb-1" />
              <span className="text-[10px] uppercase font-mono tracking-wider">Noir Blanc</span>
            </div>
          )}

          {/* Category pill */}
          <div className="absolute top-2 left-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/80 backdrop-blur-md text-white border border-white/20">
              {categoryName}
            </span>
          </div>

          {/* Availability Status */}
          <div className="absolute top-2 right-2">
            <button
              onClick={() => onToggleAvailability(product.id)}
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer ${
                product.isAvailable
                  ? 'bg-emerald-500 text-black hover:bg-emerald-400'
                  : 'bg-red-500 text-white hover:bg-red-400'
              }`}
              title="Klik untuk mengubah ketersediaan"
            >
              {product.isAvailable ? 'Tersedia' : 'Habis'}
            </button>
          </div>
        </div>

        {/* Title & Price */}
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-bold text-sm text-white line-clamp-1">
            {product.name}
          </h4>
          <span className="font-mono font-bold text-xs text-zinc-300 shrink-0">
            {formatRupiah(product.price)}
          </span>
        </div>

        {/* Description */}
        {product.description && (
          <p className="text-xs text-zinc-400 mt-1 line-clamp-2 min-h-[32px]">
            {product.description}
          </p>
        )}
      </div>

      {/* Card Action Footer */}
      <div className="mt-4 pt-3 border-t border-zinc-900 flex items-center justify-between">
        <span className="text-[11px] text-zinc-500 font-mono">
          ID #{product.id}
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(product)}
            className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
          >
            <Edit3 className="w-3 h-3" />
            <span>Edit</span>
          </button>
          <button
            onClick={() => onDelete(product.id, product.name)}
            className="px-2.5 py-1 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-200 border border-red-900/50 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
            <span>Hapus</span>
          </button>
        </div>
      </div>
    </div>
  );
}

