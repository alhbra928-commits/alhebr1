import { supabase } from '../../../lib/supabase';

// =====================================
// أنواع البيانات
// =====================================

export interface TickerSettings {
  id: string;
  is_enabled: boolean;
  show_demo_data: boolean;
  speed: number;
  animation_style: 'scroll' | 'fade' | 'slide';
  background_color: string;
  text_color: string;
  border_color: string;
  height: number;
  update_interval: number;
  created_at: string;
  updated_at: string;
  notes?: string;
}

export interface TickerItem {
  id: string;
  label: string;
  label_en?: string;
  icon: string;
  color: string;
  data_source: 'farms' | 'reservations' | 'investors' | 'trees' | 'custom';
  custom_value: number;
  show_percentage: boolean;
  percentage_value: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TickerConfiguration {
  settings: TickerSettings;
  items: TickerItem[];
}

// =====================================
// خدمة إدارة الشريط المتحرك
// =====================================

export const tickerService = {
  // =====================================
  // 1. الحصول على الإعدادات
  // =====================================

  async getSettings(): Promise<TickerSettings | null> {
    const { data, error } = await supabase
      .from('ticker_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching ticker settings:', error);
      return null;
    }

    return data;
  },

  // =====================================
  // 2. تحديث الإعدادات
  // =====================================

  async updateSettings(settings: Partial<TickerSettings>): Promise<boolean> {
    // الحصول على الإعدادات الحالية
    const current = await this.getSettings();

    if (!current) {
      console.error('No ticker settings found');
      return false;
    }

    const { error } = await supabase
      .from('ticker_settings')
      .update(settings)
      .eq('id', current.id);

    if (error) {
      console.error('Error updating ticker settings:', error);
      return false;
    }

    return true;
  },

  // =====================================
  // 3. الحصول على جميع العناصر
  // =====================================

  async getItems(): Promise<TickerItem[]> {
    const { data, error } = await supabase
      .from('ticker_items')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching ticker items:', error);
      return [];
    }

    return data || [];
  },

  // =====================================
  // 4. الحصول على العناصر النشطة فقط
  // =====================================

  async getActiveItems(): Promise<TickerItem[]> {
    const { data, error } = await supabase
      .from('ticker_items')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching active ticker items:', error);
      return [];
    }

    return data || [];
  },

  // =====================================
  // 5. إضافة عنصر جديد
  // =====================================

  async createItem(item: Omit<TickerItem, 'id' | 'created_at' | 'updated_at'>): Promise<TickerItem | null> {
    const { data, error } = await supabase
      .from('ticker_items')
      .insert(item)
      .select()
      .single();

    if (error) {
      console.error('Error creating ticker item:', error);
      return null;
    }

    return data;
  },

  // =====================================
  // 6. تحديث عنصر
  // =====================================

  async updateItem(id: string, updates: Partial<TickerItem>): Promise<boolean> {
    const { error } = await supabase
      .from('ticker_items')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Error updating ticker item:', error);
      return false;
    }

    return true;
  },

  // =====================================
  // 7. حذف عنصر
  // =====================================

  async deleteItem(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('ticker_items')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting ticker item:', error);
      return false;
    }

    return true;
  },

  // =====================================
  // 8. تفعيل/إيقاف عنصر
  // =====================================

  async toggleItemActive(id: string, isActive: boolean): Promise<boolean> {
    return this.updateItem(id, { is_active: isActive });
  },

  // =====================================
  // 9. إعادة ترتيب العناصر
  // =====================================

  async reorderItems(items: { id: string; sort_order: number }[]): Promise<boolean> {
    try {
      const updates = items.map(item =>
        supabase
          .from('ticker_items')
          .update({ sort_order: item.sort_order })
          .eq('id', item.id)
      );

      await Promise.all(updates);
      return true;
    } catch (error) {
      console.error('Error reordering ticker items:', error);
      return false;
    }
  },

  // =====================================
  // 10. الحصول على التكوين الكامل
  // =====================================

  async getConfiguration(): Promise<TickerConfiguration | null> {
    const [settings, items] = await Promise.all([
      this.getSettings(),
      this.getActiveItems()
    ]);

    if (!settings) {
      return null;
    }

    return {
      settings,
      items
    };
  },

  // =====================================
  // 11. تفعيل/إيقاف الشريط
  // =====================================

  async toggleTicker(enabled: boolean): Promise<boolean> {
    return this.updateSettings({ is_enabled: enabled });
  },

  // =====================================
  // 12. تفعيل/إيقاف البيانات التجريبية
  // =====================================

  async toggleDemoData(show: boolean): Promise<boolean> {
    return this.updateSettings({ show_demo_data: show });
  },

  // =====================================
  // 13. الحصول على البيانات الحية
  // =====================================

  async getLiveData(): Promise<{
    farms: number;
    reservations: number;
    investors: number;
    trees: number;
  }> {
    try {
      const [farmsResult, reservationsResult, investorsResult, treesResult] = await Promise.all([
        supabase.from('farms').select('id', { count: 'exact', head: true }),
        supabase.from('reservations').select('id', { count: 'exact', head: true }),
        supabase.from('investors').select('id', { count: 'exact', head: true }),
        supabase.from('farms').select('available_trees'),
      ]);

      const totalAvailableTrees = treesResult.data?.reduce(
        (sum, farm) => sum + (farm.available_trees || 0),
        0
      ) || 0;

      return {
        farms: farmsResult.count || 0,
        reservations: reservationsResult.count || 0,
        investors: investorsResult.count || 0,
        trees: totalAvailableTrees,
      };
    } catch (error) {
      console.error('Error loading live data:', error);
      return {
        farms: 0,
        reservations: 0,
        investors: 0,
        trees: 0,
      };
    }
  },
};
