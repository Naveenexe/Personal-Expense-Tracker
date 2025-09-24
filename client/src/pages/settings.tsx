import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useTransactions } from "@/hooks/use-transactions";
import { useCategories } from "@/hooks/use-categories";
import { useBudgets } from "@/hooks/use-budgets";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useToast } from "@/hooks/use-toast";
import { LocalStorage } from "@/lib/storage";
import { formatCurrency } from "@/lib/export";
import { Plus, Save, Trash2, Download, Upload, AlertTriangle } from "lucide-react";
import { useMemo } from "react";

export default function Settings() {
  const { transactions } = useTransactions();
  const { categories, addCategory, deleteCategory, getCategoriesByType } = useCategories();
  const { budgets, addBudget, updateBudget, deleteBudget } = useBudgets();
  const [settings, setSettings] = useLocalStorage('expense-tracker-settings', {
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    budgetAlerts: true,
  });
  const { toast } = useToast();

  const [newExpenseCategory, setNewExpenseCategory] = useState("");
  const [newIncomeCategory, setNewIncomeCategory] = useState("");
  const [newBudgetCategory, setNewBudgetCategory] = useState("");
  const [newBudgetAmount, setNewBudgetAmount] = useState("");

  // Calculate budget progress
  const budgetProgress = useMemo(() => {
    return budgets.map(budget => {
      const spent = transactions
        .filter(t => t.type === 'expense' && t.category === budget.category)
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      
      const budgetAmount = parseFloat(budget.amount);
      const progress = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;
      
      return {
        ...budget,
        spent,
        progress,
        isOverBudget: spent > budgetAmount,
      };
    });
  }, [budgets, transactions]);

  const handleAddExpenseCategory = () => {
    if (!newExpenseCategory.trim()) return;

    const newCategory = {
      id: crypto.randomUUID(),
      name: newExpenseCategory.trim(),
      type: 'expense' as const,
      isCustom: true,
    };

    addCategory(newCategory);
    setNewExpenseCategory("");
    
    toast({
      title: "Category added",
      description: `${newExpenseCategory} has been added to expense categories.`,
    });
  };

  const handleAddIncomeCategory = () => {
    if (!newIncomeCategory.trim()) return;

    const newCategory = {
      id: crypto.randomUUID(),
      name: newIncomeCategory.trim(),
      type: 'income' as const,
      isCustom: true,
    };

    addCategory(newCategory);
    setNewIncomeCategory("");
    
    toast({
      title: "Category added",
      description: `${newIncomeCategory} has been added to income categories.`,
    });
  };

  const handleAddBudget = () => {
    if (!newBudgetCategory || !newBudgetAmount) return;

    const newBudget = {
      id: crypto.randomUUID(),
      category: newBudgetCategory,
      amount: newBudgetAmount,
      period: 'monthly' as const,
    };

    addBudget(newBudget);
    setNewBudgetCategory("");
    setNewBudgetAmount("");
    
    toast({
      title: "Budget added",
      description: `Budget for ${newBudgetCategory} has been set.`,
    });
  };

  const handleUpdateBudget = (id: string, amount: string) => {
    updateBudget(id, { amount });
    toast({
      title: "Budget updated",
      description: "Budget amount has been updated successfully.",
    });
  };

  const handleDeleteCategory = (id: string, name: string) => {
    deleteCategory(id);
    toast({
      title: "Category deleted",
      description: `${name} has been removed from your categories.`,
    });
  };

  const handleExportData = () => {
    try {
      const data = LocalStorage.exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `expense-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Data exported",
        description: "Your data has been downloaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const success = LocalStorage.importData(content);
        
        if (success) {
          toast({
            title: "Data imported",
            description: "Your data has been imported successfully. Please refresh the page.",
          });
          // Refresh the page after a delay
          setTimeout(() => window.location.reload(), 2000);
        } else {
          throw new Error('Invalid file format');
        }
      } catch (error) {
        toast({
          title: "Import failed",
          description: "Failed to import data. Please check the file format.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  const handleClearAllData = () => {
    LocalStorage.clearAllData();
    toast({
      title: "Data cleared",
      description: "All data has been cleared. Please refresh the page.",
    });
    // Refresh the page after a delay
    setTimeout(() => window.location.reload(), 2000);
  };

  const customExpenseCategories = getCategoriesByType('expense').filter(cat => cat.isCustom);
  const customIncomeCategories = getCategoriesByType('income').filter(cat => cat.isCustom);
  const expenseCategories = getCategoriesByType('expense');

  return (
    <div className="max-w-4xl mx-auto space-y-6" data-testid="settings-page">
      {/* Budget Management */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">Set monthly budgets for different categories to track your spending goals.</p>
          
          <div className="space-y-4">
            {budgetProgress.map((budget) => (
              <div key={budget.id} className={`flex items-center justify-between p-4 border rounded-lg ${
                budget.isOverBudget ? 'border-destructive bg-destructive/5' : 'border-border'
              }`} data-testid={`budget-${budget.id}`}>
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${budget.isOverBudget ? 'bg-destructive' : 'bg-primary'}`}></div>
                  <div>
                    <p className="font-medium" data-testid={`budget-category-${budget.id}`}>{budget.category}</p>
                    <p className={`text-sm ${budget.isOverBudget ? 'text-destructive' : 'text-muted-foreground'}`}>
                      Spent: {formatCurrency(budget.spent)} / {formatCurrency(budget.amount)}
                      {budget.isOverBudget && " (Over budget!)"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-32 bg-muted rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${budget.isOverBudget ? 'bg-destructive' : 'bg-primary'}`}
                      style={{ width: `${Math.min(budget.progress, 100)}%` }}
                    ></div>
                  </div>
                  <Input
                    type="number"
                    value={budget.amount}
                    onChange={(e) => handleUpdateBudget(budget.id, e.target.value)}
                    className="w-20"
                    data-testid={`budget-amount-${budget.id}`}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteBudget(budget.id)}
                    data-testid={`delete-budget-${budget.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            <div className="flex space-x-2">
              <Select value={newBudgetCategory} onValueChange={setNewBudgetCategory}>
                <SelectTrigger className="flex-1" data-testid="select-budget-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {expenseCategories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                placeholder="Amount"
                value={newBudgetAmount}
                onChange={(e) => setNewBudgetAmount(e.target.value)}
                className="w-32"
                data-testid="input-budget-amount"
              />
              <Button onClick={handleAddBudget} data-testid="button-add-budget">
                <Plus className="mr-2 h-4 w-4" />
                Add Budget
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Management */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">Manage your custom expense and income categories.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Expense Categories */}
            <div>
              <h4 className="font-medium mb-3">Expense Categories</h4>
              <div className="space-y-2">
                {customExpenseCategories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between p-2 border border-border rounded" data-testid={`expense-category-${category.id}`}>
                    <span>{category.name}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteCategory(category.id, category.name)}
                      className="text-destructive hover:text-destructive"
                      data-testid={`delete-expense-category-${category.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex space-x-2">
                <Input
                  placeholder="New category name"
                  value={newExpenseCategory}
                  onChange={(e) => setNewExpenseCategory(e.target.value)}
                  className="flex-1"
                  data-testid="input-new-expense-category"
                />
                <Button onClick={handleAddExpenseCategory} data-testid="button-add-expense-category">
                  Add
                </Button>
              </div>
            </div>

            {/* Income Categories */}
            <div>
              <h4 className="font-medium mb-3">Income Categories</h4>
              <div className="space-y-2">
                {customIncomeCategories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between p-2 border border-border rounded" data-testid={`income-category-${category.id}`}>
                    <span>{category.name}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteCategory(category.id, category.name)}
                      className="text-destructive hover:text-destructive"
                      data-testid={`delete-income-category-${category.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex space-x-2">
                <Input
                  placeholder="New category name"
                  value={newIncomeCategory}
                  onChange={(e) => setNewIncomeCategory(e.target.value)}
                  className="flex-1"
                  data-testid="input-new-income-category"
                />
                <Button onClick={handleAddIncomeCategory} data-testid="button-add-income-category">
                  Add
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Currency */}
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Currency</Label>
                <p className="text-sm text-muted-foreground">Choose your preferred currency format</p>
              </div>
              <Select 
                value={settings.currency} 
                onValueChange={(value) => setSettings(prev => ({ ...prev, currency: value }))}
              >
                <SelectTrigger className="w-32" data-testid="select-currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="JPY">JPY (¥)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Format */}
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Date Format</Label>
                <p className="text-sm text-muted-foreground">Choose how dates are displayed</p>
              </div>
              <Select 
                value={settings.dateFormat} 
                onValueChange={(value) => setSettings(prev => ({ ...prev, dateFormat: value }))}
              >
                <SelectTrigger className="w-40" data-testid="select-date-format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notifications */}
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Budget Alerts</Label>
                <p className="text-sm text-muted-foreground">Get notified when approaching budget limits</p>
              </div>
              <Switch
                checked={settings.budgetAlerts}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, budgetAlerts: checked }))}
                data-testid="switch-budget-alerts"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="p-4 h-auto flex-col space-y-2"
              onClick={handleExportData}
              data-testid="button-export-data"
            >
              <Download className="h-8 w-8 text-blue-600" />
              <div className="font-medium">Export Data</div>
              <div className="text-sm text-muted-foreground text-center">Download all your data</div>
            </Button>
            
            <label className="cursor-pointer">
              <div className="p-4 h-auto flex-col space-y-2 border border-border rounded-lg hover:bg-accent transition-colors flex items-center">
                <Upload className="h-8 w-8 text-green-600" />
                <div className="font-medium">Import Data</div>
                <div className="text-sm text-muted-foreground text-center">Upload data from file</div>
              </div>
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImportData}
                data-testid="input-import-data"
              />
            </label>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="p-4 h-auto flex-col space-y-2 border-destructive hover:bg-destructive/5"
                  data-testid="button-clear-data"
                >
                  <AlertTriangle className="h-8 w-8 text-destructive" />
                  <div className="font-medium text-destructive">Clear All Data</div>
                  <div className="text-sm text-muted-foreground text-center">Remove all transactions</div>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear All Data</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete all your transactions, categories, budgets, and settings.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleClearAllData}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Clear All Data
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
