import { Award, Shield, CheckCircle2, MapPin, Calendar, Trees } from 'lucide-react';
import { brandColors } from '../../finance/styles/brandColors';

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
        @page {
          size: A4 portrait;
          margin: 0;
        }

        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }

          html, body {
            width: 210mm;
            height: 297mm;
            margin: 0;
            padding: 0;
            overflow: hidden;
          }

          body * {
            visibility: hidden;
          }

          .certificate-print-area,
          .certificate-print-area * {
            visibility: visible;
          }

          .certificate-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 210mm !important;
            height: 297mm !important;
            max-height: 297mm !important;
            margin: 0 !important;
            padding: 8mm !important;
            box-sizing: border-box !important;
            background: white !important;
            overflow: hidden !important;
            page-break-inside: avoid !important;
            page-break-after: avoid !important;
            page-break-before: avoid !important;
          }
        }

        @media screen {
          .certificate-print-area {
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto;
            padding: 8mm;
            box-sizing: border-box;
            background: white;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
          }
        }
      `}</style>

      <div className="certificate-print-area" style={{ border: '3px solid #d4af37' }}>
        {/* Header - مضغوط جداً */}
        <div style={{ textAlign: 'center', marginBottom: '4mm' }}>
          <div style={{
            width: '25mm',
            height: '25mm',
            margin: '0 auto 2mm',
            border: '2px solid #d4af37',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #fdfbf7, #f8f5ed)'
          }}>
            <Trees style={{ width: '12mm', height: '12mm', color: '#d4af37' }} />
          </div>

          <h1 style={{
            fontSize: '18pt',
            fontWeight: 'bold',
            color: '#d4af37',
            margin: '0 0 1mm',
            letterSpacing: '1px'
          }}>
            شهادة تملك
          </h1>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2mm',
            marginBottom: '1mm'
          }}>
            <div style={{ width: '15mm', height: '0.5px', background: '#d4af37' }}></div>
            <Shield style={{ width: '3mm', height: '3mm', color: '#d4af37' }} />
            <div style={{ width: '15mm', height: '0.5px', background: '#d4af37' }}></div>
          </div>

          <p style={{ fontSize: '8pt', color: '#666', margin: 0 }}>
            Ownership Certificate
          </p>
        </div>

        {/* Body - مضغوط */}
        <div style={{ marginBottom: '4mm' }}>
          <p style={{
            fontSize: '10pt',
            textAlign: 'center',
            color: '#333',
            margin: '0 0 2mm',
            lineHeight: '1.2'
          }}>
            تشهد <strong style={{ color: '#d4af37', fontSize: '11pt' }}>منصة النخيل والزيتون</strong> بأن السيد / السيدة
          </p>

          <div style={{
            textAlign: 'center',
            padding: '2mm 6mm',
            margin: '0 auto 2mm',
            maxWidth: '100mm',
            background: 'linear-gradient(135deg, rgba(212,175,55,0.1), rgba(212,175,55,0.05))',
            border: '1.5px solid #d4af37',
            borderRadius: '6px'
          }}>
            <p style={{
              fontSize: '14pt',
              fontWeight: 'bold',
              color: '#d4af37',
              margin: 0
            }}>
              {certificate.investor_name}
            </p>
          </div>

          <p style={{
            fontSize: '10pt',
            textAlign: 'center',
            color: '#333',
            margin: '0 0 2mm'
          }}>
            مالك لعدد
          </p>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3mm',
            marginBottom: '2mm'
          }}>
            <div style={{
              padding: '2mm 4mm',
              background: 'linear-gradient(135deg, #fdfbf7, #f8f5ed)',
              border: '1.5px solid #d4af37',
              borderRadius: '5px'
            }}>
              <span style={{
                fontSize: '16pt',
                fontWeight: 'bold',
                color: '#d4af37'
              }}>
                {certificate.reserved_trees.toLocaleString('ar-SA')}
              </span>
            </div>
            <span style={{ fontSize: '11pt', fontWeight: 'bold', color: '#333' }}>
              شجرة {certificate.farm_type}
            </span>
          </div>

          <p style={{
            fontSize: '10pt',
            textAlign: 'center',
            color: '#333',
            margin: '0 0 1mm'
          }}>
            في مزرعة
          </p>

          <p style={{
            fontSize: '13pt',
            fontWeight: 'bold',
            textAlign: 'center',
            color: '#d4af37',
            margin: '0 0 4mm'
          }}>
            {certificate.farm_name}
          </p>
        </div>

        {/* Info Cards - مضغوط */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '2mm',
          marginBottom: '4mm'
        }}>
          <div style={{
            textAlign: 'center',
            padding: '2mm',
            background: 'linear-gradient(135deg, rgba(212,175,55,0.05), rgba(255,255,255,0.5))',
            border: '1px solid rgba(212,175,55,0.2)',
            borderRadius: '5px'
          }}>
            <MapPin style={{ width: '5mm', height: '5mm', color: '#d4af37', margin: '0 auto 0.5mm' }} />
            <p style={{ fontSize: '7pt', color: '#666', margin: '0 0 0.5mm' }}>الموقع</p>
            <p style={{ fontSize: '8pt', fontWeight: 'bold', color: '#333', margin: 0 }}>
              {certificate.farm_location || 'السعودية'}
            </p>
          </div>

          <div style={{
            textAlign: 'center',
            padding: '2mm',
            background: 'linear-gradient(135deg, rgba(212,175,55,0.05), rgba(255,255,255,0.5))',
            border: '1px solid rgba(212,175,55,0.2)',
            borderRadius: '5px'
          }}>
            <Award style={{ width: '5mm', height: '5mm', color: '#d4af37', margin: '0 auto 0.5mm' }} />
            <p style={{ fontSize: '7pt', color: '#666', margin: '0 0 0.5mm' }}>رقم الشهادة</p>
            <p style={{ fontSize: '8pt', fontWeight: 'bold', color: '#333', margin: 0 }}>
              {certificate.certificate_code}
            </p>
          </div>

          <div style={{
            textAlign: 'center',
            padding: '2mm',
            background: 'linear-gradient(135deg, rgba(212,175,55,0.05), rgba(255,255,255,0.5))',
            border: '1px solid rgba(212,175,55,0.2)',
            borderRadius: '5px'
          }}>
            <Calendar style={{ width: '5mm', height: '5mm', color: '#d4af37', margin: '0 auto 0.5mm' }} />
            <p style={{ fontSize: '7pt', color: '#666', margin: '0 0 0.5mm' }}>تاريخ الإصدار</p>
            <p style={{ fontSize: '7.5pt', fontWeight: 'bold', color: '#333', margin: '0 0 0.5mm' }}>
              {gregorianDate}
            </p>
            <p style={{ fontSize: '6.5pt', color: '#666', margin: 0 }}>
              {hijriDate}
            </p>
          </div>
        </div>

        {/* Separator */}
        <div style={{
          height: '0.5px',
          background: 'linear-gradient(to right, transparent, #d4af37, transparent)',
          margin: '4mm 0'
        }}></div>

        {/* Signature & Seal - مضغوط */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '4mm',
          marginBottom: '4mm'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '20pt',
              color: '#d4af37',
              opacity: 0.6,
              marginBottom: '1mm',
              fontFamily: 'cursive'
            }}>
              _______
            </div>
            <p style={{ fontSize: '9pt', fontWeight: 'bold', color: '#333', margin: '0 0 0.5mm' }}>
              توقيع المدير العام
            </p>
            <p style={{ fontSize: '7pt', color: '#666', margin: 0 }}>
              General Manager Signature
            </p>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '22mm',
              height: '22mm',
              margin: '0 auto 1mm',
              borderRadius: '50%',
              border: '2px solid #d4af37',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'radial-gradient(circle, rgba(212,175,55,0.1), rgba(212,175,55,0.05))'
            }}>
              <CheckCircle2 style={{ width: '8mm', height: '8mm', color: '#d4af37' }} />
              <span style={{ fontSize: '7pt', fontWeight: 'bold', color: '#d4af37' }}>معتمد</span>
              <span style={{ fontSize: '6pt', color: '#666' }}>CERTIFIED</span>
            </div>
            <p style={{ fontSize: '9pt', fontWeight: 'bold', color: '#333', margin: '0 0 0.5mm' }}>
              الختم الرسمي
            </p>
            <p style={{ fontSize: '7pt', color: '#666', margin: 0 }}>
              Official Seal
            </p>
          </div>
        </div>

        {/* Footer Note - مضغوط */}
        <div style={{
          padding: '2mm',
          background: 'linear-gradient(135deg, rgba(212,175,55,0.05), rgba(255,255,255,0.3))',
          border: '1px dashed rgba(212,175,55,0.3)',
          borderRadius: '5px',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '7pt', color: '#666', margin: 0, lineHeight: '1.3' }}>
            هذه الشهادة صادرة من منصة النخيل والزيتون الإلكترونية وتعتبر وثيقة رسمية تثبت ملكية الأشجار المذكورة أعلاه.
            للتحقق من صحة الشهادة، يرجى زيارة موقعنا الإلكتروني وإدخال رقم الشهادة.
          </p>
        </div>
      </div>
    </>
  );
}
