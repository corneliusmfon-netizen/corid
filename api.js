const API_BASE = '/api';

// Admin session token — set by admin.js after a successful login.
// When present, it is attached as a Bearer token to every API request.
let adminToken = null;

function setAdminToken(token) { adminToken = token || null; }
function getAdminToken() { return adminToken; }
function clearAdminToken() { adminToken = null; }

async function apiFetch(url, options = {}) {
  try {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };
    if (adminToken) headers['Authorization'] = `Bearer ${adminToken}`;

    const res = await fetch(url, { ...options, headers });

    let data = {};
    try {
      data = await res.json();
    } catch (_) { /* non-JSON response body */ }

    if (!res.ok) {
      const msg = data.detail || data.error || `Request failed (${res.status})`;
      return { error: msg, data: null, status: res.status };
    }
    return data;
  } catch (err) {
    console.warn('API call failed:', url, err.message);
    return { error: err.message, data: null, status: 0 };
  }
}

const ProductsAPI = {
  async getAll(category = 'all') {
    return apiFetch(`${API_BASE}/products?category=${category}`);
  },
  async create(productData) {
    return apiFetch(`${API_BASE}/products`, {
      method: 'POST',
      body: JSON.stringify(productData)
    });
  },
  async update(id, productData) {
    return apiFetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData)
    });
  },
  async remove(id) {
    return apiFetch(`${API_BASE}/products/${id}`, {
      method: 'DELETE'
    });
  }
};

const PreownedAPI = {
  async getAll(category = 'all') {
    return apiFetch(`${API_BASE}/preowned?category=${category}`);
  },
  async create(productData) {
    return apiFetch(`${API_BASE}/preowned`, {
      method: 'POST',
      body: JSON.stringify(productData)
    });
  },
  async update(id, productData) {
    return apiFetch(`${API_BASE}/preowned/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData)
    });
  },
  async remove(id) {
    return apiFetch(`${API_BASE}/preowned/${id}`, {
      method: 'DELETE'
    });
  }
};

const OrdersAPI = {
  async getAll() {
    return apiFetch(`${API_BASE}/orders`);
  },
  async create(orderData) {
    return apiFetch(`${API_BASE}/orders`, {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  }
};

const InquiriesAPI = {
  async getAll() {
    return apiFetch(`${API_BASE}/inquiries`);
  },
  async create(inquiryData) {
    return apiFetch(`${API_BASE}/inquiries`, {
      method: 'POST',
      body: JSON.stringify(inquiryData)
    });
  }
};

const CustomersAPI = {
  async getAll() {
    return apiFetch(`${API_BASE}/customers`);
  }
};

const ReviewsAPI = {
  async getAll() {
    return apiFetch(`${API_BASE}/reviews`);
  }
};

const AuthAPI = {
  async login(password) {
    return apiFetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      body: JSON.stringify({ password })
    });
  }
};
