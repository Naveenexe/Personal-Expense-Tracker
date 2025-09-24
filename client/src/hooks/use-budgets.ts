import { useState, useEffect } from 'react';
import { Budget } from '@shared/schema';
import { LocalStorage } from '@/lib/storage';

export function useBudgets() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBudgets = () => {
      try {
        const data = LocalStorage.getBudgets();
        setBudgets(data);
      } catch (error) {
        console.error('Error loading budgets:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBudgets();
  }, []);

  const addBudget = (budget: Budget) => {
    LocalStorage.addBudget(budget);
    setBudgets(prev => [...prev, budget]);
  };

  const updateBudget = (id: string, updates: Partial<Budget>) => {
    LocalStorage.updateBudget(id, updates);
    setBudgets(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const deleteBudget = (id: string) => {
    LocalStorage.deleteBudget(id);
    setBudgets(prev => prev.filter(b => b.id !== id));
  };

  return {
    budgets,
    loading,
    addBudget,
    updateBudget,
    deleteBudget,
  };
}
