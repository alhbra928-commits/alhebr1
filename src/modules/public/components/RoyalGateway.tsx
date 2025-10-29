import React, { useState, useEffect } from 'react';
import { Sparkles, ChevronLeft } from 'lucide-react';

interface RoyalGatewayProps {
  onEnter: () => void;
}

export function RoyalGateway({ onEnter }: RoyalGatewayProps) {
  const [showLogo, setShowLogo] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timeline = [
      { delay: 500, action: () => setShowLogo(true) },
      { delay: 1200, action: () => setShowWelcome(true) },
      { delay: 2000, action: () => setShowButton(true) },
    ];

    const timeouts = timeline.map(({ delay, action }) =>
      setTimeout(action, delay)
    );

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, []);

  const handleEnter = () => {
    setIsExiting(true);
    setTimeout(() => {
      onEnter();
    }, 800);
  };

  return (
    <div
      className={`fixed inset-0 z-[9999] transition-all duration-800 ${
        isExiting ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
      }`}
    >
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Base Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900 via-yellow-800 to-amber-950" />

        {/* Animated Light Rays */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-1 h-full bg-gradient-to-b from-transparent via-yellow-500/30 to-transparent animate-pulse" />
          <div className="absolute top-0 left-1/2 w-1 h-full bg-gradient-to-b from-transparent via-amber-400/20 to-transparent animate-pulse delay-300" />
          <div className="absolute top-0 left-3/4 w-1 h-full bg-gradient-to-b from-transparent via-yellow-500/30 to-transparent animate-pulse delay-700" />
        </div>

        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-yellow-400/40 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}

        {/* Palm Tree Silhouettes */}
        <div className="absolute bottom-0 left-0 right-0 h-64 opacity-20">
          <div className="absolute bottom-0 left-1/4 text-9xl opacity-30">🌴</div>
          <div className="absolute bottom-0 right-1/4 text-9xl opacity-30">🫒</div>
        </div>

        {/* Glass Blur Overlay */}
        <div className="absolute inset-0 backdrop-blur-[1px] bg-black/10" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-6">
        {/* Royal Logo */}
        <div
          className={`transition-all duration-1200 ${
            showLogo
              ? 'opacity-100 scale-100 rotate-0'
              : 'opacity-0 scale-50 rotate-12'
          }`}
        >
          <div className="relative">
            {/* Glow Effect */}
            <div className="absolute inset-0 animate-pulse">
              <div className="w-32 h-32 mx-auto bg-yellow-400/30 rounded-full blur-3xl" />
            </div>

            {/* Logo */}
            <div className="relative bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 p-1 rounded-3xl shadow-2xl">
              <div className="bg-gradient-to-br from-amber-900 to-yellow-950 p-8 rounded-3xl">
                <div className="flex items-center justify-center gap-3">
                  <span className="text-6xl">🌴</span>
                  <Sparkles className="w-12 h-12 text-yellow-400 animate-pulse" />
                  <span className="text-6xl">🫒</span>
                </div>
              </div>
            </div>

            {/* Royal Crown */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-4xl animate-bounce">
              👑
            </div>
          </div>
        </div>

        {/* Welcome Text */}
        <div
          className={`mt-12 text-center transition-all duration-700 ${
            showWelcome
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-8'
          }`}
        >
          <h1 className="text-3xl md:text-5xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-200 animate-gradient">
            مرحبًا بكم في الصالة الملكية
          </h1>
          <p className="text-xl md:text-2xl text-yellow-100/90 font-bold mb-2">
            لتملك أشجار النخيل والزيتون
          </p>
          <p className="text-lg text-yellow-200/70 font-medium flex items-center justify-center gap-2">
            <span>استثمارك في الأرض يبدأ من هنا</span>
            <span className="text-2xl animate-pulse">🌴</span>
          </p>
        </div>

        {/* Enter Button */}
        <div
          className={`mt-16 transition-all duration-500 ${
            showButton
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-4'
          }`}
        >
          <button
            onClick={handleEnter}
            className="group relative px-12 py-5 rounded-2xl font-black text-xl transition-all duration-300 hover:scale-105 active:scale-95"
          >
            {/* Button Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400 rounded-2xl blur-xl opacity-60 group-hover:opacity-100 animate-pulse" />

            {/* Button Content */}
            <div className="relative bg-gradient-to-r from-yellow-500 via-amber-600 to-yellow-500 rounded-2xl px-12 py-5 shadow-2xl">
              <div className="flex items-center gap-3 text-amber-950">
                <span>ادخل إلى المنصة</span>
                <ChevronLeft className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Sparkles */}
            <div className="absolute -top-2 -right-2 text-2xl animate-bounce">✨</div>
            <div className="absolute -bottom-2 -left-2 text-2xl animate-bounce delay-300">✨</div>
          </button>
        </div>

        {/* Royal Seal */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-20">
          <div className="text-8xl animate-spin-slow">⚜️</div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) translateX(20px);
          }
        }

        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
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
          animation: float linear infinite;
        }

        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 3s ease infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }

        .delay-300 {
          animation-delay: 300ms;
        }

        .delay-700 {
          animation-delay: 700ms;
        }
      `}</style>
    </div>
  );
}
