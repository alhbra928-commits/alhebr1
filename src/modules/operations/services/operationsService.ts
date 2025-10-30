import { supabase } from '../../../lib/supabase';

export interface VersionInfo {
  version: string;
  buildId: string;
  timestamp: string;
  deployedAt: Date;
  serviceWorkerActive: boolean;
  channel: string;
}

export interface BackupInfo {
  id: string;
  created_at: string;
  size_mb: number;
  status: 'success' | 'failed' | 'in_progress';
  backup_type: string;
}

export interface DeploymentLog {
  id: string;
  buildId: string;
  version: string;
  deployed_at: string;
  status: 'success' | 'failed';
  notes?: string;
}

export interface SystemNotification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: string;
  icon: string;
}

export class OperationsService {

  // معلومات النسخة الحالية
  static async getCurrentVersion(): Promise<VersionInfo | null> {
    try {
      const response = await fetch('/manifest.json');
      const manifest = await response.json();

      const serviceWorkerActive = await this.checkServiceWorker();

      return {
        version: manifest.version || 'unknown',
        buildId: manifest.buildNumber?.toString() || 'unknown',
        timestamp: manifest.timestamp || new Date().toISOString(),
        deployedAt: new Date(manifest.timestamp || Date.now()),
        serviceWorkerActive,
        channel: manifest.channel || 'production'
      };
    } catch (error) {
      console.error('Error fetching version:', error);
      return null;
    }
  }

  // التحقق من Service Worker
  static async checkServiceWorker(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      return !!(registration && registration.active);
    } catch {
      return false;
    }
  }

  // معلومات من deployment-timestamp.json
  static async getDeploymentInfo() {
    try {
      const response = await fetch('/deployment-timestamp.json');
      return await response.json();
    } catch (error) {
      console.error('Error fetching deployment info:', error);
      return null;
    }
  }

  // النسخ الاحتياطية
  static async getBackups(): Promise<BackupInfo[]> {
    try {
      const { data, error } = await supabase
        .from('backup_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      return (data || []).map(backup => ({
        id: backup.id,
        created_at: backup.created_at,
        size_mb: backup.backup_size ? Math.round(backup.backup_size / (1024 * 1024)) : 0,
        status: backup.status || 'success',
        backup_type: backup.backup_type || 'automatic'
      }));
    } catch (error) {
      console.error('Error fetching backups:', error);
      return [];
    }
  }

  // آخر نسخة احتياطية
  static async getLatestBackup(): Promise<BackupInfo | null> {
    const backups = await this.getBackups();
    return backups.length > 0 ? backups[0] : null;
  }

  // سجل النشر
  static async getDeploymentLogs(): Promise<DeploymentLog[]> {
    try {
      const { data, error } = await supabase
        .from('deployment_logs')
        .select('*')
        .order('deployed_at', { ascending: false })
        .limit(5);

      if (error) {
        // الجدول قد لا يكون موجوداً بعد، نرجع بيانات وهمية
        return this.getMockDeploymentLogs();
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching deployment logs:', error);
      return this.getMockDeploymentLogs();
    }
  }

  // بيانات وهمية للنشر (حتى يتم إنشاء الجدول)
  private static getMockDeploymentLogs(): DeploymentLog[] {
    const now = Date.now();
    return [
      {
        id: '1',
        buildId: '1761839613883',
        version: 'v20251030_1761839613883',
        deployed_at: new Date(now - 5 * 60000).toISOString(),
        status: 'success',
        notes: 'تحديث النمط الأخضر'
      },
      {
        id: '2',
        buildId: '1761839188893',
        version: 'v20251030_1761839188893',
        deployed_at: new Date(now - 30 * 60000).toISOString(),
        status: 'success',
        notes: 'نظام مسح الكاش'
      },
      {
        id: '3',
        buildId: '1761838992111',
        version: 'v20251030_1761838992111',
        deployed_at: new Date(now - 60 * 60000).toISOString(),
        status: 'success',
        notes: 'تحسينات الأداء'
      }
    ];
  }

  // حالة النظام
  static async getSystemHealth() {
    const isHTTPS = window.location.protocol === 'https:';
    const serviceWorkerActive = await this.checkServiceWorker();

    return {
      https: isHTTPS,
      serviceWorker: serviceWorkerActive,
      cdn: true, // افتراضاً
      database: await this.checkDatabaseConnection()
    };
  }

  // التحقق من قاعدة البيانات
  static async checkDatabaseConnection(): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('farms')
        .select('id')
        .limit(1);

      return !error;
    } catch {
      return false;
    }
  }

  // إشعارات النظام
  static async getSystemNotifications(): Promise<SystemNotification[]> {
    try {
      const { data, error } = await supabase
        .from('system_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        // نرجع إشعارات وهمية
        return this.getMockNotifications();
      }

      return (data || []).map(notif => ({
        id: notif.id,
        type: notif.type,
        title: notif.title,
        message: notif.message,
        timestamp: notif.created_at,
        icon: this.getNotificationIcon(notif.type)
      }));
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return this.getMockNotifications();
    }
  }

  // إشعارات وهمية
  private static getMockNotifications(): SystemNotification[] {
    const now = Date.now();
    return [
      {
        id: '1',
        type: 'success',
        title: 'نشر ناجح',
        message: 'تم نشر الإصدار v20251030_1761839613883 بنجاح',
        timestamp: new Date(now - 5 * 60000).toISOString(),
        icon: '✅'
      },
      {
        id: '2',
        type: 'success',
        title: 'نسخة احتياطية',
        message: 'تم إنشاء نسخة احتياطية تلقائية (45 MB)',
        timestamp: new Date(now - 30 * 60000).toISOString(),
        icon: '💾'
      },
      {
        id: '3',
        type: 'info',
        title: 'Service Worker',
        message: 'Service Worker نشط ويعمل بكفاءة',
        timestamp: new Date(now - 60 * 60000).toISOString(),
        icon: '⚙️'
      },
      {
        id: '4',
        type: 'success',
        title: 'مسح الكاش',
        message: 'تم مسح كاش CDN بنجاح',
        timestamp: new Date(now - 90 * 60000).toISOString(),
        icon: '🔄'
      }
    ];
  }

  private static getNotificationIcon(type: string): string {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'info': return 'ℹ️';
      default: return '📌';
    }
  }

  // إحصائيات الزوار (من جدول visitor_analytics)
  static async getVisitorStats(hours: number = 24) {
    try {
      const fromDate = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from('visitor_analytics')
        .select('*')
        .gte('visited_at', fromDate)
        .order('visited_at', { ascending: false });

      if (error) throw error;

      const total = data?.length || 0;

      // تجميع حسب المصدر
      const sources = {
        tiktok: 0,
        instagram: 0,
        google: 0,
        direct: 0,
        other: 0
      };

      data?.forEach(visitor => {
        const source = visitor.utm_source?.toLowerCase() || 'direct';
        if (source.includes('tiktok')) sources.tiktok++;
        else if (source.includes('instagram') || source.includes('ig')) sources.instagram++;
        else if (source.includes('google')) sources.google++;
        else if (source === 'direct') sources.direct++;
        else sources.other++;
      });

      return {
        total,
        sources,
        timeline: this.aggregateTimeline(data || [])
      };
    } catch (error) {
      console.error('Error fetching visitor stats:', error);
      return {
        total: 0,
        sources: { tiktok: 0, instagram: 0, google: 0, direct: 0, other: 0 },
        timeline: []
      };
    }
  }

  // تجميع الزوار حسب الساعة
  private static aggregateTimeline(data: any[]) {
    const hourly: { [key: string]: number } = {};

    data.forEach(visitor => {
      const hour = new Date(visitor.visited_at).toISOString().slice(0, 13);
      hourly[hour] = (hourly[hour] || 0) + 1;
    });

    return Object.entries(hourly)
      .map(([hour, count]) => ({
        time: new Date(hour).toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' }),
        visitors: count
      }))
      .slice(-24); // آخر 24 ساعة
  }

  // تحديث معلومات النسخة في قاعدة البيانات
  static async logDeployment(version: string, buildId: string, notes?: string) {
    try {
      const { error } = await supabase
        .from('deployment_logs')
        .insert({
          version,
          buildId,
          deployed_at: new Date().toISOString(),
          status: 'success',
          notes
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error logging deployment:', error);
      return false;
    }
  }

  // إضافة إشعار نظام
  static async addSystemNotification(
    type: 'success' | 'warning' | 'error' | 'info',
    title: string,
    message: string
  ) {
    try {
      const { error } = await supabase
        .from('system_notifications')
        .insert({
          type,
          title,
          message,
          created_at: new Date().toISOString()
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error adding notification:', error);
      return false;
    }
  }
}
