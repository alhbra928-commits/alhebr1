import React, { useState } from 'react';
import { MapPin, X, Sprout } from 'lucide-react';
import { brandColors, brandGradients } from '../../finance/styles/brandColors';
import { PublicFarm } from '../types/farm.types';

interface SmartFarmMapProps {
  farms: PublicFarm[];
  onFarmClick: (barcode: string) => void;
}

export function SmartFarmMap({ farms, onFarmClick }: SmartFarmMapProps) {
  const [selectedFarm, setSelectedFarm] = useState<PublicFarm | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'full':
        return brandColors.status.warning;
      case 'almost_full':
        return '#FFD700';
      default:
        return brandColors.status.good;
    }
  };

  const sampleLocations = [
    { city: 'الرياض', x: 60, y: 45 },
    { city: 'جدة', x: 25, y: 50 },
    { city: 'الدمام', x: 75, y: 40 },
    { city: 'المدينة المنورة', x: 30, y: 35 },
    { city: 'الطائف', x: 28, y: 48 },
  ];

  return (
    <div className="max-w-[1800px] mx-auto px-8 py-16">
      <div className="mb-8 text-center">
        <h2
          className="text-4xl font-black mb-2"
          style={{
            background: brandGradients.gold,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          الخريطة الذكية
        </h2>
        <p className="text-lg" style={{ color: brandColors.text.secondary }}>
          استكشف مواقع المزارع على خريطة المملكة
        </p>
      </div>

      <div
        className="relative rounded-3xl overflow-hidden p-8"
        style={{
          background: brandColors.background.card,
          border: `2px solid ${brandColors.border.light}`,
          boxShadow: `0 20px 60px ${brandColors.shadow.dark}`,
          minHeight: '500px',
        }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'url("https://images.pexels.com/photos/2132227/pexels-photo-2132227.jpeg?auto=compress&cs=tinysrgb&w=1200")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        <div className="relative">
          <div className="aspect-[16/9] bg-gradient-to-br from-[#F5F3EE] to-[#E4D5B7] rounded-2xl p-8 relative">
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
              <svg viewBox="0 0 800 600" className="w-full h-full">
                <path
                  d="M 200,100 L 600,100 L 650,250 L 600,400 L 200,450 L 150,300 Z"
                  fill="none"
                  stroke={brandColors.accent.olive}
                  strokeWidth="4"
                  strokeDasharray="10,5"
                />
              </svg>
            </div>

            {farms.slice(0, 6).map((farm, index) => {
              const location = sampleLocations[index % sampleLocations.length];
              const statusColor = getStatusColor(farm.status);

              return (
                <button
                  key={farm.barcode}
                  onClick={() => setSelectedFarm(farm)}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 hover:scale-150 group"
                  style={{
                    left: `${location.x}%`,
                    top: `${location.y}%`,
                  }}
                >
                  <div className="relative">
                    <div
                      className="w-6 h-6 rounded-full animate-ping absolute"
                      style={{
                        background: statusColor,
                        opacity: 0.4,
                      }}
                    />
                    <div
                      className="w-6 h-6 rounded-full relative"
                      style={{
                        background: statusColor,
                        boxShadow: `0 4px 12px ${statusColor}`,
                      }}
                    />
                    <div
                      className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold pointer-events-none"
                      style={{
                        background: brandColors.accent.oliveDark,
                        color: brandColors.text.white,
                      }}
                    >
                      {farm.farm_name}
                    </div>
                  </div>
                </button>
              );
            })}

            <div className="absolute top-4 right-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold">
                <div className="w-3 h-3 rounded-full" style={{ background: brandColors.status.good }} />
                <span style={{ color: brandColors.text.primary }}>نشطة</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold">
                <div className="w-3 h-3 rounded-full" style={{ background: '#FFD700' }} />
                <span style={{ color: brandColors.text.primary }}>تحت الحجز</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold">
                <div className="w-3 h-3 rounded-full" style={{ background: brandColors.status.warning }} />
                <span style={{ color: brandColors.text.primary }}>مكتملة</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedFarm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-8"
          onClick={() => setSelectedFarm(null)}
        >
          <div
            className="rounded-3xl p-8 max-w-md w-full animate-scaleIn"
            style={{
              background: brandColors.background.card,
              boxShadow: `0 30px 80px ${brandColors.shadow.dark}`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ background: brandGradients.gold }}
                >
                  <Sprout className="h-6 w-6" style={{ color: brandColors.text.white }} />
                </div>
                <div>
                  <h3 className="text-xl font-black" style={{ color: brandColors.text.primary }}>
                    {selectedFarm.farm_name}
                  </h3>
                  <p className="text-sm" style={{ color: brandColors.text.secondary }}>
                    {selectedFarm.barcode}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedFarm(null)}
                className="p-2 rounded-full transition-all hover:scale-110"
                style={{
                  background: brandColors.background.hover,
                  color: brandColors.text.primary,
                }}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div
                className="p-4 rounded-xl"
                style={{ background: 'rgba(212, 175, 55, 0.1)' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4" style={{ color: brandColors.primary.gold }} />
                  <p className="text-sm font-bold" style={{ color: brandColors.text.secondary }}>
                    الموقع
                  </p>
                </div>
                <p className="text-lg font-black" style={{ color: brandColors.text.primary }}>
                  {selectedFarm.location_city} - {selectedFarm.location_region}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div
                  className="p-4 rounded-xl text-center"
                  style={{ background: 'rgba(143, 166, 90, 0.1)' }}
                >
                  <p className="text-xs font-bold mb-1" style={{ color: brandColors.text.secondary }}>
                    الأشجار المتاحة
                  </p>
                  <p className="text-2xl font-black" style={{ color: brandColors.accent.olive }}>
                    {selectedFarm.available_trees}
                  </p>
                </div>
                <div
                  className="p-4 rounded-xl text-center"
                  style={{ background: 'rgba(212, 175, 55, 0.1)' }}
                >
                  <p className="text-xs font-bold mb-1" style={{ color: brandColors.text.secondary }}>
                    السعر
                  </p>
                  <p className="text-2xl font-black" style={{ color: brandColors.primary.gold }}>
                    {selectedFarm.base_price.toLocaleString('ar-SA')}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                onFarmClick(selectedFarm.barcode);
                setSelectedFarm(null);
              }}
              disabled={selectedFarm.status === 'full'}
              className="w-full py-4 rounded-xl font-black text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: selectedFarm.status === 'full' ? brandColors.status.neutral : brandGradients.gold,
                color: brandColors.text.white,
              }}
            >
              <span className="flex items-center justify-center gap-2">
                <Sprout className="h-5 w-5" />
                {selectedFarm.status === 'full' ? 'المزرعة مكتملة' : 'تملّك الآن'}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
