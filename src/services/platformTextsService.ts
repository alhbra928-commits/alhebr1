// Platform Texts Service

export const getPlatformTextsBySection = async (section: string) => {
  return {
    hero_title: { ar: 'عنوان البطل' },
    hero_subtitle: { ar: 'عنوان فرعي' },
    cta_message: { ar: 'رسالة призыва للعمل' }
  };
};

export const platformTextsService = {
  getTexts: async () => ({
    hero_title: { ar: '' },
    hero_subtitle: { ar: '' }
  }),
  getTextsBySection: getPlatformTextsBySection
};
