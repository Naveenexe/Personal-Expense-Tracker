import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTransactions } from "@/hooks/use-transactions";
import { useCategories } from "@/hooks/use-categories";
import { formatCurrency } from "@/lib/export";
import { ArrowUpIcon, ArrowDownIcon, ScaleIcon, TrendingUp, TrendingDown } from "lucide-react";
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useMemo } from "react";

const COLORS = ['hsl(12 76% 61%)', 'hsl(173 58% 39%)', 'hsl(197 37% 24%)', 'hsl(43 74% 66%)', 'hsl(27 87% 67%)'];

export default function Dashboard() {
  const { transactions, loading } = useTransactions();
  const { categories } = useCategories();

  const stats = useMemo(() => {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const netBalance = totalIncome - totalExpenses;

    return {
      totalIncome,
      totalExpenses,
      netBalance,
    };
  }, [transactions]);

  const categoryData = useMemo(() => {
    const expensesByCategory = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + parseFloat(t.amount);
        return acc;
      }, {} as Record<string, number>);

    return Object.entries(expensesByCategory)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [transactions]);

  const trendData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date;
    });

    return last7Days.map(date => {
      const dateStr = date.toISOString().split('T')[0];
      const dayExpenses = transactions
        .filter(t => t.type === 'expense' && t.date.toString().split('T')[0] === dateStr)
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        amount: dayExpenses,
      };
    });
  }, [transactions]);

  const recentTransactions = useMemo(() => {
    return transactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [transactions]);

  if (loading) {
    return <div className="flex items-center justify-center h-96" data-testid="loading-spinner">Loading...</div>;
  }

  return (
    <div className="space-y-8" data-testid="dashboard">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Income</p>
                <p className="text-2xl font-bold text-green-600" data-testid="total-income">
                  {formatCurrency(stats.totalIncome)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">This month</p>
              </div>
              <div className="h-12 w-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <ArrowUpIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600" data-testid="total-expenses">
                  {formatCurrency(stats.totalExpenses)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">This month</p>
              </div>
              <div className="h-12 w-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                <ArrowDownIcon className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Net Balance</p>
                <p className={`text-2xl font-bold ${stats.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`} data-testid="net-balance">
                  {formatCurrency(stats.netBalance)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Current balance</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <ScaleIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Expenses by Category</span>
              <select className="text-sm border border-border rounded-md px-3 py-1 bg-background">
                <option>This Month</option>
                <option>Last Month</option>
                <option>Last 3 Months</option>
              </select>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="amount"
                    nameKey="category"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground" data-testid="no-expense-data">
                No expense data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Trend Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Spending Trend</span>
              <select className="text-sm border border-border rounded-md px-3 py-1 bg-background">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
                <option>Last 3 Months</option>
              </select>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(value) => `$${value}`} />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="hsl(221.2 83.2% 53.3%)" 
                  strokeWidth={3}
                  dot={{ fill: "hsl(221.2 83.2% 53.3%)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Recent Transactions</span>
            <button 
              className="text-sm text-primary hover:text-primary/80 font-medium"
              onClick={() => window.location.href = '/transactions'}
              data-testid="view-all-transactions"
            >
              View All
            </button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentTransactions.length > 0 ? (
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div 
                  key={transaction.id} 
                  className="flex items-center justify-between py-3 border-b border-border last:border-b-0"
                  data-testid={`transaction-${transaction.id}`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.type === 'expense' ? 'bg-red-100 dark:bg-red-900' : 'bg-green-100 dark:bg-green-900'
                    }`}>
                      {transaction.type === 'expense' ? (
                        <ArrowDownIcon className="h-5 w-5 text-red-600" />
                      ) : (
                        <ArrowUpIcon className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium" data-testid={`transaction-description-${transaction.id}`}>
                        {transaction.description || transaction.category}
                      </p>
                      <p className="text-sm text-muted-foreground" data-testid={`transaction-date-${transaction.id}`}>
                        {new Date(transaction.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.type === 'expense' ? 'text-red-600' : 'text-green-600'
                    }`} data-testid={`transaction-amount-${transaction.id}`}>
                      {transaction.type === 'expense' ? '-' : '+'}
                      {formatCurrency(transaction.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground" data-testid={`transaction-category-${transaction.id}`}>
                      {transaction.category}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground" data-testid="no-transactions">
              No transactions yet. Start by adding your first transaction!
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
