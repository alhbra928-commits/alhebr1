import React, { useState } from 'react';
import {
  CheckCircle,
  DollarSign,
  Snowflake,
  Sun,
  Sprout,
  Trash2,
  AlertTriangle,
  X
} from 'lucide-react';
import { SmartFarmFinance } from '../services/smartFinanceService';
import { AdminFinanceService } from '../services/adminFinanceService';

interface AdminFinanceActionsProps {
  finance: SmartFarmFinance;
  onActionComplete: () => void;
}

export function AdminFinanceActions({ finance, onActionComplete }: AdminFinanceActionsProps) {
  const [loading, setLoading] = useState(false);
  const [showFreezeModal, setShowFreezeModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [freezeReason, setFreezeReason] = useState('');
  const [deleteReason, setDeleteReason] = useState('');

  const userEmail = 'admin@palmolivefarms.com'; // TODO: get from auth

  const handleApprovePayment = async () => {
    setLoading(true);
    const result = await AdminFinanceService.approveOwnerPayment(finance.farm_code, userEmail);
    setLoading(false);

    if (result.success) {
      alert('✅ تم اعتماد صرف المبلغ لصاحب المزرعة');
      onActionComplete();
    } else {
      alert('❌ حدث خطأ أثناء اعتماد الصرف');
    }
  };

  const handleTransferProfit = async () => {
    setLoading(true);
    const result = await AdminFinanceService.transferProfitToPlatform(finance.farm_code, userEmail);
    setLoading(false);

    if (result.success) {
      alert('✅ تم تحويل الأرباح إلى بطاقة المنصة');
      onActionComplete();
    } else {
      alert('❌ حدث خطأ أثناء تحويل الأرباح');
    }
  };

  const handleFreeze = async () => {
    if (!freezeReason.trim()) {
      alert('⚠️ يرجى إدخال سبب التجميد');
      return;
    }

    setLoading(true);
    const result = await AdminFinanceService.freezeFarm(finance.farm_code, freezeReason, userEmail);
    setLoading(false);
    setShowFreezeModal(false);
    setFreezeReason('');

    if (result.success) {
      alert('✅ تم تجميد العمليات المالية');
      onActionComplete();
    } else {
      alert('❌ حدث خطأ أثناء التجميد');
    }
  };

  const handleUnfreeze = async () => {
    setLoading(true);
    const result = await AdminFinanceService.unfreezeFarm(finance.farm_code, userEmail);
    setLoading(false);

    if (result.success) {
      alert('✅ تم إلغاء تجميد العمليات المالية');
      onActionComplete();
    } else {
      alert('❌ حدث خطأ أثناء إلغاء التجميد');
    }
  };

  const handleTransferToAgriculture = async () => {
    if (!confirm('هل أنت متأكد من تحويل المزرعة إلى الخدمات الزراعية؟ هذا الإجراء نهائي.')) {
      return;
    }

    setLoading(true);
    const result = await AdminFinanceService.transferToAgriculture(finance.farm_code, userEmail);
    setLoading(false);

    if (result.success) {
      alert('✅ تم إغلاق البيع وتحويل المزرعة للخدمات الزراعية');
      onActionComplete();
    } else {
      alert('❌ حدث خطأ أثناء التحويل');
    }
  };

  const handleDelete = async () => {
    if (!deleteReason.trim()) {
      alert('⚠️ يرجى إدخال سبب الحذف');
      return;
    }

    setLoading(true);
    const result = await AdminFinanceService.adminDelete(
      'farm_finance',
      finance.id,
      finance.farm_code,
      finance,
      deleteReason,
      userEmail
    );
    setLoading(false);
    setShowDeleteModal(false);
    setDeleteReason('');

    if (result.success) {
      alert('✅ تم حذف البطاقة المالية بنجاح');
      onActionComplete();
    } else {
      alert('❌ حدث خطأ أثناء الحذف');
    }
  };

  const coverage = Number(finance.coverage_percentage);
  const canApprovePayment = coverage >= 100 && !finance.owner_payment_approved;
  const canTransferProfit = finance.owner_payment_approved && !finance.profit_transferred && Number(finance.platform_profit) > 0;
  const canTransferToAgriculture = finance.owner_payment_approved && finance.profit_transferred;

  return (
    <div className="space-y-3">
      {/* 1️⃣ اعتماد صرف المستحقات */}
      {canApprovePayment && (
        <button
          onClick={handleApprovePayment}
          disabled={loading || finance.is_frozen}
          className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CheckCircle size={20} />
          اعتماد صرف المبلغ الفعلي
        </button>
      )}

      {/* 2️⃣ تحويل الأرباح */}
      {canTransferProfit && (
        <button
          onClick={handleTransferProfit}
          disabled={loading || finance.is_frozen}
          className="w-full px-4 py-3 bg-gradient-to-r from-yellow-600 to-amber-600 text-white font-bold rounded-lg hover:from-yellow-700 hover:to-amber-700 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <DollarSign size={20} />
          تحويل الفائض إلى المنصة
        </button>
      )}

      {/* 3️⃣ تجميد / إلغاء التجميد */}
      {!finance.is_frozen ? (
        <button
          onClick={() => setShowFreezeModal(true)}
          disabled={loading}
          className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Snowflake size={20} />
          تجميد العمليات المالية
        </button>
      ) : (
        <button
          onClick={handleUnfreeze}
          disabled={loading}
          className="w-full px-4 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold rounded-lg hover:from-orange-700 hover:to-red-700 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Sun size={20} />
          إلغاء التجميد
        </button>
      )}

      {/* 4️⃣ تحويل للخدمات الزراعية */}
      {canTransferToAgriculture && !finance.transferred_to_agriculture && (
        <button
          onClick={handleTransferToAgriculture}
          disabled={loading || finance.is_frozen}
          className="w-full px-4 py-3 bg-gradient-to-r from-green-700 to-teal-700 text-white font-bold rounded-lg hover:from-green-800 hover:to-teal-800 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Sprout size={20} />
          تحويل للخدمات الزراعية
        </button>
      )}

      {/* 5️⃣ حذف إداري */}
      <button
        onClick={() => setShowDeleteModal(true)}
        disabled={loading}
        className="w-full px-4 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold rounded-lg hover:from-red-700 hover:to-rose-700 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
      >
        <Trash2 size={20} className="group-hover:animate-bounce" />
        حذف البطاقة المالية
      </button>

      {/* Modal التجميد */}
      {showFreezeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Snowflake className="text-blue-600" />
                تجميد العمليات المالية
              </h3>
              <button
                onClick={() => setShowFreezeModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                سبب التجميد *
              </label>
              <textarea
                value={freezeReason}
                onChange={(e) => setFreezeReason(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
                placeholder="أدخل سبب تجميد العمليات المالية..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleFreeze}
                disabled={loading || !freezeReason.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                تأكيد التجميد
              </button>
              <button
                onClick={() => setShowFreezeModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal الحذف */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-red-600 flex items-center gap-2">
                <AlertTriangle />
                تحذير: حذف نهائي
              </h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-gray-600 mb-4">
              هل أنت متأكد من حذف هذا السجل المالي؟ يمكنك استعادته خلال 24 ساعة فقط.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                سبب الحذف *
              </label>
              <textarea
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                rows={3}
                placeholder="أدخل سبب الحذف..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={loading || !deleteReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                نعم، احذف
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
