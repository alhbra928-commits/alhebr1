import { supabase } from '../lib/supabase';

interface PlatformText {
  id: string;
  section: string;
  key: string;
  text_ar: string;
  text_en: string;
  description: string;
  editable: boolean;
  display_order: number;
}

interface TextsMap {
  [key: string]: {
    ar: string;
    en: string;
    description?: string;
  };
}

class PlatformTextsService {
  private cache: Map<string, { data: TextsMap; timestamp: number }> = new Map();
  private cacheDuration = 5 * 60 * 1000;

  async getTextsBySection(section: string): Promise<TextsMap> {
    const cacheKey = `section_${section}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      return cached.data;
    }

    try {
      const { data, error } = await supabase
        .from('platform_texts')
        .select('*')
        .eq('section', section)
        .order('display_order', { ascending: true });

      if (error) throw error;

      const textsMap: TextsMap = {};
      data?.forEach((text: PlatformText) => {
        textsMap[text.key] = {
          ar: text.text_ar,
          en: text.text_en,
          description: text.description
        };
      });

      this.cache.set(cacheKey, { data: textsMap, timestamp: Date.now() });
      return textsMap;
    } catch (error) {
      console.error(`Error loading texts for section ${section}:`, error);
      return {};
    }
  }

  async getTextByKey(section: string, key: string): Promise<{ ar: string; en: string } | null> {
    try {
      const { data, error } = await supabase
        .from('platform_texts')
        .select('text_ar, text_en')
        .eq('section', section)
        .eq('key', key)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      return {
        ar: data.text_ar,
        en: data.text_en
      };
    } catch (error) {
      console.error(`Error loading text ${section}.${key}:`, error);
      return null;
    }
  }

  async getAllTexts(): Promise<Record<string, TextsMap>> {
    try {
      const { data, error } = await supabase
        .from('platform_texts')
        .select('*')
        .order('section', { ascending: true })
        .order('display_order', { ascending: true });

      if (error) throw error;

      const result: Record<string, TextsMap> = {};
      data?.forEach((text: PlatformText) => {
        if (!result[text.section]) {
          result[text.section] = {};
        }
        result[text.section][text.key] = {
          ar: text.text_ar,
          en: text.text_en,
          description: text.description
        };
      });

      return result;
    } catch (error) {
      console.error('Error loading all texts:', error);
      return {};
    }
  }

  async updateText(section: string, key: string, text_ar: string, text_en: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('platform_texts')
        .update({
          text_ar,
          text_en,
          updated_at: new Date().toISOString()
        })
        .eq('section', section)
        .eq('key', key);

      if (error) throw error;

      const cacheKey = `section_${section}`;
      this.cache.delete(cacheKey);

      return true;
    } catch (error) {
      console.error(`Error updating text ${section}.${key}:`, error);
      return false;
    }
  }

  async getText(section: string, key: string, lang: 'ar' | 'en' = 'ar'): Promise<string> {
    const text = await this.getTextByKey(section, key);
    if (!text) return '';
    return lang === 'ar' ? text.ar : text.en;
  }

  async getSectionTexts(section: string): Promise<PlatformText[]> {
    try {
      const { data, error } = await supabase
        .from('platform_texts')
        .select('*')
        .eq('section', section)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`Error loading section texts for ${section}:`, error);
      return [];
    }
  }

  clearCache() {
    this.cache.clear();
  }

  subscribeToChanges(callback: () => void) {
    const channel = supabase
      .channel('platform_texts_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'platform_texts'
        },
        () => {
          this.clearCache();
          callback();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }
}

export const platformTextsService = new PlatformTextsService();

export const getPlatformTextsBySection = (section: string) =>
  platformTextsService.getTextsBySection(section);

export const getPlatformText = (section: string, key: string, lang: 'ar' | 'en' = 'ar') =>
  platformTextsService.getText(section, key, lang);
