import { useState, useEffect } from 'react';
import { ArrowRight, Crown, ChevronDown, ChevronUp, MapPin, TrendingUp, Shield, Calendar, Award, Eye } from 'lucide-react';
import { FarmDetailService, FarmDetail } from '../services/farmDetailService';
import { MazadCrownLoader } from '../../../components/common/MazadCrownLoader';

interface InnovativeFarmDetailPageProps {
  farmId: string;
  onBack: () => void;
  onStartBooking: () => void;
}

export function InnovativeFarmDetailPage({ farmId, onBack, onStartBooking }: InnovativeFarmDetailPageProps) {
  const [farm, setFarm] = useState<FarmDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadFarm();
  }, [farmId]);

  const loadFarm = async () => {
    try {
      const data = await FarmDetailService.getFarmById(farmId);
      setFarm(data);
    } catch (error) {
      console.error('Error loading farm:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <MazadCrownLoader message="جاري تحميل المزرعة..." subtitle="مزادات" />;
  }

  if (!farm) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-green-50 p-4">
        <div className="text-center">
          <p className="text-xl font-bold mb-4 text-gray-800">لم يتم العثور على المزرعة</p>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-2xl font-bold"
          >
            العودة
          </button>
        </div>
      </div>
    );
  }

  const images = farm.images && farm.images.length > 0
    ? farm.images
    : ['https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=1200&q=80'];

  const progressPercent = Math.round(((farm.total_trees - farm.available_trees) / farm.total_trees) * 100);
  const isPalm = farm.tree_type === 'نخيل' || farm.tree_type === 'palm';
  const treeEmoji = isPalm ? '🌴' : '🫒';

  return (
    <div className="min-h-screen bg-white">
      {/* صورة Hero بملء الشاشة */}
      <div className="relative h-screen max-h-screen">
        {/* معرض الصور */}
        <div className="absolute inset-0">
          <img
            src={images[activeImage]}
            alt={farm.name_ar}
            className="w-full h-full object-cover"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90" />
        </div>

        {/* Header عائم */}
        <div className="absolute top-0 left-0 right-0 z-20 p-4 safe-top">
          <button
            onClick={onBack}
            className="w-11 h-11 bg-white/95 backdrop-blur-md rounded-full flex items-center justify-center shadow-xl active:scale-95 transition-transform"
          >
            <ArrowRight className="w-5 h-5 text-gray-800" />
          </button>
        </div>

        {/* نقاط التنقل بين الصور */}
        {images.length > 1 && (
          <div className="absolute top-20 left-0 right-0 flex justify-center gap-2 z-10">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(idx)}
                className={`h-1 rounded-full transition-all duration-300 ${
                  idx === activeImage ? 'w-8 bg-white' : 'w-1 bg-white/50'
                }`}
              />
            ))}
          </div>
        )}

        {/* معلومات المزرعة في الأسفل */}
        <div className="absolute bottom-0 left-0 right-0 p-6 pb-8">
          <div className="mb-4">
            <div className="inline-flex items-center gap-2 bg-emerald-500 px-3 py-1.5 rounded-full mb-3">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span className="text-white text-xs font-bold">متاح للحجز</span>
            </div>
            <h1 className="text-4xl font-black text-white mb-2 drop-shadow-2xl">
              {farm.name_ar}
            </h1>
            <div className="flex items-center gap-2 text-white/90">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{farm.city}, {farm.region}</span>
            </div>
          </div>
        </div>

        {/* سهم للأسفل */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-8 h-8 text-white/80" />
        </div>
      </div>

      {/* المحتوى القابل للسحب لأعلى */}
      <div className="relative bg-white rounded-t-3xl -mt-12 z-30 shadow-2xl">
        {/* Handle */}
        <div className="flex justify-center pt-3">
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </div>

        <div className="px-5 pb-24">
          {/* السعر والتوفر */}
          <div className="grid grid-cols-2 gap-3 mb-6 pt-4">
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-5 border-2 border-emerald-200">
              <div className="text-xs text-gray-600 mb-1">السعر</div>
              <div className="text-3xl font-black text-emerald-600 mb-0.5">
                {farm.price_per_tree?.toLocaleString()}
              </div>
              <div className="text-xs text-gray-600">ريال/شجرة</div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-5 border-2 border-amber-200">
              <div className="text-xs text-gray-600 mb-1">متاح</div>
              <div className="text-3xl font-black text-amber-600 mb-0.5">
                {farm.available_trees}
              </div>
              <div className="text-xs text-gray-600">شجرة</div>
            </div>
          </div>

          {/* شريط التقدم */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-gray-700">
                حُجز {progressPercent}% من الأشجار
              </span>
              <span className="text-sm font-bold text-emerald-600">
                {farm.available_trees} متبقي
              </span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 rounded-full relative overflow-hidden"
                style={{ width: `${progressPercent}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
              </div>
            </div>
          </div>

          {/* المميزات الرئيسية */}
          <div className="mb-6">
            <h3 className="text-lg font-black mb-4 flex items-center gap-2">
              {treeEmoji}
              <span>مميزات الاستثمار</span>
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-emerald-50 to-transparent rounded-xl">
                <TrendingUp className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-bold text-gray-800 text-sm mb-0.5">عائد سنوي مضمون</div>
                  <div className="text-xs text-gray-600">عائد {farm.expected_annual_return}% سنوياً</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-blue-50 to-transparent rounded-xl">
                <Shield className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-bold text-gray-800 text-sm mb-0.5">حماية كاملة</div>
                  <div className="text-xs text-gray-600">تأمين شامل على الأشجار</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-purple-50 to-transparent rounded-xl">
                <Award className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-bold text-gray-800 text-sm mb-0.5">ملكية موثقة</div>
                  <div className="text-xs text-gray-600">شهادة ملكية رسمية باسمك</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-orange-50 to-transparent rounded-xl">
                <Calendar className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-bold text-gray-800 text-sm mb-0.5">إدارة احترافية</div>
                  <div className="text-xs text-gray-600">رعاية وصيانة دورية</div>
                </div>
              </div>
            </div>
          </div>

          {/* تفاصيل إضافية قابلة للطي */}
          <div className="mb-6">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-2xl active:scale-[0.98] transition-transform"
            >
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-gray-600" />
                <span className="font-bold text-gray-800">معلومات إضافية</span>
              </div>
              {showDetails ? (
                <ChevronUp className="w-5 h-5 text-gray-600" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-600" />
              )}
            </button>

            {showDetails && (
              <div className="mt-3 p-4 bg-gray-50 rounded-2xl space-y-3 animate-slideDown">
                {farm.description && (
                  <div>
                    <div className="text-sm font-bold text-gray-700 mb-1">الوصف</div>
                    <p className="text-sm text-gray-600 leading-relaxed">{farm.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">إجمالي الأشجار</div>
                    <div className="text-lg font-bold text-gray-800">{farm.total_trees}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">نوع الشجرة</div>
                    <div className="text-lg font-bold text-gray-800">{farm.tree_type}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* زر الحجز الثابت */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 pb-safe z-40">
          <button
            onClick={onStartBooking}
            className="w-full bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl active:scale-[0.98] transition-all relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-active:translate-x-full transition-transform duration-700" />
            <span className="relative flex items-center justify-center gap-2">
              <Crown className="w-6 h-6" />
              احجز الآن
            </span>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
        .safe-top {
          padding-top: max(1rem, env(safe-area-inset-top));
        }
        .pb-safe {
          padding-bottom: max(1rem, env(safe-area-inset-bottom));
        }
      `}</style>
    </div>
  );
}
