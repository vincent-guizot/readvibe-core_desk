import axios from 'axios';
import { ApiError } from './api-error';
import { API_URL } from '../constants/api';


export const http = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('vibedesk_token');
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
    const errorCode = data?.errorCode || 'API_ERROR';
    return Promise.reject(new ApiError(message, status, errorCode, data?.details));
  }
);

export default http;
