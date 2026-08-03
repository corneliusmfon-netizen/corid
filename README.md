# Corid Lifestyle NG 🏆

> **Premium Fashion House** — Elevating Nigerian fashion with curated collections of corporatewear, casualwear, sportswear, accessories, and Grade-A preowned luxury.

![Corid Lifestyle NG](https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&h=400&fit=crop)

## ✨ Overview

**Corid Lifestyle NG** is a full-featured e-commerce fashion storefront built with pure HTML, CSS, and JavaScript, powered by a **FastAPI backend** and **Supabase (PostgreSQL)**. It combines a stunning customer-facing shopping experience with a password-protected admin dashboard for inventory, orders, inquiries, customers, and reviews.

The platform offers both **Brand New** and **Grade A Preowned** collections, making premium fashion accessible to everyone across Nigeria.

## 🚀 Features

### Customer Storefront (`index.html`)
- **Beautiful Hero Section** — Animated gradient text, stats counters, and elegant typography
- **Product Catalog** — Grid layout with category filtering, badges, ratings, and modal details
- **Brand New & Preowned Collections** — Separate catalogs with dedicated filtering
- **Shopping Cart / Order List** — Slide-out drawer with item management
- **Product Modal** — Detailed view with size selector, star rating, and inquiry button
- **Bulk Order Form** — Corporate/bulk purchasing with quote request submission
- **Customer Reviews & Testimonials** — Dynamic ratings display
- **Responsive Design** — Mobile-first with smooth navigation and interactions
- **Cursor Glow Effect** — Premium interactive visual touch

### Admin Dashboard (`/admin` → `corid-dashboard-2026.html`)
- **Password-protected login** — sign in with the `ADMIN_PASSWORD` environment variable (HMAC session token, 24h expiry)
- **Dashboard** — Sales stats, weekly charts, top categories, recent orders table
- **Inventory Management** — Product grid with CRUD operations, search & filter
- **Orders Management** — Order tracking with status filtering
- **Customer Management** — Customer database with search
- **Reviews Moderation** — Manage product ratings and feedback
- **Analytics** — Revenue charts, conversion rates, avg order value
- **Settings** — Store information and branding configuration

### Technical Features
- **FastAPI Backend** — Single API for catalog reads, order/inquiry submissions, and all admin operations
- **Admin Authentication** — Password → expiring HMAC bearer token; protected endpoints reject missing/invalid/expired tokens with 401
- **Rate Limiting** — Best-effort in-memory throttling on login (5/min), orders (10/min), and inquiries (10/min)
- **Secure RLS** — Catalog tables are anonymous read-only; personal data (orders, inquiries, customers, reviews) is service-role only
- **Offline Fallback** — Hardcoded product data when the API is unavailable
- **Zero Framework Dependencies** — Vanilla HTML/CSS/JS frontend

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| ![HTML5](https://img.shields.io/badge/-HTML5-E34F26?logo=html5&logoColor=white) | Structure & content |
| ![CSS3](https://img.shields.io/badge/-CSS3-1572B6?logo=css3&logoColor=white) | Styling & animations |
| ![JavaScript](https://img.shields.io/badge/-JavaScript-F7DF1E?logo=javascript&logoColor=black) | Interactivity & logic |
| ![FastAPI](https://img.shields.io/badge/-FastAPI-009688?logo=fastapi&logoColor=white) | Backend API |
| ![Supabase](https://img.shields.io/badge/-Supabase-3ECF8E?logo=supabase&logoColor=white) | PostgreSQL database |
| ![Vercel](https://img.shields.io/badge/-Vercel-000000?logo=vercel&logoColor=white) | Deployment & hosting |
| ![Google Fonts](https://img.shields.io/badge/-Google%20Fonts-4285F4?logo=google-fonts&logoColor=white) | Typography (Playfair Display, Inter) |
| ![Font Awesome](https://img.shields.io/badge/-Font%20Awesome-528DD7?logo=font-awesome&logoColor=white) | Icons |

## 📁 Project Structure

```
corid/
├── index.html                  # Customer storefront
├── corid-dashboard-2026.html   # Admin dashboard (routed to /admin)
├── api.js                      # API client (fetch wrapper + auth token)
├── script.js                   # Storefront logic & interactions
├── admin.js                    # Admin dashboard logic
├── css/
│   ├── style.css               # Storefront styles
│   └── admin.css               # Admin dashboard styles
├── api/
│   ├── index.py                # FastAPI backend (Vercel Python function)
│   ├── schema.sql              # Full schema + seed data (run in Supabase)
│   └── fix_db.sql              # RLS migration + extra seed data (idempotent)
├── requirements.txt            # Python dependencies
├── vercel.json                 # Vercel routing (static files + /api)
├── .env.example                # Environment variable template
├── .gitignore / .vercelignore
└── package.json                # (Supabase JS client — kept for reference)
```

## 🔐 Security Model

- The frontend talks **only** to the FastAPI backend — never directly to Supabase
- The API runs with the **service role (secret)** key from environment variables (never hardcoded, never in the browser)
- **RLS policies**: `products` / `preowned_products` are anonymous read-only (public catalog); `orders`, `inquiries`, `customers`, `reviews` are service-role only
- The admin dashboard is gated by `ADMIN_PASSWORD`; sessions use an expiring HMAC bearer token and login is rate-limited

## 🚦 Getting Started

### Prerequisites
- Python 3.9+
- [Supabase](https://supabase.com) project (optional for the offline demo, required for live data)
- [Vercel CLI](https://vercel.com/docs/cli) (optional, for local dev with the API)

### 1. Clone & install

```bash
git clone https://github.com/corneliusmfon-netizen/corid.git
cd corid
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in `.env` (never commit it):

| Variable | Value |
|----------|-------|
| `SUPABASE_URL` | Your Supabase project URL, e.g. `https://xxxx.supabase.co` |
| `SUPABASE_KEY` | **Secret (service role)** key — full read/write access for the API |
| `ADMIN_PASSWORD` | Password used to log in to `/admin` |

### 3. Set up the database (one time)

In the **Supabase SQL Editor**, run in order:
1. `api/schema.sql` — creates all tables + seed data
2. `api/fix_db.sql` — tightens RLS policies + adds more seed products (safe to re-run)

### 4. Run locally

```bash
vercel dev        # recommended: serves static files AND routes /api to the FastAPI backend
```

Alternatively:
```bash
uvicorn api.index:app --reload   # run the API on http://localhost:8000
```

You can also just open `index.html` in a browser for an **offline demo** — the site falls back to built-in sample data when the API is unreachable.

### 5. Admin dashboard

Visit `/admin` (or open `corid-dashboard-2026.html`) and sign in with your `ADMIN_PASSWORD`.

## ☁️ Deployment (Vercel)

1. Import the repo (or run `vercel` / `vercel --prod`)
2. Set environment variables in **Project → Settings → Environment Variables** (for Production, Preview, and Development):
   - `SUPABASE_URL`
   - `SUPABASE_KEY` (service role / secret)
   - `ADMIN_PASSWORD`
3. Deploy. `vercel.json` handles routing automatically:
   - `/` → `index.html`
   - `/admin` → `corid-dashboard-2026.html`
   - `/api/*` → `api/index.py`

> ⚠️ The API **fails to start** if `SUPABASE_URL` or `SUPABASE_KEY` are missing — configure them in Vercel before/with your first deploy.

## 🗄️ Database Tables

- **`products`** — Brand-new products catalog
- **`preowned_products`** — Preowned products catalog
- **`orders`** — Customer orders (cart checkouts)
- **`inquiries`** — Bulk order quote requests
- **`customers`** — Customer information
- **`reviews`** — Product reviews & feedback (admin moderation)

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs and issues
- Suggest new features
- Submit pull requests

## 📞 Contact

- **Website**: [coridlifestyle.fashion.ng](https://coridlifestyle.fashion.ng) (coming soon)
- **Email**: contact@coridlifestyle.fashion.ng
- **Phone**: +234 704 340 9359 | +234 703 860 7387
- **Location**: Marina Estate, Ajah, Lagos, Nigeria

## 📄 License

This project is proprietary software owned by Corid Lifestyle NG.

---

<div align="center">
  <strong>Designed with ❤️ in Nigeria</strong>
  <br>
  <sub>© 2026 Corid Lifestyle NG. All rights reserved.</sub>
</div>
