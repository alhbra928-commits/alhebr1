import { supabase } from '../../lib/supabase';

interface TrackingSession {
  sessionId: string;
  createdAt: Date;
  lastActivity: Date;
}

interface DeviceInfo {
  deviceType: 'mobile' | 'desktop' | 'tablet';
  os: string;
  browser: string;
  screenWidth: number;
  screenHeight: number;
  language: string;
}

interface UTMParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
}

class AnalyticsTrackingService {
  private sessionId: string | null = null;
  private isInitialized = false;
  private SESSION_KEY = 'analytics_session_id';
  private SESSION_START_KEY = 'analytics_session_start';
  private TEST_MODE_KEY = 'analytics_test_mode';
  private activityUpdateInterval: number | null = null;

  async initialize() {
    if (this.isInitialized) return;

    try {
      const existingSessionId = this.getStoredSessionId();

      if (existingSessionId && !this.isSessionExpired()) {
        this.sessionId = existingSessionId;
        await this.updateSessionActivity();
        console.log('♻️ Analytics: استئناف الجلسة الحالية:', this.sessionId);
      } else {
        await this.createNewSession();
        console.log('🆕 Analytics: جلسة جديدة تم إنشاؤها:', this.sessionId);
      }

      this.isInitialized = true;
      this.startActivityUpdates();

      const testMode = this.isTestMode() ? ' [وضع الاختبار]' : '';
      console.log(`✅ نظام التتبع اللحظي مفعّل${testMode}`);
      console.log('📊 Session ID:', this.sessionId);
      console.log('🌐 Landing:', window.location.pathname);
      console.log('📱 Device:', this.getDeviceInfo().device_type);
      console.log('💻 OS:', this.getDeviceInfo().os);

    } catch (error) {
      console.error('❌ فشل تفعيل نظام التتبع:', error);
    }
  }

  private async createNewSession() {
    try {
      const deviceInfo = this.getDeviceInfo();
      const utmParams = this.getUTMParams();
      const referrer = document.referrer || null;
      const landingPath = window.location.pathname + window.location.search;
      const isTest = this.isTestMode();

      console.log('🚀 إنشاء جلسة جديدة...');
      console.log('📍 Landing Path:', landingPath);
      console.log('🔗 Referrer:', referrer || 'مباشر');
      console.log('📱 Device:', deviceInfo.device_type);
      console.log('💻 OS:', deviceInfo.os);
      if (utmParams.utm_source) {
        console.log('🎯 UTM Source:', utmParams.utm_source);
        console.log('📢 UTM Medium:', utmParams.utm_medium);
        console.log('📊 UTM Campaign:', utmParams.utm_campaign);
      }

      const sessionData: any = {
        landing_path: landingPath,
        referrer,
        ...utmParams,
        ...deviceInfo,
        user_agent: navigator.userAgent,
      };

      if (isTest) {
        sessionData.metadata = { is_test: true };
      }

      const { data, error } = await supabase
        .from('analytics_sessions')
        .insert([sessionData])
        .select('session_id')
        .single();

      if (error) {
        // Dispatch failure event
        window.dispatchEvent(new CustomEvent('tracking-status', {
          detail: {
            type: 'session',
            success: false,
            error: error.message,
            httpCode: error.code ? parseInt(error.code) : null,
          }
        }));
        throw error;
      }

      if (data) {
        this.sessionId = data.session_id;
        this.storeSessionId(data.session_id);
        console.log('✅ تم تسجيل الجلسة بنجاح');
        console.log('🆔 Session ID:', data.session_id);

        // Dispatch success event
        window.dispatchEvent(new CustomEvent('tracking-status', {
          detail: {
            type: 'session',
            success: true,
            sessionId: data.session_id,
            httpCode: 201,
          }
        }));
      }
    } catch (error) {
      console.error('❌ فشل إنشاء الجلسة:', error);
    }
  }

  private async updateSessionActivity() {
    if (!this.sessionId) return;

    try {
      await supabase
        .from('analytics_sessions')
        .update({
          updated_at: new Date().toISOString(),
          duration_seconds: this.getSessionDuration(),
          is_active: true,
        })
        .eq('session_id', this.sessionId);
    } catch (error) {
      console.error('❌ Failed to update session activity:', error);
    }
  }

  private getDeviceInfo(): any {
    const ua = navigator.userAgent.toLowerCase();

    let deviceType: 'mobile' | 'desktop' | 'tablet' = 'desktop';
    if (/mobile|android|iphone|ipod/.test(ua)) {
      deviceType = 'mobile';
    } else if (/tablet|ipad/.test(ua)) {
      deviceType = 'tablet';
    }

    let os = 'unknown';
    if (/windows/.test(ua)) os = 'windows';
    else if (/mac/.test(ua)) os = 'mac';
    else if (/linux/.test(ua)) os = 'linux';
    else if (/android/.test(ua)) os = 'android';
    else if (/iphone|ipad|ipod/.test(ua)) os = 'ios';

    let browser = 'unknown';
    if (/chrome/.test(ua) && !/edg/.test(ua)) browser = 'chrome';
    else if (/safari/.test(ua) && !/chrome/.test(ua)) browser = 'safari';
    else if (/firefox/.test(ua)) browser = 'firefox';
    else if (/edg/.test(ua)) browser = 'edge';

    // ✅ تحويل إلى snake_case ليطابق أعمدة قاعدة البيانات
    return {
      device_type: deviceType,
      os,
      browser,
      screen_width: window.screen.width,
      screen_height: window.screen.height,
      language: navigator.language || 'ar',
    };
  }

  private getUTMParams(): UTMParams {
    const urlParams = new URLSearchParams(window.location.search);
    return {
      utm_source: urlParams.get('utm_source') || undefined,
      utm_medium: urlParams.get('utm_medium') || undefined,
      utm_campaign: urlParams.get('utm_campaign') || undefined,
      utm_content: urlParams.get('utm_content') || undefined,
      utm_term: urlParams.get('utm_term') || undefined,
    };
  }

  private getStoredSessionId(): string | null {
    return localStorage.getItem(this.SESSION_KEY);
  }

  private storeSessionId(sessionId: string) {
    localStorage.setItem(this.SESSION_KEY, sessionId);
    localStorage.setItem(this.SESSION_START_KEY, Date.now().toString());
  }

  private isSessionExpired(): boolean {
    const sessionStart = localStorage.getItem(this.SESSION_START_KEY);
    if (!sessionStart) return true;

    const elapsed = Date.now() - parseInt(sessionStart);
    const THIRTY_MINUTES = 30 * 60 * 1000;

    return elapsed > THIRTY_MINUTES;
  }

  private getSessionDuration(): number {
    const sessionStart = localStorage.getItem(this.SESSION_START_KEY);
    if (!sessionStart) return 0;

    return Math.floor((Date.now() - parseInt(sessionStart)) / 1000);
  }

  async trackEvent(
    eventName: string,
    eventValue?: any,
    metadata?: any
  ) {
    if (!this.sessionId) {
      console.warn('⚠️ لا توجد جلسة نشطة، جاري إنشاء جلسة...');
      await this.initialize();
      if (!this.sessionId) {
        console.error('❌ فشل إنشاء الجلسة');
        return;
      }
    }

    try {
      const event = {
        session_id: this.sessionId,
        event_name: eventName,
        event_value: eventValue || {},
        path: window.location.pathname,
        page_title: document.title,
        metadata: metadata || {},
      };

      console.log(`📡 إرسال حدث فوري: ${eventName}`);
      console.time(`⏱️ ${eventName}`);

      const { error } = await supabase
        .from('analytics_events')
        .insert([event]);

      console.timeEnd(`⏱️ ${eventName}`);

      if (error) {
        // Dispatch failure event
        window.dispatchEvent(new CustomEvent('tracking-status', {
          detail: {
            type: 'event',
            success: false,
            eventName,
            error: error.message,
            httpCode: error.code ? parseInt(error.code) : null,
          }
        }));
        throw error;
      }

      console.log(`✅ تم تسجيل الحدث: ${eventName}`);
      if (Object.keys(eventValue || {}).length > 0) {
        console.log('📦 البيانات:', eventValue);
      }

      // Dispatch success event
      window.dispatchEvent(new CustomEvent('tracking-status', {
        detail: {
          type: 'event',
          success: true,
          eventName,
          httpCode: 201,
        }
      }));
    } catch (error) {
      console.error(`❌ فشل تسجيل الحدث ${eventName}:`, error);
    }
  }

  private startActivityUpdates() {
    if (this.activityUpdateInterval) return;

    this.activityUpdateInterval = window.setInterval(() => {
      this.updateSessionActivity();
    }, 30000);
  }

  async trackPageView(path?: string) {
    await this.trackEvent('home_view', {
      path: path || window.location.pathname,
      referrer: document.referrer,
    });
  }

  async trackFarmView(farmId: string, farmName: string) {
    await this.trackEvent('farm_view', {
      farm_id: farmId,
      farm_name: farmName,
    });
  }

  async trackQuantityChange(farmId: string, farmName: string, quantity: number) {
    await this.trackEvent('qty_change', {
      farm_id: farmId,
      farm_name: farmName,
      quantity,
    });
  }

  async trackBookingStart(farmId: string, farmName: string) {
    await this.trackEvent('booking_start', {
      farm_id: farmId,
      farm_name: farmName,
    });
  }

  async trackBookingSubmit(farmId: string, farmName: string, trees: number) {
    await this.trackEvent('booking_submit', {
      farm_id: farmId,
      farm_name: farmName,
      trees_count: trees,
    });
  }

  async trackPaymentUpload(farmId: string, farmName: string) {
    await this.trackEvent('payment_upload', {
      farm_id: farmId,
      farm_name: farmName,
    });
  }

  async trackWhatsAppClick(source: string) {
    await this.trackEvent('whatsapp_click', {
      source,
    });
  }

  async trackShareClick(farmId: string, farmName: string) {
    await this.trackEvent('share_click', {
      farm_id: farmId,
      farm_name: farmName,
    });
  }

  enableTestMode() {
    localStorage.setItem(this.TEST_MODE_KEY, 'true');
    console.log('🧪 وضع الاختبار مفعّل - الزيارات ستُوسم بـ [TEST]');
  }

  disableTestMode() {
    localStorage.removeItem(this.TEST_MODE_KEY);
    console.log('✅ وضع الاختبار معطّل - الزيارات عادية');
  }

  isTestMode(): boolean {
    return localStorage.getItem(this.TEST_MODE_KEY) === 'true';
  }

  cleanup() {
    if (this.activityUpdateInterval) {
      clearInterval(this.activityUpdateInterval);
      this.activityUpdateInterval = null;
    }
  }
}

export const TrackingService = new AnalyticsTrackingService();
