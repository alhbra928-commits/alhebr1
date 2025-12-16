import { supabase } from '../../lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

/**
 * خدمة التحديثات الفورية للوحة التحكم
 * تراقب التغييرات على جميع الجداول المهمة وتُحدّث البيانات تلقائياً
 */

type DashboardUpdateCallback = () => void;

export class RealtimeDashboardService {
  private static channels: RealtimeChannel[] = [];
  private static callbacks: DashboardUpdateCallback[] = [];
  private static isInitialized = false;
  private static lastUpdate: Date | null = null;
  private static updateDebounceTimer: NodeJS.Timeout | null = null;

  /**
   * تهيئة نظام التحديثات الفورية
   */
  static initialize(onUpdate: DashboardUpdateCallback) {
    if (this.isInitialized) {
      console.log('✅ Realtime Dashboard Service already initialized');
      return;
    }

    console.log('🚀 Initializing Realtime Dashboard Service...');

    this.callbacks.push(onUpdate);
    this.setupRealtimeSubscriptions();
    this.isInitialized = true;

    console.log('✅ Realtime Dashboard Service initialized successfully');
  }

  /**
   * إضافة callback جديد للتحديثات
   */
  static subscribe(callback: DashboardUpdateCallback) {
    this.callbacks.push(callback);
    return () => {
      this.callbacks = this.callbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * إعداد subscriptions على جميع الجداول المهمة
   */
  private static setupRealtimeSubscriptions() {
    // مراقبة المزارع
    this.subscribeToTable('farms', 'farms_changes');

    // مراقبة المستثمرين
    this.subscribeToTable('investors', 'investors_changes');

    // مراقبة الحجوزات
    this.subscribeToTable('reservations', 'reservations_changes');

    // مراقبة التوثيق
    this.subscribeToTable('documentation', 'documentation_changes');

    // مراقبة البطاقات المالية
    this.subscribeToTable('smart_farm_finances', 'finances_changes');

    // مراقبة أصحاب المزارع
    this.subscribeToTable('farm_owners', 'owners_changes');

    // مراقبة المحافظ
    this.subscribeToTable('farm_wallets', 'wallets_changes');

    console.log(`📡 Subscribed to ${this.channels.length} realtime channels`);
  }

  /**
   * الاشتراك في جدول محدد
   */
  private static subscribeToTable(tableName: string, channelName: string) {
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: tableName
        },
        (payload) => {
          console.log(`🔔 ${tableName} changed:`, payload.eventType);
          this.triggerUpdate();
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`✅ Subscribed to ${tableName}`);
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`❌ Error subscribing to ${tableName}`);
        }
      });

    this.channels.push(channel);
  }

  /**
   * تفعيل التحديث (مع debounce لتجنب التحديثات المتكررة)
   */
  private static triggerUpdate() {
    // إلغاء أي timer سابق
    if (this.updateDebounceTimer) {
      clearTimeout(this.updateDebounceTimer);
    }

    // تأخير التحديث لمدة 500ms لتجميع التغييرات المتعددة
    this.updateDebounceTimer = setTimeout(() => {
      this.lastUpdate = new Date();
      console.log('🔄 Triggering dashboard update...', this.lastUpdate);

      // تنفيذ جميع callbacks
      this.callbacks.forEach(callback => {
        try {
          callback();
        } catch (error) {
          console.error('Error in dashboard update callback:', error);
        }
      });
    }, 500);
  }

  /**
   * الحصول على وقت آخر تحديث
   */
  static getLastUpdate(): Date | null {
    return this.lastUpdate;
  }

  /**
   * فحص حالة الاتصال
   */
  static isConnected(): boolean {
    return this.channels.some(channel =>
      channel.state === 'joined' || channel.state === 'joining'
    );
  }

  /**
   * إعادة الاتصال بجميع القنوات
   */
  static async reconnect() {
    console.log('🔄 Reconnecting all channels...');

    for (const channel of this.channels) {
      try {
        await channel.unsubscribe();
      } catch (error) {
        console.error('Error unsubscribing channel:', error);
      }
    }

    this.channels = [];
    this.setupRealtimeSubscriptions();
  }

  /**
   * إيقاف جميع subscriptions
   */
  static cleanup() {
    console.log('🧹 Cleaning up Realtime Dashboard Service...');

    this.channels.forEach(channel => {
      try {
        supabase.removeChannel(channel);
      } catch (error) {
        console.error('Error removing channel:', error);
      }
    });

    this.channels = [];
    this.callbacks = [];
    this.isInitialized = false;

    if (this.updateDebounceTimer) {
      clearTimeout(this.updateDebounceTimer);
      this.updateDebounceTimer = null;
    }

    console.log('✅ Realtime Dashboard Service cleaned up');
  }

  /**
   * إجبار التحديث الفوري
   */
  static forceUpdate() {
    console.log('⚡ Forcing immediate dashboard update...');
    this.callbacks.forEach(callback => callback());
  }
}
