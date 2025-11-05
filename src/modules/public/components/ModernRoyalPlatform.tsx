import { useState, useEffect, lazy, Suspense } from 'react';
import {
  Star, Crown, Sparkles, TreePine
} from 'lucide-react';
import { PublicFarm } from '../types/farm.types';
import { PublicFarmService } from '../services/publicFarmService';
import { GreenConceptButton } from './GreenConceptButton';
import { EnhancedConceptCard } from './EnhancedConceptCard';
import { AdminCrownButton } from './AdminCrownButton';
import { BackToAdminButton } from './BackToAdminButton';
import { SmartFloatingButton } from '../../../components/common/SmartFloatingButton';
import { ModernTopHeader } from '../../../components/common/ModernTopHeader';
import { InnovativeFarmCard } from './InnovativeFarmCard';
import { Modern3DTicker } from '../../../components/common/Modern3DTicker';
import { modern3DTickerService, TickerMessage, TickerSettings } from '../../../services/modern3DTickerService';
import { getPlatformTextsBySection } from '../../../services/platformTextsService';

// Lazy load heavy components
const InnovativeFarmDetailPage = lazy(() => import('./InnovativeFarmDetailPage').then(m => ({ default: m.InnovativeFarmDetailPage })));
const TemporaryBookingPage = lazy(() => import('./TemporaryBookingPage').then(m => ({ default: m.TemporaryBookingPage })));
const InvestorRouter = lazy(() => import('../../investor/components/InvestorRouter').then(m => ({ default: m.InvestorRouter })));
const CertificateVerificationPage = lazy(() => import('./CertificateVerificationPage').then(m => ({ default: m.CertificateVerificationPage })));
const ConceptIntroductionPage = lazy(() => import('./ConceptIntroductionPage').then(m => ({ default: m.ConceptIntroductionPage })));

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
  const [smartButtonOpen, setSmartButtonOpen] = useState(false);
  const [selectedFarm, setSelectedFarm] = useState<PublicFarm | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(100);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [tickerMessages, setTickerMessages] = useState<TickerMessage[]>([]);
  const [tickerSettings, setTickerSettings] = useState<TickerSettings>({
    id: '1',
    enabled: true,
    speed: 40,
    height: '80px'
  });
  const [platformName, setPlatformName] = useState('منصة الحبر');

  // شاشة التحميل المبتكرة مع شريط التقدم
  useEffect(() => {
    const loadEverything = async () => {
      // محاكاة تقدم التحميل بشكل سلس
      const progressInterval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 15;
        });
      }, 150);

      try {
        // تحميل المزارع أولاً
        await loadData();
        setLoadingProgress(95);

        // تحميل باقي البيانات
        await Promise.all([
          loadPlatformTexts(),
          loadTickerData()
        ]);

        setLoadingProgress(100);

        // انتظار قصير لإظهار 100%
        setTimeout(() => {
          setIsInitialLoading(false);
        }, 300);

      } catch (error) {
        console.error('Loading error:', error);
        setLoadingProgress(100);
        setTimeout(() => setIsInitialLoading(false), 300);
      } finally {
        clearInterval(progressInterval);
      }
    };

    loadEverything();

    // Subscribe to ticker updates - بعد التحميل
    let unsubscribeMessages: (() => void) | null = null;
    let unsubscribeSettings: (() => void) | null = null;

    const timer = setTimeout(() => {
      unsubscribeMessages = modern3DTickerService.subscribeToMessages((messages) => {
        setTickerMessages(messages);
      });

      unsubscribeSettings = modern3DTickerService.subscribeToSettings((settings) => {
        setTickerSettings(settings);
      });
    }, 1500);

    return () => {
      clearTimeout(timer);
      if (unsubscribeMessages) unsubscribeMessages();
      if (unsubscribeSettings) unsubscribeSettings();
    };
  }, []);

  // Mouse move - تأخير التفعيل
  useEffect(() => {
    let isActive = false;

    const timer = setTimeout(() => {
      isActive = true;
    }, 1000); // تأخير ثانية

    const handleMouseMove = (e: MouseEvent) => {
      if (!isActive) return;
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const loadData = async () => {
    try {
      const farmsData = await PublicFarmService.getAllFarms();
      setFarms(farmsData);
    } catch (error) {
      console.error('Error loading farms:', error);
    }
  };

  const loadTickerData = async () => {
    try {
      const [messages, settings] = await Promise.all([
        modern3DTickerService.getActiveMessages(),
        modern3DTickerService.getSettings()
      ]);
      setTickerMessages(messages);
      setTickerSettings(settings);
    } catch (error) {
      console.error('Error loading ticker data:', error);
    }
  };

  const loadPlatformTexts = async () => {
    try {
      const homeTexts = await getPlatformTextsBySection('home');
      if (homeTexts.main_title) {
        setPlatformName(homeTexts.main_title.ar);
      }
    } catch (error) {
      console.error('Error loading platform texts:', error);
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

  // شاشة تحميل مبتكرة ورسمية
  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100 flex items-center justify-center relative overflow-hidden">
        {/* خلفية متحركة */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-400 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-400 rounded-full blur-3xl animate-pulse delay-700" />
        </div>

        {/* المحتوى الرئيسي */}
        <div className="relative z-10 text-center px-4 max-w-md w-full">
          {/* شعار مبتكر */}
          <div className="mb-8 relative">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-2xl shadow-emerald-500/50 mb-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
              <TreePine className="w-12 h-12 text-white relative z-10" strokeWidth={2.5} />
              <Sparkles className="w-6 h-6 text-yellow-300 absolute top-2 right-2 animate-bounce" />
            </div>

            {/* اسم المنصة */}
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-700 via-green-600 to-emerald-700 bg-clip-text text-transparent mb-2 animate-fade-in">
              {platformName}
            </h1>
            <p className="text-emerald-600 font-medium text-lg animate-fade-in delay-150">
              منصة استثمار زراعي متطورة
            </p>
          </div>

          {/* شريط التقدم المتطور */}
          <div className="space-y-4">
            {/* النسبة المئوية */}
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center">
                <span className="text-emerald-600 font-bold text-sm">
                  {Math.round(loadingProgress)}%
                </span>
              </div>
            </div>

            {/* شريط التقدم الأنيق */}
            <div className="relative">
              <div className="h-2 bg-white/60 backdrop-blur-sm rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 rounded-full transition-all duration-300 ease-out relative overflow-hidden"
                  style={{ width: `${loadingProgress}%` }}
                >
                  {/* تأثير اللمعان */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                </div>
              </div>

              {/* خط مضيء */}
              <div
                className="absolute top-0 h-2 w-20 bg-gradient-to-r from-transparent via-white/80 to-transparent blur-sm transition-all duration-300"
                style={{ left: `${loadingProgress}%`, transform: 'translateX(-50%)' }}
              />
            </div>

            {/* نص التحميل */}
            <p className="text-emerald-600 text-sm font-medium animate-pulse">
              {loadingProgress < 30 && "جاري تحضير المنصة..."}
              {loadingProgress >= 30 && loadingProgress < 60 && "تحميل المزارع المتاحة..."}
              {loadingProgress >= 60 && loadingProgress < 90 && "تجهيز البيانات..."}
              {loadingProgress >= 90 && loadingProgress < 100 && "اللمسات الأخيرة..."}
              {loadingProgress >= 100 && "جاهز!"}
            </p>
          </div>

          {/* نقاط متحركة */}
          <div className="mt-8 flex justify-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>

        {/* تأثيرات إضافية */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-500 animate-pulse" />
      </div>
    );
  }

  // Handle other views with Suspense
  if (currentView === 'concept') {
    return (
      <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50" />}>
        <ConceptIntroductionPage onClose={handleGoHome} onStartJourney={handleGoHome} />
      </Suspense>
    );
  }

  if (currentView === 'verification') {
    return (
      <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50" />}>
        <CertificateVerificationPage onBack={handleGoHome} />
      </Suspense>
    );
  }

  if (currentView === 'investor') {
    return (
      <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50" />}>
        <InvestorRouter
          onBack={handleGoHome}
          onGoToPublic={handleGoHome}
        />
      </Suspense>
    );
  }

  if (currentView === 'farmDetail' && selectedFarm) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50" />}>
        <InnovativeFarmDetailPage
          farmId={selectedFarm.id}
          onBack={handleGoHome}
          onStartBooking={() => setCurrentView('booking')}
        />
      </Suspense>
    );
  }

  if (currentView === 'booking' && selectedFarm) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50" />}>
        <TemporaryBookingPage
          farmId={selectedFarm.id}
          farmName={selectedFarm.farm_name}
          farmType={selectedFarm.tree_type === 'نخيل' ? 'palm' : 'olive'}
          onBack={() => setCurrentView('farmDetail')}
          onSuccess={handleGoHome}
          onGoHome={handleGoHome}
          onGoToInvestor={() => setCurrentView('investor')}
        />
      </Suspense>
    );
  }

  // Modern Home View
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        background: `
          radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(16, 185, 129, 0.08) 0%, transparent 50%),
          linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #bbf7d0 100%)
        `,
        overflowX: 'hidden'
      }}
    >
      {/* Glass Overlay - Simple and Clean */}
      <div className="fixed inset-0 bg-white/30 backdrop-blur-[2px] pointer-events-none"></div>

      {/* Content */}
      <div className="relative z-10" style={{ flex: '1 0 auto', paddingBottom: '90px' }}>
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
                    {platformName}
                  </h1>
                </div>
              </div>

            </div>
          </div>
        </header>

        {/* Modern 3D Ticker */}
        <Modern3DTicker
          messages={tickerMessages}
          speed={tickerSettings.speed}
          height={tickerSettings.height}
          enabled={tickerSettings.enabled}
        />


        {/* Modern Top Header - الهيدر العلوي الحديث */}
        <ModernTopHeader
          onNavigate={(section) => {
            if (section === 'home') setCurrentView('home');
            else if (section === 'account') setCurrentView('investor');
          }}
          currentSection={currentView === 'home' ? 'home' : currentView === 'investor' ? 'account' : 'home'}
          onSmartButtonClick={() => setSmartButtonOpen(true)}
          phoneNumber="966569335257"
        />

        {/* Smart Floating Button - يُفتح من الشريط الجانبي فقط */}
        <SmartFloatingButton
          externalOpen={smartButtonOpen}
          onExternalOpenChange={setSmartButtonOpen}
        />

        {/* Enhanced Concept Card */}
        <EnhancedConceptCard onStartOwnership={() => setCurrentView('concept')} />

        {/* Main Content */}
        <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12 pb-32 sm:pb-40">
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

            {farms.length === 0 ? (
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

      </div>

      {/* Admin Crown Button - Green */}
      <AdminCrownButton
        onAdminLogin={onAdminLogin}
        onFarmOwnerLogin={onFarmOwnerLogin}
      />

      {/* Back to Admin Button - Shows when logged in */}
      {onBackToAdmin && (
        <BackToAdminButton onBackToAdmin={onBackToAdmin} />
      )}

    </div>
  );
}
