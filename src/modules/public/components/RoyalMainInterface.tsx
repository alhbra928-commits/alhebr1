import { useState, useEffect } from 'react';
import { Crown, Sparkles, ArrowRight, TreePine, Users, Shield, Award } from 'lucide-react';
import { PublicFarm } from '../types/farm.types';
import { PublicFarmService } from '../services/publicFarmService';
import { FarmDetailPage } from './FarmDetailPage';
import { TemporaryBookingPage } from './TemporaryBookingPage';
import { InvestorRouter } from '../../investor/components/InvestorRouter';
import { CertificateVerificationPage } from './CertificateVerificationPage';
import { SimpleLoader } from '../../../components/common/SimpleLoader';
import { AdminCrownButton } from './AdminCrownButton';
import { ConceptIntroductionPage } from './ConceptIntroductionPage';
import { PublicBottomNavBar } from '../../../components/layout/PublicBottomNavBar';

type ViewMode = 'home' | 'farmDetail' | 'booking' | 'investor' | 'verification' | 'concept';

interface RoyalMainInterfaceProps {
  onAdminLogin?: () => void;
  onBackToAdmin?: () => void;
  onFarmOwnerLogin?: () => void;
}

export function RoyalMainInterface({
  onAdminLogin,
  onBackToAdmin,
  onFarmOwnerLogin,
}: RoyalMainInterfaceProps) {
  const [farms, setFarms] = useState<PublicFarm[]>([]);
  const [currentView, setCurrentView] = useState<ViewMode>('home');
  const [selectedFarm, setSelectedFarm] = useState<PublicFarm | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  useEffect(() => {
    loadData();
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
    console.log('[RoyalMainInterface] Farm clicked:', farm.id, farm.farm_name);
    setSelectedFarm(farm);
    setCurrentView('farmDetail');
  };

  const handleGoHome = () => {
    setCurrentView('home');
    setSelectedFarm(null);
  };

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

  // Home View - Royal Design
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100">
      {/* Decorative Background Pattern */}
      <div className="fixed inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l30 30-30 30L0 30 30 0z' fill='%23D97706' fill-opacity='0.4'/%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }}></div>
      </div>

      {/* Royal Header */}
      <header className="relative bg-gradient-to-r from-amber-700 via-yellow-600 to-amber-700 shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>

        <div className="relative container mx-auto px-4 sm:px-6 py-4 sm:py-6 md:py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 mb-4 sm:mb-6">
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-1 min-w-0">
              <div className="relative flex-shrink-0">
                <Crown className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-yellow-200" strokeWidth={2} />
                <div className="absolute -top-1 -right-1">
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-yellow-300 animate-pulse" />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-white tracking-wide break-words leading-tight">
                  منصة الاستثمار الزراعي الملكية
                </h1>
                <p className="text-amber-100 mt-0.5 sm:mt-1 text-xs sm:text-sm md:text-base lg:text-lg break-words">استثمار فاخر في عالم النخيل والزيتون</p>
              </div>
            </div>

            <div className="flex-shrink-0 self-end sm:self-auto">
              <AdminCrownButton
                onAdminLogin={onAdminLogin}
                onFarmOwnerLogin={onFarmOwnerLogin}
              />
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mt-4 sm:mt-6">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/30">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-white/30 rounded-lg flex-shrink-0">
                  <TreePine className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-amber-100 text-xs sm:text-sm truncate">إجمالي المزارع</p>
                  <p className="text-white text-lg sm:text-xl md:text-2xl font-bold">{farms.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/30">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-white/30 rounded-lg flex-shrink-0">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-amber-100 text-xs sm:text-sm truncate">المستثمرون</p>
                  <p className="text-white text-lg sm:text-xl md:text-2xl font-bold">500+</p>
                </div>
              </div>
            </div>

            <div className="bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/30">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-white/30 rounded-lg flex-shrink-0">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-amber-100 text-xs sm:text-sm truncate">نسبة الأمان</p>
                  <p className="text-white text-lg sm:text-xl md:text-2xl font-bold">100%</p>
                </div>
              </div>
            </div>

            <div className="bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/30">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-white/30 rounded-lg flex-shrink-0">
                  <Award className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-amber-100 text-xs sm:text-sm truncate">معدل العائد</p>
                  <p className="text-white text-lg sm:text-xl md:text-2xl font-bold">25%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative container mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <SimpleLoader />
          </div>
        ) : (
          <>
            {/* Section Header */}
            <div className="text-center mb-6 sm:mb-8 md:mb-12">
              <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-4 py-1.5 sm:px-6 sm:py-2 rounded-full text-xs sm:text-sm font-semibold mb-3 sm:mb-4 shadow-lg">
                <Crown className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>المزارع المتاحة للاستثمار</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-amber-900 mb-2 sm:mb-3 px-4 break-words">
                اختر مزرعتك الفاخرة
              </h2>
              <p className="text-amber-700 text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-4 break-words">
                استثمر في أرقى المزارع مع ضمان الجودة والعائد المميز
              </p>
            </div>

            {/* Farms Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {farms.map((farm, index) => (
                <div
                  key={farm.id}
                  className="group relative"
                  onMouseEnter={() => setHoveredCard(index)}
                  onMouseLeave={() => setHoveredCard(null)}
                  onClick={() => handleFarmClick(farm)}
                >
                  {/* Card */}
                  <div className="relative bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:-translate-y-2">
                    {/* Premium Badge */}
                    <div className="absolute top-4 right-4 z-10">
                      <div className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                        <Crown className="w-3.5 h-3.5" />
                        <span>مميز</span>
                      </div>
                    </div>

                    {/* Image */}
                    <div className="relative h-56 bg-gradient-to-br from-amber-100 to-yellow-100 overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <TreePine className="w-24 h-24 text-amber-600/30" />
                      </div>
                      {/* Overlay on hover */}
                      <div className={`absolute inset-0 bg-gradient-to-t from-black/60 to-transparent transition-opacity duration-300 ${hoveredCard === index ? 'opacity-100' : 'opacity-0'}`}>
                        <div className="absolute bottom-4 left-0 right-0 text-center">
                          <div className="inline-flex items-center gap-2 bg-white text-amber-700 px-6 py-2 rounded-full font-bold shadow-lg">
                            <span>استثمر الآن</span>
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-amber-900 mb-1">
                            {farm.farm_name}
                          </h3>
                          <p className="text-amber-600 text-sm">
                            {farm.tree_type === 'نخيل' ? '🌴 مزرعة نخيل' : '🌳 مزرعة زيتون'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-amber-600 mb-1">سعر الشجرة</p>
                          <p className="text-2xl font-bold text-amber-700">
                            {farm.price_per_tree?.toLocaleString('ar-SA')}
                          </p>
                          <p className="text-xs text-amber-600">ريال</p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-amber-600 mb-2">
                          <span>متاح للحجز</span>
                          <span>{farm.available_trees} / {farm.total_trees}</span>
                        </div>
                        <div className="h-2 bg-amber-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full transition-all duration-500"
                            style={{
                              width: `${((farm.total_trees - farm.available_trees) / farm.total_trees) * 100}%`
                            }}
                          ></div>
                        </div>
                      </div>

                      {/* Features */}
                      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-amber-100">
                        <div className="flex items-center gap-2 text-amber-700">
                          <Shield className="w-4 h-4" />
                          <span className="text-sm">مضمون</span>
                        </div>
                        <div className="flex items-center gap-2 text-amber-700">
                          <Award className="w-4 h-4" />
                          <span className="text-sm">عائد مرتفع</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {farms.length === 0 && !loading && (
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-amber-100 rounded-full mb-6">
                  <TreePine className="w-12 h-12 text-amber-600" />
                </div>
                <h3 className="text-2xl font-bold text-amber-900 mb-2">
                  لا توجد مزارع متاحة حالياً
                </h3>
                <p className="text-amber-600">
                  يرجى العودة لاحقاً للاطلاع على الفرص الاستثمارية الجديدة
                </p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Bottom Navigation */}
      <PublicBottomNavBar
        activeTab="home"
        onTabChange={(tabId) => {
          if (tabId === 'home') handleGoHome();
          else if (tabId === 'login') setCurrentView('investor');
          else if (tabId === 'concept') setCurrentView('concept');
          else if (tabId === 'verify') setCurrentView('verification');
        }}
        onBookNow={() => farms.length > 0 && handleFarmClick(farms[0])}
        onBackToAdmin={onBackToAdmin}
      />
    </div>
  );
}
