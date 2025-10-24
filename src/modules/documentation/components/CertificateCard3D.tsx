import React from 'react';
import {
  Award,
  MapPin,
  User,
  Trees,
  DollarSign,
  Calendar,
  Eye,
  Printer,
  Trash2,
  RefreshCw,
  Mail,
  QrCode,
  CheckCircle,
  Clock,
  Archive
} from 'lucide-react';
import { Card3D } from '../../../components/ui/Card3D';
import { Documentation } from '../documentationService';

interface CertificateCard3DProps {
  certificate: Documentation;
  onView: (certificate: Documentation) => void;
  onPrint: (certificate: Documentation) => void;
  onReissue: (certificate: Documentation) => void;
  onEmail: (certificate: Documentation) => void;
  onDelete: (certificate: Documentation) => void;
  onArchive: (certificate: Documentation) => void;
}

export function CertificateCard3D({
  certificate,
  onView,
  onPrint,
  onReissue,
  onEmail,
  onDelete,
  onArchive
}: CertificateCard3DProps) {
  const getStatusConfig = (status: string) => {
    const configs: any = {
      documented: {
        label: 'موثّق ✅',
        color: 'bg-gradient-to-r from-blue-50 to-blue-100',
        textColor: 'text-blue-700',
        borderColor: 'border-blue-300',
        icon: CheckCircle
      },
      verified: {
        label: 'مُتحقق منه ✅',
        color: 'bg-gradient-to-r from-green-50 to-green-100',
        textColor: 'text-green-700',
        borderColor: 'border-green-300',
        icon: CheckCircle
      },
      archived: {
        label: 'مؤرشف 📦',
        color: 'bg-gradient-to-r from-gray-50 to-gray-100',
        textColor: 'text-gray-700',
        borderColor: 'border-gray-300',
        icon: Archive
      },
      pending: {
        label: 'قيد المراجعة 🟨',
        color: 'bg-gradient-to-r from-yellow-50 to-yellow-100',
        textColor: 'text-yellow-700',
        borderColor: 'border-yellow-300',
        icon: Clock
      }
    };
    return configs[status] || configs.documented;
  };

  const statusConfig = getStatusConfig(certificate.status);
  const StatusIcon = statusConfig.icon;

  return (
    <Card3D interactive={false}>
      <div className="group relative">
        <div className={`p-6 ${statusConfig.color} border-2 ${statusConfig.borderColor} rounded-xl transition-all duration-300 hover:shadow-2xl`}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Award className="h-6 w-6 text-[#C89B3C]" />
                <span className="font-mono text-lg font-black text-[#C89B3C] tracking-wider">
                  {certificate.certificate_code}
                </span>
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#2C2C2C]/60" />
                  <span className="text-sm font-bold text-[#2C2C2C]">
                    {certificate.farm?.name_ar || 'مزرعة غير معروفة'}
                  </span>
                </div>
                <p className="text-xs text-[#2C2C2C]/60 font-mono mr-6">
                  {certificate.farm_code || 'لا يوجد كود'}
                </p>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <User className="h-4 w-4 text-[#2C2C2C]/60" />
                <span className="text-sm font-bold text-[#2C2C2C]">
                  {certificate.investor_name}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <StatusIcon className={`h-8 w-8 ${statusConfig.textColor}`} />
              <span className={`px-3 py-1 rounded-lg text-xs font-bold border-2 ${statusConfig.borderColor} ${statusConfig.textColor} bg-white/80`}>
                {statusConfig.label}
              </span>
            </div>
          </div>

          <div className="space-y-2 pb-4 border-b-2 border-white/50">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#2C2C2C]/70 flex items-center gap-1">
                <Trees className="h-3 w-3" />
                الأشجار:
              </span>
              <span className="font-black text-amber-600">{certificate.reserved_trees} شجرة</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-[#2C2C2C]/70 flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                القيمة:
              </span>
              <span className="font-black text-green-600">
                {certificate.total_price.toLocaleString('ar-SA')} ريال
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-[#2C2C2C]/70 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                تاريخ الإصدار:
              </span>
              <span className="font-mono text-[#2C2C2C] text-xs">
                {new Date(certificate.certificate_generated_at).toLocaleDateString('ar-SA')}
              </span>
            </div>

            {certificate.qr_code_url && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#2C2C2C]/70 flex items-center gap-1">
                  <QrCode className="h-3 w-3" />
                  رمز التحقق:
                </span>
                <span className="text-green-600 font-bold text-xs">متوفر ✓</span>
              </div>
            )}
          </div>

          <div className="mt-4 opacity-0 group-hover:opacity-100 transition-all duration-300 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onView(certificate)}
                className="flex items-center justify-center gap-1 px-3 py-2 bg-white/90 hover:bg-white text-[#2C2C2C] border-2 border-[#2C2C2C]/20 rounded-lg font-bold text-xs transition-all"
              >
                <Eye className="h-3 w-3" />
                عرض
              </button>

              <button
                onClick={() => onPrint(certificate)}
                className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold text-xs transition-all"
              >
                <Printer className="h-3 w-3" />
                طباعة
              </button>

              <button
                onClick={() => onReissue(certificate)}
                className="flex items-center justify-center gap-1 px-3 py-2 bg-[#C89B3C] hover:bg-[#B8894E] text-white rounded-lg font-bold text-xs transition-all"
              >
                <RefreshCw className="h-3 w-3" />
                إعادة إصدار
              </button>

              <button
                onClick={() => onEmail(certificate)}
                className="flex items-center justify-center gap-1 px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-bold text-xs transition-all"
              >
                <Mail className="h-3 w-3" />
                إرسال
              </button>

              {certificate.status !== 'archived' && (
                <button
                  onClick={() => onArchive(certificate)}
                  className="flex items-center justify-center gap-1 px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-bold text-xs transition-all"
                >
                  <Archive className="h-3 w-3" />
                  أرشفة
                </button>
              )}

              <button
                onClick={() => onDelete(certificate)}
                className="flex items-center justify-center gap-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold text-xs transition-all"
              >
                <Trash2 className="h-3 w-3" />
                حذف
              </button>
            </div>
          </div>

          {certificate.certificate_pdf_url && (
            <div className="mt-4 p-3 bg-white/80 border-2 border-[#C89B3C]/30 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#2C2C2C]">ملف PDF:</span>
                <a
                  href={certificate.certificate_pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-700 font-bold underline"
                >
                  تحميل الشهادة
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card3D>
  );
}
