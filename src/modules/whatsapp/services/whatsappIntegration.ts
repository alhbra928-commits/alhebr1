import { whatsappService } from './whatsappService';

/**
 * خدمة التكامل المركزية للواتساب
 * تربط جميع الإدارات بنظام الواتساب بشكل تلقائي
 */

export class WhatsAppIntegration {
  /**
   * إرسال إشعار عند الموافقة على الحجز
   */
  static async notifyBookingApproved(booking: {
    id: string;
    customer_name: string;
    customer_phone: string;
    farm_name: string;
    reserved_trees: number;
    total_amount: number;
  }): Promise<void> {
    try {
      await whatsappService.sendBookingConfirmation({
        customer_name: booking.customer_name || 'عزيزي العميل',
        customer_phone: booking.customer_phone,
        farm_name: booking.farm_name || 'المزرعة',
        tree_count: booking.reserved_trees,
        total_amount: booking.total_amount,
        booking_id: booking.id
      });
      console.log(`✅ تم إرسال إشعار واتساب للحجز ${booking.id}`);
    } catch (error) {
      console.error('⚠️ فشل إرسال إشعار الواتساب:', error);
      throw error;
    }
  }

  /**
   * إرسال إشعار عند إصدار شهادة الملكية
   */
  static async notifyCertificateIssued(certificate: {
    customer_name: string;
    customer_phone: string;
    verification_token: string;
    reserved_trees: number;
  }): Promise<void> {
    try {
      await whatsappService.sendCertificateNotification({
        customer_name: certificate.customer_name || 'عزيزي العميل',
        customer_phone: certificate.customer_phone,
        certificate_number: certificate.verification_token,
        tree_count: certificate.reserved_trees
      });
      console.log(`✅ تم إرسال إشعار شهادة الملكية عبر الواتساب`);
    } catch (error) {
      console.error('⚠️ فشل إرسال إشعار الشهادة:', error);
      throw error;
    }
  }

  /**
   * إرسال إشعار عند قبول دفعة
   */
  static async notifyPaymentReceived(payment: {
    customer_name: string;
    customer_phone: string;
    amount: number;
    payment_date: string;
  }): Promise<void> {
    try {
      await whatsappService.sendPaymentConfirmation({
        customer_name: payment.customer_name || 'عزيزي العميل',
        customer_phone: payment.customer_phone,
        amount: payment.amount,
        payment_date: payment.payment_date
      });
      console.log(`✅ تم إرسال إشعار استلام الدفعة عبر الواتساب`);
    } catch (error) {
      console.error('⚠️ فشل إرسال إشعار الدفعة:', error);
      throw error;
    }
  }

  /**
   * إرسال إشعار تسوية مالية لصاحب المزرعة
   */
  static async notifySettlementCompleted(settlement: {
    owner_name: string;
    owner_phone: string;
    amount: number;
    settlement_date: string;
  }): Promise<void> {
    try {
      await whatsappService.sendMessage({
        recipient_phone: settlement.owner_phone,
        recipient_name: settlement.owner_name,
        recipient_type: 'farm_owner',
        template_code: 'SETTLEMENT_COMPLETED',
        variables: {
          owner_name: settlement.owner_name,
          amount: settlement.amount.toString(),
          settlement_date: settlement.settlement_date
        },
        trigger_event: 'settlement_completed'
      });
      console.log(`✅ تم إرسال إشعار التسوية عبر الواتساب`);
    } catch (error) {
      console.error('⚠️ فشل إرسال إشعار التسوية:', error);
      throw error;
    }
  }

  /**
   * إرسال رسالة ترحيبية لمستثمر جديد
   */
  static async sendWelcomeMessage(investor: {
    name: string;
    phone: string;
  }): Promise<void> {
    try {
      await whatsappService.sendMessage({
        recipient_phone: investor.phone,
        recipient_name: investor.name,
        recipient_type: 'investor',
        template_code: 'WELCOME_MESSAGE',
        variables: {},
        trigger_event: 'investor_registered'
      });
      console.log(`✅ تم إرسال رسالة ترحيبية عبر الواتساب`);
    } catch (error) {
      console.error('⚠️ فشل إرسال الرسالة الترحيبية:', error);
      throw error;
    }
  }

  /**
   * إرسال تذكير بالدفع
   */
  static async sendPaymentReminder(reminder: {
    customer_name: string;
    customer_phone: string;
    amount: number;
  }): Promise<void> {
    try {
      await whatsappService.sendMessage({
        recipient_phone: reminder.customer_phone,
        recipient_name: reminder.customer_name,
        recipient_type: 'investor',
        template_code: 'PAYMENT_REMINDER',
        variables: {
          customer_name: reminder.customer_name,
          amount: reminder.amount.toString()
        },
        trigger_event: 'payment_reminder'
      });
      console.log(`✅ تم إرسال تذكير الدفع عبر الواتساب`);
    } catch (error) {
      console.error('⚠️ فشل إرسال تذكير الدفع:', error);
      throw error;
    }
  }

  /**
   * إرسال رسالة مخصصة
   */
  static async sendCustomMessage(params: {
    recipient_phone: string;
    recipient_name: string;
    recipient_type: 'investor' | 'farm_owner' | 'admin';
    message: string;
  }): Promise<void> {
    try {
      await whatsappService.sendMessage({
        recipient_phone: params.recipient_phone,
        recipient_name: params.recipient_name,
        recipient_type: params.recipient_type,
        template_code: 'CUSTOM_MESSAGE',
        variables: { message: params.message },
        trigger_event: 'custom_message'
      });
      console.log(`✅ تم إرسال رسالة مخصصة عبر الواتساب`);
    } catch (error) {
      console.error('⚠️ فشل إرسال الرسالة المخصصة:', error);
      throw error;
    }
  }

  /**
   * التحقق من تفعيل النظام قبل الإرسال
   */
  static async isEnabled(): Promise<boolean> {
    try {
      const settings = await whatsappService.getSettings();
      return settings?.is_active || false;
    } catch (error) {
      console.error('Error checking WhatsApp status:', error);
      return false;
    }
  }

  /**
   * wrapper آمن لإرسال الرسائل (لا يفشل العملية الأساسية)
   */
  static async sendSafe(
    sendFunction: () => Promise<void>,
    context: string
  ): Promise<boolean> {
    try {
      const enabled = await this.isEnabled();
      if (!enabled) {
        console.log(`ℹ️ نظام الواتساب غير مفعّل - ${context}`);
        return false;
      }

      await sendFunction();
      return true;
    } catch (error) {
      console.error(`⚠️ فشل إرسال واتساب - ${context}:`, error);
      return false;
    }
  }
}

// Export كـ singleton
export const whatsappIntegration = WhatsAppIntegration;
