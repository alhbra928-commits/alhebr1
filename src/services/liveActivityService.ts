import { supabase } from '../lib/supabase';

export interface LiveActivitySettings {
  id: string;
  is_enabled: boolean;
  animation_speed: 'slow' | 'medium' | 'fast';
  show_reservations: boolean;
  show_certificates: boolean;
  show_farms: boolean;
  max_items: number;
  background_style: 'gradient' | 'solid' | 'glass';
  text_color: string;
  icon_color: string;
  border_style: 'none' | 'bottom' | 'top' | 'both';
  height: number;
  pause_on_hover: boolean;
  show_separator: boolean;
  enable_sound: boolean;
  refresh_interval: number;
  content_mode: 'auto' | 'manual' | 'both';
  auto_update_interval: number;
  show_timestamps: boolean;
  enable_animations: boolean;
  duplicate_content: boolean;
  updated_at: string;
}

export interface LiveActivity {
  id: string;
  message: string;
  icon: string;
  timestamp: string;
  type: 'reservation' | 'certificate' | 'farm' | 'custom';
  source: 'auto' | 'manual';
}

export interface CustomMessage {
  id: string;
  message_ar: string;
  message_en?: string;
  icon: string;
  is_active: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
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
      if (!currentSettings) {
        console.error('No current settings found!');
        return false;
      }

      console.log('📝 Updating settings in database...', updates);
      const { error } = await supabase
        .from('live_activity_settings')
        .update(updates)
        .eq('id', currentSettings.id);

      if (error) {
        console.error('Database update error:', error);
        throw error;
      }

      console.log('✅ Settings updated successfully in database!');
      return true;
    } catch (error) {
      console.error('Error updating settings:', error);
      return false;
    }
  }

  static async getCustomMessages(): Promise<CustomMessage[]> {
    try {
      const { data, error } = await supabase
        .from('live_activity_custom_messages')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching custom messages:', error);
      return [];
    }
  }

  static async getAllCustomMessages(): Promise<CustomMessage[]> {
    try {
      const { data, error } = await supabase
        .from('live_activity_custom_messages')
        .select('*')
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching all custom messages:', error);
      return [];
    }
  }

  static async addCustomMessage(message: Omit<CustomMessage, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('live_activity_custom_messages')
        .insert([message]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error adding custom message:', error);
      return false;
    }
  }

  static async updateCustomMessage(id: string, updates: Partial<CustomMessage>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('live_activity_custom_messages')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating custom message:', error);
      return false;
    }
  }

  static async deleteCustomMessage(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('live_activity_custom_messages')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting custom message:', error);
      return false;
    }
  }

  static async getAutoActivities(settings: LiveActivitySettings): Promise<LiveActivity[]> {
    const activities: LiveActivity[] = [];
    const maxPerType = Math.ceil(settings.max_items / 3);

    try {
      if (settings.show_reservations) {
        const { data: reservations } = await supabase
          .from('reservations')
          .select('id, created_at, customer_name')
          .order('created_at', { ascending: false })
          .limit(maxPerType);

        if (reservations) {
          reservations.forEach(res => {
            const name = res.customer_name || 'مستثمر';
            activities.push({
              id: res.id,
              message: `تم حجز أشجار جديدة بواسطة ${name}`,
              icon: 'ShoppingCart',
              timestamp: res.created_at,
              type: 'reservation',
              source: 'auto'
            });
          });
        }
      }

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
              type: 'certificate',
              source: 'auto'
            });
          });
        }
      }

      if (settings.show_farms) {
        const { data: farms } = await supabase
          .from('farms')
          .select('id, farm_name, created_at')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(maxPerType);

        if (farms) {
          farms.forEach(farm => {
            activities.push({
              id: farm.id,
              message: `مزرعة ${farm.farm_name} متاحة للاستثمار`,
              icon: 'TreePine',
              timestamp: farm.created_at,
              type: 'farm',
              source: 'auto'
            });
          });
        }
      }
    } catch (error) {
      console.error('Error fetching auto activities:', error);
    }

    return activities;
  }

  static async getLiveActivities(): Promise<LiveActivity[]> {
    try {
      const settings = await this.getSettings();
      if (!settings || !settings.is_enabled) {
        console.log('⚠️ Live activities disabled or no settings found');
        return [];
      }

      console.log('🔍 Fetching activities with mode:', settings.content_mode);
      let activities: LiveActivity[] = [];

      if (settings.content_mode === 'auto' || settings.content_mode === 'both') {
        const autoActivities = await this.getAutoActivities(settings);
        console.log(`📊 Auto activities: ${autoActivities.length}`);
        activities = [...activities, ...autoActivities];
      }

      if (settings.content_mode === 'manual' || settings.content_mode === 'both') {
        const customMessages = await this.getCustomMessages();
        console.log(`✍️ Custom messages: ${customMessages.length}`);
        const manualActivities = customMessages.map(msg => ({
          id: msg.id,
          message: msg.message_ar,
          icon: msg.icon,
          timestamp: msg.created_at,
          type: 'custom' as const,
          source: 'manual' as const
        }));
        activities = [...activities, ...manualActivities];
      }

      activities.sort((a, b) => {
        if (settings.content_mode === 'both') {
          const aIsCustom = a.source === 'manual' ? 1 : 0;
          const bIsCustom = b.source === 'manual' ? 1 : 0;
          if (aIsCustom !== bIsCustom) return bIsCustom - aIsCustom;
        }
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });

      const finalActivities = activities.slice(0, settings.max_items);
      console.log(`✅ Final activities count: ${finalActivities.length}`);
      return finalActivities;
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
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'live_activity_custom_messages' },
        callback
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'live_activity_settings' },
        callback
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}
