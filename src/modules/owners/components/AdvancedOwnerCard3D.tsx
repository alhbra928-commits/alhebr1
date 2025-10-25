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
  CreditCard,
  TreePine,
  Map,
  Hash,
  Wallet,
  AlertCircle,
  X,
  ChevronDown,
  ChevronUp,
  Info,
  Shield,
  Activity
} from 'lucide-react';
import { FarmOwner } from '../ownersService';

interface AdvancedOwnerCard3DProps {
  owner: FarmOwner;
  onEdit?: (owner: FarmOwner) => void;
  onDelete?: (owner: FarmOwner) => void;
  onViewDetails?: (owner: FarmOwner) => void;
  hasEditPermission?: boolean;
  hasDeletePermission?: boolean;
}

export function AdvancedOwnerCard3D({
  owner,
  onEdit,
  onDelete,
  onViewDetails,
  hasEditPermission = false,
  hasDeletePermission = false
}: AdvancedOwnerCard3DProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const getStatusConfig = () => {
    switch (owner.status) {
      case 'active':
        return {
          label: 'نشط',
          icon: CheckCircle,
          gradient: 'from-green-500 to-emerald-600',
          bg: 'bg-green-100',
          text: 'text-green-800',
          glow: 'shadow-green-500/50'
        };
      case 'frozen':
        return {
          label: 'مجمد',
          icon: Snowflake,
          gradient: 'from-blue-500 to-cyan-600',
          bg: 'bg-blue-100',
          text: 'text-blue-800',
          glow: 'shadow-blue-500/50'
        };
      default:
        return {
          label: 'غير محدد',
          icon: AlertCircle,
          gradient: 'from-gray-500 to-gray-600',
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          glow: 'shadow-gray-500/50'
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  return (
    <div className="group relative">
      {/* 3D Card Container */}
      <div
        className="relative bg-white rounded-3xl border-2 border-gray-200/50 shadow-2xl hover:shadow-3xl transition-all duration-700 overflow-hidden"
        style={{
          transform: 'perspective(1000px)',
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 via-white to-orange-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-200/20 to-transparent rounded-full blur-3xl group-hover:blur-2xl transition-all" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-orange-200/20 to-transparent rounded-full blur-3xl group-hover:blur-2xl transition-all" />

        {/* Header Section */}
        <div className="relative p-8 border-b-2 border-gray-100">
          <div className="flex items-start justify-between gap-6">
            {/* Owner Avatar & Info */}
            <div className="flex items-start gap-6 flex-1">
              {/* Premium Avatar */}
              <div className="relative group/avatar">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-600 rounded-2xl blur-xl opacity-40 animate-pulse" />
                <div className={`relative w-24 h-24 rounded-2xl bg-gradient-to-br ${statusConfig.gradient} flex items-center justify-center shadow-2xl ring-4 ring-white/60 group-hover/avatar:ring-amber-200/80 transition-all duration-500 group-hover/avatar:scale-110`}>
                  <UserCheck className="w-12 h-12 text-white" strokeWidth={2.5} />
                </div>
                {/* Status Badge on Avatar */}
                <div className={`absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-br ${statusConfig.gradient} rounded-full flex items-center justify-center shadow-xl ring-4 ring-white animate-bounce-gentle`}>
                  <StatusIcon className="w-5 h-5 text-white" />
                </div>
              </div>

              {/* Owner Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-2xl font-black text-gray-900 truncate">
                    {owner.full_name}
                  </h3>
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${statusConfig.bg} ${statusConfig.text} text-xs font-black`}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    {statusConfig.label}
                  </div>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                      <Phone className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-sm" dir="ltr">{owner.mobile_number}</span>
                  </div>

                  {owner.email && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                        <Mail className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-medium text-sm truncate">{owner.email}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-gray-600">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-sm">{owner.city}, {owner.region}</span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium text-sm">
                      {new Date(owner.created_at).toLocaleDateString('ar-SA')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
              {hasEditPermission && (
                <button
                  onClick={() => onEdit?.(owner)}
                  className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 text-white rounded-xl hover:shadow-xl hover:scale-110 transition-all duration-300"
                  title="تعديل"
                >
                  <Edit className="w-5 h-5" />
                </button>
              )}

              {hasDeletePermission && (
                <button
                  onClick={() => onDelete?.(owner)}
                  className="p-3 bg-gradient-to-br from-red-500 to-pink-600 text-white rounded-xl hover:shadow-xl hover:scale-110 transition-all duration-300"
                  title="حذف"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}

              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-xl hover:shadow-xl hover:scale-110 transition-all duration-300"
                title={isExpanded ? "إخفاء التفاصيل" : "عرض التفاصيل"}
              >
                {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Farm Info Stats - Always Visible */}
        <div className="relative p-6 bg-gradient-to-r from-gray-50 to-white">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 border-2 border-gray-200/50 hover:border-amber-300 hover:shadow-lg transition-all">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                  <TreePine className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs text-gray-600 font-bold">نوع المزرعة</span>
              </div>
              <p className="text-lg font-black text-gray-900">{owner.farm_type}</p>
            </div>

            <div className="bg-white rounded-2xl p-4 border-2 border-gray-200/50 hover:border-blue-300 hover:shadow-lg transition-all">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                  <Map className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs text-gray-600 font-bold">مساحة المزرعة</span>
              </div>
              <p className="text-lg font-black text-gray-900">
                {owner.farm_area} {owner.farm_area_unit}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-4 border-2 border-gray-200/50 hover:border-green-300 hover:shadow-lg transition-all">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs text-gray-600 font-bold">السعر الفعلي</span>
              </div>
              <p className="text-lg font-black text-gray-900">
                {owner.actual_price.toLocaleString('ar-SA')} ر.س
              </p>
            </div>

            <div className="bg-white rounded-2xl p-4 border-2 border-gray-200/50 hover:border-purple-300 hover:shadow-lg transition-all">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs text-gray-600 font-bold">مهلة السداد</span>
              </div>
              <p className="text-lg font-black text-gray-900">
                {owner.payment_grace_period} يوم
              </p>
            </div>
          </div>
        </div>

        {/* Expandable Details Section */}
        {isExpanded && (
          <div className="relative p-6 border-t-2 border-gray-100 bg-gradient-to-br from-white to-gray-50 animate-fade-in">
            <div className="space-y-6">
              {/* Farm Location Details */}
              <div className="bg-white rounded-2xl p-6 border-2 border-gray-200/50 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-xl font-black text-gray-900">موقع المزرعة</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                    <Building className="w-5 h-5 text-green-600 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600 font-bold mb-1">المنطقة</p>
                      <p className="text-base font-black text-gray-900">{owner.farm_location_region}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                    <Home className="w-5 h-5 text-green-600 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600 font-bold mb-1">المدينة</p>
                      <p className="text-base font-black text-gray-900">{owner.farm_location_city}</p>
                    </div>
                  </div>
                  {owner.farm_location_description && (
                    <div className="col-span-1 md:col-span-2 flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                      <Map className="w-5 h-5 text-green-600 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600 font-bold mb-1">وصف الموقع</p>
                        <p className="text-base font-medium text-gray-900 leading-relaxed">
                          {owner.farm_location_description}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Legal & Documentation */}
              <div className="bg-white rounded-2xl p-6 border-2 border-gray-200/50 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-xl font-black text-gray-900">المستندات القانونية</h4>
                </div>
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                    <Hash className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-bold mb-1">رقم الصك</p>
                    <p className="text-lg font-black text-gray-900">{owner.deed_number}</p>
                  </div>
                </div>
              </div>

              {/* Admin Notes */}
              {owner.admin_notes && (
                <div className="bg-white rounded-2xl p-6 border-2 border-amber-200/50 shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                      <Info className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="text-xl font-black text-gray-900">ملاحظات إدارية</h4>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-xl">
                    <p className="text-base font-medium text-gray-900 leading-relaxed">
                      {owner.admin_notes}
                    </p>
                  </div>
                </div>
              )}

              {/* Frozen Info */}
              {owner.status === 'frozen' && owner.frozen_reason && (
                <div className="bg-white rounded-2xl p-6 border-2 border-red-200/50 shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="text-xl font-black text-gray-900">معلومات التجميد</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl">
                      <AlertCircle className="w-5 h-5 text-red-600 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600 font-bold mb-1">سبب التجميد</p>
                        <p className="text-base font-medium text-gray-900">{owner.frozen_reason}</p>
                      </div>
                    </div>
                    {owner.frozen_at && (
                      <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl">
                        <Calendar className="w-5 h-5 text-red-600" />
                        <div>
                          <p className="text-sm text-gray-600 font-bold mb-1">تاريخ التجميد</p>
                          <p className="text-base font-medium text-gray-900">
                            {new Date(owner.frozen_at).toLocaleString('ar-SA')}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* System Info */}
              <div className="bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl p-6 border-2 border-gray-200/50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-500 to-gray-700 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="text-lg font-black text-gray-900">معلومات النظام</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span className="font-bold">تاريخ الإضافة:</span>
                    <span className="font-medium">
                      {new Date(owner.created_at).toLocaleString('ar-SA')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span className="font-bold">آخر تحديث:</span>
                    <span className="font-medium">
                      {new Date(owner.updated_at).toLocaleString('ar-SA')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes bounce-gentle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }

        .animate-bounce-gentle {
          animation: bounce-gentle 2s ease-in-out infinite;
        }

        .shadow-3xl {
          box-shadow: 0 35px 60px -15px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>
  );
}
