-- ─────────────────────────────────────────────────────────────────────────────
-- Made by Adya — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query → Run
-- ─────────────────────────────────────────────────────────────────────────────

-- Products ────────────────────────────────────────────────────────────────────
create table if not exists products (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  description   text,
  price         integer not null,       -- in cents (6800 = $68.00)
  images        text[] default '{}',
  emoji         text default '🧶',
  bg_color      text default '#f2d9d0',
  category      text not null check (category in ('crochet','sewn','sets','accessories')),
  badge         text not null default 'Crochet',
  is_new        boolean default false,
  is_bestseller boolean default false,
  stock         integer default 0,
  rating        numeric(3,1) default 5.0,
  review_count  integer default 0,
  sizes         text[] default '{}',
  colors        text[] default '{}',
  active        boolean default true,
  created_at    timestamptz default now()
);

-- Orders ──────────────────────────────────────────────────────────────────────
create table if not exists orders (
  id                    uuid primary key default gen_random_uuid(),
  stripe_session_id     text unique,
  stripe_payment_intent text,
  customer_email        text,
  customer_name         text,
  shipping_address      jsonb,
  items                 jsonb default '[]',
  subtotal              integer default 0,
  tax                   integer default 0,
  total                 integer default 0,
  gift_wrap             boolean default false,
  promo_applied         boolean default false,
  status                text default 'pending' check (status in ('pending','paid','shipped','delivered','cancelled')),
  order_number          text unique,
  tracking_number       text,
  created_at            timestamptz default now()
);

-- Reviews ─────────────────────────────────────────────────────────────────────
create table if not exists reviews (
  id             uuid primary key default gen_random_uuid(),
  product_id     uuid references products(id) on delete set null,
  reviewer_name  text not null,
  avatar_letter  text not null,
  rating         integer check (rating between 1 and 5),
  body           text,
  product_name   text,
  created_at     timestamptz default now()
);

-- Newsletter Subscribers ───────────────────────────────────────────────────────
create table if not exists subscribers (
  id         uuid primary key default gen_random_uuid(),
  email      text unique not null,
  list       text default 'newsletter',
  created_at timestamptz default now()
);

-- Custom Orders ───────────────────────────────────────────────────────────────
create table if not exists custom_orders (
  id           uuid primary key default gen_random_uuid(),
  name         text,
  email        text,
  piece_type   text,
  measurements text,
  color_pref   text,
  vision       text,
  budget       text,
  status       text default 'new' check (status in ('new','in_progress','quoted','completed')),
  created_at   timestamptz default now()
);

-- Contact Messages ─────────────────────────────────────────────────────────────
create table if not exists contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text,
  email      text,
  message    text,
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Helper: decrement stock (called by Stripe webhook)
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function decrement_stock(product_id uuid, qty integer)
returns void language plpgsql as $$
begin
  update products
  set stock = greatest(0, stock - qty)
  where id = product_id;
end;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- Row-Level Security
-- ─────────────────────────────────────────────────────────────────────────────
alter table products         enable row level security;
alter table orders           enable row level security;
alter table reviews          enable row level security;
alter table subscribers      enable row level security;
alter table custom_orders    enable row level security;
alter table contact_messages enable row level security;

-- Public can read active products and reviews
create policy "Public read products" on products for select using (active = true);
create policy "Public read reviews"  on reviews  for select using (true);

-- Service role (used by API routes via supabaseAdmin) can do everything
-- This is handled automatically because the service role bypasses RLS.

-- ─────────────────────────────────────────────────────────────────────────────
-- Seed Data (your 10 products, ready to go)
-- ─────────────────────────────────────────────────────────────────────────────
insert into products (name, description, price, emoji, bg_color, category, badge, is_new, is_bestseller, stock, rating, review_count, sizes, colors) values
  ('Bloom Crop Top',       'Delicate floral stitch, perfect for layering over bralettes or high-waist pants.',              6800,  '🌸', '#f2d9d0', 'crochet',     'Crochet',   false, true,  3,  4.9, 24, array['XS','S','M','L'],       array['#f2d9d0','#c8d8c0','#dcd3e8']),
  ('Sage Cardigan',        'Oversized open-front cardigan in a soothing sage tone. Pairs beautifully with denim.',          11200, '🌿', '#c8d8c0', 'crochet',     'Crochet',   true,  false, 8,  5.0, 11, array['S','M','L','XL'],        array['#c8d8c0','#e8ddd0','#f2d9d0']),
  ('Lavender Slip Dress',  'Flowy hand-sewn chiffon with delicate lace trim and adjustable straps.',                        8800,  '💜', '#dcd3e8', 'sewn',        'Hand-Sewn', true,  false, 5,  4.8, 8,  array['XS','S','M','L','XL'],  array['#dcd3e8','#f2d9d0','#e8c4bc']),
  ('Sandy Shorts Set',     'Matching hand-sewn top and relaxed shorts — perfect for beach days or summer errands.',         14500, '🏖️', '#e8ddd0', 'sets',        'Set',       false, true,  2,  4.7, 19, array['XS','S','M','L'],       array['#e8ddd0','#f2d9d0','#c8d8c0']),
  ('Rosette Halter',       'Sweet halter top featuring intricate rosette crochet detailing at the bust.',                   5400,  '🌹', '#f2d9d0', 'crochet',     'Crochet',   false, false, 10, 4.6, 15, array['XS','S','M'],            array['#f2d9d0','#e8c4bc','#dcd3e8']),
  ('Petal Bucket Hat',     'Soft pastel yarn crocheted bucket hat, one size fits all.',                                     3800,  '🎩', '#c8d8c0', 'accessories', 'Crochet',   false, false, 12, 4.9, 31, array['One Size'],              array['#c8d8c0','#f2d9d0','#dcd3e8','#e8c4bc']),
  ('Cloud Midi Skirt',     'Hand-sewn cotton voile midi skirt with an elastic waistband — relaxed and dreamy.',             9800,  '☁️', '#dcd3e8', 'sewn',        'Hand-Sewn', true,  false, 6,  4.8, 7,  array['XS','S','M','L','XL'],  array['#dcd3e8','#e8ddd0','#f2d9d0']),
  ('Blush Tote Bag',       'Hand-sewn canvas tote with a braided handle and interior pocket.',                              4600,  '👜', '#e8c4bc', 'accessories', 'Hand-Sewn', false, false, 9,  4.5, 22, array['One Size'],              array['#e8c4bc','#c8d8c0','#dcd3e8']),
  ('Patchwork Co-ord Set', 'Hand-sewn patchwork crop top and wide-leg trousers — a true statement set.',                   16500, '🪡', '#f2d9d0', 'sets',        'Hand-Sewn', true,  false, 3,  5.0, 5,  array['XS','S','M','L'],       array['#f2d9d0','#c8d8c0','#dcd3e8']),
  ('Mesh Crochet Vest',    'Open-weave crochet vest with adjustable ties. Layer over everything.',                          7200,  '🕸️', '#c8d8c0', 'crochet',     'Crochet',   false, true,  7,  4.7, 18, array['XS','S','M','L','XL'],  array['#c8d8c0','#e8ddd0','#f2d9d0'])
on conflict do nothing;

insert into reviews (reviewer_name, avatar_letter, rating, body, product_name) values
  ('Sofia M.',  'S', 5, 'I absolutely love my Bloom Crop Top. The stitching is so intricate and it fits perfectly. I get compliments every time I wear it!',                       'Bloom Crop Top'),
  ('Priya K.',  'P', 5, 'The Patchwork Co-ord Set is a dream. Adya is so talented — you can feel the love in every seam. Will definitely be ordering again.',                     'Patchwork Co-ord Set'),
  ('Lily T.',   'L', 5, 'Ordered a custom piece and it was exactly what I imagined. Adya was so communicative and the result was beyond beautiful.',                              'Custom Order'),
  ('Amara J.',  'A', 4, 'The Sage Cardigan is incredibly soft and the color is even better in person. Shipping was fast and the packaging was so cute!',                          'Sage Cardigan'),
  ('Zoe R.',    'Z', 5, 'My Petal Bucket Hat is the most complimented item I own. I''ve told everyone where to get it. Adya''s work is truly one-of-a-kind.',                    'Petal Bucket Hat'),
  ('Isla B.',   'I', 5, 'The Cloud Midi Skirt is SO comfortable and beautiful. I wore it all summer. The hand-sewn details are exquisite.',                                       'Cloud Midi Skirt')
on conflict do nothing;
