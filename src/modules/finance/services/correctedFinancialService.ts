import { supabase } from '../../../lib/supabase';

/**
 * النظام المالي المصحح - التدفق الإجرائي الصحيح
 *
 * المراحل:
 * 1. التجميع: جمع الحجوزات في محفظة المستثمرين
 * 2. التنبيه: وميض عند اكتمال المبلغ الفعلي
 * 3. التسوية: تحويل المبلغ لصاحب المزرعة يدوياً
 * 4. الأرباح: استقبال الفائض واستقطاع 25% للخير
 * 5. الإغلاق: إغلاق المزرعة
 */

export interface CorrectedFarmFinance {
  id: string;
  farm_id: string;
  farm_code: string;
  farm_name: string;

  // العدادات الرئيسية (الظاهرة فقط)
  collected_from_investors: number;    // عداد المستثمرين
  owner_amount_target: number;         // عداد المبلغ المطلوب

  // التفاصيل الداخلية (مخفية)
  owner_amount_transferred: number;
  platform_amount_received: number;
  charity_amount_deducted: number;

  // الحالات
  stage: 'collecting' | 'ready_for_settlement' | 'settlement_in_progress' | 'completed' | 'closed';
  settlement_ready: boolean;
  settlement_executed: boolean;

  // الأرشفة
  is_archived: boolean;
  archived_at?: string;
  archived_by?: string;
  archive_notes?: string;

  // التوقيتات
  settlement_ready_at?: string;
  settlement_executed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface FinancialStats {
  totalCollectedFromInvestors: number;
  totalOwnerAmountTarget: number;
  totalOwnerAmountTransferred: number;
  totalPlatformAmountReceived: number;
  totalCharityAmountDeducted: number;
  farmsInCollection: number;
  farmsReadyForSettlement: number;
  farmsSettled: number;
}

export class CorrectedFinancialService {
  /**
   * جلب جميع البيانات المالية للمزارع (غير المؤرشفة فقط)
   */
  static async getAllFarmFinances(): Promise<CorrectedFarmFinance[]> {
    const { data, error } = await supabase
      .from('farm_finance')
      .select('*')
      .is('deleted_at', null)
      .eq('is_archived', false)
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
      collected_from_investors: Number(item.collected_from_investors) || 0,
      owner_amount_target: Number(item.owner_amount_target) || 0,
      owner_amount_transferred: Number(item.owner_amount_transferred) || 0,
      platform_amount_received: Number(item.platform_amount_received) || 0,
      charity_amount_deducted: Number(item.charity_amount_deducted) || 0,
      stage: item.stage || 'collecting',
      settlement_ready: item.settlement_ready || false,
      settlement_executed: item.settlement_executed || false,
      is_archived: item.is_archived || false,
      archived_at: item.archived_at,
      archived_by: item.archived_by,
      archive_notes: item.archive_notes,
      settlement_ready_at: item.settlement_ready_at,
      settlement_executed_at: item.settlement_executed_at,
      created_at: item.created_at,
      updated_at: item.updated_at,
    }));
  }

  /**
   * جلب بيانات مالية لمزرعة واحدة
   */
  static async getFarmFinance(farmCode: string): Promise<CorrectedFarmFinance | null> {
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
      collected_from_investors: Number(data.collected_from_investors) || 0,
      owner_amount_target: Number(data.owner_amount_target) || 0,
      owner_amount_transferred: Number(data.owner_amount_transferred) || 0,
      platform_amount_received: Number(data.platform_amount_received) || 0,
      charity_amount_deducted: Number(data.charity_amount_deducted) || 0,
      stage: data.stage || 'collecting',
      settlement_ready: data.settlement_ready || false,
      settlement_executed: data.settlement_executed || false,
      settlement_ready_at: data.settlement_ready_at,
      settlement_executed_at: data.settlement_executed_at,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  }

  /**
   * تنفيذ التسوية اليدوية
   */
  static async executeManualSettlement(farmId: string, adminId: string): Promise<any> {
    try {
      console.log('🔧 executeManualSettlement called with:', { farmId, adminId });

      const { data, error } = await supabase.rpc('execute_manual_settlement', {
        p_farm_id: farmId,
        p_admin_id: adminId,
      });

      console.log('📊 RPC Response:', { data, error });

      if (error) {
        console.error('❌ RPC Error:', error);
        throw error;
      }

      return data;
    } catch (error: any) {
      console.error('❌ خطأ في تنفيذ التسوية:', error);
      console.error('❌ Error details:', {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint
      });
      throw error;
    }
  }

  /**
   * حساب الإحصائيات المالية (تشمل جميع المزارع بما فيها المؤرشفة)
   */
  static async getFinancialStats(): Promise<FinancialStats> {
    // جلب جميع المزارع (النشطة والمؤرشفة)
    const { data, error } = await supabase
      .from('farm_finance')
      .select('*')
      .is('deleted_at', null)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('❌ خطأ في جلب البيانات المالية للإحصائيات:', error);
      return {
        totalCollectedFromInvestors: 0,
        totalOwnerAmountTarget: 0,
        totalOwnerAmountTransferred: 0,
        totalPlatformAmountReceived: 0,
        totalCharityAmountDeducted: 0,
        farmsInCollection: 0,
        farmsReadyForSettlement: 0,
        farmsSettled: 0,
      };
    }

    const allFarms = (data || []).map(item => ({
      collected_from_investors: Number(item.collected_from_investors) || 0,
      owner_amount_target: Number(item.owner_amount_target) || 0,
      owner_amount_transferred: Number(item.owner_amount_transferred) || 0,
      platform_amount_received: Number(item.platform_amount_received) || 0,
      charity_amount_deducted: Number(item.charity_amount_deducted) || 0,
      stage: item.stage || 'collecting',
      settlement_ready: item.settlement_ready || false,
      settlement_executed: item.settlement_executed || false,
      is_archived: item.is_archived || false,
    }));

    const stats = allFarms.reduce((acc, farm) => ({
      totalCollectedFromInvestors: acc.totalCollectedFromInvestors + farm.collected_from_investors,
      totalOwnerAmountTarget: acc.totalOwnerAmountTarget + farm.owner_amount_target,
      totalOwnerAmountTransferred: acc.totalOwnerAmountTransferred + farm.owner_amount_transferred,
      totalPlatformAmountReceived: acc.totalPlatformAmountReceived + farm.platform_amount_received,
      totalCharityAmountDeducted: acc.totalCharityAmountDeducted + farm.charity_amount_deducted,
      // عد فقط المزارع النشطة (غير المؤرشفة)
      farmsInCollection: !farm.is_archived && farm.stage === 'collecting'
        ? acc.farmsInCollection + 1
        : acc.farmsInCollection,
      farmsReadyForSettlement: !farm.is_archived && farm.settlement_ready && !farm.settlement_executed
        ? acc.farmsReadyForSettlement + 1
        : acc.farmsReadyForSettlement,
      farmsSettled: farm.settlement_executed ? acc.farmsSettled + 1 : acc.farmsSettled,
    }), {
      totalCollectedFromInvestors: 0,
      totalOwnerAmountTarget: 0,
      totalOwnerAmountTransferred: 0,
      totalPlatformAmountReceived: 0,
      totalCharityAmountDeducted: 0,
      farmsInCollection: 0,
      farmsReadyForSettlement: 0,
      farmsSettled: 0,
    });

    return stats;
  }

  /**
   * حساب نسبة الإكمال
   */
  static calculateCompletionPercentage(collected: number, target: number): number {
    if (target === 0) return 0;
    return Math.min((collected / target) * 100, 100);
  }

  /**
   * التحقق من جاهزية التسوية
   */
  static isReadyForSettlement(collected: number, target: number): boolean {
    return collected >= target;
  }

  /**
   * الاشتراك في التحديثات المباشرة
   */
  static subscribeToFinancialUpdates(callback: (data: CorrectedFarmFinance[]) => void) {
    const channel = supabase
      .channel('farm_finance_updates_corrected')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'farm_finance'
        },
        async () => {
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
   * أرشفة مزرعة مالياً
   */
  static async archiveFarm(farmId: string, adminPhone: string, notes?: string): Promise<any> {
    try {
      console.log('🗃️ archiveFarm called with:', { farmId, adminPhone, notes });

      const { data, error } = await supabase.rpc('archive_farm_finance', {
        p_farm_id: farmId,
        p_admin_phone: adminPhone,
        p_notes: notes || null,
      });

      console.log('📊 Archive RPC Response:', { data, error });

      if (error) {
        console.error('❌ Archive RPC Error:', error);
        throw error;
      }

      return data;
    } catch (error: any) {
      console.error('❌ خطأ في أرشفة المزرعة:', error);
      console.error('❌ Error details:', {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint
      });
      throw error;
    }
  }

  /**
   * جلب المزارع المؤرشفة
   */
  static async getArchivedFarms(): Promise<CorrectedFarmFinance[]> {
    try {
      const { data, error } = await supabase.rpc('get_archived_farms');

      if (error) {
        console.error('❌ خطأ في جلب المزارع المؤرشفة:', error);
        throw error;
      }

      return (data || []).map((item: any) => ({
        id: item.id,
        farm_id: item.farm_id,
        farm_code: item.farm_code,
        farm_name: item.farm_name,
        collected_from_investors: Number(item.collected_from_investors) || 0,
        owner_amount_target: Number(item.owner_amount_target) || 0,
        owner_amount_transferred: Number(item.owner_amount_transferred) || 0,
        platform_amount_received: Number(item.platform_amount_received) || 0,
        charity_amount_deducted: Number(item.charity_amount_deducted) || 0,
        stage: 'completed',
        settlement_ready: true,
        settlement_executed: true,
        is_archived: true,
        archived_at: item.archived_at,
        archived_by: item.archived_by,
        archive_notes: item.archive_notes,
        settlement_ready_at: null,
        settlement_executed_at: item.settlement_executed_at,
        created_at: item.created_at,
        updated_at: item.archived_at,
      }));
    } catch (error) {
      console.error('❌ خطأ في جلب المزارع المؤرشفة:', error);
      throw error;
    }
  }

  /**
   * التحقق من صلاحية الأرشفة
   */
  static async checkArchivingPermission(adminPhone: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('check_archiving_permission', {
        p_admin_phone: adminPhone,
      });

      if (error) {
        console.error('❌ خطأ في التحقق من صلاحية الأرشفة:', error);
        return false;
      }

      return data === true;
    } catch (error) {
      console.error('❌ خطأ في التحقق من صلاحية الأرشفة:', error);
      return false;
    }
  }

  /**
   * الحصول على لون حسب المرحلة
   */
  static getStageColor(stage: string): string {
    const colors: Record<string, string> = {
      'collecting': 'from-blue-500 to-cyan-600',
      'ready_for_settlement': 'from-yellow-400 to-orange-500',
      'settlement_in_progress': 'from-purple-500 to-purple-600',
      'completed': 'from-green-500 to-emerald-600',
      'closed': 'from-gray-500 to-gray-600',
    };
    return colors[stage] || 'from-gray-500 to-gray-600';
  }

  /**
   * الحصول على تسمية المرحلة
   */
  static getStageLabel(stage: string): string {
    const labels: Record<string, string> = {
      'collecting': 'جاري التجميع',
      'ready_for_settlement': 'جاهز للتسوية',
      'settlement_in_progress': 'التسوية قيد التنفيذ',
      'completed': 'مكتمل',
      'closed': 'مغلق',
    };
    return labels[stage] || stage;
  }
}
