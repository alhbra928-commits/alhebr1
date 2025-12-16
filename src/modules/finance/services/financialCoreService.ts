import { supabase } from '../../../lib/supabase';

/**
 * النظام المالي المتكامل V3 (financial_core_v3)
 *
 * يربط الأسعار من أقسام مختلفة:
 * - السعر الفعلي من إدارة صاحب المزرعة
 * - السعر التسويقي من إدارة المزارع
 * - حساب الربح تلقائياً = تسويقي - فعلي
 */

export interface FarmFinanceData {
  id: string;
  farm_id: string;
  farm_code: string;
  farm_name: string;

  // الأسعار
  actual_price: number;           // السعر الفعلي
  marketing_price: number;        // السعر التسويقي
  net_profit: number;             // الربح الصافي (محسوب تلقائياً)
  profit_percentage: number;      // نسبة الربح (محسوبة تلقائياً)

  // الإيرادات
  total_revenue_collected: number;
  total_investors: number;
  total_trees_sold: number;
  financial_completion_percentage: number;

  // الحالة
  financial_status: 'collecting' | 'completed' | 'settled' | 'closed';
  settled_at?: string;
  settlement_transaction_id?: string;

  created_at: string;
  updated_at: string;
}

export interface FinancialStats {
  totalRevenue: number;
  totalActualPrice: number;
  totalMarketingPrice: number;
  totalNetProfit: number;
  totalCharityAmount: number;      // 25% من الأرباح
  platformNetProfit: number;       // الربح بعد خصم الخير
  totalInvestors: number;
  totalTreesSold: number;
  activeFarms: number;
  completedFarms: number;
}

export interface CharityWallet {
  total_balance: number;
  total_received: number;
  total_distributed: number;
  farms_contributed: number;
}

export class FinancialCoreService {
  /**
   * جلب جميع البيانات المالية للمزارع
   */
  static async getAllFarmFinances(): Promise<FarmFinanceData[]> {
    const { data, error } = await supabase
      .from('farm_finance')
      .select('*')
      .is('deleted_at', null)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('❌ خطأ في جلب البيانات المالية:', error);
      throw error;
    }

    return (data || []).map(item => ({
      id: item.id,
      farm_id: item.farm_id,
      farm_code: item.farm_code,
      farm_name: item.farm_name,
      actual_price: Number(item.actual_price) || 0,
      marketing_price: Number(item.marketing_price) || 0,
      net_profit: Number(item.net_profit) || 0,
      profit_percentage: Number(item.profit_percentage) || 0,
      total_revenue_collected: Number(item.total_revenue_collected) || 0,
      total_investors: Number(item.total_investors) || 0,
      total_trees_sold: Number(item.total_trees_sold) || 0,
      financial_completion_percentage: Number(item.financial_completion_percentage) || 0,
      financial_status: item.financial_status || 'collecting',
      settled_at: item.settled_at,
      settlement_transaction_id: item.settlement_transaction_id,
      created_at: item.created_at,
      updated_at: item.updated_at,
    }));
  }

  /**
   * جلب بيانات مالية لمزرعة واحدة
   */
  static async getFarmFinance(farmCode: string): Promise<FarmFinanceData | null> {
    const { data, error } = await supabase
      .from('farm_finance')
      .select('*')
      .eq('farm_code', farmCode)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) {
      console.error('❌ خطأ في جلب البيانات المالية:', error);
      return null;
    }

    if (!data) return null;

    return {
      id: data.id,
      farm_id: data.farm_id,
      farm_code: data.farm_code,
      farm_name: data.farm_name,
      actual_price: Number(data.actual_price) || 0,
      marketing_price: Number(data.marketing_price) || 0,
      net_profit: Number(data.net_profit) || 0,
      profit_percentage: Number(data.profit_percentage) || 0,
      total_revenue_collected: Number(data.total_revenue_collected) || 0,
      total_investors: Number(data.total_investors) || 0,
      total_trees_sold: Number(data.total_trees_sold) || 0,
      financial_completion_percentage: Number(data.financial_completion_percentage) || 0,
      financial_status: data.financial_status || 'collecting',
      settled_at: data.settled_at,
      settlement_transaction_id: data.settlement_transaction_id,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  }

  /**
   * حساب الإحصائيات المالية الإجمالية
   */
  static async getFinancialStats(): Promise<FinancialStats> {
    const farms = await this.getAllFarmFinances();

    const stats = farms.reduce((acc, farm) => {
      const charityAmount = farm.net_profit * 0.25; // 25% للخير
      const platformProfit = farm.net_profit - charityAmount;

      return {
        totalRevenue: acc.totalRevenue + farm.total_revenue_collected,
        totalActualPrice: acc.totalActualPrice + farm.actual_price,
        totalMarketingPrice: acc.totalMarketingPrice + farm.marketing_price,
        totalNetProfit: acc.totalNetProfit + farm.net_profit,
        totalCharityAmount: acc.totalCharityAmount + charityAmount,
        platformNetProfit: acc.platformNetProfit + platformProfit,
        totalInvestors: acc.totalInvestors + farm.total_investors,
        totalTreesSold: acc.totalTreesSold + farm.total_trees_sold,
        activeFarms: farm.financial_status === 'collecting' || farm.financial_status === 'completed'
          ? acc.activeFarms + 1
          : acc.activeFarms,
        completedFarms: farm.financial_status === 'completed' || farm.financial_status === 'settled'
          ? acc.completedFarms + 1
          : acc.completedFarms,
      };
    }, {
      totalRevenue: 0,
      totalActualPrice: 0,
      totalMarketingPrice: 0,
      totalNetProfit: 0,
      totalCharityAmount: 0,
      platformNetProfit: 0,
      totalInvestors: 0,
      totalTreesSold: 0,
      activeFarms: 0,
      completedFarms: 0,
    });

    return stats;
  }

  /**
   * جلب محفظة الخير
   */
  static async getCharityWallet(): Promise<CharityWallet | null> {
    const { data, error } = await supabase
      .from('charity_wallet')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('❌ خطأ في جلب محفظة الخير:', error);
      return null;
    }

    if (!data) return null;

    return {
      total_balance: Number(data.total_balance) || 0,
      total_received: Number(data.total_received) || 0,
      total_distributed: Number(data.total_distributed) || 0,
      farms_contributed: Number(data.farms_contributed) || 0,
    };
  }

  /**
   * الاشتراك في التحديثات المباشرة
   */
  static subscribeToFinancialUpdates(callback: (data: FarmFinanceData[]) => void) {
    // إنشاء قناة واحدة تراقب جميع الجداول المؤثرة
    const channel = supabase
      .channel('complete_financial_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'farm_finance'
        },
        async () => {
          console.log('🔔 farm_finance updated');
          const farms = await this.getAllFarmFinances();
          callback(farms);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'investors'
        },
        async () => {
          console.log('🔔 investors updated - refreshing finances');
          const farms = await this.getAllFarmFinances();
          callback(farms);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'documentation'
        },
        async () => {
          console.log('🔔 documentation updated - refreshing finances');
          const farms = await this.getAllFarmFinances();
          callback(farms);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reservations'
        },
        async () => {
          console.log('🔔 reservations updated - refreshing finances');
          const farms = await this.getAllFarmFinances();
          callback(farms);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'farms'
        },
        async () => {
          console.log('🔔 farms updated - refreshing finances');
          const farms = await this.getAllFarmFinances();
          callback(farms);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  /**
   * تنسيق الأرقام إلى عملة سعودية
   */
  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  /**
   * تنسيق النسبة المئوية
   */
  static formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`;
  }

  /**
   * الحصول على لون حسب نسبة الربح
   */
  static getProfitColor(percentage: number): string {
    if (percentage >= 20) return 'from-green-500 to-emerald-600';
    if (percentage >= 10) return 'from-blue-500 to-cyan-600';
    if (percentage >= 5) return 'from-yellow-500 to-orange-500';
    return 'from-gray-500 to-gray-600';
  }

  /**
   * الحصول على لون حسب الحالة المالية
   */
  static getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'collecting': 'from-blue-500 to-blue-600',
      'completed': 'from-green-500 to-emerald-600',
      'settled': 'from-purple-500 to-purple-600',
      'closed': 'from-gray-500 to-gray-600',
    };
    return colors[status] || 'from-gray-500 to-gray-600';
  }

  /**
   * الحصول على تسمية الحالة
   */
  static getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'collecting': 'جاري التحصيل',
      'completed': 'مكتمل',
      'settled': 'تمت التسوية',
      'closed': 'مغلق',
    };
    return labels[status] || status;
  }
}
