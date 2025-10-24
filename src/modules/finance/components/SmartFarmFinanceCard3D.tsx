import React, { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  Users,
  Trees,
  Heart,
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  ArrowRight,
  Briefcase
} from 'lucide-react';
import { SmartFarmFinance, SmartFinanceService } from '../services/smartFinanceService';
import { LiveFinancialStatsCard } from './LiveFinancialStatsCard';
import { FarmFinancialProfileModal } from './FarmFinancialProfileModal';

interface SmartFarmFinanceCard3DProps {
  finance: SmartFarmFinance;
  onClick?: (finance: SmartFarmFinance) => void;
}

export function SmartFarmFinanceCard3D({ finance, onClick }: SmartFarmFinanceCard3DProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [showFinancialProfile, setShowFinancialProfile] = useState(false);

  const coverage = Number(finance.coverage_percentage);
  const coverageColor = SmartFinanceService.getCoverageColor(coverage);
  const statusColor = SmartFinanceService.getStatusColor(finance.status);
  const stageIcon = SmartFinanceService.getStageIcon(finance.completion_stage);
  const stageLabel = SmartFinanceService.getStageLabel(finance.completion_stage);

  const handleCardClick = () => {
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 300);

    setTimeout(() => {
      if (onClick) {
        onClick(finance);
      }
    }, 150);
  };

  const handleFlip = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFlipped(!isFlipped);
  };

  return (
    <div
      className="relative w-full h-auto perspective-1000"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`relative w-full h-full transition-all duration-700 transform-style-3d ${
          isFlipped ? 'rotate-y-180' : ''
        } ${isHovered ? 'scale-105' : ''}`}
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0)',
        }}
      >
        {/* الوجه الأمامي */}
        <div
          onClick={handleCardClick}
          className="absolute w-full h-full backface-hidden cursor-pointer group"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className={`h-full rounded-2xl bg-gradient-to-br ${statusColor} p-6 shadow-2xl border-4 border-yellow-400/30 relative overflow-hidden transition-all duration-300 ${isClicked ? 'scale-95' : ''}`}>
            {/* خلفية ذهبية متدرجة */}
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-transparent to-green-500/10 pointer-events-none" />

            {/* ومضة ذهبية عند النقر */}
            {isClicked && (
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/40 via-amber-300/40 to-yellow-400/40 animate-pulse pointer-events-none rounded-2xl" />
            )}

            {/* توهج عند Hover */}
            {isHovered && (
              <div className="absolute inset-0 bg-yellow-400/10 rounded-2xl pointer-events-none animate-pulse" />
            )}

            {/* الشعار في الخلفية */}
            <div className="absolute top-4 right-4 opacity-10">
              <Trees size={120} className="text-white" />
            </div>

            {/* الرأس */}
            <div className="relative z-10 mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Trees className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{finance.farm_name}</h3>
                    <p className="text-sm text-white/80">{finance.farm_code}</p>
                  </div>
                </div>
                <button
                  onClick={handleFlip}
                  className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-white text-sm font-medium hover:bg-white/30 transition-colors"
                >
                  عرض الباركود
                </button>
              </div>

              <div className="flex items-center gap-2 text-white/90 text-sm">
                <Users size={16} />
                <span>المالك: {finance.owner_name}</span>
              </div>
            </div>

            {/* نسبة التغطية الكبيرة */}
            <div className="relative z-10 mb-6">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/80 text-sm">نسبة التغطية</span>
                  <span className="text-white/80 text-sm">{stageIcon} {stageLabel}</span>
                </div>
                <div className="flex items-end gap-2 mb-3">
                  <span className="text-5xl font-bold text-white">{coverage.toFixed(1)}</span>
                  <span className="text-2xl text-white/80 mb-2">%</span>
                </div>

                {/* شريط التقدم */}
                <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${coverageColor} transition-all duration-1000 ease-out relative`}
                    style={{ width: `${Math.min(coverage, 100)}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                  </div>
                </div>
              </div>
            </div>

            {/* المبالغ */}
            <div className="relative z-10 grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/20">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp size={16} className="text-green-300" />
                  <span className="text-xs text-white/70">التسويقي</span>
                </div>
                <p className="text-lg font-bold text-white">
                  {SmartFinanceService.formatCurrency(Number(finance.marketing_amount))}
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/20">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign size={16} className="text-yellow-300" />
                  <span className="text-xs text-white/70">الفعلي</span>
                </div>
                <p className="text-lg font-bold text-white">
                  {SmartFinanceService.formatCurrency(Number(finance.actual_amount))}
                </p>
              </div>
            </div>

            {/* الأرباح والخير */}
            {Number(finance.platform_profit) > 0 && (
              <div className="relative z-10 grid grid-cols-2 gap-3">
                <div className="bg-green-500/20 backdrop-blur-md rounded-lg p-3 border border-green-400/30">
                  <div className="flex items-center gap-2 mb-1">
                    <BarChart3 size={16} className="text-green-300" />
                    <span className="text-xs text-white/70">ربح المنصة</span>
                  </div>
                  <p className="text-sm font-bold text-white">
                    {SmartFinanceService.formatCurrency(Number(finance.net_platform_profit))}
                  </p>
                </div>

                <div className="bg-pink-500/20 backdrop-blur-md rounded-lg p-3 border border-pink-400/30">
                  <div className="flex items-center gap-2 mb-1">
                    <Heart size={16} className="text-pink-300" />
                    <span className="text-xs text-white/70">الخير 25%</span>
                  </div>
                  <p className="text-sm font-bold text-white">
                    {SmartFinanceService.formatCurrency(Number(finance.charity_amount))}
                  </p>
                </div>
              </div>
            )}

            {/* زر الوصول السريع للملف المالي */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                console.log('🔥 Opening Financial Profile for:', finance.farm_name_ar);
                setShowFinancialProfile(true);
              }}
              className="relative z-10 mt-4 w-full p-3 rounded-xl font-bold text-white shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #D4AF37 0%, #FFD700 50%, #D4AF37 100%)',
                boxShadow: '0 8px 20px rgba(212, 175, 55, 0.4)',
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
              }}
            >
              <Briefcase className="w-5 h-5" />
              <span>الدخول إلى إدارة المالية الخاصة</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* الإحصائيات السفلية */}
            <div className="relative z-10 mt-4 flex items-center justify-between text-white/80 text-xs">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Users size={14} />
                  <span>{finance.total_investors} مستثمر</span>
                </div>
                <div className="flex items-center gap-1">
                  <Trees size={14} />
                  <span>{finance.total_trees_sold} شجرة</span>
                </div>
              </div>
              {finance.last_transaction_date && (
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  <span>{new Date(finance.last_transaction_date).toLocaleDateString('ar-SA')}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* الإحصاء المالي اللحظي - يظهر دائماً تحت البطاقة */}
        {!isFlipped && (
          <div className="absolute -bottom-2 left-0 right-0 z-20 transform translate-y-full pt-4">
            <LiveFinancialStatsCard
              farmCode={finance.farm_code}
              collectedFromInvestors={Number(finance.collected_from_investors || 0)}
              remainingForOwner={Number(finance.remaining_for_owner || 0)}
              actualAmount={Number(finance.actual_amount)}
              visualPercentage={Number(finance.completion_percentage_visual || 0)}
              healthStatus={finance.financial_health_status as any || 'low'}
              flashShown={finance.completion_flash_shown || false}
            />
          </div>
        )}

        {/* الوجه الخلفي (الباركود) */}
        <div
          className="absolute w-full h-full backface-hidden"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <div className="h-full rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 p-6 shadow-2xl border-4 border-yellow-400/30 relative overflow-hidden">
            {/* خطوط الباركود في الخلفية */}
            <div className="absolute inset-0 opacity-5">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="h-full bg-white"
                  style={{
                    width: Math.random() * 10 + 2,
                    marginLeft: Math.random() * 30 + 10,
                    display: 'inline-block',
                  }}
                />
              ))}
            </div>

            {/* المحتوى */}
            <div className="relative z-10 h-full flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">البطاقة المالية</h3>
                <button
                  onClick={handleFlip}
                  className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg text-white text-sm font-medium hover:bg-white/20 transition-colors"
                >
                  العودة
                </button>
              </div>

              {/* الباركود */}
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="bg-white p-6 rounded-xl shadow-lg">
                  <div className="flex gap-1">
                    {[...Array(12)].map((_, i) => (
                      <div
                        key={i}
                        className="bg-black"
                        style={{
                          width: Math.random() * 8 + 3,
                          height: 80,
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-center text-black font-mono text-sm mt-3">
                    {finance.financial_barcode}
                  </p>
                </div>

                {/* ملخص التحويلات الثلاثة */}
                <div className="mt-6 space-y-3 w-full">
                  <div className="text-white text-center mb-2 text-sm font-bold">
                    📊 ملخص التحويلات
                  </div>

                  {/* 1. تحصيل المستثمرين */}
                  <div className="bg-green-500/20 backdrop-blur-md rounded-lg p-3 border border-green-400/30">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <TrendingUp size={16} className="text-green-300" />
                        <span className="text-white/80 text-xs">تحصيل المستثمرين</span>
                      </div>
                      <span className="text-green-300 text-xs">✅</span>
                    </div>
                    <p className="text-white font-bold text-sm">
                      {SmartFinanceService.formatCurrency(Number(finance.marketing_amount))}
                    </p>
                  </div>

                  {/* 2. سداد صاحب المزرعة */}
                  <div className={`backdrop-blur-md rounded-lg p-3 border ${
                    finance.owner_payment_date
                      ? 'bg-blue-500/20 border-blue-400/30'
                      : 'bg-gray-500/20 border-gray-400/30'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <DollarSign size={16} className={finance.owner_payment_date ? "text-blue-300" : "text-gray-400"} />
                        <span className="text-white/80 text-xs">سداد المالك</span>
                      </div>
                      <span className="text-xs">
                        {finance.owner_payment_date ? '✅' : '⏳'}
                      </span>
                    </div>
                    <p className={`font-bold text-sm ${finance.owner_payment_date ? 'text-white' : 'text-gray-400'}`}>
                      {SmartFinanceService.formatCurrency(Number(finance.actual_amount))}
                    </p>
                    {finance.owner_payment_date && (
                      <p className="text-white/60 text-xs mt-1">
                        {new Date(finance.owner_payment_date).toLocaleDateString('ar-SA')}
                      </p>
                    )}
                  </div>

                  {/* 3. أرباح المنصة واستقطاع الخير */}
                  {Number(finance.platform_profit) > 0 ? (
                    <div className="bg-yellow-500/20 backdrop-blur-md rounded-lg p-3 border border-yellow-400/30">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <BarChart3 size={16} className="text-yellow-300" />
                          <span className="text-white/80 text-xs">أرباح المنصة</span>
                        </div>
                        <span className="text-yellow-300 text-xs">✅</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-white/70 text-xs">إجمالي الربح:</span>
                          <span className="text-white font-bold text-xs">
                            {SmartFinanceService.formatCurrency(Number(finance.platform_profit))}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-pink-300 text-xs flex items-center gap-1">
                            <Heart size={12} />
                            الخير (25%):
                          </span>
                          <span className="text-pink-300 font-bold text-xs">
                            {SmartFinanceService.formatCurrency(Number(finance.charity_amount))}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pt-1 border-t border-white/20">
                          <span className="text-green-300 text-xs">صافي المنصة:</span>
                          <span className="text-green-300 font-bold text-xs">
                            {SmartFinanceService.formatCurrency(Number(finance.net_platform_profit))}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-500/20 backdrop-blur-md rounded-lg p-3 border border-gray-400/30">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <BarChart3 size={16} className="text-gray-400" />
                          <span className="text-white/80 text-xs">أرباح المنصة</span>
                        </div>
                        <span className="text-gray-400 text-xs">⏳</span>
                      </div>
                      <p className="text-gray-400 font-bold text-xs">
                        لم يتم التحصيل بعد
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Profile Modal */}
      {showFinancialProfile && (
        <FarmFinancialProfileModal
          farmId={finance.farm_id}
          farmName={finance.farm_name_ar}
          onClose={() => setShowFinancialProfile(false)}
        />
      )}
    </div>
  );
}
