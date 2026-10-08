'use client';

import React, { useState } from 'react';
import { Search, MapPin, QrCode } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

interface TableBannerProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function TableBanner({ searchQuery, onSearchChange }: TableBannerProps) {
  const orderDetails = useCartStore((state) => state.orderDetails);
  const setOrderDetails = useCartStore((state) => state.setOrderDetails);
  const [isEditingTable, setIsEditingTable] = useState(false);
  const [tempTable, setTempTable] = useState(orderDetails.tableNumber);

  const handleSaveTable = (e: React.FormEvent) => {
    e.preventDefault();
    setOrderDetails({ tableNumber: tempTable });
    setIsEditingTable(false);
  };

  return (
    <section className="max-w-4xl mx-auto px-4 pt-6 pb-2 space-y-5">
      {/* Hero Banner Card */}
      <div className="relative overflow-hidden rounded-3xl bg-black text-white p-6 md:p-8 border border-zinc-800 shadow-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-zinc-800/40 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-700/80 text-[11px] font-medium text-zinc-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Open Daily 08.00 - 23.00
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white uppercase">
              Pesan Langsung Dari Meja
            </h2>
            <p className="text-xs md:text-sm text-zinc-400 max-w-md">
              Pilih menu, atur pesanan Anda, dan kirim langsung ke kasir secara real-time tanpa harus mengantre.
            </p>
          </div>

          {/* Quick Table Indicator / Editor */}
          <div className="flex flex-col sm:items-end gap-2">
            {isEditingTable ? (
              <form onSubmit={handleSaveTable} className="flex items-center gap-1.5 bg-zinc-900 p-1.5 rounded-xl border border-zinc-700">
                <input
                  type="text"
                  placeholder="No. Meja"
                  value={tempTable}
                  onChange={(e) => setTempTable(e.target.value)}
                  className="w-24 px-2 py-1 text-xs bg-black text-white rounded-lg border border-zinc-700 focus:outline-none focus:ring-1 focus:ring-white"
                  autoFocus
                />
                <button
                  type="submit"
                  className="text-xs px-3 py-1 bg-white text-black font-bold rounded-lg hover:bg-zinc-200 transition-colors"
                >
                  Simpan
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-2 bg-zinc-900/90 border border-zinc-800 px-3.5 py-2 rounded-2xl backdrop-blur-sm">
                <MapPin className="w-4 h-4 text-zinc-300" />
                <div className="text-left">
                  <span className="text-[10px] text-zinc-400 uppercase tracking-widest block font-medium">
                    Posisi Duduk
                  </span>
                  <span className="text-xs font-bold text-white tracking-wide">
                    {orderDetails.tableNumber ? `Meja ${orderDetails.tableNumber}` : 'Belum diisi'}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setTempTable(orderDetails.tableNumber);
                    setIsEditingTable(true);
                  }}
                  className="ml-2 text-[11px] font-semibold text-zinc-300 hover:text-white underline"
                >
                  {orderDetails.tableNumber ? 'Ubah' : 'Set Meja'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari kopi, pastry, makanan..."
          className="w-full pl-10 pr-4 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all shadow-sm placeholder:text-zinc-400"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
          >
            Hapus
          </button>
        )}
      </div>
    </section>
  );
}
