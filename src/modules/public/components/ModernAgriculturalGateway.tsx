import React, { useState, useEffect } from 'react';
import { Sprout, TreePine, Palmtree } from 'lucide-react';

interface ModernAgriculturalGatewayProps {
  onEnter: () => void;
}

export function ModernAgriculturalGateway({ onEnter }: ModernAgriculturalGatewayProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Auto-enter after 3 seconds
  useEffect(() => {
    const autoEnterTimer = setTimeout(() => {
      handleEnter();
    }, 3000);

    return () => clearTimeout(autoEnterTimer);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 20 - 10,
        y: (e.clientY / window.innerHeight) * 20 - 10,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleEnter = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      onEnter();
    }, 800);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-emerald-950 via-green-900 to-teal-950">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255, 255, 255, 0.15) 1px, transparent 0)`,
            backgroundSize: '40px 40px',
            transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
            transition: 'transform 0.3s ease-out',
          }}
        />
      </div>

      {/* Floating Particles */}
      {[...Array(30)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-emerald-400/20 rounded-full animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${5 + Math.random() * 10}s`,
          }}
        />
      ))}

      {/* Main Content - Centered Rotating Icons */}
      <div className={`relative z-10 min-h-screen flex items-center justify-center transition-all duration-800 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>

        {/* Clickable Rotating Icons Circle - LARGER */}
        <button
          onClick={handleEnter}
          className="relative w-96 h-96 sm:w-[32rem] sm:h-[32rem] md:w-[40rem] md:h-[40rem] lg:w-[48rem] lg:h-[48rem] xl:w-[56rem] xl:h-[56rem] group cursor-pointer"
          aria-label="دخول المنصة"
        >
          {/* Outer Glow - Pulsing */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-full blur-3xl animate-pulse" />

          {/* Rotating Icons */}
          <div className="absolute inset-0 animate-spin-slow">
            {[
              { Icon: Palmtree, angle: 0, delay: 0 },
              { Icon: TreePine, angle: 120, delay: 0.2 },
              { Icon: Sprout, angle: 240, delay: 0.4 },
            ].map(({ Icon, angle, delay }, index) => (
              <div
                key={index}
                className="absolute top-1/2 left-1/2 w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32"
                style={{
                  transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-${window.innerWidth < 640 ? '160' : window.innerWidth < 768 ? '200' : window.innerWidth < 1024 ? '240' : window.innerWidth < 1280 ? '280' : '320'}px)`,
                  animationDelay: `${delay}s`,
                }}
              >
                <div
                  className="w-full h-full flex items-center justify-center rounded-2xl sm:rounded-3xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-md border border-emerald-400/30 animate-float group-hover:from-emerald-500/30 group-hover:to-teal-500/30 transition-all duration-500"
                  style={{ animationDelay: `${delay}s` }}
                >
                  <Icon className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 text-emerald-300" />
                </div>
              </div>
            ))}
          </div>

          {/* Center Logo - LARGER */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              {/* Outer Glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full blur-2xl opacity-50 group-hover:opacity-75 group-hover:blur-3xl transition-all duration-500" />

              {/* Main Circle */}
              <div className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 xl:w-64 xl:h-64 rounded-full bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center border-4 sm:border-6 md:border-8 border-emerald-400/30 backdrop-blur-sm group-hover:scale-110 group-hover:border-emerald-400/50 transition-all duration-500 shadow-2xl">
                <span className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black text-white drop-shadow-2xl">
                  مزاد
                </span>
              </div>

              {/* Inner Glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 rounded-full blur-xl" />
            </div>
          </div>

          {/* Click Hint - Subtle */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="absolute -bottom-24 sm:-bottom-28 md:-bottom-32 text-center opacity-50 group-hover:opacity-100 transition-opacity duration-300">
              <p className="text-emerald-200 text-sm sm:text-base md:text-lg font-semibold animate-pulse">
                انقر للدخول
              </p>
            </div>
          </div>
        </button>

      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          25% {
            transform: translateY(-20px) translateX(10px);
          }
          50% {
            transform: translateY(0) translateX(20px);
          }
          75% {
            transform: translateY(20px) translateX(10px);
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-float {
          animation: float 10s ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}</style>
    </div>
  );
}
