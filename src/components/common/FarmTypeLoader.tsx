import React from 'react';
import { Palmtree, Leaf } from 'lucide-react';

interface FarmTypeLoaderProps {
  type: 'palm' | 'olive';
  message?: string;
}

export function FarmTypeLoader({ type, message }: FarmTypeLoaderProps) {
  const isPalm = type === 'palm';

  return (
    <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden opacity-30">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: isPalm ? '#10b981' : '#059669',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Animated Icon Container */}
        <div className="relative mb-8">
          {/* Glow Effect */}
          <div
            className={`absolute inset-0 blur-3xl rounded-full ${
              isPalm ? 'bg-green-400/40' : 'bg-emerald-400/40'
            }`}
            style={{
              animation: 'pulse 2s ease-in-out infinite',
            }}
          />

          {/* Outer Ring */}
          <div
            className={`absolute inset-0 rounded-full border-4 ${
              isPalm ? 'border-green-300' : 'border-emerald-300'
            }`}
            style={{
              width: '160px',
              height: '160px',
              margin: '-20px',
              animation: 'rotate 8s linear infinite',
            }}
          />

          {/* Middle Ring */}
          <div
            className={`absolute inset-0 rounded-full border-4 ${
              isPalm ? 'border-green-400' : 'border-emerald-400'
            } border-dashed`}
            style={{
              width: '140px',
              height: '140px',
              margin: '-10px',
              animation: 'rotate-reverse 6s linear infinite',
            }}
          />

          {/* Icon Container */}
          <div
            className={`relative w-[120px] h-[120px] rounded-full flex items-center justify-center ${
              isPalm
                ? 'bg-gradient-to-br from-green-400 to-emerald-500'
                : 'bg-gradient-to-br from-emerald-400 to-teal-500'
            } shadow-2xl`}
            style={{
              animation: 'bounce-gentle 2s ease-in-out infinite',
            }}
          >
            {isPalm ? (
              <Palmtree
                className="w-16 h-16 text-white"
                strokeWidth={2}
                style={{
                  animation: 'sway 3s ease-in-out infinite',
                  filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.2))',
                }}
              />
            ) : (
              <Leaf
                className="w-16 h-16 text-white"
                strokeWidth={2}
                style={{
                  animation: 'sway 3s ease-in-out infinite 0.5s',
                  filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.2))',
                }}
              />
            )}
          </div>

          {/* Orbiting Dots */}
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`absolute w-3 h-3 rounded-full ${
                isPalm ? 'bg-green-500' : 'bg-emerald-500'
              } shadow-lg`}
              style={{
                top: '50%',
                left: '50%',
                animation: `orbit 3s linear infinite`,
                animationDelay: `${i * 1}s`,
              }}
            />
          ))}
        </div>

        {/* Loading Text */}
        <div className="text-center space-y-3">
          <h3
            className="text-2xl sm:text-3xl font-black"
            style={{
              background: isPalm
                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                : 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {message || (isPalm ? 'جاري تحميل مزرعة النخيل...' : 'جاري تحميل مزرعة الزيتون...')}
          </h3>

          <p className="text-base sm:text-lg text-gray-700 font-medium">
            {isPalm ? '🌴 استثمار في أشجار النخيل' : '🌳 استثمار في أشجار الزيتون'}
          </p>

          {/* Loading Dots */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${isPalm ? 'bg-green-500' : 'bg-emerald-500'}`}
                style={{
                  animation: 'loading-dot 1.4s ease-in-out infinite',
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Bottom Decorative Text */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 font-medium">
            {isPalm ? 'استعد للاستثمار في أجود أنواع النخيل' : 'استعد للاستثمار في أجود أنواع الزيتون'}
          </p>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-30px) translateX(15px);
            opacity: 0.7;
          }
        }

        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes rotate-reverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }

        @keyframes bounce-gentle {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-10px) scale(1.05);
          }
        }

        @keyframes sway {
          0%, 100% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(3deg);
          }
          75% {
            transform: rotate(-3deg);
          }
        }

        @keyframes orbit {
          0% {
            transform: translate(-50%, -50%) rotate(0deg) translateX(80px) rotate(0deg);
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
          100% {
            transform: translate(-50%, -50%) rotate(360deg) translateX(80px) rotate(-360deg);
            opacity: 1;
          }
        }

        @keyframes loading-dot {
          0%, 80%, 100% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          40% {
            transform: scale(1.2);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
