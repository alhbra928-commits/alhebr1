import React from 'react';
import { Sparkles, ArrowLeft } from 'lucide-react';

interface TransitionLoaderProps {
  message?: string;
  farmName?: string;
}

export function TransitionLoader({ message, farmName }: TransitionLoaderProps) {
  return (
    <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-amber-50 via-yellow-50 to-green-50 flex items-center justify-center">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Waves */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: 'radial-gradient(circle at 30% 50%, rgba(251, 191, 36, 0.3) 0%, transparent 50%), radial-gradient(circle at 70% 50%, rgba(34, 197, 94, 0.3) 0%, transparent 50%)',
            animation: 'gradient-shift 8s ease-in-out infinite',
          }}
        />

        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full"
            style={{
              background: i % 2 === 0 ? '#fbbf24' : '#10b981',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float-particle ${4 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center max-w-md mx-4">
        {/* Animated Circle Container */}
        <div className="relative mb-8">
          {/* Outer Rotating Ring */}
          <div
            className="absolute inset-0 rounded-full border-4 border-amber-300"
            style={{
              width: '180px',
              height: '180px',
              margin: '-30px',
              animation: 'rotate-ring 10s linear infinite',
            }}
          />

          {/* Middle Ring */}
          <div
            className="absolute inset-0 rounded-full border-4 border-green-300 border-dashed"
            style={{
              width: '150px',
              height: '150px',
              margin: '-15px',
              animation: 'rotate-ring-reverse 8s linear infinite',
            }}
          />

          {/* Center Circle */}
          <div
            className="relative w-[120px] h-[120px] rounded-full bg-gradient-to-br from-amber-400 via-yellow-300 to-green-400 shadow-2xl flex items-center justify-center"
            style={{
              animation: 'pulse-scale 2s ease-in-out infinite',
            }}
          >
            {/* Sparkles Icon */}
            <Sparkles
              className="w-12 h-12 text-white"
              strokeWidth={2.5}
              style={{
                animation: 'sparkle-rotate 4s ease-in-out infinite',
                filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.2))',
              }}
            />

            {/* Inner Shine */}
            <div
              className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/40 to-transparent"
              style={{
                animation: 'shine 3s ease-in-out infinite',
              }}
            />
          </div>

          {/* Orbiting Dots */}
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="absolute w-4 h-4 rounded-full shadow-lg"
              style={{
                background: i % 2 === 0 ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' : 'linear-gradient(135deg, #10b981, #059669)',
                top: '50%',
                left: '50%',
                animation: `orbit-dot 4s linear infinite`,
                animationDelay: `${i * 1}s`,
              }}
            />
          ))}
        </div>

        {/* Loading Text */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div
              className="w-8 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-amber-500"
              style={{ animation: 'slide-in 1s ease-out' }}
            />
            <ArrowLeft
              className="w-6 h-6 text-amber-600"
              style={{ animation: 'bounce-arrow 1s ease-in-out infinite' }}
            />
            <div
              className="w-8 h-0.5 bg-gradient-to-l from-transparent via-green-500 to-green-500"
              style={{ animation: 'slide-in 1s ease-out' }}
            />
          </div>

          <h3
            className="text-2xl sm:text-3xl md:text-4xl font-black leading-tight"
            style={{
              background: 'linear-gradient(135deg, #d97706 0%, #fbbf24 25%, #10b981 75%, #059669 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'gradient-text 3s ease-in-out infinite',
            }}
          >
            {message || 'جاري التحميل...'}
          </h3>

          {farmName && (
            <p className="text-lg sm:text-xl font-bold text-gray-800">
              {farmName}
            </p>
          )}

          <p className="text-base sm:text-lg text-gray-700 font-medium">
            استعد لتجربة استثمارية فريدة
          </p>

          {/* Progress Dots */}
          <div className="flex items-center justify-center gap-2 pt-2">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="w-2.5 h-2.5 rounded-full"
                style={{
                  background: i % 2 === 0 ? '#fbbf24' : '#10b981',
                  animation: 'bounce-dot 1.4s ease-in-out infinite',
                  animationDelay: `${i * 0.15}s`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Bottom Message */}
        <div
          className="mt-8 px-6 py-3 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/80 shadow-lg"
          style={{ animation: 'fade-in 1s ease-out' }}
        >
          <p className="text-sm text-gray-700 font-semibold text-center">
            ⏱️ لحظات قليلة وسنكون جاهزين
          </p>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes gradient-shift {
          0%, 100% {
            transform: translateX(0) translateY(0);
          }
          50% {
            transform: translateX(30px) translateY(30px);
          }
        }

        @keyframes float-particle {
          0%, 100% {
            transform: translateY(0) translateX(0) scale(1);
            opacity: 0.4;
          }
          50% {
            transform: translateY(-40px) translateX(20px) scale(1.3);
            opacity: 0.8;
          }
        }

        @keyframes rotate-ring {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes rotate-ring-reverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }

        @keyframes pulse-scale {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.08);
          }
        }

        @keyframes sparkle-rotate {
          0%, 100% {
            transform: rotate(0deg) scale(1);
          }
          25% {
            transform: rotate(90deg) scale(1.1);
          }
          50% {
            transform: rotate(180deg) scale(1);
          }
          75% {
            transform: rotate(270deg) scale(1.1);
          }
        }

        @keyframes shine {
          0% {
            opacity: 0.3;
            transform: rotate(0deg);
          }
          50% {
            opacity: 0.6;
          }
          100% {
            opacity: 0.3;
            transform: rotate(360deg);
          }
        }

        @keyframes orbit-dot {
          0% {
            transform: translate(-50%, -50%) rotate(0deg) translateX(90px) rotate(0deg);
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
          100% {
            transform: translate(-50%, -50%) rotate(360deg) translateX(90px) rotate(-360deg);
            opacity: 1;
          }
        }

        @keyframes bounce-arrow {
          0%, 100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(-8px);
          }
        }

        @keyframes slide-in {
          from {
            width: 0;
            opacity: 0;
          }
          to {
            width: 2rem;
            opacity: 1;
          }
        }

        @keyframes gradient-text {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes bounce-dot {
          0%, 80%, 100% {
            transform: scale(0.7) translateY(0);
            opacity: 0.5;
          }
          40% {
            transform: scale(1.3) translateY(-10px);
            opacity: 1;
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
