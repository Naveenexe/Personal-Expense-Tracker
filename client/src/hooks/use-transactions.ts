import { useState, useEffect } from 'react';
import { Transaction } from '@shared/schema';
import { LocalStorage } from '@/lib/storage';
import { TransactionFilters } from '@/types';

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTransactions = () => {
      try {
        const data = LocalStorage.getTransactions();
        setTransactions(data);
      } catch (error) {
        console.error('Error loading transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, []);

  const addTransaction = (transaction: Transaction) => {
    LocalStorage.addTransaction(transaction);
    setTransactions(prev => [transaction, ...prev]);
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    LocalStorage.updateTransaction(id, updates);
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTransaction = (id: string) => {
    LocalStorage.deleteTransaction(id);
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const filterTransactions = (filters: TransactionFilters) => {
    return transactions.filter(transaction => {
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

      if (filters.amountMin) {
        const amount = parseFloat(transaction.amount);
        if (amount < filters.amountMin) {
          return false;
        }
      }

      if (filters.amountMax) {
        const amount = parseFloat(transaction.amount);
        if (amount > filters.amountMax) {
          return false;
        }
      }

      return true;
    });
  };

  return {
    transactions,
    loading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    filterTransactions,
  };
}
