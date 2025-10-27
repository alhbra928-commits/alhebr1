import { supabase } from '../../../lib/supabase';

export interface Permission {
  permission_code: string;
  permission_name_ar: string;
  permission_name_en: string;
  description_ar: string;
  status: 'active' | 'suspended' | 'temporary' | null;
  is_temporary: boolean | null;
  valid_until: string | null;
  last_used_at: string | null;
  usage_count: number | null;
}

export interface ActivityLog {
  id: string;
  admin_user_id: string | null;
  permission_code: string | null;
  action_type: string;
  action_description: string;
  was_successful: boolean;
  denial_reason: string | null;
  context_data: any;
  created_at: string;
}

export interface ViolationAlert {
  id: string;
  admin_user_id: string | null;
  permission_code: string | null;
  violation_type: string;
  severity: string;
  details: string;
  is_resolved: boolean;
  auto_lockout_triggered: boolean;
  lockout_until: string | null;
  created_at: string;
}

export interface SmartRule {
  id: string;
  admin_user_id: string;
  permission_code: string;
  rule_type: 'time_based' | 'context_based' | 'behavior_based' | 'ai_suggested';
  rule_config: any;
  is_active: boolean;
  auto_activate: boolean;
  confidence_score: number;
  times_triggered: number;
  last_triggered_at: string | null;
  created_at: string;
}

export interface ActivityStats {
  total_actions: number;
  successful_actions: number;
  denied_actions: number;
  most_used_permission: string | null;
  daily_usage: Array<{ date: string; count: number }>;
}

export const smartButtonPermissionsService = {
  async getUserPermissions(adminUserId: string): Promise<Permission[]> {
    try {
      const { data, error } = await supabase.rpc('get_user_whatsapp_button_permissions', {
        p_admin_user_id: adminUserId
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      throw error;
    }
  },

  async checkPermission(adminUserId: string, permissionCode: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('check_whatsapp_button_permission', {
        p_admin_user_id: adminUserId,
        p_permission_code: permissionCode
      });

      if (error) throw error;
      return data || false;
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  },

  async grantPermission(
    adminUserId: string,
    permissionCode: string,
    isTemporary: boolean = false,
    validUntil: string | null = null,
    grantedBy: string,
    notes: string = ''
  ): Promise<void> {
    try {
      // التحقق من صحة UUID
      const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(grantedBy);

      const permissionData: any = {
        admin_user_id: adminUserId,
        permission_code: permissionCode,
        status: 'active',
        is_temporary: isTemporary,
        valid_until: validUntil,
        granted_at: new Date().toISOString(),
        notes
      };

      // إضافة granted_by فقط إذا كان UUID صحيح
      if (isValidUUID) {
        permissionData.granted_by = grantedBy;
      }

      const { error } = await supabase
        .from('whatsapp_button_role_permissions')
        .upsert(permissionData, {
          onConflict: 'admin_user_id,permission_code'
        });

      if (error) {
        console.error('Database error details:', error);
        throw error;
      }
    } catch (error: any) {
      console.error('Error granting permission:', error);

      // رسالة خطأ مفصلة
      const errorMsg = error?.message || 'Unknown error';
      const errorCode = error?.code || 'N/A';

      throw new Error(`فشل منح الصلاحية: ${errorMsg} (Code: ${errorCode})`);
    }
  },

  async revokePermission(adminUserId: string, permissionCode: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('whatsapp_button_role_permissions')
        .delete()
        .match({
          admin_user_id: adminUserId,
          permission_code: permissionCode
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error revoking permission:', error);
      throw error;
    }
  },

  async suspendPermission(adminUserId: string, permissionCode: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('whatsapp_button_role_permissions')
        .update({ status: 'suspended', updated_at: new Date().toISOString() })
        .match({
          admin_user_id: adminUserId,
          permission_code: permissionCode
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error suspending permission:', error);
      throw error;
    }
  },

  async reactivatePermission(adminUserId: string, permissionCode: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('whatsapp_button_role_permissions')
        .update({ status: 'active', updated_at: new Date().toISOString() })
        .match({
          admin_user_id: adminUserId,
          permission_code: permissionCode
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error reactivating permission:', error);
      throw error;
    }
  },

  async logActivity(
    adminUserId: string,
    permissionCode: string,
    actionType: string,
    actionDescription: string,
    wasSuccessful: boolean,
    denialReason: string | null = null,
    contextData: any = null
  ): Promise<string> {
    try {
      const { data, error } = await supabase.rpc('log_whatsapp_button_activity', {
        p_admin_user_id: adminUserId,
        p_permission_code: permissionCode,
        p_action_type: actionType,
        p_action_description: actionDescription,
        p_was_successful: wasSuccessful,
        p_denial_reason: denialReason,
        p_context_data: contextData
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error logging activity:', error);
      throw error;
    }
  },

  async getActivityLogs(
    adminUserId: string | null = null,
    limit: number = 50
  ): Promise<ActivityLog[]> {
    try {
      let query = supabase
        .from('whatsapp_button_activity_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (adminUserId) {
        query = query.eq('admin_user_id', adminUserId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      return [];
    }
  },

  async getActivityStats(
    adminUserId: string | null = null,
    daysBack: number = 7
  ): Promise<ActivityStats> {
    try {
      const { data, error } = await supabase.rpc('get_whatsapp_button_activity_stats', {
        p_admin_user_id: adminUserId,
        p_days_back: daysBack
      });

      if (error) throw error;
      return data || {
        total_actions: 0,
        successful_actions: 0,
        denied_actions: 0,
        most_used_permission: null,
        daily_usage: []
      };
    } catch (error) {
      console.error('Error fetching activity stats:', error);
      return {
        total_actions: 0,
        successful_actions: 0,
        denied_actions: 0,
        most_used_permission: null,
        daily_usage: []
      };
    }
  },

  async getViolationAlerts(
    unresolvedOnly: boolean = true,
    limit: number = 50
  ): Promise<ViolationAlert[]> {
    try {
      let query = supabase
        .from('permission_violation_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (unresolvedOnly) {
        query = query.eq('is_resolved', false);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching violation alerts:', error);
      return [];
    }
  },

  async resolveViolationAlert(alertId: string, resolvedBy: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('permission_violation_alerts')
        .update({
          is_resolved: true,
          resolved_by: resolvedBy,
          resolved_at: new Date().toISOString()
        })
        .eq('id', alertId);

      if (error) throw error;
    } catch (error) {
      console.error('Error resolving violation alert:', error);
      throw error;
    }
  },

  async getSmartRules(adminUserId: string | null = null): Promise<SmartRule[]> {
    try {
      let query = supabase
        .from('smart_permission_rules')
        .select('*')
        .order('created_at', { ascending: false });

      if (adminUserId) {
        query = query.eq('admin_user_id', adminUserId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching smart rules:', error);
      return [];
    }
  },

  async createSmartRule(
    adminUserId: string,
    permissionCode: string,
    ruleType: 'time_based' | 'context_based' | 'behavior_based' | 'ai_suggested',
    ruleConfig: any,
    createdBy: string
  ): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('smart_permission_rules')
        .insert({
          admin_user_id: adminUserId,
          permission_code: permissionCode,
          rule_type: ruleType,
          rule_config: ruleConfig,
          is_active: true,
          created_by: createdBy
        })
        .select('id')
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Error creating smart rule:', error);
      throw error;
    }
  },

  async toggleSmartRule(ruleId: string, isActive: boolean): Promise<void> {
    try {
      const { error } = await supabase
        .from('smart_permission_rules')
        .update({ is_active: isActive, updated_at: new Date().toISOString() })
        .eq('id', ruleId);

      if (error) throw error;
    } catch (error) {
      console.error('Error toggling smart rule:', error);
      throw error;
    }
  },

  async deleteSmartRule(ruleId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('smart_permission_rules')
        .delete()
        .eq('id', ruleId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting smart rule:', error);
      throw error;
    }
  },

  async getMostActiveUsers(limit: number = 10): Promise<Array<{
    admin_user_id: string;
    username: string;
    total_actions: number;
    success_rate: number;
  }>> {
    try {
      const { data, error } = await supabase
        .from('whatsapp_button_activity_log')
        .select(`
          admin_user_id,
          was_successful
        `)
        .not('admin_user_id', 'is', null);

      if (error) throw error;

      const userStats = new Map<string, { successful: number; total: number }>();

      data?.forEach(log => {
        if (!log.admin_user_id) return;

        const stats = userStats.get(log.admin_user_id) || { successful: 0, total: 0 };
        stats.total += 1;
        if (log.was_successful) stats.successful += 1;
        userStats.set(log.admin_user_id, stats);
      });

      const { data: users } = await supabase
        .from('admin_users')
        .select('id, username')
        .in('id', Array.from(userStats.keys()));

      const results = Array.from(userStats.entries())
        .map(([userId, stats]) => {
          const user = users?.find(u => u.id === userId);
          return {
            admin_user_id: userId,
            username: user?.username || 'Unknown',
            total_actions: stats.total,
            success_rate: (stats.successful / stats.total) * 100
          };
        })
        .sort((a, b) => b.total_actions - a.total_actions)
        .slice(0, limit);

      return results;
    } catch (error) {
      console.error('Error fetching most active users:', error);
      return [];
    }
  },

  async getUnusedPermissions(daysInactive: number = 30): Promise<Array<{
    admin_user_id: string;
    permission_code: string;
    granted_at: string;
    last_used_at: string | null;
  }>> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysInactive);

      const { data, error } = await supabase
        .from('whatsapp_button_role_permissions')
        .select('admin_user_id, permission_code, granted_at, last_used_at')
        .eq('status', 'active')
        .or(`last_used_at.is.null,last_used_at.lt.${cutoffDate.toISOString()}`);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching unused permissions:', error);
      return [];
    }
  }
};
