import React, { useState } from 'react';
import {
  X,
  Award,
  MapPin,
  User,
  Phone,
  Mail,
  Trees,
  DollarSign,
  Calendar,
  QrCode,
  FileText,
  CheckCircle,
  Download,
  Printer,
  RefreshCw,
  Archive,
  Trash2
} from 'lucide-react';
import { Documentation } from '../documentationService';
import { CertificateModal } from '../../investor/components/CertificateModal';
import { usePermissions } from '../../../contexts/PermissionsContext';

interface CertificateDetailsPanelProps {
  certificate: Documentation | null;
  isOpen: boolean;
  onClose: () => void;
  onPrint: (certificate: Documentation) => void;
  onReissue: (certificate: Documentation) => void;
  onEmail: (certificate: Documentation) => void;
  onArchive: (certificate: Documentation) => void;
  onDelete: (certificate: Documentation) => void;
}

export function CertificateDetailsPanel({
  certificate,
  isOpen,
  onClose,
  onPrint,
  onReissue,
  onEmail,
  onArchive,
  onDelete
}: CertificateDetailsPanelProps) {
  const [showCertificate, setShowCertificate] = useState(false);
  const { canEdit, canDelete } = usePermissions();

  if (!isOpen || !certificate) return null;

  const getStatusConfig = (status: string) => {
    const configs: any = {
      documented: { label: 'موثّق', color: 'bg-blue-100 text-blue-700 border-blue-400' },
      verified: { label: 'مُتحقق منه', color: 'bg-green-100 text-green-700 border-green-400' },
      archived: { label: 'مؤرشف', color: 'bg-gray-100 text-gray-700 border-gray-400' }
    };
    return configs[status] || configs.documented;
  };

  const statusConfig = getStatusConfig(certificate.status);

  const timelineSteps = [
    {
      label: 'إنشاء الحجز',
      date: certificate.created_at,
      completed: true,
      icon: Calendar
    },
    {
      label: 'توليد الشهادة',
      date: certificate.certificate_generated_at,
      completed: true,
      icon: Award
    },
    {
      label: 'التحقق والتوثيق',
      date: certificate.status === 'verified' ? certificate.updated_at : null,
      completed: certificate.status === 'verified',
      icon: CheckCircle
    }
  ];

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      <div className="fixed top-0 left-0 h-full w-full md:w-[650px] bg-white shadow-2xl z-50 overflow-y-auto" dir="rtl">
        <div className="sticky top-0 bg-gradient-to-r from-[#C89B3C] to-[#D4B574] p-6 shadow-lg z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-white mb-1 flex items-center gap-2">
                <Award className="h-7 w-7" />
                تفاصيل الشهادة
              </h2>
              <p className="text-white/90 font-mono text-sm">{certificate.certificate_code}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className={`p-4 rounded-xl border-2 ${statusConfig.color}`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold">الحالة الحالية:</span>
              <span className="text-lg font-black">{statusConfig.label}</span>
            </div>
          </div>

          <section className="bg-gradient-to-br from-amber-50 to-orange-50 p-5 rounded-xl border-2 border-amber-200">
            <h3 className="text-lg font-black text-[#2C2C2C] mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-[#C89B3C]" />
              بيانات المزرعة
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-[#2C2C2C]/70">اسم المزرعة:</span>
                <span className="font-bold">{certificate.farm?.name_ar || 'غير محدد'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#2C2C2C]/70">كود المزرعة:</span>
                <span className="font-mono font-bold text-[#C89B3C]">{certificate.farm_code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#2C2C2C]/70">نوع المحصول:</span>
                <span className="font-bold">{certificate.farm?.farm_type || 'غير محدد'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#2C2C2C]/70">المنطقة:</span>
                <span className="font-bold">{certificate.farm?.region || 'غير محدد'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#2C2C2C]/70">المدينة:</span>
                <span className="font-bold">{certificate.farm?.city || 'غير محدد'}</span>
              </div>
            </div>
          </section>

          <section className="bg-gradient-to-br from-blue-50 to-cyan-50 p-5 rounded-xl border-2 border-blue-200">
            <h3 className="text-lg font-black text-[#2C2C2C] mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              بيانات المستثمر
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-[#2C2C2C]/70">الاسم الكامل:</span>
                <span className="font-bold">{certificate.investor_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#2C2C2C]/70 flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  الجوال:
                </span>
                <span className="font-mono font-bold">
                  {certificate.investor?.mobile_number || 'غير متوفر'}
                </span>
              </div>
              {certificate.investor?.email && (
                <div className="flex justify-between">
                  <span className="text-[#2C2C2C]/70 flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    البريد:
                  </span>
                  <span className="font-mono text-sm">{certificate.investor.email}</span>
                </div>
              )}
            </div>
          </section>

          <section className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-xl border-2 border-green-200">
            <h3 className="text-lg font-black text-[#2C2C2C] mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-600" />
              تفاصيل الشهادة
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-[#2C2C2C]/70">رقم الحجز:</span>
                <span className="font-mono font-bold text-blue-600">{certificate.booking_code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#2C2C2C]/70">رقم الشهادة:</span>
                <span className="font-mono font-bold text-[#C89B3C]">{certificate.certificate_code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#2C2C2C]/70 flex items-center gap-1">
                  <Trees className="h-3 w-3" />
                  عدد الأشجار:
                </span>
                <span className="font-black text-amber-600 text-lg">{certificate.reserved_trees} شجرة</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#2C2C2C]/70 flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  القيمة الإجمالية:
                </span>
                <span className="font-black text-green-600 text-lg">
                  {certificate.total_price.toLocaleString('ar-SA')} ريال
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#2C2C2C]/70 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  تاريخ الإصدار:
                </span>
                <span className="font-mono font-bold">
                  {new Date(certificate.certificate_generated_at).toLocaleDateString('ar-SA')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#2C2C2C]/70">رمز التحقق:</span>
                <span className="font-mono text-xs text-gray-600 break-all">
                  {certificate.verification_token.substring(0, 32)}...
                </span>
              </div>
            </div>
          </section>

          {certificate.qr_code_url && (
            <section className="bg-gradient-to-br from-purple-50 to-pink-50 p-5 rounded-xl border-2 border-purple-200">
              <h3 className="text-lg font-black text-[#2C2C2C] mb-4 flex items-center gap-2">
                <QrCode className="h-5 w-5 text-purple-600" />
                رمز QR للتحقق
              </h3>
              <div className="flex flex-col items-center">
                <img
                  src={certificate.qr_code_url}
                  alt="QR Code"
                  className="w-48 h-48 border-4 border-white shadow-lg rounded-xl"
                />
                <p className="text-xs text-center text-[#2C2C2C]/60 mt-3">
                  امسح الرمز للتحقق من صحة الشهادة
                </p>
              </div>
            </section>
          )}

          <section className="bg-gradient-to-br from-indigo-50 to-blue-50 p-5 rounded-xl border-2 border-indigo-200">
            <h3 className="text-lg font-black text-[#2C2C2C] mb-4">المسار الزمني (Timeline)</h3>
            <div className="space-y-4">
              {timelineSteps.map((step, index) => {
                const StepIcon = step.icon;
                return (
                  <div key={index} className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      step.completed ? 'bg-green-500' : 'bg-gray-300'
                    }`}>
                      <StepIcon className={`h-5 w-5 ${step.completed ? 'text-white' : 'text-gray-600'}`} />
                    </div>
                    <div className="flex-1">
                      <p className={`font-bold ${step.completed ? 'text-green-700' : 'text-gray-500'}`}>
                        {step.label}
                      </p>
                      {step.date && (
                        <p className="text-xs text-gray-500 font-mono">
                          {new Date(step.date).toLocaleDateString('ar-SA')} • {new Date(step.date).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {certificate.certificate_pdf_url && (
            <section className="bg-white p-5 rounded-xl border-2 border-[#C89B3C]">
              <h3 className="text-sm font-bold text-[#2C2C2C] mb-3">ملف الشهادة:</h3>
              <a
                href={certificate.certificate_pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-bold transition-all"
              >
                <Download className="h-5 w-5" />
                تحميل الشهادة PDF
              </a>
            </section>
          )}

          <div className="space-y-3 pt-4 border-t-2 border-gray-200">
            <button
              onClick={() => setShowCertificate(true)}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-[#C89B3C] to-[#D4B574] hover:from-[#B8894E] hover:to-[#C89B3C] text-white rounded-xl font-black text-lg transition-all shadow-lg"
            >
              <Award className="h-6 w-6" />
              عرض الشهادة الفاخرة
            </button>

            {(canEdit || canDelete) && (
              <div className="grid grid-cols-2 gap-3">
                {canEdit && (
                  <>
                    <button
                      onClick={() => onReissue(certificate)}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-[#C89B3C] hover:bg-[#B8894E] text-white rounded-xl font-bold transition-all"
                    >
                      <RefreshCw className="h-5 w-5" />
                      إعادة إصدار
                    </button>

                    <button
                      onClick={() => onEmail(certificate)}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-bold transition-all"
                    >
                      <Mail className="h-5 w-5" />
                      إرسال بالبريد
                    </button>

                    {certificate.status !== 'archived' && (
                      <button
                        onClick={() => onArchive(certificate)}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl font-bold transition-all"
                      >
                        <Archive className="h-5 w-5" />
                        أرشفة
                      </button>
                    )}
                  </>
                )}

                {canDelete && (
                  <button
                    onClick={() => onDelete(certificate)}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-all"
                  >
                    <Trash2 className="h-5 w-5" />
                    حذف نهائي
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showCertificate && (
        <CertificateModal
          certificate={{
            id: certificate.id,
            certificate_code: certificate.certificate_code,
            farm_name: certificate.farm?.name_ar || 'مزرعة',
            farm_type: certificate.farm?.farm_type || 'نخيل',
            farm_location: `${certificate.farm?.city || ''}, ${certificate.farm?.region || 'المملكة العربية السعودية'}`,
            investor_name: certificate.investor_name,
            reserved_trees: certificate.reserved_trees,
            total_price: certificate.total_price,
            created_at: certificate.certificate_generated_at
          }}
          isOpen={showCertificate}
          onClose={() => setShowCertificate(false)}
        />
      )}
    </>
  );
}
