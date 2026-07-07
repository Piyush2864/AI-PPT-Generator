import axios, { AxiosError } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from './tokenStorage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1';

export const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

axiosClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


let isRefreshing = false;
let pendingQueue: Array<(token: string | null) => void> = [];

const flushQueue = (token: string | null) => {
  pendingQueue.forEach((cb) => cb(token));
  pendingQueue = [];
};

axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (originalRequest.url?.includes('/auth/refresh') || originalRequest.url?.includes('/auth/login')) {
      clearTokens();
      return Promise.reject(error);
    }

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearTokens();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push((newToken) => {
          if (!newToken) return reject(error);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          resolve(axiosClient(originalRequest));
        });
      });
    }

    isRefreshing = true;
    try {
      const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
      const { accessToken, refreshToken: newRefreshToken } = data.data;
      setTokens(accessToken, newRefreshToken);
      flushQueue(accessToken);
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return axiosClient(originalRequest);
    } catch (refreshErr) {
      flushQueue(null);
      clearTokens();
      window.location.href = '/login';
      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  },
);
