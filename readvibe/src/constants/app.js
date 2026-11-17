/**
 * Application Level Constants & Configuration
 */

export const APP_CONFIG = {
  name: 'ReadVibe',
  version: '1.0.0',
  tagline: 'Temukan Buku Sesuai Mood & Suasana Hatimu',
  defaultPort: 3350,
  apiPort: 3360,
  defaultBaseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3360',
};

export const STORAGE_KEYS = {
  TOKEN: 'readvibe_token',
  USER: 'readvibe_user',
  STORE_PERSIST: 'readvibe_state_v1',
  REDUX_PERSIST: 'readvibe_redux_state_v1',
};
