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
      }}
    >
      {/* Mobile Collapsed Header */}
      {shouldCollapse && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-3 flex items-center justify-between transition-all hover:opacity-90"
          style={{ color: footerInfo.footer_text_color }}
        >
          <div className="flex items-center gap-2">
            <Building2 size={18} />
            <span className="text-sm font-semibold">
              {footerInfo.organization_name_ar}
            </span>
          </div>
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      )}

      {/* Main Footer Content */}
      {showContent && (
        <div className="px-4 py-6 md:py-8">
          <div className="max-w-7xl mx-auto">
            {/* Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">

              {/* Column 1: Organization Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      border: `1px solid rgba(255, 255, 255, 0.2)`
                    }}
                  >
                    <Building2 size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-base md:text-lg">
                      {footerInfo.organization_name_ar}
                    </h3>
                    <p className="text-xs opacity-70">
                      {footerInfo.organization_name_en}
                    </p>
                  </div>
                </div>

                {/* Commercial Registration */}
                {footerInfo.commercial_registration && (
                  <div className="flex items-start gap-2 text-sm">
                    <Shield size={16} className="mt-0.5 opacity-70" />
                    <div>
                      <p className="text-xs opacity-60">السجل التجاري</p>
                      <p className="font-semibold">{footerInfo.commercial_registration}</p>
                    </div>
                  </div>
                )}

                {/* Location */}
                <div className="flex items-start gap-2 text-sm">
                  <MapPin size={16} className="mt-0.5 opacity-70" />
                  <div>
                    <p className="font-medium">{footerInfo.city_ar}</p>
                    <p className="text-xs opacity-70">{footerInfo.country_ar}</p>
                  </div>
                </div>
              </div>

              {/* Column 2: Contact Info */}
              <div className="space-y-4">
                <h4 className="font-bold text-base mb-4 opacity-90">تواصل معنا</h4>

                {/* Email */}
                {footerInfo.email && (
                  <a
                    href={`mailto:${footerInfo.email}`}
                    className="flex items-center gap-3 text-sm hover:opacity-80 transition-opacity group"
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-all group-hover:scale-110"
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                    >
                      <Mail size={16} />
                    </div>
                    <div>
                      <p className="text-xs opacity-60">البريد الإلكتروني</p>
                      <p className="font-medium">{footerInfo.email}</p>
                    </div>
                  </a>
                )}

                {/* Phone */}
                {footerInfo.phone && (
                  <a
                    href={`tel:${footerInfo.phone}`}
                    className="flex items-center gap-3 text-sm hover:opacity-80 transition-opacity group"
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-all group-hover:scale-110"
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                    >
                      <Phone size={16} />
                    </div>
                    <div>
                      <p className="text-xs opacity-60">رقم الهاتف</p>
                      <p className="font-medium">{footerInfo.phone}</p>
                    </div>
                  </a>
                )}

                {/* WhatsApp */}
                {footerInfo.whatsapp && (
                  <a
                    href={`https://wa.me/${footerInfo.whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm hover:opacity-80 transition-opacity group"
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-all group-hover:scale-110"
                      style={{ backgroundColor: 'rgba(37, 211, 102, 0.2)' }}
                    >
                      <MessageCircle size={16} />
                    </div>
                    <div>
                      <p className="text-xs opacity-60">واتساب</p>
                      <p className="font-medium">{footerInfo.whatsapp}</p>
                    </div>
                  </a>
                )}
              </div>

              {/* Column 3: Trust & Legal */}
              <div className="space-y-4">
                <h4 className="font-bold text-base mb-4 opacity-90">الثقة والتوثيق</h4>

                {/* Trust Statement */}
                <div
                  className="p-4 rounded-lg text-sm leading-relaxed"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <div className="flex items-start gap-2">
                    <Shield size={16} className="mt-0.5 flex-shrink-0" style={{ color: '#4ADE80' }} />
                    <p className="text-xs opacity-90">
                      {footerInfo.trust_statement_ar}
                    </p>
                  </div>
                </div>

                {/* Legal Links */}
                <div className="flex flex-col gap-2 text-sm">
                  {footerInfo.show_privacy_policy && (
                    <a
                      href={footerInfo.privacy_policy_url}
                      className="hover:opacity-80 transition-opacity inline-flex items-center gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'currentColor', opacity: 0.5 }}></span>
                      سياسة الخصوصية
                    </a>
                  )}
                  {footerInfo.show_terms_conditions && (
                    <a
                      href={footerInfo.terms_conditions_url}
                      className="hover:opacity-80 transition-opacity inline-flex items-center gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'currentColor', opacity: 0.5 }}></span>
                      الشروط والأحكام
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div
              className="mt-8 pt-6 text-center text-xs opacity-60"
              style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}
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
