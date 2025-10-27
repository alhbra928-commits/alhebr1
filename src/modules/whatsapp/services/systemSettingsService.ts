import { supabase } from '../../../lib/supabase';

export interface SystemSetting {
  id: string;
  setting_key: string;
  setting_value: string | null;
  setting_type: 'string' | 'number' | 'boolean' | 'url' | 'json';
  description_ar: string | null;
  description_en: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export const systemSettingsService = {
  /**
   * جلب قيمة إعداد معين
   */
  async getSetting(key: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('setting_value')
        .eq('setting_key', key)
        .maybeSingle();

      if (error) throw error;
      return data?.setting_value || null;
    } catch (error) {
      console.error(`Error fetching setting ${key}:`, error);
      return null;
    }
  },

  /**
   * جلب إعداد كامل مع جميع بياناته
   */
  async getFullSetting(key: string): Promise<SystemSetting | null> {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .eq('setting_key', key)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error fetching full setting ${key}:`, error);
      return null;
    }
  },

  /**
   * تحديث قيمة إعداد
   */
  async updateSetting(key: string, value: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('system_settings')
        .update({
          setting_value: value,
          updated_at: new Date().toISOString()
        })
        .eq('setting_key', key);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Error updating setting ${key}:`, error);
      return false;
    }
  },

  /**
   * إنشاء أو تحديث إعداد
   */
  async upsertSetting(
    key: string,
    value: string,
    type: 'string' | 'number' | 'boolean' | 'url' | 'json' = 'string',
    descriptionAr?: string,
    descriptionEn?: string,
    isPublic: boolean = false
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('system_settings')
        .upsert({
          setting_key: key,
          setting_value: value,
          setting_type: type,
          description_ar: descriptionAr,
          description_en: descriptionEn,
          is_public: isPublic,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'setting_key'
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Error upserting setting ${key}:`, error);
      return false;
    }
  },

  /**
   * جلب جميع الإعدادات
   */
  async getAllSettings(): Promise<SystemSetting[]> {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .order('setting_key');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching all settings:', error);
      return [];
    }
  },

  /**
   * جلب رابط واتساب الأعمال
   */
  async getBusinessWhatsAppLink(): Promise<string> {
    const link = await this.getSetting('business_whatsapp_link');
    return link || 'https://wa.me/message/';
  },

  /**
   * تحديث رابط واتساب الأعمال
   */
  async updateBusinessWhatsAppLink(link: string): Promise<boolean> {
    // التحقق من صحة الرابط
    if (!this.isValidWhatsAppLink(link)) {
      throw new Error('الرجاء إدخال رابط واتساب أعمال صالح من حساب المنصة التجاري');
    }

    return await this.updateSetting('business_whatsapp_link', link);
  },

  /**
   * التحقق من صحة رابط واتساب
   */
  isValidWhatsAppLink(link: string): boolean {
    return link.startsWith('https://wa.me/message/') ||
           link.startsWith('https://wa.me/') ||
           link.startsWith('https://api.whatsapp.com/');
  },

  /**
   * فتح رابط واتساب للاختبار
   */
  testWhatsAppLink(link: string): void {
    if (this.isValidWhatsAppLink(link)) {
      window.open(link, '_blank');
    } else {
      alert('⚠️ الرجاء إدخال رابط واتساب صالح');
    }
  }
};
