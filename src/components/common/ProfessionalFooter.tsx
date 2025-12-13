import { useState, useEffect } from 'react';
import { Building2, Mail, Phone, MessageCircle, MapPin, Shield, ChevronDown, ChevronUp, Crown } from 'lucide-react';
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

interface ProfessionalFooterProps {
  onAdminLogin?: () => void;
  onFarmOwnerLogin?: () => void;
}

export function ProfessionalFooter({ onAdminLogin, onFarmOwnerLogin }: ProfessionalFooterProps) {
  const [footerInfo, setFooterInfo] = useState<FooterInfo | null>(null);
  const [isContentExpanded, setIsContentExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [adminButtonExpanded, setAdminButtonExpanded] = useState(false);
  const [showAdminMenu, setShowAdminMenu] = useState(false);

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

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 999998,
        pointerEvents: 'auto',
        width: '100%',
      }}
    >
      {/* Expanded Content Panel - Slides Up */}
      <div
        style={{
          position: 'absolute',
          bottom: isMobile ? '64px' : '72px',
          left: 0,
          right: 0,
          backgroundColor: footerInfo.footer_bg_color,
          color: footerInfo.footer_text_color,
          maxHeight: isContentExpanded ? '80vh' : '0',
          overflowY: isContentExpanded ? 'auto' : 'hidden',
          transition: 'max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease',
          opacity: isContentExpanded ? 1 : 0,
          boxShadow: isContentExpanded ? '0 -8px 32px rgba(0,0,0,0.2)' : 'none',
          borderTop: isContentExpanded ? '2px solid rgba(255,255,255,0.1)' : 'none',
          WebkitTransform: 'translate3d(0, 0, 0)',
          transform: 'translate3d(0, 0, 0)',
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

        {/* Content */}
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
      </div>

      {/* Main Footer Bar - Always Visible */}
      <button
        onClick={() => setIsContentExpanded(!isContentExpanded)}
        style={{
          width: '100%',
          backgroundColor: footerInfo.footer_bg_color,
          color: footerInfo.footer_text_color,
          padding: isMobile
            ? '16px max(16px, env(safe-area-inset-right)) max(16px, calc(16px + env(safe-area-inset-bottom))) max(16px, env(safe-area-inset-left))'
            : '20px 20px 20px 20px',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.15)',
          borderTop: '2px solid rgba(255,255,255,0.1)',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          WebkitTapHighlightColor: 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          position: 'relative',
          zIndex: 1,
        }}
        className="hover:brightness-110 active:scale-[0.99]"
      >
        <Building2 size={isMobile ? 20 : 24} style={{ flexShrink: 0 }} />
        <span
          style={{
            fontSize: isMobile ? '15px' : '18px',
            fontWeight: 700,
            textShadow: '0 2px 4px rgba(0,0,0,0.2)',
            letterSpacing: '0.02em',
          }}
        >
          {footerInfo.organization_name_ar}
        </span>
        <div
          style={{
            width: isMobile ? '32px' : '36px',
            height: isMobile ? '32px' : '36px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.3s ease',
            transform: isContentExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            flexShrink: 0,
          }}
        >
          <ChevronUp size={isMobile ? 18 : 20} />
        </div>
      </button>

      {/* Hidden Admin Button */}
      <div
        style={{
          position: 'absolute',
          bottom: isMobile ? 'max(8px, calc(8px + env(safe-area-inset-bottom)))' : '8px',
          left: '8px',
          zIndex: 999999,
        }}
      >
        {/* Unified Dashboard Button */}
        <button
          onClick={() => {
            if (!adminButtonExpanded) {
              setAdminButtonExpanded(true);
            } else {
              setShowAdminMenu(!showAdminMenu);
            }
          }}
          className={`transition-all duration-500 ease-out flex flex-col items-center justify-center relative gap-1.5 ${
            adminButtonExpanded
              ? 'w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 via-yellow-500 to-green-500 shadow-2xl'
              : 'w-2 h-2 rounded-full bg-gradient-to-br from-yellow-600 to-green-700 opacity-30 hover:opacity-60'
          }`}
          style={{
            backdropFilter: 'blur(10px)',
            border: adminButtonExpanded ? '2px solid rgba(251, 191, 36, 0.3)' : 'none',
            boxShadow: adminButtonExpanded
              ? '0 10px 40px rgba(251, 191, 36, 0.5), 0 0 80px rgba(34, 197, 94, 0.3), inset 0 1px 0 rgba(255,255,255,0.4)'
              : '0 0 10px rgba(251, 191, 36, 0.4)',
            transform: adminButtonExpanded ? 'scale(1)' : 'scale(1)',
            WebkitTapHighlightColor: 'transparent',
            padding: adminButtonExpanded ? '12px' : '0',
          }}
          title="لوحات التحكم"
        >
          {adminButtonExpanded && (
            <>
              {/* Crown Icon - Top */}
              <Crown
                className="text-white"
                size={20}
                style={{
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                  animation: showAdminMenu ? 'none' : 'pulse 2s infinite',
                  flexShrink: 0,
                }}
              />
              {/* Divider */}
              <div style={{ width: '24px', height: '1.5px', background: 'rgba(255,255,255,0.5)' }} />
              {/* Shield Icon - Bottom */}
              <Shield
                className="text-white"
                size={20}
                style={{
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                  animation: showAdminMenu ? 'none' : 'pulse 2s infinite',
                  flexShrink: 0,
                }}
              />
            </>
          )}
        </button>

        {/* Expanded Menu */}
        {showAdminMenu && adminButtonExpanded && (
          <>
            {/* Backdrop */}
            <div
              onClick={() => {
                setShowAdminMenu(false);
                setAdminButtonExpanded(false);
              }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm"
              style={{ zIndex: 999998, left: 0, right: 0, top: 0, bottom: 0 }}
            />

            {/* Menu Content with 3D Effect */}
            <div
              className="absolute left-0 bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-amber-200 min-w-[280px]"
              style={{
                bottom: '72px',
                zIndex: 999999,
                animation: 'slideUpFade 0.3s ease-out',
                transformOrigin: 'bottom left',
              }}
            >
              {/* Menu Header */}
              <div
                className="p-5 text-center relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #eab308 50%, #22c55e 100%)',
                }}
              >
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%)',
                  }}
                />
                <div className="relative z-10 flex items-center justify-center gap-3 mb-3">
                  <Crown className="w-8 h-8 text-white drop-shadow-lg" />
                  <div className="w-px h-8 bg-white opacity-40" />
                  <Shield className="w-8 h-8 text-white drop-shadow-lg" />
                </div>
                <p className="text-white font-bold text-lg drop-shadow-md relative z-10">لوحات التحكم</p>
                <p className="text-white text-xs opacity-80 mt-1 relative z-10">اختر نوع الحساب</p>
              </div>

              {/* Menu Options */}
              <div className="p-3">
                {/* Admin Option */}
                <button
                  onClick={() => {
                    setShowAdminMenu(false);
                    setAdminButtonExpanded(false);
                    if (onAdminLogin) onAdminLogin();
                  }}
                  className="w-full text-right px-5 py-4 hover:bg-amber-50 rounded-xl transition-all text-gray-800 font-bold text-base mb-2 flex items-center gap-3 group border-2 border-transparent hover:border-amber-200 active:scale-95"
                  style={{
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
                    style={{
                      boxShadow: '0 4px 12px rgba(251, 191, 36, 0.3)',
                    }}
                  >
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-lg font-bold text-amber-900">لوحة الإدارة</span>
                    <span className="text-xs text-gray-500">إدارة كاملة للمنصة</span>
                  </div>
                </button>

                {/* Farm Owner Option */}
                <button
                  onClick={() => {
                    setShowAdminMenu(false);
                    setAdminButtonExpanded(false);
                    if (onFarmOwnerLogin) onFarmOwnerLogin();
                  }}
                  className="w-full text-right px-5 py-4 hover:bg-green-50 rounded-xl transition-all text-gray-800 font-bold text-base flex items-center gap-3 group border-2 border-transparent hover:border-green-200 active:scale-95"
                  style={{
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
                    style={{
                      boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
                    }}
                  >
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-lg font-bold text-green-900">صاحب مزرعة</span>
                    <span className="text-xs text-gray-500">إدارة مزارعك</span>
                  </div>
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Keyframes for animation */}
      <style>
        {`
          @keyframes slideUpFade {
            from {
              opacity: 0;
              transform: translateY(20px) scale(0.9);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          @keyframes pulse {
            0%, 100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.1);
            }
          }
        `}
      </style>
    </div>
  );
}
