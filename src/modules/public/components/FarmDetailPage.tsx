import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, MapPin, Trees, TrendingUp, CheckCircle, Clock, Share2, Heart, Phone } from 'lucide-react';
import { FarmDetailService } from '../services/farmDetailService';
import { FarmLoader } from '../../common/FarmLoader';

interface FarmDetailPageProps {}

export const FarmDetailPage: React.FC<FarmDetailPageProps> = () => {
  const { farmId } = useParams<{ farmId: string }>();
  const navigate = useNavigate();
  const [farm, setFarm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariety, setSelectedVariety] = useState<any>(null);
  const [showBookingSheet, setShowBookingSheet] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (farmId) {
      loadFarm();
    }
  }, [farmId]);

  const loadFarm = async () => {
    try {
      setLoading(true);
      const data = await FarmDetailService.getFarmById(farmId!);
      setFarm(data);
      if (data.varieties && data.varieties.length > 0) {
        setSelectedVariety(data.varieties[0]);
      }
    } catch (error) {
      console.error('Error loading farm:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <FarmLoader />;
  }

  if (!farm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🌴</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">المزرعة غير موجودة</h2>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-6 py-3 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-colors"
          >
            العودة للرئيسية
          </button>
        </div>
      </div>
    );
  }

  const farmImage = farm.aerial_image || '';
  const completionPercentage = farm.total_trees > 0
    ? Math.round(((farm.total_trees - farm.available_trees) / farm.total_trees) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {/* Header مع صورة المزرعة - Mobile First */}
      <div className="relative h-[50vh] min-h-[300px] max-h-[400px] overflow-hidden">
        {/* الصورة */}
        {farmImage ? (
          <img
            src={farmImage}
            alt={farm.name_ar}
            onLoad={() => setImageLoaded(true)}
            className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ${
              imageLoaded ? 'scale-105' : 'scale-100'
            }`}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-green-600 to-emerald-700 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="text-8xl mb-4">🌴</div>
              <p className="text-xl">لا توجد صورة متاحة</p>
            </div>
          </div>
        )}

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* زر الرجوع + مشاركة + إعجاب */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10">
          <button
            onClick={() => navigate('/')}
            className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
          >
            <ArrowRight className="w-5 h-5 text-gray-800" />
          </button>

          <div className="flex gap-2">
            <button
              onClick={() => setIsLiked(!isLiked)}
              className={`w-10 h-10 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg transition-all ${
                isLiked
                  ? 'bg-red-500 text-white'
                  : 'bg-white/90 text-gray-800 hover:bg-white'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            </button>

            <button className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors">
              <Share2 className="w-5 h-5 text-gray-800" />
            </button>
          </div>
        </div>

        {/* عنوان المزرعة في الأسفل */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{farm.city}</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">{farm.name_ar}</h1>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Trees className="w-4 h-4" />
              <span>{farm.total_trees} شجرة</span>
            </div>
            <div className="h-4 w-px bg-white/30" />
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              <span>{completionPercentage}% محجوز</span>
            </div>
          </div>
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="relative -mt-6">
        {/* بطاقة بيضاء مع زوايا دائرية */}
        <div className="bg-white rounded-t-3xl shadow-xl">
          {/* شريط التقدم */}
          <div className="px-6 pt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">نسبة الحجز</span>
              <span className="text-sm font-bold text-emerald-600">{completionPercentage}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full transition-all duration-700"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>

          {/* الأصناف المتاحة - Swipeable Cards */}
          {farm.varieties && farm.varieties.length > 0 && (
            <div className="px-6 py-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">الأصناف المتاحة</h2>
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-6 px-6 snap-x snap-mandatory scrollbar-hide">
                {farm.varieties.map((variety: any) => (
                  <button
                    key={variety.id}
                    onClick={() => setSelectedVariety(variety)}
                    className={`flex-shrink-0 w-[280px] snap-start p-4 rounded-2xl border-2 transition-all ${
                      selectedVariety?.id === variety.id
                        ? 'border-emerald-500 bg-emerald-50 shadow-lg'
                        : 'border-gray-200 bg-white hover:border-emerald-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-bold text-gray-800">{variety.variety_name}</h3>
                      {selectedVariety?.id === variety.id && (
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">السعر</span>
                        <span className="text-xl font-bold text-emerald-600">
                          {variety.price_per_tree.toLocaleString()} ريال
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">متاح</span>
                        <span className="font-semibold text-gray-800">
                          {variety.available_quantity} شجرة
                        </span>
                      </div>

                      {variety.description_ar && (
                        <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                          {variety.description_ar}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* الوصف */}
          {farm.description_ar && (
            <div className="px-6 py-4 border-t border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 mb-3">عن المزرعة</h2>
              <p className="text-gray-600 leading-relaxed">{farm.description_ar}</p>
            </div>
          )}

          {/* المواصفات */}
          <div className="px-6 py-4 border-t border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4">المواصفات</h2>
            <div className="grid grid-cols-2 gap-3">
              {farm.has_well && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    💧
                  </div>
                  <span className="text-sm font-medium text-gray-700">بئر ماء</span>
                </div>
              )}

              {farm.has_electricity && (
                <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-xl">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    ⚡
                  </div>
                  <span className="text-sm font-medium text-gray-700">كهرباء</span>
                </div>
              )}

              {farm.has_fence && (
                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    🏛️
                  </div>
                  <span className="text-sm font-medium text-gray-700">سور</span>
                </div>
              )}

              {farm.has_road && (
                <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-xl">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    🛣️
                  </div>
                  <span className="text-sm font-medium text-gray-700">طريق معبد</span>
                </div>
              )}
            </div>
          </div>

          {/* الموقع */}
          <div className="px-6 py-4 border-t border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-3">الموقع</h2>
            <div className="flex items-center gap-2 text-gray-600 mb-3">
              <MapPin className="w-5 h-5 text-emerald-500" />
              <span>{farm.city}, {farm.region}</span>
            </div>
            {farm.google_map_link && (
              <a
                href={farm.google_map_link}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-3 bg-emerald-50 text-emerald-600 rounded-xl text-center font-medium hover:bg-emerald-100 transition-colors"
              >
                عرض على الخريطة
              </a>
            )}
          </div>

          {/* مساحة للأزرار السفلية */}
          <div className="h-24" />
        </div>
      </div>

      {/* شريط الأزرار السفلي الثابت */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-2xl z-50">
        <div className="max-w-lg mx-auto flex gap-3">
          <button
            onClick={() => setShowBookingSheet(true)}
            disabled={!selectedVariety || selectedVariety.available_quantity === 0}
            className={`flex-1 py-4 rounded-2xl font-bold text-lg transition-all ${
              selectedVariety && selectedVariety.available_quantity > 0
                ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:shadow-xl hover:scale-[1.02] active:scale-95'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {selectedVariety && selectedVariety.available_quantity > 0
              ? `احجز الآن - ${selectedVariety.price_per_tree.toLocaleString()} ريال`
              : 'غير متاح حالياً'}
          </button>

          <button className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center hover:bg-emerald-200 transition-colors">
            <Phone className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Bottom Sheet للحجز */}
      {showBookingSheet && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-end animate-fade-in"
          onClick={() => setShowBookingSheet(false)}
        >
          <div
            className="bg-white w-full rounded-t-3xl p-6 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6" />

            <h3 className="text-2xl font-bold text-gray-800 mb-4">تأكيد الحجز</h3>

            {selectedVariety && (
              <div className="space-y-4 mb-6">
                <div className="p-4 bg-gray-50 rounded-2xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">الصنف</span>
                    <span className="font-bold text-gray-800">{selectedVariety.variety_name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">السعر</span>
                    <span className="text-xl font-bold text-emerald-600">
                      {selectedVariety.price_per_tree.toLocaleString()} ريال
                    </span>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => {
                navigate(`/book/${farm.id}`, {
                  state: { farm, selectedVariety }
                });
              }}
              className="w-full py-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-2xl font-bold text-lg hover:shadow-xl transition-all"
            >
              متابعة الحجز
            </button>
          </div>
        </div>
      )}

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};
