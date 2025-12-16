import { supabase } from '../../../lib/supabase';

interface WelcomeStatus {
  shouldShow: boolean;
  loginCount: number;
  lastLogin: Date;
}

export class WelcomeService {
  /**
   * التحقق من أول دخول وإرجاع حالة الترحيب
   */
  static async checkFirstLogin(phone: string): Promise<boolean> {
    try {
      console.log('[WelcomeService] Checking first login for:', phone);

      const { data, error } = await supabase
        .rpc('check_first_login', { investor_phone: phone });

      if (error) {
        console.error('[WelcomeService] Error checking first login:', error);
        // في حالة خطأ، نعرض الترحيب احتياطاً
        return true;
      }

      console.log('[WelcomeService] Should show welcome:', data);
      return data === true;
    } catch (error) {
      console.error('[WelcomeService] Exception:', error);
      return true;
    }
  }

  /**
   * الحصول على حالة الترحيب كاملة
   */
  static async getWelcomeStatus(phone: string): Promise<WelcomeStatus> {
    try {
      console.log('[WelcomeService] Getting welcome status for:', phone);

      const { data, error } = await supabase
        .rpc('get_welcome_status', { investor_phone: phone });

      if (error) {
        console.error('[WelcomeService] Error getting status:', error);
        return {
          shouldShow: true,
          loginCount: 0,
          lastLogin: new Date()
        };
      }

      if (data && data.length > 0) {
        const status = data[0];
        console.log('[WelcomeService] Status:', status);
        return {
          shouldShow: status.should_show_welcome,
          loginCount: status.login_count,
          lastLogin: new Date(status.last_login)
        };
      }

      // إذا لم يوجد سجل، هذا مستثمر جديد
      return {
        shouldShow: true,
        loginCount: 0,
        lastLogin: new Date()
      };
    } catch (error) {
      console.error('[WelcomeService] Exception:', error);
      return {
        shouldShow: true,
        loginCount: 0,
        lastLogin: new Date()
      };
    }
  }

  /**
   * تسجيل أن المستثمر رأى رسالة الترحيب
   */
  static async markWelcomeShown(phone: string): Promise<boolean> {
    try {
      console.log('[WelcomeService] Marking welcome as shown for:', phone);

      const { data, error } = await supabase
        .rpc('mark_welcome_shown', { investor_phone: phone });

      if (error) {
        console.error('[WelcomeService] Error marking welcome:', error);
        return false;
      }

      console.log('[WelcomeService] Welcome marked successfully');
      return data === true;
    } catch (error) {
      console.error('[WelcomeService] Exception:', error);
      return false;
    }
  }

  /**
   * التحقق المباشر من قاعدة البيانات
   */
  static async shouldShowWelcomeDirect(phone: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('investor_welcome_status')
        .select('welcome_shown')
        .eq('phone', phone)
        .maybeSingle();

      if (error) {
        console.error('[WelcomeService] Error in direct check:', error);
        return true;
      }

      // إذا لم يوجد سجل، هذا مستثمر جديد
      if (!data) {
        console.log('[WelcomeService] No record found - new investor');
        return true;
      }

      // إرجاع عكس welcome_shown (إذا shown = false، نعرض الترحيب)
      const shouldShow = !data.welcome_shown;
      console.log('[WelcomeService] Direct check result:', shouldShow);
      return shouldShow;
    } catch (error) {
      console.error('[WelcomeService] Exception in direct check:', error);
      return true;
    }
  }

  /**
   * إعادة تعيين حالة الترحيب (للاختبار)
   */
  static async resetWelcomeStatus(phone: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('investor_welcome_status')
        .update({
          welcome_shown: false,
          welcome_shown_at: null,
          updated_at: new Date().toISOString()
        })
        .eq('phone', phone);

      if (error) {
        console.error('[WelcomeService] Error resetting:', error);
        return false;
      }

      console.log('[WelcomeService] Welcome status reset successfully');
      return true;
    } catch (error) {
      console.error('[WelcomeService] Exception:', error);
      return false;
    }
  }
}
