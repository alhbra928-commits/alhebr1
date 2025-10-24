import { supabase } from '../../../lib/supabase';

export interface DeletionLog {
  id: string;
  deleted_record_type: string;
  deleted_record_id: string;
  deleted_record_code: string | null;
  deleted_record_data: any;
  deleted_at: string;
  can_restore_until: string;
  deleted_by: string | null;
  deleted_by_email: string | null;
  deletion_reason: string | null;
  is_restored: boolean;
  restored_at: string | null;
  restored_by: string | null;
}

export interface InterventionLog {
  id: string;
  farm_code: string;
  intervention_type: string;
  intervention_reason: string;
  performed_by_email: string | null;
  performed_at: string;
}

export interface ActionLog {
  id: string;
  farm_code: string;
  action_type: string;
  action_description: string | null;
  action_status: string;
  performed_by_email: string | null;
  performed_at: string;
}

export class AdminFinanceService {
  // ==========================================
  // 1️⃣ اعتماد صرف مستحقات صاحب المزرعة
  // ==========================================

  static async approveOwnerPayment(farmCode: string, userEmail: string, reason?: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // تحديث البطاقة المالية
      const { data: finance, error: updateError } = await supabase
        .from('smart_farm_finances')
        .update({
          owner_payment_approved: true,
          owner_payment_approved_by: user?.id,
          owner_payment_approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('farm_code', farmCode)
        .select()
        .single();

      if (updateError) throw updateError;

      // تسجيل الإجراء
      await this.logAction({
        farm_code: farmCode,
        farm_finance_id: finance.id,
        action_type: 'approve_payment',
        action_description: reason || 'اعتماد صرف المبلغ الفعلي لصاحب المزرعة',
        performed_by: user?.id,
        performed_by_email: userEmail
      });

      return { success: true, data: finance };
    } catch (error) {
      console.error('Error approving owner payment:', error);
      return { success: false, error };
    }
  }

  // ==========================================
  // 2️⃣ تحويل الأرباح إلى بطاقة المنصة
  // ==========================================

  static async transferProfitToPlatform(farmCode: string, userEmail: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // تحديث البطاقة المالية
      const { data: finance, error: updateError } = await supabase
        .from('smart_farm_finances')
        .update({
          profit_transferred: true,
          profit_transferred_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('farm_code', farmCode)
        .select()
        .single();

      if (updateError) throw updateError;

      // تسجيل الإجراء
      await this.logAction({
        farm_code: farmCode,
        farm_finance_id: finance.id,
        action_type: 'transfer_profit',
        action_description: `تحويل الفائض إلى المنصة: ${finance.net_platform_profit} ر.س`,
        performed_by: user?.id,
        performed_by_email: userEmail,
        result_data: {
          profit: finance.platform_profit,
          charity: finance.charity_amount,
          net_profit: finance.net_platform_profit
        }
      });

      return { success: true, data: finance };
    } catch (error) {
      console.error('Error transferring profit:', error);
      return { success: false, error };
    }
  }

  // ==========================================
  // 3️⃣ تجميد العمليات المالية
  // ==========================================

  static async freezeFarm(farmCode: string, reason: string, userEmail: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data: finance, error: updateError } = await supabase
        .from('smart_farm_finances')
        .update({
          is_frozen: true,
          frozen_at: new Date().toISOString(),
          frozen_reason: reason,
          updated_at: new Date().toISOString()
        })
        .eq('farm_code', farmCode)
        .select()
        .single();

      if (updateError) throw updateError;

      // تسجيل الإجراء
      await this.logAction({
        farm_code: farmCode,
        farm_finance_id: finance.id,
        action_type: 'freeze_farm',
        action_description: `تجميد العمليات المالية: ${reason}`,
        performed_by: user?.id,
        performed_by_email: userEmail
      });

      // تسجيل التدخل
      await this.logIntervention({
        farm_code: farmCode,
        farm_finance_id: finance.id,
        intervention_type: 'freeze_operations',
        intervention_reason: reason,
        field_changed: 'is_frozen',
        old_value: 'false',
        new_value: 'true',
        performed_by: user?.id,
        performed_by_email: userEmail
      });

      return { success: true, data: finance };
    } catch (error) {
      console.error('Error freezing farm:', error);
      return { success: false, error };
    }
  }

  // ==========================================
  // 4️⃣ إلغاء التجميد
  // ==========================================

  static async unfreezeFarm(farmCode: string, userEmail: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data: finance, error: updateError } = await supabase
        .from('smart_farm_finances')
        .update({
          is_frozen: false,
          updated_at: new Date().toISOString()
        })
        .eq('farm_code', farmCode)
        .select()
        .single();

      if (updateError) throw updateError;

      await this.logAction({
        farm_code: farmCode,
        farm_finance_id: finance.id,
        action_type: 'unfreeze_farm',
        action_description: 'إلغاء تجميد العمليات المالية',
        performed_by: user?.id,
        performed_by_email: userEmail
      });

      await this.logIntervention({
        farm_code: farmCode,
        farm_finance_id: finance.id,
        intervention_type: 'unfreeze_operations',
        intervention_reason: 'إلغاء التجميد',
        field_changed: 'is_frozen',
        old_value: 'true',
        new_value: 'false',
        performed_by: user?.id,
        performed_by_email: userEmail
      });

      return { success: true, data: finance };
    } catch (error) {
      console.error('Error unfreezing farm:', error);
      return { success: false, error };
    }
  }

  // ==========================================
  // 5️⃣ إغلاق البيع وتحويل للخدمات الزراعية
  // ==========================================

  static async transferToAgriculture(farmCode: string, userEmail: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data: finance, error: updateError } = await supabase
        .from('smart_farm_finances')
        .update({
          transferred_to_agriculture: true,
          transferred_to_agriculture_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('farm_code', farmCode)
        .select()
        .single();

      if (updateError) throw updateError;

      await this.logAction({
        farm_code: farmCode,
        farm_finance_id: finance.id,
        action_type: 'transfer_to_agriculture',
        action_description: 'إغلاق البيع وتحويل المزرعة إلى الخدمات الزراعية',
        performed_by: user?.id,
        performed_by_email: userEmail
      });

      return { success: true, data: finance };
    } catch (error) {
      console.error('Error transferring to agriculture:', error);
      return { success: false, error };
    }
  }

  // ==========================================
  // 6️⃣ الحذف الإداري الفوري
  // ==========================================

  static async adminDelete(
    recordType: string,
    recordId: string,
    recordCode: string | null,
    recordData: any,
    reason: string,
    userEmail: string
  ) {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // تسجيل الحذف أولاً
      const { data: deletionLog, error: logError } = await supabase
        .from('financial_admin_deletions_log')
        .insert({
          deleted_record_type: recordType,
          deleted_record_id: recordId,
          deleted_record_code: recordCode,
          deleted_record_data: recordData,
          deletion_reason: reason,
          deleted_by: user?.id,
          deleted_by_email: userEmail
        })
        .select()
        .single();

      if (logError) throw logError;

      // تنفيذ الحذف الفعلي (soft delete)
      let deleteError = null;

      switch (recordType) {
        case 'farm_finance':
          const { error: financeError } = await supabase
            .from('smart_farm_finances')
            .update({
              deleted_at: new Date().toISOString(),
              deleted_by: user?.id
            })
            .eq('id', recordId);
          deleteError = financeError;
          break;

        case 'transaction':
          const { error: transactionError } = await supabase
            .from('farm_financial_transactions')
            .update({
              deleted_at: new Date().toISOString(),
              deleted_by: user?.id
            })
            .eq('id', recordId);
          deleteError = transactionError;
          break;
      }

      if (deleteError) throw deleteError;

      return { success: true, data: deletionLog };
    } catch (error) {
      console.error('Error in admin delete:', error);
      return { success: false, error };
    }
  }

  // ==========================================
  // 7️⃣ استعادة من الحذف
  // ==========================================

  static async restoreDeleted(deletionLogId: string, userEmail: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // جلب سجل الحذف
      const { data: deletionLog, error: fetchError } = await supabase
        .from('financial_admin_deletions_log')
        .select('*')
        .eq('id', deletionLogId)
        .single();

      if (fetchError) throw fetchError;

      // التحقق من إمكانية الاستعادة
      const canRestoreUntil = new Date(deletionLog.can_restore_until);
      if (new Date() > canRestoreUntil) {
        throw new Error('انتهت مدة الاستعادة (24 ساعة)');
      }

      // استعادة البيانات
      switch (deletionLog.deleted_record_type) {
        case 'farm_finance':
          await supabase
            .from('smart_farm_finances')
            .update({
              deleted_at: null,
              deleted_by: null
            })
            .eq('id', deletionLog.deleted_record_id);
          break;
      }

      // تحديث سجل الحذف
      const { data: updated, error: updateError } = await supabase
        .from('financial_admin_deletions_log')
        .update({
          is_restored: true,
          restored_at: new Date().toISOString(),
          restored_by: user?.id
        })
        .eq('id', deletionLogId)
        .select()
        .single();

      if (updateError) throw updateError;

      return { success: true, data: updated };
    } catch (error) {
      console.error('Error restoring:', error);
      return { success: false, error };
    }
  }

  // ==========================================
  // 📊 السجلات والتقارير
  // ==========================================

  static async getDeletionLogs(limit = 50) {
    const { data, error } = await supabase
      .from('financial_admin_deletions_log')
      .select('*')
      .order('deleted_at', { ascending: false })
      .limit(limit);

    return { data, error };
  }

  static async getInterventionLogs(farmCode?: string, limit = 50) {
    let query = supabase
      .from('financial_manual_interventions_log')
      .select('*')
      .order('performed_at', { ascending: false });

    if (farmCode) {
      query = query.eq('farm_code', farmCode);
    }

    const { data, error } = await query.limit(limit);
    return { data, error };
  }

  static async getActionLogs(farmCode?: string, limit = 50) {
    let query = supabase
      .from('financial_admin_actions_log')
      .select('*')
      .order('performed_at', { ascending: false });

    if (farmCode) {
      query = query.eq('farm_code', farmCode);
    }

    const { data, error } = await query.limit(limit);
    return { data, error };
  }

  // ==========================================
  // 🔧 دوال مساعدة داخلية
  // ==========================================

  private static async logAction(action: {
    farm_code: string;
    farm_finance_id: string;
    action_type: string;
    action_description: string | null;
    performed_by: string | undefined;
    performed_by_email: string;
    result_data?: any;
  }) {
    await supabase
      .from('financial_admin_actions_log')
      .insert(action);
  }

  private static async logIntervention(intervention: {
    farm_code: string;
    farm_finance_id: string;
    intervention_type: string;
    intervention_reason: string;
    field_changed: string;
    old_value: string;
    new_value: string;
    performed_by: string | undefined;
    performed_by_email: string;
  }) {
    await supabase
      .from('financial_manual_interventions_log')
      .insert(intervention);
  }
}
