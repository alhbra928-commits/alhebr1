import { supabase } from '../../../lib/supabase';

export interface PaymentReceipt {
  id: string;
  reservation_id: string;
  investor_id: string | null;
  bank_name: string;
  amount: number;
  transfer_date: string;
  receipt_file_url: string;
  receipt_file_name: string;
  notes: string | null;
  status: 'pending' | 'verified' | 'rejected';
  verified_by: string | null;
  verified_at: string | null;
  verification_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreatePaymentReceiptParams {
  reservationId: string;
  investorId: string | null;
  bankName: string;
  amount: number;
  transferDate: string;
  receiptFileUrl: string;
  receiptFileName: string;
  notes?: string;
}

export class PaymentReceiptService {
  static async uploadReceipt(params: CreatePaymentReceiptParams): Promise<PaymentReceipt> {
    console.log('📤 Uploading payment receipt:', params);

    const { data, error } = await supabase
      .from('payment_receipts')
      .insert([{
        reservation_id: params.reservationId,
        investor_id: params.investorId,
        bank_name: params.bankName,
        amount: params.amount,
        transfer_date: params.transferDate,
        receipt_file_url: params.receiptFileUrl,
        receipt_file_name: params.receiptFileName,
        notes: params.notes || null,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('❌ Error uploading receipt:', error);
      throw error;
    }

    console.log('✅ Receipt uploaded successfully:', data.id);

    const { error: updateError } = await supabase
      .from('reservations')
      .update({
        booking_status: 'pending_verification',
        updated_at: new Date().toISOString()
      })
      .eq('id', params.reservationId);

    if (updateError) {
      console.error('⚠️ Warning: Failed to update booking status:', updateError);
    } else {
      console.log('✅ Booking status updated to pending_verification');
    }

    return data as PaymentReceipt;
  }

  static async getReceiptsByReservation(reservationId: string): Promise<PaymentReceipt[]> {
    console.log('📥 Fetching receipts for reservation:', reservationId);

    const { data, error } = await supabase
      .from('payment_receipts_summary')
      .select('*')
      .eq('reservation_id', reservationId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching receipts:', error);
      throw error;
    }

    console.log('✅ Loaded receipts:', data?.length || 0);
    return data || [];
  }

  static async getReceiptsByInvestor(investorId: string): Promise<PaymentReceipt[]> {
    const { data, error } = await supabase
      .from('payment_receipts_summary')
      .select('*')
      .eq('investor_id', investorId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching investor receipts:', error);
      throw error;
    }

    return data || [];
  }

  static async getReceiptById(receiptId: string): Promise<PaymentReceipt | null> {
    console.log('📥 Fetching full receipt:', receiptId);

    const { data, error } = await supabase
      .from('payment_receipts')
      .select('*')
      .eq('id', receiptId)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) {
      console.error('❌ Error fetching receipt:', error);
      throw error;
    }

    console.log('✅ Loaded full receipt');
    return data;
  }

  static async getPendingReceipts(): Promise<PaymentReceipt[]> {
    const { data, error } = await supabase
      .from('payment_receipts_summary')
      .select(`
        *,
        reservations:reservation_id(
          id,
          customer_name,
          customer_phone,
          number_of_trees,
          total_amount,
          farms:farm_id(name_ar, farm_code)
        )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching pending receipts:', error);
      throw error;
    }

    return data || [];
  }

  static async verifyReceipt(
    receiptId: string,
    verifiedBy: string,
    verificationNotes?: string
  ): Promise<PaymentReceipt> {
    console.log('✅ Starting verifyReceipt:', { receiptId, verifiedBy });

    // verified_by field is UUID, but we pass string 'admin' from UI
    // So we set it to null for now (admin users table should be used properly)
    const { data, error } = await supabase
      .from('payment_receipts')
      .update({
        status: 'verified',
        verified_by: null, // TODO: Use actual admin user UUID from session
        verified_at: new Date().toISOString(),
        verification_notes: verificationNotes || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', receiptId)
      .select()
      .single();

    if (error) {
      console.error('❌ Error verifying receipt:', error);
      throw new Error(`فشل اعتماد الإيصال: ${error.message}`);
    }

    console.log('✅ Receipt verified successfully:', data);
    return data as PaymentReceipt;
  }

  static async rejectReceipt(
    receiptId: string,
    verifiedBy: string,
    verificationNotes: string
  ): Promise<PaymentReceipt> {
    console.log('🔄 PaymentReceiptService.rejectReceipt() called:', {
      receiptId,
      verifiedBy,
      verificationNotes
    });

    // First, check current receipt
    const { data: currentReceipt, error: fetchError } = await supabase
      .from('payment_receipts')
      .select('*')
      .eq('id', receiptId)
      .single();

    if (fetchError) {
      console.error('❌ Error fetching receipt:', fetchError);
      throw new Error('فشل جلب بيانات الإيصال');
    }

    console.log('📋 Current receipt before rejection:', currentReceipt);

    const { data, error } = await supabase
      .from('payment_receipts')
      .update({
        status: 'rejected',
        verified_by: null, // TODO: Use actual admin user UUID from session
        verified_at: new Date().toISOString(),
        verification_notes: verificationNotes,
        updated_at: new Date().toISOString()
      })
      .eq('id', receiptId)
      .select()
      .single();

    if (error) {
      console.error('❌ Error rejecting receipt:', error);
      console.error('❌ Error code:', error.code);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error details:', error.details);
      throw new Error(`فشل رفض الإيصال: ${error.message}`);
    }

    if (!data) {
      console.error('❌ No data returned after update');
      throw new Error('فشل تحديث الإيصال - لم ترجع البيانات');
    }

    console.log('✅ Receipt rejected successfully:', data);
    return data as PaymentReceipt;
  }

  static getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'pending': 'بانتظار التحقق',
      'verified': 'تم التحقق',
      'rejected': 'مرفوض'
    };
    return labels[status] || status;
  }

  static getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'pending': '#f59e0b',
      'verified': '#10b981',
      'rejected': '#ef4444'
    };
    return colors[status] || '#6b7280';
  }

  static async uploadFileToStorage(file: File): Promise<string> {
    try {
      // Generate unique filename
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8);
      const fileExt = file.name.split('.').pop();
      const fileName = `receipt_${timestamp}_${randomStr}.${fileExt}`;
      const filePath = `payment-receipts/${fileName}`;

      console.log('📤 Uploading file to storage:', {
        fileName,
        size: file.size,
        type: file.type
      });

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('receipts')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('❌ Storage upload error:', error);
        throw new Error(`storage: ${error.message}`);
      }

      console.log('✅ File uploaded successfully:', data.path);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('receipts')
        .getPublicUrl(filePath);

      console.log('🔗 Public URL generated:', urlData.publicUrl);

      return urlData.publicUrl;
    } catch (error: any) {
      console.error('❌ Error in uploadFileToStorage:', error);
      throw error;
    }
  }
}
