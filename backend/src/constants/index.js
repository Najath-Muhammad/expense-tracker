/**
 * Application-wide constants
 * @module constants
 */

const ROUTES = Object.freeze({
  API_PREFIX: '/api/v1',
  AUTH: '/auth',
  USER: '/users',
  EXPENSE: '/expenses',
  INCOME: '/income',
  WALLET: '/wallets',
  REPORT: '/reports',
  BUDGET: '/budgets',
  GOAL: '/goals',
  ACTIVITY: '/activities',
  NOTIFICATION: '/notifications',
  EXPORT: '/export',
  WIDGET: '/widget',
  RECURRING: '/recurring',
});

const JWT = Object.freeze({
  ACCESS_EXPIRY: '15m',
  REFRESH_EXPIRY: '7d',
  RESET_PASSWORD_EXPIRY: '1h',
  EMAIL_VERIFY_EXPIRY: '24h',
  ALGORITHM: 'HS256',
  ISSUER: 'expense-tracker-api',
  AUDIENCE: 'expense-tracker-client',
});

const COOKIE = Object.freeze({
  REFRESH_TOKEN: 'refreshToken',
  ACCESS_TOKEN: 'accessToken',
  MAX_AGE_REFRESH: 7 * 24 * 60 * 60 * 1000, // 7 days
  MAX_AGE_ACCESS: 15 * 60 * 1000,            // 15 minutes
  HTTP_ONLY: true,
  SAME_SITE: 'strict',
  SECURE: process.env.NODE_ENV === 'production',
});

const PAGINATION = Object.freeze({
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  DEFAULT_SORT_BY: 'createdAt',
  DEFAULT_SORT_ORDER: 'desc',
});

const REGEX = Object.freeze({
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/,
  PHONE: /^\+?[1-9]\d{1,14}$/,
  MONGO_ID: /^[a-f\d]{24}$/i,
  INVITE_CODE: /^[A-Z0-9]{9}$/,
  USERNAME: /^[a-zA-Z0-9_]{3,30}$/,
  AMOUNT: /^\d+(\.\d{1,2})?$/,
});

const PERMISSIONS = Object.freeze({
  // Wallet permissions by role
  OWNER: ['read', 'write', 'delete', 'manage_members', 'transfer_ownership', 'delete_wallet'],
  ADMIN: ['read', 'write', 'delete', 'manage_members'],
  MEMBER: ['read', 'write'],
});

const FILE_UPLOAD = Object.freeze({
  MAX_SIZE: 5 * 1024 * 1024,  // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  AVATAR_FOLDER: 'expense-tracker/avatars',
  RECEIPT_FOLDER: 'expense-tracker/receipts',
});

const RATE_LIMIT = Object.freeze({
  WINDOW_MS: 15 * 60 * 1000,  // 15 minutes
  MAX_REQUESTS: 100,
  AUTH_MAX: 5,
  AUTH_WINDOW_MS: 15 * 60 * 1000,
});

const API_VERSION = 'v1';

const APP_NAME = 'ExpenseTracker';

const BUDGET_THRESHOLDS = Object.freeze({
  WARNING: 50,
  CRITICAL: 75,
  DANGER: 90,
  EXCEEDED: 100,
});

const INVITE_CODE_LENGTH = 9;

const CURRENCY = Object.freeze({
  DEFAULT: 'INR',
  SYMBOL: '₹',
  SUPPORTED: ['INR', 'USD', 'EUR', 'GBP', 'AED', 'SGD', 'AUD', 'CAD'],
});

const LOG_LEVELS = Object.freeze({
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  HTTP: 'http',
  DEBUG: 'debug',
});

module.exports = {
  ROUTES,
  JWT,
  COOKIE,
  PAGINATION,
  REGEX,
  PERMISSIONS,
  FILE_UPLOAD,
  RATE_LIMIT,
  API_VERSION,
  APP_NAME,
  BUDGET_THRESHOLDS,
  INVITE_CODE_LENGTH,
  CURRENCY,
  LOG_LEVELS,
};
