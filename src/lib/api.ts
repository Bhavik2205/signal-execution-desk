// src/lib/api.ts
// Axios instance with automatic token handling and refresh

import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';
import { getAccessToken, getRefreshToken, setTokens, clearTokens, isTokenExpired, storeUser } from './auth';
import type { User } from './auth';

interface AxiosRequestConfigWithRetry extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Flag to prevent multiple simultaneous refresh requests
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function onRefreshed(token: string): void {
  refreshSubscribers.forEach(cb => cb(token));
  refreshSubscribers = [];
}

function addRefreshSubscriber(cb: (token: string) => void): void {
  refreshSubscribers.push(cb);
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor: Add Authorization header
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && !isTokenExpired(token)) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Add request ID if needed
    config.headers['X-Request-ID'] = crypto.randomUUID?.() || Date.now().toString();
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle 401 by refreshing token
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfigWithRetry | undefined;
    
    // If not 401 or request already retried, reject
    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Mark as retried to prevent infinite loop
    originalRequest._retry = true;

    // If already refreshing, queue this request
    if (isRefreshing) {
      return new Promise((resolve) => {
        addRefreshSubscriber((token: string) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(apiClient(originalRequest));
        });
      });
    }

    isRefreshing = true;
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      clearTokens();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh`, {
        refreshToken,
      });
      
      const { accessToken, refreshToken: newRefreshToken } = response.data.data;
      setTokens({ accessToken, refreshToken: newRefreshToken });
      
      isRefreshing = false;
      onRefreshed(accessToken);
      
      // Retry original request
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return apiClient(originalRequest);
      
    } catch (refreshError) {
      clearTokens();
      window.location.href = '/login';
      isRefreshing = false;
      return Promise.reject(refreshError);
    }
  }
);

// ── Auth API helpers ─────────────────────────────────────────────────────────

interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export async function signupApi(email: string, password: string, userName: string): Promise<AuthResponse> {
  const res = await apiClient.post('/auth/signup', { email, password, userName });
  const data: AuthResponse = res.data.data;
  setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
  storeUser(data.user);
  return data;
}

export async function loginApi(email: string, password: string): Promise<AuthResponse> {
  const res = await apiClient.post('/auth/login', { email, password });
  const data: AuthResponse = res.data.data;
  setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
  storeUser(data.user);
  return data;
}

export async function logoutApi(): Promise<void> {
  const refreshToken = getRefreshToken();
  if (refreshToken) {
    try { await apiClient.post('/auth/logout', { refreshToken }); } catch { /* ignore */ }
  }
  clearTokens();
}

export async function getMeApi(): Promise<User> {
  const res = await apiClient.get('/me');
  return res.data.data;
}

export async function patchMeApi(userName: string): Promise<User> {
  const res = await apiClient.patch('/me', { userName });
  return res.data.data;
}

// Helper functions for common API calls
export async function apiGet<T>(url: string): Promise<T> {
  const response = await apiClient.get(url);
  return response.data.data;
}

export async function apiPost<T>(url: string, data?: any): Promise<T> {
  const response = await apiClient.post(url, data);
  return response.data.data;
}

export async function apiPut<T>(url: string, data?: any): Promise<T> {
  const response = await apiClient.put(url, data);
  return response.data.data;
}

export async function apiPatch<T>(url: string, data?: any): Promise<T> {
  const response = await apiClient.patch(url, data);
  return response.data.data;
}

export async function apiDelete<T>(url: string): Promise<T> {
  const response = await apiClient.delete(url);
  return response.data.data;
}