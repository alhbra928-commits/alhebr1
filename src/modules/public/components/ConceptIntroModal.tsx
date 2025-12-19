import { X, TreePine, Leaf, TrendingUp, Shield, Award, Users } from 'lucide-react';
import { brandColors, brandGradients } from '../../finance/styles/brandColors';

interface ConceptIntroModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ConceptIntroModal({ isOpen, onClose }: ConceptIntroModalProps) {
  if (!isOpen) return null;

  const concepts = [
    {
      icon: TreePine,
      title: 'ملكية حقيقية',
      description: 'تملك شجرة نخيل أو زيتون بعقد ملكية موثق ومسجل باسمك',
      color: '#8BA574',
      emoji: '🌴'
    },
    {
      icon: TrendingUp,
      title: 'عائد استثماري',
      description: 'استثمار آمن ومربح مع عوائد سنوية من إنتاج الأشجار',
      color: '#D4AF37',
      emoji: '📈'
    },
    {
      icon: Shield,
      title: 'ضمان وأمان',
      description: 'رعاية متخصصة للأشجار وتأمين شامل على الإنتاج',
      color: brandColors.primary.olive,
      emoji: '🛡️'
    },
    {
      icon: Award,
      title: 'جودة عالية',
      description: 'مزارع معتمدة بأعلى معايير الجودة والزراعة العضوية',
      color: brandColors.primary.gold,
      emoji: '⭐'
    },
    {
      icon: Users,
      title: 'مجتمع مستثمرين',
      description: 'انضم لمجتمع من المستثمرين في الزراعة المستدامة',
      color: '#8BA574',
      emoji: '👥'
    },
    {
      icon: Leaf,
      title: 'استدامة بيئية',
      description: 'ساهم في الحفاظ على البيئة ودعم الزراعة المحلية',
      color: brandColors.primary.olive,
      emoji: '🌱'
    }
  ];

  return (
    <div
      className="fixed inset-0 z-[10100] flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-w-5xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto rounded-xl sm:rounded-2xl shadow-2xl"
        style={{
          background: 'linear-gradient(180deg, #F8F6F1 0%, #EDE6D9 100%)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="sticky top-0 z-10 p-4 sm:p-6 border-b-2"
          style={{
            background: 'linear-gradient(135deg, #4a5d3e 0%, #5a6d4e 100%)',
            borderColor: brandColors.primary.gold,
          }}
        >
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            className="absolute top-3 left-3 sm:top-4 sm:left-4 p-1.5 sm:p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-all duration-300 z-[50]"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </button>

          <div className="text-center pr-6 sm:pr-8">
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <span className="text-2xl sm:text-4xl">🌴</span>
              <h2
                className="text-xl sm:text-3xl md:text-4xl font-black"
                style={{
                  background: brandGradients.gold,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                فكرة تملك شجرة
              </h2>
              <span className="text-2xl sm:text-4xl">🌳</span>
            </div>
            <p className="text-white text-sm sm:text-lg font-medium">
              استثمار راقٍ في الزراعة المستدامة
            </p>
          </div>
        </div>

        <div className="p-4 sm:p-6 md:p-8">
          <div
            className="mb-6 sm:mb-8 p-6 sm:p-8 rounded-2xl sm:rounded-3xl text-center relative overflow-hidden group"
            style={{
              background: 'linear-gradient(135deg, rgba(139, 165, 116, 0.15) 0%, rgba(212, 175, 55, 0.15) 50%, rgba(139, 165, 116, 0.15) 100%)',
              border: '3px solid transparent',
              backgroundClip: 'padding-box',
              boxShadow: '0 10px 40px rgba(139, 165, 116, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
            }}
          >
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(139, 165, 116, 0.1) 100%)',
              }}
            />
            <div className="relative z-10">
              <div className="inline-block mb-4 p-3 rounded-2xl" style={{
                background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(139, 165, 116, 0.2) 100%)',
                boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)',
              }}>
                <div className="flex items-center gap-2 text-3xl sm:text-4xl">
                  <span>🌴</span>
                  <span>🌳</span>
                </div>
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-black mb-4 sm:mb-5" style={{
                background: 'linear-gradient(135deg, #4a5d3e 0%, #8BA574 50%, #D4AF37 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                كيف تعمل منصة النخلة والزيتون؟
              </h3>
              <p className="text-sm sm:text-base md:text-lg leading-relaxed font-semibold max-w-3xl mx-auto" style={{
                color: '#4a5d3e',
                textShadow: '0 1px 2px rgba(255, 255, 255, 0.5)',
              }}>
                منصة النخلة والزيتون هي أول منصة سعودية متخصصة في تمليك الأشجار الزراعية.
                نوفر لك فرصة امتلاك أشجار النخيل والزيتون في مزارع معتمدة ومدارة باحترافية،
                مع ضمان عوائد استثمارية مجزية من الإنتاج السنوي.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {concepts.map((concept, index) => {
              const Icon = concept.icon;
              return (
                <div
                  key={index}
                  className="relative p-5 sm:p-7 rounded-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 group overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 246, 241, 0.95) 100%)',
                    border: '2px solid transparent',
                    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
                  }}
                >
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: `linear-gradient(135deg, ${concept.color}10 0%, ${concept.color}20 100%)`,
                    }}
                  />

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4 sm:mb-5">
                      <div
                        className="p-3 sm:p-4 rounded-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6"
                        style={{
                          background: `linear-gradient(135deg, ${concept.color}25 0%, ${concept.color}40 100%)`,
                          border: `2px solid ${concept.color}`,
                          boxShadow: `0 4px 20px ${concept.color}40`,
                        }}
                      >
                        <Icon className="h-6 w-6 sm:h-7 sm:w-7" style={{ color: concept.color }} />
                      </div>
                      <span className="text-4xl sm:text-5xl transition-transform duration-500 group-hover:scale-125 group-hover:rotate-12">
                        {concept.emoji}
                      </span>
                    </div>

                    <h4
                      className="text-lg sm:text-xl md:text-2xl font-black mb-3 transition-colors duration-300"
                      style={{
                        color: concept.color,
                        textShadow: `0 2px 4px ${concept.color}20`,
                      }}
                    >
                      {concept.title}
                    </h4>
                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed font-semibold">
                      {concept.description}
                    </p>

                    <div
                      className="absolute bottom-0 left-0 right-0 h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"
                      style={{
                        background: `linear-gradient(90deg, ${concept.color} 0%, transparent 100%)`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div
            className="relative p-6 sm:p-8 md:p-10 rounded-3xl mb-6 sm:mb-8 overflow-hidden group"
            style={{
              background: 'linear-gradient(135deg, #4a5d3e 0%, #5a6d4e 50%, #4a5d3e 100%)',
              border: '3px solid transparent',
              boxShadow: '0 15px 50px rgba(74, 93, 62, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            }}
          >
            <div
              className="absolute inset-0 opacity-30"
              style={{
                background: 'radial-gradient(circle at 30% 50%, rgba(212, 175, 55, 0.2) 0%, transparent 50%), radial-gradient(circle at 70% 50%, rgba(139, 165, 116, 0.2) 0%, transparent 50%)',
              }}
            />

            <div className="relative z-10">
              <div className="flex items-center justify-center gap-3 mb-5 sm:mb-7">
                <div
                  className="w-12 h-1 rounded-full"
                  style={{ background: brandGradients.gold }}
                />
                <h3
                  className="text-xl sm:text-2xl md:text-3xl font-black text-center"
                  style={{
                    background: brandGradients.gold,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    filter: 'drop-shadow(0 2px 4px rgba(212, 175, 55, 0.3))',
                  }}
                >
                  خطوات الاستثمار
                </h3>
                <div
                  className="w-12 h-1 rounded-full"
                  style={{ background: brandGradients.gold }}
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                {[
                  { step: '1', title: 'اختر المزرعة', desc: 'تصفح المزارع المتاحة', icon: '🏞️', color: '#D4AF37' },
                  { step: '2', title: 'احجز شجرتك', desc: 'اختر عدد الأشجار المطلوب', icon: '🌳', color: '#8BA574' },
                  { step: '3', title: 'أكمل الدفع', desc: 'ادفع بأمان وسهولة', icon: '💳', color: '#C9A961' },
                  { step: '4', title: 'احصد الأرباح', desc: 'استلم عوائدك السنوية', icon: '💰', color: '#96A063' },
                ].map((step, index) => (
                  <div
                    key={index}
                    className="relative text-center p-4 rounded-2xl transition-all duration-500 hover:scale-110 hover:-translate-y-2 group/step"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(10px)',
                      border: '2px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <div
                      className="absolute inset-0 opacity-0 group-hover/step:opacity-100 transition-opacity duration-500 rounded-2xl"
                      style={{
                        background: `linear-gradient(135deg, ${step.color}20 0%, transparent 100%)`,
                      }}
                    />

                    <div className="relative z-10">
                      <div className="relative inline-block mb-3 sm:mb-4">
                        <div
                          className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto rounded-2xl flex items-center justify-center text-xl sm:text-2xl md:text-3xl font-black transition-all duration-500 group-hover/step:rotate-12 group-hover/step:scale-110"
                          style={{
                            background: `linear-gradient(135deg, ${step.color} 0%, ${step.color}dd 100%)`,
                            color: '#2E2A26',
                            boxShadow: `0 8px 25px ${step.color}60, inset 0 1px 0 rgba(255, 255, 255, 0.3)`,
                          }}
                        >
                          {step.step}
                        </div>
                        <div className="absolute -top-2 -right-2 text-3xl sm:text-4xl transition-transform duration-500 group-hover/step:scale-125 group-hover/step:rotate-12">
                          {step.icon}
                        </div>
                      </div>

                      <h5
                        className="text-white font-black mb-2 text-base sm:text-lg transition-colors duration-300"
                        style={{
                          textShadow: `0 2px 8px ${step.color}80`,
                        }}
                      >
                        {step.title}
                      </h5>
                      <p className="text-white/90 text-xs sm:text-sm font-semibold leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-black text-base sm:text-lg transition-all duration-300 hover:scale-105 shadow-xl"
              style={{
                background: brandGradients.gold,
                color: '#2E2A26',
              }}
            >
              ابدأ الاستثمار الآن 🚀
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
