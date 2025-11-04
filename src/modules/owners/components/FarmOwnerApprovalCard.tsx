import React, { useState } from 'react';
import { Check, X, Clock, User, Phone, MapPin, FileText, Calendar, AlertCircle, CheckCircle2, XCircle, TreePine, DollarSign } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface FarmOwner {
  id: string;
  full_name: string;
  mobile_number: string;
  email?: string;
  region?: string;
  city?: string;
  farm_location_region?: string;
  farm_location_city?: string;
  farm_type?: string;
  farm_area?: number;
  farm_area_unit?: string;
  approval_status: 'pending' | 'approved' | 'rejected';
  approved_at?: string;
  rejection_reason?: string;
  notes?: string;
  created_at: string;
}

interface FarmOwnerApprovalCardProps {
  owner: FarmOwner;
  onApprove?: () => void;
  onReject?: () => void;
  onUpdate?: () => void;
}

export function FarmOwnerApprovalCard({ owner, onApprove, onReject, onUpdate }: FarmOwnerApprovalCardProps) {
  const [loading, setLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [notes, setNotes] = useState(owner.notes || '');

  const handleApprove = async () => {
    try {
      setLoading(true);

      // الحصول على بيانات المستخدم الحالي
      const { data: { session } } = await supabase.auth.getSession();

      // استخدام admin ID أو fallback
      const adminId = session?.user?.id || '00000000-0000-0000-0000-000000000000';

      console.log('🔄 جاري اعتماد البطاقة:', owner.full_name);

      // استدعاء دالة الموافقة
      const { data, error } = await supabase.rpc('approve_farm_owner', {
        p_owner_id: owner.id,
        p_admin_id: adminId,
        p_notes: notes || null
      });

      if (error) {
        console.error('❌ خطأ في استدعاء الدالة:', error);
        throw error;
      }

      // التحقق من النتيجة
      if (data && !data.success) {
        throw new Error(data.error || 'فشل في اعتماد البطاقة');
      }

      console.log('✅ تم اعتماد البطاقة بنجاح:', data);
      alert('✅ تم اعتماد بطاقة صاحب المزرعة بنجاح');

      onApprove?.();
      onUpdate?.();
    } catch (error: any) {
      console.error('❌ خطأ في اعتماد البطاقة:', error);
      alert(`خطأ: ${error.message || 'حدث خطأ غير متوقع'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert('يرجى إدخال سبب الرفض');
      return;
    }

    try {
      setLoading(true);

      const { data: { session } } = await supabase.auth.getSession();
      const adminId = session?.user?.id || '00000000-0000-0000-0000-000000000000';

      console.log('🔄 جاري رفض البطاقة:', owner.full_name);

      const { data, error } = await supabase.rpc('reject_farm_owner', {
        p_owner_id: owner.id,
        p_admin_id: adminId,
        p_reason: rejectReason
      });

      if (error) {
        console.error('❌ خطأ في استدعاء الدالة:', error);
        throw error;
      }

      // التحقق من النتيجة
      if (data && !data.success) {
        throw new Error(data.error || 'فشل في رفض البطاقة');
      }

      console.log('✅ تم رفض البطاقة بنجاح:', data);
      alert('✅ تم رفض البطاقة');

      setShowRejectModal(false);
      setRejectReason('');
      onReject?.();
      onUpdate?.();
    } catch (error: any) {
      console.error('❌ خطأ في رفض البطاقة:', error);
      alert(`خطأ: ${error.message || 'حدث خطأ غير متوقع'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('هل تريد إعادة الطلب للمراجعة؟')) return;

    try {
      setLoading(true);

      const { data: { session } } = await supabase.auth.getSession();
      const adminId = session?.user?.id || '00000000-0000-0000-0000-000000000000';

      console.log('🔄 جاري إعادة الطلب:', owner.full_name);

      const { data, error } = await supabase.rpc('reset_farm_owner_approval', {
        p_owner_id: owner.id,
        p_admin_id: adminId
      });

      if (error) {
        console.error('❌ خطأ في استدعاء الدالة:', error);
        throw error;
      }

      if (data && !data.success) {
        throw new Error(data.error || 'فشل في إعادة الطلب');
      }

      console.log('✅ تم إعادة الطلب بنجاح:', data);
      alert('✅ تم إعادة الطلب للمراجعة');
      onUpdate?.();
    } catch (error: any) {
      console.error('❌ خطأ في إعادة الطلب:', error);
      alert(`خطأ: ${error.message || 'حدث خطأ غير متوقع'}`);
    } finally {
      setLoading(false);
    }
  };

  const statusConfig = {
    pending: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: Clock,
      label: 'في انتظار المراجعة'
    },
    approved: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: CheckCircle2,
      label: 'معتمد'
    },
    rejected: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: XCircle,
      label: 'مرفوض'
    }
  };

  const config = statusConfig[owner.approval_status];
  const StatusIcon = config.icon;

  return (
    <div className={`bg-white rounded-2xl border-2 ${config.border} shadow-lg overflow-hidden transition-all hover:shadow-xl`} dir="rtl">
      {/* Header with Status */}
      <div className={`${config.bg} px-6 py-4 border-b-2 ${config.border}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full ${config.bg} border-2 ${config.border} flex items-center justify-center`}>
              <StatusIcon className={`w-5 h-5 ${config.text}`} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">{owner.full_name}</h3>
              <p className={`text-sm font-medium ${config.text}`}>{config.label}</p>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            <Calendar className="w-4 h-4 inline-block ml-1" />
            {new Date(owner.created_at).toLocaleDateString('ar-SA')}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Contact Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-gray-700">
            <Phone className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium">{owner.mobile_number}</span>
          </div>
          {owner.email && (
            <div className="flex items-center gap-2 text-gray-700">
              <User className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium">{owner.email}</span>
            </div>
          )}
        </div>

        {/* Location */}
        {(owner.region || owner.city) && (
          <div className="flex items-center gap-2 text-gray-700">
            <MapPin className="w-4 h-4 text-green-600" />
            <span className="text-sm">
              {owner.city && `${owner.city}`}
              {owner.city && owner.region && ' - '}
              {owner.region && owner.region}
            </span>
          </div>
        )}

        {/* Farm Info */}
        {owner.farm_type && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 space-y-3 border-2 border-green-200">
            <h4 className="font-bold text-green-900 text-sm flex items-center gap-2">
              <TreePine className="w-4 h-4" />
              معلومات المزرعة التفصيلية:
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-white rounded-lg p-2">
                <span className="text-gray-600 text-xs">النوع:</span>
                <p className="font-bold text-gray-900">{owner.farm_type}</p>
              </div>
              {owner.farm_area && (
                <div className="bg-white rounded-lg p-2">
                  <span className="text-gray-600 text-xs">المساحة:</span>
                  <p className="font-bold text-gray-900">
                    {owner.farm_area} {owner.farm_area_unit || 'دونم'}
                  </p>
                </div>
              )}
              {(owner as any).total_palm_trees > 0 && (
                <div className="bg-white rounded-lg p-2">
                  <span className="text-gray-600 text-xs">أشجار النخيل:</span>
                  <p className="font-bold text-green-700">
                    {(owner as any).total_palm_trees} شجرة
                  </p>
                  {(owner as any).palm_tree_price && (
                    <p className="text-xs text-gray-600">
                      {(owner as any).palm_tree_price} ر.س/شجرة
                    </p>
                  )}
                </div>
              )}
              {(owner as any).total_olive_trees > 0 && (
                <div className="bg-white rounded-lg p-2">
                  <span className="text-gray-600 text-xs">أشجار الزيتون:</span>
                  <p className="font-bold text-green-700">
                    {(owner as any).total_olive_trees} شجرة
                  </p>
                  {(owner as any).olive_tree_price && (
                    <p className="text-xs text-gray-600">
                      {(owner as any).olive_tree_price} ر.س/شجرة
                    </p>
                  )}
                </div>
              )}
              {(owner as any).expected_annual_return && (
                <div className="bg-white rounded-lg p-2">
                  <span className="text-gray-600 text-xs">العائد المتوقع:</span>
                  <p className="font-bold text-blue-700">
                    {(owner as any).expected_annual_return}% سنوياً
                  </p>
                </div>
              )}
              {owner.farm_location_city && (
                <div className="col-span-2 bg-white rounded-lg p-2">
                  <span className="text-gray-600 text-xs">الموقع:</span>
                  <p className="font-medium text-gray-900">
                    {owner.farm_location_city}
                    {owner.farm_location_region && ` - ${owner.farm_location_region}`}
                  </p>
                  {(owner as any).farm_address && (
                    <p className="text-xs text-gray-600 mt-1">{(owner as any).farm_address}</p>
                  )}
                </div>
              )}
              {(owner as any).farm_description && (
                <div className="col-span-2 bg-white rounded-lg p-2">
                  <span className="text-gray-600 text-xs">الوصف:</span>
                  <p className="text-xs text-gray-800 mt-1">{(owner as any).farm_description}</p>
                </div>
              )}
            </div>

            {/* Total Value Calculation */}
            {((owner as any).total_palm_trees > 0 || (owner as any).total_olive_trees > 0) && (
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg p-3 mt-3">
                <div className="flex items-center gap-2 text-xs mb-1">
                  <DollarSign className="w-4 h-4" />
                  <span>القيمة الإجمالية المتوقعة:</span>
                </div>
                <div className="text-2xl font-black">
                  {(
                    ((owner as any).total_palm_trees || 0) * ((owner as any).palm_tree_price || 0) +
                    ((owner as any).total_olive_trees || 0) * ((owner as any).olive_tree_price || 0)
                  ).toLocaleString('ar-SA')} ر.س
                </div>
              </div>
            )}
          </div>
        )}

        {/* Rejection Reason */}
        {owner.approval_status === 'rejected' && owner.rejection_reason && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-red-900 text-sm mb-1">سبب الرفض:</h4>
                <p className="text-sm text-red-800">{owner.rejection_reason}</p>
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        {owner.notes && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-2">
              <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-blue-900 text-sm mb-1">ملاحظات:</h4>
                <p className="text-sm text-blue-800">{owner.notes}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-6 py-4 bg-gray-50 border-t-2 border-gray-100">
        {owner.approval_status === 'pending' && (
          <div className="flex gap-3">
            <button
              onClick={handleApprove}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50"
            >
              <Check className="w-5 h-5" />
              {loading ? 'جاري الاعتماد...' : 'اعتماد البطاقة'}
            </button>
            <button
              onClick={() => setShowRejectModal(true)}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl font-bold hover:from-red-700 hover:to-pink-700 transition-all disabled:opacity-50"
            >
              <X className="w-5 h-5" />
              رفض البطاقة
            </button>
          </div>
        )}

        {owner.approval_status === 'approved' && (
          <button
            onClick={handleReset}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all disabled:opacity-50"
          >
            <Clock className="w-5 h-5" />
            إعادة للمراجعة
          </button>
        )}

        {owner.approval_status === 'rejected' && (
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all disabled:opacity-50"
            >
              <Clock className="w-5 h-5" />
              إعادة للمراجعة
            </button>
            <button
              onClick={handleApprove}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50"
            >
              <Check className="w-5 h-5" />
              اعتماد الآن
            </button>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowRejectModal(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-black text-gray-900 mb-4">سبب رفض البطاقة</h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="أدخل سبب الرفض بالتفصيل..."
              className="w-full h-32 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-200 resize-none"
              dir="rtl"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200"
              >
                إلغاء
              </button>
              <button
                onClick={handleReject}
                disabled={loading || !rejectReason.trim()}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'جاري الرفض...' : 'تأكيد الرفض'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
