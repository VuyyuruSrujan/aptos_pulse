import { Bill, Notification } from '../types';

export const mockBills: Bill[] = [
  {
    id: '1',
    service: 'Electricity',
    dueDate: '2024-01-15',
    amount: 125.50,
    status: 'Pending',
    description: 'Monthly electricity bill',
    category: 'Utilities',
    lastPaid: '2023-12-15'
  },
  {
    id: '2',
    service: 'Internet',
    dueDate: '2024-01-18',
    amount: 79.99,
    status: 'AutoPay Enabled',
    description: 'Fiber internet service',
    category: 'Telecommunications',
    lastPaid: '2023-12-18'
  },
  {
    id: '3',
    service: 'Water',
    dueDate: '2024-01-10',
    amount: 45.25,
    status: 'Paid',
    description: 'Municipal water service',
    category: 'Utilities',
    lastPaid: '2024-01-08'
  },
  {
    id: '4',
    service: 'Gas',
    dueDate: '2024-01-20',
    amount: 98.75,
    status: 'Pending',
    description: 'Natural gas heating',
    category: 'Utilities'
  },
  {
    id: '5',
    service: 'Mobile Phone',
    dueDate: '2024-01-25',
    amount: 65.00,
    status: 'AutoPay Enabled',
    description: 'Unlimited mobile plan',
    category: 'Telecommunications',
    lastPaid: '2023-12-25'
  },
  {
    id: '6',
    service: 'Insurance',
    dueDate: '2024-01-30',
    amount: 225.00,
    status: 'Pending',
    description: 'Home insurance premium',
    category: 'Insurance'
  }
];

export const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Bill Due Soon',
    message: 'Your electricity bill of $125.50 is due in 3 days',
    type: 'warning',
    timestamp: '2024-01-12T10:30:00Z',
    read: false
  },
  {
    id: '2',
    title: 'AutoPay Successful',
    message: 'Internet bill of $79.99 has been automatically paid',
    type: 'success',
    timestamp: '2024-01-11T14:20:00Z',
    read: false
  },
  {
    id: '3',
    title: 'Payment Reminder',
    message: 'Gas bill of $98.75 is due in 8 days',
    type: 'info',
    timestamp: '2024-01-10T09:15:00Z',
    read: true
  },
  {
    id: '4',
    title: 'AutoPay Enabled',
    message: 'AutoPay has been successfully enabled for Mobile Phone',
    type: 'success',
    timestamp: '2024-01-09T16:45:00Z',
    read: true
  }
];