import { Award, Shield, CheckCircle2, MapPin, Calendar, Trees } from 'lucide-react';
import { brandColors, brandGradients } from '../../finance/styles/brandColors';

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
    <div className="max-w-4xl mx-auto">
      <div
        className="relative rounded-3xl overflow-hidden shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, #fdfbf7 0%, #f8f5ed 50%, #fdfbf7 100%)',
          border: '3px solid',
          borderImage: 'linear-gradient(135deg, #d4af37, #f4e5c3, #d4af37) 1'
        }}
      >
        {/* إطار زخرفي خارجي */}
        <div className="absolute inset-0 pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <rect x="10" y="10" width="calc(100% - 20px)" height="calc(100% - 20px)"
              fill="none" stroke="#d4af37" strokeWidth="2" rx="20"
              strokeDasharray="10,5" opacity="0.3"/>
          </svg>
        </div>

        {/* زخرفة الزوايا */}
        <div className="absolute top-0 left-0 w-32 h-32 pointer-events-none">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <path d="M 0,0 L 100,0 L 100,10 Q 90,10 90,20 L 90,100 L 80,100 L 80,25 Q 80,15 70,15 L 10,15 Q 10,25 10,25 L 10,80 L 0,80 Z"
              fill="#d4af37" opacity="0.15"/>
          </svg>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none transform scale-x-[-1]">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <path d="M 0,0 L 100,0 L 100,10 Q 90,10 90,20 L 90,100 L 80,100 L 80,25 Q 80,15 70,15 L 10,15 Q 10,25 10,25 L 10,80 L 0,80 Z"
              fill="#d4af37" opacity="0.15"/>
          </svg>
        </div>
        <div className="absolute bottom-0 left-0 w-32 h-32 pointer-events-none transform scale-y-[-1]">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <path d="M 0,0 L 100,0 L 100,10 Q 90,10 90,20 L 90,100 L 80,100 L 80,25 Q 80,15 70,15 L 10,15 Q 10,25 10,25 L 10,80 L 0,80 Z"
              fill="#d4af37" opacity="0.15"/>
          </svg>
        </div>
        <div className="absolute bottom-0 right-0 w-32 h-32 pointer-events-none transform scale-[-1]">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <path d="M 0,0 L 100,0 L 100,10 Q 90,10 90,20 L 90,100 L 80,100 L 80,25 Q 80,15 70,15 L 10,15 Q 10,25 10,25 L 10,80 L 0,80 Z"
              fill="#d4af37" opacity="0.15"/>
          </svg>
        </div>

        <div className="relative p-12 md:p-16">
          {/* الرأسية */}
          <div className="text-center mb-8">
            {/* شعار مع إطار دائري */}
            <div className="relative inline-block mb-6">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center mx-auto relative"
                style={{
                  background: 'linear-gradient(135deg, #d4af37 0%, #f4e5c3 50%, #d4af37 100%)',
                  boxShadow: '0 8px 30px rgba(212,175,55,0.4)'
                }}
              >
                <div className="absolute inset-1 rounded-full bg-white/95 flex items-center justify-center">
                  <Trees className="w-10 h-10" style={{ color: brandColors.primary.gold }} />
                </div>
                {/* دائرة زخرفية خارجية */}
                <svg className="absolute -inset-2 w-28 h-28" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="48" fill="none" stroke="#d4af37" strokeWidth="0.5"
                    strokeDasharray="2,3" opacity="0.4"/>
                </svg>
              </div>
            </div>

            <h1
              className="text-5xl md:text-6xl font-black mb-3 tracking-wider"
              style={{
                color: brandColors.primary.gold,
                textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              شهادة تملك
            </h1>
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="h-px w-16 bg-gradient-to-r from-transparent via-amber-600 to-transparent"></div>
              <Shield className="w-5 h-5" style={{ color: brandColors.primary.gold }} />
              <div className="h-px w-16 bg-gradient-to-r from-transparent via-amber-600 to-transparent"></div>
            </div>
            <p className="text-lg font-bold" style={{ color: brandColors.text.secondary }}>
              Ownership Certificate
            </p>
          </div>

          {/* خط فاصل زخرفي */}
          <div className="flex items-center justify-center gap-4 mb-10">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-amber-600/30"></div>
            <div className="w-2 h-2 rounded-full" style={{ background: brandColors.primary.gold }}></div>
            <div className="w-3 h-3 rounded-full" style={{ background: brandColors.primary.gold }}></div>
            <div className="w-2 h-2 rounded-full" style={{ background: brandColors.primary.gold }}></div>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-amber-600/30"></div>
          </div>

          {/* نص الشهادة */}
          <div className="text-center mb-10 space-y-4">
            <p className="text-xl md:text-2xl leading-relaxed" style={{ color: brandColors.text.primary }}>
              تشهد <span className="font-black text-2xl md:text-3xl" style={{ color: brandColors.primary.gold }}>منصة النخيل والزيتون</span>
            </p>
            <p className="text-xl md:text-2xl leading-relaxed" style={{ color: brandColors.text.primary }}>
              بأن السيد / السيدة
            </p>
            <div
              className="inline-block px-8 py-4 rounded-2xl mx-auto"
              style={{
                background: 'linear-gradient(135deg, rgba(212,175,55,0.1) 0%, rgba(212,175,55,0.05) 100%)',
                border: `2px solid ${brandColors.primary.gold}`,
                boxShadow: '0 4px 15px rgba(212,175,55,0.2)'
              }}
            >
              <p className="text-3xl md:text-4xl font-black" style={{ color: brandColors.primary.gold }}>
                {certificate.investor_name}
              </p>
            </div>
            <p className="text-xl md:text-2xl leading-relaxed" style={{ color: brandColors.text.primary }}>
              مالك لعدد
            </p>
            <div className="flex items-center justify-center gap-4">
              <div
                className="px-6 py-3 rounded-xl"
                style={{
                  background: brandGradients.gold,
                  border: `2px solid ${brandColors.primary.gold}`
                }}
              >
                <p className="text-4xl md:text-5xl font-black" style={{ color: brandColors.primary.gold }}>
                  {certificate.reserved_trees.toLocaleString('ar-SA')}
                </p>
              </div>
              <p className="text-2xl font-bold" style={{ color: brandColors.text.primary }}>
                شجرة {certificate.farm_type}
              </p>
            </div>
            <p className="text-xl md:text-2xl leading-relaxed" style={{ color: brandColors.text.primary }}>
              في مزرعة
            </p>
            <p className="text-2xl md:text-3xl font-black" style={{ color: brandColors.primary.gold }}>
              {certificate.farm_name}
            </p>
          </div>

          {/* معلومات المزرعة */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div
              className="text-center p-6 rounded-xl"
              style={{
                background: 'linear-gradient(135deg, rgba(212,175,55,0.05) 0%, rgba(255,255,255,0.5) 100%)',
                border: '1px solid rgba(212,175,55,0.2)'
              }}
            >
              <MapPin className="w-8 h-8 mx-auto mb-3" style={{ color: brandColors.primary.gold }} />
              <p className="text-sm font-bold mb-1" style={{ color: brandColors.text.secondary }}>
                الموقع
              </p>
              <p className="text-lg font-black" style={{ color: brandColors.text.primary }}>
                {certificate.farm_location || 'المملكة العربية السعودية'}
              </p>
            </div>

            <div
              className="text-center p-6 rounded-xl"
              style={{
                background: 'linear-gradient(135deg, rgba(212,175,55,0.05) 0%, rgba(255,255,255,0.5) 100%)',
                border: '1px solid rgba(212,175,55,0.2)'
              }}
            >
              <Award className="w-8 h-8 mx-auto mb-3" style={{ color: brandColors.primary.gold }} />
              <p className="text-sm font-bold mb-1" style={{ color: brandColors.text.secondary }}>
                رقم الشهادة
              </p>
              <p className="text-lg font-black" style={{ color: brandColors.text.primary }}>
                {certificate.certificate_code}
              </p>
            </div>

            <div
              className="text-center p-6 rounded-xl"
              style={{
                background: 'linear-gradient(135deg, rgba(212,175,55,0.05) 0%, rgba(255,255,255,0.5) 100%)',
                border: '1px solid rgba(212,175,55,0.2)'
              }}
            >
              <Calendar className="w-8 h-8 mx-auto mb-3" style={{ color: brandColors.primary.gold }} />
              <p className="text-sm font-bold mb-1" style={{ color: brandColors.text.secondary }}>
                تاريخ الإصدار
              </p>
              <p className="text-sm font-black" style={{ color: brandColors.text.primary }}>
                {gregorianDate}
              </p>
              <p className="text-xs font-bold" style={{ color: brandColors.text.secondary }}>
                {hijriDate}
              </p>
            </div>
          </div>

          {/* خط فاصل */}
          <div className="h-px bg-gradient-to-r from-transparent via-amber-600/30 to-transparent mb-10"></div>

          {/* التوقيع والختم */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* التوقيع */}
            <div className="text-center">
              <div className="mb-4">
                <div className="relative inline-block">
                  {/* خط التوقيع */}
                  <div className="text-5xl font-bold mb-2"
                    style={{
                      fontFamily: 'cursive',
                      color: brandColors.primary.gold,
                      filter: 'opacity(0.8)'
                    }}
                  >
                    ___________
                  </div>
                </div>
              </div>
              <p className="text-lg font-black mb-1" style={{ color: brandColors.text.primary }}>
                توقيع المدير العام
              </p>
              <p className="text-sm font-bold" style={{ color: brandColors.text.secondary }}>
                General Manager Signature
              </p>
            </div>

            {/* الختم */}
            <div className="text-center">
              <div className="relative inline-block mb-4">
                {/* الختم الرسمي */}
                <div
                  className="w-32 h-32 rounded-full mx-auto relative"
                  style={{
                    background: 'radial-gradient(circle, rgba(212,175,55,0.1) 0%, rgba(212,175,55,0.05) 100%)',
                    border: '3px solid',
                    borderColor: brandColors.primary.gold,
                    boxShadow: 'inset 0 0 20px rgba(212,175,55,0.2)'
                  }}
                >
                  {/* نص دائري */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <CheckCircle2 className="w-12 h-12 mx-auto mb-1" style={{ color: brandColors.primary.gold }} />
                      <p className="text-xs font-black" style={{ color: brandColors.primary.gold }}>
                        معتمد
                      </p>
                      <p className="text-[10px] font-bold" style={{ color: brandColors.text.secondary }}>
                        CERTIFIED
                      </p>
                    </div>
                  </div>
                  {/* دوائر زخرفية */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="46" fill="none" stroke="#d4af37" strokeWidth="0.5"
                      strokeDasharray="1,2" opacity="0.6"/>
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#d4af37" strokeWidth="0.5"
                      strokeDasharray="1,2" opacity="0.4"/>
                  </svg>
                </div>
              </div>
              <p className="text-lg font-black mb-1" style={{ color: brandColors.text.primary }}>
                الختم الرسمي
              </p>
              <p className="text-sm font-bold" style={{ color: brandColors.text.secondary }}>
                Official Seal
              </p>
            </div>
          </div>

          {/* ملاحظة قانونية */}
          <div
            className="mt-10 p-4 rounded-xl text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(212,175,55,0.05) 0%, rgba(255,255,255,0.3) 100%)',
              border: '1px dashed rgba(212,175,55,0.3)'
            }}
          >
            <p className="text-xs leading-relaxed" style={{ color: brandColors.text.secondary }}>
              هذه الشهادة صادرة من منصة النخيل والزيتون الإلكترونية وتعتبر وثيقة رسمية تثبت ملكية الأشجار المذكورة أعلاه.
              <br />
              للتحقق من صحة الشهادة، يرجى زيارة موقعنا الإلكتروني وإدخال رقم الشهادة.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
