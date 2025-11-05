import React, { useState } from 'react';
import {
  Check, X, Clock, User, Phone, MapPin, FileText, Calendar,
  AlertCircle, CheckCircle2, XCircle, TreePine, DollarSign,
  Mail, Building, Sparkles, TrendingUp, MapPinned, Image,
  CreditCard, Wallet, BarChart3, Eye, Edit, Trash2
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface FarmOwner {
  id: string;
  full_name: string;
  mobile_number: string;
  email?: string;
  national_id?: string;
  region?: string;
  city?: string;
  farm_location_region?: string;
  farm_location_city?: string;
  farm_type?: string;
  farm_area?: number;
  farm_area_unit?: string;
  total_palm_trees?: number;
  total_olive_trees?: number;
  available_palm_trees?: number;
  available_olive_trees?: number;
  palm_tree_price?: number;
  olive_tree_price?: number;
  farm_coordinates?: string;
  farm_address?: string;
  farm_description?: string;
  farm_images?: string[];
  expected_annual_return?: number;
  bank_name?: string;
  bank_account_number?: string;
  iban?: string;
  approval_status: 'pending' | 'approved' | 'rejected';
  approved_at?: string;
  rejection_reason?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

interface FarmOwnerApprovalCardProps {
  owner: FarmOwner;
  onApprove?: () => void;
  onReject?: () => void;
  onUpdate?: () => void;
  onDelete?: () => void;
}

export function FarmOwnerApprovalCard({ owner, onApprove, onReject, onUpdate, onDelete }: FarmOwnerApprovalCardProps) {
  const [loading, setLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleApprove = async () => {
    if (!confirm('هل أنت متأكد من اعتماد هذه البطاقة؟')) return;

    try {
      setLoading(true);

      const adminData = localStorage.getItem('admin_user');
      const adminId = adminData ? JSON.parse(adminData).id : null;

      console.log('🔄 جاري اعتماد البطاقة:', owner.full_name);

      const { data, error } = await supabase.rpc('approve_farm_owner', {
        p_owner_id: owner.id,
        p_admin_id: adminId,
        p_notes: null
      });

      if (error) {
        console.error('❌ خطأ في استدعاء الدالة:', error);
        throw error;
      }

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

      const adminData = localStorage.getItem('admin_user');
      const adminId = adminData ? JSON.parse(adminData).id : null;

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

      const adminData = localStorage.getItem('admin_user');
      const adminId = adminData ? JSON.parse(adminData).id : null;

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

  const handleDelete = async () => {
    if (!confirm('⚠️ تحذير: سيتم حذف البطاقة نهائياً. هل أنت متأكد؟')) return;

    try {
      setLoading(true);

      const { error } = await supabase
        .from('farm_owners')
        .update({
          deleted_at: new Date().toISOString(),
          deleted_by: '00000000-0000-0000-0000-000000000000'
        })
        .eq('id', owner.id);

      if (error) throw error;

      alert('✅ تم حذف البطاقة بنجاح');
      setShowDeleteConfirm(false);
      onDelete?.();
      onUpdate?.();
    } catch (error: any) {
      console.error('❌ خطأ في الحذف:', error);
      alert(`خطأ: ${error.message || 'حدث خطأ غير متوقع'}`);
    } finally {
      setLoading(false);
    }
  };

  const statusConfig = {
    pending: {
      bg: 'bg-gradient-to-br from-amber-50 to-yellow-50',
      border: 'border-amber-300',
      text: 'text-amber-800',
      badgeBg: 'bg-amber-500',
      icon: Clock,
      label: 'في انتظار المراجعة',
      glow: 'shadow-amber-200'
    },
    approved: {
      bg: 'bg-gradient-to-br from-emerald-50 to-green-50',
      border: 'border-emerald-300',
      text: 'text-emerald-800',
      badgeBg: 'bg-emerald-500',
      icon: CheckCircle2,
      label: 'معتمد',
      glow: 'shadow-emerald-200'
    },
    rejected: {
      bg: 'bg-gradient-to-br from-rose-50 to-red-50',
      border: 'border-rose-300',
      text: 'text-rose-800',
      badgeBg: 'bg-rose-500',
      icon: XCircle,
      label: 'مرفوض',
      glow: 'shadow-rose-200'
    }
  };

  const config = statusConfig[owner.approval_status];
  const StatusIcon = config.icon;

  const totalValue = (
    (owner.total_palm_trees || 0) * (owner.palm_tree_price || 0) +
    (owner.total_olive_trees || 0) * (owner.olive_tree_price || 0)
  );

  const totalTrees = (owner.total_palm_trees || 0) + (owner.total_olive_trees || 0);

  return (
    <>
      <div
        className={`relative bg-white rounded-3xl border-2 ${config.border} shadow-2xl ${config.glow} overflow-hidden transition-all duration-300 hover:shadow-3xl hover:scale-[1.01]`}
        dir="rtl"
      >
        {/* Premium Header with Gradient */}
        <div className={`${config.bg} px-6 py-5 border-b-2 ${config.border} relative overflow-hidden`}>
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
          </div>

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Status Badge */}
              <div className={`relative w-14 h-14 rounded-2xl ${config.badgeBg} flex items-center justify-center shadow-lg`}>
                <StatusIcon className="w-7 h-7 text-white" />
                <div className={`absolute -top-1 -right-1 w-4 h-4 ${config.badgeBg} rounded-full border-2 border-white animate-pulse`}></div>
              </div>

              {/* Owner Info */}
              <div>
                <h3 className="font-black text-xl text-gray-900 flex items-center gap-2">
                  {owner.full_name}
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-sm font-bold ${config.text} px-3 py-1 rounded-full bg-white/70 backdrop-blur`}>
                    {config.label}
                  </span>
                  {owner.approved_at && (
                    <span className="text-xs text-gray-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {new Date(owner.approved_at).toLocaleDateString('ar-SA')}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Date Badge */}
            <div className="bg-white/80 backdrop-blur rounded-2xl px-4 py-2 shadow-lg">
              <div className="flex items-center gap-2 text-gray-700">
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-bold">
                  {new Date(owner.created_at).toLocaleDateString('ar-SA')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            {/* Total Trees */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border-2 border-green-200">
              <TreePine className="w-6 h-6 text-green-600 mb-2" />
              <div className="text-2xl font-black text-green-700">{totalTrees}</div>
              <div className="text-xs text-gray-600 font-medium">إجمالي الأشجار</div>
            </div>

            {/* Total Value */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border-2 border-blue-200">
              <DollarSign className="w-6 h-6 text-blue-600 mb-2" />
              <div className="text-2xl font-black text-blue-700">
                {(totalValue / 1000).toFixed(0)}k
              </div>
              <div className="text-xs text-gray-600 font-medium">القيمة (ر.س)</div>
            </div>

            {/* Expected Return */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 border-2 border-purple-200">
              <TrendingUp className="w-6 h-6 text-purple-600 mb-2" />
              <div className="text-2xl font-black text-purple-700">
                {owner.expected_annual_return || 0}%
              </div>
              <div className="text-xs text-gray-600 font-medium">العائد السنوي</div>
            </div>
          </div>

          {/* Contact Info Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-3 border border-blue-200">
              <div className="flex items-center gap-2 text-blue-700">
                <Phone className="w-4 h-4" />
                <span className="text-sm font-bold">{owner.mobile_number}</span>
              </div>
            </div>

            {owner.email && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-3 border border-purple-200">
                <div className="flex items-center gap-2 text-purple-700">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm font-bold truncate">{owner.email}</span>
                </div>
              </div>
            )}

            {owner.national_id && (
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-3 border border-gray-200">
                <div className="flex items-center gap-2 text-gray-700">
                  <CreditCard className="w-4 h-4" />
                  <span className="text-sm font-bold">{owner.national_id}</span>
                </div>
              </div>
            )}

            {(owner.city || owner.region) && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-3 border border-green-200">
                <div className="flex items-center gap-2 text-green-700">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm font-bold">
                    {owner.city}{owner.city && owner.region && ' - '}{owner.region}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Farm Details - Collapsible */}
          {owner.farm_type && (
            <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-2xl border-2 border-green-300 overflow-hidden">
              {/* Header */}
              <button
                onClick={() => setExpanded(!expanded)}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-white/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <TreePine className="w-6 h-6 text-green-700" />
                  <h4 className="font-black text-green-900 text-lg">تفاصيل المزرعة الكاملة</h4>
                </div>
                <div className={`transform transition-transform ${expanded ? 'rotate-180' : ''}`}>
                  <svg className="w-5 h-5 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {/* Content */}
              {expanded && (
                <div className="px-5 pb-5 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    {/* Farm Type */}
                    <div className="bg-white rounded-xl p-3 shadow-sm">
                      <span className="text-xs text-gray-600 font-medium">نوع المزرعة</span>
                      <p className="font-black text-gray-900 mt-1">{owner.farm_type}</p>
                    </div>

                    {/* Farm Area */}
                    {owner.farm_area && (
                      <div className="bg-white rounded-xl p-3 shadow-sm">
                        <span className="text-xs text-gray-600 font-medium">المساحة</span>
                        <p className="font-black text-gray-900 mt-1">
                          {owner.farm_area} {owner.farm_area_unit || 'دونم'}
                        </p>
                      </div>
                    )}

                    {/* Palm Trees */}
                    {owner.total_palm_trees && owner.total_palm_trees > 0 && (
                      <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl p-3 shadow-sm">
                        <span className="text-xs text-green-700 font-medium">أشجار النخيل</span>
                        <p className="font-black text-green-900 text-lg mt-1">{owner.total_palm_trees}</p>
                        {owner.palm_tree_price && (
                          <p className="text-xs text-green-600 mt-1">
                            {owner.palm_tree_price.toLocaleString('ar-SA')} ر.س/شجرة
                          </p>
                        )}
                        <p className="text-xs text-gray-600 mt-1">
                          متاح: {owner.available_palm_trees || 0}
                        </p>
                      </div>
                    )}

                    {/* Olive Trees */}
                    {owner.total_olive_trees && owner.total_olive_trees > 0 && (
                      <div className="bg-gradient-to-br from-amber-100 to-yellow-100 rounded-xl p-3 shadow-sm">
                        <span className="text-xs text-amber-700 font-medium">أشجار الزيتون</span>
                        <p className="font-black text-amber-900 text-lg mt-1">{owner.total_olive_trees}</p>
                        {owner.olive_tree_price && (
                          <p className="text-xs text-amber-600 mt-1">
                            {owner.olive_tree_price.toLocaleString('ar-SA')} ر.س/شجرة
                          </p>
                        )}
                        <p className="text-xs text-gray-600 mt-1">
                          متاح: {owner.available_olive_trees || 0}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Farm Location */}
                  {owner.farm_location_city && (
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                      <div className="flex items-start gap-2">
                        <MapPinned className="w-5 h-5 text-red-500 flex-shrink-0" />
                        <div className="flex-1">
                          <span className="text-xs text-gray-600 font-medium">موقع المزرعة</span>
                          <p className="font-bold text-gray-900 mt-1">
                            {owner.farm_location_city}
                            {owner.farm_location_region && ` - ${owner.farm_location_region}`}
                          </p>
                          {owner.farm_address && (
                            <p className="text-sm text-gray-600 mt-2">{owner.farm_address}</p>
                          )}
                          {owner.farm_coordinates && (
                            <p className="text-xs text-blue-600 mt-1">📍 {owner.farm_coordinates}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Farm Description */}
                  {owner.farm_description && (
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                      <div className="flex items-start gap-2">
                        <FileText className="w-5 h-5 text-blue-500 flex-shrink-0" />
                        <div className="flex-1">
                          <span className="text-xs text-gray-600 font-medium">وصف المزرعة</span>
                          <p className="text-sm text-gray-800 mt-1 leading-relaxed">{owner.farm_description}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Bank Info */}
                  {owner.bank_name && (
                    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-4 border border-indigo-200">
                      <div className="flex items-start gap-2">
                        <Building className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                        <div className="flex-1">
                          <span className="text-xs text-indigo-700 font-medium">البيانات البنكية</span>
                          <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                            <div>
                              <span className="text-xs text-gray-600">البنك:</span>
                              <p className="font-bold text-gray-900">{owner.bank_name}</p>
                            </div>
                            {owner.bank_account_number && (
                              <div>
                                <span className="text-xs text-gray-600">رقم الحساب:</span>
                                <p className="font-bold text-gray-900 font-mono">{owner.bank_account_number}</p>
                              </div>
                            )}
                            {owner.iban && (
                              <div className="col-span-2">
                                <span className="text-xs text-gray-600">IBAN:</span>
                                <p className="font-bold text-gray-900 font-mono">{owner.iban}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Total Value Highlight */}
                  {totalValue > 0 && (
                    <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-xl p-4 shadow-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 text-sm mb-1 text-blue-100">
                            <BarChart3 className="w-4 h-4" />
                            <span className="font-medium">القيمة الإجمالية المتوقعة</span>
                          </div>
                          <div className="text-3xl font-black">
                            {totalValue.toLocaleString('ar-SA')} ر.س
                          </div>
                        </div>
                        <Wallet className="w-12 h-12 opacity-30" />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Rejection Reason */}
          {owner.approval_status === 'rejected' && owner.rejection_reason && (
            <div className="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-300 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-black text-red-900 mb-2">سبب الرفض</h4>
                  <p className="text-sm text-red-800 leading-relaxed">{owner.rejection_reason}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions Footer */}
        <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-slate-50 border-t-2 border-gray-200">
          {owner.approval_status === 'pending' && (
            <div className="flex gap-3">
              <button
                onClick={handleApprove}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white rounded-2xl font-black text-sm hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
              >
                <Check className="w-5 h-5" />
                {loading ? 'جاري الاعتماد...' : 'اعتماد البطاقة'}
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-rose-600 via-red-600 to-pink-600 text-white rounded-2xl font-black text-sm hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
              >
                <X className="w-5 h-5" />
                رفض البطاقة
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={loading}
                className="px-4 py-3.5 bg-gray-300 text-gray-700 rounded-2xl font-black hover:bg-gray-400 transition-all disabled:opacity-50"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          )}

          {owner.approval_status === 'approved' && (
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-gray-300 to-slate-300 text-gray-800 rounded-2xl font-black text-sm hover:shadow-lg transition-all disabled:opacity-50"
              >
                <Clock className="w-5 h-5" />
                إعادة للمراجعة
              </button>
              <button
                onClick={() => setShowDetailsModal(true)}
                className="px-5 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black hover:shadow-lg transition-all"
              >
                <Eye className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={loading}
                className="px-5 py-3.5 bg-red-500 text-white rounded-2xl font-black hover:bg-red-600 transition-all disabled:opacity-50"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          )}

          {owner.approval_status === 'rejected' && (
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-gray-300 to-slate-300 text-gray-800 rounded-2xl font-black text-sm hover:shadow-lg transition-all disabled:opacity-50"
              >
                <Clock className="w-5 h-5" />
                إعادة للمراجعة
              </button>
              <button
                onClick={handleApprove}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-2xl font-black text-sm hover:shadow-xl transition-all disabled:opacity-50"
              >
                <Check className="w-5 h-5" />
                اعتماد الآن
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={loading}
                className="px-5 py-3.5 bg-red-500 text-white rounded-2xl font-black hover:bg-red-600 transition-all disabled:opacity-50"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowRejectModal(false)}>
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center">
                <X className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-black text-gray-900">سبب رفض البطاقة</h3>
            </div>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="أدخل سبب الرفض بالتفصيل..."
              className="w-full h-40 px-4 py-3 border-2 border-gray-300 rounded-2xl focus:border-red-500 focus:ring-4 focus:ring-red-200 resize-none text-sm"
              dir="rtl"
            />
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 px-5 py-3.5 bg-gray-200 text-gray-700 rounded-2xl font-black hover:bg-gray-300 transition-all"
              >
                إلغاء
              </button>
              <button
                onClick={handleReject}
                disabled={loading || !rejectReason.trim()}
                className="flex-1 px-5 py-3.5 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-2xl font-black hover:shadow-lg transition-all disabled:opacity-50"
              >
                {loading ? 'جاري الرفض...' : 'تأكيد الرفض'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-black text-gray-900">تأكيد الحذف</h3>
            </div>
            <p className="text-gray-700 mb-6 leading-relaxed">
              هل أنت متأكد من حذف بطاقة <span className="font-black text-red-600">{owner.full_name}</span>؟
              <br />
              لن يمكن التراجع عن هذا الإجراء.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-5 py-3.5 bg-gray-200 text-gray-700 rounded-2xl font-black hover:bg-gray-300 transition-all"
              >
                إلغاء
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 px-5 py-3.5 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-2xl font-black hover:shadow-lg transition-all disabled:opacity-50"
              >
                {loading ? 'جاري الحذف...' : 'حذف نهائياً'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
