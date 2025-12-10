import { supabase } from '../lib/supabase';

export interface ActivityEvent {
  id: string;
  message: string;
  icon: string;
  timestamp: Date;
  type: 'ownership' | 'booking' | 'registration' | 'verification';
}

export interface ActivityBarSettings {
  id: string;
  enabled: boolean;
  mode: 'fake' | 'real' | 'hybrid';
  speed: number;
  show_ownership: boolean;
  show_bookings: boolean;
  show_registrations: boolean;
  show_verifications: boolean;
  background_color: string;
  text_color: string;
  height: string;
}

export interface FakeEvent {
  id: string;
  event_type: 'ownership' | 'booking' | 'registration' | 'verification';
  message_ar: string;
  message_en: string;
  icon: string;
  enabled: boolean;
  priority: number;
}

class LiveActivityBarService {
  private eventListeners: ((events: ActivityEvent[]) => void)[] = [];
  private settingsListeners: ((settings: ActivityBarSettings) => void)[] = [];
  private fakeEventInterval: NodeJS.Timeout | null = null;
  private currentSettings: ActivityBarSettings | null = null;

  // الحصول على الإعدادات
  async getSettings(): Promise<ActivityBarSettings> {
    try {
      const { data, error } = await supabase
        .from('live_activity_bar_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        // إنشاء إعدادات افتراضية إذا لم تكن موجودة
        return await this.createDefaultSettings();
      }

      this.currentSettings = data as ActivityBarSettings;
      return data as ActivityBarSettings;
    } catch (error) {
      console.error('Error fetching activity bar settings:', error);
      throw error;
    }
  }

  // إنشاء إعدادات افتراضية
  private async createDefaultSettings(): Promise<ActivityBarSettings> {
    const defaultSettings = {
      enabled: true,
      mode: 'fake' as const,
      speed: 40,
      show_ownership: true,
      show_bookings: true,
      show_registrations: true,
      show_verifications: true,
      background_color: '#10B981',
      text_color: '#FFFFFF',
      height: '48px'
    };

    const { data, error } = await supabase
      .from('live_activity_bar_settings')
      .insert(defaultSettings)
      .select()
      .single();

    if (error) throw error;
    this.currentSettings = data as ActivityBarSettings;
    return data as ActivityBarSettings;
  }

  // تحديث الإعدادات
  async updateSettings(updates: Partial<ActivityBarSettings>): Promise<ActivityBarSettings> {
    try {
      const settings = await this.getSettings();

      const { data, error } = await supabase
        .from('live_activity_bar_settings')
        .update(updates)
        .eq('id', settings.id)
        .select()
        .single();

      if (error) throw error;

      this.currentSettings = data as ActivityBarSettings;
      this.notifySettingsListeners(data as ActivityBarSettings);

      // إعادة تشغيل الأحداث الوهمية إذا تغيرت الإعدادات
      if (updates.mode || updates.speed) {
        this.restartFakeEvents();
      }

      return data as ActivityBarSettings;
    } catch (error) {
      console.error('Error updating activity bar settings:', error);
      throw error;
    }
  }

  // الحصول على الأحداث الوهمية
  async getFakeEvents(): Promise<FakeEvent[]> {
    try {
      const { data, error } = await supabase
        .from('live_activity_fake_events')
        .select('*')
        .eq('enabled', true)
        .order('priority', { ascending: true });

      if (error) throw error;
      return data as FakeEvent[];
    } catch (error) {
      console.error('Error fetching fake events:', error);
      return [];
    }
  }

  // إضافة حدث وهمي جديد
  async addFakeEvent(event: Omit<FakeEvent, 'id'>): Promise<FakeEvent> {
    try {
      const { data, error } = await supabase
        .from('live_activity_fake_events')
        .insert(event)
        .select()
        .single();

      if (error) throw error;
      return data as FakeEvent;
    } catch (error) {
      console.error('Error adding fake event:', error);
      throw error;
    }
  }

  // تحديث حدث وهمي
  async updateFakeEvent(id: string, updates: Partial<FakeEvent>): Promise<FakeEvent> {
    try {
      const { data, error } = await supabase
        .from('live_activity_fake_events')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as FakeEvent;
    } catch (error) {
      console.error('Error updating fake event:', error);
      throw error;
    }
  }

  // حذف حدث وهمي
  async deleteFakeEvent(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('live_activity_fake_events')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting fake event:', error);
      throw error;
    }
  }

  // الحصول على الأحداث الحقيقية من قاعدة البيانات
  async getRealEvents(): Promise<ActivityEvent[]> {
    try {
      const settings = await this.getSettings();
      const events: ActivityEvent[] = [];

      // جلب أحداث التملك الأخيرة
      if (settings.show_ownership) {
        const { data: docs } = await supabase
          .from('documentation')
          .select('id, customer_name, reserved_trees, farm_id, created_at')
          .order('created_at', { ascending: false })
          .limit(5);

        if (docs) {
          docs.forEach(doc => {
            events.push({
              id: doc.id,
              message: `🎉 ${doc.customer_name} قام بتملك ${doc.reserved_trees} شجرة`,
              icon: 'TreePine',
              timestamp: new Date(doc.created_at),
              type: 'ownership'
            });
          });
        }
      }

      // جلب أحداث الحجوزات الأخيرة
      if (settings.show_bookings) {
        const { data: reservations } = await supabase
          .from('reservations')
          .select('id, customer_name, number_of_trees, created_at')
          .order('created_at', { ascending: false })
          .limit(5);

        if (reservations) {
          reservations.forEach(res => {
            events.push({
              id: res.id,
              message: `✨ ${res.customer_name} حجز ${res.number_of_trees} شجرة`,
              icon: 'Calendar',
              timestamp: new Date(res.created_at),
              type: 'booking'
            });
          });
        }
      }

      // ترتيب حسب التاريخ
      events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      return events.slice(0, 10);
    } catch (error) {
      console.error('Error fetching real events:', error);
      return [];
    }
  }

  // توليد أحداث وهمية عشوائية
  private async generateFakeEvent(): Promise<ActivityEvent | null> {
    try {
      const fakeEvents = await this.getFakeEvents();
      if (fakeEvents.length === 0) return null;

      const randomEvent = fakeEvents[Math.floor(Math.random() * fakeEvents.length)];

      return {
        id: `fake-${Date.now()}-${Math.random()}`,
        message: randomEvent.message_ar,
        icon: randomEvent.icon,
        timestamp: new Date(),
        type: randomEvent.event_type
      };
    } catch (error) {
      console.error('Error generating fake event:', error);
      return null;
    }
  }

  // بدء توليد الأحداث الوهمية
  async startFakeEvents(): Promise<void> {
    this.stopFakeEvents();

    const settings = await this.getSettings();
    if (!settings.enabled || settings.mode === 'real') return;

    // توليد حدث كل 5-10 ثوان
    const interval = 5000 + Math.random() * 5000;

    this.fakeEventInterval = setInterval(async () => {
      const event = await this.generateFakeEvent();
      if (event) {
        const currentEvents = await this.getActiveEvents();
        this.notifyEventListeners([event, ...currentEvents.slice(0, 9)]);
      }
    }, interval);

    // توليد الأحداث الأولية
    const initialEvents: ActivityEvent[] = [];
    const fakeEvents = await this.getFakeEvents();

    for (let i = 0; i < Math.min(5, fakeEvents.length); i++) {
      const randomEvent = fakeEvents[Math.floor(Math.random() * fakeEvents.length)];
      initialEvents.push({
        id: `fake-init-${i}`,
        message: randomEvent.message_ar,
        icon: randomEvent.icon,
        timestamp: new Date(Date.now() - i * 60000),
        type: randomEvent.event_type
      });
    }

    this.notifyEventListeners(initialEvents);
  }

  // إيقاف توليد الأحداث الوهمية
  stopFakeEvents(): void {
    if (this.fakeEventInterval) {
      clearInterval(this.fakeEventInterval);
      this.fakeEventInterval = null;
    }
  }

  // إعادة تشغيل الأحداث الوهمية
  private async restartFakeEvents(): Promise<void> {
    const settings = await this.getSettings();
    if (settings.mode === 'fake' || settings.mode === 'hybrid') {
      await this.startFakeEvents();
    } else {
      this.stopFakeEvents();
    }
  }

  // الحصول على الأحداث النشطة حسب الوضع
  async getActiveEvents(): Promise<ActivityEvent[]> {
    try {
      const settings = await this.getSettings();

      if (!settings.enabled) return [];

      if (settings.mode === 'fake') {
        // في الوضع الوهمي، نعيد الأحداث المحفوظة
        return [];
      } else if (settings.mode === 'real') {
        return await this.getRealEvents();
      } else {
        // hybrid - دمج الأحداث الحقيقية والوهمية
        const realEvents = await this.getRealEvents();
        // الأحداث الوهمية تُضاف تلقائياً عبر startFakeEvents
        return realEvents;
      }
    } catch (error) {
      console.error('Error getting active events:', error);
      return [];
    }
  }

  // الاشتراك في تحديثات الأحداث
  subscribeToEvents(callback: (events: ActivityEvent[]) => void): () => void {
    this.eventListeners.push(callback);

    // بدء الأحداث الوهمية عند أول اشتراك
    if (this.eventListeners.length === 1) {
      this.startFakeEvents();
    }

    return () => {
      this.eventListeners = this.eventListeners.filter(listener => listener !== callback);
      if (this.eventListeners.length === 0) {
        this.stopFakeEvents();
      }
    };
  }

  // الاشتراك في تحديثات الإعدادات
  subscribeToSettings(callback: (settings: ActivityBarSettings) => void): () => void {
    this.settingsListeners.push(callback);

    // إرسال الإعدادات الحالية فوراً
    if (this.currentSettings) {
      callback(this.currentSettings);
    } else {
      this.getSettings().then(callback);
    }

    return () => {
      this.settingsListeners = this.settingsListeners.filter(listener => listener !== callback);
    };
  }

  // إشعار المستمعين بالأحداث الجديدة
  private notifyEventListeners(events: ActivityEvent[]): void {
    this.eventListeners.forEach(listener => listener(events));
  }

  // إشعار المستمعين بالإعدادات الجديدة
  private notifySettingsListeners(settings: ActivityBarSettings): void {
    this.settingsListeners.forEach(listener => listener(settings));
  }

  // تنظيف الموارد
  cleanup(): void {
    this.stopFakeEvents();
    this.eventListeners = [];
    this.settingsListeners = [];
  }
}

export const liveActivityBarService = new LiveActivityBarService();
