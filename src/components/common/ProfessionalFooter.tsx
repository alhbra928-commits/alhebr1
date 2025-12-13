import { useState, useEffect } from 'react';
import { Building2, Mail, Phone, MessageCircle, MapPin, Shield, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface FooterInfo {
  id: string;
  organization_name_ar: string;
  organization_name_en: string;
  commercial_registration: string;
  email: string;
  phone: string;
  whatsapp: string;
  city_ar: string;
  city_en: string;
  country_ar: string;
  country_en: string;
  trust_statement_ar: string;
  trust_statement_en: string;
  show_privacy_policy: boolean;
  show_terms_conditions: boolean;
  privacy_policy_url: string;
  terms_conditions_url: string;
  footer_bg_color: string;
  footer_text_color: string;
  show_in_mobile: boolean;
  mobile_collapsed: boolean;
  is_active: boolean;
}

export function ProfessionalFooter() {
  const [footerInfo, setFooterInfo] = useState<FooterInfo | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    loadFooterInfo();
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const checkMobile = () => {
    setIsMobile(window.innerWidth < 768);
  };

  const loadFooterInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('footer_info')
        .select('*')
        .eq('is_active', true)
        .single();

      if (error) throw error;
      if (data) setFooterInfo(data);
    } catch (error) {
      console.error('Error loading footer info:', error);
    }
  };

  if (!footerInfo) return null;
  if (!footerInfo.show_in_mobile && isMobile) return null;

  const shouldCollapse = isMobile && footerInfo.mobile_collapsed;
  const showContent = !shouldCollapse || isExpanded;

  return (
    <footer
      className="relative w-full mt-auto"
      style={{
        backgroundColor: footerInfo.footer_bg_color,
        color: footerInfo.footer_text_color,
        paddingBottom: isMobile ? 'max(16px, env(safe-area-inset-bottom))' : '0',
      }}
    >
      {/* Mobile Collapsed Header */}
      {shouldCollapse && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between transition-all active:opacity-70"
          style={{
            color: footerInfo.footer_text_color,
            padding: '16px max(16px, env(safe-area-inset-right)) 16px max(16px, env(safe-area-inset-left))',
            minHeight: '56px',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <div className="flex items-center gap-3">
            <Building2 size={20} />
            <span className="text-base font-bold">
              {footerInfo.organization_name_ar}
            </span>
          </div>
          {isExpanded ? <ChevronUp size={22} /> : <ChevronDown size={22} />}
        </button>
      )}

      {/* Main Footer Content */}
      {showContent && (
        <div
          style={{
            padding: isMobile
              ? '24px max(16px, env(safe-area-inset-right)) 24px max(16px, env(safe-area-inset-left))'
              : '32px 16px',
          }}
        >
          <div className="max-w-7xl mx-auto">
            {/* Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-8">

              {/* Column 1: Organization Info */}
              <div className="space-y-5">
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className="flex-shrink-0 rounded-xl flex items-center justify-center"
                    style={{
                      width: isMobile ? '48px' : '44px',
                      height: isMobile ? '48px' : '44px',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      border: `1px solid rgba(255, 255, 255, 0.2)`
                    }}
                  >
                    <Building2 size={isMobile ? 24 : 22} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold leading-tight" style={{ fontSize: isMobile ? '17px' : '18px' }}>
                      {footerInfo.organization_name_ar}
                    </h3>
                    <p className="opacity-70 mt-0.5" style={{ fontSize: isMobile ? '13px' : '12px' }}>
                      {footerInfo.organization_name_en}
                    </p>
                  </div>
                </div>

                {/* Commercial Registration */}
                {footerInfo.commercial_registration && (
                  <div className="flex items-start gap-3">
                    <Shield size={isMobile ? 20 : 18} className="mt-0.5 opacity-70 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="opacity-60" style={{ fontSize: isMobile ? '13px' : '12px' }}>السجل التجاري</p>
                      <p className="font-semibold mt-0.5" style={{ fontSize: isMobile ? '15px' : '14px' }}>
                        {footerInfo.commercial_registration}
                      </p>
                    </div>
                  </div>
                )}

                {/* Location */}
                <div className="flex items-start gap-3">
                  <MapPin size={isMobile ? 20 : 18} className="mt-0.5 opacity-70 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium" style={{ fontSize: isMobile ? '15px' : '14px' }}>
                      {footerInfo.city_ar}
                    </p>
                    <p className="opacity-70 mt-0.5" style={{ fontSize: isMobile ? '13px' : '12px' }}>
                      {footerInfo.country_ar}
                    </p>
                  </div>
                </div>
              </div>

              {/* Column 2: Contact Info */}
              <div className="space-y-5">
                <h4 className="font-bold opacity-90 mb-5" style={{ fontSize: isMobile ? '17px' : '16px' }}>
                  تواصل معنا
                </h4>

                {/* Email */}
                {footerInfo.email && (
                  <a
                    href={`mailto:${footerInfo.email}`}
                    className="flex items-center gap-3 transition-opacity active:opacity-70 group"
                    style={{
                      WebkitTapHighlightColor: 'transparent',
                      minHeight: isMobile ? '48px' : 'auto',
                    }}
                  >
                    <div
                      className="flex-shrink-0 rounded-xl flex items-center justify-center transition-all"
                      style={{
                        width: isMobile ? '44px' : '40px',
                        height: isMobile ? '44px' : '40px',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      <Mail size={isMobile ? 20 : 18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="opacity-60" style={{ fontSize: isMobile ? '13px' : '12px' }}>البريد الإلكتروني</p>
                      <p className="font-medium mt-0.5 truncate" style={{ fontSize: isMobile ? '15px' : '14px' }}>
                        {footerInfo.email}
                      </p>
                    </div>
                  </a>
                )}

                {/* Phone */}
                {footerInfo.phone && (
                  <a
                    href={`tel:${footerInfo.phone}`}
                    className="flex items-center gap-3 transition-opacity active:opacity-70 group"
                    style={{
                      WebkitTapHighlightColor: 'transparent',
                      minHeight: isMobile ? '48px' : 'auto',
                    }}
                  >
                    <div
                      className="flex-shrink-0 rounded-xl flex items-center justify-center transition-all"
                      style={{
                        width: isMobile ? '44px' : '40px',
                        height: isMobile ? '44px' : '40px',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      <Phone size={isMobile ? 20 : 18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="opacity-60" style={{ fontSize: isMobile ? '13px' : '12px' }}>رقم الهاتف</p>
                      <p className="font-medium mt-0.5" style={{ fontSize: isMobile ? '15px' : '14px' }}>
                        {footerInfo.phone}
                      </p>
                    </div>
                  </a>
                )}

                {/* WhatsApp */}
                {footerInfo.whatsapp && (
                  <a
                    href={`https://wa.me/${footerInfo.whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 transition-opacity active:opacity-70 group"
                    style={{
                      WebkitTapHighlightColor: 'transparent',
                      minHeight: isMobile ? '48px' : 'auto',
                    }}
                  >
                    <div
                      className="flex-shrink-0 rounded-xl flex items-center justify-center transition-all"
                      style={{
                        width: isMobile ? '44px' : '40px',
                        height: isMobile ? '44px' : '40px',
                        backgroundColor: 'rgba(37, 211, 102, 0.2)',
                      }}
                    >
                      <MessageCircle size={isMobile ? 20 : 18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="opacity-60" style={{ fontSize: isMobile ? '13px' : '12px' }}>واتساب</p>
                      <p className="font-medium mt-0.5" style={{ fontSize: isMobile ? '15px' : '14px' }}>
                        {footerInfo.whatsapp}
                      </p>
                    </div>
                  </a>
                )}
              </div>

              {/* Column 3: Trust & Legal */}
              <div className="space-y-5">
                <h4 className="font-bold opacity-90 mb-5" style={{ fontSize: isMobile ? '17px' : '16px' }}>
                  الثقة والتوثيق
                </h4>

                {/* Trust Statement */}
                <div
                  className="rounded-xl leading-relaxed"
                  style={{
                    padding: isMobile ? '16px' : '14px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <div className="flex items-start gap-3">
                    <Shield size={isMobile ? 20 : 18} className="mt-0.5 flex-shrink-0" style={{ color: '#4ADE80' }} />
                    <p className="opacity-90" style={{ fontSize: isMobile ? '14px' : '13px', lineHeight: '1.6' }}>
                      {footerInfo.trust_statement_ar}
                    </p>
                  </div>
                </div>

                {/* Legal Links */}
                <div className="flex flex-col gap-3">
                  {footerInfo.show_privacy_policy && (
                    <a
                      href={footerInfo.privacy_policy_url}
                      className="transition-opacity active:opacity-70 inline-flex items-center gap-2"
                      style={{
                        WebkitTapHighlightColor: 'transparent',
                        fontSize: isMobile ? '15px' : '14px',
                        minHeight: isMobile ? '44px' : 'auto',
                      }}
                    >
                      <span
                        className="rounded-full flex-shrink-0"
                        style={{
                          width: isMobile ? '6px' : '5px',
                          height: isMobile ? '6px' : '5px',
                          backgroundColor: 'currentColor',
                          opacity: 0.5,
                        }}
                      ></span>
                      سياسة الخصوصية
                    </a>
                  )}
                  {footerInfo.show_terms_conditions && (
                    <a
                      href={footerInfo.terms_conditions_url}
                      className="transition-opacity active:opacity-70 inline-flex items-center gap-2"
                      style={{
                        WebkitTapHighlightColor: 'transparent',
                        fontSize: isMobile ? '15px' : '14px',
                        minHeight: isMobile ? '44px' : 'auto',
                      }}
                    >
                      <span
                        className="rounded-full flex-shrink-0"
                        style={{
                          width: isMobile ? '6px' : '5px',
                          height: isMobile ? '6px' : '5px',
                          backgroundColor: 'currentColor',
                          opacity: 0.5,
                        }}
                      ></span>
                      الشروط والأحكام
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div
              className="text-center opacity-60"
              style={{
                marginTop: isMobile ? '32px' : '32px',
                paddingTop: isMobile ? '24px' : '24px',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                fontSize: isMobile ? '13px' : '12px',
                paddingBottom: isMobile ? '8px' : '0',
              }}
            >
              <p>
                جميع الحقوق محفوظة © {new Date().getFullYear()} {footerInfo.organization_name_ar}
              </p>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
