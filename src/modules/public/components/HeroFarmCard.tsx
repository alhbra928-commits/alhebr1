import { useState } from 'react';
import { MapPin, Sprout } from 'lucide-react';
import { brandColors, brandGradients } from '../../finance/styles/brandColors';

interface HeroFarmCardProps {
  farmName: string;
  farmType: string;
  pricePerTree: number;
  location: string;
  imageUrl?: string;
  onViewDetails?: () => void;
}

export function HeroFarmCard({
  farmName,
  farmType,
  pricePerTree,
  location,
  imageUrl,
  onViewDetails,
}: HeroFarmCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const typeIcon = farmType.includes('نخيل') ? '🌴' : farmType.includes('زيتون') ? '🌳' : '🌿';

  return (
    <div className="relative perspective-1000">
      <div
        className="relative transform transition-all duration-700 ease-out"
        style={{
          transform: isHovered ? 'translateY(-12px) scale(1.02)' : 'translateY(0) scale(1)',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className="relative w-full max-w-md mx-auto rounded-3xl overflow-hidden"
          style={{
            background: '#FFFFFF',
            boxShadow: isHovered
              ? '0 40px 100px rgba(212, 175, 55, 0.4), 0 0 60px rgba(212, 175, 55, 0.2), inset 0 0 20px rgba(212, 175, 55, 0.1)'
              : '0 20px 60px rgba(0, 0, 0, 0.15), 0 0 30px rgba(212, 175, 55, 0.1), inset 0 0 10px rgba(212, 175, 55, 0.05)',
            transition: 'all 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          <div
            className="absolute inset-0 opacity-0 pointer-events-none transition-opacity duration-1000"
            style={{
              background: 'linear-gradient(135deg, transparent 0%, rgba(212, 175, 55, 0.1) 50%, transparent 100%)',
              animation: 'shimmer 3s infinite',
              opacity: isHovered ? 0.6 : 0,
            }}
          />

          <div className="relative h-64 overflow-hidden bg-gradient-to-br from-amber-50 to-stone-100">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={farmName}
                className="w-full h-full object-cover transition-transform duration-700"
                style={{
                  transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-8xl opacity-30">{typeIcon}</div>
              </div>
            )}

            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.3) 100%)',
              }}
            />
          </div>

          <div className="relative p-8">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3
                  className="text-3xl font-black mb-2"
                  style={{ color: brandColors.text.primary }}
                >
                  {farmName}
                </h3>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{typeIcon}</span>
                  <span
                    className="text-lg font-bold"
                    style={{ color: brandColors.accent.olive }}
                  >
                    {farmType}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-6">
              <MapPin className="h-5 w-5" style={{ color: brandColors.accent.olive }} />
              <span
                className="text-base font-medium"
                style={{ color: brandColors.text.secondary }}
              >
                {location}
              </span>
            </div>

            <div
              className="mb-6 p-4 rounded-xl text-center"
              style={{
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                boxShadow: '0 4px 20px rgba(16, 185, 129, 0.3)',
              }}
            >
              <div className="text-sm font-bold text-white mb-1 opacity-90 flex items-center justify-center gap-2">
                <Sprout className="w-5 h-5" />
                <span>مزرعة نموذجية</span>
              </div>
              <div className="text-2xl font-black text-white">
                فرصة استثمارية فريدة
              </div>
            </div>

            <button
              onClick={onViewDetails}
              className="w-full py-4 rounded-xl font-black text-lg text-white transition-all duration-500 relative overflow-hidden group"
              style={{
                background: brandGradients.gold,
                boxShadow: '0 6px 25px rgba(212, 175, 55, 0.4)',
                transform: isHovered ? 'scale(1.03)' : 'scale(1)',
                animation: 'pulse 10s ease-in-out infinite',
              }}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <Sprout className="h-5 w-5" />
                <span>عرض التفاصيل الكاملة</span>
              </span>
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                  transform: 'translateX(-100%)',
                  animation: 'slideRight 2s ease-in-out infinite',
                }}
              />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0%, 100% { transform: translateX(-100%) rotate(-10deg); }
          50% { transform: translateX(100%) rotate(-10deg); }
        }

        @keyframes pulse {
          0%, 100% { box-shadow: 0 6px 25px rgba(212, 175, 55, 0.4); }
          50% { box-shadow: 0 8px 35px rgba(212, 175, 55, 0.6); }
        }

        @keyframes slideRight {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }

        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </div>
  );
}
