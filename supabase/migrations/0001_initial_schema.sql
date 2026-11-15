-- ============================================================
-- 3D HUB — Initial Database Schema
-- PostgreSQL / Supabase
-- ============================================================
-- Run this in the Supabase SQL editor (or via `supabase db push`).
-- Creates all tables, indexes, constraints, RLS policies and triggers.
-- ============================================================

-- Enable extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================
create type user_role as enum ('customer', 'admin');
create type order_status as enum ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');
create type payment_status as enum ('pending', 'paid', 'failed', 'refunded');
create type coupon_type as enum ('percentage', 'fixed');
create type custom_print_status as enum ('submitted', 'under_review', 'quoted', 'approved', 'rejected', 'in_production', 'completed');
create type quotation_status as enum ('pending', 'accepted', 'rejected', 'expired');
create type print_file_type as enum ('design', 'reference');

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  phone text,
  role user_role not null default 'customer',
  avatar_url text,
  created_at timestamptz not null default now()
);

create index idx_profiles_role on public.profiles(role);

-- ============================================================
-- CATEGORIES
-- ============================================================
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index idx_categories_slug on public.categories(slug);
create index idx_categories_active on public.categories(is_active);

-- ============================================================
-- MATERIALS
-- ============================================================
create table public.materials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  properties text,
  recommended_usage text,
  colors text[] not null default '{}',
  price_per_gram numeric(10,2) not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index idx_materials_slug on public.materials(slug);

-- ============================================================
-- PRODUCTS
-- ============================================================
create table public.products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  sku text not null unique,
  description text not null default '',
  category_id uuid references public.categories(id) on delete set null,
  material_id uuid references public.materials(id) on delete set null,
  price numeric(10,2) not null default 0,
  discounted_price numeric(10,2),
  images text[] not null default '{}',
  colors jsonb not null default '[]',
  dimensions text,
  weight text,
  printing_technology text,
  processing_time text,
  stock int not null default 0,
  is_customizable boolean not null default false,
  is_bestseller boolean not null default false,
  is_featured boolean not null default false,
  is_new_arrival boolean not null default false,
  is_active boolean not null default true,
  rating numeric(2,1) not null default 0,
  review_count int not null default 0,
  created_at timestamptz not null default now()
);

create index idx_products_category on public.products(category_id);
create index idx_products_material on public.products(material_id);
create index idx_products_slug on public.products(slug);
create index idx_products_active on public.products(is_active);
create index idx_products_bestseller on public.products(is_bestseller);
create index idx_products_featured on public.products(is_featured);
create index idx_products_new on public.products(is_new_arrival);
create index idx_products_price on public.products(price);

-- ============================================================
-- ORDERS
-- ============================================================
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  order_number text not null unique,
  subtotal numeric(10,2) not null default 0,
  discount numeric(10,2) not null default 0,
  shipping numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  coupon_code text,
  status order_status not null default 'pending',
  payment_status payment_status not null default 'pending',
  tracking_number text,
  shipping_address jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_orders_user on public.orders(user_id);
create index idx_orders_status on public.orders(status);
create index idx_orders_payment on public.orders(payment_status);

-- ============================================================
-- ORDER ITEMS
-- ============================================================
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_title text not null,
  product_image text,
  quantity int not null default 1,
  price numeric(10,2) not null default 0,
  color text
);

create index idx_order_items_order on public.order_items(order_id);
create index idx_order_items_product on public.order_items(product_id);

-- ============================================================
-- ADDRESSES
-- ============================================================
create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  full_name text not null,
  phone text not null,
  line1 text not null,
  line2 text,
  city text not null,
  state text not null,
  pincode text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_addresses_user on public.addresses(user_id);

-- ============================================================
-- PAYMENTS
-- ============================================================
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  razorpay_payment_id text,
  razorpay_order_id text,
  razorpay_signature text,
  amount numeric(10,2) not null default 0,
  status payment_status not null default 'pending',
  created_at timestamptz not null default now()
);

create index idx_payments_order on public.payments(order_id);

-- ============================================================
-- COUPONS
-- ============================================================
create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text,
  type coupon_type not null default 'percentage',
  value numeric(10,2) not null default 0,
  min_order numeric(10,2) not null default 0,
  max_uses int,
  used_count int not null default 0,
  expires_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index idx_coupons_code on public.coupons(code);
create index idx_coupons_active on public.coupons(is_active);

-- ============================================================
-- COUPON USAGE
-- ============================================================
create table public.coupon_usage (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid not null references public.coupons(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  used_at timestamptz not null default now()
);

-- ============================================================
-- WISHLISTS
-- ============================================================
create table public.wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, product_id)
);

create index idx_wishlists_user on public.wishlists(user_id);

-- ============================================================
-- REVIEWS
-- ============================================================
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  user_name text not null,
  rating int not null check (rating between 1 and 5),
  title text not null default '',
  body text not null default '',
  is_approved boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_reviews_product on public.reviews(product_id);
create index idx_reviews_approved on public.reviews(is_approved);

-- ============================================================
-- CUSTOM PRINT REQUESTS
-- ============================================================
create table public.custom_print_requests (
  id uuid primary key default gen_random_uuid(),
  request_number text not null unique,
  user_id uuid references auth.users(id) on delete set null,
  customer_name text not null,
  email text not null,
  phone text not null,
  description text not null,
  material_id uuid references public.materials(id) on delete set null,
  color text,
  dimensions text,
  quantity int not null default 1,
  instructions text,
  status custom_print_status not null default 'submitted',
  created_at timestamptz not null default now()
);

create index idx_cpr_user on public.custom_print_requests(user_id);
create index idx_cpr_status on public.custom_print_requests(status);

-- ============================================================
-- CUSTOM PRINT FILES (private — stored in Supabase Storage)
-- ============================================================
create table public.custom_print_files (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.custom_print_requests(id) on delete cascade,
  file_name text not null,
  file_path text not null,
  file_type print_file_type not null,
  file_size bigint,
  mime_type text,
  created_at timestamptz not null default now()
);

create index idx_cpf_request on public.custom_print_files(request_id);

-- ============================================================
-- QUOTATIONS
-- ============================================================
create table public.quotations (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.custom_print_requests(id) on delete cascade,
  price numeric(10,2) not null default 0,
  estimated_days int not null default 7,
  notes text,
  status quotation_status not null default 'pending',
  created_at timestamptz not null default now()
);

create index idx_quotations_request on public.quotations(request_id);

-- ============================================================
-- BANNERS
-- ============================================================
create table public.banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  image_url text not null,
  cta_text text,
  cta_link text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ============================================================
-- HOMEPAGE SECTIONS
-- ============================================================
create table public.homepage_sections (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  title text not null,
  subtitle text,
  sort_order int not null default 0,
  is_active boolean not null default true
);

-- ============================================================
-- BLOG POSTS
-- ============================================================
create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text not null default '',
  body text not null default '',
  cover_image text,
  author text not null default '3D HUB Team',
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_blog_slug on public.blog_posts(slug);
create index idx_blog_published on public.blog_posts(is_published);

-- ============================================================
-- NEWSLETTER SUBSCRIBERS
-- ============================================================
create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

-- ============================================================
-- SITE SETTINGS (single row)
-- ============================================================
create table public.site_settings (
  id uuid primary key default gen_random_uuid(),
  brand_name text not null default '3D HUB',
  tagline text not null default 'DESIGN. PRINT. CREATE.',
  logo_url text,
  contact_email text not null default 'hello@3dhub.example',
  contact_phone text not null default '',
  address text not null default '',
  social_links jsonb not null default '{}',
  shipping_flat_rate numeric(10,2) not null default 79,
  free_shipping_threshold numeric(10,2) not null default 999,
  return_policy text not null default '',
  privacy_policy text not null default '',
  terms text not null default '',
  updated_at timestamptz not null default now()
);

insert into public.site_settings (brand_name) values ('3D HUB') on conflict do nothing;

-- ============================================================
-- TRIGGER: auto-create profile on signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Trigger: update orders.updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger trg_orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- Trigger: update product rating from reviews
create or replace function public.update_product_rating()
returns trigger language plpgsql as $$
declare
  p_id uuid;
begin
  p_id := coalesce(new.product_id, old.product_id);
  update public.products set
    rating = coalesce((select avg(rating) from public.reviews where product_id = p_id and is_approved), 0),
    review_count = (select count(*) from public.reviews where product_id = p_id and is_approved)
  where id = p_id;
  return coalesce(new, old);
end;
$$;

create trigger trg_reviews_rating
  after insert or update or delete on public.reviews
  for each row execute function public.update_product_rating();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.materials enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.addresses enable row level security;
alter table public.payments enable row level security;
alter table public.coupons enable row level security;
alter table public.coupon_usage enable row level security;
alter table public.wishlists enable row level security;
alter table public.reviews enable row level security;
alter table public.custom_print_requests enable row level security;
alter table public.custom_print_files enable row level security;
alter table public.quotations enable row level security;
alter table public.banners enable row level security;
alter table public.homepage_sections enable row level security;
alter table public.blog_posts enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.site_settings enable row level security;

-- Helper: is the current user an admin?
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- Profiles: users see their own; admins see all
create policy "profiles_select_own_or_admin" on public.profiles
  for select using (auth.uid() = id or public.is_admin());
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);
create policy "profiles_admin_all" on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- Public read for catalog tables
create policy "categories_read" on public.categories for select using (is_active or public.is_admin());
create policy "categories_admin_write" on public.categories for all using (public.is_admin()) with check (public.is_admin());

create policy "materials_read" on public.materials for select using (is_active or public.is_admin());
create policy "materials_admin_write" on public.materials for all using (public.is_admin()) with check (public.is_admin());

create policy "products_read" on public.products for select using (is_active or public.is_admin());
create policy "products_admin_write" on public.products for all using (public.is_admin()) with check (public.is_admin());

-- Orders: customers see their own; admins see all
create policy "orders_select_own_or_admin" on public.orders
  for select using (auth.uid() = user_id or public.is_admin());
create policy "orders_insert_own" on public.orders
  for insert with check (auth.uid() = user_id or user_id is null);
create policy "orders_update_admin" on public.orders
  for update using (public.is_admin());

create policy "order_items_select_own_or_admin" on public.order_items
  for select using (
    exists(select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin()))
  );
create policy "order_items_insert_own" on public.order_items
  for insert with check (
    exists(select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid()))
  );

-- Addresses: users manage their own
create policy "addresses_select_own" on public.addresses for select using (auth.uid() = user_id);
create policy "addresses_insert_own" on public.addresses for insert with check (auth.uid() = user_id);
create policy "addresses_update_own" on public.addresses for update using (auth.uid() = user_id);
create policy "addresses_delete_own" on public.addresses for delete using (auth.uid() = user_id);

-- Payments: admin only (verification happens server-side)
create policy "payments_select_admin" on public.payments for select using (public.is_admin());
create policy "payments_insert_own" on public.payments for insert with check (
  exists(select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin()))
);

-- Coupons: read active for everyone; write for admin
create policy "coupons_read" on public.coupons for select using (is_active or public.is_admin());
create policy "coupons_admin_write" on public.coupons for all using (public.is_admin()) with check (public.is_admin());
create policy "coupon_usage_insert" on public.coupon_usage for insert with check (public.is_admin() or auth.uid() = user_id);

-- Wishlists: users manage their own
create policy "wishlists_select_own" on public.wishlists for select using (auth.uid() = user_id);
create policy "wishlists_insert_own" on public.wishlists for insert with check (auth.uid() = user_id);
create policy "wishlists_delete_own" on public.wishlists for delete using (auth.uid() = user_id);

-- Reviews: public read approved; users insert own; admin moderate
create policy "reviews_read" on public.reviews for select using (is_approved or public.is_admin());
create policy "reviews_insert_own" on public.reviews for insert with check (auth.uid() = user_id);
create policy "reviews_admin_write" on public.reviews for all using (public.is_admin()) with check (public.is_admin());

-- Custom print requests: owner + admin
create policy "cpr_select_own_or_admin" on public.custom_print_requests
  for select using (auth.uid() = user_id or user_id is null or public.is_admin());
create policy "cpr_insert" on public.custom_print_requests
  for insert with check (auth.uid() = user_id or user_id is null);
create policy "cpr_update_admin" on public.custom_print_requests
  for update using (public.is_admin());

create policy "cpf_select_admin_or_owner" on public.custom_print_files
  for select using (
    public.is_admin() or
    exists(select 1 from public.custom_print_requests r where r.id = request_id and r.user_id = auth.uid())
  );
create policy "cpf_insert" on public.custom_print_files
  for insert with check (
    exists(select 1 from public.custom_print_requests r where r.id = request_id and (r.user_id = auth.uid() or r.user_id is null))
  );

-- Quotations: owner of request + admin
create policy "quotations_select" on public.quotations
  for select using (
    public.is_admin() or
    exists(select 1 from public.custom_print_requests r where r.id = request_id and (r.user_id = auth.uid()))
  );
create policy "quotations_admin_write" on public.quotations
  for all using (public.is_admin()) with check (public.is_admin());

-- Banners, homepage, blog: public read, admin write
create policy "banners_read" on public.banners for select using (is_active or public.is_admin());
create policy "banners_admin_write" on public.banners for all using (public.is_admin()) with check (public.is_admin());

create policy "homepage_read" on public.homepage_sections for select using (is_active or public.is_admin());
create policy "homepage_admin_write" on public.homepage_sections for all using (public.is_admin()) with check (public.is_admin());

create policy "blog_read" on public.blog_posts for select using (is_published or public.is_admin());
create policy "blog_admin_write" on public.blog_posts for all using (public.is_admin()) with check (public.is_admin());

-- Newsletter: anyone can subscribe; admin reads
create policy "newsletter_insert" on public.newsletter_subscribers for insert with check (true);
create policy "newsletter_admin_read" on public.newsletter_subscribers for select using (public.is_admin());

-- Site settings: public read, admin write
create policy "settings_read" on public.site_settings for select using (true);
create policy "settings_admin_write" on public.site_settings for all using (public.is_admin()) with check (public.is_admin());

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
insert into storage.buckets (id, name, public) values
  ('product-images', 'product-images', true),
  ('banners', 'banners', true),
  ('avatars', 'avatars', true),
  ('custom-print-files', 'custom-print-files', false)
on conflict (id) do nothing;

-- Storage policies: product images / banners / avatars public read, auth write
create policy "product_images_read" on storage.objects for select using (bucket_id = 'product-images');
create policy "product_images_write" on storage.objects for insert with check (bucket_id = 'product-images' and auth.role() = 'authenticated');
create policy "product_images_admin_delete" on storage.objects for delete using (bucket_id = 'product-images' and public.is_admin());

create policy "banners_read" on storage.objects for select using (bucket_id = 'banners');
create policy "banners_write" on storage.objects for insert with check (bucket_id = 'banners' and auth.role() = 'authenticated');
create policy "banners_admin_delete" on storage.objects for delete using (bucket_id = 'banners' and public.is_admin());

create policy "avatars_read" on storage.objects for select using (bucket_id = 'avatars');
create policy "avatars_write" on storage.objects for insert with check (bucket_id = 'avatars' and auth.uid() = (storage.foldername(name))[1]::uuid);

-- Custom print files: PRIVATE. Only the uploader and admins can access.
create policy "cpf_storage_insert" on storage.objects for insert
  with check (bucket_id = 'custom-print-files' and auth.role() = 'authenticated');
create policy "cpf_storage_read" on storage.objects for select
  using (bucket_id = 'custom-print-files' and public.is_admin());
create policy "cpf_storage_admin_delete" on storage.objects for delete
  using (bucket_id = 'custom-print-files' and public.is_admin());

-- ============================================================
-- SEED DATA (optional, for fresh installs)
-- ============================================================
insert into public.materials (name, slug, description, properties, recommended_usage, colors, price_per_gram) values
  ('PLA', 'pla', 'Biodegradable, easy to print, great for prototypes and decorative items.', 'Low warpage, matte finish, food-safe variants available.', 'Decor, figurines, prototyping, display pieces.', array['#46351D','#646F4B','#839D9A','#7BB2D9','#BFD2BF','#FFFFFF','#111111'], 0.8),
  ('PLA+', 'pla-plus', 'Tougher than standard PLA with improved layer adhesion.', 'Higher impact resistance, smoother finish.', 'Functional parts, phone stands, light-load tools.', array['#46351D','#646F4B','#839D9A','#BFD2BF','#FFFFFF'], 1.1),
  ('PETG', 'petg', 'Durable, chemical resistant, good for functional prints.', 'Strong, slightly flexible, water resistant.', 'Containers, mechanical parts, outdoor items.', array['#46351D','#646F4B','#839D9A','#7BB2D9','#FFFFFF'], 1.3),
  ('ABS', 'abs', 'Tough engineering plastic, heat resistant.', 'High impact strength, heat resistant up to ~100°C.', 'Functional tools, enclosures, mechanical parts.', array['#46351D','#111111','#FFFFFF','#839D9A'], 1.0),
  ('TPU', 'tpu', 'Flexible rubber-like filament for parts that need to bend.', 'Flexible, abrasion resistant, shock absorbing.', 'Gaskets, phone cases, grips, wearable parts.', array['#46351D','#646F4B','#839D9A','#111111'], 1.6),
  ('Resin', 'resin', 'High-detail resin printing for miniatures and fine models.', 'Ultra-fine detail, smooth surface, brittle if thin.', 'Miniatures, jewelry, detailed models, molds.', array['#46351D','#839D9A','#7BB2D9','#BFD2BF','#FFFFFF'], 2.4)
on conflict (slug) do nothing;

insert into public.coupons (code, description, type, value, min_order, is_active) values
  ('WELCOME10', '10% off your first order', 'percentage', 10, 0, true),
  ('HUB500', 'Rs 500 off orders over Rs 2999', 'fixed', 500, 2999, true)
on conflict (code) do nothing;

-- ============================================================
-- GRANT ADMIN ROLE (run manually after creating your admin user)
-- ============================================================
-- After you sign up your admin account, run:
--   update public.profiles set role = 'admin' where email = 'admin@3dhub.example';
-- Replace the email with VITE_ADMIN_BOOTSTRAP_EMAIL.
-- ============================================================

-- Done.
