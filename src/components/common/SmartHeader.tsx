import { useState, useEffect } from 'react';
import { Bell, MessageCircle, Home, MapPin, Filter, TrendingUp, Search, Pause, Play, ChevronDown, Shield, ArrowRight } from 'lucide-react';
import { brandColors, brandGradients } from '../../modules/finance/styles/brandColors';
import { supabase } from '../../lib/supabase';

interface SmartHeaderProps {
  currentView?: string;
  notificationCount?: number;
  onNotificationClick?: () => void;
  onWhatsAppClick?: () => void;
  onLogoClick?: () => void;
  onFilterChange?: (filters: any) => void;
  onBackToAdmin?: () => void;
}

interface LiveActivity {
  id: string;
  message: string;
  icon: string;
  timestamp: Date;
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
  const [isPaused, setIsPaused] = useState(false);
  const [hasAdminSession, setHasAdminSession] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedFarmType, setSelectedFarmType] = useState('all');
  const [sortBy, setSortBy] = useState('latest');
  const [showFilters, setShowFilters] = useState(false);

  // Ticker settings from database
  const [tickerSettings, setTickerSettings] = useState<any>(null);
  const [tickerItems, setTickerItems] = useState<any[]>([]);
  const [activities, setActivities] = useState<LiveActivity[]>([
    { id: '1', message: 'تم اعتماد حجز جديد في مزرعة رقم 104', icon: '🌴', timestamp: new Date() },
    { id: '2', message: 'تمت تسوية مالية لصاحب المزرعة فهد العتيبي', icon: '💰', timestamp: new Date() },
    { id: '3', message: 'تم إصدار شهادة تملك جديدة', icon: '🎖️', timestamp: new Date() },
    { id: '4', message: 'مستثمر جديد انضم للمنصة', icon: '👤', timestamp: new Date() },
    { id: '5', message: 'تم إضافة مزرعة زيتون جديدة في الجوف', icon: '🫒', timestamp: new Date() }
  ]);

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

  // Load ticker settings from database
  useEffect(() => {
    const loadTickerSettings = async () => {
      try {
        const { data: settings } = await supabase
          .from('ticker_settings')
          .select('*')
          .limit(1)
          .maybeSingle();

        if (settings) {
          setTickerSettings(settings);
        }

        const { data: items } = await supabase
          .from('ticker_items')
          .select('*')
          .eq('is_active', true)
          .order('sort_order');

        if (items && items.length > 0) {
          setTickerItems(items);
          // Convert ticker items to activities
          const convertedActivities = items.map((item: any) => ({
            id: item.id,
            message: item.label,
            icon: item.icon === 'TrendingUp' ? '📈' : item.icon === 'BarChart3' ? '📊' : item.icon === 'Calendar' ? '📅' : item.icon === 'Users' ? '👥' : '🌴',
            timestamp: new Date()
          }));
          setActivities(convertedActivities);
        }
      } catch (error) {
        console.error('Error loading ticker settings:', error);
      }
    };

    loadTickerSettings();

    // Realtime subscription
    const channel = supabase
      .channel('ticker-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ticker_settings' }, loadTickerSettings)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ticker_items' }, loadTickerSettings)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo & Platform Name */}
            <button
              onClick={onLogoClick}
              className="flex items-center gap-3 hover:scale-105 transition-transform duration-300"
            >
              <div className="text-3xl">🌴</div>
              <div className="flex flex-col items-start">
                <h1
                  className="text-xl md:text-2xl font-black leading-tight"
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
                <p className="text-xs text-gray-600 font-bold">النخيل والزيتون</p>
              </div>
            </button>

            {/* Center - Dynamic Title */}
            <div className="hidden md:block">
              <h2
                className="text-lg font-bold px-6 py-2 rounded-full"
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
            <div className="flex items-center gap-3">
              {console.log('[SmartHeader RENDER] hasAdminSession:', hasAdminSession, 'onBackToAdmin:', !!onBackToAdmin)}
              {/* Back to Admin Button - Shows only when admin session exists */}
              {hasAdminSession && onBackToAdmin && (
                <button
                  onClick={onBackToAdmin}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:scale-105 transition-all duration-300 group relative z-[60]"
                  style={{
                    background: 'linear-gradient(135deg, #fff 0%, #fffef8 100%)',
                    boxShadow: '0 4px 20px rgba(212, 175, 55, 0.5), 0 0 0 3px rgba(212, 175, 55, 0.2)',
                    border: `3px solid ${brandColors.primary.gold}`
                  }}
                  title="العودة للوحة الإدارة"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:rotate-6"
                    style={{
                      background: brandGradients.gold,
                      boxShadow: '0 2px 8px rgba(212, 175, 55, 0.4)'
                    }}
                  >
                    <Shield className="h-4 w-4 text-white" strokeWidth={2.5} />
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
                className="relative p-2.5 rounded-xl hover:scale-110 transition-all duration-300"
                style={{
                  background: 'rgba(255, 255, 255, 0.7)',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)'
                }}
              >
                <Bell
                  className="h-5 w-5"
                  style={{ color: brandColors.primary.gold }}
                />
                {notificationCount > 0 && (
                  <div
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold text-white animate-pulse"
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
                className="p-2.5 rounded-xl hover:scale-110 transition-all duration-300 whatsapp-glow"
                style={{
                  background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                  boxShadow: '0 4px 15px rgba(37, 211, 102, 0.4)'
                }}
              >
                <MessageCircle className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Sub Header - Filter Chips */}
        <div
          className="border-t"
          style={{
            background: 'rgba(255, 255, 255, 0.4)',
            borderColor: 'rgba(212, 175, 55, 0.2)'
          }}
        >
          <div className="max-w-7xl mx-auto px-4 py-2.5">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
              {/* Search */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all duration-300 hover:scale-105"
                style={{
                  background: showFilters
                    ? brandGradients.gold
                    : 'rgba(255, 255, 255, 0.8)',
                  color: showFilters ? 'white' : brandColors.text.primary,
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  border: `2px solid ${brandColors.primary.gold}40`
                }}
              >
                <Search className="h-4 w-4" />
                <span>بحث</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>

              {/* Region Filter */}
              <select
                value={selectedRegion}
                onChange={(e) => handleFilterChange('region', e.target.value)}
                className="flex-shrink-0 px-4 py-2 rounded-full font-bold cursor-pointer transition-all duration-300 hover:scale-105"
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
                className="flex-shrink-0 px-4 py-2 rounded-full font-bold cursor-pointer transition-all duration-300 hover:scale-105"
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
                className="flex-shrink-0 px-4 py-2 rounded-full font-bold cursor-pointer transition-all duration-300 hover:scale-105"
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

              {/* Filter Button */}
              <button
                className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all duration-300 hover:scale-105"
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

        {/* شريط الإعلانات المتحرك - Ticker */}
        {(!tickerSettings || tickerSettings.is_enabled) && (
          <div
            className="overflow-hidden relative pointer-events-none"
            style={{
              background: tickerSettings?.background_color || (isScrolled
                ? 'linear-gradient(90deg, rgba(212, 175, 55, 0.95) 0%, rgba(184, 134, 11, 0.95) 100%)'
                : 'linear-gradient(90deg, rgba(212, 175, 55, 0.85) 0%, rgba(184, 134, 11, 0.85) 100%)'),
              borderTop: '1px solid rgba(255, 255, 255, 0.2)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              height: `${tickerSettings?.height || 36}px`,
              backdropFilter: 'blur(10px)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)'
            }}
          >
            <div
              className="flex items-center h-full whitespace-nowrap pointer-events-none"
              style={{
                animation: isPaused ? 'none' : `ticker-scroll ${tickerSettings?.speed || 30}s linear infinite`,
              }}
            >
              {[...activities, ...activities].map((activity, index) => (
                <div
                  key={`${activity.id}-${index}`}
                  className="flex items-center gap-2 px-6 pointer-events-none"
                  style={{
                    color: tickerSettings?.text_color || 'rgba(255, 255, 255, 0.95)',
                    fontSize: '13px',
                    fontWeight: '600',
                    textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                    pointerEvents: 'none',
                    userSelect: 'none'
                  }}
                >
                  <span className="text-base pointer-events-none">{activity.icon}</span>
                  <span className="pointer-events-none">{activity.message}</span>
                  <span className="pointer-events-none" style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '12px', margin: '0 8px' }}>•</span>
                </div>
              ))}
            </div>

            {/* زر التحكم */}
            <button
              className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center hover:scale-110 transition-transform pointer-events-auto"
              style={{
                background: 'rgba(255, 255, 255, 0.25)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
              }}
              onClick={() => setIsPaused(!isPaused)}
            >
              {isPaused ? (
                <Play className="h-3 w-3" style={{ color: 'white' }} />
              ) : (
                <Pause className="h-3 w-3" style={{ color: 'white' }} />
              )}
            </button>
          </div>
        )}
      </header>

      {/* Spacer to prevent content jump */}
      <div style={{ height: '132px' }} />

      <style>{`
        @keyframes ticker-scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        /* Ensure ticker doesn't block scroll */
        .overflow-hidden.relative.pointer-events-none {
          pointer-events: none !important;
        }

        .overflow-hidden.relative.pointer-events-none * {
          pointer-events: none !important;
        }

        .overflow-hidden.relative.pointer-events-none .pointer-events-auto {
          pointer-events: auto !important;
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
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
