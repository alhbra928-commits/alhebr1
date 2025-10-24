/**
 * خدمة الحالة المالية لصاحب المزرعة
 * Farm Owner Financial Service
 */

import { supabase } from '../../../lib/supabase';

export interface OwnerFinancialData {
  farmId: string;
  farmCode: string;
  farmName: string;

  // المبالغ الأساسية
  totalFarmPrice: number;           // السعر الكلي للمزرعة
  marketingAmount: number;          // مبلغ التسويق
  actualAmount: number;             // المبلغ الفعلي للبائع

  // الحالة المالية
  totalCollected: number;           // المحصل من المستثمرين
  remainingAmount: number;          // المتبقي
  financialPercentage: number;      // نسبة الإنجاز المالي

  // حالة التسوية
  settlementStatus: 'pending' | 'ready' | 'in_progress' | 'completed';
  settlementReadyAt: string | null;
  settlementExecutedAt: string | null;

  // معلومات إضافية
  totalInvestors: number;
  totalTreesSold: number;
  lastTransactionDate: string | null;

  // الدفعات
  ownerPaymentApproved: boolean;
  ownerPaymentDate: string | null;
  completionDate: string | null;
}

export interface SettlementTransaction {
  id: string;
  transactionCode: string;
  transactionType: string;
  amount: number;
  fromWallet: string;
  toWallet: string;
  executedByName: string;
  status: 'pending' | 'completed' | 'failed';
  descriptionAr: string;
  createdAt: string;
  completedAt: string | null;
}

export interface PaymentTimeline {
  date: string;
  type: 'collection' | 'settlement' | 'completion';
  amount: number;
  description: string;
  status: 'completed' | 'pending' | 'upcoming';
}

class FarmOwnerFinanceService {
  /**
   * جلب البيانات المالية لصاحب المزرعة
   */
  async getFinancialData(ownerId: string): Promise<OwnerFinancialData | null> {
    try {
      const { data: finances, error } = await supabase
        .from('smart_farm_finances')
        .select('*')
        .eq('owner_id', ownerId)
        .maybeSingle();

      if (error) throw error;
      if (!finances) return null;

      return {
        farmId: finances.farm_id,
        farmCode: finances.farm_code,
        farmName: finances.farm_name,
        totalFarmPrice: Number(finances.marketing_amount || 0),
        marketingAmount: Number(finances.marketing_amount || 0),
        actualAmount: Number(finances.actual_amount || 0),
        totalCollected: Number(finances.collected_from_investors || 0),
        remainingAmount: Number(finances.remaining_for_owner || 0),
        financialPercentage: Number(finances.financial_completion_percentage || 0),
        settlementStatus: finances.settlement_status || 'pending',
        settlementReadyAt: finances.settlement_ready_at,
        settlementExecutedAt: finances.settlement_executed_at,
        totalInvestors: finances.total_investors || 0,
        totalTreesSold: finances.total_trees_sold || 0,
        lastTransactionDate: finances.last_transaction_date,
        ownerPaymentApproved: finances.owner_payment_approved || false,
        ownerPaymentDate: finances.owner_payment_date,
        completionDate: finances.completion_date
      };
    } catch (error) {
      console.error('خطأ في جلب البيانات المالية:', error);
      return null;
    }
  }

  /**
   * جلب معاملات التسوية
   */
  async getSettlementTransactions(farmId: string): Promise<SettlementTransaction[]> {
    try {
      const { data, error } = await supabase
        .from('settlement_transactions')
        .select('*')
        .eq('farm_id', farmId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(t => ({
        id: t.id,
        transactionCode: t.transaction_code,
        transactionType: t.transaction_type,
        amount: Number(t.amount),
        fromWallet: t.from_wallet,
        toWallet: t.to_wallet,
        executedByName: t.executed_by_name,
        status: t.status,
        descriptionAr: t.description_ar,
        createdAt: t.created_at,
        completedAt: t.completed_at
      }));
    } catch (error) {
      console.error('خطأ في جلب معاملات التسوية:', error);
      return [];
    }
  }

  /**
   * بناء الجدول الزمني للدفعات
   */
  buildPaymentTimeline(
    financialData: OwnerFinancialData,
    transactions: SettlementTransaction[]
  ): PaymentTimeline[] {
    const timeline: PaymentTimeline[] = [];

    // الدفعات المحصلة
    if (financialData.totalCollected > 0) {
      timeline.push({
        date: financialData.lastTransactionDate || new Date().toISOString(),
        type: 'collection',
        amount: financialData.totalCollected,
        description: 'المبلغ المحصل من المستثمرين',
        status: 'completed'
      });
    }

    // التسوية
    if (financialData.settlementStatus === 'completed' && financialData.settlementExecutedAt) {
      timeline.push({
        date: financialData.settlementExecutedAt,
        type: 'settlement',
        amount: financialData.actualAmount,
        description: 'تم تحويل المبلغ الكامل للبائع',
        status: 'completed'
      });
    } else if (financialData.settlementStatus === 'ready') {
      timeline.push({
        date: financialData.settlementReadyAt || new Date().toISOString(),
        type: 'settlement',
        amount: financialData.actualAmount,
        description: 'جاهز للتحويل - بانتظار الإجراء',
        status: 'pending'
      });
    } else if (financialData.financialPercentage >= 100) {
      timeline.push({
        date: new Date().toISOString(),
        type: 'settlement',
        amount: financialData.actualAmount,
        description: 'قريباً - بانتظار التسوية',
        status: 'upcoming'
      });
    }

    return timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  /**
   * اشتراك لحظي في التحديثات المالية
   */
  subscribeToFinancialUpdates(
    ownerId: string,
    callback: (data: OwnerFinancialData) => void
  ) {
    const channel = supabase
      .channel(`owner-finance-${ownerId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'smart_farm_finances',
          filter: `owner_id=eq.${ownerId}`
        },
        async () => {
          const data = await this.getFinancialData(ownerId);
          if (data) callback(data);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}

export const farmOwnerFinanceService = new FarmOwnerFinanceService();
