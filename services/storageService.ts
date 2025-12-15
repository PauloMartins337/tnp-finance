import { Receipt, Deduction, ReceiptStatus, ReceiptWithCalculations } from '../types';
import { supabase } from './supabase';
import { AuthService } from './authService';

export const StorageService = {
  getReceipts: async (): Promise<Receipt[]> => {
    const { data, error } = await supabase
      .from('receipts')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) throw error;
    
    // Map snake_case to camelCase
    return (data || []).map((r: any) => ({
      id: r.id,
      receiptNumber: r.receipt_number,
      date: r.date,
      client: r.client,
      totalValue: r.total_value,
      description: r.description,
      status: r.status as ReceiptStatus,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    }));
  },

  getDeductions: async (receiptId?: string): Promise<Deduction[]> => {
    let query = supabase.from('deductions').select('*');
    
    if (receiptId) {
      query = query.eq('receipt_id', receiptId);
    }
    
    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map((d: any) => ({
      id: d.id,
      receiptId: d.receipt_id,
      date: d.date,
      value: d.value,
      description: d.description,
      createdAt: d.created_at
    }));
  },

  saveReceipt: async (receipt: Omit<Receipt, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<Receipt> => {
    const userId = await AuthService.getCurrentUserId();
    if (!userId) throw new Error('Usuário não autenticado');

    // Check uniqueness
    const { data: existing } = await supabase
      .from('receipts')
      .select('id')
      .eq('receipt_number', receipt.receiptNumber)
      .single();
      
    if (existing) {
      throw new Error(`Recibo com número ${receipt.receiptNumber} já existe.`);
    }

    const { data, error } = await supabase
      .from('receipts')
      .insert({
        receipt_number: receipt.receiptNumber,
        date: receipt.date,
        client: receipt.client,
        total_value: receipt.totalValue,
        description: receipt.description,
        status: ReceiptStatus.OPEN,
        user_id: userId
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      receiptNumber: data.receipt_number,
      date: data.date,
      client: data.client,
      totalValue: data.total_value,
      description: data.description,
      status: data.status as ReceiptStatus,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  addDeduction: async (deduction: Omit<Deduction, 'id' | 'createdAt'>): Promise<Deduction> => {
    // Get receipt to check balance
    const { data: receipt, error: rError } = await supabase
      .from('receipts')
      .select('*')
      .eq('id', deduction.receiptId)
      .single();
      
    if (rError || !receipt) throw new Error('Recibo não encontrado');

    // Get current deductions
    const currentDeductions = await StorageService.getDeductions(receipt.id);
    const totalDeducted = currentDeductions.reduce((acc, curr) => acc + curr.value, 0);
    const balance = receipt.total_value - totalDeducted;

    if (deduction.value > balance) {
       throw new Error(`Valor do abatimento (R$ ${deduction.value}) excede o saldo restante (R$ ${balance}).`);
    }

    // Insert deduction
    const { data: newDeduction, error: dError } = await supabase
      .from('deductions')
      .insert({
        receipt_id: deduction.receiptId,
        date: deduction.date,
        value: deduction.value,
        description: deduction.description
      })
      .select()
      .single();

    if (dError) throw dError;

    // Update status if paid
    const newTotalDeducted = totalDeducted + deduction.value;
    if (Math.abs(receipt.total_value - newTotalDeducted) < 0.01) {
      await supabase
        .from('receipts')
        .update({ status: ReceiptStatus.PAID, updated_at: new Date().toISOString() })
        .eq('id', receipt.id);
    }

    return {
      id: newDeduction.id,
      receiptId: newDeduction.receipt_id,
      date: newDeduction.date,
      value: newDeduction.value,
      description: newDeduction.description,
      createdAt: newDeduction.created_at
    };
  },

  calculateReceiptStats: async (receipt: Receipt): Promise<ReceiptWithCalculations> => {
    const deductions = await StorageService.getDeductions(receipt.id);
    const totalDeducted = deductions.reduce((acc, curr) => acc + curr.value, 0);
    const balance = receipt.totalValue - totalDeducted;
    
    return {
      ...receipt,
      totalDeducted,
      balance
    };
  },

  getAllReceiptsWithStats: async (): Promise<ReceiptWithCalculations[]> => {
    const receipts = await StorageService.getReceipts();
    // Parallelize the stats calculation
    const statsPromises = receipts.map(r => StorageService.calculateReceiptStats(r));
    return Promise.all(statsPromises);
  },

  cancelReceipt: async (id: string) => {
    await supabase
      .from('receipts')
      .update({ status: ReceiptStatus.CANCELLED, updated_at: new Date().toISOString() })
      .eq('id', id);
  }
};
