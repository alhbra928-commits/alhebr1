import { supabase } from '../lib/supabase';

export interface ActivityBarSettings {
  id: string;
  is_enabled: boolean;
  data_mode: 'mock' | 'real' | 'hybrid';
  scroll_speed: 'slow' | 'medium' | 'fast';
  display_duration: number;
  show_ownership: boolean;
  show_registrations: boolean;
  show_reservations: boolean;
  show_investors: boolean;
  show_farms: boolean;
  show_marketing: boolean;
  created_at: string;
  updated_at: string;
}

export interface ActivityBarMessage {
  id: string;
  message_ar: string;
  message_en?: string;
  icon: string;
  category: 'ownership' | 'registration' | 'reservation' | 'investor' | 'farm' | 'marketing' | 'general';
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RealActivityEvent {
  id: string;
  message_ar: string;
  icon: string;
  category: string;
}

export class ActivityBarService {
  static async getSettings(): Promise<ActivityBarSettings | null> {
    try {
      const { data, error } = await supabase
        .from('activity_bar_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching activity bar settings:', error);
      return null;
    }
  }

  static async updateSettings(settings: Partial<ActivityBarSettings>): Promise<boolean> {
    try {
      const currentSettings = await this.getSettings();
      if (!currentSettings) return false;

      const { error } = await supabase
        .from('activity_bar_settings')
        .update(settings)
        .eq('id', currentSettings.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating activity bar settings:', error);
      return false;
    }
  }

  static async getMockMessages(): Promise<ActivityBarMessage[]> {
    try {
      const { data, error } = await supabase
        .from('activity_bar_messages')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching mock messages:', error);
      return [];
    }
  }

  static async addMessage(message: Omit<ActivityBarMessage, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('activity_bar_messages')
        .insert([message]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error adding message:', error);
      return false;
    }
  }

  static async updateMessage(id: string, message: Partial<ActivityBarMessage>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('activity_bar_messages')
        .update(message)
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating message:', error);
      return false;
    }
  }

  static async deleteMessage(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('activity_bar_messages')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting message:', error);
      return false;
    }
  }

  static async getRealActivities(settings: ActivityBarSettings): Promise<RealActivityEvent[]> {
    const activities: RealActivityEvent[] = [];

    try {
      if (settings.show_reservations) {
        const { data: reservations, error } = await supabase
          .from('reservations')
          .select('id, created_at')
          .order('created_at', { ascending: false })
          .limit(3);

        if (!error && reservations) {
          reservations.forEach((res, idx) => {
            activities.push({
              id: res.id,
              message_ar: `تم حجز أشجار جديدة في المنصة`,
              icon: 'ShoppingCart',
              category: 'reservation'
            });
          });
        }
      }

      if (settings.show_farms) {
        const { data: farms, error } = await supabase
          .from('farms')
          .select('id, farm_name_ar')
          .eq('status', 'active')
          .limit(2);

        if (!error && farms) {
          farms.forEach(farm => {
            activities.push({
              id: farm.id,
              message_ar: `مزرعة ${farm.farm_name_ar} متاحة للاستثمار`,
              icon: 'TreePine',
              category: 'farm'
            });
          });
        }
      }

      if (settings.show_ownership) {
        const { data: docs, error } = await supabase
          .from('documentation')
          .select('id, created_at')
          .order('created_at', { ascending: false })
          .limit(2);

        if (!error && docs) {
          docs.forEach(doc => {
            activities.push({
              id: doc.id,
              message_ar: `تم إصدار شهادة تملك جديدة`,
              icon: 'Award',
              category: 'ownership'
            });
          });
        }
      }

    } catch (error) {
      console.error('Error fetching real activities:', error);
    }

    return activities;
  }

  static async getActivitiesToDisplay(): Promise<Array<{ message: string; icon: string }>> {
    try {
      const settings = await this.getSettings();
      if (!settings || !settings.is_enabled) {
        return [];
      }

      let activities: Array<{ message: string; icon: string }> = [];

      if (settings.data_mode === 'mock') {
        const mockMessages = await this.getMockMessages();
        activities = mockMessages.map(msg => ({
          message: msg.message_ar,
          icon: msg.icon
        }));
      } else if (settings.data_mode === 'real') {
        const realActivities = await this.getRealActivities(settings);
        activities = realActivities.map(act => ({
          message: act.message_ar,
          icon: act.icon
        }));
      } else if (settings.data_mode === 'hybrid') {
        const mockMessages = await this.getMockMessages();
        const realActivities = await this.getRealActivities(settings);

        const mockActivities = mockMessages.map(msg => ({
          message: msg.message_ar,
          icon: msg.icon
        }));

        const realActivityMessages = realActivities.map(act => ({
          message: act.message_ar,
          icon: act.icon
        }));

        activities = [...mockActivities, ...realActivityMessages];
      }

      if (activities.length === 0) {
        activities = [
          { message: 'مرحباً بكم في منصة الحبر للاستثمار الزراعي', icon: 'Sparkles' },
          { message: 'استثمر في مستقبلك الآن', icon: 'TrendingUp' }
        ];
      }

      return activities;
    } catch (error) {
      console.error('Error getting activities to display:', error);
      return [
        { message: 'مرحباً بكم في منصة الحبر', icon: 'Sparkles' }
      ];
    }
  }
}
