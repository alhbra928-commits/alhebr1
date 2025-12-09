import { supabase } from '../lib/supabase';

export interface Activity {
  id: string;
  title: string;
  icon: string;
  timestamp?: Date;
  priority: number;
}

export interface TickerSettings {
  mode: 'simulation' | 'real' | 'hybrid';
  simulation_enabled: boolean;
  real_enabled: boolean;
  scroll_speed: 'slow' | 'medium' | 'fast';
  items_per_cycle: number;
  simulation_interval_seconds: number;
  show_timestamps: boolean;
  background_color: string;
  text_color: string;
  icon_color: string;
}

class LiveActivityTickerService {
  private settingsCache: TickerSettings | null = null;
  private activitiesCache: Activity[] = [];
  private simulationTimer: NodeJS.Timeout | null = null;

  async getSettings(): Promise<TickerSettings> {
    if (this.settingsCache) {
      return this.settingsCache;
    }

    const { data, error } = await supabase
      .from('activity_ticker_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return {
        mode: 'hybrid',
        simulation_enabled: true,
        real_enabled: true,
        scroll_speed: 'medium',
        items_per_cycle: 10,
        simulation_interval_seconds: 15,
        show_timestamps: true,
        background_color: '#1a4d2e',
        text_color: '#f4e5c2',
        icon_color: '#d4af37'
      };
    }

    this.settingsCache = data as TickerSettings;
    return this.settingsCache;
  }

  async updateSettings(updates: Partial<TickerSettings>): Promise<void> {
    const { data, error } = await supabase
      .from('activity_ticker_settings')
      .select('id')
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    if (data) {
      const { error: updateError } = await supabase
        .from('activity_ticker_settings')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', data.id);

      if (updateError) throw updateError;
    } else {
      const defaultSettings = await this.getSettings();
      const { error: insertError } = await supabase
        .from('activity_ticker_settings')
        .insert({
          ...defaultSettings,
          ...updates,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (insertError) throw insertError;
    }

    this.settingsCache = null;
  }

  async getRealActivities(limit: number = 10): Promise<Activity[]> {
    const { data, error } = await supabase
      .from('platform_activities')
      .select('*')
      .eq('is_visible', true)
      .order('priority', { ascending: false })
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data || []).map((activity: any) => ({
      id: activity.id,
      title: activity.activity_title_ar,
      icon: activity.icon,
      timestamp: new Date(activity.timestamp),
      priority: activity.priority
    }));
  }

  async generateSimulatedActivity(): Promise<Activity> {
    const { data, error } = await supabase
      .from('simulated_activities')
      .select('*')
      .eq('is_active', true);

    if (error) throw error;

    if (!data || data.length === 0) {
      return {
        id: `sim-${Date.now()}`,
        title: 'نشاط على المنصة',
        icon: '⭐',
        priority: 5
      };
    }

    const totalWeight = data.reduce((sum: number, item: any) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;

    let selectedActivity = data[0];
    for (const activity of data) {
      random -= activity.weight;
      if (random <= 0) {
        selectedActivity = activity;
        break;
      }
    }

    const timings = [
      'قبل دقائق',
      'قبل قليل',
      'منذ 5 دقائق',
      'منذ 10 دقائق',
      'الآن'
    ];

    const timing = timings[Math.floor(Math.random() * timings.length)];

    return {
      id: `sim-${Date.now()}-${Math.random()}`,
      title: `${selectedActivity.template_ar} ${timing}`,
      icon: selectedActivity.icon,
      priority: 5
    };
  }

  async getActivities(): Promise<Activity[]> {
    const settings = await this.getSettings();
    let activities: Activity[] = [];

    if (settings.mode === 'real' || settings.mode === 'hybrid') {
      if (settings.real_enabled) {
        const realActivities = await this.getRealActivities(
          settings.mode === 'real' ? settings.items_per_cycle : Math.floor(settings.items_per_cycle / 2)
        );
        activities = [...activities, ...realActivities];
      }
    }

    if (settings.mode === 'simulation' || settings.mode === 'hybrid') {
      if (settings.simulation_enabled) {
        const simulationCount = settings.mode === 'simulation'
          ? settings.items_per_cycle
          : Math.ceil(settings.items_per_cycle / 2);

        for (let i = 0; i < simulationCount; i++) {
          const simActivity = await this.generateSimulatedActivity();
          activities.push(simActivity);
        }
      }
    }

    activities.sort((a, b) => b.priority - a.priority);

    return activities.slice(0, settings.items_per_cycle);
  }

  subscribeToRealtime(callback: (activities: Activity[]) => void): () => void {
    const channel = supabase
      .channel('activity-ticker-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'platform_activities'
        },
        async () => {
          const activities = await this.getActivities();
          callback(activities);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'activity_ticker_settings'
        },
        async () => {
          this.settingsCache = null;
          const activities = await this.getActivities();
          callback(activities);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  async createManualActivity(
    type: string,
    titleAr: string,
    titleEn: string,
    icon: string = '⭐',
    priority: number = 5
  ): Promise<void> {
    const { error } = await supabase
      .from('platform_activities')
      .insert({
        activity_type: type,
        activity_title_ar: titleAr,
        activity_title_en: titleEn,
        icon,
        priority,
        is_visible: true
      });

    if (error) throw error;
  }

  async deleteActivity(id: string): Promise<void> {
    const { error } = await supabase
      .from('platform_activities')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async clearAllActivities(): Promise<void> {
    const { error } = await supabase
      .from('platform_activities')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (error) throw error;
  }

  getSpeedDuration(speed: string): number {
    switch (speed) {
      case 'slow': return 60;
      case 'fast': return 20;
      default: return 35;
    }
  }
}

export const liveActivityTickerService = new LiveActivityTickerService();
