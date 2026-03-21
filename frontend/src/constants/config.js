// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  OAUTH2_URL: import.meta.env.VITE_OAUTH2_URL || 'http://localhost:8080/oauth2/authorization',
  TIMEOUT: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
  WITH_CREDENTIALS: true,
};

// Polling intervals (in milliseconds)
export const POLLING_INTERVALS = {
  MESSAGES: 2000,
  NOTIFICATIONS: 5000,
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
};
