import React, { useState } from 'react';
import { MapPin, TreePine, TrendingUp, CheckCircle, ArrowLeft } from 'lucide-react';
import { PublicFarm } from '../types/farm.types';

interface InnovativeFarmCardProps {
  farm: PublicFarm;
  onClick: () => void;
}

export const InnovativeFarmCard: React.FC<InnovativeFarmCardProps> = ({ farm, onClick }) => {
  const [imageError, setImageError] = useState(false);

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

  return (
    <div
      className="group relative cursor-pointer"
      onClick={onClick}
    >
      {/* Glow Effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 via-green-500 to-teal-400 rounded-3xl blur-xl opacity-0 group-hover:opacity-30 transition-all duration-500"></div>

      {/* Main Card */}
      <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/60 hover:border-emerald-300 h-full">

        {/* Image Section */}
        <div className="relative h-56 overflow-hidden">
          {hasValidImage ? (
            <>
              <img
                src={farmImage}
                alt={farm.farm_name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                onError={() => setImageError(true)}
                loading="lazy"
              />
              {/* Image Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
            </>
          ) : (
            <>
              {/* Fallback Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 via-green-500 to-teal-500"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <TreePine className="w-24 h-24 text-white/30" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
            </>
          )}

          {/* Farm Code Badge */}
          {farm.barcode && (
            <div className="absolute top-4 left-4 px-4 py-2 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/60">
              <div className="flex items-center gap-2">
                <span className="text-xs text-emerald-600 font-medium">رقم المزرعة</span>
                <span className="text-sm font-bold text-emerald-800">{farm.barcode}</span>
              </div>
            </div>
          )}

          {/* Tree Type Badge */}
          <div className="absolute top-4 right-4 px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl shadow-lg">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{getTreeIcon(farm.tree_type)}</span>
              <span className="text-sm font-bold text-white">{getTreeTypeLabel(farm.tree_type)}</span>
            </div>
          </div>

          {/* Available Badge */}
          {farm.available_trees > 0 && farm.status === 'open' && (
            <div className="absolute bottom-4 right-4 px-4 py-2 bg-green-500/95 backdrop-blur-sm rounded-xl shadow-lg">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-white" />
                <span className="text-sm font-bold text-white">متاح</span>
              </div>
            </div>
          )}

          {/* Almost Full Badge */}
          {farm.status === 'almost_full' && (
            <div className="absolute bottom-4 left-4 px-4 py-2 bg-orange-500 rounded-xl shadow-lg animate-pulse">
              <span className="text-sm font-bold text-white">اقتراب الامتلاء</span>
            </div>
          )}

          {/* Full Badge */}
          {farm.status === 'full' && (
            <div className="absolute bottom-4 left-4 px-4 py-2 bg-red-500 rounded-xl shadow-lg">
              <span className="text-sm font-bold text-white">مكتمل</span>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-6">
          {/* Farm Name */}
          <h3 className="text-xl font-bold text-emerald-900 mb-4 line-clamp-2 min-h-[3.5rem]">
            {farm.farm_name}
          </h3>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            {/* Location */}
            <div className="col-span-2 flex items-start gap-3 p-3 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border border-emerald-100">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <MapPin className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-emerald-600 font-medium mb-0.5">الموقع</p>
                <p className="text-sm font-bold text-emerald-900 truncate">{location}</p>
              </div>
            </div>

            {/* Available Trees */}
            <div className="flex items-start gap-2 p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <TreePine className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-green-600 font-medium mb-0.5">متاح</p>
                <p className="text-sm font-bold text-green-800">{farm.available_trees || 0}</p>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-start gap-2 p-3 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-xl border border-teal-100">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <TrendingUp className="w-4 h-4 text-teal-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-teal-600 font-medium mb-0.5">السعر</p>
                <p className="text-sm font-bold text-teal-800">
                  {farm.base_price?.toLocaleString('ar-SA')} ر.س
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          {farm.description && (
            <p className="text-sm text-emerald-700 mb-4 line-clamp-2 leading-relaxed">
              {farm.description}
            </p>
          )}

          {/* Progress Bar */}
          {farm.booking_percentage > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs text-emerald-600 mb-1">
                <span>نسبة الحجز</span>
                <span className="font-bold">{farm.booking_percentage}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-green-500 transition-all duration-500"
                  style={{ width: `${farm.booking_percentage}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Action Button */}
          <button
            className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl group/btn disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            disabled={farm.status === 'full'}
          >
            <span>{farm.status === 'full' ? 'مكتملة' : 'عرض التفاصيل واحجز الآن'}</span>
            {farm.status !== 'full' && (
              <ArrowLeft className="w-5 h-5 group-hover/btn:-translate-x-1 transition-transform" />
            )}
          </button>
        </div>

        {/* Bottom Accent Line */}
        <div className="h-1 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500"></div>
      </div>
    </div>
  );
};
