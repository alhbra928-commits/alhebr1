import React from 'react';
import { FileText, Download, QrCode, Award, CheckCircle, Clock } from 'lucide-react';
import { Card3D } from '../../../components/ui/Card3D';
import { BackButton } from '../../../components/common/BackButton';

interface DocumentationViewProps {
  onBack?: () => void;
}

export function DocumentationView({ onBack }: DocumentationViewProps) {
  const certificates = [
    {
      id: '1',
      certificateNumber: 'CERT-2024-001',
      ownerName: 'أحمد محمد السالم',
      farmName: 'مزرعة النخيل الذهبية',
      trees: 50,
      issueDate: '2024-01-15',
      status: 'approved',
    },
    {
      id: '2',
      certificateNumber: 'CERT-2024-002',
      ownerName: 'فاطمة علي الأحمد',
      farmName: 'مزرعة الزيتون المباركة',
      trees: 30,
      issueDate: '2024-02-20',
      status: 'pending',
    },
  ];

  const getStatusInfo = (status: string) => {
    const statusMap: any = {
      approved: { label: 'معتمد', color: 'bg-green-100 text-green-700', icon: CheckCircle },
      pending: { label: 'قيد المراجعة', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    };
    return statusMap[status] || statusMap.pending;
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] p-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {onBack && (
          <div className="mb-6">
            <BackButton onBack={onBack} />
          </div>
        )}

        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black text-[#D4AF37] mb-2">
                إدارة التوثيق
              </h1>
              <p className="text-[#2C2C2C]/70">إصدار ومتابعة شهادات الملكية</p>
            </div>
            <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:shadow-lg transition-all transform hover:scale-105">
              <Award className="h-5 w-5" />
              <span>إصدار شهادة جديدة</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card3D interactive={false}>
            <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <span className="text-3xl font-bold text-gray-900">{certificates.length}</span>
              </div>
              <h3 className="text-sm font-semibold text-gray-700">إجمالي الشهادات</h3>
            </div>
          </Card3D>

          <Card3D interactive={false}>
            <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <span className="text-3xl font-bold text-green-700">
                  {certificates.filter(c => c.status === 'approved').length}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-gray-700">شهادات معتمدة</h3>
            </div>
          </Card3D>

          <Card3D interactive={false}>
            <div className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <span className="text-3xl font-bold text-yellow-700">
                  {certificates.filter(c => c.status === 'pending').length}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-gray-700">قيد المراجعة</h3>
            </div>
          </Card3D>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {certificates.map((cert) => {
            const statusInfo = getStatusInfo(cert.status);
            const StatusIcon = statusInfo.icon;

            return (
              <Card3D key={cert.id} interactive={false}>
                <div className="p-6 bg-white border-2 border-amber-200">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
                        <Award className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{cert.certificateNumber}</h3>
                        <p className="text-sm text-gray-600">شهادة ملكية</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusInfo.color}`}>
                      <StatusIcon className="h-3 w-3" />
                      {statusInfo.label}
                    </span>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">المالك</p>
                      <p className="text-sm font-semibold text-gray-900">{cert.ownerName}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">المزرعة</p>
                      <p className="text-sm font-semibold text-gray-900">{cert.farmName}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600 mb-1">عدد الأشجار</p>
                        <p className="text-sm font-semibold text-gray-900">{cert.trees}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600 mb-1">تاريخ الإصدار</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {new Date(cert.issueDate).toLocaleDateString('ar-SA')}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm font-medium">معاينة</span>
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors">
                      <Download className="h-4 w-4" />
                      <span className="text-sm font-medium">تحميل PDF</span>
                    </button>
                    <button className="p-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors">
                      <QrCode className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </Card3D>
            );
          })}
        </div>
      </div>
    </div>
  );
}
