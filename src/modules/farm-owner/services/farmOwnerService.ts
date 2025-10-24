/**
 * خدمة لوحة صاحب المزرعة الذكية
 * Smart Farm Owner Dashboard Service
 */

import { supabase } from '../../../lib/supabase';

export interface FarmOwnerProfile {
  id: string;
  mobile_number: string;
  full_name: string | null;
  national_id: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'suspended';
  region: string | null;
  city: string | null;
  location_lat: number | null;
  location_lng: number | null;
  deed_number: string | null;
  total_farm_area: number | null;
  farm_area_unit: string | null;
  farm_type: 'نخيل' | 'زيتون' | 'مختلط' | null;
  actual_total_price: number | null;
  price_per_tree: number | null;
  payment_grace_period: number | null;
  additional_notes: string | null;
  admin_notes: string | null;
  rejection_reason: string | null;
  farm_owner_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface FarmVariety {
  id?: string;
  variety_type: 'نخيل' | 'زيتون';
  variety_name: string;
  variety_count: number;
  notes?: string;
}

export interface FarmOwnerNotification {
  id: string;
  title_ar: string;
  message_ar: string;
  notification_type: string;
  is_read: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  created_at: string;
  metadata?: any;
}

export interface FarmStatus {
  profile_status: string;
  farm_owner_id: string | null;
  farm_id?: string;
  total_trees?: number;
  reserved_trees?: number;
  available_trees?: number;
  progress_percentage?: number;
  sales_status?: string;
  is_published?: boolean;
  message?: string;
}

class FarmOwnerService {
  /**
   * تسجيل دخول أو إنشاء حساب جديد
   */
  async loginOrCreate(mobileNumber: string) {
    try {
      const { data, error } = await supabase.rpc('farm_owner_login_or_create', {
        p_mobile_number: mobileNumber
      });

      if (error) throw error;

      if (data?.success) {
        // حفظ بيانات الجلسة
        localStorage.setItem('farm_owner_session', JSON.stringify({
          profile_id: data.profile_id,
          session_token: data.session_token,
          mobile_number: mobileNumber,
          status: data.status
        }));

        return {
          success: true,
          profile_id: data.profile_id,
          status: data.status,
          is_new: data.is_new_profile
        };
      }

      return { success: false, error: data?.error || 'فشل تسجيل الدخول' };
    } catch (error: any) {
      console.error('خطأ في تسجيل الدخول:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * تسجيل الخروج
   */
  logout() {
    localStorage.removeItem('farm_owner_session');
  }

  /**
   * الحصول على بيانات الجلسة الحالية
   */
  getSession() {
    const session = localStorage.getItem('farm_owner_session');
    return session ? JSON.parse(session) : null;
  }

  /**
   * التحقق من حالة تسجيل الدخول
   */
  isLoggedIn(): boolean {
    const session = this.getSession();
    return !!session?.profile_id;
  }

  /**
   * الحصول على الملف الشخصي
   */
  async getProfile(profileId: string): Promise<FarmOwnerProfile | null> {
    try {
      const { data, error } = await supabase
        .from('farm_owner_profiles')
        .select('*')
        .eq('id', profileId)
        .is('deleted_at', null)
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('خطأ في جلب الملف الشخصي:', error);
      return null;
    }
  }

  /**
   * الحصول على الأصناف
   */
  async getVarieties(profileId: string): Promise<FarmVariety[]> {
    try {
      const { data, error } = await supabase
        .from('farm_varieties_data')
        .select('*')
        .eq('profile_id', profileId)
        .order('variety_type', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('خطأ في جلب الأصناف:', error);
      return [];
    }
  }

  /**
   * إرسال طلب المراجعة
   */
  async submitForReview(
    profileId: string,
    formData: {
      full_name: string;
      national_id: string;
      region: string;
      city: string;
      deed_number: string;
      total_farm_area: number;
      farm_area_unit: string;
      farm_type: 'نخيل' | 'زيتون' | 'مختلط';
      actual_total_price: number;
      price_per_tree: number;
      payment_grace_period: number;
      location_lat?: number;
      location_lng?: number;
      additional_notes?: string;
      varieties: Array<{
        type: 'نخيل' | 'زيتون';
        name: string;
        count: number;
      }>;
    }
  ) {
    try {
      const { data, error } = await supabase.rpc('submit_farm_for_review', {
        p_profile_id: profileId,
        p_full_name: formData.full_name,
        p_national_id: formData.national_id,
        p_region: formData.region,
        p_city: formData.city,
        p_deed_number: formData.deed_number,
        p_total_farm_area: formData.total_farm_area,
        p_farm_area_unit: formData.farm_area_unit,
        p_farm_type: formData.farm_type,
        p_actual_total_price: formData.actual_total_price,
        p_price_per_tree: formData.price_per_tree,
        p_payment_grace_period: formData.payment_grace_period,
        p_location_lat: formData.location_lat || null,
        p_location_lng: formData.location_lng || null,
        p_additional_notes: formData.additional_notes || null,
        p_varieties: formData.varieties
      });

      if (error) throw error;

      return {
        success: data?.success || false,
        submission_id: data?.submission_id,
        total_trees: data?.total_trees,
        message: data?.message,
        error: data?.error
      };
    } catch (error: any) {
      console.error('خطأ في إرسال الطلب:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * الحصول على حالة المزرعة
   */
  async getFarmStatus(profileId: string): Promise<FarmStatus | null> {
    try {
      const { data, error } = await supabase.rpc('get_farm_status', {
        p_profile_id: profileId
      });

      if (error) throw error;

      return data?.success ? data.data : null;
    } catch (error: any) {
      console.error('خطأ في جلب حالة المزرعة:', error);
      return null;
    }
  }

  /**
   * الحصول على الإشعارات
   */
  async getNotifications(profileId: string): Promise<FarmOwnerNotification[]> {
    try {
      const { data, error } = await supabase
        .from('farm_owner_notifications')
        .select('*')
        .eq('profile_id', profileId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('خطأ في جلب الإشعارات:', error);
      return [];
    }
  }

  /**
   * تحديث حالة قراءة الإشعار
   */
  async markNotificationAsRead(notificationId: string) {
    try {
      const { error } = await supabase
        .from('farm_owner_notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', notificationId);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error('خطأ في تحديث الإشعار:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * عدد الإشعارات غير المقروءة
   */
  async getUnreadNotificationsCount(profileId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('farm_owner_notifications')
        .select('id', { count: 'exact', head: true })
        .eq('profile_id', profileId)
        .eq('is_read', false)
        .is('deleted_at', null);

      if (error) throw error;
      return data?.length || 0;
    } catch (error: any) {
      console.error('خطأ في عد الإشعارات:', error);
      return 0;
    }
  }

  /**
   * الاشتراك في التحديثات اللحظية للإشعارات
   */
  subscribeToNotifications(profileId: string, callback: (notification: FarmOwnerNotification) => void) {
    const channel = supabase
      .channel(`farm-owner-notifications:${profileId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'farm_owner_notifications',
          filter: `profile_id=eq.${profileId}`
        },
        (payload) => {
          callback(payload.new as FarmOwnerNotification);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}

export const farmOwnerService = new FarmOwnerService();
