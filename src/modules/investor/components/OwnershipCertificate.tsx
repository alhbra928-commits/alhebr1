import { Award, Shield, CheckCircle2, MapPin, Calendar, Trees } from 'lucide-react';

interface OwnershipCertificateProps {
  certificate: {
    id: string;
    certificate_code: string;
    farm_name: string;
    farm_type: string;
    farm_location: string;
    investor_name: string;
    reserved_trees: number;
    total_price: number;
    created_at: string;
  };
}

export function OwnershipCertificate({ certificate }: OwnershipCertificateProps) {
  const hijriDate = new Date(certificate.created_at).toLocaleDateString('ar-SA-u-ca-islamic', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const gregorianDate = new Date(certificate.created_at).toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <>
      <style>{`
        /* Print Styles - الأولوية للطباعة */
        @page {
          size: A4 portrait;
          margin: 10mm;
        }

        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }

          @page {
            size: A4;
            margin: 15mm;
          }

          html, body {
            margin: 0;
            padding: 0;
            overflow: visible;
          }

          #certificate-print {
            width: 100% !important;
            max-width: none !important;
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
            box-sizing: border-box !important;
            border: none !important;
            box-shadow: none !important;
            page-break-inside: avoid !important;
          }

          /* تصغير جذري للطباعة */
          .cert-logo {
            width: 50px !important;
            height: 50px !important;
            margin: 0 auto 8px !important;
          }

          .cert-title {
            font-size: 18pt !important;
            margin: 0 0 4px !important;
          }

          .cert-subtitle {
            font-size: 9pt !important;
            margin: 0 0 10px !important;
          }

          .cert-intro {
            font-size: 10pt !important;
            margin: 0 0 10px !important;
          }

          .cert-name {
            font-size: 14pt !important;
            padding: 8px 12px !important;
            margin: 0 auto 10px !important;
          }

          .cert-trees-container {
            margin: 10px 0 !important;
          }

          .cert-trees-number {
            font-size: 18pt !important;
            padding: 6px 12px !important;
          }

          .cert-trees-label {
            font-size: 11pt !important;
          }

          .cert-farm-name {
            font-size: 13pt !important;
            margin: 8px 0 12px !important;
          }

          .cert-info-cards {
            display: flex !important;
            justify-content: space-between !important;
            gap: 8px !important;
            margin: 12px 0 !important;
          }

          .cert-info-card {
            flex: 1 !important;
            padding: 8px 6px !important;
            font-size: 8pt !important;
          }

          .cert-info-label {
            font-size: 7pt !important;
            margin: 4px 0 !important;
          }

          .cert-info-value {
            font-size: 9pt !important;
          }

          .cert-signature-section {
            display: flex !important;
            justify-content: space-around !important;
            margin: 12px 0 !important;
          }

          .cert-seal {
            width: 50px !important;
            height: 50px !important;
            margin: 0 auto 6px !important;
          }

          .cert-sig-label {
            font-size: 9pt !important;
            margin: 4px 0 2px !important;
          }

          .cert-sig-sublabel {
            font-size: 7pt !important;
          }

          .cert-footer {
            padding: 8px !important;
            font-size: 7pt !important;
            margin-top: 12px !important;
          }

          .cert-icon-small {
            width: 14px !important;
            height: 14px !important;
          }

          .cert-icon-tiny {
            width: 10px !important;
            height: 10px !important;
          }
        }

        /* Screen Styles - جوال ودسكتوب */
        @media screen {
          #certificate-print {
            max-width: 800px;
            margin: 20px auto;
            padding: 30px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          }

          .cert-logo {
            width: 80px;
            height: 80px;
            margin: 0 auto 15px;
          }

          .cert-title {
            font-size: 28px;
            margin: 0 0 8px;
          }

          .cert-subtitle {
            font-size: 14px;
            margin: 0 0 20px;
          }

          .cert-intro {
            font-size: 16px;
            margin: 0 0 15px;
          }

          .cert-name {
            font-size: 22px;
            padding: 15px 25px;
            margin: 0 auto 20px;
            max-width: 400px;
          }

          .cert-trees-container {
            margin: 20px 0;
          }

          .cert-trees-number {
            font-size: 32px;
            padding: 12px 20px;
          }

          .cert-trees-label {
            font-size: 18px;
          }

          .cert-farm-name {
            font-size: 20px;
            margin: 15px 0 25px;
          }

          .cert-info-cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin: 25px 0;
          }

          .cert-info-card {
            padding: 15px;
          }

          .cert-info-label {
            font-size: 12px;
            margin: 8px 0 4px;
          }

          .cert-info-value {
            font-size: 14px;
          }

          .cert-signature-section {
            display: flex;
            justify-content: space-around;
            margin: 30px 0;
            gap: 20px;
          }

          .cert-seal {
            width: 80px;
            height: 80px;
            margin: 0 auto 10px;
          }

          .cert-sig-label {
            font-size: 14px;
            margin: 8px 0 4px;
          }

          .cert-sig-sublabel {
            font-size: 12px;
          }

          .cert-footer {
            padding: 15px;
            font-size: 12px;
            margin-top: 25px;
          }

          .cert-icon-small {
            width: 24px;
            height: 24px;
          }

          .cert-icon-tiny {
            width: 16px;
            height: 16px;
          }
        }

        /* Mobile Styles */
        @media screen and (max-width: 640px) {
          #certificate-print {
            margin: 10px;
            padding: 20px;
          }

          .cert-logo {
            width: 60px;
            height: 60px;
          }

          .cert-title {
            font-size: 22px;
          }

          .cert-name {
            font-size: 18px;
            padding: 12px 20px;
          }

          .cert-trees-number {
            font-size: 26px;
          }

          .cert-trees-label {
            font-size: 16px;
          }

          .cert-info-cards {
            grid-template-columns: 1fr;
            gap: 10px;
          }

          .cert-signature-section {
            flex-direction: column;
            gap: 15px;
          }
        }
      `}</style>

      <div id="certificate-print" style={{
        border: '3px solid #d4af37',
        boxSizing: 'border-box'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          <div className="cert-logo" style={{
            border: '2px solid #d4af37',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #fdfbf7, #f8f5ed)'
          }}>
            <Trees className="cert-icon-small" style={{ color: '#d4af37' }} />
          </div>

          <h1 className="cert-title" style={{
            fontWeight: 'bold',
            color: '#d4af37',
            letterSpacing: '1px'
          }}>
            شهادة تملك
          </h1>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '8px'
          }}>
            <div style={{ width: '40px', height: '1px', background: '#d4af37' }}></div>
            <Shield className="cert-icon-tiny" style={{ color: '#d4af37' }} />
            <div style={{ width: '40px', height: '1px', background: '#d4af37' }}></div>
          </div>

          <p className="cert-subtitle" style={{ color: '#666' }}>
            Ownership Certificate
          </p>
        </div>

        {/* Body */}
        <div>
          <p className="cert-intro" style={{
            textAlign: 'center',
            color: '#333',
            lineHeight: '1.4'
          }}>
            تشهد <strong style={{ color: '#d4af37' }}>منصة النخيل والزيتون</strong> بأن السيد / السيدة
          </p>

          <div className="cert-name" style={{
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(212,175,55,0.1), rgba(212,175,55,0.05))',
            border: '2px solid #d4af37',
            borderRadius: '8px',
            fontWeight: 'bold',
            color: '#d4af37'
          }}>
            {certificate.investor_name}
          </div>

          <p style={{
            fontSize: '14px',
            textAlign: 'center',
            color: '#333',
            margin: '10px 0'
          }}>
            مالك لعدد
          </p>

          <div className="cert-trees-container" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px'
          }}>
            <div className="cert-trees-number" style={{
              background: 'linear-gradient(135deg, #fdfbf7, #f8f5ed)',
              border: '2px solid #d4af37',
              borderRadius: '8px',
              fontWeight: 'bold',
              color: '#d4af37'
            }}>
              {certificate.reserved_trees.toLocaleString('ar-SA')}
            </div>
            <span className="cert-trees-label" style={{ fontWeight: 'bold', color: '#333' }}>
              شجرة {certificate.farm_type}
            </span>
          </div>

          <p style={{
            fontSize: '14px',
            textAlign: 'center',
            color: '#333',
            margin: '10px 0 5px'
          }}>
            في مزرعة
          </p>

          <p className="cert-farm-name" style={{
            fontWeight: 'bold',
            textAlign: 'center',
            color: '#d4af37'
          }}>
            {certificate.farm_name}
          </p>
        </div>

        {/* Info Cards */}
        <div className="cert-info-cards">
          <div className="cert-info-card" style={{
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(212,175,55,0.05), rgba(255,255,255,0.5))',
            border: '1px solid rgba(212,175,55,0.3)',
            borderRadius: '6px'
          }}>
            <MapPin className="cert-icon-tiny" style={{ color: '#d4af37', margin: '0 auto' }} />
            <p className="cert-info-label" style={{ color: '#666' }}>الموقع</p>
            <p className="cert-info-value" style={{ fontWeight: 'bold', color: '#333' }}>
              {certificate.farm_location || 'السعودية'}
            </p>
          </div>

          <div className="cert-info-card" style={{
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(212,175,55,0.05), rgba(255,255,255,0.5))',
            border: '1px solid rgba(212,175,55,0.3)',
            borderRadius: '6px'
          }}>
            <Award className="cert-icon-tiny" style={{ color: '#d4af37', margin: '0 auto' }} />
            <p className="cert-info-label" style={{ color: '#666' }}>رقم الشهادة</p>
            <p className="cert-info-value" style={{ fontWeight: 'bold', color: '#333', wordBreak: 'break-all' }}>
              {certificate.certificate_code}
            </p>
          </div>

          <div className="cert-info-card" style={{
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(212,175,55,0.05), rgba(255,255,255,0.5))',
            border: '1px solid rgba(212,175,55,0.3)',
            borderRadius: '6px'
          }}>
            <Calendar className="cert-icon-tiny" style={{ color: '#d4af37', margin: '0 auto' }} />
            <p className="cert-info-label" style={{ color: '#666' }}>تاريخ الإصدار</p>
            <p className="cert-info-value" style={{ fontWeight: 'bold', color: '#333', marginBottom: '4px' }}>
              {gregorianDate}
            </p>
            <p style={{ fontSize: '11px', color: '#666' }}>
              {hijriDate}
            </p>
          </div>
        </div>

        {/* Separator */}
        <div style={{
          height: '1px',
          background: 'linear-gradient(to right, transparent, #d4af37, transparent)',
          margin: '20px 0'
        }}></div>

        {/* Signature & Seal */}
        <div className="cert-signature-section">
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{
              fontSize: '24px',
              color: '#d4af37',
              opacity: 0.6,
              marginBottom: '8px',
              fontFamily: 'cursive'
            }}>
              _______
            </div>
            <p className="cert-sig-label" style={{ fontWeight: 'bold', color: '#333' }}>
              توقيع المدير العام
            </p>
            <p className="cert-sig-sublabel" style={{ color: '#666' }}>
              General Manager Signature
            </p>
          </div>

          <div style={{ textAlign: 'center', flex: 1 }}>
            <div className="cert-seal" style={{
              borderRadius: '50%',
              border: '2px solid #d4af37',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'radial-gradient(circle, rgba(212,175,55,0.1), rgba(212,175,55,0.05))'
            }}>
              <CheckCircle2 style={{ width: '30px', height: '30px', color: '#d4af37' }} />
              <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#d4af37', marginTop: '4px' }}>معتمد</span>
            </div>
            <p className="cert-sig-label" style={{ fontWeight: 'bold', color: '#333' }}>
              الختم الرسمي
            </p>
            <p className="cert-sig-sublabel" style={{ color: '#666' }}>
              Official Seal
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="cert-footer" style={{
          background: 'linear-gradient(135deg, rgba(212,175,55,0.05), rgba(255,255,255,0.3))',
          border: '1px dashed rgba(212,175,55,0.3)',
          borderRadius: '6px',
          textAlign: 'center',
          color: '#666',
          lineHeight: '1.5'
        }}>
          هذه الشهادة صادرة من منصة النخيل والزيتون وتعتبر وثيقة رسمية تثبت ملكية الأشجار المذكورة.
          للتحقق من صحتها، يرجى زيارة موقعنا الإلكتروني.
        </div>
      </div>
    </>
  );
}
