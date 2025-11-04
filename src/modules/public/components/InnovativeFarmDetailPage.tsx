import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  MapPin,
  Trees,
  Droplets,
  Zap,
  Shield,
  Calendar,
  TrendingUp,
  Star,
  Award,
  Check,
  Info,
  Phone,
  Share2,
  Heart,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { FarmDetailService } from '../services/farmDetailService';
import { MazadCrownLoader } from '../../../components/common/MazadCrownLoader';

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
  const [selectedVariety, setSelectedVariety] = useState<any>(null);
  const [showFeatures, setShowFeatures] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'varieties' | 'features'>('overview');

  useEffect(() => {
    loadFarm();
  }, [farmId]);

  const loadFarm = async () => {
    try {
      setLoading(true);
      const data = await FarmDetailService.getFarmById(farmId);
      setFarm(data);
      if (data?.varieties && data.varieties.length > 0) {
        setSelectedVariety(data.varieties[0]);
      }
    } catch (error) {
      console.error('Error loading farm:', error);
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

  const features = [
    { id: 'well', icon: Droplets, label: 'بئر ماء', available: farm.has_well, color: 'from-blue-500 to-cyan-500' },
    { id: 'electricity', icon: Zap, label: 'كهرباء', available: farm.has_electricity, color: 'from-amber-500 to-orange-500' },
    { id: 'fence', icon: Shield, label: 'سور', available: farm.has_fence, color: 'from-emerald-500 to-green-500' },
    { id: 'road', icon: Calendar, label: 'طريق', available: farm.has_road, color: 'from-purple-500 to-pink-500' }
  ];

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {/* Header الرفيع والأنيق */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
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

      {/* المحتوى الرئيسي - يبدأ بعد الـ header */}
      <div className="pt-16 pb-32">
        {/* صورة المزرعة الكبيرة */}
        <div className="relative h-72 overflow-hidden">
          {farm.aerial_image ? (
            <img
              src={farm.aerial_image}
              alt={farm.name_ar}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-emerald-100 via-green-50 to-emerald-100 flex items-center justify-center">
              <Trees className="w-24 h-24 text-emerald-400" />
            </div>
          )}

          {/* شارة التوفر المطلق */}
          <div className="absolute top-4 right-4">
            <div className="px-4 py-2 bg-white/95 backdrop-blur-md rounded-full shadow-lg flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${availablePercentage > 20 ? 'bg-green-500' : 'bg-orange-500'} animate-pulse`} />
              <span className="text-sm font-bold text-gray-800">{availablePercentage}% متاح</span>
            </div>
          </div>
        </div>

        {/* معلومات المزرعة الرئيسية */}
        <div className="px-5 py-6 bg-white">
          {/* العنوان والموقع */}
          <div className="mb-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{farm.name_ar}</h1>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{farm.city} • {farm.region}</span>
                </div>
              </div>

              <div className="px-4 py-2 bg-gradient-to-br from-emerald-500 to-green-500 text-white rounded-2xl">
                <div className="text-xs opacity-90">نوع الشجرة</div>
                <div className="text-sm font-bold">{farm.tree_type}</div>
              </div>
            </div>

            {/* الإحصائيات السريعة */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl border border-emerald-100">
                <div className="flex items-center gap-2 mb-1">
                  <Trees className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs text-gray-600">إجمالي</span>
                </div>
                <div className="text-xl font-bold text-gray-900">{farm.total_trees}</div>
              </div>

              <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-green-600" />
                  <span className="text-xs text-gray-600">متاح</span>
                </div>
                <div className="text-xl font-bold text-green-600">{farm.available_trees}</div>
              </div>

              <div className="p-3 bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl border border-gray-200">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-gray-600" />
                  <span className="text-xs text-gray-600">محجوز</span>
                </div>
                <div className="text-xl font-bold text-gray-900">{farm.total_trees - farm.available_trees}</div>
              </div>
            </div>
          </div>

          {/* التابات الأنيقة */}
          <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-2xl">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 py-2.5 rounded-xl font-medium text-sm transition-all ${
                activeTab === 'overview'
                  ? 'bg-white text-gray-900 shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              نظرة عامة
            </button>
            <button
              onClick={() => setActiveTab('varieties')}
              className={`flex-1 py-2.5 rounded-xl font-medium text-sm transition-all ${
                activeTab === 'varieties'
                  ? 'bg-white text-gray-900 shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              الأصناف
            </button>
            <button
              onClick={() => setActiveTab('features')}
              className={`flex-1 py-2.5 rounded-xl font-medium text-sm transition-all ${
                activeTab === 'features'
                  ? 'bg-white text-gray-900 shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              المميزات
            </button>
          </div>

          {/* محتوى التاب - نظرة عامة */}
          {activeTab === 'overview' && (
            <div className="space-y-4 animate-fadeIn">
              {/* الوصف */}
              {farm.description_ar && (
                <div className="p-4 bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl border border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Info className="w-5 h-5 text-gray-600" />
                    <h3 className="font-bold text-gray-900">عن المزرعة</h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{farm.description_ar}</p>
                </div>
              )}

              {/* شريط التقدم الأنيق */}
              <div className="p-4 bg-white border-2 border-gray-100 rounded-2xl">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-gray-600">نسبة الحجز</span>
                  <span className="text-2xl font-bold text-emerald-600">{100 - availablePercentage}%</span>
                </div>
                <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="absolute inset-y-0 right-0 bg-gradient-to-l from-emerald-500 to-green-500 rounded-full transition-all duration-1000"
                    style={{ width: `${100 - availablePercentage}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-500">
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
                  className="block p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 rounded-2xl hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                        <MapPin className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">عرض الموقع</div>
                        <div className="text-sm text-gray-600">على خرائط جوجل</div>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 rotate-180" />
                  </div>
                </a>
              )}
            </div>
          )}

          {/* محتوى التاب - الأصناف */}
          {activeTab === 'varieties' && (
            <div className="space-y-3 animate-fadeIn">
              {farm.varieties && farm.varieties.length > 0 ? (
                farm.varieties.map((variety: any) => (
                  <button
                    key={variety.id}
                    onClick={() => setSelectedVariety(variety)}
                    className={`w-full text-right transition-all ${
                      selectedVariety?.id === variety.id
                        ? 'ring-2 ring-emerald-500 ring-offset-2'
                        : ''
                    }`}
                  >
                    <div className={`p-4 rounded-2xl border-2 transition-all ${
                      selectedVariety?.id === variety.id
                        ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-green-50'
                        : 'border-gray-200 bg-white hover:border-emerald-300'
                    }`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                            selectedVariety?.id === variety.id
                              ? 'bg-gradient-to-br from-emerald-500 to-green-500'
                              : 'bg-gray-100'
                          }`}>
                            {selectedVariety?.id === variety.id ? '✨' : '🌱'}
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-gray-900">{variety.variety_name}</h3>
                            <p className="text-sm text-gray-600">{variety.available_quantity} شجرة متاحة</p>
                          </div>
                        </div>
                        {selectedVariety?.id === variety.id && (
                          <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                            <Check className="w-5 h-5 text-white" />
                          </div>
                        )}
                      </div>

                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-emerald-600">
                          {variety.price_per_tree.toLocaleString()}
                        </span>
                        <span className="text-sm text-gray-600">ريال / شجرة</span>
                      </div>

                      {variety.description_ar && (
                        <p className="text-sm text-gray-600 mt-3 line-clamp-2">{variety.description_ar}</p>
                      )}
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Trees className="w-16 h-16 mx-auto mb-3 text-gray-300" />
                  <p>لا توجد أصناف متاحة حالياً</p>
                </div>
              )}
            </div>
          )}

          {/* محتوى التاب - المميزات */}
          {activeTab === 'features' && (
            <div className="space-y-3 animate-fadeIn">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.id}
                    className={`p-4 rounded-2xl border-2 transition-all ${
                      feature.available
                        ? 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50'
                        : 'border-gray-200 bg-gray-50 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                        feature.available
                          ? `bg-gradient-to-br ${feature.color} shadow-lg`
                          : 'bg-gray-200'
                      }`}>
                        <Icon className={`w-7 h-7 ${feature.available ? 'text-white' : 'text-gray-400'}`} />
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-gray-900 text-lg">{feature.label}</div>
                        <div className={`text-sm ${feature.available ? 'text-emerald-600' : 'text-gray-500'}`}>
                          {feature.available ? 'متوفر' : 'غير متوفر'}
                        </div>
                      </div>
                      {feature.available && (
                        <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                          <Check className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* شريط الحجز الثابت في الأسفل - بتصميم فاخر */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-40">
        <div className="p-4">
          <div className="flex items-center gap-3">
            {/* معلومات السعر */}
            <div className="flex-1 p-4 bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl border border-gray-200">
              <div className="text-xs text-gray-600 mb-1">السعر المختار</div>
              {selectedVariety ? (
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-900">
                    {selectedVariety.price_per_tree.toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-600">ريال</span>
                </div>
              ) : (
                <div className="text-sm text-gray-500">اختر صنف أولاً</div>
              )}
            </div>

            {/* زر الحجز الفاخر */}
            <button
              onClick={onStartBooking}
              disabled={!selectedVariety || selectedVariety.available_quantity === 0}
              className={`flex-1 relative overflow-hidden rounded-2xl transition-all ${
                selectedVariety && selectedVariety.available_quantity > 0
                  ? 'hover:scale-[1.02] active:scale-95'
                  : 'opacity-50 cursor-not-allowed'
              }`}
            >
              <div className={`absolute inset-0 ${
                selectedVariety && selectedVariety.available_quantity > 0
                  ? 'bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-600 bg-[length:200%_100%] animate-gradient'
                  : 'bg-gray-400'
              }`} />

              <div className="relative px-6 py-4 flex items-center justify-center gap-2 text-white">
                <span className="text-lg font-bold">احجز الآن</span>
                <ArrowRight className="w-5 h-5" />
              </div>
            </button>

            {/* زر الاتصال */}
            <button className="w-14 h-14 bg-gradient-to-br from-emerald-600 to-green-600 rounded-2xl flex items-center justify-center text-white hover:shadow-xl transition-all hover:scale-105 active:scale-95">
              <Phone className="w-6 h-6" />
            </button>
          </div>
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
  );
};
