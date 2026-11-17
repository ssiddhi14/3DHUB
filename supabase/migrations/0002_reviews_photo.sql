-- Add photo_url and product_name to reviews table
alter table public.reviews
  add column if not exists photo_url text,
  add column if not exists product_name text;
