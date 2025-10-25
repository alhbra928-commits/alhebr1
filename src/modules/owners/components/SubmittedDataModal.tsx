import React, { useEffect, useState } from 'react';
import {
  X,
  CheckCircle,
  XCircle,
  User,
  Phone,
  Mail,
  MapPin,
  TreePine,
  Map,
  DollarSign,
  Clock,
  Hash,
  Building,
  Home,
  FileText,
  Calendar,
  AlertCircle,
  Loader
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface SubmittedDataModalProps {
  owner: any;
  onClose: () => void;
  onApprove?: () => void;
}

export function SubmittedDataModal({ owner, onClose, onApprove }: SubmittedDataModalProps) {
  const [submittedData, setSubmittedData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    loadSubmittedData();
  }, [owner.id]);

  const loadSubmittedData = async () => {
    try {
      setLoading(true);

      // أولاً: محاولة البحث عن طلب مرفوع من لوحة صاحب المزرعة
      const { data: submission, error } = await supabase
        .from('farm_submission_requests')
        .select('*')
        .eq('profile_id', owner.id)
        .order('submitted_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error loading submission:', error);
      }

      // إذا لم يوجد طلب مرفوع، استخدم بيانات المالك من جدول farm_owners
      if (!submission) {
        // جلب بيانات المالك الكاملة
        const { data: ownerData, error: ownerError } = await supabase
          .from('farm_owners')
          .select('*')
          .eq('id', owner.id)
          .maybeSingle();

        if (ownerError) {
          console.error('Error loading owner data:', ownerError);
          setSubmittedData(null);
        } else {
          // تحويل بيانات المالك إلى صيغة النموذج المرفوع
          setSubmittedData({
            submitted_data: ownerData,
            status: 'direct_entry', // علامة أنه تم إدخاله مباشرة من الأدمن
            varieties_data: []
          });
        }
      } else {
        setSubmittedData(submission);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!submittedData) return;

    try {
      setApproving(true);

      // تحديث حالة الطلب إلى approved
      const { error } = await supabase
        .from('farm_submission_requests')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', submittedData.id);

      if (error) throw error;

      alert('✅ تم قبول الطلب بنجاح!');
      onApprove?.();
      onClose();
    } catch (error: any) {
      console.error('Error approving:', error);
      alert('حدث خطأ: ' + error.message);
    } finally {
      setApproving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-8">
          <div className="flex flex-col items-center justify-center py-12">
            <Loader className="w-12 h-12 text-amber-600 animate-spin mb-4" />
            <p className="text-lg font-bold text-gray-700">جاري تحميل البيانات...</p>
          </div>
        </div>
      </div>
    );
  }

  const data = submittedData?.submitted_data || owner;
  const varieties = submittedData?.varieties_data || [];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl my-8">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-6 rounded-t-3xl">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          <div className="text-center text-white">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-black mb-2">النموذج المرفوع</h2>
            <p className="text-white/90 font-medium">
              البيانات المقدمة من لوحة صاحب المزرعة
            </p>
          </div>

          {/* Status Badge */}
          {submittedData && (
            <div className="absolute top-4 right-4">
              {submittedData.status === 'direct_entry' ? (
                <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-black flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  إدخال مباشر
                </div>
              ) : submittedData.status === 'pending' ? (
                <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-black flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  قيد المراجعة
                </div>
              ) : submittedData.status === 'approved' ? (
                <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-black flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  مقبول
                </div>
              ) : (
                <div className="bg-red-100 text-red-800 px-4 py-2 rounded-full text-sm font-black flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  مرفوض
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {!submittedData ? (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl font-bold text-gray-700 mb-2">لا يوجد نموذج مرفوع</p>
              <p className="text-gray-600">لم يتم العثور على بيانات مقدمة من لوحة صاحب المزرعة</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Personal Information */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900">المعلومات الشخصية</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl p-4">
                    <p className="text-sm text-gray-600 mb-1">الاسم الكامل</p>
                    <p className="text-lg font-black text-gray-900">{data.full_name}</p>
                  </div>

                  <div className="bg-white rounded-xl p-4">
                    <p className="text-sm text-gray-600 mb-1">رقم الجوال</p>
                    <p className="text-lg font-black text-gray-900" dir="ltr">{data.mobile_number}</p>
                  </div>

                  {data.email && (
                    <div className="bg-white rounded-xl p-4">
                      <p className="text-sm text-gray-600 mb-1">البريد الإلكتروني</p>
                      <p className="text-base font-bold text-gray-900">{data.email}</p>
                    </div>
                  )}

                  <div className="bg-white rounded-xl p-4">
                    <p className="text-sm text-gray-600 mb-1">المنطقة</p>
                    <p className="text-lg font-black text-gray-900">{data.region}</p>
                  </div>

                  <div className="bg-white rounded-xl p-4">
                    <p className="text-sm text-gray-600 mb-1">المدينة</p>
                    <p className="text-lg font-black text-gray-900">{data.city}</p>
                  </div>
                </div>
              </div>

              {/* Farm Information */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <TreePine className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900">معلومات المزرعة</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <TreePine className="w-4 h-4 text-green-600" />
                      <p className="text-sm text-gray-600">نوع المزرعة</p>
                    </div>
                    <p className="text-lg font-black text-gray-900">{data.farm_type}</p>
                  </div>

                  <div className="bg-white rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Map className="w-4 h-4 text-blue-600" />
                      <p className="text-sm text-gray-600">المساحة</p>
                    </div>
                    <p className="text-lg font-black text-gray-900">
                      {data.farm_area} {data.farm_area_unit}
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <p className="text-sm text-gray-600">السعر الفعلي</p>
                    </div>
                    <p className="text-lg font-black text-gray-900">
                      {data.actual_price?.toLocaleString('ar-SA')} ر.س
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-purple-600" />
                      <p className="text-sm text-gray-600">مهلة السداد</p>
                    </div>
                    <p className="text-lg font-black text-gray-900">
                      {data.payment_grace_period} يوم
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Hash className="w-4 h-4 text-blue-600" />
                      <p className="text-sm text-gray-600">رقم الصك</p>
                    </div>
                    <p className="text-lg font-black text-gray-900">{data.deed_number}</p>
                  </div>
                </div>
              </div>

              {/* Farm Location */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border-2 border-amber-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900">موقع المزرعة</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Building className="w-4 h-4 text-amber-600" />
                      <p className="text-sm text-gray-600">المنطقة</p>
                    </div>
                    <p className="text-lg font-black text-gray-900">{data.farm_location_region}</p>
                  </div>

                  <div className="bg-white rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Home className="w-4 h-4 text-amber-600" />
                      <p className="text-sm text-gray-600">المدينة</p>
                    </div>
                    <p className="text-lg font-black text-gray-900">{data.farm_location_city}</p>
                  </div>

                  {data.farm_location_description && (
                    <div className="bg-white rounded-xl p-4 md:col-span-2">
                      <div className="flex items-center gap-2 mb-1">
                        <Map className="w-4 h-4 text-amber-600" />
                        <p className="text-sm text-gray-600">وصف الموقع</p>
                      </div>
                      <p className="text-base font-medium text-gray-900 leading-relaxed">
                        {data.farm_location_description}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Varieties */}
              {varieties.length > 0 && (
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                      <TreePine className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900">الأصناف</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {varieties.map((variety: any, index: number) => (
                      <div key={index} className="bg-white rounded-xl p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-base font-black text-gray-900">{variety.name}</p>
                            <p className="text-sm text-gray-600">{variety.type}</p>
                          </div>
                          <div className="text-left">
                            <p className="text-2xl font-black text-purple-600">{variety.count}</p>
                            <p className="text-xs text-gray-600">شجرة</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Admin Notes */}
              {data.admin_notes && (
                <div className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-200">
                  <div className="flex items-center gap-3 mb-3">
                    <FileText className="w-5 h-5 text-gray-600" />
                    <h4 className="text-lg font-black text-gray-900">ملاحظات إدارية</h4>
                  </div>
                  <p className="text-base text-gray-700 leading-relaxed">{data.admin_notes}</p>
                </div>
              )}

              {/* Submission Date */}
              {submittedData?.submitted_at && (
                <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-center gap-2 text-gray-600">
                  <Calendar className="w-5 h-5" />
                  <span className="font-bold">تاريخ التقديم:</span>
                  <span>{new Date(submittedData.submitted_at).toLocaleString('ar-SA')}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {submittedData && submittedData.status === 'pending' && (
          <div className="p-6 bg-gray-50 rounded-b-3xl border-t-2 border-gray-200">
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={handleApprove}
                disabled={approving}
                className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-black text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {approving ? (
                  <>
                    <Loader className="w-6 h-6 animate-spin" />
                    جاري القبول...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-6 h-6" />
                    قبول الطلب
                  </>
                )}
              </button>

              <button
                onClick={onClose}
                className="flex items-center gap-3 px-8 py-4 bg-gray-200 text-gray-700 rounded-2xl font-black text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
              >
                <X className="w-6 h-6" />
                إغلاق
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
