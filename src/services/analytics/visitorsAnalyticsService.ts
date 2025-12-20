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

export class VisitorsAnalyticsService {
  /**
   * جلب إحصائيات الزوار العامة
   */
  static async getVisitorStats(timeRange: '1h' | '24h' | '7d' | '30d' = '24h'): Promise<VisitorStats> {
    try {
      const timeRanges: Record<string, string> = {
        '1h': '1 hour',
        '24h': '24 hours',
        '7d': '7 days',
        '30d': '30 days',
      };

      const interval = timeRanges[timeRange];

      // إجمالي الجلسات
      const { count: totalSessions } = await supabase
        .from('analytics_sessions')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', `now() - interval '${interval}'`);

      // الزوار الفريدون (session_id مختلف)
      const { data: uniqueData } = await supabase
        .from('analytics_sessions')
        .select('session_id')
        .gte('created_at', `now() - interval '${interval}'`);

      const uniqueVisitors = new Set(uniqueData?.map(s => s.session_id) || []).size;

      // الجلسات النشطة (آخر 5 دقائق)
      const { count: activeSessions } = await supabase
        .from('analytics_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .gte('updated_at', `now() - interval '5 minutes'`);

      // متوسط المدة
      const { data: durationData } = await supabase
        .from('analytics_sessions')
        .select('duration_seconds')
        .gte('created_at', `now() - interval '${interval}'`)
        .not('duration_seconds', 'is', null);

      const avgDuration = durationData && durationData.length > 0
        ? Math.round(durationData.reduce((acc, s) => acc + (s.duration_seconds || 0), 0) / durationData.length)
        : 0;

      return {
        totalSessions: totalSessions || 0,
        uniqueVisitors,
        activeSessions: activeSessions || 0,
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
   * توزيع المصادر (UTM Source)
   */
  static async getSourceBreakdown(timeRange: '1h' | '24h' | '7d' | '30d' = '24h'): Promise<SourceBreakdown[]> {
    try {
      const timeRanges: Record<string, string> = {
        '1h': '1 hour',
        '24h': '24 hours',
        '7d': '7 days',
        '30d': '30 days',
      };

      const interval = timeRanges[timeRange];

      const { data, error } = await supabase
        .from('analytics_sessions')
        .select('utm_source')
        .gte('created_at', `now() - interval '${interval}'`);

      if (error) throw error;

      // تجميع حسب المصدر
      const sourceCount: Record<string, number> = {};
      let total = 0;

      data?.forEach(session => {
        const source = session.utm_source || 'Direct';
        sourceCount[source] = (sourceCount[source] || 0) + 1;
        total++;
      });

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
      const timeRanges: Record<string, string> = {
        '1h': '1 hour',
        '24h': '24 hours',
        '7d': '7 days',
        '30d': '30 days',
      };

      const interval = timeRanges[timeRange];

      const { data, error } = await supabase
        .from('analytics_sessions')
        .select('device_type, os')
        .gte('created_at', `now() - interval '${interval}'`);

      if (error) throw error;

      // تجميع حسب الجهاز + OS
      const deviceCount: Record<string, { deviceType: string; os: string; count: number }> = {};
      let total = 0;

      data?.forEach(session => {
        const key = `${session.device_type || 'unknown'}_${session.os || 'unknown'}`;
        if (!deviceCount[key]) {
          deviceCount[key] = {
            deviceType: session.device_type || 'unknown',
            os: session.os || 'unknown',
            count: 0,
          };
        }
        deviceCount[key].count++;
        total++;
      });

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
      const timeRanges: Record<string, string> = {
        '1h': '1 hour',
        '24h': '24 hours',
        '7d': '7 days',
        '30d': '30 days',
      };

      const interval = timeRanges[timeRange];

      const { data, error } = await supabase
        .from('analytics_sessions')
        .select('referrer')
        .gte('created_at', `now() - interval '${interval}'`)
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
      const timeRanges: Record<string, string> = {
        '1h': '1 hour',
        '24h': '24 hours',
        '7d': '7 days',
        '30d': '30 days',
      };

      const interval = timeRanges[timeRange];

      const { data, error } = await supabase
        .from('analytics_sessions')
        .select('utm_campaign')
        .gte('created_at', `now() - interval '${interval}'`)
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
      const { data, error } = await supabase
        .from('analytics_sessions')
        .select('created_at')
        .gte('created_at', `now() - interval '24 hours'`);

      if (error) throw error;

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
      return [];
    }
  }
}
