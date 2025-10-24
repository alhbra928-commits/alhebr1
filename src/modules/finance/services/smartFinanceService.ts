import { supabase } from '../../../lib/supabase';

export interface SmartFarmFinance {
  id: string;
  farm_id: string;
  farm_code: string;
  farm_name: string;
  owner_id: string;
  owner_name: string;

  marketing_amount: number;
  actual_amount: number;
  coverage_percentage: number;
  remaining_amount: number;
  platform_profit: number;
  charity_amount: number;
  net_platform_profit: number;

  status: 'active' | 'in_progress' | 'completed' | 'closed';
  completion_stage: 'collecting' | 'owner_payment' | 'profit_calculation' | 'charity_deduction' | 'completed';

  owner_payment_date: string;
  completion_date: string;
  last_transaction_date: string;

  total_investors: number;
  total_trees_sold: number;
  total_transactions: number;

  financial_barcode: string;

  collected_from_investors?: number;
  remaining_for_owner?: number;
  completion_flash_shown?: boolean;
  flash_shown_at?: string;
  completion_percentage_visual?: number;
  financial_health_status?: 'low' | 'medium' | 'high' | 'complete';

  created_at: string;
  updated_at: string;
}

export interface FinancialTransaction {
  id: string;
  farm_finance_id: string;
  farm_code: string;
  transaction_type: 'marketing_income' | 'owner_payment' | 'platform_profit' | 'charity_deduction';
  amount: number;
  description: string;
  source_type: string;
  source_id: string;
  investor_name: string;
  reservation_code: string;
  transaction_date: string;
  created_at: string;
}

export interface CharityWallet {
  id: string;
  total_balance: number;
  total_received: number;
  total_distributed: number;
  farms_contributed: number;
  total_transactions: number;
  last_contribution_date: string;
  created_at: string;
  updated_at: string;
}

export interface CharityDeduction {
  id: string;
  farm_finance_id: string;
  farm_code: string;
  farm_name: string;
  platform_profit: number;
  charity_percentage: number;
  charity_amount: number;
  deduction_date: string;
  created_at: string;
}

export class SmartFinanceService {
  static async getAllFarmFinances(): Promise<SmartFarmFinance[]> {
    const { data, error } = await supabase
      .from('smart_farm_finances')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching farm finances:', error);
      throw error;
    }

    console.log('✅ تحميل البطاقات المالية:', data?.length || 0);
    return data || [];
  }

  static async getFarmFinanceByCode(farmCode: string): Promise<SmartFarmFinance | null> {
    const { data, error } = await supabase
      .from('smart_farm_finances')
      .is('deleted_at', null)
      .select('*')
      .eq('farm_code', farmCode)
      .maybeSingle();

    if (error) {
      console.error('❌ Error fetching farm finance:', error);
      throw error;
    }

    return data;
  }

  static async getTransactionsByFarmCode(farmCode: string): Promise<FinancialTransaction[]> {
    const { data, error } = await supabase
      .from('farm_financial_transactions')
      .select('*')
      .eq('farm_code', farmCode)
      .order('transaction_date', { ascending: false });

    if (error) {
      console.error('❌ Error fetching transactions:', error);
      throw error;
    }

    return data || [];
  }

  static async getCharityWallet(): Promise<CharityWallet | null> {
    const { data, error } = await supabase
      .from('platform_charity_wallet')
      .select('*')
      .maybeSingle();

    if (error) {
      console.error('❌ Error fetching charity wallet:', error);
      throw error;
    }

    return data;
  }

  static async getCharityDeductions(): Promise<CharityDeduction[]> {
    const { data, error } = await supabase
      .from('charity_deductions_log')
      .select('*')
      .order('deduction_date', { ascending: false })
      .limit(50);

    if (error) {
      console.error('❌ Error fetching charity deductions:', error);
      throw error;
    }

    return data || [];
  }

  static async getOverallStatistics() {
    const [finances, charity] = await Promise.all([
      this.getAllFarmFinances(),
      this.getCharityWallet()
    ]);

    const totalMarketing = finances.reduce((sum, f) => sum + Number(f.marketing_amount), 0);
    const totalActual = finances.reduce((sum, f) => sum + Number(f.actual_amount), 0);
    const totalProfit = finances.reduce((sum, f) => sum + Number(f.platform_profit), 0);
    const totalCharity = finances.reduce((sum, f) => sum + Number(f.charity_amount), 0);
    const totalInvestors = finances.reduce((sum, f) => sum + f.total_investors, 0);
    const totalTrees = finances.reduce((sum, f) => sum + f.total_trees_sold, 0);

    const activeFarms = finances.filter(f => f.status === 'active').length;
    const completedFarms = finances.filter(f => f.status === 'completed').length;
    const frozenFarms = finances.filter(f => f.is_frozen === true).length;

    return {
      totalMarketing,
      totalActual,
      totalProfit,
      totalCharity: charity?.total_balance || 0,
      totalInvestors,
      totalTrees,
      activeFarms,
      completedFarms,
      frozenFarms,
      avgCoverage: finances.length > 0
        ? finances.reduce((sum, f) => sum + Number(f.coverage_percentage), 0) / finances.length
        : 0
    };
  }

  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  static getStageLabel(stage: string): string {
    const labels: { [key: string]: string } = {
      collecting: 'جمع المبالغ التسويقية',
      owner_payment: 'سداد المالك',
      profit_calculation: 'حساب الأرباح',
      charity_deduction: 'استقطاع الخير',
      completed: 'مكتمل'
    };
    return labels[stage] || stage;
  }

  static getStageIcon(stage: string): string {
    const icons: { [key: string]: string } = {
      collecting: '💰',
      owner_payment: '💸',
      profit_calculation: '📊',
      charity_deduction: '💚',
      completed: '✅'
    };
    return icons[stage] || '📋';
  }

  static getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      active: 'from-blue-500 to-blue-600',
      in_progress: 'from-yellow-500 to-yellow-600',
      completed: 'from-green-500 to-green-600',
      closed: 'from-gray-500 to-gray-600'
    };
    return colors[status] || 'from-gray-500 to-gray-600';
  }

  static getCoverageColor(percentage: number): string {
    if (percentage < 25) return 'from-red-500 to-red-600';
    if (percentage < 50) return 'from-orange-500 to-orange-600';
    if (percentage < 75) return 'from-yellow-500 to-yellow-600';
    if (percentage < 100) return 'from-lime-500 to-lime-600';
    return 'from-green-500 to-green-600';
  }
}
