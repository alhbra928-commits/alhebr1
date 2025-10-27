import { supabase } from '../lib/supabase';

interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop';
  browser: string;
  os: string;
  screenResolution: string;
  language: string;
}

interface UTMParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
}

class VisitorTrackingService {
  private sessionId: string | null = null;
  private sessionStartTime: number = Date.now();
  private currentPageStartTime: number = Date.now();
  private currentPageUrl: string = '';
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initSession();
  }

  // إنشاء أو استعادة Session ID
  private initSession(): void {
    const existingSessionId = sessionStorage.getItem('visitor_session_id');

    if (existingSessionId) {
      this.sessionId = existingSessionId;
    } else {
      this.sessionId = this.generateSessionId();
      sessionStorage.setItem('visitor_session_id', this.sessionId);
    }
  }

  // توليد Session ID فريد
  private generateSessionId(): string {
    return `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  // الحصول على معلومات الجهاز
  private getDeviceInfo(): DeviceInfo {
    const ua = navigator.userAgent;

    // تحديد نوع الجهاز
    let type: 'mobile' | 'tablet' | 'desktop' = 'desktop';
    if (/Mobile|Android|iPhone/i.test(ua)) {
      type = 'mobile';
    } else if (/iPad|Tablet/i.test(ua)) {
      type = 'tablet';
    }

    // تحديد المتصفح
    let browser = 'Unknown';
    if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
    else if (ua.includes('Edge')) browser = 'Edge';
    else if (ua.includes('Opera')) browser = 'Opera';

    // تحديد نظام التشغيل
    let os = 'Unknown';
    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Mac')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

    return {
      type,
      browser,
      os,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      language: navigator.language
    };
  }

  // استخراج UTM Parameters من URL
  private extractUTMParams(): UTMParams {
    const urlParams = new URLSearchParams(window.location.search);

    const utmParams: UTMParams = {};

    if (urlParams.has('utm_source')) utmParams.utm_source = urlParams.get('utm_source') || undefined;
    if (urlParams.has('utm_medium')) utmParams.utm_medium = urlParams.get('utm_medium') || undefined;
    if (urlParams.has('utm_campaign')) utmParams.utm_campaign = urlParams.get('utm_campaign') || undefined;
    if (urlParams.has('utm_term')) utmParams.utm_term = urlParams.get('utm_term') || undefined;
    if (urlParams.has('utm_content')) utmParams.utm_content = urlParams.get('utm_content') || undefined;

    // حفظ UTM في session storage للاستخدام في الصفحات التالية
    if (Object.keys(utmParams).length > 0) {
      sessionStorage.setItem('utm_params', JSON.stringify(utmParams));
    }

    // محاولة استعادة UTM من session storage إذا لم تكن موجودة في URL الحالي
    const savedUTM = sessionStorage.getItem('utm_params');
    if (savedUTM && Object.keys(utmParams).length === 0) {
      return JSON.parse(savedUTM);
    }

    return utmParams;
  }

  // تحديد قسم الصفحة من URL
  private getPageSection(url: string): string {
    const path = new URL(url).pathname;

    if (path === '/' || path === '') return 'home';
    if (path.includes('/farms')) return 'farms';
    if (path.includes('/farm/')) return 'farm_detail';
    if (path.includes('/booking')) return 'booking';
    if (path.includes('/certificate')) return 'certificate';
    if (path.includes('/verify')) return 'verification';
    if (path.includes('/about')) return 'about';
    if (path.includes('/contact')) return 'contact';

    return 'other';
  }

  // تسجيل جلسة جديدة
  async trackSession(): Promise<void> {
    if (!this.sessionId) return;

    const deviceInfo = this.getDeviceInfo();
    const utmParams = this.extractUTMParams();

    try {
      await supabase.rpc('track_visitor_session', {
        p_session_id: this.sessionId,
        p_user_agent: navigator.userAgent,
        p_device_type: deviceInfo.type,
        p_browser: deviceInfo.browser,
        p_os: deviceInfo.os,
        p_screen_resolution: deviceInfo.screenResolution,
        p_language: deviceInfo.language,
        p_referrer_url: document.referrer || null,
        p_landing_page: window.location.href,
        p_utm_source: utmParams.utm_source || null,
        p_utm_medium: utmParams.utm_medium || null,
        p_utm_campaign: utmParams.utm_campaign || null,
        p_utm_term: utmParams.utm_term || null,
        p_utm_content: utmParams.utm_content || null
      });

      console.log('📊 Visitor session tracked:', this.sessionId);

      // بدء heartbeat
      this.startHeartbeat();
    } catch (error) {
      console.error('Error tracking session:', error);
    }
  }

  // تسجيل زيارة صفحة
  async trackPageView(pageUrl?: string): Promise<void> {
    if (!this.sessionId) return;

    // حفظ وقت الصفحة السابقة إذا كانت موجودة
    if (this.currentPageUrl) {
      const timeOnPreviousPage = Math.floor((Date.now() - this.currentPageStartTime) / 1000);
      await this.updatePageTime(this.currentPageUrl, timeOnPreviousPage);
    }

    const url = pageUrl || window.location.href;
    const utmParams = this.extractUTMParams();

    this.currentPageUrl = url;
    this.currentPageStartTime = Date.now();

    try {
      await supabase.rpc('track_page_visit', {
        p_session_id: this.sessionId,
        p_page_url: url,
        p_page_title: document.title,
        p_page_path: window.location.pathname,
        p_page_section: this.getPageSection(url),
        p_time_on_page_seconds: 0,
        p_utm_source: utmParams.utm_source || null,
        p_utm_medium: utmParams.utm_medium || null,
        p_utm_campaign: utmParams.utm_campaign || null
      });

      console.log('📄 Page view tracked:', url);
    } catch (error) {
      console.error('Error tracking page view:', error);
    }
  }

  // تحديث وقت البقاء في الصفحة
  private async updatePageTime(pageUrl: string, timeSeconds: number): Promise<void> {
    // يمكن إضافة هذه الدالة لاحقاً لتحديث وقت البقاء
    console.log(`⏱️ Time on page ${pageUrl}: ${timeSeconds}s`);
  }

  // تحديث مدة الجلسة
  async updateSessionDuration(): Promise<void> {
    if (!this.sessionId) return;

    const duration = Math.floor((Date.now() - this.sessionStartTime) / 1000);

    try {
      await supabase.rpc('update_session_duration', {
        p_session_id: this.sessionId,
        p_duration_seconds: duration
      });
    } catch (error) {
      console.error('Error updating session duration:', error);
    }
  }

  // بدء heartbeat للزوار الحاليين
  private startHeartbeat(): void {
    // تحديث كل دقيقة
    this.heartbeatInterval = setInterval(() => {
      this.updateSessionDuration();
    }, 60000); // 60 ثانية
  }

  // إيقاف heartbeat
  stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // معالج الخروج من الصفحة
  async handlePageUnload(): Promise<void> {
    if (this.currentPageUrl) {
      const timeOnPage = Math.floor((Date.now() - this.currentPageStartTime) / 1000);
      await this.updatePageTime(this.currentPageUrl, timeOnPage);
    }

    await this.updateSessionDuration();
    this.stopHeartbeat();
  }

  // الحصول على عدد الزوار الحاليين
  async getRealtimeVisitorsCount(): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('get_realtime_visitors_count');

      if (error) throw error;

      return data || 0;
    } catch (error) {
      console.error('Error getting realtime visitors:', error);
      return 0;
    }
  }

  // توليد رابط تتبع لمنصة معينة
  generateTrackingLink(
    baseUrl: string,
    platform: string,
    campaign?: string
  ): string {
    const url = new URL(baseUrl);

    // إضافة UTM parameters
    url.searchParams.set('utm_source', platform);
    url.searchParams.set('utm_medium', 'social');

    if (campaign) {
      url.searchParams.set('utm_campaign', campaign);
    }

    return url.toString();
  }
}

// إنشاء instance واحد
export const visitorTrackingService = new VisitorTrackingService();

// تسجيل الجلسة عند تحميل الصفحة
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    visitorTrackingService.trackSession();
    visitorTrackingService.trackPageView();
  });

  // معالجة الخروج من الصفحة
  window.addEventListener('beforeunload', () => {
    visitorTrackingService.handlePageUnload();
  });

  // تتبع تغييرات الصفحة في Single Page Applications
  let lastUrl = window.location.href;
  new MutationObserver(() => {
    const currentUrl = window.location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      visitorTrackingService.trackPageView(currentUrl);
    }
  }).observe(document.body, { subtree: true, childList: true });
}
