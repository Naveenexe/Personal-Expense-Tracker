export interface TransactionFilters {
  search?: string;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  type?: 'income' | 'expense';
  amountMin?: number;
  amountMax?: number;
}

export interface DashboardStats {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  avgDailySpending: number;
  largestExpense: number;
  topCategory: string;
  savingsRate: number;
}

export interface CategoryStats {
  category: string;
  amount: number;
  count: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    fill?: boolean;
  }[];
}
