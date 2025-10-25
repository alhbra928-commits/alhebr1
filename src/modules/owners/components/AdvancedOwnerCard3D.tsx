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
  Eye,
  Sparkles,
  Star,
  Crown,
  MoreVertical
} from 'lucide-react';
import { Card3D } from '../../../components/ui/Card3D';
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
  const [showActions, setShowActions] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const getStatusConfig = () => {
    switch (owner.status) {
      case 'active':
        return {
          label: 'نشط',
          icon: CheckCircle,
          gradient: 'from-green-500 to-emerald-600',
          bg: 'bg-green-50',
          text: 'text-green-700',
          border: 'border-green-400',
          iconColor: 'text-green-600'
        };
      case 'frozen':
        return {
          label: 'مجمد',
          icon: Snowflake,
          gradient: 'from-blue-500 to-cyan-600',
          bg: 'bg-blue-50',
          text: 'text-blue-700',
          border: 'border-blue-400',
          iconColor: 'text-blue-600'
        };
      default:
        return {
          label: 'غير محدد',
          icon: AlertCircle,
          gradient: 'from-gray-500 to-gray-600',
          bg: 'bg-gray-50',
          text: 'text-gray-700',
          border: 'border-gray-400',
          iconColor: 'text-gray-600'
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
    <Card3D interactive={false}>
      <div className={`relative bg-white rounded-2xl overflow-hidden border-4 ${statusConfig.border} ${statusConfig.bg} group cursor-pointer transition-all duration-300`}>
        {/* Header Image/Avatar Section */}
        <div className="relative h-48 bg-gradient-to-br from-amber-100 via-orange-50 to-yellow-100 flex items-center justify-center overflow-hidden">
          {/* Decorative Background */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-400 rounded-full blur-3xl" />
          </div>

          {/* Premium Avatar */}
          <div className="relative z-10">
            <div className="relative group/avatar">
              {/* Glow Effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${statusConfig.gradient} rounded-3xl blur-2xl opacity-40 group-hover/avatar:opacity-60 transition-all duration-500`} />

              {/* Avatar Container */}
              <div className={`relative w-32 h-32 rounded-3xl bg-gradient-to-br ${statusConfig.gradient} flex items-center justify-center shadow-2xl ring-4 ring-white/90 group-hover/avatar:scale-110 transition-all duration-500`}>
                <UserCheck className="w-16 h-16 text-white" strokeWidth={2.5} />
              </div>

              {/* Crown Badge */}
              <div className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-xl ring-4 ring-white">
                <Crown className="w-5 h-5 text-white" />
              </div>

              {/* Status Badge */}
              <div className={`absolute -bottom-2 -left-2 w-10 h-10 bg-gradient-to-br ${statusConfig.gradient} rounded-full flex items-center justify-center shadow-xl ring-4 ring-white`}>
                <StatusIcon className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

          {/* Top Right Badge */}
          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-lg">
            <Star className="h-3 w-3 text-amber-600" />
            صاحب مزرعة
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-black text-gray-900 mb-2 flex items-center gap-2">
                {owner.full_name}
              </h3>
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border-2 ${statusConfig.border} ${statusConfig.bg}`}>
                <StatusIcon className={`h-3.5 w-3.5 ${statusConfig.iconColor}`} />
                {statusConfig.label}
              </div>
            </div>

            {/* Actions Menu */}
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MoreVertical className="h-5 w-5 text-gray-600" />
              </button>

              {showActions && (
                <div className="absolute left-0 top-full mt-2 bg-white rounded-xl shadow-2xl border-2 border-gray-200 py-2 min-w-[180px] z-50">
                  <button
                    onClick={() => {
                      onViewSubmittedData?.(owner);
                      setShowActions(false);
                    }}
                    className="w-full px-4 py-2 text-right hover:bg-amber-50 transition-colors flex items-center gap-3 text-sm font-bold text-gray-700"
                  >
                    <Eye className="h-4 w-4 text-amber-600" />
                    عرض النموذج المرفوع
                  </button>

                  {hasEditPermission && (
                    <button
                      onClick={() => {
                        onEdit?.(owner);
                        setShowActions(false);
                      }}
                      className="w-full px-4 py-2 text-right hover:bg-blue-50 transition-colors flex items-center gap-3 text-sm font-bold text-gray-700"
                    >
                      <Edit className="h-4 w-4 text-blue-600" />
                      تعديل
                    </button>
                  )}

                  {hasDeletePermission && (
                    <button
                      onClick={handleDeleteClick}
                      className={`w-full px-4 py-2 text-right transition-colors flex items-center gap-3 text-sm font-bold ${
                        showDeleteConfirm
                          ? 'bg-red-100 text-red-700'
                          : 'hover:bg-red-50 text-gray-700'
                      }`}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                      {showDeleteConfirm ? 'تأكيد الحذف؟' : 'حذف'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center flex-shrink-0">
                <Phone className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold" dir="ltr">{owner.mobile_number}</span>
            </div>

            {owner.email && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center flex-shrink-0">
                  <Mail className="h-4 w-4 text-white" />
                </div>
                <span className="font-medium truncate">{owner.email}</span>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm text-gray-700">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                <MapPin className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold">{owner.city}, {owner.region}</span>
            </div>
          </div>

          {/* Farm Stats */}
          <div className="mb-4 bg-gradient-to-r from-gray-50 to-white rounded-xl p-4 border-2 border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-amber-600" />
              <h4 className="text-sm font-black text-gray-900">معلومات المزرعة</h4>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <TreePine className="h-4 w-4 text-amber-600 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-600">النوع</p>
                  <p className="text-sm font-black text-gray-900">{owner.farm_type}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Map className="h-4 w-4 text-blue-600 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-600">المساحة</p>
                  <p className="text-sm font-black text-gray-900">
                    {owner.farm_area} {owner.farm_area_unit}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-600">السعر</p>
                  <p className="text-xs font-black text-gray-900">
                    {owner.actual_price.toLocaleString('ar-SA')} ر.س
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-purple-600 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-600">المهلة</p>
                  <p className="text-sm font-black text-gray-900">
                    {owner.payment_grace_period} يوم
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Location Details */}
          <div className="mb-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="h-4 w-4 text-green-600" />
              <h4 className="text-sm font-black text-gray-900">موقع المزرعة</h4>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Building className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                <span className="text-gray-700"><span className="font-bold">المنطقة:</span> {owner.farm_location_region}</span>
              </div>

              <div className="flex items-center gap-2">
                <Home className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                <span className="text-gray-700"><span className="font-bold">المدينة:</span> {owner.farm_location_city}</span>
              </div>

              <div className="flex items-center gap-2">
                <Hash className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" />
                <span className="text-gray-700"><span className="font-bold">الصك:</span> {owner.deed_number}</span>
              </div>
            </div>
          </div>

          {/* Admin Notes */}
          {owner.admin_notes && (
            <div className="mb-4 bg-amber-50 rounded-xl p-3 border-2 border-amber-200">
              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-amber-900 mb-1">ملاحظات</p>
                  <p className="text-xs text-gray-700 leading-relaxed">{owner.admin_notes}</p>
                </div>
              </div>
            </div>
          )}

          {/* Frozen Info */}
          {owner.status === 'frozen' && owner.frozen_reason && (
            <div className="mb-4 bg-red-50 rounded-xl p-3 border-2 border-red-200">
              <div className="flex items-start gap-2">
                <Snowflake className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-red-900 mb-1">سبب التجميد</p>
                  <p className="text-xs text-gray-700 leading-relaxed">{owner.frozen_reason}</p>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="pt-4 border-t-2 border-gray-100">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <span>{new Date(owner.created_at).toLocaleDateString('ar-SA')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono">{owner.id.slice(0, 8)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card3D>
  );
}
