import React, { useState } from 'react';
import { MapPin, TreePine, TrendingUp, CheckCircle, ArrowLeft, Sparkles, Award, Clock } from 'lucide-react';
import { PublicFarm } from '../types/farm.types';

interface InnovativeFarmCardProps {
  farm: PublicFarm;
  onClick: () => void;
}

export const InnovativeFarmCard: React.FC<InnovativeFarmCardProps> = ({ farm, onClick }) => {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const farmImage = farm.aerial_image ||
    (farm.ground_images && farm.ground_images.length > 0 ? farm.ground_images[0] : null);

  const hasValidImage = farmImage && !imageError;

  const getTreeIcon = (type: 'palm' | 'olive' | 'mixed') => {
    if (type === 'palm') return '🌴';
    if (type === 'olive') return '🫒';
    return '🌳';
  };

  const getTreeTypeLabel = (type: 'palm' | 'olive' | 'mixed') => {
    if (type === 'palm') return 'نخيل';
    if (type === 'olive') return 'زيتون';
    return 'مختلط';
  };

  const location = `${farm.location_city}${farm.location_region ? ` - ${farm.location_region}` : ''}`;

  const isAlmostFull = farm.booking_percentage >= 80;
  const isFull = farm.status === 'full';
  const isNew = new Date(farm.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  return (
    <div
      className="group relative cursor-pointer transform transition-all duration-500 hover:scale-105"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated Glow Effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 via-green-500 to-teal-400 rounded-3xl blur-xl opacity-0 group-hover:opacity-40 transition-all duration-700 animate-pulse"></div>

      {/* Main Card */}
      <div className="relative bg-white rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-500 border-2 border-emerald-100 hover:border-emerald-400 h-full">

        {/* Image Section with Parallax Effect */}
        <div className="relative h-64 overflow-hidden">
          {hasValidImage ? (
            <>
              <img
                src={farmImage}
                alt={farm.farm_name}
                className={`w-full h-full object-cover transition-all duration-1000 ${
                  isHovered ? 'scale-125 rotate-2' : 'scale-110'
                }`}
                onError={() => setImageError(true)}
                loading="lazy"
              />
              {/* Multi-layer Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-transparent"></div>
            </>
          ) : (
            <>
              {/* Premium Fallback */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600"></div>
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 left-0 w-full h-full" style={{
                  backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)',
                  backgroundSize: '30px 30px'
                }}></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <TreePine className="w-32 h-32 text-white/30 animate-pulse" />
              </div>
            </>
          )}

          {/* Top Badges Row */}
          <div className="absolute top-4 inset-x-4 flex justify-between items-start gap-2">
            {/* Farm Code Badge */}
            {farm.barcode && (
              <div className="px-3 py-2 bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-white/60 transform transition-all duration-300 hover:scale-105">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-emerald-600 font-semibold">#{farm.barcode}</span>
                </div>
              </div>
            )}

            {/* New Badge */}
            {isNew && (
              <div className="px-3 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl shadow-lg animate-bounce">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-white" />
                  <span className="text-xs font-bold text-white">جديد</span>
                </div>
              </div>
            )}

            {/* Tree Type Badge */}
            <div className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl shadow-xl border border-white/30">
              <div className="flex items-center gap-2">
                <span className="text-2xl drop-shadow-lg">{getTreeIcon(farm.tree_type)}</span>
                <span className="text-sm font-bold text-white">{getTreeTypeLabel(farm.tree_type)}</span>
              </div>
            </div>
          </div>

          {/* Bottom Status Badge */}
          <div className="absolute bottom-4 inset-x-4 flex justify-between items-end">
            {/* Left: Completion Status */}
            {isFull ? (
              <div className="px-4 py-2 bg-red-500/95 backdrop-blur-sm rounded-xl shadow-xl border-2 border-red-300">
                <span className="text-sm font-bold text-white">مكتمل الحجز</span>
              </div>
            ) : isAlmostFull ? (
              <div className="px-4 py-2 bg-orange-500/95 backdrop-blur-sm rounded-xl shadow-xl animate-pulse border-2 border-orange-300">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-white" />
                  <span className="text-sm font-bold text-white">اقتراب الامتلاء</span>
                </div>
              </div>
            ) : (
              <div className="px-4 py-2 bg-green-500/95 backdrop-blur-sm rounded-xl shadow-xl border-2 border-green-300">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-white" />
                  <span className="text-sm font-bold text-white">متاح للحجز</span>
                </div>
              </div>
            )}

            {/* Right: Premium Badge */}
            <div className="px-3 py-2 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-xl shadow-xl border-2 border-amber-200">
              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-white" />
                <span className="text-xs font-bold text-white">مزرعة مميزة</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section with Enhanced Design */}
        <div className="p-6 bg-gradient-to-b from-white to-emerald-50/30">
          {/* Farm Name with Animated Underline */}
          <div className="relative mb-6">
            <h3 className="text-2xl font-bold text-emerald-900 mb-2 line-clamp-2 leading-tight">
              {farm.farm_name}
            </h3>
            <div className="h-1 bg-gradient-to-r from-emerald-500 via-green-500 to-transparent rounded-full w-20 group-hover:w-32 transition-all duration-500"></div>
          </div>

          {/* Info Cards Grid */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            {/* Location Card */}
            <div className="col-span-2 group/card relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 to-green-500/10 rounded-2xl transform transition-transform group-hover/card:scale-105"></div>
              <div className="relative flex items-center gap-3 p-4 bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-emerald-100 hover:border-emerald-300 transition-all duration-300 shadow-lg hover:shadow-xl">
                <div className="flex-shrink-0 p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-emerald-600 font-semibold mb-1 uppercase tracking-wide">الموقع</p>
                  <p className="text-base font-bold text-emerald-900 truncate">{location}</p>
                </div>
              </div>
            </div>

            {/* Available Trees Card */}
            <div className="group/card relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-emerald-500/10 rounded-2xl transform transition-transform group-hover/card:scale-105"></div>
              <div className="relative flex flex-col items-center justify-center p-4 bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-green-100 hover:border-green-300 transition-all duration-300 shadow-lg hover:shadow-xl h-full">
                <div className="p-2.5 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg mb-2">
                  <TreePine className="w-5 h-5 text-white" />
                </div>
                <p className="text-xs text-green-600 font-semibold mb-1">متاح</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">
                  {farm.available_trees || 0}
                </p>
              </div>
            </div>

            {/* Price Card */}
            <div className="group/card relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-400/10 to-emerald-500/10 rounded-2xl transform transition-transform group-hover/card:scale-105"></div>
              <div className="relative flex flex-col items-center justify-center p-4 bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-teal-100 hover:border-teal-300 transition-all duration-300 shadow-lg hover:shadow-xl h-full">
                <div className="p-2.5 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl shadow-lg mb-2">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <p className="text-xs text-teal-600 font-semibold mb-1">السعر</p>
                <p className="text-xl font-bold bg-gradient-to-r from-teal-700 to-emerald-600 bg-clip-text text-transparent">
                  {farm.base_price?.toLocaleString('ar-SA')}
                </p>
                <p className="text-xs text-gray-600">ريال</p>
              </div>
            </div>
          </div>

          {/* Description with Fade Effect */}
          {farm.description && (
            <div className="relative mb-5 p-4 bg-gradient-to-br from-emerald-50/50 to-green-50/50 rounded-xl border border-emerald-100">
              <p className="text-sm text-emerald-800 line-clamp-2 leading-relaxed">
                {farm.description}
              </p>
            </div>
          )}

          {/* Enhanced Progress Bar */}
          {farm.booking_percentage > 0 && (
            <div className="mb-5 p-4 bg-white rounded-xl border-2 border-emerald-100 shadow-sm">
              <div className="flex items-center justify-between text-sm text-emerald-700 font-semibold mb-2">
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  نسبة الحجز
                </span>
                <span className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                  {farm.booking_percentage}%
                </span>
              </div>
              <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                <div
                  className={`absolute inset-y-0 left-0 bg-gradient-to-r ${
                    farm.booking_percentage >= 80
                      ? 'from-orange-500 to-red-500'
                      : 'from-emerald-500 to-green-500'
                  } rounded-full transition-all duration-1000 shadow-lg`}
                  style={{ width: `${farm.booking_percentage}%` }}
                >
                  <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Action Button */}
          <button
            className={`w-full relative overflow-hidden px-6 py-4 rounded-2xl font-bold text-lg transition-all duration-500 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 ${
              isFull
                ? 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed opacity-70'
                : 'bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 hover:from-emerald-700 hover:via-green-700 hover:to-teal-700'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            disabled={isFull}
          >
            {/* Button Glow Effect */}
            {!isFull && (
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
            )}

            <div className="relative flex items-center justify-center gap-3 text-white">
              {isFull ? (
                <span>المزرعة مكتملة</span>
              ) : (
                <>
                  <span>عرض التفاصيل واحجز الآن</span>
                  <ArrowLeft className="w-6 h-6 transform group-hover:-translate-x-2 transition-transform duration-300" />
                </>
              )}
            </div>
          </button>
        </div>

        {/* Premium Bottom Accent */}
        <div className="h-2 bg-gradient-to-r from-emerald-500 via-green-500 via-teal-500 to-emerald-500 bg-size-200 animate-gradient"></div>
      </div>
    </div>
  );
};
