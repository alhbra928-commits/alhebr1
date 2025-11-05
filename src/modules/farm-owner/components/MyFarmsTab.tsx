import React, { useState, useEffect } from 'react';
import { Plus, MapPin, TrendingUp, Calendar, Phone, CheckCircle, Clock, XCircle, Edit } from 'lucide-react';
import { OwnersService } from '../../owners/ownersService';
import { UnifiedFarmSubmissionForm } from './UnifiedFarmSubmissionForm';
import { useRealtimeTables } from '../../../lib/realtimeSync';

interface MyFarmsTabProps {
  profileId: string;
  currentPhone: string;
}

export const MyFarmsTab: React.FC<MyFarmsTabProps> = ({ profileId, currentPhone }) => {
  const [farms, setFarms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  const loadFarms = async () => {
    try {
      setLoading(true);

      // جلب جميع المزارع لهذا المالك باستخدام رقم الجوال
      const allFarms = await OwnersService.getAllOwners();

      // تصفية المزارع الخاصة بهذا المستخدم
      const myFarms = allFarms.filter(farm =>
        farm.owner_phone === currentPhone || farm.mobile_number === currentPhone
      );

      setFarms(myFarms);
    } catch (error) {
      console.error('Error loading farms:', error);
      setFarms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFarms();

    // الاستماع للتحديثات في الوقت الفعلي
    const unsubscribe = useRealtimeTables([
      {
        name: 'farm_owners',
        callbacks: {
          onInsert: loadFarms,
          onUpdate: loadFarms,
          onDelete: loadFarms
        }
      }
    ]);

    return () => unsubscribe();
  }, [currentPhone]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border-2 border-green-500 rounded-xl">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="font-bold text-green-700">✅ مزرعة معتمدة</span>
          </div>
        );
      case 'pending':
        return (
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border-2 border-amber-500 rounded-xl">
            <Clock className="h-5 w-5 text-amber-600" />
            <span className="font-bold text-amber-700">🕒 بانتظار الاعتماد</span>
          </div>
        );
      case 'rejected':
        return (
          <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border-2 border-red-500 rounded-xl">
            <XCircle className="h-5 w-5 text-red-600" />
            <span className="font-bold text-red-700">❌ مرفوضة</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-500/10 border-2 border-gray-500 rounded-xl">
            <span className="font-bold text-gray-700">غير محدد</span>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-lg font-semibold text-gray-700">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* الهيدر */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-gray-900">🌴 مزرعتي</h2>
          <p className="text-gray-600 mt-1">إدارة مزارعك وتتبع حالة الاعتماد</p>
        </div>

        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:shadow-lg transition-all transform hover:scale-105 font-bold"
          style={{
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)'
          }}
        >
          <Plus className="h-5 w-5" />
          إضافة مزرعة جديدة
        </button>
      </div>

      {/* البطاقات */}
      {farms.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-block p-8 bg-gradient-to-br from-emerald-50 to-green-50 rounded-3xl">
            <div className="text-6xl mb-4">🌴</div>
            <h3 className="text-2xl font-black text-gray-800 mb-2">لا توجد مزارع مضافة</h3>
            <p className="text-gray-600 mb-6">ابدأ بإضافة مزرعتك الأولى الآن!</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:shadow-lg transition-all transform hover:scale-105 font-bold"
            >
              <Plus className="h-5 w-5" />
              إضافة مزرعة جديدة
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {farms.map((farm) => (
            <div
              key={farm.id}
              className="group relative"
              style={{
                perspective: '1000px'
              }}
            >
              <div
                className="relative bg-gradient-to-br from-white via-emerald-50/30 to-green-50/30 rounded-3xl p-6 border-2 border-emerald-200/50 transition-all duration-500 transform hover:scale-105"
                style={{
                  boxShadow: '0 10px 40px rgba(16, 185, 129, 0.15)',
                  backdropFilter: 'blur(10px)',
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(236, 253, 245, 0.9) 100%)'
                }}
              >
                {/* صورة المزرعة */}
                {farm.farm_image_url && (
                  <div className="mb-4 rounded-2xl overflow-hidden border-2 border-emerald-200">
                    <img
                      src={farm.farm_image_url}
                      alt="صورة المزرعة"
                      className="w-full h-48 object-cover"
                    />
                  </div>
                )}

                {/* الحالة */}
                <div className="mb-4">
                  {getStatusBadge(farm.approval_status)}
                </div>

                {/* معلومات المالك */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center text-white font-black">
                      {(farm.owner_full_name || farm.full_name || '؟').charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">
                        {farm.owner_full_name || farm.full_name || 'غير محدد'}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <Phone className="h-3 w-3" />
                        {farm.owner_phone || farm.mobile_number || 'غير محدد'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* تفاصيل المزرعة */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-white/60 rounded-xl">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-emerald-600" />
                      <span className="text-sm font-medium text-gray-700">الموقع</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      {farm.farm_location || farm.city || 'غير محدد'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white/60 rounded-xl">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-emerald-600" />
                      <span className="text-sm font-medium text-gray-700">المساحة</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      {farm.farm_area} {farm.farm_area_unit}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white/60 rounded-xl">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🌴</span>
                      <span className="text-sm font-medium text-gray-700">النوع</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      {farm.farm_type}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-500/10 to-green-500/10 rounded-xl border border-emerald-300">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">💰</span>
                      <span className="text-sm font-medium text-gray-700">السعر</span>
                    </div>
                    <span className="text-lg font-black text-emerald-700">
                      {(farm.farm_price || farm.actual_price || 0).toLocaleString('ar-SA')} ريال
                    </span>
                  </div>

                  {farm.payment_duration_days && (
                    <div className="flex items-center justify-between p-3 bg-white/60 rounded-xl">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-emerald-600" />
                        <span className="text-sm font-medium text-gray-700">مدة السداد</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">
                        {farm.payment_duration_days} يوم
                      </span>
                    </div>
                  )}
                </div>

                {/* سبب الرفض (إن وجد) */}
                {farm.approval_status === 'rejected' && farm.rejection_reason && (
                  <div className="mt-4 p-3 bg-red-50 border-2 border-red-200 rounded-xl">
                    <p className="text-xs font-bold text-red-900 mb-1">سبب الرفض:</p>
                    <p className="text-xs text-red-700">{farm.rejection_reason}</p>
                  </div>
                )}

                {/* تاريخ الإضافة */}
                <div className="mt-4 pt-4 border-t border-emerald-200/50">
                  <p className="text-xs text-gray-500 text-center">
                    أُضيفت في: {new Date(farm.created_at).toLocaleDateString('ar-SA')}
                  </p>
                </div>
              </div>

              {/* تأثير الإضاءة */}
              <div
                className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: 'radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.1) 0%, transparent 70%)',
                  filter: 'blur(20px)'
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* زر إضافة عائم (يظهر دائماً في الأسفل على الجوال) */}
      <div className="md:hidden fixed bottom-20 left-1/2 transform -translate-x-1/2 z-40">
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-full hover:shadow-lg transition-all transform hover:scale-105 font-bold shadow-2xl"
          style={{
            boxShadow: '0 0 30px rgba(16, 185, 129, 0.6), 0 10px 40px rgba(0, 0, 0, 0.3)'
          }}
        >
          <Plus className="h-6 w-6" />
          إضافة مزرعة
        </button>
      </div>

      {/* نموذج الإضافة */}
      {showAddForm && (
        <UnifiedFarmSubmissionForm
          profileId={profileId}
          currentPhone={currentPhone}
          onSuccess={loadFarms}
          onClose={() => setShowAddForm(false)}
        />
      )}
    </div>
  );
};
