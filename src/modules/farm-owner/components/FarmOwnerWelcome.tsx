import React, { useState, useEffect } from 'react';
import { Sparkles, TreePine, DollarSign, Users, Shield, Award, ArrowLeft, CheckCircle, Heart, Handshake } from 'lucide-react';

interface FarmOwnerWelcomeProps {
  ownerName: string;
  onComplete: () => void;
}

export const FarmOwnerWelcome: React.FC<FarmOwnerWelcomeProps> = ({ ownerName, onComplete }) => {
  const [step, setStep] = useState(0);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    setTimeout(() => setShowContent(true), 300);
  }, []);

  const benefits = [
    {
      icon: Shield,
      title: 'شريك موثوق',
      description: 'نحن معك في كل خطوة حتى إتمام الصفقة بأمان',
      color: '#8BC34A'
    },
    {
      icon: DollarSign,
      title: 'دفعات منتظمة ومضمونة',
      description: 'نلتزم بجدول الدفعات المتفق عليه بدقة',
      color: '#FFB74D'
    },
    {
      icon: Heart,
      title: 'فريق دعم متواصل',
      description: 'نحن هنا للإجابة على جميع استفساراتك دائماً',
      color: '#4FC3F7'
    },
    {
      icon: Handshake,
      title: 'انتقال سلس للملكية',
      description: 'إجراءات قانونية واضحة ومضمونة بالكامل',
      color: '#9575CD'
    }
  ];

  const steps = [
    {
      title: 'قدم معلومات المزرعة',
      description: 'أضف بيانات مزرعتك بكل سهولة ويسر',
      icon: TreePine
    },
    {
      title: 'حدد السعر النهائي',
      description: 'ضع سعر البيع المناسب لمزرعتك',
      icon: DollarSign
    },
    {
      title: 'انتظر المراجعة والموافقة',
      description: 'سنراجع البيانات ونوافق عليها سريعاً',
      icon: CheckCircle
    },
    {
      title: 'استلم دفعاتك بانتظام',
      description: 'سنبدأ بتحويل الدفعات حسب الاتفاق',
      icon: Award
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden" style={{
      background: 'linear-gradient(135deg, #1C2E0F 0%, #0F1A08 50%, #1C2E0F 100%)'
    }}>
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${15 + Math.random() * 10}s`
            }}
          >
            <div
              className="text-4xl opacity-10"
              style={{
                filter: 'drop-shadow(0 0 10px #8BC34A)',
                transform: `rotate(${Math.random() * 360}deg)`
              }}
            >
              🌳
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className={`text-center mb-16 transition-all duration-1000 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
          <div className="inline-block mb-6 relative">
            <div
              className="text-8xl animate-bounce-slow"
              style={{
                filter: 'drop-shadow(0 0 30px #8BC34A)'
              }}
            >
              🌳
            </div>
            <Sparkles
              className="absolute -top-4 -right-4 text-yellow-400 animate-pulse"
              size={32}
            />
          </div>

          <h1
            className="text-5xl md:text-6xl font-black mb-4"
            style={{
              background: 'linear-gradient(135deg, #8BC34A 0%, #A4D65E 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 40px rgba(139, 195, 74, 0.3)'
            }}
          >
            نرحب بك معنا، {ownerName}! 🤝
          </h1>

          <p className="text-xl md:text-2xl font-bold mb-3" style={{ color: '#A4D65E' }}>
            شكراً لك لثقتك في منصة الحبر للتسويق الزراعي
          </p>

          <p className="text-lg mb-4 max-w-2xl mx-auto" style={{ color: '#A4D65E', opacity: 0.9 }}>
            يسعدنا أن نكون شريكك في رحلة بيع مزرعتك. نحن هنا لنجعل العملية سهلة وآمنة ومريحة لك
          </p>

          <div className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-full" style={{
            background: 'rgba(139, 195, 74, 0.1)',
            border: '2px solid rgba(139, 195, 74, 0.3)'
          }}>
            <Handshake className="text-yellow-400" size={24} />
            <span className="font-bold" style={{ color: '#8BC34A' }}>
              بائع موثوق في منصة الحبر للتسويق الزراعي
            </span>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className={`grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 transition-all duration-1000 delay-300 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div
                key={index}
                className="relative group"
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                <div
                  className="h-full p-6 rounded-2xl backdrop-blur-md transition-all duration-300 hover:scale-105"
                  style={{
                    background: 'rgba(28, 46, 15, 0.6)',
                    border: '2px solid rgba(139, 195, 74, 0.2)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 mx-auto transition-transform group-hover:rotate-12"
                    style={{
                      background: `linear-gradient(135deg, ${benefit.color}20, ${benefit.color}40)`,
                      border: `2px solid ${benefit.color}60`
                    }}
                  >
                    <Icon size={32} style={{ color: benefit.color }} />
                  </div>

                  <h3 className="text-lg font-bold mb-2 text-center" style={{ color: '#8BC34A' }}>
                    {benefit.title}
                  </h3>

                  <p className="text-sm text-center opacity-80" style={{ color: '#A4D65E' }}>
                    {benefit.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Steps to Get Started */}
        <div className={`transition-all duration-1000 delay-500 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-black mb-3" style={{ color: '#8BC34A' }}>
              رحلتك معنا 🌟
            </h2>
            <p className="text-lg" style={{ color: '#A4D65E' }}>
              اتبع هذه الخطوات البسيطة وسنكون معك في كل خطوة
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {steps.map((stepItem, index) => {
              const Icon = stepItem.icon;
              return (
                <div
                  key={index}
                  className="relative"
                  style={{
                    animationDelay: `${600 + index * 100}ms`
                  }}
                >
                  <div
                    className="h-full p-6 rounded-2xl backdrop-blur-md transition-all duration-300 hover:scale-105"
                    style={{
                      background: 'rgba(28, 46, 15, 0.8)',
                      border: '3px solid rgba(139, 195, 74, 0.3)',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
                    }}
                  >
                    {/* Step Number */}
                    <div
                      className="absolute -top-4 -right-4 w-12 h-12 rounded-full flex items-center justify-center font-black text-xl"
                      style={{
                        background: 'linear-gradient(135deg, #8BC34A, #A4D65E)',
                        color: '#1C2E0F',
                        boxShadow: '0 4px 16px rgba(139, 195, 74, 0.5)'
                      }}
                    >
                      {index + 1}
                    </div>

                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 mx-auto"
                      style={{
                        background: 'linear-gradient(135deg, rgba(139, 195, 74, 0.2), rgba(139, 195, 74, 0.4))',
                        border: '2px solid rgba(139, 195, 74, 0.6)'
                      }}
                    >
                      <Icon size={32} style={{ color: '#8BC34A' }} />
                    </div>

                    <h3 className="text-lg font-bold mb-2 text-center" style={{ color: '#8BC34A' }}>
                      {stepItem.title}
                    </h3>

                    <p className="text-sm text-center opacity-80" style={{ color: '#A4D65E' }}>
                      {stepItem.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA Button */}
          <div className="text-center">
            <button
              onClick={onComplete}
              className="group relative inline-flex items-center gap-3 px-10 py-5 rounded-2xl font-black text-xl transition-all duration-300 hover:scale-105 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #8BC34A 0%, #A4D65E 100%)',
                color: '#1C2E0F',
                boxShadow: '0 10px 40px rgba(139, 195, 74, 0.4)'
              }}
            >
              <span>لنبدأ معاً</span>
              <ArrowLeft className="group-hover:-translate-x-2 transition-transform" size={28} />
            </button>

            <p className="mt-4 text-base font-semibold" style={{ color: '#A4D65E' }}>
              نحن معك خطوة بخطوة حتى نهاية الرحلة 💚
            </p>
            <p className="mt-2 text-sm opacity-70" style={{ color: '#A4D65E' }}>
              لن تظهر هذه الرسالة مرة أخرى
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }

        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        .animate-float {
          animation: float ease-in-out infinite;
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
