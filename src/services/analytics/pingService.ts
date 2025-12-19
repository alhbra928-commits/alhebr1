/**
 * Simple PING Service - بدون تعقيد
 * يرسل ping واحد عند تحميل الصفحة ويحفظ في DB مباشرة
 */

import { supabase } from '../../lib/supabase';

interface PingData {
  session_id: string;
  path: string;
  landing_path: string;
  referrer: string | null;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  user_agent: string;
  device_type: string;
  os: string;
}

class SimplePingService {
  private hasSentPing = false;
  private PING_KEY = 'ping_sent_at';
  private SESSION_KEY = 'analytics_session_id';

  /**
   * الحصول على session_id أو إنشاء واحد جديد
   */
  private getOrCreateSessionId(): string {
    let sessionId = localStorage.getItem(this.SESSION_KEY);

    if (!sessionId) {
      // إنشاء UUID بسيط
      sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem(this.SESSION_KEY, sessionId);
      console.log('🆕 Created new session:', sessionId);
    }

    return sessionId;
  }

  /**
   * تحليل نظام التشغيل من user agent
   */
  private detectOS(ua: string): string {
    const uaLower = ua.toLowerCase();

    if (uaLower.includes('windows')) return 'Windows';
    if (uaLower.includes('mac os')) return 'macOS';
    if (uaLower.includes('iphone') || uaLower.includes('ipad')) return 'iOS';
    if (uaLower.includes('android')) return 'Android';
    if (uaLower.includes('linux')) return 'Linux';

    return 'Unknown';
  }

  /**
   * إرسال PING واحد فقط - مرة واحدة عند تحميل الصفحة
   */
  async sendPing(): Promise<{ success: boolean; httpCode?: number; error?: string }> {
    // تأكد إنه ما أرسل ping قبل كذا في هذه الجلسة
    if (this.hasSentPing) {
      console.log('⏭️ PING already sent in this session');
      return { success: true, httpCode: 200 };
    }

    // تأكد إنه ما أرسل ping في آخر 5 دقائق (localStorage)
    const lastPing = localStorage.getItem(this.PING_KEY);
    if (lastPing) {
      const elapsed = Date.now() - parseInt(lastPing);
      if (elapsed < 5 * 60 * 1000) { // 5 minutes
        console.log('⏭️ PING sent recently, skipping');
        return { success: true, httpCode: 200 };
      }
    }

    try {
      const pingData = this.collectPingData();

      console.log('📡 Sending PING...');
      console.log('  Session:', pingData.session_id);
      console.log('  Path:', pingData.path);
      console.log('  Referrer:', pingData.referrer || 'Direct');
      console.log('  UTM Source:', pingData.utm_source || 'none');
      console.log('  Device:', pingData.device_type);
      console.log('  OS:', pingData.os);

      const startTime = Date.now();

      // إرسال مباشر إلى Supabase - بدون تعقيد
      const { data, error } = await supabase
        .from('analytics_pings')
        .insert([pingData])
        .select('id')
        .single();

      const elapsed = Date.now() - startTime;

      if (error) {
        console.error('❌ PING Failed:', error);

        // Dispatch failure event for debug badge
        window.dispatchEvent(new CustomEvent('ping-status', {
          detail: {
            success: false,
            error: error.message,
            httpCode: error.code ? parseInt(error.code) : 500,
            elapsed
          }
        }));

        return {
          success: false,
          httpCode: error.code ? parseInt(error.code) : 500,
          error: error.message
        };
      }

      // نجح!
      console.log(`✅ PING Sent Successfully! (${elapsed}ms)`);
      console.log('  ID:', data?.id);

      this.hasSentPing = true;
      localStorage.setItem(this.PING_KEY, Date.now().toString());

      // Dispatch success event for debug badge
      window.dispatchEvent(new CustomEvent('ping-status', {
        detail: {
          success: true,
          httpCode: 201,
          elapsed,
          id: data?.id
        }
      }));

      return { success: true, httpCode: 201 };

    } catch (error: any) {
      console.error('❌ PING Exception:', error);

      window.dispatchEvent(new CustomEvent('ping-status', {
        detail: {
          success: false,
          error: error.message || 'Unknown error',
          httpCode: 500,
        }
      }));

      return {
        success: false,
        httpCode: 500,
        error: error.message || 'Unknown error'
      };
    }
  }

  /**
   * جمع بيانات الـ PING
   */
  private collectPingData(): PingData {
    const urlParams = new URLSearchParams(window.location.search);
    const ua = navigator.userAgent.toLowerCase();
    const fullPath = window.location.pathname + window.location.search;

    let deviceType = 'desktop';
    if (/mobile|android|iphone|ipod/.test(ua)) {
      deviceType = 'mobile';
    } else if (/tablet|ipad/.test(ua)) {
      deviceType = 'tablet';
    }

    const sessionId = this.getOrCreateSessionId();
    const os = this.detectOS(navigator.userAgent);

    return {
      session_id: sessionId,
      path: fullPath,
      landing_path: fullPath, // نفس الشيء، لكن اسم أوضح
      referrer: document.referrer || null,
      utm_source: urlParams.get('utm_source') || undefined,
      utm_medium: urlParams.get('utm_medium') || undefined,
      utm_campaign: urlParams.get('utm_campaign') || undefined,
      user_agent: navigator.userAgent,
      device_type: deviceType,
      os: os,
    };
  }

  /**
   * إعادة تعيين - للاختبار فقط
   */
  reset() {
    this.hasSentPing = false;
    localStorage.removeItem(this.PING_KEY);
    console.log('🔄 PING Service Reset');
  }
}

export const PingService = new SimplePingService();
