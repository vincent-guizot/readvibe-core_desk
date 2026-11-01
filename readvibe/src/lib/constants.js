/**
 * Application Constants & Metadata for ReadVibe Client
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
};

export const EXPLORE_MOODS = [
  'All',
  'Cozy',
  'Reflective',
  'Thoughtful',
  'Hopeful',
  'Calm',
  'Bittersweet',
  'Wholesome',
  'Deep',
  'Healing',
];

export const READING_STATUSES = {
  CURRENTLY_READING: 'currently_reading',
  COMPLETED: 'completed',
  PLAN_TO_READ: 'plan_to_read',
};

export const SHARE_CARD_THEMES = [
  { id: 'sunset', name: 'Sunset Glow', bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { id: 'emerald', name: 'Emerald Calm', bg: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
  { id: 'midnight', name: 'Midnight Vibe', bg: 'linear-gradient(135deg, #09203f 0%, #537895 100%)' },
  { id: 'amber', name: 'Amber Warmth', bg: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
];
