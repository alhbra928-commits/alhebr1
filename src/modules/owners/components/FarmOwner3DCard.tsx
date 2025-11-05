import React, { useState } from 'react';
import {
  User,
  Phone,
  MapPin,
  Ruler,
  DollarSign,
  CreditCard,
  Calendar,
  Edit,
  Trash2,
  Wallet,
  ExternalLink,
  TreePine,
  Droplets,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface FarmOwnerData {
  id: string;
  owner_full_name: string;
  owner_phone: string;
  farm_location: string;
  farm_area: number;
  farm_area_unit: string;
  farm_type: string;
  farm_type_other?: string;
  farm_price: number;
  bank_iban: string;
  payment_duration_days: number;
  farm_image_url?: string;
  manual_entry: boolean;
  approval_status: string;
  status: string;
  created_at: string;
}

interface FarmOwner3DCardProps {
  owner: FarmOwnerData;
  onEdit: () => void;
  onDelete: () => void;
  onViewFinancials: () => void;
  onOpenDashboard: () => void;
}

export function FarmOwner3DCard({
  owner,
  onEdit,
  onDelete,
  onViewFinancials,
  onOpenDashboard
}: FarmOwner3DCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getStatusColor = () => {
    switch (owner.approval_status) {
      case 'approved':
        return 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30';
      case 'pending':
        return 'from-amber-500/20 to-orange-500/20 border-amber-500/30';
      case 'rejected':
        return 'from-red-500/20 to-rose-500/20 border-red-500/30';
      default:
        return 'from-gray-500/20 to-slate-500/20 border-gray-500/30';
    }
  };

  const getStatusIcon = () => {
    switch (owner.approval_status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-emerald-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-amber-600" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusText = () => {
    switch (owner.approval_status) {
      case 'approved':
        return 'معتمد';
      case 'pending':
        return 'قيد المراجعة';
      case 'rejected':
        return 'مرفوض';
      default:
        return 'غير محدد';
    }
  };

  const getFarmTypeIcon = () => {
    switch (owner.farm_type) {
      case 'نخيل':
        return '🟤';
      case 'زيتون':
        return '🟢';
      default:
        return '⚪️';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div
      className={`relative group rounded-3xl border-2 backdrop-blur-xl transition-all duration-500 overflow-hidden ${
        isHovered ? 'scale-105 shadow-2xl' : 'shadow-lg'
      }`}
      style={{
        background: `linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.15) 100%)`,
        borderColor: 'rgba(16, 185, 129, 0.3)',
        transform: isHovered ? 'translateY(-8px) rotateX(5deg)' : 'none',
        transformStyle: 'preserve-3d',
        perspective: '1000px'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      dir="rtl"
    >
      {/* Glass Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/20 to-transparent pointer-events-none" />

      {/* Status Badge */}
      <div className="absolute top-4 left-4 z-10">
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-xl border-2 font-bold text-sm ${
            owner.approval_status === 'approved'
              ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-700'
              : owner.approval_status === 'pending'
              ? 'bg-amber-500/20 border-amber-500/30 text-amber-700'
              : 'bg-red-500/20 border-red-500/30 text-red-700'
          }`}
        >
          {getStatusIcon()}
          {getStatusText()}
        </div>
      </div>

      {/* Manual Entry Badge */}
      {owner.manual_entry && (
        <div className="absolute top-4 right-4 z-10">
          <div className="px-3 py-1 rounded-full bg-blue-500/20 border-2 border-blue-500/30 text-blue-700 text-xs font-bold backdrop-blur-xl">
            تسجيل يدوي
          </div>
        </div>
      )}

      <div className="relative p-6 space-y-4">
        {/* Image */}
        {owner.farm_image_url && (
          <div className="relative rounded-2xl overflow-hidden h-48 mb-4">
            <img
              src={owner.farm_image_url}
              alt={owner.owner_full_name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <div className="absolute bottom-3 right-3 flex items-center gap-2 text-white font-bold bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full">
              <span className="text-2xl">{getFarmTypeIcon()}</span>
              <span>{owner.farm_type === 'أخرى' ? owner.farm_type_other : owner.farm_type}</span>
            </div>
          </div>
        )}

        {/* Owner Name */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg">
            {owner.owner_full_name.charAt(0)}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-black text-gray-900">{owner.owner_full_name}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="h-3 w-3" />
              <span dir="ltr">{owner.owner_phone}</span>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Location */}
          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3 border border-emerald-200/30">
            <div className="flex items-center gap-2 text-emerald-600 mb-1">
              <MapPin className="h-4 w-4" />
              <span className="text-xs font-bold">الموقع</span>
            </div>
            <p className="text-sm font-bold text-gray-900 truncate">{owner.farm_location}</p>
          </div>

          {/* Area */}
          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3 border border-emerald-200/30">
            <div className="flex items-center gap-2 text-emerald-600 mb-1">
              <Ruler className="h-4 w-4" />
              <span className="text-xs font-bold">المساحة</span>
            </div>
            <p className="text-sm font-bold text-gray-900">
              {owner.farm_area} {owner.farm_area_unit}
            </p>
          </div>

          {/* Price */}
          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3 border border-emerald-200/30">
            <div className="flex items-center gap-2 text-emerald-600 mb-1">
              <DollarSign className="h-4 w-4" />
              <span className="text-xs font-bold">السعر</span>
            </div>
            <p className="text-sm font-bold text-gray-900">{formatPrice(owner.farm_price)}</p>
          </div>

          {/* Duration */}
          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3 border border-emerald-200/30">
            <div className="flex items-center gap-2 text-emerald-600 mb-1">
              <Calendar className="h-4 w-4" />
              <span className="text-xs font-bold">مدة السداد</span>
            </div>
            <p className="text-sm font-bold text-gray-900">{owner.payment_duration_days} يوم</p>
          </div>
        </div>

        {/* IBAN */}
        <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3 border border-emerald-200/30">
          <div className="flex items-center gap-2 text-emerald-600 mb-1">
            <CreditCard className="h-4 w-4" />
            <span className="text-xs font-bold">رقم الآيبان</span>
          </div>
          <p className="text-sm font-mono font-bold text-gray-900" dir="ltr">
            {owner.bank_iban}
          </p>
        </div>

        {/* Actions - Show on Hover */}
        <div
          className={`transition-all duration-300 ${
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onEdit}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-500/90 hover:bg-blue-600 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl"
            >
              <Edit className="h-4 w-4" />
              تعديل
            </button>
            <button
              onClick={onDelete}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-red-500/90 hover:bg-red-600 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl"
            >
              <Trash2 className="h-4 w-4" />
              حذف
            </button>
            <button
              onClick={onViewFinancials}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500/90 hover:bg-emerald-600 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl"
            >
              <Wallet className="h-4 w-4" />
              المالية
            </button>
            <button
              onClick={onOpenDashboard}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-500/90 hover:bg-purple-600 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl"
            >
              <ExternalLink className="h-4 w-4" />
              فتح اللوحة
            </button>
          </div>
        </div>

        {/* Created At */}
        <div className="text-xs text-gray-500 text-center pt-2 border-t border-emerald-200/30">
          تاريخ الإضافة: {new Date(owner.created_at).toLocaleDateString('ar-SA')}
        </div>
      </div>

      {/* 3D Effect Border */}
      <div className="absolute inset-0 rounded-3xl pointer-events-none">
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-500/20 via-transparent to-teal-500/20" />
      </div>
    </div>
  );
}
