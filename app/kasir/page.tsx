'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  LogOut, 
  RefreshCw, 
  Clock, 
  Utensils, 
  CheckCircle, 
  XCircle, 
  Coffee, 
  User, 
  ChevronRight,
  TrendingUp,
  AlertCircle,
  ArrowLeft,
  FileText,
  ShoppingBag,
  UtensilsCrossed,
  QrCode
} from 'lucide-react';
import { OrderRecord, OrderStatus } from '@/types';
import { formatRupiah } from '@/lib/utils';
import { KasirMenuManager } from '@/components/KasirMenuManager';
import { TableQrGenerator } from '@/components/TableQrGenerator';

export default function KasirOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [currentTime, setCurrentTime] = useState('');
  const [activeTab, setActiveTab] = useState<'orders' | 'menu' | 'qr'>('orders');

  // Check tab query parameter (e.g. ?tab=qr)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab === 'qr' || tab === 'menu' || tab === 'orders') {
        setActiveTab(tab);
      }
    }
  }, []);

  // Update clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch orders from API
  const fetchOrders = useCallback(async (isSilent = false) => {
    if (!isSilent) setRefreshing(true);
    try {
      // Check auth status first
      const authRes = await fetch('/api/auth/check');
      const authData = await authRes.json();
      if (!authData.authenticated) {
        router.push('/kasir/login');
        return;
      }

      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.success && data.orders) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [router]);

  // Initial load
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Auto-refresh polling every 10 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchOrders(true);
    }, 10000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchOrders]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/kasir/login');
      router.refresh();
    } catch (err) {
      console.error('Failed to logout:', err);
    }
  };

  // Update order status
  const handleUpdateStatus = async (orderId: number, newStatus: OrderStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        // Update local state immediately for responsive UX
        setOrders((prev) =>
          prev.map((ord) => (ord.id === orderId ? { ...ord, status: newStatus } : ord))
        );
      }
    } catch (err) {
      console.error('Failed to update order status:', err);
    }
  };

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    if (statusFilter === 'all') return true;
    return order.status === statusFilter;
  });

  // Calculate stats
  const totalOrdersCount = orders.length;
  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const diprosesCount = orders.filter((o) => o.status === 'diproses').length;
  const selesaiCount = orders.filter((o) => o.status === 'selesai').length;
  const totalRevenue = orders
    .filter((o) => o.status !== 'dibatalkan')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white text-black flex items-center justify-center font-bold">
              <Coffee className="w-5 h-5 stroke-2" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base md:text-lg tracking-tight uppercase">
                  Kasir • Monitor Pesanan
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-400">
                  {currentTime}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 -mt-0.5">
                Melihat dan mengelola antrean pesanan kafe
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            {/* Auto refresh toggle */}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                autoRefresh
                  ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300'
                  : 'border-zinc-800 bg-zinc-900 text-zinc-500'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'}`} />
              Auto-Sync {autoRefresh ? 'Aktif' : 'Nonaktif'}
            </button>

            {/* Refresh button */}
            <button
              onClick={() => fetchOrders(false)}
              disabled={refreshing}
              className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 transition-all active:scale-95 disabled:opacity-50"
              title="Perbarui daftar pesanan"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>

            {/* Link to public catalog */}
            <Link
              href="/"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-300 transition-all"
            >
              <Utensils className="w-3.5 h-3.5" />
              Menu Pelanggan
            </Link>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-900/50 text-red-300 text-xs font-semibold transition-all active:scale-95"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Navigation Tabs: Antrean Pesanan vs Kelola Menu */}
        <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-white text-black shadow-md'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Monitor Antrean Pesanan</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-amber-400 text-black font-extrabold">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('menu')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'menu'
                ? 'bg-white text-black shadow-md'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>Kelola Menu (Katalog)</span>
          </button>

          <button
            onClick={() => setActiveTab('qr')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'qr'
                ? 'bg-white text-black shadow-md'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Generator QR Meja Permanen</span>
          </button>
        </div>

        {activeTab === 'menu' ? (
          <KasirMenuManager />
        ) : activeTab === 'qr' ? (
          <TableQrGenerator />
        ) : (
          <>
            {/* KPI Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-850 space-y-1">
                <span className="text-[11px] uppercase tracking-wider font-medium text-zinc-500 block">
                  Total Pesanan
                </span>
                <p className="text-2xl font-black tracking-tight">{totalOrdersCount}</p>
              </div>

          <div className="p-4 rounded-2xl bg-zinc-950 border border-amber-900/30 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider font-medium text-amber-400 block">
                Menunggu
              </span>
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            </div>
            <p className="text-2xl font-black tracking-tight text-amber-300">{pendingCount}</p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-950 border border-blue-900/30 space-y-1">
            <span className="text-[11px] uppercase tracking-wider font-medium text-blue-400 block">
              Diproses
            </span>
            <p className="text-2xl font-black tracking-tight text-blue-300">{diprosesCount}</p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-950 border border-emerald-900/30 space-y-1">
            <span className="text-[11px] uppercase tracking-wider font-medium text-emerald-400 block">
              Selesai
            </span>
            <p className="text-2xl font-black tracking-tight text-emerald-300">{selesaiCount}</p>
          </div>

          <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-zinc-950 border border-zinc-850 space-y-1">
            <span className="text-[11px] uppercase tracking-wider font-medium text-zinc-500 block">
              Estimasi Omset
            </span>
            <p className="text-xl font-black tracking-tight text-white">{formatRupiah(totalRevenue)}</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {[
            { id: 'all', label: 'Semua Pesanan', count: totalOrdersCount },
            { id: 'pending', label: 'Menunggu (Pending)', count: pendingCount },
            { id: 'diproses', label: 'Sedang Diproses', count: diprosesCount },
            { id: 'selesai', label: 'Selesai', count: selesaiCount },
            { id: 'dibatalkan', label: 'Dibatalkan', count: orders.filter((o) => o.status === 'dibatalkan').length },
          ].map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                  isActive
                    ? 'bg-white text-black shadow-md'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${
                  isActive ? 'bg-zinc-200 text-black' : 'bg-zinc-800 text-zinc-300'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Orders List View */}
        {loading ? (
          <div className="p-16 text-center text-zinc-500 font-mono text-sm space-y-2">
            <RefreshCw className="w-6 h-6 mx-auto animate-spin" />
            <p>Memuat daftar antrean pesanan...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-16 rounded-3xl bg-zinc-950 border border-zinc-900 text-center space-y-3">
            <Coffee className="w-10 h-10 mx-auto text-zinc-600 stroke-1" />
            <h3 className="font-semibold text-zinc-300">Tidak ada pesanan dalam kategori ini</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Pesanan baru yang dikirim oleh pelanggan dari meja akan muncul di sini secara langsung.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOrders.map((order) => {
              const formattedDate = new Date(order.createdAt).toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={order.id}
                  className={`rounded-2xl border bg-zinc-950 p-5 flex flex-col justify-between transition-all ${
                    order.status === 'pending'
                      ? 'border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.07)] ring-1 ring-amber-500/30'
                      : order.status === 'diproses'
                      ? 'border-blue-500/40 shadow-sm'
                      : order.status === 'selesai'
                      ? 'border-zinc-850 opacity-80'
                      : 'border-zinc-900 opacity-50 grayscale'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Order Header: Table & Status */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="px-3.5 py-1.5 rounded-xl bg-white text-black font-extrabold text-sm tracking-tight shadow-sm">
                          MEJA {order.tableNumber}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs font-bold text-zinc-300">
                              #{order.orderCode}
                            </span>
                            <span className="text-[10px] text-zinc-500 font-medium">
                              • {formattedDate}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5">
                            <User className="w-3 h-3 text-zinc-500" />
                            {order.customerName || 'Tamu'}
                            <span className="text-[10px] uppercase font-bold text-zinc-300 bg-zinc-900 px-2 py-0.5 rounded ml-1 border border-zinc-800">
                              Dine In
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div>
                        {order.status === 'pending' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-950/60 text-amber-300 border border-amber-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                            Pending
                          </span>
                        )}
                        {order.status === 'diproses' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-950/60 text-blue-300 border border-blue-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                            Diproses
                          </span>
                        )}
                        {order.status === 'selesai' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-950/60 text-emerald-300 border border-emerald-800">
                            <CheckCircle className="w-3 h-3" />
                            Selesai
                          </span>
                        )}
                        {order.status === 'dibatalkan' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-900 text-zinc-500 border border-zinc-800">
                            <XCircle className="w-3 h-3" />
                            Batal
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Table General Notes if any */}
                    {order.generalNotes && (
                      <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs text-amber-200/90 flex items-start gap-2">
                        <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span className="leading-snug">{order.generalNotes}</span>
                      </div>
                    )}

                    {/* Items List */}
                    <div className="space-y-2 pt-2 border-t border-zinc-900">
                      <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold block">
                        Daftar Menu:
                      </span>
                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {order.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-start justify-between text-xs py-1 border-b border-zinc-900/50 last:border-none"
                          >
                            <div className="space-y-0.5">
                              <p className="font-semibold text-zinc-200">
                                <span className="font-bold text-white mr-1.5 font-mono">
                                  {item.quantity}x
                                </span>
                                {item.productName}
                              </p>
                              {item.notes && (
                                <p className="text-[11px] text-zinc-400 italic pl-5">
                                  Note: {item.notes}
                                </p>
                              )}
                            </div>
                            <span className="font-mono text-zinc-400 font-medium ml-2">
                              {formatRupiah(item.subtotal)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Order Footer: Total & Actions */}
                  <div className="mt-5 pt-3 border-t border-zinc-900 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase text-zinc-500 font-medium">Total</span>
                      <span className="text-base font-extrabold text-white">
                        {formatRupiah(order.totalAmount)}
                      </span>
                    </div>

                    {/* Action buttons based on status */}
                    <div className="flex items-center gap-2">
                      {order.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'diproses')}
                            className="flex-1 py-2 px-3 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-bold transition-all active:scale-95 text-center shadow-md"
                          >
                            Mulai Proses
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'dibatalkan')}
                            className="py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 text-xs font-semibold transition-all"
                          >
                            Tolak
                          </button>
                        </>
                      )}

                      {order.status === 'diproses' && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'selesai')}
                          className="w-full py-2 px-3 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black text-xs font-bold transition-all active:scale-95 text-center shadow-md flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Tandai Selesai
                        </button>
                      )}

                      {order.status === 'selesai' && (
                        <div className="w-full py-1.5 text-center text-xs text-zinc-500 font-medium">
                          ✓ Pesanan Selesai
                        </div>
                      )}

                      {order.status === 'dibatalkan' && (
                        <div className="w-full py-1.5 text-center text-xs text-zinc-600 font-medium">
                          Pesanan Dibatalkan
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </>
    )}
  </main>
</div>
);
}

