import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface ConceptPoint {
  icon: string;
  text: string;
}

interface EnhancedConceptCardProps {
  isOpen: boolean;
  onClose: () => void;
  onStartOwnership: () => void;
}

export const EnhancedConceptCard: React.FC<EnhancedConceptCardProps> = ({ isOpen, onClose, onStartOwnership }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const conceptPoints: ConceptPoint[] = [
    {
      icon: '🌴',
      text: 'تأجيرك للأشجار والمحاصيل هو تأجير حقيقي من أرض المزرعة نفسها.'
    },
    {
      icon: '📜',
      text: 'حجزك موثق رسميًا داخل المنصة ويحمل اسمك للفترة المحددة.'
    },
    {
      icon: '💰',
      text: 'يمكنك توجيه منفعة التأجير الموسمي كوقف خيري، أو إهداء منفعة التأجير الموسمي لشخص آخر.'
    },
    {
      icon: '📋',
      text: 'ملاحظة: الوقف والإهداء يخصان منفعة التأجير الموسمي التي تديرها المنصة، ولا يشملان ملكية الأصول الزراعية.'
    },
    {
      icon: '🌾',
      text: 'المنصة تتولى العناية والمتابعة الدورية لجميع الأشجار في المزرعة.'
    },
    {
      icon: '🧑‍🌾',
      text: 'فرق مختصة بالري والصيانة والتصوير تتابع كل شجرة باستمرار.'
    },
    {
      icon: '⚙️',
      text: 'كل ذلك مقابل رسوم رمزية بسيطة عن كل شجرة محجوزة.'
    },
    {
      icon: '✨',
      text: 'ابدأ رحلتك الآن واستأجر من المزارع المتاحة للموسم القادم.'
    }
  ];

  // Reset animation when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
      setIsVisible(true);
    } else {
      // Reset when closing
      setIsVisible(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && currentIndex < conceptPoints.length) {
      const timer = setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, currentIndex, conceptPoints.length]);

  if (!isOpen) return null;

  const handleStartOwnership = () => {
    // ✅ إغلاق الـ modal والعودة مباشرة للواجهة الرئيسية (لا نفتح صفحة ثانية)
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[10100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`
          relative max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-3xl
          transition-all duration-1000
          ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
        `}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.95) 0%, rgba(5, 150, 105, 0.98) 50%, rgba(4, 120, 87, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
          border: '3px solid rgba(16, 185, 129, 0.4)',
          boxShadow: `
            0 20px 60px rgba(16, 185, 129, 0.3),
            0 10px 30px rgba(16, 185, 129, 0.2),
            inset 0 2px 4px rgba(255, 255, 255, 0.2),
            inset 0 -2px 4px rgba(0, 0, 0, 0.1)
          `
        }}
      >
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(52, 211, 153, 0.3) 0%, transparent 50%)',
          }}
        />

        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-300 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-300 to-transparent" />

        {/* Close Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-4 left-4 z-[100] p-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all duration-300 hover:scale-110"
        >
          <X className="h-6 w-6 text-white" />
        </button>

        <div className="relative z-10 p-6 sm:p-8 md:p-10">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="text-4xl sm:text-5xl animate-bounce">🌴</span>
              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-black text-white"
                style={{
                  textShadow: '0 4px 12px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2)',
                  fontFamily: 'Tajawal, sans-serif'
                }}
              >
                اكتشف فكرة التأجير الموسمي للمزارع
              </h2>
              <span className="text-4xl sm:text-5xl animate-bounce" style={{ animationDelay: '0.2s' }}>🌳</span>
            </div>
          </div>

          <div className="space-y-4 mb-8 min-h-[400px]">
            {conceptPoints.map((point, index) => (
              <div
                key={index}
                className={`
                  flex items-start gap-4 p-4 sm:p-6 rounded-2xl
                  transition-all duration-700 transform
                  ${index <= currentIndex ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}
                `}
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(10px)',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1), inset 0 1px 2px rgba(255, 255, 255, 0.3)',
                  transitionDelay: `${index * 100}ms`
                }}
              >
                <div
                  className="flex-shrink-0 text-4xl sm:text-5xl transform transition-transform duration-500 hover:scale-110 hover:rotate-12"
                  style={{
                    filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))'
                  }}
                >
                  {point.icon}
                </div>
                <p
                  className="text-white text-base sm:text-lg md:text-xl font-bold leading-relaxed"
                  style={{
                    textShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
                    fontFamily: 'Tajawal, sans-serif'
                  }}
                >
                  {point.text}
                </p>
              </div>
            ))}

            {currentIndex > 0 && currentIndex < conceptPoints.length && (
              <div className="flex justify-center animate-pulse">
                <div
                  className="w-16 h-1 rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, transparent 0%, rgba(251, 191, 36, 0.8) 50%, transparent 100%)',
                  }}
                />
              </div>
            )}
          </div>

          {currentIndex >= conceptPoints.length && (
            <div
              className="text-center animate-fade-in"
              style={{
                animation: 'fadeInUp 0.8s ease-out forwards'
              }}
            >
              <button
                onClick={handleStartOwnership}
                className="
                  relative overflow-hidden
                  px-8 py-5 sm:px-12 sm:py-6
                  rounded-2xl
                  font-black text-xl sm:text-2xl
                  transition-all duration-500
                  hover:scale-110 hover:shadow-2xl
                  active:scale-95
                  group
                "
                style={{
                  background: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 50%, #D97706 100%)',
                  color: '#1F2937',
                  boxShadow: `
                    0 15px 40px rgba(251, 191, 36, 0.5),
                    0 8px 20px rgba(251, 191, 36, 0.4),
                    inset 0 2px 4px rgba(255, 255, 255, 0.4),
                    inset 0 -2px 4px rgba(0, 0, 0, 0.2)
                  `,
                  border: '3px solid rgba(251, 191, 36, 0.6)',
                  fontFamily: 'Tajawal, sans-serif',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                }}
              >
                <span className="relative z-10 flex items-center gap-3 justify-center">
                  <span className="text-3xl">🚀</span>
                  ابدأ التأجير الآن
                  <span className="text-3xl">🌟</span>
                </span>

                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 50%, #F59E0B 100%)',
                  }}
                />

                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 3s linear infinite'
                  }}
                />
              </button>

              <p
                className="mt-4 text-white/90 text-sm sm:text-base font-semibold"
                style={{
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                  fontFamily: 'Tajawal, sans-serif'
                }}
              >
                ابدأ تأجيرك الموسمي من المزارع المتاحة الآن ✨
              </p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fadeInUp 0.8s ease-out forwards;
        }

        @media (max-width: 640px) {
          h2 {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};
