import { Request, Response, NextFunction } from 'express';
import { Document, Types } from 'mongoose';

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  phone?: string | null;
  avatar?: string | null;
  avatarPublicId?: string | null;
  role: string;
  theme: string;
  currency: string;
  language: string;
  isEmailVerified: boolean;
  isActive: boolean;
  lastLogin?: Date | null;
  refreshToken?: string | null;
  passwordResetToken?: string | null;
  passwordResetExpires?: Date | null;
  emailVerifyToken?: string | null;
  activeWallet?: Types.ObjectId | null;
  notificationPrefs: {
    expenseAdded: boolean;
    incomeAdded: boolean;
    budgetWarning: boolean;
    goalReached: boolean;
  };
  pushSubscriptions?: Array<{
    endpoint: string;
    keys: { p256dh: string; auth: string };
  }>;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
  toSafeObject(): SafeUser;
}

export interface SafeUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  role: string;
  theme: string;
  currency: string;
  language: string;
  isEmailVerified: boolean;
  isActive: boolean;
  lastLogin?: Date | null;
  activeWallet?: Types.ObjectId | null;
  notificationPrefs: {
    expenseAdded: boolean;
    incomeAdded: boolean;
    budgetWarning: boolean;
    goalReached: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

// ─── Extended Express Request ─────────────────────────────────────────────────

export interface AuthenticatedRequest extends Request {
  user: SafeUser & { _id: Types.ObjectId };
}

// ─── Wallet ───────────────────────────────────────────────────────────────────

export interface IWalletMember {
  user: Types.ObjectId;
  role: string;
  joinedAt: Date;
  addedBy?: Types.ObjectId | null;
}

export interface IWallet extends Document {
  _id: Types.ObjectId;
  name: string;
  type: string;
  description?: string | null;
  icon: string;
  color: string;
  owner: Types.ObjectId;
  members: IWalletMember[];
  inviteCode?: string | null;
  isShared: boolean;
  isActive: boolean;
  currency: string;
  monthlyBudget?: number | null;
  createdAt: Date;
  updatedAt: Date;
  generateInviteCode(): string;
  isMember(userId: Types.ObjectId | string): boolean;
  getMemberRole(userId: Types.ObjectId | string): string | null;
}

// ─── Expense ──────────────────────────────────────────────────────────────────

export interface IExpense extends Document {
  _id: Types.ObjectId;
  title: string;
  amount: number;
  category: string;
  description?: string | null;
  notes?: string | null;
  date: Date;
  user: Types.ObjectId;
  wallet: Types.ObjectId;
  receipt?: string | null;
  receiptPublicId?: string | null;
  isRecurring: boolean;
  recurringId?: Types.ObjectId | null;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// ─── Income ───────────────────────────────────────────────────────────────────

export interface IIncome extends Document {
  _id: Types.ObjectId;
  amount: number;
  source: string;
  title: string;
  note?: string | null;
  date: Date;
  user: Types.ObjectId;
  wallet: Types.ObjectId;
  isRecurring: boolean;
  recurringId?: Types.ObjectId | null;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// ─── Budget ───────────────────────────────────────────────────────────────────

export interface IBudget extends Document {
  _id: Types.ObjectId;
  wallet: Types.ObjectId;
  user: Types.ObjectId;
  amount: number;
  month: number;
  year: number;
  spent: number;
  status: string;
  notifiedAt50: boolean;
  notifiedAt75: boolean;
  notifiedAt90: boolean;
  notifiedAt100: boolean;
  remaining: number; // virtual
  percentage: number; // virtual
  createdAt: Date;
  updatedAt: Date;
}

// ─── Activity ─────────────────────────────────────────────────────────────────

export interface IActivity extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  wallet?: Types.ObjectId | null;
  type: string;
  message: string;
  refModel?: string | null;
  refId?: Types.ObjectId | null;
  metadata: Record<string, unknown>;
  ipAddress?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ─── DTO / Request Payloads ───────────────────────────────────────────────────

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
}

export interface LoginDTO {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface CreateWalletDTO {
  name: string;
  type?: string;
  description?: string;
  icon?: string;
  color?: string;
  currency?: string;
  monthlyBudget?: number;
}

export interface CreateExpenseDTO {
  title: string;
  amount: number;
  category: string;
  date?: Date | string;
  description?: string;
  notes?: string;
  tags?: string[];
}

export interface CreateIncomeDTO {
  title: string;
  amount: number;
  source: string;
  date?: Date | string;
  note?: string;
  tags?: string[];
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  docs: T[];
  total: number;
}

// ─── Repository Find Options ──────────────────────────────────────────────────

export interface ExpenseFilters extends PaginationOptions {
  category?: string;
  startDate?: string | Date;
  endDate?: string | Date;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
}

export interface IncomeFilters extends PaginationOptions {
  source?: string;
  startDate?: string | Date;
  endDate?: string | Date;
  search?: string;
}

// ─── Token Payloads ───────────────────────────────────────────────────────────

export interface JwtPayload {
  sub: string;
  role?: string;
  type: string;
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string | string[];
}

// ─── Aggregation Results ──────────────────────────────────────────────────────

export interface CategoryBreakdown {
  _id: string;
  total: number;
  count: number;
}

export interface MonthlyTrend {
  _id: { year: number; month: number };
  total: number;
  count: number;
}

export interface DashboardData {
  balance: number;
  totalIncome: number;
  totalExpense: number;
  todayExpense: number;
  monthExpense: number;
  monthIncome: number;
  monthBalance: number;
  categoryBreakdown: CategoryBreakdown[];
  expenseMonthlyTrend: MonthlyTrend[];
  incomeMonthlyTrend: MonthlyTrend[];
  weeklySpending: Array<{ _id: number; total: number; count: number; date: Date }>;
  recentExpenses: IExpense[];
}

export interface WidgetData {
  balance: number;
  todayExpense: number;
  monthExpense: number;
}

export interface BalanceData {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}
