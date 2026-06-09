/**
 * Application-wide enumerations
 * @module enums
 */

const StatusCode = Object.freeze({
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_ERROR: 500,
});

const ResponseMessage = Object.freeze({
  SUCCESS: 'Success',
  CREATED: 'Resource created successfully',
  UPDATED: 'Resource updated successfully',
  DELETED: 'Resource deleted successfully',
  NOT_FOUND: 'Resource not found',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
  CONFLICT: 'Resource already exists',
  VALIDATION_ERROR: 'Validation failed',
  INTERNAL_ERROR: 'Internal server error',
  BAD_REQUEST: 'Bad request',
  TOO_MANY_REQUESTS: 'Too many requests, please try again later',
});

const Role = Object.freeze({
  USER: 'user',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
});

const WalletRole = Object.freeze({
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member',
});

const WalletType = Object.freeze({
  PERSONAL: 'personal',
  FAMILY: 'family',
  FRIENDS: 'friends',
  OFFICE: 'office',
  TRAVEL: 'travel',
  SAVINGS: 'savings',
  CUSTOM: 'custom',
});

const Theme = Object.freeze({
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
});

const TransactionType = Object.freeze({
  INCOME: 'income',
  EXPENSE: 'expense',
  TRANSFER: 'transfer',
});

const ExpenseCategory = Object.freeze({
  FOOD: 'food',
  FUEL: 'fuel',
  RENT: 'rent',
  SHOPPING: 'shopping',
  BILLS: 'bills',
  ENTERTAINMENT: 'entertainment',
  TRAVEL: 'travel',
  HEALTH: 'health',
  EDUCATION: 'education',
  INVESTMENT: 'investment',
  OTHERS: 'others',
});

const IncomeSource = Object.freeze({
  SALARY: 'salary',
  FREELANCE: 'freelance',
  BUSINESS: 'business',
  INVESTMENT: 'investment',
  RENTAL: 'rental',
  GIFT: 'gift',
  BONUS: 'bonus',
  OTHERS: 'others',
});

const NotificationType = Object.freeze({
  EXPENSE_ADDED: 'expense_added',
  INCOME_ADDED: 'income_added',
  BALANCE_UPDATED: 'balance_updated',
  WALLET_JOINED: 'wallet_joined',
  WALLET_CREATED: 'wallet_created',
  BUDGET_WARNING: 'budget_warning',
  BUDGET_EXCEEDED: 'budget_exceeded',
  GOAL_REACHED: 'goal_reached',
  MEMBER_ADDED: 'member_added',
  MEMBER_REMOVED: 'member_removed',
  RECURRING_ADDED: 'recurring_added',
  TRANSFER: 'transfer',
});

const ActivityType = Object.freeze({
  EXPENSE_ADDED: 'expense_added',
  EXPENSE_UPDATED: 'expense_updated',
  EXPENSE_DELETED: 'expense_deleted',
  INCOME_ADDED: 'income_added',
  INCOME_UPDATED: 'income_updated',
  INCOME_DELETED: 'income_deleted',
  WALLET_CREATED: 'wallet_created',
  WALLET_UPDATED: 'wallet_updated',
  WALLET_DELETED: 'wallet_deleted',
  MEMBER_JOINED: 'member_joined',
  MEMBER_LEFT: 'member_left',
  MEMBER_REMOVED: 'member_removed',
  ROLE_CHANGED: 'role_changed',
  BUDGET_SET: 'budget_set',
  GOAL_CREATED: 'goal_created',
  GOAL_UPDATED: 'goal_updated',
  LOGIN: 'login',
  LOGOUT: 'logout',
  PASSWORD_CHANGED: 'password_changed',
  PROFILE_UPDATED: 'profile_updated',
});

const BudgetStatus = Object.freeze({
  SAFE: 'safe',           // < 50%
  WARNING: 'warning',     // 50%-74%
  CRITICAL: 'critical',   // 75%-89%
  DANGER: 'danger',       // 90%-99%
  EXCEEDED: 'exceeded',   // >= 100%
});

const ExportType = Object.freeze({
  CSV: 'csv',
  EXCEL: 'excel',
  PDF: 'pdf',
});

const SortOrder = Object.freeze({
  ASC: 'asc',
  DESC: 'desc',
});

const RecurringFrequency = Object.freeze({
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
});

const TokenType = Object.freeze({
  ACCESS: 'access',
  REFRESH: 'refresh',
  RESET_PASSWORD: 'reset_password',
  EMAIL_VERIFY: 'email_verify',
});

module.exports = {
  StatusCode,
  ResponseMessage,
  Role,
  WalletRole,
  WalletType,
  Theme,
  TransactionType,
  ExpenseCategory,
  IncomeSource,
  NotificationType,
  ActivityType,
  BudgetStatus,
  ExportType,
  SortOrder,
  RecurringFrequency,
  TokenType,
};
