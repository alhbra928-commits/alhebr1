import React, { useState } from 'react';
import { TreePine, Sprout, TrendingUp, Heart, Leaf, ArrowLeft, Sparkles, Shield, Zap, CheckCircle2, Users, BarChart3, Droplets, Gift, Briefcase } from 'lucide-react';

interface IdeaOverviewSectionProps {
  onNavigateToFarms: () => void;
}

type TreeType = 'palm' | 'olive';

export const IdeaOverviewSection: React.FC<IdeaOverviewSectionProps> = ({ onNavigateToFarms }) => {
  const [activeType, setActiveType] = useState<TreeType>('palm');

  return (
    <div className="w-full min-h-screen overflow-x-hidden" style={{
      background: 'linear-gradient(180deg, #FEFEFE 0%, #F9FAFB 50%, #FEFEFE 100%)'
    }}>
      {/* Header Section - Responsive */}
      <div className="relative overflow-hidden pt-12 sm:pt-16 lg:pt-20 pb-8 sm:pb-12 px-4 sm:px-6 lg:px-8">
        {/* Glow Background - Adjusted for mobile */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] sm:w-[1000px] h-[300px] sm:h-[500px] bg-gradient-to-b from-amber-50/40 to-transparent blur-3xl rounded-full pointer-events-none" />

        <div className="relative max-w-6xl mx-auto text-center">
          {/* Top Badge - Responsive */}
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-full bg-white/90 backdrop-blur-sm border border-amber-200 mb-6 sm:mb-8 shadow-sm hover:shadow-md transition-all">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber-500 animate-pulse" />
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-amber-600" />
            <span className="text-xs sm:text-sm font-bold text-gray-700">فرصة استثمارية متميزة</span>
          </div>

          {/* Main Title - Highly Responsive */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black mb-4 sm:mb-6 lg:mb-8 leading-[1.15] tracking-tight px-2">
            <span className="inline-block bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-transparent bg-clip-text">
              امتلك أشجارك الخاصة
            </span>
            <br />
            <span className="text-gray-600 font-bold text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl mt-2 inline-block">من مزارع منتقاة ومعتمدة</span>
          </h1>

          {/* Description - Responsive */}
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-medium px-4">
            استثمر في ملكية أشجار حقيقية واحصل على حرية التصرف الكاملة
          </p>

          {/* Stats Grid - Fully Responsive */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 lg:gap-6 max-w-3xl mx-auto mt-8 sm:mt-12">
            <div className="group bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-3 sm:p-5 lg:p-6 border border-gray-200 hover:border-amber-300 hover:shadow-xl transition-all duration-300">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-amber-600 mb-1 sm:mb-2 group-hover:scale-110 transition-transform">100%</div>
              <div className="text-xs sm:text-sm lg:text-base text-gray-600 font-semibold">ملكية كاملة</div>
            </div>
            <div className="group bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-3 sm:p-5 lg:p-6 border border-gray-200 hover:border-green-300 hover:shadow-xl transition-all duration-300">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-green-600 mb-1 sm:mb-2 group-hover:scale-110 transition-transform">موثق</div>
              <div className="text-xs sm:text-sm lg:text-base text-gray-600 font-semibold">رقم تسلسلي</div>
            </div>
            <div className="group bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-3 sm:p-5 lg:p-6 border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-blue-600 mb-1 sm:mb-2 group-hover:scale-110 transition-transform">حرية</div>
              <div className="text-xs sm:text-sm lg:text-base text-gray-600 font-semibold">تصرف كاملة</div>
            </div>
          </div>
        </div>
      </div>

      {/* Type Selection Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Tabs - Mobile Optimized */}
        <div className="flex justify-center gap-2 sm:gap-4 mb-8 sm:mb-12">
          <button
            onClick={() => setActiveType('palm')}
            className={`group flex items-center gap-2 sm:gap-3 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base lg:text-lg transition-all duration-300 ${
              activeType === 'palm'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-200 scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 hover:border-amber-300'
            }`}
          >
            <TreePine className={`w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 transition-transform ${activeType === 'palm' ? 'rotate-0' : 'group-hover:scale-110'}`} />
            <span className="hidden sm:inline">أشجار النخيل</span>
            <span className="sm:hidden">النخيل</span>
            {activeType === 'palm' && <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />}
          </button>

          <button
            onClick={() => setActiveType('olive')}
            className={`group flex items-center gap-2 sm:gap-3 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base lg:text-lg transition-all duration-300 ${
              activeType === 'olive'
                ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg shadow-green-200 scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 hover:border-green-300'
            }`}
          >
            <Sprout className={`w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 transition-transform ${activeType === 'olive' ? 'rotate-0' : 'group-hover:scale-110'}`} />
            <span className="hidden sm:inline">أشجار الزيتون</span>
            <span className="sm:hidden">الزيتون</span>
            {activeType === 'olive' && <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />}
          </button>
        </div>

        {/* Active Type Content */}
        <div className="relative">
          {/* Palm Trees */}
          {activeType === 'palm' && (
            <div className="animate-fade-in">
              {/* Main Hero Card - Mobile First */}
              <div className="bg-white/95 backdrop-blur-sm rounded-3xl sm:rounded-[32px] p-6 sm:p-10 lg:p-14 border border-gray-200 shadow-xl mb-8 sm:mb-12">
                <div className="flex flex-col items-center gap-6 sm:gap-8 lg:gap-10">
                  {/* Icon - Responsive Size */}
                  <div className="relative flex-shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 to-amber-600/20 rounded-full blur-2xl" />
                    <div className="relative w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-2xl">
                      <TreePine className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 text-white" strokeWidth={2.5} />
                    </div>
                  </div>

                  {/* Content - Centered on Mobile */}
                  <div className="flex-1 text-center">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-4 sm:mb-6 leading-tight">
                      استثمر في أشجار النخيل الأصيلة
                    </h2>
                    <p className="text-base sm:text-lg lg:text-xl text-gray-600 leading-relaxed mb-4 sm:mb-6 font-medium">
                      النخيل رمز الأصالة والعطاء المستمر. امتلك أشجار نخيل حقيقية من مزارع منتقاة ومعتمدة،
                      واحصل على <span className="font-black text-amber-700">عوائد استثمارك في النخيل المملوكة لك كلياً</span> في أرض المزرعة،
                      سواء من بيع الثمار، أو الاستثمار في بيع النخيل، أو الإهداء، أو الوقف الخيري.
                    </p>
                    <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
                      <span className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-amber-50 text-amber-800 text-xs sm:text-sm font-bold border border-amber-200">
                        ملكية موثقة
                      </span>
                      <span className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-amber-50 text-amber-800 text-xs sm:text-sm font-bold border border-amber-200">
                        حرية تصرف
                      </span>
                      <span className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-amber-50 text-amber-800 text-xs sm:text-sm font-bold border border-amber-200">
                        عوائد متعددة
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Olive Trees */}
          {activeType === 'olive' && (
            <div className="animate-fade-in">
              {/* Main Hero Card - Mobile First */}
              <div className="bg-white/95 backdrop-blur-sm rounded-3xl sm:rounded-[32px] p-6 sm:p-10 lg:p-14 border border-gray-200 shadow-xl mb-8 sm:mb-12">
                <div className="flex flex-col items-center gap-6 sm:gap-8 lg:gap-10">
                  {/* Icon - Responsive Size */}
                  <div className="relative flex-shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-green-700/20 rounded-full blur-2xl" />
                    <div className="relative w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 bg-gradient-to-br from-green-600 to-green-800 rounded-full flex items-center justify-center shadow-2xl">
                      <Sprout className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 text-white" strokeWidth={2.5} />
                    </div>
                  </div>

                  {/* Content - Centered on Mobile */}
                  <div className="flex-1 text-center">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-4 sm:mb-6 leading-tight">
                      استثمر في أشجار الزيتون المباركة
                    </h2>
                    <p className="text-base sm:text-lg lg:text-xl text-gray-600 leading-relaxed mb-4 sm:mb-6 font-medium">
                      الزيتون شجرة مباركة وعطاء دائم. امتلك أشجار زيتون مثمرة من مزارع متخصصة ومعتمدة،
                      واحصل على <span className="font-black text-green-700">عوائد استثمارك في الزيتون المملوكة لك كلياً</span> في أرض المزرعة،
                      سواء من بيع الثمار، أو الاستثمار في بيع الزيتون، أو الإهداء، أو الوقف الخيري.
                    </p>
                    <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
                      <span className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-green-50 text-green-800 text-xs sm:text-sm font-bold border border-green-200">
                        ملكية موثقة
                      </span>
                      <span className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-green-50 text-green-800 text-xs sm:text-sm font-bold border border-green-200">
                        حرية تصرف
                      </span>
                      <span className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-green-50 text-green-800 text-xs sm:text-sm font-bold border border-green-200">
                        عوائد متعددة
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Ownership Options - 2x2 Grid on Mobile */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-10 sm:mb-16">
          {/* Sell Fruits */}
          <div className="group bg-white/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-gray-200 hover:border-amber-300 hover:shadow-xl transition-all duration-300">
            <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center mb-3 sm:mb-4 lg:mb-5 group-hover:scale-110 transition-transform shadow-lg mx-auto">
              <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-white" strokeWidth={2.5} />
            </div>
            <h3 className="text-sm sm:text-base lg:text-xl font-black text-gray-900 mb-2 sm:mb-3 text-center">بيع الثمار</h3>
            <p className="text-gray-600 leading-relaxed text-xs sm:text-sm text-center">
              احصل على عوائد سنوية من بيع إنتاج أشجارك
            </p>
          </div>

          {/* Sell Trees */}
          <div className="group bg-white/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300">
            <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-3 sm:mb-4 lg:mb-5 group-hover:scale-110 transition-transform shadow-lg mx-auto">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-white" strokeWidth={2.5} />
            </div>
            <h3 className="text-sm sm:text-base lg:text-xl font-black text-gray-900 mb-2 sm:mb-3 text-center">بيع الأشجار</h3>
            <p className="text-gray-600 leading-relaxed text-xs sm:text-sm text-center">
              استثمر في القيمة المتزايدة لأشجارك وبعها متى شئت
            </p>
          </div>

          {/* Gift */}
          <div className="group bg-white/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-gray-200 hover:border-red-300 hover:shadow-xl transition-all duration-300">
            <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center mb-3 sm:mb-4 lg:mb-5 group-hover:scale-110 transition-transform shadow-lg mx-auto">
              <Gift className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-white" strokeWidth={2.5} />
            </div>
            <h3 className="text-sm sm:text-base lg:text-xl font-black text-gray-900 mb-2 sm:mb-3 text-center">الإهداء</h3>
            <p className="text-gray-600 leading-relaxed text-xs sm:text-sm text-center">
              أهدِ أشجارك لأحبائك كهدية قيّمة ومستدامة
            </p>
          </div>

          {/* Charity */}
          <div className="group bg-white/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-gray-200 hover:border-green-300 hover:shadow-xl transition-all duration-300">
            <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-3 sm:mb-4 lg:mb-5 group-hover:scale-110 transition-transform shadow-lg mx-auto">
              <Heart className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-white" strokeWidth={2.5} />
            </div>
            <h3 className="text-sm sm:text-base lg:text-xl font-black text-gray-900 mb-2 sm:mb-3 text-center">الوقف الخيري</h3>
            <p className="text-gray-600 leading-relaxed text-xs sm:text-sm text-center">
              اجعل أشجارك صدقة جارية بوقفها للخير
            </p>
          </div>
        </div>

        {/* Three Pillars - Stacked on Mobile */}
        <div className="grid md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-10 sm:mb-16">
          {/* Investment */}
          <div className="group bg-gradient-to-br from-blue-50 to-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-blue-100 hover:border-blue-300 hover:shadow-2xl transition-all duration-300">
            <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4 sm:mb-5 lg:mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all shadow-lg">
              <BarChart3 className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" strokeWidth={2.5} />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-3 sm:mb-4">استثماري مستدام</h3>
            <p className="text-gray-600 leading-relaxed mb-4 sm:mb-5 text-base sm:text-lg">
              احصل على عوائد متنوعة من أشجارك المملوكة لك بشكل كامل وموثق
            </p>
            <div className="flex items-center gap-2 text-blue-600 font-bold text-sm sm:text-base">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span>عوائد متعددة ومستدامة</span>
            </div>
          </div>

          {/* Humanitarian */}
          <div className="group bg-gradient-to-br from-red-50 to-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-red-100 hover:border-red-300 hover:shadow-2xl transition-all duration-300">
            <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center mb-4 sm:mb-5 lg:mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all shadow-lg">
              <Users className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" strokeWidth={2.5} />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-3 sm:mb-4">إنساني وأخلاقي</h3>
            <p className="text-gray-600 leading-relaxed mb-4 sm:mb-5 text-base sm:text-lg">
              ساهم في دعم المزارعين وأصحاب المزارع وتنمية القطاع الزراعي بشكل عادل
            </p>
            <div className="flex items-center gap-2 text-red-600 font-bold text-sm sm:text-base">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span>دعم مجتمعي مستدام</span>
            </div>
          </div>

          {/* Environmental */}
          <div className="group bg-gradient-to-br from-green-50 to-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-green-100 hover:border-green-300 hover:shadow-2xl transition-all duration-300">
            <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-4 sm:mb-5 lg:mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all shadow-lg">
              <Droplets className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" strokeWidth={2.5} />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-3 sm:mb-4">بيئي ومستدام</h3>
            <p className="text-gray-600 leading-relaxed mb-4 sm:mb-5 text-base sm:text-lg">
              ساهم في زيادة الرقعة الخضراء والحفاظ على البيئة للأجيال القادمة
            </p>
            <div className="flex items-center gap-2 text-green-600 font-bold text-sm sm:text-base">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span>حماية بيئية فعّالة</span>
            </div>
          </div>
        </div>

        {/* How It Works - Responsive Grid */}
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl sm:rounded-[32px] p-6 sm:p-10 lg:p-16 mb-10 sm:mb-16 border border-gray-200">
          <div className="text-center mb-8 sm:mb-12 lg:mb-14">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white border border-gray-200 mb-4 sm:mb-6">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-xs sm:text-sm font-bold text-gray-700">خطوات بسيطة</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-2 sm:mb-4">
              كيف يعمل النظام؟
            </h2>
            <p className="text-gray-600 text-base sm:text-lg lg:text-xl font-medium">عملية واضحة وشفافة من البداية للنهاية</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {/* Step 1 */}
            <div className="relative group">
              <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 text-center shadow-lg border border-amber-200 hover:border-amber-400 hover:shadow-2xl transition-all duration-300">
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-white font-black text-xl sm:text-2xl flex items-center justify-center mx-auto mb-4 sm:mb-5 lg:mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all shadow-lg">
                  1
                </div>
                <h4 className="font-black text-gray-900 text-base sm:text-lg mb-2 sm:mb-3">اختر النوع</h4>
                <p className="text-gray-600 leading-relaxed text-xs sm:text-sm">نخيل أو زيتون أو كلاهما</p>
              </div>
              <div className="hidden lg:block absolute top-1/2 left-full w-8 h-0.5 bg-gradient-to-r from-amber-300 to-transparent -translate-y-1/2" />
            </div>

            {/* Step 2 */}
            <div className="relative group">
              <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 text-center shadow-lg border border-blue-200 hover:border-blue-400 hover:shadow-2xl transition-all duration-300">
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white font-black text-xl sm:text-2xl flex items-center justify-center mx-auto mb-4 sm:mb-5 lg:mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all shadow-lg">
                  2
                </div>
                <h4 className="font-black text-gray-900 text-base sm:text-lg mb-2 sm:mb-3">حدد الكمية</h4>
                <p className="text-gray-600 leading-relaxed text-xs sm:text-sm">اختر العدد المناسب لك</p>
              </div>
              <div className="hidden lg:block absolute top-1/2 left-full w-8 h-0.5 bg-gradient-to-r from-blue-300 to-transparent -translate-y-1/2" />
            </div>

            {/* Step 3 */}
            <div className="relative group">
              <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 text-center shadow-lg border border-green-200 hover:border-green-400 hover:shadow-2xl transition-all duration-300">
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-green-500 to-green-600 text-white font-black text-xl sm:text-2xl flex items-center justify-center mx-auto mb-4 sm:mb-5 lg:mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all shadow-lg">
                  3
                </div>
                <h4 className="font-black text-gray-900 text-base sm:text-lg mb-2 sm:mb-3">وثق ملكيتك</h4>
                <p className="text-gray-600 leading-relaxed text-xs sm:text-sm">شهادة ملكية رسمية موثقة</p>
              </div>
              <div className="hidden lg:block absolute top-1/2 left-full w-8 h-0.5 bg-gradient-to-r from-green-300 to-transparent -translate-y-1/2" />
            </div>

            {/* Step 4 */}
            <div className="group">
              <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 text-center shadow-lg border border-purple-200 hover:border-purple-400 hover:shadow-2xl transition-all duration-300">
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 text-white font-black text-xl sm:text-2xl flex items-center justify-center mx-auto mb-4 sm:mb-5 lg:mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all shadow-lg">
                  4
                </div>
                <h4 className="font-black text-gray-900 text-base sm:text-lg mb-2 sm:mb-3">تمتع بالحرية</h4>
                <p className="text-gray-600 leading-relaxed text-xs sm:text-sm">تصرف بملكيتك بحرية تامة</p>
              </div>
            </div>
          </div>
        </div>

        {/* Central Explanation - Mobile Optimized */}
        <div className="relative bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-50 rounded-3xl sm:rounded-[32px] p-6 sm:p-10 lg:p-16 mb-10 sm:mb-16 border border-amber-200 shadow-2xl overflow-hidden">
          {/* Pattern Background */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `radial-gradient(circle, #D97706 2px, transparent 2px)`,
            backgroundSize: '40px 40px'
          }} />

          <div className="relative max-w-5xl mx-auto text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center mx-auto mb-5 sm:mb-6 lg:mb-8 shadow-2xl">
              <Shield className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white" strokeWidth={2.5} />
            </div>

            <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-gray-900 mb-5 sm:mb-6 lg:mb-8 leading-tight px-2">
              ملكية حقيقية بتوثيق رسمي وحرية تصرف كاملة
            </h3>

            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-700 leading-relaxed mb-6 sm:mb-8 lg:mb-10 font-medium px-2">
              كل شجرة موثقة <span className="font-black text-amber-700">برقم تسلسلي فريد</span> داخل المنصة،
              وموقعها محدد بدقة في أرض المزرعة المعتمدة. أنت <span className="font-black text-amber-700">مالك فعلي</span> لأشجار حقيقية منتجة
              مع حرية التصرف الكاملة.
            </p>

            <div className="flex flex-wrap gap-2 sm:gap-3 lg:gap-4 justify-center">
              <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 lg:py-3 rounded-xl sm:rounded-2xl bg-white border border-amber-200 shadow-md hover:shadow-lg transition-shadow">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-600 flex-shrink-0" />
                <span className="font-black text-gray-900 text-xs sm:text-sm lg:text-base">ملكية قانونية</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 lg:py-3 rounded-xl sm:rounded-2xl bg-white border border-amber-200 shadow-md hover:shadow-lg transition-shadow">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-600 flex-shrink-0" />
                <span className="font-black text-gray-900 text-xs sm:text-sm lg:text-base">توثيق رسمي</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 lg:py-3 rounded-xl sm:rounded-2xl bg-white border border-amber-200 shadow-md hover:shadow-lg transition-shadow">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-amber-600 flex-shrink-0" />
                <span className="font-black text-gray-900 text-xs sm:text-sm lg:text-base">حرية تصرف</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main CTA - Mobile First */}
        <div className="text-center px-4">
          <button
            onClick={onNavigateToFarms}
            className={`group relative inline-flex items-center justify-center gap-3 sm:gap-4 lg:gap-5 px-6 sm:px-10 lg:px-16 py-4 sm:py-5 lg:py-7 rounded-2xl sm:rounded-3xl font-black text-base sm:text-xl md:text-2xl lg:text-3xl transition-all duration-500 transform hover:scale-105 shadow-2xl hover:shadow-3xl overflow-hidden w-full sm:w-auto ${
              activeType === 'palm'
                ? 'bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 text-white'
                : 'bg-gradient-to-r from-green-600 via-green-700 to-green-600 text-white'
            }`}
          >
            {/* Shimmer Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

            {/* Content */}
            <span className="relative flex items-center gap-3 sm:gap-4 lg:gap-5">
              {activeType === 'palm' ? (
                <>
                  <TreePine className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 group-hover:rotate-12 transition-transform flex-shrink-0" strokeWidth={2.5} />
                  <span className="hidden sm:inline">ابدأ تملك أشجار النخيل الآن</span>
                  <span className="sm:hidden">ابدأ التملك الآن</span>
                </>
              ) : (
                <>
                  <Sprout className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 group-hover:rotate-12 transition-transform flex-shrink-0" strokeWidth={2.5} />
                  <span className="hidden sm:inline">ابدأ تملك أشجار الزيتون الآن</span>
                  <span className="sm:hidden">ابدأ التملك الآن</span>
                </>
              )}
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 lg:w-7 lg:h-7 group-hover:-translate-x-2 transition-transform flex-shrink-0" strokeWidth={2.5} />
            </span>
          </button>

          <p className="mt-5 sm:mt-6 lg:mt-8 text-gray-600 font-semibold text-sm sm:text-base lg:text-lg px-2">
            استعرض المزارع المتاحة واختر أشجارك الآن بكل سهولة
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .shadow-3xl {
          box-shadow: 0 40px 80px -20px rgba(0, 0, 0, 0.25);
        }

        @media (max-width: 640px) {
          .shadow-3xl {
            box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.2);
          }
        }
      `}</style>
    </div>
  );
};
