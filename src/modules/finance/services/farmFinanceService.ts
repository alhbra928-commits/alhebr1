import { supabase } from '../../../lib/supabase';

export interface FarmWallet {
  id: string;
  farm_barcode: string;
  balance: number;
  total_income: number;
  total_expense: number;
  frozen_amount: number;
  status: 'active' | 'settling' | 'completed' | 'frozen';
  owner_payment_due?: number;
  owner_payment_paid?: number;
  owner_payment_status?: 'pending' | 'partial' | 'completed';
  owner_payment_completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface FarmLedgerEntry {
  id: string;
  farm_barcode: string;
  transaction_type: 'income' | 'expense' | 'transfer_in' | 'transfer_out' | 'investor_deposit' | 'settlement';
  amount: number;
  category?: 'irrigation' | 'labor' | 'planting' | 'transport' | 'admin' | 'other';
  description?: string;
  from_entity?: string;
  to_entity?: string;
  reference_id?: string;
  executed_by?: string;
  status: 'pending' | 'completed' | 'cancelled';
  transaction_date: string;
  created_at: string;
}

export interface FarmExpense {
  id: string;
  farm_barcode: string;
  category: 'irrigation' | 'labor' | 'planting' | 'transport' | 'admin';
  amount: number;
  description?: string;
  receipt_number?: string;
  vendor?: string;
  expense_date: string;
  created_by?: string;
  created_at: string;
}

export interface FarmInvestorLedger {
  id: string;
  farm_barcode: string;
  investor_id: string;
  investment_amount: number;
  ownership_percentage?: number;
  certificate_number?: string;
  status: 'active' | 'completed' | 'withdrawn';
  investment_date: string;
  created_at: string;
}

export interface FarmFinancialState {
  id: string;
  farm_barcode: string;
  current_state: 'active' | 'settling' | 'completed' | 'frozen';
  previous_state?: string;
  state_changed_at: string;
  changed_by?: string;
  reason?: string;
  created_at: string;
  updated_at: string;
}

export interface FarmFinancialClosure {
  id: string;
  farm_barcode: string;
  closure_date: string;
  final_balance: number;
  total_income: number;
  total_expense: number;
  total_profit: number;
  charity_amount: number;
  report_url?: string;
  closed_by?: string;
  transferred_to_agriculture: boolean;
  created_at: string;
}

export interface FarmFinancialSummary {
  wallet: FarmWallet;
  recentTransactions: FarmLedgerEntry[];
  totalExpensesByCategory: Record<string, number>;
  investorsCount: number;
  totalInvestment: number;
  state: FarmFinancialState;
}

export class FarmFinanceService {
  static async getFarmWallet(barcode: string): Promise<FarmWallet | null> {
    console.log(`💰 [getFarmWallet] جلب محفظة: ${barcode}`);

    const { data, error } = await supabase
      .from('farm_wallets')
      .select('*')
      .eq('farm_barcode', barcode)
      .maybeSingle();

    if (error) {
      console.error(`❌ [getFarmWallet] خطأ:`, error);
      throw error;
    }

    console.log(`✅ [getFarmWallet] النتيجة:`, data);
    return data;
  }

  static async getAllFarmWallets(): Promise<FarmWallet[]> {
    const { data, error } = await supabase
      .from('farm_wallets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getFarmTransactions(
    barcode: string,
    limit: number = 50
  ): Promise<FarmLedgerEntry[]> {
    const { data, error } = await supabase
      .from('farm_ledgers')
      .select('*')
      .eq('farm_barcode', barcode)
      .order('transaction_date', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  static async getFarmExpenses(
    barcode: string,
    limit: number = 50
  ): Promise<FarmExpense[]> {
    const { data, error } = await supabase
      .from('farm_expenses')
      .select('*')
      .eq('farm_barcode', barcode)
      .order('expense_date', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  static async getFarmExpensesByCategory(barcode: string): Promise<Record<string, number>> {
    const { data, error } = await supabase
      .from('farm_expenses')
      .select('category, amount')
      .eq('farm_barcode', barcode);

    if (error) throw error;

    const summary: Record<string, number> = {
      irrigation: 0,
      labor: 0,
      planting: 0,
      transport: 0,
      admin: 0,
    };

    if (data) {
      data.forEach((expense) => {
        summary[expense.category] = (summary[expense.category] || 0) + Number(expense.amount);
      });
    }

    return summary;
  }

  static async getFarmInvestors(barcode: string): Promise<FarmInvestorLedger[]> {
    const { data, error } = await supabase
      .from('farm_investors_ledger')
      .select('*')
      .eq('farm_barcode', barcode)
      .order('investment_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getFarmFinancialState(barcode: string): Promise<FarmFinancialState | null> {
    console.log(`📈 [getFarmFinancialState] جلب الحالة المالية: ${barcode}`);

    const { data, error } = await supabase
      .from('farm_financial_states')
      .select('*')
      .eq('farm_barcode', barcode)
      .maybeSingle();

    if (error) {
      console.error(`❌ [getFarmFinancialState] خطأ:`, error);
      throw error;
    }

    console.log(`✅ [getFarmFinancialState] النتيجة:`, data);
    return data;
  }

  static async getFarmFinancialSummary(barcode: string): Promise<FarmFinancialSummary | null> {
    console.log(`🔍 [getFarmFinancialSummary] بدء جلب الملخص المالي لـ: ${barcode}`);

    const [wallet, transactions, expensesByCategory, investors, state] = await Promise.all([
      this.getFarmWallet(barcode),
      this.getFarmTransactions(barcode, 10),
      this.getFarmExpensesByCategory(barcode),
      this.getFarmInvestors(barcode),
      this.getFarmFinancialState(barcode),
    ]);

    console.log(`📊 [getFarmFinancialSummary] النتائج:`, {
      wallet,
      transactions: transactions?.length,
      expensesByCategory,
      investors: investors?.length,
      state,
    });

    if (!wallet) {
      console.error(`❌ [getFarmFinancialSummary] لا توجد محفظة لـ: ${barcode}`);
      return null;
    }

    if (!state) {
      console.error(`❌ [getFarmFinancialSummary] لا توجد حالة مالية لـ: ${barcode}`);
      return null;
    }

    const totalInvestment = investors.reduce((sum, inv) => sum + Number(inv.investment_amount), 0);

    const summary = {
      wallet,
      recentTransactions: transactions,
      totalExpensesByCategory: expensesByCategory,
      investorsCount: investors.length,
      totalInvestment,
      state,
    };

    console.log(`✅ [getFarmFinancialSummary] الملخص النهائي:`, summary);

    return summary;
  }

  static async addIncome(
    barcode: string,
    amount: number,
    description: string,
    fromEntity: string = 'platform'
  ): Promise<FarmLedgerEntry> {
    const { data, error } = await supabase
      .from('farm_ledgers')
      .insert({
        farm_barcode: barcode,
        transaction_type: 'income',
        amount,
        description,
        from_entity: fromEntity,
        to_entity: `farm_${barcode}`,
        status: 'completed',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async addExpense(
    barcode: string,
    amount: number,
    category: FarmExpense['category'],
    description: string,
    receiptNumber?: string,
    vendor?: string
  ): Promise<{ ledger: FarmLedgerEntry; expense: FarmExpense }> {
    const [ledgerResult, expenseResult] = await Promise.all([
      supabase
        .from('farm_ledgers')
        .insert({
          farm_barcode: barcode,
          transaction_type: 'expense',
          amount,
          category,
          description,
          from_entity: `farm_${barcode}`,
          to_entity: vendor || 'external',
          status: 'completed',
        })
        .select()
        .single(),

      supabase
        .from('farm_expenses')
        .insert({
          farm_barcode: barcode,
          category,
          amount,
          description,
          receipt_number: receiptNumber,
          vendor,
        })
        .select()
        .single(),
    ]);

    if (ledgerResult.error) throw ledgerResult.error;
    if (expenseResult.error) throw expenseResult.error;

    return {
      ledger: ledgerResult.data,
      expense: expenseResult.data,
    };
  }

  static async addInvestorDeposit(
    barcode: string,
    investorId: string,
    amount: number,
    certificateNumber?: string
  ): Promise<{ ledger: FarmLedgerEntry; investorRecord: FarmInvestorLedger }> {
    const [ledgerResult, investorResult] = await Promise.all([
      supabase
        .from('farm_ledgers')
        .insert({
          farm_barcode: barcode,
          transaction_type: 'investor_deposit',
          amount,
          description: `إيداع مستثمر - شهادة ${certificateNumber || 'N/A'}`,
          from_entity: `investor_${investorId}`,
          to_entity: `farm_${barcode}`,
          reference_id: investorId,
          status: 'completed',
        })
        .select()
        .single(),

      supabase
        .from('farm_investors_ledger')
        .insert({
          farm_barcode: barcode,
          investor_id: investorId,
          investment_amount: amount,
          certificate_number: certificateNumber,
          status: 'active',
        })
        .select()
        .single(),
    ]);

    if (ledgerResult.error) throw ledgerResult.error;
    if (investorResult.error) throw investorResult.error;

    return {
      ledger: ledgerResult.data,
      investorRecord: investorResult.data,
    };
  }

  static async updateFarmState(
    barcode: string,
    newState: FarmFinancialState['current_state'],
    reason?: string
  ): Promise<FarmFinancialState> {
    const currentState = await this.getFarmFinancialState(barcode);
    if (!currentState) {
      throw new Error('Farm financial state not found');
    }

    const { data, error } = await supabase
      .from('farm_financial_states')
      .update({
        previous_state: currentState.current_state,
        current_state: newState,
        state_changed_at: new Date().toISOString(),
        reason,
      })
      .eq('farm_barcode', barcode)
      .select()
      .single();

    if (error) throw error;

    await supabase.from('farm_wallets').update({ status: newState }).eq('farm_barcode', barcode);

    return data;
  }

  static async closeFarmFinancially(
    barcode: string,
    charityAmount: number = 0
  ): Promise<FarmFinancialClosure> {
    const wallet = await this.getFarmWallet(barcode);
    if (!wallet) {
      throw new Error('Farm wallet not found');
    }

    await this.updateFarmState(barcode, 'completed', 'إغلاق مالي نهائي');

    const totalProfit = wallet.total_income - wallet.total_expense;

    const { data, error } = await supabase
      .from('farm_financial_closures')
      .insert({
        farm_barcode: barcode,
        final_balance: wallet.balance,
        total_income: wallet.total_income,
        total_expense: wallet.total_expense,
        total_profit: totalProfit,
        charity_amount: charityAmount,
        transferred_to_agriculture: false,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async searchFarmsByBarcode(searchTerm: string): Promise<FarmWallet[]> {
    const { data, error } = await supabase
      .from('farm_wallets')
      .select('*')
      .ilike('farm_barcode', `%${searchTerm}%`)
      .limit(10);

    if (error) throw error;
    return data || [];
  }

  static async createManualBackup(barcode: string): Promise<any> {
    const { data, error } = await supabase.rpc('create_instant_backup', {
      barcode_param: barcode,
      trigger_operation: 'manual_backup',
    });

    if (error) throw error;
    return data;
  }

  static async getBackupHistory(barcode: string, limit: number = 20): Promise<any[]> {
    const { data, error } = await supabase
      .from('farm_financial_backups')
      .select('*')
      .eq('farm_barcode', barcode)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  static async getBackupSchedule(barcode: string): Promise<any> {
    const { data, error } = await supabase
      .from('farm_financial_backup_schedule')
      .select('*')
      .eq('farm_barcode', barcode)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  static async createScheduledBackup(barcode: string): Promise<any> {
    const { data, error } = await supabase.rpc('create_scheduled_backup', {
      barcode_param: barcode,
    });

    if (error) throw error;
    return data;
  }

  static async createMonthlyArchive(barcode: string): Promise<any> {
    const { data, error } = await supabase.rpc('create_monthly_archive', {
      barcode_param: barcode,
    });

    if (error) throw error;
    return data;
  }

  static async restoreFromBackup(backupId: string): Promise<any> {
    const { data, error } = await supabase
      .from('farm_financial_backups')
      .select('*')
      .eq('id', backupId)
      .single();

    if (error) throw error;
    return data?.backup_data;
  }

  static async transferIn(
    barcode: string,
    amount: number,
    fromBarcode: string,
    description?: string
  ): Promise<FarmLedgerEntry> {
    const { data, error } = await supabase
      .from('farm_ledgers')
      .insert({
        farm_barcode: barcode,
        transaction_type: 'transfer_in',
        amount,
        description: description || `تحويل من ${fromBarcode}`,
        from_entity: `farm_${fromBarcode}`,
        to_entity: `farm_${barcode}`,
        status: 'completed',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async transferOut(
    barcode: string,
    amount: number,
    toBarcode: string,
    description?: string
  ): Promise<FarmLedgerEntry> {
    const { data, error } = await supabase
      .from('farm_ledgers')
      .insert({
        farm_barcode: barcode,
        transaction_type: 'transfer_out',
        amount,
        description: description || `تحويل إلى ${toBarcode}`,
        from_entity: `farm_${barcode}`,
        to_entity: `farm_${toBarcode}`,
        status: 'completed',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async settlement(
    barcode: string,
    amount: number,
    description: string
  ): Promise<FarmLedgerEntry> {
    const { data, error } = await supabase
      .from('farm_ledgers')
      .insert({
        farm_barcode: barcode,
        transaction_type: 'settlement',
        amount,
        description,
        from_entity: `farm_${barcode}`,
        to_entity: 'settlement',
        status: 'completed',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getTodaySummary(barcode: string): Promise<{
    todayIncome: number;
    todayExpense: number;
    todayTransactions: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from('farm_ledgers')
      .select('transaction_type, amount')
      .eq('farm_barcode', barcode)
      .gte('transaction_date', today.toISOString());

    if (error) throw error;

    const todayIncome = (data || [])
      .filter((t) => ['income', 'transfer_in', 'investor_deposit'].includes(t.transaction_type))
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const todayExpense = (data || [])
      .filter((t) => ['expense', 'transfer_out'].includes(t.transaction_type))
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return {
      todayIncome,
      todayExpense,
      todayTransactions: data?.length || 0,
    };
  }
}
