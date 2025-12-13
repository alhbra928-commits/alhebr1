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

  const checkMobile = () => setIsMobile(window.innerWidth < 768);

  const loadFooterInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('footer_info')
        .select('*')
        .eq('is_active', true)
        .maybeSingle();

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
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 999998,
        backgroundColor: footerInfo.footer_bg_color,
        color: footerInfo.footer_text_color,
        paddingBottom: isMobile ? 'max(16px, env(safe-area-inset-bottom))' : '16px',
        WebkitTransform: 'translate3d(0, 0, 0)',
        transform: 'translate3d(0, 0, 0)',
        WebkitPerspective: 1000,
        perspective: 1000,
        willChange: 'transform',
        isolation: 'isolate',
        boxShadow: '0 -4px 12px rgba(0,0,0,0.1)',
        pointerEvents: 'auto',
        overflow: 'hidden',
        width: '100%',
      }}
    >
      {/* 3D Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-1/2 -right-1/4 w-96 h-96 rounded-full opacity-5"
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)',
            filter: 'blur(60px)',
            transform: 'translateZ(-20px)',
          }}
        />
        <div
          className="absolute -bottom-1/2 -left-1/4 w-96 h-96 rounded-full opacity-5"
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)',
            filter: 'blur(60px)',
            transform: 'translateZ(-20px)',
          }}
        />
      </div>

      {/* Mobile Collapsed Header */}
      {shouldCollapse && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="relative w-full flex items-center justify-between transition-all active:scale-[0.98]"
          style={{
            color: footerInfo.footer_text_color,
            padding: '16px max(16px, env(safe-area-inset-right)) 16px max(16px, env(safe-area-inset-left))',
            minHeight: '56px',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)',
              }}
            >
              <Building2 size={20} />
            </div>
            <span
              className="text-base font-bold"
              style={{
                textShadow: '0 2px 4px rgba(0,0,0,0.15), 0 4px 8px rgba(0,0,0,0.1)',
              }}
            >
              {footerInfo.organization_name_ar}
            </span>
          </div>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{
              background: 'rgba(255,255,255,0.1)',
            }}
          >
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </button>
      )}

      {/* Main Footer Content */}
      {showContent && (
        <div
          className="relative z-10"
          style={{
            padding: isMobile
              ? '24px max(16px, env(safe-area-inset-right)) 24px max(16px, env(safe-area-inset-left))'
              : '40px 20px',
          }}
        >
          <div className="max-w-6xl mx-auto">
            {/* Organization Header with 3D Effect */}
            <div className="text-center mb-8">
              <h2
                className="font-bold mb-2"
                style={{
                  fontSize: isMobile ? '24px' : '32px',
                  textShadow: '0 3px 0 rgba(0,0,0,0.2), 0 5px 10px rgba(0,0,0,0.15), 0 8px 20px rgba(0,0,0,0.1)',
                  letterSpacing: '0.02em',
                  lineHeight: '1.2',
                }}
              >
                {footerInfo.organization_name_ar}
              </h2>
              <p
                className="opacity-70"
                style={{
                  fontSize: isMobile ? '13px' : '14px',
                  textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                }}
              >
                {footerInfo.organization_name_en}
              </p>
            </div>

            {/* Compact Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Contact Info with 3D Cards */}
              <div className="space-y-3">
                {footerInfo.email && (
                  <a
                    href={`mailto:${footerInfo.email}`}
                    className="flex items-center gap-3 p-3 rounded-xl transition-all active:scale-95"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.05))',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.15)',
                      backdropFilter: 'blur(10px)',
                      WebkitTapHighlightColor: 'transparent',
                      minHeight: isMobile ? '56px' : 'auto',
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(37, 99, 235, 0.2))',
                        boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
                      }}
                    >
                      <Mail size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs opacity-60 mb-0.5">البريد</p>
                      <p className="text-sm font-medium truncate">{footerInfo.email}</p>
                    </div>
                  </a>
                )}

                {footerInfo.phone && (
                  <a
                    href={`tel:${footerInfo.phone}`}
                    className="flex items-center gap-3 p-3 rounded-xl transition-all active:scale-95"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.05))',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.15)',
                      backdropFilter: 'blur(10px)',
                      WebkitTapHighlightColor: 'transparent',
                      minHeight: isMobile ? '56px' : 'auto',
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.3), rgba(5, 150, 105, 0.2))',
                        boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                      }}
                    >
                      <Phone size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs opacity-60 mb-0.5">الهاتف</p>
                      <p className="text-sm font-medium">{footerInfo.phone}</p>
                    </div>
                  </a>
                )}

                {footerInfo.whatsapp && (
                  <a
                    href={`https://wa.me/${footerInfo.whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl transition-all active:scale-95"
                    style={{
                      background: 'linear-gradient(135deg, rgba(37, 211, 102, 0.2), rgba(34, 197, 94, 0.15))',
                      boxShadow: '0 4px 12px rgba(37, 211, 102, 0.2), inset 0 1px 0 rgba(255,255,255,0.15)',
                      backdropFilter: 'blur(10px)',
                      WebkitTapHighlightColor: 'transparent',
                      minHeight: isMobile ? '56px' : 'auto',
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        background: 'linear-gradient(135deg, rgba(37, 211, 102, 0.4), rgba(34, 197, 94, 0.3))',
                        boxShadow: '0 2px 8px rgba(37, 211, 102, 0.4)',
                      }}
                    >
                      <MessageCircle size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs opacity-60 mb-0.5">واتساب</p>
                      <p className="text-sm font-medium">{footerInfo.whatsapp}</p>
                    </div>
                  </a>
                )}
              </div>

              {/* Location & Trust */}
              <div className="space-y-3">
                {/* Location */}
                <div
                  className="p-4 rounded-xl"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.3), rgba(147, 51, 234, 0.2))',
                        boxShadow: '0 2px 8px rgba(168, 85, 247, 0.3)',
                      }}
                    >
                      <MapPin size={18} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold mb-1">{footerInfo.city_ar}</p>
                      <p className="text-xs opacity-70">{footerInfo.country_ar}</p>
                      {footerInfo.commercial_registration && (
                        <p className="text-xs opacity-60 mt-2 flex items-center gap-2">
                          <Shield size={12} />
                          س.ت: {footerInfo.commercial_registration}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Trust Statement */}
                <div
                  className="p-4 rounded-xl"
                  style={{
                    background: 'linear-gradient(135deg, rgba(74, 222, 128, 0.15), rgba(34, 197, 94, 0.1))',
                    boxShadow: '0 4px 12px rgba(74, 222, 128, 0.15), inset 0 1px 0 rgba(255,255,255,0.1)',
                    border: '1px solid rgba(74, 222, 128, 0.2)',
                  }}
                >
                  <div className="flex items-start gap-3">
                    <Shield size={16} className="flex-shrink-0 mt-0.5" style={{ color: '#4ADE80' }} />
                    <p className="text-xs leading-relaxed opacity-90">
                      {footerInfo.trust_statement_ar}
                    </p>
                  </div>
                </div>

                {/* Legal Links */}
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  {footerInfo.show_privacy_policy && (
                    <a
                      href={footerInfo.privacy_policy_url}
                      className="px-4 py-2 text-xs rounded-lg transition-all active:scale-95"
                      style={{
                        background: 'rgba(255,255,255,0.08)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        WebkitTapHighlightColor: 'transparent',
                      }}
                    >
                      سياسة الخصوصية
                    </a>
                  )}
                  {footerInfo.show_terms_conditions && (
                    <a
                      href={footerInfo.terms_conditions_url}
                      className="px-4 py-2 text-xs rounded-lg transition-all active:scale-95"
                      style={{
                        background: 'rgba(255,255,255,0.08)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        WebkitTapHighlightColor: 'transparent',
                      }}
                    >
                      الشروط والأحكام
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Line with 3D Text */}
            <div
              className="text-center pt-6"
              style={{
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <p
                className="text-xs opacity-70"
                style={{
                  textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                }}
              >
                جميع الحقوق محفوظة © {new Date().getFullYear()} {footerInfo.organization_name_ar}
              </p>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
