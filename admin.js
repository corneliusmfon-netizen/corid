/* ============================================
   CORID LIFESTYLE NG - Admin JavaScript
   ============================================ */

// ============================================
// DATA STORES (populated from Supabase)
// ============================================
let inventoryProducts = [];
let adminOrdersData = [];
let adminCustomersData = [];
let adminReviewsData = [];
let adminInquiriesData = [];
let dataSource = 'loading'; // 'supabase' | 'local' | 'fallback'

// ============================================
// DOM REFS
// ============================================
const $admin = (sel) => document.querySelector(sel);
const $$admin = (sel) => document.querySelectorAll(sel);

// ============================================
// NAVIGATION
// ============================================
function switchPage(pageName) {
  $$admin('.page-content').forEach(p => p.classList.remove('active'));
  const target = $admin(`#page-${pageName}`);
  if (target) target.classList.add('active');
  $$admin('.sidebar-link').forEach(l => l.classList.remove('active'));
  const activeLink = $admin(`.sidebar-link[data-page="${pageName}"]`);
  if (activeLink) activeLink.classList.add('active');
  const titles = { dashboard: 'Dashboard', inventory: 'Inventory Management', orders: 'Orders', customers: 'Customers', reviews: 'Reviews', analytics: 'Analytics', settings: 'Settings' };
  const titleEl = $admin('#pageTitle');
  if (titleEl) titleEl.textContent = titles[pageName] || pageName;
  closeSidebar();
}

function toggleSidebar() { 
  $admin('#sidebar')?.classList.toggle('open'); 
  $admin('#sidebarOverlay')?.classList.toggle('active'); 
}
function closeSidebar() { 
  $admin('#sidebar')?.classList.remove('open'); 
  $admin('#sidebarOverlay')?.classList.remove('active'); 
}

// ============================================
// ADMIN PRODUCT MODAL (Add / Edit)
// ============================================
let editingProductId = null;

function openProductModal(product = null) {
  editingProductId = product ? product.id : null;
  $admin('#adminModalOverlay')?.classList.add('active');
  if ($admin('#adminModalTitle')) $admin('#adminModalTitle').textContent = product ? 'Edit Product' : 'Add New Product';
  if ($admin('#modalProdName')) $admin('#modalProdName').value = product ? product.name : '';
  if ($admin('#modalProdCategory')) $admin('#modalProdCategory').value = product ? product.category : 'corporate';
  // Handle price: could be string '₦45,000' or number 45000
  let priceVal = '';
  if (product && product.price) {
    priceVal = typeof product.price === 'string' 
      ? product.price.replace(/[₦,]/g, '') 
      : String(product.price);
  }
  if ($admin('#modalProdPrice')) $admin('#modalProdPrice').value = priceVal;
  if ($admin('#modalProdImage')) $admin('#modalProdImage').value = product ? product.image : '';
  if ($admin('#modalProdBadge')) $admin('#modalProdBadge').value = product ? (product.badge || '') : '';
  if ($admin('#modalProdDesc')) $admin('#modalProdDesc').value = product ? (product.description || '') : '';
  if ($admin('#modalProdCondition')) $admin('#modalProdCondition').value = product ? (product.condition || 'New') : 'New';
  if ($admin('#modalProdSizes')) $admin('#modalProdSizes').value = product ? (Array.isArray(product.sizes) ? product.sizes.join(', ') : '') : '';
  if ($admin('#modalProdDetails')) $admin('#modalProdDetails').value = product ? (Array.isArray(product.details) ? product.details.join(', ') : '') : '';
  document.body.style.overflow = 'hidden';
}

function closeProductModal() {
  $admin('#adminModalOverlay')?.classList.remove('active');
  document.body.style.overflow = '';
  editingProductId = null;
}

async function handleProductSubmit(e) {
  e.preventDefault();
  
  // Show loading state on submit button
  const submitBtn = e.target.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
  }

  const name = document.getElementById('modalProdName')?.value?.trim();
  const priceRaw = document.getElementById('modalProdPrice')?.value?.trim();
  
  if (!name || !priceRaw) {
    showToast('Please fill in at least the product name and price', 'error');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-save"></i> Save Product';
    }
    return;
  }

  // Sanitize inputs
  function sanitize(str) {
    return str.replace(/[<>&"]/g, c => ({ '<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;' })[c]);
  }

  const productData = {
    name: sanitize(name),
    category: document.getElementById('modalProdCategory')?.value || 'corporate',
    price: '₦' + sanitize(priceRaw),
    image: document.getElementById('modalProdImage')?.value?.trim() || 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop',
    badge: sanitize(document.getElementById('modalProdBadge')?.value?.trim() || ''),
    description: sanitize(document.getElementById('modalProdDesc')?.value?.trim() || ''),
    sizes: (document.getElementById('modalProdSizes')?.value || '').split(',').map(s => sanitize(s.trim())).filter(Boolean),
    details: (document.getElementById('modalProdDetails')?.value || '').split(',').map(d => sanitize(d.trim())).filter(Boolean)
  };

  const condition = document.getElementById('modalProdCondition')?.value || 'New';
  const isPreowned = condition === 'Preowned';

  // Capture ID before closeProductModal nullifies it
  const wasEditing = !!editingProductId;
  const editId = editingProductId;

  closeProductModal();

  // Generate a single ID for new products (used for both local and API)
  let pendingNewId = null;
  if (!wasEditing) {
    pendingNewId = String(Date.now() % 100000);
  }

  // === OPTIMISTIC LOCAL UPDATE ===
  if (wasEditing) {
    // Update existing product in local array immediately
    const idx = inventoryProducts.findIndex(p => String(p.id) === String(editId));
    if (idx !== -1) {
      inventoryProducts[idx] = { ...inventoryProducts[idx], ...productData, condition };
    }
  } else {
    // Add new product to local array immediately
    inventoryProducts.push({
      id: pendingNewId, ...productData, condition,
      originalPrice: isPreowned ? '' : undefined,
      rating: 4.5, ratingCount: 0
    });
  }
  renderAll();
  showToast(wasEditing ? 'Product updated!' : 'Product added!');

  // === BEST-EFFORT API SYNC (silent, doesn't block UI) ===
  try {
    if (wasEditing) {
      if (isPreowned) {
        await PreownedAPI.update(editId, productData);
      } else {
        await ProductsAPI.update(editId, productData);
      }
    } else {
      if (isPreowned) {
        await PreownedAPI.create({ id: pendingNewId, ...productData, originalPrice: '', rating: 4.5, ratingCount: 0 });
      } else {
        await ProductsAPI.create({ id: pendingNewId, ...productData, rating: 4.5, ratingCount: 0 });
      }
    }
  } catch (e) {
    console.warn('Failed to sync to DB (changes saved locally):', e);
  }

  // Re-enable button (in case modal was re-opened)
  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fas fa-save"></i> Save Product';
  }
}

// ============================================
// SETTINGS — Save to localStorage
// ============================================
function saveSettings() {
  const sett = {
    storeName: document.querySelector('#page-settings .settings-section:first-child input[type="text"]')?.value || 'Corid Lifestyle NG',
    storeEmail: document.querySelector('#page-settings .settings-section:first-child input[type="email"]')?.value || '',
    storePhone: document.querySelector('#page-settings .settings-section:first-child input[type="tel"]')?.value || '',
    storeAddress: document.querySelector('#page-settings .settings-section:first-child textarea')?.value || '',
    primaryColor: document.querySelectorAll('#page-settings .settings-section')[1]?.querySelectorAll('input')[0]?.value || '#C9A13B',
    secondaryColor: document.querySelectorAll('#page-settings .settings-section')[1]?.querySelectorAll('input')[1]?.value || '#0A1F3F',
    currency: document.querySelectorAll('#page-settings .settings-section')[1]?.querySelectorAll('input')[2]?.value || '₦'
  };
  localStorage.setItem('corid_settings', JSON.stringify(sett));
  showToast('✅ Settings saved! Refresh the store page to see changes.');
}

function showToast(msg, type = 'success') {
  const colors = {
    success: '#0F2A4A',
    error: '#c0392b',
    warning: '#a8822f',
    info: '#2980b9'
  };
  const toast = document.createElement('div');
  toast.style.cssText = `position:fixed;bottom:2rem;left:50%;transform:translateX(-50%);background:${colors[type] || colors.success};color:white;padding:0.75rem 1.5rem;border-radius:8px;font-size:0.85rem;z-index:3000;animation:fadeIn 0.3s;box-shadow:0 4px 12px rgba(0,0,0,0.2);display:flex;align-items:center;gap:0.5rem;max-width:90vw;`;
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity 0.3s'; setTimeout(() => toast.remove(), 300); }, 3000);
}

// ============================================
// CONFIRM DIALOG (custom, non-blocking)
// ============================================
function showConfirmDialog(message, onConfirm, onCancel) {
  // Remove any existing confirm dialog
  const existing = document.querySelector('.admin-confirm-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.className = 'admin-confirm-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(10,31,63,0.5);backdrop-filter:blur(4px);z-index:5000;display:flex;align-items:center;justify-content:center;padding:1rem;animation:fadeIn 0.2s ease;';
  
  const dialog = document.createElement('div');
  dialog.style.cssText = 'background:white;border-radius:16px;padding:2rem;max-width:400px;width:100%;box-shadow:0 16px 48px rgba(10,31,63,0.2);animation:scaleIn 0.3s ease;';
  
  dialog.innerHTML = `
    <h3 style="font-family:'Playfair Display',Georgia,serif;font-size:1.1rem;color:#0F2A4A;margin-bottom:0.75rem;">Confirm Action</h3>
    <p style="color:#666;font-size:0.9rem;line-height:1.6;margin-bottom:1.5rem;">${message}</p>
    <div style="display:flex;gap:0.75rem;">
      <button class="admin-btn admin-btn-outline" id="confirmCancel" style="flex:1;justify-content:center;">Cancel</button>
      <button class="admin-btn admin-btn-danger" id="confirmOk" style="flex:1;justify-content:center;"><i class="fas fa-trash"></i> Delete</button>
    </div>
  `;
  
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);
  
  document.getElementById('confirmCancel').addEventListener('click', () => {
    overlay.remove();
    if (onCancel) onCancel();
  });
  
  document.getElementById('confirmOk').addEventListener('click', () => {
    overlay.remove();
    if (onConfirm) onConfirm();
  });
  
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.remove();
      if (onCancel) onCancel();
    }
  });
  
  // Keyboard support
  document.addEventListener('keydown', function handler(e) {
    if (e.key === 'Escape') {
      overlay.remove();
      document.removeEventListener('keydown', handler);
      if (onCancel) onCancel();
    }
  });
}

// ============================================
// LOAD LOCAL ORDERS (localStorage backup)
// ============================================
function loadLocalOrders() {
  try {
    const stored = JSON.parse(localStorage.getItem('corid_orders') || '[]');
    if (stored.length > 0) {
      adminOrdersData = stored.map(o => ({
        id: o._savedAt?.substring(0, 10) || 'local',
        customer: o.customer_name || 'Guest',
        email: o.customer_email || '',
        items: o.total_items || (o.items?.length || 0),
        total: '—',
        status: o._source === 'Supabase' ? 'synced' : 'local',
        date: o._savedAt?.substring(0, 10) || '',
        _source: o._source || 'Local'
      }));
      dataSource = 'local';
      return true;
    }
  } catch (e) { /* ignore */ }
  return false;
}

// ============================================
// LOAD DATA FROM SUPABASE
// ============================================
async function loadAdminData() {
  try {
    if (typeof ProductsAPI === 'undefined') { useFallbackData(); renderAll(); return; }

    const [prodRes, preRes, ordRes, custRes, revRes, inqRes] = await Promise.all([
      ProductsAPI.getAll(), PreownedAPI.getAll(), OrdersAPI.getAll(),
      CustomersAPI.getAll(), ReviewsAPI.getAll(), InquiriesAPI.getAll()
    ]);

    dataSource = 'supabase';

    if (prodRes.data) inventoryProducts = prodRes.data.map(p => ({ ...p, condition: 'New' }));
    if (preRes.data) inventoryProducts = [...inventoryProducts, ...preRes.data.map(p => ({ ...p, condition: 'Preowned' }))];
    
    if (ordRes.data) adminOrdersData = ordRes.data.map(o => ({
      id: String(o.id || '').substring(0, 8),
      customer: o.customerName || o.customer_name || 'Guest',
      email: o.customerEmail || o.customer_email || '',
      items: o.totalItems || o.total_items || 0,
      total: o.totalPrice || o.total_price || '—',
      status: o.status || 'pending',
      date: (o.createdAt || o.created_at || '').substring(0, 10)
    }));
    
    if (custRes.data) adminCustomersData = custRes.data.map(c => ({
      name: c.name || c.customer_name || 'N/A',
      email: c.email || '',
      phone: c.phone || '',
      orders: c.totalOrders || c.total_orders || 0,
      total: c.totalSpent || c.total_spent || '₦0',
      joined: (c.joinedAt || c.joined_at || '').substring(0, 7)
    }));
    
    if (revRes.data) adminReviewsData = revRes.data.map(r => ({
      id: r.id,
      customer: r.customerName || r.customer_name || 'Anonymous',
      product: r.productName || r.product_name || 'General',
      rating: r.rating || 5,
      review: r.reviewText || r.review_text || '',
      status: r.status || 'pending',
      date: (r.createdAt || r.created_at || '').substring(0, 10)
    }));

    // Inquiries (bulk orders) - now in the same Promise.all
    if (inqRes.data) adminInquiriesData = inqRes.data.map(i => ({
      id: String(i.id || '').substring(0, 8),
      customer: i.fullName || i.full_name || 'Guest',
      email: i.email || '',
      phone: i.phone || '',
      company: i.company || '',
      category: i.category || '',
      quantity: i.quantity || 0,
      status: i.status || 'pending',
      date: (i.createdAt || i.created_at || '').substring(0, 10)
    }));

  } catch (err) {
    console.warn('Admin: Supabase unavailable, checking local backups...', err);
    if (!loadLocalOrders()) {
      useFallbackData();
    }
  }
  renderAll();
}

function useFallbackData() {
  dataSource = 'fallback';
  inventoryProducts = [
    // === BRAND NEW ===
    { id: 1, name: 'Executive Pro Fit Shirt', category: 'corporate', price: '₦45,000', condition: 'New', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop' },
    { id: 2, name: 'Signature Navy Blazer', category: 'corporate', price: '₦120,000', condition: 'New', image: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=400&h=400&fit=crop' },
    { id: 3, name: 'Classic White Oxford Shirt', category: 'corporate', price: '₦38,000', condition: 'New', image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=400&fit=crop' },
    { id: 4, name: 'Executive Navy Suit Set', category: 'corporate', price: '₦250,000', condition: 'New', image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=400&fit=crop' },
    { id: 5, name: 'Grey Herringbone Blazer', category: 'corporate', price: '₦95,000', condition: 'New', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop' },
    { id: 6, name: 'Linen Casual Shirt - Sand', category: 'casual', price: '₦25,000', condition: 'New', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop' },
    { id: 7, name: 'Denim Casual Shirt', category: 'casual', price: '₦30,000', condition: 'New', image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop' },
    { id: 8, name: 'Cotton Poplin Casual Shirt', category: 'casual', price: '₦22,000', condition: 'New', image: 'https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=400&h=400&fit=crop' },
    { id: 9, name: 'Slim Fit Dark Denim', category: 'jeans', price: '₦45,000', condition: 'New', image: 'https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=400&h=400&fit=crop' },
    { id: 10, name: 'Classic Blue Straight Jeans', category: 'jeans', price: '₦35,000', condition: 'New', image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&h=400&fit=crop' },
    { id: 11, name: 'Corporate Chino Trousers', category: 'jeans', price: '₦28,000', condition: 'New', image: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=400&h=400&fit=crop' },
    { id: 12, name: 'Navy Dress Trousers', category: 'jeans', price: '₦32,000', condition: 'New', image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&h=400&fit=crop' },
    { id: 13, name: 'Performance Track Jacket', category: 'sportswear', price: '₦20,000', condition: 'New', image: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=400&h=400&fit=crop' },
    { id: 14, name: 'Jogger Sweatpants', category: 'sportswear', price: '₦15,000', condition: 'New', image: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=400&h=400&fit=crop' },
    { id: 15, name: 'Dry-Fit Training Tee', category: 'sportswear', price: '₦10,000', condition: 'New', image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop' },
    { id: 16, name: 'Performance Shorts', category: 'sportswear', price: '₦12,000', condition: 'New', image: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=400&h=400&fit=crop' },
    { id: 17, name: 'Classic Pullover Hoodie', category: 'hoodies', price: '₦35,000', condition: 'New', image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop' },
    { id: 18, name: 'Premium Zip Hoodie', category: 'hoodies', price: '₦30,000', condition: 'New', image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop' },
    { id: 19, name: 'Essential Sweatshirt', category: 'hoodies', price: '₦18,000', condition: 'New', image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop' },
    { id: 20, name: 'Classic Leather Derby Shoes', category: 'caps', price: '₦65,000', condition: 'New', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop' },
    { id: 21, name: 'Snapback Cap', category: 'caps', price: '₦8,000', condition: 'New', image: 'https://images.unsplash.com/photo-1556306535-0f09c5376f3e?w=400&h=400&fit=crop' },
    { id: 22, name: 'Premium Leather Sneakers', category: 'caps', price: '₦85,000', condition: 'New', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop' },
    { id: 23, name: 'Corporate Oxford Shoes', category: 'caps', price: '₦55,000', condition: 'New', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop' },
    { id: 24, name: 'Slides - Comfort Fit', category: 'caps', price: '₦12,000', condition: 'New', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop' },
    { id: 25, name: 'Leather Belt - Brown', category: 'accessories', price: '₦22,000', condition: 'New', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop' },
    { id: 26, name: 'Silk Tie Collection', category: 'accessories', price: '₦15,000', condition: 'New', image: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=400&h=400&fit=crop' },
    { id: 27, name: 'Cufflink Set - Gold', category: 'accessories', price: '₦12,000', condition: 'New', image: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=400&h=400&fit=crop' },
    { id: 28, name: 'Leather Wallet', category: 'accessories', price: '₦18,000', condition: 'New', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop' },
    { id: 29, name: 'Aviator Sunglasses', category: 'accessories', price: '₦20,000', condition: 'New', image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop' },
    { id: 30, name: 'Leather Watch - Brown Strap', category: 'accessories', price: '₦45,000', condition: 'New', image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=400&fit=crop' },
    { id: 31, name: 'Designer Tote Bag', category: 'bags', price: '₦55,000', condition: 'New', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=400&fit=crop' },
    { id: 32, name: 'Canvas Messenger Bag', category: 'bags', price: '₦25,000', condition: 'New', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=400&fit=crop' },
    { id: 33, name: 'Leather Backpack', category: 'bags', price: '₦35,000', condition: 'New', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop' },
    { id: 34, name: 'Travel Duffle Bag', category: 'bags', price: '₦30,000', condition: 'New', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop' },
    { id: 35, name: 'Classic Tote - Unisex', category: 'bags', price: '₦20,000', condition: 'New', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=400&fit=crop' },
    // === PREOWNED ===
    { id: 101, name: 'Preowned Hugo Boss Blazer', category: 'corporate', price: '₦28,000', condition: 'Preowned', image: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=400&h=400&fit=crop' },
    { id: 102, name: 'Preowned Gucci Casual Shirt', category: 'casual', price: '₦18,000', condition: 'Preowned', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop' },
    { id: 103, name: 'Preowned Nike Sport Joggers', category: 'sportswear', price: '₦8,000', condition: 'Preowned', image: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=400&h=400&fit=crop' },
    { id: 104, name: 'Preowned Levis 501 Jeans', category: 'jeans', price: '₦10,000', condition: 'Preowned', image: 'https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=400&h=400&fit=crop' },
    { id: 105, name: 'Preowned Ralph Lauren Hoodie', category: 'hoodies', price: '₦12,000', condition: 'Preowned', image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop' },
    { id: 106, name: 'Preowned Tommy Hilfiger Hoodie', category: 'hoodies', price: '₦10,000', condition: 'Preowned', image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop' },
    { id: 107, name: 'Preowned Adidas Sneakers', category: 'caps', price: '₦15,000', condition: 'Preowned', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop' },
    { id: 108, name: 'Preowned Ray-Ban Sunglasses', category: 'accessories', price: '₦15,000', condition: 'Preowned', image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop' },
    { id: 109, name: 'Preowned Michael Kors Bag', category: 'bags', price: '₦22,000', condition: 'Preowned', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=400&fit=crop' },
    { id: 110, name: 'Preowned Lacoste Polo', category: 'casual', price: '₦8,000', condition: 'Preowned', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop' }
  ];
  adminOrdersData = [];
  adminCustomersData = [];
  adminReviewsData = [];
  adminInquiriesData = [];
}

function renderAll() { renderDashboard(); renderInventory(); renderOrders(); renderCustomers(); renderReviews(); renderAnalytics(); }

// ============================================
// RENDER DASHBOARD
// ============================================
function renderDashboard() {
  const statsGrid = $admin('#statsGrid');
  if (!statsGrid) return;

  const sourceLabel = dataSource === 'supabase' ? '🟢 Live — Synced to Cloud' 
    : dataSource === 'local' ? '🟡 Offline — Showing local backups' 
    : '🔴 Fallback — No connection';
  const sourceClass = dataSource === 'supabase' ? 'up' : dataSource === 'local' ? '' : 'down';

  statsGrid.innerHTML = `
    <div class="stat-card"><div class="stat-icon gold"><i class="fas fa-warehouse"></i></div><div class="stat-info"><h3>${inventoryProducts.length}</h3><p>Total Products</p><span class="stat-change ${sourceClass}">${sourceLabel}</span></div></div>
    <div class="stat-card"><div class="stat-icon blue"><i class="fas fa-shopping-bag"></i></div><div class="stat-info"><h3>${adminOrdersData.length + adminInquiriesData.length}</h3><p>Orders + Inquiries</p><span class="stat-change up">${adminOrdersData.length} orders + ${adminInquiriesData.length} inquiries</span></div></div>
    <div class="stat-card"><div class="stat-icon green"><i class="fas fa-file-invoice"></i></div><div class="stat-info"><h3>${adminInquiriesData.length}</h3><p>Bulk Inquiries</p><span class="stat-change up">From bulk order form</span></div></div>
    <div class="stat-card"><div class="stat-icon red"><i class="fas fa-star"></i></div><div class="stat-info"><h3>4.8★</h3><p>Avg. Rating</p><span class="stat-change up">Customer feedback</span></div></div>`;

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const salesData = [42, 58, 35, 72, 91, 64, 48];
  const maxSale = Math.max(...salesData);
  const salesChart = $admin('#salesChart');
  if (salesChart) {
    salesChart.innerHTML = days.map((d, i) => `<div class="chart-bar-item"><div class="chart-bar-value" style="height:${Math.max(10, (salesData[i]/maxSale)*100)}%"></div><span class="chart-bar-label">${d}</span></div>`).join('');
  }

  const categoryChart = $admin('#categoryChart');
  if (categoryChart) {
    const categories = [{ name: 'Corporate', pct: 35 }, { name: 'Casual', pct: 20 }, { name: 'Jeans', pct: 18 }, { name: 'Sportswear', pct: 12 }, { name: 'Accessories', pct: 15 }];
    categoryChart.innerHTML = categories.map(c => `<div><div style="display:flex;justify-content:space-between;font-size:0.8rem;margin-bottom:0.3rem;"><span style="color:#555;">${c.name}</span><span style="font-weight:600;color:var(--admin-blue);">${c.pct}%</span></div><div style="height:8px;background:#f0ebe4;border-radius:4px;overflow:hidden;"><div style="height:100%;width:${c.pct}%;background:linear-gradient(90deg,#C9A13B,#E8C547);border-radius:4px;"></div></div></div>`).join('');
  }

  const recentOrdersTable = $admin('#recentOrdersTable');
  if (recentOrdersTable) {
    const recent = adminOrdersData.slice(0, 5);
    recentOrdersTable.innerHTML = recent.length 
      ? recent.map(o => `<tr><td style="font-weight:600;color:var(--admin-gold);">${o.id}</td><td>${o.customer}</td><td>${o.items} item${o.items !== 1 ? 's' : ''}</td><td style="font-weight:600;">${o.total}</td><td><span class="status-badge ${o.status === 'synced' ? 'completed' : o.status}"><span class="dot"></span> ${o.status}</span></td><td style="color:#aaa;">${o.date}</td><td><button class="action-btn"><i class="fas fa-ellipsis-v"></i></button></td></tr>`).join('') 
      : '<tr><td colspan="7" style="text-align:center;color:#888;padding:2rem;">No orders yet</td></tr>';
  }

  // Show connection status banner
  const banner = $admin('#connectionBanner');
  if (banner) {
    if (dataSource === 'local') {
      banner.innerHTML = '<div style="background:#FFF3CD;border:1px solid #FFEAA7;border-radius:8px;padding:0.75rem 1rem;margin-bottom:1.5rem;display:flex;align-items:center;gap:0.75rem;font-size:0.85rem;"><i class="fas fa-exclamation-triangle" style="color:#E6A700;"></i> Supabase not reachable. Showing <strong>locally saved orders</strong>. Data will sync when connection restores.</div>';
      banner.style.display = 'block';
    } else if (dataSource === 'fallback') {
      banner.innerHTML = '<div style="background:#FEE2E2;border:1px solid #FECACA;border-radius:8px;padding:0.75rem 1rem;margin-bottom:1.5rem;display:flex;align-items:center;gap:0.75rem;font-size:0.85rem;"><i class="fas fa-cloud-off" style="color:#DC2626;"></i> No database connection. Using <strong>sample data</strong>. <a href="https://app.supabase.com" target="_blank" style="color:#2563EB;text-decoration:underline;">Check your Supabase project</a></div>';
      banner.style.display = 'block';
    } else {
      banner.style.display = 'none';
    }
  }
}

// ============================================
// RENDER INVENTORY
// ============================================
function renderInventory() {
  const filter = $admin('#inventoryCategoryFilter')?.value || 'all';
  const search = ($admin('#inventorySearch')?.value || '').toLowerCase();
  let filtered = [...inventoryProducts];
  if (filter !== 'all') filtered = filtered.filter(p => p.category === filter);
  if (search) filtered = filtered.filter(p => p.name.toLowerCase().includes(search));

  $admin('#inventoryCount').textContent = inventoryProducts.length;

  if (filtered.length === 0) {
    $admin('#inventoryGrid').innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:3rem;"><i class="fas fa-box-open" style="font-size:3rem;color:#ddd;margin-bottom:1rem;"></i><p style="color:#888;">No products found</p></div>';
    return;
  }

  $admin('#inventoryGrid').innerHTML = filtered.map(p => `
    <div class="inventory-card">
      <img class="inventory-card-image" src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop'">
      <div class="inventory-card-body">
        <div class="inventory-card-category">${p.condition || 'New'} — ${p.category}</div>
        <div class="inventory-card-title">${p.name}</div>
        <div class="inventory-card-price">${p.price}</div>
        <div class="inventory-card-actions">
          <button class="admin-btn admin-btn-outline admin-btn-sm edit-product" data-id="${p.id}" data-condition="${p.condition || 'New'}"><i class="fas fa-edit"></i> Edit</button>
          <button class="admin-btn admin-btn-danger admin-btn-sm delete-product" data-id="${p.id}" data-condition="${p.condition || 'New'}"><i class="fas fa-trash"></i></button>
        </div>
      </div>
    </div>
  `).join('');

  // Edit handlers — compare IDs as strings to handle both number and string types
  $$admin('.edit-product').forEach(btn => {
    btn.addEventListener('click', () => {
      const idStr = btn.dataset.id;
      const product = inventoryProducts.find(p => String(p.id) === idStr);
      if (product) openProductModal(product);
    });
  });

  // Delete handlers — custom confirm dialog + optimistic local removal
  $$admin('.delete-product').forEach(btn => {
    btn.addEventListener('click', () => {
      const idStr = btn.dataset.id;
      const condition = btn.dataset.condition;
      const product = inventoryProducts.find(p => String(p.id) === idStr);
      if (!product) return;

      showConfirmDialog(
        `Are you sure you want to delete <strong>"${product.name}"</strong>? This cannot be undone.`,
        async () => {
          // === OPTIMISTIC LOCAL REMOVAL ===
          const idx = inventoryProducts.findIndex(p => String(p.id) === idStr);
          if (idx !== -1) inventoryProducts.splice(idx, 1);
          renderAll();
          showToast('Product deleted!');

          // === BEST-EFFORT API SYNC (silent) ===
          try {
            if (condition === 'Preowned') {
              await PreownedAPI.remove(idStr);
            } else {
              await ProductsAPI.remove(idStr);
            }
          } catch (e) {
            console.warn('Failed to sync delete to DB (removed locally):', e);
          }
        }
      );
    });
  });
}

// ============================================
// RENDER ORDERS
// ============================================
function renderOrders() {
  const filter = $admin('#orderStatusFilter')?.value || 'all';
  // Combine orders and inquiries
  const allItems = [
    ...adminOrdersData.map(o => ({ ...o, _type: 'Order' })),
    ...adminInquiriesData.map(i => ({ 
      id: i.id, customer: i.customer, email: i.email, 
      items: `${i.quantity} pcs`, total: i.category, 
      status: i.status, date: i.date, _type: 'Bulk Inquiry' 
    }))
  ].sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  let filtered = [...allItems];
  if (filter !== 'all') filtered = filtered.filter(o => o.status === filter);
  $admin('#ordersCount').textContent = allItems.length;

  if (filtered.length === 0) {
    $admin('#ordersList').innerHTML = '<div style="text-align:center;padding:3rem;color:#888;"><i class="fas fa-inbox" style="font-size:2rem;margin-bottom:1rem;opacity:0.5;"></i><p>No orders or inquiries yet</p></div>';
    return;
  }

  $admin('#ordersList').innerHTML = filtered.map(o => `
    <div class="order-card">
      <div class="order-card-info">
        <div class="order-card-id">${o.id}</div>
        <div class="order-card-customer">${o.customer}</div>
        <div class="order-card-items">${o.items} — ${o.email} ${o._type === 'Bulk Inquiry' ? `<span style="color:var(--admin-gold);font-size:0.75rem;font-weight:600;">[BULK]</span>` : ''}</div>
        <div class="order-card-date">${o.date}</div>
      </div>
      <div style="text-align:right;">
        <div class="order-card-total">${o._type === 'Bulk Inquiry' ? o.total : o.total}</div>
        <span class="status-badge ${o.status}" style="margin-top:0.5rem;"><span class="dot"></span> ${o.status === 'synced' ? 'Synced' : o.status}</span>
      </div>
    </div>
  `).join('');
}

// ============================================
// RENDER CUSTOMERS
// ============================================
function renderCustomers() {
  const search = ($admin('#customerSearch')?.value || '').toLowerCase();
  let filtered = [...adminCustomersData];
  if (search) filtered = filtered.filter(c => c.name.toLowerCase().includes(search) || c.email.toLowerCase().includes(search));

  $admin('#customersTable').innerHTML = filtered.length ? filtered.map(c => `
    <tr><td style="font-weight:600;">${c.name}</td><td style="color:#888;">${c.email}</td><td style="color:#888;">${c.phone}</td><td>${c.orders}</td><td style="font-weight:600;">${c.total}</td><td style="color:#888;">${c.joined}</td><td><button class="action-btn"><i class="fas fa-envelope"></i></button></td></tr>
  `).join('') : '<tr><td colspan="7" style="text-align:center;color:#888;padding:2rem;">No customer data yet</td></tr>';
}

// ============================================
// RENDER REVIEWS
// ============================================
function renderReviews() {
  $admin('#reviewsTable').innerHTML = adminReviewsData.length ? adminReviewsData.map(r => `
    <tr><td style="font-weight:600;">${r.customer}</td><td style="color:#888;">${r.product}</td>
    <td><span style="color:var(--admin-gold);">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span></td>
    <td style="color:#888;max-width:250px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">"${(r.review || '').substring(0, 60)}"</td>
    <td><span class="status-badge ${r.status === 'approved' ? 'completed' : 'pending'}"><span class="dot"></span> ${r.status}</span></td>
    <td style="color:#888;">${r.date}</td>
    <td><button class="action-btn" title="Approve"><i class="fas fa-check" style="color:#27ae60;"></i></button><button class="action-btn" title="Delete"><i class="fas fa-trash" style="color:#e74c3c;"></i></button></td></tr>
  `).join('') : '<tr><td colspan="7" style="text-align:center;color:#888;padding:2rem;">No reviews yet</td></tr>';
}

// ============================================
// RENDER ANALYTICS
// ============================================
function renderAnalytics() {
  const revenueChart = $admin('#revenueChart');
  if (!revenueChart) return;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
  const revenueData = [320, 450, 510, 680, 720, 890, 1050];
  const maxRev = Math.max(...revenueData);
  revenueChart.innerHTML = months.map((m, i) => {
    const height = Math.max(10, (revenueData[i] / maxRev) * 100);
    return `<div class="chart-bar-item"><div class="chart-bar-value" style="height:${height}%;background:linear-gradient(to top,#0A1F3F,#1A3A6B);"></div><span class="chart-bar-label">${m}</span></div>`;
  }).join('');
}

// ============================================
// UTILITY
// ============================================
function debounce(fn, delay) { let timer; return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); }; }

// ============================================
// INIT — All event listeners attached here
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  // Sidebar navigation
  $$admin('.sidebar-link[data-page]').forEach(link => {
    link.addEventListener('click', () => switchPage(link.dataset.page));
  });

  // Mobile sidebar
  $admin('#mobileToggle')?.addEventListener('click', toggleSidebar);
  $admin('#sidebarOverlay')?.addEventListener('click', closeSidebar);

  // Product modal
  $admin('#adminModalClose')?.addEventListener('click', closeProductModal);
  $admin('#adminModalCancel')?.addEventListener('click', closeProductModal);
  $admin('#adminModalOverlay')?.addEventListener('click', (e) => {
    if (e.target === $admin('#adminModalOverlay')) closeProductModal();
  });
  $admin('#adminModalForm')?.addEventListener('submit', handleProductSubmit);

  // Filters
  $admin('#inventoryCategoryFilter')?.addEventListener('change', renderInventory);
  $admin('#inventorySearch')?.addEventListener('input', debounce(renderInventory, 300));
  $admin('#orderStatusFilter')?.addEventListener('change', renderOrders);
  $admin('#customerSearch')?.addEventListener('input', debounce(renderCustomers, 300));

  // Add Product button
  $admin('#addProductBtn')?.addEventListener('click', () => openProductModal(null));

  // Settings
  $admin('#saveStoreSettings')?.addEventListener('click', saveSettings);
  $admin('#saveBrandingSettings')?.addEventListener('click', saveSettings);

  // Show skeleton loading state in inventory grid initially
  const inventoryGrid = $admin('#inventoryGrid');
  if (inventoryGrid) {
    inventoryGrid.innerHTML = Array(6).fill(null).map(() => `
      <div class="inventory-card" style="opacity:0.6;">
        <div style="width:100%;height:200px;background:linear-gradient(90deg,#f0ebe4 25%,#e8e0d8 50%,#f0ebe4 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;"></div>
        <div class="inventory-card-body">
          <div style="height:10px;width:40%;background:#f0ebe4;border-radius:4px;margin-bottom:8px;"></div>
          <div style="height:16px;width:80%;background:#f0ebe4;border-radius:4px;margin-bottom:8px;"></div>
          <div style="height:14px;width:30%;background:#f0ebe4;border-radius:4px;"></div>
        </div>
      </div>
    `).join('');
  }

  // Load data
  loadAdminData();
  console.log('📊 Corid Admin — Loading from Supabase...');

  // Add shimmer animation if not already defined
  if (!document.getElementById('adminShimmerStyle')) {
    const style = document.createElement('style');
    style.id = 'adminShimmerStyle';
    style.textContent = '@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }';
    document.head.appendChild(style);
  }
});

// Expose for inline onclick use
window.switchPage = switchPage;
