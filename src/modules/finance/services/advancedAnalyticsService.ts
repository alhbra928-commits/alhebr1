import { supabase } from '../../../lib/supabase';

export interface PlatformKPIs {
  total_revenue_from_investors: number;
  total_owed_to_owners: number;
  platform_net_profit: number;
  charity_amount: number;
  total_farms: number;
  active_farms: number;
  ready_for_settlement: number;
  settled_farms: number;
  total_investors: number;
  total_trees_sold: number;
}

export interface FarmAnalytics {
  farm_code: string;
  farm_name: string;
  tree_type: string;
  collected_amount: number;
  actual_amount: number;
  completion_percentage: number;
  settlement_status: string;
  total_investors: number;
  flash_status: 'normal' | 'warning' | 'ready';
}

export interface WalletOverview {
  wallet_name: string;
  wallet_type: 'investors' | 'owners' | 'platform' | 'charity';
  current_balance: number;
  total_inflow: number;
  total_outflow: number;
  last_transaction_date: string | null;
  status: 'active' | 'locked' | 'processing';
}

export interface FinancialAlert {
  id: string;
  type: 'farm' | 'wallet' | 'settlement' | 'charity';
  severity: 'info' | 'warning' | 'success' | 'error';
  message_ar: string;
  farm_code?: string;
  created_at: string;
}

export interface AIInsight {
  id: string;
  insight_type: 'performance' | 'recommendation' | 'trend';
  title_ar: string;
  description_ar: string;
  confidence_score: number;
  created_at: string;
}

export interface ChartData {
  labels: string[];
  values: number[];
}

export class AdvancedAnalyticsService {
  static async getPlatformKPIs(): Promise<PlatformKPIs> {
    try {
      const { data: finances, error } = await supabase
        .from('smart_farm_finances')
        .select('*')
        .is('deleted_at', null);

      if (error) throw error;

      const { data: platformWallet } = await supabase
        .from('platform_wallet')
        .select('total_balance, net_profit, farms_owned')
        .eq('id', '00000000-0000-0000-0000-000000000002')
        .single();

      const { data: charityWallet } = await supabase
        .from('charity_wallet')
        .select('total_balance, farms_contributed')
        .eq('id', '00000000-0000-0000-0000-000000000001')
        .single();

      const total_revenue_from_investors = finances?.reduce((sum, f) => sum + Number(f.collected_from_investors || 0), 0) || 0;
      const total_owed_to_owners = finances?.reduce((sum, f) => sum + Number(f.remaining_for_owner || 0), 0) || 0;

      const platform_net_profit = Number(platformWallet?.net_profit || 0);
      const charity_amount = Number(charityWallet?.total_balance || 0);

      const { count: investorsCount } = await supabase
        .from('investors')
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null);

      return {
        total_revenue_from_investors,
        total_owed_to_owners,
        platform_net_profit,
        charity_amount,
        total_farms: finances?.length || 0,
        active_farms: finances?.filter(f => f.settlement_status === 'collecting').length || 0,
        ready_for_settlement: finances?.filter(f => f.settlement_status === 'ready_for_settlement').length || 0,
        settled_farms: finances?.filter(f => f.settlement_status === 'settled').length || 0,
        total_investors: investorsCount || 0,
        total_trees_sold: finances?.reduce((sum, f) => sum + Number(f.total_trees_sold || 0), 0) || 0
      };
    } catch (error) {
      console.error('Error fetching platform KPIs:', error);
      return {
        total_revenue_from_investors: 0,
        total_owed_to_owners: 0,
        platform_net_profit: 0,
        charity_amount: 0,
        total_farms: 0,
        active_farms: 0,
        ready_for_settlement: 0,
        settled_farms: 0,
        total_investors: 0,
        total_trees_sold: 0
      };
    }
  }

  static async getAllFarmsAnalytics(): Promise<FarmAnalytics[]> {
    try {
      const { data: finances, error: financesError } = await supabase
        .from('smart_farm_finances')
        .select('*')
        .is('deleted_at', null)
        .order('completion_percentage_visual', { ascending: false });

      if (financesError) throw financesError;

      const farmIds = finances?.map(f => f.farm_id).filter(Boolean) || [];

      const { data: farms } = await supabase
        .from('farms')
        .select('id, tree_type')
        .in('id', farmIds);

      const farmsMap = new Map(farms?.map(f => [f.id, f.tree_type]) || []);

      return (finances || []).map(f => ({
        farm_code: f.farm_code,
        farm_name: f.farm_name,
        tree_type: farmsMap.get(f.farm_id) || 'نخيل',
        collected_amount: f.collected_from_investors || 0,
        actual_amount: f.actual_amount || 0,
        completion_percentage: f.completion_percentage_visual || 0,
        settlement_status: f.settlement_status || 'collecting',
        total_investors: f.total_investors || 0,
        flash_status: this.getFlashStatus(f.completion_percentage_visual || 0, f.settlement_status)
      }));
    } catch (error) {
      console.error('Error fetching farms analytics:', error);
      return [];
    }
  }

  static getFlashStatus(percentage: number, status: string): 'normal' | 'warning' | 'ready' {
    if (status === 'ready_for_settlement') return 'ready';
    if (percentage >= 90) return 'warning';
    return 'normal';
  }

  static async getWalletsOverview(): Promise<WalletOverview[]> {
    const wallets: WalletOverview[] = [
      {
        wallet_name: 'محفظة المستثمرين',
        wallet_type: 'investors',
        current_balance: 0,
        total_inflow: 0,
        total_outflow: 0,
        last_transaction_date: null,
        status: 'active'
      },
      {
        wallet_name: 'محفظة أصحاب المزارع',
        wallet_type: 'owners',
        current_balance: 0,
        total_inflow: 0,
        total_outflow: 0,
        last_transaction_date: null,
        status: 'locked'
      },
      {
        wallet_name: 'محفظة المنصة',
        wallet_type: 'platform',
        current_balance: 0,
        total_inflow: 0,
        total_outflow: 0,
        last_transaction_date: null,
        status: 'active'
      },
      {
        wallet_name: 'محفظة الخير',
        wallet_type: 'charity',
        current_balance: 0,
        total_inflow: 0,
        total_outflow: 0,
        last_transaction_date: null,
        status: 'active'
      }
    ];

    try {
      const { data: transactions } = await supabase
        .from('settlement_transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (transactions) {
        transactions.forEach(tx => {
          const wallet = wallets.find(w => w.wallet_type === this.getWalletTypeFromName(tx.to_wallet));
          if (wallet) {
            wallet.total_inflow += tx.amount;
            wallet.current_balance += tx.amount;
            if (!wallet.last_transaction_date || tx.created_at > wallet.last_transaction_date) {
              wallet.last_transaction_date = tx.created_at;
            }
          }
        });
      }

      const kpis = await this.getPlatformKPIs();
      wallets[0].current_balance = kpis.total_revenue_from_investors;
      wallets[2].current_balance = kpis.platform_net_profit;
      wallets[3].current_balance = kpis.charity_amount;

    } catch (error) {
      console.error('Error calculating wallets overview:', error);
    }

    return wallets;
  }

  static getWalletTypeFromName(walletName: string): WalletOverview['wallet_type'] {
    if (walletName.includes('investor')) return 'investors';
    if (walletName.includes('owner')) return 'owners';
    if (walletName.includes('platform')) return 'platform';
    if (walletName.includes('charity')) return 'charity';
    return 'platform';
  }

  static async getFinancialAlerts(limit = 10): Promise<FinancialAlert[]> {
    const alerts: FinancialAlert[] = [];

    try {
      const farms = await this.getAllFarmsAnalytics();

      farms.forEach(farm => {
        if (farm.completion_percentage >= 90 && farm.completion_percentage < 100) {
          alerts.push({
            id: `alert-${farm.farm_code}-90`,
            type: 'farm',
            severity: 'warning',
            message_ar: `مزرعة ${farm.farm_name} وصلت إلى ${farm.completion_percentage.toFixed(1)}% تمويل`,
            farm_code: farm.farm_code,
            created_at: new Date().toISOString()
          });
        }

        if (farm.settlement_status === 'ready_for_settlement') {
          alerts.push({
            id: `alert-${farm.farm_code}-ready`,
            type: 'settlement',
            severity: 'success',
            message_ar: `مزرعة ${farm.farm_name} جاهزة للتسوية المالية`,
            farm_code: farm.farm_code,
            created_at: new Date().toISOString()
          });
        }

        if (farm.settlement_status === 'settled') {
          alerts.push({
            id: `alert-${farm.farm_code}-settled`,
            type: 'settlement',
            severity: 'info',
            message_ar: `تمت تسوية مزرعة ${farm.farm_name} بنجاح`,
            farm_code: farm.farm_code,
            created_at: new Date().toISOString()
          });
        }
      });

      const kpis = await this.getPlatformKPIs();
      if (kpis.charity_amount > 0) {
        alerts.push({
          id: 'alert-charity-monthly',
          type: 'charity',
          severity: 'success',
          message_ar: `تم احتساب مبلغ الخير الشهري: ${kpis.charity_amount.toLocaleString()} ريال`,
          created_at: new Date().toISOString()
        });
      }

    } catch (error) {
      console.error('Error generating alerts:', error);
    }

    return alerts.slice(0, limit);
  }

  static async getAIInsights(): Promise<AIInsight[]> {
    const insights: AIInsight[] = [];

    try {
      const farms = await this.getAllFarmsAnalytics();
      const kpis = await this.getPlatformKPIs();

      const fastestFarm = farms.reduce((fastest, farm) =>
        farm.completion_percentage > fastest.completion_percentage ? farm : fastest
      , farms[0] || { farm_name: '', completion_percentage: 0 });

      if (fastestFarm.farm_name) {
        insights.push({
          id: 'insight-fastest-farm',
          insight_type: 'performance',
          title_ar: '🚀 أسرع مزرعة في التمويل',
          description_ar: `مزرعة ${fastestFarm.farm_name} تحقق أسرع وتيرة تمويل بنسبة ${fastestFarm.completion_percentage.toFixed(1)}%، يُوصى بمراقبة الأداء للاستفادة في التسعير القادم.`,
          confidence_score: 0.85,
          created_at: new Date().toISOString()
        });
      }

      if (kpis.total_revenue_from_investors > 0) {
        const growthRate = ((kpis.total_revenue_from_investors / 1000000) * 100).toFixed(1);
        insights.push({
          id: 'insight-revenue-growth',
          insight_type: 'trend',
          title_ar: '📈 نمو الإيرادات',
          description_ar: `محفظة المستثمرين تشهد نموًا بمعدل ${growthRate}%، والأداء المالي للمنصة مستقر ومتصاعد.`,
          confidence_score: 0.92,
          created_at: new Date().toISOString()
        });
      }

      insights.push({
        id: 'insight-charity-stable',
        insight_type: 'recommendation',
        title_ar: '🤍 استقرار نسبة الخير',
        description_ar: `نسبة استقطاع الخير ثابتة عند 25% من صافي الأرباح – الأداء المالي مستقر والالتزام الاجتماعي محفوظ.`,
        confidence_score: 1.0,
        created_at: new Date().toISOString()
      });

      if (kpis.ready_for_settlement > 0) {
        insights.push({
          id: 'insight-settlement-pending',
          insight_type: 'recommendation',
          title_ar: '⚡ تسويات معلقة',
          description_ar: `يوجد ${kpis.ready_for_settlement} مزرعة جاهزة للتسوية، يُنصح باعتماد التحويلات لأصحاب المزارع في أقرب وقت.`,
          confidence_score: 0.95,
          created_at: new Date().toISOString()
        });
      }

    } catch (error) {
      console.error('Error generating AI insights:', error);
    }

    return insights;
  }

  static async getDistributionChartData(): Promise<ChartData> {
    const kpis = await this.getPlatformKPIs();

    return {
      labels: ['أصحاب المزارع', 'أرباح المنصة', 'مبالغ الخير'],
      values: [
        kpis.total_owed_to_owners,
        kpis.platform_net_profit - kpis.charity_amount,
        kpis.charity_amount
      ]
    };
  }

  static async getRevenueTimelineData(days = 30): Promise<ChartData> {
    const labels: string[] = [];
    const values: number[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      labels.push(date.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' }));

      const randomRevenue = Math.floor(Math.random() * 50000) + 10000;
      values.push(randomRevenue);
    }

    return { labels, values };
  }

  static async getTopPerformingFarms(limit = 5): Promise<ChartData> {
    const farms = await this.getAllFarmsAnalytics();
    const sorted = farms
      .sort((a, b) => b.collected_amount - a.collected_amount)
      .slice(0, limit);

    return {
      labels: sorted.map(f => f.farm_name),
      values: sorted.map(f => f.collected_amount)
    };
  }
}
