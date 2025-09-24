import { Transaction } from "@shared/schema";
import { format } from "date-fns";

export function exportTransactionsToCSV(transactions: Transaction[]): string {
  const headers = ['Date', 'Description', 'Category', 'Type', 'Amount'];
  
  const csvContent = [
    headers.join(','),
    ...transactions.map(transaction => [
      format(new Date(transaction.date), 'yyyy-MM-dd'),
      `"${transaction.description || ''}"`,
      `"${transaction.category}"`,
      transaction.type,
      transaction.amount
    ].join(','))
  ].join('\n');

  return csvContent;
}

export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export function formatCurrency(amount: number | string, currency: string = 'USD'): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(numAmount);
}

export function formatDate(date: Date | string, format: string = 'MM/dd/yyyy'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  switch (format) {
    case 'DD/MM/YYYY':
      return dateObj.toLocaleDateString('en-GB');
    case 'YYYY-MM-DD':
      return dateObj.toISOString().split('T')[0];
    default:
      return dateObj.toLocaleDateString('en-US');
  }
}
