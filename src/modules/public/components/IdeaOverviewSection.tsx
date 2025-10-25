import React, { useState } from 'react';
import { TreePine, Sprout, TrendingUp, Heart, Leaf, ArrowLeft, Sparkles } from 'lucide-react';

interface IdeaOverviewSectionProps {
  onNavigateToFarms: () => void;
}

type TreeType = 'palm' | 'olive';

export const IdeaOverviewSection: React.FC<IdeaOverviewSectionProps> = ({ onNavigateToFarms }) => {
  const [activeType, setActiveType] = useState<TreeType>('palm');

  return (
    <div className="w-full py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8" style={{
      background: 'linear-gradient(135deg, #F5F3EF 0%, #FAF8F5 50%, #F5F3EF 100%)'
    }}>
      <div className="max-w-7xl mx-auto">
        {/* العنوان الرئيسي */}
        <div className="text-center mb-12 sm:mb-16 animate-fade-in">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 leading-tight">
            <span className="inline-block bg-gradient-to-r from-yellow-600 via-amber-600 to-yellow-700 text-transparent bg-clip-text animate-shine">
              فكرة تملك أشجار النخيل وأشجار الزيتون 💎
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            استثمر في أشجار حقيقية داخل مزارع منتجة معتمدة
          </p>
        </div>

        {/* بطاقات التعريف المزدوجة */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-12 sm:mb-16">
          {/* بطاقة النخيل */}
          <div
            onClick={() => setActiveType('palm')}
            className={`relative overflow-hidden rounded-3xl p-8 sm:p-10 cursor-pointer transition-all duration-500 ${
              activeType === 'palm' ? 'shadow-2xl scale-105' : 'shadow-lg hover:shadow-xl'
            }`}
            style={{
              background: activeType === 'palm'
                ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 50%, #B45309 100%)'
                : 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
              border: activeType === 'palm' ? '3px solid #F59E0B' : '2px solid #FDE68A'
            }}
          >
            {/* Pattern خلفية */}
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)`,
              backgroundSize: '20px 20px'
            }} />

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center ${
                  activeType === 'palm' ? 'bg-white/20' : 'bg-yellow-600/20'
                }`}>
                  <TreePine className={`w-8 h-8 sm:w-10 sm:h-10 ${
                    activeType === 'palm' ? 'text-white' : 'text-yellow-700'
                  }`} />
                </div>
                <h2 className={`text-2xl sm:text-3xl md:text-4xl font-black ${
                  activeType === 'palm' ? 'text-white' : 'text-yellow-800'
                }`}>
                  تملك أشجار النخيل 🌴
                </h2>
              </div>

              <div className={`space-y-3 ${activeType === 'palm' ? 'text-white/95' : 'text-yellow-900'}`}>
                <p className="text-base sm:text-lg leading-relaxed font-medium">
                  استثمر في أشجار نخيل حقيقية داخل مزارعنا الإنتاجية المعتمدة،
                  واحصل على نصيبك السنوي من إنتاجها المسجّل باسمك.
                </p>
                <p className="text-base sm:text-lg font-bold">
                  النخيل يمثل الأصالة والاستثمار طويل الأمد.
                </p>
              </div>

              {activeType === 'palm' && (
                <div className="mt-6 flex items-center gap-2 text-white/90 animate-pulse">
                  <Sparkles className="w-5 h-5" />
                  <span className="text-sm font-bold">محدد حالياً</span>
                </div>
              )}
            </div>
          </div>

          {/* بطاقة الزيتون */}
          <div
            onClick={() => setActiveType('olive')}
            className={`relative overflow-hidden rounded-3xl p-8 sm:p-10 cursor-pointer transition-all duration-500 ${
              activeType === 'olive' ? 'shadow-2xl scale-105' : 'shadow-lg hover:shadow-xl'
            }`}
            style={{
              background: activeType === 'olive'
                ? 'linear-gradient(135deg, #15803D 0%, #166534 50%, #14532D 100%)'
                : 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)',
              border: activeType === 'olive' ? '3px solid #15803D' : '2px solid #A7F3D0'
            }}
          >
            {/* Pattern خلفية */}
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)`,
              backgroundSize: '20px 20px'
            }} />

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center ${
                  activeType === 'olive' ? 'bg-white/20' : 'bg-green-700/20'
                }`}>
                  <Sprout className={`w-8 h-8 sm:w-10 sm:h-10 ${
                    activeType === 'olive' ? 'text-white' : 'text-green-800'
                  }`} />
                </div>
                <h2 className={`text-2xl sm:text-3xl md:text-4xl font-black ${
                  activeType === 'olive' ? 'text-white' : 'text-green-800'
                }`}>
                  تملك أشجار الزيتون 🫒
                </h2>
              </div>

              <div className={`space-y-3 ${activeType === 'olive' ? 'text-white/95' : 'text-green-900'}`}>
                <p className="text-base sm:text-lg leading-relaxed font-medium">
                  امتلك أشجار زيتون مثمرة من أجود الأصناف المنتجة،
                  واحصل على نصيبك من إنتاج الزيت المبارك.
                </p>
                <p className="text-base sm:text-lg font-bold">
                  الزيتون رمز الخير والعائد المستقر.
                </p>
              </div>

              {activeType === 'olive' && (
                <div className="mt-6 flex items-center gap-2 text-white/90 animate-pulse">
                  <Sparkles className="w-5 h-5" />
                  <span className="text-sm font-bold">محدد حالياً</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* قسم لماذا هذا المشروع مميز */}
        <div className="mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-center mb-8 sm:mb-12 text-gray-800">
            لماذا هذا المشروع مميز؟
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* استثماري */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-blue-100">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4">
                <TrendingUp className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">استثماري 💼</h3>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                عوائد سنوية من إنتاج الأشجار المملوكة لك.
              </p>
            </div>

            {/* إنساني */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-red-100">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center mb-4">
                <Heart className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">إنساني ❤️</h3>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                دعم للمزارعين وتنمية للقطاع الزراعي المحلي.
              </p>
            </div>

            {/* بيئي */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-green-100">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-4">
                <Leaf className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">بيئي 🌱</h3>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                المساهمة في زيادة الرقعة الخضراء والحفاظ على البيئة.
              </p>
            </div>
          </div>
        </div>

        {/* النص المحوري التوضيحي */}
        <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 rounded-3xl p-8 sm:p-12 mb-12 border-2 border-amber-200 shadow-xl">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 leading-relaxed mb-4">
              نحن لا نبيع الثمار،
            </p>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-700 leading-relaxed">
              بل نتيح لك <span className="font-black text-amber-700">تملك الأشجار نفسها</span> داخل المزرعة المزروعة فعليًا،
              وكل شجرة موثقة برقـمها التسلسلي داخل النظام.
            </p>
          </div>
        </div>

        {/* الزر الديناميكي الرئيسي */}
        <div className="text-center">
          <button
            onClick={onNavigateToFarms}
            className="group relative inline-flex items-center gap-3 px-10 sm:px-12 md:px-16 py-5 sm:py-6 rounded-2xl font-black text-lg sm:text-xl md:text-2xl transition-all duration-500 transform hover:scale-105 shadow-2xl hover:shadow-3xl overflow-hidden"
            style={{
              background: activeType === 'palm'
                ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 50%, #B45309 100%)'
                : 'linear-gradient(135deg, #15803D 0%, #166534 50%, #14532D 100%)'
            }}
          >
            {/* تأثير الـ glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

            {/* المحتوى */}
            <span className="relative text-white flex items-center gap-3">
              {activeType === 'palm' ? (
                <>
                  <TreePine className="w-6 h-6 sm:w-7 sm:h-7 group-hover:rotate-12 transition-transform" />
                  ابدأ تملك أشجار النخيل الآن 🌴
                </>
              ) : (
                <>
                  <Sprout className="w-6 h-6 sm:w-7 sm:h-7 group-hover:rotate-12 transition-transform" />
                  ابدأ تملك أشجار الزيتون الآن 🫒
                </>
              )}
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 group-hover:-translate-x-2 transition-transform" />
            </span>

            {/* النبض البطيء */}
            <div className="absolute inset-0 rounded-2xl animate-pulse-ring" style={{
              background: activeType === 'palm'
                ? 'radial-gradient(circle, rgba(245, 158, 11, 0.3) 0%, transparent 70%)'
                : 'radial-gradient(circle, rgba(21, 128, 61, 0.3) 0%, transparent 70%)'
            }} />
          </button>

          <p className="mt-6 text-base sm:text-lg text-gray-600 font-medium">
            اكتشف المزارع المتاحة واختر أشجارك الآن
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
          animation: fade-in 1s ease-out;
        }

        @keyframes shine {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .animate-shine {
          background-size: 200% 200%;
          animation: shine 3s ease-in-out infinite;
        }

        @keyframes pulse-ring {
          0%, 100% {
            opacity: 0.5;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.05);
          }
        }

        .animate-pulse-ring {
          animation: pulse-ring 2s ease-in-out infinite;
        }

        .shadow-3xl {
          box-shadow: 0 35px 60px -15px rgba(0, 0, 0, 0.3), 0 0 80px -10px rgba(245, 158, 11, 0.4);
        }

        .hover\:shadow-3xl:hover {
          box-shadow: 0 40px 70px -15px rgba(0, 0, 0, 0.4), 0 0 100px -10px rgba(245, 158, 11, 0.6);
        }
      `}</style>
    </div>
  );
};
