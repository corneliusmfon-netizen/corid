/* ============================================
   CORID LIFESTYLE NG - Main JavaScript
   ============================================ */

// ============================================
// PRODUCT DATABASE — Load from Supabase with
// hardcoded fallback
// ============================================
let products = [];
let preownedProducts = [];

// ============================================
// LOAD FROM SUPABASE
// ============================================
async function loadProductsFromAPI() {
  try {
    const { data: dbProducts, error: prodErr } = await ProductsAPI.getAll();
    const { data: dbPreowned, error: preErr } = await PreownedAPI.getAll();

    if (!prodErr && dbProducts && dbProducts.length > 0) {
      products = dbProducts;
    } else {
      console.warn('Using fallback brand new products', prodErr);
      products = getFallbackProducts();
    }

    if (!preErr && dbPreowned && dbPreowned.length > 0) {
      preownedProducts = dbPreowned;
    } else {
      console.warn('Using fallback preowned products', preErr);
      preownedProducts = getFallbackPreowned();
    }

    // Re-render after data loads
    renderProducts();
    renderPreowned();
    renderReviews();
    renderTestimonials();
    console.log(`✨ Corid Lifestyle NG — Loaded ${products.length} new + ${preownedProducts.length} preowned products`);
  } catch (err) {
    console.warn('Supabase unavailable, using fallback data:', err.message);
    products = getFallbackProducts();
    preownedProducts = getFallbackPreowned();
    renderProducts();
    renderPreowned();
    renderReviews();
    renderTestimonials();
  }
}

// ============================================
// FALLBACK PRODUCT DATA (Brand New) - 35 items
// ============================================
function getFallbackProducts() {
  return [
    // --- CORPORATE (id: 1-5) ---
    { id: 1, name: 'Executive Pro Fit Shirt', category: 'corporate', condition: 'new', price: '₦45,000', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=600&fit=crop', badge: 'Best Seller', rating: 4.8, ratingCount: 124, description: 'Premium executive fit shirt crafted from high-grade cotton-linen blend.', sizes: ['XS','S','M','L','XL','XXL'], details: ['100% Egyptian cotton', 'Spread collar design', 'Adjustable barrel cuffs', 'Mother-of-pearl buttons', 'Machine washable'] },
    { id: 2, name: 'Signature Navy Blazer', category: 'corporate', condition: 'new', price: '₦120,000', image: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=600&h=600&fit=crop', badge: 'Premium', rating: 4.9, ratingCount: 87, description: 'A timeless navy blazer crafted from premium wool blend.', sizes: ['S','M','L','XL','XXL'], details: ['Premium wool blend fabric', 'Fully lined interior', 'Notch lapel design', 'Gold-toned buttons', 'Inner pocket detailing'] },
    { id: 3, name: 'Classic White Oxford Shirt', category: 'corporate', condition: 'new', price: '₦38,000', image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=600&fit=crop', badge: 'Popular', rating: 4.6, ratingCount: 78, description: 'Timeless white Oxford shirt for the modern professional.', sizes: ['S','M','L','XL','XXL'], details: ['Premium cotton oxford', 'Button-down collar', 'Chest pocket', 'Adjustable cuffs', 'Wrinkle-resistant'] },
    { id: 4, name: 'Executive Navy Suit Set', category: 'corporate', condition: 'new', price: '₦250,000', image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=600&fit=crop', badge: 'Premium', rating: 4.9, ratingCount: 45, description: 'Two-piece navy suit set for boardroom excellence.', sizes: ['S','M','L','XL','XXL'], details: ['Premium wool blend', 'Two-button closure', 'Notch lapel', 'Flat-front trousers', 'Fully lined'] },
    { id: 5, name: 'Grey Herringbone Blazer', category: 'corporate', condition: 'new', price: '₦95,000', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop', badge: 'Premium', rating: 4.7, ratingCount: 56, description: 'Sophisticated herringbone blazer for discerning gentlemen.', sizes: ['S','M','L','XL','XXL'], details: ['Wool blend herringbone', 'Patch pockets', 'Leather elbow patches', 'Horn buttons', 'Interior lining'] },
    // --- CASUAL (id: 6-8) ---
    { id: 6, name: 'Linen Casual Shirt - Sand', category: 'casual', condition: 'new', price: '₦25,000', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=600&fit=crop', badge: 'Summer Collection', rating: 4.5, ratingCount: 112, description: 'Breathable linen shirt perfect for warm Nigerian days.', sizes: ['S','M','L','XL','XXL'], details: ['100% European linen', 'Relaxed fit', 'Mother-of-pearl buttons', 'Roll-up sleeve tabs', 'Machine washable'] },
    { id: 7, name: 'Denim Casual Shirt', category: 'casual', condition: 'new', price: '₦30,000', image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&h=600&fit=crop', badge: 'Trending', rating: 4.6, ratingCount: 89, description: 'Classic denim shirt that pairs with everything.', sizes: ['S','M','L','XL','XXL'], details: ['Lightweight denim', 'Western styling', 'Snap buttons', 'Chest pockets', 'Washed for softness'] },
    { id: 8, name: 'Cotton Poplin Casual Shirt', category: 'casual', condition: 'new', price: '₦22,000', image: 'https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=600&h=600&fit=crop', badge: 'Best Value', rating: 4.4, ratingCount: 134, description: 'Versatile cotton poplin shirt for smart casual looks.', sizes: ['S','M','L','XL','XXL'], details: ['Premium cotton poplin', 'Spread collar', 'Short sleeves option', 'Easy care fabric', 'Wrinkle resistant'] },
    // --- JEANS (id: 9-12) ---
    { id: 9, name: 'Slim Fit Dark Denim', category: 'jeans', condition: 'new', price: '₦45,000', image: 'https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=600&h=600&fit=crop', badge: 'Best Seller', rating: 4.8, ratingCount: 203, description: 'Our signature slim-fit jeans in a rich dark wash.', sizes: ['S','M','L','XL','XXL'], details: ['Premium stretch denim', 'Dark indigo wash', 'Slim fit through leg', 'Five-pocket styling', 'Zip fly with button closure'] },
    { id: 10, name: 'Classic Blue Straight Jeans', category: 'jeans', condition: 'new', price: '₦35,000', image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&h=600&fit=crop', badge: 'Best Seller', rating: 4.7, ratingCount: 167, description: 'Straight-leg jeans in classic medium wash.', sizes: ['S','M','L','XL','XXL'], details: ['Premium stretch denim', 'Medium wash', 'Straight leg', 'Five-pocket design', 'Comfort waistband'] },
    { id: 11, name: 'Corporate Chino Trousers', category: 'jeans', condition: 'new', price: '₦28,000', image: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=600&h=600&fit=crop', badge: 'Essential', rating: 4.5, ratingCount: 98, description: 'Smart chino trousers for office and casual wear.', sizes: ['S','M','L','XL','XXL'], details: ['Cotton twill fabric', 'Flat front', 'Slim straight fit', 'Belt loops', 'Machine washable'] },
    { id: 12, name: 'Navy Dress Trousers', category: 'jeans', condition: 'new', price: '₦32,000', image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&h=600&fit=crop', badge: 'Corporate', rating: 4.6, ratingCount: 73, description: 'Sharp navy dress trousers for formal occasions.', sizes: ['S','M','L','XL','XXL'], details: ['Premium wool blend', 'Pleated front', 'Zip fly', 'Side pockets', 'Dry clean recommended'] },
    // --- SPORTSWEAR (id: 13-16) ---
    { id: 13, name: 'Performance Track Jacket', category: 'sportswear', condition: 'new', price: '₦20,000', image: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&h=600&fit=crop', badge: 'Athletic', rating: 4.5, ratingCount: 88, description: 'Lightweight track jacket for training and casual wear.', sizes: ['S','M','L','XL','XXL'], details: ['Moisture-wicking fabric', 'Full zip front', 'Stand-up collar', 'Zippered pockets', 'Breathable mesh lining'] },
    { id: 14, name: 'Jogger Sweatpants', category: 'sportswear', condition: 'new', price: '₦15,000', image: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&h=600&fit=crop', badge: 'Comfort', rating: 4.4, ratingCount: 145, description: 'Comfortable joggers with elastic cuffs and drawstring waist.', sizes: ['S','M','L','XL','XXL'], details: ['Cotton-polyester blend', 'Elastic waist with drawstring', 'Ribbed cuffs', 'Side pockets', 'Machine washable'] },
    { id: 15, name: 'Dry-Fit Training Tee', category: 'sportswear', condition: 'new', price: '₦10,000', image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&h=600&fit=crop', badge: 'Value', rating: 4.3, ratingCount: 201, description: 'Performance training tee that keeps you cool and dry.', sizes: ['S','M','L','XL','XXL'], details: ['Quick-dry polyester', 'Raglan sleeves', 'Flatlock seams', 'Reflective accents', 'Anti-odor treatment'] },
    { id: 16, name: 'Sports Polo Shirt', category: 'sportswear', condition: 'new', price: '₦18,000', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=600&fit=crop', badge: 'Essential', rating: 4.4, ratingCount: 76, description: 'Performance polo for sport and casual wear.', sizes: ['S','M','L','XL','XXL'], details: ['Moisture-wicking pique', 'Three-button placket', 'Tennis tail', 'UV protection', 'Machine washable'] },
    // --- HOODIES (id: 17-19) ---
    { id: 17, name: 'Classic Pullover Hoodie', category: 'hoodies', condition: 'new', price: '₦35,000', image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=600&fit=crop', badge: 'Popular', rating: 4.7, ratingCount: 189, description: 'The ultimate comfort piece. Heavyweight cotton fleece.', sizes: ['S','M','L','XL','XXL'], details: ['Heavyweight cotton fleece', 'Kangaroo pocket', 'Adjustable drawstring hood', 'Ribbed cuffs & hem', 'Brushed interior'] },
    { id: 18, name: 'Premium Zip Hoodie', category: 'hoodies', condition: 'new', price: '₦30,000', image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=600&fit=crop', badge: 'Popular', rating: 4.6, ratingCount: 112, description: 'Full-zip hoodie in heavyweight cotton fleece.', sizes: ['S','M','L','XL','XXL'], details: ['Heavyweight fleece', 'Full metal zip', 'Kangaroo pockets', 'Adjustable hood', 'Ribbed hem & cuffs'] },
    { id: 19, name: 'Essential Sweatshirt', category: 'hoodies', condition: 'new', price: '₦18,000', image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&h=600&fit=crop', badge: 'Essential', rating: 4.4, ratingCount: 167, description: 'Classic pullover sweatshirt for everyday comfort.', sizes: ['S','M','L','XL','XXL'], details: ['Cotton-polyester fleece', 'Crew neck', 'Ribbed cuffs & hem', 'Brushed interior', 'Machine washable'] },
    // --- CAPS & SHOES (id: 20-24) ---
    { id: 20, name: 'Classic Leather Derby Shoes', category: 'caps', condition: 'new', price: '₦65,000', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop', badge: 'Premium', rating: 4.8, ratingCount: 67, description: 'Handsome derby shoes in polished leather.', sizes: ['40','41','42','43','44','45'], details: ['Full-grain leather', 'Leather sole', 'Goodyear welted', 'Polished finish', 'Includes shoe bags'] },
    { id: 21, name: 'Snapback Cap', category: 'caps', condition: 'new', price: '₦8,000', image: 'https://images.unsplash.com/photo-1556306535-0f09c5376f3e?w=600&h=600&fit=crop', badge: 'Accessory', rating: 4.3, ratingCount: 89, description: 'Structured snapback cap with embroidered logo.', sizes: ['One Size'], details: ['Cotton twill', 'Adjustable snapback', 'Embroidered eyelets', 'Pre-curved visor', 'One size fits most'] },
    { id: 22, name: 'Premium Leather Sneakers', category: 'caps', condition: 'new', price: '₦85,000', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop', badge: 'Premium', rating: 4.8, ratingCount: 93, description: 'Handcrafted leather sneakers that bridge luxury and comfort.', sizes: ['40','41','42','43','44','45'], details: ['Full-grain leather upper', 'Cushioned leather insole', 'Rubber outsole', 'Lace-up closure', 'Handcrafted construction'] },
    { id: 23, name: 'Corporate Oxford Shoes', category: 'caps', condition: 'new', price: '₦55,000', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop', badge: 'Corporate', rating: 4.7, ratingCount: 54, description: 'Classic oxford shoes for boardroom sophistication.', sizes: ['40','41','42','43','44','45'], details: ['Polished calf leather', 'Leather lining', 'Rubber heel', 'Lace-up closure', 'Professional shine'] },
    { id: 24, name: 'Slides - Comfort Fit', category: 'caps', condition: 'new', price: '₦12,000', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop', badge: 'Summer', rating: 4.2, ratingCount: 123, description: 'Comfortable slides for casual summer days.', sizes: ['39','40','41','42','43','44'], details: ['EVA foam construction', 'Contoured footbed', 'Lightweight design', 'Water-resistant', 'Indoor/outdoor use'] },
    // --- ACCESSORIES (id: 25-30) ---
    { id: 25, name: 'Leather Belt - Brown', category: 'accessories', condition: 'new', price: '₦22,000', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop', badge: 'Essential', rating: 4.5, ratingCount: 78, description: 'Premium leather belt with brushed buckle.', sizes: ['90','95','100','105','110'], details: ['Genuine leather', 'Brushed nickel buckle', 'Stitched edging', 'Available in 5 sizes', 'Gift box included'] },
    { id: 26, name: 'Silk Tie Collection', category: 'accessories', condition: 'new', price: '₦15,000', image: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=600&h=600&fit=crop', badge: 'Premium', rating: 4.6, ratingCount: 45, description: 'Hand-finished silk tie in classic patterns.', sizes: ['One Size'], details: ['100% silk twill', 'Hand-rolled edges', 'Lined interlining', 'Classic 8cm width', 'Includes tie bar'] },
    { id: 27, name: 'Cufflink Set - Gold', category: 'accessories', condition: 'new', price: '₦12,000', image: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=600&h=600&fit=crop', badge: 'Premium', rating: 4.7, ratingCount: 34, description: 'Elegant gold-toned cufflinks for formal wear.', sizes: ['One Size'], details: ['Gold-toned finish', 'Enamel inlay', 'Flip-lock closure', 'Presentation box', 'Engravable surface'] },
    { id: 28, name: 'Leather Wallet', category: 'accessories', condition: 'new', price: '₦18,000', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop', badge: 'Best Seller', rating: 4.6, ratingCount: 112, description: 'Slim bifold wallet in pebbled leather.', sizes: ['One Size'], details: ['Pebbled calf leather', '6 card slots', '2 bill compartments', 'RFID blocking', 'Gift boxed'] },
    { id: 29, name: 'Aviator Sunglasses', category: 'accessories', condition: 'new', price: '₦20,000', image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=600&fit=crop', badge: 'Premium', rating: 4.5, ratingCount: 67, description: 'Classic aviator sunglasses with UV protection.', sizes: ['One Size'], details: ['Metal frame', 'Polarized lenses', 'UV400 protection', 'Adjustable nose pads', 'Includes case'] },
    { id: 30, name: 'Leather Watch - Brown Strap', category: 'accessories', condition: 'new', price: '₦45,000', image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&h=600&fit=crop', badge: 'Premium', rating: 4.8, ratingCount: 56, description: 'Elegant timepiece with genuine leather strap.', sizes: ['One Size'], details: ['Japanese quartz movement', 'Genuine leather strap', 'Mineral crystal', 'Water resistant', '2-year warranty'] },
    // --- BAGS & UNISEX (id: 31-35) ---
    { id: 31, name: 'Designer Tote Bag', category: 'bags', condition: 'new', price: '₦55,000', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop', badge: 'Best Seller', rating: 4.7, ratingCount: 156, description: 'Spacious yet elegant tote bag in pebbled leather.', sizes: ['One Size'], details: ['Pebbled leather exterior', 'Gold-toned hardware', 'Detachable shoulder strap', 'Interior zip pocket', 'Magnetic snap closure'] },
    { id: 32, name: 'Canvas Messenger Bag', category: 'bags', condition: 'new', price: '₦25,000', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop', badge: 'Trending', rating: 4.4, ratingCount: 78, description: 'Everyday messenger bag in durable canvas.', sizes: ['One Size'], details: ['Waxed canvas', 'Genuine leather trim', 'Adjustable strap', 'Laptop compartment', 'Brass hardware'] },
    { id: 33, name: 'Leather Backpack', category: 'bags', condition: 'new', price: '₦35,000', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop', badge: 'Premium', rating: 4.6, ratingCount: 45, description: 'Sophisticated leather backpack for work and travel.', sizes: ['One Size'], details: ['Full-grain leather', 'Padded laptop sleeve', 'Organizer pockets', 'Breathable back panel', 'USB charging port'] },
    { id: 34, name: 'Travel Duffle Bag', category: 'bags', condition: 'new', price: '₦30,000', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop', badge: 'Travel', rating: 4.5, ratingCount: 34, description: 'Spacious duffle bag for weekend getaways.', sizes: ['One Size'], details: ['Water-resistant nylon', 'Removable shoulder strap', 'Shoe compartment', 'Interior pockets', 'Lockable zippers'] },
    { id: 35, name: 'Classic Tote - Unisex', category: 'bags', condition: 'new', price: '₦20,000', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop', badge: 'Unisex', rating: 4.4, ratingCount: 67, description: 'Minimalist tote bag suitable for everyone.', sizes: ['One Size'], details: ['Heavy cotton canvas', 'Reinforced handles', 'Interior pocket', 'Folds flat', 'Available in 3 colors'] }
  ];
}

// ============================================
// FALLBACK PREOWNED PRODUCT DATA - 10 items
// ============================================
function getFallbackPreowned() {
  return [
    { id: 101, name: 'Preowned Hugo Boss Blazer', category: 'corporate', condition: 'preowned', price: '₦28,000', originalPrice: '₦120,000', image: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=600&h=600&fit=crop', badge: 'Grade A', rating: 4.7, ratingCount: 34, description: 'Premium preowned Hugo Boss blazer in excellent condition.', sizes: ['M','L','XL'], details: ['Grade A condition', 'Professionally cleaned', 'Original buttons intact', '7-day return guarantee', 'Save over 75%'] },
    { id: 102, name: 'Preowned Gucci Casual Shirt', category: 'casual', condition: 'preowned', price: '₦18,000', originalPrice: '₦65,000', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=600&fit=crop', badge: 'Luxury', rating: 4.6, ratingCount: 28, description: 'Authentic Gucci casual shirt in premium condition.', sizes: ['M','L','XL'], details: ['Authentic Gucci', 'Grade A condition', 'Signature print', 'Pearl buttons', 'Save 72%'] },
    { id: 103, name: 'Preowned Nike Sport Joggers', category: 'sportswear', condition: 'preowned', price: '₦8,000', originalPrice: '₦25,000', image: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&h=600&fit=crop', badge: 'Grade A', rating: 4.5, ratingCount: 42, description: 'Authentic Nike joggers in excellent condition.', sizes: ['S','M','L','XL'], details: ['Authentic Nike', 'Dri-FIT technology', 'Elastic waistband', 'Minimal wear', 'Save 68%'] },
    { id: 104, name: 'Preowned Levis 501 Jeans', category: 'jeans', condition: 'preowned', price: '₦10,000', originalPrice: '₦35,000', image: 'https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=600&h=600&fit=crop', badge: 'Best Value', rating: 4.9, ratingCount: 67, description: 'Authentic vintage Levis 501 jeans broken in to perfection.', sizes: ['S','M','L'], details: ['Authentic vintage Levis 501', 'Perfectly broken in', 'Sturdy condition', 'Classic straight leg', 'Save 71%'] },
    { id: 105, name: 'Preowned Ralph Lauren Hoodie', category: 'hoodies', condition: 'preowned', price: '₦12,000', originalPrice: '₦40,000', image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=600&fit=crop', badge: 'Grade A', rating: 4.8, ratingCount: 47, description: 'Authentic Ralph Lauren hoodie with embroidered logo.', sizes: ['M','L','XL'], details: ['Authentic Ralph Lauren', 'Embroidered pony logo', 'Cotton fleece', 'Excellent condition', 'Save 70%'] },
    { id: 106, name: 'Preowned Tommy Hilfiger Hoodie', category: 'hoodies', condition: 'preowned', price: '₦10,000', originalPrice: '₦35,000', image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=600&fit=crop', badge: 'Best Value', rating: 4.6, ratingCount: 38, description: 'Authentic Tommy Hilfiger hoodie in great shape.', sizes: ['S','M','L','XL'], details: ['Authentic Tommy Hilfiger', 'Flag logo embroidery', 'Cotton-poly blend', 'Pulled condition 8/10', 'Save 71%'] },
    { id: 107, name: 'Preowned Adidas Sneakers', category: 'caps', condition: 'preowned', price: '₦15,000', originalPrice: '₦50,000', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop', badge: 'Grade A', rating: 4.7, ratingCount: 53, description: 'Authentic Adidas originals sneakers in well-maintained condition.', sizes: ['41','42','43','44'], details: ['Authentic Adidas', 'Sole condition 8/10', 'Disinfected & deodorized', 'Original laces', 'Save 70%'] },
    { id: 108, name: 'Preowned Ray-Ban Sunglasses', category: 'accessories', condition: 'preowned', price: '₦15,000', originalPrice: '₦55,000', image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=600&fit=crop', badge: 'Luxury', rating: 4.6, ratingCount: 31, description: 'Authentic Ray-Ban aviators in great condition.', sizes: ['One Size'], details: ['Authentic Ray-Ban', 'Green G-15 lenses', 'Gold frame', 'Minimal scratches', 'Includes case'] },
    { id: 109, name: 'Preowned Michael Kors Bag', category: 'bags', condition: 'preowned', price: '₦22,000', originalPrice: '₦80,000', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop', badge: 'Luxury', rating: 4.7, ratingCount: 38, description: 'Designer Michael Kors tote in excellent preowned condition.', sizes: ['One Size'], details: ['Authentic Michael Kors', 'Gold hardware intact', 'Interior lining clean', 'Minimal corner wear', 'Save 72%'] },
    { id: 110, name: 'Preowned Lacoste Polo', category: 'casual', condition: 'preowned', price: '₦8,000', originalPrice: '₦30,000', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=600&fit=crop', badge: 'Grade A', rating: 4.7, ratingCount: 56, description: 'Classic Lacoste polo shirt in excellent preowned condition.', sizes: ['S','M','L','XL'], details: ['Authentic Lacoste', 'Embroidered crocodile', 'Cotton pique', 'Collar intact', 'Save 73%'] }
  ];
}

// ============================================
// RATINGS / REVIEWS DATA
// ============================================
const reviews = [
  { name: 'Chioma O.', product: 'Executive Pro Fit Shirt', rating: 5, text: 'Absolutely love the quality! My husband looks so distinguished in his new corporate shirts.' },
  { name: 'Emeka N.', product: 'Slim Fit Dark Denim', rating: 5, text: "Best jeans I've ever owned! The stretch denim is incredibly comfortable." },
  { name: 'Adebayo K.', product: 'Classic Pullover Hoodie', rating: 4, text: 'Great quality hoodie. The fleece interior is so soft and warm.' },
  { name: 'Temidayo A.', product: 'Premium Leather Sneakers', rating: 5, text: 'These sneakers are a game changer! I get compliments everywhere I go.' },
  { name: 'Zainab B.', product: 'Designer Tote Bag', rating: 5, text: 'My new favorite bag! The pebbled leather is gorgeous.' },
  { name: 'Oluwaseun T.', product: 'Corporate Grey Suit Pant', rating: 4, text: 'Excellent tailoring and the fabric feels premium.' }
];

// ============================================
// TESTIMONIALS DATA
// ============================================
const testimonials = [
  { name: 'Dr. Kemi Ogunlesi', role: 'CEO, Ogunlesi Holdings', text: 'Corid Lifestyle has completely transformed our corporate image. We outfitted our entire team and the quality is unmatched.' },
  { name: 'Michael Adewale', role: 'Fashion Blogger, StyleNG', text: "I've reviewed many fashion brands, but Corid Lifestyle stands out. The gold-to-blue branding is inspired." },
  { name: 'Blessing Eze', role: 'Event Planner, Luxe Events', text: 'We partnered with Corid for a corporate event and the experience was seamless from ordering to delivery.' }
];

// ============================================
// STATE
// ============================================
const state = {
  currentCategory: 'all',
  visibleCount: 8,
  productsPerLoad: 8,
  preownedCategory: 'all',
  preownedVisibleCount: 8,
  cart: [],
  currentProduct: null,
  selectedSize: 'M',
  currentRating: 0
};

// ============================================
// DOM ELEMENTS
// ============================================
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const els = {
  header: $('#header'), nav: $('#nav'), navMobile: $('#navMobile'), navOverlay: $('#navOverlay'), menuToggle: $('#menuToggle'),
  productGrid: $('#productGrid'), categoryTabs: $('#categoryTabs'), loadMoreBtn: $('#loadMoreBtn'),
  preownedGrid: $('#preownedGrid'), preownedTabs: $('#preownedTabs'), preownedLoadMore: $('#preownedLoadMore'),
  modalOverlay: $('#productModal'), modalClose: $('#modalClose'), modalImage: $('#modalImage'),
  modalCategory: $('#modalCategory'), modalTitle: $('#modalTitle'), modalPrice: $('#modalPrice'),
  modalDescription: $('#modalDescription'), modalDetails: $('#modalDetails'),
  sizeSelector: $('#sizeSelector'), starRating: $('#starRating'), ratingFeedback: $('#ratingFeedback'),
  addToCartBtn: $('#addToCartBtn'), inquireBtn: $('#inquireBtn'),
  ratingsGrid: $('#ratingsGrid'), testimonialsGrid: $('#testimonialsGrid'),
  bulkForm: $('#bulkOrderForm'), scrollTop: $('#scrollTop'), toastContainer: $('#toastContainer'), cursorGlow: $('#cursorGlow')
};

// ============================================
// RENDER PRODUCTS
// ============================================
function renderProducts() {
  if (!els.productGrid) return;
  const filtered = state.currentCategory === 'all' ? products : products.filter(p => p.category === state.currentCategory);
  const visible = filtered.slice(0, state.visibleCount);

  if (visible.length === 0) {
    els.productGrid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:4rem 2rem;"><i class="fas fa-box-open" style="font-size:3rem;color:var(--gold);opacity:0.5;margin-bottom:1rem;"></i><h3 style="font-family:var(--font-primary);color:var(--blue-deep);margin-bottom:0.5rem;">No items in this category</h3><p style="color:var(--text-light);">Check back soon for new arrivals!</p></div>`;
    if (els.loadMoreBtn) els.loadMoreBtn.style.display = 'none';
    return;
  }

  els.productGrid.innerHTML = visible.map((product, index) => `
    <div class="product-card" data-id="${product.id}" data-condition="new" style="animation-delay:${index * 0.1}s">
      <div class="product-card-image-wrap">
        <img class="product-card-image" src="${product.image}" alt="${product.name}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
        <div class="product-img-fallback" style="display:none;width:100%;height:320px;background:linear-gradient(135deg,var(--cream),var(--ivory));align-items:center;justify-content:center;font-size:3rem;color:var(--gold);"><i class="fas fa-tshirt"></i></div>
        ${product.badge ? `<span class="product-card-badge">${product.badge}</span>` : ''}
        <span class="product-card-badge" style="right:1rem;left:auto;background:var(--blue-gradient);">Brand New</span>
        <button class="product-card-wishlist" data-id="${product.id}" aria-label="Add to wishlist"><i class="far fa-heart"></i></button>
      </div>
      <div class="product-card-body">
        <div class="product-card-category">${getCategoryLabel(product.category)}</div>
        <h3 class="product-card-title">${product.name}</h3>
        <span class="product-card-price">${product.price}</span>
        <div class="product-card-rating">${renderStars(product.rating)}<span class="rating-count">(${product.ratingCount || 0})</span></div>
        <div class="product-card-actions">
          <button class="btn btn-primary btn-sm quick-view" data-id="${product.id}" data-condition="new"><i class="fas fa-eye"></i> Quick View</button>
          <button class="btn btn-outline btn-sm add-order" data-id="${product.id}" data-condition="new"><i class="fas fa-shopping-bag"></i></button>
        </div>
      </div>
    </div>
  `).join('');

  if (els.loadMoreBtn) els.loadMoreBtn.style.display = visible.length < filtered.length ? 'inline-flex' : 'none';
}

// ============================================
// RENDER PREOWNED
// ============================================
function renderPreowned() {
  if (!els.preownedGrid) return;
  const filtered = state.preownedCategory === 'all' ? preownedProducts : preownedProducts.filter(p => p.category === state.preownedCategory);
  const visible = filtered.slice(0, state.preownedVisibleCount);

  if (visible.length === 0) {
    els.preownedGrid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:4rem 2rem;"><i class="fas fa-box-open" style="font-size:3rem;color:var(--gold);opacity:0.5;margin-bottom:1rem;"></i><h3 style="font-family:var(--font-primary);color:var(--blue-deep);margin-bottom:0.5rem;">No preowned items in this category</h3><p style="color:var(--text-light);">Check back soon!</p></div>`;
    if (els.preownedLoadMore) els.preownedLoadMore.style.display = 'none';
    return;
  }

  els.preownedGrid.innerHTML = visible.map((product, index) => `
    <div class="product-card" data-id="${product.id}" data-condition="preowned" style="animation-delay:${index * 0.1}s">
      <div class="product-card-image-wrap">
        <img class="product-card-image" src="${product.image}" alt="${product.name}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
        <div class="product-img-fallback" style="display:none;width:100%;height:320px;background:linear-gradient(135deg,var(--cream),var(--ivory));align-items:center;justify-content:center;font-size:3rem;color:var(--gold);"><i class="fas fa-tag"></i></div>
        ${product.badge ? `<span class="product-card-badge">${product.badge}</span>` : ''}
        <span class="product-card-badge" style="right:1rem;left:auto;background:var(--gold-gradient);">Preowned</span>
        <button class="product-card-wishlist" data-id="${product.id}" aria-label="Add to wishlist"><i class="far fa-heart"></i></button>
      </div>
      <div class="product-card-body">
        <div class="product-card-category">${getCategoryLabel(product.category)}</div>
        <h3 class="product-card-title">${product.name}</h3>
        <div style="display:flex;align-items:center;gap:0.75rem;">
          <span class="product-card-price">${product.price}</span>
          ${product.originalPrice ? `<span style="font-size:0.8rem;color:#aaa;text-decoration:line-through;">${product.originalPrice}</span>` : ''}
        </div>
        <div class="product-card-rating">${renderStars(product.rating)}<span class="rating-count">(${product.ratingCount || 0})</span></div>
        <div class="product-card-actions">
          <button class="btn btn-primary btn-sm quick-view" data-id="${product.id}" data-condition="preowned"><i class="fas fa-eye"></i> Quick View</button>
          <button class="btn btn-outline btn-sm add-order" data-id="${product.id}" data-condition="preowned"><i class="fas fa-shopping-bag"></i></button>
        </div>
      </div>
    </div>
  `).join('');

  if (els.preownedLoadMore) els.preownedLoadMore.style.display = visible.length < filtered.length ? 'inline-flex' : 'none';
}

// ============================================
// HELPERS
// ============================================
function getCategoryLabel(cat) {
  const labels = { corporate: 'Corporate', casual: 'Casual Shirts', jeans: 'Jeans & Trousers', sportswear: 'Sportswear', hoodies: 'Sweatshirts & Hoodies', caps: 'Caps & Shoes', accessories: 'Accessories', bags: 'Bags & Unisex' };
  return labels[cat] || cat;
}

function renderStars(rating) {
  const num = Math.max(0, Math.min(5, Number(rating) || 5));
  const full = Math.floor(num);
  const half = num % 1 >= 0.5;
  const empty = Math.max(0, 5 - full - (half ? 1 : 0));
  return `${'<span class="star filled">★</span>'.repeat(full)}${half ? '<span class="star half">★</span>' : ''}${'<span class="star">★</span>'.repeat(empty)}`;
}

function getProductById(id, condition) {
  return condition === 'preowned' ? preownedProducts.find(p => p.id === id) : products.find(p => p.id === id);
}

// ============================================
// RENDER REVIEWS & TESTIMONIALS
// ============================================
function renderReviews() {
  if (!els.ratingsGrid) return;
  els.ratingsGrid.innerHTML = reviews.map(r => `
    <div class="rating-card">
      <div class="rating-card-header">
        <div class="rating-card-avatar">${r.name.charAt(0)}</div>
        <div><div class="rating-card-name">${r.name}</div><div class="rating-card-product">on ${r.product}</div></div>
      </div>
      <div class="rating-card-stars">${'<span class="star filled">★</span>'.repeat(r.rating)}${'<span class="star">★</span>'.repeat(5 - r.rating)}</div>
      <p class="rating-card-text">"${r.text}"</p>
    </div>
  `).join('');
}

function renderTestimonials() {
  if (!els.testimonialsGrid) return;
  els.testimonialsGrid.innerHTML = testimonials.map(t => `
    <div class="testimonial-card">
      <p class="testimonial-text">"${t.text}"</p>
      <div class="testimonial-author">
        <div class="testimonial-avatar">${t.name.charAt(0)}</div>
        <div><div class="testimonial-name">${t.name}</div><div class="testimonial-role">${t.role}</div></div>
      </div>
    </div>
  `).join('');
}

// ============================================
// PRODUCT MODAL
// ============================================
function openModal(productId, condition) {
  if (!els.modalOverlay || !els.modalImage || !els.modalTitle) return;
  const product = condition === 'preowned' ? preownedProducts.find(p => p.id === productId) : products.find(p => p.id === productId);
  if (!product) return;
  state.currentProduct = product;
  state.selectedSize = 'M';
  state.currentRating = 0;

  els.modalImage.src = product.image;
  els.modalImage.alt = product.name;
  els.modalImage.onerror = function() { this.style.display = 'none'; };
  if (els.modalCategory) els.modalCategory.textContent = (condition === 'preowned' ? 'Preowned - ' : 'Brand New - ') + getCategoryLabel(product.category);
  if (els.modalTitle) els.modalTitle.textContent = product.name;
  if (els.modalPrice) els.modalPrice.innerHTML = product.originalPrice ? `${product.price} <span style="font-size:1rem;color:#aaa;text-decoration:line-through;font-weight:400;">${product.originalPrice}</span>` : product.price;
  if (els.modalDescription) els.modalDescription.textContent = product.description;
  if (els.modalDetails) els.modalDetails.innerHTML = (product.details || []).map(d => `<li>${d}</li>`).join('');

  if (els.sizeSelector) els.sizeSelector.querySelectorAll('.size-option').forEach(el => el.classList.toggle('selected', el.dataset.size === 'M'));
  if (els.starRating) els.starRating.querySelectorAll('input').forEach(input => input.checked = false);
  if (els.ratingFeedback) els.ratingFeedback.textContent = '';
  els.modalOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  if (!els.modalOverlay) return;
  els.modalOverlay.classList.remove('active');
  document.body.style.overflow = '';
}

// ============================================
// TOAST
// ============================================
function showToast(message, type = 'success') {
  if (!els.toastContainer) return;
  const icons = { success: '✓', error: '✕', info: 'ℹ' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type] || 'ℹ'}</span> ${message}`;
  els.toastContainer.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateY(20px)'; setTimeout(() => toast.remove(), 300); }, 3000);
}

// ============================================
// CART
// ============================================
function updateCartBadge() {
  document.querySelectorAll('.cart-badge').forEach(badge => {
    const count = state.cart.length;
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  });
}

function openCart() {
  const drawer = document.getElementById('cartDrawer');
  const overlay = document.getElementById('cartOverlay');
  if (!drawer || !overlay) return;
  drawer.classList.add('open');
  overlay.classList.add('active');
  renderCartItems();
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  const drawer = document.getElementById('cartDrawer');
  const overlay = document.getElementById('cartOverlay');
  if (!drawer || !overlay) return;
  drawer.classList.remove('open');
  overlay.classList.remove('active');
  document.body.style.overflow = '';
}

function renderCartItems() {
  const container = document.getElementById('cartItems');
  const footer = document.getElementById('cartFooter');
  const totalCount = document.getElementById('cartTotalCount');
  if (!container || !footer || !totalCount) return;

  if (state.cart.length === 0) {
    container.innerHTML = `<div class="cart-empty"><i class="fas fa-shopping-bag" style="font-size:3rem;color:var(--gold);opacity:0.3;margin-bottom:1rem;"></i><p>Your order list is empty</p><p style="font-size:0.8rem;color:var(--text-light);margin-top:0.25rem;">Browse our catalog to add items</p></div>`;
    footer.style.display = 'none';
    return;
  }

  container.innerHTML = state.cart.map((item, idx) => `
    <div class="cart-item">
      <img class="cart-item-image" src="${item.image}" alt="${item.name}" loading="lazy">
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-meta">Size: ${item.selectedSize} | Qty: ${item.quantity} | ${item.condition === 'preowned' ? 'Preowned' : 'Brand New'}</div>
        <div class="cart-item-price">${item.price}</div>
      </div>
      <button class="cart-item-remove" data-index="${idx}" aria-label="Remove item"><i class="fas fa-times"></i></button>
    </div>
  `).join('');

  container.querySelectorAll('.cart-item-remove').forEach(btn => {
    btn.addEventListener('click', () => { const idx = parseInt(btn.dataset.index); state.cart.splice(idx, 1); updateCartBadge(); renderCartItems(); if (state.cart.length === 0) closeCart(); });
  });

  footer.style.display = 'block';
  totalCount.textContent = state.cart.length + ' item' + (state.cart.length > 1 ? 's' : '');
}

// ============================================
// EVENT HANDLERS
// ============================================
els.categoryTabs?.addEventListener('click', (e) => {
  const tab = e.target.closest('.category-tab');
  if (!tab) return;
  els.categoryTabs.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
  tab.classList.add('active');
  state.currentCategory = tab.dataset.category;
  state.visibleCount = state.productsPerLoad;
  renderProducts();
  const menuSec = document.getElementById('menu');
  if (menuSec) menuSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

els.loadMoreBtn?.addEventListener('click', () => {
  state.visibleCount += state.productsPerLoad;
  renderProducts();
});

els.preownedTabs?.addEventListener('click', (e) => {
  const tab = e.target.closest('.category-tab');
  if (!tab) return;
  els.preownedTabs.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
  tab.classList.add('active');
  state.preownedCategory = tab.dataset.preownedCat;
  state.preownedVisibleCount = 8;
  renderPreowned();
});

els.preownedLoadMore?.addEventListener('click', () => {
  state.preownedVisibleCount += 8;
  renderPreowned();
});

// Product card clicks (both grids)
document.addEventListener('click', (e) => {
  const quickView = e.target.closest('.quick-view');
  const addOrder = e.target.closest('.add-order');
  const wishlist = e.target.closest('.product-card-wishlist');
  const card = e.target.closest('.product-card');
  const grid = e.target.closest('#productGrid, #preownedGrid');

  if (!grid && !card) return;

  if (quickView) { e.preventDefault(); openModal(parseInt(quickView.dataset.id), quickView.dataset.condition); }
  else if (addOrder) {
    e.preventDefault();
    const id = parseInt(addOrder.dataset.id);
    const condition = addOrder.dataset.condition || 'new';
    const pool = condition === 'preowned' ? preownedProducts : products;
    const product = pool.find(p => p.id === id);
    if (product) { state.cart.push({ ...product, selectedSize: 'M', quantity: 1, condition }); updateCartBadge(); showToast(`${product.name} added to order!`, 'success'); }
  } else if (wishlist) {
    e.preventDefault();
    wishlist.classList.toggle('active');
    wishlist.querySelector('i').className = wishlist.classList.contains('active') ? 'fas fa-heart' : 'far fa-heart';
    showToast(wishlist.classList.contains('active') ? 'Added to wishlist!' : 'Removed from wishlist', 'info');
  } else if (card && !e.target.closest('.product-card-actions')) {
    const id = parseInt(card.dataset.id);
    const condition = card.dataset.condition || 'new';
    if (id) openModal(id, condition);
  }
});

// Modal events
els.modalClose?.addEventListener('click', closeModal);
els.modalOverlay?.addEventListener('click', (e) => { if (e.target === els.modalOverlay) closeModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

els.sizeSelector?.addEventListener('click', (e) => {
  const opt = e.target.closest('.size-option');
  if (!opt) return;
  els.sizeSelector.querySelectorAll('.size-option').forEach(el => el.classList.remove('selected'));
  opt.classList.add('selected');
  state.selectedSize = opt.dataset.size;
});

els.starRating?.addEventListener('change', (e) => {
  if (e.target.name === 'rating') {
    state.currentRating = parseInt(e.target.value);
    const labels = { 5: 'Excellent!', 4: 'Great!', 3: 'Good', 2: 'Fair', 1: 'Poor' };
    if (els.ratingFeedback) els.ratingFeedback.textContent = `You rated this ${state.currentRating} star${state.currentRating > 1 ? 's' : ''} — ${labels[state.currentRating]}`;
    showToast('Thank you for rating!', 'success');
  }
});

els.addToCartBtn?.addEventListener('click', () => {
  if (state.currentProduct) {
    state.cart.push({ ...state.currentProduct, selectedSize: state.selectedSize, quantity: 1, condition: state.currentProduct.condition || 'new' });
    updateCartBadge();
    showToast(`${state.currentProduct.name} (${state.selectedSize}) added to order!`, 'success');
    closeModal();
  }
});

els.inquireBtn?.addEventListener('click', () => {
  if (state.currentProduct) {
    const name = encodeURIComponent(state.currentProduct.name);
    const msg = encodeURIComponent(`Hello Corid Lifestyle! I'm interested in "${state.currentProduct.name}" (Size: ${state.selectedSize}). Please provide more information.`);
    window.open(`mailto:contact@coridlifestyle.fashion.ng?subject=Inquiry: ${name}&body=${msg}`, '_blank');
    showToast('Inquiry email opened!', 'info');
  }
});

// ============================================
// BULK ORDER FORM — Save to Supabase
// ============================================
if (els.bulkForm) {
els.bulkForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(els.bulkForm);
  const data = {
    full_name: formData.get('fullName'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    company: formData.get('company') || '',
    category: formData.get('itemCategory'),
    quantity: parseInt(formData.get('quantity')),
    details: formData.get('details') || ''
  };

  if (!data.full_name || !data.email || !data.phone || !data.category || !data.quantity) {
    showToast('Please fill in all required fields', 'error'); return;
  }
  if (data.quantity < 5) { showToast('Minimum bulk order is 5 pieces', 'error'); return; }

  // Save to Supabase
  if (typeof InquiriesAPI !== 'undefined') {
    const { error } = await InquiriesAPI.create(data);
    if (error) console.warn('Failed to save inquiry to DB:', error);
  }

  showToast(`Thank you, ${data.full_name}! We've received your bulk order request and will contact you within 24 hours.`, 'success');
  els.bulkForm.reset();

  const subject = encodeURIComponent(`Bulk Order Request from ${data.full_name}`);
  const body = encodeURIComponent(`Bulk Order Request\n\nName: ${data.full_name}\nEmail: ${data.email}\nPhone: ${data.phone}\nCompany: ${data.company || 'N/A'}\nCategory: ${data.category}\nQuantity: ${data.quantity}\nDetails: ${data.details || 'N/A'}\n\nSent from Corid Lifestyle NG website`);
  window.open(`mailto:contact@coridlifestyle.fashion.ng?subject=${subject}&body=${body}`, '_blank');
});
}

// ============================================
// LOCAL ORDER BACKUP (when Supabase is offline)
// ============================================
function saveOrderLocal(orderData) {
  try {
    const stored = JSON.parse(localStorage.getItem('corid_orders') || '[]');
    stored.push({ ...orderData, _savedAt: new Date().toISOString() });
    localStorage.setItem('corid_orders', JSON.stringify(stored));
    return true;
  } catch (e) {
    return false;
  }
}

// ============================================
// CART CHECKOUT — Save to Supabase + Local Backup
// ============================================
document.getElementById('cartLink')?.addEventListener('click', (e) => { e.preventDefault(); openCart(); });
document.getElementById('cartLinkMobile')?.addEventListener('click', (e) => { e.preventDefault(); openCart(); });
document.getElementById('cartClose')?.addEventListener('click', closeCart);
document.getElementById('cartOverlay')?.addEventListener('click', (e) => { if (e.target === document.getElementById('cartOverlay')) closeCart(); });

document.getElementById('cartCheckoutBtn')?.addEventListener('click', async () => {
  if (state.cart.length > 0) {
    let dbSaved = false;
    const orderData = {
      customer_name: 'Website Guest',
      customer_email: 'order@coridlifestyle.fashion.ng',
      customer_phone: '',
      items: state.cart.map(i => ({ name: i.name, size: i.selectedSize, price: i.price, condition: i.condition })),
      total_items: state.cart.length,
      order_type: 'cart'
    };

    // Save to Supabase
    if (typeof OrdersAPI !== 'undefined') {
      try {
        const { error } = await OrdersAPI.create(orderData);
        if (error) {
          console.warn('Failed to save order to DB:', error);
          showToast('Order saved offline! We will sync when connection restores.', 'info');
        } else {
          dbSaved = true;
        }
      } catch (e) {
        console.warn('Supabase unavailable, saving locally:', e);
        showToast('Order saved offline! We will sync when connection restores.', 'info');
      }
    }

    // Always save to localStorage as backup (with source tracking)
    saveOrderLocal({ ...orderData, _source: dbSaved ? 'Supabase' : 'Local' });

    const items = state.cart.map(i => `${i.name} (${i.selectedSize}) - ${i.price} [${i.condition === 'preowned' ? 'Preowned' : 'New'}]`).join('\n');
    const subject = encodeURIComponent('New Order Request from Website');
    const body = encodeURIComponent(`Order Items:\n\n${items}\n\nTotal Items: ${state.cart.length}\n\nSent from Corid Lifestyle NG`);
    window.open(`mailto:contact@coridlifestyle.fashion.ng?subject=${subject}&body=${body}`, '_blank');
    
    if (dbSaved) {
      showToast('Order saved and synced! We will contact you shortly.', 'success');
    }
    
    state.cart = [];
    updateCartBadge();
    renderCartItems();
    closeCart();
  }
});

// ============================================
// HEADER, SCROLL, MOBILE
// ============================================
window.addEventListener('scroll', () => {
  if (els.header) els.header.classList.toggle('scrolled', window.scrollY > 80);
  if (els.scrollTop) els.scrollTop.classList.toggle('visible', window.scrollY > 500);
});
if (els.scrollTop) els.scrollTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// Mobile menu toggle — uses .nav-mobile (outside header) for correct z-index
if (els.menuToggle) {
  els.menuToggle.addEventListener('click', () => {
    els.menuToggle.classList.toggle('active');
    if (els.navMobile) els.navMobile.classList.toggle('open');
    if (els.navOverlay) els.navOverlay.classList.toggle('active');
    els.menuToggle.setAttribute('aria-expanded', els.navMobile ? els.navMobile.classList.contains('open') : false);
    document.body.style.overflow = els.navMobile?.classList.contains('open') ? 'hidden' : '';
  });
}

if (els.navOverlay) {
  els.navOverlay.addEventListener('click', () => {
    if (els.menuToggle) els.menuToggle.classList.remove('active');
    if (els.navMobile) els.navMobile.classList.remove('open');
    els.navOverlay.classList.remove('active');
    if (els.menuToggle) els.menuToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
}

// Close mobile nav when a link is clicked
if (els.navMobile) {
  els.navMobile.addEventListener('click', (e) => {
    if (e.target.closest('.nav-link')) {
      if (els.menuToggle) els.menuToggle.classList.remove('active');
      els.navMobile.classList.remove('open');
      if (els.navOverlay) els.navOverlay.classList.remove('active');
      if (els.menuToggle) els.menuToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });
}

// Cursor glow (desktop only)
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  document.addEventListener('mousemove', (e) => { if (els.cursorGlow) { els.cursorGlow.style.left = e.clientX + 'px'; els.cursorGlow.style.top = e.clientY + 'px'; } });
} else if (els.cursorGlow) { els.cursorGlow.style.display = 'none'; }

// Footer category links
document.querySelectorAll('.footer-links a[data-category]').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const cat = link.dataset.category;
    if (!els.categoryTabs) return;
    const tab = els.categoryTabs.querySelector(`[data-category="${cat}"]`);
    if (tab) {
      els.categoryTabs.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      state.currentCategory = cat;
      state.visibleCount = state.productsPerLoad;
      renderProducts();
      const menuSec = document.getElementById('menu');
      if (menuSec) menuSec.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// ============================================
// LOAD SETTINGS FROM ADMIN
// ============================================
function loadStoreSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem('corid_settings') || '{}');
    if (!saved.storeName) return;

    // Update logo text
    const logoMain = document.querySelector('.logo-main');
    if (logoMain && saved.storeName) logoMain.textContent = saved.storeName;

    // Update footer contact info
    if (saved.storePhone) {
      document.querySelectorAll('.footer-contact-item .fa-phone').forEach((icon, i) => {
        const phones = saved.storePhone.split(',');
        if (phones[i]) icon.parentElement.querySelector('span:last-child').textContent = phones[i].trim();
      });
    }
    if (saved.storeEmail) {
      const el = document.querySelector('.footer-contact-item .fa-envelope');
      if (el) el.parentElement.querySelector('span:last-child').textContent = saved.storeEmail;
    }
    if (saved.storeAddress) {
      const el = document.querySelector('.footer-contact-item .fa-map-marker-alt');
      if (el) el.parentElement.querySelector('span:last-child').textContent = saved.storeAddress;
    }

    // Apply branding colors
    if (saved.primaryColor && saved.secondaryColor) {
      document.documentElement.style.setProperty('--gold', saved.primaryColor);
      document.documentElement.style.setProperty('--blue-deep', saved.secondaryColor);
    }
    console.log('✅ Store settings loaded from admin');
  } catch (e) { /* ignore */ }
}

loadStoreSettings();

// ============================================
// INITIALIZE — Load from Supabase then render
// ============================================
renderReviews();
renderTestimonials();

// Load products from Supabase API (falls back to hardcoded data)
loadProductsFromAPI();

if (window.location.hash) {
  setTimeout(() => {
    const target = document.querySelector(window.location.hash);
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  }, 500);
}
