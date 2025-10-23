import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
export const getAnalytics = async () => {
  const response = await api.get('/expenses/analytics/summary');
  return response.data;
};

// Export to CSV
export const exportToCSV = async () => {
  const response = await api.get('/expenses/export/csv', {
    responseType: 'blob',
  });
  
  // Create download link
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `expenses-${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export default api;
