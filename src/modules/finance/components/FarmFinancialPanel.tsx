import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Plus,
  Minus,
  ArrowRightLeft,
  FileText,
  BarChart3,
  Lock,
  Unlock,
  CheckCircle,
} from 'lucide-react';
import {
  FarmFinanceService,
  FarmFinancialSummary,
} from '../services/farmFinanceService';

interface FarmFinancialPanelProps {
  barcode: string;
  onBack: () => void;
}

export function FarmFinancialPanel({ barcode, onBack }: FarmFinancialPanelProps) {
  const [summary, setSummary] = useState<FarmFinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState<string | null>(null);
  const [modalData, setModalData] = useState<any>({});

  useEffect(() => {
    loadSummary();
  }, [barcode]);

  const loadSummary = async () => {
    try {
      setLoading(true);
      const data = await FarmFinanceService.getFarmFinancialSummary(barcode);
      setSummary(data);
    } catch (error) {
      console.error('Error loading farm summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddIncome = async () => {
    try {
      await FarmFinanceService.addIncome(
        barcode,
        Number(modalData.amount),
        modalData.description || 'إضافة دخل',
        modalData.fromEntity || 'platform'
      );
      setShowModal(null);
      setModalData({});
      await loadSummary();
    } catch (error) {
      console.error('Error adding income:', error);
      alert('حدث خطأ أثناء إضافة الدخل');
    }
  };

  const handleAddExpense = async () => {
    try {
      await FarmFinanceService.addExpense(
        barcode,
        Number(modalData.amount),
        modalData.category,
        modalData.description || 'مصروف',
        modalData.receiptNumber,
        modalData.vendor
      );
      setShowModal(null);
      setModalData({});
      await loadSummary();
    } catch (error) {
      console.error('Error adding expense:', error);
      alert('حدث خطأ أثناء إضافة المصروف');
    }
  };

  const handleCloseFinancially = async () => {
    if (!confirm('هل أنت متأكد من إغلاق المزرعة ماليًا؟ هذا الإجراء لا يمكن التراجع عنه.')) {
      return;
    }

    try {
      await FarmFinanceService.closeFarmFinancially(barcode);
      alert('تم إغلاق المزرعة ماليًا بنجاح');
      await loadSummary();
    } catch (error) {
      console.error('Error closing farm:', error);
      alert('حدث خطأ أثناء إغلاق المزرعة');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-lg font-bold text-gray-700">جاري تحميل بيانات المزرعة...</p>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl font-bold text-red-600">المزرعة غير موجودة</p>
      </div>
    );
  }

  const profit = Number(summary.wallet.total_income) - Number(summary.wallet.total_expense);
  const profitPercent =
    summary.wallet.total_income > 0
      ? ((profit / Number(summary.wallet.total_income)) * 100).toFixed(1)
      : '0.0';

  const categoryLabels: Record<string, string> = {
    irrigation: 'ري',
    labor: 'عمالة',
    planting: 'زراعة',
    transport: 'نقل',
    admin: 'إداري',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-20" dir="rtl">
      <div className="max-w-[1600px] mx-auto px-8 pt-8">
        <button
          onClick={onBack}
          className="mb-6 px-4 py-2 bg-white rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 font-bold text-gray-700"
        >
          <ArrowLeft className="h-5 w-5" />
          العودة للقائمة
        </button>

        <div className="mb-8">
          <h1 className="text-4xl font-black text-gray-900 mb-2">
            إدارة مالية - {barcode}
          </h1>
          <p className="text-lg text-gray-600">نظام إدارة مالي متكامل للمزرعة</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border-t-4 border-blue-500">
            <p className="text-sm text-gray-600 mb-2">الرصيد الحالي</p>
            <p className="text-4xl font-black text-blue-600">
              {Number(summary.wallet.balance).toLocaleString('ar-SA')}
            </p>
            <p className="text-xs text-gray-500 mt-1">ريال سعودي</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border-t-4 border-green-500">
            <p className="text-sm text-gray-600 mb-2">إجمالي الدخل</p>
            <p className="text-4xl font-black text-green-600">
              {Number(summary.wallet.total_income).toLocaleString('ar-SA')}
            </p>
            <p className="text-xs text-gray-500 mt-1">ريال سعودي</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border-t-4 border-red-500">
            <p className="text-sm text-gray-600 mb-2">إجمالي المصروفات</p>
            <p className="text-4xl font-black text-red-600">
              {Number(summary.wallet.total_expense).toLocaleString('ar-SA')}
            </p>
            <p className="text-xs text-gray-500 mt-1">ريال سعودي</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-black text-gray-900">صافي الربح</h3>
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
            <div className={`text-center py-6 rounded-xl ${profit >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
              <p className={`text-5xl font-black ${profit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {profit.toLocaleString('ar-SA')}
              </p>
              <p className="text-lg font-bold text-gray-600 mt-2">
                نسبة الربح: {profitPercent}%
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-black text-gray-900">المستثمرون</h3>
              <CheckCircle className="h-6 w-6 text-blue-600" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <p className="text-3xl font-black text-blue-700">{summary.investorsCount}</p>
                <p className="text-sm text-gray-600 mt-1">عدد المستثمرين</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-black text-purple-700">
                  {summary.totalInvestment.toLocaleString('ar-SA')}
                </p>
                <p className="text-sm text-gray-600 mt-1">إجمالي الاستثمار</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
          <h3 className="text-xl font-black text-gray-900 mb-4">مركز المصروفات حسب التصنيف</h3>
          <div className="grid grid-cols-5 gap-4">
            {Object.entries(summary.totalExpensesByCategory).map(([category, amount]) => (
              <div key={category} className="bg-gray-50 rounded-xl p-4 text-center border border-gray-200">
                <p className="text-xs text-gray-600 mb-2">{categoryLabels[category]}</p>
                <p className="text-lg font-black text-gray-800">
                  {Number(amount).toLocaleString('ar-SA')}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
          <h3 className="text-xl font-black text-gray-900 mb-4">آخر المعاملات</h3>
          <div className="space-y-2">
            {summary.recentTransactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-gray-300 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      tx.transaction_type.includes('income') || tx.transaction_type.includes('in')
                        ? 'bg-green-500'
                        : 'bg-red-500'
                    }`}
                  />
                  <div>
                    <p className="font-bold text-gray-800">{tx.description || tx.transaction_type}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(tx.transaction_date).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                </div>
                <div className="text-left">
                  <p
                    className={`text-lg font-black ${
                      tx.transaction_type.includes('income') || tx.transaction_type.includes('in')
                        ? 'text-green-700'
                        : 'text-red-700'
                    }`}
                  >
                    {tx.transaction_type.includes('income') || tx.transaction_type.includes('in')
                      ? '+'
                      : '-'}
                    {Number(tx.amount).toLocaleString('ar-SA')}
                  </p>
                  <p className="text-xs text-gray-500">{tx.status === 'completed' ? 'مكتملة' : 'معلقة'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-xl font-black text-gray-900 mb-4">الإجراءات المالية</h3>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <button
              onClick={() => setShowModal('income')}
              disabled={summary.state.current_state === 'completed'}
              className="px-6 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-green-600 to-green-700 hover:shadow-lg transition-all flex flex-col items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-6 w-6" />
              إضافة دخل
            </button>

            <button
              onClick={() => setShowModal('expense')}
              disabled={summary.state.current_state === 'completed'}
              className="px-6 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-red-600 to-red-700 hover:shadow-lg transition-all flex flex-col items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Minus className="h-6 w-6" />
              إضافة مصروف
            </button>

            <button
              disabled={summary.state.current_state === 'completed'}
              className="px-6 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:shadow-lg transition-all flex flex-col items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowRightLeft className="h-6 w-6" />
              تحويل
            </button>

            <button className="px-6 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-purple-700 hover:shadow-lg transition-all flex flex-col items-center gap-2">
              <FileText className="h-6 w-6" />
              تقرير PDF
            </button>

            <button
              onClick={handleCloseFinancially}
              disabled={summary.state.current_state === 'completed'}
              className="px-6 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-orange-600 to-orange-700 hover:shadow-lg transition-all flex flex-col items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Lock className="h-6 w-6" />
              إغلاق مالي
            </button>
          </div>
        </div>
      </div>

      {showModal === 'income' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowModal(null)}>
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-black text-gray-900 mb-6">إضافة دخل</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">المبلغ</label>
                <input
                  type="number"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                  value={modalData.amount || ''}
                  onChange={(e) => setModalData({ ...modalData, amount: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">الوصف</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                  value={modalData.description || ''}
                  onChange={(e) => setModalData({ ...modalData, description: e.target.value })}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleAddIncome}
                  className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700"
                >
                  إضافة
                </button>
                <button
                  onClick={() => setShowModal(null)}
                  className="flex-1 px-4 py-3 rounded-xl font-bold text-gray-700 bg-gray-200 hover:bg-gray-300"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showModal === 'expense' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowModal(null)}>
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-black text-gray-900 mb-6">إضافة مصروف</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">المبلغ</label>
                <input
                  type="number"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                  value={modalData.amount || ''}
                  onChange={(e) => setModalData({ ...modalData, amount: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">التصنيف</label>
                <select
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                  value={modalData.category || ''}
                  onChange={(e) => setModalData({ ...modalData, category: e.target.value })}
                >
                  <option value="">اختر التصنيف</option>
                  <option value="irrigation">ري</option>
                  <option value="labor">عمالة</option>
                  <option value="planting">زراعة</option>
                  <option value="transport">نقل</option>
                  <option value="admin">إداري</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">الوصف</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                  value={modalData.description || ''}
                  onChange={(e) => setModalData({ ...modalData, description: e.target.value })}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleAddExpense}
                  className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700"
                >
                  إضافة
                </button>
                <button
                  onClick={() => setShowModal(null)}
                  className="flex-1 px-4 py-3 rounded-xl font-bold text-gray-700 bg-gray-200 hover:bg-gray-300"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
