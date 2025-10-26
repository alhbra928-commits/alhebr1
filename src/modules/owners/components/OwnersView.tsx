import React, { useEffect, useState } from 'react';
import { Users, Plus, Search } from 'lucide-react';
import { BackButton } from '../../../components/common/BackButton';
import { OwnersService, FarmOwner } from '../ownersService';
import { AdvancedOwnerCard3D } from './AdvancedOwnerCard3D';
import { OwnerFormModal } from './OwnerFormModal';
import { SubmittedDataModal } from './SubmittedDataModal';
import { usePermissions } from '../../../contexts/PermissionsContext';

interface OwnersViewProps {
  onBack?: () => void;
}

export function OwnersView({ onBack }: OwnersViewProps) {
  const [owners, setOwners] = useState<FarmOwner[]>([]);
  const [filteredOwners, setFilteredOwners] = useState<FarmOwner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState<FarmOwner | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSubmittedDataModal, setShowSubmittedDataModal] = useState(false);
  const [selectedOwnerForData, setSelectedOwnerForData] = useState<FarmOwner | null>(null);

  const { isAdmin, canCreate, canEdit, canDelete } = usePermissions();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [owners, searchTerm]);

  const loadData = async () => {
    try {
      setLoading(true);
      const ownersData = await OwnersService.getOwnersList(undefined, true);
      setOwners(ownersData);
    } catch (err) {
      console.error('Error loading owners:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...owners];

    if (searchTerm) {
      filtered = filtered.filter(owner =>
        owner.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        owner.mobile_number.includes(searchTerm)
      );
    }

    setFilteredOwners(filtered);
  };

  const handleCreateOwner = () => {
    setSelectedOwner(null);
    setModalMode('create');
    setShowModal(true);
  };

  const handleEditOwner = (owner: FarmOwner) => {
    setSelectedOwner(owner);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleViewDetails = (owner: FarmOwner) => {
    setSelectedOwnerForData(owner);
    setShowSubmittedDataModal(true);
  };

  const handleSubmitOwner = async (data: any) => {
    try {
      if (modalMode === 'create') {
        await OwnersService.createOwner(data);
        alert('تم إضافة المالك بنجاح!');
      } else if (selectedOwner) {
        await OwnersService.updateOwner(selectedOwner.id, data);
        alert('تم تحديث بيانات المالك بنجاح!');
      }
      await loadData();
      setShowModal(false);
    } catch (err: any) {
      throw new Error(err.message || 'حدث خطأ');
    }
  };

  const handleToggleStatus = async (owner: FarmOwner) => {
    const newStatus = owner.status === 'active' ? 'frozen' : 'active';
    try {
      await OwnersService.toggleStatus(owner.id, newStatus);
      await loadData();
    } catch (err: any) {
      alert('حدث خطأ: ' + err.message);
    }
  };

  const handleDeleteOwner = async (owner: FarmOwner) => {
    if (!confirm(`هل أنت متأكد من حذف المالك "${owner.full_name}"؟`)) return;

    try {
      await OwnersService.deleteOwnerPermanently(owner.id);
      alert('تم حذف المالك بنجاح');
      await loadData();
    } catch (err: any) {
      alert('حدث خطأ: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <BackButton onClick={onBack} />
            <Users className="w-8 h-8 text-emerald-600" />
            <h1 className="text-3xl font-bold text-slate-900">إدارة أصحاب المزارع</h1>
          </div>
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
            <p className="mt-4 text-slate-600">جاري التحميل...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <BackButton onClick={onBack} />
          <Users className="w-8 h-8 text-emerald-600" />
          <h1 className="text-3xl font-bold text-slate-900">إدارة أصحاب المزارع</h1>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4 border border-slate-200">
            <div className="text-sm text-slate-600 mb-1">إجمالي الملاك</div>
            <div className="text-2xl font-bold text-slate-900">{owners.length}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border border-slate-200">
            <div className="text-sm text-slate-600 mb-1">النشطون</div>
            <div className="text-2xl font-bold text-emerald-600">
              {owners.filter(o => o.status === 'active').length}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border border-slate-200">
            <div className="text-sm text-slate-600 mb-1">المجمدون</div>
            <div className="text-2xl font-bold text-orange-600">
              {owners.filter(o => o.status === 'frozen').length}
            </div>
          </div>
        </div>

        {/* Search & Actions */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="ابحث بالاسم أو رقم الجوال..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          {(isAdmin || canCreate('farm_owners')) && (
            <button
              onClick={handleCreateOwner}
              className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              <span>إضافة مالك</span>
            </button>
          )}
        </div>

        {/* Owners Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOwners.map(owner => (
            <AdvancedOwnerCard3D
              key={owner.id}
              owner={owner}
              onEdit={handleEditOwner}
              onDelete={handleDeleteOwner}
              onToggleStatus={handleToggleStatus}
              onViewDetails={handleViewDetails}
              canEdit={isAdmin || canEdit('farm_owners')}
              canDelete={isAdmin || canDelete('farm_owners')}
            />
          ))}
        </div>

        {filteredOwners.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">لا يوجد ملاك مطابقين للبحث</p>
          </div>
        )}
      </div>

      {/* Modals */}
      {showModal && (
        <OwnerFormModal
          owner={selectedOwner}
          mode={modalMode}
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmitOwner}
        />
      )}

      {showSubmittedDataModal && selectedOwnerForData && (
        <SubmittedDataModal
          owner={selectedOwnerForData}
          onClose={() => {
            setShowSubmittedDataModal(false);
            setSelectedOwnerForData(null);
          }}
        />
      )}
    </div>
  );
}
