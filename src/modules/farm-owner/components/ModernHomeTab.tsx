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
  FileText,
  ArrowUpRight,
  Star,
  Zap,
  Target,
  ShieldCheck,
  TrendingDown,
  BarChart3,
  Smartphone,
  Upload,
  ChevronLeft,
  Rocket,
  CheckSquare
} from 'lucide-react';
import { FarmOwnerProfile, FarmStatus } from '../services/farmOwnerService';

interface ModernHomeTabProps {
  profile: FarmOwnerProfile | null;
  farmStatus: FarmStatus | null;
  onNavigateToData?: () => void;
}

export const ModernHomeTab: React.FC<ModernHomeTabProps> = ({ profile, farmStatus, onNavigateToData }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('farm_owner_welcome_seen');
    if (!hasSeenWelcome && profile) {
      setTimeout(() => {
        localStorage.setItem('farm_owner_welcome_seen', 'true');
      }, 3000);
    } else {
      setShowWelcome(false);
    }
  }, [profile]);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'صباح الخير';
    if (hour < 18) return 'مساء الخير';
    return 'مساء الخير';
  };

  const getStatusInfo = () => {
    if (!profile) return {
      emoji: '⏳',
      title: 'جاري التحميل...',
      message: '',
      color: '#9CA3AF',
      bgGradient: 'from-gray-50 to-gray-100',
      icon: Clock
    };

    const hasSubmittedData = farmStatus?.farm_owner_id || profile.farm_owner_id;

    if (!hasSubmittedData) {
      const ownerName = profile.full_name || 'صاحب المزرعة';
      return {
        emoji: '🚀',
        title: `${getGreeting()} ${ownerName}`,
        message: 'انطلق الآن نحو النجاح',
        submessage: 'ابدأ برفع بيانات مزرعتك وشاركها مع آلاف المستثمرين',
        color: '#3B82F6',
        bgGradient: 'from-blue-50 to-indigo-50',
        icon: Rocket
      };
    }

    switch (profile.status) {
      case 'pending':
        return {
          emoji: '⏰',
          title: 'طلبك قيد المراجعة',
          message: 'نعمل على مراجعة بياناتك',
          submessage: 'سنتواصل معك خلال 24 ساعة',
          color: '#F59E0B',
          bgGradient: 'from-amber-50 to-orange-50',
          icon: Clock
        };
      case 'approved':
        return {
          emoji: '🎉',
          title: 'مبروك! مزرعتك معتمدة',
          message: 'مزرعتك الآن متاحة للجميع',
          submessage: 'المستثمرون يمكنهم مشاهدة مزرعتك والحجز',
          color: '#10B981',
          bgGradient: 'from-emerald-50 to-green-50',
          icon: Award
        };
      case 'rejected':
        return {
          emoji: '📝',
          title: 'يحتاج إلى تعديل',
          message: profile.rejection_reason || 'الرجاء تحديث البيانات',
          submessage: 'راجع الملاحظات وعدّل البيانات',
          color: '#EF4444',
          bgGradient: 'from-red-50 to-pink-50',
          icon: AlertCircle
        };
      default:
        return {
          emoji: '✨',
          title: `${getGreeting()} ${profile.full_name || 'صاحب المزرعة'}`,
          message: 'مزرعتك في تقدم مستمر',
          submessage: 'استمر في النجاح وتابع رحلتك',
          color: '#8BC34A',
          bgGradient: 'from-green-50 to-emerald-50',
          icon: TrendingUp
        };
    }
  };

  const statusInfo = getStatusInfo();
  const progress = farmStatus?.progress_percentage || 0;
  const StatusIcon = statusInfo.icon || Activity;
  const hasSubmittedData = farmStatus?.farm_owner_id || profile?.farm_owner_id;

  const mainStats = [
    {
      icon: TreePine,
      label: 'إجمالي الأشجار',
      value: farmStatus?.total_trees || 0,
      suffix: 'شجرة',
      color: '#8BC34A',
      bgColor: 'rgba(139, 195, 74, 0.1)',
      change: null
    },
    {
      icon: CheckCircle,
      label: 'الأشجار المباعة',
      value: farmStatus?.reserved_trees || 0,
      suffix: 'شجرة',
      color: '#10B981',
      bgColor: 'rgba(16, 185, 129, 0.1)',
      change: '+12%'
    },
    {
      icon: Users,
      label: 'عدد المستثمرين',
      value: farmStatus?.total_investors || 0,
      suffix: 'مستثمر',
      color: '#3B82F6',
      bgColor: 'rgba(59, 130, 246, 0.1)',
      change: '+5'
    },
    {
      icon: DollarSign,
      label: 'نسبة الإنجاز',
      value: progress.toFixed(1),
      suffix: '%',
      color: '#F59E0B',
      bgColor: 'rgba(245, 158, 11, 0.1)',
      change: progress > 50 ? '+' : null
    }
  ];

  const quickActions = [
    {
      icon: FileText,
      label: 'تحديث البيانات',
      description: 'تعديل معلومات المزرعة',
      color: '#3B82F6',
      action: 'data'
    },
    {
      icon: BarChart3,
      label: 'التقارير المالية',
      description: 'عرض الأرباح والمدفوعات',
      color: '#10B981',
      action: 'finance'
    },
    {
      icon: Eye,
      label: 'المستثمرون',
      description: 'قائمة المستثمرين',
      color: '#F59E0B',
      action: 'investors'
    },
    {
      icon: Target,
      label: 'الحجوزات',
      description: 'إدارة الطلبات',
      color: '#8B5CF6',
      action: 'bookings'
    }
  ];

  const insights = [
    {
      icon: TrendingUp,
      title: 'أداء ممتاز',
      description: 'مزرعتك تحقق نمواً مستمراً في المبيعات',
      color: '#10B981',
      show: progress > 50
    },
    {
      icon: Users,
      title: 'زيادة الطلب',
      description: 'المستثمرون يتابعون مزرعتك بنشاط',
      color: '#3B82F6',
      show: (farmStatus?.total_investors || 0) > 10
    },
    {
      icon: Star,
      title: 'توصية',
      description: 'أضف صور جديدة لجذب المزيد من المستثمرين',
      color: '#F59E0B',
      show: hasSubmittedData
    }
  ];

  const setupSteps = [
    { label: 'إنشاء الحساب', completed: true },
    { label: 'رفع بيانات المزرعة', completed: hasSubmittedData },
    { label: 'المراجعة والاعتماد', completed: profile?.status === 'approved' },
    { label: 'استقبال الحجوزات', completed: (farmStatus?.total_investors || 0) > 0 }
  ];

  const completedSteps = setupSteps.filter(s => s.completed).length;
  const setupProgress = (completedSteps / setupSteps.length) * 100;

  return (
    <div className="space-y-4 sm:space-y-6 pb-6">
      {/* Call to Action Banner - Only show if no data submitted */}
      {!hasSubmittedData && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 p-4 sm:p-6 text-white shadow-xl animate-pulse-slow">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full blur-2xl animate-float" />
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-white rounded-full blur-2xl animate-float-delayed" />
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30 animate-bounce-slow">
              <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>

            <div className="flex-1 text-center sm:text-right">
              <h3 className="text-lg sm:text-xl font-black mb-1">ابدأ الآن برفع بيانات مزرعتك!</h3>
              <p className="text-sm sm:text-base text-white/90">
                خطوة واحدة تفصلك عن الوصول لآلاف المستثمرين المهتمين
              </p>
            </div>

            <button
              onClick={onNavigateToData}
              className="flex-shrink-0 bg-white text-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 group"
            >
              <span>ارفع البيانات</span>
              <ChevronLeft className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      )}

      {/* Setup Progress Bar */}
      {!hasSubmittedData && (
        <div className="bg-white rounded-2xl p-4 sm:p-6 border-2 border-blue-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-blue-600" />
              <h3 className="text-base sm:text-lg font-bold text-gray-900">خطوات البداية</h3>
            </div>
            <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              {completedSteps} / {setupSteps.length}
            </span>
          </div>

          <div className="space-y-3">
            {setupSteps.map((step, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  step.completed
                    ? 'bg-green-500 border-green-500'
                    : 'bg-gray-100 border-gray-300'
                }`}>
                  {step.completed ? (
                    <CheckCircle className="w-5 h-5 text-white" />
                  ) : (
                    <span className="text-xs font-bold text-gray-500">{index + 1}</span>
                  )}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${
                    step.completed ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {step.label}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r from-blue-500 to-cyan-500"
                style={{ width: `${setupProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Hero Welcome Card */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 p-6 sm:p-8 md:p-10 text-white shadow-2xl">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-48 sm:w-72 h-48 sm:h-72 bg-white rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row items-start justify-between gap-4 sm:gap-6">
            <div className="flex-1 w-full">
              <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                  <StatusIcon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-white/80 mb-1">مرحباً بك في لوحة التحكم</p>
                  <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black leading-tight break-words">
                    {statusInfo.emoji} {statusInfo.title}
                  </h1>
                </div>
              </div>

              <div className="space-y-2 mb-4 sm:mb-6">
                <p className="text-base sm:text-lg md:text-xl font-bold text-white leading-relaxed">
                  {statusInfo.message}
                </p>
                {statusInfo.submessage && (
                  <p className="text-sm sm:text-base text-white/80 leading-relaxed">
                    {statusInfo.submessage}
                  </p>
                )}
              </div>

              {profile && (
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl px-3 py-2 sm:px-4 border border-white/30">
                    <p className="text-xs text-white/70">صاحب المزرعة</p>
                    <p className="text-sm font-bold truncate max-w-[120px] sm:max-w-none">
                      {profile.full_name || 'غير محدد'}
                    </p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl px-3 py-2 sm:px-4 border border-white/30">
                    <p className="text-xs text-white/70">رقم الجوال</p>
                    <p className="text-sm font-bold" dir="ltr">{profile.mobile_number}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Live Clock - Hidden on mobile for space */}
            <div className="hidden sm:block bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/30 min-w-[160px] sm:min-w-[200px] flex-shrink-0">
              <div className="text-center">
                <p className="text-xs text-white/70 mb-2">التاريخ والوقت</p>
                <p className="text-xl sm:text-2xl font-black mb-1">
                  {currentTime.toLocaleTimeString('ar-SA', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
                <p className="text-xs sm:text-sm text-white/90">
                  {currentTime.toLocaleDateString('ar-SA', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Statistics */}
      {hasSubmittedData && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {mainStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300 group"
              >
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div
                    className="w-10 h-10 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                    style={{ backgroundColor: stat.bgColor }}
                  >
                    <Icon className="w-5 h-5 sm:w-7 sm:h-7" style={{ color: stat.color }} />
                  </div>
                  {stat.change && (
                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                      {stat.change}
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">{stat.label}</p>
                <div className="flex items-baseline gap-1 sm:gap-2">
                  <p className="text-xl sm:text-2xl md:text-3xl font-black" style={{ color: stat.color }}>
                    {stat.value}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">{stat.suffix}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Progress Bar */}
      {hasSubmittedData && progress > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-green-100">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-green-100 flex items-center justify-center">
                <Target className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900">تقدم المبيعات</h3>
                <p className="text-xs sm:text-sm text-gray-600">نحو الهدف المحدد</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl sm:text-3xl font-black text-green-600">{progress.toFixed(1)}%</p>
              <p className="text-xs text-gray-500">من الهدف</p>
            </div>
          </div>
          <div className="relative w-full bg-green-100 rounded-full h-3 sm:h-4 overflow-hidden">
            <div
              className="absolute top-0 right-0 h-full rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #10B981 0%, #059669 100%)',
                boxShadow: '0 2px 12px rgba(16, 185, 129, 0.4)'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3 flex justify-between text-xs text-gray-600">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {hasSubmittedData && (
        <div>
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">إجراءات سريعة</h3>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  className="bg-white rounded-xl p-4 sm:p-5 border-2 border-gray-100 hover:border-gray-300 hover:shadow-lg transition-all duration-300 text-right group"
                >
                  <div
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl mb-2 sm:mb-3 flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                    style={{ backgroundColor: `${action.color}15` }}
                  >
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: action.color }} />
                  </div>
                  <p className="text-sm sm:text-base font-bold text-gray-900 mb-1">{action.label}</p>
                  <p className="text-xs text-gray-600 line-clamp-2">{action.description}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Insights & Tips */}
      {hasSubmittedData && (
        <div>
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">رؤى ونصائح</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            {insights.filter(i => i.show).map((insight, index) => {
              const Icon = insight.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl p-4 sm:p-5 border-2 border-gray-100 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${insight.color}15` }}
                    >
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: insight.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm sm:text-base font-bold text-gray-900 mb-1">{insight.title}</p>
                      <p className="text-xs sm:text-sm text-gray-600">{insight.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Platform Badge */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 flex-shrink-0">
              <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7 text-green-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base sm:text-lg font-bold mb-1">منصة موثوقة ومضمونة</p>
              <p className="text-xs sm:text-sm text-white/70">حماية كاملة لبياناتك ومعاملاتك المالية</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Smartphone className="w-4 h-4 sm:w-5 sm:h-5 text-white/60" />
            <Award className="w-4 h-4 sm:w-5 sm:h-5 text-white/60" />
            <Star className="w-4 h-4 sm:w-5 sm:h-5 text-white/60" />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float 6s ease-in-out 3s infinite;
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.95; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
