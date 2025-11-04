import { useState, useEffect } from 'react';
import { brandColors, brandGradients } from '../../finance/styles/brandColors';
import { PublicFarm } from '../types/farm.types';
import { PublicFarmService } from '../services/publicFarmService';
import { PremiumHeader } from './PremiumHeader';
import { FarmCard3D } from './FarmCard3D';
import { ModernMobileFarmCard } from './ModernMobileFarmCard';
import { ConceptIntroModal } from './ConceptIntroModal';
import { TemporaryBookingPage } from './TemporaryBookingPage';
import { InvestorRouter } from '../../investor/components/InvestorRouter';
import { CertificateVerificationPage } from './CertificateVerificationPage';
import { SimpleLoader } from '../../../components/common/SimpleLoader';
import { AdminCrownButton } from './AdminCrownButton';
import { GlowingConceptButton } from './GlowingConceptButton';
import { ConceptIntroductionPage } from './ConceptIntroductionPage';
import { IdeaOverviewSection } from './IdeaOverviewSection';

type ViewMode = 'home' | 'booking' | 'investor' | 'verification' | 'concept';

interface MainPlatformInterfaceProps {
  onFarmSelect?: (barcode: string) => void;
  onPreviewSelect?: (barcode: string) => void;
  onAdminLogin?: () => void;
  onBackToAdmin?: () => void;
  onFarmOwnerLogin?: () => void;
}

export function MainPlatformInterface({
  onFarmSelect,
  onPreviewSelect,
  onAdminLogin,
  onBackToAdmin,
  onFarmOwnerLogin,
}: MainPlatformInterfaceProps) {
  const [farms, setFarms] = useState<PublicFarm[]>([]);
  const [showConceptModal, setShowConceptModal] = useState(false);
  const [showIdeaOverview, setShowIdeaOverview] = useState(false);
  const [currentView, setCurrentView] = useState<ViewMode>('home');
  const [selectedFarm, setSelectedFarm] = useState<PublicFarm | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [activeBottomTab, setActiveBottomTab] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      console.log('[MainPlatform] Loading farms data...');
      const farmsData = await PublicFarmService.getAllFarms();
      console.log('[MainPlatform] Farms loaded:', farmsData.length);
      setFarms(farmsData);
    } catch (error) {
      console.error('[MainPlatform] Error loading data:', error);
      // عرض رسالة للمستخدم
      alert('حدث خطأ في تحميل المزارع. يرجى تحديث الصفحة.');
    }
  };

  const handleFarmClick = (farm: PublicFarm) => {
    console.log('[MainPlatform] Farm clicked:', {
      id: farm.id,
      name: farm.farm_name,
      tree_type: farm.tree_type,
      barcode: farm.barcode,
      available_trees: farm.available_trees,
      total_trees: farm.total_trees
    });
    setIsTransitioning(true);
    setSelectedFarm(farm);
    setTimeout(() => {
      setCurrentView('booking');
      setIsTransitioning(false);
    }, 50);
  };

  const handleGoHome = () => {
    setCurrentView('home');
    setSelectedFarm(null);
  };

  const handleStartBooking = () => {
    setCurrentView('booking');
  };

  const handleBookingSuccess = () => {
    setCurrentView('home');
  };

  const handleGoToInvestorPanel = () => {
    setCurrentView('investor');
  };

  if (currentView === 'concept') {
    return (
      <>
        <ConceptIntroductionPage
          onClose={handleGoHome}
          onStartJourney={handleGoHome}
        />

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

  if (currentView === 'booking' && selectedFarm) {
    return (
      <>
        <TemporaryBookingPage
          farmId={selectedFarm.id}
          farmName={selectedFarm.farm_name || selectedFarm.barcode}
          farmType={selectedFarm.tree_type}
          onBack={handleGoHome}
          onSuccess={handleBookingSuccess}
          onGoHome={handleGoHome}
          onGoToInvestor={handleGoToInvestorPanel}
        />

      </>
    );
  }

  // الصفحة الرئيسية
  return (
    <div
      className="min-h-screen relative"
      dir="rtl"
      style={{
        background: brandGradients.beige,
        paddingBottom: 'calc(80px + env(safe-area-inset-bottom))',
        minHeight: '100vh',
        minHeight: '-webkit-fill-available'
      }}
    >
      {isTransitioning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(4px)' }}>
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <SimpleLoader size="lg" color={brandColors.primary.gold} />
            </div>
            <p className="text-xl font-bold text-white">
              جاري فتح المزرعة...
            </p>
          </div>
        </div>
      )}


      {/* الزر الذهبي */}
      <div className="pt-8 md:pt-12">
        <GlowingConceptButton onClick={() => setShowIdeaOverview(true)} />
      </div>

      {/* قسم المزارع المتاحة */}
      <div className="max-w-[1400px] mx-auto px-3 sm:px-6 pt-2 sm:pt-4" style={{ paddingBottom: 'calc(80px + env(safe-area-inset-bottom))' }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {farms.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-2xl font-bold" style={{ color: brandColors.text.secondary }}>
                جاري تحميل المزارع المتاحة...
              </p>
            </div>
          ) : (
            farms.map((farm) => (
              <div key={farm.barcode}>
                {/* Mobile: Modern Card, Desktop: 3D Card */}
                <div className="md:hidden">
                  <ModernMobileFarmCard
                    farm={farm}
                    onClick={() => handleFarmClick(farm)}
                    onOwn={() => handleFarmClick(farm)}
                  />
                </div>
                <div className="hidden md:block">
                  <FarmCard3D
                    farm={farm}
                    onClick={() => handleFarmClick(farm)}
                    onOwn={() => handleFarmClick(farm)}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>


      <AdminCrownButton
        onAdminLogin={onAdminLogin}
        onFarmOwnerLogin={onFarmOwnerLogin}
        onBackToAdmin={onBackToAdmin}
      />

      {showConceptModal && (
        <ConceptIntroModal onClose={() => setShowConceptModal(false)} />
      )}

      {/* Modal فكرة تملك الأشجار */}
      {showIdeaOverview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowIdeaOverview(false)}>
          <div className="relative w-full max-w-7xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* زر الإغلاق */}
            <button
              onClick={() => setShowIdeaOverview(false)}
              className="sticky top-4 left-4 z-10 w-12 h-12 rounded-full bg-gray-900/80 hover:bg-gray-900 text-white flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg float-left ml-4 mt-4"
            >
              <span className="text-2xl">×</span>
            </button>

            {/* المحتوى */}
            <IdeaOverviewSection
              onNavigateToFarms={() => {
                setShowIdeaOverview(false);
                setTimeout(() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }, 100);
              }}
            />
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar for Public - Always Show */}
    </div>
  );
}
