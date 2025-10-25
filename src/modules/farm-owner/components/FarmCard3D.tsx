import React, { useState } from 'react';
import {
  TreePine,
  MapPin,
  DollarSign,
  Users,
  CheckCircle,
  Clock,
  XCircle,
  Wallet,
  BarChart3,
  Edit,
  Eye,
  ChevronRight,
  AlertCircle,
  Calendar
} from 'lucide-react';

interface FarmCard3DProps {
  farm: {
    id: string;
    farm_code: string;
    region_ar: string;
    city_ar: string;
    tree_type_ar: string;
    total_trees: number;
    actual_total_price: number;
    price_per_tree: number;
    submission_status: 'pending' | 'approved' | 'rejected';
    status: string;
    created_at: string;
    varieties?: Array<{
      variety_name: string;
      variety_count: number;
    }>;
  };
  financialData?: {
    total_revenue: number;
    total_investors: number;
    trees_sold: number;
    trees_remaining: number;
    sales_percentage: number;
    is_closed: boolean;
    settlement_status?: 'pending' | 'completed' | null;
    owner_share?: number;
  };
  onEdit?: () => void;
  onViewDetails?: () => void;
}

export const FarmCard3D: React.FC<FarmCard3DProps> = ({
  farm,
  financialData,
  onEdit,
  onViewDetails
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getStatusColor = () => {
    switch (farm.submission_status) {
      case 'approved':
        return '#10B981';
      case 'pending':
        return '#F59E0B';
      case 'rejected':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getStatusText = () => {
    switch (farm.submission_status) {
      case 'approved':
        return 'معتمدة';
      case 'pending':
        return 'قيد المراجعة';
      case 'rejected':
        return 'مرفوضة';
      default:
        return farm.status;
    }
  };

  const getStatusIcon = () => {
    switch (farm.submission_status) {
      case 'approved':
        return <CheckCircle size={20} />;
      case 'pending':
        return <Clock size={20} />;
      case 'rejected':
        return <XCircle size={20} />;
      default:
        return <AlertCircle size={20} />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="bg-white rounded-3xl border-2 border-gray-200 overflow-hidden transition-all duration-500 cursor-pointer"
        style={{
          transform: isHovered ? 'translateY(-8px) rotateX(2deg)' : 'translateY(0) rotateX(0)',
          boxShadow: isHovered
            ? '0 20px 60px rgba(0, 0, 0, 0.15)'
            : '0 4px 12px rgba(0, 0, 0, 0.08)',
          transformStyle: 'preserve-3d'
        }}
      >
        {/* الهيدر مع حالة المزرعة */}
        <div
          className="p-6 text-white relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${getStatusColor()}, ${getStatusColor()}dd)`
          }}
        >
          <div
            className="absolute top-0 right-0 w-64 h-64 opacity-10"
            style={{
              background: 'radial-gradient(circle, white 0%, transparent 70%)',
              transform: isHovered ? 'scale(1.2)' : 'scale(1)',
              transition: 'transform 0.5s'
            }}
          />

          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <TreePine size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black">{farm.farm_code}</h3>
                  <p className="text-sm opacity-90">{farm.tree_type_ar}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-2 rounded-xl">
                {getStatusIcon()}
                <span className="text-sm font-bold">{getStatusText()}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm opacity-90">
              <MapPin size={16} />
              <span>{farm.region_ar} - {farm.city_ar}</span>
            </div>
          </div>
        </div>

        {/* معلومات المزرعة الأساسية */}
        <div className="p-6 space-y-4">
          {/* الأشجار والأصناف */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-green-600 mb-2">
                <TreePine size={20} />
                <span className="text-sm font-bold">إجمالي الأشجار</span>
              </div>
              <p className="text-2xl font-black text-green-700">{farm.total_trees.toLocaleString('ar-SA')}</p>
              {farm.varieties && farm.varieties.length > 0 && (
                <p className="text-xs text-green-600 mt-1">
                  {farm.varieties.length} صنف
                </p>
              )}
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-blue-600 mb-2">
                <DollarSign size={20} />
                <span className="text-sm font-bold">السعر الكلي</span>
              </div>
              <p className="text-xl font-black text-blue-700">
                {formatCurrency(farm.actual_total_price)}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                {formatCurrency(farm.price_per_tree)}/شجرة
              </p>
            </div>
          </div>

          {/* المعلومات المالية (إذا كانت متوفرة) */}
          {financialData && (
            <div className="border-2 border-gray-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 size={20} className="text-purple-600" />
                <h4 className="font-black text-gray-800">الحالة المالية</h4>
              </div>

              {/* نسبة المبيعات */}
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">نسبة المبيعات</span>
                  <span className="font-bold text-purple-600">
                    {financialData.sales_percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-500"
                    style={{ width: `${financialData.sales_percentage}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                  <span>مباع: {financialData.trees_sold}</span>
                  <span>متبقي: {financialData.trees_remaining}</span>
                </div>
              </div>

              {/* الإيرادات والمستثمرين */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-50 rounded-xl p-3">
                  <div className="flex items-center gap-1 text-green-600 mb-1">
                    <Wallet size={16} />
                    <span className="text-xs font-bold">الإيرادات</span>
                  </div>
                  <p className="text-lg font-black text-green-700">
                    {formatCurrency(financialData.total_revenue)}
                  </p>
                </div>

                <div className="bg-blue-50 rounded-xl p-3">
                  <div className="flex items-center gap-1 text-blue-600 mb-1">
                    <Users size={16} />
                    <span className="text-xs font-bold">المستثمرين</span>
                  </div>
                  <p className="text-lg font-black text-blue-700">
                    {financialData.total_investors}
                  </p>
                </div>
              </div>

              {/* حالة الإغلاق والتسوية */}
              <div className="flex items-center gap-2">
                {financialData.is_closed && (
                  <div className="flex-1 bg-orange-50 border-2 border-orange-200 rounded-xl px-3 py-2">
                    <div className="flex items-center gap-2 text-orange-600">
                      <Clock size={16} />
                      <span className="text-xs font-bold">مغلقة للبيع</span>
                    </div>
                  </div>
                )}

                {financialData.settlement_status === 'completed' && (
                  <div className="flex-1 bg-green-50 border-2 border-green-200 rounded-xl px-3 py-2">
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle size={16} />
                      <span className="text-xs font-bold">تمت التسوية</span>
                      {financialData.owner_share && (
                        <span className="text-xs">
                          ({formatCurrency(financialData.owner_share)})
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {financialData.settlement_status === 'pending' && (
                  <div className="flex-1 bg-yellow-50 border-2 border-yellow-200 rounded-xl px-3 py-2">
                    <div className="flex items-center gap-2 text-yellow-600">
                      <AlertCircle size={16} />
                      <span className="text-xs font-bold">تسوية قيد الانتظار</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* الأصناف (إذا كانت متوفرة) */}
          {farm.varieties && farm.varieties.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-gray-700">الأصناف:</h4>
              <div className="flex flex-wrap gap-2">
                {farm.varieties.slice(0, 3).map((variety, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-xl px-3 py-2"
                  >
                    <p className="text-xs font-bold text-emerald-700">{variety.variety_name}</p>
                    <p className="text-xs text-emerald-600">{variety.variety_count} شجرة</p>
                  </div>
                ))}
                {farm.varieties.length > 3 && (
                  <div className="bg-gray-100 rounded-xl px-3 py-2 flex items-center justify-center">
                    <p className="text-xs font-bold text-gray-600">
                      +{farm.varieties.length - 3} صنف
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* تاريخ الإضافة */}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Calendar size={14} />
            <span>أضيفت في {formatDate(farm.created_at)}</span>
          </div>
        </div>

        {/* الأزرار */}
        <div className="px-6 pb-6 flex gap-3">
          {onViewDetails && (
            <button
              onClick={onViewDetails}
              className="flex-1 py-3 rounded-xl font-bold text-white transition-all hover:scale-105 flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)'
              }}
            >
              <Eye size={20} />
              عرض التفاصيل
              <ChevronRight size={20} />
            </button>
          )}

          {onEdit && farm.submission_status !== 'pending' && (
            <button
              onClick={onEdit}
              className="px-4 py-3 rounded-xl font-bold border-2 border-gray-300 text-gray-700 transition-all hover:border-gray-400 hover:bg-gray-50 flex items-center justify-center gap-2"
            >
              <Edit size={20} />
              تعديل
            </button>
          )}
        </div>

        {/* تأثير الإضاءة */}
        <div
          className="absolute inset-0 pointer-events-none opacity-0 transition-opacity duration-500"
          style={{
            opacity: isHovered ? 0.1 : 0,
            background: 'radial-gradient(circle at 50% 0%, white, transparent 70%)'
          }}
        />
      </div>
    </div>
  );
};
