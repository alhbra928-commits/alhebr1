import { systemSettingsService } from './systemSettingsService';
import { whatsappLinkGenerator } from './whatsappLinkGenerator';

export interface FallbackResponse {
  message: string;
  confidence: number;
  type: 'ai' | 'fallback' | 'business_link';
  whatsapp_link?: string;
  hybrid_link?: string;
}

/**
 * خدمة الرد الاحتياطي الذكي
 *
 * عند فشل الذكاء الصناعي في الرد (confidence < 0.6)،
 * يتم تفعيل الرد الاحتياطي الذكي الذي يوجه المستخدم
 * إلى واتساب الأعمال الرسمي للمنصة
 */
export const smartFallbackService = {
  /**
   * توليد رد احتياطي ذكي
   * @param userMessage رسالة المستخدم
   * @param aiConfidence مستوى ثقة الذكاء الصناعي (0-1)
   * @param autoResponseLink رابط واتساب من الرد الجاهز (اختياري)
   * @returns FallbackResponse
   */
  async generateFallbackResponse(
    userMessage: string,
    aiConfidence: number,
    autoResponseLink?: string | null
  ): Promise<FallbackResponse> {
    // إذا كانت الثقة عالية، لا نحتاج للرد الاحتياطي
    if (aiConfidence >= 0.6) {
      return {
        message: '',
        confidence: aiConfidence,
        type: 'ai'
      };
    }

    // توليد رابط واتساب هجين مع الرسالة المرافقة
    let hybridLink: string;
    let simpleLink: string;

    if (autoResponseLink && autoResponseLink.trim() !== '') {
      // استخدام الرابط المخصص من الرد الجاهز (بدون رسالة هجينة)
      hybridLink = autoResponseLink;
      simpleLink = autoResponseLink;
    } else {
      // استخدام الرابط الرسمي مع الرسالة الهجينة
      const linkData = await whatsappLinkGenerator.generateBusinessLink({
        userType: whatsappLinkGenerator.getCurrentUserType(),
        context: 'الرد الاحتياطي الذكي - فشل الذكاء الصناعي',
        timestamp: new Date(),
        additionalInfo: {
          'مستوى الثقة': `${Math.round(aiConfidence * 100)}%`,
          'الاستفسار': userMessage.substring(0, 50) + (userMessage.length > 50 ? '...' : '')
        }
      });

      hybridLink = linkData.fullLink;
      simpleLink = await systemSettingsService.getBusinessWhatsAppLink();
    }

    // توليد رسالة الرد الاحتياطي
    const fallbackMessage = this.generateMessage(userMessage, hybridLink);

    return {
      message: fallbackMessage,
      confidence: aiConfidence,
      type: 'business_link',
      whatsapp_link: simpleLink,
      hybrid_link: hybridLink
    };
  },

  /**
   * توليد نص رسالة الرد الاحتياطي
   */
  generateMessage(userMessage: string, whatsappLink: string): string {
    // رسائل مختلفة حسب نوع الاستفسار
    const greetings = ['مرحبا', 'السلام عليكم', 'أهلا', 'صباح', 'مساء'];
    const isGreeting = greetings.some(g => userMessage.includes(g));

    if (isGreeting) {
      return `
مرحباً بك! 🌟

نحن سعداء بتواصلك معنا. لتقديم أفضل خدمة لك، يمكنك التحدث مباشرة مع فريق الدعم عبر واتساب الأعمال الرسمي:

[تواصل مع إدارة المنصة 📞](${whatsappLink})

نحن هنا لمساعدتك في أي وقت! 🙏
      `.trim();
    }

    // استفسار عام
    return `
💬 شكراً على تواصلك معنا!

يبدو أن استفسارك يحتاج إلى تواصل مباشر مع إدارة المنصة للحصول على إجابة دقيقة ومفصلة.

يمكنك التحدث الآن عبر واتساب الأعمال الرسمي من خلال الرابط التالي:

[تواصل مع إدارة المنصة 📞](${whatsappLink})

فريقنا جاهز لخدمتك ومساعدتك! ✨
    `.trim();
  },

  /**
   * التحقق من صحة رابط واتساب
   */
  isValidWhatsAppLink(link: string | null | undefined): boolean {
    if (!link || link.trim() === '') return false;

    return link.startsWith('https://wa.me/message/') ||
           link.startsWith('https://wa.me/') ||
           link.startsWith('https://api.whatsapp.com/');
  },

  /**
   * استخراج معلومات من رسالة المستخدم
   */
  analyzeUserMessage(message: string): {
    intent: string;
    keywords: string[];
    isUrgent: boolean;
  } {
    const urgentWords = ['عاجل', 'سريع', 'الآن', 'مستعجل', 'ضروري'];
    const isUrgent = urgentWords.some(word => message.includes(word));

    const keywords = message
      .split(' ')
      .filter(word => word.length > 3)
      .slice(0, 5);

    // تحديد النية بشكل بسيط
    let intent = 'general';
    if (message.includes('حجز') || message.includes('أحجز')) {
      intent = 'booking';
    } else if (message.includes('سعر') || message.includes('كم')) {
      intent = 'pricing';
    } else if (message.includes('تحويل') || message.includes('دفع')) {
      intent = 'payment';
    }

    return { intent, keywords, isUrgent };
  },

  /**
   * تسجيل استخدام الرد الاحتياطي (للإحصاءات)
   */
  async logFallbackUsage(
    userMessage: string,
    aiConfidence: number,
    whatsappLink: string
  ): Promise<void> {
    try {
      const analysis = this.analyzeUserMessage(userMessage);

      console.log('Fallback Response Used:', {
        timestamp: new Date().toISOString(),
        userMessage: userMessage.substring(0, 50),
        aiConfidence,
        whatsappLink,
        ...analysis
      });

      // يمكن إضافة تسجيل في قاعدة البيانات هنا
    } catch (error) {
      console.error('Error logging fallback usage:', error);
    }
  }
};
