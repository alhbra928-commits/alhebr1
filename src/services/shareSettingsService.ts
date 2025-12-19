import { supabase } from '../lib/supabase';

export interface ShareSettings {
  id: string;
  page_type: string;
  og_title_ar: string;
  og_title_en?: string;
  og_description_ar: string;
  og_description_en?: string;
  og_image_url: string;
  share_text_template: string;
  emojis: {
    tree?: string;
    location?: string;
    money?: string;
    check?: string;
    fire?: string;
    target?: string;
    down?: string;
    [key: string]: string | undefined;
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ShareData {
  farm_name?: string;
  location?: string;
  price?: number;
  available_trees?: number;
  availability_text?: string;
  [key: string]: string | number | undefined;
}

class ShareSettingsService {
  async getAllSettings(): Promise<ShareSettings[]> {
    const { data, error } = await supabase
      .from('share_settings')
      .select('*')
      .order('page_type');

    if (error) throw error;
    return data || [];
  }

  async getSettingsByPageType(pageType: string): Promise<ShareSettings | null> {
    const { data, error } = await supabase
      .from('share_settings')
      .select('*')
      .eq('page_type', pageType)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error fetching share settings:', error);
      return null;
    }
    return data;
  }

  async updateSettings(id: string, updates: Partial<ShareSettings>): Promise<void> {
    const { error } = await supabase
      .from('share_settings')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  }

  processTemplate(template: string, data: ShareData, emojis: ShareSettings['emojis']): string {
    let result = template;

    Object.entries(emojis).forEach(([key, value]) => {
      if (value) {
        result = result.replace(new RegExp(`{{emoji_${key}}}`, 'g'), value);
      }
    });

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        const displayValue = typeof value === 'number'
          ? value.toLocaleString('ar-SA')
          : value;
        result = result.replace(new RegExp(`{{${key}}}`, 'g'), String(displayValue));
      }
    });

    result = result.replace(/{{[^}]+}}/g, '');

    return result.trim();
  }

  async generateShareContent(
    pageType: string,
    data: ShareData = {},
    currentUrl?: string
  ): Promise<{
    title: string;
    text: string;
    url: string;
    ogTitle: string;
    ogDescription: string;
    ogImage: string;
  } | null> {
    const settings = await this.getSettingsByPageType(pageType);
    if (!settings) return null;

    const text = this.processTemplate(
      settings.share_text_template,
      data,
      settings.emojis
    );

    const title = this.processTemplate(
      settings.og_title_ar,
      data,
      settings.emojis
    );

    const description = this.processTemplate(
      settings.og_description_ar,
      data,
      settings.emojis
    );

    return {
      title,
      text,
      url: currentUrl || window.location.href,
      ogTitle: title,
      ogDescription: description,
      ogImage: settings.og_image_url
    };
  }

  async share(pageType: string, data: ShareData = {}): Promise<boolean> {
    const content = await this.generateShareContent(pageType, data);
    if (!content) return false;

    const fullText = `${content.text}\n\n${content.url}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: content.title,
          text: fullText,
          url: content.url
        });
        return true;
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Share error:', error);
        }
        return false;
      }
    } else {
      try {
        await navigator.clipboard.writeText(fullText);
        this.showCopyModal();
        return true;
      } catch (error) {
        console.error('Clipboard error:', error);
        prompt('انسخ الرابط:', fullText);
        return false;
      }
    }
  }

  private showCopyModal(): void {
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: linear-gradient(135deg, #065f46 0%, #047857 100%);
      color: white;
      padding: 30px 40px;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.4);
      z-index: 100000;
      text-align: center;
      font-family: system-ui, -apple-system, sans-serif;
      animation: slideIn 0.3s ease;
    `;
    modal.innerHTML = `
      <div style="font-size: 3rem; margin-bottom: 15px;">✅</div>
      <div style="font-size: 1.3rem; font-weight: 600; margin-bottom: 10px;">تم النسخ بنجاح!</div>
      <div style="font-size: 1rem; opacity: 0.9;">يمكنك الآن مشاركة الرابط مع أصدقائك</div>
    `;

    document.body.appendChild(modal);

    setTimeout(() => {
      modal.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => modal.remove(), 300);
    }, 3000);
  }

  updatePageMeta(pageType: string, data: ShareData = {}): void {
    this.getSettingsByPageType(pageType).then(settings => {
      if (!settings) return;

      const title = this.processTemplate(settings.og_title_ar, data, settings.emojis);
      const description = this.processTemplate(settings.og_description_ar, data, settings.emojis);

      document.title = title;

      this.updateMetaTag('og:title', title);
      this.updateMetaTag('og:description', description);
      this.updateMetaTag('og:image', settings.og_image_url);
      this.updateMetaTag('og:url', window.location.href);

      this.updateMetaTag('twitter:title', title);
      this.updateMetaTag('twitter:description', description);
      this.updateMetaTag('twitter:image', settings.og_image_url);

      this.updateMetaTag('description', description, 'name');
    });
  }

  private updateMetaTag(property: string, content: string, attribute: 'property' | 'name' = 'property'): void {
    let meta = document.querySelector(`meta[${attribute}="${property}"]`) as HTMLMetaElement;

    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute(attribute, property);
      document.head.appendChild(meta);
    }

    meta.content = content;
  }
}

export const shareSettingsService = new ShareSettingsService();
