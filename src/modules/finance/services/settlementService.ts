import { supabase } from '../../../lib/supabase';

export interface SettlementStatistics {
  farms_ready_for_settlement: number;
  farms_settled: number;
  farms_owned_by_platform: number;
  platform_wallet_balance: number;
  charity_wallet_balance: number;
  charity_percentage: number;
}

export interface SettlementResult {
  success: boolean;
  message?: string;
  error?: string;
  transaction_code?: string;
  farm_code?: string;
  farm_name?: string;
  owner_name?: string;
  amount_settled?: number;
  executed_by?: string;
  executed_at?: string;
}

export interface SettlementTransaction {
  id: string;
  transaction_code: string;
  farm_code: string;
  transaction_type: string;
  amount: number;
  from_wallet: string;
  to_wallet: string;
  executed_by_name: string;
  execution_method: string;
  status: string;
  description_ar: string;
  created_at: string;
  completed_at: string;
}

export interface FinancialAuditLog {
  id: string;
  log_code: string;
  timestamp: string;
  action_type: string;
  entity_type: string;
  entity_code: string;
  from_wallet: string;
  to_wallet: string;
  amount: number;
  executed_by_name: string;
  description_ar: string;
  status: string;
}

export class SettlementService {
  static async executeSettlement(farmCode: string): Promise<SettlementResult> {
    return this.executeManualSettlement(
      farmCode,
      'ADMIN',
      'مدير النظام'
    );
  }

  static async executeManualSettlement(
    farmCode: string,
    executedById: string,
    executedByName: string
  ): Promise<SettlementResult> {
    try {
      const { data, error } = await supabase.rpc('execute_manual_settlement', {
        p_farm_code: farmCode,
        p_executed_by_id: executedById,
        p_executed_by_name: executedByName
      });

      if (error) {
        console.error('❌ Error executing settlement:', error);
        return {
          success: false,
          error: error.message
        };
      }

      if (!data.success) {
        return data as SettlementResult;
      }

      console.log('✅ Settlement executed successfully:', data);

      await this.distributeProfits(farmCode);

      return data as SettlementResult;
    } catch (error) {
      console.error('❌ Settlement error:', error);
      return {
        success: false,
        error: 'حدث خطأ أثناء تنفيذ التسوية'
      };
    }
  }

  static async distributeProfits(farmCode: string): Promise<void> {
    try {
      const { data, error } = await supabase.rpc('distribute_profits_to_platform_and_charity', {
        p_farm_code: farmCode
      });

      if (error) {
        console.error('❌ Error distributing profits:', error);
        return;
      }

      console.log('✅ Profits distributed:', data);
    } catch (error) {
      console.error('❌ Profit distribution error:', error);
    }
  }

  static async getSettlementStatistics(): Promise<SettlementStatistics> {
    try {
      const { data, error } = await supabase.rpc('get_settlement_statistics');

      if (error) {
        console.error('❌ Error fetching statistics:', error);
        return {
          farms_ready_for_settlement: 0,
          farms_settled: 0,
          farms_owned_by_platform: 0,
          platform_wallet_balance: 0,
          charity_wallet_balance: 0,
          charity_percentage: 25
        };
      }

      return data as SettlementStatistics;
    } catch (error) {
      console.error('❌ Statistics error:', error);
      return {
        farms_ready_for_settlement: 0,
        farms_settled: 0,
        farms_owned_by_platform: 0,
        platform_wallet_balance: 0,
        charity_wallet_balance: 0,
        charity_percentage: 25
      };
    }
  }

  static async getSettlementTransactions(farmCode?: string): Promise<SettlementTransaction[]> {
    try {
      let query = supabase
        .from('settlement_transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (farmCode) {
        query = query.eq('farm_code', farmCode);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Error fetching transactions:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('❌ Transactions error:', error);
      return [];
    }
  }

  static async getFinancialAuditLog(limit: number = 50): Promise<FinancialAuditLog[]> {
    try {
      const { data, error } = await supabase
        .from('financial_audit_log')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('❌ Error fetching audit log:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('❌ Audit log error:', error);
      return [];
    }
  }

  static async getFarmsReadyForSettlement() {
    try {
      const { data, error } = await supabase
        .from('smart_farm_finances')
        .select('*')
        .eq('settlement_status', 'ready_for_settlement')
        .is('deleted_at', null)
        .order('settlement_ready_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching ready farms:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('❌ Ready farms error:', error);
      return [];
    }
  }

  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  static getSettlementStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      collecting: 'جمع إيرادات',
      ready_for_settlement: 'جاهزة للتسوية',
      settling: 'قيد التسوية',
      settled: 'تمت التسوية',
      owned_by_platform: 'مملوكة للمنصة'
    };
    return labels[status] || status;
  }

  static getSettlementStatusColor(status: string): string {
    const colors: Record<string, string> = {
      collecting: 'from-blue-500 to-cyan-600',
      ready_for_settlement: 'from-yellow-500 to-amber-600',
      settling: 'from-orange-500 to-red-600',
      settled: 'from-green-500 to-emerald-600',
      owned_by_platform: 'from-purple-500 to-violet-600'
    };
    return colors[status] || 'from-gray-500 to-slate-600';
  }
}
