import React from 'react';
import { X, Sparkles, TrendingUp, Heart, Leaf } from 'lucide-react';

interface ConceptIntroductionPageProps {
  onClose: () => void;
  onStartJourney: () => void;
}

export const ConceptIntroductionPage: React.FC<ConceptIntroductionPageProps> = ({
  onClose,
  onStartJourney
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-green-900 to-amber-900 overflow-y-auto">
      <button
        onClick={onClose}
        className="fixed top-4 right-4 md:top-6 md:right-6 z-50 p-2 md:p-3 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 group"
        aria-label="إغلاق"
      >
        <X className="w-5 h-5 md:w-6 md:h-6 text-white group-hover:rotate-90 transition-transform duration-300" />
      </button>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-12 lg:py-20">
        <div className="text-center mb-8 md:mb-12 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-4 md:mb-6">
            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-yellow-400 animate-pulse" />
            <h1
              className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black text-white text-center px-2"
              style={{ fontFamily: 'Tajawal, sans-serif' }}
            >
              💎 فكرة تملك النخيل وأشجار الزيتون
            </h1>
            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-yellow-400 animate-pulse" />
          </div>
          <div className="h-0.5 md:h-1 w-24 md:w-32 mx-auto bg-gradient-to-r from-transparent via-yellow-400 to-transparent rounded-full"></div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-8 md:mb-12">
          <div className="concept-card bg-gradient-to-br from-green-800/40 to-emerald-900/40 backdrop-blur-md rounded-2xl md:rounded-3xl p-5 sm:p-6 md:p-8 border-2 border-green-400/30 shadow-2xl hover:scale-105 transition-all duration-500">
            <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-3xl sm:text-3xl md:text-4xl">🌴</span>
              </div>
              <h2
                className="text-xl sm:text-xl md:text-2xl font-bold text-white"
                style={{ fontFamily: 'Tajawal, sans-serif' }}
              >
                تملك النخيل
              </h2>
            </div>
            <p
              className="text-green-100 leading-relaxed text-sm sm:text-base md:text-lg"
              style={{ fontFamily: 'Tajawal, sans-serif' }}
            >
              استثمر في نخيل حقيقي مُسجل باسمك، واحصل على نصيبك من الإنتاج السنوي.
              النخيل يمثل تراثنا الأصيل وثروة طبيعية مستدامة تنمو قيمتها مع الزمن.
            </p>
          </div>

          <div className="concept-card bg-gradient-to-br from-amber-800/40 to-yellow-900/40 backdrop-blur-md rounded-2xl md:rounded-3xl p-5 sm:p-6 md:p-8 border-2 border-amber-400/30 shadow-2xl hover:scale-105 transition-all duration-500">
            <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-3xl sm:text-3xl md:text-4xl">🫒</span>
              </div>
              <h2
                className="text-xl sm:text-xl md:text-2xl font-bold text-white"
                style={{ fontFamily: 'Tajawal, sans-serif' }}
              >
                تملك أشجار الزيتون
              </h2>
            </div>
            <p
              className="text-amber-100 leading-relaxed text-sm sm:text-base md:text-lg"
              style={{ fontFamily: 'Tajawal, sans-serif' }}
            >
              امتلك أشجار زيتون منتجة لأجود أنواع زيت الزيتون البكر الممتاز.
              استثمار صحي ومربح يجمع بين العائد المالي والقيمة الغذائية العالية.
            </p>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl md:rounded-3xl p-5 sm:p-6 md:p-8 lg:p-12 border-2 border-white/20 shadow-2xl mb-8 md:mb-12">
          <h3
            className="text-xl sm:text-2xl md:text-3xl font-bold text-white text-center mb-6 md:mb-8"
            style={{ fontFamily: 'Tajawal, sans-serif' }}
          >
            ✨ لماذا هذا المشروع مميز؟
          </h3>

          <div className="grid sm:grid-cols-3 gap-4 md:gap-6">
            <div className="feature-card text-center p-4 sm:p-5 md:p-6 rounded-xl md:rounded-2xl bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-400/30 hover:border-blue-400/60 transition-all duration-300">
              <TrendingUp className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 text-blue-400 mx-auto mb-3 md:mb-4" />
              <h4
                className="text-lg sm:text-lg md:text-xl font-bold text-white mb-2 md:mb-3"
                style={{ fontFamily: 'Tajawal, sans-serif' }}
              >
                استثماري
              </h4>
              <p
                className="text-blue-200 text-xs sm:text-sm"
                style={{ fontFamily: 'Tajawal, sans-serif' }}
              >
                عوائد سنوية مضمونة من إنتاج أشجارك الخاصة
              </p>
            </div>

            <div className="feature-card text-center p-4 sm:p-5 md:p-6 rounded-xl md:rounded-2xl bg-gradient-to-br from-pink-600/20 to-rose-600/20 border border-pink-400/30 hover:border-pink-400/60 transition-all duration-300">
              <Heart className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 text-pink-400 mx-auto mb-3 md:mb-4" />
              <h4
                className="text-lg sm:text-lg md:text-xl font-bold text-white mb-2 md:mb-3"
                style={{ fontFamily: 'Tajawal, sans-serif' }}
              >
                إنساني
              </h4>
              <p
                className="text-pink-200 text-xs sm:text-sm"
                style={{ fontFamily: 'Tajawal, sans-serif' }}
              >
                دعم المزارعين المحليين وتوفير فرص عمل مستدامة
              </p>
            </div>

            <div className="feature-card text-center p-4 sm:p-5 md:p-6 rounded-xl md:rounded-2xl bg-gradient-to-br from-green-600/20 to-emerald-600/20 border border-green-400/30 hover:border-green-400/60 transition-all duration-300">
              <Leaf className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 text-green-400 mx-auto mb-3 md:mb-4" />
              <h4
                className="text-lg sm:text-lg md:text-xl font-bold text-white mb-2 md:mb-3"
                style={{ fontFamily: 'Tajawal, sans-serif' }}
              >
                بيئي
              </h4>
              <p
                className="text-green-200 text-xs sm:text-sm"
                style={{ fontFamily: 'Tajawal, sans-serif' }}
              >
                المساهمة في زراعة الأشجار والحفاظ على البيئة
              </p>
            </div>
          </div>
        </div>

        <div className="text-center px-2">
          <button
            onClick={onStartJourney}
            className="start-journey-button inline-flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 md:px-12 py-4 sm:py-5 md:py-6 text-base sm:text-lg md:text-xl font-bold text-white rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 w-full sm:w-auto"
            style={{ fontFamily: 'Tajawal, sans-serif' }}
          >
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="whitespace-nowrap">ابدأ رحلتك بالتملك الآن</span>
            <span className="text-xl sm:text-2xl">🌱</span>
          </button>
        </div>

        <div className="mt-6 md:mt-8 text-center px-4">
          <p
            className="text-white/60 text-xs sm:text-sm"
            style={{ fontFamily: 'Tajawal, sans-serif' }}
          >
            انضم إلى آلاف المستثمرين الذين بدأوا رحلتهم معنا
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }

        .concept-card {
          animation: fade-in 1s ease-out;
        }

        .feature-card {
          animation: fade-in 1.2s ease-out;
        }

        .start-journey-button {
          background: linear-gradient(
            135deg,
            #D4AF37 0%,
            #FFD700 25%,
            #F8E45F 50%,
            #D4AF37 75%,
            #B8960A 100%
          );
          box-shadow:
            0 10px 40px rgba(212, 175, 55, 0.5),
            0 5px 20px rgba(255, 215, 0, 0.3),
            inset 0 2px 4px rgba(255, 255, 255, 0.3);
          animation: gentle-glow 3s ease-in-out infinite;
        }

        .start-journey-button:hover {
          background: linear-gradient(
            135deg,
            #FFD700 0%,
            #F8E45F 25%,
            #FFD700 50%,
            #F8E45F 75%,
            #D4AF37 100%
          );
          box-shadow:
            0 15px 60px rgba(255, 215, 0, 0.7),
            0 8px 30px rgba(212, 175, 55, 0.5),
            inset 0 2px 4px rgba(255, 255, 255, 0.4);
        }

        @keyframes gentle-glow {
          0%, 100% {
            box-shadow:
              0 10px 40px rgba(212, 175, 55, 0.5),
              0 5px 20px rgba(255, 215, 0, 0.3),
              inset 0 2px 4px rgba(255, 255, 255, 0.3);
          }
          50% {
            box-shadow:
              0 15px 60px rgba(255, 215, 0, 0.7),
              0 8px 30px rgba(212, 175, 55, 0.5),
              inset 0 2px 4px rgba(255, 255, 255, 0.4);
          }
        }

        @media (max-width: 640px) {
          .concept-card:hover {
            transform: scale(1.02);
          }

          .feature-card:hover {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};
