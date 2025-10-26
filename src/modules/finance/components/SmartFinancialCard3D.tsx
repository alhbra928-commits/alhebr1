import React, { useState } from 'react';
import {
  Users,
  Target,
  Sparkles,
  Zap,
  X,
  Wallet,
  TrendingUp,
  Heart,
  Building2,
  Activity,
  CheckCircle,
  Clock,
  Archive,
} from 'lucide-react';
import { CorrectedFarmFinance, CorrectedFinancialService } from '../services/correctedFinancialService';

interface SmartFinancialCard3DProps {
  finance: CorrectedFarmFinance;
  onExecuteSettlement?: (farmId: string) => void;
  onArchive?: (farmId: string) => void;
  hasArchivePermission?: boolean;
}

export function SmartFinancialCard3D({
  finance,
  onExecuteSettlement,
  onArchive,
  hasArchivePermission = false
}: SmartFinancialCard3DProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const completionPercentage = CorrectedFinancialService.calculateCompletionPercentage(
    finance.collected_from_investors,
    finance.owner_amount_target
  );

  // حساب الفائض والتوزيعات
  const surplus = finance.collected_from_investors - finance.owner_amount_target;
  const charityAmount = surplus > 0 ? surplus * 0.25 : 0;
  const platformAmount = surplus > 0 ? surplus * 0.75 : 0;

  return (
    <>
      {/* البطاقة الخارجية - فقط الإحصائيات */}
      <div
        className="relative cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setShowModal(true)}
      >
        <div
          className={`
            relative bg-white rounded-3xl p-8 shadow-2xl
            border-4 transition-all duration-500
            ${finance.settlement_ready && !finance.settlement_executed
              ? 'border-yellow-400 shadow-yellow-200'
              : 'border-gray-100'
            }
            ${isHovered ? 'scale-105 shadow-3xl -translate-y-2' : ''}
          `}
          style={{
            transformStyle: 'preserve-3d',
            transform: isHovered ? 'rotateX(5deg) rotateY(5deg)' : 'rotateX(0) rotateY(0)',
          }}
        >
          {/* وميض ذهبي عند الجاهزية */}
          {finance.settlement_ready && !finance.settlement_executed && (
            <>
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-yellow-300/30 to-yellow-400/20 rounded-3xl animate-shine" />
              <div className="absolute -top-3 -right-3">
                <div className="relative">
                  <Zap className="w-10 h-10 text-yellow-400 animate-bounce" />
                  <div className="absolute inset-0 bg-yellow-400/50 blur-xl animate-pulse" />
                </div>
              </div>
            </>
          )}

          <div className="relative z-10">
            {/* الرأس */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-7 h-7 text-yellow-500" />
                  <h3 className="text-2xl font-bold text-gray-900">{finance.farm_name}</h3>
                </div>
                <p className="text-sm text-gray-600 font-mono">{finance.farm_code}</p>
              </div>

              {finance.settlement_executed ? (
                <CheckCircle className="w-10 h-10 text-green-500" />
              ) : finance.settlement_ready ? (
                <Zap className="w-10 h-10 text-yellow-500 animate-pulse" />
              ) : (
                <Clock className="w-10 h-10 text-blue-500" />
              )}
            </div>

            {/* العدادان الرئيسيان فقط */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* عداد المستثمرين */}
              <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-5 text-white shadow-lg">
                <Users className="w-6 h-6 mb-3 opacity-80" />
                <p className="text-xs mb-1 opacity-90">المحصل</p>
                <p className="text-xl font-bold">
                  {(finance.collected_from_investors / 1000000).toFixed(1)}M
                </p>
              </div>

              {/* عداد المبلغ المطلوب */}
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white shadow-lg">
                <Target className="w-6 h-6 mb-3 opacity-80" />
                <p className="text-xs mb-1 opacity-90">المطلوب</p>
                <p className="text-xl font-bold">
                  {(finance.owner_amount_target / 1000000).toFixed(1)}M
                </p>
              </div>
            </div>

            {/* شريط التقدم */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-600">نسبة الإنجاز</span>
                <span className="text-sm font-bold text-gray-900">
                  {completionPercentage.toFixed(1)}%
                </span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ${
                    completionPercentage >= 100
                      ? 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600'
                      : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                  }`}
                  style={{ width: `${Math.min(completionPercentage, 100)}%` }}
                />
              </div>
            </div>

            {/* رسالة الحث */}
            <div className="text-center">
              <p className="text-sm text-gray-500 font-medium">
                {finance.settlement_ready && !finance.settlement_executed
                  ? '⚡ جاهز للتسوية - اضغط للتفاصيل'
                  : '👆 اضغط لعرض التفاصيل المالية'}
              </p>
            </div>
          </div>

          {/* تأثير اللمعان */}
          {isHovered && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shine pointer-events-none rounded-3xl" />
          )}
        </div>
      </div>

      {/* Modal - الواجهة الداخلية الكاملة */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* رأس الـ Modal */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6 rounded-t-3xl flex justify-between items-center z-10">
              <div>
                <h2 className="text-3xl font-bold mb-2">{finance.farm_name}</h2>
                <p className="text-blue-100 font-mono">{finance.farm_code}</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-8 h-8" />
              </button>
            </div>

            <div className="p-8">
              {/* المحافظ الأربعة */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Wallet className="w-7 h-7 text-blue-600" />
                  المحافظ المالية
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* محفظة المستثمرين */}
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-blue-500 rounded-xl">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">محفظة المستثمرين</h4>
                        <p className="text-xs text-gray-600">مجموع الحجوزات</p>
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-blue-700">
                      {CorrectedFinancialService.formatCurrency(finance.collected_from_investors)}
                    </p>
                  </div>

                  {/* محفظة صاحب المزرعة */}
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border-2 border-emerald-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-emerald-500 rounded-xl">
                        <Building2 className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">محفظة صاحب المزرعة</h4>
                        <p className="text-xs text-gray-600">المحول فعلياً</p>
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-emerald-700">
                      {CorrectedFinancialService.formatCurrency(finance.owner_amount_transferred)}
                    </p>
                    <div className="mt-3 pt-3 border-t border-emerald-200">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">المستهدف:</span>
                        <span className="font-bold text-emerald-800">
                          {CorrectedFinancialService.formatCurrency(finance.owner_amount_target)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* محفظة المنصة */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-purple-500 rounded-xl">
                        <TrendingUp className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">محفظة المنصة</h4>
                        <p className="text-xs text-gray-600">الأرباح المتوقعة (75%)</p>
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-purple-700">
                      {CorrectedFinancialService.formatCurrency(platformAmount)}
                    </p>
                    <div className="mt-3 pt-3 border-t border-purple-200">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">الفائض الكلي:</span>
                        <span className="font-bold text-purple-800">
                          {CorrectedFinancialService.formatCurrency(Math.max(surplus, 0))}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* محفظة الخير */}
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border-2 border-amber-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-amber-500 rounded-xl">
                        <Heart className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">محفظة الخير</h4>
                        <p className="text-xs text-gray-600">استقطاع خيري (25%)</p>
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-amber-700">
                      {CorrectedFinancialService.formatCurrency(charityAmount)}
                    </p>
                  </div>
                </div>
              </div>

              {/* زر التسوية المالية */}
              {finance.settlement_ready && !finance.settlement_executed && onExecuteSettlement && (
                <div className="mb-8">
                  <button
                    onClick={() => {
                      onExecuteSettlement(finance.farm_id);
                      setShowModal(false);
                    }}
                    className="w-full py-5 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600
                      text-white text-xl font-bold rounded-2xl shadow-2xl hover:shadow-yellow-300
                      transform hover:scale-105 transition-all duration-300
                      flex items-center justify-center gap-3"
                  >
                    <Zap className="w-8 h-8 animate-pulse" />
                    <span>⚡ تنفيذ التسوية المالية الآن</span>
                  </button>
                </div>
              )}

              {/* زر الأرشفة المالية - يظهر فقط بعد التسوية ولمن لديه الصلاحية */}
              {finance.settlement_executed && !finance.is_archived && hasArchivePermission && onArchive && (
                <div className="mb-8">
                  <button
                    onClick={() => {
                      if (confirm('هل أنت متأكد من أرشفة هذه المزرعة مالياً؟\n\nسيتم نقلها إلى قسم الأرشفة المالية وإخفاؤها من القائمة الرئيسية.')) {
                        onArchive(finance.farm_id);
                        setShowModal(false);
                      }
                    }}
                    className="w-full py-5 bg-gradient-to-r from-slate-600 via-slate-700 to-slate-800
                      text-white text-xl font-bold rounded-2xl shadow-2xl hover:shadow-slate-500
                      transform hover:scale-105 transition-all duration-300
                      flex items-center justify-center gap-3 border-2 border-slate-400"
                  >
                    <Archive className="w-7 h-7" />
                    <span>🗃️ أرشفة مالية</span>
                  </button>
                  <p className="text-center text-sm text-gray-600 mt-3">
                    ⚠️ يتطلب صلاحية خاصة - سيتم نقل المزرعة للأرشيف
                  </p>
                </div>
              )}

              {/* السجل المالي */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Activity className="w-7 h-7 text-green-600" />
                  السجل المالي
                </h3>

                <div className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-200">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-3 border-b border-gray-300">
                      <span className="text-gray-700 font-medium">الحالة الحالية:</span>
                      <span className={`px-4 py-2 rounded-full font-bold ${
                        finance.settlement_executed
                          ? 'bg-green-100 text-green-700'
                          : finance.settlement_ready
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {CorrectedFinancialService.getStageLabel(finance.stage)}
                      </span>
                    </div>

                    {finance.settlement_ready && (
                      <div className="flex justify-between items-center py-3 border-b border-gray-300">
                        <span className="text-gray-700 font-medium">وقت الجاهزية:</span>
                        <span className="text-gray-900 font-semibold">
                          {finance.settlement_ready_at
                            ? new Date(finance.settlement_ready_at).toLocaleString('ar-SA')
                            : '-'}
                        </span>
                      </div>
                    )}

                    {finance.settlement_executed && (
                      <div className="flex justify-between items-center py-3 border-b border-gray-300">
                        <span className="text-gray-700 font-medium">وقت التسوية:</span>
                        <span className="text-gray-900 font-semibold">
                          {finance.settlement_executed_at
                            ? new Date(finance.settlement_executed_at).toLocaleString('ar-SA')
                            : '-'}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-center py-3">
                      <span className="text-gray-700 font-medium">آخر تحديث:</span>
                      <span className="text-gray-900 font-semibold">
                        {new Date(finance.updated_at).toLocaleString('ar-SA')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ملخص التوزيعات */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Sparkles className="w-7 h-7 text-yellow-500" />
                  ملخص التوزيعات المالية
                </h3>

                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border-2 border-gray-300">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b-2 border-gray-300">
                      <span className="text-gray-700 font-bold text-lg">المحصل الكلي:</span>
                      <span className="text-2xl font-bold text-blue-700">
                        {CorrectedFinancialService.formatCurrency(finance.collected_from_investors)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">▸ لصاحب المزرعة (السعر الفعلي):</span>
                      <span className="text-xl font-bold text-emerald-600">
                        {CorrectedFinancialService.formatCurrency(finance.owner_amount_target)}
                      </span>
                    </div>

                    {surplus > 0 && (
                      <>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-gray-600">▸ الفائض (السعر التسويقي - الفعلي):</span>
                          <span className="text-xl font-bold text-green-600">
                            {CorrectedFinancialService.formatCurrency(surplus)}
                          </span>
                        </div>

                        <div className="mr-8 space-y-2 bg-white/50 p-4 rounded-xl">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">• للمنصة (75%):</span>
                            <span className="text-lg font-bold text-purple-600">
                              {CorrectedFinancialService.formatCurrency(platformAmount)}
                            </span>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">• للخير (25%):</span>
                            <span className="text-lg font-bold text-amber-600">
                              {CorrectedFinancialService.formatCurrency(charityAmount)}
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
