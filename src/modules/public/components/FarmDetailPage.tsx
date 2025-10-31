import { useState, useEffect } from 'react';
import { ArrowRight, MapPin, Trees, TrendingUp, CheckCircle2, Droplets, Zap, Shield, Navigation, Sprout } from 'lucide-react';
// Colors removed - using emerald green theme only
import { FarmDetailService, FarmDetail } from '../services/farmDetailService';
import { FarmLoader } from '../../../components/common/FarmLoader';
import { getPlatformTextsBySection } from '../../../services/platformTextsService';

interface FarmDetailPageProps {
  farmId: string;
  onBack: () => void;
  onStartBooking: () => void;
}

export function FarmDetailPage({ farmId, onBack, onStartBooking }: FarmDetailPageProps) {
  const [farm, setFarm] = useState<FarmDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [platformName, setPlatformName] = useState('منصة الحبر');
  const [farmType, setFarmType] = useState<'palm' | 'olive'>('palm');
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });

  useEffect(() => {
    loadFarmData();
    loadPlatformTexts();
  }, [farmId]);

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

  const loadFarmData = async () => {
    const pageStart = performance.now();
    console.log('[PERF] FarmDetailPage: Started loading, farmId:', farmId);

    try {
      setLoading(true);
      const farmDetail = await FarmDetailService.getFarmById(farmId);
      console.log('[PERF] FarmDetailPage: Received farm detail:', farmDetail ? { id: farmDetail.id, name: farmDetail.name_ar } : null);

      if (farmDetail) {
        const totalAvailable = farmDetail.varieties.reduce((sum, v) => sum + v.available_quantity, 0);
        const totalTrees = farmDetail.varieties.reduce((sum, v) => sum + v.total_trees, 0);

        console.log('[PERF] FarmDetailPage: Setting farm state with', { totalAvailable, totalTrees });

        // تحديد نوع الشجرة
        const type = farmDetail.tree_type?.toLowerCase();
        if (type === 'زيتون' || type === 'olive') {
          setFarmType('olive');
        } else {
          setFarmType('palm');
        }

        setFarm({
          ...farmDetail,
          available_trees: totalAvailable,
          total_trees: totalTrees > 0 ? totalTrees : farmDetail.total_trees
        });
      } else {
        console.log('[PERF] FarmDetailPage: No farm detail received - will show not found');
      }
    } catch (error) {
      console.error('[ERROR] FarmDetailPage: Error loading farm:', error);
    } finally {
      setLoading(false);
      console.log(`[PERF] FarmDetailPage: TOTAL took ${(performance.now() - pageStart).toFixed(0)}ms`);
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

  const getTreeName = (type: string | null) => {
    if (!type) return 'شجرتك';
    const normalizedType = type.toLowerCase();
    if (normalizedType === 'نخيل' || normalizedType === 'palm') return 'نخلة';
    if (normalizedType === 'زيتون' || normalizedType === 'olive') return 'شجرة زيتون';
    return 'شجرة';
  };

  const getTreeEmoji = (type: string | null) => {
    if (!type) return '🌳';
    const normalizedType = type.toLowerCase();
    if (normalizedType === 'نخيل' || normalizedType === 'palm') return '🌴';
    if (normalizedType === 'زيتون' || normalizedType === 'olive') return '🌳';
    return '🌳';
  };

  const reservedTrees = farm ? farm.total_trees - farm.available_trees : 0;
  const reservationPercentage = farm ? Math.round((reservedTrees / farm.total_trees) * 100) : 0;

  if (loading) {
    return <FarmLoader farmType={farmType} message="جاري تحميل تفاصيل المزرعة..." />;
  }

  if (!farm) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100">
        <div className="text-center">
          <p className="text-2xl font-bold mb-4">
            لم يتم العثور على المزرعة
          </p>
          <button
            onClick={onBack}
            className="px-8 py-3 rounded-xl font-bold text-white transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
          >
            العودة للرئيسية
          </button>
        </div>
      </div>
    );
  }

  const heroImage = farm.aerial_map_url ||
    (farm.images && farm.images.length > 0 ? farm.images[0] : null) ||
    (farm.tree_type === 'نخيل' || farm.tree_type === 'palm'
      ? 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=1920&q=80'
      : 'https://images.unsplash.com/photo-1474440692490-2e83ae13ba29?w=1920&q=80');

  return (
    <div
      className="min-h-screen overflow-hidden relative"
      style={{
        background: `
          radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(16, 185, 129, 0.08) 0%, transparent 50%),
          linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #bbf7d0 100%)
        `
      }}
      dir="rtl"
    >
      {/* Glass Overlay */}
      <div className="fixed inset-0 bg-white/30 backdrop-blur-[2px] pointer-events-none"></div>

      {/* Content */}
      <div className="relative z-10">
      {/* 🟩 الهيدر العلوي */}
      <div
        className="sticky top-0 z-50 backdrop-blur-md border-b"
        style={{
          background: 'rgba(255, 250, 240, 0.95)',
          borderColor: 'rgba(16, 185, 129, 0.2)'
        }}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl font-bold transition-all active:scale-95 sm:hover:scale-105 touch-manipulation"
            style={{
              background: 'white',
              color: '#059669',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
            }}
          >
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base">العودة</span>
          </button>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <div
              className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full animate-pulse"
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
            />
            <span className="font-bold text-xs sm:text-sm md:text-base">
              {platformName}
            </span>
          </div>
        </div>
      </div>

      {/* 🟨 الصورة الرئيسية - صورة بانورامية مع تأثير حركة بطيئة */}
      <div className="relative w-full min-h-[250px] h-[40vh] sm:h-[45vh] md:h-[55vh] lg:h-[60vh] max-h-[400px] sm:max-h-[500px] md:max-h-[600px] overflow-hidden">
        {typeof heroImage === 'string' && heroImage.startsWith('linear-gradient') ? (
          <div
            className="absolute inset-0"
            style={{
              background: heroImage,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
        ) : (
          <img
            src={heroImage}
            alt={farm.name_ar}
            onLoad={() => setImageLoaded(true)}
            className={`absolute inset-0 w-full h-full transition-transform duration-[20000ms] ease-linear ${
              imageLoaded ? 'scale-110' : 'scale-100'
            }`}
            style={{
              objectFit: 'cover',
              objectPosition: 'center 40%'
            }}
          />
        )}

        {/* Overlay نصي */}
        <div
          className="absolute inset-0 flex items-end"
          style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)'
          }}
        >
          <div className="w-full p-3 sm:p-4 md:p-6 lg:p-8 pb-4 sm:pb-6 md:pb-8 lg:pb-10 text-white">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black mb-1.5 sm:mb-2 md:mb-3 lg:mb-4 leading-tight drop-shadow-lg">
                امتلك جزءًا من الطبيعة...
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl opacity-95 drop-shadow-md">
                حيث تبدأ قصتك مع {getTreeName(farm.farm_type)} تحمل اسمك
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 lg:py-12">

        {/* 🟧 بطاقة تعريف المزرعة */}
        <div
          className="mb-6 sm:mb-8 p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl backdrop-blur-sm transform active:scale-[0.99] sm:hover:scale-[1.01] transition-all duration-300"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 250, 240, 0.9))',
            boxShadow: `0 20px 60px rgba(16, 185, 129, 0.3)`,
            border: '2px solid rgba(5, 150, 105, 0.2)'
          }}
        >
          {/* العنوان والموقع */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2 md:mb-3">
                <div className="text-2xl sm:text-3xl md:text-4xl">{getTreeEmoji(farm.farm_type)}</div>
                <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-black leading-tight">
                  {farm.name_ar}
                </h2>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base md:text-lg">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span>{farm.city}, {farm.region}</span>
              </div>
            </div>

            <div className="text-right w-full sm:w-auto">
              <div className="text-xs sm:text-sm">رمز المزرعة</div>
              <div className="text-lg sm:text-xl md:text-2xl font-bold">
                {farm.name_ar}
              </div>
            </div>
          </div>

          {/* النبذة التعريفية */}
          <p className="text-xs sm:text-sm md:text-base lg:text-lg leading-relaxed mb-4 sm:mb-5 md:mb-6 lg:mb-8">
            {farm.description_ar}
          </p>

          {/* 🟦 تفاصيل الاستثمار - 3 بطاقات */}
          <div className="grid grid-cols-1 xs:grid-cols-3 gap-2.5 sm:gap-3 md:gap-4 lg:gap-6 mb-4 sm:mb-5 md:mb-6 lg:mb-8">
            <div
              className="p-3 sm:p-4 md:p-5 lg:p-6 rounded-lg sm:rounded-xl md:rounded-2xl text-center transition-all active:scale-95 sm:hover:scale-105 touch-manipulation"
              style={{ background: 'rgba(255, 255, 255, 0.5)' }}
            >
              <Trees className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 mx-auto mb-1.5 sm:mb-2 md:mb-3" />
              <div className="text-base sm:text-xl md:text-2xl lg:text-3xl font-black mb-0.5 sm:mb-1 md:mb-2">
                {farm.total_trees.toLocaleString('ar-SA')}
              </div>
              <div className="text-[10px] sm:text-xs md:text-sm">إجمالي الأشجار</div>
            </div>

            <div
              className="p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl text-center transition-all active:scale-95 sm:hover:scale-105 touch-manipulation"
              style={{ background: 'rgba(255, 255, 255, 0.5)' }}
            >
              <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 mx-auto mb-2 sm:mb-3" />
              <div className="text-xl sm:text-2xl md:text-3xl font-black mb-1 sm:mb-2">
                {farm.price_per_tree.toLocaleString('ar-SA')} ر.س
              </div>
              <div className="text-xs sm:text-sm">السعر لكل شجرة</div>
            </div>

            <div
              className="p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl text-center transition-all active:scale-95 sm:hover:scale-105 touch-manipulation"
              style={{ background: 'rgba(255, 255, 255, 0.5)' }}
            >
              <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 mx-auto mb-2 sm:mb-3" />
              <div className="text-xl sm:text-2xl md:text-3xl font-black mb-1 sm:mb-2">
                {farm.available_trees.toLocaleString('ar-SA')}
              </div>
              <div className="text-xs sm:text-sm">متاح للحجز</div>
            </div>
          </div>

          {reservationPercentage >= 60 && reservationPercentage < 100 && (
            <div
              className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl sm:rounded-2xl text-center animate-pulse-gentle"
              style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.15) 100%)',
                border: '2px solid rgba(16, 185, 129, 0.3)',
                boxShadow: '0 8px 25px rgba(16, 185, 129, 0.2)',
              }}
            >
              <p className="text-sm sm:text-base md:text-lg lg:text-xl font-black mb-1 sm:mb-2">
                ⚡ بقي القليل! المزرعة على وشك الاكتمال
              </p>
              <p className="text-xs sm:text-sm md:text-base">
                {100 - reservationPercentage}% فقط متبقي من المزرعة
              </p>
            </div>
          )}

          {reservationPercentage === 100 && (
            <div
              className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl sm:rounded-2xl text-center"
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
                border: '2px solid rgba(255, 255, 255, 0.6)',
                boxShadow: '0 12px 35px rgba(16, 185, 129, 0.6), 0 0 25px rgba(16, 185, 129, 0.3)',
              }}
            >
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-black text-white" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                🎉 تم اكتمال حجز المزرعة بالكامل
              </p>
              <p className="text-xs sm:text-sm md:text-base text-white mt-1.5 sm:mt-2 opacity-90">
                شكراً لشركائنا المستثمرين
              </p>
            </div>
          )}

          {/* Progress Bar - نسبة الحجز */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <span className="font-bold text-xs sm:text-sm md:text-base">
                نسبة الحجز
              </span>
              <span className="text-base sm:text-lg md:text-xl lg:text-2xl font-black">
                {reservationPercentage}%
              </span>
            </div>
            <div
              className="h-2.5 sm:h-3 md:h-4 rounded-full overflow-hidden relative"
              style={{ background: 'rgba(255, 255, 255, 0.5)' }}
            >
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${reservationPercentage}%`,
                  background: reservationPercentage === 100
                    ? 'linear-gradient(90deg, #10b981, #059669, #047857)'
                    : 'linear-gradient(90deg, #059669, #047857)'
                }}
              />
            </div>
            {reservationPercentage < 60 && (
              <p className="text-[10px] sm:text-xs md:text-sm mt-1.5 sm:mt-2 text-center font-bold">
                🔥 {reservationPercentage}٪ من حجوزات المزرعة اكتملت
              </p>
            )}
          </div>
        </div>

        {/* 🟩 قسم مميزات المزرعة */}
        {(farm.has_well || farm.has_electricity || farm.has_fence || farm.has_road || farm.has_sterilization) && (
          <div
            className="mb-6 sm:mb-8 p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 250, 240, 0.9))',
              boxShadow: '0 15px 40px rgba(16, 185, 129, 0.2)',
              border: '2px solid rgba(5, 150, 105, 0.2)'
            }}
          >
            <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black mb-3 sm:mb-4 md:mb-6 flex items-center gap-2 sm:gap-3">
              <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8" />
              مميزات المزرعة
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3 md:gap-4">
              {farm.has_well && (
                <div
                  className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl transition-all active:scale-95 sm:hover:scale-105 touch-manipulation"
                  style={{ background: 'rgba(255, 255, 255, 0.5)' }}
                >
                  <div
                    className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(16, 185, 129, 0.15)' }}
                  >
                    <Droplets className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm md:text-base font-bold">
                      بئر ماء
                    </div>
                    <div className="text-[10px] sm:text-xs md:text-sm">
                      متوفر للري
                    </div>
                  </div>
                </div>
              )}

              {farm.has_electricity && (
                <div
                  className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl transition-all active:scale-95 sm:hover:scale-105 touch-manipulation"
                  style={{ background: 'rgba(255, 255, 255, 0.5)' }}
                >
                  <div
                    className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(16, 185, 129, 0.15)' }}
                  >
                    <Zap className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm md:text-base font-bold">
                      كهرباء
                    </div>
                    <div className="text-[10px] sm:text-xs md:text-sm">
                      مصدر طاقة متوفر
                    </div>
                  </div>
                </div>
              )}

              {farm.has_fence && (
                <div
                  className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl transition-all active:scale-95 sm:hover:scale-105 touch-manipulation"
                  style={{ background: 'rgba(255, 255, 255, 0.5)' }}
                >
                  <div
                    className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(16, 185, 129, 0.15)' }}
                  >
                    <Shield className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm md:text-base font-bold">
                      سور محيط
                    </div>
                    <div className="text-[10px] sm:text-xs md:text-sm">
                      حماية وأمان
                    </div>
                  </div>
                </div>
              )}

              {farm.has_road && (
                <div
                  className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl transition-all active:scale-95 sm:hover:scale-105 touch-manipulation"
                  style={{ background: 'rgba(255, 255, 255, 0.5)' }}
                >
                  <div
                    className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(16, 185, 129, 0.15)' }}
                  >
                    <Navigation className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm md:text-base font-bold">
                      طريق معبد
                    </div>
                    <div className="text-[10px] sm:text-xs md:text-sm">
                      سهولة الوصول
                    </div>
                  </div>
                </div>
              )}

              {farm.has_sterilization && (
                <div
                  className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl transition-all active:scale-95 sm:hover:scale-105 touch-manipulation"
                  style={{ background: 'rgba(255, 255, 255, 0.5)' }}
                >
                  <div
                    className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(16, 185, 129, 0.15)' }}
                  >
                    <Sprout className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm md:text-base font-bold">
                      معقم ومعالج
                    </div>
                    <div className="text-[10px] sm:text-xs md:text-sm">
                      رعاية صحية متكاملة
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 🟦 قسم النبذة التفصيلية */}
        {farm.description_ar && farm.description_ar.trim() && (
          <div
            className="mb-4 sm:mb-6 md:mb-8 p-3 sm:p-4 md:p-6 lg:p-8 rounded-xl sm:rounded-2xl md:rounded-3xl"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 250, 240, 0.9))',
              boxShadow: '0 15px 40px rgba(16, 185, 129, 0.2)',
              border: '2px solid rgba(5, 150, 105, 0.2)'
            }}
          >
            <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-black mb-2 sm:mb-3 md:mb-4">
              📖 نبذة عن المزرعة
            </h3>
            <p
              className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl leading-relaxed"
              style={{ color: '#6b7280', lineHeight: '1.8' }}
            >
              {farm.description_ar}
            </p>
          </div>
        )}

        {/* 🟧 قسم الملاحظات الفنية */}
        {farm.technical_notes && farm.technical_notes.trim() && (
          <div
            className="mb-4 sm:mb-6 md:mb-8 p-3 sm:p-4 md:p-6 lg:p-8 rounded-xl sm:rounded-2xl md:rounded-3xl"
            style={{
              background: `linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05))`,
              boxShadow: `0 15px 40px rgba(16, 185, 129, 0.15)`,
              border: `2px solid rgba(16, 185, 129, 0.3)`
            }}
          >
            <h3 className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-black mb-2 sm:mb-3 md:mb-4 flex items-center gap-2">
              <Sprout className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
              ملاحظات فنية
            </h3>
            <p
              className="text-xs sm:text-sm md:text-base lg:text-lg leading-relaxed"
              style={{ color: '#6b7280', lineHeight: '1.7' }}
            >
              {farm.technical_notes}
            </p>
          </div>
        )}

        {/* 🎯 زر الحجز - تصميم أخضر ثلاثي الأبعاد زجاجي */}
        <div className="w-full flex justify-center items-center py-6 px-4 relative" style={{ zIndex: 10 }}>
          <button
            onClick={onStartBooking}
            disabled={reservationPercentage === 100}
            className="group relative overflow-hidden px-8 py-5 md:px-12 md:py-7 rounded-3xl font-bold text-lg md:text-2xl text-white transition-all duration-500 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
            style={{
              zIndex: 10,
              fontFamily: 'Tajawal, sans-serif',
              background: reservationPercentage === 100
                ? 'linear-gradient(145deg, rgba(75, 85, 99, 0.95), rgba(55, 65, 81, 0.95))'
                : 'linear-gradient(145deg, rgba(16, 185, 129, 0.95), rgba(5, 150, 105, 0.95))',
              backdropFilter: 'blur(20px)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              boxShadow: reservationPercentage === 100
                ? '0 20px 60px rgba(0, 0, 0, 0.3), inset 0 2px 8px rgba(255, 255, 255, 0.15), inset 0 -2px 8px rgba(0, 0, 0, 0.25)'
                : '0 20px 60px rgba(16, 185, 129, 0.4), 0 10px 30px rgba(16, 185, 129, 0.3), inset 0 2px 8px rgba(255, 255, 255, 0.3), inset 0 -2px 8px rgba(0, 0, 0, 0.15)',
              transform: 'perspective(1000px) rotateX(5deg)',
              transformStyle: 'preserve-3d'
            }}
          >
            {/* شبكة خلفية ثلاثية الأبعاد */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                background: reservationPercentage === 100
                  ? 'none'
                  : `repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255, 255, 255, 0.1) 3px, rgba(255, 255, 255, 0.1) 6px),
                     repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(255, 255, 255, 0.1) 3px, rgba(255, 255, 255, 0.1) 6px)`,
                backgroundSize: '30px 30px'
              }}
            />

            {/* توهج متحرك */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{
                background: 'radial-gradient(circle at center, rgba(255, 255, 255, 0.3) 0%, transparent 70%)',
                animation: 'pulse 2s ease-in-out infinite'
              }}
            />

            {/* محتوى الزر */}
            <div className="relative z-10 flex items-center gap-4 justify-center" style={{ transform: 'translateZ(30px)' }}>
              {reservationPercentage === 100 ? (
                <>
                  <span className="text-3xl md:text-4xl">🔒</span>
                  <span
                    className="whitespace-nowrap font-black"
                    style={{
                      textShadow: '0 3px 6px rgba(0, 0, 0, 0.4), 0 0 15px rgba(255, 255, 255, 0.2)'
                    }}
                  >
                    اكتملت المقاعد
                  </span>
                </>
              ) : (
                <>
                  <span className="text-3xl md:text-4xl animate-bounce" style={{ filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.5))' }}>
                    {getTreeEmoji(farm.farm_type)}
                  </span>
                  <span
                    className="whitespace-nowrap font-black"
                    style={{
                      textShadow: '0 3px 6px rgba(0, 0, 0, 0.4), 0 0 15px rgba(255, 255, 255, 0.3)',
                      letterSpacing: '0.02em'
                    }}
                  >
                    امتلك {getTreeName(farm.farm_type)}
                  </span>
                </>
              )}
            </div>

            {/* بريق زجاجي */}
            <div
              className="absolute top-0 left-0 right-0 h-1/2 pointer-events-none"
              style={{
                background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.25) 0%, transparent 100%)',
                borderRadius: '1.5rem 1.5rem 0 0'
              }}
            />
          </button>

          {reservationPercentage < 100 && (
            <div className="mt-4 sm:mt-5 md:mt-6 space-y-2 sm:space-y-3">
              <p
                className="text-sm sm:text-base md:text-lg lg:text-xl font-black animate-pulse tracking-wide"
                style={{
                  color: '#059669',
                  textShadow: '0 2px 4px rgba(16, 185, 129, 0.3)',
                  letterSpacing: '0.03em'
                }}
              >
                ⚡ احجز الآن واحصل على شهادة ملكية رقمية
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                <span
                  className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs md:text-sm font-bold"
                  style={{
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(255, 215, 0, 0.15))',
                    color: '#047857',
                    border: '1.5px solid rgba(16, 185, 129, 0.3)',
                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.2)'
                  }}
                >
                  🎯 حجز مؤقت لمدة محدودة
                </span>
                <span
                  className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs md:text-sm font-bold"
                  style={{
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.15))',
                    color: '#10b981',
                    border: '1.5px solid rgba(16, 185, 129, 0.3)',
                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.2)'
                  }}
                >
                  ✓ لا حاجة للدفع الآن
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 🟫 قسم الثقة والتحفيز */}
        <div
          className="text-center py-8 sm:py-12 border-t-2"
          style={{ borderColor: 'rgba(5, 150, 105, 0.2)' }}
        >
          <p className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
            استثمارك يبدأ من شجرة واحدة...
          </p>
          <p className="text-lg sm:text-xl">
            ملكك مدى الحياة 🌿
          </p>
        </div>
      </div>

      {/* 🟬 الفوتر */}
      <div className="py-6 sm:py-8 text-center" style={{ background: '#047857' }}>
        <p className="text-white text-sm sm:text-base opacity-80">
          © 2025 منصة تملك المزارع - جميع الحقوق محفوظة
        </p>
      </div>

      {/* Shimmer Animation */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
      </div>
    </div>
  );
}
