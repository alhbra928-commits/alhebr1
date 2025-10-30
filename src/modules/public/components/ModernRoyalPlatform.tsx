import { useState, useEffect } from 'react';
import {
  Crown, Sparkles, ArrowRight, TreePine, Leaf,
  Shield, Award, Star
} from 'lucide-react';
import { PublicFarm } from '../types/farm.types';
import { PublicFarmService } from '../services/publicFarmService';
import { SmartStockTicker } from './SmartStockTicker';
import { FarmDetailPage } from './FarmDetailPage';
import { TemporaryBookingPage } from './TemporaryBookingPage';
import { InvestorRouter } from '../../investor/components/InvestorRouter';
import { CertificateVerificationPage } from './CertificateVerificationPage';
import { AdminCrownButton } from './AdminCrownButton';
import { ConceptIntroductionPage } from './ConceptIntroductionPage';
import { PublicBottomNavBar } from '../../../components/layout/PublicBottomNavBar';
import { GreenConceptButton } from './GreenConceptButton';

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
        <header className="relative overflow-hidden">
          {/* Glass Background */}
          <div className="absolute inset-0 bg-white/40 backdrop-blur-xl border-b border-white/60"></div>

          <div className="relative container mx-auto px-4 sm:px-6 py-6 sm:py-8">
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
                  <p className="text-sm sm:text-base text-emerald-700 mt-1">استثمار أخضر في عالم النخيل والزيتون</p>
                </div>
              </div>

              <AdminCrownButton
                onAdminLogin={onAdminLogin}
                onFarmOwnerLogin={onFarmOwnerLogin}
              />
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6 sm:mt-8">
              <div className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-green-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative bg-white/60 backdrop-blur-xl rounded-2xl p-4 sm:p-5 border border-white/80 hover:border-emerald-300 transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 sm:p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg">
                      <TreePine className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-emerald-700 font-medium">إجمالي المزارع</p>
                      <p className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-emerald-700 to-green-600 bg-clip-text text-transparent">
                        {farms.length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative bg-white/60 backdrop-blur-xl rounded-2xl p-4 sm:p-5 border border-white/80 hover:border-green-300 transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 sm:p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                      <Leaf className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-green-700 font-medium">أشجار متاحة</p>
                      <p className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">
                        {farms.reduce((sum, farm) => sum + (farm.available_trees || 0), 0)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-teal-400 to-emerald-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative bg-white/60 backdrop-blur-xl rounded-2xl p-4 sm:p-5 border border-white/80 hover:border-teal-300 transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 sm:p-3 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl shadow-lg">
                      <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-teal-700 font-medium">استثمار آمن</p>
                      <p className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-teal-700 to-emerald-600 bg-clip-text text-transparent">
                        100%
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative bg-white/60 backdrop-blur-xl rounded-2xl p-4 sm:p-5 border border-white/80 hover:border-emerald-300 transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 sm:p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
                      <Award className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-emerald-700 font-medium">عوائد سنوية</p>
                      <p className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent">
                        25%+
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Concept Button */}
        <GreenConceptButton onClick={() => setCurrentView('concept')} />

        {/* Ticker */}
        <div className="relative py-4 sm:py-6">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/10 via-green-500/10 to-teal-600/10 backdrop-blur-sm"></div>
          <div className="relative">
            <SmartStockTicker />
          </div>
        </div>

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
                  <div
                    key={farm.id}
                    onClick={() => handleFarmClick(farm)}
                    className="group relative cursor-pointer"
                  >
                    <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 via-green-500 to-teal-500 rounded-3xl blur opacity-25 group-hover:opacity-60 transition-opacity"></div>
                    <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/90 hover:border-emerald-300 transition-all duration-300 h-full">
                      {/* Farm Image/Icon */}
                      <div className="relative h-48 bg-gradient-to-br from-emerald-100 to-green-200 overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <TreePine className="w-24 h-24 text-emerald-600/30" strokeWidth={1.5} />
                        </div>
                        <div className="absolute top-4 right-4 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full">
                          <span className="text-sm font-bold text-emerald-700">{farm.tree_type}</span>
                        </div>
                        {farm.available_trees > 0 && (
                          <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-green-500 rounded-full">
                            <span className="text-sm font-bold text-white">متاح للحجز</span>
                          </div>
                        )}
                      </div>

                      {/* Farm Info */}
                      <div className="p-5 sm:p-6">
                        <h3 className="text-lg sm:text-xl font-bold text-emerald-900 mb-3 line-clamp-2">
                          {farm.farm_name}
                        </h3>

                        <div className="space-y-2.5 mb-5">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-emerald-700">الموقع:</span>
                            <span className="font-semibold text-emerald-900">{farm.location}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-emerald-700">الأشجار المتاحة:</span>
                            <span className="font-bold text-green-600">{farm.available_trees || 0}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-emerald-700">السعر للشجرة:</span>
                            <span className="font-bold text-emerald-900">{farm.price_per_tree?.toLocaleString('ar-SA')} ريال</span>
                          </div>
                        </div>

                        <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl group-hover:scale-105">
                          <span>عرض التفاصيل</span>
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </div>
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
    </div>
  );
}
