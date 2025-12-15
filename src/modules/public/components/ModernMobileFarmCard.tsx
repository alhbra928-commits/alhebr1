import React, { useState } from 'react';
import { Sprout, MapPin, TrendingUp, Map, ChevronLeft, Star, Calendar, Users } from 'lucide-react';
import { PublicFarm } from '../types/farm.types';

interface ModernMobileFarmCardProps {
  farm: PublicFarm;
  onOwn: () => void;
  onClick?: () => void;
}

export function ModernMobileFarmCard({ farm, onOwn, onClick }: ModernMobileFarmCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [touchStart, setTouchStart] = useState(0);

  const isOlive = farm.tree_type === 'olive' || farm.tree_type === 'زيتون';
  const isPalm = farm.tree_type === 'palm' || farm.tree_type === 'نخيل';

  const themeColors = isOlive ? {
    primary: '#6B8E23',
    secondary: '#8BA574',
    gradient: 'linear-gradient(135deg, #6B8E23 0%, #556B2F 50%, #8BA574 100%)',
    light: 'rgba(107, 142, 35, 0.1)',
    border: 'rgba(107, 142, 35, 0.3)',
  } : {
    primary: '#10B981',
    secondary: '#059669',
    gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    light: 'rgba(16, 185, 129, 0.1)',
    border: 'rgba(16, 185, 129, 0.3)',
  };

  const getTreeText = () => {
    if (isOlive) return 'امتلك شجرة زيتون';
    if (isPalm) return 'امتلك نخلة';
    return 'ابدأ الآن';
  };

  const getTreeEmoji = () => {
    if (isOlive) return '🌳';
    if (isPalm) return '🌴';
    return '🌳';
  };

  const farmImage = farm.aerial_image ||
    (isOlive
      ? 'https://images.pexels.com/photos/4505457/pexels-photo-4505457.jpeg?auto=compress&cs=tinysrgb&w=800'
      : 'https://images.pexels.com/photos/2132227/pexels-photo-2132227.jpeg?auto=compress&cs=tinysrgb&w=800');

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEnd = e.changedTouches[0].clientY;
    if (Math.abs(touchEnd - touchStart) < 10 && onClick) {
      onClick();
    }
  };

  return (
    <div
      className="relative overflow-hidden rounded-3xl transition-all duration-300 active:scale-[0.98] touch-manipulation"
      style={{
        background: 'linear-gradient(145deg, #ffffff 0%, #fefefe 100%)',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)',
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Status Badge - More Prominent */}
      <div className="absolute top-3 right-3 z-30">
        {farm.status === 'full' ? (
          <div className="px-4 py-2 rounded-full backdrop-blur-xl" style={{
            background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.95), rgba(197, 160, 40, 0.95))',
            boxShadow: '0 4px 20px rgba(212, 175, 55, 0.4)',
          }}>
            <div className="flex items-center gap-2">
              <span className="text-base">✨</span>
              <span className="text-white text-xs font-black">اكتمل البيع</span>
            </div>
          </div>
        ) : farm.booking_percentage >= 60 ? (
          <div className="px-4 py-2 rounded-full backdrop-blur-xl animate-pulse" style={{
            background: 'linear-gradient(135deg, rgba(139, 165, 116, 0.95), rgba(107, 142, 35, 0.95))',
            boxShadow: '0 4px 20px rgba(139, 165, 116, 0.4)',
          }}>
            <div className="flex items-center gap-2">
              <span className="text-base">🔥</span>
              <span className="text-white text-xs font-black">اقترب الاكتمال</span>
            </div>
          </div>
        ) : (
          <div className="px-4 py-2 rounded-full backdrop-blur-xl" style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.95), rgba(5, 150, 105, 0.95))',
            boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4)',
          }}>
            <div className="flex items-center gap-2">
              <span className="text-base">🌟</span>
              <span className="text-white text-xs font-black">متاح الآن</span>
            </div>
          </div>
        )}
      </div>

      {/* Hero Image Section */}
      <div className="relative h-56 overflow-hidden">
        {/* Gradient Overlay */}
        <div className="absolute inset-0 z-10" style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0.6) 100%)',
        }} />

        {/* Image */}
        <img
          src={farmImage}
          alt={farm.farm_name}
          onLoad={() => setImageLoaded(true)}
          className="w-full h-full object-cover transition-all duration-700"
          style={{
            filter: imageLoaded ? 'brightness(0.9)' : 'blur(20px)',
            transform: imageLoaded ? 'scale(1)' : 'scale(1.1)',
          }}
        />

        {/* Farm Name Badge */}
        <div className="absolute bottom-4 left-4 right-4 z-20">
          <div className="backdrop-blur-2xl rounded-2xl p-4" style={{
            background: 'rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-3xl">{getTreeEmoji()}</div>
                <div>
                  <h3 className="text-white font-black text-lg leading-tight">{farm.farm_name}</h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <MapPin className="h-3 w-3 text-gray-300" />
                    <p className="text-gray-300 text-xs">{farm.location_city}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5">
        {/* Stats Cards - Modern Compact Design */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Available Trees */}
          <div
            className="relative rounded-2xl p-4 overflow-hidden"
            style={{
              background: themeColors.light,
              border: `1.5px solid ${themeColors.border}`,
            }}
          >
            <div className="absolute top-0 right-0 w-20 h-20 rounded-full blur-3xl opacity-20"
              style={{ background: themeColors.primary }}
            />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Sprout className="h-4 w-4" style={{ color: themeColors.primary }} />
                <span className="text-[10px] font-bold text-gray-600">متاح</span>
              </div>
              <div className="text-3xl font-black" style={{ color: themeColors.primary }}>
                {farm.available_trees.toLocaleString('ar-SA')}
              </div>
              <div className="text-[10px] text-gray-500 font-medium mt-1">شجرة</div>
            </div>
          </div>

          {/* Reserved Trees */}
          <div
            className="relative rounded-2xl p-4 overflow-hidden"
            style={{
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1.5px solid rgba(59, 130, 246, 0.3)',
            }}
          >
            <div className="absolute top-0 right-0 w-20 h-20 rounded-full blur-3xl opacity-20"
              style={{ background: '#3B82F6' }}
            />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-[#3B82F6]" />
                <span className="text-[10px] font-bold text-gray-600">المحجوز</span>
              </div>
              <div className="text-3xl font-black text-[#3B82F6]">
                {((farm.total_trees || 0) - (farm.available_trees || 0)).toLocaleString('ar-SA')}
              </div>
              <div className="text-[10px] text-gray-500 font-medium mt-1">شجرة</div>
            </div>
          </div>
        </div>

        {/* Booking Progress Bar */}
        {farm.status !== 'full' && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-600">نسبة الحجز</span>
              <span className="text-xs font-black" style={{ color: themeColors.primary }}>
                {farm.booking_percentage}%
              </span>
            </div>
            <div className="relative h-2 rounded-full overflow-hidden" style={{
              background: 'rgba(0, 0, 0, 0.05)',
            }}>
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${farm.booking_percentage}%`,
                  background: themeColors.gradient,
                }}
              />
            </div>
          </div>
        )}

        {/* Description */}
        {farm.description && (
          <div className="mb-4 p-4 rounded-2xl" style={{
            background: 'linear-gradient(135deg, rgba(248, 246, 241, 0.6), rgba(237, 230, 217, 0.4))',
            border: '1px solid rgba(0, 0, 0, 0.05)',
          }}>
            <p className="text-xs text-gray-700 leading-relaxed text-center">
              {farm.description}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Map Button */}
          {farm.google_map_link && (
            <a
              href={farm.google_map_link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl font-bold text-sm transition-all active:scale-95"
              style={{
                background: 'white',
                color: themeColors.primary,
                border: `2px solid ${themeColors.border}`,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
              }}
            >
              <Map className="h-4 w-4" />
              <span>عرض الموقع</span>
              <span className="text-base">📍</span>
            </a>
          )}

          {/* Main CTA Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOwn();
            }}
            disabled={farm.status === 'full'}
            className="relative w-full py-4 rounded-2xl font-black text-base transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden"
            style={{
              background: farm.status === 'full'
                ? 'linear-gradient(135deg, #9CA3AF, #6B7280)'
                : themeColors.gradient,
              color: 'white',
              boxShadow: farm.status === 'full'
                ? '0 4px 15px rgba(0, 0, 0, 0.15)'
                : `0 8px 25px ${themeColors.border}`,
            }}
          >
            <div className="relative z-10 flex items-center justify-center gap-3">
              {farm.status === 'full' ? (
                <>
                  <span className="text-xl">🔒</span>
                  <span>تم الاكتمال</span>
                </>
              ) : (
                <>
                  <span className="text-xl">{getTreeEmoji()}</span>
                  <span>{getTreeText()}</span>
                  <ChevronLeft className="h-5 w-5" />
                </>
              )}
            </div>

            {/* Shine Effect */}
            {farm.status !== 'full' && (
              <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity">
                <div className="absolute inset-0" style={{
                  background: 'linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
                }} />
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Bottom Accent Line */}
      <div className="h-1" style={{
        background: themeColors.gradient,
      }} />
    </div>
  );
}
