import axios from "axios";

/**
 * API Service Configuration
 * Centralized service for communicating with FastAPI backend.
 */

const API_URL =
  "https://smart-retail-api-d2edemfgc4fceeew.centralindia-01.azurewebsites.net";

// Create Axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token automatically if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global error handling
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error("API Request failed:", error);
    const message =
      error.response?.data?.detail ||
      error.message ||
      "An unknown error occurred";
    return Promise.reject(new Error(message));
  }
);

export const api = {
  // AUTH
  async login(credentials) {
    return apiClient.post("/auth/login", credentials);
  },

  async register(credentials) {
    return apiClient.post("/auth/register", credentials);
  },

  logout() {
    localStorage.removeItem("token");
    window.location.href = "/login";
  },

  // AI AGENT
  async askAgent(query) {
    return apiClient.post("/ask", { query });
  },

  // DASHBOARD
  async getDashboardMetrics() {
    return apiClient.get("/dashboard-summary");
  },

  // FORECAST
  async getForecast(params) {
    return apiClient.get("/predict", { params });
  },

  // ANOMALY
  async getAnomalies() {
    return apiClient.get("/anomaly");
  },
};