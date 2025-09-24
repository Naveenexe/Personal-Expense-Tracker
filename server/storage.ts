import { type Transaction, type InsertTransaction, type Category, type InsertCategory, type Budget, type InsertBudget } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Transactions
  getTransactions(): Promise<Transaction[]>;
  getTransaction(id: string): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: string, transaction: Partial<InsertTransaction>): Promise<Transaction | undefined>;
  deleteTransaction(id: string): Promise<boolean>;
  
  // Categories
  getCategories(): Promise<Category[]>;
  getCategory(id: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  deleteCategory(id: string): Promise<boolean>;
  
  // Budgets
  getBudgets(): Promise<Budget[]>;
  getBudget(id: string): Promise<Budget | undefined>;
  createBudget(budget: InsertBudget): Promise<Budget>;
  updateBudget(id: string, budget: Partial<InsertBudget>): Promise<Budget | undefined>;
  deleteBudget(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private transactions: Map<string, Transaction>;
  private categories: Map<string, Category>;
  private budgets: Map<string, Budget>;

  constructor() {
    this.transactions = new Map();
    this.categories = new Map();
    this.budgets = new Map();
    
    // Initialize default categories
    this.initializeDefaultCategories();
  }

  private initializeDefaultCategories() {
    const defaultCategories: Category[] = [
      // Expense categories
      { id: randomUUID(), name: "Food & Dining", type: "expense", isCustom: false },
      { id: randomUUID(), name: "Transportation", type: "expense", isCustom: false },
      { id: randomUUID(), name: "Shopping", type: "expense", isCustom: false },
      { id: randomUUID(), name: "Entertainment", type: "expense", isCustom: false },
      { id: randomUUID(), name: "Bills & Utilities", type: "expense", isCustom: false },
      { id: randomUUID(), name: "Healthcare", type: "expense", isCustom: false },
      { id: randomUUID(), name: "Education", type: "expense", isCustom: false },
      { id: randomUUID(), name: "Other", type: "expense", isCustom: false },
      
      // Income categories
      { id: randomUUID(), name: "Salary", type: "income", isCustom: false },
      { id: randomUUID(), name: "Freelance", type: "income", isCustom: false },
      { id: randomUUID(), name: "Investment", type: "income", isCustom: false },
      { id: randomUUID(), name: "Gift", type: "income", isCustom: false },
      { id: randomUUID(), name: "Other", type: "income", isCustom: false },
    ];

    defaultCategories.forEach(category => {
      this.categories.set(category.id, category);
    });
  }

  // Transactions
  async getTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  async getTransaction(id: string): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = randomUUID();
    const transaction: Transaction = {
      ...insertTransaction,
      id,
      amount: insertTransaction.amount.toString(),
      date: insertTransaction.date,
      description: insertTransaction.description || null,
      createdAt: new Date(),
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async updateTransaction(id: string, updates: Partial<InsertTransaction>): Promise<Transaction | undefined> {
    const transaction = this.transactions.get(id);
    if (!transaction) return undefined;

    const updated: Transaction = {
      ...transaction,
      ...updates,
      amount: updates.amount ? updates.amount.toString() : transaction.amount,
      date: updates.date || transaction.date,
    };
    this.transactions.set(id, updated);
    return updated;
  }

  async deleteTransaction(id: string): Promise<boolean> {
    return this.transactions.delete(id);
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategory(id: string): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = randomUUID();
    const category: Category = {
      ...insertCategory,
      id,
      isCustom: true,
    };
    this.categories.set(id, category);
    return category;
  }

  async deleteCategory(id: string): Promise<boolean> {
    const category = this.categories.get(id);
    if (!category || !category.isCustom) return false;
    return this.categories.delete(id);
  }

  // Budgets
  async getBudgets(): Promise<Budget[]> {
    return Array.from(this.budgets.values());
  }

  async getBudget(id: string): Promise<Budget | undefined> {
    return this.budgets.get(id);
  }

  async createBudget(insertBudget: InsertBudget): Promise<Budget> {
    const id = randomUUID();
    const budget: Budget = {
      ...insertBudget,
      id,
      amount: insertBudget.amount.toString(),
      period: insertBudget.period || "monthly",
    };
    this.budgets.set(id, budget);
    return budget;
  }

  async updateBudget(id: string, updates: Partial<InsertBudget>): Promise<Budget | undefined> {
    const budget = this.budgets.get(id);
    if (!budget) return undefined;

    const updated: Budget = {
      ...budget,
      ...updates,
      amount: updates.amount ? updates.amount.toString() : budget.amount,
    };
    this.budgets.set(id, updated);
    return updated;
  }

  async deleteBudget(id: string): Promise<boolean> {
    return this.budgets.delete(id);
  }
}

export const storage = new MemStorage();
