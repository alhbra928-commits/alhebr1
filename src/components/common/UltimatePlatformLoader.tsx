import { useState, useEffect } from 'react';
import { Leaf, TreeDeciduous, Sparkles, TrendingUp } from 'lucide-react';

interface UltimatePlatformLoaderProps {
  onComplete: () => void;
}

export function UltimatePlatformLoader({ onComplete }: UltimatePlatformLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [showContent, setShowContent] = useState(true);

  const phases = [
    { text: 'جاري تحميل المنصة...', icon: '🌾', color: '#10b981' },
    { text: 'تحميل المزارع المتاحة...', icon: '🌴', color: '#34d399' },
    { text: 'تجهيز بيانات الاستثمار...', icon: '💰', color: '#6ee7b7' },
    { text: 'تقريباً جاهز...', icon: '✨', color: '#a7f3d0' },
  ];

  useEffect(() => {
    const duration = 2500; // 2.5 seconds
    const interval = 30;
    const steps = duration / interval;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const newProgress = (currentStep / steps) * 100;
      setProgress(newProgress);

      // Update phase based on progress
      const phaseIndex = Math.min(
        Math.floor((newProgress / 100) * phases.length),
        phases.length - 1
      );
      setCurrentPhase(phaseIndex);

      if (currentStep >= steps) {
        clearInterval(timer);
        // Start exit animation
        setIsExiting(true);
        setTimeout(() => {
          setShowContent(false);
          setTimeout(onComplete, 300);
        }, 500);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [onComplete]);

  if (!showContent) return null;

  return (
    <>
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) scale(1);
          }
          50% {
            transform: translateY(-20px) scale(1.05);
          }
        }

        @keyframes rotate3d {
          0% {
            transform: perspective(1000px) rotateY(0deg);
          }
          100% {
            transform: perspective(1000px) rotateY(360deg);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }

        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(16, 185, 129, 0.5), 0 0 40px rgba(16, 185, 129, 0.3);
          }
          50% {
            box-shadow: 0 0 40px rgba(16, 185, 129, 0.8), 0 0 80px rgba(16, 185, 129, 0.5);
          }
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeScale {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .loader-container {
          position: fixed;
          inset: 0;
          z-index: 99999;
          background: linear-gradient(135deg, #064e3b 0%, #047857 50%, #059669 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          transition: opacity 0.5s ease-out, transform 0.5s ease-out;
        }

        .loader-container.exiting {
          opacity: 0;
          transform: scale(1.1);
        }

        /* iOS fixes */
        @supports (-webkit-touch-callout: none) {
          .loader-container {
            height: 100vh;
            height: 100dvh;
            min-height: -webkit-fill-available;
          }
        }

        .sparkle-bg {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
        }

        .sparkle-particle {
          position: absolute;
          animation: float 3s ease-in-out infinite;
          opacity: 0.2;
        }

        .logo-3d {
          animation: rotate3d 10s linear infinite;
          transform-style: preserve-3d;
        }

        .shimmer-text {
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.8) 0%,
            rgba(255, 255, 255, 1) 50%,
            rgba(255, 255, 255, 0.8) 100%
          );
          background-size: 200% auto;
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 2s linear infinite;
        }

        .progress-bar-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }

        .slide-in {
          animation: slideInUp 0.6s ease-out;
        }

        .fade-scale {
          animation: fadeScale 0.8s ease-out;
        }

        body.loader-active {
          overflow: hidden;
          position: fixed;
          width: 100%;
          height: 100%;
        }
      `}</style>

      <div className={`loader-container ${isExiting ? 'exiting' : ''}`}>
        {/* Animated Background */}
        <div className="sparkle-bg">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="sparkle-particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            >
              {i % 3 === 0 ? (
                <Leaf className="w-6 h-6 text-emerald-300" />
              ) : i % 3 === 1 ? (
                <TreeDeciduous className="w-8 h-8 text-emerald-200" />
              ) : (
                <Sparkles className="w-5 h-5 text-yellow-300" />
              )}
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="relative z-10 flex flex-col items-center justify-center px-4 md:px-6">
          {/* 3D Rotating Logo */}
          <div className="logo-3d mb-8 fade-scale">
            <div
              className="w-24 h-24 md:w-32 md:h-32 rounded-3xl flex items-center justify-center shadow-2xl"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.15))',
                backdropFilter: 'blur(20px)',
                border: '3px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
              }}
            >
              <span className="text-5xl md:text-6xl">{phases[currentPhase].icon}</span>
            </div>
          </div>

          {/* Title with Shimmer Effect */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-4 text-center shimmer-text fade-scale">
            مزادات
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-2xl lg:text-3xl font-bold text-white/90 mb-12 text-center slide-in">
            منصة الاستثمار الزراعي الذكية
          </p>

          {/* Progress Container */}
          <div className="w-full max-w-md md:max-w-lg slide-in" style={{ animationDelay: '0.2s' }}>
            {/* Progress Bar */}
            <div className="relative h-3 md:h-4 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm mb-6 progress-bar-glow">
              {/* Gradient Progress */}
              <div
                className="absolute top-0 left-0 h-full transition-all duration-300 ease-out rounded-full"
                style={{
                  width: `${progress}%`,
                  background: `linear-gradient(90deg,
                    ${phases[currentPhase].color} 0%,
                    #10b981 50%,
                    #34d399 100%)`,
                  boxShadow: `0 0 30px ${phases[currentPhase].color}, 0 0 50px ${phases[currentPhase].color}80`,
                }}
              >
                {/* Shimmer effect on progress bar */}
                <div
                  className="absolute inset-0 opacity-50"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 1.5s linear infinite',
                  }}
                />
              </div>

              {/* Glowing end point */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-2 h-2 md:w-3 md:h-3 rounded-full bg-white shadow-lg"
                style={{
                  left: `${progress}%`,
                  transform: 'translate(-50%, -50%)',
                  boxShadow: '0 0 15px white, 0 0 30px rgba(255, 255, 255, 0.8)',
                  transition: 'left 0.3s ease-out',
                }}
              />
            </div>

            {/* Percentage and Phase Text */}
            <div className="flex items-center justify-between mb-4">
              <div className="text-center flex-1">
                <div className="text-3xl md:text-4xl font-black text-white mb-1">
                  {Math.round(progress)}%
                </div>
                <div className="flex items-center justify-center gap-2 text-sm md:text-base text-white/80 font-bold">
                  <TrendingUp className="w-4 h-4 animate-pulse" />
                  <span>جاري التحميل</span>
                </div>
              </div>
            </div>

            {/* Dynamic Phase Text with Icon */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 md:p-5 border border-white/20 shadow-2xl">
              <div className="flex items-center justify-center gap-3">
                <span className="text-2xl md:text-3xl">{phases[currentPhase].icon}</span>
                <p className="text-base md:text-lg lg:text-xl font-bold text-white text-center animate-pulse">
                  {phases[currentPhase].text}
                </p>
              </div>
            </div>
          </div>

          {/* Branding */}
          <div className="mt-12 slide-in" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center gap-2 text-white/60 text-xs md:text-sm font-bold">
              <Sparkles className="w-4 h-4" />
              <span>مدعوم بتقنيات الذكاء الاصطناعي</span>
            </div>
          </div>
        </div>

        {/* Bottom Gradient Overlay */}
        <div
          className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
          style={{
            background: 'linear-gradient(0deg, rgba(6, 78, 59, 0.5) 0%, transparent 100%)',
          }}
        />
      </div>
    </>
  );
}
