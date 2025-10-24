import React, { useState } from 'react';
import { Sprout, MapPin, TrendingUp, Map } from 'lucide-react';
import { brandColors, brandGradients } from '../../finance/styles/brandColors';
import { PublicFarm } from '../types/farm.types';

interface FarmCard3DProps {
  farm: PublicFarm;
  onOwn: () => void;
  onClick?: () => void;
}

export function FarmCard3D({ farm, onOwn, onClick }: FarmCard3DProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const isOlive = farm.tree_type === 'olive' || farm.tree_type === 'زيتون';
  const isPalm = farm.tree_type === 'palm' || farm.tree_type === 'نخيل';

  const oliveColors = {
    primary: '#6B8E23',
    secondary: '#556B2F',
    light: '#8BA574',
    gradient: 'linear-gradient(135deg, #6B8E23 0%, #556B2F 50%, #8BA574 100%)',
    shadow: 'rgba(107, 142, 35, 0.4)',
  };

  const getTreeText = () => {
    if (isOlive) return 'ابدأ رحلتك بامتلاك شجرة زيتون';
    if (isPalm) return 'ابدأ رحلتك بامتلاك أول نخلة';
    return 'ابدأ رحلتك الآن';
  };

  const getTreeEmoji = () => {
    if (isOlive) return '🫒';
    if (isPalm) return '🌴';
    return '🌳';
  };

  const farmImage = farm.aerial_image ||
    (isOlive
      ? 'https://images.pexels.com/photos/4505457/pexels-photo-4505457.jpeg?auto=compress&cs=tinysrgb&w=800'
      : 'https://images.pexels.com/photos/2132227/pexels-photo-2132227.jpeg?auto=compress&cs=tinysrgb&w=800');

  return (
    <div
      className="group relative overflow-hidden cursor-pointer transition-all duration-700 touch-manipulation active:scale-95"
      style={{
        background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 246, 241, 0.95) 100%)',
        transform: isHovered ? 'translateY(-8px) rotateX(1deg)' : 'translateY(0) rotateX(0deg)',
        transformStyle: 'preserve-3d',
        perspective: '1000px',
        boxShadow: isHovered
          ? `0 20px 50px rgba(0, 0, 0, 0.18), 0 0 0 2px ${isOlive ? oliveColors.light : brandColors.primary.gold}`
          : '0 10px 30px rgba(0, 0, 0, 0.1)',
        borderRadius: '20px',
        border: '2px solid transparent',
        backgroundImage: isOlive
          ? `linear-gradient(white, white), linear-gradient(135deg, ${oliveColors.primary} 0%, ${oliveColors.secondary} 100%)`
          : 'linear-gradient(white, white), linear-gradient(135deg, #D4AF37 0%, #8BA574 100%)',
        backgroundOrigin: 'border-box',
        backgroundClip: 'padding-box, border-box',
      }}
      onClick={() => onClick && onClick()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
    >
      <div className="absolute top-0 left-0 w-full h-2 opacity-60" style={{
        background: isOlive
          ? 'linear-gradient(90deg, transparent, #6B8E23, transparent)'
          : 'linear-gradient(90deg, transparent, #D4AF37, transparent)',
      }} />

      {farm.status === 'full' && (
        <div className="absolute top-4 right-4 z-20 px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm shadow-2xl" style={{
          background: 'linear-gradient(135deg, #D4AF37 0%, #C5A028 50%, #B8942A 100%)',
          color: '#1a1a1a',
          border: '2px solid rgba(255, 255, 255, 0.6)',
          boxShadow: '0 8px 30px rgba(212, 175, 55, 0.5), 0 0 20px rgba(212, 175, 55, 0.3)',
          textShadow: '0 1px 2px rgba(255, 255, 255, 0.5)',
        }}>
          <span className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-base sm:text-lg">✨</span>
            <span className="whitespace-nowrap">اكتمل البيع</span>
          </span>
        </div>
      )}

      {farm.status !== 'full' && farm.booking_percentage >= 60 && (
        <div className="absolute top-4 right-4 z-20 px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm shadow-xl" style={{
          background: 'linear-gradient(135deg, rgba(139, 165, 116, 0.95) 0%, rgba(107, 142, 35, 0.95) 100%)',
          color: 'white',
          border: '2px solid rgba(255, 255, 255, 0.4)',
          boxShadow: '0 8px 25px rgba(139, 165, 116, 0.4)',
          animation: 'pulse-glow 5s ease-in-out infinite',
        }}>
          <span className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-base sm:text-lg">🌿</span>
            <span className="whitespace-nowrap">اقترب اكتمال الحجز!</span>
          </span>
        </div>
      )}

      {farm.status !== 'full' && farm.booking_percentage < 60 && (
        <div className="absolute top-4 right-4 z-20 px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm shadow-xl" style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.95) 0%, rgba(5, 150, 105, 0.95) 100%)',
          color: 'white',
          border: '2px solid rgba(255, 255, 255, 0.4)',
          boxShadow: '0 8px 25px rgba(16, 185, 129, 0.4)',
        }}>
          <span className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-base sm:text-lg">🌟</span>
            <span className="whitespace-nowrap">مفتوح للحجز</span>
          </span>
        </div>
      )}

      <div className="relative h-48 sm:h-60 md:h-72 overflow-hidden" style={{ borderRadius: '18px 18px 0 0' }}>
        <div className="absolute inset-0 z-10" style={{
          background: isOlive
            ? 'radial-gradient(circle at 30% 40%, rgba(107, 142, 35, 0.15) 0%, transparent 60%)'
            : 'radial-gradient(circle at 30% 40%, rgba(212, 175, 55, 0.15) 0%, transparent 60%)',
        }} />

        <img
          src={farmImage}
          alt={farm.farm_name}
          onLoad={() => setImageLoaded(true)}
          className="w-full h-full object-cover transition-all duration-1000"
          style={{
            transform: isHovered ? 'scale(1.15) translateZ(20px)' : 'scale(1) translateZ(0)',
            transformStyle: 'preserve-3d',
            filter: imageLoaded ? 'brightness(0.92) contrast(1.05)' : 'blur(20px)',
          }}
        />

        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.4) 100%)',
          }}
        />

        <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4 flex items-center justify-center">
          <div
            className="px-3 py-2 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl backdrop-blur-xl font-black text-sm sm:text-base transition-all duration-500"
            style={{
              background: 'rgba(0, 0, 0, 0.6)',
              color: 'white',
              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)',
              border: '2px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <span className="text-lg sm:text-xl mr-2">{getTreeEmoji()}</span>
            <span className="text-sm sm:text-base">{farm.farm_name}</span>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5 md:p-6">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-5">
          <div
            className="relative rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center overflow-hidden transition-all duration-500 active:scale-95 sm:hover:scale-105"
            style={{
              background: isOlive
                ? 'linear-gradient(135deg, rgba(107, 142, 35, 0.1) 0%, rgba(139, 165, 116, 0.15) 100%)'
                : 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.15) 100%)',
              border: `2px solid ${isOlive ? 'rgba(107, 142, 35, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
              boxShadow: isOlive
                ? '0 4px 15px rgba(107, 142, 35, 0.15)'
                : '0 4px 15px rgba(16, 185, 129, 0.15)',
            }}
          >
            <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 rounded-full blur-2xl opacity-30" style={{
              background: isOlive ? oliveColors.primary : '#10B981',
            }} />

            <div className="relative z-10">
              <div className="flex items-center justify-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                <Sprout className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: isOlive ? oliveColors.primary : '#10B981' }} />
                <p className="text-[10px] sm:text-xs font-black" style={{ color: brandColors.text.secondary }}>
                  أشجار متاحة
                </p>
              </div>
              <p className="text-2xl sm:text-3xl font-black mb-0.5 sm:mb-1" style={{ color: isOlive ? oliveColors.primary : '#10B981' }}>
                {farm.available_trees.toLocaleString('ar-SA')}
              </p>
              <div className="w-10 sm:w-12 h-1 rounded-full mx-auto" style={{
                background: isOlive ? oliveColors.gradient : 'linear-gradient(90deg, #10B981, transparent)',
              }} />
            </div>
          </div>

          <div
            className="relative rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center overflow-hidden transition-all duration-500 active:scale-95 sm:hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(218, 165, 32, 0.15) 100%)',
              border: '2px solid rgba(212, 175, 55, 0.3)',
              boxShadow: '0 4px 15px rgba(212, 175, 55, 0.15)',
            }}
          >
            <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 rounded-full blur-2xl opacity-30" style={{
              background: brandColors.primary.gold,
            }} />

            <div className="relative z-10">
              <div className="flex items-center justify-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: brandColors.primary.gold }} />
                <p className="text-[10px] sm:text-xs font-black" style={{ color: brandColors.text.secondary }}>
                  السعر / شجرة
                </p>
              </div>
              <p className="text-2xl sm:text-3xl font-black mb-0.5" style={{ color: brandColors.primary.gold }}>
                {farm.base_price.toLocaleString('ar-SA')}
              </p>
              <p className="text-[10px] sm:text-xs font-black" style={{ color: brandColors.text.secondary }}>
                ريال سعودي
              </p>
            </div>
          </div>
        </div>

        <div
          className="p-3 sm:p-4 rounded-xl sm:rounded-2xl mb-4 sm:mb-5"
          style={{
            background: 'linear-gradient(135deg, rgba(248, 246, 241, 0.8) 0%, rgba(237, 230, 217, 0.6) 100%)',
            border: '2px solid rgba(212, 175, 55, 0.2)',
          }}
        >
          <p className="text-xs sm:text-sm font-medium leading-relaxed text-center" style={{ color: '#4a5d3e' }}>
            {farm.description || `مزرعة ${isOlive ? 'زيتون' : 'نخيل'} فاخرة في ${farm.location_city}، ${farm.location_region}`}
          </p>
        </div>

        {farm.google_map_link && (
          <a
            href={farm.google_map_link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="block w-full py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-black text-sm sm:text-base transition-all duration-500 flex items-center justify-center gap-2 mb-3 sm:mb-4 active:scale-95 sm:hover:scale-105 touch-manipulation"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 246, 241, 0.8) 100%)',
              color: isOlive ? oliveColors.primary : brandColors.primary.olive,
              border: `2px solid ${isOlive ? oliveColors.light : brandColors.primary.gold}`,
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
            }}
          >
            <Map className="h-4 w-4 sm:h-5 sm:w-5" />
            فتح الخارطة
            <span className="text-lg sm:text-xl">🗺️</span>
          </a>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            onOwn();
          }}
          disabled={farm.status === 'full'}
          className="relative w-full py-4 sm:py-5 rounded-xl sm:rounded-2xl font-black text-base sm:text-lg transition-all duration-500 flex items-center justify-center gap-2 sm:gap-3 disabled:cursor-not-allowed overflow-hidden group/btn touch-manipulation active:scale-95"
          style={{
            background: farm.status === 'full'
              ? 'linear-gradient(135deg, rgba(156, 163, 175, 0.9) 0%, rgba(107, 114, 128, 0.9) 100%)'
              : isOlive
                ? oliveColors.gradient
                : brandGradients.gold,
            color: 'white',
            boxShadow: farm.status !== 'full' && isHovered
              ? `0 15px 40px ${isOlive ? oliveColors.shadow : brandColors.shadow.gold}`
              : '0 8px 25px rgba(0, 0, 0, 0.15)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            opacity: farm.status === 'full' ? 0.8 : 1,
          }}
        >
          <div className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500" style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, transparent 100%)',
          }} />

          <span className="relative z-10 flex items-center gap-2 sm:gap-3">
            {farm.status === 'full' ? (
              <>
                <span className="text-xl sm:text-2xl">🔒</span>
                <span className="text-sm sm:text-base leading-tight">تم اكتمال الحجز بالكامل</span>
              </>
            ) : (
              <>
                <span className="text-xl sm:text-2xl transition-transform duration-500 group-hover/btn:scale-125">
                  {getTreeEmoji()}
                </span>
                <span className="text-sm sm:text-base leading-tight">{getTreeText()}</span>
                <span className="text-xl sm:text-2xl transition-transform duration-500 group-hover/btn:rotate-12">✨</span>
              </>
            )}
          </span>
        </button>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-2 opacity-60" style={{
        background: isOlive
          ? 'linear-gradient(90deg, transparent, #8BA574, transparent)'
          : 'linear-gradient(90deg, transparent, #D4AF37, transparent)',
      }} />
    </div>
  );
}
