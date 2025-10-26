import React, { useState } from 'react';
import {
  Users,
  Target,
  Sparkles,
  CheckCircle,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { CorrectedFarmFinance, CorrectedFinancialService } from '../services/correctedFinancialService';

interface CorrectedFarmFinanceCardProps {
  finance: CorrectedFarmFinance;
  onExecuteSettlement?: (farmId: string) => void;
}

export function CorrectedFarmFinanceCard({ finance, onExecuteSettlement }: CorrectedFarmFinanceCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const completionPercentage = CorrectedFinancialService.calculateCompletionPercentage(
    finance.collected_from_investors,
    finance.owner_amount_target
  );

  const stageColor = CorrectedFinancialService.getStageColor(finance.stage);
  const stageLabel = CorrectedFinancialService.getStageLabel(finance.stage);

  // حساب الفائض (إن وجد)
  const surplus = finance.collected_from_investors - finance.owner_amount_target;
  const charityAmount = surplus > 0 ? surplus * 0.25 : 0;
  const platformAmount = surplus > 0 ? surplus * 0.75 : 0;

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`
          relative bg-white rounded-3xl p-8 shadow-2xl
          border-4 transition-all duration-300
          ${finance.settlement_ready && !finance.settlement_executed
            ? 'border-yellow-400 animate-pulse-slow'
            : 'border-gray-100'
          }
          ${isHovered ? 'scale-105 shadow-3xl' : ''}
        `}
      >
        {/* وميض ذهبي عند الجاهزية */}
        {finance.settlement_ready && !finance.settlement_executed && (
          <>
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-yellow-300/30 to-yellow-400/20 rounded-3xl animate-shine" />
            <div className="absolute -top-2 -right-2">
              <div className="relative">
                <Zap className="w-8 h-8 text-yellow-400 animate-bounce" />
                <div className="absolute inset-0 bg-yellow-400/50 blur-xl" />
              </div>
            </div>
          </>
        )}

        <div className="relative z-10">
          {/* الرأس */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-6 h-6 text-yellow-500" />
                <h3 className="text-2xl font-bold text-gray-900">{finance.farm_name}</h3>
              </div>
              <p className="text-sm text-gray-600">{finance.farm_code}</p>
            </div>

            {finance.settlement_executed ? (
              <CheckCircle className="w-8 h-8 text-green-500" />
            ) : finance.settlement_ready ? (
              <Zap className="w-8 h-8 text-yellow-500 animate-pulse" />
            ) : (
              <Users className="w-8 h-8 text-blue-500" />
            )}
          </div>

          {/* الحالة */}
          <div className="mb-6">
            <div className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${stageColor} rounded-full text-white font-semibold`}>
              <span>{stageLabel}</span>
            </div>
          </div>

          {/* العدادان الرئيسيان */}
          <div className="space-y-4 mb-6">
            {/* عداد المستثمرين */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">المبلغ المحصل من المستثمرين</p>
                  <p className="text-xs text-gray-500">مجموع الحجوزات</p>
                </div>
              </div>
              <p className="text-3xl font-bold text-blue-700">
                {CorrectedFinancialService.formatCurrency(finance.collected_from_investors)}
              </p>
            </div>

            {/* عداد المبلغ المطلوب */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border-2 border-emerald-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-emerald-500 rounded-lg">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">المبلغ المطلوب لصاحب المزرعة</p>
                  <p className="text-xs text-gray-500">السعر الفعلي</p>
                </div>
              </div>
              <p className="text-3xl font-bold text-emerald-700">
                {CorrectedFinancialService.formatCurrency(finance.owner_amount_target)}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">نسبة التجميع</span>
              <span className="text-sm font-bold text-gray-900">
                {CorrectedFinancialService.formatPercentage(completionPercentage)}
              </span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  completionPercentage >= 100
                    ? 'bg-gradient-to-r from-yellow-400 to-yellow-500'
                    : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                }`}
                style={{ width: `${Math.min(completionPercentage, 100)}%` }}
              />
            </div>
          </div>

          {/* زر التسوية (يظهر فقط عند الجاهزية) */}
          {finance.settlement_ready && !finance.settlement_executed && onExecuteSettlement && (
            <button
              onClick={() => onExecuteSettlement(finance.farm_id)}
              className="w-full py-4 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600
                text-white font-bold rounded-xl shadow-lg hover:shadow-2xl
                transform hover:scale-105 transition-all duration-300
                flex items-center justify-center gap-2 animate-pulse-slow"
            >
              <Zap className="w-6 h-6" />
              <span>تنفيذ التسوية المالية</span>
              <ArrowRight className="w-6 h-6" />
            </button>
          )}

          {/* زر عرض التفاصيل */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full mt-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <span>{showDetails ? 'إخفاء التفاصيل' : 'عرض التفاصيل المالية'}</span>
            <ArrowRight className={`w-5 h-5 transition-transform ${showDetails ? 'rotate-90' : ''}`} />
          </button>

          {/* التفاصيل المالية المخفية */}
          {showDetails && (
            <div className="mt-6 p-6 bg-gray-50 rounded-xl space-y-3 border-2 border-gray-200">
              <h4 className="font-bold text-gray-900 mb-4">التفاصيل المالية الكاملة</h4>

              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">المبلغ المحصل:</span>
                <span className="font-bold text-gray-900">
                  {CorrectedFinancialService.formatCurrency(finance.collected_from_investors)}
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">المبلغ المطلوب:</span>
                <span className="font-bold text-gray-900">
                  {CorrectedFinancialService.formatCurrency(finance.owner_amount_target)}
                </span>
              </div>

              {surplus > 0 && (
                <>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">الفائض:</span>
                    <span className="font-bold text-green-600">
                      {CorrectedFinancialService.formatCurrency(surplus)}
                    </span>
                  </div>

                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">محفظة الخير (25%):</span>
                    <span className="font-bold text-purple-600">
                      {CorrectedFinancialService.formatCurrency(charityAmount)}
                    </span>
                  </div>

                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">المنصة (75%):</span>
                    <span className="font-bold text-blue-600">
                      {CorrectedFinancialService.formatCurrency(platformAmount)}
                    </span>
                  </div>
                </>
              )}

              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">المحوّل للمالك:</span>
                <span className="font-bold text-emerald-600">
                  {CorrectedFinancialService.formatCurrency(finance.owner_amount_transferred)}
                </span>
              </div>

              <div className="flex justify-between py-2">
                <span className="text-gray-600">الحالة:</span>
                <span className="font-bold text-gray-900">{stageLabel}</span>
              </div>
            </div>
          )}
        </div>

        {/* تأثير اللمعان عند الـ hover */}
        {isHovered && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shine pointer-events-none rounded-3xl" />
        )}
      </div>
    </div>
  );
}
