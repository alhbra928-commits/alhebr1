import { supabase } from '../lib/supabase';

export interface TickerMessage {
  id: string;
  text_ar: string;
  icon_name: string;
  color: string;
  is_active: boolean;
  order_index: number;
  created_at?: string;
  updated_at?: string;
}

export interface TickerSettings {
  id: string;
  enabled: boolean;
  speed: number;
  height: string;
  updated_at?: string;
}

class Modern3DTickerService {
  private readonly TABLE_MESSAGES = 'ticker_messages_3d';
  private readonly TABLE_SETTINGS = 'ticker_settings_3d';

  async getMessages(): Promise<TickerMessage[]> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_MESSAGES)
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error loading ticker messages:', error);
      return this.getDefaultMessages();
    }
  }

  async getActiveMessages(): Promise<TickerMessage[]> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_MESSAGES)
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error loading active ticker messages:', error);
      return this.getDefaultMessages();
    }
  }

  async getSettings(): Promise<TickerSettings> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_SETTINGS)
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      return data || this.getDefaultSettings();
    } catch (error) {
      console.error('Error loading ticker settings:', error);
      return this.getDefaultSettings();
    }
  }

  async updateSettings(settings: Partial<TickerSettings>): Promise<boolean> {
    try {
      const current = await this.getSettings();

      const { error } = await supabase
        .from(this.TABLE_SETTINGS)
        .upsert({
          id: current.id || '1',
          ...settings,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating ticker settings:', error);
      return false;
    }
  }

  async addMessage(message: Omit<TickerMessage, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(this.TABLE_MESSAGES)
        .insert({
          ...message,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error adding ticker message:', error);
      return false;
    }
  }

  async updateMessage(id: string, updates: Partial<TickerMessage>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(this.TABLE_MESSAGES)
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating ticker message:', error);
      return false;
    }
  }

  async deleteMessage(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(this.TABLE_MESSAGES)
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting ticker message:', error);
      return false;
    }
  }

  async toggleMessage(id: string, isActive: boolean): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(this.TABLE_MESSAGES)
        .update({
          is_active: isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error toggling ticker message:', error);
      return false;
    }
  }

  async reorderMessages(messages: { id: string; order_index: number }[]): Promise<boolean> {
    try {
      const updates = messages.map(msg => ({
        id: msg.id,
        order_index: msg.order_index,
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from(this.TABLE_MESSAGES)
        .upsert(updates);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error reordering ticker messages:', error);
      return false;
    }
  }

  private getDefaultMessages(): TickerMessage[] {
    return [
      {
        id: '1',
        text_ar: 'استثمر في مستقبل أخضر مستدام',
        icon_name: 'tree',
        color: '#10b981',
        is_active: true,
        order_index: 1
      },
      {
        id: '2',
        text_ar: 'عوائد سنوية مضمونة من أشجارك',
        icon_name: 'trending',
        color: '#059669',
        is_active: true,
        order_index: 2
      },
      {
        id: '3',
        text_ar: 'ملكية موثقة ومضمونة قانونياً',
        icon_name: 'shield',
        color: '#047857',
        is_active: true,
        order_index: 3
      },
      {
        id: '4',
        text_ar: 'تملك أشجار النخيل والزيتون الآن',
        icon_name: 'award',
        color: '#065f46',
        is_active: true,
        order_index: 4
      },
    ];
  }

  private getDefaultSettings(): TickerSettings {
    return {
      id: '1',
      enabled: true,
      speed: 40,
      height: '80px'
    };
  }

  subscribeToMessages(callback: (messages: TickerMessage[]) => void) {
    const channel = supabase
      .channel('ticker_messages_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: this.TABLE_MESSAGES
        },
        async () => {
          const messages = await this.getActiveMessages();
          callback(messages);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  subscribeToSettings(callback: (settings: TickerSettings) => void) {
    const channel = supabase
      .channel('ticker_settings_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: this.TABLE_SETTINGS
        },
        async () => {
          const settings = await this.getSettings();
          callback(settings);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}

export const modern3DTickerService = new Modern3DTickerService();
