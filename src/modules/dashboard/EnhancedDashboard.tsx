import React, { useEffect, useState } from 'react';
import {
  MapPin,
  Calendar,
  Wallet,
  Users,
  Building,
  Award,
  TrendingUp,
  Settings,
  Sprout,
  Shield,
  LogOut,
  Globe,
  Maximize2,
  Minimize2,
  MessageCircle
} from 'lucide-react';
import { DashboardService } from './dashboardService';
import { AdminSessionService } from '../admin/services/adminSessionService';
import { LogoutConfirmationModal } from '../admin/components/LogoutConfirmationModal';
import { SessionTerminatedMessage } from '../admin/components/SessionTerminatedMessage';
import { LiveFinancialSystem } from '../../services/liveFinancialSystem';
import { NotificationSoundControl } from '../../components/common/NotificationSoundControl';
import { SmartFloatingWhatsApp } from '../../components/common/SmartFloatingWhatsApp';
import { floatingWhatsAppService } from '../../services/floatingWhatsAppService';
import { usePermissions } from '../../contexts/PermissionsContext';
import { supabase } from '../../lib/supabase';

interface EnhancedDashboardProps {
  onModuleSelect: (moduleId: string) => void;
  activeModule: string;
  onLogout?: () => void;
  onGoToPublic?: () => void;
  onShowLogin?: () => void;
}

export function EnhancedDashboard({ onModuleSelect, onLogout, onGoToPublic, onShowLogin }: EnhancedDashboardProps) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false); // ✅ false للعرض الفوري
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showSessionTerminated, setShowSessionTerminated] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [adminInfo, setAdminInfo] = useState<any>(null);

  const { canAccessModule, isAdmin, loading: permissionsLoading } = usePermissions();

  useEffect(() => {
    // تحميل سريع: معلومات المدير من localStorage أولاً
    loadAdminInfoFromLocalStorage();

    // تحميل الإحصائيات في الخلفية (بدون انتظار)
    loadStats();

    // تحميل معلومات المدير من Database في الخلفية
    loadAdminInfoFromDB();
  }, []);

  const loadAdminInfoFromLocalStorage = () => {
    // تحميل فوري من localStorage (0ms)
    try {
      const { admin } = AdminSessionService.getCurrentSession();
      if (admin) {
        setAdminInfo({
          phone: admin.phone,
          name: admin.name,
          jobTitle: admin.jobTitle,
          jobTitleEn: admin.jobTitleEn,
          role: admin.role,
        });
      }
    } catch (err) {
      // تجاهل الأخطاء
    }
  };

  const loadAdminInfoFromDB = async () => {
    // تعطيل - نستخدم localStorage فقط لتسريع التحميل
    // Database queries تسبب بطء شديد
    return;
  };

  // الاستماع لتغيرات وضع ملء الشاشة
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const loadStats = async () => {
    try {
      // عرض الصفحة فوراً بدون انتظار
      setLoading(false);

      // تحميل الإحصائيات في الخلفية
      const data = await DashboardService.getOverallStatistics();
      setStats(data);
    } catch (err) {
      // Database غير متوفر - لا مشكلة
      setStats(null);
    }
  };

  // التحكم في وضع ملء الشاشة
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const modules = [
    {
      id: 'owners',
      title: 'أصحاب المزارع',
      subtitle: 'إدارة أصحاب المزارع',
      value: stats?.owners?.total || 0,
      icon: Building,
      gradient: 'linear-gradient(135deg, #C89B3C 0%, #E8C170 100%)',
      bgColor: 'bg-gradient-to-br from-[#C89B3C]/10 to-[#E8C170]/10',
    },
    {
      id: 'farms',
      title: 'المزارع',
      subtitle: 'إدارة المزارع والأشجار',
      value: stats?.farms?.total || 0,
      icon: MapPin,
      gradient: 'linear-gradient(135deg, #3D5B4B 0%, #5A8672 100%)',
      bgColor: 'bg-gradient-to-br from-[#3D5B4B]/10 to-[#5A8672]/10',
    },
    {
      id: 'reservations',
      title: 'الحجوزات',
      subtitle: 'متابعة الحجوزات والعقود',
      value: stats?.reservations?.total || 0,
      icon: Calendar,
      gradient: 'linear-gradient(135deg, #C89B3C 0%, #D4AF37 100%)',
      bgColor: 'bg-gradient-to-br from-[#C89B3C]/10 to-[#D4AF37]/10',
    },
    {
      id: 'investors',
      title: 'المستثمرون',
      subtitle: 'إدارة حسابات المستثمرين',
      value: stats?.users?.totalInvestors || 0,
      icon: Users,
      gradient: 'linear-gradient(135deg, #8B7355 0%, #A68968 100%)',
      bgColor: 'bg-gradient-to-br from-[#8B7355]/10 to-[#A68968]/10',
    },
    {
      id: 'finance',
      title: 'النظام المالي الذكي',
      subtitle: `${(stats?.revenue?.total || 0).toLocaleString('ar-SA')} ريال`,
      value: stats?.farms?.total || 0,
      icon: Wallet,
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      bgColor: 'bg-gradient-to-br from-emerald-500/10 to-emerald-600/10',
    },
    {
      id: 'agriculture',
      title: 'الخدمات الزراعية',
      subtitle: 'المعاملات والمنتجات الزراعية',
      value: 0,
      icon: Sprout,
      gradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
      bgColor: 'bg-gradient-to-br from-green-500/10 to-green-600/10',
    },
    {
      id: 'documentation',
      title: 'التوثيق',
      subtitle: 'إصدار شهادات الملكية',
      value: stats?.documentation?.total || 0,
      icon: Award,
      gradient: 'linear-gradient(135deg, #D4AF37 0%, #F4EBDD 100%)',
      bgColor: 'bg-gradient-to-br from-[#D4AF37]/10 to-[#F4EBDD]/10',
    },
    {
      id: 'marketing',
      title: 'التسويق',
      subtitle: 'متابعة الحملات التسويقية',
      value: 0,
      icon: TrendingUp,
      gradient: 'linear-gradient(135deg, #8B7355 0%, #C89B3C 100%)',
      bgColor: 'bg-gradient-to-br from-[#8B7355]/10 to-[#C89B3C]/10',
    },
    {
      id: 'permissions',
      title: 'الرقابة والصلاحيات',
      subtitle: 'إدارة المستخدمين والصلاحيات',
      value: 0,
      icon: Shield,
      gradient: 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)',
      bgColor: 'bg-gradient-to-br from-red-600/10 to-red-500/10',
    },
    {
      id: 'whatsapp',
      title: 'مركز الاتصالات والواتساب',
      subtitle: 'إدارة الرسائل والإشعارات',
      value: 0,
      icon: MessageCircle,
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      bgColor: 'bg-gradient-to-br from-green-500/10 to-emerald-600/10',
    },
    {
      id: 'settings',
      title: 'الإعدادات',
      subtitle: `${stats?.admins?.total || 0} مدير نشط`,
      value: stats?.admins?.total || 0,
      icon: Settings,
      gradient: 'linear-gradient(135deg, #3D5B4B 0%, #5A8672 100%)',
      bgColor: 'bg-gradient-to-br from-[#3D5B4B]/10 to-[#5A8672]/10',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9F8F6]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#C89B3C] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-[#2C2C2C] font-medium">جاري تحميل لوحة التحكم...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F8F6]" dir="rtl">
      <div className="relative">
        <div className="bg-gradient-to-r from-[#C89B3C] to-[#D4AF37] shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl">
                  <MapPin className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
                    لوحة التحكم الرئيسية
                  </h1>
                  <p className="text-white/90 text-xs sm:text-sm">منصة تملك النخيل والزيتون</p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                {/* زر ملء الشاشة */}
                <button
                  onClick={toggleFullscreen}
                  className="group relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl font-bold text-white transition-all hover:scale-105 active:scale-95 text-sm sm:text-base"
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)',
                  }}
                  title={isFullscreen ? 'الخروج من ملء الشاشة' : 'ملء الشاشة'}
                >
                  {isFullscreen ? (
                    <Minimize2 className="h-4 w-4 sm:h-5 sm:w-5" />
                  ) : (
                    <Maximize2 className="h-4 w-4 sm:h-5 sm:w-5" />
                  )}
                  <span className="hidden sm:inline">
                    {isFullscreen ? 'خروج' : 'ملء الشاشة'}
                  </span>
                </button>

                {/* زر استكشاف المنصة */}
                <button
                  onClick={() => {
                    if (onGoToPublic) {
                      const { admin } = AdminSessionService.getCurrentSession();
                      AdminSessionService.addAccessLog(
                        admin?.phone || '',
                        admin?.name || '',
                        'explore_platform',
                        'تحول إلى وضع الزائر - استكشاف المنصة',
                        'success'
                      );
                      onGoToPublic();
                    }
                  }}
                  className="group relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-bold sm:font-black text-white transition-all hover:scale-105 active:scale-95 overflow-hidden text-sm sm:text-base"
                  style={{
                    background: 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)',
                    boxShadow: '0 4px 20px rgba(212, 175, 55, 0.5)',
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  <Globe className="relative h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:rotate-12" />
                  <span className="relative hidden sm:inline">🌍 استكشاف المنصة</span>
                  <span className="relative sm:hidden">🌍</span>
                </button>

                {/* زر إنهاء الجلسة */}
                <button
                  onClick={async () => {
                    const { token, admin } = AdminSessionService.getCurrentSession();
                    if (token) {
                      await AdminSessionService.terminateSession(token);
                      await AdminSessionService.addAccessLog(
                        admin?.phone || '',
                        admin?.name || '',
                        'session_terminated',
                        'إنهاء الجلسة يدوياً من المستخدم',
                        'success'
                      );
                    }
                    setShowSessionTerminated(true);
                  }}
                  className="group relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-bold sm:font-black text-white transition-all hover:scale-105 active:scale-95 overflow-hidden text-sm sm:text-base"
                  style={{
                    background: 'linear-gradient(135deg, #6B7280 0%, #9CA3AF 100%)',
                    boxShadow: '0 4px 20px rgba(107, 114, 128, 0.4)',
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  <div className="relative flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-white/20">
                    <span className="text-xs">🛑</span>
                  </div>
                  <span className="relative hidden sm:inline">إنهاء الجلسة</span>
                  <span className="relative sm:hidden">🛑</span>
                </button>

                {/* زر خروج */}
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="group relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-bold sm:font-black text-white transition-all hover:scale-105 active:scale-95 overflow-hidden text-sm sm:text-base"
                  style={{
                    background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                    boxShadow: '0 4px 20px rgba(239, 68, 68, 0.5)',
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  <LogOut className="relative h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="relative hidden sm:inline">خروج</span>
                </button>

                <div className="hidden lg:flex px-3 sm:px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl items-center gap-2">
                  <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-white text-xs sm:text-sm font-medium">9 وحدات نشطة</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
          {/* بطاقة تعريف الموظف */}
          {adminInfo && (
            <div className="mb-6 bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-[#C89B3C] to-[#D4AF37] px-6 py-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1">
                      {adminInfo.name || 'مدير النظام'}
                    </h3>
                    <div className="flex items-center gap-4 text-white/90 text-sm">
                      <span className="flex items-center gap-2">
                        📱 {adminInfo.phone}
                      </span>
                      <span className="flex items-center gap-2">
                        💼 {adminInfo.jobTitle || 'موظف'}
                      </span>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg">
                    <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-white text-sm font-medium">متصل</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {modules.map((module, index) => {
              const Icon = module.icon;
              const isHovered = hoveredCard === module.id;

              // إذا لا يزال يحمل - عرض الكل
              if (permissionsLoading) {
                // لا نخفي شيء أثناء التحميل
              } else {
                // بعد التحميل: تحقق من الصلاحيات
                const hasAccess = isAdmin || canAccessModule(module.id);
                if (!hasAccess) {
                  return null;
                }
              }

              return (
                <div
                  key={module.id}
                  className="animate-fade-in-up"
                  style={{
                    animationDelay: `${index * 80}ms`,
                    animationFillMode: 'backwards',
                  }}
                >
                  <button
                    onClick={() => onModuleSelect(module.id)}
                    onMouseEnter={() => setHoveredCard(module.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                    className={`
                      w-full p-4 sm:p-5 lg:p-6 rounded-2xl sm:rounded-3xl transition-all duration-500 ease-out
                      ${module.bgColor}
                      ${isHovered ? 'shadow-2xl scale-105' : 'shadow-lg'}
                      border-2 border-transparent
                      ${isHovered ? 'border-[#C89B3C]' : ''}
                      hover:bg-white/80
                      backdrop-blur-sm
                      transform
                      group
                      relative
                      overflow-hidden
                    `}
                  >
                    <div className={`
                      absolute inset-0 bg-gradient-to-br from-[#C89B3C]/0 to-[#C89B3C]/10
                      opacity-0 group-hover:opacity-100 transition-opacity duration-500
                    `}></div>

                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className={`
                            w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center
                            shadow-lg transition-all duration-500
                            ${isHovered ? 'scale-110 rotate-6' : ''}
                          `}
                          style={{
                            background: module.gradient,
                          }}
                        >
                          <Icon className="h-8 w-8 text-white" />
                        </div>
                        <div
                          className={`
                            px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-xl
                            transition-all duration-300
                            ${isHovered ? 'scale-110' : ''}
                          `}
                        >
                          <span className="text-2xl font-bold text-[#C89B3C]">
                            {module.value}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <h3 className="text-xl font-bold text-[#2C2C2C] mb-1 group-hover:text-[#C89B3C] transition-colors">
                          {module.title}
                        </h3>
                        <p className="text-sm text-[#2C2C2C]/70">
                          {module.subtitle}
                        </p>
                      </div>

                      <div className={`
                        mt-4 h-1 bg-gradient-to-r from-[#C89B3C]/20 to-transparent rounded-full
                        transition-all duration-500
                        ${isHovered ? 'from-[#C89B3C] scale-105' : ''}
                      `}></div>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>

          <div className="mt-8 sm:mt-10 lg:mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="p-4 sm:p-5 lg:p-6 bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-lg border-2 border-[#C89B3C]/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-[#2C2C2C]">إجمالي الإيرادات</h3>
                <div className="w-12 h-12 bg-gradient-to-br from-[#C89B3C] to-[#E8C170] rounded-xl flex items-center justify-center">
                  <Wallet className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="text-3xl font-black text-[#C89B3C]">
                {(stats?.revenue?.total || 0).toLocaleString('ar-SA')} ريال
              </p>
              <p className="text-sm text-[#2C2C2C]/70 mt-2">من جميع الحجوزات</p>
            </div>

            <div className="p-4 sm:p-5 lg:p-6 bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-lg border-2 border-[#3D5B4B]/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-[#2C2C2C]">إجمالي الأشجار</h3>
                <div className="w-12 h-12 bg-gradient-to-br from-[#3D5B4B] to-[#5A8672] rounded-xl flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="text-3xl font-black text-[#3D5B4B]">
                {(stats?.farms?.totalTrees || 0).toLocaleString('ar-SA')}
              </p>
              <p className="text-sm text-[#2C2C2C]/70 mt-2">في جميع المزارع</p>
            </div>

            <div className="p-4 sm:p-5 lg:p-6 bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-lg border-2 border-[#8B7355]/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-[#2C2C2C]">الأشجار المتاحة</h3>
                <div className="w-12 h-12 bg-gradient-to-br from-[#8B7355] to-[#A68968] rounded-xl flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="text-3xl font-black text-[#8B7355]">
                {(stats?.farms?.availableTrees || 0).toLocaleString('ar-SA')}
              </p>
              <p className="text-sm text-[#2C2C2C]/70 mt-2">جاهزة للحجز</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }

        @keyframes shimmer {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }

        .group:hover .animate-shimmer {
          animation: shimmer 2s infinite;
          background-size: 200% 100%;
        }
      `}</style>

      {/* نافذة تأكيد الخروج */}
      {showLogoutConfirm && (
        <LogoutConfirmationModal
          onConfirm={async () => {
            const { token, admin } = AdminSessionService.getCurrentSession();
            if (token) {
              await AdminSessionService.terminateSession(token);
              await AdminSessionService.addAccessLog(
                admin?.phone || '',
                admin?.name || '',
                'logout',
                'خروج يدوي من لوحة الإدارة',
                'success'
              );
            }
            setShowLogoutConfirm(false);
            if (onLogout) onLogout();
          }}
          onCancel={() => setShowLogoutConfirm(false)}
        />
      )}

      {/* رسالة إنهاء الجلسة */}
      {showSessionTerminated && (
        <SessionTerminatedMessage
          onLoginAgain={() => {
            setShowSessionTerminated(false);
            if (onShowLogin) onShowLogin();
          }}
        />
      )}

      {/* التحكم في الإشعارات الصوتية */}
      <NotificationSoundControl />

      {/* زر الواتساب العائم الذكي */}
      <SmartFloatingWhatsApp
        context={{
          userType: 'admin',
          currentPage: 'admin-dashboard',
          sessionId: floatingWhatsAppService.getSessionId()
        }}
      />
    </div>
  );
}
