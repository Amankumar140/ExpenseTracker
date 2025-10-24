import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
  }
};

// Initialize token from localStorage
const token = localStorage.getItem('token');
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Response interceptor for handling auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      setAuthToken(null);
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const signup = async (name, email, password) => {
  const response = await api.post('/auth/signup', { name, email, password });
  if (response.data.token) {
    setAuthToken(response.data.token);
  }
  return response.data;
};

export const signin = async (email, password) => {
  const response = await api.post('/auth/signin', { email, password });
  if (response.data.token) {
    setAuthToken(response.data.token);
  }
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const logout = () => {
  setAuthToken(null);
};

// Upload receipt
export const uploadReceipt = async (file, onProgress) => {
  const formData = new FormData();
  formData.append('receipt', file);

  const response = await api.post('/expenses/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      if (onProgress) onProgress(percentCompleted);
    },
  });

  return response.data;
};

// Get all expenses
export const getExpenses = async (filters = {}) => {
  const response = await api.get('/expenses', { params: filters });
  return response.data;
};

// Get single expense
export const getExpense = async (id) => {
  const response = await api.get(`/expenses/${id}`);
  return response.data;
};

// Update expense
export const updateExpense = async (id, data) => {
  const response = await api.put(`/expenses/${id}`, data);
  return response.data;
};

// Delete expense
export const deleteExpense = async (id) => {
  const response = await api.delete(`/expenses/${id}`);
  return response.data;
};

// Get analytics
export const getAnalytics = async (params = {}) => {
  const response = await api.get('/expenses/analytics/summary', { params });
  return response.data;
};

// Export to CSV
export const exportToCSV = async (params = {}) => {
  const response = await api.get('/expenses/export/csv', {
    params,
    responseType: 'blob',
  });
  
  // Create download link
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  const yearSuffix = params.year && params.year !== 'all' ? `-${params.year}` : '';
  link.setAttribute('download', `expenses${yearSuffix}-${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export default api;
