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

    const hasSubmittedData = farmStatus?.farm_owner_id || profile.farm_owner_id;

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
    <div className="space-y-4 sm:space-y-6 pb-6">
      {/* بطاقة الترحيب */}
      <div
        className="relative rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${statusInfo.color}11 0%, ${statusInfo.color}05 100%)`,
          border: `2px solid ${statusInfo.color}33`
        }}
      >
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-5 sm:top-10 right-5 sm:right-10 w-20 sm:w-32 h-20 sm:h-32 rounded-full" style={{ background: statusInfo.color }} />
          <div className="absolute bottom-5 sm:bottom-10 left-5 sm:left-10 w-24 sm:w-40 h-24 sm:h-40 rounded-full" style={{ background: statusInfo.color }} />
        </div>

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-4 sm:mb-6">
            <div className="flex items-start gap-3 sm:gap-4 flex-1 w-full">
              <div
                className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${statusInfo.color} 0%, ${statusInfo.color}dd 100%)`,
                  boxShadow: `0 8px 24px ${statusInfo.color}44`
                }}
              >
                <StatusIcon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black mb-1 leading-tight" style={{ color: statusInfo.color }}>
                  {statusInfo.title}
                </h2>
                <p className="text-gray-600 text-sm sm:text-base md:text-lg leading-relaxed">
                  {statusInfo.message}
                </p>
              </div>
            </div>

            <div className="w-full sm:w-auto flex-shrink-0 bg-white/60 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-gray-200">
              <p className="text-xs sm:text-sm text-gray-500 mb-1">التاريخ</p>
              <p className="text-base sm:text-lg md:text-xl font-bold text-gray-900">
                {currentTime.toLocaleDateString('ar-SA', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short'
                })}
              </p>
              <p className="text-xs sm:text-sm text-gray-600">
                {currentTime.toLocaleTimeString('ar-SA', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>

          {profile && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-4 sm:mt-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200">
                <p className="text-xs sm:text-sm text-gray-500 mb-1">اسم صاحب المزرعة</p>
                <p className="text-base sm:text-lg font-bold text-gray-900 truncate">
                  {profile.full_name || 'غير محدد'}
                </p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200">
                <p className="text-xs sm:text-sm text-gray-500 mb-1">رقم الجوال</p>
                <p className="text-base sm:text-lg font-bold text-gray-900 truncate" dir="ltr">
                  {profile.mobile_number}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* الإحصائيات */}
      {hasSubmittedData && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: stat.bgColor }}
                  >
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: stat.color }} />
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">{stat.label}</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-black mb-1" style={{ color: stat.color }}>
                  {stat.value}
                </p>
                <p className="text-xs sm:text-sm text-gray-500">{stat.suffix}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* شريط التقدم */}
      {hasSubmittedData && progress > 0 && (
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg font-bold text-gray-900">تقدم المبيعات</h3>
            <span className="text-xl sm:text-2xl font-black" style={{ color: '#8BC34A' }}>
              {progress.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 sm:h-4 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #8BC34A 0%, #689F38 100%)',
                boxShadow: '0 2px 8px rgba(139, 195, 74, 0.4)'
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
