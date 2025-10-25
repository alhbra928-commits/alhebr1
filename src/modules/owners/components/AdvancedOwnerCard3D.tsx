import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  XCircle,
  Snowflake,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Star,
  Calendar,
  TreePine,
  Building,
  Shield,
  Activity,
  TrendingUp,
  Clock
} from 'lucide-react';
import { Card3D } from '../../../components/ui/Card3D';

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
  const [showActions, setShowActions] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const actionsRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // إغلاق القائمة عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        actionsRef.current &&
        !actionsRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowActions(false);
        setShowDeleteConfirm(false);
      }
    };

    if (showActions) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showActions]);

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
          ringColor: 'ring-green-500',
          glowColor: 'shadow-green-500/20'
        };
      case 'frozen':
        return {
          label: 'مجمد',
          icon: Snowflake,
          bg: 'bg-gradient-to-r from-blue-50 to-cyan-50',
          border: 'border-blue-300',
          iconColor: 'text-blue-600',
          ringColor: 'ring-blue-500',
          glowColor: 'shadow-blue-500/20'
        };
      case 'pending':
        return {
          label: 'قيد المراجعة',
          icon: Clock,
          bg: 'bg-gradient-to-r from-amber-50 to-yellow-50',
          border: 'border-amber-300',
          iconColor: 'text-amber-600',
          ringColor: 'ring-amber-500',
          glowColor: 'shadow-amber-500/20'
        };
      default:
        return {
          label: 'غير محدد',
          icon: XCircle,
          bg: 'bg-gray-50',
          border: 'border-gray-300',
          iconColor: 'text-gray-600',
          ringColor: 'ring-gray-500',
          glowColor: 'shadow-gray-500/20'
        };
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowActions(false);
    if (onEdit) {
      onEdit(owner, e);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (showDeleteConfirm) {
      // تنفيذ الحذف
      setShowActions(false);
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
    setShowActions(false);
    if (onViewSubmittedData) {
      onViewSubmittedData(owner);
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  return (
    <Card3D interactive={true}>
      <div
        className={`relative bg-white rounded-2xl overflow-hidden border-4 ${statusConfig.border} ${statusConfig.bg} group transition-all duration-500 ${
          isHovered ? `ring-4 ${statusConfig.ringColor} ${statusConfig.glowColor} shadow-2xl scale-[1.02]` : 'shadow-lg'
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Header Gradient */}
        <div className="relative h-32 bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 overflow-hidden">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-white rounded-full translate-x-1/2 translate-y-1/2 animate-pulse delay-75"></div>
          </div>

          {/* Top Left Badge */}
          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 shadow-lg">
            <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
            <span className="text-gray-900">صاحب مزرعة</span>
          </div>

          {/* Actions Button */}
          <div className="absolute top-3 right-3">
            <button
              ref={buttonRef}
              onClick={(e) => {
                e.stopPropagation();
                setShowActions(!showActions);
              }}
              className={`p-2.5 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg transition-all duration-300 ${
                showActions
                  ? 'ring-2 ring-amber-400 scale-110'
                  : 'hover:scale-110 hover:shadow-xl'
              }`}
            >
              <MoreVertical className="h-5 w-5 text-gray-700" />
            </button>

            {/* Actions Menu */}
            {showActions && (
              <div
                ref={actionsRef}
                className="absolute left-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border-2 border-gray-200 py-2 min-w-[220px] z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                onClick={(e) => e.stopPropagation()}
              >
                {/* عرض النموذج المرفوع */}
                <button
                  onClick={handleViewClick}
                  className="w-full px-4 py-3 text-right hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 transition-all duration-200 flex items-center gap-3 text-sm font-bold text-gray-800 group/item"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center group-hover/item:scale-110 transition-transform duration-200">
                    <Eye className="h-4 w-4 text-white" />
                  </div>
                  <span className="flex-1">عرض النموذج المرفوع</span>
                </button>

                {/* تعديل */}
                {hasEditPermission && (
                  <button
                    onClick={handleEditClick}
                    className="w-full px-4 py-3 text-right hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 transition-all duration-200 flex items-center gap-3 text-sm font-bold text-gray-800 group/item"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center group-hover/item:scale-110 transition-transform duration-200">
                      <Edit className="h-4 w-4 text-white" />
                    </div>
                    <span className="flex-1">تعديل البيانات</span>
                  </button>
                )}

                {/* حذف */}
                {hasDeletePermission && (
                  <button
                    onClick={handleDeleteClick}
                    className={`w-full px-4 py-3 text-right transition-all duration-200 flex items-center gap-3 text-sm font-bold group/item ${
                      showDeleteConfirm
                        ? 'bg-gradient-to-r from-red-100 to-rose-100 text-red-900'
                        : 'hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 text-gray-800'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                      showDeleteConfirm
                        ? 'bg-gradient-to-br from-red-500 to-rose-600 scale-110 animate-pulse'
                        : 'bg-gradient-to-br from-red-400 to-rose-500 group-hover/item:scale-110'
                    }`}>
                      <Trash2 className="h-4 w-4 text-white" />
                    </div>
                    <span className="flex-1">
                      {showDeleteConfirm ? '⚠️ اضغط مرة أخرى للتأكيد' : 'حذف نهائي'}
                    </span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Avatar Circle */}
          <div className="absolute -bottom-16 right-6">
            <div className={`w-32 h-32 rounded-full bg-white ring-4 ${statusConfig.ringColor} shadow-xl flex items-center justify-center transform transition-transform duration-300 ${
              isHovered ? 'scale-110' : ''
            }`}>
              <div className={`w-28 h-28 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center`}>
                <User className="h-14 w-14 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="pt-20 px-6 pb-6">
          {/* Name and Status */}
          <div className="mb-6">
            <h3 className="text-2xl font-black text-gray-900 mb-3 leading-tight">
              {owner.full_name}
            </h3>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black border-2 ${statusConfig.border} ${statusConfig.bg} shadow-sm`}>
              <StatusIcon className={`h-4 w-4 ${statusConfig.iconColor}`} />
              <span className={statusConfig.iconColor}>{statusConfig.label}</span>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-3 mb-6">
            {/* Phone */}
            <div className="flex items-center gap-3 group/contact">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center flex-shrink-0 shadow-md group-hover/contact:scale-110 transition-transform duration-200">
                <Phone className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-600 font-bold mb-0.5">رقم الجوال</p>
                <p className="text-base font-black text-gray-900" dir="ltr">{owner.mobile_number}</p>
              </div>
            </div>

            {/* Email */}
            {owner.email && (
              <div className="flex items-center gap-3 group/contact">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center flex-shrink-0 shadow-md group-hover/contact:scale-110 transition-transform duration-200">
                  <Mail className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-600 font-bold mb-0.5">البريد الإلكتروني</p>
                  <p className="text-sm font-bold text-gray-900 truncate">{owner.email}</p>
                </div>
              </div>
            )}

            {/* Location */}
            <div className="flex items-center gap-3 group/contact">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-md group-hover/contact:scale-110 transition-transform duration-200">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-600 font-bold mb-0.5">الموقع</p>
                <p className="text-base font-black text-gray-900">{owner.region} - {owner.city}</p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            {/* Farms Count */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border-2 border-orange-200">
              <div className="flex items-center gap-2 mb-2">
                <Building className="h-4 w-4 text-orange-600" />
                <p className="text-xs font-bold text-orange-900">عدد المزارع</p>
              </div>
              <p className="text-2xl font-black text-orange-600">{owner.farms_count || 0}</p>
            </div>

            {/* Trees Count */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <TreePine className="h-4 w-4 text-green-600" />
                <p className="text-xs font-bold text-green-900">عدد الأشجار</p>
              </div>
              <p className="text-2xl font-black text-green-600">{owner.total_trees || 0}</p>
            </div>
          </div>

          {/* Created Date */}
          {owner.created_at && (
            <div className="flex items-center justify-center gap-2 text-xs text-gray-600 font-bold pt-4 border-t-2 border-gray-100">
              <Calendar className="h-3.5 w-3.5" />
              <span>تاريخ الإضافة: {new Date(owner.created_at).toLocaleDateString('ar-SA')}</span>
            </div>
          )}

          {/* Hover Effect Indicator */}
          <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 transition-all duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}></div>
        </div>

        {/* Animated Corner Accent */}
        <div className={`absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-white/40 to-transparent rounded-br-full transition-all duration-300 ${
          isHovered ? 'scale-150 opacity-50' : 'opacity-30'
        }`}></div>
      </div>
    </Card3D>
  );
}
