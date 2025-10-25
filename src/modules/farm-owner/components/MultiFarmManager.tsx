import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Eye, MapPin, TreePine, Calendar, Check, Clock, XCircle, Trash2 } from 'lucide-react';
import { farmOwnerService } from '../services/farmOwnerService';
import { SmartFarmDataForm } from './SmartFarmDataForm';

interface MultiFarmManagerProps {
  profileId: string;
}

interface Farm {
  id: string;
  farm_code: string;
  region_ar: string;
  city_ar: string;
  tree_type_ar: string;
  total_trees: number;
  reserved_trees: number;
  available_trees: number;
  actual_total_price: number;
  submission_status: string;
  status: string;
  created_at: string;
  deed_number?: string;
  total_farm_area?: number;
  farm_area_unit?: string;
}

export const MultiFarmManager: React.FC<MultiFarmManagerProps> = ({ profileId }) => {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingFarm, setEditingFarm] = useState<Farm | null>(null);

  useEffect(() => {
    loadFarms();
  }, [profileId]);

  const loadFarms = async () => {
    setLoading(true);
    const farmsData = await farmOwnerService.getOwnerFarms(profileId);
    setFarms(farmsData);
    setLoading(false);
  };

  const handleAddNew = () => {
    setEditingFarm(null);
    setShowForm(true);
  };

  const handleEdit = (farm: Farm) => {
    setEditingFarm(farm);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingFarm(null);
    loadFarms();
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: {
        icon: Clock,
        text: 'قيد المراجعة',
        color: '#F59E0B',
        bg: 'rgba(245, 158, 11, 0.1)'
      },
      approved: {
        icon: Check,
        text: 'معتمدة',
        color: '#10B981',
        bg: 'rgba(16, 185, 129, 0.1)'
      },
      rejected: {
        icon: XCircle,
        text: 'مرفوضة',
        color: '#EF4444',
        bg: 'rgba(239, 68, 68, 0.1)'
      },
      draft: {
        icon: Edit2,
        text: 'مسودة',
        color: '#6B7280',
        bg: 'rgba(107, 114, 128, 0.1)'
      }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    const Icon = config.icon;

    return (
      <div
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold"
        style={{ color: config.color, background: config.bg }}
      >
        <Icon size={16} />
        {config.text}
      </div>
    );
  };

  if (showForm) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-gray-800">
              {editingFarm ? 'تعديل بيانات المزرعة' : 'إضافة مزرعة جديدة'}
            </h2>
            <p className="text-gray-600 mt-1">
              {editingFarm ? `تعديل: ${editingFarm.farm_code}` : 'أضف مزرعة جديدة للمنصة'}
            </p>
          </div>
          <button
            onClick={() => {
              setShowForm(false);
              setEditingFarm(null);
            }}
            className="px-4 py-2 rounded-xl border-2 border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition-colors"
          >
            إلغاء
          </button>
        </div>

        {/* Form */}
        <SmartFarmDataForm
          profileId={profileId}
          onSuccess={handleFormSuccess}
          initialData={editingFarm}
          farmId={editingFarm?.id}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-800">مزارعي</h2>
          <p className="text-gray-600 mt-1">إدارة جميع مزارعك من مكان واحد</p>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all hover:scale-105"
          style={{
            background: 'linear-gradient(135deg, #8BC34A, #689F38)',
            boxShadow: '0 4px 15px rgba(139, 195, 74, 0.3)'
          }}
        >
          <Plus size={20} />
          إضافة مزرعة جديدة
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div
            className="inline-block w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto"
            style={{ borderColor: '#8BC34A', borderTopColor: 'transparent' }}
          />
          <p className="mt-4 text-gray-600 font-semibold">جاري التحميل...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && farms.length === 0 && (
        <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-gray-300">
          <div
            className="w-24 h-24 rounded-full mx-auto flex items-center justify-center mb-6"
            style={{ background: 'rgba(139, 195, 74, 0.1)' }}
          >
            <TreePine size={48} style={{ color: '#8BC34A' }} />
          </div>
          <h3 className="text-xl font-black text-gray-800 mb-2">لا توجد مزارع بعد</h3>
          <p className="text-gray-600 mb-6">ابدأ بإضافة أول مزرعة لك على المنصة</p>
          <button
            onClick={handleAddNew}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #8BC34A, #689F38)',
              boxShadow: '0 4px 15px rgba(139, 195, 74, 0.3)'
            }}
          >
            <Plus size={20} />
            إضافة مزرعة جديدة
          </button>
        </div>
      )}

      {/* Farms Grid */}
      {!loading && farms.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {farms.map((farm) => (
            <div
              key={farm.id}
              className="bg-white rounded-3xl p-6 border-2 border-gray-200 hover:border-green-500 transition-all hover:shadow-xl group"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ background: 'rgba(139, 195, 74, 0.1)' }}
                    >
                      <TreePine size={24} style={{ color: '#8BC34A' }} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-gray-800">{farm.farm_code}</h3>
                      <p className="text-xs text-gray-500">{farm.tree_type_ar}</p>
                    </div>
                  </div>
                  {getStatusBadge(farm.submission_status)}
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4 pb-4 border-b border-gray-100">
                <MapPin size={16} style={{ color: '#8BC34A' }} />
                <span>{farm.region_ar} - {farm.city_ar}</span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-green-50 rounded-xl p-3">
                  <p className="text-xs text-gray-600 mb-1">إجمالي الأشجار</p>
                  <p className="text-xl font-black text-green-600">{farm.total_trees}</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-3">
                  <p className="text-xs text-gray-600 mb-1">المحجوزة</p>
                  <p className="text-xl font-black text-blue-600">{farm.reserved_trees}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span>نسبة البيع</span>
                  <span className="font-bold">
                    {farm.total_trees > 0
                      ? Math.round((farm.reserved_trees / farm.total_trees) * 100)
                      : 0}%
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${farm.total_trees > 0 ? (farm.reserved_trees / farm.total_trees) * 100 : 0}%`,
                      background: 'linear-gradient(90deg, #8BC34A, #689F38)'
                    }}
                  />
                </div>
              </div>

              {/* Price */}
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-3 mb-4">
                <p className="text-xs text-gray-600 mb-1">السعر الإجمالي</p>
                <p className="text-lg font-black text-amber-600">
                  {farm.actual_total_price?.toLocaleString()} ريال
                </p>
              </div>

              {/* Date */}
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                <Calendar size={14} />
                <span>أُضيفت: {new Date(farm.created_at).toLocaleDateString('ar-SA')}</span>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleEdit(farm)}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl border-2 border-blue-500 text-blue-600 font-bold hover:bg-blue-50 transition-colors"
                >
                  <Edit2 size={16} />
                  تعديل
                </button>
                <button
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl border-2 border-green-500 text-green-600 font-bold hover:bg-green-50 transition-colors"
                >
                  <Eye size={16} />
                  عرض
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Card */}
      {!loading && farms.length > 0 && (
        <div
          className="bg-gradient-to-br from-green-600 to-green-700 rounded-3xl p-8 text-white"
          style={{
            boxShadow: '0 20px 60px rgba(139, 195, 74, 0.3)'
          }}
        >
          <h3 className="text-2xl font-black mb-6">إحصائيات عامة</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <p className="text-sm text-green-100 mb-1">عدد المزارع</p>
              <p className="text-3xl font-black">{farms.length}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <p className="text-sm text-green-100 mb-1">إجمالي الأشجار</p>
              <p className="text-3xl font-black">
                {farms.reduce((sum, f) => sum + f.total_trees, 0)}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <p className="text-sm text-green-100 mb-1">الأشجار المحجوزة</p>
              <p className="text-3xl font-black">
                {farms.reduce((sum, f) => sum + f.reserved_trees, 0)}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <p className="text-sm text-green-100 mb-1">المزارع المعتمدة</p>
              <p className="text-3xl font-black">
                {farms.filter(f => f.submission_status === 'approved').length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
