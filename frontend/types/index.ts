// TypeScript interfaces and types for Pulse dApp

export interface Bill {
  id: string;
  service: string;
  dueDate: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'AutoPay Enabled';
  description?: string;
  category: string;
  lastPaid?: string;
  payee?: string; // Recipient address
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  timestamp: string;
  read: boolean;
}

export interface AutoPayConfig {
  billId: string;
  paymentDate: number; // Day of month (1-31)
  frequency: 'Monthly' | 'Quarterly' | 'Yearly';
  maxAmount: number;
  enabled: boolean;
}

export interface FormData {
  amount: number;
  description: string;
  address: string;
  dueDate?: string; // Optional due date
}

export type FilterStatus = 'All' | 'Pending' | 'Paid' | 'AutoPay Enabled';