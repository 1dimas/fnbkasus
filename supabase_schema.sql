-- ========================================================
-- SCHEMA SQL UNTUK SUPABASE
-- Self-Service Order System (NOIR & BLANC COFFEE)
-- ========================================================

-- 1. Buat Tabel Categories
create table if not exists public.categories (
  id serial primary key,
  name text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Buat Tabel Products
create table if not exists public.products (
  id serial primary key,
  name text not null,
  description text,
  price integer not null,
  is_available boolean default true not null,
  category_id integer references public.categories(id) on delete cascade not null,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Aktifkan Row Level Security (RLS) & Kebijakan Read-Only Publik
alter table public.categories enable row level security;
alter table public.products enable row level security;

create policy "Allow public read access for categories"
  on public.categories for select
  using (true);

create policy "Allow public read access for products"
  on public.products for select
  using (true);

-- 4. Sample Data Awal (Seed Data)
insert into public.categories (id, name) values
  (1, 'Coffee'),
  (2, 'Non-Coffee'),
  (3, 'Pastry & Bakery'),
  (4, 'Main Course'),
  (5, 'Snacks'),
  (6, 'Paket Makan & Minum')
on conflict (name) do nothing;

insert into public.products (name, description, price, is_available, category_id, image_url) values
  ('Monochrome Black Espresso', 'Double shot espresso blend Arabica Aceh Gayo dengan notes dark chocolate dan fruity hints.', 22000, true, 1, 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=600&auto=format&fit=crop&q=80'),
  ('Noir Flat White', 'Espresso kaya rasa dipadukan dengan steamed micro-foam milk yang lembut dan balance. Tersedia Panas atau Dingin.', 28000, true, 1, 'https://images.unsplash.com/photo-1577968897966-3d4325b36b61?w=600&auto=format&fit=crop&q=80'),
  ('Manual Brew V60 Japanese', 'Single origin bean pilihan diseduh manual dengan dripper V60 disajikan dingin segar atau panas.', 32000, true, 1, 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&auto=format&fit=crop&q=80'),
  ('Kyoto Ceremonial Matcha Latte', 'Pure Uji Matcha autentik dari Jepang dengan susu oat pilihan dan sentuhan pemanis aren. Tersedia Panas atau Dingin.', 35000, true, 2, 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600&auto=format&fit=crop&q=80'),
  ('Artisan Charcoal Latte', 'Minuman khas monokrom berbasis activated charcoal organik, vanilla beans, dan fresh milk. Tersedia Panas atau Dingin.', 30000, true, 2, 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=600&auto=format&fit=crop&q=80'),
  ('Classic Butter Croissant', 'Flaky, buttery French pastry renyah di luar dan lembut berlapis di dalam. Opsi dipanaskan hangat.', 25000, true, 3, 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&auto=format&fit=crop&q=80'),
  ('Dark Choco Almond Pain', 'Croissant isi pasta dark chocolate Belgia premium bertabur irisan kacang almond panggang.', 32000, true, 3, 'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=600&auto=format&fit=crop&q=80'),
  ('Truffle Mushroom Toast', 'Sourdough toast artisan dengan sauteed wild mushrooms, keju parmesan, dan white truffle oil.', 48000, true, 4, 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&auto=format&fit=crop&q=80'),
  ('Crispy Truffle Fries', 'Kentang goreng renyah dengan aroma truffle alami dan taburan sea salt rosemary.', 28000, true, 5, 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=80'),
  ('Paket Noir Breakfast (Croissant + Kopi)', 'Paket sarapan hemat: Classic Butter Croissant hangat dengan Kopi (Panas / Dingin).', 45000, true, 6, 'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=600&auto=format&fit=crop&q=80'),
  ('Paket Artisan Lunch (Toast + Minuman)', 'Paket makan siang: Truffle Mushroom Toast sourdough istimewa bersama minuman pilihan.', 68000, true, 6, 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&auto=format&fit=crop&q=80');


-- 5. Buat Tabel Orders (Untuk Dashboard Kasir)
create table if not exists public.orders (
  id serial primary key,
  order_code text unique not null,
  table_number text not null,
  customer_name text default 'Tamu',
  order_type text default 'dine-in',
  general_notes text,
  total_amount integer not null,
  status text default 'pending', -- pending, diproses, selesai, dibatalkan
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.order_items (
  id serial primary key,
  order_id integer references public.orders(id) on delete cascade not null,
  product_id integer references public.products(id) on delete set null,
  product_name text not null,
  quantity integer not null,
  price integer not null,
  subtotal integer not null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create policy "Allow public insert for orders" on public.orders for insert with check (true);
create policy "Allow public read for orders" on public.orders for select using (true);
create policy "Allow public update for orders" on public.orders for update using (true);

create policy "Allow public insert for order_items" on public.order_items for insert with check (true);
create policy "Allow public read for order_items" on public.order_items for select using (true);

