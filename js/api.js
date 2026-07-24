/* ============================================
   CORID LIFESTYLE NG - Supabase API Wrapper
   Uses REST API directly (no build step needed)
   ============================================ */

// ⚠️ SUPABASE CONFIGURATION
// Update these with YOUR Supabase project credentials from https://supabase.com
// Go to Settings → API → Project URL & anon/public key
const SUPABASE_URL = 'https://zjareduwncregdocmdcc.supabase.co';
const SUPABASE_KEY = 'sb_publishable_jrbNF-iZe1kSmNrDmQwTdg_Wza_-vQI';
const API_BASE = `${SUPABASE_URL}/rest/v1`;

const apiHeaders = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

// ============================================
// DATA NORMALIZATION
// Converts snake_case API responses to camelCase
// for consistent usage across the app.
// Example: rating_count → ratingCount
// ============================================
function toCamelCase(str) {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

function normalizeKeys(obj) {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(normalizeKeys);
  if (typeof obj !== 'object') return obj;
  
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = toCamelCase(key);
    result[camelKey] = normalizeKeys(value);
  }
  return result;
}

// ============================================
// GENERIC CRUD HELPERS
// ============================================
async function apiRequest(method, table, options = {}) {
  const { query = '', body = null } = options;
  const url = `${API_BASE}/${table}${query}`;
  
  // Convert camelCase body keys to snake_case for Supabase REST API
  const snakeBody = body ? denormalizeKeys(body) : null;
  
  try {
    const res = await fetch(url, {
      method,
      headers: apiHeaders,
      body: snakeBody ? JSON.stringify(snakeBody) : null
    });
    
    if (!res.ok) {
      const errText = await res.text();
      console.warn(`Supabase ${method} ${table} failed:`, errText);
      return { error: errText, data: null };
    }
    
    // Handle 204 No Content
    if (res.status === 204) return { data: null, error: null };
    
    const data = await res.json();
    // Normalize all data from snake_case to camelCase
    const normalized = normalizeKeys(data);
    return { data: normalized, error: null };
  } catch (err) {
    console.warn(`Supabase ${method} ${table} error:`, err.message);
    return { error: err.message, data: null };
  }
}

function buildQuery(params = {}) {
  const parts = [];
  if (params.select) parts.push(`select=${params.select}`);
  if (params.category && params.category !== 'all') parts.push(`category=eq.${params.category}`);
  if (params.order) parts.push(`order=${params.order}`);
  if (params.range) parts.push(`offset=${params.range.start}&limit=${params.range.limit}`);
  if (params.eq) parts.push(`${params.eq.column}=eq.${params.eq.value}`);
  if (params.status) parts.push(`status=eq.${params.status}`);
  return parts.length ? `?${parts.join('&')}` : '';
}

// ============================================
// PRODUCTS API
// ============================================
const ProductsAPI = {
  async getAll(category = 'all', range = null) {
    const query = buildQuery({ select: '*', category, order: 'id.asc', range });
    return apiRequest('GET', 'products', { query });
  },
  
  async getById(id) {
    const query = `?id=eq.${id}&select=*`;
    return apiRequest('GET', 'products', { query });
  },
  
  async create(product) {
    return apiRequest('POST', 'products', { body: product });
  },
  
  async update(id, updates) {
    const query = `?id=eq.${id}`;
    return apiRequest('PATCH', 'products', { query, body: updates });
  },
  
  async remove(id) {
    const query = `?id=eq.${id}`;
    return apiRequest('DELETE', 'products', { query });
  }
};

// ============================================
// PREOWNED PRODUCTS API
// ============================================
const PreownedAPI = {
  async getAll(category = 'all', range = null) {
    const query = buildQuery({ select: '*', category, order: 'id.asc', range });
    return apiRequest('GET', 'preowned_products', { query });
  },
  
  async getById(id) {
    const query = `?id=eq.${id}&select=*`;
    return apiRequest('GET', 'preowned_products', { query });
  },
  
  async create(product) {
    return apiRequest('POST', 'preowned_products', { body: product });
  },
  
  async update(id, updates) {
    const query = `?id=eq.${id}`;
    return apiRequest('PATCH', 'preowned_products', { query, body: updates });
  },
  
  async remove(id) {
    const query = `?id=eq.${id}`;
    return apiRequest('DELETE', 'preowned_products', { query });
  }
};

// ============================================
// ORDERS API
// ============================================
const OrdersAPI = {
  async getAll(status = 'all') {
    const query = status !== 'all' ? `?status=eq.${status}&order=created_at.desc` : '?order=created_at.desc';
    return apiRequest('GET', 'orders', { query });
  },
  
  async create(order) {
    return apiRequest('POST', 'orders', { body: order });
  },
  
  async updateStatus(id, status) {
    const query = `?id=eq.${id}`;
    return apiRequest('PATCH', 'orders', { query, body: { status } });
  },
  
  async remove(id) {
    const query = `?id=eq.${id}`;
    return apiRequest('DELETE', 'orders', { query });
  }
};

// ============================================
// INQUIRIES API (Bulk Orders)
// ============================================
const InquiriesAPI = {
  async getAll() {
    return apiRequest('GET', 'inquiries', { query: '?order=created_at.desc' });
  },
  
  async create(inquiry) {
    return apiRequest('POST', 'inquiries', { body: inquiry });
  },
  
  async updateStatus(id, status) {
    const query = `?id=eq.${id}`;
    return apiRequest('PATCH', 'inquiries', { query, body: { status } });
  }
};

// ============================================
// CUSTOMERS API
// ============================================
const CustomersAPI = {
  async getAll() {
    return apiRequest('GET', 'customers', { query: '?order=joined_at.desc' });
  },
  
  async getByEmail(email) {
    const query = `?email=eq.${encodeURIComponent(email)}&select=*`;
    return apiRequest('GET', 'customers', { query });
  },
  
  async create(customer) {
    return apiRequest('POST', 'customers', { body: customer });
  }
};

// ============================================
// REVIEWS API
// ============================================
const ReviewsAPI = {
  async getAll() {
    return apiRequest('GET', 'reviews', { query: '?order=created_at.desc' });
  },
  
  async create(review) {
    return apiRequest('POST', 'reviews', { body: review });
  },
  
  async approve(id) {
    const query = `?id=eq.${id}`;
    return apiRequest('PATCH', 'reviews', { query, body: { status: 'approved' } });
  },
  
  async remove(id) {
    const query = `?id=eq.${id}`;
    return apiRequest('DELETE', 'reviews', { query });
  }
};

// ============================================
// TEST CONNECTION
// ============================================
async function testConnection() {
  try {
    const { data, error } = await ProductsAPI.getAll();
    if (error) {
      console.warn('❌ Supabase connection failed — using fallback data.');
      if (SUPABASE_KEY.startsWith('sb_publishable_')) {
        console.warn('⚠️  The current Supabase key looks like a placeholder.');
        console.warn('   To connect to a real database, update SUPABASE_URL and SUPABASE_KEY in js/api.js');
      }
      return false;
    }
    console.log(`✅ Supabase connected! Found ${data?.length || 0} products.`);
    return true;
  } catch (err) {
    console.warn('❌ Supabase connection error — using fallback data.', err.message);
    return false;
  }
}

// Run connection test on load
testConnection();
