import { supabase } from '../lib/supabase';

export interface LiveActivitySettings {
  id: string;
  is_enabled: boolean;
  animation_speed: 'slow' | 'medium' | 'fast';
  show_reservations: boolean;
  show_certificates: boolean;
  show_farms: boolean;
  max_items: number;
  updated_at: string;
}

export interface LiveActivity {
  id: string;
  message: string;
  icon: string;
  timestamp: string;
  type: 'reservation' | 'certificate' | 'farm';
}

export class LiveActivityService {
  static async getSettings(): Promise<LiveActivitySettings | null> {
    try {
      const { data, error } = await supabase
        .from('live_activity_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching live activity settings:', error);
      return null;
    }
  }

  static async updateSettings(updates: Partial<LiveActivitySettings>): Promise<boolean> {
    try {
      const currentSettings = await this.getSettings();
      if (!currentSettings) return false;

      const { error } = await supabase
        .from('live_activity_settings')
        .update(updates)
        .eq('id', currentSettings.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating settings:', error);
      return false;
    }
  }

  static async getLiveActivities(): Promise<LiveActivity[]> {
    try {
      const settings = await this.getSettings();
      if (!settings || !settings.is_enabled) {
        return [];
      }

      const activities: LiveActivity[] = [];
      const maxPerType = Math.ceil(settings.max_items / 3);

      // جلب الحجوزات الأخيرة
      if (settings.show_reservations) {
        const { data: reservations } = await supabase
          .from('reservations')
          .select('id, created_at, customer_name_ar')
          .order('created_at', { ascending: false })
          .limit(maxPerType);

        if (reservations) {
          reservations.forEach(res => {
            const name = res.customer_name_ar || 'مستثمر';
            activities.push({
              id: res.id,
              message: `تم حجز أشجار جديدة بواسطة ${name}`,
              icon: 'ShoppingCart',
              timestamp: res.created_at,
              type: 'reservation'
            });
          });
        }
      }

      // جلب الشهادات الأخيرة
      if (settings.show_certificates) {
        const { data: certificates } = await supabase
          .from('documentation')
          .select('id, created_at')
          .order('created_at', { ascending: false })
          .limit(maxPerType);

        if (certificates) {
          certificates.forEach(cert => {
            activities.push({
              id: cert.id,
              message: `تم إصدار شهادة تملك جديدة`,
              icon: 'Award',
              timestamp: cert.created_at,
              type: 'certificate'
            });
          });
        }
      }

      // جلب المزارع النشطة
      if (settings.show_farms) {
        const { data: farms } = await supabase
          .from('farms')
          .select('id, farm_name_ar, created_at')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(maxPerType);

        if (farms) {
          farms.forEach(farm => {
            activities.push({
              id: farm.id,
              message: `مزرعة ${farm.farm_name_ar} متاحة للاستثمار`,
              icon: 'TreePine',
              timestamp: farm.created_at,
              type: 'farm'
            });
          });
        }
      }

      // ترتيب حسب الوقت
      activities.sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      // تحديد العدد الأقصى
      return activities.slice(0, settings.max_items);
    } catch (error) {
      console.error('Error fetching live activities:', error);
      return [];
    }
  }

  static subscribeToChanges(callback: () => void) {
    const channel = supabase
      .channel('live-activities-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'reservations' },
        callback
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'documentation' },
        callback
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'farms' },
        callback
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}
