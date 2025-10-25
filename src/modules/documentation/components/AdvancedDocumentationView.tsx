import React, { useEffect, useState } from 'react';
import {
  Award,
  CheckCircle,
  Clock,
  Archive,
  DollarSign,
  Trees,
  Search,
  Filter,
  RefreshCw,
  Upload,
  BarChart3
} from 'lucide-react';
import { Card3D } from '../../../components/ui/Card3D';
import { BackButton } from '../../../components/common/BackButton';
import { DocumentationService, Documentation } from '../documentationService';
import { CertificateCard3D } from './CertificateCard3D';
import { CertificateDetailsPanel } from './CertificateDetailsPanel';
import { usePermissions } from '../../../contexts/PermissionsContext';

interface AdvancedDocumentationViewProps {
  onBack?: () => void;
}

export function AdvancedDocumentationView({ onBack }: AdvancedDocumentationViewProps) {
  const [certificates, setCertificates] = useState<Documentation[]>([]);
  const [filteredCertificates, setFilteredCertificates] = useState<Documentation[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedCertificate, setSelectedCertificate] = useState<Documentation | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const { isAdmin, canEdit, canDelete } = usePermissions();

  const hasEditPermission = canEdit('documentation');
  const hasDeletePermission = canDelete('documentation');

  console.log('🔍 [AdvancedDocumentationView] Permissions:', {
    isAdmin,
    canEdit: hasEditPermission,
    canDelete: hasDeletePermission
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [certificates, searchTerm, statusFilter]);

  const loadData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const [certificatesData, statsData] = await Promise.all([
        DocumentationService.getAll(),
        DocumentationService.getStatistics()
      ]);
      setCertificates(certificatesData);
      setStats(statsData);
    } catch (err) {
      console.error('Error loading certificates:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadData(true);
  };

  const applyFilters = () => {
    let filtered = [...certificates];

    if (searchTerm) {
      filtered = filtered.filter(cert =>
        cert.certificate_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.booking_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.investor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.farm_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.farm?.name_ar?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(cert => cert.status === statusFilter);
    }

    setFilteredCertificates(filtered);
  };

  const handleViewCertificate = (certificate: Documentation) => {
    setSelectedCertificate(certificate);
    setIsPanelOpen(true);
  };

  const handlePrint = async (certificate: Documentation) => {
    if (certificate.certificate_pdf_url) {
      window.open(certificate.certificate_pdf_url, '_blank');
    } else {
      alert('⚠️ ملف الشهادة غير متوفر حالياً');
    }
  };

  const handleReissue = async (certificate: Documentation) => {
    if (!confirm(
      `🔄 إعادة إصدار شهادة جديدة؟\n\n` +
      `الشهادة الحالية: ${certificate.certificate_code}\n` +
      `المزرعة: ${certificate.farm?.name_ar}\n` +
      `المستثمر: ${certificate.investor_name}\n\n` +
      `سيتم:\n` +
      `• الاحتفاظ بالنسخة القديمة في الأرشيف\n` +
      `• إصدار شهادة جديدة برقم مختلف\n` +
      `• إرسال إشعار للمستثمر\n\n` +
      `هل تريد المتابعة؟`
    )) return;

    try {
      setActionLoading(true);
      await DocumentationService.updateStatus(certificate.id, 'archived');
      alert(`✅ تم أرشفة الشهادة القديمة\n\nيمكنك الآن إصدار شهادة جديدة من إدارة الحجوزات`);
      await loadData();
      setIsPanelOpen(false);
    } catch (error) {
      console.error('Error reissuing certificate:', error);
      alert('حدث خطأ في إعادة الإصدار');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEmail = async (certificate: Documentation) => {
    alert(
      `📧 إرسال الشهادة بالبريد الإلكتروني\n\n` +
      `إلى: ${certificate.investor?.email || 'غير متوفر'}\n` +
      `الشهادة: ${certificate.certificate_code}\n\n` +
      `هذه الميزة ستكون متاحة قريباً`
    );
  };

  const handleArchive = async (certificate: Documentation) => {
    if (!confirm(`📦 هل تريد أرشفة الشهادة ${certificate.certificate_code}؟`)) return;

    try {
      setActionLoading(true);
      await DocumentationService.updateStatus(certificate.id, 'archived');
      await loadData();
      setIsPanelOpen(false);
      alert('✅ تم أرشفة الشهادة بنجاح');
    } catch (error) {
      console.error('Error archiving certificate:', error);
      alert('حدث خطأ في الأرشفة');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (certificate: Documentation) => {
    if (!confirm(
      `⚠️ تحذير: حذف نهائي!\n\n` +
      `هل أنت متأكد من حذف الشهادة ${certificate.certificate_code}؟\n\n` +
      `المستثمر: ${certificate.investor_name}\n` +
      `المزرعة: ${certificate.farm?.name_ar || certificate.farm_code}\n` +
      `عدد الأشجار: ${certificate.reserved_trees}\n\n` +
      `هذا الإجراء لا يمكن التراجع عنه!`
    )) return;

    try {
      setActionLoading(true);
      setIsPanelOpen(false);

      await DocumentationService.deletePermanently(certificate.id);

      setCertificates(prev => prev.filter(c => c.id !== certificate.id));
      setFilteredCertificates(prev => prev.filter(c => c.id !== certificate.id));

      await loadData();

      alert('✅ تم حذف الشهادة نهائياً بنجاح');
    } catch (error: any) {
      console.error('Error deleting certificate:', error);
      alert(`حدث خطأ في الحذف: ${error.message || 'خطأ غير معروف'}`);
      await loadData();
    } finally {
      setActionLoading(false);
    }
  };

  const handleUploadManual = () => {
    alert('📥 رفع شهادة يدوية\n\nهذه الميزة ستكون متاحة قريباً للتوثيق الخارجي');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F9F8F6]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-[#C89B3C] mx-auto mb-4"></div>
          <p className="text-[#2C2C2C]/70 font-bold">جاري تحميل الشهادات...</p>
        </div>
      </div>
    );
  }

  const documentedCertificates = filteredCertificates.filter(c => c.status === 'documented');
  const verifiedCertificates = filteredCertificates.filter(c => c.status === 'verified');
  const archivedCertificates = filteredCertificates.filter(c => c.status === 'archived');

  return (
    <div className="min-h-screen bg-[#F9F8F6] p-8" dir="rtl">
      <div className="max-w-[1800px] mx-auto">
        {onBack && (
          <div className="mb-6">
            <BackButton onBack={onBack} />
          </div>
        )}

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-black text-[#C89B3C] mb-2 flex items-center gap-3">
              <Award className="h-12 w-12" />
              إدارة التوثيق المتقدمة
            </h1>
            <p className="text-[#2C2C2C]/70 text-lg">
              متابعة الشهادات • إصدار • إلغاء • إعادة طباعة • التحكم الكامل
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-6 py-3 bg-white rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            title="تحديث البيانات"
          >
            <RefreshCw className={`h-5 w-5 text-[#C89B3C] ${refreshing ? 'animate-spin' : ''}`} />
            <span className="font-bold text-[#3D5B4B]">{refreshing ? 'جاري التحديث...' : 'تحديث'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card3D interactive={false}>
            <div className="p-5 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Award className="h-7 w-7 text-white" />
                </div>
                <span className="text-4xl font-black text-blue-600">{stats?.total || 0}</span>
              </div>
              <h3 className="text-sm font-black text-blue-900">إجمالي الشهادات</h3>
            </div>
          </Card3D>

          <Card3D interactive={false}>
            <div className="p-5 bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-lg">
                  <CheckCircle className="h-7 w-7 text-white" />
                </div>
                <span className="text-4xl font-black text-green-600">{stats?.documented || 0}</span>
              </div>
              <h3 className="text-sm font-black text-green-900">موثّقة</h3>
            </div>
          </Card3D>

          <Card3D interactive={false}>
            <div className="p-5 bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                  <CheckCircle className="h-7 w-7 text-white" />
                </div>
                <span className="text-4xl font-black text-emerald-600">{stats?.verified || 0}</span>
              </div>
              <h3 className="text-sm font-black text-emerald-900">مُتحقق منها</h3>
            </div>
          </Card3D>

          <Card3D interactive={false}>
            <div className="p-5 bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gray-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Archive className="h-7 w-7 text-white" />
                </div>
                <span className="text-4xl font-black text-gray-600">{stats?.archived || 0}</span>
              </div>
              <h3 className="text-sm font-black text-gray-900">مؤرشفة</h3>
            </div>
          </Card3D>

          <Card3D interactive={false}>
            <div className="p-5 bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-200 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Trees className="h-7 w-7 text-white" />
                </div>
                <span className="text-4xl font-black text-amber-600">{stats?.totalTrees || 0}</span>
              </div>
              <h3 className="text-sm font-black text-amber-900">أشجار موثقة</h3>
            </div>
          </Card3D>
        </div>

        <div className="mb-6 bg-white p-4 rounded-xl shadow-md border-2 border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="🔍 بحث برقم الشهادة، الحجز، المستثمر، المزرعة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#C89B3C] focus:ring-2 focus:ring-[#C89B3C]/20 outline-none font-bold"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#C89B3C] focus:ring-2 focus:ring-[#C89B3C]/20 outline-none font-bold"
              >
                <option value="all">جميع الحالات</option>
                <option value="documented">موثّقة</option>
                <option value="verified">مُتحقق منها</option>
                <option value="archived">مؤرشفة</option>
              </select>

              <button
                onClick={handleUploadManual}
                className="p-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                title="رفع شهادة يدوية"
              >
                <Upload className="h-5 w-5" />
              </button>

              <button
                onClick={loadData}
                className="p-3 bg-[#C89B3C] hover:bg-[#B8894E] text-white rounded-lg transition-colors"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {filteredCertificates.length === 0 ? (
          <div className="text-center py-20">
            <Award className="h-24 w-24 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-black text-gray-400 mb-2">لا توجد شهادات</h3>
            <p className="text-gray-400">سيتم عرض الشهادات هنا عند إصدارها من إدارة الحجوزات</p>
          </div>
        ) : (
          <div className="space-y-8">
            {documentedCertificates.length > 0 && (
              <section>
                <h2 className="text-2xl font-black text-blue-600 mb-4 flex items-center gap-2">
                  <CheckCircle className="h-7 w-7" />
                  موثّقة ({documentedCertificates.length})
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {documentedCertificates.map(certificate => (
                    <CertificateCard3D
                      key={certificate.id}
                      certificate={certificate}
                      onView={handleViewCertificate}
                      onPrint={handlePrint}
                      onReissue={hasEditPermission ? handleReissue : undefined}
                      onEmail={hasEditPermission ? handleEmail : undefined}
                      onDelete={hasDeletePermission ? handleDelete : undefined}
                      onArchive={hasEditPermission ? handleArchive : undefined}
                    />
                  ))}
                </div>
              </section>
            )}

            {verifiedCertificates.length > 0 && (
              <section>
                <h2 className="text-2xl font-black text-green-600 mb-4 flex items-center gap-2">
                  <CheckCircle className="h-7 w-7" />
                  مُتحقق منها ({verifiedCertificates.length})
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {verifiedCertificates.map(certificate => (
                    <CertificateCard3D
                      key={certificate.id}
                      certificate={certificate}
                      onView={handleViewCertificate}
                      onPrint={handlePrint}
                      onReissue={hasEditPermission ? handleReissue : undefined}
                      onEmail={hasEditPermission ? handleEmail : undefined}
                      onDelete={hasDeletePermission ? handleDelete : undefined}
                      onArchive={hasEditPermission ? handleArchive : undefined}
                    />
                  ))}
                </div>
              </section>
            )}

            {archivedCertificates.length > 0 && (
              <section>
                <h2 className="text-2xl font-black text-gray-600 mb-4 flex items-center gap-2">
                  <Archive className="h-7 w-7" />
                  مؤرشفة ({archivedCertificates.length})
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {archivedCertificates.map(certificate => (
                    <CertificateCard3D
                      key={certificate.id}
                      certificate={certificate}
                      onView={handleViewCertificate}
                      onPrint={handlePrint}
                      onReissue={hasEditPermission ? handleReissue : undefined}
                      onEmail={hasEditPermission ? handleEmail : undefined}
                      onDelete={hasDeletePermission ? handleDelete : undefined}
                      onArchive={hasEditPermission ? handleArchive : undefined}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        <div className="mt-8 bg-gradient-to-r from-[#C89B3C]/10 to-[#D4B574]/10 p-6 rounded-xl border-2 border-[#C89B3C]/30">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-3xl font-black text-[#C89B3C] mb-1">{stats?.total || 0}</p>
              <p className="text-xs text-[#2C2C2C]/70 font-bold">إجمالي الشهادات</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black text-green-600 mb-1">
                {((stats?.totalAmount || 0) / 1000000).toFixed(2)}M
              </p>
              <p className="text-xs text-[#2C2C2C]/70 font-bold">إجمالي القيمة (ريال)</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black text-amber-600 mb-1">{stats?.totalTrees || 0}</p>
              <p className="text-xs text-[#2C2C2C]/70 font-bold">أشجار موثقة</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black text-blue-600 mb-1">{stats?.documented || 0}</p>
              <p className="text-xs text-[#2C2C2C]/70 font-bold">نشطة</p>
            </div>
          </div>
        </div>
      </div>

      <CertificateDetailsPanel
        certificate={selectedCertificate}
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        onPrint={handlePrint}
        onReissue={handleReissue}
        onEmail={handleEmail}
        onArchive={hasEditPermission ? handleArchive : undefined}
        onDelete={hasDeletePermission ? handleDelete : undefined}
      />

      {actionLoading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-2xl shadow-2xl text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#C89B3C] mx-auto mb-4"></div>
            <p className="text-xl font-black text-[#2C2C2C]">جاري المعالجة...</p>
          </div>
        </div>
      )}
    </div>
  );
}
