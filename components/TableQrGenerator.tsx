'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  QrCode, 
  Printer, 
  Download, 
  Copy, 
  Check, 
  ExternalLink, 
  Layers, 
  Settings2, 
  Sparkles, 
  ShieldCheck, 
  Info, 
  Maximize2,
  RefreshCw,
  FileCode2,
  CheckCircle2
} from 'lucide-react';
import { 
  buildTableOrderUrl, 
  generateQrDataUrl, 
  generateQrSvg, 
  downloadDataUrl, 
  downloadTextAsFile,
  TableQrCardData 
} from '@/lib/qr-generator';

type CardTheme = 'noir' | 'minimal' | 'standee';

export function TableQrGenerator() {
  // Base URL state
  const [baseUrl, setBaseUrl] = useState<string>('');
  const [customDomain, setCustomDomain] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [activeMode, setActiveMode] = useState<'single' | 'batch'>('single');

  // Single table state
  const [singleTableNumber, setSingleTableNumber] = useState<string>('01');
  const [singleQrDataUrl, setSingleQrDataUrl] = useState<string>('');
  const [singleSvg, setSingleSvg] = useState<string>('');

  // Batch tables state
  const [batchStart, setBatchStart] = useState<number>(1);
  const [batchEnd, setBatchEnd] = useState<number>(12);
  const [batchPrefix, setBatchPrefix] = useState<string>('');
  const [padZero, setPadZero] = useState<boolean>(true);
  const [batchCards, setBatchCards] = useState<TableQrCardData[]>([]);
  const [isGeneratingBatch, setIsGeneratingBatch] = useState<boolean>(false);

  // Card customization
  const [cardTheme, setCardTheme] = useState<CardTheme>('noir');
  const [cafeName, setCafeName] = useState<string>('NOIR & BLANC COFFEE');
  const [subHeader, setSubHeader] = useState<string>('SELF-SERVICE ORDER');
  const [instructions, setInstructions] = useState<string>('Scan QR ini dengan kamera HP • Pilih Menu • Pesan langsung dari meja');

  // Initialize Base URL from browser
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedDomain = localStorage.getItem('qr_custom_base_url');
      if (savedDomain) {
        setBaseUrl(savedDomain);
        setCustomDomain(savedDomain);
      } else {
        const origin = window.location.origin;
        setBaseUrl(origin);
        setCustomDomain(origin);
      }
    }
  }, []);

  // Generate single QR when inputs change
  useEffect(() => {
    if (!baseUrl || !singleTableNumber.trim()) return;

    const url = buildTableOrderUrl(baseUrl, singleTableNumber);
    let isCancelled = false;

    async function generate() {
      try {
        const [dataUrl, svg] = await Promise.all([
          generateQrDataUrl(url, 900),
          generateQrSvg(url),
        ]);
        if (!isCancelled) {
          setSingleQrDataUrl(dataUrl);
          setSingleSvg(svg);
        }
      } catch (err) {
        console.error('Failed to generate single QR:', err);
      }
    }

    generate();

    return () => {
      isCancelled = true;
    };
  }, [baseUrl, singleTableNumber]);

  // Handle saving custom base URL
  const handleSaveDomain = (urlToSave: string) => {
    const cleaned = urlToSave.trim().replace(/\/+$/, '');
    setBaseUrl(cleaned);
    setCustomDomain(cleaned);
    try {
      localStorage.setItem('qr_custom_base_url', cleaned);
    } catch (e) {
      console.warn(e);
    }
  };

  const handleResetToOrigin = () => {
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      handleSaveDomain(origin);
    }
  };

  // Generate Batch Cards
  const handleGenerateBatch = async () => {
    if (!baseUrl) return;
    setIsGeneratingBatch(true);

    try {
      const cards: TableQrCardData[] = [];
      const start = Math.min(batchStart, batchEnd);
      const end = Math.max(batchStart, batchEnd);

      for (let i = start; i <= end; i++) {
        const numStr = padZero && i < 10 ? `0${i}` : `${i}`;
        const finalTable = batchPrefix ? `${batchPrefix}${numStr}` : numStr;
        const targetUrl = buildTableOrderUrl(baseUrl, finalTable);
        const qrUrl = await generateQrDataUrl(targetUrl, 600);

        cards.push({
          tableNumber: finalTable,
          url: targetUrl,
          qrDataUrl: qrUrl,
        });
      }

      setBatchCards(cards);
    } catch (err) {
      console.error('Error generating batch QR cards:', err);
    } finally {
      setIsGeneratingBatch(false);
    }
  };

  // Copy single link
  const handleCopyLink = () => {
    const url = buildTableOrderUrl(baseUrl, singleTableNumber);
    navigator.clipboard.writeText(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Print trigger
  const handlePrint = () => {
    window.print();
  };

  const singleUrl = buildTableOrderUrl(baseUrl, singleTableNumber);

  return (
    <div className="space-y-6">
      {/* Permanent QR Guarantee Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-950 to-black p-5 sm:p-6 border border-zinc-800 text-white shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-[11px] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              100% Permanen &amp; Statis — Tidak Ada Masa Kedaluwarsa
            </div>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
              <QrCode className="w-6 h-6 text-white" />
              Sistem Generator QR Meja
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Cetak QR Code ini <strong>sekali untuk selamanya</strong> dan tempel di setiap meja kafe. Ketika pelanggan scan QR, mereka langsung masuk ke website ini dan nomor meja <strong>otomatis terkunci</strong> di keranjang belanja.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveMode('single')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeMode === 'single'
                  ? 'bg-white text-black shadow-lg scale-102'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              Meja Satuan
            </button>
            <button
              onClick={() => {
                setActiveMode('batch');
                if (batchCards.length === 0) handleGenerateBatch();
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeMode === 'batch'
                  ? 'bg-white text-black shadow-lg scale-102'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Generate Banyak Meja (Batch)
            </button>
          </div>
        </div>
      </div>

      {/* Domain / Target URL Configuration */}
      <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-zinc-400" />
            <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
              Konfigurasi Domain Website Kafe
            </h3>
          </div>
          <span className="text-[11px] text-zinc-400">
            QR akan mengarahkan pelanggan ke domain ini
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={customDomain}
            onChange={(e) => setCustomDomain(e.target.value)}
            placeholder="https://contoh-cafe-anda.vercel.app"
            className="flex-1 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-zinc-900 border border-zinc-700 text-white font-mono focus:outline-none focus:ring-2 focus:ring-white"
          />
          <button
            onClick={() => handleSaveDomain(customDomain)}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs transition-colors shrink-0 cursor-pointer"
          >
            Terapkan URL
          </button>
          <button
            onClick={handleResetToOrigin}
            className="px-3.5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 text-xs font-medium transition-colors shrink-0 cursor-pointer"
            title="Gunakan alamat browser yang sedang aktif"
          >
            Gunakan URL Aktif
          </button>
        </div>

        {baseUrl.includes('localhost') && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-950/40 border border-amber-900/50 text-amber-200 text-xs">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p>
              <strong>Tips Testing di HP:</strong> Karena URL saat ini masih <code>localhost</code>, HP Anda tidak bisa membuka localhost komputer lain secara langsung. Masukkan IP lokal Wi-Fi Anda (misal <code>http://192.168.1.5:3000</code>) atau domain production Vercel Anda saat mencetak QR untuk meja sungguhan.
            </p>
          </div>
        )}
      </div>

      {/* Style & Text Customization Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-zinc-400" />
            Desain Kartu Meja &amp; Teks Cetak
          </h3>
          <span className="text-xs text-zinc-500">Pilih tema kartu</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setCardTheme('noir')}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              cardTheme === 'noir'
                ? 'bg-zinc-900 border-white ring-1 ring-white text-white'
                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-white">Noir Luxury</span>
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-100" />
            </div>
            <p className="text-[11px] text-zinc-400">
              Desain eksklusif serba hitam elegan, kontras tinggi dan mewah.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setCardTheme('minimal')}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              cardTheme === 'minimal'
                ? 'bg-zinc-900 border-white ring-1 ring-white text-white'
                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-white">Clean Minimal (Hemat Tinta)</span>
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-400" />
            </div>
            <p className="text-[11px] text-zinc-400">
              Dasar putih bersih dengan garis hitam tegas. Irit tinta printer biasa.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setCardTheme('standee')}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              cardTheme === 'standee'
                ? 'bg-zinc-900 border-white ring-1 ring-white text-white'
                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-white">Acrylic Standee</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            </div>
            <p className="text-[11px] text-zinc-400">
              Ukuran proporsional untuk ditaruh di stand akrilik T-Stand meja.
            </p>
          </button>
        </div>

        {/* Text Customization inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-zinc-900">
          <div>
            <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
              Nama Kafe / Restoran
            </label>
            <input
              type="text"
              value={cafeName}
              onChange={(e) => setCafeName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:ring-1 focus:ring-white"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
              Sub-Judul
            </label>
            <input
              type="text"
              value={subHeader}
              onChange={(e) => setSubHeader(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:ring-1 focus:ring-white"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
              Petunjuk Pelanggan
            </label>
            <input
              type="text"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:ring-1 focus:ring-white"
            />
          </div>
        </div>
      </div>

      {/* MAIN VIEW: Single vs Batch */}
      {activeMode === 'single' ? (
        /* SINGLE TABLE GENERATOR */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Column */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
              <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                Pengaturan Meja
              </h3>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Nomor Meja
                </label>
                <input
                  type="text"
                  value={singleTableNumber}
                  onChange={(e) => setSingleTableNumber(e.target.value)}
                  placeholder="Contoh: 01, 15, VIP-1, Outdoor 3"
                  className="w-full px-4 py-3 rounded-xl text-base font-bold bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-white"
                />
              </div>

              {/* Quick Pills */}
              <div>
                <span className="text-[11px] text-zinc-400 block mb-1.5 font-medium">
                  Pilihan Cepat Nomor:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', 'VIP-1', 'Bar-1'].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setSingleTableNumber(num)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold font-mono transition-colors cursor-pointer ${
                        singleTableNumber === num
                          ? 'bg-white text-black'
                          : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800 border border-zinc-800'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Scanned URL Preview */}
              <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-400">
                    URL Tujuan QR
                  </span>
                  <button
                    onClick={handleCopyLink}
                    className="text-xs text-zinc-300 hover:text-white flex items-center gap-1 font-medium cursor-pointer"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {isCopied ? 'Tersalin' : 'Salin URL'}
                  </button>
                </div>
                <p className="text-xs font-mono text-zinc-300 break-all bg-black/60 p-2.5 rounded-lg border border-zinc-800 select-all">
                  {singleUrl}
                </p>
                <a
                  href={singleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-white underline hover:text-zinc-300 font-semibold pt-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Tes Buka Tampilan Pelanggan Meja Ini
                </a>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="w-full py-3.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.99] cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  Cetak Kartu Meja Ini (Print / PDF)
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (singleQrDataUrl) {
                        downloadDataUrl(singleQrDataUrl, `QR-Meja-${singleTableNumber}.png`);
                      }
                    }}
                    className="py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs border border-zinc-800 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download PNG
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (singleSvg) {
                        downloadTextAsFile(singleSvg, `QR-Meja-${singleTableNumber}.svg`);
                      }
                    }}
                    className="py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs border border-zinc-800 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <FileCode2 className="w-3.5 h-3.5" />
                    Download SVG
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Card Preview Column */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center p-6 bg-zinc-950/70 rounded-2xl border border-zinc-800">
            <span className="text-xs uppercase tracking-wider font-bold text-zinc-400 mb-4 flex items-center gap-1.5">
              <Maximize2 className="w-3.5 h-3.5" />
              Preview Kartu Meja Siap Cetak
            </span>

            {/* The Printable Card Component */}
            <div id="single-printable-card" className="w-full max-w-sm">
              <RenderQrCard
                theme={cardTheme}
                cafeName={cafeName}
                subHeader={subHeader}
                tableNumber={singleTableNumber}
                qrDataUrl={singleQrDataUrl}
                instructions={instructions}
                url={singleUrl}
              />
            </div>

            <p className="text-[11px] text-zinc-500 mt-4 text-center max-w-sm">
              Kartu ini dapat dicetak langsung pada kertas foto/karton tebal atau diselipkan ke akrilik meja ukuran A6 / A5.
            </p>
          </div>
        </div>
      ) : (
        /* BATCH / BULK TABLE GENERATOR */
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
            <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-zinc-400" />
              Generate QR Meja Sekaligus Banyak
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Mulai Meja No.
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={batchStart}
                  onChange={(e) => setBatchStart(parseInt(e.target.value) || 1)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-bold focus:outline-none focus:ring-1 focus:ring-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Sampai Meja No.
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={batchEnd}
                  onChange={(e) => setBatchEnd(parseInt(e.target.value) || 1)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-bold focus:outline-none focus:ring-1 focus:ring-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Awalan / Prefix (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 'Meja ' atau 'VIP-'"
                  value={batchPrefix}
                  onChange={(e) => setBatchPrefix(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:outline-none focus:ring-1 focus:ring-white"
                />
              </div>

              <div className="flex flex-col justify-end">
                <button
                  type="button"
                  onClick={handleGenerateBatch}
                  disabled={isGeneratingBatch}
                  className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-zinc-200 text-black font-extrabold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingBatch ? 'animate-spin' : ''}`} />
                  {isGeneratingBatch ? 'Membuat QR...' : 'Buat Daftar QR'}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <label className="inline-flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={padZero}
                  onChange={(e) => setPadZero(e.target.checked)}
                  className="rounded bg-zinc-900 border-zinc-700 text-white focus:ring-0"
                />
                Gunakan 2 digit angka (01, 02, 03... bukan 1, 2, 3)
              </label>
            </div>
          </div>

          {/* Batch Actions & Grid Preview */}
          {batchCards.length > 0 && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
                <div>
                  <h4 className="text-sm font-bold text-white">
                    {batchCards.length} Kartu Meja Siap Dicetak
                  </h4>
                  <p className="text-xs text-zinc-400">
                    Klik tombol cetak untuk mencetak seluruh lembar sekaligus siap potong.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-extrabold text-xs flex items-center gap-2 shadow transition-all cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    Cetak Semua Meja Sekaligus (Print Sheet)
                  </button>
                </div>
              </div>

              {/* The Grid of Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {batchCards.map((card) => (
                  <div key={card.tableNumber} className="relative group">
                    <RenderQrCard
                      theme={cardTheme}
                      cafeName={cafeName}
                      subHeader={subHeader}
                      tableNumber={card.tableNumber}
                      qrDataUrl={card.qrDataUrl}
                      instructions={instructions}
                      url={card.url}
                      isGridItem={true}
                    />

                    {/* Quick action bar on hover */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-black/80 backdrop-blur-md p-1 rounded-lg border border-zinc-700">
                      <button
                        title="Download PNG"
                        onClick={() => downloadDataUrl(card.qrDataUrl, `QR-Meja-${card.tableNumber}.png`)}
                        className="p-1 rounded hover:bg-zinc-800 text-white"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <a
                        href={card.url}
                        target="_blank"
                        rel="noreferrer"
                        title="Buka Halaman Meja"
                        className="p-1 rounded hover:bg-zinc-800 text-white"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Hidden print container with strict media print layout */}
      <div id="print-sheet-area" className="hidden">
        {/* Render for print */}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------------------------------------
// Reusable Table QR Card Component
// ------------------------------------------------------------------------------------------------
interface RenderQrCardProps {
  theme: CardTheme;
  cafeName: string;
  subHeader: string;
  tableNumber: string;
  qrDataUrl: string;
  instructions: string;
  url: string;
  isGridItem?: boolean;
}

function RenderQrCard({
  theme,
  cafeName,
  subHeader,
  tableNumber,
  qrDataUrl,
  instructions,
  url,
  isGridItem = false,
}: RenderQrCardProps) {
  if (theme === 'minimal') {
    return (
      <div className="qr-printable-card bg-white text-zinc-950 p-6 rounded-2xl border-2 border-zinc-950 shadow-md flex flex-col items-center text-center space-y-4">
        {/* Header */}
        <div className="space-y-0.5 border-b-2 border-zinc-950 pb-2.5 w-full">
          <p className="text-[10px] uppercase tracking-widest font-mono text-zinc-600 font-bold">
            {subHeader}
          </p>
          <h3 className="text-base font-black tracking-tight uppercase">
            {cafeName}
          </h3>
        </div>

        {/* Big Table Badge */}
        <div className="w-full bg-zinc-950 text-white py-2 px-3 rounded-xl flex items-center justify-center gap-2">
          <span className="text-xs uppercase tracking-widest font-semibold text-zinc-300">
            NOMOR MEJA
          </span>
          <span className="text-2xl font-black font-mono tracking-wider">
            {tableNumber}
          </span>
        </div>

        {/* QR Code Container */}
        <div className="p-2.5 bg-white rounded-xl border border-zinc-300 flex items-center justify-center">
          {qrDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qrDataUrl}
              alt={`QR Code Meja ${tableNumber}`}
              className={isGridItem ? 'w-40 h-40 object-contain' : 'w-52 h-52 object-contain'}
            />
          ) : (
            <div className="w-48 h-48 bg-zinc-100 flex items-center justify-center text-xs text-zinc-400">
              Memuat QR...
            </div>
          )}
        </div>

        {/* Footer instructions */}
        <div className="space-y-1 w-full pt-1 border-t border-zinc-200">
          <p className="text-[11px] font-bold text-zinc-900 leading-snug">
            {instructions}
          </p>
          <p className="text-[9px] text-zinc-500 font-mono break-all line-clamp-1">
            {url}
          </p>
        </div>
      </div>
    );
  }

  if (theme === 'standee') {
    return (
      <div className="qr-printable-card bg-zinc-950 text-white p-5 rounded-2xl border border-zinc-700 shadow-xl flex flex-col items-center text-center space-y-3.5">
        <div className="w-full flex items-center justify-between border-b border-zinc-800 pb-2">
          <span className="text-[10px] font-extrabold tracking-widest uppercase text-zinc-400">
            {cafeName}
          </span>
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold uppercase">
            Dine In
          </span>
        </div>

        {/* Table Number Pill */}
        <div className="px-5 py-1.5 rounded-full bg-white text-black font-mono font-black text-xl tracking-wider shadow">
          MEJA {tableNumber}
        </div>

        {/* QR Code Container with High Contrast */}
        <div className="p-3 bg-white rounded-2xl shadow-inner flex items-center justify-center">
          {qrDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qrDataUrl}
              alt={`QR Code Meja ${tableNumber}`}
              className={isGridItem ? 'w-40 h-40 object-contain' : 'w-48 h-48 object-contain'}
            />
          ) : (
            <div className="w-48 h-48 bg-zinc-100 flex items-center justify-center text-xs text-zinc-400">
              Memuat QR...
            </div>
          )}
        </div>

        <div className="space-y-0.5">
          <p className="text-xs font-bold text-white tracking-wide uppercase">
            Scan Untuk Pesan Menu
          </p>
          <p className="text-[10px] text-zinc-400 leading-tight">
            Kamera HP langsung terhubung ke meja ini
          </p>
        </div>
      </div>
    );
  }

  // DEFAULT: Noir Luxury (Sleek Dark Elegance)
  return (
    <div className="qr-printable-card relative overflow-hidden bg-gradient-to-b from-zinc-900 via-zinc-950 to-black text-white p-6 rounded-2xl border border-zinc-800 shadow-2xl flex flex-col items-center text-center space-y-4">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-zinc-700/20 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="space-y-0.5 w-full border-b border-zinc-800/80 pb-2.5 relative z-10">
        <p className="text-[9px] uppercase tracking-widest text-zinc-400 font-mono font-semibold">
          {subHeader}
        </p>
        <h3 className="text-sm sm:text-base font-extrabold tracking-tight text-white uppercase">
          {cafeName}
        </h3>
      </div>

      {/* Prominent Table Number Callout */}
      <div className="relative z-10 w-full py-2 px-3 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center justify-center gap-2">
        <span className="text-[11px] uppercase tracking-widest font-bold text-zinc-400">
          POSISI DUDUK
        </span>
        <span className="text-xl sm:text-2xl font-black font-mono text-white tracking-wider">
          MEJA {tableNumber}
        </span>
      </div>

      {/* QR Code in white crisp container */}
      <div className="relative z-10 p-3 bg-white rounded-2xl shadow-2xl flex items-center justify-center border border-zinc-200">
        {qrDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={qrDataUrl}
            alt={`QR Code Meja ${tableNumber}`}
            className={isGridItem ? 'w-40 h-40 object-contain' : 'w-52 h-52 object-contain'}
          />
        ) : (
          <div className="w-52 h-52 bg-zinc-100 flex items-center justify-center text-xs text-zinc-500 font-mono">
            Membuat QR...
          </div>
        )}
      </div>

      {/* Bottom Instructions */}
      <div className="relative z-10 space-y-1 w-full pt-1">
        <p className="text-xs font-bold text-white tracking-wide">
          ARAHKAN KAMERA HP KE QR
        </p>
        <p className="text-[10px] text-zinc-400 leading-snug max-w-xs mx-auto">
          {instructions}
        </p>
      </div>
    </div>
  );
}
