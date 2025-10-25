import { supabase } from '../lib/supabase';

/**
 * Smart Version Tracking Service
 * نظام تتبع الإصدارات والإشعارات التلقائية
 */

export interface SystemVersion {
  id: string;
  version: string;
  build_number: string | null;
  deployed_at: string;
  deployed_by: string | null;
  changelog: Array<{ change: string; date: string }>;
  environment: string;
  is_active: boolean;
  metadata: Record<string, any>;
  created_at: string;
}

export interface UpdateNotification {
  id: string;
  version_id: string;
  title_ar: string;
  title_en: string | null;
  message_ar: string;
  message_en: string | null;
  priority: 'low' | 'medium' | 'high' | 'critical';
  target_roles: string[];
  is_read: boolean;
  expires_at: string;
  created_at: string;
  version?: SystemVersion;
}

class VersionTrackingService {
  /**
   * الحصول على النسخة النشطة حاليًا
   */
  async getActiveVersion(): Promise<SystemVersion | null> {
    try {
      const { data, error } = await supabase.rpc('get_active_version');

      if (error) throw error;
      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Error fetching active version:', error);
      return null;
    }
  }

  /**
   * تسجيل نسخة جديدة
   */
  async recordNewVersion(
    version: string,
    buildNumber?: string,
    deployedBy?: string,
    changelog?: Array<{ change: string; date: string }>,
    environment: string = 'production'
  ): Promise<string | null> {
    try {
      const { data, error } = await supabase.rpc('record_new_version', {
        p_version: version,
        p_build_number: buildNumber,
        p_deployed_by: deployedBy,
        p_changelog: changelog ? JSON.stringify(changelog) : '[]',
        p_environment: environment,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error recording new version:', error);
      return null;
    }
  }

  /**
   * إنشاء إشعار تحديث
   */
  async createUpdateNotification(
    versionId: string,
    titleAr: string,
    messageAr: string,
    titleEn?: string,
    messageEn?: string,
    priority: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    targetRoles: string[] = ['admin'],
    expiresHours: number = 24
  ): Promise<string | null> {
    try {
      const { data, error } = await supabase.rpc('create_update_notification', {
        p_version_id: versionId,
        p_title_ar: titleAr,
        p_message_ar: messageAr,
        p_title_en: titleEn,
        p_message_en: messageEn,
        p_priority: priority,
        p_target_roles: targetRoles,
        p_expires_hours: expiresHours,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating update notification:', error);
      return null;
    }
  }

  /**
   * الحصول على الإشعارات غير المقروءة
   */
  async getUnreadNotifications(targetRole?: string): Promise<UpdateNotification[]> {
    try {
      let query = supabase
        .from('update_notifications')
        .select(`
          *,
          version:system_versions(*)
        `)
        .eq('is_read', false)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (targetRole) {
        query = query.contains('target_roles', [targetRole]);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching unread notifications:', error);
      return [];
    }
  }

  /**
   * تعليم إشعار كمقروء
   */
  async markNotificationAsRead(notificationId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('mark_notification_read', {
        p_notification_id: notificationId,
      });

      if (error) throw error;
      return data === true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  /**
   * الاشتراك في الإشعارات الجديدة
   */
  subscribeToUpdateNotifications(
    callback: (notification: UpdateNotification) => void
  ) {
    const channel = supabase
      .channel('update-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'update_notifications',
        },
        async (payload) => {
          // Fetch full notification with version details
          const { data } = await supabase
            .from('update_notifications')
            .select(`
              *,
              version:system_versions(*)
            `)
            .eq('id', payload.new.id)
            .single();

          if (data) {
            callback(data as UpdateNotification);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  /**
   * حذف الإشعارات القديمة
   */
  async cleanupOldNotifications(): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('cleanup_old_notifications');

      if (error) throw error;
      return data || 0;
    } catch (error) {
      console.error('Error cleaning up old notifications:', error);
      return 0;
    }
  }

  /**
   * الحصول على سجل الإصدارات
   */
  async getVersionHistory(limit: number = 10): Promise<SystemVersion[]> {
    try {
      const { data, error } = await supabase
        .from('system_versions')
        .select('*')
        .order('deployed_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching version history:', error);
      return [];
    }
  }
}

export const versionTrackingService = new VersionTrackingService();
