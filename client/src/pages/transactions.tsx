import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useTransactions } from "@/hooks/use-transactions";
import { useCategories } from "@/hooks/use-categories";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatDate } from "@/lib/export";
import { TransactionFilters } from "@/types";
import { Edit, Trash2, Search, Filter } from "lucide-react";
import { Transaction } from "@shared/schema";

export default function Transactions() {
  const { transactions, loading, updateTransaction, deleteTransaction } = useTransactions();
  const { categories } = useCategories();
  const { toast } = useToast();

  const [filters, setFilters] = useState<TransactionFilters>({});
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [sortBy, setSortBy] = useState<string>("date-newest");

  const filteredAndSortedTransactions = useMemo(() => {
    let filtered = transactions.filter(transaction => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (!transaction.description?.toLowerCase().includes(searchLower) &&
            !transaction.category.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      if (filters.category && transaction.category !== filters.category) {
        return false;
      }

      if (filters.type && transaction.type !== filters.type) {
        return false;
      }

      if (filters.dateFrom) {
        const transactionDate = new Date(transaction.date);
        const fromDate = new Date(filters.dateFrom);
        if (transactionDate < fromDate) {
          return false;
        }
      }

      if (filters.dateTo) {
        const transactionDate = new Date(transaction.date);
        const toDate = new Date(filters.dateTo);
        if (transactionDate > toDate) {
          return false;
        }
      }

      return true;
    });

    // Sort transactions
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date-newest":
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "date-oldest":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "amount-high":
          return parseFloat(b.amount) - parseFloat(a.amount);
        case "amount-low":
          return parseFloat(a.amount) - parseFloat(b.amount);
        default:
          return 0;
      }
    });

    return filtered;
  }, [transactions, filters, sortBy]);

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
  };

  const handleDelete = (id: string) => {
    deleteTransaction(id);
    toast({
      title: "Transaction deleted",
      description: "The transaction has been successfully deleted.",
    });
  };

  const handleUpdateTransaction = (updatedTransaction: Transaction) => {
    updateTransaction(updatedTransaction.id, updatedTransaction);
    setEditingTransaction(null);
    toast({
      title: "Transaction updated",
      description: "The transaction has been successfully updated.",
    });
  };

  const clearFilters = () => {
    setFilters({});
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96" data-testid="loading-spinner">Loading...</div>;
  }

  return (
    <div className="space-y-6" data-testid="transactions-page">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search transactions..."
                  value={filters.search || ""}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                  data-testid="input-search"
                />
              </div>
            </div>
            
            <div>
              <Label>Category</Label>
              <Select value={filters.category || "all"} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value === "all" ? undefined : value }))}>
                <SelectTrigger data-testid="select-filter-category">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="dateFrom">Date From</Label>
              <Input
                id="dateFrom"
                type="date"
                value={filters.dateFrom || ""}
                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value || undefined }))}
                data-testid="input-date-from"
              />
            </div>
            
            <div>
              <Label htmlFor="dateTo">Date To</Label>
              <Input
                id="dateTo"
                type="date"
                value={filters.dateTo || ""}
                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value || undefined }))}
                data-testid="input-date-to"
              />
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <Button 
              variant="outline" 
              onClick={clearFilters}
              data-testid="button-clear-filters"
            >
              Clear Filters
            </Button>
            <div className="text-sm text-muted-foreground">
              Showing {filteredAndSortedTransactions.length} of {transactions.length} transactions
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>All Transactions</CardTitle>
            <div className="flex items-center space-x-2">
              <Label className="text-sm">Sort by:</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40" data-testid="select-sort">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-newest">Date (Newest)</SelectItem>
                  <SelectItem value="date-oldest">Date (Oldest)</SelectItem>
                  <SelectItem value="amount-high">Amount (High to Low)</SelectItem>
                  <SelectItem value="amount-low">Amount (Low to High)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredAndSortedTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Description</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Category</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Type</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Amount</th>
                    <th className="text-center py-3 px-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredAndSortedTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-accent/50 transition-colors" data-testid={`transaction-row-${transaction.id}`}>
                      <td className="py-4 px-4 text-sm" data-testid={`transaction-date-${transaction.id}`}>
                        {formatDate(transaction.date)}
                      </td>
                      <td className="py-4 px-4" data-testid={`transaction-description-${transaction.id}`}>
                        <div>
                          <div className="font-medium">{transaction.description || transaction.category}</div>
                          {transaction.description && (
                            <div className="text-sm text-muted-foreground">{transaction.category}</div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm" data-testid={`transaction-category-${transaction.id}`}>
                        {transaction.category}
                      </td>
                      <td className="py-4 px-4">
                        <Badge 
                          variant={transaction.type === "income" ? "default" : "secondary"}
                          className={transaction.type === "income" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"}
                          data-testid={`transaction-type-${transaction.id}`}
                        >
                          {transaction.type === "income" ? "Income" : "Expense"}
                        </Badge>
                      </td>
                      <td className={`py-4 px-4 text-right font-semibold ${
                        transaction.type === "income" ? "text-green-600" : "text-red-600"
                      }`} data-testid={`transaction-amount-${transaction.id}`}>
                        {transaction.type === "expense" ? "-" : "+"}
                        {formatCurrency(transaction.amount)}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex justify-center space-x-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(transaction)}
                            data-testid={`button-edit-${transaction.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-destructive hover:text-destructive"
                                data-testid={`button-delete-${transaction.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this transaction? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(transaction.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground" data-testid="no-transactions">
              {transactions.length === 0 
                ? "No transactions yet. Start by adding your first transaction!"
                : "No transactions match the current filters."
              }
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Transaction Dialog */}
      {editingTransaction && (
        <EditTransactionDialog
          transaction={editingTransaction}
          categories={categories}
          onSave={handleUpdateTransaction}
          onClose={() => setEditingTransaction(null)}
        />
      )}
    </div>
  );
}

interface EditTransactionDialogProps {
  transaction: Transaction;
  categories: any[];
  onSave: (transaction: Transaction) => void;
  onClose: () => void;
}

function EditTransactionDialog({ transaction, categories, onSave, onClose }: EditTransactionDialogProps) {
  const [formData, setFormData] = useState({
    amount: transaction.amount,
    type: transaction.type,
    category: transaction.category,
    date: transaction.date.toString().split('T')[0],
    description: transaction.description || "",
  });

  const handleSave = () => {
    const updatedTransaction: Transaction = {
      ...transaction,
      amount: formData.amount,
      type: formData.type as "income" | "expense",
      category: formData.category,
      date: new Date(formData.date),
      description: formData.description || null,
    };
    onSave(updatedTransaction);
  };

  const relevantCategories = categories.filter(cat => cat.type === formData.type);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent data-testid="edit-transaction-dialog">
        <DialogHeader>
          <DialogTitle>Edit Transaction</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="edit-amount">Amount</Label>
            <Input
              id="edit-amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              data-testid="edit-input-amount"
            />
          </div>
          
          <div>
            <Label>Type</Label>
            <Select 
              value={formData.type} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as "income" | "expense" }))}
            >
              <SelectTrigger data-testid="edit-select-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label>Category</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger data-testid="edit-select-category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {relevantCategories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="edit-date">Date</Label>
            <Input
              id="edit-date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              data-testid="edit-input-date"
            />
          </div>
          
          <div>
            <Label htmlFor="edit-description">Description</Label>
            <Input
              id="edit-description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Optional description"
              data-testid="edit-input-description"
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose} data-testid="button-cancel-edit">
              Cancel
            </Button>
            <Button onClick={handleSave} data-testid="button-save-edit">
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
