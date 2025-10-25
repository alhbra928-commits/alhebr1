import { supabase } from '../../lib/supabase';

export interface Documentation {
  id: string;
  booking_id: string;
  booking_code: string;
  certificate_code: string;
  farm_id: string;
  farm_code: string;
  investor_id: string;
  investor_name: string;
  reserved_trees: number;
  total_price: number;
  certificate_pdf_url?: string;
  certificate_generated_at: string;
  verification_token: string;
  qr_code_url?: string;
  status: 'documented' | 'verified' | 'archived';
  created_at: string;
  updated_at: string;
  farm?: any;
  investor?: any;
}

export interface InvestorCertificate {
  id: string;
  investor_id: string;
  documentation_id: string;
  certificate_code: string;
  farm_code: string;
  is_viewed: boolean;
  viewed_at?: string;
  download_count: number;
  created_at: string;
  documentation?: Documentation;
}

export class DocumentationService {
  static async getAll(): Promise<Documentation[]> {
    const { data, error } = await supabase
      .from('documentation')
      .select(`
        *,
        farms:farm_id(id, farm_code, name_ar, farm_type, region, city),
        investors:investor_id(id, full_name, phone, email)
      `)
      .order('created_at', { ascending: false });

    console.log('📋 جلب جميع التوثيقات:', {
      count: data?.length || 0,
      data: data,
      error: error
    });

    if (error) {
      console.error('Error fetching documentation:', error);
      throw error;
    }

    return data || [];
  }

  static async getById(id: string): Promise<Documentation | null> {
    const { data, error } = await supabase
      .from('documentation')
      .select(`
        *,
        farms:farm_id(*),
        investors:investor_id(*)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching documentation:', error);
      throw error;
    }

    return data;
  }

  static async getByCertificateCode(code: string): Promise<Documentation | null> {
    const { data, error } = await supabase
      .from('documentation')
      .select('*')
      .eq('certificate_code', code)
      .maybeSingle();

    if (error) {
      console.error('Error fetching documentation by code:', error);
      throw error;
    }

    return data;
  }

  static async getByVerificationToken(token: string): Promise<Documentation | null> {
    const { data, error } = await supabase
      .from('documentation')
      .select(`
        *,
        farms:farm_id(*),
        investors:investor_id(*)
      `)
      .eq('verification_token', token)
      .maybeSingle();

    if (error) {
      console.error('Error fetching documentation by token:', error);
      throw error;
    }

    return data;
  }

  static async updateCertificatePDF(id: string, pdfUrl: string, qrUrl?: string): Promise<void> {
    const updates: any = {
      certificate_pdf_url: pdfUrl,
      certificate_generated_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (qrUrl) {
      updates.qr_code_url = qrUrl;
    }

    const { error } = await supabase
      .from('documentation')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  }

  static async updateStatus(
    id: string,
    status: 'documented' | 'verified' | 'archived'
  ): Promise<Documentation> {
    const { data, error } = await supabase
      .from('documentation')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Documentation;
  }

  static async generateCertificateQR(
    certificateCode: string,
    verificationToken: string
  ): Promise<string> {
    const verificationUrl = `${window.location.origin}/verify/${verificationToken}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(verificationUrl)}`;

    return qrCodeUrl;
  }

  static async getInvestorCertificates(investorId: string): Promise<InvestorCertificate[]> {
    const { data, error } = await supabase
      .from('investor_certificates')
      .select(`
        *,
        documentation:documentation_id(*)
      `)
      .eq('investor_id', investorId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching investor certificates:', error);
      throw error;
    }

    return data || [];
  }

  static async markCertificateAsViewed(id: string): Promise<void> {
    const { error } = await supabase
      .from('investor_certificates')
      .update({
        is_viewed: true,
        viewed_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
  }

  static async incrementDownloadCount(id: string): Promise<void> {
    const { data: current } = await supabase
      .from('investor_certificates')
      .select('download_count')
      .eq('id', id)
      .single();

    if (current) {
      const { error } = await supabase
        .from('investor_certificates')
        .update({
          download_count: (current.download_count || 0) + 1
        })
        .eq('id', id);

      if (error) throw error;
    }
  }

  static async getStatistics() {
    const { data, error } = await supabase
      .from('documentation')
      .select('status, total_price, reserved_trees');

    if (error) {
      console.error('Error fetching documentation statistics:', error);
      return {
        total: 0,
        documented: 0,
        verified: 0,
        archived: 0,
        totalAmount: 0,
        totalTrees: 0
      };
    }

    return {
      total: data.length,
      documented: data.filter(d => d.status === 'documented').length,
      verified: data.filter(d => d.status === 'verified').length,
      archived: data.filter(d => d.status === 'archived').length,
      totalAmount: data.reduce((sum, d) => sum + Number(d.total_price), 0),
      totalTrees: data.reduce((sum, d) => sum + d.reserved_trees, 0)
    };
  }

  static async getMigrationLog() {
    const { data, error } = await supabase
      .from('migration_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching migration log:', error);
      throw error;
    }

    return data || [];
  }

  static formatPrice(price: number): string {
    return `${price.toLocaleString('ar-SA')} ريال`;
  }

  static getStatusColor(status: string): string {
    const colorMap: { [key: string]: string } = {
      documented: 'bg-blue-100 text-blue-700 border-blue-400',
      verified: 'bg-green-100 text-green-700 border-green-400',
      archived: 'bg-gray-100 text-gray-700 border-gray-400'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-700 border-gray-400';
  }

  static getStatusLabel(status: string): string {
    const labelMap: { [key: string]: string } = {
      documented: 'موثّق',
      verified: 'مُتحقق منه',
      archived: 'مؤرشف'
    };
    return labelMap[status] || status;
  }

  static async deletePermanently(id: string, reason: string = 'حذف من لوحة التحكم'): Promise<void> {
    console.log('🗑️ محاولة حذف شهادة:', id);

    try {
      const { data, error } = await supabase
        .rpc('delete_documentation_permanently', {
          p_documentation_id: id,
          p_reason: reason
        });

      if (error) {
        console.error('❌ خطأ في حذف الشهادة:', error);
        throw new Error(`فشل حذف الشهادة: ${error.message}`);
      }

      console.log('✅ تم حذف الشهادة بنجاح:', data);
      console.log('📦 معرف النسخة الاحتياطية:', data?.backup_id);

      return data;
    } catch (err: any) {
      console.error('❌ خطأ في عملية الحذف:', err);
      throw new Error(err.message || 'حدث خطأ في حذف الشهادة');
    }
  }
}
