import { useState, useEffect } from 'react';
import { Mail, MessageCircle, Twitter, MapPin, Phone } from 'lucide-react';
import { brandColors, brandGradients } from '../../finance/styles/brandColors';
import { getPlatformTextsBySection, subscribeToPlatformTextsChanges } from '../../../services/platformTextsService';

export function PremiumFooter() {
  const [footerTexts, setFooterTexts] = useState({
    company_name: 'منصة النخيل والزيتون',
    company_description: 'منصة رائدة في مجال الاستثمار الزراعي والملكية المشتركة للأشجار المثمرة',
    section_about: 'عن المنصة',
    section_contact: 'التواصل معنا',
    phone: '+966 56 933 5257',
    email: 'info@palmolive.sa',
    address: 'الرياض، المملكة العربية السعودية',
    copyright: '© 2025 جميع الحقوق محفوظة'
  });

  useEffect(() => {
    const loadTexts = async () => {
      const texts = await getPlatformTextsBySection('footer');
      if (texts && Object.keys(texts).length > 0) {
        setFooterTexts({
          company_name: texts.company_name?.ar || 'منصة النخيل والزيتون',
          company_description: texts.company_description?.ar || 'منصة رائدة في مجال الاستثمار الزراعي والملكية المشتركة للأشجار المثمرة',
          section_about: texts.section_about?.ar || 'عن المنصة',
          section_contact: texts.section_contact?.ar || 'التواصل معنا',
          phone: texts.phone?.ar || '+966 56 933 5257',
          email: texts.email?.ar || 'info@palmolive.sa',
          address: texts.address?.ar || 'الرياض، المملكة العربية السعودية',
          copyright: texts.copyright?.ar || '© 2025 جميع الحقوق محفوظة'
        });
      }
    };

    loadTexts();

    const unsubscribe = subscribeToPlatformTextsChanges('footer', (texts) => {
      if (texts && Object.keys(texts).length > 0) {
        setFooterTexts({
          company_name: texts.company_name?.ar || 'منصة النخيل والزيتون',
          company_description: texts.company_description?.ar || 'منصة رائدة في مجال الاستثمار الزراعي والملكية المشتركة للأشجار المثمرة',
          section_about: texts.section_about?.ar || 'عن المنصة',
          section_contact: texts.section_contact?.ar || 'التواصل معنا',
          phone: texts.phone?.ar || '+966 56 933 5257',
          email: texts.email?.ar || 'info@palmolive.sa',
          address: texts.address?.ar || 'الرياض، المملكة العربية السعودية',
          copyright: texts.copyright?.ar || '© 2025 جميع الحقوق محفوظة'
        });
        console.log('✅ Footer texts updated:', texts);
      }
    });

    return () => unsubscribe();
  }, []);

  const contactLinks = [
    { icon: MessageCircle, label: 'واتساب', href: `https://wa.me/${footerTexts.phone.replace(/[^0-9]/g, '')}`, color: '#25D366' },
    { icon: Mail, label: 'البريد الإلكتروني', href: `mailto:${footerTexts.email}`, color: '#D4AF37' },
    { icon: Twitter, label: 'تويتر', href: 'https://twitter.com/palmolive', color: '#1DA1F2' },
  ];

  return (
    <footer
      className="relative py-16 px-6"
      style={{
        background: 'linear-gradient(180deg, #047857 0%, #065f46 100%)',
        borderTop: '3px solid rgba(16, 185, 129, 0.3)',
      }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, #10b981, transparent)',
          boxShadow: '0 0 20px rgba(16, 185, 129, 0.5)',
        }}
      />

      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          <div>
            <h3
              className="text-3xl font-black mb-4"
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {footerTexts.section_about}
            </h3>
            <p className="text-gray-400 leading-relaxed font-medium">
              {footerTexts.company_description}
            </p>

            <div className="mt-6 flex items-start gap-3">
              <MapPin className="h-5 w-5 mt-1" style={{ color: '#10b981' }} />
              <div className="text-gray-400 font-medium">
                <div className="font-bold text-white mb-1">المقر الرئيسي</div>
                {footerTexts.address}
              </div>
            </div>
          </div>

          <div>
            <h3
              className="text-3xl font-black mb-4"
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {footerTexts.section_contact}
            </h3>
            <div className="space-y-4">
              {contactLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl transition-all duration-300 hover:scale-105 group"
                  style={{
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '2px solid rgba(16, 185, 129, 0.2)',
                  }}
                >
                  <div
                    className="p-2 rounded-lg transition-all duration-300 group-hover:scale-110"
                    style={{
                      background: `rgba(${link.color === '#25D366' ? '37, 211, 102' : link.color === '#1DA1F2' ? '29, 161, 242' : '212, 175, 55'}, 0.2)`,
                    }}
                  >
                    <link.icon className="h-5 w-5" style={{ color: link.color }} />
                  </div>
                  <span className="font-bold text-gray-300 group-hover:text-white transition-colors">
                    {link.label}
                  </span>
                </a>
              ))}

              <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                <div className="p-2 rounded-lg" style={{ background: 'rgba(16, 185, 129, 0.2)' }}>
                  <Phone className="h-5 w-5" style={{ color: '#10b981' }} />
                </div>
                <div className="text-gray-300 font-bold">
                  <div className="text-sm opacity-75">الدعم الفني</div>
                  <div className="text-white">{footerTexts.phone}</div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3
              className="text-3xl font-black mb-4"
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              روابط سريعة
            </h3>
            <div className="space-y-3">
              {['الرئيسية', 'المزارع المتاحة', 'كيف تعمل المنصة', 'الأسئلة الشائعة', 'الشروط والأحكام', 'سياسة الخصوصية'].map((link, index) => (
                <a
                  key={index}
                  href={`#${link}`}
                  className="block text-gray-400 font-medium hover:text-white transition-all duration-300 hover:translate-x-2"
                  style={{
                    textShadow: '0 0 10px transparent',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.textShadow = '0 0 10px rgba(16, 185, 129, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.textShadow = '0 0 10px transparent';
                  }}
                >
                  {link}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div
          className="pt-8 border-t text-center"
          style={{ borderColor: 'rgba(16, 185, 129, 0.2)' }}
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <div
              className="text-2xl font-black"
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {footerTexts.company_name}
            </div>
          </div>
          <p className="text-gray-500 font-medium">
            {footerTexts.copyright}
          </p>
          <p className="text-gray-600 text-sm mt-2">
            استثمار راقٍ يثمر خيرًا
          </p>
        </div>
      </div>

      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2310b981' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
    </footer>
  );
}
