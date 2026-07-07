import { useState, useEffect, useMemo } from 'react';
import { Crown, Sparkles, TreePine, Users } from 'lucide-react';
import { PublicFarm } from '../types/farm.types';
import { PublicFarmService } from '../services/publicFarmService';
import { InnovativeFarmDetailPage } from './InnovativeFarmDetailPage';
import { TemporaryBookingPage } from './TemporaryBookingPage';
import { InvestorRouter } from '../../investor/components/InvestorRouter';
import { CertificateVerificationPage } from './CertificateVerificationPage';
import { SimpleLoader } from '../../../components/common/SimpleLoader';
import { AdminCrownButton } from './AdminCrownButton';
import { ConceptIntroductionPage } from './ConceptIntroductionPage';
import { EnhancedConceptCard } from './EnhancedConceptCard';
import { AdaptiveSmartButton } from '../../../components/common/AdaptiveSmartButton';
import { FloatingFiltersButton } from './FloatingFiltersButton';

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
  const [activeBottomTab, setActiveBottomTab] = useState<string>('home');
  const [activeFilter, setActiveFilter] = useState<'all' | 'open' | 'almost_full' | 'full'>('all');
  const [conceptModalOpen, setConceptModalOpen] = useState(false);

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

  // Filter logic
  const filteredFarms = useMemo(() => {
    if (activeFilter === 'all') return farms;
    return farms.filter(farm => farm.status === activeFilter);
  }, [farms, activeFilter]);

  // Count farms by status
  const filterCounts = useMemo(() => {
    return {
      all: farms.length,
      open: farms.filter(f => f.status === 'open').length,
      almost_full: farms.filter(f => f.status === 'almost_full').length,
      full: farms.filter(f => f.status === 'full').length,
    };
  }, [farms]);

  if (currentView === 'concept') {
    return (
      <>
        <ConceptIntroductionPage onClose={handleGoHome} onStartJourney={handleGoHome} />
      </>
    );
  }

  if (currentView === 'verification') {
    return (
      <>
        <CertificateVerificationPage onBack={handleGoHome} />
      </>
    );
  }

  if (currentView === 'investor') {
    return <InvestorRouter onBack={handleGoHome} />;
  }

  if (currentView === 'farmDetail' && selectedFarm) {
    return (
      <>
        <InnovativeFarmDetailPage
          farmId={selectedFarm.id}
          onBack={handleGoHome}
          onStartBooking={() => setCurrentView('booking')}
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
      </>
    );
  }

  // Home View - Royal Design
  return (
    <>
      <style>{`
        /* 🔧 تثبيت الهيدر على iPhone - نفس طريقة الأيقونات الجانبية */
        .royal-fixed-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          width: 100%;
          z-index: 50;
        }

        /* 🍎 iPhone specific fixes - EXACTLY like side dock */
        @supports (-webkit-touch-callout: none) {
          .royal-fixed-header {
            position: fixed !important;
            top: 0 !important;
            -webkit-transform: translate3d(0, 0, 0);
            transform: translate3d(0, 0, 0);
            -webkit-backface-visibility: hidden;
            backface-visibility: hidden;
            will-change: transform;
          }

          body {
            padding-top: calc(180px + env(safe-area-inset-top, 0px)) !important;
          }
        }

        /* للشاشات الكبيرة */
        @media (min-width: 640px) {
          body {
            padding-top: 200px !important;
          }
        }

        /* منع أي overflow يؤثر على fixed positioning */
        html, body {
          overflow-x: hidden;
          position: relative;
        }
      `}</style>

      {/* Royal Header - ثابت بنفس طريقة الأيقونات الجانبية */}
      <header className="royal-fixed-header bg-gradient-to-r from-amber-700 via-yellow-600 to-amber-700 shadow-2xl">
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100">
      {/* Decorative Background Pattern */}
      <div className="fixed inset-0 opacity-5" style={{ zIndex: 1 }}>
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l30 30-30 30L0 30 30 0z' fill='%23D97706' fill-opacity='0.4'/%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }}></div>
      </div>

      {/* Royal Header Content */}
      <div className="relative">
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
                  منصة تأجير المزارع الموسمي
                </h1>
                <p className="text-amber-100 mt-0.5 sm:mt-1 text-xs sm:text-sm md:text-base lg:text-lg break-words leading-relaxed">
                  منصة تأجير وانتفاع موسمي للمزارع والأشجار والمحاصيل
                </p>
                <p className="text-amber-50/90 mt-1 sm:mt-2 text-[10px] sm:text-xs md:text-sm leading-relaxed break-words max-w-2xl">
                  تقوم المنصة بإدارة وتنظيم التأجير الموسمي وتشغيله بالكامل وفق ضوابطها، دون نقل ملكية الأصول
                </p>
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
                  <p className="text-amber-100 text-xs sm:text-sm truncate">المستأجرون</p>
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

          {/* زر اكتشف فكرة المنصة - Golden Button */}
          <div className="flex justify-center mt-6 sm:mt-8">
            <button
              onClick={() => setConceptModalOpen(true)}
              className="
                relative overflow-hidden
                px-6 py-3 sm:px-8 sm:py-4
                rounded-2xl
                font-bold text-base sm:text-lg
                transition-all duration-500
                hover:scale-105 hover:shadow-2xl
                active:scale-95
                group
              "
              style={{
                background: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 50%, #D97706 100%)',
                color: '#1F2937',
                boxShadow: `
                  0 10px 30px rgba(251, 191, 36, 0.4),
                  0 5px 15px rgba(251, 191, 36, 0.3),
                  inset 0 2px 4px rgba(255, 255, 255, 0.4),
                  inset 0 -2px 4px rgba(0, 0, 0, 0.2)
                `,
                border: '2px solid rgba(251, 191, 36, 0.6)'
              }}
            >
              <span className="relative z-10 flex items-center gap-2 justify-center">
                <Sparkles className="w-5 h-5" />
                <span>اكتشف فكرة التأجير الموسمي</span>
                <Sparkles className="w-5 h-5" />
              </span>

              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 50%, #F59E0B 100%)',
                }}
              />

              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 3s linear infinite'
                }}
              />
            </button>
          </div>
        </div>
      </div>
      </header>

      {/* Main Content */}
      <main className="relative container mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12" style={{ zIndex: 2 }}>
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <SimpleLoader />
          </div>
        ) : (
          <>
            {/* Enhanced Concept Card */}
            <EnhancedConceptCard
              isOpen={conceptModalOpen}
              onClose={() => setConceptModalOpen(false)}
              onStartOwnership={() => setConceptModalOpen(false)}
            />

            {/* Section Header */}
            <div className="text-center mb-6 sm:mb-8 md:mb-12 mt-8 sm:mt-12">
              <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-4 py-1.5 sm:px-6 sm:py-2 rounded-full text-xs sm:text-sm font-semibold mb-3 sm:mb-4 shadow-lg">
                <Crown className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>المزارع المتاحة للتأجير</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-amber-900 mb-2 sm:mb-3 px-4 break-words">
                اختر مزرعتك الفاخرة
              </h2>
              <p className="text-amber-700 text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-4 break-words">
                استأجر من أرقى المزارع مع ضمان الجودة والعائد المميز
              </p>
            </div>

            {/* Farms Grid */}
            <div className="grid grid-cols-3 lg:grid-cols-4 gap-2">
              {filteredFarms.map((farm, index) => {
                const bookedTrees = farm.total_trees - farm.available_trees;
                const bookedPct = farm.total_trees > 0 ? Math.round((bookedTrees / farm.total_trees) * 100) : 0;
                const isFull = farm.status === 'full' || farm.available_trees === 0;
                const isAlmostFull = !isFull && (farm.status === 'almost_full' || bookedPct >= 70);
                return (
                  <div
                    key={farm.id}
                    className="group relative"
                    onMouseEnter={() => setHoveredCard(index)}
                    onMouseLeave={() => setHoveredCard(null)}
                    onClick={() => handleFarmClick(farm)}
                  >
                    <div className="relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer border border-amber-100 hover:border-amber-300 active:scale-[0.97]"
                      style={{ transform: hoveredCard === index ? 'translateY(-2px)' : 'none', transition: 'all 0.3s ease' }}
                    >
                      {/* Image Area */}
                      <div className="relative h-14 sm:h-20 bg-gradient-to-br from-amber-100 via-yellow-50 to-amber-100 overflow-hidden">
                        {farm.aerial_map_url ? (
                          <img
                            src={farm.aerial_map_url}
                            alt={farm.farm_name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <TreePine className="w-6 h-6 text-amber-400/50" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                        {/* Status badge */}
                        <div className="absolute top-1 right-1">
                          {isFull ? (
                            <span className="bg-red-500 text-white text-[8px] font-bold px-1 py-0.5 rounded-full leading-none">مكتمل</span>
                          ) : isAlmostFull ? (
                            <span className="bg-orange-500 text-white text-[8px] font-bold px-1 py-0.5 rounded-full leading-none animate-pulse">يقترب</span>
                          ) : (
                            <span className="bg-emerald-500 text-white text-[8px] font-bold px-1 py-0.5 rounded-full leading-none">متاح</span>
                          )}
                        </div>

                        {/* Bottom label */}
                        <div className="absolute bottom-1 right-1 left-1">
                          <p className="text-white font-bold text-[9px] sm:text-[11px] leading-tight drop-shadow-md line-clamp-1">
                            {farm.farm_name}
                          </p>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-1.5">
                        {/* Type & city */}
                        <p className="text-amber-600 text-[9px] font-medium leading-tight mb-1 line-clamp-1">
                          {farm.tree_type === 'palm' || farm.tree_type === 'نخيل' ? 'نخيل' : farm.tree_type === 'mixed' ? 'مختلط' : 'زيتون'}
                          {farm.location_city ? ` • ${farm.location_city}` : ''}
                        </p>

                        {/* Available trees */}
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[9px] text-gray-400">متاح</span>
                          <span className="text-[10px] font-bold text-emerald-600">{farm.available_trees.toLocaleString('ar-SA')}</span>
                        </div>

                        {/* Progress */}
                        <div className="h-1 bg-amber-100 rounded-full overflow-hidden mb-1.5">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${isFull ? 'bg-red-500' : isAlmostFull ? 'bg-orange-400' : 'bg-gradient-to-r from-amber-400 to-yellow-400'}`}
                            style={{ width: `${bookedPct}%` }}
                          />
                        </div>

                        {/* CTA */}
                        <button
                          className={`w-full py-1 rounded-lg text-[9px] sm:text-[10px] font-bold transition-all duration-200 ${
                            isFull
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white hover:from-amber-600 hover:to-yellow-600 active:scale-95'
                          }`}
                          disabled={isFull}
                        >
                          {isFull ? 'مكتمل' : 'استأجر'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Empty State */}
            {filteredFarms.length === 0 && !loading && (
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-amber-100 rounded-full mb-6">
                  <TreePine className="w-12 h-12 text-amber-600" />
                </div>
                <h3 className="text-2xl font-bold text-amber-900 mb-2">
                  {activeFilter === 'all'
                    ? 'لا توجد مزارع متاحة حالياً'
                    : 'لا توجد مزارع تطابق الفلتر المحدد'}
                </h3>
                <p className="text-amber-600">
                  {activeFilter === 'all'
                    ? 'يرجى العودة لاحقاً للاطلاع على الفرص الاستثمارية الجديدة'
                    : 'جرب اختيار فلتر آخر'}
                </p>
              </div>
            )}
          </>
        )}
      </main>

      {/* زر الفلاتر العائم */}
      {currentView === 'home' && !loading && farms.length > 0 && (
        <FloatingFiltersButton
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          counts={filterCounts}
        />
      )}
    </div>

    {/* الزر العائم الذكي للواتساب */}
    <AdaptiveSmartButton
      phoneNumber="966500000000"
      defaultMessage="مرحباً! أود الاستفسار عن فرص الاستثمار الزراعي"
    />
    </>
  );
}
