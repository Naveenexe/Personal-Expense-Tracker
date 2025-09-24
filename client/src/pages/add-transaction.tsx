import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTransactions } from "@/hooks/use-transactions";
import { useCategories } from "@/hooks/use-categories";
import { useToast } from "@/hooks/use-toast";
import { ArrowUp, ArrowDown, Plus } from "lucide-react";
import { useLocation } from "wouter";
import { Transaction } from "@shared/schema";

const transactionSchema = z.object({
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Amount must be a positive number",
  }),
  type: z.enum(["income", "expense"]),
  category: z.string().min(1, "Category is required"),
  date: z.string().min(1, "Date is required"),
  description: z.string().optional(),
});

type TransactionForm = z.infer<typeof transactionSchema>;

export default function AddTransaction() {
  const [, setLocation] = useLocation();
  const [selectedType, setSelectedType] = useState<"income" | "expense">("expense");
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  
  const { addTransaction } = useTransactions();
  const { categories, addCategory, getCategoriesByType } = useCategories();
  const { toast } = useToast();

  const form = useForm<TransactionForm>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "expense",
      date: new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit = (data: TransactionForm) => {
    try {
      const transaction: Transaction = {
        id: crypto.randomUUID(),
        amount: data.amount,
        type: data.type,
        category: data.category,
        description: data.description || null,
        date: new Date(data.date),
        createdAt: new Date(),
      };

      addTransaction(transaction);
      
      toast({
        title: "Transaction added",
        description: `${data.type === 'income' ? 'Income' : 'Expense'} of $${data.amount} has been recorded.`,
      });

      form.reset({
        type: selectedType,
        date: new Date().toISOString().split('T')[0],
      });
      
      setLocation('/transactions');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add transaction. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;

    const newCategory = {
      id: crypto.randomUUID(),
      name: newCategoryName.trim(),
      type: selectedType,
      isCustom: true,
    };

    addCategory(newCategory);
    setNewCategoryName("");
    setIsAddCategoryOpen(false);
    
    toast({
      title: "Category added",
      description: `${newCategoryName} has been added to ${selectedType} categories.`,
    });
  };

  const relevantCategories = getCategoriesByType(selectedType);

  return (
    <div className="max-w-2xl mx-auto" data-testid="add-transaction-page">
      <Card>
        <CardHeader>
          <CardTitle data-testid="page-title">Add New Transaction</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Transaction Type */}
            <div>
              <Label className="block text-sm font-medium mb-2">Transaction Type</Label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedType("expense");
                    form.setValue("type", "expense");
                  }}
                  className={`flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer hover:bg-accent transition-colors ${
                    selectedType === "expense" ? "border-primary bg-primary/5" : "border-border"
                  }`}
                  data-testid="type-expense"
                >
                  <div className="text-center">
                    <ArrowDown className="text-red-500 h-8 w-8 mb-2 mx-auto" />
                    <div className="font-medium">Expense</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedType("income");
                    form.setValue("type", "income");
                  }}
                  className={`flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer hover:bg-accent transition-colors ${
                    selectedType === "income" ? "border-primary bg-primary/5" : "border-border"
                  }`}
                  data-testid="type-income"
                >
                  <div className="text-center">
                    <ArrowUp className="text-green-500 h-8 w-8 mb-2 mx-auto" />
                    <div className="font-medium">Income</div>
                  </div>
                </button>
              </div>
              {form.formState.errors.type && (
                <p className="text-destructive text-sm mt-1" data-testid="type-error">
                  {form.formState.errors.type.message}
                </p>
              )}
            </div>

            {/* Amount */}
            <div>
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-muted-foreground">$</span>
                </div>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="pl-8"
                  {...form.register("amount")}
                  data-testid="input-amount"
                />
              </div>
              {form.formState.errors.amount && (
                <p className="text-destructive text-sm mt-1" data-testid="amount-error">
                  {form.formState.errors.amount.message}
                </p>
              )}
            </div>

            {/* Category */}
            <div>
              <Label htmlFor="category">Category</Label>
              <div className="flex space-x-2">
                <Select onValueChange={(value) => form.setValue("category", value)}>
                  <SelectTrigger className="flex-1" data-testid="select-category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {relevantCategories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      type="button" 
                      variant="secondary" 
                      size="icon"
                      data-testid="button-add-category"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Custom Category</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="new-category">Category Name</Label>
                        <Input
                          id="new-category"
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          placeholder="Enter category name"
                          data-testid="input-new-category"
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsAddCategoryOpen(false)}
                          data-testid="button-cancel-category"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          onClick={handleAddCategory}
                          data-testid="button-save-category"
                        >
                          Add Category
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              {form.formState.errors.category && (
                <p className="text-destructive text-sm mt-1" data-testid="category-error">
                  {form.formState.errors.category.message}
                </p>
              )}
            </div>

            {/* Date */}
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                {...form.register("date")}
                data-testid="input-date"
              />
              {form.formState.errors.date && (
                <p className="text-destructive text-sm mt-1" data-testid="date-error">
                  {form.formState.errors.date.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                rows={3}
                placeholder="Add a note about this transaction..."
                {...form.register("description")}
                data-testid="input-description"
              />
            </div>

            {/* Submit Button */}
            <div className="flex space-x-4">
              <Button 
                type="submit" 
                className="flex-1"
                data-testid="button-submit"
              >
                Add Transaction
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation('/')}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
