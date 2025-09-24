import { Transaction, Category, Budget } from "@shared/schema";

const STORAGE_KEYS = {
  TRANSACTIONS: 'expense-tracker-transactions',
  CATEGORIES: 'expense-tracker-categories',
  BUDGETS: 'expense-tracker-budgets',
  SETTINGS: 'expense-tracker-settings',
} as const;

// Default categories
const DEFAULT_CATEGORIES: Category[] = [
  // Expense categories
  { id: '1', name: "Food & Dining", type: "expense", isCustom: false },
  { id: '2', name: "Transportation", type: "expense", isCustom: false },
  { id: '3', name: "Shopping", type: "expense", isCustom: false },
  { id: '4', name: "Entertainment", type: "expense", isCustom: false },
  { id: '5', name: "Bills & Utilities", type: "expense", isCustom: false },
  { id: '6', name: "Healthcare", type: "expense", isCustom: false },
  { id: '7', name: "Education", type: "expense", isCustom: false },
  { id: '8', name: "Other", type: "expense", isCustom: false },
  
  // Income categories
  { id: '9', name: "Salary", type: "income", isCustom: false },
  { id: '10', name: "Freelance", type: "income", isCustom: false },
  { id: '11', name: "Investment", type: "income", isCustom: false },
  { id: '12', name: "Gift", type: "income", isCustom: false },
  { id: '13', name: "Other", type: "income", isCustom: false },
];

export class LocalStorage {
  // Transactions
  static getTransactions(): Transaction[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static saveTransactions(transactions: Transaction[]): void {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }

  static addTransaction(transaction: Transaction): void {
    const transactions = this.getTransactions();
    transactions.push(transaction);
    this.saveTransactions(transactions);
  }

  static updateTransaction(id: string, updates: Partial<Transaction>): void {
    const transactions = this.getTransactions();
    const index = transactions.findIndex(t => t.id === id);
    if (index !== -1) {
      transactions[index] = { ...transactions[index], ...updates };
      this.saveTransactions(transactions);
    }
  }

  static deleteTransaction(id: string): void {
    const transactions = this.getTransactions();
    const filtered = transactions.filter(t => t.id !== id);
    this.saveTransactions(filtered);
  }

  // Categories
  static getCategories(): Category[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      const categories = data ? JSON.parse(data) : DEFAULT_CATEGORIES;
      return categories;
    } catch {
      return DEFAULT_CATEGORIES;
    }
  }

  static saveCategories(categories: Category[]): void {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }

  static addCategory(category: Category): void {
    const categories = this.getCategories();
    categories.push(category);
    this.saveCategories(categories);
  }

  static deleteCategory(id: string): void {
    const categories = this.getCategories();
    const filtered = categories.filter(c => c.id !== id);
    this.saveCategories(filtered);
  }

  // Budgets
  static getBudgets(): Budget[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BUDGETS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static saveBudgets(budgets: Budget[]): void {
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
  }

  static addBudget(budget: Budget): void {
    const budgets = this.getBudgets();
    budgets.push(budget);
    this.saveBudgets(budgets);
  }

  static updateBudget(id: string, updates: Partial<Budget>): void {
    const budgets = this.getBudgets();
    const index = budgets.findIndex(b => b.id === id);
    if (index !== -1) {
      budgets[index] = { ...budgets[index], ...updates };
      this.saveBudgets(budgets);
    }
  }

  static deleteBudget(id: string): void {
    const budgets = this.getBudgets();
    const filtered = budgets.filter(b => b.id !== id);
    this.saveBudgets(filtered);
  }

  // Settings
  static getSettings(): Record<string, any> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? JSON.parse(data) : {
        currency: 'USD',
        dateFormat: 'MM/DD/YYYY',
        budgetAlerts: true,
        theme: 'light'
      };
    } catch {
      return {
        currency: 'USD',
        dateFormat: 'MM/DD/YYYY',
        budgetAlerts: true,
        theme: 'light'
      };
    }
  }

  static saveSettings(settings: Record<string, any>): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }

  // Data management
  static exportData(): string {
    const data = {
      transactions: this.getTransactions(),
      categories: this.getCategories(),
      budgets: this.getBudgets(),
      settings: this.getSettings(),
      exportDate: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  }

  static importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      if (data.transactions) this.saveTransactions(data.transactions);
      if (data.categories) this.saveCategories(data.categories);
      if (data.budgets) this.saveBudgets(data.budgets);
      if (data.settings) this.saveSettings(data.settings);
      return true;
    } catch {
      return false;
    }
  }

  static clearAllData(): void {
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.BUDGETS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  }
}
