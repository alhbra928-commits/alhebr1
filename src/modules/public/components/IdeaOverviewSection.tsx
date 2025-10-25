import React, { useState, useEffect } from 'react';
import { TreePine, Sprout, TrendingUp, Heart, ArrowLeft, Sparkles, Shield, Zap, CheckCircle2, Users, BarChart3, Droplets, Gift, Briefcase, Award, Crown, Star, Gem, ChevronDown } from 'lucide-react';

interface IdeaOverviewSectionProps {
  onNavigateToFarms: () => void;
}

type TreeType = 'palm' | 'olive';

export const IdeaOverviewSection: React.FC<IdeaOverviewSectionProps> = ({ onNavigateToFarms }) => {
  const [activeType, setActiveType] = useState<TreeType>('palm');
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="w-full min-h-screen overflow-x-hidden relative" style={{
      background: 'linear-gradient(135deg, #FDFBF7 0%, #FFFEF9 25%, #F8F6F0 50%, #FFFEF9 75%, #FDFBF7 100%)'
    }}>
      {/* Enhanced Animated Particles Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-amber-200/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-yellow-200/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-40 left-1/3 w-80 h-80 bg-orange-200/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-amber-300/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-yellow-300/10 rounded-full blur-3xl animate-float-delayed" />

        {/* Sparkle Effects */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-amber-400 rounded-full animate-sparkle" />
        <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-yellow-400 rounded-full animate-sparkle" style={{ animationDelay: '0.5s' }} />
        <div className="absolute bottom-1/3 left-1/2 w-2 h-2 bg-orange-400 rounded-full animate-sparkle" style={{ animationDelay: '1s' }} />
      </div>

      {/* Premium Header Section */}
      <div className="relative pt-16 sm:pt-20 lg:pt-24 pb-12 sm:pb-16 lg:pb-20 px-4 sm:px-6 lg:px-8">
        <div className="relative max-w-7xl mx-auto">
          {/* Ultra Luxury Badge with Animation */}
          <div className="flex justify-center mb-8 sm:mb-10">
            <div className="group relative inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 border-2 border-amber-200/50 shadow-2xl hover:shadow-amber-200/50 transition-all duration-500 hover:scale-105 animate-float">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400/20 to-yellow-400/20 blur-xl group-hover:blur-2xl transition-all" />
              <Crown className="w-5 h-5 text-amber-600 animate-pulse relative z-10" />
              <span className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-700 to-yellow-700 relative z-10">فرصة استثمارية فاخرة</span>
              <Gem className="w-4 h-4 text-amber-500 relative z-10 animate-spin-slow" />
              <Star className="w-4 h-4 text-yellow-500 relative z-10 animate-pulse" />
            </div>
          </div>

          {/* Majestic Title with Enhanced Effects */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="relative inline-block mb-6">
              <span
                className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black mb-4 sm:mb-6 leading-[1.1] tracking-tight"
                style={{
                  transform: `translateY(${scrollY * 0.05}px)`,
                  transition: 'transform 0.1s ease-out'
                }}
              >
                <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-br from-gray-900 via-amber-900 to-gray-900 drop-shadow-lg animate-gradient">
                  امتلك أشجارك
                </span>
                <br />
                <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-br from-amber-800 via-yellow-700 to-amber-800 drop-shadow-lg animate-gradient mt-2">
                  من النخيل والزيتون
                </span>
              </span>
              <div className="absolute -inset-x-4 -inset-y-2 bg-gradient-to-r from-transparent via-amber-100/40 to-transparent blur-2xl -z-10 animate-pulse-slow" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent blur-sm" />
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-700 via-yellow-600 to-amber-700 mb-12 sm:mb-16 animate-gradient">
              من مزارع منتقاة ومعتمدة
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

        {/* Elegant Type Selection */}
        <div className="flex justify-center gap-4 sm:gap-6 mb-12 sm:mb-16">
          {[
            { type: 'palm', icon: TreePine, label: 'النخيل', fullLabel: 'أشجار النخيل', gradient: 'from-amber-500 via-yellow-500 to-amber-600', shadowColor: 'amber' },
            { type: 'olive', icon: Sprout, label: 'الزيتون', fullLabel: 'أشجار الزيتون', gradient: 'from-green-500 via-emerald-500 to-green-600', shadowColor: 'green' }
          ].map((tab) => (
            <button
              key={tab.type}
              onClick={() => setActiveType(tab.type as TreeType)}
              className={`group relative overflow-hidden px-6 sm:px-10 py-4 sm:py-5 rounded-2xl sm:rounded-3xl font-black text-base sm:text-lg lg:text-xl transition-all duration-500 ${
                activeType === tab.type
                  ? `bg-gradient-to-r ${tab.gradient} text-white shadow-2xl shadow-${tab.shadowColor}-400/50 scale-110`
                  : 'bg-white/90 backdrop-blur-lg text-gray-700 border-2 border-gray-200 hover:border-amber-300 hover:scale-105 hover:shadow-xl'
              }`}
            >
              {activeType === tab.type && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                  <div className="absolute inset-0 bg-white/10 animate-pulse-fast" />
                </>
              )}
              <span className="relative flex items-center gap-3">
                <tab.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${activeType === tab.type ? 'animate-bounce-gentle' : 'group-hover:scale-110'} transition-transform`} strokeWidth={2.5} />
                <span className="hidden sm:inline">{tab.fullLabel}</span>
                <span className="sm:hidden">{tab.label}</span>
                {activeType === tab.type && <CheckCircle2 className="w-5 h-5 animate-pulse" />}
              </span>
            </button>
          ))}
        </div>

        {/* Premium Content Card with Enhanced Effects */}
        <div className="relative mb-12 sm:mb-20">
          {activeType === 'palm' && (
            <div className="animate-fade-in">
              <div className="relative bg-gradient-to-br from-white via-amber-50/30 to-white rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-12 lg:p-16 border-2 border-amber-200/50 shadow-2xl overflow-hidden group hover:shadow-amber-300/50 transition-all duration-700">
                {/* Enhanced Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-200/30 to-transparent rounded-full blur-3xl group-hover:blur-2xl transition-all" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-yellow-200/30 to-transparent rounded-full blur-3xl group-hover:blur-2xl transition-all" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-amber-100/20 to-transparent rounded-full blur-3xl animate-pulse-slow" />

                <div className="relative flex flex-col items-center gap-8 sm:gap-10">
                  {/* Ultra Luxury Icon */}
                  <div className="relative group/icon">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-600 rounded-full blur-3xl opacity-40 animate-pulse-slow" />
                    <div className="relative w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 rounded-full bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-600 flex items-center justify-center shadow-2xl ring-8 ring-white/60 group-hover/icon:ring-amber-200/80 transition-all duration-500 group-hover/icon:scale-110">
                      <TreePine className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 text-white group-hover/icon:rotate-12 transition-transform duration-500" strokeWidth={2.5} />
                    </div>
                    <div className="absolute -top-2 -right-2 w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-xl ring-4 ring-white/60 animate-bounce-gentle">
                      <Crown className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                    </div>
                    <div className="absolute -bottom-2 -left-2 w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center shadow-xl ring-4 ring-white/60 animate-spin-slow">
                      <Gem className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  {/* Premium Content */}
                  <div className="text-center max-w-4xl">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black mb-6 sm:mb-8 leading-tight">
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-700 via-yellow-600 to-amber-700 animate-gradient">
                        استثمر في أشجار النخيل الأصيلة
                      </span>
                    </h2>

                    <p className="text-lg sm:text-xl lg:text-2xl text-gray-700 leading-relaxed mb-8 font-medium">
                      النخيل رمز <span className="font-black text-amber-700">الأصالة والعطاء المستمر</span>. امتلك أشجار نخيل حقيقية من مزارع منتقاة ومعتمدة،
                      واحصل على <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">عوائد استثمارك في النخيل المملوكة لك كلياً</span> في أرض المزرعة،
                      سواء من بيع الثمار، أو الاستثمار في بيع النخيل، أو الإهداء، أو الوقف الخيري.
                      <span className="block mt-4 font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">✨ المنصة تتولى الإدارة التشغيلية والصيانة بالكامل</span> - أنت تملك وتستفيد ونحن نعتني بكل شيء.
                    </p>

                    <div className="flex flex-wrap gap-3 justify-center">
                      {['ملكية موثقة', 'حرية تصرف', 'عوائد متعددة'].map((badge, idx) => (
                        <div
                          key={idx}
                          className="px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-100 to-yellow-100 border-2 border-amber-300 text-amber-900 text-sm sm:text-base font-black shadow-lg hover:scale-110 hover:shadow-xl transition-all duration-300 hover:rotate-3"
                          style={{ animationDelay: `${idx * 0.1}s` }}
                        >
                          {badge}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeType === 'olive' && (
            <div className="animate-fade-in">
              <div className="relative bg-gradient-to-br from-white via-green-50/30 to-white rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-12 lg:p-16 border-2 border-green-200/50 shadow-2xl overflow-hidden group hover:shadow-green-300/50 transition-all duration-700">
                {/* Enhanced Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-200/30 to-transparent rounded-full blur-3xl group-hover:blur-2xl transition-all" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-emerald-200/30 to-transparent rounded-full blur-3xl group-hover:blur-2xl transition-all" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-green-100/20 to-transparent rounded-full blur-3xl animate-pulse-slow" />

                <div className="relative flex flex-col items-center gap-8 sm:gap-10">
                  {/* Ultra Luxury Icon */}
                  <div className="relative group/icon">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full blur-3xl opacity-40 animate-pulse-slow" />
                    <div className="relative w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 rounded-full bg-gradient-to-br from-green-500 via-emerald-500 to-green-700 flex items-center justify-center shadow-2xl ring-8 ring-white/60 group-hover/icon:ring-green-200/80 transition-all duration-500 group-hover/icon:scale-110">
                      <Sprout className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 text-white group-hover/icon:rotate-12 transition-transform duration-500" strokeWidth={2.5} />
                    </div>
                    <div className="absolute -top-2 -right-2 w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center shadow-xl ring-4 ring-white/60 animate-bounce-gentle">
                      <Crown className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                    </div>
                    <div className="absolute -bottom-2 -left-2 w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-xl ring-4 ring-white/60 animate-spin-slow">
                      <Gem className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  {/* Premium Content */}
                  <div className="text-center max-w-4xl">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black mb-6 sm:mb-8 leading-tight">
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-700 via-emerald-600 to-green-700 animate-gradient">
                        استثمر في أشجار الزيتون المباركة
                      </span>
                    </h2>

                    <p className="text-lg sm:text-xl lg:text-2xl text-gray-700 leading-relaxed mb-8 font-medium">
                      الزيتون شجرة <span className="font-black text-green-700">مباركة وعطاء دائم</span>. امتلك أشجار زيتون مثمرة من مزارع متخصصة ومعتمدة،
                      واحصل على <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">عوائد استثمارك في الزيتون المملوكة لك كلياً</span> في أرض المزرعة،
                      سواء من بيع الثمار، أو الاستثمار في بيع الزيتون، أو الإهداء، أو الوقف الخيري.
                      <span className="block mt-4 font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">✨ المنصة تتولى الإدارة التشغيلية والصيانة بالكامل</span> - أنت تملك وتستفيد ونحن نعتني بكل شيء.
                    </p>

                    <div className="flex flex-wrap gap-3 justify-center">
                      {['ملكية موثقة', 'حرية تصرف', 'عوائد متعددة'].map((badge, idx) => (
                        <div
                          key={idx}
                          className="px-5 py-2.5 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-300 text-green-900 text-sm sm:text-base font-black shadow-lg hover:scale-110 hover:shadow-xl transition-all duration-300 hover:rotate-3"
                          style={{ animationDelay: `${idx * 0.1}s` }}
                        >
                          {badge}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Central Trust Message - Ultra Premium */}
        <div className="relative bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-50 rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-12 lg:p-16 mb-16 sm:mb-24 border-2 border-amber-200/50 shadow-2xl overflow-hidden group hover:shadow-amber-300/50 transition-all duration-700">
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 30m-25 0a25 25 0 1 0 50 0a25 25 0 1 0 -50 0' fill='none' stroke='%23D97706' stroke-width='2'/%3E%3C/svg%3E")`
          }} />
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-200/20 to-transparent rounded-full blur-3xl group-hover:blur-2xl transition-all" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-yellow-200/20 to-transparent rounded-full blur-3xl group-hover:blur-2xl transition-all" />

          <div className="relative text-center max-w-5xl mx-auto">
            <div className="inline-flex w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-3xl bg-gradient-to-br from-amber-500 via-yellow-500 to-orange-600 items-center justify-center mx-auto mb-8 shadow-2xl ring-8 ring-white/60 group-hover:ring-amber-200/80 group-hover:scale-110 transition-all duration-500">
              <Shield className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 text-white group-hover:rotate-12 transition-transform duration-500" strokeWidth={2.5} />
            </div>

            <h3 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black mb-6 sm:mb-8 leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-amber-800 to-gray-900 animate-gradient">
                ملكية حقيقية بتوثيق رسمي وحرية تصرف كاملة
              </span>
            </h3>

            <p className="text-lg sm:text-xl lg:text-2xl text-gray-700 leading-relaxed mb-8 sm:mb-10 font-medium">
              كل شجرة موثقة <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">برقم تسلسلي فريد</span> داخل المنصة،
              وموقعها محدد بدقة في أرض المزرعة المعتمدة. أنت <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">مالك فعلي</span> لأشجار حقيقية منتجة
              مع حرية التصرف الكاملة.
            </p>

            <div className="flex flex-wrap gap-3 sm:gap-4 justify-center">
              {[
                { icon: CheckCircle2, text: 'ملكية قانونية', color: 'green', gradient: 'from-green-500 to-emerald-600' },
                { icon: Shield, text: 'توثيق رسمي', color: 'blue', gradient: 'from-blue-500 to-cyan-600' },
                { icon: Zap, text: 'حرية تصرف', color: 'amber', gradient: 'from-amber-500 to-orange-600' }
              ].map((item, idx) => (
                <div
                  key={idx}
                  className={`group/badge flex items-center gap-2 sm:gap-3 px-5 sm:px-6 py-3 sm:py-3.5 rounded-2xl bg-white/95 backdrop-blur-lg border-2 border-amber-200 shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 hover:-translate-y-1`}
                >
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center group-hover/badge:rotate-12 group-hover/badge:scale-110 transition-all duration-300`}>
                    <item.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <span className="font-black text-gray-900 text-sm sm:text-base">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Enhanced Icons Grid - 4 + 3 Layout */}
        <div className="mb-16 sm:mb-24 space-y-6 sm:space-y-8">
          {/* First Row - 4 Items */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { icon: Briefcase, title: 'بيع الثمار', desc: 'احصل على عوائد سنوية من بيع إنتاج أشجارك', gradient: 'from-amber-500 via-yellow-500 to-orange-600', delay: '0s' },
              { icon: TrendingUp, title: 'بيع الأشجار', desc: 'استثمر في القيمة المتزايدة لأشجارك', gradient: 'from-blue-500 via-cyan-500 to-cyan-600', delay: '0.1s' },
              { icon: Gift, title: 'الإهداء', desc: 'أهدِ أشجارك لأحبائك كهدية قيّمة', gradient: 'from-rose-500 via-pink-500 to-pink-600', delay: '0.2s' },
              { icon: Heart, title: 'الوقف الخيري', desc: 'اجعل أشجارك صدقة جارية', gradient: 'from-green-500 via-emerald-500 to-emerald-600', delay: '0.3s' }
            ].map((option, idx) => (
              <div
                key={idx}
                className="group relative bg-white/90 backdrop-blur-2xl rounded-3xl sm:rounded-[2rem] p-6 sm:p-8 border-2 border-white/50 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-110 hover:-translate-y-3 animate-fade-in-up"
                style={{ animationDelay: option.delay }}
              >
                <div className={`absolute inset-0 rounded-3xl sm:rounded-[2rem] bg-gradient-to-br ${option.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                <div className={`absolute inset-0 rounded-3xl sm:rounded-[2rem] bg-gradient-to-br ${option.gradient} opacity-0 group-hover:opacity-5 blur-xl transition-all duration-500`} />

                <div className={`relative w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-5 rounded-2xl bg-gradient-to-br ${option.gradient} flex items-center justify-center shadow-xl group-hover:rotate-12 group-hover:scale-125 transition-all duration-500 ring-4 ring-white/50`}>
                  <option.icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" strokeWidth={2.5} />
                </div>
                <h3 className="relative text-base sm:text-lg lg:text-xl font-black text-gray-900 mb-3 text-center">
                  {option.title}
                </h3>
                <p className="relative text-xs sm:text-sm text-gray-600 leading-relaxed text-center">
                  {option.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Second Row - 3 Items Centered */}
          <div className="grid md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
            {[
              { icon: BarChart3, title: 'استثماري مستدام', desc: 'احصل على عوائد متنوعة من أشجارك المملوكة لك بشكل كامل وموثق', badge: 'عوائد متعددة', gradient: 'from-blue-500 via-cyan-500 to-cyan-600', bg: 'from-blue-50/50 to-white', delay: '0s' },
              { icon: Users, title: 'إنساني وأخلاقي', desc: 'ساهم في دعم المزارعين وأصحاب المزارع وتنمية القطاع الزراعي بشكل عادل', badge: 'دعم مجتمعي', gradient: 'from-rose-500 via-pink-500 to-pink-600', bg: 'from-rose-50/50 to-white', delay: '0.2s' },
              { icon: Droplets, title: 'بيئي ومستدام', desc: 'ساهم في زيادة الرقعة الخضراء والحفاظ على البيئة للأجيال القادمة', badge: 'حماية بيئية', gradient: 'from-green-500 via-emerald-500 to-emerald-600', bg: 'from-green-50/50 to-white', delay: '0.4s' }
            ].map((pillar, idx) => (
              <div
                key={idx}
                className={`group relative bg-gradient-to-br ${pillar.bg} rounded-3xl sm:rounded-[2rem] p-8 sm:p-10 border-2 border-white/50 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 animate-fade-in-up`}
                style={{ animationDelay: pillar.delay }}
              >
                <div className={`absolute inset-0 rounded-3xl sm:rounded-[2rem] bg-gradient-to-br ${pillar.gradient} opacity-0 group-hover:opacity-5 blur-xl transition-all duration-500`} />

                <div className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br ${pillar.gradient} flex items-center justify-center mb-6 shadow-xl group-hover:rotate-12 group-hover:scale-110 transition-all duration-500 ring-4 ring-white/60`}>
                  <pillar.icon className="w-8 h-8 sm:w-10 sm:h-10 text-white" strokeWidth={2.5} />
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-gray-900 mb-4">
                  {pillar.title}
                </h3>
                <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-6">
                  {pillar.desc}
                </p>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${pillar.gradient} text-white text-sm font-black shadow-lg hover:scale-105 transition-transform`}>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{pillar.badge}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works - Premium Steps */}
        <div className="relative bg-gradient-to-br from-gray-50 to-white rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-12 lg:p-16 mb-16 sm:mb-24 border-2 border-gray-200/50 shadow-2xl overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-b from-amber-100/30 to-transparent rounded-full blur-3xl animate-pulse-slow" />

          <div className="relative text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 mb-6 shadow-lg hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
              <span className="text-sm font-black text-blue-700">خطوات بسيطة</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-amber-800 to-gray-900 animate-gradient">
                كيف يعمل النظام؟
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 font-medium">عملية واضحة وشفافة من البداية للنهاية</p>
          </div>

          <div className="relative grid sm:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8">
            {[
              { num: '1', title: 'اختر النوع', desc: 'نخيل أو زيتون أو كلاهما', gradient: 'from-amber-500 via-yellow-500 to-orange-600', delay: '0s' },
              { num: '2', title: 'حدد الكمية', desc: 'اختر العدد المناسب لك', gradient: 'from-blue-500 via-cyan-500 to-cyan-600', delay: '0.1s' },
              { num: '3', title: 'وثق ملكيتك', desc: 'شهادة ملكية رسمية موثقة', gradient: 'from-green-500 via-emerald-500 to-emerald-600', delay: '0.2s' },
              { num: '4', title: 'تمتع بالحرية', desc: 'تصرف بملكيتك بحرية تامة', gradient: 'from-purple-500 via-pink-500 to-pink-600', delay: '0.3s' },
              { num: '5', title: 'نحن نهتم بالباقي', desc: 'إدارة وصيانة تشغيلية كاملة', gradient: 'from-teal-500 via-cyan-500 to-blue-600', delay: '0.4s' }
            ].map((step, idx) => (
              <div key={idx} className="group relative animate-fade-in-up" style={{ animationDelay: step.delay }}>
                <div className="relative bg-white rounded-3xl p-6 sm:p-8 text-center shadow-xl border-2 border-gray-200/50 hover:shadow-2xl transition-all duration-500 hover:scale-110 hover:-translate-y-3">
                  <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${step.gradient} opacity-0 group-hover:opacity-5 blur-xl transition-all duration-500`} />

                  <div className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br ${step.gradient} text-white font-black text-2xl sm:text-3xl flex items-center justify-center mx-auto mb-5 shadow-xl group-hover:rotate-12 group-hover:scale-125 transition-all duration-500 ring-4 ring-white/60`}>
                    {step.num}
                  </div>
                  <h4 className="font-black text-lg sm:text-xl text-gray-900 mb-3">{step.title}</h4>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{step.desc}</p>
                </div>
                {idx < 4 && (
                  <div className="hidden lg:block absolute top-1/2 left-full w-8 h-1 bg-gradient-to-r from-gray-300 via-amber-300 to-transparent -translate-y-1/2 animate-pulse-slow" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Ultra Premium CTA */}
        <div className="text-center px-4">
          <button
            onClick={onNavigateToFarms}
            className={`group relative inline-flex items-center justify-center gap-4 px-8 sm:px-12 lg:px-16 py-5 sm:py-6 lg:py-8 rounded-3xl font-black text-lg sm:text-2xl lg:text-3xl transition-all duration-500 transform hover:scale-110 shadow-2xl hover:shadow-3xl overflow-hidden w-full sm:w-auto ${
              activeType === 'palm'
                ? 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600'
                : 'bg-gradient-to-r from-green-500 via-emerald-500 to-green-600'
            } text-white ring-4 ring-white/50 hover:ring-8`}
          >
            {/* Multiple Animated Backgrounds */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <div className="absolute inset-0 bg-white/10 animate-pulse-fast" />

            {/* Enhanced Glow Effect */}
            <div className={`absolute inset-0 blur-2xl opacity-50 ${
              activeType === 'palm' ? 'bg-amber-400' : 'bg-green-400'
            } group-hover:opacity-70 group-hover:blur-3xl transition-all duration-500`} />

            {/* Content */}
            <span className="relative flex items-center gap-4">
              {activeType === 'palm' ? (
                <>
                  <TreePine className="w-6 h-6 sm:w-8 sm:h-8 group-hover:rotate-12 group-hover:scale-125 transition-transform duration-500" strokeWidth={2.5} />
                  <span className="hidden sm:inline">ابدأ تملك أشجار النخيل الآن</span>
                  <span className="sm:hidden">ابدأ التملك الآن</span>
                </>
              ) : (
                <>
                  <Sprout className="w-6 h-6 sm:w-8 sm:h-8 group-hover:rotate-12 group-hover:scale-125 transition-transform duration-500" strokeWidth={2.5} />
                  <span className="hidden sm:inline">ابدأ تملك أشجار الزيتون الآن</span>
                  <span className="sm:hidden">ابدأ التملك الآن</span>
                </>
              )}
              <ArrowLeft className="w-5 h-5 sm:w-7 sm:h-7 group-hover:-translate-x-4 transition-transform duration-500 animate-pulse" strokeWidth={2.5} />
            </span>
          </button>

          <p className="mt-6 sm:mt-8 text-base sm:text-lg lg:text-xl text-gray-600 font-bold">
            استعرض المزارع المتاحة واختر أشجارك الآن <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600 animate-gradient">بكل سهولة وفخامة</span>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, -20px) scale(1.1); }
        }

        @keyframes float-delayed {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-20px, 20px) scale(1.1); }
        }

        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(1.5); }
        }

        @keyframes bounce-gentle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        @keyframes pulse-fast {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .animate-fade-in {
          animation: fade-in 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
        }

        .animate-float {
          animation: float 8s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }

        .animate-sparkle {
          animation: sparkle 3s ease-in-out infinite;
        }

        .animate-bounce-gentle {
          animation: bounce-gentle 2s ease-in-out infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }

        .animate-pulse-fast {
          animation: pulse-fast 1s ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }

        .shadow-3xl {
          box-shadow: 0 50px 100px -20px rgba(0, 0, 0, 0.25);
        }

        @media (max-width: 640px) {
          .shadow-3xl {
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          }
        }
      `}</style>
    </div>
  );
};
