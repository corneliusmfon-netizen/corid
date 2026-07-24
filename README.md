# Corid Lifestyle NG 🏆

> **Premium Fashion House** — Elevating Nigerian fashion with curated collections of corporatewear, casualwear, sportswear, accessories, and Grade-A preowned luxury.

![Corid Lifestyle NG](https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&h=400&fit=crop)

## ✨ Overview

**Corid Lifestyle NG** is a full-featured e-commerce fashion storefront built with pure HTML, CSS, and JavaScript. It combines a stunning customer-facing shopping experience with a powerful admin dashboard for inventory, orders, and customer management.

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

### Admin Dashboard (`corid-dashboard-2026.html`)
- **Dashboard** — Sales stats, weekly charts, top categories, recent orders table
- **Inventory Management** — Product grid with CRUD operations, search & filter
- **Orders Management** — Order tracking with status filtering
- **Customer Management** — Customer database with search
- **Reviews Moderation** — Manage product ratings and feedback
- **Analytics** — Revenue charts, conversion rates, avg order value
- **Settings** — Store information and branding configuration

### Technical Features
- **Supabase Integration** — Real-time database for products, orders, and customers
- **Offline Fallback** — Hardcoded product data when database is unavailable
- **Responsive & Mobile-First** — Works seamlessly across all devices
- **Zero Framework Dependencies** — Built with vanilla HTML/CSS/JS

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| ![HTML5](https://img.shields.io/badge/-HTML5-E34F26?logo=html5&logoColor=white) | Structure & content |
| ![CSS3](https://img.shields.io/badge/-CSS3-1572B6?logo=css3&logoColor=white) | Styling & animations |
| ![JavaScript](https://img.shields.io/badge/-JavaScript-F7DF1E?logo=javascript&logoColor=black) | Interactivity & logic |
| ![Supabase](https://img.shields.io/badge/-Supabase-3ECF8E?logo=supabase&logoColor=white) | Backend database |
| ![Vercel](https://img.shields.io/badge/-Vercel-000000?logo=vercel&logoColor=white) | Deployment & hosting |
| ![Google Fonts](https://img.shields.io/badge/-Google%20Fonts-4285F4?logo=google-fonts&logoColor=white) | Typography (Playfair Display, Inter) |
| ![Font Awesome](https://img.shields.io/badge/-Font%20Awesome-528DD7?logo=font-awesome&logoColor=white) | Icons |

## 📁 Project Structure

```
corid/
├── index.html                 # Main customer storefront
├── corid-dashboard-2026.html  # Admin management portal
├── package.json               # Dependencies (Supabase JS client)
├── vercel.json                # Vercel deployment configuration
├── schema.sql                 # Database schema
├── fix_db.sql                 # Database fix scripts
├── .gitignore
├── .vercelignore
│
├── css/
│   ├── style.css              # Storefront styles
│   └── admin.css              # Admin dashboard styles
│
├── js/
│   ├── api.js                 # Supabase client & API functions
│   ├── script.js              # Storefront logic & interactions
│   └── admin.js               # Admin dashboard logic
│
└── assets/                    # (optional - for local assets)
```

## 🚦 Getting Started

### Prerequisites
- A modern web browser
- [Supabase](https://supabase.com) account (optional — works with fallback data)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/corneliusmfon-netizen/corid.git
   cd corid
   ```

2. **Open in browser**
   Simply open `index.html` in your browser — no build step required!

3. **(Optional) Connect Supabase**
   Set up a Supabase project and configure the connection in `js/api.js`:
   ```js
   const supabaseUrl = 'YOUR_SUPABASE_URL';
   const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
   ```

4. **Open Admin Dashboard**
   Navigate to `corid-dashboard-2026.html` for the admin panel.

## ☁️ Deployment

This project is configured for one-click deployment on **Vercel**.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/corneliusmfon-netizen/corid)

The `vercel.json` file handles static site routing automatically:
```json
{
  "version": 2,
  "builds": [{ "src": "**/*", "use": "@vercel/static" }],
  "routes": [
    { "src": "/", "dest": "/index.html" },
    { "src": "/(.*)", "dest": "/$1" }
  ]
}
```

## 🧩 Database Schema

The Supabase database includes the following tables:

- **`products`** — New products catalog
- **`preowned_products`** — Preowned products catalog
- **`orders`** — Customer orders
- **`order_items`** — Individual items within orders
- **`customers`** — Customer information
- **`ratings`** — Product ratings & reviews
- **`ratings_replies`** — Admin replies to reviews
- **`testimonials`** — Customer testimonials

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
