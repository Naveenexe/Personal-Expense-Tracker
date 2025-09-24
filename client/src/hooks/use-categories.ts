import { useState, useEffect } from 'react';
import { Category } from '@shared/schema';
import { LocalStorage } from '@/lib/storage';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = () => {
      try {
        const data = LocalStorage.getCategories();
        setCategories(data);
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  const addCategory = (category: Category) => {
    LocalStorage.addCategory(category);
    setCategories(prev => [...prev, category]);
  };

  const deleteCategory = (id: string) => {
    LocalStorage.deleteCategory(id);
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  const getCategoriesByType = (type: 'income' | 'expense') => {
    return categories.filter(cat => cat.type === type);
  };

  return {
    categories,
    loading,
    addCategory,
    deleteCategory,
    getCategoriesByType,
  };
}
