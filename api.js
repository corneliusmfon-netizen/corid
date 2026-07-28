const API_BASE = '/api'; 

async function apiFetch(url, options = {}) {
  try {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options
    });
    return await res.json();
  } catch (err) {
    console.warn('API call failed:', url, err.message);
    return { error: err.message, data: null };
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