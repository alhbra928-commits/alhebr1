import { useState, useEffect } from 'react';
import { Bell, MessageCircle, Home, MapPin, Filter, TrendingUp, Search, ChevronDown, Shield, ArrowRight, Star, Zap, Sparkles, Crown } from 'lucide-react';
import { brandColors, brandGradients } from '../../modules/finance/styles/brandColors';

interface SmartHeaderProps {
  currentView?: string;
  notificationCount?: number;
  onNotificationClick?: () => void;
  onWhatsAppClick?: () => void;
  onLogoClick?: () => void;
  onFilterChange?: (filters: any) => void;
  onBackToAdmin?: () => void;
}

export function SmartHeader({
  currentView = 'home',
  notificationCount = 0,
  onNotificationClick,
  onWhatsAppClick,
  onLogoClick,
  onFilterChange,
  onBackToAdmin
}: SmartHeaderProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hasAdminSession, setHasAdminSession] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedFarmType, setSelectedFarmType] = useState('all');
  const [sortBy, setSortBy] = useState('latest');
  const [showFilters, setShowFilters] = useState(false);

  // Check for admin session
  useEffect(() => {
    const checkAdminSession = () => {
      // النظام يستخدم admin_session_token و admin_data
      const adminToken = localStorage.getItem('admin_session_token');
      const adminData = localStorage.getItem('admin_data');

      console.log('[SmartHeader] Checking session - Token:', !!adminToken, 'Data:', !!adminData);

      // Session exists if we have token or valid admin data
      let hasSession = false;
      if (adminToken || adminData) {
        try {
          if (adminData) {
            const data = JSON.parse(adminData);
            hasSession = !!(data && data.admin_name);
          } else if (adminToken) {
            hasSession = true;
          }
        } catch (e) {
          console.error('[SmartHeader] Error parsing admin data:', e);
        }
      }

      console.log('[SmartHeader] Has admin session:', hasSession, 'onBackToAdmin:', !!onBackToAdmin);
      setHasAdminSession(hasSession);
    };

    checkAdminSession();
    const interval = setInterval(checkAdminSession, 2000);
    window.addEventListener('storage', checkAdminSession);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', checkAdminSession);
    };
  }, [onBackToAdmin]);

  // Handle scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false); // Hide on scroll down
      } else {
        setIsVisible(true); // Show on scroll up
      }

      setIsScrolled(currentScrollY > 20);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Get view title dynamically
  const getViewTitle = () => {
    const titles: Record<string, string> = {
      home: 'الصفحة الرئيسية',
      investor: 'لوحة المستثمر',
      farms: 'مزارعي',
      reservations: 'الحجوزات',
      finance: 'المالية',
      documentation: 'الوثائق',
      settings: 'الإعدادات'
    };
    return titles[currentView] || 'منصة التملك';
  };

  const regions = [
    { value: 'all', label: 'جميع المناطق' },
    { value: 'riyadh', label: 'الرياض' },
    { value: 'qassim', label: 'القصيم' },
    { value: 'jouf', label: 'الجوف' }
  ];

  const farmTypes = [
    { value: 'all', label: 'جميع الأنواع' },
    { value: 'palm', label: 'نخيل' },
    { value: 'olive', label: 'زيتون' }
  ];

  const sortOptions = [
    { value: 'latest', label: 'الأحدث' },
    { value: 'highest', label: 'الأعلى قيمة' },
    { value: 'nearest', label: 'الأقرب' }
  ];

  const handleFilterChange = (type: string, value: string) => {
    const newFilters: any = {
      region: selectedRegion,
      farmType: selectedFarmType,
      sortBy: sortBy
    };

    if (type === 'region') {
      setSelectedRegion(value);
      newFilters.region = value;
    } else if (type === 'farmType') {
      setSelectedFarmType(value);
      newFilters.farmType = value;
    } else if (type === 'sortBy') {
      setSortBy(value);
      newFilters.sortBy = value;
    }

    onFilterChange?.(newFilters);
  };

  return (
    <>
      {/* Main Smart Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
        style={{
          background: isScrolled
            ? 'linear-gradient(135deg, rgba(160, 145, 106, 0.95) 0%, rgba(201, 169, 98, 0.95) 100%)'
            : 'linear-gradient(135deg, rgba(255, 248, 230, 0.90) 0%, rgba(255, 250, 240, 0.90) 100%)',
          backdropFilter: 'blur(20px)',
          boxShadow: isScrolled
            ? '0 8px 32px rgba(160, 145, 106, 0.3)'
            : '0 4px 20px rgba(212, 175, 55, 0.15)',
        }}
      >
        {/* Top Bar */}
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            {/* Logo & Platform Name */}
            <button
              onClick={onLogoClick}
              className="flex items-center gap-2 sm:gap-3 hover:scale-105 transition-transform duration-300 flex-shrink-0"
            >
              <div className="text-2xl sm:text-3xl">🌴</div>
              <div className="flex flex-col items-start">
                <h1
                  className="text-base sm:text-xl md:text-2xl font-black leading-tight"
                  style={{
                    background: brandGradients.gold,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    textShadow: '0 2px 10px rgba(212, 175, 55, 0.4)',
                    filter: 'drop-shadow(0 2px 4px rgba(212, 175, 55, 0.3))',
                  }}
                >
                  منصة التملك
                </h1>
                <p className="text-[10px] sm:text-xs text-gray-600 font-bold">النخيل والزيتون</p>
              </div>
            </button>

            {/* Center - Dynamic Title - Hidden on mobile */}
            <div className="hidden lg:block">
              <h2
                className="text-base font-bold px-5 py-2 rounded-full"
                style={{
                  background: 'rgba(255, 255, 255, 0.6)',
                  color: brandColors.text.primary,
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)'
                }}
              >
                {getViewTitle()}
              </h2>
            </div>

            {/* Right - Action Icons */}
            <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 flex-shrink-0">
              {console.log('[SmartHeader RENDER] hasAdminSession:', hasAdminSession, 'onBackToAdmin:', !!onBackToAdmin)}
              {/* Back to Admin Button - Shows only when admin session exists */}
              {hasAdminSession && onBackToAdmin && (
                <button
                  onClick={onBackToAdmin}
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl hover:scale-105 transition-all duration-300 group relative z-[60]"
                  style={{
                    background: 'linear-gradient(135deg, #fff 0%, #fffef8 100%)',
                    boxShadow: '0 2px 10px rgba(212, 175, 55, 0.4), 0 0 0 2px rgba(212, 175, 55, 0.15)',
                    border: `2px solid ${brandColors.primary.gold}`
                  }}
                  title="العودة للوحة الإدارة"
                >
                  <div
                    className="w-6 h-6 sm:w-8 sm:h-8 rounded-md sm:rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:rotate-6"
                    style={{
                      background: brandGradients.gold,
                      boxShadow: '0 2px 8px rgba(212, 175, 55, 0.4)'
                    }}
                  >
                    <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-white" strokeWidth={2.5} />
                  </div>
                  <div className="hidden sm:flex flex-col items-start">
                    <div className="flex items-center gap-1">
                      <ArrowRight
                        className="h-3 w-3 transition-transform duration-300 group-hover:-translate-x-1"
                        style={{ color: brandColors.primary.gold }}
                        strokeWidth={2.5}
                      />
                      <span
                        className="text-xs font-black whitespace-nowrap"
                        style={{ color: brandColors.text.primary }}
                      >
                        لوحة الإدارة
                      </span>
                    </div>
                  </div>
                </button>
              )}

              {/* Notifications */}
              <button
                onClick={onNotificationClick}
                className="relative p-2 sm:p-2.5 rounded-lg sm:rounded-xl hover:scale-110 transition-all duration-300"
                style={{
                  background: 'rgba(255, 255, 255, 0.7)',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)'
                }}
              >
                <Bell
                  className="h-4 w-4 sm:h-5 sm:w-5"
                  style={{ color: brandColors.primary.gold }}
                />
                {notificationCount > 0 && (
                  <div
                    className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 h-4 w-4 sm:h-5 sm:w-5 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold text-white animate-pulse"
                    style={{
                      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                      boxShadow: '0 0 10px rgba(239, 68, 68, 0.6)'
                    }}
                  >
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </div>
                )}
              </button>

              {/* WhatsApp Smart Button */}
              <button
                onClick={onWhatsAppClick}
                className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl hover:scale-110 transition-all duration-300 whatsapp-glow"
                style={{
                  background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                  boxShadow: '0 4px 15px rgba(37, 211, 102, 0.4)'
                }}
              >
                <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Innovative Ticker Bar */}
        <div
          className="relative overflow-hidden border-t border-b"
          style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.15) 100%)',
            borderColor: 'rgba(16, 185, 129, 0.2)',
          }}
        >
          <div className="ticker-container py-2.5">
            <div className="ticker-content">
              {/* Message 1 */}
              <div className="ticker-item">
                <Star className="w-4 h-4 text-emerald-600" fill="currentColor" />
                <span className="text-sm font-bold text-emerald-800">استثمر في مستقبل أخضر مستدام</span>
              </div>

              {/* Message 2 */}
              <div className="ticker-item">
                <Zap className="w-4 h-4 text-green-600" fill="currentColor" />
                <span className="text-sm font-bold text-green-800">عوائد سنوية مضمونة من أشجارك</span>
              </div>

              {/* Message 3 */}
              <div className="ticker-item">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span className="text-sm font-bold text-teal-800">ملكية موثقة ومضمونة قانونياً</span>
              </div>

              {/* Message 4 */}
              <div className="ticker-item">
                <Crown className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-bold text-emerald-800">تملك أشجار النخيل والزيتون الآن</span>
              </div>

              {/* Duplicate for seamless loop */}
              <div className="ticker-item">
                <Star className="w-4 h-4 text-emerald-600" fill="currentColor" />
                <span className="text-sm font-bold text-emerald-800">استثمر في مستقبل أخضر مستدام</span>
              </div>

              <div className="ticker-item">
                <Zap className="w-4 h-4 text-green-600" fill="currentColor" />
                <span className="text-sm font-bold text-green-800">عوائد سنوية مضمونة من أشجارك</span>
              </div>

              <div className="ticker-item">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span className="text-sm font-bold text-teal-800">ملكية موثقة ومضمونة قانونياً</span>
              </div>

              <div className="ticker-item">
                <Crown className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-bold text-emerald-800">تملك أشجار النخيل والزيتون الآن</span>
              </div>
            </div>
          </div>

          {/* Gradient Edges */}
          <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-white/80 to-transparent pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-white/80 to-transparent pointer-events-none" />
        </div>

        {/* Sub Header - Filter Chips */}
        <div
          className="border-t"
          style={{
            background: 'rgba(255, 255, 255, 0.4)',
            borderColor: 'rgba(212, 175, 55, 0.2)'
          }}
        >
          <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-2.5">
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-hide">
              {/* Search */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex-shrink-0 flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 hover:scale-105"
                style={{
                  background: showFilters
                    ? brandGradients.gold
                    : 'rgba(255, 255, 255, 0.8)',
                  color: showFilters ? 'white' : brandColors.text.primary,
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  border: `2px solid ${brandColors.primary.gold}40`
                }}
              >
                <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">بحث</span>
                <ChevronDown className={`h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>

              {/* Region Filter */}
              <select
                value={selectedRegion}
                onChange={(e) => handleFilterChange('region', e.target.value)}
                className="flex-shrink-0 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold cursor-pointer transition-all duration-300 hover:scale-105"
                style={{
                  background: 'rgba(255, 255, 255, 0.8)',
                  color: brandColors.text.primary,
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  border: `2px solid ${brandColors.primary.gold}40`,
                  outline: 'none'
                }}
              >
                {regions.map(region => (
                  <option key={region.value} value={region.value}>
                    📍 {region.label}
                  </option>
                ))}
              </select>

              {/* Farm Type Filter */}
              <select
                value={selectedFarmType}
                onChange={(e) => handleFilterChange('farmType', e.target.value)}
                className="flex-shrink-0 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold cursor-pointer transition-all duration-300 hover:scale-105"
                style={{
                  background: 'rgba(255, 255, 255, 0.8)',
                  color: brandColors.text.primary,
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  border: `2px solid ${brandColors.primary.gold}40`,
                  outline: 'none'
                }}
              >
                {farmTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    🌴 {type.label}
                  </option>
                ))}
              </select>

              {/* Sort Options */}
              <select
                value={sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="flex-shrink-0 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold cursor-pointer transition-all duration-300 hover:scale-105"
                style={{
                  background: 'rgba(255, 255, 255, 0.8)',
                  color: brandColors.text.primary,
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  border: `2px solid ${brandColors.primary.gold}40`,
                  outline: 'none'
                }}
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    📊 {option.label}
                  </option>
                ))}
              </select>

              {/* Filter Button - Hide on mobile */}
              <button
                className="hidden md:flex flex-shrink-0 items-center gap-2 px-4 py-2 rounded-full font-bold transition-all duration-300 hover:scale-105"
                style={{
                  background: 'rgba(255, 255, 255, 0.8)',
                  color: brandColors.text.primary,
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  border: `2px solid ${brandColors.primary.gold}40`
                }}
              >
                <Filter className="h-4 w-4" />
                <span>تصفية متقدمة</span>
              </button>
            </div>
          </div>
        </div>

      </header>

      {/* Spacer to prevent content jump - Responsive - Increased for ticker */}
      <div className="h-[130px] sm:h-[140px] md:h-[150px]" />

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        /* Ticker Animation */
        .ticker-container {
          width: 100%;
          overflow: hidden;
        }

        .ticker-content {
          display: flex;
          animation: ticker 30s linear infinite;
          will-change: transform;
        }

        .ticker-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0 3rem;
          white-space: nowrap;
          flex-shrink: 0;
        }

        @keyframes ticker {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .ticker-content:hover {
          animation-play-state: paused;
        }

        @keyframes whatsapp-pulse {
          0%, 100% {
            box-shadow: 0 4px 15px rgba(37, 211, 102, 0.4);
          }
          50% {
            box-shadow: 0 4px 25px rgba(37, 211, 102, 0.7), 0 0 30px rgba(37, 211, 102, 0.4);
          }
        }

        .whatsapp-glow {
          animation: whatsapp-pulse 2s ease-in-out infinite;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
