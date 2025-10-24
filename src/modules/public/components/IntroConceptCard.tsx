import React from 'react';
import { Sprout, ArrowLeft, Eye } from 'lucide-react';
import { brandColors, brandGradients } from '../../finance/styles/brandColors';

interface IntroConceptCardProps {
  onStartNow: () => void;
  onViewFarms: () => void;
}

export function IntroConceptCard({ onStartNow, onViewFarms }: IntroConceptCardProps) {
  return (
    <div
      className="relative min-h-[600px] flex items-center justify-center overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${brandColors.accent.oliveDark} 0%, ${brandColors.accent.olive} 100%)`,
      }}
    >
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'url("https://images.pexels.com/photos/2132180/pexels-photo-2132180.jpeg?auto=compress&cs=tinysrgb&w=1920")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-1 animate-shimmer"
          style={{
            background: `linear-gradient(90deg, transparent, ${brandColors.primary.gold}, transparent)`,
            backgroundSize: '200% 100%',
          }} />
        <div className="absolute bottom-0 left-0 w-full h-1 animate-shimmer"
          style={{
            background: `linear-gradient(90deg, transparent, ${brandColors.primary.gold}, transparent)`,
            backgroundSize: '200% 100%',
            animationDelay: '1s',
          }} />
      </div>

      <div className="relative z-10 text-center px-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <div
            className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 animate-float"
            style={{
              background: brandGradients.gold,
              boxShadow: `0 20px 60px ${brandColors.shadow.gold}`,
            }}
          >
            <Sprout className="h-12 w-12" style={{ color: brandColors.text.white }} />
          </div>
        </div>

        <h1
          className="text-6xl md:text-7xl font-black mb-4 animate-fadeInUp"
          style={{
            background: brandGradients.gold,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: '0 0 60px rgba(212, 175, 55, 0.3)',
          }}
        >
          فكرة المنصة
        </h1>

        <p
          className="text-2xl md:text-3xl font-bold mb-12 animate-fadeInUp"
          style={{
            color: brandColors.primary.goldLight,
            animationDelay: '0.2s',
          }}
        >
          تملّك النخيل وأشجار الزيتون في المزرعة
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fadeInUp"
          style={{ animationDelay: '0.4s' }}>
          <button
            onClick={onStartNow}
            className="group relative px-12 py-5 rounded-2xl font-black text-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
            style={{
              background: brandGradients.gold,
              color: brandColors.text.white,
              boxShadow: `0 10px 40px ${brandColors.shadow.gold}`,
            }}
          >
            <span className="flex items-center gap-3">
              ابدأ الآن
              <ArrowLeft className="h-6 w-6 transition-transform group-hover:translate-x-2" />
            </span>
            <div
              className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.2), transparent)',
              }}
            />
          </button>

          <button
            onClick={onViewFarms}
            className="group px-12 py-5 rounded-2xl font-black text-xl transition-all duration-300 transform hover:scale-105"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              color: brandColors.text.white,
              border: `2px solid ${brandColors.primary.goldLight}`,
            }}
          >
            <span className="flex items-center gap-3">
              <Eye className="h-6 w-6" />
              شاهد المزارع
            </span>
          </button>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: '🌿', title: 'استثمار مستدام', desc: 'عوائد سنوية مضمونة' },
            { icon: '🏆', title: 'جودة عالية', desc: 'مزارع معتمدة ومراقبة' },
            { icon: '🤝', title: 'شراكة ناجحة', desc: 'نظام شفاف وموثوق' },
          ].map((item, index) => (
            <div
              key={index}
              className="p-6 rounded-xl backdrop-blur-lg animate-fadeInUp"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                animationDelay: `${0.6 + index * 0.1}s`,
              }}
            >
              <div className="text-4xl mb-3">{item.icon}</div>
              <h3 className="text-lg font-black mb-2" style={{ color: brandColors.primary.goldLight }}>
                {item.title}
              </h3>
              <p className="text-sm opacity-90" style={{ color: brandColors.text.white }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#FAF9F6] to-transparent" />
    </div>
  );
}
