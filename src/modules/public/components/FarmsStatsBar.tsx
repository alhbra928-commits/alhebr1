import React from 'react';
import { Sprout, Package, DollarSign, Settings, TrendingUp, Sparkles } from 'lucide-react';
import { brandColors, brandGradients } from '../../finance/styles/brandColors';

interface FarmStats {
  total: number;
  completed: number;
  reserved: number;
  inOperation: number;
  completionPercentage: number;
}

interface FarmsStatsBarProps {
  stats: FarmStats;
}

export function FarmsStatsBar({ stats }: FarmsStatsBarProps) {
  const statCards = [
    {
      icon: Sprout,
      label: 'المزارع المسجلة',
      value: stats.total,
      gradient: 'linear-gradient(135deg, #DAA520 0%, #B8860B 100%)',
      shadowColor: 'rgba(218, 165, 32, 0.4)',
      iconBg: 'rgba(218, 165, 32, 0.15)',
      animate: true,
    },
    {
      icon: Package,
      label: 'المكتملة',
      value: stats.completed,
      gradient: 'linear-gradient(135deg, #808000 0%, #556B2F 100%)',
      shadowColor: 'rgba(128, 128, 0, 0.4)',
      iconBg: 'rgba(128, 128, 0, 0.15)',
      animate: false,
    },
    {
      icon: DollarSign,
      label: 'قيد الحجز',
      value: stats.reserved,
      gradient: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
      shadowColor: 'rgba(255, 215, 0, 0.4)',
      iconBg: 'rgba(255, 215, 0, 0.15)',
      animate: true,
    },
    {
      icon: Settings,
      label: 'تحت التشغيل',
      value: stats.inOperation,
      gradient: 'linear-gradient(135deg, #556B2F 0%, #6B8E23 100%)',
      shadowColor: 'rgba(85, 107, 47, 0.4)',
      iconBg: 'rgba(85, 107, 47, 0.15)',
      animate: false,
    },
    {
      icon: TrendingUp,
      label: 'نسبة الإنجاز',
      value: `${stats.completionPercentage}%`,
      gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      shadowColor: 'rgba(16, 185, 129, 0.4)',
      iconBg: 'rgba(16, 185, 129, 0.15)',
      animate: true,
    },
  ];

  return (
    <div className="mb-10">
      <div
        className="rounded-[2rem] p-8 shadow-2xl relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #FFFFFF 0%, #FAF8F3 100%)',
          border: `3px solid ${brandColors.primary.gold}`,
        }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-10"
          style={{ background: brandGradients.gold }} />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl opacity-10"
          style={{ background: brandGradients.olive }} />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: brandGradients.gold }}
            >
              <Sparkles className="h-6 w-6" style={{ color: brandColors.text.white }} />
            </div>
            <div>
              <h3
                className="text-2xl font-black"
                style={{
                  background: brandGradients.gold,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                لوحة الإحصائيات الذكية
              </h3>
              <p className="text-sm font-bold" style={{ color: brandColors.text.secondary }}>
                نظرة شاملة على حالة المزارع في المنصة
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className={`group relative overflow-hidden rounded-3xl p-6 transition-all duration-500 hover:scale-105 cursor-pointer ${
                    stat.animate ? 'hover:shadow-2xl' : 'hover:shadow-xl'
                  }`}
                  style={{
                    background: 'linear-gradient(135deg, #FFFFFF 0%, #F9FAFB 100%)',
                    border: '2px solid rgba(218, 165, 32, 0.2)',
                    boxShadow: `0 10px 30px ${stat.shadowColor}`,
                  }}
                >
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500"
                    style={{ background: stat.gradient }}
                  />

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-6"
                        style={{
                          background: stat.gradient,
                          boxShadow: `0 8px 20px ${stat.shadowColor}`,
                        }}
                      >
                        <Icon className="h-7 w-7" style={{ color: brandColors.text.white }} />
                      </div>

                      {stat.animate && (
                        <div
                          className="animate-pulse"
                          style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            background: stat.gradient,
                            boxShadow: `0 0 15px ${stat.shadowColor}`,
                          }}
                        />
                      )}
                    </div>

                    <div>
                      <p className="text-sm font-bold mb-2 opacity-70" style={{ color: brandColors.text.secondary }}>
                        {stat.label}
                      </p>
                      <p
                        className="text-4xl font-black transition-all duration-300"
                        style={{
                          background: stat.gradient,
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                        }}
                      >
                        {stat.value}
                      </p>
                    </div>

                    <div className="mt-4 h-2 rounded-full overflow-hidden"
                      style={{ background: stat.iconBg }}>
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{
                          width: typeof stat.value === 'string' ? stat.value : `${Math.min((stat.value / stats.total) * 100, 100)}%`,
                          background: stat.gradient,
                        }}
                      />
                    </div>
                  </div>

                  <div
                    className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full opacity-5 group-hover:opacity-10 transition-opacity duration-500"
                    style={{ background: stat.gradient }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
