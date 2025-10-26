import React, { useEffect, useState } from 'react';
import {
  Users,
  CheckCircle,
  Snowflake,
  Clock,
  DollarSign,
  Trees,
  Search,
  Filter,
  RefreshCw,
  UserPlus
} from 'lucide-react';
import { Card3D } from '../../../components/ui/Card3D';
import { BackButton } from '../../../components/common/BackButton';
import { InvestorsService, Investor, InvestorFormData } from '../investorsService';
import { InvestorCard3D } from './InvestorCard3D';
import { InvestorDetailsPanel } from './InvestorDetailsPanel';
import { InvestorFormModal } from './InvestorFormModal';
import { usePermissions } from '../../../contexts/PermissionsContext';

interface AdvancedInvestorsViewProps {
  onBack?: () => void;
}

export function AdvancedInvestorsView({ onBack }: AdvancedInvestorsViewProps) {
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [filteredInvestors, setFilteredInvestors] = useState<Investor[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedInvestor, setSelectedInvestor] = useState<Investor | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingInvestor, setEditingInvestor] = useState<Investor | null>(null);

  // استخدام النظام المركزي الجديد للصلاحيات
  const { isAdmin, canCreate, canEdit, canDelete } = usePermissions();

  const hasCreatePermission = isAdmin || canCreate('investors');
  const hasEditPermission = isAdmin || canEdit('investors');
  const hasDeletePermission = isAdmin || canDelete('investors');


  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [investors, searchTerm, statusFilter]);

  const loadData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const [investorsResult, statsData] = await Promise.all([
        InvestorsService.getAll(100, 0),
        InvestorsService.getStatistics()
      ]);
      setInvestors(investorsResult?.data || []);
      setStats(statsData);
    } catch (err) {
      console.error('Error loading investors:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadData(true);
  };

  const applyFilters = () => {
    let filtered = [...investors];

    if (searchTerm) {
      filtered = filtered.filter(inv =>
        inv.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.phone.includes(searchTerm) ||
        inv.mobile_number?.includes(searchTerm) ||
        inv.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.national_id.includes(searchTerm)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(inv => inv.status === statusFilter);
    }

    setFilteredInvestors(filtered);
  };

  const handleViewInvestor = (investor: Investor) => {
    setSelectedInvestor(investor);
    setIsPanelOpen(true);
  };

  const handleEditInvestor = (investor: Investor) => {
    setEditingInvestor(investor);
    setIsFormOpen(true);
  };

  const handleAddInvestor = () => {
    setEditingInvestor(null);
    setIsFormOpen(true);
  };

  const handleToggleStatus = async (investor: Investor) => {
    const newStatus = investor.status === 'active' ? 'suspended' : 'active';
    const action = newStatus === 'active' ? 'تفعيل' : 'تجميد';

    if (!confirm(`هل تريد ${action} المستثمر "${investor.full_name}"؟`)) return;

    try {
      setActionLoading(true);
      await InvestorsService.updateStatus(investor.id, newStatus);
      await loadData();
      alert(`✅ تم ${action} المستثمر بنجاح`);
    } catch (error) {
      console.error('Error toggling status:', error);
      alert(`حدث خطأ في ${action} المستثمر`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteInvestor = async (investor: Investor) => {
    if (investor.certificates_count && investor.certificates_count > 0) {
      if (!confirm(
        `⚠️ تحذير!\n\n` +
        `المستثمر "${investor.full_name}" لديه ${investor.certificates_count} شهادة مملوكة.\n\n` +
        `يجب أرشفة الشهادات أولاً قبل الحذف.\n\n` +
        `هل تريد المتابعة؟`
      )) return;
    }

    if (!confirm(
      `⚠️ حذف نهائي!\n\n` +
      `هل أنت متأكد من حذف المستثمر "${investor.full_name}"؟\n\n` +
      `سيتم:\n` +
      `• حفظ نسخة احتياطية JSON\n` +
      `• حذف جميع بياناته\n` +
      `• تسجيل العملية في Audit Log\n\n` +
      `هذا الإجراء لا يمكن التراجع عنه!`
    )) return;

    try {
      setActionLoading(true);
      await InvestorsService.delete(investor.id);
      await loadData();
      alert('✅ تم حذف المستثمر بنجاح مع حفظ نسخة احتياطية');
    } catch (error: any) {
      console.error('Error deleting investor:', error);
      alert(`حدث خطأ: ${error.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleFormSubmit = async (data: InvestorFormData) => {
    try {
      if (editingInvestor) {
        await InvestorsService.update(editingInvestor.id, data);
        alert('✅ تم تحديث بيانات المستثمر بنجاح');
      } else {
        await InvestorsService.create(data);
        alert('✅ تم إضافة المستثمر بنجاح');
      }
      await loadData();
      setIsFormOpen(false);
    } catch (error: any) {
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F9F8F6]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-[#C89B3C] mx-auto mb-4"></div>
          <p className="text-[#2C2C2C]/70 font-bold">جاري تحميل المستثمرين...</p>
        </div>
      </div>
    );
  }

  const activeInvestors = filteredInvestors.filter(inv => inv.status === 'active');
  const suspendedInvestors = filteredInvestors.filter(inv => inv.status === 'suspended');
  const pendingInvestors = filteredInvestors.filter(inv => inv.status === 'pending');

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
              <Users className="h-12 w-12" />
              إدارة المستثمرين المتقدمة
            </h1>
            <p className="text-[#2C2C2C]/70 text-lg">
              مراقبة شاملة • تتبع النشاط • تعديل • تجميد • حذف بدون قيود
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
                  <Users className="h-7 w-7 text-white" />
                </div>
                <span className="text-4xl font-black text-blue-600">{stats?.total || 0}</span>
              </div>
              <h3 className="text-sm font-black text-blue-900">إجمالي المستثمرين</h3>
            </div>
          </Card3D>

          <Card3D interactive={false}>
            <div className="p-5 bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-lg">
                  <CheckCircle className="h-7 w-7 text-white" />
                </div>
                <span className="text-4xl font-black text-green-600">{stats?.active || 0}</span>
              </div>
              <h3 className="text-sm font-black text-green-900">نشط</h3>
            </div>
          </Card3D>

          <Card3D interactive={false}>
            <div className="p-5 bg-gradient-to-br from-blue-50 to-cyan-100 border-2 border-cyan-200 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Snowflake className="h-7 w-7 text-white" />
                </div>
                <span className="text-4xl font-black text-cyan-600">{stats?.suspended || 0}</span>
              </div>
              <h3 className="text-sm font-black text-cyan-900">مجمد</h3>
            </div>
          </Card3D>

          <Card3D interactive={false}>
            <div className="p-5 bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Clock className="h-7 w-7 text-white" />
                </div>
                <span className="text-4xl font-black text-yellow-600">{stats?.pending || 0}</span>
              </div>
              <h3 className="text-sm font-black text-yellow-900">قيد المراجعة</h3>
            </div>
          </Card3D>

          <Card3D interactive={false}>
            <div className="p-5 bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                  <DollarSign className="h-7 w-7 text-white" />
                </div>
                <span className="text-2xl font-black text-emerald-600">
                  {((stats?.totalInvestment || 0) / 1000000).toFixed(1)}M
                </span>
              </div>
              <h3 className="text-sm font-black text-emerald-900">إجمالي الاستثمار</h3>
            </div>
          </Card3D>
        </div>

        <div className="mb-6 bg-white p-4 rounded-xl shadow-md border-2 border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="🔍 بحث بالاسم، الجوال، البريد، أو رقم الهوية..."
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
                <option value="active">نشط</option>
                <option value="suspended">مجمد</option>
                <option value="pending">قيد المراجعة</option>
              </select>

              {hasCreatePermission && (
                <button
                  onClick={handleAddInvestor}
                  className="p-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                  title="إضافة مستثمر"
                >
                  <UserPlus className="h-5 w-5" />
                </button>
              )}

              <button
                onClick={loadData}
                className="p-3 bg-[#C89B3C] hover:bg-[#B8894E] text-white rounded-lg transition-colors"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {filteredInvestors.length === 0 ? (
          <div className="text-center py-20">
            <Users className="h-24 w-24 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-black text-gray-400 mb-2">لا يوجد مستثمرون</h3>
            <p className="text-gray-400 mb-4">ابدأ بإضافة مستثمرين جدد</p>
            {hasCreatePermission && (
              <button
                onClick={handleAddInvestor}
                className="px-6 py-3 bg-[#C89B3C] hover:bg-[#B8894E] text-white rounded-xl font-bold transition-all"
              >
                إضافة مستثمر أول
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {activeInvestors.length > 0 && (
              <section>
                <h2 className="text-2xl font-black text-green-600 mb-4 flex items-center gap-2">
                  <CheckCircle className="h-7 w-7" />
                  نشط ({activeInvestors.length})
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {activeInvestors.map(investor => (
                    <InvestorCard3D
                      key={investor.id}
                      investor={investor}
                      onView={handleViewInvestor}
                      onEdit={hasEditPermission ? handleEditInvestor : undefined}
                      onToggleStatus={hasEditPermission ? handleToggleStatus : undefined}
                      onDelete={hasDeletePermission ? handleDeleteInvestor : undefined}
                    />
                  ))}
                </div>
              </section>
            )}

            {suspendedInvestors.length > 0 && (
              <section>
                <h2 className="text-2xl font-black text-cyan-600 mb-4 flex items-center gap-2">
                  <Snowflake className="h-7 w-7" />
                  مجمد ({suspendedInvestors.length})
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {suspendedInvestors.map(investor => (
                    <InvestorCard3D
                      key={investor.id}
                      investor={investor}
                      onView={handleViewInvestor}
                      onEdit={hasEditPermission ? handleEditInvestor : undefined}
                      onToggleStatus={hasEditPermission ? handleToggleStatus : undefined}
                      onDelete={hasDeletePermission ? handleDeleteInvestor : undefined}
                    />
                  ))}
                </div>
              </section>
            )}

            {pendingInvestors.length > 0 && (
              <section>
                <h2 className="text-2xl font-black text-yellow-600 mb-4 flex items-center gap-2">
                  <Clock className="h-7 w-7" />
                  قيد المراجعة ({pendingInvestors.length})
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {pendingInvestors.map(investor => (
                    <InvestorCard3D
                      key={investor.id}
                      investor={investor}
                      onView={handleViewInvestor}
                      onEdit={hasEditPermission ? handleEditInvestor : undefined}
                      onToggleStatus={hasEditPermission ? handleToggleStatus : undefined}
                      onDelete={hasDeletePermission ? handleDeleteInvestor : undefined}
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
              <p className="text-xs text-[#2C2C2C]/70 font-bold">إجمالي المستثمرين</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black text-green-600 mb-1">
                {((stats?.totalInvestment || 0) / 1000000).toFixed(2)}M
              </p>
              <p className="text-xs text-[#2C2C2C]/70 font-bold">الاستثمار (ريال)</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black text-amber-600 mb-1">{stats?.totalTrees || 0}</p>
              <p className="text-xs text-[#2C2C2C]/70 font-bold">أشجار مملوكة</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black text-blue-600 mb-1">{stats?.active || 0}</p>
              <p className="text-xs text-[#2C2C2C]/70 font-bold">نشط</p>
            </div>
          </div>
        </div>
      </div>

      <InvestorDetailsPanel
        investor={selectedInvestor}
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
      />

      <InvestorFormModal
        isOpen={isFormOpen}
        investor={editingInvestor}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
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
