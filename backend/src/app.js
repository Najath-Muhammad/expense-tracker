const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');

const { ROUTES, RATE_LIMIT, API_VERSION } = require('./constants');
const globalErrorHandler = require('./middlewares/errorHandler.middleware');
const logger = require('./utils/logger');

// Routes
const authRoutes = require('./routes/auth.routes');
const walletRoutes = require('./routes/wallet.routes');
const expenseRoutes = require('./routes/expense.routes');
const incomeRoutes = require('./routes/income.routes');
const reportRoutes = require('./routes/report.routes');
const budgetRoutes = require('./routes/budget.routes');

const app = express();

// ─── Security Middleware ───────────────────────────────────────────────────
app.use(helmet());
app.use(mongoSanitize());

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
    stream: { write: (message) => logger.http(message.trim()) },
  }));
}

// ─── Health Check ─────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'ExpenseTracker API is running',
    version: API_VERSION,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────
const apiPrefix = `${ROUTES.API_PREFIX}`;

app.use(`${apiPrefix}${ROUTES.AUTH}`, authLimiter, authRoutes);
app.use(`${apiPrefix}${ROUTES.WALLET}`, walletRoutes);
app.use(`${apiPrefix}${ROUTES.WALLET}/:walletId${ROUTES.EXPENSE}`, expenseRoutes);
app.use(`${apiPrefix}${ROUTES.WALLET}/:walletId${ROUTES.INCOME}`, incomeRoutes);
app.use(`${apiPrefix}${ROUTES.WALLET}/:walletId${ROUTES.REPORT}`, reportRoutes);
app.use(`${apiPrefix}${ROUTES.WALLET}/:walletId/budgets`, budgetRoutes);

// ─── Widget API (lightweight for mobile widgets) ───────────────────────────
app.use(`${apiPrefix}/widget`, (req, res, next) => {
  // Lightweight endpoint — handled via report service
  next();
});

// ─── 404 Handler ──────────────────────────────────────────────────────────
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ─── Global Error Handler (MUST be last) ──────────────────────────────────
app.use(globalErrorHandler);

module.exports = app;
