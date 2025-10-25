import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, MapPin, CheckCircle, XCircle, Snowflake, CreditCard as Edit, Trash2, Eye, Star, Calendar, TreePine, Building, Clock } from 'lucide-react';

interface FarmOwner {
  id: string;
  full_name: string;
  mobile_number: string;
  email?: string;
  region: string;
  city: string;
  status: 'active' | 'frozen' | 'pending';
  farms_count?: number;
  total_trees?: number;
  created_at?: string;
}

interface AdvancedOwnerCard3DProps {
  owner: FarmOwner;
  onEdit?: (owner: FarmOwner, e: React.MouseEvent) => void;
  onDelete?: (owner: FarmOwner, e: React.MouseEvent) => void;
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // إلغاء تأكيد الحذف بعد 3 ثواني
  useEffect(() => {
    if (showDeleteConfirm) {
      const timer = setTimeout(() => {
        setShowDeleteConfirm(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showDeleteConfirm]);

  const getStatusConfig = () => {
    switch (owner.status) {
      case 'active':
        return {
          label: 'نشط',
          icon: CheckCircle,
          bg: 'bg-gradient-to-r from-green-50 to-emerald-50',
          border: 'border-green-300',
          iconColor: 'text-green-600',
          ringColor: 'ring-green-400'
        };
      case 'frozen':
        return {
          label: 'مجمد',
          icon: Snowflake,
          bg: 'bg-gradient-to-r from-blue-50 to-cyan-50',
          border: 'border-blue-300',
          iconColor: 'text-blue-600',
          ringColor: 'ring-blue-400'
        };
      case 'pending':
        return {
          label: 'قيد المراجعة',
          icon: Clock,
          bg: 'bg-gradient-to-r from-amber-50 to-yellow-50',
          border: 'border-amber-300',
          iconColor: 'text-amber-600',
          ringColor: 'ring-amber-400'
        };
      default:
        return {
          label: 'غير محدد',
          icon: XCircle,
          bg: 'bg-gray-50',
          border: 'border-gray-300',
          iconColor: 'text-gray-600',
          ringColor: 'ring-gray-400'
        };
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(owner, e);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (showDeleteConfirm) {
      // تنفيذ الحذف
      setShowDeleteConfirm(false);
      if (onDelete) {
        onDelete(owner, e);
      }
    } else {
      // طلب التأكيد
      setShowDeleteConfirm(true);
    }
  };

  const handleViewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onViewSubmittedData) {
      onViewSubmittedData(owner);
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  return (
    <div className="relative bg-white rounded-2xl overflow-hidden border-4 border-gray-200 shadow-xl transition-shadow duration-300 hover:shadow-2xl">
      {/* Header Background */}
      <div className="relative h-32 bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 overflow-hidden">
        {/* Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
        </div>

        {/* Badge */}
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 shadow-lg">
          <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
          <span className="text-gray-900">صاحب مزرعة</span>
        </div>

        {/* Avatar Circle */}
        <div className="absolute -bottom-16 right-6">
          <div className={`w-32 h-32 rounded-full bg-white ring-4 ${statusConfig.ringColor} shadow-xl flex items-center justify-center`}>
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <User className="h-14 w-14 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="pt-20 px-6 pb-4">
        {/* Name and Status */}
        <div className="mb-6">
          <h3 className="text-2xl font-black text-gray-900 mb-3 leading-tight">
            {owner.full_name}
          </h3>
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black border-2 ${statusConfig.border} ${statusConfig.bg} shadow-md`}>
            <StatusIcon className={`h-4 w-4 ${statusConfig.iconColor}`} />
            <span className={statusConfig.iconColor}>{statusConfig.label}</span>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-3 mb-6">
          {/* Phone */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center flex-shrink-0 shadow-md">
              <Phone className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-blue-700 font-bold mb-0.5">رقم الجوال</p>
              <p className="text-base font-black text-blue-900" dir="ltr">{owner.mobile_number}</p>
            </div>
          </div>

          {/* Email */}
          {owner.email && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center flex-shrink-0 shadow-md">
                <Mail className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-purple-700 font-bold mb-0.5">البريد الإلكتروني</p>
                <p className="text-sm font-bold text-purple-900 truncate">{owner.email}</p>
              </div>
            </div>
          )}

          {/* Location */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-md">
              <MapPin className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-green-700 font-bold mb-0.5">الموقع</p>
              <p className="text-base font-black text-green-900">{owner.region} - {owner.city}</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Farms Count */}
          <div className="relative overflow-hidden bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border-2 border-orange-200 shadow-md">
            <div className="absolute top-0 right-0 w-20 h-20 bg-orange-200/30 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <Building className="h-5 w-5 text-orange-600" />
                <p className="text-xs font-black text-orange-900">عدد المزارع</p>
              </div>
              <p className="text-3xl font-black text-orange-600">{owner.farms_count || 0}</p>
            </div>
          </div>

          {/* Trees Count */}
          <div className="relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200 shadow-md">
            <div className="absolute top-0 right-0 w-20 h-20 bg-green-200/30 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <TreePine className="h-5 w-5 text-green-600" />
                <p className="text-xs font-black text-green-900">عدد الأشجار</p>
              </div>
              <p className="text-3xl font-black text-green-600">{owner.total_trees || 0}</p>
            </div>
          </div>
        </div>

        {/* Created Date */}
        {owner.created_at && (
          <div className="flex items-center justify-center gap-2 text-xs text-gray-600 font-bold pb-4 border-b-2 border-gray-100">
            <Calendar className="h-3.5 w-3.5" />
            <span>تاريخ الإضافة: {new Date(owner.created_at).toLocaleDateString('ar-SA')}</span>
          </div>
        )}
      </div>

      {/* Action Buttons - أسفل البطاقة */}
      <div className="px-4 pb-4 space-y-2">

        {/* عرض النموذج المرفوع */}
        <button
          onClick={handleViewClick}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 hover:from-amber-100 hover:to-orange-100 transition-all duration-200 shadow-md hover:shadow-lg group"
        >
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-200">
            <Eye className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1 text-right">
            <p className="font-black text-amber-900 text-base">عرض النموذج المرفوع</p>
            <p className="text-xs text-amber-700 font-bold">مشاهدة جميع البيانات المقدمة</p>
          </div>
        </button>

        {/* تعديل */}
        {hasEditPermission && (
          <button
            onClick={handleEditClick}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-300 hover:from-blue-100 hover:to-cyan-100 transition-all duration-200 shadow-md hover:shadow-lg group"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-200">
              <Edit className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 text-right">
              <p className="font-black text-blue-900 text-base">تعديل البيانات</p>
              <p className="text-xs text-blue-700 font-bold">تحديث معلومات المالك</p>
            </div>
          </button>
        )}

        {/* حذف */}
        {hasDeletePermission && (
          <button
            onClick={handleDeleteClick}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all duration-200 shadow-md hover:shadow-lg group ${
              showDeleteConfirm
                ? 'bg-gradient-to-r from-red-200 to-rose-200 border-red-500'
                : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-300 hover:from-red-100 hover:to-rose-100'
            }`}
          >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-md transition-all duration-200 ${
              showDeleteConfirm
                ? 'bg-gradient-to-br from-red-600 to-rose-700 animate-pulse scale-110'
                : 'bg-gradient-to-br from-red-400 to-rose-500 group-hover:scale-110'
            }`}>
              <Trash2 className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 text-right">
              <p className={`font-black text-base ${showDeleteConfirm ? 'text-red-900' : 'text-red-800'}`}>
                {showDeleteConfirm ? '⚠️ تأكيد الحذف النهائي' : 'حذف نهائي'}
              </p>
              <p className={`text-xs font-bold ${showDeleteConfirm ? 'text-red-700' : 'text-red-600'}`}>
                {showDeleteConfirm ? 'اضغط مرة أخرى لتأكيد الحذف' : 'حذف المالك وجميع بياناته'}
              </p>
            </div>
          </button>
        )}
      </div>

      {/* Bottom Accent Bar */}
      <div className="h-2 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500"></div>
    </div>
  );
}
