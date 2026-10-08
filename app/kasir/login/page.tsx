'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Coffee, ArrowLeft, KeyRound, User, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function KasirLoginPage() {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<'pin' | 'credentials'>('pin');
  const [pin, setPin] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = authMode === 'pin' ? { pin } : { username, password };

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || 'Login gagal. Periksa kembali PIN atau kredensial.');
        setLoading(false);
        return;
      }

      router.push('/kasir');
      router.refresh();
    } catch (err) {
      setError('Terjadi kendala koneksi saat menghubungi server.');
      setLoading(false);
    }
  };

  const handleKeypadPress = (val: string) => {
    if (pin.length < 6) {
      setPin((prev) => prev + val);
      setError('');
    }
  };

  const handleKeypadBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError('');
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center px-4 py-12 selection:bg-white selection:text-black">
      {/* Back to Customer Menu */}
      <div className="w-full max-w-sm mb-6 flex justify-between items-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Menu Pelanggan
        </Link>
      </div>

      <div className="w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-44 h-44 rounded-full bg-zinc-800/20 blur-2xl pointer-events-none" />

        {/* Brand & Header */}
        <div className="text-center mb-6 space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-white text-black flex items-center justify-center font-bold shadow-md">
            <Coffee className="w-6 h-6 stroke-2" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold uppercase tracking-tight text-white">
              Portal Kasir
            </h1>
            <p className="text-xs text-zinc-400">
              Masuk untuk melihat dan memproses pesanan kafe
            </p>
          </div>
        </div>

        {/* Toggle Mode: PIN vs Akun */}
        <div className="flex bg-zinc-900 p-1 rounded-xl mb-6 border border-zinc-800">
          <button
            type="button"
            onClick={() => {
              setAuthMode('pin');
              setError('');
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              authMode === 'pin'
                ? 'bg-white text-black shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Masuk PIN Cepat
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('credentials');
              setError('');
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              authMode === 'credentials'
                ? 'bg-white text-black shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Username & Sandi
          </button>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-red-950/60 border border-red-800/80 text-red-300 text-xs flex items-center gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {authMode === 'pin' ? (
          <form onSubmit={handleLogin} className="space-y-5">
            {/* PIN Display */}
            <div className="text-center space-y-2">
              <label className="text-[11px] font-semibold tracking-wider uppercase text-zinc-400">
                Masukkan PIN Kasir
              </label>
              <div className="flex justify-center items-center gap-3 py-2">
                {[0, 1, 2, 3].map((idx) => (
                  <div
                    key={idx}
                    className={`w-3.5 h-3.5 rounded-full border transition-all ${
                      pin.length > idx
                        ? 'bg-white border-white scale-110 shadow-sm'
                        : 'border-zinc-700 bg-zinc-900'
                    }`}
                  />
                ))}
              </div>
              <input
                type="password"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full text-center tracking-[1em] text-lg font-mono py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white"
                placeholder="••••"
                autoFocus
              />
            </div>

            {/* Quick Keypad */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleKeypadPress(num.toString())}
                  className="py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-base font-bold text-white border border-zinc-850 active:scale-95 transition-all"
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPin('')}
                className="py-3 rounded-xl bg-zinc-900/50 hover:bg-zinc-800 text-xs font-semibold text-zinc-400 border border-zinc-850"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => handleKeypadPress('0')}
                className="py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-base font-bold text-white border border-zinc-850 active:scale-95 transition-all"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleKeypadBackspace}
                className="py-3 rounded-xl bg-zinc-900/50 hover:bg-zinc-800 text-xs font-semibold text-zinc-400 border border-zinc-850"
              >
                ⌫
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || !pin}
              className="w-full py-3 rounded-xl bg-white text-black font-bold text-sm tracking-wide hover:bg-zinc-200 transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? 'Memverifikasi...' : 'Buka Dashboard Pesanan'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">
                Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="kasir"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">
                Kata Sandi
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-white text-black font-bold text-sm tracking-wide hover:bg-zinc-200 transition-all active:scale-[0.99] disabled:opacity-50 shadow-lg mt-2"
            >
              {loading ? 'Memverifikasi...' : 'Masuk Sebagai Kasir'}
            </button>
          </form>
        )}

        {/* Demo credentials hint */}
        <div className="mt-6 pt-4 border-t border-zinc-900 text-center">
          <p className="text-[11px] text-zinc-500">
            Kredensial Default:{' '}
            <span className="text-zinc-300 font-mono font-medium">PIN: 1234</span> atau{' '}
            <span className="text-zinc-300 font-mono font-medium">kasir / kasir123</span>
          </p>
        </div>
      </div>
    </div>
  );
}
