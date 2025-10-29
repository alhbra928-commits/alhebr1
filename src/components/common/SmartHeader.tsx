import { useState, useEffect } from 'react';
import { Bell, MessageCircle, Home, MapPin, Filter, TrendingUp, Search, Pause, Play, ChevronDown } from 'lucide-react';
import { brandColors, brandGradients } from '../../modules/finance/styles/brandColors';

interface SmartHeaderProps {
  currentView?: string;
  notificationCount?: number;
  onNotificationClick?: () => void;
  onWhatsAppClick?: () => void;
  onLogoClick?: () => void;
  onFilterChange?: (filters: any) => void;
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
  onFilterChange
}: SmartHeaderProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedFarmType, setSelectedFarmType] = useState('all');
  const [sortBy, setSortBy] = useState('latest');
  const [showFilters, setShowFilters] = useState(false);

  // Live activities للشريط المتحرك الدعائي
  const [activities] = useState<LiveActivity[]>([
    { id: '1', message: 'تم اعتماد حجز جديد في مزرعة رقم 104', icon: '🌴', timestamp: new Date() },
    { id: '2', message: 'تمت تسوية مالية لصاحب المزرعة فهد العتيبي', icon: '💰', timestamp: new Date() },
    { id: '3', message: 'تم إصدار شهادة تملك جديدة', icon: '🎖️', timestamp: new Date() },
    { id: '4', message: 'مستثمر جديد انضم للمنصة', icon: '👤', timestamp: new Date() },
    { id: '5', message: 'تم إضافة مزرعة زيتون جديدة في الجوف', icon: '🫒', timestamp: new Date() }
  ]);

  // Debug: التأكد من ظهور الـ Ticker
  useEffect(() => {
    console.log('🎫🎫🎫 [TICKER DEBUG] Activities Count:', activities.length);
    console.log('🎫 [TICKER] First Activity:', activities[0]?.message);
    console.log('🎫 [TICKER] isPaused:', isPaused);
    console.log('🎫 [TICKER] isVisible:', isVisible);
  }, [activities, isPaused, isVisible]);

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

        {/* Live Activity Ticker - شريط متحرك دعائي واضح */}
        <div
          className="border-t overflow-hidden relative cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, #FFF9E5 0%, #FFFAF0 100%)',
            borderTop: '2px solid #D4AF37',
            borderBottom: '1px solid rgba(212, 175, 55, 0.3)',
            height: '42px',
            boxShadow: 'inset 0 2px 4px rgba(212, 175, 55, 0.1)'
          }}
          onClick={() => {
            console.log('🎫 [TICKER] Clicked! Paused:', !isPaused);
            setIsPaused(!isPaused);
          }}
        >
          <div
            className={`flex items-center gap-8 ${isPaused ? '' : 'animate-scroll-ticker'} whitespace-nowrap`}
            style={{
              paddingRight: '100%',
              display: 'flex',
              alignItems: 'center',
              height: '100%'
            }}
          >
            {(() => {
              console.log('🎫 [TICKER RENDER] Rendering activities:', activities.length);
              return [...activities, ...activities, ...activities].map((activity, index) => (
                <div
                  key={`${activity.id}-${index}`}
                  className="flex items-center gap-2 text-sm font-bold"
                  style={{
                    color: '#8B5A2B',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  <span className="text-lg">{activity.icon}</span>
                  <span>{activity.message}</span>
                </div>
              ));
            })()}
          </div>

          {/* Pause/Play Button */}
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:scale-110 transition-transform"
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}
            onClick={(e) => {
              e.stopPropagation();
              setIsPaused(!isPaused);
            }}
          >
            {isPaused ? (
              <Play className="h-3 w-3" style={{ color: brandColors.primary.gold }} />
            ) : (
              <Pause className="h-3 w-3" style={{ color: brandColors.primary.gold }} />
            )}
          </button>
        </div>
      </header>

      {/* Spacer to prevent content jump - يحجز مساحة للهيدر + Ticker */}
      <div style={{ height: isScrolled ? '140px' : '156px' }} />

      <style>{`
        @keyframes scroll-ticker {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }

        .animate-scroll-ticker {
          animation: scroll-ticker 45s linear infinite;
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
