import axios from 'axios';
import { ApiError } from './api-error';
import { API_URL } from '../constants/api';
import { clearSession, readSession } from '../features/auth/session';


export const http = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

http.interceptors.request.use((config) => {
  const { token } = readSession();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response ? error.response.status : 500;
    const data = error.response ? error.response.data : null;
    const message = data?.message || error.message || 'Terjadi kesalahan jaringan atau server';
    if (status === 401 && !error.config?.url?.endsWith('/auth/login')) {
      clearSession();
      window.dispatchEvent(new Event('vibedesk:session-expired'));
    }
    const errorCode = data?.error?.code || data?.errorCode || 'API_ERROR';
    return Promise.reject(new ApiError(message, status, errorCode, data?.error?.details || data?.details));
  }
);

export default http;
