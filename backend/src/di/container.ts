import { UserRepository } from '../repositories/implementations/UserRepository';
import { WalletRepository } from '../repositories/implementations/WalletRepository';
import { ExpenseRepository } from '../repositories/implementations/ExpenseRepository';
import { IncomeRepository } from '../repositories/implementations/IncomeRepository';

import { AuthService } from '../services/implementations/AuthService';
import { WalletService } from '../services/implementations/WalletService';
import { ExpenseService } from '../services/implementations/ExpenseService';
import { IncomeService } from '../services/implementations/IncomeService';
import { ReportService } from '../services/implementations/ReportService';
import { BudgetService } from '../services/implementations/BudgetService';

import { AuthController } from '../controllers/implementations/AuthController';
import { WalletController } from '../controllers/implementations/WalletController';
import { ExpenseController } from '../controllers/implementations/ExpenseController';
import { IncomeController } from '../controllers/implementations/IncomeController';
import { ReportController } from '../controllers/implementations/ReportController';
import { BudgetController } from '../controllers/implementations/BudgetController';

class DIContainer {
  // Repositories
  public userRepository: UserRepository;
  public walletRepository: WalletRepository;
  public expenseRepository: ExpenseRepository;
  public incomeRepository: IncomeRepository;

  // Services
  public authService: AuthService;
  public walletService: WalletService;
  public expenseService: ExpenseService;
  public incomeService: IncomeService;
  public reportService: ReportService;
  public budgetService: BudgetService;

  // Controllers
  public authController: AuthController;
  public walletController: WalletController;
  public expenseController: ExpenseController;
  public incomeController: IncomeController;
  public reportController: ReportController;
  public budgetController: BudgetController;

  constructor() {
    // Init Repos
    this.userRepository = new UserRepository();
    this.walletRepository = new WalletRepository();
    this.expenseRepository = new ExpenseRepository();
    this.incomeRepository = new IncomeRepository();

    // Init Services (inject repos)
    this.authService = new AuthService(this.userRepository, this.walletRepository);
    this.walletService = new WalletService(this.walletRepository, this.userRepository);
    this.expenseService = new ExpenseService(this.expenseRepository, this.walletRepository);
    this.incomeService = new IncomeService(this.incomeRepository, this.walletRepository);
    this.reportService = new ReportService(this.expenseRepository, this.incomeRepository, this.walletRepository);
    this.budgetService = new BudgetService(this.walletRepository);

    // Init Controllers (inject services)
    this.authController = new AuthController(this.authService);
    this.walletController = new WalletController(this.walletService);
    this.expenseController = new ExpenseController(this.expenseService);
    this.incomeController = new IncomeController(this.incomeService);
    this.reportController = new ReportController(this.reportService);
    this.budgetController = new BudgetController(this.budgetService);
  }
}

export default new DIContainer();
