import { systemSettingsService } from './systemSettingsService';

export type UserType = 'investor' | 'farm_owner' | 'visitor' | 'admin' | 'unknown';
export type PageContext = string;

export interface HybridMessageData {
  userType: UserType;
  context: PageContext;
  timestamp: Date;
  additionalInfo?: Record<string, any>;
}

export interface GeneratedLink {
  fullLink: string;
  baseMessage: string;
  autoData: string;
  finalMessage: string;
}

/**
 * خدمة توليد روابط واتساب الأعمال الهجينة
 *
 * تجمع بين:
 * 1. الرسالة اليدوية من الإدارة
 * 2. البيانات التلقائية (نوع المستخدم، المصدر، التاريخ والوقت)
 */
export const whatsappLinkGenerator = {
  /**
   * توليد رابط واتساب أعمال كامل مع الرسالة الهجينة
   */
  async generateBusinessLink(data: HybridMessageData): Promise<GeneratedLink> {
    // 1. جلب الرسالة اليدوية من الإعدادات
    const baseMessage = await systemSettingsService.getBusinessWhatsAppMessage();

    // 2. تكوين البيانات التلقائية
    const autoData = this.generateAutoData(data);

    // 3. دمج الرسالة الكاملة
    const finalMessage = this.mergeMessages(baseMessage, autoData);

    // 4. ترميز الرسالة للرابط
    const encodedMessage = encodeURIComponent(finalMessage);

    // 5. جلب رابط واتساب الأعمال
    const businessLink = await systemSettingsService.getBusinessWhatsAppLink();

    // 6. تكوين الرابط النهائي
    const fullLink = `${businessLink}?text=${encodedMessage}`;

    return {
      fullLink,
      baseMessage,
      autoData,
      finalMessage
    };
  },

  /**
   * توليد البيانات التلقائية
   */
  generateAutoData(data: HybridMessageData): string {
    const { userType, context, timestamp, additionalInfo } = data;

    // تنسيق التاريخ والوقت بالعربية
    const formattedDate = timestamp.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });

    const formattedTime = timestamp.toLocaleTimeString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    // ترجمة نوع المستخدم
    const userTypeLabel = this.getUserTypeLabel(userType);

    // بناء النص التلقائي
    let autoData = `
———————————————
نوع العميل: ${userTypeLabel}
المصدر: ${context}
التاريخ: ${formattedDate} – ${formattedTime}`;

    // إضافة معلومات إضافية إن وجدت
    if (additionalInfo && Object.keys(additionalInfo).length > 0) {
      autoData += '\n\nمعلومات إضافية:';
      for (const [key, value] of Object.entries(additionalInfo)) {
        autoData += `\n• ${key}: ${value}`;
      }
    }

    return autoData.trim();
  },

  /**
   * دمج الرسالة اليدوية مع البيانات التلقائية
   */
  mergeMessages(baseMessage: string, autoData: string): string {
    return `${baseMessage.trim()}\n\n${autoData}`;
  },

  /**
   * ترجمة نوع المستخدم إلى عربي
   */
  getUserTypeLabel(userType: UserType): string {
    const labels: Record<UserType, string> = {
      investor: 'مستثمر 💰',
      farm_owner: 'صاحب مزرعة 🌾',
      visitor: 'زائر 👤',
      admin: 'مدير 👨‍💼',
      unknown: 'غير محدد ❓'
    };

    return labels[userType] || labels.unknown;
  },

  /**
   * تحديد نوع المستخدم الحالي من الجلسة
   */
  getCurrentUserType(): UserType {
    try {
      // فحص جلسة المستثمر
      const investorSession = localStorage.getItem('investor_session');
      if (investorSession) {
        const session = JSON.parse(investorSession);
        if (session.investor) return 'investor';
      }

      // فحص جلسة صاحب المزرعة
      const ownerSession = localStorage.getItem('farm_owner_session');
      if (ownerSession) {
        const session = JSON.parse(ownerSession);
        if (session.owner) return 'farm_owner';
      }

      // فحص جلسة المدير
      const adminSession = localStorage.getItem('admin_session');
      if (adminSession) {
        const session = JSON.parse(adminSession);
        if (session.admin) return 'admin';
      }

      // زائر (غير مسجل دخول)
      return 'visitor';
    } catch (error) {
      console.error('Error detecting user type:', error);
      return 'unknown';
    }
  },

  /**
   * الحصول على سياق الصفحة الحالية
   */
  getPageContext(): string {
    const path = window.location.pathname;
    const hash = window.location.hash;

    // صفحات المستثمر
    if (path.includes('/investor') || hash.includes('investor')) {
      return 'منصة المستثمر - لوحة التحكم';
    }

    // صفحات صاحب المزرعة
    if (path.includes('/farm-owner') || hash.includes('farm-owner')) {
      return 'منصة أصحاب المزارع - لوحة التحكم';
    }

    // صفحات الحجوزات
    if (path.includes('/bookings') || hash.includes('bookings') || hash.includes('reservations')) {
      return 'صفحة الحجوزات';
    }

    // صفحات المزارع
    if (path.includes('/farms') || hash.includes('farms')) {
      return 'صفحة المزارع المتاحة';
    }

    // صفحة الشهادات
    if (path.includes('/certificate') || hash.includes('certificate')) {
      return 'صفحة شهادة الانتفاع';
    }

    // المنصة العامة
    if (path === '/' || path === '/index.html' || hash === '' || hash === '#/') {
      return 'الصفحة الرئيسية للمنصة';
    }

    // افتراضي
    return 'منصة تأجير المزارع الموسمية';
  },

  /**
   * توليد رابط مع معلومات إضافية مخصصة
   */
  async generateLinkWithInfo(
    userType: UserType,
    context: string,
    additionalInfo?: Record<string, any>
  ): Promise<GeneratedLink> {
    return await this.generateBusinessLink({
      userType,
      context,
      timestamp: new Date(),
      additionalInfo
    });
  },

  /**
   * توليد رابط سريع بناءً على السياق الحالي
   */
  async generateQuickLink(customContext?: string): Promise<string> {
    const userType = this.getCurrentUserType();
    const context = customContext || this.getPageContext();

    const result = await this.generateBusinessLink({
      userType,
      context,
      timestamp: new Date()
    });

    return result.fullLink;
  },

  /**
   * معاينة الرسالة قبل التوليد
   */
  async previewMessage(data: HybridMessageData): Promise<string> {
    const baseMessage = await systemSettingsService.getBusinessWhatsAppMessage();
    const autoData = this.generateAutoData(data);
    return this.mergeMessages(baseMessage, autoData);
  }
};
