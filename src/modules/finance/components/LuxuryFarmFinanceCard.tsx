import React, { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  Users,
  Heart,
  BarChart3,
  CheckCircle,
  Clock,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { FarmFinanceData, FinancialCoreService } from '../services/financialCoreService';

interface LuxuryFarmFinanceCardProps {
  finance: FarmFinanceData;
  onClick?: () => void;
}

export function LuxuryFarmFinanceCard({ finance, onClick }: LuxuryFarmFinanceCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  const statusColor = FinancialCoreService.getStatusColor(finance.financial_status);
  const profitColor = FinancialCoreService.getProfitColor(finance.profit_percentage);
  const statusLabel = FinancialCoreService.getStatusLabel(finance.financial_status);

  // حساب الخير (25% من الربح)
  const charityAmount = finance.net_profit * 0.25;
  const platformProfit = finance.net_profit - charityAmount;

  const handleFlip = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFlipped(!isFlipped);
  };

  return (
    <div
      className="relative perspective-1000"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`
          relative w-full transition-all duration-700 transform-style-3d
          ${isFlipped ? 'rotate-y-180' : ''}
          ${isHovered ? 'scale-105' : ''}
        `}
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0)',
        }}
      >
        {/* الوجه الأمامي */}
        <div
          className="absolute w-full h-full backface-hidden"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div
            onClick={onClick}
            className={`
              relative bg-gradient-to-br ${statusColor}
              rounded-3xl p-8 shadow-2xl cursor-pointer
              border-4 border-white/20
              overflow-hidden
              transition-all duration-300
            `}
          >
            {/* خلفية متدرجة */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10 pointer-events-none" />

            {/* زخرفة ذهبية */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-400/20 to-transparent rounded-full -translate-y-16 translate-x-16" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-yellow-400/20 to-transparent rounded-full translate-y-20 -translate-x-20" />

            <div className="relative z-10">
              {/* الرأس */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-6 h-6 text-yellow-300" />
                    <h3 className="text-2xl font-bold text-white">{finance.farm_name}</h3>
                  </div>
                  <p className="text-sm text-white/70">{finance.farm_code}</p>
                </div>

                {finance.financial_status === 'completed' ? (
                  <CheckCircle className="w-8 h-8 text-green-300" />
                ) : (
                  <Clock className="w-8 h-8 text-blue-300" />
                )}
              </div>

              {/* الحالة */}
              <div className="flex items-center gap-3 mb-6">
                <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white font-semibold">
                  {statusLabel}
                </span>
                <span className="px-4 py-2 bg-yellow-400/30 backdrop-blur-sm rounded-full text-white font-semibold">
                  {FinancialCoreService.formatPercentage(finance.profit_percentage)} ربح
                </span>
              </div>

              {/* الأسعار */}
              <div className="space-y-4 mb-6">
                {/* السعر الفعلي */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
                  <p className="text-xs text-white/70 mb-1">السعر الفعلي (من المالك)</p>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-white" />
                    <p className="text-xl font-bold text-white">
                      {FinancialCoreService.formatCurrency(finance.actual_price)}
                    </p>
                  </div>
                </div>

                {/* السعر التسويقي */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
                  <p className="text-xs text-white/70 mb-1">السعر التسويقي</p>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-300" />
                    <p className="text-xl font-bold text-white">
                      {FinancialCoreService.formatCurrency(finance.marketing_price)}
                    </p>
                  </div>
                </div>

                {/* الربح الصافي */}
                <div className={`bg-gradient-to-r ${profitColor} rounded-2xl p-4 shadow-lg`}>
                  <p className="text-xs text-white/90 mb-1">الربح الصافي (محسوب تلقائياً)</p>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-300" />
                    <p className="text-2xl font-bold text-white">
                      {FinancialCoreService.formatCurrency(finance.net_profit)}
                    </p>
                  </div>
                  <p className="text-xs text-white/80 mt-1">
                    نسبة الربح: {FinancialCoreService.formatPercentage(finance.profit_percentage)}
                  </p>
                </div>
              </div>

              {/* توزيع الربح */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {/* محفظة الخير */}
                <div className="bg-purple-500/30 backdrop-blur-lg rounded-xl p-3 border border-purple-300/30">
                  <div className="flex items-center gap-2 mb-1">
                    <Heart className="w-4 h-4 text-purple-200" />
                    <p className="text-xs text-white/80">الخير (25%)</p>
                  </div>
                  <p className="text-sm font-bold text-white">
                    {FinancialCoreService.formatCurrency(charityAmount)}
                  </p>
                </div>

                {/* صافي ربح المنصة */}
                <div className="bg-green-500/30 backdrop-blur-lg rounded-xl p-3 border border-green-300/30">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-green-200" />
                    <p className="text-xs text-white/80">المنصة (75%)</p>
                  </div>
                  <p className="text-sm font-bold text-white">
                    {FinancialCoreService.formatCurrency(platformProfit)}
                  </p>
                </div>
              </div>

              {/* الإحصائيات */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                  <Users className="w-5 h-5 text-blue-300 mx-auto mb-1" />
                  <p className="text-xs text-white/70">المستثمرون</p>
                  <p className="text-lg font-bold text-white">{finance.total_investors}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                  <BarChart3 className="w-5 h-5 text-green-300 mx-auto mb-1" />
                  <p className="text-xs text-white/70">الأشجار</p>
                  <p className="text-lg font-bold text-white">{finance.total_trees_sold.toLocaleString('ar')}</p>
                </div>
              </div>

              {/* زر التفاصيل */}
              <button
                onClick={handleFlip}
                className="mt-6 w-full py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl text-white font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <span>عرض التفاصيل المالية</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* تأثير اللمعان عند الـ hover */}
            {isHovered && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shine pointer-events-none" />
            )}
          </div>
        </div>

        {/* الوجه الخلفي - التفاصيل المالية */}
        <div
          className="absolute w-full h-full backface-hidden"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 shadow-2xl border-4 border-white/20 overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">التفاصيل المالية</h3>
                <button
                  onClick={handleFlip}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors"
                >
                  العودة
                </button>
              </div>

              <div className="space-y-4 text-white">
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/70">السعر الفعلي:</span>
                  <span className="font-bold">{FinancialCoreService.formatCurrency(finance.actual_price)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/70">السعر التسويقي:</span>
                  <span className="font-bold">{FinancialCoreService.formatCurrency(finance.marketing_price)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/70">الفرق (الربح):</span>
                  <span className="font-bold text-green-400">{FinancialCoreService.formatCurrency(finance.net_profit)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/70">نسبة الربح:</span>
                  <span className="font-bold text-green-400">{FinancialCoreService.formatPercentage(finance.profit_percentage)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/70">محفظة الخير (25%):</span>
                  <span className="font-bold text-purple-400">{FinancialCoreService.formatCurrency(charityAmount)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/70">ربح المنصة (75%):</span>
                  <span className="font-bold text-green-400">{FinancialCoreService.formatCurrency(platformProfit)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/70">الإيرادات المحصلة:</span>
                  <span className="font-bold">{FinancialCoreService.formatCurrency(finance.total_revenue_collected)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/70">نسبة الإكمال:</span>
                  <span className="font-bold">{FinancialCoreService.formatPercentage(finance.financial_completion_percentage)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-white/70">الحالة:</span>
                  <span className="font-bold">{statusLabel}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
