import React, { useState } from 'react';
import { TreePine, Sprout, TrendingUp, Heart, Leaf, ArrowLeft, Sparkles, Shield, Zap, CheckCircle2, Users, BarChart3, Droplets } from 'lucide-react';

interface IdeaOverviewSectionProps {
  onNavigateToFarms: () => void;
}

type TreeType = 'palm' | 'olive';

export const IdeaOverviewSection: React.FC<IdeaOverviewSectionProps> = ({ onNavigateToFarms }) => {
  const [activeType, setActiveType] = useState<TreeType>('palm');

  return (
    <div className="w-full min-h-screen" style={{
      background: 'linear-gradient(180deg, #FDFCFB 0%, #F5F3EF 50%, #FDFCFB 100%)'
    }}>
      {/* Header القسم */}
      <div className="relative overflow-hidden pt-12 pb-8 px-4 sm:px-6 lg:px-8">
        {/* خلفية متوهجة */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-amber-100/40 to-transparent blur-3xl rounded-full" />

        <div className="relative max-w-5xl mx-auto text-center">
          {/* Badge العلوي */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200/50 mb-6 shadow-sm">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-bold text-amber-800">فرصة استثمارية فريدة</span>
          </div>

          {/* العنوان الرئيسي */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 leading-tight">
            <span className="inline-block bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 text-transparent bg-clip-text">
              امتلك أشجارك الخاصة
            </span>
            <br />
            <span className="text-gray-800">من مزارع منتقاة ومعتمدة</span>
          </h1>

          {/* الوصف */}
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            استثمر في الطبيعة واحصل على عوائد سنوية ثابتة من أشجار مملوكة لك بالكامل
          </p>

          {/* إحصائيات سريعة */}
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mt-10">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 shadow-sm">
              <div className="text-2xl sm:text-3xl font-black text-amber-600 mb-1">100%</div>
              <div className="text-xs sm:text-sm text-gray-600 font-medium">ملكية كاملة</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 shadow-sm">
              <div className="text-2xl sm:text-3xl font-black text-green-600 mb-1">موثق</div>
              <div className="text-xs sm:text-sm text-gray-600 font-medium">رقم تسلسلي</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 shadow-sm">
              <div className="text-2xl sm:text-3xl font-black text-blue-600 mb-1">سنوي</div>
              <div className="text-xs sm:text-sm text-gray-600 font-medium">عوائد ثابتة</div>
            </div>
          </div>
        </div>
      </div>

      {/* قسم اختيار النوع */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex justify-center gap-3 mb-8">
          <button
            onClick={() => setActiveType('palm')}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-base transition-all duration-300 ${
              activeType === 'palm'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg scale-105'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <TreePine className="w-5 h-5" />
            <span>أشجار النخيل</span>
            {activeType === 'palm' && <CheckCircle2 className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setActiveType('olive')}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-base transition-all duration-300 ${
              activeType === 'olive'
                ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg scale-105'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <Sprout className="w-5 h-5" />
            <span>أشجار الزيتون</span>
            {activeType === 'olive' && <CheckCircle2 className="w-4 h-4" />}
          </button>
        </div>

        {/* محتوى النوع المختار */}
        <div className="relative">
          {/* النخيل */}
          {activeType === 'palm' && (
            <div className="animate-fade-in">
              {/* البطاقة الرئيسية */}
              <div className="bg-gradient-to-br from-amber-50 via-white to-yellow-50 rounded-3xl p-8 sm:p-12 border-2 border-amber-200/50 shadow-xl mb-8">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  {/* الأيقونة */}
                  <div className="relative flex-shrink-0">
                    <div className="absolute inset-0 bg-amber-400/30 rounded-full blur-2xl animate-pulse-slow" />
                    <div className="relative w-32 h-32 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-2xl">
                      <TreePine className="w-16 h-16 text-white" />
                    </div>
                  </div>

                  {/* المحتوى */}
                  <div className="flex-1 text-center md:text-right">
                    <h2 className="text-3xl sm:text-4xl font-black text-amber-800 mb-4">
                      استثمر في أشجار النخيل الأصيلة
                    </h2>
                    <p className="text-lg text-gray-700 leading-relaxed mb-4">
                      النخيل رمز الأصالة والعطاء المستمر. امتلك أشجار نخيل حقيقية من مزارع منتقاة ومعتمدة،
                      واحصل على حصتك السنوية من إنتاج التمور الفاخرة المسجّلة باسمك رسمياً.
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                      <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-sm font-bold">
                        إنتاج سنوي مضمون
                      </span>
                      <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-sm font-bold">
                        استثمار طويل الأمد
                      </span>
                      <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-sm font-bold">
                        ملكية موثقة
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* الزيتون */}
          {activeType === 'olive' && (
            <div className="animate-fade-in">
              {/* البطاقة الرئيسية */}
              <div className="bg-gradient-to-br from-green-50 via-white to-emerald-50 rounded-3xl p-8 sm:p-12 border-2 border-green-200/50 shadow-xl mb-8">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  {/* الأيقونة */}
                  <div className="relative flex-shrink-0">
                    <div className="absolute inset-0 bg-green-400/30 rounded-full blur-2xl animate-pulse-slow" />
                    <div className="relative w-32 h-32 bg-gradient-to-br from-green-600 to-green-800 rounded-full flex items-center justify-center shadow-2xl">
                      <Sprout className="w-16 h-16 text-white" />
                    </div>
                  </div>

                  {/* المحتوى */}
                  <div className="flex-1 text-center md:text-right">
                    <h2 className="text-3xl sm:text-4xl font-black text-green-800 mb-4">
                      استثمر في أشجار الزيتون المباركة
                    </h2>
                    <p className="text-lg text-gray-700 leading-relaxed mb-4">
                      الزيتون شجرة مباركة وعطاء دائم. امتلك أشجار زيتون مثمرة من مزارع متخصصة ومعتمدة،
                      واحصل على حصتك من إنتاج زيت الزيتون الطبيعي المسجّل باسمك رسمياً.
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                      <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-bold">
                        زيت طبيعي 100%
                      </span>
                      <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-bold">
                        عوائد مستقرة
                      </span>
                      <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-bold">
                        فوائد صحية
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* المميزات الثلاثية */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* استثماري */}
          <div className="group bg-white rounded-2xl p-6 border border-gray-200/50 hover:border-blue-300 hover:shadow-xl transition-all duration-300">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-black text-gray-800 mb-3">استثماري مستدام</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              احصل على عوائد سنوية ثابتة من إنتاج أشجارك المملوكة لك بشكل كامل وموثق
            </p>
            <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
              <BarChart3 className="w-4 h-4" />
              <span>عائد استثماري مستدام</span>
            </div>
          </div>

          {/* إنساني */}
          <div className="group bg-white rounded-2xl p-6 border border-gray-200/50 hover:border-red-300 hover:shadow-xl transition-all duration-300">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Heart className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-black text-gray-800 mb-3">إنساني وأخلاقي</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              ساهم في دعم المزارعين وأصحاب المزارع وتنمية القطاع الزراعي بشكل عادل ومستدام
            </p>
            <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
              <Users className="w-4 h-4" />
              <span>دعم المجتمعات الزراعية</span>
            </div>
          </div>

          {/* بيئي */}
          <div className="group bg-white rounded-2xl p-6 border border-gray-200/50 hover:border-green-300 hover:shadow-xl transition-all duration-300">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Leaf className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-black text-gray-800 mb-3">بيئي ومستدام</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              ساهم في زيادة الرقعة الخضراء والحفاظ على البيئة للأجيال القادمة
            </p>
            <div className="flex items-center gap-2 text-green-600 font-bold text-sm">
              <Droplets className="w-4 h-4" />
              <span>حماية البيئة والطبيعة</span>
            </div>
          </div>
        </div>

        {/* قسم كيف يعمل */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-3xl p-8 sm:p-12 mb-12">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-800 mb-3">
              كيف يعمل النظام؟
            </h2>
            <p className="text-gray-600 text-lg">عملية بسيطة وشفافة من البداية للنهاية</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {/* الخطوة 1 */}
            <div className="relative">
              <div className="bg-white rounded-2xl p-6 text-center shadow-lg border-2 border-amber-200">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 text-white font-black text-xl flex items-center justify-center mx-auto mb-4">
                  1
                </div>
                <h4 className="font-black text-gray-800 mb-2">اختر النوع</h4>
                <p className="text-sm text-gray-600">نخيل أو زيتون أو كلاهما</p>
              </div>
              <div className="hidden md:block absolute top-1/2 left-full w-6 h-0.5 bg-gradient-to-r from-amber-300 to-transparent -translate-y-1/2" />
            </div>

            {/* الخطوة 2 */}
            <div className="relative">
              <div className="bg-white rounded-2xl p-6 text-center shadow-lg border-2 border-blue-200">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white font-black text-xl flex items-center justify-center mx-auto mb-4">
                  2
                </div>
                <h4 className="font-black text-gray-800 mb-2">حدد الكمية</h4>
                <p className="text-sm text-gray-600">اختر عدد الأشجار المناسب لك</p>
              </div>
              <div className="hidden md:block absolute top-1/2 left-full w-6 h-0.5 bg-gradient-to-r from-blue-300 to-transparent -translate-y-1/2" />
            </div>

            {/* الخطوة 3 */}
            <div className="relative">
              <div className="bg-white rounded-2xl p-6 text-center shadow-lg border-2 border-green-200">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 text-white font-black text-xl flex items-center justify-center mx-auto mb-4">
                  3
                </div>
                <h4 className="font-black text-gray-800 mb-2">وثق ملكيتك</h4>
                <p className="text-sm text-gray-600">احصل على شهادة ملكية رسمية</p>
              </div>
              <div className="hidden md:block absolute top-1/2 left-full w-6 h-0.5 bg-gradient-to-r from-green-300 to-transparent -translate-y-1/2" />
            </div>

            {/* الخطوة 4 */}
            <div className="bg-white rounded-2xl p-6 text-center shadow-lg border-2 border-purple-200">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-white font-black text-xl flex items-center justify-center mx-auto mb-4">
                4
              </div>
              <h4 className="font-black text-gray-800 mb-2">استلم حصتك</h4>
              <p className="text-sm text-gray-600">حصتك السنوية من الإنتاج</p>
            </div>
          </div>
        </div>

        {/* النص التوضيحي المحوري */}
        <div className="relative bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 rounded-3xl p-10 sm:p-14 mb-12 border-2 border-amber-200 shadow-2xl overflow-hidden">
          {/* Pattern خلفية */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: `radial-gradient(circle, #D97706 1px, transparent 1px)`,
            backgroundSize: '30px 30px'
          }} />

          <div className="relative max-w-4xl mx-auto text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Shield className="w-10 h-10 text-white" />
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-gray-800 mb-6 leading-tight">
              نحن لا نبيع الثمار، بل نتيح لك تملك الأشجار نفسها
            </h3>

            <p className="text-lg sm:text-xl text-gray-700 leading-relaxed mb-8">
              كل شجرة موثقة <span className="font-black text-amber-700">برقم تسلسلي فريد</span> داخل المنصة،
              وموقعها محدد بدقة في المزرعة المعتمدة. أنت لست مشتركاً، بل <span className="font-black text-amber-700">مالك فعلي</span> لأشجار حقيقية منتجة.
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm shadow-md">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="font-bold text-gray-800">ملكية قانونية</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm shadow-md">
                <Shield className="w-5 h-5 text-blue-600" />
                <span className="font-bold text-gray-800">موثق رسمياً</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm shadow-md">
                <Zap className="w-5 h-5 text-amber-600" />
                <span className="font-bold text-gray-800">عوائد مضمونة</span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA الرئيسي */}
        <div className="text-center">
          <button
            onClick={onNavigateToFarms}
            className={`group relative inline-flex items-center gap-4 px-10 sm:px-14 py-5 sm:py-6 rounded-2xl font-black text-xl sm:text-2xl transition-all duration-500 transform hover:scale-105 shadow-2xl hover:shadow-3xl overflow-hidden ${
              activeType === 'palm'
                ? 'bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 text-white'
                : 'bg-gradient-to-r from-green-600 via-green-700 to-green-600 text-white'
            }`}
          >
            {/* تأثير glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

            {/* المحتوى */}
            <span className="relative flex items-center gap-4">
              {activeType === 'palm' ? (
                <>
                  <TreePine className="w-7 h-7 group-hover:rotate-12 transition-transform" />
                  ابدأ تملك أشجار النخيل الآن
                </>
              ) : (
                <>
                  <Sprout className="w-7 h-7 group-hover:rotate-12 transition-transform" />
                  ابدأ تملك أشجار الزيتون الآن
                </>
              )}
              <ArrowLeft className="w-6 h-6 group-hover:-translate-x-2 transition-transform" />
            </span>
          </button>

          <p className="mt-6 text-gray-600 font-medium">
            استعرض المزارع المتاحة واختر أشجارك الآن بكل سهولة
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
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
          animation: fade-in 0.5s ease-out;
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.6;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.1);
          }
        }

        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }

        .shadow-3xl {
          box-shadow: 0 35px 60px -15px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>
  );
};
