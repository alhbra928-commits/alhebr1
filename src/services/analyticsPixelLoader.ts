/**
 * محمل السكربتات التحليلية الديناميكي
 * يحمل ويُفعّل Google Analytics, TikTok Pixel, Meta Pixel, Twitter Pixel بناءً على الإعدادات
 */

import { supabase } from '../lib/supabase';

interface PixelConfig {
  platform: string;
  is_active: boolean;
  pixel_id?: string;
  property_id?: string;
  api_key?: string;
}

class AnalyticsPixelLoader {
  private loadedScripts: Set<string> = new Set();
  private initialized = false;

  /**
   * تهيئة جميع السكربتات التحليلية
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // جلب إعدادات المنصات النشطة
      const { data: configs, error } = await supabase
        .from('marketing_platform_connections')
        .select('platform, is_active, pixel_id, property_id, api_key')
        .eq('is_active', true);

      if (error) {
        console.error('Failed to load pixel configs:', error);
        return;
      }

      if (!configs || configs.length === 0) {
        console.log('📊 No active analytics platforms configured');
        return;
      }

      // تحميل كل سكربت نشط
      for (const config of configs) {
        await this.loadPixel(config);
      }

      this.initialized = true;
      console.log('✅ Analytics pixels initialized:', configs.map(c => c.platform));
    } catch (error) {
      console.error('Error initializing analytics pixels:', error);
    }
  }

  /**
   * تحميل سكربت معين بناءً على المنصة
   */
  private async loadPixel(config: PixelConfig): Promise<void> {
    switch (config.platform) {
      case 'google_analytics':
        if (config.property_id) {
          await this.loadGoogleAnalytics(config.property_id);
        }
        break;

      case 'tiktok_pixel':
        if (config.pixel_id) {
          await this.loadTikTokPixel(config.pixel_id);
        }
        break;

      case 'meta_pixel':
        if (config.pixel_id) {
          await this.loadMetaPixel(config.pixel_id);
        }
        break;

      case 'twitter_pixel':
        if (config.pixel_id) {
          await this.loadTwitterPixel(config.pixel_id);
        }
        break;

      default:
        console.warn(`Unknown platform: ${config.platform}`);
    }
  }

  /**
   * تحميل Google Analytics 4
   */
  private async loadGoogleAnalytics(measurementId: string): Promise<void> {
    if (this.loadedScripts.has('google_analytics')) return;

    return new Promise((resolve) => {
      // إضافة سكربت gtag.js
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      script.onload = () => {
        // تهيئة gtag
        (window as any).dataLayer = (window as any).dataLayer || [];
        function gtag(...args: any[]) {
          (window as any).dataLayer.push(args);
        }
        (window as any).gtag = gtag;

        gtag('js', new Date());
        gtag('config', measurementId, {
          send_page_view: true,
          cookie_flags: 'SameSite=None;Secure'
        });

        this.loadedScripts.add('google_analytics');
        console.log('✅ Google Analytics loaded:', measurementId);
        resolve();
      };

      document.head.appendChild(script);
    });
  }

  /**
   * تحميل TikTok Pixel
   */
  private async loadTikTokPixel(pixelId: string): Promise<void> {
    if (this.loadedScripts.has('tiktok_pixel')) return;

    return new Promise((resolve) => {
      // TikTok Pixel Code
      const script = document.createElement('script');
      script.innerHTML = `
        !function (w, d, t) {
          w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
          ttq.load('${pixelId}');
          ttq.page();
        }(window, document, 'ttq');
      `;

      document.head.appendChild(script);
      this.loadedScripts.add('tiktok_pixel');
      console.log('✅ TikTok Pixel loaded:', pixelId);
      resolve();
    });
  }

  /**
   * تحميل Meta Pixel (Facebook & Instagram)
   */
  private async loadMetaPixel(pixelId: string): Promise<void> {
    if (this.loadedScripts.has('meta_pixel')) return;

    return new Promise((resolve) => {
      // Meta Pixel Code
      const script = document.createElement('script');
      script.innerHTML = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${pixelId}');
        fbq('track', 'PageView');
      `;

      // إضافة noscript image
      const noscript = document.createElement('noscript');
      noscript.innerHTML = `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1"/>`;

      document.head.appendChild(script);
      document.body.appendChild(noscript);

      this.loadedScripts.add('meta_pixel');
      console.log('✅ Meta Pixel loaded:', pixelId);
      resolve();
    });
  }

  /**
   * تحميل Twitter Pixel
   */
  private async loadTwitterPixel(pixelId: string): Promise<void> {
    if (this.loadedScripts.has('twitter_pixel')) return;

    return new Promise((resolve) => {
      // Twitter Universal Website Tag
      const script = document.createElement('script');
      script.innerHTML = `
        !function(e,t,n,s,u,a){e.twq||(s=e.twq=function(){s.exe?s.exe.apply(s,arguments):s.queue.push(arguments);
        },s.version='1.1',s.queue=[],u=t.createElement(n),u.async=!0,u.src='https://static.ads-twitter.com/uwt.js',
        a=t.getElementsByTagName(n)[0],a.parentNode.insertBefore(u,a))}(window,document,'script');
        twq('config','${pixelId}');
      `;

      document.head.appendChild(script);
      this.loadedScripts.add('twitter_pixel');
      console.log('✅ Twitter Pixel loaded:', pixelId);
      resolve();
    });
  }

  /**
   * تتبع حدث مخصص على جميع المنصات
   */
  trackEvent(eventName: string, eventData?: Record<string, any>): void {
    // Google Analytics
    if (this.loadedScripts.has('google_analytics') && (window as any).gtag) {
      (window as any).gtag('event', eventName, eventData);
    }

    // TikTok Pixel
    if (this.loadedScripts.has('tiktok_pixel') && (window as any).ttq) {
      (window as any).ttq.track(eventName, eventData);
    }

    // Meta Pixel
    if (this.loadedScripts.has('meta_pixel') && (window as any).fbq) {
      (window as any).fbq('track', eventName, eventData);
    }

    // Twitter Pixel
    if (this.loadedScripts.has('twitter_pixel') && (window as any).twq) {
      (window as any).twq('track', eventName, eventData);
    }
  }

  /**
   * تتبع عرض الصفحة على جميع المنصات
   */
  trackPageView(pageUrl?: string): void {
    const url = pageUrl || window.location.href;

    // Google Analytics
    if (this.loadedScripts.has('google_analytics') && (window as any).gtag) {
      (window as any).gtag('event', 'page_view', {
        page_location: url,
        page_title: document.title
      });
    }

    // TikTok Pixel
    if (this.loadedScripts.has('tiktok_pixel') && (window as any).ttq) {
      (window as any).ttq.page();
    }

    // Meta Pixel
    if (this.loadedScripts.has('meta_pixel') && (window as any).fbq) {
      (window as any).fbq('track', 'PageView');
    }

    // Twitter Pixel
    if (this.loadedScripts.has('twitter_pixel') && (window as any).twq) {
      (window as any).twq('track', 'PageView');
    }
  }

  /**
   * إعادة تحميل السكربتات (عند تحديث الإعدادات)
   */
  async reload(): Promise<void> {
    this.initialized = false;
    this.loadedScripts.clear();
    await this.initialize();
  }

  /**
   * التحقق من تحميل منصة معينة
   */
  isLoaded(platform: string): boolean {
    return this.loadedScripts.has(platform);
  }

  /**
   * الحصول على قائمة المنصات المحملة
   */
  getLoadedPlatforms(): string[] {
    return Array.from(this.loadedScripts);
  }
}

// تصدير instance واحد
export const analyticsPixelLoader = new AnalyticsPixelLoader();
