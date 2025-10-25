import React, { useState } from 'react';
import {
  UserCheck,
  Phone,
  Mail,
  MapPin,
  Home,
  FileText,
  DollarSign,
  Calendar,
  Clock,
  Edit,
  Trash2,
  Snowflake,
  CheckCircle,
  Building,
  TreePine,
  Map,
  Hash,
  AlertCircle,
  X,
  Info,
  Shield,
  Activity,
  Eye,
  Sparkles,
  Star,
  Crown
} from 'lucide-react';
import { FarmOwner } from '../ownersService';

interface AdvancedOwnerCard3DProps {
  owner: FarmOwner;
  onEdit?: (owner: FarmOwner) => void;
  onDelete?: (owner: FarmOwner) => void;
  onViewSubmittedData?: (owner: FarmOwner) => void;
  hasEditPermission?: boolean;
  hasDeletePermission?: boolean;
}

export function AdvancedOwnerCard3D({
  owner,
  onEdit,
  onDelete,
  onViewSubmittedData,
  hasEditPermission = false,
  hasDeletePermission = false
}: AdvancedOwnerCard3DProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const getStatusConfig = () => {
    switch (owner.status) {
      case 'active':
        return {
          label: 'نشط',
          icon: CheckCircle,
          gradient: 'from-green-500 via-emerald-500 to-green-600',
          bg: 'bg-green-50',
          text: 'text-green-700',
          border: 'border-green-300',
          shadow: 'shadow-green-500/50',
          glow: 'from-green-400/20 to-emerald-400/20'
        };
      case 'frozen':
        return {
          label: 'مجمد',
          icon: Snowflake,
          gradient: 'from-blue-500 via-cyan-500 to-blue-600',
          bg: 'bg-blue-50',
          text: 'text-blue-700',
          border: 'border-blue-300',
          shadow: 'shadow-blue-500/50',
          glow: 'from-blue-400/20 to-cyan-400/20'
        };
      default:
        return {
          label: 'غير محدد',
          icon: AlertCircle,
          gradient: 'from-gray-500 via-gray-500 to-gray-600',
          bg: 'bg-gray-50',
          text: 'text-gray-700',
          border: 'border-gray-300',
          shadow: 'shadow-gray-500/50',
          glow: 'from-gray-400/20 to-gray-400/20'
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  const handleDeleteClick = () => {
    if (showDeleteConfirm) {
      onDelete?.(owner);
      setShowDeleteConfirm(false);
    } else {
      setShowDeleteConfirm(true);
      setTimeout(() => setShowDeleteConfirm(false), 3000);
    }
  };

  return (
    <div
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 3D Card Container with Enhanced Depth */}
      <div
        className="relative bg-white rounded-3xl border-2 border-gray-200/50 overflow-hidden transition-all duration-700"
        style={{
          transform: isHovered
            ? 'perspective(1500px) rotateX(2deg) translateY(-8px)'
            : 'perspective(1500px) rotateX(0deg) translateY(0)',
          transformStyle: 'preserve-3d',
          boxShadow: isHovered
            ? '0 30px 60px -12px rgba(0, 0, 0, 0.25), 0 18px 36px -18px rgba(0, 0, 0, 0.3)'
            : '0 10px 30px -5px rgba(0, 0, 0, 0.15)'
        }}
      >
        {/* Premium Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50/30 via-white to-orange-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

        {/* Decorative Glow Effects */}
        <div className={`absolute top-0 right-0 w-96 h-96 bg-gradient-to-br ${statusConfig.glow} rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-700`} />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-amber-200/10 to-transparent rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-700" />

        {/* Sparkle Effects on Hover */}
        {isHovered && (
          <>
            <div className="absolute top-10 right-10 w-3 h-3 bg-amber-400 rounded-full animate-sparkle" />
            <div className="absolute top-20 right-32 w-2 h-2 bg-yellow-400 rounded-full animate-sparkle" style={{ animationDelay: '0.3s' }} />
            <div className="absolute top-32 right-20 w-2 h-2 bg-orange-400 rounded-full animate-sparkle" style={{ animationDelay: '0.6s' }} />
          </>
        )}

        {/* Main Content */}
        <div className="relative">
          {/* Header Section with Premium Design */}
          <div className="relative p-8 border-b-2 border-gray-100">
            {/* Status Badge - Top Right */}
            <div className="absolute top-6 left-6">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${statusConfig.bg} ${statusConfig.text} border-2 ${statusConfig.border} font-black text-sm shadow-lg`}>
                <StatusIcon className="w-4 h-4 animate-pulse" />
                <span>{statusConfig.label}</span>
              </div>
            </div>

            <div className="flex items-start gap-6 mt-12">
              {/* Ultra Premium Avatar */}
              <div className="relative group/avatar flex-shrink-0">
                {/* Glow Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${statusConfig.gradient} rounded-3xl blur-2xl opacity-40 group-hover/avatar:opacity-60 transition-all duration-500`} />

                {/* Avatar Container with 3D Effect */}
                <div
                  className={`relative w-32 h-32 rounded-3xl bg-gradient-to-br ${statusConfig.gradient} flex items-center justify-center shadow-2xl ring-4 ring-white/80 group-hover/avatar:ring-amber-300/80 transition-all duration-500`}
                  style={{
                    transform: isHovered ? 'translateZ(20px) scale(1.05)' : 'translateZ(0) scale(1)'
                  }}
                >
                  <UserCheck className="w-16 h-16 text-white group-hover/avatar:scale-110 transition-transform duration-500" strokeWidth={2.5} />
                </div>

                {/* Floating Badge */}
                <div className={`absolute -bottom-3 -right-3 w-12 h-12 bg-gradient-to-br ${statusConfig.gradient} rounded-full flex items-center justify-center shadow-xl ring-4 ring-white animate-float`}>
                  <StatusIcon className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>

                {/* Premium Star */}
                <div className="absolute -top-2 -left-2 w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-xl ring-2 ring-white animate-spin-slow">
                  <Star className="w-4 h-4 text-white" fill="white" />
                </div>
              </div>

              {/* Owner Information */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-amber-900 to-gray-900 mb-2 leading-tight">
                      {owner.full_name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <Crown className="w-5 h-5 text-amber-600" />
                      <span className="text-sm font-bold text-amber-700">صاحب مزرعة معتمد</span>
                    </div>
                  </div>
                </div>

                {/* Contact Grid with Icons */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-6">
                  {/* Phone */}
                  <div className="group/item flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border-2 border-blue-200/50 hover:border-blue-400 hover:shadow-lg transition-all">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg group-hover/item:scale-110 transition-transform">
                      <Phone className="w-5 h-5 text-white" strokeWidth={2.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-blue-600 font-bold mb-0.5">رقم الجوال</p>
                      <p className="text-base font-black text-blue-900" dir="ltr">{owner.mobile_number}</p>
                    </div>
                  </div>

                  {/* Email */}
                  {owner.email && (
                    <div className="group/item flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200/50 hover:border-purple-400 hover:shadow-lg transition-all">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg group-hover/item:scale-110 transition-transform">
                        <Mail className="w-5 h-5 text-white" strokeWidth={2.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-purple-600 font-bold mb-0.5">البريد الإلكتروني</p>
                        <p className="text-sm font-bold text-purple-900 truncate">{owner.email}</p>
                      </div>
                    </div>
                  )}

                  {/* Location */}
                  <div className="group/item flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200/50 hover:border-green-400 hover:shadow-lg transition-all">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg group-hover/item:scale-110 transition-transform">
                      <MapPin className="w-5 h-5 text-white" strokeWidth={2.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-green-600 font-bold mb-0.5">الموقع</p>
                      <p className="text-base font-black text-green-900">{owner.city}, {owner.region}</p>
                    </div>
                  </div>

                  {/* Created Date */}
                  <div className="group/item flex items-center gap-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-200/50 hover:border-amber-400 hover:shadow-lg transition-all">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg group-hover/item:scale-110 transition-transform">
                      <Calendar className="w-5 h-5 text-white" strokeWidth={2.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-amber-600 font-bold mb-0.5">تاريخ الإضافة</p>
                      <p className="text-sm font-bold text-amber-900">
                        {new Date(owner.created_at).toLocaleDateString('ar-SA')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Farm Statistics - Premium Cards */}
          <div className="relative p-6 bg-gradient-to-br from-gray-50 to-white">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <h4 className="text-lg font-black text-gray-900">معلومات المزرعة</h4>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Farm Type */}
              <div className="group/stat relative bg-white rounded-2xl p-5 border-2 border-gray-200/50 hover:border-amber-400 hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 opacity-0 group-hover/stat:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mb-3 shadow-lg group-hover/stat:scale-110 group-hover/stat:rotate-12 transition-all">
                    <TreePine className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </div>
                  <p className="text-xs text-gray-600 font-bold mb-1">نوع المزرعة</p>
                  <p className="text-xl font-black text-gray-900">{owner.farm_type}</p>
                </div>
              </div>

              {/* Farm Area */}
              <div className="group/stat relative bg-white rounded-2xl p-5 border-2 border-gray-200/50 hover:border-blue-400 hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover/stat:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center mb-3 shadow-lg group-hover/stat:scale-110 group-hover/stat:rotate-12 transition-all">
                    <Map className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </div>
                  <p className="text-xs text-gray-600 font-bold mb-1">المساحة</p>
                  <p className="text-xl font-black text-gray-900">
                    {owner.farm_area} <span className="text-sm">{owner.farm_area_unit}</span>
                  </p>
                </div>
              </div>

              {/* Price */}
              <div className="group/stat relative bg-white rounded-2xl p-5 border-2 border-gray-200/50 hover:border-green-400 hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover/stat:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-3 shadow-lg group-hover/stat:scale-110 group-hover/stat:rotate-12 transition-all">
                    <DollarSign className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </div>
                  <p className="text-xs text-gray-600 font-bold mb-1">السعر الفعلي</p>
                  <p className="text-lg font-black text-gray-900">
                    {owner.actual_price.toLocaleString('ar-SA')} <span className="text-xs">ر.س</span>
                  </p>
                </div>
              </div>

              {/* Payment Grace */}
              <div className="group/stat relative bg-white rounded-2xl p-5 border-2 border-gray-200/50 hover:border-purple-400 hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover/stat:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-3 shadow-lg group-hover/stat:scale-110 group-hover/stat:rotate-12 transition-all">
                    <Clock className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </div>
                  <p className="text-xs text-gray-600 font-bold mb-1">مهلة السداد</p>
                  <p className="text-xl font-black text-gray-900">
                    {owner.payment_grace_period} <span className="text-sm">يوم</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Location Details */}
          <div className="relative p-6 border-t-2 border-gray-100 bg-gradient-to-br from-white to-green-50/30">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-green-600" />
              <h4 className="text-lg font-black text-gray-900">تفاصيل موقع المزرعة</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3 p-4 bg-white rounded-xl border-2 border-green-200/50 shadow-sm">
                <Building className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600 font-bold mb-1">المنطقة</p>
                  <p className="text-base font-black text-gray-900">{owner.farm_location_region}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white rounded-xl border-2 border-green-200/50 shadow-sm">
                <Home className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600 font-bold mb-1">المدينة</p>
                  <p className="text-base font-black text-gray-900">{owner.farm_location_city}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white rounded-xl border-2 border-blue-200/50 shadow-sm">
                <Hash className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600 font-bold mb-1">رقم الصك</p>
                  <p className="text-base font-black text-gray-900">{owner.deed_number}</p>
                </div>
              </div>
            </div>

            {owner.farm_location_description && (
              <div className="mt-4 p-4 bg-white rounded-xl border-2 border-gray-200/50 shadow-sm">
                <div className="flex items-start gap-3">
                  <Map className="w-5 h-5 text-gray-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600 font-bold mb-1">وصف الموقع</p>
                    <p className="text-base font-medium text-gray-900 leading-relaxed">
                      {owner.farm_location_description}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Admin Notes & Frozen Info */}
          {(owner.admin_notes || (owner.status === 'frozen' && owner.frozen_reason)) && (
            <div className="relative p-6 border-t-2 border-gray-100 bg-gradient-to-br from-white to-amber-50/30">
              {owner.admin_notes && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Info className="w-5 h-5 text-amber-600" />
                    <h4 className="text-lg font-black text-gray-900">ملاحظات إدارية</h4>
                  </div>
                  <div className="p-4 bg-white rounded-xl border-2 border-amber-200/50 shadow-sm">
                    <p className="text-base font-medium text-gray-900 leading-relaxed">{owner.admin_notes}</p>
                  </div>
                </div>
              )}

              {owner.status === 'frozen' && owner.frozen_reason && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-5 h-5 text-red-600" />
                    <h4 className="text-lg font-black text-gray-900">معلومات التجميد</h4>
                  </div>
                  <div className="p-4 bg-white rounded-xl border-2 border-red-200/50 shadow-sm">
                    <p className="text-base font-medium text-gray-900 mb-2">{owner.frozen_reason}</p>
                    {owner.frozen_at && (
                      <p className="text-sm text-gray-600">
                        <Calendar className="w-4 h-4 inline ml-1" />
                        {new Date(owner.frozen_at).toLocaleString('ar-SA')}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons - Enhanced 3D Design */}
          <div className="relative p-6 bg-gradient-to-r from-gray-50 to-white border-t-2 border-gray-100">
            <div className="flex items-center justify-center gap-4 flex-wrap">
              {/* View Submitted Data Button */}
              <button
                onClick={() => onViewSubmittedData?.(owner)}
                className="group/btn flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white rounded-2xl font-black text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000" />
                <Eye className="w-6 h-6 relative z-10 group-hover/btn:scale-110 transition-transform" strokeWidth={2.5} />
                <span className="relative z-10">عرض النموذج المرفوع</span>
              </button>

              {hasEditPermission && (
                <button
                  onClick={() => onEdit?.(owner)}
                  className="group/btn flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-2xl font-black shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000" />
                  <Edit className="w-5 h-5 relative z-10 group-hover/btn:scale-110 transition-transform" strokeWidth={2.5} />
                  <span className="relative z-10">تعديل</span>
                </button>
              )}

              {hasDeletePermission && (
                <button
                  onClick={handleDeleteClick}
                  className={`group/btn flex items-center gap-3 px-6 py-4 rounded-2xl font-black shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 relative overflow-hidden ${
                    showDeleteConfirm
                      ? 'bg-gradient-to-r from-red-600 to-pink-700 animate-pulse'
                      : 'bg-gradient-to-r from-red-500 to-pink-600'
                  } text-white`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000" />
                  <Trash2 className="w-5 h-5 relative z-10 group-hover/btn:scale-110 transition-transform" strokeWidth={2.5} />
                  <span className="relative z-10">
                    {showDeleteConfirm ? 'تأكيد الحذف؟' : 'حذف'}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* System Info Footer */}
          <div className="relative p-4 bg-gradient-to-r from-gray-100 to-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                <span className="font-medium">آخر تحديث: {new Date(owner.updated_at).toLocaleString('ar-SA')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500">ID: {owner.id.slice(0, 8)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
          50% { opacity: 1; transform: scale(1.5) rotate(180deg); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(5deg); }
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .animate-sparkle {
          animation: sparkle 2s ease-in-out infinite;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
}
