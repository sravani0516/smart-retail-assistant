import axios from 'axios';

/**
 * API Service Configuration
 * 
 * Centralized service for communicating with the FastAPI backend.
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://smart-retail-api-d2edemfgc4fceeew.centralindia-01.azurewebsites.net';

// Create an Axios instance with standard configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests to add auth token if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor for handling errors globally (optional but good for enterprise)
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Request failed:', error);
    // Transform error to be more readable
    const message = error.response?.data?.detail || error.message || 'An unknown error occurred';
    return Promise.reject(new Error(message));
  }
);

export const api = {
  // Auth Endpoints
  async login(credentials) {
    return apiClient.post('/auth/login', credentials);
  },

  async register(credentials) {
    return apiClient.post('/auth/register', credentials);
  },

  logout() {
    localStorage.removeItem('token');
    window.location.href = '/login';
  },

  /**
   * Send a query to the Multi-Agent system
   * @param {string} query - The user's question or instruction
   * @returns {Promise<{agent: string, response: string}>}
   */
  async askAgent(query) {
    return apiClient.post('/ask', { query });
  },

  // Placeholders for future endpoints based on dashboard needs
  async getDashboardMetrics() {
    return apiClient.get('/dashboard-summary');
  },

  async getForecast(params) {
    return apiClient.get('/predict', { params });
  },

  async getAnomalies() {
    return apiClient.get('/anomaly');
  }
};
