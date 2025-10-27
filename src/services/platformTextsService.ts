import { supabase } from '../lib/supabase';

export interface PlatformText {
  key: string;
  text_ar: string;
  text_en: string;
  metadata?: any;
}

interface PlatformTexts {
  [key: string]: {
    ar: string;
    en: string;
  };
}

// Cache for texts
let textsCache: Record<string, PlatformTexts> = {};
let cacheTime: Record<string, number> = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get texts by section with caching
 */
export async function getPlatformTextsBySection(section: string): Promise<PlatformTexts> {
  const now = Date.now();

  // Check cache
  if (textsCache[section] && cacheTime[section] && (now - cacheTime[section]) < CACHE_DURATION) {
    return textsCache[section];
  }

  try {
    const { data, error } = await supabase
      .rpc('get_platform_texts_by_section', { p_section: section });

    if (error) throw error;

    // Transform to easy-to-use format
    const texts: PlatformTexts = {};
    if (data) {
      data.forEach((item: PlatformText) => {
        texts[item.key] = {
          ar: item.text_ar,
          en: item.text_en || item.text_ar
        };
      });
    }

    // Update cache
    textsCache[section] = texts;
    cacheTime[section] = now;

    return texts;
  } catch (error) {
    console.error(`Error loading texts for section ${section}:`, error);
    return {};
  }
}

/**
 * Get a single text by section and key
 */
export async function getPlatformText(
  section: string,
  key: string,
  language: 'ar' | 'en' = 'ar',
  fallback: string = ''
): Promise<string> {
  const texts = await getPlatformTextsBySection(section);
  return texts[key]?.[language] || fallback;
}

/**
 * Clear texts cache
 */
export function clearPlatformTextsCache(section?: string) {
  if (section) {
    delete textsCache[section];
    delete cacheTime[section];
  } else {
    textsCache = {};
    cacheTime = {};
  }
}

/**
 * Subscribe to changes in platform texts
 */
export function subscribeToPlatformTextsChanges(
  section: string,
  callback: (texts: PlatformTexts) => void
) {
  const channel = supabase
    .channel(`platform_texts_${section}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'platform_texts',
        filter: `section=eq.${section}`
      },
      async () => {
        // Clear cache for this section
        clearPlatformTextsCache(section);

        // Reload texts
        const texts = await getPlatformTextsBySection(section);
        callback(texts);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
