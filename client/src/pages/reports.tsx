import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTransactions } from "@/hooks/use-transactions";
import { formatCurrency, exportTransactionsToCSV, downloadCSV } from "@/lib/export";
import { CategoryStats } from "@/types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Download, TrendingUp, TrendingDown, Minus } from "lucide-react";

const COLORS = ['hsl(12 76% 61%)', 'hsl(173 58% 39%)', 'hsl(197 37% 24%)', 'hsl(43 74% 66%)', 'hsl(27 87% 67%)'];

export default function Reports() {
  const { transactions } = useTransactions();
  const [timeRange, setTimeRange] = useState("this-month");

  const filteredTransactions = useMemo(() => {
    const now = new Date();
    let startDate: Date;

    switch (timeRange) {
      case "last-month":
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        break;
      case "last-3-months":
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        break;
      case "this-year":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    return transactions.filter(t => new Date(t.date) >= startDate);
  }, [transactions, timeRange]);

  const stats = useMemo(() => {
    const totalIncome = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const totalExpenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const expenses = filteredTransactions.filter(t => t.type === 'expense');
    const avgDailySpending = expenses.length > 0 
      ? totalExpenses / Math.max(1, new Date().getDate())
      : 0;

    const largestExpense = expenses.length > 0
      ? Math.max(...expenses.map(t => parseFloat(t.amount)))
      : 0;

    const categoryCount = expenses.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topCategory = Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || "None";

    const savingsRate = totalIncome > 0 
      ? ((totalIncome - totalExpenses) / totalIncome) * 100
      : 0;

    return {
      avgDailySpending,
      largestExpense,
      topCategory,
      savingsRate,
    };
  }, [filteredTransactions]);

  const monthlyData = useMemo(() => {
    const last3Months = Array.from({ length: 3 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (2 - i));
      return date;
    });

    return last3Months.map(date => {
      const monthTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() === date.getMonth() &&
               transactionDate.getFullYear() === date.getFullYear();
      });

      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      const expenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      return {
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        Income: income,
        Expenses: expenses,
      };
    });
  }, [transactions]);

  const categoryStats = useMemo(() => {
    const expensesByCategory = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        const amount = parseFloat(t.amount);
        if (!acc[t.category]) {
          acc[t.category] = { amount: 0, count: 0 };
        }
        acc[t.category].amount += amount;
        acc[t.category].count += 1;
        return acc;
      }, {} as Record<string, { amount: number; count: number }>);

    const totalExpenses = Object.values(expensesByCategory)
      .reduce((sum, cat) => sum + cat.amount, 0);

    return Object.entries(expensesByCategory)
      .map(([category, data]): CategoryStats => ({
        category,
        amount: data.amount,
        count: data.count,
        percentage: totalExpenses > 0 ? (data.amount / totalExpenses) * 100 : 0,
        trend: 'stable', // Simplified for this implementation
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);
  }, [filteredTransactions]);

  const chartData = useMemo(() => {
    return categoryStats.map(stat => ({
      category: stat.category,
      amount: stat.amount,
    }));
  }, [categoryStats]);

  const handleExportCSV = () => {
    const csvContent = exportTransactionsToCSV(filteredTransactions);
    const filename = `transactions-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`;
    downloadCSV(csvContent, filename);
  };

  return (
    <div className="space-y-6" data-testid="reports-page">
      {/* Report Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <h2 className="text-2xl font-bold">Reports & Analytics</h2>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-40" data-testid="select-time-range">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="this-month">This Month</SelectItem>
                  <SelectItem value="last-month">Last Month</SelectItem>
                  <SelectItem value="last-3-months">Last 3 Months</SelectItem>
                  <SelectItem value="this-year">This Year</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                onClick={handleExportCSV}
                variant="secondary"
                data-testid="button-export-csv"
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-sm font-medium text-muted-foreground">Average Daily Spending</p>
            <p className="text-2xl font-bold text-foreground mt-2" data-testid="avg-daily-spending">
              {formatCurrency(stats.avgDailySpending)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Based on current period</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-sm font-medium text-muted-foreground">Largest Expense</p>
            <p className="text-2xl font-bold text-foreground mt-2" data-testid="largest-expense">
              {formatCurrency(stats.largestExpense)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Single transaction</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-sm font-medium text-muted-foreground">Most Frequent Category</p>
            <p className="text-2xl font-bold text-foreground mt-2" data-testid="top-category">
              {stats.topCategory}
            </p>
            <p className="text-xs text-muted-foreground mt-1">By transaction count</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-sm font-medium text-muted-foreground">Savings Rate</p>
            <p className={`text-2xl font-bold mt-2 ${stats.savingsRate >= 0 ? 'text-green-600' : 'text-red-600'}`} data-testid="savings-rate">
              {stats.savingsRate.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">Of total income</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `$${value}`} />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Legend />
                <Bar dataKey="Income" fill="hsl(142 71% 45%)" />
                <Bar dataKey="Expenses" fill="hsl(0 84% 60%)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="amount"
                    nameKey="category"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground" data-testid="no-chart-data">
                No data available for selected period
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle>Top Spending Categories</CardTitle>
        </CardHeader>
        <CardContent>
          {categoryStats.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Category</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Amount</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Transactions</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">% of Total</th>
                    <th className="text-center py-3 px-4 font-medium text-muted-foreground">Trend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {categoryStats.map((category, index) => (
                    <tr key={category.category} data-testid={`category-row-${index}`}>
                      <td className="py-3 px-4" data-testid={`category-name-${index}`}>
                        {category.category}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold" data-testid={`category-amount-${index}`}>
                        {formatCurrency(category.amount)}
                      </td>
                      <td className="py-3 px-4 text-right" data-testid={`category-count-${index}`}>
                        {category.count}
                      </td>
                      <td className="py-3 px-4 text-right" data-testid={`category-percentage-${index}`}>
                        {category.percentage.toFixed(1)}%
                      </td>
                      <td className="py-3 px-4 text-center">
                        {category.trend === 'up' && <TrendingUp className="h-4 w-4 text-red-500 mx-auto" />}
                        {category.trend === 'down' && <TrendingDown className="h-4 w-4 text-green-500 mx-auto" />}
                        {category.trend === 'stable' && <Minus className="h-4 w-4 text-gray-500 mx-auto" />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground" data-testid="no-category-data">
              No category data available for the selected period.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
