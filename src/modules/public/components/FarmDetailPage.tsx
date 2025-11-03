import { useState, useEffect } from 'react';
import { ArrowRight, MapPin, Trees, TrendingUp, CheckCircle2, Droplets, Zap, Shield, Navigation, Sprout } from 'lucide-react';
// Colors removed - using emerald green theme only
import { FarmDetailService, FarmDetail } from '../services/farmDetailService';
import { MazadCrownLoader } from '../../../components/common/MazadCrownLoader';
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
    return <MazadCrownLoader message="جاري تحميل تفاصيل المزرعة..." subtitle="مزادات" />;
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
      className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50"
      dir="rtl"
    >
      {/* Content */}
      <div className="relative">
      {/* Header مبسط وثابت */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={onBack}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md active:scale-95 transition-transform"
          >
            <ArrowRight className="w-5 h-5 text-emerald-600" />
          </button>
          <span className="text-sm font-bold text-gray-800">{platformName}</span>
          <div className="w-10 h-10" />
        </div>
      </div>

      {/* صورة Hero محسنة للجوال */}
      <div className="relative w-full h-[60vh] min-h-[400px] max-h-[600px] overflow-hidden">
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

        {/* Gradient + معلومات المزرعة */}
        <div
          className="absolute inset-0 flex flex-col justify-end"
          style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)'
          }}
        >
          <div className="p-4 pb-6 text-white">
            <div className="flex items-center gap-2 mb-3">
              <div className="px-3 py-1 bg-emerald-500 rounded-full text-xs font-bold">
                متاح الآن
              </div>
            </div>
            <h1 className="text-3xl font-black mb-2 leading-tight">
              {farm.name_ar}
            </h1>
            <div className="flex items-center gap-2 text-white/90">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{farm.city}, {farm.region}</span>
            </div>
          </div>
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 lg:py-12">

        {/* 🟩 بطاقة تعريف المزرعة - أخضر زجاجي */}
        <div
          className="mb-6 sm:mb-8 p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl backdrop-blur-xl transform active:scale-[0.99] sm:hover:scale-[1.01] transition-all duration-300"
          style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.12), rgba(240, 253, 244, 0.95))',
            boxShadow: `0 20px 60px rgba(16, 185, 129, 0.3), 0 10px 30px rgba(16, 185, 129, 0.2)`,
            border: '2px solid rgba(16, 185, 129, 0.3)'
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
              className="p-3 sm:p-4 md:p-5 lg:p-6 rounded-lg sm:rounded-xl md:rounded-2xl text-center transition-all active:scale-95 sm:hover:scale-105 touch-manipulation backdrop-blur-xl border-2"
              style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.15))',
                borderColor: 'rgba(16, 185, 129, 0.3)',
                boxShadow: '0 8px 32px rgba(16, 185, 129, 0.2)'
              }}
            >
              <Trees className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 mx-auto mb-1.5 sm:mb-2 md:mb-3 text-emerald-600" />
              <div className="text-base sm:text-xl md:text-2xl lg:text-3xl font-black mb-0.5 sm:mb-1 md:mb-2 text-emerald-800">
                {farm.total_trees.toLocaleString('ar-SA')}
              </div>
              <div className="text-[10px] sm:text-xs md:text-sm text-emerald-700 font-semibold">إجمالي الأشجار</div>
            </div>

            <div
              className="p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl text-center transition-all active:scale-95 sm:hover:scale-105 touch-manipulation backdrop-blur-xl border-2"
              style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.15))',
                borderColor: 'rgba(16, 185, 129, 0.3)',
                boxShadow: '0 8px 32px rgba(16, 185, 129, 0.2)'
              }}
            >
              <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 mx-auto mb-2 sm:mb-3 text-emerald-600" />
              <div className="text-xl sm:text-2xl md:text-3xl font-black mb-1 sm:mb-2 text-emerald-800">
                {farm.price_per_tree.toLocaleString('ar-SA')} ر.س
              </div>
              <div className="text-xs sm:text-sm text-emerald-700 font-semibold">السعر لكل شجرة</div>
            </div>

            <div
              className="p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl text-center transition-all active:scale-95 sm:hover:scale-105 touch-manipulation backdrop-blur-xl border-2"
              style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.15))',
                borderColor: 'rgba(16, 185, 129, 0.3)',
                boxShadow: '0 8px 32px rgba(16, 185, 129, 0.2)'
              }}
            >
              <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 mx-auto mb-2 sm:mb-3 text-emerald-600" />
              <div className="text-xl sm:text-2xl md:text-3xl font-black mb-1 sm:mb-2 text-emerald-800">
                {farm.available_trees.toLocaleString('ar-SA')}
              </div>
              <div className="text-xs sm:text-sm text-emerald-700 font-semibold">متاح للحجز</div>
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

        {/* 🟩 قسم مميزات المزرعة - أخضر زجاجي */}
        {(farm.has_well || farm.has_electricity || farm.has_fence || farm.has_road || farm.has_sterilization) && (
          <div
            className="mb-6 sm:mb-8 p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl backdrop-blur-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(5, 150, 105, 0.08), rgba(240, 253, 244, 0.95))',
              boxShadow: '0 15px 40px rgba(16, 185, 129, 0.25), 0 8px 20px rgba(16, 185, 129, 0.15)',
              border: '2px solid rgba(16, 185, 129, 0.25)'
            }}
          >
            <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black mb-3 sm:mb-4 md:mb-6 flex items-center gap-2 sm:gap-3" style={{ color: '#047857' }}>
              <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-emerald-600" />
              مميزات المزرعة
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3 md:gap-4">
              {farm.has_well && (
                <div
                  className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl transition-all active:scale-95 sm:hover:scale-105 touch-manipulation backdrop-blur-xl border"
                  style={{
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.1))',
                    borderColor: 'rgba(16, 185, 129, 0.25)'
                  }}
                >
                  <div
                    className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(16, 185, 129, 0.15)' }}
                  >
                    <Droplets className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm md:text-base font-bold text-emerald-800">
                      بئر ماء
                    </div>
                    <div className="text-[10px] sm:text-xs md:text-sm text-emerald-700">
                      متوفر للري
                    </div>
                  </div>
                </div>
              )}

              {farm.has_electricity && (
                <div
                  className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl transition-all active:scale-95 sm:hover:scale-105 touch-manipulation backdrop-blur-xl border"
                  style={{
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.1))',
                    borderColor: 'rgba(16, 185, 129, 0.25)'
                  }}
                >
                  <div
                    className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(16, 185, 129, 0.15)' }}
                  >
                    <Zap className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm md:text-base font-bold text-emerald-800">
                      كهرباء
                    </div>
                    <div className="text-[10px] sm:text-xs md:text-sm text-emerald-700">
                      مصدر طاقة متوفر
                    </div>
                  </div>
                </div>
              )}

              {farm.has_fence && (
                <div
                  className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl transition-all active:scale-95 sm:hover:scale-105 touch-manipulation backdrop-blur-xl border"
                  style={{
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.1))',
                    borderColor: 'rgba(16, 185, 129, 0.25)'
                  }}
                >
                  <div
                    className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(16, 185, 129, 0.15)' }}
                  >
                    <Shield className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm md:text-base font-bold text-emerald-800">
                      سور محيط
                    </div>
                    <div className="text-[10px] sm:text-xs md:text-sm text-emerald-700">
                      حماية وأمان
                    </div>
                  </div>
                </div>
              )}

              {farm.has_road && (
                <div
                  className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl transition-all active:scale-95 sm:hover:scale-105 touch-manipulation backdrop-blur-xl border"
                  style={{
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.1))',
                    borderColor: 'rgba(16, 185, 129, 0.25)'
                  }}
                >
                  <div
                    className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(16, 185, 129, 0.15)' }}
                  >
                    <Navigation className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm md:text-base font-bold text-emerald-800">
                      طريق معبد
                    </div>
                    <div className="text-[10px] sm:text-xs md:text-sm text-emerald-700">
                      سهولة الوصول
                    </div>
                  </div>
                </div>
              )}

              {farm.has_sterilization && (
                <div
                  className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl transition-all active:scale-95 sm:hover:scale-105 touch-manipulation backdrop-blur-xl border"
                  style={{
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.1))',
                    borderColor: 'rgba(16, 185, 129, 0.25)'
                  }}
                >
                  <div
                    className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(16, 185, 129, 0.15)' }}
                  >
                    <Sprout className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm md:text-base font-bold text-emerald-800">
                      معقم ومعالج
                    </div>
                    <div className="text-[10px] sm:text-xs md:text-sm text-emerald-700">
                      رعاية صحية متكاملة
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 🟩 قسم النبذة التفصيلية - أخضر زجاجي */}
        {farm.description_ar && farm.description_ar.trim() && (
          <div
            className="mb-4 sm:mb-6 md:mb-8 p-3 sm:p-4 md:p-6 lg:p-8 rounded-xl sm:rounded-2xl md:rounded-3xl backdrop-blur-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(5, 150, 105, 0.08), rgba(240, 253, 244, 0.95))',
              boxShadow: '0 15px 40px rgba(16, 185, 129, 0.25), 0 8px 20px rgba(16, 185, 129, 0.15)',
              border: '2px solid rgba(16, 185, 129, 0.25)'
            }}
          >
            <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-black mb-2 sm:mb-3 md:mb-4 flex items-center gap-2.5" style={{ color: '#047857' }}>
              <span className="text-2xl sm:text-3xl">📖</span>
              نبذة عن المزرعة
            </h3>
            <p
              className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl leading-relaxed"
              style={{ color: '#374151', lineHeight: '1.8' }}
            >
              {farm.description_ar}
            </p>
          </div>
        )}

        {/* 🟩 قسم الملاحظات الفنية - أخضر زجاجي محسّن */}
        {farm.technical_notes && farm.technical_notes.trim() && (
          <div
            className="mb-4 sm:mb-6 md:mb-8 p-3 sm:p-4 md:p-6 lg:p-8 rounded-xl sm:rounded-2xl md:rounded-3xl backdrop-blur-xl"
            style={{
              background: `linear-gradient(135deg, rgba(16, 185, 129, 0.18), rgba(5, 150, 105, 0.12), rgba(236, 253, 245, 0.95))`,
              boxShadow: `0 15px 40px rgba(16, 185, 129, 0.3), 0 8px 20px rgba(16, 185, 129, 0.2)`,
              border: `2px solid rgba(16, 185, 129, 0.35)`
            }}
          >
            <h3 className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-black mb-2 sm:mb-3 md:mb-4 flex items-center gap-2.5" style={{ color: '#047857' }}>
              <Sprout className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-emerald-600" />
              ملاحظات فنية
            </h3>
            <p
              className="text-xs sm:text-sm md:text-base lg:text-lg leading-relaxed"
              style={{ color: '#374151', lineHeight: '1.7' }}
            >
              {farm.technical_notes}
            </p>
          </div>
        )}

        {/* 🎯 قسم الحجز - تصميم محسّن ومنظم */}
        <div className="w-full flex flex-col items-center justify-center py-8 px-4 relative" style={{ zIndex: 10 }}>
          {/* زر امتلك نخلة - زجاجي لامع مع خط جميل */}
          <button
            onClick={onStartBooking}
            disabled={reservationPercentage === 100}
            className="group relative overflow-hidden px-12 py-7 md:px-20 md:py-10 rounded-[2rem] text-2xl md:text-4xl text-white transition-all duration-700 hover:scale-[1.12] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
            style={{
              zIndex: 10,
              fontFamily: 'Cairo, Tajawal, sans-serif',
              fontWeight: 900,
              background: reservationPercentage === 100
                ? 'linear-gradient(145deg, rgba(75, 85, 99, 0.85) 0%, rgba(55, 65, 81, 0.9) 100%)'
                : 'linear-gradient(145deg, rgba(16, 185, 129, 0.85) 0%, rgba(5, 150, 105, 0.9) 50%, rgba(4, 120, 87, 0.95) 100%)',
              backdropFilter: 'blur(40px) saturate(180%)',
              WebkitBackdropFilter: 'blur(40px) saturate(180%)',
              border: '3px solid rgba(255, 255, 255, 0.5)',
              boxShadow: reservationPercentage === 100
                ? '0 30px 80px rgba(0, 0, 0, 0.5), 0 15px 40px rgba(0, 0, 0, 0.3), inset 0 2px 15px rgba(255, 255, 255, 0.25), inset 0 -4px 15px rgba(0, 0, 0, 0.3)'
                : '0 30px 80px rgba(16, 185, 129, 0.6), 0 20px 50px rgba(16, 185, 129, 0.5), 0 10px 30px rgba(16, 185, 129, 0.4), inset 0 4px 20px rgba(255, 255, 255, 0.5), inset 0 -4px 15px rgba(0, 0, 0, 0.2)',
              transform: 'perspective(1000px) rotateX(2deg)',
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

            {/* توهج متحرك لامع */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
              style={{
                background: 'radial-gradient(circle at center, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.2) 40%, transparent 80%)',
                animation: 'pulse 2.5s ease-in-out infinite'
              }}
            />

            {/* حلقات توهج خارجية */}
            <div
              className="absolute inset-0 opacity-50 group-hover:opacity-70 transition-opacity duration-700 pointer-events-none"
              style={{
                background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.3) 0%, transparent 50%)',
                filter: 'blur(20px)'
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
                  <span className="text-4xl md:text-5xl animate-bounce" style={{ filter: 'drop-shadow(0 0 15px rgba(255, 255, 255, 0.7))' }}>
                    {getTreeEmoji(farm.farm_type)}
                  </span>
                  <span
                    className="whitespace-nowrap"
                    style={{
                      fontFamily: 'Cairo, Tajawal, sans-serif',
                      fontWeight: 900,
                      fontSize: 'inherit',
                      textShadow: '0 4px 8px rgba(0, 0, 0, 0.5), 0 2px 4px rgba(0, 0, 0, 0.3), 0 0 20px rgba(255, 255, 255, 0.4)',
                      letterSpacing: '0.03em',
                      lineHeight: 1.2
                    }}
                  >
                    امتلك {getTreeName(farm.farm_type)}
                  </span>
                </>
              )}
            </div>

            {/* بريق زجاجي لامع */}
            <div
              className="absolute top-0 left-0 right-0 h-1/2 pointer-events-none"
              style={{
                background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.2) 30%, transparent 100%)',
                borderRadius: '2rem 2rem 0 0'
              }}
            />

            {/* انعكاس زجاجي إضافي */}
            <div
              className="absolute bottom-0 left-0 right-0 h-1/3 pointer-events-none"
              style={{
                background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.2) 0%, transparent 100%)',
                borderRadius: '0 0 2rem 2rem'
              }}
            />
          </button>

          {/* النصوص التحفيزية والتوضيحية - منظمة وواضحة */}
          {reservationPercentage < 100 && (
            <div className="mt-6 sm:mt-8 space-y-4 sm:space-y-5 text-center max-w-2xl">
              {/* العنوان الرئيسي - احجز الآن */}
              <div
                className="p-4 sm:p-5 rounded-2xl backdrop-blur-xl border-2"
                style={{
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.1))',
                  borderColor: 'rgba(16, 185, 129, 0.3)',
                  boxShadow: '0 8px 25px rgba(16, 185, 129, 0.2)'
                }}
              >
                <p
                  className="text-base sm:text-lg md:text-xl lg:text-2xl font-black tracking-wide"
                  style={{
                    color: '#047857',
                    textShadow: '0 2px 4px rgba(16, 185, 129, 0.2)',
                    letterSpacing: '0.02em'
                  }}
                >
                  ⚡ احجز الآن واحصل على شهادة ملكية رقمية
                </p>
              </div>

              {/* المميزات - badges منظمة */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div
                  className="flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl backdrop-blur-xl border-2 transition-all hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.15))',
                    borderColor: 'rgba(16, 185, 129, 0.35)',
                    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.25)'
                  }}
                >
                  <span className="text-2xl">🎯</span>
                  <span
                    className="text-sm sm:text-base md:text-lg font-bold"
                    style={{ color: '#047857' }}
                  >
                    حجز مؤقت لمدة محدودة
                  </span>
                </div>

                <div
                  className="flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl backdrop-blur-xl border-2 transition-all hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.15))',
                    borderColor: 'rgba(16, 185, 129, 0.35)',
                    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.25)'
                  }}
                >
                  <span className="text-2xl">✓</span>
                  <span
                    className="text-sm sm:text-base md:text-lg font-bold"
                    style={{ color: '#10b981' }}
                  >
                    لا حاجة للدفع الآن
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 🟩 قسم الثقة والتحفيز - بطاقة زجاجية */}
        <div
          className="text-center py-8 sm:py-12 px-4 sm:px-6 rounded-2xl sm:rounded-3xl backdrop-blur-xl mb-6 sm:mb-8"
          style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.1), rgba(240, 253, 244, 0.9))',
            border: '2px solid rgba(16, 185, 129, 0.3)',
            boxShadow: '0 20px 50px rgba(16, 185, 129, 0.25), 0 10px 25px rgba(16, 185, 129, 0.15)'
          }}
        >
          <p className="text-2xl sm:text-3xl md:text-4xl font-black mb-3 sm:mb-4" style={{ color: '#047857', textShadow: '0 2px 4px rgba(16, 185, 129, 0.2)' }}>
            استثمارك يبدأ من شجرة واحدة...
          </p>
          <p className="text-lg sm:text-xl md:text-2xl font-bold" style={{ color: '#059669' }}>
            🌿 ملكك مدى الحياة
          </p>
        </div>
      </div>

      {/* 🟩 الفوتر - زجاجي أخضر */}
      <div
        className="py-8 sm:py-12 text-center backdrop-blur-xl"
        style={{
          background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.95) 0%, rgba(4, 120, 87, 0.98) 100%)',
          borderTop: '2px solid rgba(255, 255, 255, 0.2)',
          boxShadow: 'inset 0 4px 20px rgba(255, 255, 255, 0.2)'
        }}
      >
        <p className="text-white text-base sm:text-lg md:text-xl font-bold mb-2" style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
          منصة تملك المزارع 🌴
        </p>
        <p className="text-white text-sm sm:text-base opacity-90">
          © 2025 جميع الحقوق محفوظة
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
