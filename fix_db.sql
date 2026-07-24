-- ============================================
-- CORID LIFESTYLE NG - Fix RLS & Add Products
-- ============================================

-- 1. FIX RLS POLICIES for products table
DROP POLICY IF EXISTS "Allow service full access products" ON products;
DROP POLICY IF EXISTS "Allow public read products" ON products;
CREATE POLICY "Allow public read products" ON products FOR SELECT USING (true);
CREATE POLICY "Allow public insert products" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update products" ON products FOR UPDATE USING (true);
CREATE POLICY "Allow public delete products" ON products FOR DELETE USING (true);

-- 2. FIX RLS POLICIES for preowned_products table
DROP POLICY IF EXISTS "Allow service full access preowned" ON preowned_products;
DROP POLICY IF EXISTS "Allow public read preowned" ON preowned_products;
CREATE POLICY "Allow public read preowned" ON preowned_products FOR SELECT USING (true);
CREATE POLICY "Allow public insert preowned" ON preowned_products FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update preowned" ON preowned_products FOR UPDATE USING (true);
CREATE POLICY "Allow public delete preowned" ON preowned_products FOR DELETE USING (true);

-- 3. ADD MORE BRAND NEW PRODUCTS WITH IMAGES
INSERT INTO products (id, name, category, price, image, badge, rating, rating_count, description, sizes, details)
VALUES
-- Corporate shirts (more variety)
(3, 'Classic White Oxford Shirt', 'corporate', '₦38,000', 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=600&fit=crop', 'Popular', 4.6, 78, 'Timeless white Oxford shirt for the modern professional.', ARRAY['S','M','L','XL','XXL'], ARRAY['Premium cotton oxford', 'Button-down collar', 'Chest pocket', 'Adjustable cuffs', 'Wrinkle-resistant']),
(4, 'Executive Navy Suit Set', 'corporate', '₦250,000', 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=600&fit=crop', 'Premium', 4.9, 45, 'Two-piece navy suit set for boardroom excellence.', ARRAY['S','M','L','XL','XXL'], ARRAY['Premium wool blend', 'Two-button closure', 'Notch lapel', 'Flat-front trousers', 'Fully lined']),
(5, 'Grey Herringbone Blazer', 'corporate', '₦95,000', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop', 'Premium', 4.7, 56, 'Sophisticated herringbone blazer for discerning gentlemen.', ARRAY['S','M','L','XL','XXL'], ARRAY['Wool blend herringbone', 'Patch pockets', 'Leather elbow patches', 'Horn buttons', 'Interior lining']),

-- Casual shirts
(6, 'Linen Casual Shirt - Sand', 'casual', '₦25,000', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=600&fit=crop', 'Summer Collection', 4.5, 112, 'Breathable linen shirt perfect for warm Nigerian days.', ARRAY['S','M','L','XL','XXL'], ARRAY['100% European linen', 'Relaxed fit', 'Mother-of-pearl buttons', 'Roll-up sleeve tabs', 'Machine washable']),
(7, 'Denim Casual Shirt', 'casual', '₦30,000', 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&h=600&fit=crop', 'Trending', 4.6, 89, 'Classic denim shirt that pairs with everything.', ARRAY['S','M','L','XL','XXL'], ARRAY['Lightweight denim', 'Western styling', 'Snap buttons', 'Chest pockets', 'Washed for softness']),
(8, 'Cotton Poplin Casual Shirt', 'casual', '₦22,000', 'https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=600&h=600&fit=crop', 'Best Value', 4.4, 134, 'Versatile cotton poplin shirt for smart casual looks.', ARRAY['S','M','L','XL','XXL'], ARRAY['Premium cotton poplin', 'Spread collar', 'Short sleeves option', 'Easy care fabric', 'Wrinkle resistant']),

-- More jeans
(10, 'Classic Blue Straight Jeans', 'jeans', '₦35,000', 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&h=600&fit=crop', 'Best Seller', 4.7, 167, 'Straight-leg jeans in classic medium wash.', ARRAY['S','M','L','XL','XXL'], ARRAY['Premium stretch denim', 'Medium wash', 'Straight leg', 'Five-pocket design', 'Comfort waistband']),
(11, 'Corporate Chino Trousers', 'jeans', '₦28,000', 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=600&h=600&fit=crop', 'Essential', 4.5, 98, 'Smart chino trousers for office and casual wear.', ARRAY['S','M','L','XL','XXL'], ARRAY['Cotton twill fabric', 'Flat front', 'Slim straight fit', 'Belt loops', 'Machine washable']),
(12, 'Navy Dress Trousers', 'jeans', '₦32,000', 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&h=600&fit=crop', 'Corporate', 4.6, 73, 'Sharp navy dress trousers for formal occasions.', ARRAY['S','M','L','XL','XXL'], ARRAY['Premium wool blend', 'Pleated front', 'Zip fly', 'Side pockets', 'Dry clean recommended']),

-- Sportswear
(13, 'Performance Track Jacket', 'sportswear', '₦20,000', 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&h=600&fit=crop', 'Athletic', 4.5, 88, 'Lightweight track jacket for training and casual wear.', ARRAY['S','M','L','XL','XXL'], ARRAY['Moisture-wicking fabric', 'Full zip front', 'Stand-up collar', 'Zippered pockets', 'Breathable mesh lining']),
(14, 'Jogger Sweatpants', 'sportswear', '₦15,000', 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&h=600&fit=crop', 'Comfort', 4.4, 145, 'Comfortable joggers with elastic cuffs and drawstring waist.', ARRAY['S','M','L','XL','XXL'], ARRAY['Cotton-polyester blend', 'Elastic waist with drawstring', 'Ribbed cuffs', 'Side pockets', 'Machine washable']),
(15, 'Dry-Fit Training Tee', 'sportswear', '₦10,000', 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&h=600&fit=crop', 'Value', 4.3, 201, 'Performance training tee that keeps you cool and dry.', ARRAY['S','M','L','XL','XXL'], ARRAY['Quick-dry polyester', 'Raglan sleeves', 'Flatlock seams', 'Reflective accents', 'Anti-odor treatment']),

-- More hoodies
(18, 'Premium Zip Hoodie', 'hoodies', '₦30,000', 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=600&fit=crop', 'Popular', 4.6, 112, 'Full-zip hoodie in heavyweight cotton fleece.', ARRAY['S','M','L','XL','XXL'], ARRAY['Heavyweight fleece', 'Full metal zip', 'Kangaroo pockets', 'Adjustable hood', 'Ribbed hem & cuffs']),
(19, 'Essential Sweatshirt', 'hoodies', '₦18,000', 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&h=600&fit=crop', 'Essential', 4.4, 167, 'Classic pullover sweatshirt for everyday comfort.', ARRAY['S','M','L','XL','XXL'], ARRAY['Cotton-polyester fleece', 'Crew neck', 'Ribbed cuffs & hem', 'Brushed interior', 'Machine washable']),

-- More caps & shoes
(20, 'Classic Leather Derby Shoes', 'caps', '₦65,000', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop', 'Premium', 4.8, 67, 'Handsome derby shoes in polished leather.', ARRAY['40','41','42','43','44','45'], ARRAY['Full-grain leather', 'Leather sole', 'Goodyear welted', 'Polished finish', 'Includes shoe bags']),
(21, 'Snapback Cap', 'caps', '₦8,000', 'https://images.unsplash.com/photo-1556306535-0f09c5376f3e?w=600&h=600&fit=crop', 'Accessory', 4.3, 89, 'Structured snapback cap with embroidered logo.', ARRAY['One Size'], ARRAY['Cotton twill', 'Adjustable snapback', 'Embroidered eyelets', 'Pre-curved visor', 'One size fits most']),
(23, 'Corporate Oxford Shoes', 'caps', '₦55,000', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop', 'Corporate', 4.7, 54, 'Classic oxford shoes for boardroom sophistication.', ARRAY['40','41','42','43','44','45'], ARRAY['Polished calf leather', 'Leather lining', 'Rubber heel', 'Lace-up closure', 'Professional shine']),
(24, 'Slides - Comfort Fit', 'caps', '₦12,000', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop', 'Summer', 4.2, 123, 'Comfortable slides for casual summer days.', ARRAY['39','40','41','42','43','44'], ARRAY['EVA foam construction', 'Contoured footbed', 'Lightweight design', 'Water-resistant', 'Indoor/outdoor use']),

-- Accessories
(25, 'Leather Belt - Brown', 'accessories', '₦22,000', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop', 'Essential', 4.5, 78, 'Premium leather belt with brushed buckle.', ARRAY['90','95','100','105','110'], ARRAY['Genuine leather', 'Brushed nickel buckle', 'Stitched edging', 'Available in 5 sizes', 'Gift box included']),
(26, 'Silk Tie Collection', 'accessories', '₦15,000', 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=600&h=600&fit=crop', 'Premium', 4.6, 45, 'Hand-finished silk tie in classic patterns.', ARRAY['One Size'], ARRAY['100% silk twill', 'Hand-rolled edges', 'Lined interlining', 'Classic 8cm width', 'Includes tie bar']),
(27, 'Cufflink Set - Gold', 'accessories', '₦12,000', 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=600&h=600&fit=crop', 'Premium', 4.7, 34, 'Elegant gold-toned cufflinks for formal wear.', ARRAY['One Size'], ARRAY['Gold-toned finish', 'Enamel inlay', 'Flip-lock closure', 'Presentation box', 'Engravable surface']),
(28, 'Leather Wallet', 'accessories', '₦18,000', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop', 'Best Seller', 4.6, 112, 'Slim bifold wallet in pebbled leather.', ARRAY['One Size'], ARRAY['Pebbled calf leather', '6 card slots', '2 bill compartments', 'RFID blocking', 'Gift boxed']),
(29, 'Aviator Sunglasses', 'accessories', '₦20,000', 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=600&fit=crop', 'Premium', 4.5, 67, 'Classic aviator sunglasses with UV protection.', ARRAY['One Size'], ARRAY['Metal frame', 'Polarized lenses', 'UV400 protection', 'Adjustable nose pads', 'Includes case']),
(30, 'Leather Watch - Brown Strap', 'accessories', '₦45,000', 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&h=600&fit=crop', 'Premium', 4.8, 56, 'Elegant timepiece with genuine leather strap.', ARRAY['One Size'], ARRAY['Japanese quartz movement', 'Genuine leather strap', 'Mineral crystal', 'Water resistant', '2-year warranty']),

-- More bags
(32, 'Canvas Messenger Bag', 'bags', '₦25,000', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop', 'Trending', 4.4, 78, 'Everyday messenger bag in durable canvas.', ARRAY['One Size'], ARRAY['Waxed canvas', 'Genuine leather trim', 'Adjustable strap', 'Laptop compartment', 'Brass hardware']),
(33, 'Leather Backpack', 'bags', '₦35,000', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop', 'Premium', 4.6, 45, 'Sophisticated leather backpack for work and travel.', ARRAY['One Size'], ARRAY['Full-grain leather', 'Padded laptop sleeve', 'Organizer pockets', 'Breathable back panel', 'USB charging port']),
(34, 'Travel Duffle Bag', 'bags', '₦30,000', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop', 'Travel', 4.5, 34, 'Spacious duffle bag for weekend getaways.', ARRAY['One Size'], ARRAY['Water-resistant nylon', 'Removable shoulder strap', 'Shoe compartment', 'Interior pockets', 'Lockable zippers']),

-- Unisex items
(35, 'Classic Tote - Unisex', 'bags', '₦20,000', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop', 'Unisex', 4.4, 67, 'Minimalist tote bag suitable for everyone.', ARRAY['One Size'], ARRAY['Heavy cotton canvas', 'Reinforced handles', 'Interior pocket', 'Folds flat', 'Available in 3 colors']);

-- 4. ADD MORE PREOWNED PRODUCTS
INSERT INTO preowned_products (id, name, category, price, original_price, image, badge, rating, rating_count, description, sizes, details)
VALUES
(102, 'Preowned Gucci Casual Shirt', 'casual', '₦18,000', '₦65,000', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=600&fit=crop', 'Luxury', 4.6, 28, 'Authentic Gucci casual shirt in premium condition.', ARRAY['M','L','XL'], ARRAY['Authentic Gucci', 'Grade A condition', 'Signature print', 'Pearl buttons', 'Save 72%']),
(103, 'Preowned Nike Sport Joggers', 'sportswear', '₦8,000', '₦25,000', 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&h=600&fit=crop', 'Grade A', 4.5, 42, 'Authentic Nike joggers in excellent condition.', ARRAY['S','M','L','XL'], ARRAY['Authentic Nike', 'Dri-FIT technology', 'Elastic waistband', 'Minimal wear', 'Save 68%']),
(105, 'Preowned Ralph Lauren Hoodie', 'hoodies', '₦12,000', '₦40,000', 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=600&fit=crop', 'Grade A', 4.8, 47, 'Authentic Ralph Lauren hoodie with embroidered logo.', ARRAY['M','L','XL'], ARRAY['Authentic Ralph Lauren', 'Embroidered pony logo', 'Cotton fleece', 'Excellent condition', 'Save 70%']),
(106, 'Preowned Tommy Hilfiger Hoodie', 'hoodies', '₦10,000', '₦35,000', 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=600&fit=crop', 'Best Value', 4.6, 38, 'Authentic Tommy Hilfiger hoodie in great shape.', ARRAY['S','M','L','XL'], ARRAY['Authentic Tommy Hilfiger', 'Flag logo embroidery', 'Cotton-poly blend', 'Pulled condition 8/10', 'Save 71%']),
(108, 'Preowned Ray-Ban Sunglasses', 'accessories', '₦15,000', '₦55,000', 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=600&fit=crop', 'Luxury', 4.6, 31, 'Authentic Ray-Ban aviators in great condition.', ARRAY['One Size'], ARRAY['Authentic Ray-Ban', 'Green G-15 lenses', 'Gold frame', 'Minimal scratches', 'Includes case']),
(110, 'Preowned Lacoste Polo', 'casual', '₦8,000', '₦30,000', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=600&fit=crop', 'Grade A', 4.7, 56, 'Classic Lacoste polo shirt in excellent preowned condition.', ARRAY['S','M','L','XL'], ARRAY['Authentic Lacoste', 'Embroidered crocodile', 'Cotton pique', 'Collar intact', 'Save 73%']);
