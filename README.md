# 3D HUB — Design. Print. Create.

A premium, full-stack e-commerce platform for 3D-printed products and custom 3D printing services. Built with React, Vite, TypeScript, Tailwind CSS, and Supabase (Postgres + Auth + Storage + Realtime).

![3D HUB](public/favicon.svg)

## Features

- **Customer storefront**: homepage, category pages, product listings with filters/sort, product details with gallery & reviews
- **Custom 3D Printing**: request form with STL/OBJ/3MF/STEP uploads, reference images, quotation workflow, customer tracking
- **Shopping cart & checkout**: coupons, shipping calculation, Razorpay payment integration
- **Customer accounts**: auth, order history, wishlist, custom request tracking, quotation accept/reject
- **Admin dashboard** (`/admin`): dashboard analytics with charts, product/category/material CRUD, order management, custom request review + quotations, coupons, reviews moderation, blog, customers, banners, site settings
- **Real-time sync**: admin changes appear everywhere instantly (Supabase Realtime when configured; in-memory store otherwise)
- **Database**: complete normalized Postgres schema with RLS, triggers, indexes, and seed data
- **Design system**: centralized color tokens matching the approved brand palette

## Tech Stack

| Layer | Technology |
|------|------------|
| Frontend | React 18, Vite 5, TypeScript, Tailwind CSS, Lucide icons, React Router 6 |
| Charts | Recharts |
| Backend | Supabase (PostgreSQL, Auth, Storage, Realtime) |
| Payments | Razorpay |
| Deployment | Vercel (frontend) + Supabase (backend) |

## Brand Palette

| Color | Hex | Use |
|-------|-----|-----|
| Deep Espresso | `#46351D` | Headings, logo, footer, dark sections |
| Olive Green | `#646F4B` | Primary CTAs, Add to Cart, active states |
| Sage Teal | `#839D9A` | Secondary buttons, accents |
| Soft Sky Blue | `#7BB2D9` | Promo badges, accent highlights |
| Soft Sage | `#BFD2BF` | Hero/category backgrounds, feature sections |
| Pure White | `#FFFFFF` | Main background, cards, forms |

## Quick Start (Demo Mode)

The app runs **immediately without any backend** using a built-in seed dataset, so you can explore the full UI and admin before connecting Supabase.

```bash
npm install
npm run dev
```

Open http://localhost:5173

- Browse the storefront, add to cart, "check out" (payment simulates success)
- Admin dashboard: go to `/admin/login`. Sign up an account, then sign in. In demo mode, signing up with the email in `VITE_ADMIN_BOOTSTRAP_EMAIL` grants admin access automatically.

> All data in demo mode lives in memory and resets on refresh. Connect Supabase for persistent, real-time data.

---

## Connecting Supabase (Production Setup)

### 1. Create a Supabase project
1. Go to https://supabase.com and create a new project.
2. Note your **Project URL** and **anon public key** from *Settings → API*.

### 2. Configure environment variables
Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Fill in real values:
```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
VITE_RAZORPAY_KEY_ID=rzp_test_yourkeyid
VITE_ADMIN_BOOTSTRAP_EMAIL=admin@3dhub.example
```

> **Never** put the Supabase `service_role` key or the Razorpay `key_secret` in the frontend. Those are server-only.

### 3. Run the database schema
Open the Supabase SQL Editor and run the entire contents of:

```
supabase/migrations/0001_initial_schema.sql
```

This creates all 25 tables, enums, indexes, triggers, RLS policies, storage buckets, and seed data (materials + coupons).

### 4. Create storage buckets
The migration already creates the buckets:
- `product-images` (public)
- `banners` (public)
- `avatars` (public)
- `custom-print-files` (**private** — customer 3D design files, admin-only access)

Verify they exist under *Storage* in the Supabase dashboard.

### 5. Create your admin account
1. Sign up normally through the storefront (`/signup`) with your admin email (matching `VITE_ADMIN_BOOTSTRAP_EMAIL`).
2. In the Supabase SQL Editor, promote that account to admin:

```sql
update public.profiles set role = 'admin' where email = 'admin@3dhub.example';
```

3. Go to `/admin/login` and sign in with that account.

### 6. Enable Google sign-in (optional)
1. In the Supabase dashboard, go to **Authentication → Providers** and enable **Google**.
2. Create an OAuth Client in the [Google Cloud Console](https://console.cloud.google.com/):
   - Add your Supabase project's callback URL (shown in the Supabase Google provider settings, e.g. `https://<project>.supabase.co/auth/v1/callback`).
3. Copy the **Client ID** and **Client Secret** from Google into the Supabase Google provider settings.
4. Under **Authentication → URL Configuration**, add your site URL (e.g. `http://localhost:5173` for dev, your Vercel URL for prod) to the **Redirect URLs**.
5. The "Continue with Google" buttons on the Login and Signup pages will now redirect users through Google and back. The `detectSessionInUrl` option handles the returning session automatically.

> In demo mode (no Supabase configured), clicking Google shows a message explaining it requires a connected Supabase project — email/password still works.

---

## Razorpay Payment Setup

### 1. Get API keys
From the Razorpay dashboard (*Settings → API Keys*), copy your **Key ID** (public) and **Key Secret** (server-only).

Set `VITE_RAZORPAY_KEY_ID` in `.env`.

### 2. Server-side order creation & verification (production)
For real payments you must create and verify orders server-side using the Key Secret. Two recommended options:

**Option A — Supabase Edge Functions** (recommended, no separate server):
```sql
-- create function to create a Razorpay order
```
Create a Supabase Edge Function (e.g. `create-razorpay-order`) that:
1. Receives the cart total from the frontend.
2. Calls Razorpay's `POST /v1/orders` with the Key Secret (Basic auth).
3. Returns the `order_id` to the frontend.

Create a second function `verify-razorpay-payment` that verifies the `razorpay_signature` and marks the order as paid.

The frontend's `src/lib/razorpay.ts` already accepts an `orderId`; pass the one returned by your Edge Function.

**Option B — your own backend** that does the same with the Razorpay Node SDK.

> Until keys are added, checkout simulates a successful payment so you can test the full order flow.

---

## Project Structure

```
3D_HUB/
├── src/
│   ├── components/
│   │   ├── ui/            # Button, Input, Modal, Badge, Skeleton, SmartImage, Logo, Toast
│   │   ├── layout/        # Navbar, Footer, AnnouncementBar, Layout
│   │   ├── admin/         # AdminUI (StatCard, Table, ConfirmDialog)
│   │   ├── ProductCard.tsx
│   │   └── guards.tsx     # RequireAuth / RequireAdmin
│   ├── pages/
│   │   ├── Home.tsx        # Homepage (all sections)
│   │   ├── Shop.tsx        # Product listing + category pages
│   │   ├── ProductDetail.tsx
│   │   ├── CustomPrinting.tsx
│   │   ├── Cart.tsx / Checkout.tsx / OrderConfirmation.tsx
│   │   ├── About.tsx / Contact.tsx / Blog.tsx
│   │   ├── auth/           # Login, Signup, ForgotPassword
│   │   ├── account/        # Customer account (orders, wishlist, custom requests)
│   │   └── admin/          # Dashboard + 12 admin modules
│   ├── services/
│   │   ├── data.ts         # Service layer (Supabase + fallback store)
│   │   ├── auth.ts         # Supabase Auth + demo auth
│   │   └── store.ts        # In-memory store (demo-mode backend)
│   ├── context/            # AuthContext, CartContext
│   ├── hooks/useData.ts    # Async data hook with re-fetch on mutations
│   ├── lib/                 # supabase client, utils, constants, seed data
│   ├── types/index.ts      # All domain types
│   ├── App.tsx             # Routing
│   └── main.tsx
├── supabase/migrations/    # SQL schema
├── public/                 # favicon, robots.txt, sitemap.xml
└── tailwind.config.js      # Brand color tokens
```

## Architecture Notes

### Data layer
`src/services/data.ts` is the single data access point. Every function checks `supabaseReady`:
- **Supabase configured** → queries Postgres with the typed Supabase client.
- **Not configured (demo)** → reads/writes the in-memory store seeded from `src/lib/seed.ts`.

Components consume data via the `useAsync` hook, which re-fetches automatically whenever the store mutates, giving instant real-time-like sync across the app in demo mode. In production, Supabase Realtime subscriptions keep data live.

### Security
- Row Level Security is enabled on every table (see the migration).
- Customers can only read/update their own data.
- Admin-only writes use the `public.is_admin()` helper policy.
- Custom print design files are stored in a **private** bucket with admin-only read access.
- The Supabase `anon` key is public by design and protected by RLS; the `service_role` key is never used in the frontend.

### Real-time synchronization
When Supabase is connected, the app uses Supabase Realtime for live updates. Admin product/price/stock/banner changes propagate to all open sessions. The `useAsync` hook re-fetches on auth and store changes, so the UI stays current across devices and browsers.

## Available Scripts

```bash
npm run dev      # Start dev server (http://localhost:5173)
npm run build    # Type-check + production build
npm run preview  # Preview the production build
```

## Deployment

### Frontend → Vercel
1. Push this repo to GitHub.
2. In Vercel, **Import Project** and select the repo.
3. Framework preset: **Vite**.
4. Add environment variables (same as `.env`): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_RAZORPAY_KEY_ID`, `VITE_ADMIN_BOOTSTRAP_EMAIL`.
5. Build command: `npm run build` · Output dir: `dist`.
6. Deploy.

### Backend → Supabase
The Supabase project handles Postgres, Auth, Storage, and Realtime. No additional hosting needed. Add any Edge Functions for Razorpay order creation/verification under `supabase/functions`.

## Admin Modules

| Path | Module |
|------|--------|
| `/admin` | Dashboard (revenue, orders, analytics charts) |
| `/admin/products` | Product CRUD with images, variants, flags |
| `/admin/categories` | Category CRUD |
| `/admin/materials` | Material CRUD with colors & pricing |
| `/admin/orders` | Order list, status & tracking updates |
| `/admin/custom-requests` | Custom requests, file download, quotations |
| `/admin/coupons` | Coupon CRUD |
| `/admin/reviews` | Approve/moderate reviews |
| `/admin/blog` | Blog post CRUD |
| `/admin/customers` | Customer list with order/request history |
| `/admin/banners` | Homepage banner management |
| `/admin/settings` | Brand, contact, shipping, policies |

## License

© 3D HUB. All rights reserved.
