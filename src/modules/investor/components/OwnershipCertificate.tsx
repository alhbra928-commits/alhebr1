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
          html, body {
            width: 210mm;
            height: 297mm;
            margin: 0;
            padding: 0;
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
            margin: 0 !important;
            padding: 12mm !important;
            box-sizing: border-box !important;
            background: white !important;
            overflow: hidden !important;
          }
        }

        @media screen {
          .certificate-print-area {
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto;
            padding: 12mm;
            box-sizing: border-box;
            background: white;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
          }
        }
      `}</style>

      <div className="certificate-print-area" style={{ border: '4px solid #d4af37' }}>
        {/* Header */}
        <div className="text-center" style={{ marginBottom: '8mm' }}>
          <div style={{
            width: '40mm',
            height: '40mm',
            margin: '0 auto 4mm',
            border: '3px solid #d4af37',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #fdfbf7, #f8f5ed)'
          }}>
            <Trees style={{ width: '20mm', height: '20mm', color: '#d4af37' }} />
          </div>

          <h1 style={{
            fontSize: '24pt',
            fontWeight: 'bold',
            color: '#d4af37',
            margin: '0 0 2mm',
            letterSpacing: '2px'
          }}>
            شهادة تملك
          </h1>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3mm',
            marginBottom: '2mm'
          }}>
            <div style={{ width: '20mm', height: '1px', background: '#d4af37' }}></div>
            <Shield style={{ width: '4mm', height: '4mm', color: '#d4af37' }} />
            <div style={{ width: '20mm', height: '1px', background: '#d4af37' }}></div>
          </div>

          <p style={{ fontSize: '10pt', color: '#666', margin: 0 }}>
            Ownership Certificate
          </p>
        </div>

        {/* Body */}
        <div style={{ marginBottom: '8mm' }}>
          <p style={{
            fontSize: '12pt',
            textAlign: 'center',
            color: '#333',
            margin: '0 0 3mm',
            lineHeight: '1.4'
          }}>
            تشهد <strong style={{ color: '#d4af37', fontSize: '14pt' }}>منصة النخيل والزيتون</strong>
          </p>

          <p style={{
            fontSize: '12pt',
            textAlign: 'center',
            color: '#333',
            margin: '0 0 3mm'
          }}>
            بأن السيد / السيدة
          </p>

          <div style={{
            textAlign: 'center',
            padding: '4mm 8mm',
            margin: '0 auto 3mm',
            maxWidth: '120mm',
            background: 'linear-gradient(135deg, rgba(212,175,55,0.1), rgba(212,175,55,0.05))',
            border: '2px solid #d4af37',
            borderRadius: '8px'
          }}>
            <p style={{
              fontSize: '18pt',
              fontWeight: 'bold',
              color: '#d4af37',
              margin: 0
            }}>
              {certificate.investor_name}
            </p>
          </div>

          <p style={{
            fontSize: '12pt',
            textAlign: 'center',
            color: '#333',
            margin: '0 0 3mm'
          }}>
            مالك لعدد
          </p>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4mm',
            marginBottom: '3mm'
          }}>
            <div style={{
              padding: '3mm 6mm',
              background: 'linear-gradient(135deg, #fdfbf7, #f8f5ed)',
              border: '2px solid #d4af37',
              borderRadius: '6px'
            }}>
              <span style={{
                fontSize: '22pt',
                fontWeight: 'bold',
                color: '#d4af37'
              }}>
                {certificate.reserved_trees.toLocaleString('ar-SA')}
              </span>
            </div>
            <span style={{ fontSize: '14pt', fontWeight: 'bold', color: '#333' }}>
              شجرة {certificate.farm_type}
            </span>
          </div>

          <p style={{
            fontSize: '12pt',
            textAlign: 'center',
            color: '#333',
            margin: '0 0 2mm'
          }}>
            في مزرعة
          </p>

          <p style={{
            fontSize: '16pt',
            fontWeight: 'bold',
            textAlign: 'center',
            color: '#d4af37',
            margin: '0 0 6mm'
          }}>
            {certificate.farm_name}
          </p>
        </div>

        {/* Info Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '3mm',
          marginBottom: '6mm'
        }}>
          <div style={{
            textAlign: 'center',
            padding: '3mm',
            background: 'linear-gradient(135deg, rgba(212,175,55,0.05), rgba(255,255,255,0.5))',
            border: '1px solid rgba(212,175,55,0.2)',
            borderRadius: '6px'
          }}>
            <MapPin style={{ width: '6mm', height: '6mm', color: '#d4af37', margin: '0 auto 1mm' }} />
            <p style={{ fontSize: '8pt', color: '#666', margin: '0 0 1mm' }}>الموقع</p>
            <p style={{ fontSize: '10pt', fontWeight: 'bold', color: '#333', margin: 0 }}>
              {certificate.farm_location || 'السعودية'}
            </p>
          </div>

          <div style={{
            textAlign: 'center',
            padding: '3mm',
            background: 'linear-gradient(135deg, rgba(212,175,55,0.05), rgba(255,255,255,0.5))',
            border: '1px solid rgba(212,175,55,0.2)',
            borderRadius: '6px'
          }}>
            <Award style={{ width: '6mm', height: '6mm', color: '#d4af37', margin: '0 auto 1mm' }} />
            <p style={{ fontSize: '8pt', color: '#666', margin: '0 0 1mm' }}>رقم الشهادة</p>
            <p style={{ fontSize: '10pt', fontWeight: 'bold', color: '#333', margin: 0 }}>
              {certificate.certificate_code}
            </p>
          </div>

          <div style={{
            textAlign: 'center',
            padding: '3mm',
            background: 'linear-gradient(135deg, rgba(212,175,55,0.05), rgba(255,255,255,0.5))',
            border: '1px solid rgba(212,175,55,0.2)',
            borderRadius: '6px'
          }}>
            <Calendar style={{ width: '6mm', height: '6mm', color: '#d4af37', margin: '0 auto 1mm' }} />
            <p style={{ fontSize: '8pt', color: '#666', margin: '0 0 1mm' }}>تاريخ الإصدار</p>
            <p style={{ fontSize: '9pt', fontWeight: 'bold', color: '#333', margin: '0 0 0.5mm' }}>
              {gregorianDate}
            </p>
            <p style={{ fontSize: '8pt', color: '#666', margin: 0 }}>
              {hijriDate}
            </p>
          </div>
        </div>

        {/* Separator */}
        <div style={{
          height: '1px',
          background: 'linear-gradient(to right, transparent, #d4af37, transparent)',
          margin: '6mm 0'
        }}></div>

        {/* Signature & Seal */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '6mm',
          marginBottom: '6mm'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '28pt',
              color: '#d4af37',
              opacity: 0.6,
              marginBottom: '2mm',
              fontFamily: 'cursive'
            }}>
              _______
            </div>
            <p style={{ fontSize: '11pt', fontWeight: 'bold', color: '#333', margin: '0 0 1mm' }}>
              توقيع المدير العام
            </p>
            <p style={{ fontSize: '8pt', color: '#666', margin: 0 }}>
              General Manager Signature
            </p>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '30mm',
              height: '30mm',
              margin: '0 auto 2mm',
              borderRadius: '50%',
              border: '3px solid #d4af37',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'radial-gradient(circle, rgba(212,175,55,0.1), rgba(212,175,55,0.05))'
            }}>
              <CheckCircle2 style={{ width: '10mm', height: '10mm', color: '#d4af37' }} />
              <span style={{ fontSize: '9pt', fontWeight: 'bold', color: '#d4af37' }}>معتمد</span>
              <span style={{ fontSize: '7pt', color: '#666' }}>CERTIFIED</span>
            </div>
            <p style={{ fontSize: '11pt', fontWeight: 'bold', color: '#333', margin: '0 0 1mm' }}>
              الختم الرسمي
            </p>
            <p style={{ fontSize: '8pt', color: '#666', margin: 0 }}>
              Official Seal
            </p>
          </div>
        </div>

        {/* Footer Note */}
        <div style={{
          padding: '3mm',
          background: 'linear-gradient(135deg, rgba(212,175,55,0.05), rgba(255,255,255,0.3))',
          border: '1px dashed rgba(212,175,55,0.3)',
          borderRadius: '6px',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '8pt', color: '#666', margin: 0, lineHeight: '1.4' }}>
            هذه الشهادة صادرة من منصة النخيل والزيتون الإلكترونية وتعتبر وثيقة رسمية تثبت ملكية الأشجار المذكورة أعلاه.
            <br />
            للتحقق من صحة الشهادة، يرجى زيارة موقعنا الإلكتروني وإدخال رقم الشهادة.
          </p>
        </div>
      </div>
    </>
  );
}
