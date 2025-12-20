/**
 * Visitors Analytics Service
 *
 * يجلب بيانات الزوار والمصادر من analytics_sessions
 */

import { supabase } from '../../lib/supabase';

interface VisitorStats {
  totalSessions: number;
  uniqueVisitors: number;
  activeSessions: number;
  avgDuration: number;
}

interface SourceBreakdown {
  source: string;
  sessions: number;
  percentage: number;
}

interface DeviceBreakdown {
  deviceType: string;
  os: string;
  sessions: number;
  percentage: number;
}

interface ReferrerData {
  referrer: string;
  sessions: number;
}

function getTimeRangeDate(timeRange: '1h' | '24h' | '7d' | '30d'): Date {
  const now = new Date();
  switch (timeRange) {
    case '1h':
      return new Date(now.getTime() - 60 * 60 * 1000);
    case '24h':
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    default:
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
  }
}

export class VisitorsAnalyticsService {
  /**
   * جلب إحصائيات الزوار العامة
   */
  static async getVisitorStats(timeRange: '1h' | '24h' | '7d' | '30d' = '24h'): Promise<VisitorStats> {
    try {
      const startTime = getTimeRangeDate(timeRange).toISOString();
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

      console.log('📊 جلب إحصائيات الزوار من:', startTime);

      // إجمالي الجلسات
      const { data: allSessions, error: sessionsError } = await supabase
        .from('analytics_sessions')
        .select('session_id, duration_seconds, last_activity_at')
        .gte('created_at', startTime);

      if (sessionsError) {
        console.error('خطأ في جلب الجلسات:', sessionsError);
        throw sessionsError;
      }

      const totalSessions = allSessions?.length || 0;

      // الزوار الفريدون
      const uniqueVisitors = new Set(allSessions?.map(s => s.session_id) || []).size;

      // الجلسات النشطة (آخر 5 دقائق)
      const activeSessions = allSessions?.filter(s =>
        s.last_activity_at && new Date(s.last_activity_at) > new Date(fiveMinutesAgo)
      ).length || 0;

      // متوسط المدة
      const validDurations = allSessions?.filter(s => s.duration_seconds && s.duration_seconds > 0) || [];
      const avgDuration = validDurations.length > 0
        ? Math.round(validDurations.reduce((acc, s) => acc + (s.duration_seconds || 0), 0) / validDurations.length)
        : 0;

      console.log('✅ إحصائيات:', { totalSessions, uniqueVisitors, activeSessions, avgDuration });

      return {
        totalSessions,
        uniqueVisitors,
        activeSessions,
        avgDuration,
      };
    } catch (error) {
      console.error('Error getting visitor stats:', error);
      return {
        totalSessions: 0,
        uniqueVisitors: 0,
        activeSessions: 0,
        avgDuration: 0,
      };
    }
  }

  /**
   * توزيع المصادر (UTM Source + Referrer)
   */
  static async getSourceBreakdown(timeRange: '1h' | '24h' | '7d' | '30d' = '24h'): Promise<SourceBreakdown[]> {
    try {
      const startTime = getTimeRangeDate(timeRange).toISOString();

      const { data, error } = await supabase
        .from('analytics_sessions')
        .select('utm_source, referrer')
        .gte('created_at', startTime);

      if (error) throw error;

      console.log('📍 جلب المصادر:', data?.length, 'جلسة');

      // تجميع حسب المصدر
      const sourceCount: Record<string, number> = {};
      let total = 0;

      data?.forEach(session => {
        let source = 'Direct';

        if (session.utm_source) {
          source = session.utm_source;
        } else if (session.referrer) {
          const ref = session.referrer.toLowerCase();
          if (ref.includes('tiktok')) source = 'TikTok';
          else if (ref.includes('instagram')) source = 'Instagram';
          else if (ref.includes('facebook')) source = 'Facebook';
          else if (ref.includes('whatsapp')) source = 'WhatsApp';
          else if (ref.includes('google')) source = 'Google';
          else if (ref.includes('twitter') || ref.includes('x.com')) source = 'Twitter';
          else source = 'Referral';
        }

        sourceCount[source] = (sourceCount[source] || 0) + 1;
        total++;
      });

      console.log('✅ توزيع المصادر:', sourceCount);

      // تحويل إلى array مرتب
      return Object.entries(sourceCount)
        .map(([source, sessions]) => ({
          source,
          sessions,
          percentage: total > 0 ? Math.round((sessions / total) * 100) : 0,
        }))
        .sort((a, b) => b.sessions - a.sessions);
    } catch (error) {
      console.error('Error getting source breakdown:', error);
      return [];
    }
  }

  /**
   * توزيع الأجهزة
   */
  static async getDeviceBreakdown(timeRange: '1h' | '24h' | '7d' | '30d' = '24h'): Promise<DeviceBreakdown[]> {
    try {
      const startTime = getTimeRangeDate(timeRange).toISOString();

      const { data, error } = await supabase
        .from('analytics_sessions')
        .select('device_type, os')
        .gte('created_at', startTime);

      if (error) throw error;

      console.log('📱 جلب الأجهزة:', data?.length, 'جلسة');

      // تجميع حسب الجهاز + OS
      const deviceCount: Record<string, { deviceType: string; os: string; count: number }> = {};
      let total = 0;

      data?.forEach(session => {
        const deviceType = session.device_type || 'unknown';
        const os = session.os || 'unknown';
        const key = `${deviceType}_${os}`;

        if (!deviceCount[key]) {
          deviceCount[key] = {
            deviceType,
            os,
            count: 0,
          };
        }
        deviceCount[key].count++;
        total++;
      });

      console.log('✅ توزيع الأجهزة:', Object.keys(deviceCount).length, 'نوع');

      // تحويل إلى array مرتب
      return Object.values(deviceCount)
        .map(item => ({
          deviceType: item.deviceType,
          os: item.os,
          sessions: item.count,
          percentage: total > 0 ? Math.round((item.count / total) * 100) : 0,
        }))
        .sort((a, b) => b.sessions - a.sessions);
    } catch (error) {
      console.error('Error getting device breakdown:', error);
      return [];
    }
  }

  /**
   * أهم المُحيلين (Referrers)
   */
  static async getTopReferrers(timeRange: '1h' | '24h' | '7d' | '30d' = '24h', limit = 10): Promise<ReferrerData[]> {
    try {
      const startTime = getTimeRangeDate(timeRange).toISOString();

      const { data, error } = await supabase
        .from('analytics_sessions')
        .select('referrer')
        .gte('created_at', startTime)
        .not('referrer', 'is', null)
        .not('referrer', 'eq', '');

      if (error) throw error;

      // تجميع حسب المُحيل
      const referrerCount: Record<string, number> = {};

      data?.forEach(session => {
        if (session.referrer) {
          referrerCount[session.referrer] = (referrerCount[session.referrer] || 0) + 1;
        }
      });

      // تحويل إلى array مرتب
      return Object.entries(referrerCount)
        .map(([referrer, sessions]) => ({
          referrer,
          sessions,
        }))
        .sort((a, b) => b.sessions - a.sessions)
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting top referrers:', error);
      return [];
    }
  }

  /**
   * توزيع UTM Campaign
   */
  static async getCampaignBreakdown(timeRange: '1h' | '24h' | '7d' | '30d' = '24h'): Promise<{ campaign: string; sessions: number }[]> {
    try {
      const startTime = getTimeRangeDate(timeRange).toISOString();

      const { data, error } = await supabase
        .from('analytics_sessions')
        .select('utm_campaign')
        .gte('created_at', startTime)
        .not('utm_campaign', 'is', null);

      if (error) throw error;

      // تجميع حسب الحملة
      const campaignCount: Record<string, number> = {};

      data?.forEach(session => {
        if (session.utm_campaign) {
          campaignCount[session.utm_campaign] = (campaignCount[session.utm_campaign] || 0) + 1;
        }
      });

      // تحويل إلى array مرتب
      return Object.entries(campaignCount)
        .map(([campaign, sessions]) => ({
          campaign,
          sessions,
        }))
        .sort((a, b) => b.sessions - a.sessions);
    } catch (error) {
      console.error('Error getting campaign breakdown:', error);
      return [];
    }
  }

  /**
   * الجلسات حسب الساعة (آخر 24 ساعة)
   */
  static async getSessionsByHour(): Promise<{ hour: number; sessions: number }[]> {
    try {
      const startTime = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from('analytics_sessions')
        .select('created_at')
        .gte('created_at', startTime);

      if (error) throw error;

      console.log('⏰ جلب الجلسات حسب الساعة:', data?.length, 'جلسة');

      // تجميع حسب الساعة
      const hourCount: Record<number, number> = {};
      for (let i = 0; i < 24; i++) {
        hourCount[i] = 0;
      }

      data?.forEach(session => {
        const hour = new Date(session.created_at).getHours();
        hourCount[hour]++;
      });

      // تحويل إلى array مرتب
      return Object.entries(hourCount)
        .map(([hour, sessions]) => ({
          hour: parseInt(hour),
          sessions,
        }))
        .sort((a, b) => a.hour - b.hour);
    } catch (error) {
      console.error('Error getting sessions by hour:', error);
      return Array.from({ length: 24 }, (_, i) => ({ hour: i, sessions: 0 }));
    }
  }
}
