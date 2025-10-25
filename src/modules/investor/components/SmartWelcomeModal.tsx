import { useState, useEffect } from 'react';
import { CheckCircle2, ArrowRight, Sparkles, Shield, TrendingUp, Award } from 'lucide-react';

interface SmartWelcomeModalProps {
  onClose: () => void;
  investorName?: string;
}

export function SmartWelcomeModal({ onClose, investorName }: SmartWelcomeModalProps) {
  const [step, setStep] = useState(0);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 800),
      setTimeout(() => setStep(2), 1600),
      setTimeout(() => setShowContent(true), 2400),
    ];

    return () => timers.forEach(timer => clearTimeout(timer));
  }, []);

  const features = [
    {
      icon: TrendingUp,
      title: 'استثمار ذكي',
      desc: 'في مزارع حقيقية بإشراف متكامل',
      delay: 0
    },
    {
      icon: Shield,
      title: 'آمن وشفاف',
      desc: 'متابعة مباشرة لجميع عملياتك',
      delay: 200
    },
    {
      icon: Award,
      title: 'شهادات رقمية',
      desc: 'وثائق تملك معتمدة فورية',
      delay: 400
    }
  ];

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{
        background: 'radial-gradient(circle at 50% 50%, rgba(139, 117, 63, 0.15) 0%, rgba(0,0,0,0.95) 100%)',
        backdropFilter: 'blur(20px)'
      }}
      onClick={onClose}
    >
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 4 + 2 + 'px',
              height: Math.random() * 4 + 2 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              background: 'rgba(212, 175, 55, 0.6)',
              animation: `float ${Math.random() * 3 + 2}s ease-in-out infinite`,
              animationDelay: Math.random() * 2 + 's',
              boxShadow: '0 0 10px rgba(212, 175, 55, 0.8)'
            }}
          />
        ))}
      </div>

      <div
        className="relative w-full max-w-5xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Main Container - Split Design */}
        <div className="grid md:grid-cols-2 gap-0 rounded-3xl overflow-hidden shadow-2xl">

          {/* Left Panel - Welcome Message */}
          <div
            className="relative p-8 md:p-12 flex flex-col justify-center"
            style={{
              background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
              borderRight: '1px solid rgba(139, 117, 63, 0.3)'
            }}
          >
            {/* Decorative Corner */}
            <div
              className="absolute top-0 left-0 w-32 h-32 opacity-20"
              style={{
                background: 'radial-gradient(circle at top left, #d4af37 0%, transparent 70%)',
              }}
            />

            {/* Logo Icon */}
            <div
              className="mb-6 transition-all duration-1000"
              style={{
                opacity: step >= 1 ? 1 : 0,
                transform: step >= 1 ? 'scale(1) rotate(0deg)' : 'scale(0) rotate(-180deg)',
              }}
            >
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto md:mx-0"
                style={{
                  background: 'linear-gradient(135deg, #8b753f 0%, #d4af37 100%)',
                  boxShadow: '0 10px 40px rgba(212, 175, 55, 0.4)',
                }}
              >
                <Sparkles className="w-10 h-10 text-white" />
              </div>
            </div>

            {/* Main Title */}
            <div
              className="mb-6 transition-all duration-1000 delay-300"
              style={{
                opacity: step >= 1 ? 1 : 0,
                transform: step >= 1 ? 'translateX(0)' : 'translateX(-30px)',
              }}
            >
              <h1
                className="text-3xl md:text-4xl lg:text-5xl font-black mb-3 leading-tight text-right md:text-right"
                style={{
                  background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 50%, #d4af37 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundSize: '200% auto',
                  animation: 'shimmer 3s linear infinite',
                }}
              >
                مرحبًا بك
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 font-bold text-right md:text-right">
                في منصة النخيل والزيتون الذكية
              </p>
            </div>

            {/* Success Badge */}
            <div
              className="transition-all duration-1000 delay-500"
              style={{
                opacity: step >= 2 ? 1 : 0,
                transform: step >= 2 ? 'scale(1)' : 'scale(0.8)',
              }}
            >
              <div
                className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.15) 100%)',
                  border: '2px solid rgba(16, 185, 129, 0.4)',
                  boxShadow: '0 0 30px rgba(16, 185, 129, 0.2)',
                }}
              >
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                <span className="text-lg font-bold text-emerald-400">
                  تم اعتماد حسابك بنجاح
                </span>
              </div>
            </div>

            {/* Decorative Lines */}
            <div className="absolute bottom-8 left-8 right-8 h-px bg-gradient-to-r from-transparent via-yellow-600/30 to-transparent" />
          </div>

          {/* Right Panel - Features & Content */}
          <div
            className="relative p-8 md:p-12 flex flex-col justify-between"
            style={{
              background: 'linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%)',
            }}
          >
            {/* Content Section */}
            <div
              className="space-y-6 transition-all duration-1000"
              style={{
                opacity: showContent ? 1 : 0,
                transform: showContent ? 'translateY(0)' : 'translateY(20px)',
              }}
            >
              {/* Description */}
              <div
                className="p-6 rounded-2xl"
                style={{
                  background: 'rgba(139, 117, 63, 0.08)',
                  border: '1px solid rgba(139, 117, 63, 0.2)',
                }}
              >
                <p className="text-base md:text-lg text-gray-300 leading-relaxed text-right">
                  هذه المنصة تتيح لك الاستثمار في{' '}
                  <span className="text-yellow-500 font-bold">مزارع حقيقية</span> بإشراف إداري متكامل،
                  ومتابعة تفاصيل حجوزاتك، وإدارة عمليات الدفع، واستلام{' '}
                  <span className="text-yellow-500 font-bold">شهادات التملك الرقمية</span> مباشرة من لوحة التحكم.
                </p>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 gap-4">
                {features.map((feature, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-4 p-4 rounded-xl transition-all duration-500 hover:scale-105"
                    style={{
                      background: 'rgba(212, 175, 55, 0.05)',
                      border: '1px solid rgba(212, 175, 55, 0.15)',
                      opacity: showContent ? 1 : 0,
                      transform: showContent ? 'translateX(0)' : 'translateX(20px)',
                      transitionDelay: `${feature.delay}ms`,
                    }}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: 'linear-gradient(135deg, rgba(139, 117, 63, 0.3) 0%, rgba(212, 175, 55, 0.3) 100%)',
                      }}
                    >
                      <feature.icon className="w-6 h-6 text-yellow-500" />
                    </div>
                    <div className="flex-1 text-right">
                      <h3 className="text-lg font-bold text-yellow-500 mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {feature.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer Message */}
              <div
                className="pt-4 border-t text-center"
                style={{ borderColor: 'rgba(139, 117, 63, 0.2)' }}
              >
                <p className="text-sm text-gray-400 italic">
                  منصة واحدة تجمع بين التقنية والاستثمار الزراعي الفعلي 🌴
                </p>
              </div>
            </div>

            {/* CTA Button */}
            <div className="mt-6">
              <button
                onClick={onClose}
                className="group relative w-full overflow-hidden px-8 py-4 rounded-2xl text-xl font-black transition-all duration-300 hover:scale-105 active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #8b753f 0%, #d4af37 50%, #f4d03f 100%)',
                  backgroundSize: '200% auto',
                  boxShadow: '0 10px 40px rgba(212, 175, 55, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                }}
              >
                {/* Shimmer Effect */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                    animation: 'shimmer-horizontal 2s ease-in-out infinite',
                  }}
                />

                {/* Button Content */}
                <span className="relative flex items-center justify-center gap-2 text-white">
                  ابدأ الآن
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </span>

                {/* Glow on Hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
                  style={{
                    boxShadow: '0 0 30px rgba(212, 175, 55, 0.6)',
                  }}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Decorative Corner Glow */}
        <div
          className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-30 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #d4af37 0%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full blur-3xl opacity-30 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #8b753f 0%, transparent 70%)' }}
        />
      </div>

      {/* Global Animations */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }

        @keyframes shimmer-horizontal {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-20px) translateX(10px);
            opacity: 0.8;
          }
        }
      `}</style>
    </div>
  );
}
