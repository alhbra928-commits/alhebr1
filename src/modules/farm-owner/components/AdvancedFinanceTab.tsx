import React, { useEffect, useState } from 'react';
import {
  farmOwnerFinanceService,
  OwnerFinancialData,
  SettlementTransaction,
  PaymentTimeline
} from '../services/farmOwnerFinanceService';
import {
  DollarSign,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  Users,
  TreePine,
  CreditCard,
  ArrowRight
} from 'lucide-react';

interface AdvancedFinanceTabProps {
  ownerId: string;
  farmId: string | null;
}

export const AdvancedFinanceTab: React.FC<AdvancedFinanceTabProps> = ({ ownerId, farmId }) => {
  const [financialData, setFinancialData] = useState<OwnerFinancialData | null>(null);
  const [transactions, setTransactions] = useState<SettlementTransaction[]>([]);
  const [timeline, setTimeline] = useState<PaymentTimeline[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // تأخير بسيط قبل تحميل البيانات المالية
    const loadTimeout = setTimeout(() => {
      loadFinancialData();
    }, 100);

    // تأجيل الاشتراك في التحديثات اللحظية
    const subscribeTimeout = setTimeout(() => {
      const unsubscribe = farmOwnerFinanceService.subscribeToFinancialUpdates(
        ownerId,
        (data) => {
          setFinancialData(data);
          buildTimeline(data);
        }
      );

      // حفظ للتنظيف
      (window as any).__financeUnsubscribe = unsubscribe;
    }, 2000);

    return () => {
      clearTimeout(loadTimeout);
      clearTimeout(subscribeTimeout);

      if ((window as any).__financeUnsubscribe) {
        (window as any).__financeUnsubscribe();
        delete (window as any).__financeUnsubscribe;
      }
    };
  }, [ownerId]);

  const loadFinancialData = async () => {
    setLoading(true);
    const data = await farmOwnerFinanceService.getFinancialData(ownerId);
    setFinancialData(data);

    if (data && data.farmId) {
      const txns = await farmOwnerFinanceService.getSettlementTransactions(data.farmId);
      setTransactions(txns);
      buildTimeline(data, txns);
    }

    setLoading(false);
  };

  const buildTimeline = (data: OwnerFinancialData, txns: SettlementTransaction[] = transactions) => {
    const tl = farmOwnerFinanceService.buildPaymentTimeline(data, txns);
    setTimeline(tl);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div
            className="inline-block w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mb-4"
            style={{ borderColor: '#8BC34A', borderTopColor: 'transparent' }}
          />
          <p className="text-gray-600">جاري تحميل البيانات المالية...</p>
        </div>
      </div>
    );
  }

  if (!financialData) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border-2 border-gray-200">
        <div className="text-6xl mb-4">💼</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد بيانات مالية</h3>
        <p className="text-gray-600">
          سيتم عرض البيانات المالية بعد اعتماد مزرعتك من قبل الإدارة
        </p>
      </div>
    );
  }

  const getSettlementStatusInfo = () => {
    switch (financialData.settlementStatus) {
      case 'completed':
        return {
          emoji: '✅',
          title: 'تم التحويل بنجاح',
          message: 'تم تحويل كامل المبلغ إلى حسابك',
          color: '#10B981'
        };
      case 'ready':
        return {
          emoji: '⏰',
          title: 'جاهز للتحويل',
          message: 'المبلغ جاهز وسيتم التحويل قريباً بإذن الله',
          color: '#F59E0B'
        };
      case 'in_progress':
        return {
          emoji: '🔄',
          title: 'قيد التحويل',
          message: 'جاري معالجة تحويل المبلغ',
          color: '#3B82F6'
        };
      default:
        return {
          emoji: '⏳',
          title: 'قيد التحصيل',
          message: 'جاري تحصيل المبالغ من المستثمرين',
          color: '#6B7280'
        };
    }
  };

  const settlementInfo = getSettlementStatusInfo();

  return (
    <div className="space-y-6">
      {/* ملخص الحالة المالية */}
      <div
        className="rounded-3xl p-8 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, white 0%, #F0FDF4 100%)',
          border: '3px solid rgba(139, 195, 74, 0.3)',
          boxShadow: '0 8px 32px rgba(139, 195, 74, 0.2)'
        }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #8BC34A 0%, #689F38 100%)',
              boxShadow: '0 4px 12px rgba(139, 195, 74, 0.3)'
            }}
          >
            <DollarSign size={28} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black" style={{ color: '#8BC34A' }}>
              💰 الحالة المالية
            </h2>
            <p className="text-sm text-gray-600">مزرعة {financialData.farmName}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* المبلغ الكلي */}
          <div className="bg-white rounded-2xl p-6 border-2 border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard size={20} style={{ color: '#8BC34A' }} />
              <p className="text-sm font-semibold text-gray-600">المبلغ الكلي للمزرعة</p>
            </div>
            <p className="text-3xl font-black" style={{ color: '#8BC34A' }}>
              {financialData.actualAmount.toLocaleString('ar-SA')}
              <span className="text-lg mr-2">ريال</span>
            </p>
          </div>

          {/* المحصل */}
          <div className="bg-white rounded-2xl p-6 border-2 border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={20} style={{ color: '#10B981' }} />
              <p className="text-sm font-semibold text-gray-600">المبلغ المحصل</p>
            </div>
            <p className="text-3xl font-black" style={{ color: '#10B981' }}>
              {financialData.totalCollected.toLocaleString('ar-SA')}
              <span className="text-lg mr-2">ريال</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {financialData.financialPercentage.toFixed(1)}% من المبلغ الكلي
            </p>
          </div>

          {/* المتبقي */}
          <div className="bg-white rounded-2xl p-6 border-2 border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={20} style={{ color: '#F59E0B' }} />
              <p className="text-sm font-semibold text-gray-600">المتبقي للتحصيل</p>
            </div>
            <p className="text-3xl font-black" style={{ color: '#F59E0B' }}>
              {financialData.remainingAmount.toLocaleString('ar-SA')}
              <span className="text-lg mr-2">ريال</span>
            </p>
          </div>
        </div>

        {/* شريط التقدم */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-bold text-gray-700">نسبة التقدم المالي</p>
            <p className="text-sm font-black" style={{ color: '#8BC34A' }}>
              {financialData.financialPercentage.toFixed(1)}%
            </p>
          </div>
          <div className="relative w-full h-6 rounded-full overflow-hidden" style={{ background: 'rgba(139, 195, 74, 0.1)' }}>
            <div
              className="h-full transition-all duration-1000 ease-out"
              style={{
                width: `${Math.min(financialData.financialPercentage, 100)}%`,
                background: 'linear-gradient(90deg, #8BC34A 0%, #689F38 100%)',
                boxShadow: '0 0 20px rgba(139, 195, 74, 0.5)'
              }}
            />
          </div>
        </div>

        {/* معلومات إضافية */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="flex items-center gap-2">
            <Users size={18} style={{ color: '#8BC34A' }} />
            <p className="text-sm text-gray-600">
              <span className="font-bold">{financialData.totalInvestors}</span> مستثمر
            </p>
          </div>
          <div className="flex items-center gap-2">
            <TreePine size={18} style={{ color: '#8BC34A' }} />
            <p className="text-sm text-gray-600">
              <span className="font-bold">{financialData.totalTreesSold}</span> شجرة مباعة
            </p>
          </div>
        </div>
      </div>

      {/* حالة التسوية */}
      <div
        className="rounded-3xl p-8 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, white 0%, ${settlementInfo.color}11 100%)`,
          border: `3px solid ${settlementInfo.color}33`,
          boxShadow: `0 8px 32px ${settlementInfo.color}22`
        }}
      >
        <div className="text-center">
          <div className="text-6xl mb-4">{settlementInfo.emoji}</div>
          <h3 className="text-2xl font-black mb-2" style={{ color: settlementInfo.color }}>
            {settlementInfo.title}
          </h3>
          <p className="text-lg text-gray-600 mb-4">{settlementInfo.message}</p>

          {financialData.settlementStatus === 'completed' && financialData.settlementExecutedAt && (
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full" style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '2px solid rgba(16, 185, 129, 0.3)'
            }}>
              <CheckCircle size={20} style={{ color: '#10B981' }} />
              <p className="text-sm font-bold" style={{ color: '#10B981' }}>
                تم التحويل بتاريخ {new Date(financialData.settlementExecutedAt).toLocaleDateString('ar-SA')}
              </p>
            </div>
          )}

          {financialData.financialPercentage >= 100 && financialData.settlementStatus !== 'completed' && (
            <div className="mt-4 p-4 rounded-xl" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
              <p className="text-sm font-bold" style={{ color: '#F59E0B' }}>
                ✨ اكتمل بيع المزرعة بالكامل - سيتم التواصل معك قريباً لترتيب التحويل
              </p>
            </div>
          )}
        </div>
      </div>

      {/* الجدول الزمني للدفعات */}
      {timeline.length > 0 && (
        <div className="bg-white rounded-3xl p-8 border-2 border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <Calendar size={24} style={{ color: '#8BC34A' }} />
            <h3 className="text-xl font-black" style={{ color: '#8BC34A' }}>
              الجدول الزمني للدفعات
            </h3>
          </div>

          <div className="space-y-4">
            {timeline.map((item, index) => {
              const statusColors = {
                completed: { bg: '#10B981', text: 'white', label: 'مكتمل' },
                pending: { bg: '#F59E0B', text: 'white', label: 'قيد التنفيذ' },
                upcoming: { bg: '#6B7280', text: 'white', label: 'قادم' }
              };

              const statusColor = statusColors[item.status];

              return (
                <div key={index} className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: statusColor.bg }}
                  >
                    {item.status === 'completed' ? (
                      <CheckCircle size={20} className="text-white" />
                    ) : item.status === 'pending' ? (
                      <Clock size={20} className="text-white" />
                    ) : (
                      <AlertCircle size={20} className="text-white" />
                    )}
                  </div>

                  <div className="flex-1 bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-bold text-gray-900">{item.description}</p>
                      <span
                        className="px-3 py-1 rounded-full text-xs font-bold"
                        style={{ background: statusColor.bg, color: statusColor.text }}
                      >
                        {statusColor.label}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-2xl font-black" style={{ color: '#8BC34A' }}>
                        {item.amount.toLocaleString('ar-SA')} ريال
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(item.date).toLocaleDateString('ar-SA')}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* معاملات التسوية */}
      {transactions.length > 0 && (
        <div className="bg-white rounded-3xl p-8 border-2 border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <ArrowRight size={24} style={{ color: '#8BC34A' }} />
            <h3 className="text-xl font-black" style={{ color: '#8BC34A' }}>
              سجل المعاملات
            </h3>
          </div>

          <div className="space-y-3">
            {transactions.map((txn) => (
              <div key={txn.id} className="bg-gray-50 rounded-xl p-4 border-2 border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-bold text-gray-900">{txn.descriptionAr}</p>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-bold"
                    style={{
                      background: txn.status === 'completed' ? '#10B981' : '#F59E0B',
                      color: 'white'
                    }}
                  >
                    {txn.status === 'completed' ? 'مكتمل' : 'قيد المعالجة'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xl font-black" style={{ color: '#8BC34A' }}>
                    {txn.amount.toLocaleString('ar-SA')} ريال
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(txn.createdAt).toLocaleDateString('ar-SA')}
                  </p>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  من: {txn.fromWallet} ← إلى: {txn.toWallet}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* رسالة تطمينية */}
      <div
        className="rounded-3xl p-6 text-center"
        style={{
          background: 'linear-gradient(135deg, #F0FDF4 0%, white 100%)',
          border: '2px solid rgba(139, 195, 74, 0.2)'
        }}
      >
        <p className="text-sm text-gray-600">
          <span className="font-bold" style={{ color: '#8BC34A' }}>💚 نعدك بالشفافية الكاملة</span>
          <br />
          يمكنك متابعة كل التفاصيل المالية هنا بشكل لحظي
        </p>
      </div>
    </div>
  );
};
