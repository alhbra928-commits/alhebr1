import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  Users,
  TreePine,
  Clock,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Award,
  Activity,
  DollarSign,
  Calendar,
  Eye,
  FileText
} from 'lucide-react';
import { FarmOwnerProfile, FarmStatus } from '../services/farmOwnerService';

interface ModernHomeTabProps {
  profile: FarmOwnerProfile | null;
  farmStatus: FarmStatus | null;
}

export const ModernHomeTab: React.FC<ModernHomeTabProps> = ({ profile, farmStatus }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getStatusInfo = () => {
    if (!profile) return { emoji: '⏳', title: 'جاري التحميل...', message: '', color: '#9CA3AF', bgGradient: 'from-gray-50 to-gray-100', icon: Clock };

    // التحقق من أن المستخدم رفع بيانات مزرعته
    // إذا لم يكن له farm_owner_id، معناه لم يرفع طلبه بعد
    const hasSubmittedData = farmStatus?.farm_owner_id || profile.farm_owner_id;

    // إذا لم يرفع بياناته بعد
    if (!hasSubmittedData) {
      const ownerName = profile.full_name || 'صاحب المزرعة';
      return {
        emoji: '📝',
        title: `مرحباً ${ownerName}`,
        message: 'ابدأ برفع بيانات مزرعتك من تبويب "بياناتي" لعرضها على المستثمرين',
        color: '#3B82F6',
        bgGradient: 'from-blue-50 to-indigo-50',
        icon: FileText
      };
    }

    // إذا رفع بياناته، نتحقق من حالة الطلب
    switch (profile.status) {
      case 'pending':
        return {
          emoji: '🕐',
          title: 'قيد المراجعة',
          message: 'طلبك تحت المراجعة من فريقنا المتخصص - سنرد عليك قريباً',
          color: '#F59E0B',
          bgGradient: 'from-amber-50 to-orange-50',
          icon: Clock
        };
      case 'approved':
        return {
          emoji: '✅',
          title: 'مزرعتك معتمدة',
          message: 'مزرعتك الآن معروضة للمستثمرين على المنصة',
          color: '#10B981',
          bgGradient: 'from-emerald-50 to-green-50',
          icon: CheckCircle
        };
      case 'rejected':
        return {
          emoji: '⚠️',
          title: 'يحتاج إلى تعديل',
          message: profile.rejection_reason || 'الرجاء مراجعة الملاحظات وتعديل البيانات',
          color: '#EF4444',
          bgGradient: 'from-red-50 to-pink-50',
          icon: AlertCircle
        };
      default:
        return {
          emoji: '🚀',
          title: 'مزرعتك نشطة',
          message: 'المبيعات جارية والمستثمرون يتابعون مزرعتك',
          color: '#8BC34A',
          bgGradient: 'from-green-50 to-emerald-50',
          icon: Activity
        };
    }
  };

  const statusInfo = getStatusInfo();
  const progress = farmStatus?.progress_percentage || 0;
  const StatusIcon = statusInfo.icon || Activity;

  // التحقق من رفع البيانات
  const hasSubmittedData = farmStatus?.farm_owner_id || profile?.farm_owner_id;

  const stats = [
    {
      icon: TreePine,
      label: 'إجمالي الأشجار',
      value: farmStatus?.total_trees || 0,
      suffix: 'شجرة',
      color: '#8BC34A',
      bgColor: 'rgba(139, 195, 74, 0.1)'
    },
    {
      icon: Users,
      label: 'عدد المستثمرين',
      value: farmStatus?.total_investors || 0,
      suffix: 'مستثمر',
      color: '#3B82F6',
      bgColor: 'rgba(59, 130, 246, 0.1)'
    },
    {
      icon: CheckCircle,
      label: 'الأشجار المباعة',
      value: farmStatus?.reserved_trees || 0,
      suffix: 'شجرة',
      color: '#10B981',
      bgColor: 'rgba(16, 185, 129, 0.1)'
    },
    {
      icon: TrendingUp,
      label: 'نسبة الإنجاز',
      value: progress.toFixed(1),
      suffix: '%',
      color: '#F59E0B',
      bgColor: 'rgba(245, 158, 11, 0.1)'
    }
  ];

  return (
    <div className="space-y-6">
      {/* بطاقة الترحيب العصرية */}
      <div
        className="relative rounded-3xl p-8 overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${statusInfo.color}11 0%, ${statusInfo.color}05 100%)`,
          border: `2px solid ${statusInfo.color}33`
        }}
      >
        {/* خلفية متحركة */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 right-10 w-32 h-32 rounded-full" style={{ background: statusInfo.color }} />
          <div className="absolute bottom-10 left-10 w-40 h-40 rounded-full" style={{ background: statusInfo.color }} />
        </div>

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${statusInfo.color} 0%, ${statusInfo.color}dd 100%)`,
                  boxShadow: `0 8px 24px ${statusInfo.color}44`
                }}
              >
                <StatusIcon size={32} className="text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-black mb-1" style={{ color: statusInfo.color }}>
                  {statusInfo.title}
                </h2>
                <p className="text-gray-600 text-lg">
                  {statusInfo.message}
                </p>
              </div>
            </div>

            <div className="text-left">
              <p className="text-sm text-gray-500 mb-1">التاريخ</p>
              <p className="text-xl font-bold text-gray-900">
                {currentTime.toLocaleDateString('ar-SA', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short'
                })}
              </p>
              <p className="text-sm text-gray-600">
                {currentTime.toLocaleTimeString('ar-SA', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>

          {/* معلومات إضافية */}
          {profile && (
            <div className="grid md:grid-cols-2 gap-4 mt-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200">
                <p className="text-sm text-gray-500 mb-1">اسم صاحب المزرعة</p>
                <p className="text-lg font-bold text-gray-900">
                  {profile.full_name || 'غير محدد'}
                </p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200">
                <p className="text-sm text-gray-500 mb-1">رقم الجوال</p>
                <p className="text-lg font-bold text-gray-900 dir-ltr text-right">
                  {profile.mobile_number}
                </p>
              </div>
            </div>
          )}

          {/* زر دعوة للعمل للمستخدمين الجدد */}
          {!hasSubmittedData && (
            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  const event = new CustomEvent('switchTab', { detail: 'form' });
                  window.dispatchEvent(event);
                }}
                className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl group"
                style={{
                  background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                  color: 'white',
                  boxShadow: '0 4px 16px rgba(59, 130, 246, 0.4)'
                }}
              >
                <FileText size={24} className="group-hover:scale-110 transition-transform" />
                ابدأ برفع بيانات مزرعتك الآن
                <Sparkles size={20} className="animate-pulse" />
              </button>
              <p className="text-sm text-gray-500 mt-3">
                عملية سهلة وسريعة - لن تستغرق أكثر من 5 دقائق
              </p>
            </div>
          )}
        </div>
      </div>

      {/* بطاقة إرشادية للمستخدمين الجدد */}
      {!hasSubmittedData && (
        <div className="bg-white rounded-3xl p-8 border-2 border-blue-100 shadow-lg">
          <h3 className="text-2xl font-black mb-6 text-center" style={{ color: '#3B82F6' }}>
            🎯 خطوات بسيطة للبدء
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{
                  background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                }}
              >
                <span className="text-3xl text-white font-black">1</span>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">ارفع بيانات المزرعة</h4>
              <p className="text-sm text-gray-600">
                املأ النموذج بمعلومات مزرعتك وصور واضحة
              </p>
            </div>

            <div className="text-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                }}
              >
                <span className="text-3xl text-white font-black">2</span>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">انتظر المراجعة</h4>
              <p className="text-sm text-gray-600">
                فريقنا سيراجع طلبك خلال 24-48 ساعة
              </p>
            </div>

            <div className="text-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{
                  background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
                }}
              >
                <span className="text-3xl text-white font-black">3</span>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">تابع المبيعات</h4>
              <p className="text-sm text-gray-600">
                راقب تقدم البيع واستلم أموالك بأمان
              </p>
            </div>
          </div>
        </div>
      )}

      {/* بطاقات الإحصائيات - فقط إذا كانت المزرعة مرفوعة */}
      {hasSubmittedData && (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-gray-300 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: stat.bgColor }}
                  >
                    <Icon size={24} style={{ color: stat.color }} />
                  </div>
                  <Sparkles size={20} className="text-gray-300" />
                </div>
                <p className="text-sm text-gray-500 mb-2">{stat.label}</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-black" style={{ color: stat.color }}>
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-600 font-semibold">{stat.suffix}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* شريط التقدم العصري */}
      {farmStatus?.is_published && (
        <div className="bg-white rounded-3xl p-8 border-2 border-gray-100 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
                }}
              >
                <TrendingUp size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900">تقدم المبيعات</h3>
                <p className="text-sm text-gray-500">متابعة لحظية لحالة المزرعة</p>
              </div>
            </div>
            <div className="text-left">
              <p className="text-4xl font-black" style={{ color: '#F59E0B' }}>
                {progress.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* شريط التقدم */}
          <div className="relative w-full h-6 rounded-full overflow-hidden mb-6" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
            <div
              className="h-full transition-all duration-1000 ease-out relative overflow-hidden"
              style={{
                width: `${Math.min(progress, 100)}%`,
                background: 'linear-gradient(90deg, #F59E0B 0%, #D97706 50%, #F59E0B 100%)',
                boxShadow: '0 0 20px rgba(245, 158, 11, 0.5)'
              }}
            >
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, white 50%, transparent 100%)',
                  animation: 'shimmer 2s infinite'
                }}
              />
            </div>
          </div>

          {/* معلومات التقدم */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">الأشجار المباعة</p>
              <p className="text-2xl font-black text-gray-900">
                {farmStatus.reserved_trees}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">المتبقي</p>
              <p className="text-2xl font-black text-gray-900">
                {farmStatus.total_trees - farmStatus.reserved_trees}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">الإجمالي</p>
              <p className="text-2xl font-black text-gray-900">
                {farmStatus.total_trees}
              </p>
            </div>
          </div>

          {/* رسائل التحفيز */}
          {progress >= 75 && progress < 100 && (
            <div
              className="mt-6 p-4 rounded-xl flex items-center gap-3 animate-pulse"
              style={{ background: 'linear-gradient(135deg, #F59E0B11 0%, #F59E0B05 100%)' }}
            >
              <Sparkles size={24} style={{ color: '#F59E0B' }} />
              <p className="text-lg font-bold" style={{ color: '#F59E0B' }}>
                ممتاز! قاربت على اكتمال البيع - بإذن الله قريباً
              </p>
            </div>
          )}

          {progress === 100 && (
            <div
              className="mt-6 p-4 rounded-xl flex items-center gap-3"
              style={{ background: 'linear-gradient(135deg, #10B98111 0%, #10B98105 100%)' }}
            >
              <Award size={24} style={{ color: '#10B981' }} />
              <p className="text-lg font-bold" style={{ color: '#10B981' }}>
                مبروك! اكتمل بيع جميع الأشجار - انتظر التسوية النهائية
              </p>
            </div>
          )}
        </div>
      )}

      {/* بطاقة إتمام البيع */}
      {farmStatus?.sales_status === 'completed' && (
        <div
          className="relative rounded-3xl p-8 overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #ECFDF5 0%, white 100%)',
            border: '3px solid rgba(16, 185, 129, 0.3)',
            boxShadow: '0 12px 40px rgba(16, 185, 129, 0.2)'
          }}
        >
          <div className="absolute top-4 right-4 text-8xl opacity-10">🎉</div>

          <div className="relative z-10 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4"
              style={{
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)'
              }}
            >
              <Award size={40} className="text-white" />
            </div>

            <h3 className="text-3xl font-black mb-3" style={{ color: '#10B981' }}>
              تهانينا! تم إتمام البيع بنجاح
            </h3>
            <p className="text-lg text-gray-600 mb-6">
              فريقنا سيتواصل معك قريباً لترتيب التسوية المالية النهائية
            </p>

            <div
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full"
              style={{
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
              }}
            >
              <CheckCircle size={20} className="text-white" />
              <span className="text-white font-bold">معتمد من منصة الحبر</span>
            </div>
          </div>
        </div>
      )}

      {/* روابط سريعة */}
      <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-6 border-2 border-gray-100">
        <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
          <Eye size={20} style={{ color: '#8BC34A' }} />
          روابط سريعة
        </h3>
        <div className="grid md:grid-cols-3 gap-3">
          <button
            onClick={() => {
              const event = new CustomEvent('switchTab', { detail: 'finance' });
              window.dispatchEvent(event);
            }}
            className="bg-white rounded-xl p-4 border-2 border-gray-200 hover:border-green-500 transition-all duration-300 text-right group"
          >
            <DollarSign size={20} className="text-green-600 mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-bold text-gray-900">الحالة المالية</p>
            <p className="text-xs text-gray-500">تابع دفعاتك</p>
          </button>

          <button
            onClick={() => {
              const event = new CustomEvent('switchTab', { detail: 'form' });
              window.dispatchEvent(event);
            }}
            className="bg-white rounded-xl p-4 border-2 border-gray-200 hover:border-blue-500 transition-all duration-300 text-right group"
          >
            <Activity size={20} className="text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-bold text-gray-900">بياناتي</p>
            <p className="text-xs text-gray-500">عدّل معلوماتك</p>
          </button>

          <button
            onClick={() => {
              const event = new CustomEvent('switchTab', { detail: 'notifications' });
              window.dispatchEvent(event);
            }}
            className="bg-white rounded-xl p-4 border-2 border-gray-200 hover:border-purple-500 transition-all duration-300 text-right group"
          >
            <Calendar size={20} className="text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-bold text-gray-900">الإشعارات</p>
            <p className="text-xs text-gray-500">تحديثات جديدة</p>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};
