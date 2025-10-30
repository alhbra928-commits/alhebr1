import React, { useState, useEffect } from 'react';
import { Sprout, TreePine, Palmtree, ChevronDown, Sparkles } from 'lucide-react';

interface ModernAgriculturalGatewayProps {
  onEnter: () => void;
}

export function ModernAgriculturalGateway({ onEnter }: ModernAgriculturalGatewayProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

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
      {[...Array(20)].map((_, i) => (
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

      {/* Main Content */}
      <div className={`relative z-10 min-h-screen flex flex-col items-center justify-center p-4 transition-all duration-800 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>

        {/* Top Badge */}
        <div className="mb-8 animate-fade-in-down">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-500/10 backdrop-blur-sm border border-emerald-400/20">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-100 text-sm font-semibold tracking-wide">منصة الاستثمار الزراعي</span>
          </div>
        </div>

        {/* Animated Icons Circle */}
        <div className="relative w-64 h-64 mb-12">
          {/* Center Glow */}
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
                className="absolute top-1/2 left-1/2 w-16 h-16"
                style={{
                  transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-100px)`,
                  animationDelay: `${delay}s`,
                }}
              >
                <div
                  className="w-full h-full flex items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-md border border-emerald-400/30 animate-float"
                  style={{ animationDelay: `${delay}s` }}
                >
                  <Icon className="w-8 h-8 text-emerald-300" />
                </div>
              </div>
            ))}
          </div>

          {/* Center Logo */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center border-4 border-emerald-400/30 backdrop-blur-sm">
                <span className="text-4xl font-black text-white">مزاد</span>
              </div>
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-5xl md:text-7xl font-black text-center mb-6 animate-fade-in-up">
          <span className="bg-gradient-to-r from-emerald-200 via-teal-100 to-emerald-200 bg-clip-text text-transparent">
            مزاد زراعي
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-emerald-100/80 text-center mb-4 max-w-2xl animate-fade-in-up animation-delay-200">
          استثمر في مزارع النخيل والزيتون
        </p>

        <p className="text-base md:text-lg text-emerald-200/60 text-center mb-12 max-w-xl animate-fade-in-up animation-delay-300">
          منصة متكاملة لإدارة وتملك الأشجار المثمرة بطريقة عصرية ومبتكرة
        </p>

        {/* Enter Button */}
        <button
          onClick={handleEnter}
          className="group relative px-12 py-5 rounded-2xl overflow-hidden animate-fade-in-up animation-delay-400 hover:scale-105 transition-all duration-300"
        >
          {/* Button Glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />

          {/* Button Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 group-hover:from-emerald-500 group-hover:to-teal-500 transition-all duration-300" />

          {/* Button Border */}
          <div className="absolute inset-0 border-2 border-emerald-400/50 rounded-2xl" />

          {/* Button Content */}
          <div className="relative flex items-center gap-3">
            <span className="text-xl font-black text-white">استكشف المنصة</span>
            <ChevronDown className="w-6 h-6 text-white animate-bounce" />
          </div>
        </button>

        {/* Features Pills */}
        <div className="mt-16 flex flex-wrap justify-center gap-4 max-w-4xl animate-fade-in-up animation-delay-500">
          {[
            '🌴 مزارع معتمدة',
            '💎 استثمار آمن',
            '📊 إدارة ذكية',
            '🔒 توثيق رقمي',
          ].map((feature, index) => (
            <div
              key={index}
              className="px-6 py-3 rounded-full bg-white/5 backdrop-blur-sm border border-emerald-400/20 hover:bg-white/10 transition-all duration-300 hover:scale-105 cursor-default"
            >
              <span className="text-emerald-100 font-semibold text-sm">{feature}</span>
            </div>
          ))}
        </div>

        {/* Bottom Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="flex flex-col items-center gap-2 opacity-50">
            <div className="w-6 h-10 rounded-full border-2 border-emerald-400/30 flex items-start justify-center p-1">
              <div className="w-1 h-3 bg-emerald-400/50 rounded-full animate-scroll-down" />
            </div>
            <span className="text-xs text-emerald-300/50 font-semibold">ابدأ الاستكشاف</span>
          </div>
        </div>
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

        @keyframes scroll-down {
          0% {
            transform: translateY(0);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateY(20px);
            opacity: 0;
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-down {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-float {
          animation: float 10s ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }

        .animate-scroll-down {
          animation: scroll-down 2s ease-in-out infinite;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }

        .animate-fade-in-down {
          animation: fade-in-down 0.8s ease-out forwards;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
          opacity: 0;
        }

        .animation-delay-300 {
          animation-delay: 0.3s;
          opacity: 0;
        }

        .animation-delay-400 {
          animation-delay: 0.4s;
          opacity: 0;
        }

        .animation-delay-500 {
          animation-delay: 0.5s;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
