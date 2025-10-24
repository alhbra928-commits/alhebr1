import { supabase } from '../../../lib/supabase';

export interface VerifiedCertificate {
  id: string;
  certificate_code: string;
  investor_name: string;
  farm_name: string;
  farm_type: string;
  farm_location: string;
  reserved_trees: number;
  total_price: number;
  created_at: string;
  status: string;
  is_valid: boolean;
}

export class CertificateVerificationService {
  static async verifyCertificate(certificateCode: string): Promise<VerifiedCertificate | null> {
    try {
      const searchCode = certificateCode.trim();
      console.log('🔍 البحث عن الشهادة:', searchCode);

      // البحث في جدول documentation مع join للمزرعة
      const { data, error } = await supabase
        .from('documentation')
        .select(`
          id,
          certificate_code,
          investor_name,
          reserved_trees,
          total_price,
          certificate_generated_at,
          status,
          deleted_at,
          farms:farm_id (
            name_ar,
            farm_type,
            city,
            region
          )
        `)
        .eq('certificate_code', searchCode)
        .is('deleted_at', null)
        .maybeSingle();

      console.log('📋 نتيجة البحث:', data);
      console.log('❌ خطأ البحث:', error);

      if (error) {
        console.error('Error verifying certificate:', error);
        return null;
      }

      if (!data) {
        // محاولة البحث في جميع السجلات لفهم المشكلة
        const { data: allCerts } = await supabase
          .from('documentation')
          .select('certificate_code')
          .limit(10);

        console.log('📝 جميع أرقام الشهادات الموجودة:', allCerts);
        return null;
      }

      const farm = Array.isArray(data.farms) ? data.farms[0] : data.farms;
      const isValid = data.deleted_at === null && (data.status === 'documented' || data.status === 'verified');

      return {
        id: data.id,
        certificate_code: data.certificate_code,
        investor_name: data.investor_name,
        farm_name: farm?.name_ar || 'غير محدد',
        farm_type: farm?.farm_type || 'غير محدد',
        farm_location: `${farm?.city || ''}, ${farm?.region || 'المملكة العربية السعودية'}`,
        reserved_trees: data.reserved_trees,
        total_price: data.total_price,
        created_at: data.certificate_generated_at,
        status: data.status,
        is_valid: isValid
      };
    } catch (err) {
      console.error('Unexpected error:', err);
      return null;
    }
  }
}
