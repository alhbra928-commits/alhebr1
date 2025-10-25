import { useState, useEffect } from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';

interface SmartWelcomeModalProps {
  onClose: () => void;
  investorName?: string;
}

export function SmartWelcomeModal({ onClose, investorName }: SmartWelcomeModalProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 2000),
      setTimeout(() => setStep(2), 4000),
    ];

    return () => timers.forEach(timer => clearTimeout(timer));
  }, []);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 backdrop-blur-lg"
      style={{ background: 'rgba(0,0,0,0.85)' }}
      onClick={onClose}
    >
      <div
        className="relative max-w-3xl w-full rounded-3xl p-8 md:p-12 text-center overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
          border: '2px solid rgba(139, 117, 63, 0.3)',
          boxShadow: '0 30px 80px rgba(0,0,0,0.9), 0 0 100px rgba(139, 117, 63, 0.2)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background Pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(139, 117, 63, 0.3) 0%, transparent 50%),
                             radial-gradient(circle at 80% 80%, rgba(139, 117, 63, 0.3) 0%, transparent 50%)`,
          }}
        />

        {/* Content */}
        <div className="relative z-10">
          {/* Main Title - Always Visible with Glow */}
          <h1
            className="text-3xl md:text-4xl lg:text-5xl font-black mb-8 leading-tight"
            style={{
              background: 'linear-gradient(135deg, #8b753f 0%, #d4af37 50%, #8b753f 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundSize: '200% auto',
              animation: 'shimmer 3s linear infinite',
              textShadow: '0 0 40px rgba(139, 117, 63, 0.5)',
              filter: 'drop-shadow(0 0 20px rgba(212, 175, 55, 0.6))',
            }}
          >
            مرحبًا بك في منصة النخيل والزيتون الذكية.
          </h1>

          {/* Success Badge - Appears after 2s */}
          <div
            className="transition-all duration-1000 mb-8"
            style={{
              opacity: step >= 1 ? 1 : 0,
              transform: step >= 1 ? 'scale(1)' : 'scale(0.8)',
            }}
          >
            <div
              className="inline-flex items-center gap-3 px-6 py-3 rounded-full"
              style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.2) 100%)',
                border: '2px solid rgba(16, 185, 129, 0.5)',
                boxShadow: '0 0 30px rgba(16, 185, 129, 0.3)',
              }}
            >
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              <span className="text-xl font-bold text-emerald-400">
                تم اعتماد حسابك بنجاح
              </span>
            </div>
          </div>

          {/* Info Section - Slides in after 4s */}
          <div
            className="transition-all duration-1000 mb-8"
            style={{
              opacity: step >= 2 ? 1 : 0,
              transform: step >= 2 ? 'translateY(0)' : 'translateY(20px)',
            }}
          >
            <div
              className="text-right space-y-6 p-6 rounded-2xl"
              style={{
                background: 'linear-gradient(135deg, rgba(139, 117, 63, 0.1) 0%, rgba(212, 175, 55, 0.05) 100%)',
                border: '1px solid rgba(139, 117, 63, 0.2)',
              }}
            >
              <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
                هذه المنصة تتيح لك <span className="text-yellow-600 font-bold">الاستثمار في مزارع حقيقية</span> بإشراف إداري متكامل،
                ومتابعة تفاصيل حجوزاتك، وإدارة عمليات الدفع، واستلام <span className="text-yellow-600 font-bold">شهادات التملك الرقمية</span> مباشرة من لوحة التحكم.
              </p>

              <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
                ابدأ الآن بتصفح المزارع المتاحة، واطّلع على بياناتها، وحدد خياراتك الاستثمارية بخطوات منظمة وواضحة.
              </p>

              <div
                className="pt-4 border-t"
                style={{ borderColor: 'rgba(139, 117, 63, 0.3)' }}
              >
                <p className="text-lg md:text-xl text-gray-400 leading-relaxed italic">
                  نحن هنا لنجعل تجربة التملك الزراعي <span className="text-yellow-600 font-bold">سهلة، آمنة، وشفافة</span> —
                  منصة واحدة تجمع بين التقنية والاستثمار الزراعي الفعلي. 🌴
                </p>
              </div>
            </div>
          </div>

          {/* CTA Button - Smart 3D Style */}
          <button
            onClick={onClose}
            className="group relative overflow-hidden px-8 py-4 rounded-xl text-lg md:text-xl font-bold transition-all duration-300 hover:scale-105 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #8b753f 0%, #d4af37 50%, #8b753f 100%)',
              backgroundSize: '200% auto',
              boxShadow: '0 10px 30px rgba(139, 117, 63, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
              border: '1px solid rgba(212, 175, 55, 0.5)',
            }}
          >
            {/* 3D Effect Layers */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: 'linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
                animation: 'shimmer 2s linear infinite',
              }}
            />

            <span className="relative flex items-center justify-center gap-2 text-white drop-shadow-lg">
              ابدأ الآن
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
        </div>

        {/* Decorative Elements */}
        <div
          className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20"
          style={{ background: 'radial-gradient(circle, #d4af37 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-0 left-0 w-32 h-32 rounded-full blur-3xl opacity-20"
          style={{ background: 'radial-gradient(circle, #8b753f 0%, transparent 70%)' }}
        />
      </div>

      {/* Global Styles for Animations */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideIn {
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
