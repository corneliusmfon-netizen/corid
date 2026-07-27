const API_BASE = '/api'; 

const ProductsAPI = {
  async getAll(category = 'all') {
    try {
      // This will automatically hit your Python backend on Vercel
      const res = await fetch(`${API_BASE}/products?category=${category}`);
      return await res.json();
    } catch (err) {
      console.warn('Backend unavailable:', err.message);
      return { error: err.message, data: null };
    }
  }
};