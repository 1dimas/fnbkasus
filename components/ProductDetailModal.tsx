'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Minus, 
  Flame, 
  Snowflake, 
  Coffee, 
  Sparkles, 
  UtensilsCrossed, 
  Check, 
  Clock,
  HeartCrack,
  Info
} from 'lucide-react';
import { Product, SelectedItemOptions } from '@/types';
import { formatRupiah } from '@/lib/utils';
import { useCartStore } from '@/store/useCartStore';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductDetailModal({
  product,
  isOpen,
  onClose,
}: ProductDetailModalProps) {
  const addItem = useCartStore((state) => state.addItem);

  // Form states
  const [quantity, setQuantity] = useState(1);
  const [temperature, setTemperature] = useState<'Panas (Hot)' | 'Dingin (Ice)'>('Panas (Hot)');
  const [sugarLevel, setSugarLevel] = useState<'Normal Sugar' | 'Less Sugar (50%)' | 'No Sugar (0%)'>('Normal Sugar');
  const [iceLevel, setIceLevel] = useState<'Normal Ice' | 'Less Ice' | 'No Ice'>('Normal Ice');
  const [servingTemp, setServingTemp] = useState<'Hangat (Dipanaskan)' | 'Suhu Ruang / Standar'>('Hangat (Dipanaskan)');
  const [spiciness, setSpiciness] = useState<'Tidak Pedas' | 'Sedang' | 'Pedas'>('Tidak Pedas');
  
  // Combo package selections
  const [selectedFood, setSelectedFood] = useState<string>('');
  const [selectedDrink, setSelectedDrink] = useState<string>('');
  const [comboDrinkTemp, setComboDrinkTemp] = useState<'Panas (Hot)' | 'Dingin (Ice)'>('Panas (Hot)');
  const [comboSugarLevel, setComboSugarLevel] = useState<'Normal Sugar' | 'Less Sugar' | 'No Sugar'>('Normal Sugar');

  // Customer custom notes
  const [customNotes, setCustomNotes] = useState('');
  const [isSuccessAnimated, setIsSuccessAnimated] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Initialize defaults whenever product opens
  useEffect(() => {
    if (product) {
      setQuantity(1);
      setCustomNotes('');
      setIsSuccessAnimated(false);
      setImageError(false);

      const isDrink = product.categoryId === 2 || product.categoryId === 3;
      // Default to Hot for Flat White / Espresso, Ice for V60 Japanese / Matcha if preferred
      if (product.name.toLowerCase().includes('v60') || product.name.toLowerCase().includes('japanese')) {
        setTemperature('Dingin (Ice)');
      } else {
        setTemperature('Panas (Hot)');
      }

      setSugarLevel('Normal Sugar');
      setIceLevel('Normal Ice');
      setServingTemp('Hangat (Dipanaskan)');
      setSpiciness('Tidak Pedas');

      // Combo defaults
      if (product.customizationConfig?.comboFoodOptions?.length) {
        setSelectedFood(product.customizationConfig.comboFoodOptions[0]);
      } else {
        setSelectedFood('');
      }

      if (product.customizationConfig?.comboDrinkOptions?.length) {
        setSelectedDrink(product.customizationConfig.comboDrinkOptions[0]);
      } else {
        setSelectedDrink('');
      }

      setComboDrinkTemp('Panas (Hot)');
      setComboSugarLevel('Normal Sugar');
    }
  }, [product, isOpen]);

  if (!isOpen || !product) return null;

  const isCoffee = product.categoryId === 2;
  const isNonCoffee = product.categoryId === 3;
  const isDrink = isCoffee || isNonCoffee;
  const isPastry = product.categoryId === 4;
  const isMainCourse = product.categoryId === 5;
  const isSnack = product.categoryId === 6;
  const isFood = isPastry || isMainCourse || isSnack;
  const isCombo = product.categoryId === 7 || Boolean(product.customizationConfig?.isComboPackage);

  // Build human-readable options summary
  const buildOptionsSummary = (): string => {
    const parts: string[] = [];

    if (isCombo) {
      if (selectedFood) parts.push(`Makanan: ${selectedFood}`);
      if (selectedDrink) {
        parts.push(`Minuman: ${selectedDrink} (${comboDrinkTemp === 'Panas (Hot)' ? 'Panas' : 'Dingin'}, ${comboSugarLevel})`);
      }
      if (product.customizationConfig?.allowsSpiciness && spiciness !== 'Tidak Pedas') {
        parts.push(`Level: ${spiciness}`);
      }
    } else if (isDrink) {
      parts.push(temperature === 'Panas (Hot)' ? 'Panas' : 'Dingin');
      if (sugarLevel !== 'Normal Sugar') {
        parts.push(sugarLevel);
      }
      if (temperature === 'Dingin (Ice)' && iceLevel !== 'Normal Ice') {
        parts.push(iceLevel);
      }
    } else if (isFood) {
      if (product.customizationConfig?.allowsHeating || isPastry) {
        parts.push(servingTemp === 'Hangat (Dipanaskan)' ? 'Hangat' : 'Standar');
      }
      if (product.customizationConfig?.allowsSpiciness && spiciness !== 'Tidak Pedas') {
        parts.push(`Pedas: ${spiciness}`);
      }
    }

    return parts.join(' • ');
  };

  const handleAddToCart = () => {
    const optionsSummary = buildOptionsSummary();
    const options: SelectedItemOptions = {
      temperature: isDrink ? temperature : undefined,
      sugarLevel: isDrink ? sugarLevel : undefined,
      iceLevel: isDrink && temperature === 'Dingin (Ice)' ? iceLevel : undefined,
      servingTemp: isFood ? servingTemp : undefined,
      spiciness: (isFood || isCombo) && product.customizationConfig?.allowsSpiciness ? spiciness : undefined,
      selectedFood: isCombo ? selectedFood : undefined,
      selectedDrink: isCombo ? selectedDrink : undefined,
      comboDrinkTemperature: isCombo ? comboDrinkTemp : undefined,
      comboSugarLevel: isCombo ? comboSugarLevel : undefined,
    };

    addItem(product, quantity, customNotes.trim(), optionsSummary, options);

    setIsSuccessAnimated(true);
    setTimeout(() => {
      setIsSuccessAnimated(false);
      onClose();
    }, 350);
  };

  const addNoteTag = (tag: string) => {
    if (!customNotes.includes(tag)) {
      setCustomNotes((prev) => (prev ? `${prev}, ${tag}` : tag));
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
      />

      {/* Modal / Bottom Sheet Box */}
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-950 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden z-10 animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200">
        
        {/* Sticky Header with close button */}
        <div className="relative w-full h-52 sm:h-60 bg-zinc-100 dark:bg-zinc-900 shrink-0 overflow-hidden">
          {product.imageUrl && !imageError ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400">
              <Coffee className="w-12 h-12 stroke-1 mb-2" />
              <span className="text-xs font-mono tracking-widest uppercase">NOIR & BLANC</span>
            </div>
          )}

          {/* Dark gradient overlay for contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />

          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Tutup detail menu"
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md flex items-center justify-center transition-all active:scale-95 border border-white/20"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Floating Category & Availability Pills */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-black/75 backdrop-blur-md text-white border border-white/20 shadow-sm">
              {product.category?.name || (isCombo ? 'Paket Hemat' : isDrink ? 'Minuman' : 'Makanan')}
            </span>
            {product.isAvailable ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Tersedia
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-950/80 text-red-300 border border-red-500/30 backdrop-blur-md">
                Habis
              </span>
            )}
          </div>

          {/* Title and Price in bottom of image banner */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-tight drop-shadow-md">
              {product.name}
            </h2>
            <p className="text-lg font-bold font-mono text-zinc-200 mt-0.5">
              {formatRupiah(product.price)}
            </p>
          </div>
        </div>

        {/* Scrollable Customization Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {/* Product Description */}
          {product.description && (
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed bg-zinc-50 dark:bg-zinc-900/60 p-3.5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80">
              {product.description}
            </p>
          )}

          {/* ======================================================== */}
          {/* CASE 1: MINUMAN / COFFEE / NON-COFFEE                     */}
          {/* ======================================================== */}
          {isDrink && (
            <div className="space-y-4 pt-1">
              {/* Suhu: Panas (Hot) vs Dingin (Ice) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-200 flex items-center gap-1.5">
                    <span>Pilihan Suhu Kopi / Minuman</span>
                    <span className="text-[10px] text-zinc-400 font-normal">(Wajib)</span>
                  </label>
                  <span className="text-[11px] font-semibold text-zinc-500">
                    {temperature === 'Panas (Hot)' ? 'Disajikan Panas' : 'Disajikan Dingin'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setTemperature('Panas (Hot)')}
                    className={`py-3 px-4 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer ${
                      temperature === 'Panas (Hot)'
                        ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-md'
                        : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400'
                    }`}
                  >
                    <Flame className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Panas (Hot)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTemperature('Dingin (Ice)')}
                    className={`py-3 px-4 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer ${
                      temperature === 'Dingin (Ice)'
                        ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-md'
                        : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400'
                    }`}
                  >
                    <Snowflake className="w-4 h-4 text-sky-400 shrink-0" />
                    <span>Dingin (Ice)</span>
                  </button>
                </div>
              </div>

              {/* Tingkat Kemanisan (Sugar Level) */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-200 block mb-2">
                  Tingkat Kemanisan (Sugar Level)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Normal (100%)', val: 'Normal Sugar' as const },
                    { label: 'Less Sugar (50%)', val: 'Less Sugar (50%)' as const },
                    { label: 'Tanpa Gula (0%)', val: 'No Sugar (0%)' as const },
                  ].map((sugar) => (
                    <button
                      key={sugar.val}
                      type="button"
                      onClick={() => setSugarLevel(sugar.val)}
                      className={`py-2.5 px-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                        sugarLevel === sugar.val
                          ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black border-zinc-900 dark:border-white font-bold'
                          : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400'
                      }`}
                    >
                      {sugar.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tingkat Es Batu (Ice Level) - Hanya muncul jika Dingin */}
              {temperature === 'Dingin (Ice)' && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-200 block mb-2">
                    Jumlah Es Batu (Ice Level)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Normal Ice', val: 'Normal Ice' as const },
                      { label: 'Sedikit Es', val: 'Less Ice' as const },
                      { label: 'Tanpa Es', val: 'No Ice' as const },
                    ].map((ice) => (
                      <button
                        key={ice.val}
                        type="button"
                        onClick={() => setIceLevel(ice.val)}
                        className={`py-2.5 px-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                          iceLevel === ice.val
                            ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black border-zinc-900 dark:border-white font-bold'
                            : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400'
                        }`}
                      >
                        {ice.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* CASE 2: PAKET MAKAN & MINUM (COMBO DEALS)                */}
          {/* ======================================================== */}
          {isCombo && (
            <div className="space-y-4 pt-1">
              <div className="p-3 bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-300 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>Paket Hemat Kombo: Pilih 1 Makanan & 1 Minuman dengan suhu dan rasa sesuai selera Anda!</span>
              </div>

              {/* Pilih Makanan */}
              {product.customizationConfig?.comboFoodOptions && (
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-200 block mb-2">
                    1. Pilih Menu Makanan Paket:
                  </label>
                  <div className="space-y-2">
                    {product.customizationConfig.comboFoodOptions.map((foodName) => (
                      <button
                        key={foodName}
                        type="button"
                        onClick={() => setSelectedFood(foodName)}
                        className={`w-full p-3 rounded-xl border flex items-center justify-between text-left text-xs sm:text-sm font-semibold transition-all ${
                          selectedFood === foodName
                            ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-sm'
                            : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400'
                        }`}
                      >
                        <span>{foodName}</span>
                        {selectedFood === foodName && <Check className="w-4 h-4 shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Pilih Minuman */}
              {product.customizationConfig?.comboDrinkOptions && (
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-200 block mb-2">
                    2. Pilih Menu Minuman Paket:
                  </label>
                  <div className="space-y-2">
                    {product.customizationConfig.comboDrinkOptions.map((drinkName) => (
                      <button
                        key={drinkName}
                        type="button"
                        onClick={() => setSelectedDrink(drinkName)}
                        className={`w-full p-3 rounded-xl border flex items-center justify-between text-left text-xs sm:text-sm font-semibold transition-all ${
                          selectedDrink === drinkName
                            ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-sm'
                            : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400'
                        }`}
                      >
                        <span>{drinkName}</span>
                        {selectedDrink === drinkName && <Check className="w-4 h-4 shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Suhu Minuman Paket: Panas vs Dingin */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-200 block mb-2">
                  Suhu Minuman Paket:
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setComboDrinkTemp('Panas (Hot)')}
                    className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs sm:text-sm transition-all ${
                      comboDrinkTemp === 'Panas (Hot)'
                        ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black border-zinc-900 dark:border-white shadow-sm'
                        : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400'
                    }`}
                  >
                    <Flame className="w-4 h-4 text-amber-500" />
                    <span>Panas (Hot)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setComboDrinkTemp('Dingin (Ice)')}
                    className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs sm:text-sm transition-all ${
                      comboDrinkTemp === 'Dingin (Ice)'
                        ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black border-zinc-900 dark:border-white shadow-sm'
                        : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400'
                    }`}
                  >
                    <Snowflake className="w-4 h-4 text-sky-400" />
                    <span>Dingin (Ice)</span>
                  </button>
                </div>
              </div>

              {/* Level Manis Minuman Paket */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-200 block mb-2">
                  Tingkat Manis Minuman:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Normal', val: 'Normal Sugar' as const },
                    { label: 'Less Sugar', val: 'Less Sugar' as const },
                    { label: 'No Sugar', val: 'No Sugar' as const },
                  ].map((s) => (
                    <button
                      key={s.val}
                      type="button"
                      onClick={() => setComboSugarLevel(s.val)}
                      className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                        comboSugarLevel === s.val
                          ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black border-zinc-900 dark:border-white'
                          : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* CASE 3: MAKANAN (PASTRY, MAIN COURSE, SNACKS)            */}
          {/* ======================================================== */}
          {isFood && !isCombo && (
            <div className="space-y-4 pt-1">
              {/* Penyajian: Hangat / Dipanaskan vs Standar */}
              {(product.customizationConfig?.allowsHeating || isPastry) && (
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-200 block mb-2">
                    Opsi Penyajian Makanan
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setServingTemp('Hangat (Dipanaskan)')}
                      className={`py-3 px-3 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs sm:text-sm transition-all ${
                        servingTemp === 'Hangat (Dipanaskan)'
                          ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-md'
                          : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800'
                      }`}
                    >
                      <span>Dipanaskan (Hangat)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setServingTemp('Suhu Ruang / Standar')}
                      className={`py-3 px-3 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs sm:text-sm transition-all ${
                        servingTemp === 'Suhu Ruang / Standar'
                          ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-md'
                          : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800'
                      }`}
                    >
                      <span>Suhu Ruang</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Tingkat Kepedasan (Spiciness) */}
              {(product.customizationConfig?.allowsSpiciness || isMainCourse || isSnack) && (
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-200 block mb-2">
                    Tingkat Kepedasan / Bumbu
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Tidak Pedas', val: 'Tidak Pedas' as const },
                      { label: 'Sedang (Mild)', val: 'Sedang' as const },
                      { label: 'Pedas (Spicy)', val: 'Pedas' as const },
                    ].map((spice) => (
                      <button
                        key={spice.val}
                        type="button"
                        onClick={() => setSpiciness(spice.val)}
                        className={`py-2.5 px-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                          spiciness === spice.val
                            ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black border-zinc-900 dark:border-white font-bold'
                            : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800'
                        }`}
                      >
                        {spice.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Catatan Khusus untuk Koki / Barista */}
          <div className="pt-2 border-t border-zinc-200/80 dark:border-zinc-800/80 space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-200 flex items-center justify-between">
              <span>Catatan Khusus (Opsional)</span>
              <span className="text-[10px] text-zinc-400 font-normal">Maks. 100 karakter</span>
            </label>

            {/* Quick chips recommendations */}
            <div className="flex flex-wrap gap-1.5 pb-1">
              {isDrink && (
                <>
                  <button
                    type="button"
                    onClick={() => addNoteTag('Gula pisah')}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 transition-colors"
                  >
                    + Gula pisah
                  </button>
                  <button
                    type="button"
                    onClick={() => addNoteTag('Ekstra panas')}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 transition-colors"
                  >
                    + Ekstra panas
                  </button>
                  <button
                    type="button"
                    onClick={() => addNoteTag('Susu oat jika ada')}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 transition-colors"
                  >
                    + Susu oat
                  </button>
                </>
              )}
              {isFood && (
                <>
                  <button
                    type="button"
                    onClick={() => addNoteTag('Saus dipisah')}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 transition-colors"
                  >
                    + Saus dipisah
                  </button>
                  <button
                    type="button"
                    onClick={() => addNoteTag('Bakar ekstra renyah')}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 transition-colors"
                  >
                    + Ekstra renyah
                  </button>
                </>
              )}
            </div>

            <textarea
              rows={2}
              maxLength={120}
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="Tulis catatan tambahan untuk barista atau dapur..."
              className="w-full text-xs p-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white resize-none"
            />
          </div>
        </div>

        {/* Footer: Quantity Stepper & Add Button */}
        <div className="p-4 sm:p-5 border-t border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md flex items-center gap-3">
          {/* Stepper */}
          <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-2xl p-1 shrink-0">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="w-9 h-9 rounded-xl hover:bg-white dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Kurangi kuantitas"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-6 text-center text-sm font-extrabold font-mono text-zinc-900 dark:text-white">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className="w-9 h-9 rounded-xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center transition-all active:scale-95 shadow-sm"
              aria-label="Tambah kuantitas"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add to Cart Primary Button */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!product.isAvailable}
            className={`flex-1 py-3.5 px-4 rounded-2xl font-bold text-sm tracking-wide flex items-center justify-between transition-all duration-200 shadow-lg active:scale-[0.98] ${
              !product.isAvailable
                ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed'
                : isSuccessAnimated
                ? 'bg-emerald-600 text-white scale-[1.02]'
                : 'bg-black hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black'
            }`}
          >
            {isSuccessAnimated ? (
              <span className="w-full text-center flex items-center justify-center gap-2">
                <Check className="w-4 h-4 stroke-[3]" />
                Berhasil Ditambahkan!
              </span>
            ) : (
              <>
                <span>Tambah ke Pesanan</span>
                <span className="font-mono text-xs sm:text-sm font-black">
                  {formatRupiah(product.price * quantity)}
                </span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
