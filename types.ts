export enum ReceiptStatus {
  OPEN = 'Em Aberto',
  PAID = 'Quitado',
  CANCELLED = 'Cancelado'
}

export interface Deduction {
  id: string;
  receiptId: string;
  date: string; // ISO Date string YYYY-MM-DD
  value: number;
  description: string;
  createdAt: string;
}

export interface Receipt {
  id: string;
  receiptNumber: string;
  date: string; // ISO Date string YYYY-MM-DD
  client: string;
  totalValue: number;
  description: string;
  status: ReceiptStatus;
  createdAt: string;
  updatedAt: string;
}

// Extended interface for UI display with calculated fields
export interface ReceiptWithCalculations extends Receipt {
  totalDeducted: number;
  balance: number;
}

export interface User {
  username: string;
  password: string;
}

export interface Message {
  id: string;
  sender: string;
  receiver: string;
  content: string;
  timestamp: string;
  read: boolean;
}
