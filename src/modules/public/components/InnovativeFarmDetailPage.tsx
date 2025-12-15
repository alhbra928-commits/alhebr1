import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  MapPin,
  Trees,
  Droplets,
  Zap,
  Shield,
  Share2,
  Heart,
  Sparkles,
  TrendingUp,
  Info,
  CheckCircle2,
  Award,
  Star
} from 'lucide-react';
import { FarmDetailService } from '../services/farmDetailService';
import { MazadCrownLoader } from '../../../components/common/MazadCrownLoader';
import { LiveActivityBar } from '../../../components/common/LiveActivityBar';
import { AdaptiveSmartButton } from '../../../components/common/AdaptiveSmartButton';

interface InnovativeFarmDetailPageProps {
  farmId: string;
  onBack: () => void;
  onStartBooking: () => void;
}

export const InnovativeFarmDetailPage: React.FC<InnovativeFarmDetailPageProps> = ({
  farmId,
  onBack,
  onStartBooking
}) => {
  const [farm, setFarm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'features'>('overview');
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    loadFarm();
  }, [farmId]);

  const loadFarm = async () => {
    try {
      setLoading(true);

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );

      const dataPromise = FarmDetailService.getFarmById(farmId);

      const data = await Promise.race([dataPromise, timeoutPromise]) as any;

      if (data) {
        console.log('[FarmDetail] Farm data loaded successfully');
        setFarm(data);
      } else {
        console.error('[FarmDetail] No data received');
      }
    } catch (error) {
      console.error('[FarmDetail] Error loading farm:', error);
      // Don't block UI, show what we have
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 flex items-center justify-center">
        <MazadCrownLoader />
      </div>
    );
  }

  if (!farm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-7xl mb-6">🌳</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">المزرعة غير متوفرة</h2>
          <p className="text-gray-600 mb-6">عذراً، لم نتمكن من العثور على هذه المزرعة</p>
          <button
            onClick={onBack}
            className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-full font-bold hover:shadow-xl transition-all"
          >
            العودة للرئيسية
          </button>
        </div>
      </div>
    );
  }

  const availablePercentage = farm.total_trees > 0
    ? Math.round((farm.available_trees / farm.total_trees) * 100)
    : 0;

  const bookedPercentage = 100 - availablePercentage;

  // جلب الصورة من المصدر الصحيح: aerial_map_url (حيث تحفظ إدارة المزارع)
  // ثم images كخيار بديل
  const farmImage = farm.aerial_map_url ||
                   (farm.images && farm.images.length > 0 ? farm.images[0] : '') ||
                   (farm.ground_images && farm.ground_images.length > 0 ? farm.ground_images[0] : '');

  const features = [
    {
      id: 'well',
      icon: Droplets,
      label: 'مصدر مياه',
      description: 'بئر ارتوازي',
      available: farm.has_well,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'from-blue-50 to-cyan-50',
      borderColor: 'border-blue-200'
    },
    {
      id: 'electricity',
      icon: Zap,
      label: 'كهرباء',
      description: 'توصيل كهربائي',
      available: farm.has_electricity,
      color: 'from-amber-500 to-orange-500',
      bgColor: 'from-amber-50 to-orange-50',
      borderColor: 'border-amber-200'
    },
    {
      id: 'fence',
      icon: Shield,
      label: 'حماية',
      description: 'سور وحراسة',
      available: farm.has_fence,
      color: 'from-emerald-500 to-green-500',
      bgColor: 'from-emerald-50 to-green-50',
      borderColor: 'border-emerald-200'
    },
    {
      id: 'road',
      icon: MapPin,
      label: 'موقع متميز',
      description: 'طريق معبد',
      available: farm.has_road,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'from-purple-50 to-pink-50',
      borderColor: 'border-purple-200'
    }
  ];

  return (
    <>
      {/* شريط الإحصائيات المتحرك العلوي */}
      <LiveActivityBar />

      <div className="min-h-screen bg-white" dir="rtl">
        {/* Header الثابت الشفاف */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 mt-10">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={onBack}
            className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors active:scale-95"
          >
            <ArrowRight className="w-5 h-5 text-gray-800" />
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsLiked(!isLiked)}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95 ${
                isLiked ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            </button>
            <button className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors active:scale-95">
              <Share2 className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="pt-16 pb-36">
        {/* صورة المزرعة */}
        <div className="relative h-80 overflow-hidden">
          {farmImage ? (
            <>
              <img
                src={farmImage}
                alt={farm.name_ar || farm.farm_name}
                onLoad={() => setImageLoaded(true)}
                onError={(e) => {
                  console.error('Image load error:', e);
                  setImageLoaded(false);
                }}
                className={`w-full h-full object-cover transition-all duration-700 ${
                  imageLoaded ? 'scale-100 opacity-100' : 'scale-105 opacity-0'
                }`}
              />
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 via-green-50 to-emerald-100 flex items-center justify-center">
                  <Trees className="w-24 h-24 text-emerald-400 animate-pulse" />
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-emerald-100 via-green-50 to-emerald-100 flex items-center justify-center">
              <Trees className="w-24 h-24 text-emerald-400" />
            </div>
          )}

          {/* شارة التوفر */}
          <div className="absolute top-4 right-4">
            <div className="px-4 py-2 bg-white/95 backdrop-blur-md rounded-full shadow-lg flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${availablePercentage > 20 ? 'bg-green-500' : 'bg-orange-500'} animate-pulse`} />
              <span className="text-sm font-bold text-gray-800">{availablePercentage}% متاح</span>
            </div>
          </div>
        </div>

        {/* معلومات المزرعة */}
        <div className="px-5 py-6 bg-white">
          {/* العنوان */}
          <div className="mb-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {farm.name_ar || farm.farm_name}
                </h1>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{farm.city} • {farm.region}</span>
                </div>
              </div>

              <div className="px-4 py-2 bg-gradient-to-br from-emerald-500 to-green-500 text-white rounded-2xl shadow-lg">
                <div className="text-xs opacity-90">نوع الشجرة</div>
                <div className="text-sm font-bold">{farm.tree_type}</div>
              </div>
            </div>

            {/* الإحصائيات */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl border-2 border-emerald-100">
                <div className="flex items-center gap-2 mb-1">
                  <Trees className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs text-gray-600">إجمالي</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{farm.total_trees}</div>
              </div>

              <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-green-600" />
                  <span className="text-xs text-gray-600">متاح</span>
                </div>
                <div className="text-2xl font-bold text-green-600">{farm.available_trees}</div>
              </div>

              <div className="p-4 bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl border-2 border-gray-200">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-gray-600" />
                  <span className="text-xs text-gray-600">محجوز</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{farm.total_trees - farm.available_trees}</div>
              </div>
            </div>
          </div>

          {/* التابات */}
          <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-2xl">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all ${
                activeTab === 'overview'
                  ? 'bg-white text-gray-900 shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              نظرة عامة
            </button>
            <button
              onClick={() => setActiveTab('features')}
              className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all ${
                activeTab === 'features'
                  ? 'bg-white text-gray-900 shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              المواصفات والمميزات
            </button>
          </div>

          {/* محتوى نظرة عامة */}
          {activeTab === 'overview' && (
            <div className="space-y-4 animate-fadeIn">
              {/* الوصف */}
              {farm.description_ar && (
                <div className="p-5 bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl border-2 border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center">
                      <Info className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">عن المزرعة</h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{farm.description_ar}</p>
                </div>
              )}

              {/* شريط التقدم */}
              <div className="p-5 bg-white border-2 border-gray-200 rounded-2xl shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <span className="text-sm text-gray-600 block mb-1">نسبة الحجز</span>
                    <span className="text-3xl font-bold text-emerald-600">{bookedPercentage}%</span>
                  </div>
                  <div className="text-left">
                    <span className="text-sm text-gray-600 block mb-1">المتبقي</span>
                    <span className="text-3xl font-bold text-gray-900">{availablePercentage}%</span>
                  </div>
                </div>

                <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden mb-3">
                  <div
                    className="absolute inset-y-0 right-0 bg-gradient-to-l from-emerald-500 via-green-500 to-emerald-600 rounded-full transition-all duration-1000 shadow-md"
                    style={{ width: `${bookedPercentage}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                  </div>
                </div>

                <div className="flex justify-between text-sm text-gray-600">
                  <span>{farm.total_trees - farm.available_trees} شجرة محجوزة</span>
                  <span>{farm.available_trees} شجرة متاحة</span>
                </div>
              </div>

              {/* الموقع */}
              {farm.google_map_link && (
                <a
                  href={farm.google_map_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-5 bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl hover:shadow-lg transition-all active:scale-[0.98]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                        <MapPin className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <div className="text-lg font-bold text-gray-900">عرض على الخريطة</div>
                        <div className="text-sm text-gray-600">موقع المزرعة على خرائط جوجل</div>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 rotate-180" />
                  </div>
                </a>
              )}
            </div>
          )}

          {/* محتوى المميزات المتطور */}
          {activeTab === 'features' && (
            <div className="space-y-4 animate-fadeIn">
              {/* عنوان القسم */}
              <div className="flex items-center gap-3 mb-2">
                <div className="w-1.5 h-8 bg-gradient-to-b from-emerald-500 to-green-500 rounded-full" />
                <h2 className="text-xl font-bold text-gray-900">مواصفات ومميزات المزرعة</h2>
              </div>

              {/* بطاقات المميزات المتطورة */}
              <div className="grid grid-cols-1 gap-4">
                {features.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <div
                      key={feature.id}
                      className={`relative overflow-hidden rounded-2xl border-2 transition-all ${
                        feature.available
                          ? `${feature.borderColor} bg-gradient-to-br ${feature.bgColor} shadow-sm hover:shadow-md`
                          : 'border-gray-200 bg-gray-50 opacity-70'
                      }`}
                    >
                      <div className="p-5">
                        <div className="flex items-center gap-4">
                          {/* الأيقونة */}
                          <div className={`relative w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${
                            feature.available
                              ? `bg-gradient-to-br ${feature.color}`
                              : 'bg-gray-300'
                          }`}>
                            <Icon className={`w-8 h-8 ${feature.available ? 'text-white' : 'text-gray-500'}`} />

                            {/* علامة الصح */}
                            {feature.available && (
                              <div className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                              </div>
                            )}
                          </div>

                          {/* المعلومات */}
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 mb-1">{feature.label}</h3>
                            <p className="text-sm text-gray-600">{feature.description}</p>
                            <div className={`inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-xs font-bold ${
                              feature.available
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-200 text-gray-600'
                            }`}>
                              {feature.available ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>متوفر</span>
                                </>
                              ) : (
                                <span>غير متوفر</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* خط تزييني للمتوفر */}
                      {feature.available && (
                        <div className={`h-1 bg-gradient-to-r ${feature.color}`} />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* معلومات إضافية */}
              <div className="mt-6 p-5 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Star className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">مزرعة معتمدة</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      جميع المزارع المعروضة معتمدة ومراقبة من قبل فريقنا المتخصص لضمان أفضل جودة وخدمة
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* شريط الحجز الثابت المحسّن */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-2xl z-50">
        <div className="p-4 max-w-lg mx-auto">
          <button
            onClick={onStartBooking}
            disabled={!farm.available_trees || farm.available_trees === 0}
            className={`w-full relative overflow-hidden rounded-2xl transition-all ${
              farm.available_trees > 0
                ? 'hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl'
                : 'opacity-50 cursor-not-allowed'
            }`}
          >
            <div className={`absolute inset-0 ${
              farm.available_trees > 0
                ? 'bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-600 bg-[length:200%_100%] animate-gradient'
                : 'bg-gray-400'
            }`} />

            <div className="relative px-6 py-5 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium opacity-90">ابدأ الحجز الآن</div>
                  <div className="text-lg font-bold">
                    {farm.available_trees > 0
                      ? `${farm.available_trees} شجرة متاحة`
                      : 'غير متاح حالياً'
                    }
                  </div>
                </div>
              </div>

              <ArrowRight className="w-6 h-6" />
            </div>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          animation: gradient 3s ease infinite;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
      </div>

      {/* الزر العائم الذكي للواتساب */}
      <AdaptiveSmartButton
        phoneNumber="966500000000"
        defaultMessage={`مرحباً! أود الاستفسار عن ${farm?.farm_name_ar || 'هذه المزرعة'}`}
      />
    </>
  );
};
