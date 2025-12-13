import { supabase } from '../lib/supabase';

export interface FooterInfo {
  id: string;
  organization_name_ar: string;
  organization_name_en: string;
  commercial_registration: string;
  email: string;
  phone: string;
  whatsapp: string;
  city_ar: string;
  city_en: string;
  country_ar: string;
  country_en: string;
  trust_statement_ar: string;
  trust_statement_en: string;
  show_privacy_policy: boolean;
  show_terms_conditions: boolean;
  privacy_policy_url: string;
  terms_conditions_url: string;
  footer_bg_color: string;
  footer_text_color: string;
  show_in_mobile: boolean;
  mobile_collapsed: boolean;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

class FooterService {
  async getActiveFooter(): Promise<FooterInfo | null> {
    try {
      const { data, error } = await supabase
        .from('footer_info')
        .select('*')
        .eq('is_active', true)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching footer info:', error);
      return null;
    }
  }

  async getAllFooters(): Promise<FooterInfo[]> {
    try {
      const { data, error } = await supabase
        .from('footer_info')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching all footers:', error);
      return [];
    }
  }

  async updateFooter(id: string, updates: Partial<FooterInfo>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('footer_info')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating footer:', error);
      return false;
    }
  }

  async createFooter(footer: Omit<FooterInfo, 'id' | 'created_at' | 'updated_at'>): Promise<FooterInfo | null> {
    try {
      const { data, error } = await supabase
        .from('footer_info')
        .insert([footer])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating footer:', error);
      return null;
    }
  }

  subscribeToChanges(callback: (payload: any) => void) {
    const channel = supabase
      .channel('footer_info_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'footer_info',
        },
        callback
      )
      .subscribe();

    return channel;
  }
}

export const footerService = new FooterService();
