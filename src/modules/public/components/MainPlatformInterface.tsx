import { useState, useEffect } from 'react';
import { brandColors, brandGradients } from '../../finance/styles/brandColors';
import { PublicFarm } from '../types/farm.types';
import { PublicFarmService } from '../services/publicFarmService';
import { FarmDetailService } from '../services/farmDetailService';
import { PremiumHeader } from './PremiumHeader';
import { StockTicker } from './StockTicker';
import { FarmCard3D } from './FarmCard3D';
import { FixedBottomBar } from './FixedBottomBar';
import { ConceptIntroModal } from './ConceptIntroModal';
import { FarmDetailPage } from './FarmDetailPage';
import { TemporaryBookingPage } from './TemporaryBookingPage';
import { InvestorRouter } from '../../investor/components/InvestorRouter';
import { CertificateVerificationPage } from './CertificateVerificationPage';
import { SimpleLoader } from '../../../components/common/SimpleLoader';
import { AdminCrownButton } from './AdminCrownButton';
import { GlowingConceptButton } from './GlowingConceptButton';
import { ConceptIntroductionPage } from './ConceptIntroductionPage';

type ViewMode = 'home' | 'farmDetail' | 'booking' | 'investor' | 'verification' | 'concept';

interface MainPlatformInterfaceProps {
  onFarmSelect?: (barcode: string) => void;
  onPreviewSelect?: (barcode: string) => void;
  onAdminLogin?: () => void;
  onBackToAdmin?: () => void;
}

export function MainPlatformInterface({
  onFarmSelect,
  onPreviewSelect,
  onAdminLogin,
  onBackToAdmin,
}: MainPlatformInterfaceProps) {
  const [farms, setFarms] = useState<PublicFarm[]>([]);
  const [showConceptModal, setShowConceptModal] = useState(false);
  const [currentView, setCurrentView] = useState<ViewMode>('home');
  const [selectedFarm, setSelectedFarm] = useState<PublicFarm | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const farmsData = await PublicFarmService.getAllFarms();
      setFarms(farmsData);
    } catch (error) {
      console.error('Error loading data:', error);
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
      setCurrentView('farmDetail');
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
      <ConceptIntroductionPage
        onClose={handleGoHome}
        onStartJourney={handleGoHome}
      />
    );
  }

  if (currentView === 'verification') {
    return <CertificateVerificationPage onBack={handleGoHome} />;
  }

  if (currentView === 'investor') {
    return <InvestorRouter onBack={handleGoHome} />;
  }

  if (currentView === 'farmDetail' && selectedFarm) {
    console.log('[MainPlatform] Rendering FarmDetailPage with:', {
      farmId: selectedFarm.id,
      farmName: selectedFarm.farm_name,
      tree_type: selectedFarm.tree_type
    });
    return (
      <FarmDetailPage
        farmId={selectedFarm.id}
        onBack={handleGoHome}
        onStartBooking={handleStartBooking}
      />
    );
  }

  if (currentView === 'booking' && selectedFarm) {
    return (
      <TemporaryBookingPage
        farmId={selectedFarm.id}
        farmName={selectedFarm.farm_name || selectedFarm.barcode}
        farmType={selectedFarm.tree_type}
        onBack={() => setCurrentView('farmDetail')}
        onSuccess={handleBookingSuccess}
        onGoHome={handleGoHome}
        onGoToInvestor={handleGoToInvestorPanel}
      />
    );
  }

  // الصفحة الرئيسية
  return (
    <div className="min-h-screen relative" dir="rtl" style={{ background: brandGradients.beige }}>
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

      <PremiumHeader
        onAdminLogin={onAdminLogin}
        onInvestorLogin={handleGoToInvestorPanel}
        onVerifyCertificate={() => setCurrentView('verification')}
        onBackToAdmin={onBackToAdmin}
      />
      <StockTicker />

      <div className="pt-28 md:pt-36">
        <GlowingConceptButton onClick={() => setCurrentView('concept')} />
      </div>

      <div className="max-w-[1400px] mx-auto px-3 sm:px-6 pt-2 sm:pt-4 pb-32">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {farms.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-2xl font-bold" style={{ color: brandColors.text.secondary }}>
                جاري تحميل المزارع المتاحة...
              </p>
            </div>
          ) : (
            farms.map((farm) => (
              <FarmCard3D
                key={farm.barcode}
                farm={farm}
                onClick={() => handleFarmClick(farm)}
                onOwn={() => handleFarmClick(farm)}
              />
            ))
          )}
        </div>
      </div>

      <FixedBottomBar onIntroClick={() => setShowConceptModal(true)} />

      <AdminCrownButton onAdminLogin={onAdminLogin} />

      {showConceptModal && (
        <ConceptIntroModal onClose={() => setShowConceptModal(false)} />
      )}
    </div>
  );
}
