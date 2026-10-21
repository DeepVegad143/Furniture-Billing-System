import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api';

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Response Interceptor: Handle 401 Unauthorized
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// API Service Methods
export const apiService = {
  // Health / Cold-start
  checkHealth: () => api.get('/health', { timeout: 8000 }),

  // Auth
  login: credentials => api.post('/auth/login', credentials),
  demoLogin: () => api.post('/auth/demo'),
  getMe: () => api.get('/auth/me'),
  updateLanguage: language => api.put('/auth/language', { language }),

  // Settings
  getSettings: () => api.get('/settings'),
  updateSettings: data => api.put('/settings', data),

  // Catalog
  getCatalog: () => api.get('/catalog'),
  createCatalogItem: data => api.post('/catalog', data),
  updateCatalogItem: (id, data) => api.put(`/catalog/${id}`, data),
  deleteCatalogItem: id => api.delete(`/catalog/${id}`),
  reorderCatalog: itemIds => api.put('/catalog/reorder', { itemIds }),

  // Customers
  getCustomers: q => api.get('/customers', { params: { q } }),
  getCustomerById: id => api.get(`/customers/${id}`),
  createCustomer: data => api.post('/customers', data),
  updateCustomer: (id, data) => api.put(`/customers/${id}`, data),
  deleteCustomer: id => api.delete(`/customers/${id}`),
  getCustomerBooks: id => api.get(`/customers/${id}/books`),
  getCustomerQuotes: id => api.get(`/customers/${id}/quotes`),

  // Books
  createBook: data => api.post('/books', data),
  getBookById: id => api.get(`/books/${id}`),
  updateBook: (id, data) => api.put(`/books/${id}`, data),
  deleteBook: id => api.delete(`/books/${id}`),
  addPayment: (id, data) => api.post(`/books/${id}/payments`, data),
  deletePayment: (id, paymentId) => api.delete(`/books/${id}/payments/${paymentId}`),

  // Rate Quotes
  createQuote: data => api.post('/quotes', data),
  getQuoteById: id => api.get(`/quotes/${id}`),

  // Dashboard
  getDashboard: () => api.get('/dashboard'),

  // Excel Export
  downloadExcel: () =>
    api.get('/export/excel', {
      responseType: 'blob',
    }),
};
