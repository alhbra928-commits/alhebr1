import { useState, useEffect } from 'react';
import {
  Star, Crown, Sparkles
} from 'lucide-react';
import { PublicFarm } from '../types/farm.types';
import { PublicFarmService } from '../services/publicFarmService';
import { FarmDetailPage } from './FarmDetailPage';
import { TemporaryBookingPage } from './TemporaryBookingPage';
import { InvestorRouter } from '../../investor/components/InvestorRouter';
import { CertificateVerificationPage } from './CertificateVerificationPage';
import { BackToAdminButton } from './BackToAdminButton';
import { ConceptIntroductionPage } from './ConceptIntroductionPage';
import { PublicBottomNavBar } from '../../../components/layout/PublicBottomNavBar';
import { GreenConceptButton } from './GreenConceptButton';
import { InnovativeFarmCard } from './InnovativeFarmCard';

type ViewMode = 'home' | 'farmDetail' | 'booking' | 'investor' | 'verification' | 'concept';

interface ModernRoyalPlatformProps {
  onAdminLogin?: () => void;
  onBackToAdmin?: () => void;
  onFarmOwnerLogin?: () => void;
}

export function ModernRoyalPlatform({
  onAdminLogin,
  onBackToAdmin,
  onFarmOwnerLogin,
}: ModernRoyalPlatformProps) {
  const [farms, setFarms] = useState<PublicFarm[]>([]);
  const [currentView, setCurrentView] = useState<ViewMode>('home');
  const [selectedFarm, setSelectedFarm] = useState<PublicFarm | null>(null);
  const [loading, setLoading] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const loadData = async () => {
    try {
      const farmsData = await PublicFarmService.getAllFarms();
      setFarms(farmsData);
    } catch (error) {
      console.error('Error loading farms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFarmClick = (farm: PublicFarm) => {
    setSelectedFarm(farm);
    setCurrentView('farmDetail');
  };

  const handleGoHome = () => {
    setCurrentView('home');
    setSelectedFarm(null);
  };

  // Handle other views
  if (currentView === 'concept') {
    return (
      <>
        <ConceptIntroductionPage onClose={handleGoHome} onStartJourney={handleGoHome} />
        <PublicBottomNavBar
          activeTab="concept"
          onTabChange={(tabId) => {
            if (tabId === 'home') handleGoHome();
            else if (tabId === 'login') setCurrentView('investor');
          }}
          onBookNow={() => farms.length > 0 && handleFarmClick(farms[0])}
          onBackToAdmin={onBackToAdmin}
        />
      </>
    );
  }

  if (currentView === 'verification') {
    return (
      <>
        <CertificateVerificationPage onBack={handleGoHome} />
        <PublicBottomNavBar
          activeTab="home"
          onTabChange={(tabId) => {
            if (tabId === 'home') handleGoHome();
            else if (tabId === 'login') setCurrentView('investor');
          }}
          onBookNow={() => farms.length > 0 && handleFarmClick(farms[0])}
          onBackToAdmin={onBackToAdmin}
        />
      </>
    );
  }

  if (currentView === 'investor') {
    return <InvestorRouter onBack={handleGoHome} />;
  }

  if (currentView === 'farmDetail' && selectedFarm) {
    return (
      <>
        <FarmDetailPage
          farmId={selectedFarm.id}
          onBack={handleGoHome}
          onStartBooking={() => setCurrentView('booking')}
        />
        <PublicBottomNavBar
          activeTab="home"
          onTabChange={(tabId) => {
            if (tabId === 'home') handleGoHome();
            else if (tabId === 'login') setCurrentView('investor');
          }}
          onBookNow={() => setCurrentView('booking')}
          onBackToAdmin={onBackToAdmin}
        />
      </>
    );
  }

  if (currentView === 'booking' && selectedFarm) {
    return (
      <>
        <TemporaryBookingPage
          farmId={selectedFarm.id}
          farmName={selectedFarm.farm_name}
          farmType={selectedFarm.tree_type === 'نخيل' ? 'palm' : 'olive'}
          onBack={() => setCurrentView('farmDetail')}
          onSuccess={handleGoHome}
          onGoHome={handleGoHome}
          onGoToInvestor={() => setCurrentView('investor')}
        />
        <PublicBottomNavBar
          activeTab="home"
          onTabChange={(tabId) => {
            if (tabId === 'home') handleGoHome();
            else if (tabId === 'login') setCurrentView('investor');
          }}
          onBookNow={() => {}}
          onBackToAdmin={onBackToAdmin}
        />
      </>
    );
  }

  // Modern Home View
  return (
    <div
      className="min-h-screen overflow-hidden relative"
      style={{
        background: `
          radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(16, 185, 129, 0.08) 0%, transparent 50%),
          linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #bbf7d0 100%)
        `
      }}
    >
      {/* Glass Overlay - Simple and Clean */}
      <div className="fixed inset-0 bg-white/30 backdrop-blur-[2px] pointer-events-none"></div>

      {/* Content */}
      <div className="relative z-10">
        {/* Hero Header */}
        <header className="relative overflow-hidden pt-6 pb-4">
          {/* Glass Background */}
          <div className="absolute inset-0 bg-white/40 backdrop-blur-xl"></div>

          <div className="relative container mx-auto px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
              {/* Logo & Title */}
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="relative group">
                  <div className="absolute -inset-2 bg-gradient-to-r from-emerald-400 via-green-500 to-teal-500 rounded-full blur-xl opacity-60 group-hover:opacity-80 transition-opacity"></div>
                  <div className="relative bg-gradient-to-br from-emerald-500 to-green-600 p-3 sm:p-4 rounded-2xl shadow-2xl">
                    <Crown className="w-8 h-8 sm:w-10 sm:h-10 text-white" strokeWidth={2.5} />
                    <div className="absolute -top-1 -right-1">
                      <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-300 animate-pulse" />
                    </div>
                  </div>
                </div>

                <div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-800 via-green-700 to-teal-800 bg-clip-text text-transparent">
                    منصة الملكية الزراعية
                  </h1>
                </div>
              </div>

              {onBackToAdmin && (
                <BackToAdminButton onBackToAdmin={onBackToAdmin} />
              )}
            </div>
          </div>
        </header>

        {/* Innovative Ticker Bar - Below Title */}
        <div className="relative overflow-hidden border-t border-b bg-gradient-to-r from-emerald-50/80 via-green-50/80 to-teal-50/80 backdrop-blur-sm">
          <div className="ticker-container-main py-3">
            <div className="ticker-content-main">
              {/* Message 1 */}
              <div className="ticker-item-main">
                <Star className="w-5 h-5 text-emerald-600" fill="currentColor" />
                <span className="text-sm sm:text-base font-bold text-emerald-800">استثمر في مستقبل أخضر مستدام</span>
              </div>

              {/* Message 2 */}
              <div className="ticker-item-main">
                <Sparkles className="w-5 h-5 text-green-600" />
                <span className="text-sm sm:text-base font-bold text-green-800">عوائد سنوية مضمونة من أشجارك</span>
              </div>

              {/* Message 3 */}
              <div className="ticker-item-main">
                <Crown className="w-5 h-5 text-teal-600" />
                <span className="text-sm sm:text-base font-bold text-teal-800">ملكية موثقة ومضمونة قانونياً</span>
              </div>

              {/* Message 4 */}
              <div className="ticker-item-main">
                <Star className="w-5 h-5 text-emerald-600" fill="currentColor" />
                <span className="text-sm sm:text-base font-bold text-emerald-800">تملك أشجار النخيل والزيتون الآن</span>
              </div>

              {/* Duplicate for seamless loop */}
              <div className="ticker-item-main">
                <Star className="w-5 h-5 text-emerald-600" fill="currentColor" />
                <span className="text-sm sm:text-base font-bold text-emerald-800">استثمر في مستقبل أخضر مستدام</span>
              </div>

              <div className="ticker-item-main">
                <Sparkles className="w-5 h-5 text-green-600" />
                <span className="text-sm sm:text-base font-bold text-green-800">عوائد سنوية مضمونة من أشجارك</span>
              </div>

              <div className="ticker-item-main">
                <Crown className="w-5 h-5 text-teal-600" />
                <span className="text-sm sm:text-base font-bold text-teal-800">ملكية موثقة ومضمونة قانونياً</span>
              </div>

              <div className="ticker-item-main">
                <Star className="w-5 h-5 text-emerald-600" fill="currentColor" />
                <span className="text-sm sm:text-base font-bold text-emerald-800">تملك أشجار النخيل والزيتون الآن</span>
              </div>
            </div>
          </div>

          {/* Gradient Edges */}
          <div className="absolute inset-y-0 left-0 w-16 sm:w-24 bg-gradient-to-r from-white/90 to-transparent pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-16 sm:w-24 bg-gradient-to-l from-white/90 to-transparent pointer-events-none" />
        </div>

        {/* Concept Button */}
        <GreenConceptButton onClick={() => setCurrentView('concept')} />

        {/* Main Content */}
        <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12 pb-24 sm:pb-32">
          {/* Farms Grid */}
          <div>
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-800 to-green-700 bg-clip-text text-transparent">
                المزارع المتاحة
              </h2>
              <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/60 backdrop-blur-xl rounded-full border border-emerald-200">
                <Star className="w-4 h-4 text-emerald-600" fill="currentColor" />
                <span className="text-sm font-semibold text-emerald-700">{farms.length} مزرعة متاحة</span>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-emerald-700 font-medium">جاري تحميل المزارع...</p>
                </div>
              </div>
            ) : farms.length === 0 ? (
              <div className="text-center py-20">
                <div className="inline-flex p-6 bg-white/60 backdrop-blur-xl rounded-3xl mb-4">
                  <TreePine className="w-16 h-16 text-emerald-400" />
                </div>
                <p className="text-xl font-semibold text-emerald-800 mb-2">لا توجد مزارع متاحة حالياً</p>
                <p className="text-emerald-600">سيتم إضافة مزارع جديدة قريباً</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {farms.map((farm) => (
                  <InnovativeFarmCard
                    key={farm.id}
                    farm={farm}
                    onClick={() => handleFarmClick(farm)}
                  />
                ))}
              </div>
            )}
          </div>
        </main>

        {/* Bottom Navigation */}
        <PublicBottomNavBar
          activeTab="home"
          onTabChange={(tabId) => {
            if (tabId === 'home') handleGoHome();
            else if (tabId === 'login') setCurrentView('investor');
            else if (tabId === 'concept') setCurrentView('concept');
            else if (tabId === 'verification') setCurrentView('verification');
          }}
          onBookNow={() => farms.length > 0 && handleFarmClick(farms[0])}
          onBackToAdmin={onBackToAdmin}
        />
      </div>

      <style>{`
        /* Main Ticker Animation */
        .ticker-container-main {
          width: 100%;
          overflow: hidden;
        }

        .ticker-content-main {
          display: flex;
          animation: ticker-main 35s linear infinite;
          will-change: transform;
        }

        .ticker-item-main {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0 4rem;
          white-space: nowrap;
          flex-shrink: 0;
        }

        @keyframes ticker-main {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .ticker-content-main:hover {
          animation-play-state: paused;
        }

        @media (max-width: 640px) {
          .ticker-item-main {
            padding: 0 2.5rem;
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
}
