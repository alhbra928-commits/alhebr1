import { useState, useEffect } from 'react';
import { MapPin, TrendingUp, Sparkles, TreeDeciduous, Droplet, Zap, Award, Star } from 'lucide-react';
import { brandColors, brandGradients } from '../../finance/styles/brandColors';

interface FarmData {
  name: string;
  type: 'نخيل' | 'زيتون' | 'مختلط';
  totalTrees: number;
  availableTrees: number;
  pricePerTree: number;
  location: string;
  area: string;
  description: string;
  imageUrl?: string;
  status: 'available' | 'full';
}

interface AdvancedHeroCardProps {
  farm: FarmData;
  onReserve?: () => void;
}

export function AdvancedHeroCard({ farm, onReserve }: AdvancedHeroCardProps) {
  const [currentCount, setCurrentCount] = useState(0);
  const [currentAvailable, setCurrentAvailable] = useState(0);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const availabilityPercentage = (farm.availableTrees / farm.totalTrees) * 100;
  const bookedPercentage = 100 - availabilityPercentage;

  useEffect(() => {
    console.log('🖼️ Farm Card:', { name: farm.name, imageUrl: farm.imageUrl, hasImage: !!farm.imageUrl });
    setImageError(false);
  }, [farm.name, farm.imageUrl]);

  useEffect(() => {
    const duration = 1500;
    const steps = 40;
    const increment = farm.totalTrees / steps;
    const availableIncrement = farm.availableTrees / steps;
    const priceIncrement = farm.pricePerTree / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      if (step <= steps) {
        setCurrentCount(Math.min(Math.round(increment * step), farm.totalTrees));
        setCurrentAvailable(Math.min(Math.round(availableIncrement * step), farm.availableTrees));
        setCurrentPrice(Math.min(Math.round(priceIncrement * step), farm.pricePerTree));
      } else {
        clearInterval(timer);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [farm.totalTrees, farm.availableTrees, farm.pricePerTree]);

  const typeIcon = farm.type === 'نخيل' ? '🌴' : farm.type === 'زيتون' ? '🫒' : '🌿';
  const typeEmoji = farm.type === 'نخيل' ? '🌴' : '🫒';

  const getButtonText = () => {
    if (farm.status === 'full') return 'مكتمل';
    if (farm.type === 'نخيل') return 'تملك نخلتك الآن';
    if (farm.type === 'زيتون') return 'تملك شجرة الزيتون';
    return 'تملك شجرتك الآن';
  };

  return (
    <div className="w-full max-w-md mx-auto perspective-2000">
      <div
        className="relative overflow-hidden group"
        style={{
          borderRadius: '20px',
          background: 'linear-gradient(145deg, #ffffff 0%, #fafaf8 50%, #f5f3ef 100%)',
          border: '3px solid transparent',
          backgroundClip: 'padding-box',
          boxShadow: `
            0 15px 50px rgba(0, 0, 0, 0.25),
            0 10px 30px rgba(212, 175, 55, 0.2),
            0 3px 10px rgba(0, 0, 0, 0.12),
            inset 0 1px 0 rgba(255, 255, 255, 0.9),
            inset 0 -1px 0 rgba(0, 0, 0, 0.08)
          `,
          transform: isHovered ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
          transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className="absolute -inset-[3px] rounded-[20px] -z-10"
          style={{
            background: 'linear-gradient(135deg, #D4AF37 0%, #F4E4A6 25%, #D4AF37 50%, #8B7355 75%, #D4AF37 100%)',
            backgroundSize: '200% 200%',
            animation: isHovered ? 'gradientShift 3s ease infinite' : 'none',
          }}
        />

        <div
          className="absolute inset-0 opacity-30 pointer-events-none rounded-[20px]"
          style={{
            background: 'radial-gradient(circle at 50% 0%, rgba(212, 175, 55, 0.2) 0%, transparent 70%)',
          }}
        />

        <div className="relative h-52 sm:h-64 md:h-72 overflow-hidden rounded-t-[17px]">
          <div
            className="absolute inset-0 z-0"
            style={{
              background: 'linear-gradient(135deg, #E8E3D8 0%, #F0EDE5 50%, #DDD8CC 100%)',
            }}
          />

          {farm.imageUrl && farm.imageUrl.trim() !== '' && !imageError ? (
            <img
              src={farm.imageUrl}
              alt={farm.name}
              className="w-full h-full object-cover relative z-10 transition-transform duration-700"
              style={{
                transform: isHovered ? 'scale(1.15)' : 'scale(1)',
              }}
              onLoad={() => {
                console.log('✅ Image loaded successfully:', farm.name);
              }}
              onError={(e) => {
                console.error('❌ Image failed to load:', farm.name, farm.imageUrl);
                setImageError(true);
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center relative z-10">
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(150, 160, 99, 0.5) 0%, transparent 50%), radial-gradient(circle at 70% 50%, rgba(212, 175, 55, 0.5) 0%, transparent 50%)',
                }}
              />
              <div className="text-7xl sm:text-8xl md:text-9xl relative z-10 animate-pulse">
                {typeIcon}
              </div>
            </div>
          )}

          <div
            className="absolute inset-0 z-20"
            style={{
              background: 'linear-gradient(180deg, rgba(0, 0, 0, 0) 40%, rgba(0, 0, 0, 0.6) 100%)',
            }}
          />

          <div className="absolute top-2 sm:top-3 md:top-4 left-2 sm:left-3 md:left-4 right-2 sm:right-3 md:right-4 flex justify-between items-start z-30">
            <div
              className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black flex items-center gap-1.5 sm:gap-2 backdrop-blur-2xl"
              style={{
                background: farm.status === 'available'
                  ? 'linear-gradient(135deg, rgba(150, 160, 99, 0.95) 0%, rgba(184, 197, 118, 0.95) 100%)'
                  : 'linear-gradient(135deg, rgba(139, 115, 85, 0.95) 0%, rgba(166, 137, 104, 0.95) 100%)',
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.25), 0 0 0 2px rgba(255, 255, 255, 0.15)',
              }}
            >
              <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-white animate-pulse shadow-lg" />
              <span className="text-white" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                {farm.status === 'available' ? 'متاح الآن' : 'مكتمل'}
              </span>
            </div>

            <div
              className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black flex items-center gap-1.5 sm:gap-2 backdrop-blur-2xl"
              style={{
                background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.95) 0%, rgba(244, 228, 166, 0.95) 100%)',
                boxShadow: '0 6px 20px rgba(212, 175, 55, 0.4), 0 0 0 2px rgba(255, 255, 255, 0.25)',
              }}
            >
              <Award className="h-3 sm:h-4 w-3 sm:w-4 text-white" />
              <span className="text-white" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>مميز</span>
            </div>
          </div>

          <div className="absolute bottom-2 sm:bottom-3 md:bottom-4 left-2 sm:left-3 md:left-4 right-2 sm:right-3 md:right-4 z-30">
            <div
              className="px-3 sm:px-4 py-2 sm:py-3 rounded-xl sm:rounded-2xl backdrop-blur-2xl flex items-center justify-between"
              style={{
                background: 'rgba(212, 175, 55, 0.4)',
                border: '2px solid rgba(212, 175, 55, 0.6)',
                boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)',
              }}
            >
              <div className="flex items-center gap-1.5 sm:gap-2">
                <MapPin className="h-4 sm:h-5 w-4 sm:w-5 text-white" />
                <span className="text-xs sm:text-sm font-bold text-white" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                  {farm.location}
                </span>
              </div>
              <div className="text-xl sm:text-2xl">{typeIcon}</div>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5 md:p-6 space-y-3 sm:space-y-4 md:space-y-5">
          <div className="text-center">
            <h2
              className="text-2xl sm:text-3xl md:text-4xl font-black mb-2 sm:mb-3 leading-tight tracking-wide"
              style={{
                background: 'linear-gradient(135deg, #D4AF37 0%, #8B7355 50%, #D4AF37 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 2px 10px rgba(212, 175, 55, 0.35))',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontWeight: '900',
                letterSpacing: '0.02em',
              }}
            >
              {farm.name}
            </h2>
            <p
              className="text-xs sm:text-sm text-gray-600 leading-relaxed line-clamp-2 px-1 sm:px-2"
              style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
            >
              {farm.description}
            </p>
          </div>

          <div
            className="grid grid-cols-2 gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.08) 0%, rgba(212, 175, 55, 0.03) 100%)',
              border: '2px solid rgba(212, 175, 55, 0.15)',
            }}
          >
            <div className="text-center p-2 sm:p-3 rounded-lg sm:rounded-xl bg-white shadow-sm">
              <TreeDeciduous className="h-5 sm:h-6 md:h-7 w-5 sm:w-6 md:w-7 mx-auto mb-1.5 sm:mb-2" style={{ color: brandColors.primary.gold }} />
              <div
                className="text-[10px] sm:text-xs font-bold text-gray-500 mb-1"
                style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
              >
                إجمالي الأشجار
              </div>
              <div
                className="text-xl sm:text-2xl md:text-3xl font-black"
                style={{
                  background: brandGradients.gold,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                }}
              >
                {currentCount.toLocaleString('ar-SA')}
              </div>
            </div>

            <div className="text-center p-2 sm:p-3 rounded-lg sm:rounded-xl bg-white shadow-sm">
              <Sparkles className="h-5 sm:h-6 md:h-7 w-5 sm:w-6 md:w-7 mx-auto mb-1.5 sm:mb-2" style={{ color: brandColors.accent.olive }} />
              <div
                className="text-[10px] sm:text-xs font-bold text-gray-500 mb-1"
                style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
              >
                متاح للحجز
              </div>
              <div
                className="text-xl sm:text-2xl md:text-3xl font-black"
                style={{
                  color: brandColors.accent.olive,
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                }}
              >
                {currentAvailable.toLocaleString('ar-SA')}
              </div>
            </div>
          </div>

          <div
            className="relative p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(150, 160, 99, 0.18) 0%, rgba(150, 160, 99, 0.08) 100%)',
              border: '3px solid rgba(150, 160, 99, 0.3)',
              boxShadow: '0 4px 15px rgba(150, 160, 99, 0.15)',
            }}
          >
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Star className="h-4 sm:h-5 w-4 sm:w-5" style={{ color: brandColors.accent.olive }} />
                <span
                  className="text-sm sm:text-base font-black text-gray-700"
                  style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                >
                  نسبة الحجز
                </span>
              </div>
              <span
                className="text-lg sm:text-xl md:text-2xl font-black px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg sm:rounded-xl"
                style={{
                  color: '#fff',
                  background: brandGradients.olive,
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  boxShadow: '0 4px 12px rgba(150, 160, 99, 0.3)',
                }}
              >
                {Math.round(bookedPercentage)}%
              </span>
            </div>
            <div className="h-3 sm:h-4 rounded-full overflow-hidden" style={{ background: 'rgba(150, 160, 99, 0.25)' }}>
              <div
                className="h-full rounded-full transition-all duration-1000 relative overflow-hidden flex items-center justify-center"
                style={{
                  width: `${bookedPercentage}%`,
                  background: brandGradients.olive,
                }}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
                    animation: 'shimmer 2s infinite',
                  }}
                />
                {bookedPercentage > 15 && (
                  <span
                    className="relative z-10 text-[10px] sm:text-xs font-black text-white"
                    style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                  >
                    محجوز
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <div
              className="text-center p-3 sm:p-4 rounded-lg sm:rounded-xl"
              style={{
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.08) 100%)',
                border: '2px solid rgba(59, 130, 246, 0.25)',
              }}
            >
              <Droplet className="h-5 sm:h-6 w-5 sm:w-6 mx-auto mb-1.5 sm:mb-2 text-blue-500" />
              <div
                className="text-[10px] sm:text-xs font-bold text-gray-500 mb-1"
                style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
              >
                المساحة
              </div>
              <div
                className="text-base sm:text-lg md:text-xl font-black text-blue-600"
                style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
              >
                {farm.area}
              </div>
            </div>

            <div
              className="text-center p-3 sm:p-4 rounded-lg sm:rounded-xl relative overflow-hidden"
              style={{
                background: brandGradients.gold,
                border: '2px solid rgba(255, 255, 255, 0.4)',
                boxShadow: '0 6px 20px rgba(212, 175, 55, 0.4)',
              }}
            >
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  background: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)',
                }}
              />
              <Zap className="h-5 sm:h-6 w-5 sm:w-6 mx-auto mb-1.5 sm:mb-2 text-white relative z-10" />
              <div
                className="text-[10px] sm:text-xs font-bold text-white opacity-90 mb-1 relative z-10"
                style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
              >
                السعر / شجرة
              </div>
              <div
                className="text-base sm:text-lg md:text-xl font-black text-white relative z-10"
                style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
              >
                {currentPrice.toLocaleString('ar-SA')} <span className="text-xs sm:text-sm">ر.س</span>
              </div>
            </div>
          </div>

          <button
            onClick={onReserve}
            disabled={farm.status === 'full'}
            className="w-full py-3 sm:py-3.5 md:py-4 rounded-xl sm:rounded-2xl font-black text-base sm:text-lg text-white transition-all duration-500 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
            style={{
              background: farm.status === 'available'
                ? 'linear-gradient(135deg, #16a34a 0%, #22c55e 50%, #16a34a 100%)'
                : '#999999',
              boxShadow: farm.status === 'available'
                ? '0 10px 30px rgba(22, 163, 74, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.3), 0 0 0 3px rgba(22, 163, 74, 0.12)'
                : 'none',
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, transparent 50%, rgba(255, 255, 255, 0.3) 100%)',
              }}
            />
            <div className="flex items-center justify-center gap-2 sm:gap-3 relative z-10">
              <span className="text-xl sm:text-2xl">{typeEmoji}</span>
              <span className="text-sm sm:text-base md:text-lg">{getButtonText()}</span>
              {farm.status === 'available' && <TrendingUp className="h-4 sm:h-5 w-4 sm:w-5" />}
            </div>
          </button>
        </div>

        <div
          className="absolute bottom-0 left-0 right-0 h-1 sm:h-1.5 rounded-b-[17px]"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, #D4AF37 20%, #F4E4A6 50%, #D4AF37 80%, transparent 100%)',
            boxShadow: '0 0 20px rgba(212, 175, 55, 0.6)',
          }}
        />
      </div>

      <style>{`
        .perspective-2000 {
          perspective: 2000px;
        }

        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
