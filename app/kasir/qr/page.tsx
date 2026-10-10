'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function KasirQrRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/kasir?tab=qr');
  }, [router]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center font-mono text-xs">
      Mengarahkan ke Generator QR Meja...
    </div>
  );
}
