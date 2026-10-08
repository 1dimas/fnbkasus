# Product Requirements Document (PRD)
## Project: Self-Service Order System (MVP - WhatsApp Integration)

### 1. Objective
Membangun MVP sistem pemesanan mandiri (*self-service ordering*) untuk kafe berbasis web responsif (mobile-first). Pelanggan memindai QR code di meja, menjelajahi menu makanan & minuman, menambahkan item ke keranjang belanja, memasukkan nomor meja (dan nama/catatan), lalu mengirimkan pesanan secara langsung ke monitor kasir secara real-time. Kasir dapat login untuk memantau dan mengubah status pesanan.

### 2. Tech Stack
- **Framework:** Next.js 16 (App Router, Full-stack)
- **UI & Styling:** React 19, Tailwind CSS v4, Lucide Icons
- **Design System:** Modern Monochrome (Hitam & Putih / Black & White Minimalist Luxury)
- **State Management:** Zustand (Client-side cart)
- **Database / Backend:** Supabase (PostgreSQL) + Next.js Route Handlers (dengan in-memory fallback store)
- **Cashier Portal:** Login PIN & password dengan dashboard monitor antrean pesanan real-time.

### 3. Core Scope & Boundaries
- **Order Flow:** Pelanggan checkout langsung mengirimkan data pesanan ke endpoint `/api/orders` dan tersinkronisasi ke dashboard kasir (`/kasir`). Tidak lagi dialihkan ke WhatsApp.
- **Cashier Access:** Kasir memiliki halaman terproteksi (`/kasir`) untuk melihat pesanan masuk, memfilter status (pending, diproses, selesai, batal), dan mengupdate status pesanan.
- **Mobile First:** Diutamakan untuk kenyamanan pelanggan di smartphone (hasil scan QR meja) dan tablet/desktop untuk kasir.

### 4. Database Schema (Supabase / PostgreSQL)
```sql
create table if not exists categories (
  id serial primary key,
  name text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists products (
  id serial primary key,
  name text not null,
  description text,
  price integer not null,
  is_available boolean default true not null,
  category_id integer references categories(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

### 5. UI/UX & Design Guidelines (Modern Hitam Putih)
- **Palette:** `#000000`, `#09090b`, `#18181b`, `#27272a`, `#71717a`, `#fafafa`, `#ffffff`.
- **Typography:** Clean sans-serif, high contrast readability.
- **Components:**
  - Header: Nama Kafe, status meja / jam buka, tombol keranjang dengan badge count.
  - Search & Category Filter: Tab horizontal scrollable untuk kategori menu.
  - Product Card: Tampilan minimalis, nama, deskripsi singkat, harga format Rupiah (`Rp xx.xxx`), status ketersediaan, tombol tambah / kuantitas.
  - Floating Cart Bar: Muncul otomatis saat ada item di keranjang dengan total harga & tombol checkout.
  - Checkout Modal / Drawer: Form nomor meja, nama pemesan, catatan tambahan, rincian pesanan.
  - Tombol Aksi Utama: "Kirim Pesanan ke WhatsApp" (membuka WhatsApp dengan pesan rapi).
