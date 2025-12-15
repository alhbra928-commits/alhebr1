import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp
} from 'lucide-react';
import { BackButton } from '../../../components/common/BackButton';
import { FarmOwnerFormModal } from './FarmOwnerFormModal';
import { FarmOwner3DCard } from './FarmOwner3DCard';
import { OwnerDashboardModal } from './OwnerDashboardModal';
import { FinancialDetailsModal } from './FinancialDetailsModal';
import { OwnersService, FarmOwnerData } from '../ownersService';
import { usePermissions } from '../../../contexts/PermissionsContext';

interface OwnersViewProps {
  onBack?: () => void;
}

export function OwnersView({ onBack }: OwnersViewProps) {
  const [owners, setOwners] = useState<FarmOwnerData[]>([]);
  const [filteredOwners, setFilteredOwners] = useState<FarmOwnerData[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState<FarmOwnerData | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showDashboard, setShowDashboard] = useState(false);
  const [dashboardOwner, setDashboardOwner] = useState<FarmOwnerData | null>(null);
  const [showFinancials, setShowFinancials] = useState(false);
  const [financialOwner, setFinancialOwner] = useState<FarmOwnerData | null>(null);

  const { isAdmin, canCreate, canEdit, canDelete } = usePermissions();

  const hasCreatePermission = isAdmin || canCreate('farm_owners');
  const hasEditPermission = isAdmin || canEdit('farm_owners');
  const hasDeletePermission = isAdmin || canDelete('farm_owners');

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [ownersData, statsData] = await Promise.all([
        OwnersService.getAllOwners(),
        OwnersService.getStatistics()
      ]);

      setOwners(ownersData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    applyFilters();
  }, [owners, searchTerm, filterStatus]);

  const applyFilters = () => {
    let filtered = [...owners];

    if (searchTerm) {
      filtered = filtered.filter(
        owner =>
          owner.owner_full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          owner.owner_phone.includes(searchTerm) ||
          owner.farm_location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(owner => owner.approval_status === filterStatus);
    }

    setFilteredOwners(filtered);
  };

  const handleCreateOwner = () => {
    setSelectedOwner(null);
    setModalMode('create');
    setShowModal(true);
  };

  const handleEditOwner = (owner: FarmOwnerData) => {
    setSelectedOwner(owner);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleSubmitOwner = async (data: any) => {
    try {
      if (modalMode === 'create') {
        await OwnersService.createOwner(data);
      } else if (selectedOwner) {
        await OwnersService.updateOwner(selectedOwner.id!, data);
      }

      await loadData();
      setShowModal(false);
    } catch (error: any) {
      throw new Error(error.message || 'حدث خطأ');
    }
  };

  const handleDeleteOwner = async (owner: FarmOwnerData) => {
    if (!confirm(`هل أنت متأكد من حذف المالك "${owner.owner_full_name}"؟`)) {
      return;
    }

    try {
      await OwnersService.deleteOwner(owner.id!);
      await loadData();
    } catch (error: any) {
      alert('حدث خطأ أثناء الحذف: ' + error.message);
    }
  };

  const handleApproveOwner = async (owner: FarmOwnerData) => {
    if (!confirm(`هل أنت متأكد من اعتماد المزرعة "${owner.farm_name || owner.owner_full_name}"؟\n\nسيتم:\n- تغيير الحالة إلى "معتمد"\n- إنشاء بطاقة مالية للمزرعة\n- إشعار المالك بالاعتماد`)) {
      return;
    }

    try {
      await OwnersService.approveOwner(owner.id!);
      alert('✅ تم اعتماد المزرعة بنجاح!');
      await loadData();
    } catch (error: any) {
      alert('حدث خطأ أثناء الاعتماد: ' + error.message);
    }
  };

  const handleRejectOwner = async (owner: FarmOwnerData) => {
    const reason = prompt(`يرجى كتابة سبب رفض المزرعة "${owner.farm_name || owner.owner_full_name}":\n\n(سيتم إرسال السبب للمالك)`);

    if (!reason || reason.trim() === '') {
      alert('يجب كتابة سبب الرفض!');
      return;
    }

    try {
      await OwnersService.rejectOwner(owner.id!, reason.trim());
      alert('✅ تم رفض المزرعة وإرسال الإشعار للمالك!');
      await loadData();
    } catch (error: any) {
      alert('حدث خطأ أثناء الرفض: ' + error.message);
    }
  };

  const handleViewFinancials = (owner: FarmOwnerData) => {
    setFinancialOwner(owner);
    setShowFinancials(true);
  };

  const handleOpenDashboard = (owner: FarmOwnerData) => {
    setDashboardOwner(owner);
    setShowDashboard(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xl font-bold text-gray-700">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 p-6" dir="rtl">
      {/* Back Button */}
      {onBack && <BackButton onClick={onBack} />}

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-8 border-2 border-emerald-200/50">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Users className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-black text-gray-900">إدارة أصحاب المزارع</h1>
                <p className="text-gray-600">إدارة شاملة لجميع أصحاب المزارع والبيانات المالية</p>
              </div>
            </div>
            {hasCreatePermission && (
              <button
                onClick={handleCreateOwner}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
              >
                <Plus className="h-5 w-5" />
                إضافة مالك جديد
              </button>
            )}
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
                <div className="flex items-center justify-between mb-2">
                  <Users className="h-6 w-6 opacity-80" />
                  <span className="text-3xl font-black">{stats.total}</span>
                </div>
                <p className="text-sm opacity-90">إجمالي الملاك</p>
              </div>

              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-4 text-white">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle className="h-6 w-6 opacity-80" />
                  <span className="text-3xl font-black">{stats.approved}</span>
                </div>
                <p className="text-sm opacity-90">معتمد</p>
              </div>

              <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-4 text-white">
                <div className="flex items-center justify-between mb-2">
                  <Clock className="h-6 w-6 opacity-80" />
                  <span className="text-3xl font-black">{stats.pending}</span>
                </div>
                <p className="text-sm opacity-90">قيد المراجعة</p>
              </div>

              <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 text-white">
                <div className="flex items-center justify-between mb-2">
                  <XCircle className="h-6 w-6 opacity-80" />
                  <span className="text-3xl font-black">{stats.rejected}</span>
                </div>
                <p className="text-sm opacity-90">مرفوض</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg p-4 border border-emerald-200/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="البحث بالاسم، الجوال، أو الموقع..."
                className="w-full pr-10 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
              />
            </div>

            {/* Filter by Status */}
            <div className="relative">
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full pr-10 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
              >
                <option value="all">جميع الحالات</option>
                <option value="approved">معتمد</option>
                <option value="pending">قيد المراجعة</option>
                <option value="rejected">مرفوض</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Owners Grid */}
      <div className="max-w-7xl mx-auto">
        {filteredOwners.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-12 text-center border-2 border-emerald-200/50">
            <Users className="h-24 w-24 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-black text-gray-900 mb-2">لا توجد بيانات</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterStatus !== 'all'
                ? 'لم يتم العثور على نتائج مطابقة للبحث'
                : 'لم يتم إضافة أي مالك حتى الآن'}
            </p>
            {hasCreatePermission && (
              <button
                onClick={handleCreateOwner}
                className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
              >
                إضافة أول مالك
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOwners.map((owner) => (
              <FarmOwner3DCard
                key={owner.id}
                owner={owner}
                onEdit={() => hasEditPermission && handleEditOwner(owner)}
                onDelete={() => hasDeletePermission && handleDeleteOwner(owner)}
                onViewFinancials={() => handleViewFinancials(owner)}
                onOpenDashboard={() => handleOpenDashboard(owner)}
                onApprove={owner.approval_status === 'pending' ? () => handleApproveOwner(owner) : undefined}
                onReject={owner.approval_status === 'pending' ? () => handleRejectOwner(owner) : undefined}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <FarmOwnerFormModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmitOwner}
        initialData={selectedOwner || undefined}
        mode={modalMode}
      />

      {/* Owner Dashboard Modal */}
      {showDashboard && dashboardOwner && (
        <OwnerDashboardModal
          owner={dashboardOwner}
          onClose={() => {
            setShowDashboard(false);
            setDashboardOwner(null);
          }}
        />
      )}

      {/* Financial Details Modal */}
      {showFinancials && financialOwner && (
        <FinancialDetailsModal
          owner={financialOwner}
          onClose={() => {
            setShowFinancials(false);
            setFinancialOwner(null);
          }}
        />
      )}
    </div>
  );
}
