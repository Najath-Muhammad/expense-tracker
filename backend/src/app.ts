import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import { ROUTES, RATE_LIMIT } from './constants';
import globalErrorHandler from './middlewares/errorHandler.middleware';
import logger from './utils/logger';

// Routes
import authRoutes from './routes/auth.routes';
import walletRoutes from './routes/wallet.routes';
import expenseRoutes from './routes/expense.routes';
import incomeRoutes from './routes/income.routes';
import reportRoutes from './routes/report.routes';
import budgetRoutes from './routes/budget.routes';

const app = express();

// ─── Security Middleware ───────────────────────────────────────────────────
app.use(helmet());

// ─── CORS ─────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Rate Limiting ─────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: RATE_LIMIT.WINDOW_MS,
  max: RATE_LIMIT.MAX_REQUESTS,
  message: { success: false, message: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: RATE_LIMIT.AUTH_WINDOW_MS,
  max: RATE_LIMIT.AUTH_MAX,
  message: { success: false, message: 'Too many auth attempts, please try again later' },
  skipSuccessfulRequests: true,
});

app.use(globalLimiter);

// ─── Body Parser ──────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(process.env.COOKIE_SECRET));

// ─── HTTP Logger ──────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', {
    stream: { write: (message: string) => logger.http(message.trim()) },
  }));
}

// ─── Health Check ─────────────────────────────────────────────────────────
app.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'ExpenseTracker API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────
const apiPrefix = ROUTES.API_PREFIX;

app.use(`${apiPrefix}${ROUTES.AUTH}`, authLimiter, authRoutes);
app.use(`${apiPrefix}${ROUTES.WALLET}`, walletRoutes);
app.use(`${apiPrefix}${ROUTES.WALLET}/:walletId${ROUTES.EXPENSE}`, expenseRoutes);
app.use(`${apiPrefix}${ROUTES.WALLET}/:walletId${ROUTES.INCOME}`, incomeRoutes);
app.use(`${apiPrefix}${ROUTES.WALLET}/:walletId${ROUTES.REPORT}`, reportRoutes);
app.use(`${apiPrefix}${ROUTES.WALLET}/:walletId${ROUTES.BUDGET}`, budgetRoutes);

// ─── Widget API (lightweight for mobile widgets) ───────────────────────────
app.use(`${apiPrefix}/widget`, (req: Request, res: Response, next: NextFunction) => {
  next();
});

// ─── 404 Handler ──────────────────────────────────────────────────────────
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ─── Global Error Handler (MUST be last) ──────────────────────────────────
app.use(globalErrorHandler);

export default app;
