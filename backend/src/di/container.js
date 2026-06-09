/**
 * Dependency Injection Container
 * Wires all dependencies together following Clean Architecture
 * High-level modules depend on abstractions, not concretions
 */

// Repositories
const UserRepository = require('../repositories/implementations/UserRepository');
const ExpenseRepository = require('../repositories/implementations/ExpenseRepository');
const IncomeRepository = require('../repositories/implementations/IncomeRepository');
const WalletRepository = require('../repositories/implementations/WalletRepository');
const BaseRepository = require('../repositories/implementations/BaseRepository');
const Activity = require('../models/Activity');
const Budget = require('../models/Budget');
const SavingsGoal = require('../models/SavingsGoal');
const Recurring = require('../models/Recurring');

// Services
const AuthService = require('../services/implementations/AuthService');
const WalletService = require('../services/implementations/WalletService');
const ExpenseService = require('../services/implementations/ExpenseService');
const IncomeService = require('../services/implementations/IncomeService');
const BudgetService = require('../services/implementations/BudgetService');
const ReportService = require('../services/implementations/ReportService');

// Controllers
const AuthController = require('../controllers/implementations/AuthController');
const WalletController = require('../controllers/implementations/WalletController');
const ExpenseController = require('../controllers/implementations/ExpenseController');
const IncomeController = require('../controllers/implementations/IncomeController');
const ReportController = require('../controllers/implementations/ReportController');

class DIContainer {
  constructor() {
    this._singletons = new Map();
  }

  _getSingleton(key, factory) {
    if (!this._singletons.has(key)) {
      this._singletons.set(key, factory());
    }
    return this._singletons.get(key);
  }

  // ─── Repositories ─────────────────────────────────────────────────────────

  get userRepository() {
    return this._getSingleton('userRepository', () => new UserRepository());
  }

  get expenseRepository() {
    return this._getSingleton('expenseRepository', () => new ExpenseRepository());
  }

  get incomeRepository() {
    return this._getSingleton('incomeRepository', () => new IncomeRepository());
  }

  get walletRepository() {
    return this._getSingleton('walletRepository', () => new WalletRepository());
  }

  get activityRepository() {
    return this._getSingleton('activityRepository', () => new BaseRepository(Activity));
  }

  get budgetRepository() {
    return this._getSingleton('budgetRepository', () => new BaseRepository(Budget));
  }

  get savingsGoalRepository() {
    return this._getSingleton('savingsGoalRepository', () => new BaseRepository(SavingsGoal));
  }

  get recurringRepository() {
    return this._getSingleton('recurringRepository', () => new BaseRepository(Recurring));
  }

  // ─── Services ─────────────────────────────────────────────────────────────

  get authService() {
    return this._getSingleton('authService', () =>
      new AuthService(this.userRepository, this.activityRepository)
    );
  }

  get budgetService() {
    return this._getSingleton('budgetService', () =>
      new BudgetService(this.walletRepository, this.activityRepository)
    );
  }

  get walletService() {
    return this._getSingleton('walletService', () =>
      new WalletService(this.walletRepository, this.activityRepository, this.userRepository)
    );
  }

  get expenseService() {
    return this._getSingleton('expenseService', () =>
      new ExpenseService(
        this.expenseRepository,
        this.walletRepository,
        this.activityRepository,
        this.budgetService
      )
    );
  }

  get incomeService() {
    return this._getSingleton('incomeService', () =>
      new IncomeService(this.incomeRepository, this.walletRepository, this.activityRepository)
    );
  }

  get reportService() {
    return this._getSingleton('reportService', () =>
      new ReportService(this.expenseRepository, this.incomeRepository, this.walletRepository)
    );
  }

  // ─── Controllers ──────────────────────────────────────────────────────────

  get authController() {
    return this._getSingleton('authController', () => new AuthController(this.authService));
  }

  get walletController() {
    return this._getSingleton('walletController', () => new WalletController(this.walletService));
  }

  get expenseController() {
    return this._getSingleton('expenseController', () => new ExpenseController(this.expenseService));
  }

  get incomeController() {
    return this._getSingleton('incomeController', () => new IncomeController(this.incomeService));
  }

  get reportController() {
    return this._getSingleton('reportController', () => new ReportController(this.reportService));
  }
}

// Export single container instance
module.exports = new DIContainer();
