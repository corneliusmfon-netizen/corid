-- ============================================
-- CORID LIFESTYLE NG - Database Schema
-- Run this in Supabase SQL Editor
--
-- SECURITY MODEL (reconciled with fix_db.sql):
--   * The frontend talks ONLY to the FastAPI backend, never to Supabase
--     directly. The API runs with the SERVICE ROLE (secret) key.
--   * Products / preowned products are public catalog content -> anonymous
--     SELECT is allowed (harmless; same data the public API already serves).
--   * Orders, inquiries, customers and reviews contain personal data and
--     are write-only for the API -> SERVICE ROLE only. No anonymous access.
--   * All policy statements use DROP IF EXISTS so this script is safe to
--     re-run.
-- ============================================

-- NOTE: Supabase includes the pgcrypto extension by default,
-- which provides gen_random_uuid(). No need for uuid-ossp.

-- ============================================
-- PRODUCTS TABLE (Brand New)
-- ============================================
CREATE TABLE IF NOT EXISTS products (
  id BIGINT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  condition TEXT DEFAULT 'new',
  price TEXT NOT NULL,
  original_price TEXT,
  image TEXT NOT NULL,
  badge TEXT DEFAULT '',
  rating DECIMAL(2,1) DEFAULT 4.5,
  rating_count INTEGER DEFAULT 0,
  description TEXT,
  sizes TEXT[] DEFAULT '{}',
  details TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Public catalog read; all writes via API (service role)
DROP POLICY IF EXISTS "Allow anonymous read products" ON products;
DROP POLICY IF EXISTS "Allow public read products" ON products;
DROP POLICY IF EXISTS "Allow service full access products" ON products;

CREATE POLICY "Allow anonymous read products" ON products
  FOR SELECT USING (true);

CREATE POLICY "Allow service full access products" ON products
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- PREOWNED PRODUCTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS preowned_products (
  id BIGINT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price TEXT NOT NULL,
  original_price TEXT,
  image TEXT NOT NULL,
  badge TEXT DEFAULT '',
  rating DECIMAL(2,1) DEFAULT 4.5,
  rating_count INTEGER DEFAULT 0,
  description TEXT,
  sizes TEXT[] DEFAULT '{}',
  details TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE preowned_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anonymous read preowned" ON preowned_products;
DROP POLICY IF EXISTS "Allow public read preowned" ON preowned_products;
DROP POLICY IF EXISTS "Allow service full access preowned" ON preowned_products;

CREATE POLICY "Allow anonymous read preowned" ON preowned_products
  FOR SELECT USING (true);

CREATE POLICY "Allow service full access preowned" ON preowned_products
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- ORDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  items JSONB DEFAULT '[]',
  total_items INTEGER DEFAULT 0,
  order_type TEXT DEFAULT 'cart',
  message TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Sensitive data: service role only (API reads/writes orders)
DROP POLICY IF EXISTS "Allow anonymous insert orders" ON orders;
DROP POLICY IF EXISTS "Allow anonymous read own orders" ON orders;
DROP POLICY IF EXISTS "Allow service full access orders" ON orders;

CREATE POLICY "Allow service full access orders" ON orders
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- INQUIRIES TABLE (Bulk Orders)
-- ============================================
CREATE TABLE IF NOT EXISTS inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  company TEXT,
  category TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anonymous insert inquiries" ON inquiries;
DROP POLICY IF EXISTS "Allow anonymous read own inquiries" ON inquiries;
DROP POLICY IF EXISTS "Allow service full access inquiries" ON inquiries;

CREATE POLICY "Allow service full access inquiries" ON inquiries
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- CUSTOMERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  total_orders INTEGER DEFAULT 0,
  total_spent TEXT DEFAULT '₦0',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anonymous insert customers" ON customers;
DROP POLICY IF EXISTS "Allow anonymous read customers" ON customers;
DROP POLICY IF EXISTS "Allow service full access customers" ON customers;

CREATE POLICY "Allow service full access customers" ON customers
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- REVIEWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  customer_name TEXT NOT NULL,
  product_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anonymous insert reviews" ON reviews;
DROP POLICY IF EXISTS "Allow anonymous read approved reviews" ON reviews;
DROP POLICY IF EXISTS "Allow service full access reviews" ON reviews;

CREATE POLICY "Allow service full access reviews" ON reviews
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- SEED DATA - Brand New Products (idempotent)
-- ============================================
INSERT INTO products (id, name, category, price, image, badge, rating, rating_count, description, sizes, details) VALUES
(1, 'Executive Pro Fit Shirt', 'corporate', '₦45,000', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=600&fit=crop', 'Best Seller', 4.8, 124, 'Premium executive fit shirt crafted from high-grade cotton-linen blend. Features a spread collar, adjustable cuffs, and a tailored silhouette perfect for the modern professional.', ARRAY['XS','S','M','L','XL','XXL'], ARRAY['100% Egyptian cotton', 'Spread collar design', 'Adjustable barrel cuffs', 'Mother-of-pearl buttons', 'Machine washable']),
(2, 'Signature Navy Blazer', 'corporate', '₦120,000', 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=600&h=600&fit=crop', 'Premium', 4.9, 87, 'A timeless navy blazer crafted from premium wool blend.', ARRAY['S','M','L','XL','XXL'], ARRAY['Premium wool blend fabric', 'Fully lined interior', 'Notch lapel design', 'Gold-toned buttons', 'Inner pocket detailing']),
(9, 'Slim Fit Dark Denim', 'jeans', '₦45,000', 'https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=600&h=600&fit=crop', 'Best Seller', 4.8, 203, 'Our signature slim-fit jeans in a rich dark wash.', ARRAY['S','M','L','XL','XXL'], ARRAY['Premium stretch denim', 'Dark indigo wash', 'Slim fit through leg', 'Five-pocket styling', 'Zip fly with button closure']),
(17, 'Classic Pullover Hoodie', 'hoodies', '₦35,000', 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=600&fit=crop', 'Popular', 4.7, 189, 'The ultimate comfort piece. Heavyweight cotton fleece for warmth and durability.', ARRAY['S','M','L','XL','XXL'], ARRAY['Heavyweight cotton fleece', 'Kangaroo pocket', 'Adjustable drawstring hood', 'Ribbed cuffs & hem', 'Brushed interior']),
(22, 'Premium Leather Sneakers', 'caps', '₦85,000', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop', 'Premium', 4.8, 93, 'Handcrafted leather sneakers that bridge luxury and comfort.', ARRAY['40','41','42','43','44','45'], ARRAY['Full-grain leather upper', 'Cushioned leather insole', 'Rubber outsole', 'Lace-up closure', 'Handcrafted construction']),
(31, 'Designer Tote Bag', 'bags', '₦55,000', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop', 'Best Seller', 4.7, 156, 'Spacious yet elegant tote bag in pebbled leather.', ARRAY['One Size'], ARRAY['Pebbled leather exterior', 'Gold-toned hardware', 'Detachable shoulder strap', 'Interior zip pocket', 'Magnetic snap closure'])
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SEED DATA - Preowned Products (idempotent)
-- ============================================
INSERT INTO preowned_products (id, name, category, price, original_price, image, badge, rating, rating_count, description, sizes, details) VALUES
(101, 'Preowned Hugo Boss Blazer', 'corporate', '₦28,000', '₦120,000', 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=600&h=600&fit=crop', 'Grade A', 4.7, 34, 'Premium preowned Hugo Boss blazer in excellent condition.', ARRAY['M','L','XL'], ARRAY['Grade A condition', 'Professionally cleaned', 'Original buttons intact', '7-day return guarantee', 'Save over 75%']),
(104, 'Preowned Levi''s 501 Jeans', 'jeans', '₦10,000', '₦35,000', 'https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=600&h=600&fit=crop', 'Best Value', 4.9, 67, 'Authentic vintage Levi''s 501 jeans broken in to perfection.', ARRAY['S','M','L'], ARRAY['Authentic vintage Levi''s 501', 'Perfectly broken in', 'Sturdy condition', 'Classic straight leg', 'Save 71%']),
(107, 'Preowned Adidas Sneakers', 'caps', '₦15,000', '₦50,000', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop', 'Grade A', 4.7, 53, 'Authentic Adidas originals sneakers in well-maintained condition.', ARRAY['41','42','43','44'], ARRAY['Authentic Adidas', 'Sole condition 8/10', 'Disinfected & deodorized', 'Original laces', 'Save 70%']),
(109, 'Preowned Michael Kors Bag', 'bags', '₦22,000', '₦80,000', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop', 'Luxury', 4.7, 38, 'Designer Michael Kors tote in excellent preowned condition.', ARRAY['One Size'], ARRAY['Authentic Michael Kors', 'Gold hardware intact', 'Interior lining clean', 'Minimal corner wear', 'Save 72%'])
ON CONFLICT (id) DO NOTHING;
