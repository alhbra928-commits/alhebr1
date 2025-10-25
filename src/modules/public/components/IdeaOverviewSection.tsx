import React, { useState } from 'react';
import { TreePine, Sprout, TrendingUp, Heart, ArrowLeft, Sparkles, Shield, Zap, CheckCircle2, Users, BarChart3, Droplets, Gift, Briefcase, Award, Crown, Star } from 'lucide-react';

interface IdeaOverviewSectionProps {
  onNavigateToFarms: () => void;
}

type TreeType = 'palm' | 'olive';

export const IdeaOverviewSection: React.FC<IdeaOverviewSectionProps> = ({ onNavigateToFarms }) => {
  const [activeType, setActiveType] = useState<TreeType>('palm');

  return (
    <div className="w-full min-h-screen overflow-x-hidden relative" style={{
      background: 'linear-gradient(135deg, #FDFBF7 0%, #FFFEF9 25%, #F8F6F0 50%, #FFFEF9 75%, #FDFBF7 100%)'
    }}>
      {/* Animated Particles Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-amber-200/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-yellow-200/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-40 left-1/3 w-80 h-80 bg-orange-200/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Premium Header Section */}
      <div className="relative pt-16 sm:pt-20 lg:pt-24 pb-12 sm:pb-16 lg:pb-20 px-4 sm:px-6 lg:px-8">
        <div className="relative max-w-7xl mx-auto">
          {/* Luxury Badge */}
          <div className="flex justify-center mb-8 sm:mb-10">
            <div className="group relative inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 border-2 border-amber-200/50 shadow-2xl hover:shadow-amber-200/50 transition-all duration-500 hover:scale-105">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400/20 to-yellow-400/20 blur-xl group-hover:blur-2xl transition-all" />
              <Crown className="w-5 h-5 text-amber-600 animate-pulse relative z-10" />
              <span className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-700 to-yellow-700 relative z-10">فرصة استثمارية فاخرة</span>
              <Star className="w-4 h-4 text-yellow-500 relative z-10" />
            </div>
          </div>

          {/* Majestic Title */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="relative inline-block">
              <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black mb-4 sm:mb-6 leading-[1.1] tracking-tight">
                <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-br from-gray-900 via-amber-900 to-gray-900 drop-shadow-sm">
                  امتلك أشجارك الخاصة
                </span>
              </span>
              <div className="absolute -inset-x-4 -inset-y-2 bg-gradient-to-r from-transparent via-amber-100/30 to-transparent blur-2xl -z-10" />
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-700 via-yellow-600 to-amber-700 mb-6 sm:mb-8">
              من مزارع منتقاة ومعتمدة
            </p>

            <p className="text-base sm:text-lg lg:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed font-medium px-4">
              استثمر في ملكية حقيقية مع <span className="font-black text-amber-700">حرية تصرف كاملة</span>
            </p>
          </div>

          {/* Luxury Stats - Glass Morphism */}
          <div className="grid grid-cols-3 gap-3 sm:gap-6 max-w-5xl mx-auto">
            {[
              { value: '100%', label: 'ملكية كاملة', color: 'from-amber-500 to-orange-600', icon: Award },
              { value: 'موثق', label: 'رقم تسلسلي', color: 'from-green-500 to-emerald-600', icon: Shield },
              { value: 'حرية', label: 'تصرف كاملة', color: 'from-blue-500 to-cyan-600', icon: Zap }
            ].map((stat, idx) => (
              <div
                key={idx}
                className="group relative bg-white/60 backdrop-blur-xl rounded-3xl sm:rounded-[2rem] p-4 sm:p-6 lg:p-8 border border-white/20 shadow-2xl hover:shadow-amber-200/50 transition-all duration-500 hover:scale-105 hover:-translate-y-2"
              >
                <div className="absolute inset-0 rounded-3xl sm:rounded-[2rem] bg-gradient-to-br from-amber-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className={`relative w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg group-hover:rotate-12 group-hover:scale-110 transition-all duration-500`}>
                  <stat.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" strokeWidth={2.5} />
                </div>
                <div className="relative text-2xl sm:text-3xl lg:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-gray-900 to-gray-700 mb-2">
                  {stat.value}
                </div>
                <div className="relative text-xs sm:text-sm lg:text-base text-gray-600 font-bold">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Elegant Type Selection */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex justify-center gap-4 sm:gap-6 mb-12 sm:mb-16">
          {[
            { type: 'palm', icon: TreePine, label: 'النخيل', fullLabel: 'أشجار النخيل', gradient: 'from-amber-500 via-yellow-500 to-amber-600' },
            { type: 'olive', icon: Sprout, label: 'الزيتون', fullLabel: 'أشجار الزيتون', gradient: 'from-green-500 via-emerald-500 to-green-600' }
          ].map((tab) => (
            <button
              key={tab.type}
              onClick={() => setActiveType(tab.type as TreeType)}
              className={`group relative overflow-hidden px-6 sm:px-10 py-4 sm:py-5 rounded-2xl sm:rounded-3xl font-black text-base sm:text-lg lg:text-xl transition-all duration-500 ${
                activeType === tab.type
                  ? `bg-gradient-to-r ${tab.gradient} text-white shadow-2xl scale-110`
                  : 'bg-white/80 backdrop-blur-lg text-gray-700 border-2 border-gray-200 hover:border-amber-300 hover:scale-105'
              }`}
            >
              {activeType === tab.type && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
              )}
              <span className="relative flex items-center gap-3">
                <tab.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${activeType === tab.type ? 'animate-bounce' : 'group-hover:scale-110'} transition-transform`} strokeWidth={2.5} />
                <span className="hidden sm:inline">{tab.fullLabel}</span>
                <span className="sm:hidden">{tab.label}</span>
                {activeType === tab.type && <CheckCircle2 className="w-5 h-5 animate-pulse" />}
              </span>
            </button>
          ))}
        </div>

        {/* Premium Content Card */}
        <div className="relative mb-12 sm:mb-20">
          {activeType === 'palm' && (
            <div className="animate-fade-in">
              <div className="relative bg-gradient-to-br from-white via-amber-50/30 to-white rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-12 lg:p-16 border-2 border-amber-200/50 shadow-2xl overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-200/20 to-transparent rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-yellow-200/20 to-transparent rounded-full blur-3xl" />

                <div className="relative flex flex-col items-center gap-8 sm:gap-10">
                  {/* Luxury Icon */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-600 rounded-full blur-3xl opacity-30 animate-pulse" />
                    <div className="relative w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 rounded-full bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-600 flex items-center justify-center shadow-2xl ring-8 ring-white/50">
                      <TreePine className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 text-white" strokeWidth={2.5} />
                    </div>
                    <div className="absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-xl">
                      <Crown className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  {/* Premium Content */}
                  <div className="text-center max-w-4xl">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black mb-6 sm:mb-8 leading-tight">
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-700 via-yellow-600 to-amber-700">
                        استثمر في أشجار النخيل الأصيلة
                      </span>
                    </h2>

                    <p className="text-lg sm:text-xl lg:text-2xl text-gray-700 leading-relaxed mb-8 font-medium">
                      النخيل رمز <span className="font-black text-amber-700">الأصالة والعطاء المستمر</span>. امتلك أشجار نخيل حقيقية من مزارع منتقاة ومعتمدة،
                      واحصل على <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">عوائد استثمارك في النخيل المملوكة لك كلياً</span> في أرض المزرعة،
                      سواء من بيع الثمار، أو الاستثمار في بيع النخيل، أو الإهداء، أو الوقف الخيري.
                    </p>

                    <div className="flex flex-wrap gap-3 justify-center">
                      {['ملكية موثقة', 'حرية تصرف', 'عوائد متعددة'].map((badge, idx) => (
                        <div key={idx} className="px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-100 to-yellow-100 border-2 border-amber-300 text-amber-900 text-sm sm:text-base font-black shadow-lg hover:scale-105 transition-transform">
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
              <div className="relative bg-gradient-to-br from-white via-green-50/30 to-white rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-12 lg:p-16 border-2 border-green-200/50 shadow-2xl overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-200/20 to-transparent rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-emerald-200/20 to-transparent rounded-full blur-3xl" />

                <div className="relative flex flex-col items-center gap-8 sm:gap-10">
                  {/* Luxury Icon */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full blur-3xl opacity-30 animate-pulse" />
                    <div className="relative w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 rounded-full bg-gradient-to-br from-green-500 via-emerald-500 to-green-700 flex items-center justify-center shadow-2xl ring-8 ring-white/50">
                      <Sprout className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 text-white" strokeWidth={2.5} />
                    </div>
                    <div className="absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center shadow-xl">
                      <Crown className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  {/* Premium Content */}
                  <div className="text-center max-w-4xl">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black mb-6 sm:mb-8 leading-tight">
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-700 via-emerald-600 to-green-700">
                        استثمر في أشجار الزيتون المباركة
                      </span>
                    </h2>

                    <p className="text-lg sm:text-xl lg:text-2xl text-gray-700 leading-relaxed mb-8 font-medium">
                      الزيتون شجرة <span className="font-black text-green-700">مباركة وعطاء دائم</span>. امتلك أشجار زيتون مثمرة من مزارع متخصصة ومعتمدة،
                      واحصل على <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">عوائد استثمارك في الزيتون المملوكة لك كلياً</span> في أرض المزرعة،
                      سواء من بيع الثمار، أو الاستثمار في بيع الزيتون، أو الإهداء، أو الوقف الخيري.
                    </p>

                    <div className="flex flex-wrap gap-3 justify-center">
                      {['ملكية موثقة', 'حرية تصرف', 'عوائد متعددة'].map((badge, idx) => (
                        <div key={idx} className="px-5 py-2.5 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-300 text-green-900 text-sm sm:text-base font-black shadow-lg hover:scale-105 transition-transform">
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

        {/* Ownership Options - Premium Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-16 sm:mb-24">
          {[
            { icon: Briefcase, title: 'بيع الثمار', desc: 'احصل على عوائد سنوية من بيع إنتاج أشجارك', gradient: 'from-amber-500 to-orange-600', glow: 'amber' },
            { icon: TrendingUp, title: 'بيع الأشجار', desc: 'استثمر في القيمة المتزايدة لأشجارك', gradient: 'from-blue-500 to-cyan-600', glow: 'blue' },
            { icon: Gift, title: 'الإهداء', desc: 'أهدِ أشجارك لأحبائك كهدية قيّمة', gradient: 'from-rose-500 to-pink-600', glow: 'rose' },
            { icon: Heart, title: 'الوقف الخيري', desc: 'اجعل أشجارك صدقة جارية', gradient: 'from-green-500 to-emerald-600', glow: 'green' }
          ].map((option, idx) => (
            <div
              key={idx}
              className="group relative bg-white/80 backdrop-blur-xl rounded-3xl sm:rounded-[2rem] p-6 sm:p-8 border border-gray-200/50 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2"
            >
              <div className={`absolute inset-0 rounded-3xl sm:rounded-[2rem] bg-gradient-to-br ${option.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
              <div className={`relative w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-5 rounded-2xl bg-gradient-to-br ${option.gradient} flex items-center justify-center shadow-lg group-hover:rotate-12 group-hover:scale-110 transition-all duration-500`}>
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

        {/* Three Pillars - Luxury Edition */}
        <div className="grid md:grid-cols-3 gap-6 sm:gap-8 mb-16 sm:mb-24">
          {[
            { icon: BarChart3, title: 'استثماري مستدام', desc: 'احصل على عوائد متنوعة من أشجارك المملوكة لك بشكل كامل وموثق', badge: 'عوائد متعددة', gradient: 'from-blue-500 to-cyan-600', bg: 'from-blue-50/50 to-white' },
            { icon: Users, title: 'إنساني وأخلاقي', desc: 'ساهم في دعم المزارعين وأصحاب المزارع وتنمية القطاع الزراعي بشكل عادل', badge: 'دعم مجتمعي', gradient: 'from-rose-500 to-pink-600', bg: 'from-rose-50/50 to-white' },
            { icon: Droplets, title: 'بيئي ومستدام', desc: 'ساهم في زيادة الرقعة الخضراء والحفاظ على البيئة للأجيال القادمة', badge: 'حماية بيئية', gradient: 'from-green-500 to-emerald-600', bg: 'from-green-50/50 to-white' }
          ].map((pillar, idx) => (
            <div
              key={idx}
              className={`group relative bg-gradient-to-br ${pillar.bg} rounded-3xl sm:rounded-[2rem] p-8 sm:p-10 border border-gray-200/50 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105`}
            >
              <div className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br ${pillar.gradient} flex items-center justify-center mb-6 shadow-xl group-hover:rotate-12 group-hover:scale-110 transition-all duration-500`}>
                <pillar.icon className="w-8 h-8 sm:w-10 sm:h-10 text-white" strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-gray-900 mb-4">
                {pillar.title}
              </h3>
              <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-6">
                {pillar.desc}
              </p>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${pillar.gradient} text-white text-sm font-black shadow-lg`}>
                <CheckCircle2 className="w-4 h-4" />
                <span>{pillar.badge}</span>
              </div>
            </div>
          ))}
        </div>

        {/* How It Works - Premium Steps */}
        <div className="relative bg-gradient-to-br from-gray-50 to-white rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-12 lg:p-16 mb-16 sm:mb-24 border border-gray-200 shadow-2xl overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-b from-amber-100/30 to-transparent rounded-full blur-3xl" />

          <div className="relative text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 mb-6">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-black text-blue-700">خطوات بسيطة</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-amber-800 to-gray-900">
                كيف يعمل النظام؟
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 font-medium">عملية واضحة وشفافة من البداية للنهاية</p>
          </div>

          <div className="relative grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[
              { num: '1', title: 'اختر النوع', desc: 'نخيل أو زيتون أو كلاهما', gradient: 'from-amber-500 to-orange-600', color: 'amber' },
              { num: '2', title: 'حدد الكمية', desc: 'اختر العدد المناسب لك', gradient: 'from-blue-500 to-cyan-600', color: 'blue' },
              { num: '3', title: 'وثق ملكيتك', desc: 'شهادة ملكية رسمية موثقة', gradient: 'from-green-500 to-emerald-600', color: 'green' },
              { num: '4', title: 'تمتع بالحرية', desc: 'تصرف بملكيتك بحرية تامة', gradient: 'from-purple-500 to-pink-600', color: 'purple' }
            ].map((step, idx) => (
              <div key={idx} className="group relative">
                <div className="relative bg-white rounded-3xl p-6 sm:p-8 text-center shadow-xl border-2 border-gray-200/50 hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2">
                  <div className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br ${step.gradient} text-white font-black text-2xl sm:text-3xl flex items-center justify-center mx-auto mb-5 shadow-xl group-hover:rotate-12 group-hover:scale-110 transition-all duration-500`}>
                    {step.num}
                  </div>
                  <h4 className="font-black text-lg sm:text-xl text-gray-900 mb-3">{step.title}</h4>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{step.desc}</p>
                </div>
                {idx < 3 && (
                  <div className="hidden lg:block absolute top-1/2 left-full w-8 h-1 bg-gradient-to-r from-gray-300 to-transparent -translate-y-1/2" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Central Trust Message - Ultra Premium */}
        <div className="relative bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-50 rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-12 lg:p-16 mb-16 sm:mb-24 border-2 border-amber-200/50 shadow-2xl overflow-hidden">
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 30m-25 0a25 25 0 1 0 50 0a25 25 0 1 0 -50 0' fill='none' stroke='%23D97706' stroke-width='2'/%3E%3C/svg%3E")`
          }} />

          <div className="relative text-center max-w-5xl mx-auto">
            <div className="inline-flex w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-3xl bg-gradient-to-br from-amber-500 via-yellow-500 to-orange-600 items-center justify-center mx-auto mb-8 shadow-2xl ring-8 ring-white/50">
              <Shield className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 text-white" strokeWidth={2.5} />
            </div>

            <h3 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black mb-6 sm:mb-8 leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-amber-800 to-gray-900">
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
                { icon: CheckCircle2, text: 'ملكية قانونية', color: 'green' },
                { icon: Shield, text: 'توثيق رسمي', color: 'blue' },
                { icon: Zap, text: 'حرية تصرف', color: 'amber' }
              ].map((item, idx) => (
                <div key={idx} className="group flex items-center gap-2 sm:gap-3 px-5 sm:px-6 py-3 sm:py-3.5 rounded-2xl bg-white/90 backdrop-blur-lg border-2 border-amber-200 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                  <item.icon className={`w-5 h-5 sm:w-6 sm:h-6 text-${item.color}-600 group-hover:scale-110 transition-transform`} />
                  <span className="font-black text-gray-900 text-sm sm:text-base">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Ultra Premium CTA */}
        <div className="text-center px-4">
          <button
            onClick={onNavigateToFarms}
            className={`group relative inline-flex items-center justify-center gap-4 px-8 sm:px-12 lg:px-16 py-5 sm:py-6 lg:py-8 rounded-3xl font-black text-lg sm:text-2xl lg:text-3xl transition-all duration-500 transform hover:scale-105 shadow-2xl hover:shadow-3xl overflow-hidden w-full sm:w-auto ${
              activeType === 'palm'
                ? 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600'
                : 'bg-gradient-to-r from-green-500 via-emerald-500 to-green-600'
            } text-white`}
          >
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

            {/* Glow Effect */}
            <div className={`absolute inset-0 blur-2xl opacity-50 ${
              activeType === 'palm' ? 'bg-amber-400' : 'bg-green-400'
            } group-hover:opacity-70 transition-opacity`} />

            {/* Content */}
            <span className="relative flex items-center gap-4">
              {activeType === 'palm' ? (
                <>
                  <TreePine className="w-6 h-6 sm:w-8 sm:h-8 group-hover:rotate-12 transition-transform" strokeWidth={2.5} />
                  <span className="hidden sm:inline">ابدأ تملك أشجار النخيل الآن</span>
                  <span className="sm:hidden">ابدأ التملك الآن</span>
                </>
              ) : (
                <>
                  <Sprout className="w-6 h-6 sm:w-8 sm:h-8 group-hover:rotate-12 transition-transform" strokeWidth={2.5} />
                  <span className="hidden sm:inline">ابدأ تملك أشجار الزيتون الآن</span>
                  <span className="sm:hidden">ابدأ التملك الآن</span>
                </>
              )}
              <ArrowLeft className="w-5 h-5 sm:w-7 sm:h-7 group-hover:-translate-x-3 transition-transform" strokeWidth={2.5} />
            </span>
          </button>

          <p className="mt-6 sm:mt-8 text-base sm:text-lg lg:text-xl text-gray-600 font-bold">
            استعرض المزارع المتاحة واختر أشجارك الآن <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">بكل سهولة وفخامة</span>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
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
