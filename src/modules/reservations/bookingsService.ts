import { supabase } from '../../lib/supabase';

export interface Booking {
  id: string;
  booking_code: string;
  farm_id: string;
  investor_id: string;
  farm_code?: string;
  investor_name: string;
  investor_mobile: string;
  investor_email?: string;
  reserved_trees: number;
  total_price: number;
  payment_status: 'pending' | 'partial' | 'completed';
  payment_amount: number;
  booking_status: 'pending' | 'approved' | 'rejected' | 'documented';
  booking_date: string;
  approved_at?: string;
  approved_by?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  farm?: any;
  investor?: any;
}

export interface CreateBookingParams {
  farm_id: string;
  investor_id: string;
  investor_name: string;
  investor_mobile: string;
  investor_email?: string;
  reserved_trees: number;
  total_price: number;
  notes?: string;
}

export class BookingsService {
  static async getAll(limit: number = 100, offset: number = 0): Promise<{ data: Booking[], count: number }> {
    console.log('📥 BookingsService.getAll() called - limit:', limit, 'offset:', offset);

    const { data: reservationsData, error: reservationsError, count } = await supabase
      .from('reservations')
      .select(`
        id,
        customer_name,
        customer_phone,
        farm_id,
        number_of_trees,
        total_amount,
        status,
        payment_status,
        booking_status,
        reservation_date,
        created_at,
        farms:farm_id(id, farm_code, name_ar, farm_type)
      `, { count: 'exact' })
      .is('deleted_at', null)
      .neq('booking_status', 'documented')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    console.log('📊 Reservations data:', {
      count: reservationsData?.length,
      error: reservationsError
    });

    if (reservationsError) {
      console.error('Error fetching reservations:', reservationsError);
      throw reservationsError;
    }

    // تحويل بيانات reservations إلى شكل Booking (بدون جلب الأصناف للسرعة)
    const convertedReservations: Booking[] = (reservationsData || []).map((res) => {
        const bookingCode = `RES-${res.id.substring(0, 8)}`;

        return {
          id: res.id,
          booking_code: bookingCode,
          farm_id: res.farm_id,
          investor_id: res.investor_id || '',
          farm_code: res.farms?.farm_code,
          farm_name: res.farms?.name_ar,
          investor_name: res.customer_name || 'غير معروف',
          investor_mobile: res.customer_phone || '',
          investor_email: '',
          reserved_trees: res.number_of_trees || 0,
          total_price: Number(res.total_amount) || 0,
          payment_status: res.payment_status as any || 'pending',
          payment_amount: 0,
          booking_status: this.mapReservationStatus(res.status),
          booking_date: res.reservation_date || res.created_at,
          notes: '',
          created_at: res.created_at,
          updated_at: res.updated_at || res.created_at,
          deleted_at: res.deleted_at,
          farm: res.farms
        };
      });

    console.log('✅ Converted reservations (excluding documented):', convertedReservations.length);

    // قراءة من جدول bookings (إن وُجد)
    // نستثني الحجوزات الموثقة (documented) لأنها انتقلت إلى إدارة التوثيق
    const { data: bookingsData, error: bookingsError } = await supabase
      .from('bookings')
      .select(`
        *,
        farms:farm_id(id, farm_code, name_ar, farm_type, region, city),
        investors:investor_id(id, full_name, phone, email)
      `)
      .is('deleted_at', null)
      .neq('booking_status', 'documented')
      .order('created_at', { ascending: false });

    console.log('📊 Bookings data:', {
      count: bookingsData?.length,
      error: bookingsError
    });

    const allBookings = [...convertedReservations, ...(bookingsData || [])];

    console.log('✅ Combined total:', allBookings.length);

    return { data: allBookings, count: count || 0 };
  }

  // دالة مساعدة لتحويل status من reservations إلى booking_status
  private static mapReservationStatus(status: string): 'pending' | 'approved' | 'rejected' | 'documented' {
    const statusMap: { [key: string]: 'pending' | 'approved' | 'rejected' | 'documented' } = {
      'pending': 'pending',
      'pending_contact': 'pending',
      'approved': 'approved',
      'confirmed': 'approved',
      'rejected': 'rejected',
      'cancelled': 'rejected',
      'documented': 'documented',
      'completed': 'documented'
    };
    return statusMap[status] || 'pending';
  }

  static async getById(id: string): Promise<Booking | null> {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        farms:farm_id(*),
        investors:investor_id(*)
      `)
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) {
      console.error('Error fetching booking:', error);
      throw error;
    }

    return data;
  }

  static async getByStatus(status: string): Promise<Booking[]> {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        farms:farm_id(id, farm_code, name_ar),
        investors:investor_id(id, full_name, phone)
      `)
      .eq('booking_status', status)
      .is('deleted_at', null)
      .order('created_at', { ascending: false});

    if (error) {
      console.error('Error fetching bookings by status:', error);
      throw error;
    }

    return data || [];
  }

  static async create(params: CreateBookingParams): Promise<Booking> {
    const farm = await supabase
      .from('farms')
      .select('farm_code')
      .eq('id', params.farm_id)
      .maybeSingle();

    const { data, error } = await supabase
      .from('bookings')
      .insert([{
        farm_id: params.farm_id,
        investor_id: params.investor_id,
        farm_code: farm.data?.farm_code,
        investor_name: params.investor_name,
        investor_mobile: params.investor_mobile,
        investor_email: params.investor_email,
        reserved_trees: params.reserved_trees,
        total_price: params.total_price,
        payment_status: 'pending',
        payment_amount: 0,
        booking_status: 'pending',
        notes: params.notes,
        booking_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating booking:', error);
      throw error;
    }

    return data as Booking;
  }

  static async updateStatus(
    id: string,
    status: 'pending' | 'approved' | 'rejected' | 'documented',
    approvedBy?: string
  ): Promise<Booking> {
    console.log('📝 BookingsService.updateStatus() called:', { id, status });

    // تحويل booking_status إلى status المناسب لجدول reservations
    const reservationStatusMap: { [key: string]: string } = {
      'pending': 'pending',
      'approved': 'confirmed',
      'rejected': 'cancelled',
      'documented': 'completed'
    };

    const reservationStatus = reservationStatusMap[status] || status;

    // تحويل إلى booking_status الجديد
    const bookingStatusMap: { [key: string]: string } = {
      'pending': 'temporary',
      'approved': 'approved',
      'rejected': 'rejected',
      'documented': 'documented'
    };

    const bookingStatus = bookingStatusMap[status] || status;

    // محاولة التحديث في جدول reservations أولاً
    const updateData: any = {
      status: reservationStatus,
      booking_status: bookingStatus,
      updated_at: new Date().toISOString()
    };

    console.log('📝 Updating reservation with data:', updateData);

    const { data: resData, error: resError } = await supabase
      .from('reservations')
      .update(updateData)
      .eq('id', id)
      .is('deleted_at', null)
      .select(`
        *,
        farms:farm_id(id, farm_code, name_ar, farm_type, region, city)
      `)
      .maybeSingle();

    if (!resError && resData) {
      console.log('✅ Updated reservation successfully');

      // تحويل البيانات المحدثة إلى شكل Booking
      const bookingCode = `RES-${resData.id.substring(0, 8)}`;
      const convertedBooking: Booking = {
        id: resData.id,
        booking_code: bookingCode,
        farm_id: resData.farm_id,
        investor_id: resData.investor_id || '',
        farm_code: resData.farms?.farm_code,
        investor_name: resData.customer_name || 'غير معروف',
        investor_mobile: resData.customer_phone || '',
        investor_email: '',
        reserved_trees: resData.number_of_trees || 0,
        total_price: Number(resData.total_amount) || 0,
        payment_status: resData.payment_status as any || 'pending',
        payment_amount: 0,
        booking_status: status,
        booking_date: resData.reservation_date || resData.created_at,
        notes: '',
        created_at: resData.created_at,
        updated_at: resData.updated_at || resData.created_at,
        deleted_at: resData.deleted_at,
        farm: resData.farms
      };

      return convertedBooking;
    }

    console.log('⚠️ Not found in reservations, trying bookings table');

    // إذا لم يوجد في reservations، حاول في bookings
    const updates: any = {
      booking_status: status,
      updated_at: new Date().toISOString()
    };

    if (status === 'approved') {
      updates.approved_at = new Date().toISOString();
      updates.approved_by = approvedBy;
    }

    const { data, error } = await supabase
      .from('bookings')
      .update(updates)
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating booking:', error);
      throw error;
    }

    console.log('✅ Updated booking successfully');
    return data as Booking;
  }

  static async updatePayment(
    id: string,
    paymentAmount: number,
    paymentStatus: 'pending' | 'partial' | 'completed'
  ): Promise<Booking> {
    console.log('💰 BookingsService.updatePayment() called:', { id, paymentAmount, paymentStatus });

    // محاولة التحديث في جدول reservations أولاً
    const { data: resData, error: resError } = await supabase
      .from('reservations')
      .update({
        payment_status: paymentStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .is('deleted_at', null)
      .select(`
        *,
        farms:farm_id(id, farm_code, name_ar, farm_type, region, city)
      `)
      .maybeSingle();

    if (!resError && resData) {
      console.log('✅ Updated reservation payment successfully');

      // تحويل البيانات المحدثة إلى شكل Booking
      const bookingCode = `RES-${resData.id.substring(0, 8)}`;
      const convertedBooking: Booking = {
        id: resData.id,
        booking_code: bookingCode,
        farm_id: resData.farm_id,
        investor_id: resData.investor_id || '',
        farm_code: resData.farms?.farm_code,
        investor_name: resData.customer_name || 'غير معروف',
        investor_mobile: resData.customer_phone || '',
        investor_email: '',
        reserved_trees: resData.number_of_trees || 0,
        total_price: Number(resData.total_amount) || 0,
        payment_status: resData.payment_status as any || 'pending',
        payment_amount: paymentAmount,
        booking_status: this.mapReservationStatus(resData.status),
        booking_date: resData.reservation_date || resData.created_at,
        notes: '',
        created_at: resData.created_at,
        updated_at: resData.updated_at || resData.created_at,
        deleted_at: resData.deleted_at,
        farm: resData.farms
      };

      return convertedBooking;
    }

    console.log('⚠️ Not found in reservations, trying bookings table');

    // إذا لم يوجد في reservations، حاول في bookings
    const { data, error } = await supabase
      .from('bookings')
      .update({
        payment_amount: paymentAmount,
        payment_status: paymentStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating payment:', error);
      throw error;
    }

    console.log('✅ Updated booking payment successfully');
    return data as Booking;
  }

  static async delete(id: string): Promise<void> {
    console.log('🗑️ BookingsService.delete() called:', id);

    // محاولة الحذف من reservations أولاً
    const { error: resError } = await supabase
      .from('reservations')
      .update({
        deleted_at: new Date().toISOString()
      })
      .eq('id', id);

    if (!resError) {
      console.log('✅ Deleted reservation successfully');
      return;
    }

    console.log('⚠️ Not found in reservations, trying bookings table');

    // إذا لم يوجد في reservations، حاول في bookings
    const { error } = await supabase
      .from('bookings')
      .update({
        deleted_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('❌ Error deleting booking:', error);
      throw error;
    }

    console.log('✅ Deleted booking successfully');
  }

  static async migrateToDocumentation(
    bookingId: string,
    migratedBy?: string
  ): Promise<string> {
    console.log('📋 BookingsService.migrateToDocumentation() called:', { bookingId, migratedBy });

    try {
      // جلب معلومات الحجز للتشخيص
      const { data: bookingData, error: fetchError } = await supabase
        .from('reservations')
        .select('*')
        .eq('id', bookingId)
        .maybeSingle();

      if (fetchError) {
        throw new Error('فشل في جلب بيانات الحجز: ' + fetchError.message);
      }

      if (!bookingData) {
        throw new Error('الحجز غير موجود');
      }

      // محاولة إصدار الشهادة
      const { data, error } = await supabase.rpc('auto_migrate_to_documentation', {
        p_booking_id: bookingId,
        p_migrated_by: null,
        p_migration_reason: 'Certificate issued by admin'
      });

      if (error) {
        // إنشاء تقرير تشخيصي مفصل
        const diagnosticReport = this.generateDiagnosticReport(bookingData, error);
        console.error('❌ Error migrating to documentation:', diagnosticReport);
        throw new Error(diagnosticReport);
      }

      console.log('✅ Successfully migrated to documentation, ID:', data);
      return data;
    } catch (error: any) {
      throw error;
    }
  }

  private static generateDiagnosticReport(bookingData: any, error: any): string {
    const report = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║                   🔍 DIAGNOSTIC REPORT - CERTIFICATE ISSUANCE ERROR          ║
╚═══════════════════════════════════════════════════════════════════════════════╝

📋 BOOKING INFORMATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Booking ID: ${bookingData.id}
Customer Name: ${bookingData.customer_name}
Customer Phone: ${bookingData.customer_phone}
Number of Trees: ${bookingData.number_of_trees}
Total Amount: ${bookingData.total_amount} SAR

📊 BOOKING STATUS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Booking Status: ${bookingData.booking_status}
Payment Status: ${bookingData.payment_status}
Reservation Status: ${bookingData.status}
Deleted: ${bookingData.deleted_at ? 'YES (SOFT DELETED)' : 'NO'}

✅ REQUIREMENTS CHECK:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${this.checkRequirement('Booking Status', bookingData.booking_status, ['verified', 'approved'], bookingData.booking_status === 'verified' || bookingData.booking_status === 'approved')}
${this.checkRequirement('Payment Status', bookingData.payment_status, ['completed'], bookingData.payment_status === 'completed')}
${this.checkRequirement('Not Documented', bookingData.booking_status, ['NOT documented'], bookingData.booking_status !== 'documented')}
${this.checkRequirement('Not Deleted', bookingData.deleted_at, ['NULL'], !bookingData.deleted_at)}

❌ ERROR DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Error Message: ${error.message}
Error Code: ${error.code || 'N/A'}
Error Hint: ${error.hint || 'N/A'}
Error Details: ${error.details || 'N/A'}

🔧 TROUBLESHOOTING STEPS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${this.generateTroubleshootingSteps(bookingData, error)}

📝 SQL QUERY TO DEBUG:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SELECT
  id,
  booking_status,
  payment_status,
  status,
  deleted_at,
  customer_name,
  CASE
    WHEN deleted_at IS NOT NULL THEN '❌ DELETED'
    WHEN booking_status NOT IN ('verified', 'approved') THEN '❌ Wrong booking_status: ' || booking_status
    WHEN payment_status != 'completed' THEN '❌ Wrong payment_status: ' || payment_status
    WHEN booking_status = 'documented' THEN '❌ Already documented'
    ELSE '✅ READY'
  END as readiness_check
FROM reservations
WHERE id = '${bookingData.id}';

📋 RPC CALL PARAMETERS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
p_booking_id: ${bookingData.id}
p_migrated_by: NULL
p_migration_reason: 'Certificate issued by admin'

🔒 SECURITY CHECK:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${this.generateSecurityCheck(error)}

═══════════════════════════════════════════════════════════════════════════════
📧 COPY THIS ENTIRE REPORT AND PASTE IT TO THE DEVELOPER
═══════════════════════════════════════════════════════════════════════════════
`;
    return report;
  }

  private static checkRequirement(name: string, actual: any, expected: string[], isPassing: boolean): string {
    const status = isPassing ? '✅' : '❌';
    const actualStr = actual === null ? 'NULL' : actual;
    const expectedStr = expected.join(' OR ');
    return `${status} ${name}: ${actualStr} (Expected: ${expectedStr})`;
  }

  private static generateTroubleshootingSteps(bookingData: any, error: any): string {
    const steps: string[] = [];
    let stepNumber = 1;

    // تحقق من حالة الحجز
    if (bookingData.booking_status !== 'verified' && bookingData.booking_status !== 'approved') {
      steps.push(`${stepNumber}. ❌ ISSUE: booking_status is '${bookingData.booking_status}'`);
      steps.push(`   → SOLUTION: Update booking_status to 'approved' or 'verified'`);
      steps.push(`   → SQL: UPDATE reservations SET booking_status = 'approved' WHERE id = '${bookingData.id}';`);
      stepNumber++;
    }

    // تحقق من حالة الدفع
    if (bookingData.payment_status !== 'completed') {
      steps.push(`${stepNumber}. ❌ ISSUE: payment_status is '${bookingData.payment_status}'`);
      steps.push(`   → SOLUTION: Update payment_status to 'completed'`);
      steps.push(`   → SQL: UPDATE reservations SET payment_status = 'completed' WHERE id = '${bookingData.id}';`);
      stepNumber++;
    }

    // تحقق من الحذف
    if (bookingData.deleted_at) {
      steps.push(`${stepNumber}. ❌ ISSUE: Booking is soft-deleted (deleted_at = ${bookingData.deleted_at})`);
      steps.push(`   → SOLUTION: Restore the booking`);
      steps.push(`   → SQL: UPDATE reservations SET deleted_at = NULL WHERE id = '${bookingData.id}';`);
      stepNumber++;
    }

    // تحقق من التوثيق المسبق
    if (bookingData.booking_status === 'documented') {
      steps.push(`${stepNumber}. ❌ ISSUE: Booking already documented`);
      steps.push(`   → SOLUTION: Check if certificate already exists`);
      steps.push(`   → SQL: SELECT * FROM documentation WHERE booking_id = '${bookingData.id}';`);
      stepNumber++;
    }

    // تحقق من RLS
    if (error.message.includes('row-level security') || error.message.includes('policy')) {
      steps.push(`${stepNumber}. ❌ ISSUE: RLS Policy violation`);
      steps.push(`   → SOLUTION: Check if function has SECURITY DEFINER`);
      steps.push(`   → SQL: SELECT proname, prosecdef FROM pg_proc WHERE proname = 'auto_migrate_to_documentation';`);
      steps.push(`   → Expected: prosecdef = true`);
      stepNumber++;
    }

    // تحقق من صلاحيات التنفيذ
    if (error.message.includes('permission denied')) {
      steps.push(`${stepNumber}. ❌ ISSUE: Permission denied`);
      steps.push(`   → SOLUTION: Grant execute permissions`);
      steps.push(`   → SQL: GRANT EXECUTE ON FUNCTION auto_migrate_to_documentation TO anon, authenticated;`);
      stepNumber++;
    }

    if (steps.length === 0) {
      steps.push('✅ All basic requirements are met.');
      steps.push('   → Check database logs for more details');
      steps.push('   → Error might be in the function logic itself');
    }

    return steps.join('\n');
  }

  private static generateSecurityCheck(error: any): string {
    const checks: string[] = [];

    if (error.message.includes('row-level security')) {
      checks.push('❌ RLS Policy Issue Detected');
      checks.push('   → The function might not have SECURITY DEFINER attribute');
      checks.push('   → Or RLS policies on documentation table are too restrictive');
      checks.push('   → Check: SELECT * FROM pg_policies WHERE tablename = \'documentation\';');
    } else if (error.message.includes('permission denied')) {
      checks.push('❌ Permission Issue Detected');
      checks.push('   → User might not have EXECUTE permission on the function');
      checks.push('   → Check: SELECT has_function_privilege(\'anon\', \'auto_migrate_to_documentation(uuid,uuid,text)\', \'EXECUTE\');');
    } else {
      checks.push('✅ No obvious security issues detected');
      checks.push('   → Issue might be in business logic or data validation');
    }

    return checks.join('\n');
  }

  static async getStatistics() {
    console.log('📊 BookingsService.getStatistics() called');

    const { count: total } = await supabase
      .from('reservations')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null);

    const { count: pending } = await supabase
      .from('reservations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')
      .is('deleted_at', null);

    const { count: approved } = await supabase
      .from('reservations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved')
      .is('deleted_at', null);

    const { count: rejected } = await supabase
      .from('reservations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'rejected')
      .is('deleted_at', null);

    const { count: documented } = await supabase
      .from('reservations')
      .select('*', { count: 'exact', head: true })
      .eq('booking_status', 'documented')
      .is('deleted_at', null);

    return {
      total: total || 0,
      pending: pending || 0,
      approved: approved || 0,
      rejected: rejected || 0,
      documented: documented || 0,
      totalAmount: 0,
      totalTrees: 0,
      pendingPayment: 0,
      partialPayment: 0,
      completedPayment: 0
    };
  }

  static formatPrice(price: number): string {
    return `${price.toLocaleString('ar-SA')} ريال`;
  }

  static getStatusColor(status: string): string {
    const colorMap: { [key: string]: string } = {
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-400',
      approved: 'bg-green-100 text-green-700 border-green-400',
      rejected: 'bg-red-100 text-red-700 border-red-400',
      documented: 'bg-blue-100 text-blue-700 border-blue-400'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-700 border-gray-400';
  }

  static getStatusLabel(status: string): string {
    const labelMap: { [key: string]: string } = {
      pending: 'قيد الانتظار',
      approved: 'موافق عليه',
      rejected: 'مرفوض',
      documented: 'موثّق'
    };
    return labelMap[status] || status;
  }

  static getPaymentStatusColor(status: string): string {
    const colorMap: { [key: string]: string } = {
      pending: 'bg-orange-100 text-orange-700',
      partial: 'bg-yellow-100 text-yellow-700',
      completed: 'bg-green-100 text-green-700'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-700';
  }

  static getPaymentStatusLabel(status: string): string {
    const labelMap: { [key: string]: string } = {
      pending: 'لم يدفع',
      partial: 'دفع جزئي',
      completed: 'مدفوع كاملاً'
    };
    return labelMap[status] || status;
  }

  static async approve(id: string): Promise<void> {
    console.log('✅ [approve] Approving booking:', id);

    const { data, error } = await supabase
      .from('reservations')
      .update({
        status: 'approved',
        booking_status: 'approved',
        approved_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();

    if (error) {
      console.error('❌ [approve] Error:', error);
      throw error;
    }

    console.log('✅ [approve] Success, updated rows:', data?.length);
  }

  static async reject(id: string): Promise<void> {
    console.log('❌ [reject] Rejecting booking:', id);

    const { data, error } = await supabase
      .from('reservations')
      .update({
        status: 'rejected',
        booking_status: 'rejected'
      })
      .eq('id', id)
      .select();

    if (error) {
      console.error('❌ [reject] Error:', error);
      throw error;
    }

    console.log('✅ [reject] Success, updated rows:', data?.length);
  }

  static async issueCertificate(id: string): Promise<void> {
    console.log('📜 [issueCertificate] Issuing certificate for:', id);

    const { data, error } = await supabase
      .from('reservations')
      .update({
        status: 'documented',
        booking_status: 'documented'
      })
      .eq('id', id)
      .select();

    if (error) {
      console.error('❌ [issueCertificate] Error:', error);
      throw error;
    }

    console.log('✅ [issueCertificate] Success, updated rows:', data?.length);
  }

  static async deletePermanently(id: string): Promise<void> {
    console.log('🗑️ [deletePermanently] Deleting booking:', id);

    const { error } = await supabase
      .from('reservations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ [deletePermanently] Error:', error);
      throw error;
    }

    console.log('✅ [deletePermanently] Success');
  }
}
