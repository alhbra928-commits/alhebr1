import { supabase } from '../../../lib/supabase';

export interface InvestorReservation {
  id: string;
  farm_id: string;
  farm_name: string;
  farm_type: string;
  number_of_trees: number;
  total_amount: number;
  status: string;
  payment_status: string;
  reservation_date: string;
  created_at: string;
}

export interface InvestorStats {
  totalFarms: number;
  totalReservations: number;
  totalTrees: number;
  totalAmount: number;
  pendingReservations: number;
  completedReservations: number;
}

export interface InvestorTimeline {
  id: string;
  event_type: string;
  title: string;
  description: string;
  date: string;
  icon: string;
}

export interface LoginCheckResult {
  exists: boolean;
  requiresOTP: boolean;
  isFirstLogin: boolean;
  sessionToken?: string;
}

export interface LoginAttemptData {
  phone: string;
  ip_address?: string;
  user_agent?: string;
  device_type?: string;
  login_type: string;
  otp_entered?: string;
  success: boolean;
  failure_reason?: string;
}

const DEMO_MODE = true;
const DEMO_OTP = '4821';

export class InvestorService {
  static normalizePhone(phone: string): string {
    if (!phone) return phone;

    let normalized = phone.trim();

    if (normalized.startsWith('+966')) {
      normalized = normalized.substring(4);
    } else if (normalized.startsWith('966')) {
      normalized = normalized.substring(3);
    } else if (normalized.startsWith('00966')) {
      normalized = normalized.substring(5);
    }

    if (normalized.startsWith('0')) {
      normalized = normalized.substring(1);
    }

    normalized = normalized.replace(/\s/g, '');

    return normalized;
  }
  static async getInvestorByPhone(phone: string): Promise<any> {
    try {
      const normalizedPhone = this.normalizePhone(phone);
      console.log('[InvestorService] getInvestorByPhone - Original:', phone, 'Normalized:', normalizedPhone);

      const { data: investor, error: investorError } = await supabase
        .from('investors')
        .select('*')
        .eq('phone', normalizedPhone)
        .is('deleted_at', null)
        .maybeSingle();

      if (investorError) throw investorError;

      if (investor) {
        return {
          customer_name: investor.full_name,
          customer_phone: investor.phone
        };
      }

      const { data: reservation, error: reservationError } = await supabase
        .from('reservations')
        .select('customer_name, customer_phone')
        .eq('customer_phone', normalizedPhone)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .maybeSingle();

      if (reservationError) throw reservationError;
      return reservation;
    } catch (error) {
      console.error('Error fetching investor:', error);
      throw error;
    }
  }

  static async getInvestorReservations(phone: string): Promise<InvestorReservation[]> {
    try {
      const normalizedPhone = this.normalizePhone(phone);
      console.log('[InvestorService] getInvestorReservations - Original:', phone, 'Normalized:', normalizedPhone);

      console.log('🔍 [getInvestorReservations] Starting query...');
      console.log('   → customer_phone:', normalizedPhone);

      const { data, error } = await supabase
        .from('reservations')
        .select(`
          id,
          farm_id,
          number_of_trees,
          total_amount,
          status,
          payment_status,
          booking_status,
          reservation_date,
          created_at,
          farms(
            name_ar,
            farm_type
          )
        `)
        .eq('customer_phone', normalizedPhone)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      console.log('📊 [getInvestorReservations] Query result:');
      console.log('   → data:', data);
      console.log('   → error:', error);
      console.log('   → count:', data?.length || 0);

      if (error) {
        console.error('❌ [getInvestorReservations] Error:', error);
        throw error;
      }

      console.log(`✅ Loaded ${data?.length || 0} active reservations for phone: ${normalizedPhone}`);

      return (data || []).map((r: any) => ({
        id: r.id,
        farm_id: r.farm_id,
        farm_name: r.farms?.name_ar || 'مزرعة',
        farm_type: r.farms?.farm_type || 'نخيل',
        number_of_trees: r.number_of_trees,
        total_amount: r.total_amount,
        status: r.status,
        payment_status: r.payment_status,
        booking_status: r.booking_status || r.status,
        reservation_date: r.reservation_date,
        created_at: r.created_at
      }));
    } catch (error) {
      console.error('Error fetching reservations:', error);
      throw error;
    }
  }

  static async getInvestorStats(phone: string): Promise<InvestorStats> {
    try {
      const reservations = await this.getInvestorReservations(phone);

      const uniqueFarms = new Set(reservations.map(r => r.farm_id));
      const totalTrees = reservations.reduce((sum, r) => sum + r.number_of_trees, 0);
      const totalAmount = reservations.reduce((sum, r) => sum + parseFloat(r.total_amount.toString()), 0);
      const pendingReservations = reservations.filter(r => r.status === 'pending').length;
      const completedReservations = reservations.filter(r => r.status === 'completed').length;

      return {
        totalFarms: uniqueFarms.size,
        totalReservations: reservations.length,
        totalTrees,
        totalAmount,
        pendingReservations,
        completedReservations
      };
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  }

  static async getInvestorTimeline(phone: string): Promise<InvestorTimeline[]> {
    try {
      const reservations = await this.getInvestorReservations(phone);

      const timeline: InvestorTimeline[] = reservations.map(r => ({
        id: r.id,
        event_type: 'reservation',
        title: `حجز جديد في ${r.farm_name}`,
        description: `تم حجز ${r.number_of_trees} شجرة بقيمة ${r.total_amount.toLocaleString('ar-SA')} ر.س`,
        date: r.created_at,
        icon: '📋'
      }));

      return timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
      console.error('Error fetching timeline:', error);
      throw error;
    }
  }

  static async getInvestorFarms(phone: string): Promise<any[]> {
    try {
      const reservations = await this.getInvestorReservations(phone);
      const farmMap = new Map();

      reservations.forEach(r => {
        if (farmMap.has(r.farm_id)) {
          const existing = farmMap.get(r.farm_id);
          existing.total_trees += r.number_of_trees;
          existing.total_amount += parseFloat(r.total_amount.toString());
        } else {
          farmMap.set(r.farm_id, {
            farm_id: r.farm_id,
            farm_name: r.farm_name,
            farm_type: r.farm_type,
            total_trees: r.number_of_trees,
            total_amount: parseFloat(r.total_amount.toString()),
            status: r.status
          });
        }
      });

      return Array.from(farmMap.values());
    } catch (error) {
      console.error('Error fetching farms:', error);
      throw error;
    }
  }

  static async getInvestorCertificates(phone: string): Promise<any[]> {
    try {
      const normalizedPhone = this.normalizePhone(phone);
      console.log('[InvestorService] getInvestorCertificates - Original:', phone, 'Normalized:', normalizedPhone);

      // 🔍 البحث عن المستثمر بناءً على رقم الهاتف
      const { data: investor } = await supabase
        .from('investors')
        .select('id')
        .eq('phone', normalizedPhone)
        .is('deleted_at', null)
        .maybeSingle();

      if (!investor) {
        console.log('No investor found for phone:', phone);
        return [];
      }

      // 📜 جلب جميع الشهادات للمستثمر
      const { data, error } = await supabase
        .from('documentation')
        .select(`
          id,
          certificate_code,
          booking_id,
          farm_id,
          investor_name,
          reserved_trees,
          total_price,
          status,
          created_at,
          certificate_generated_at,
          verification_token,
          farms!inner(
            name_ar,
            farm_type,
            location
          )
        `)
        .eq('investor_id', investor.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching certificates:', error);
        throw error;
      }

      console.log(`✅ Loaded ${data?.length || 0} certificates for investor: ${phone}`);

      return (data || []).map((cert: any) => ({
        id: cert.id,
        certificate_code: cert.certificate_code,
        booking_id: cert.booking_id,
        farm_id: cert.farm_id,
        farm_name: cert.farms?.name_ar || 'مزرعة',
        farm_type: cert.farms?.farm_type || 'نخيل',
        farm_location: cert.farms?.location || '',
        investor_name: cert.investor_name,
        reserved_trees: cert.reserved_trees,
        total_price: cert.total_price,
        status: cert.status,
        created_at: cert.created_at,
        certificate_generated_at: cert.certificate_generated_at,
        verification_token: cert.verification_token
      }));
    } catch (error) {
      console.error('Error fetching certificates:', error);
      throw error;
    }
  }

  static async checkLoginStatus(phone: string): Promise<LoginCheckResult> {
    try {
      console.log('🔍🔍🔍 [checkLoginStatus] CALLED WITH:', phone);
      const normalizedPhone = this.normalizePhone(phone);
      console.log('✅✅✅ [checkLoginStatus] NORMALIZED TO:', normalizedPhone);
      console.log('[InvestorService] checkLoginStatus - Original:', phone, 'Normalized:', normalizedPhone);

      // 1️⃣ فحص الجلسات النشطة أولاً
      const { data: activeSessions } = await supabase
        .from('investor_sessions')
        .select('*')
        .eq('phone', normalizedPhone)
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .order('started_at', { ascending: false })
        .limit(1);

      const hasActiveSession = activeSessions && activeSessions.length > 0;

      if (hasActiveSession) {
        console.log('[InvestorService] ✅ Found active session');
        return {
          exists: true,
          requiresOTP: false,
          isFirstLogin: false,
          sessionToken: activeSessions[0].session_token
        };
      }

      // 2️⃣ التحقق من وجود حجوزات أو مستثمر في النظام
      const [investorCheck, reservationCheck] = await Promise.all([
        supabase
          .from('investors')
          .select('id')
          .eq('phone', normalizedPhone)
          .is('deleted_at', null)
          .maybeSingle(),
        supabase
          .from('reservations')
          .select('id')
          .eq('customer_phone', normalizedPhone)
          .is('deleted_at', null)
          .maybeSingle()
      ]);

      const hasInvestorRecord = !!investorCheck.data;
      const hasReservation = !!reservationCheck.data;
      const existsInSystem = hasInvestorRecord || hasReservation;

      console.log('[InvestorService] Check results:', {
        hasInvestorRecord,
        hasReservation,
        existsInSystem,
        investorData: investorCheck.data,
        reservationData: reservationCheck.data
      });

      // 3️⃣ إذا لم يكن موجوداً في النظام، لا يمكنه الدخول
      if (!existsInSystem) {
        console.log('[InvestorService] ❌ User not found in system');
        return {
          exists: false,
          requiresOTP: false,
          isFirstLogin: false
        };
      }

      // 4️⃣ فحص الجلسات السابقة لتحديد نوع الدخول
      const { data: previousSessions } = await supabase
        .from('investor_sessions')
        .select('id')
        .eq('phone', normalizedPhone)
        .limit(1);

      const isFirstLogin = !previousSessions || previousSessions.length === 0;

      console.log('[InvestorService] ✅ User exists, isFirstLogin:', isFirstLogin);

      return {
        exists: true,
        requiresOTP: !isFirstLogin,
        isFirstLogin
      };
    } catch (error) {
      console.error('Error checking login status:', error);
      throw error;
    }
  }

  static async verifyOTP(phone: string, otp: string): Promise<boolean> {
    if (DEMO_MODE) {
      return otp === DEMO_OTP;
    }

    return false;
  }

  static async createSession(phone: string, isFirstLogin: boolean): Promise<string> {
    try {
      const normalizedPhone = this.normalizePhone(phone);
      console.log('[InvestorService] createSession - Original:', phone, 'Normalized:', normalizedPhone);

      const sessionToken = this.generateSessionToken();
      const deviceType = this.detectDeviceType();

      const { error } = await supabase
        .from('investor_sessions')
        .insert([{
          phone: normalizedPhone,
          session_token: sessionToken,
          ip_address: null,
          user_agent: navigator.userAgent,
          device_type: deviceType,
          is_active: true,
          is_first_login: isFirstLogin,
          otp_required: !isFirstLogin,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        }]);

      if (error) throw error;

      console.log('[InvestorService] ✅ Session created successfully');
      return sessionToken;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  }

  static async logLoginAttempt(data: LoginAttemptData): Promise<void> {
    try {
      const normalizedPhone = this.normalizePhone(data.phone);
      const deviceType = this.detectDeviceType();

      await supabase
        .from('investor_login_attempts')
        .insert([{
          phone: normalizedPhone,
          ip_address: data.ip_address,
          user_agent: navigator.userAgent,
          device_type: deviceType,
          login_type: data.login_type,
          otp_entered: data.otp_entered,
          success: data.success,
          failure_reason: data.failure_reason
        }]);
    } catch (error) {
      console.error('Error logging login attempt:', error);
    }
  }

  static async invalidateSession(sessionToken: string): Promise<void> {
    try {
      await supabase
        .from('investor_sessions')
        .update({
          is_active: false,
          ended_at: new Date().toISOString()
        })
        .eq('session_token', sessionToken);
    } catch (error) {
      console.error('Error invalidating session:', error);
      throw error;
    }
  }

  private static generateSessionToken(): string {
    return `investor_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  private static detectDeviceType(): string {
    const userAgent = navigator.userAgent.toLowerCase();

    if (/mobile|android|iphone|ipad|ipod/.test(userAgent)) {
      return 'mobile';
    } else if (/tablet/.test(userAgent)) {
      return 'tablet';
    } else {
      return 'desktop';
    }
  }

  static getDemoOTP(): string {
    return DEMO_MODE ? DEMO_OTP : '';
  }

  static isDemoMode(): boolean {
    return DEMO_MODE;
  }

  /**
   * إنشاء حساب مستثمر جديد مباشرة (بدون حجز)
   */
  static async createDirectAccount(
    phone: string,
    fullName: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const normalizedPhone = this.normalizePhone(phone);
      console.log('🔵 بدء إنشاء حساب مستثمر جديد:', { phone, normalizedPhone, fullName });

      // التحقق من عدم وجود الحساب
      const existingInvestor = await this.getInvestorByPhone(phone);
      if (existingInvestor) {
        console.log('⚠️ الحساب موجود مسبقاً');
        return { success: false, error: 'هذا الرقم مسجل مسبقاً' };
      }

      console.log('✅ الحساب غير موجود، جاري الإنشاء...');

      // إنشاء مستثمر جديد في جدول investors
      const { data: investor, error: investorError } = await supabase
        .from('investors')
        .insert({
          phone: normalizedPhone,
          full_name: fullName,
          status: 'قيد_الانتظار'
        })
        .select()
        .single();

      if (investorError) {
        console.error('❌ خطأ في إنشاء المستثمر:', investorError);
        throw investorError;
      }

      console.log('✅ تم إنشاء حساب المستثمر بنجاح:', investor);

      // إنشاء جلسة للمستثمر
      const sessionToken = Math.random().toString(36).substring(2);
      const { error: sessionError } = await supabase
        .from('investor_sessions')
        .insert({
          investor_id: investor.id,
          phone: normalizedPhone,
          session_token: sessionToken,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          is_active: true
        });

      if (sessionError) {
        console.error('⚠️ خطأ في إنشاء الجلسة:', sessionError);
      } else {
        console.log('✅ تم إنشاء الجلسة بنجاح');
      }

      return { success: true };
    } catch (error: any) {
      console.error('❌ خطأ في إنشاء حساب المستثمر:', error);
      return {
        success: false,
        error: error.message || 'فشل إنشاء الحساب'
      };
    }
  }
}
