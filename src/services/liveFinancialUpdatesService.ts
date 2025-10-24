import { supabase } from '../lib/supabase';

export interface LiveFinancialUpdate {
  farm_code: string;
  collected_from_investors: number;
  remaining_for_owner: number;
  completion_percentage_visual: number;
  financial_health_status: 'low' | 'medium' | 'high' | 'complete';
  completion_flash_shown: boolean;
}

export class LiveFinancialUpdatesService {
  private static updateInterval: NodeJS.Timeout | null = null;
  private static subscribers: Map<string, (data: LiveFinancialUpdate) => void> = new Map();

  static startPolling(farmCode: string, callback: (data: LiveFinancialUpdate) => void, intervalMs: number = 3000) {
    const key = `${farmCode}-${Date.now()}`;
    this.subscribers.set(key, callback);

    this.poll(farmCode);

    if (!this.updateInterval) {
      this.updateInterval = setInterval(() => {
        this.subscribers.forEach((cb, subscriberKey) => {
          const code = subscriberKey.split('-')[0];
          this.poll(code);
        });
      }, intervalMs);
    }

    return () => {
      this.subscribers.delete(key);
      if (this.subscribers.size === 0 && this.updateInterval) {
        clearInterval(this.updateInterval);
        this.updateInterval = null;
      }
    };
  }

  private static async poll(farmCode: string) {
    const { data, error } = await supabase
      .from('smart_farm_finances')
      .select('farm_code, collected_from_investors, remaining_for_owner, completion_percentage_visual, financial_health_status, completion_flash_shown')
      .eq('farm_code', farmCode)
      .maybeSingle();

    if (error) {
      console.error('Error polling financial updates:', error);
      return;
    }

    if (data) {
      this.subscribers.forEach((callback, key) => {
        const code = key.split('-')[0];
        if (code === farmCode) {
          callback(data as LiveFinancialUpdate);
        }
      });
    }
  }

  static subscribeToRealtimeUpdates(
    farmCode: string,
    callback: (data: LiveFinancialUpdate) => void
  ) {
    const channel = supabase
      .channel(`financial-updates-${farmCode}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'smart_farm_finances',
          filter: `farm_code=eq.${farmCode}`
        },
        (payload) => {
          const newData = payload.new as any;
          callback({
            farm_code: newData.farm_code,
            collected_from_investors: newData.collected_from_investors || 0,
            remaining_for_owner: newData.remaining_for_owner || 0,
            completion_percentage_visual: newData.completion_percentage_visual || 0,
            financial_health_status: newData.financial_health_status || 'low',
            completion_flash_shown: newData.completion_flash_shown || false
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  static async getCurrentStats(farmCode: string): Promise<LiveFinancialUpdate | null> {
    const { data, error } = await supabase
      .from('smart_farm_finances')
      .select('farm_code, collected_from_investors, remaining_for_owner, completion_percentage_visual, financial_health_status, completion_flash_shown')
      .eq('farm_code', farmCode)
      .maybeSingle();

    if (error) {
      console.error('Error fetching current stats:', error);
      return null;
    }

    if (!data) return null;

    return {
      farm_code: data.farm_code,
      collected_from_investors: data.collected_from_investors || 0,
      remaining_for_owner: data.remaining_for_owner || 0,
      completion_percentage_visual: data.completion_percentage_visual || 0,
      financial_health_status: data.financial_health_status || 'low',
      completion_flash_shown: data.completion_flash_shown || false
    };
  }
}
