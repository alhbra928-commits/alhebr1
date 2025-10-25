import React, { useState } from 'react';
import { TreePine, Sprout, TrendingUp, Heart, Leaf, ArrowLeft, Sparkles, Shield, Zap, CheckCircle2, Users, BarChart3, Droplets, Gift, Briefcase } from 'lucide-react';

interface IdeaOverviewSectionProps {
  onNavigateToFarms: () => void;
}

type TreeType = 'palm' | 'olive';

export const IdeaOverviewSection: React.FC<IdeaOverviewSectionProps> = ({ onNavigateToFarms }) => {
  const [activeType, setActiveType] = useState<TreeType>('palm');

  return (
    <div className="w-full min-h-screen" style={{
      background: 'linear-gradient(180deg, #FEFEFE 0%, #F8F9FA 50%, #FEFEFE 100%)'
    }}>
      {/* Header القسم */}
      <div className="relative overflow-hidden pt-16 pb-12 px-4 sm:px-6 lg:px-8">
        {/* خلفية متوهجة ناعمة */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-amber-50/30 to-transparent blur-3xl rounded-full" />

        <div className="relative max-w-6xl mx-auto text-center">
          {/* Badge العلوي المحسّن */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-amber-200 mb-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-bold text-gray-700">فرصة استثمارية متميزة</span>
          </div>

          {/* العنوان الرئيسي المحسّن */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black mb-8 leading-[1.1] tracking-tight">
            <span className="inline-block bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-transparent bg-clip-text">
              امتلك أشجارك الخاصة
            </span>
            <br />
            <span className="text-gray-600 font-bold text-3xl sm:text-4xl md:text-5xl">من مزارع منتقاة ومعتمدة</span>
          </h1>

          {/* الوصف المحسّن */}
          <p className="text-xl sm:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-medium">
            استثمر في ملكية أشجار حقيقية واحصل على حرية التصرف الكاملة
          </p>

          {/* إحصائيات محسّنة */}
          <div className="grid grid-cols-3 gap-4 sm:gap-6 max-w-3xl mx-auto mt-12">
            <div className="group bg-white rounded-3xl p-5 sm:p-6 border border-gray-200 hover:border-amber-300 hover:shadow-lg transition-all duration-300">
              <div className="text-3xl sm:text-4xl font-black text-amber-600 mb-2 group-hover:scale-110 transition-transform">100%</div>
              <div className="text-sm sm:text-base text-gray-600 font-semibold">ملكية كاملة</div>
            </div>
            <div className="group bg-white rounded-3xl p-5 sm:p-6 border border-gray-200 hover:border-green-300 hover:shadow-lg transition-all duration-300">
              <div className="text-3xl sm:text-4xl font-black text-green-600 mb-2 group-hover:scale-110 transition-transform">موثق</div>
              <div className="text-sm sm:text-base text-gray-600 font-semibold">رقم تسلسلي</div>
            </div>
            <div className="group bg-white rounded-3xl p-5 sm:p-6 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300">
              <div className="text-3xl sm:text-4xl font-black text-blue-600 mb-2 group-hover:scale-110 transition-transform">حرية</div>
              <div className="text-sm sm:text-base text-gray-600 font-semibold">تصرف كاملة</div>
            </div>
          </div>
        </div>
      </div>

      {/* قسم اختيار النوع */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Tabs محسّنة */}
        <div className="flex justify-center gap-4 mb-12">
          <button
            onClick={() => setActiveType('palm')}
            className={`group flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 ${
              activeType === 'palm'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-200 scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 hover:border-amber-300'
            }`}
          >
            <TreePine className={`w-6 h-6 transition-transform ${activeType === 'palm' ? 'rotate-0' : 'group-hover:scale-110'}`} />
            <span>أشجار النخيل</span>
            {activeType === 'palm' && <CheckCircle2 className="w-5 h-5 animate-pulse" />}
          </button>

          <button
            onClick={() => setActiveType('olive')}
            className={`group flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 ${
              activeType === 'olive'
                ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg shadow-green-200 scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 hover:border-green-300'
            }`}
          >
            <Sprout className={`w-6 h-6 transition-transform ${activeType === 'olive' ? 'rotate-0' : 'group-hover:scale-110'}`} />
            <span>أشجار الزيتون</span>
            {activeType === 'olive' && <CheckCircle2 className="w-5 h-5 animate-pulse" />}
          </button>
        </div>

        {/* محتوى النوع المختار */}
        <div className="relative">
          {/* النخيل */}
          {activeType === 'palm' && (
            <div className="animate-fade-in">
              {/* البطاقة الرئيسية المحسّنة */}
              <div className="bg-white rounded-[32px] p-10 sm:p-14 border-2 border-gray-100 shadow-xl shadow-gray-100 mb-12">
                <div className="flex flex-col md:flex-row items-center gap-10">
                  {/* الأيقونة المحسّنة */}
                  <div className="relative flex-shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 to-amber-600/20 rounded-full blur-2xl" />
                    <div className="relative w-40 h-40 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-2xl">
                      <TreePine className="w-20 h-20 text-white" strokeWidth={2.5} />
                    </div>
                  </div>

                  {/* المحتوى */}
                  <div className="flex-1 text-center md:text-right">
                    <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-6 leading-tight">
                      استثمر في أشجار النخيل الأصيلة
                    </h2>
                    <p className="text-xl text-gray-600 leading-relaxed mb-6 font-medium">
                      النخيل رمز الأصالة والعطاء المستمر. امتلك أشجار نخيل حقيقية من مزارع منتقاة ومعتمدة،
                      واحصل على <span className="font-black text-amber-700">عوائد استثمارك في النخيل المملوكة لك كلياً</span> في أرض المزرعة،
                      سواء من بيع الثمار، أو الاستثمار في بيع النخيل، أو الإهداء، أو الوقف الخيري.
                    </p>
                    <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                      <span className="px-4 py-2 rounded-full bg-amber-50 text-amber-800 text-sm font-bold border border-amber-200">
                        ملكية موثقة
                      </span>
                      <span className="px-4 py-2 rounded-full bg-amber-50 text-amber-800 text-sm font-bold border border-amber-200">
                        حرية تصرف
                      </span>
                      <span className="px-4 py-2 rounded-full bg-amber-50 text-amber-800 text-sm font-bold border border-amber-200">
                        عوائد متعددة
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
              {/* البطاقة الرئيسية المحسّنة */}
              <div className="bg-white rounded-[32px] p-10 sm:p-14 border-2 border-gray-100 shadow-xl shadow-gray-100 mb-12">
                <div className="flex flex-col md:flex-row items-center gap-10">
                  {/* الأيقونة المحسّنة */}
                  <div className="relative flex-shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-green-700/20 rounded-full blur-2xl" />
                    <div className="relative w-40 h-40 bg-gradient-to-br from-green-600 to-green-800 rounded-full flex items-center justify-center shadow-2xl">
                      <Sprout className="w-20 h-20 text-white" strokeWidth={2.5} />
                    </div>
                  </div>

                  {/* المحتوى */}
                  <div className="flex-1 text-center md:text-right">
                    <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-6 leading-tight">
                      استثمر في أشجار الزيتون المباركة
                    </h2>
                    <p className="text-xl text-gray-600 leading-relaxed mb-6 font-medium">
                      الزيتون شجرة مباركة وعطاء دائم. امتلك أشجار زيتون مثمرة من مزارع متخصصة ومعتمدة،
                      واحصل على <span className="font-black text-green-700">عوائد استثمارك في الزيتون المملوكة لك كلياً</span> في أرض المزرعة،
                      سواء من بيع الثمار، أو الاستثمار في بيع الزيتون، أو الإهداء، أو الوقف الخيري.
                    </p>
                    <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                      <span className="px-4 py-2 rounded-full bg-green-50 text-green-800 text-sm font-bold border border-green-200">
                        ملكية موثقة
                      </span>
                      <span className="px-4 py-2 rounded-full bg-green-50 text-green-800 text-sm font-bold border border-green-200">
                        حرية تصرف
                      </span>
                      <span className="px-4 py-2 rounded-full bg-green-50 text-green-800 text-sm font-bold border border-green-200">
                        عوائد متعددة
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* خيارات التصرف بالملكية */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {/* بيع الثمار */}
          <div className="group bg-white rounded-3xl p-8 border-2 border-gray-100 hover:border-amber-300 hover:shadow-xl transition-all duration-300">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-lg">
              <Briefcase className="w-8 h-8 text-white" strokeWidth={2.5} />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-3">بيع الثمار</h3>
            <p className="text-gray-600 leading-relaxed text-sm">
              احصل على عوائد سنوية من بيع إنتاج أشجارك
            </p>
          </div>

          {/* بيع الأشجار */}
          <div className="group bg-white rounded-3xl p-8 border-2 border-gray-100 hover:border-blue-300 hover:shadow-xl transition-all duration-300">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-lg">
              <TrendingUp className="w-8 h-8 text-white" strokeWidth={2.5} />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-3">بيع الأشجار</h3>
            <p className="text-gray-600 leading-relaxed text-sm">
              استثمر في القيمة المتزايدة لأشجارك وبعها متى شئت
            </p>
          </div>

          {/* الإهداء */}
          <div className="group bg-white rounded-3xl p-8 border-2 border-gray-100 hover:border-red-300 hover:shadow-xl transition-all duration-300">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-lg">
              <Gift className="w-8 h-8 text-white" strokeWidth={2.5} />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-3">الإهداء</h3>
            <p className="text-gray-600 leading-relaxed text-sm">
              أهدِ أشجارك لأحبائك كهدية قيّمة ومستدامة
            </p>
          </div>

          {/* الوقف الخيري */}
          <div className="group bg-white rounded-3xl p-8 border-2 border-gray-100 hover:border-green-300 hover:shadow-xl transition-all duration-300">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-lg">
              <Heart className="w-8 h-8 text-white" strokeWidth={2.5} />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-3">الوقف الخيري</h3>
            <p className="text-gray-600 leading-relaxed text-sm">
              اجعل أشجارك صدقة جارية بوقفها للخير
            </p>
          </div>
        </div>

        {/* المميزات الثلاثية المحسّنة */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {/* استثماري */}
          <div className="group bg-gradient-to-br from-blue-50 to-white rounded-3xl p-8 border-2 border-blue-100 hover:border-blue-300 hover:shadow-2xl transition-all duration-300">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all shadow-lg">
              <BarChart3 className="w-8 h-8 text-white" strokeWidth={2.5} />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-4">استثماري مستدام</h3>
            <p className="text-gray-600 leading-relaxed mb-5 text-lg">
              احصل على عوائد متنوعة من أشجارك المملوكة لك بشكل كامل وموثق
            </p>
            <div className="flex items-center gap-2 text-blue-600 font-bold">
              <CheckCircle2 className="w-5 h-5" />
              <span>عوائد متعددة ومستدامة</span>
            </div>
          </div>

          {/* إنساني */}
          <div className="group bg-gradient-to-br from-red-50 to-white rounded-3xl p-8 border-2 border-red-100 hover:border-red-300 hover:shadow-2xl transition-all duration-300">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all shadow-lg">
              <Users className="w-8 h-8 text-white" strokeWidth={2.5} />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-4">إنساني وأخلاقي</h3>
            <p className="text-gray-600 leading-relaxed mb-5 text-lg">
              ساهم في دعم المزارعين وأصحاب المزارع وتنمية القطاع الزراعي بشكل عادل
            </p>
            <div className="flex items-center gap-2 text-red-600 font-bold">
              <CheckCircle2 className="w-5 h-5" />
              <span>دعم مجتمعي مستدام</span>
            </div>
          </div>

          {/* بيئي */}
          <div className="group bg-gradient-to-br from-green-50 to-white rounded-3xl p-8 border-2 border-green-100 hover:border-green-300 hover:shadow-2xl transition-all duration-300">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all shadow-lg">
              <Droplets className="w-8 h-8 text-white" strokeWidth={2.5} />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-4">بيئي ومستدام</h3>
            <p className="text-gray-600 leading-relaxed mb-5 text-lg">
              ساهم في زيادة الرقعة الخضراء والحفاظ على البيئة للأجيال القادمة
            </p>
            <div className="flex items-center gap-2 text-green-600 font-bold">
              <CheckCircle2 className="w-5 h-5" />
              <span>حماية بيئية فعّالة</span>
            </div>
          </div>
        </div>

        {/* قسم كيف يعمل المحسّن */}
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-[32px] p-10 sm:p-16 mb-16 border-2 border-gray-100">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 mb-6">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-sm font-bold text-gray-700">خطوات بسيطة</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">
              كيف يعمل النظام؟
            </h2>
            <p className="text-gray-600 text-xl font-medium">عملية واضحة وشفافة من البداية للنهاية</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {/* الخطوة 1 */}
            <div className="relative group">
              <div className="bg-white rounded-3xl p-8 text-center shadow-lg border-2 border-amber-200 hover:border-amber-400 hover:shadow-2xl transition-all duration-300">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-white font-black text-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all shadow-lg">
                  1
                </div>
                <h4 className="font-black text-gray-900 text-lg mb-3">اختر النوع</h4>
                <p className="text-gray-600 leading-relaxed">نخيل أو زيتون أو كلاهما</p>
              </div>
              <div className="hidden md:block absolute top-1/2 left-full w-8 h-0.5 bg-gradient-to-r from-amber-300 to-transparent -translate-y-1/2" />
            </div>

            {/* الخطوة 2 */}
            <div className="relative group">
              <div className="bg-white rounded-3xl p-8 text-center shadow-lg border-2 border-blue-200 hover:border-blue-400 hover:shadow-2xl transition-all duration-300">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white font-black text-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all shadow-lg">
                  2
                </div>
                <h4 className="font-black text-gray-900 text-lg mb-3">حدد الكمية</h4>
                <p className="text-gray-600 leading-relaxed">اختر العدد المناسب لك</p>
              </div>
              <div className="hidden md:block absolute top-1/2 left-full w-8 h-0.5 bg-gradient-to-r from-blue-300 to-transparent -translate-y-1/2" />
            </div>

            {/* الخطوة 3 */}
            <div className="relative group">
              <div className="bg-white rounded-3xl p-8 text-center shadow-lg border-2 border-green-200 hover:border-green-400 hover:shadow-2xl transition-all duration-300">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 text-white font-black text-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all shadow-lg">
                  3
                </div>
                <h4 className="font-black text-gray-900 text-lg mb-3">وثق ملكيتك</h4>
                <p className="text-gray-600 leading-relaxed">شهادة ملكية رسمية موثقة</p>
              </div>
              <div className="hidden md:block absolute top-1/2 left-full w-8 h-0.5 bg-gradient-to-r from-green-300 to-transparent -translate-y-1/2" />
            </div>

            {/* الخطوة 4 */}
            <div className="group">
              <div className="bg-white rounded-3xl p-8 text-center shadow-lg border-2 border-purple-200 hover:border-purple-400 hover:shadow-2xl transition-all duration-300">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 text-white font-black text-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all shadow-lg">
                  4
                </div>
                <h4 className="font-black text-gray-900 text-lg mb-3">تمتع بالحرية</h4>
                <p className="text-gray-600 leading-relaxed">تصرف بملكيتك بحرية تامة</p>
              </div>
            </div>
          </div>
        </div>

        {/* النص التوضيحي المحوري المحسّن */}
        <div className="relative bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-50 rounded-[32px] p-12 sm:p-16 mb-16 border-2 border-amber-200 shadow-2xl overflow-hidden">
          {/* Pattern خلفية محسّن */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `radial-gradient(circle, #D97706 2px, transparent 2px)`,
            backgroundSize: '40px 40px'
          }} />

          <div className="relative max-w-5xl mx-auto text-center">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center mx-auto mb-8 shadow-2xl">
              <Shield className="w-12 h-12 text-white" strokeWidth={2.5} />
            </div>

            <h3 className="text-3xl sm:text-4xl font-black text-gray-900 mb-8 leading-tight">
              ملكية حقيقية بتوثيق رسمي وحرية تصرف كاملة
            </h3>

            <p className="text-xl sm:text-2xl text-gray-700 leading-relaxed mb-10 font-medium">
              كل شجرة موثقة <span className="font-black text-amber-700">برقم تسلسلي فريد</span> داخل المنصة،
              وموقعها محدد بدقة في أرض المزرعة المعتمدة. أنت <span className="font-black text-amber-700">مالك فعلي</span> لأشجار حقيقية منتجة
              مع حرية التصرف الكاملة.
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
              <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white border-2 border-amber-200 shadow-md hover:shadow-lg transition-shadow">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                <span className="font-black text-gray-900">ملكية قانونية</span>
              </div>
              <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white border-2 border-amber-200 shadow-md hover:shadow-lg transition-shadow">
                <Shield className="w-6 h-6 text-blue-600" />
                <span className="font-black text-gray-900">توثيق رسمي</span>
              </div>
              <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white border-2 border-amber-200 shadow-md hover:shadow-lg transition-shadow">
                <Zap className="w-6 h-6 text-amber-600" />
                <span className="font-black text-gray-900">حرية تصرف</span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA الرئيسي المحسّن */}
        <div className="text-center">
          <button
            onClick={onNavigateToFarms}
            className={`group relative inline-flex items-center gap-5 px-12 sm:px-16 py-6 sm:py-7 rounded-3xl font-black text-2xl sm:text-3xl transition-all duration-500 transform hover:scale-105 shadow-2xl hover:shadow-3xl overflow-hidden ${
              activeType === 'palm'
                ? 'bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 text-white'
                : 'bg-gradient-to-r from-green-600 via-green-700 to-green-600 text-white'
            }`}
          >
            {/* تأثير glow محسّن */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

            {/* المحتوى */}
            <span className="relative flex items-center gap-5">
              {activeType === 'palm' ? (
                <>
                  <TreePine className="w-8 h-8 group-hover:rotate-12 transition-transform" strokeWidth={2.5} />
                  ابدأ تملك أشجار النخيل الآن
                </>
              ) : (
                <>
                  <Sprout className="w-8 h-8 group-hover:rotate-12 transition-transform" strokeWidth={2.5} />
                  ابدأ تملك أشجار الزيتون الآن
                </>
              )}
              <ArrowLeft className="w-7 h-7 group-hover:-translate-x-2 transition-transform" strokeWidth={2.5} />
            </span>
          </button>

          <p className="mt-8 text-gray-600 font-semibold text-lg">
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
      `}</style>
    </div>
  );
};
