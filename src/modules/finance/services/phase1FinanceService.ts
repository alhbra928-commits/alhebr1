import { supabase } from '../../../lib/supabase';

export interface FarmFinancePhase1 {
  id: string;
  farm_id: string;
  farm_code: string;
  farm_name: string;
  financial_barcode: string;

  // From Farms Module
  marketing_amount: number;
  total_trees: number;
  price_per_tree: number;
  tree_type: string;

  // From Owners Module
  owner_id: string | null;
  owner_name: string | null;
  actual_amount: number;
  owner_mobile: string | null;

  // From Investors Module
  total_investors: number;
  total_invested: number;
  total_trees_sold: number;
  coverage_percentage: number;
  remaining_amount: number;

  // Phase 2: Revenue & Settlement
  total_revenue_collected: number;
  financial_completion_percentage: number;
  settlement_status: 'collecting' | 'ready_for_settlement' | 'settling' | 'settled' | 'owned_by_platform';
  completion_reached_at: string | null;
  settlement_initiated_at: string | null;
  investors_locked: boolean;
  total_financial_transactions: number;

  // Phase 3: Settlement System
  settlement_ready_at?: string;
  settlement_executed_at?: string;
  settlement_executed_by_id?: string;
  settlement_executed_by_name?: string;
  farm_ownership_status?: 'owner' | 'platform' | 'closed';
  investors_locked_for_settlement?: boolean;
  profit_distributed?: boolean;
  charity_distributed?: boolean;

  // Sync Status
  sync_status: 'pending' | 'syncing' | 'synced' | 'error';
  system_phase: string;

  // Relations Map
  relations_map_id: string | null;
  all_modules_synced: boolean;

  // Live Financial Stats (Phase 2 Enhancement)
  collected_from_investors?: number;
  remaining_for_owner?: number;
  completion_percentage_visual?: number;
  financial_health_status?: 'low' | 'medium' | 'high' | 'complete';
  completion_flash_shown?: boolean;
  flash_shown_at?: string;

  created_at: string;
  updated_at: string;
}

export interface FinancialRelationsMap {
  id: string;
  farm_code: string;

  farms_module_synced: boolean;
  farms_last_sync: string | null;

  owners_module_synced: boolean;
  owners_last_sync: string | null;

  investors_module_synced: boolean;
  investors_last_sync: string | null;

  all_modules_synced: boolean;

  total_investors: number;
  total_invested: number;
  total_trees_sold: number;
}

export interface FinancialLog {
  id: string;
  action_type: string;
  entity_type: string;
  entity_code: string;
  description_ar: string;
  performed_by_name: string | null;
  source_module: string;
  status: string;
  created_at: string;
}

export class Phase1FinanceService {
  static async getAllFarmFinances(): Promise<FarmFinancePhase1[]> {
    const { data: financesData, error: financesError } = await supabase
      .from('smart_farm_finances')
      .select('*')
      .eq('system_phase', 'phase_1')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (financesError) {
      console.error('Error fetching farm finances:', financesError);
      throw financesError;
    }

    if (!financesData || financesData.length === 0) {
      return [];
    }

    const farmIds = financesData.map(f => f.farm_id).filter(Boolean);

    const { data: farmsData, error: farmsError } = await supabase
      .from('farms')
      .select('id, tree_type')
      .in('id', farmIds);

    if (farmsError) {
      console.error('Error fetching farms data:', farmsError);
    }

    const farmsMap = new Map(farmsData?.map(f => [f.id, f.tree_type]) || []);

    const finances = financesData.map((finance: any) => ({
      ...finance,
      tree_type: farmsMap.get(finance.farm_id) || 'نخيل'
    }));

    return finances as FarmFinancePhase1[];
  }

  static async getFarmFinanceByCode(farmCode: string): Promise<FarmFinancePhase1 | null> {
    const { data, error } = await supabase
      .from('smart_farm_finances')
      .select('*')
      .eq('farm_code', farmCode)
      .single();

    if (error) {
      console.error('Error fetching farm finance:', error);
      return null;
    }

    return data as FarmFinancePhase1;
  }

  static async getRelationsMap(farmCode: string): Promise<FinancialRelationsMap | null> {
    const { data, error } = await supabase
      .from('farm_financial_relations')
      .select('*')
      .eq('farm_code', farmCode)
      .single();

    if (error) {
      console.error('Error fetching relations map:', error);
      return null;
    }

    return data as FinancialRelationsMap;
  }

  static async getFinancialLogs(farmCode?: string, limit = 50): Promise<FinancialLog[]> {
    let query = supabase
      .from('financial_base_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (farmCode) {
      query = query.eq('entity_code', farmCode);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching financial logs:', error);
      return [];
    }

    return data as FinancialLog[];
  }

  static async recalculateFarmFinances(farmCode: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .rpc('recalculate_farm_finances', { p_farm_code: farmCode });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error recalculating finances:', error);
      throw error;
    }
  }

  static async getStats() {
    const { data: finances } = await supabase
      .from('smart_farm_finances')
      .select('*')
      .is('deleted_at', null);

    if (!finances) {
      return {
        totalFarms: 0,
        totalMarketingAmount: 0,
        totalActualAmount: 0,
        totalInvested: 0,
        totalRevenueCollected: 0,
        averageCoverage: 0,
        averageCompletion: 0,
        syncedFarms: 0,
        readyForSettlement: 0
      };
    }

    const totalMarketingAmount = finances.reduce((sum, f) => sum + Number(f.marketing_amount || 0), 0);
    const totalActualAmount = finances.reduce((sum, f) => sum + Number(f.actual_amount || 0), 0);
    const totalInvested = finances.reduce((sum, f) => {
      const summary = f.investors_summary as any;
      return sum + Number(summary?.total_invested || 0);
    }, 0);
    const totalRevenueCollected = finances.reduce((sum, f) => sum + Number(f.total_revenue_collected || 0), 0);
    const averageCoverage = finances.reduce((sum, f) => sum + Number(f.coverage_percentage || 0), 0) / finances.length;
    const averageCompletion = finances.reduce((sum, f) => sum + Number(f.financial_completion_percentage || 0), 0) / finances.length;
    const syncedFarms = finances.filter(f => f.sync_status === 'synced').length;
    const readyForSettlement = finances.filter(f => f.settlement_status === 'ready_for_settlement').length;

    return {
      totalFarms: finances.length,
      totalMarketingAmount,
      totalActualAmount,
      totalInvested,
      totalRevenueCollected,
      averageCoverage,
      averageCompletion,
      syncedFarms,
      readyForSettlement
    };
  }

  static async getFinancialTransactions(farmCode: string, limit = 50) {
    const { data, error } = await supabase
      .from('farm_financial_transactions')
      .select('*')
      .eq('farm_code', farmCode)
      .is('deleted_at', null)
      .order('transaction_date', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }

    return data || [];
  }

  static async getRevenueSnapshots(farmCode: string, limit = 20) {
    const { data, error } = await supabase
      .from('farm_revenue_snapshots')
      .select('*')
      .eq('farm_code', farmCode)
      .order('snapshot_date', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching snapshots:', error);
      return [];
    }

    return data || [];
  }

  static async initiateSettlement(farmCode: string, initiatedBy?: string) {
    try {
      const { data, error } = await supabase
        .rpc('initiate_settlement', {
          p_farm_code: farmCode,
          p_initiated_by: initiatedBy || null
        });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error initiating settlement:', error);
      throw error;
    }
  }
}
