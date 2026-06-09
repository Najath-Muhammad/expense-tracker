export const API_VERSION = 'v1';

export const ROUTES = {
  API_PREFIX: `/api/${API_VERSION}`,
  AUTH: '/auth',
  WALLET: '/wallets',
  EXPENSE: '/expenses',
  INCOME: '/income',
  REPORT: '/reports',
  BUDGET: '/budgets',
} as const;

export const ROUTE_PATHS = {
  // Auth
  REGISTER: '/register',
  LOGIN: '/login',
  LOGOUT: '/logout',
  REFRESH_TOKEN: '/refresh-token',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  CHANGE_PASSWORD: '/change-password',
  ME: '/me',

  // Wallet
  INVITE: '/:id/invite',
  JOIN: '/join',
  MEMBERS: '/:id/members/:memberId',
  MEMBER_ROLE: '/:id/members/:memberId/role',
  TRANSFER_OWNERSHIP: '/:id/transfer-ownership',
  SET_ACTIVE: '/:id/set-active',

  // Common CRUD
  ROOT: '/',
  BY_ID: '/:id',

  // Reports
  DASHBOARD: '/dashboard',
  WIDGET: '/widget',
  MONTHLY: '/monthly',
  YEARLY: '/yearly',

  // Income specific
  BALANCE: '/balance',
  
  // Budget
  CURRENT: '/current',
} as const;

export const MESSAGES = {
  // Success Messages
  SUCCESS: 'Success',
  CREATED: 'Resource created successfully',
  UPDATED: 'Resource updated successfully',
  DELETED: 'Resource deleted successfully',
  FETCHED: 'Resource fetched successfully',
  
  // Auth Success
  REGISTER_SUCCESS: 'User registered successfully',
  LOGIN_SUCCESS: 'Logged in successfully',
  LOGOUT_SUCCESS: 'Logged out successfully',
  TOKEN_REFRESHED: 'Token refreshed successfully',
  PASSWORD_CHANGED: 'Password changed successfully',
  PASSWORD_RESET_SENT: 'Password reset link sent to email',
  PASSWORD_RESET_SUCCESS: 'Password has been reset successfully',

  // Wallet Success
  WALLET_CREATED: 'Wallet created successfully',
  WALLET_UPDATED: 'Wallet updated successfully',
  WALLET_DELETED: 'Wallet deleted successfully',
  WALLET_JOINED: 'Successfully joined wallet',
  WALLET_INVITE_GENERATED: 'Invite code generated successfully',
  WALLET_MEMBER_REMOVED: 'Member removed successfully',
  WALLET_ROLE_UPDATED: 'Member role updated successfully',
  WALLET_OWNERSHIP_TRANSFERRED: 'Ownership transferred successfully',
  WALLET_SET_ACTIVE: 'Active wallet updated successfully',

  // Expense/Income Success
  EXPENSE_ADDED: 'Expense added successfully',
  EXPENSE_UPDATED: 'Expense updated successfully',
  EXPENSE_DELETED: 'Expense deleted successfully',
  INCOME_ADDED: 'Income added successfully',
  INCOME_UPDATED: 'Income updated successfully',
  INCOME_DELETED: 'Income deleted successfully',

  // Budget Success
  BUDGET_SET: 'Budget set successfully',

  // Error Messages
  ERROR_GENERIC: 'Internal server error',
  ERROR_NOT_FOUND: 'Resource not found',
  ERROR_UNAUTHORIZED: 'Unauthorized access',
  ERROR_FORBIDDEN: 'Forbidden access',
  ERROR_BAD_REQUEST: 'Invalid request parameters',
  
  // Auth Errors
  ERROR_INVALID_CREDENTIALS: 'Email or password is incorrect',
  ERROR_EMAIL_EXISTS: 'Email is already registered',
  ERROR_USER_NOT_FOUND: 'User not found',
  ERROR_INVALID_TOKEN: 'Invalid or expired token',
  ERROR_INVALID_PASSWORD: 'Current password is incorrect',

  // Wallet Errors
  ERROR_WALLET_NOT_FOUND: 'Wallet not found',
  ERROR_NOT_WALLET_OWNER: 'Only the wallet owner can perform this action',
  ERROR_NOT_WALLET_ADMIN: 'Only wallet admins can perform this action',
  ERROR_INVALID_INVITE: 'Invalid or expired invite code',
  ERROR_ALREADY_MEMBER: 'You are already a member of this wallet',
  ERROR_CANNOT_REMOVE_OWNER: 'Cannot remove the wallet owner',

  // Generic Val
  ERROR_VALIDATION: 'Validation failed',
} as const;

export const JWT = {
  ACCESS_EXPIRES_IN: '15m',
  REFRESH_EXPIRES_IN: '7d',
  COOKIE_MAX_AGE: 7 * 24 * 60 * 60 * 1000, // 7 days
} as const;

export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/,
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

export const RATE_LIMIT = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: 1000,
  AUTH_WINDOW_MS: 15 * 60 * 1000,
  AUTH_MAX: 20,
} as const;

export const BUDGET_THRESHOLDS = {
  WARNING: 75,
  CRITICAL: 90,
  DANGER: 100,
} as const;
