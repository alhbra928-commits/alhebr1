import React, { useState } from 'react';
import { AlertCircle, CheckCircle, DollarSign, ArrowRight, Sparkles, Lock } from 'lucide-react';
import { SettlementService } from '../services/settlementService';

interface ManualSettlementPanelProps {
  farmCode: string;
  farmName: string;
  ownerName: string;
  actualAmount: number;
  collectedAmount: number;
  settlementStatus: string;
  onSettlementComplete?: () => void;
  onClose?: () => void;
}

export const ManualSettlementPanel: React.FC<ManualSettlementPanelProps> = ({
  farmCode,
  farmName,
  ownerName,
  actualAmount,
  collectedAmount,
  settlementStatus,
  onSettlementComplete,
  onClose
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const handleExecuteSettlement = async () => {
    if (settlementStatus !== 'ready_for_settlement') {
      setError('المزرعة ليست جاهزة للتسوية');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const settlementResult = await SettlementService.executeManualSettlement(
        farmCode,
        'admin-001',
        'المدير المالي'
      );

      if (settlementResult.success) {
        setResult(settlementResult);
        setShowSuccess(true);

        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZizcIHmm+7+ihUhELTKXh8Ldl');
        audio.play().catch(() => {});

        setTimeout(() => {
          onSettlementComplete?.();
        }, 3000);
      } else {
        setError(settlementResult.error || 'فشل تنفيذ التسوية');
      }
    } catch (err) {
      setError('حدث خطأ أثناء تنفيذ التسوية');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="relative w-full max-w-2xl mx-4 bg-gradient-to-br from-green-500 via-emerald-600 to-green-700 rounded-3xl p-8 shadow-2xl animate-success-flash">
          <div className="text-center text-white">
            <div className="mb-6 flex justify-center">
              <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center animate-bounce">
                <CheckCircle className="w-16 h-16 text-white" />
              </div>
            </div>

            <h2 className="text-4xl font-black mb-4" style={{ fontFamily: 'Tajawal' }}>
              ✅ تمت التسوية بنجاح!
            </h2>

            <div className="space-y-3 text-lg">
              <p>المزرعة: <span className="font-bold">{farmName}</span></p>
              <p>صاحب المزرعة: <span className="font-bold">{ownerName}</span></p>
              <p>المبلغ المُحوّل: <span className="font-bold text-2xl">{SettlementService.formatCurrency(actualAmount)}</span></p>
              <p className="text-sm mt-4">كود المعاملة: {result?.transaction_code}</p>
            </div>

            <div className="mt-8 flex flex-col gap-3">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <p className="text-sm mb-2">🏛️ المزرعة الآن مملوكة بالكامل للمنصة</p>
                <p className="text-sm">💰 تم توزيع الأرباح تلقائياً (75% المنصة + 25% الخير)</p>
              </div>

              <button
                onClick={onClose}
                className="bg-white text-green-600 px-8 py-3 rounded-xl font-bold hover:bg-green-50 transition-colors"
                style={{ fontFamily: 'Tajawal' }}
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl mx-4 bg-white rounded-3xl shadow-2xl overflow-hidden">
        {isProcessing && (
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 z-10 flex items-center justify-center">
            <div className="text-center text-white">
              <Sparkles className="w-16 h-16 mx-auto mb-4 animate-spin" />
              <h3 className="text-2xl font-bold" style={{ fontFamily: 'Tajawal' }}>
                جاري تنفيذ التسوية المالية...
              </h3>
              <div className="mt-4 w-64 mx-auto h-2 bg-white/30 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full animate-progress-bar"></div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-gradient-to-r from-yellow-500 to-amber-600 p-6">
          <h2 className="text-3xl font-black text-white text-center" style={{ fontFamily: 'Tajawal' }}>
            ⚡ لوحة التسوية اليدوية
          </h2>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-red-800 mb-1" style={{ fontFamily: 'Tajawal' }}>خطأ</h4>
                <p className="text-red-700 text-sm" style={{ fontFamily: 'Tajawal' }}>{error}</p>
              </div>
            </div>
          )}

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-200">
              <h3 className="text-xl font-bold text-blue-900 mb-4" style={{ fontFamily: 'Tajawal' }}>
                📋 معلومات المزرعة
              </h3>
              <div className="space-y-3 text-blue-800">
                <div className="flex justify-between">
                  <span>اسم المزرعة:</span>
                  <span className="font-bold">{farmName}</span>
                </div>
                <div className="flex justify-between">
                  <span>رمز المزرعة:</span>
                  <span className="font-bold font-mono">{farmCode}</span>
                </div>
                <div className="flex justify-between">
                  <span>صاحب المزرعة:</span>
                  <span className="font-bold">{ownerName}</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
              <h3 className="text-xl font-bold text-green-900 mb-4 flex items-center gap-2" style={{ fontFamily: 'Tajawal' }}>
                <DollarSign className="w-6 h-6" />
                المبالغ المالية
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="text-green-800">المبلغ المجمع من المستثمرين:</span>
                  <span className="text-2xl font-black text-green-700">
                    {SettlementService.formatCurrency(collectedAmount)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="text-green-800">المبلغ الفعلي لصاحب المزرعة:</span>
                  <span className="text-2xl font-black text-green-700">
                    {SettlementService.formatCurrency(actualAmount)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-6 border-2 border-amber-300">
              <h3 className="text-xl font-bold text-amber-900 mb-3 flex items-center gap-2" style={{ fontFamily: 'Tajawal' }}>
                <ArrowRight className="w-6 h-6" />
                خطوات التسوية
              </h3>
              <ol className="space-y-2 text-amber-800 text-sm" style={{ fontFamily: 'Tajawal' }}>
                <li>1️⃣ خصم المبلغ من محفظة المستثمرين</li>
                <li>2️⃣ تحويل المبلغ الفعلي لصاحب المزرعة</li>
                <li>3️⃣ توثيق العملية في سجل التدقيق المالي</li>
                <li>4️⃣ تغيير ملكية المزرعة للمنصة</li>
                <li>5️⃣ توزيع الأرباح (75% المنصة + 25% الخير)</li>
                <li>6️⃣ إقفال حساب المستثمرين للمزرعة</li>
              </ol>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleExecuteSettlement}
                disabled={isProcessing || settlementStatus !== 'ready_for_settlement'}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-xl font-black text-lg hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl"
                style={{ fontFamily: 'Tajawal' }}
              >
                {settlementStatus === 'ready_for_settlement' ? (
                  <>
                    <CheckCircle className="w-6 h-6" />
                    ✅ بدء التسوية اليدوية
                  </>
                ) : (
                  <>
                    <Lock className="w-6 h-6" />
                    غير متاحة حالياً
                  </>
                )}
              </button>

              <button
                onClick={onClose}
                disabled={isProcessing}
                className="px-8 py-4 rounded-xl font-bold border-2 border-gray-300 hover:bg-gray-100 transition-colors disabled:opacity-50"
                style={{ fontFamily: 'Tajawal' }}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes success-flash {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
          50% { transform: scale(1.02); box-shadow: 0 0 40px 20px rgba(34, 197, 94, 0); }
        }

        @keyframes progress-bar {
          0% { width: 0%; }
          100% { width: 100%; }
        }

        .animate-success-flash {
          animation: success-flash 1.5s ease-in-out 3;
        }

        .animate-progress-bar {
          animation: progress-bar 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
