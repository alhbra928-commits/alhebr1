import React from 'react';
import {
  User,
  Phone,
  Mail,
  Calendar,
  Briefcase,
  Home,
  Award,
  DollarSign,
  Eye,
  Edit,
  Trash2,
  Snowflake,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { Card3D } from '../../../components/ui/Card3D';
import { Investor } from '../investorsService';

interface InvestorCard3DProps {
  investor: Investor;
  onView: (investor: Investor) => void;
  onEdit?: (investor: Investor) => void;
  onToggleStatus?: (investor: Investor) => void;
  onDelete?: (investor: Investor) => void;
}

export function InvestorCard3D({
  investor,
  onView,
  onEdit,
  onToggleStatus,
  onDelete
}: InvestorCard3DProps) {
  const getStatusConfig = (status: string) => {
    const configs: any = {
      active: {
        label: 'نشط ✅',
        color: 'bg-gradient-to-r from-green-50 to-green-100',
        textColor: 'text-green-700',
        borderColor: 'border-green-300',
        icon: CheckCircle
      },
      suspended: {
        label: 'مجمد 🧊',
        color: 'bg-gradient-to-r from-blue-50 to-blue-100',
        textColor: 'text-blue-700',
        borderColor: 'border-blue-300',
        icon: Snowflake
      },
      pending: {
        label: 'قيد المراجعة ⏳',
        color: 'bg-gradient-to-r from-yellow-50 to-yellow-100',
        textColor: 'text-yellow-700',
        borderColor: 'border-yellow-300',
        icon: Clock
      },
      inactive: {
        label: 'موقوف ❌',
        color: 'bg-gradient-to-r from-red-50 to-red-100',
        textColor: 'text-red-700',
        borderColor: 'border-red-300',
        icon: XCircle
      }
    };
    return configs[status] || configs.active;
  };

  const statusConfig = getStatusConfig(investor.status);
  const StatusIcon = statusConfig.icon;

  return (
    <Card3D interactive={false}>
      <div className="group relative">
        <div className={`p-6 ${statusConfig.color} border-2 ${statusConfig.borderColor} rounded-xl transition-all duration-300 hover:shadow-2xl`}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-14 h-14 bg-[#C89B3C] rounded-xl flex items-center justify-center shadow-lg">
                  <User className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-black text-[#2C2C2C] mb-1">
                    {investor.full_name}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-[#2C2C2C]/60">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {new Date(investor.created_at).toLocaleDateString('ar-SA')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <StatusIcon className={`h-7 w-7 ${statusConfig.textColor}`} />
              <span className={`px-3 py-1 rounded-lg text-xs font-bold border-2 ${statusConfig.borderColor} ${statusConfig.textColor} bg-white/80`}>
                {statusConfig.label}
              </span>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-[#2C2C2C]/60" />
              <span className="font-mono font-bold text-[#2C2C2C]">
                {investor.mobile_number || investor.phone}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-[#2C2C2C]/60" />
              <span className="text-[#2C2C2C] truncate">{investor.email}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b-2 border-white/50">
            <div className="bg-white/80 rounded-lg p-3 border border-gray-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-[#2C2C2C]/60 flex items-center gap-1">
                  <Briefcase className="h-3 w-3" />
                  الحجوزات
                </span>
              </div>
              <p className="text-xl font-black text-blue-600">{investor.bookings_count || 0}</p>
            </div>

            <div className="bg-white/80 rounded-lg p-3 border border-gray-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-[#2C2C2C]/60 flex items-center gap-1">
                  <Home className="h-3 w-3" />
                  المزارع
                </span>
              </div>
              <p className="text-xl font-black text-green-600">
                {Math.ceil((investor.certificates_count || 0) / 2)}
              </p>
            </div>

            <div className="bg-white/80 rounded-lg p-3 border border-gray-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-[#2C2C2C]/60 flex items-center gap-1">
                  <Award className="h-3 w-3" />
                  الشهادات
                </span>
              </div>
              <p className="text-xl font-black text-purple-600">{investor.certificates_count || 0}</p>
            </div>

            <div className="bg-white/80 rounded-lg p-3 border border-gray-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-[#2C2C2C]/60 flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  المبلغ
                </span>
              </div>
              <p className="text-sm font-black text-emerald-600">
                {((investor.total_invested || 0) / 1000).toFixed(0)}k
              </p>
            </div>
          </div>

          <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onView(investor)}
                className="flex items-center justify-center gap-1 px-3 py-2 bg-white/90 hover:bg-white text-[#2C2C2C] border-2 border-[#2C2C2C]/20 rounded-lg font-bold text-xs transition-all"
              >
                <Eye className="h-3 w-3" />
                عرض
              </button>

              {onEdit && (
                <button
                  onClick={() => onEdit(investor)}
                  className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold text-xs transition-all"
                >
                  <Edit className="h-3 w-3" />
                  تعديل
                </button>
              )}

              {onToggleStatus && (
                <button
                  onClick={() => onToggleStatus(investor)}
                  className={`flex items-center justify-center gap-1 px-3 py-2 ${
                    investor.status === 'active'
                      ? 'bg-blue-500 hover:bg-blue-600'
                      : 'bg-green-500 hover:bg-green-600'
                  } text-white rounded-lg font-bold text-xs transition-all`}
                >
                  {investor.status === 'active' ? (
                    <>
                      <Snowflake className="h-3 w-3" />
                      تجميد
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-3 w-3" />
                      تفعيل
                    </>
                  )}
                </button>
              )}

              {onDelete && (
                <button
                  onClick={() => onDelete(investor)}
                  className="flex items-center justify-center gap-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold text-xs transition-all"
                >
                  <Trash2 className="h-3 w-3" />
                  حذف
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card3D>
  );
}
