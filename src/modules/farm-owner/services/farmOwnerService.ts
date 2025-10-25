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
  bank_name: string | null;
  bank_account_number: string | null;
  bank_iban: string | null;
  bank_account_holder_name: string | null;
  bank_branch: string | null;
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
   * توليد رمز OTP عشوائي (6 أرقام)
   */
  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * التحقق من وجود الحساب
   */
  async checkAccount(mobileNumber: string) {
    try {
      const { data, error } = await supabase
        .from('farm_owner_profiles')
        .select('id, mobile_number, status')
        .eq('mobile_number', mobileNumber)
        .is('deleted_at', null)
        .maybeSingle();

      if (error) throw error;

      return {
        exists: !!data,
        profile: data
      };
    } catch (error: any) {
      console.error('خطأ في التحقق من الحساب:', error);
      return { exists: false, profile: null };
    }
  }

  /**
   * إرسال OTP
   */
  async sendOTP(mobileNumber: string): Promise<{ success: boolean; otp?: string; is_new?: boolean; error?: string }> {
    try {
      const { exists } = await this.checkAccount(mobileNumber);
      const otp = this.generateOTP();

      // حفظ OTP في localStorage للاختبار
      const otpData = {
        mobile_number: mobileNumber,
        otp,
        timestamp: Date.now(),
        expires_at: Date.now() + (5 * 60 * 1000) // 5 دقائق
      };
      localStorage.setItem('farm_owner_otp', JSON.stringify(otpData));

      // في المستقبل: إرسال OTP عبر واتساب هنا
      console.log(`📱 OTP للرقم ${mobileNumber}: ${otp}`);

      return {
        success: true,
        otp, // للاختبار فقط - في الإنتاج نحذف هذا
        is_new: !exists
      };
    } catch (error: any) {
      console.error('خطأ في إرسال OTP:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * التحقق من OTP وتسجيل الدخول
   */
  async verifyOTPAndLogin(mobileNumber: string, otp: string) {
    try {
      // التحقق من OTP
      const savedOTP = localStorage.getItem('farm_owner_otp');
      if (!savedOTP) {
        return { success: false, error: 'لم يتم إرسال رمز التحقق' };
      }

      const otpData = JSON.parse(savedOTP);

      // التحقق من الرقم
      if (otpData.mobile_number !== mobileNumber) {
        return { success: false, error: 'رقم الجوال غير صحيح' };
      }

      // التحقق من انتهاء الصلاحية
      if (Date.now() > otpData.expires_at) {
        localStorage.removeItem('farm_owner_otp');
        return { success: false, error: 'انتهت صلاحية الرمز. الرجاء طلب رمز جديد' };
      }

      // التحقق من الرمز
      if (otpData.otp !== otp) {
        return { success: false, error: 'رمز التحقق غير صحيح' };
      }

      // حذف OTP بعد الاستخدام
      localStorage.removeItem('farm_owner_otp');

      // تسجيل الدخول أو إنشاء حساب
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
      console.error('خطأ في التحقق من OTP:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * تسجيل دخول مباشر (للمرة الأولى فقط)
   */
  async directLogin(mobileNumber: string) {
    try {
      // التحقق من أن الحساب غير موجود
      const { exists } = await this.checkAccount(mobileNumber);
      if (exists) {
        return { success: false, error: 'الحساب موجود مسبقاً. يرجى استخدام رمز التحقق' };
      }

      // إنشاء حساب جديد
      const { data, error } = await supabase.rpc('farm_owner_login_or_create', {
        p_mobile_number: mobileNumber
      });

      if (error) throw error;

      if (data?.success) {
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
          is_new: true
        };
      }

      return { success: false, error: data?.error || 'فشل تسجيل الدخول' };
    } catch (error: any) {
      console.error('خطأ في التسجيل المباشر:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * تسجيل دخول مباشر مع الاسم (للمرة الأولى فقط)
   */
  async directLoginWithName(mobileNumber: string, fullName: string) {
    try {
      // التحقق من أن الحساب غير موجود
      const { exists } = await this.checkAccount(mobileNumber);
      if (exists) {
        return { success: false, error: 'الحساب موجود مسبقاً. يرجى استخدام رمز التحقق' };
      }

      // إنشاء حساب جديد
      const { data, error } = await supabase.rpc('farm_owner_login_or_create', {
        p_mobile_number: mobileNumber
      });

      if (error) throw error;

      if (data?.success) {
        // تحديث الاسم الكامل
        const { error: updateError } = await supabase
          .from('farm_owner_profiles')
          .update({ full_name: fullName })
          .eq('id', data.profile_id);

        if (updateError) {
          console.error('خطأ في تحديث الاسم:', updateError);
        }

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
          is_new: true
        };
      }

      return { success: false, error: data?.error || 'فشل تسجيل الدخول' };
    } catch (error: any) {
      console.error('خطأ في التسجيل المباشر:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * إنشاء حساب جديد (للمرة الأولى)
   */
  async createProfile(mobileNumber: string, fullName: string): Promise<{ success: boolean; profileId?: string; error?: string }> {
    try {
      console.log('🔵 بدء إنشاء حساب جديد:', { mobileNumber, fullName });

      // التحقق من أن الحساب غير موجود
      const { exists } = await this.checkAccount(mobileNumber);
      if (exists) {
        console.log('⚠️ الحساب موجود مسبقاً');
        return { success: false, error: 'الحساب موجود مسبقاً' };
      }

      console.log('✅ الحساب غير موجود، جاري الإنشاء...');

      // إنشاء حساب جديد مباشرة في الجدول
      const { data: profile, error: insertError } = await supabase
        .from('farm_owner_profiles')
        .insert({
          mobile_number: mobileNumber,
          full_name: fullName,
          status: 'pending'
        })
        .select()
        .single();

      if (insertError) {
        console.error('❌ خطأ في إنشاء الحساب:', insertError);
        throw insertError;
      }

      console.log('✅ تم إنشاء الحساب بنجاح:', profile);

      // حفظ بيانات الجلسة
      const sessionToken = Math.random().toString(36).substring(2);
      localStorage.setItem('farm_owner_session', JSON.stringify({
        profile_id: profile.id,
        session_token: sessionToken,
        mobile_number: mobileNumber,
        status: profile.status
      }));

      console.log('✅ تم حفظ الجلسة بنجاح');

      return {
        success: true,
        profileId: profile.id
      };
    } catch (error: any) {
      console.error('❌ خطأ في إنشاء الحساب:', error);
      return {
        success: false,
        error: error.message || 'فشل إنشاء الحساب'
      };
    }
  }

  /**
   * التحقق من OTP
   */
  async verifyOTP(mobileNumber: string, otp: string): Promise<{ success: boolean; profileId?: string; status?: string; error?: string }> {
    try {
      console.log('🔵 بدء التحقق من OTP:', { mobileNumber, otp });

      // التحقق من OTP المحفوظ
      const savedOTP = localStorage.getItem('farm_owner_otp');
      if (!savedOTP) {
        console.log('⚠️ لم يتم العثور على OTP محفوظ');
        return { success: false, error: 'لم يتم إرسال رمز التحقق' };
      }

      const otpData = JSON.parse(savedOTP);
      console.log('📋 OTP المحفوظ:', otpData);

      // التحقق من الرقم
      if (otpData.mobile_number !== mobileNumber) {
        console.log('⚠️ رقم الجوال غير متطابق');
        return { success: false, error: 'رقم الجوال غير صحيح' };
      }

      // التحقق من انتهاء الصلاحية
      if (Date.now() > otpData.expires_at) {
        console.log('⚠️ انتهت صلاحية OTP');
        localStorage.removeItem('farm_owner_otp');
        return { success: false, error: 'انتهت صلاحية الرمز' };
      }

      // التحقق من الرمز
      if (otpData.otp !== otp) {
        console.log('⚠️ رمز التحقق غير صحيح');
        return { success: false, error: 'رمز التحقق غير صحيح' };
      }

      console.log('✅ تم التحقق من OTP بنجاح');

      // حذف OTP بعد الاستخدام
      localStorage.removeItem('farm_owner_otp');

      // البحث عن الحساب
      const { data: profile, error: profileError } = await supabase
        .from('farm_owner_profiles')
        .select('*')
        .eq('mobile_number', mobileNumber)
        .is('deleted_at', null)
        .maybeSingle();

      if (profileError) {
        console.error('❌ خطأ في البحث عن الحساب:', profileError);
        throw profileError;
      }

      if (!profile) {
        console.log('⚠️ الحساب غير موجود');
        return { success: false, error: 'الحساب غير موجود' };
      }

      console.log('✅ تم العثور على الحساب:', profile);

      // حفظ بيانات الجلسة
      const sessionToken = Math.random().toString(36).substring(2);
      localStorage.setItem('farm_owner_session', JSON.stringify({
        profile_id: profile.id,
        session_token: sessionToken,
        mobile_number: mobileNumber,
        status: profile.status
      }));

      console.log('✅ تم تسجيل الدخول بنجاح');

      return {
        success: true,
        profileId: profile.id,
        status: profile.status
      };
    } catch (error: any) {
      console.error('❌ خطأ في التحقق من OTP:', error);
      return {
        success: false,
        error: error.message || 'فشل التحقق من الرمز'
      };
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
        .select(`
          id,
          mobile_number,
          full_name,
          national_id,
          status,
          bank_name,
          bank_account_number,
          bank_iban,
          created_at
        `)
        .eq('id', profileId)
        .is('deleted_at', null)
        .maybeSingle();

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
      bank_name?: string;
      bank_account_number?: string;
      bank_iban?: string;
      bank_account_holder_name?: string;
      bank_branch?: string;
      farm_id?: string;
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
        p_varieties: formData.varieties,
        p_bank_name: formData.bank_name || null,
        p_bank_account_number: formData.bank_account_number || null,
        p_bank_iban: formData.bank_iban || null,
        p_bank_account_holder_name: formData.bank_account_holder_name || null,
        p_bank_branch: formData.bank_branch || null,
        p_farm_id: formData.farm_id || null
      });

      if (error) throw error;

      return {
        success: data?.success || false,
        submission_id: data?.submission_id,
        farm_id: data?.farm_id,
        farm_code: data?.farm_code,
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
   * الحصول على جميع المزارع لصاحب المزرعة
   */
  async getOwnerFarms(profileId: string) {
    try {
      const { data, error } = await supabase
        .from('farms')
        .select('*')
        .eq('owner_id', profileId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('خطأ في جلب المزارع:', error);
      return [];
    }
  }

  /**
   * الحصول على تفاصيل مزرعة محددة
   */
  async getFarm(farmId: string) {
    try {
      const { data, error } = await supabase
        .from('farms')
        .select('*')
        .eq('id', farmId)
        .is('deleted_at', null)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('خطأ في جلب تفاصيل المزرعة:', error);
      return null;
    }
  }

  /**
   * الحصول على حالة المزرعة (نسخة محسنة وسريعة)
   */
  async getFarmStatus(profileId: string): Promise<FarmStatus | null> {
    try {
      // استعلام بسيط ومباشر بدون RPC
      const { data: profile, error: profileError } = await supabase
        .from('farm_owner_profiles')
        .select('status, farm_owner_id')
        .eq('id', profileId)
        .is('deleted_at', null)
        .maybeSingle();

      if (profileError) throw profileError;
      if (!profile) return null;

      return {
        profile_status: profile.status,
        farm_owner_id: profile.farm_owner_id,
        message: 'تم جلب البيانات بنجاح'
      };
    } catch (error: any) {
      console.error('خطأ في جلب حالة المزرعة:', error);
      return null;
    }
  }

  /**
   * الحصول على الإشعارات (محسنة - فقط الأخيرة)
   */
  async getNotifications(profileId: string): Promise<FarmOwnerNotification[]> {
    try {
      const { data, error } = await supabase
        .from('farm_owner_notifications')
        .select('id, title_ar, message_ar, notification_type, is_read, priority, created_at')
        .eq('profile_id', profileId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(10); // تقليل العدد من 50 إلى 10 لسرعة أكبر

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
   * تحديث المعلومات الشخصية للمالك
   */
  async updateProfile(profileId: string, data: {
    full_name?: string;
    national_id?: string;
    bank_name?: string | null;
    bank_account_number?: string | null;
    bank_iban?: string | null;
    bank_account_holder_name?: string | null;
    bank_branch?: string | null;
  }) {
    try {
      const { error } = await supabase
        .from('farm_owner_profiles')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', profileId);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('خطأ في تحديث الملف الشخصي:', error);
      return { success: false, error: error.message };
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
