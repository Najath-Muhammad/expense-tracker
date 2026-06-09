// ─── HTTP Status Codes ────────────────────────────────────────────────────────
export const StatusCode = {
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
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;
export type StatusCodeType = (typeof StatusCode)[keyof typeof StatusCode];

// ─── User Roles ───────────────────────────────────────────────────────────────
export const Role = {
  USER: 'user',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
} as const;
export type RoleType = (typeof Role)[keyof typeof Role];

// ─── Wallet Member Roles ──────────────────────────────────────────────────────
export const WalletRole = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member',
} as const;
export type WalletRoleType = (typeof WalletRole)[keyof typeof WalletRole];

// ─── Wallet Types ─────────────────────────────────────────────────────────────
export const WalletType = {
  PERSONAL: 'personal',
  FAMILY: 'family',
  FRIENDS: 'friends',
  OFFICE: 'office',
  TRAVEL: 'travel',
  SAVINGS: 'savings',
  CUSTOM: 'custom',
} as const;
export type WalletTypeType = (typeof WalletType)[keyof typeof WalletType];

// ─── Expense Categories ───────────────────────────────────────────────────────
export const ExpenseCategory = {
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
} as const;
export type ExpenseCategoryType = (typeof ExpenseCategory)[keyof typeof ExpenseCategory];

// ─── Income Sources ───────────────────────────────────────────────────────────
export const IncomeSource = {
  SALARY: 'salary',
  FREELANCE: 'freelance',
  BUSINESS: 'business',
  INVESTMENT: 'investment',
  RENTAL: 'rental',
  GIFT: 'gift',
  BONUS: 'bonus',
  OTHERS: 'others',
} as const;
export type IncomeSourceType = (typeof IncomeSource)[keyof typeof IncomeSource];

// ─── Budget Status ────────────────────────────────────────────────────────────
export const BudgetStatus = {
  SAFE: 'safe',
  WARNING: 'warning',
  CRITICAL: 'critical',
  DANGER: 'danger',
  EXCEEDED: 'exceeded',
} as const;
export type BudgetStatusType = (typeof BudgetStatus)[keyof typeof BudgetStatus];

// ─── Transaction Types ────────────────────────────────────────────────────────
export const TransactionType = {
  EXPENSE: 'expense',
  INCOME: 'income',
} as const;
export type TransactionTypeType = (typeof TransactionType)[keyof typeof TransactionType];

// ─── Activity Types ───────────────────────────────────────────────────────────
export const ActivityType = {
  AUTH_REGISTER: 'auth.register',
  AUTH_LOGIN: 'auth.login',
  AUTH_LOGOUT: 'auth.logout',
  AUTH_PASSWORD_RESET: 'auth.password_reset',
  WALLET_CREATED: 'wallet.created',
  WALLET_UPDATED: 'wallet.updated',
  WALLET_DELETED: 'wallet.deleted',
  WALLET_MEMBER_ADDED: 'wallet.member_added',
  WALLET_MEMBER_REMOVED: 'wallet.member_removed',
  EXPENSE_ADDED: 'expense.added',
  EXPENSE_UPDATED: 'expense.updated',
  EXPENSE_DELETED: 'expense.deleted',
  INCOME_ADDED: 'income.added',
  INCOME_UPDATED: 'income.updated',
  INCOME_DELETED: 'income.deleted',
  BUDGET_SET: 'budget.set',
  BUDGET_WARNING: 'budget.warning',
} as const;
export type ActivityTypeType = (typeof ActivityType)[keyof typeof ActivityType];

// ─── Recurring Frequency ──────────────────────────────────────────────────────
export const RecurringFrequency = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  BIWEEKLY: 'biweekly',
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  YEARLY: 'yearly',
} as const;
export type RecurringFrequencyType = (typeof RecurringFrequency)[keyof typeof RecurringFrequency];

// ─── Theme ────────────────────────────────────────────────────────────────────
export const Theme = {
  DARK: 'dark',
  LIGHT: 'light',
  SYSTEM: 'system',
} as const;
export type ThemeType = (typeof Theme)[keyof typeof Theme];
