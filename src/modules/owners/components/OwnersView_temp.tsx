import React, { useEffect, useState } from 'react';
import {
  Users,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Snowflake,
  UserCheck,
  Home,
  Phone,
  MapPin,
  FileText,
  DollarSign,
  Calendar,
  Search,
  Filter,
  Eye,
  Clock,
  CreditCard,
  X,
  XCircle,
  Building,
  TreePine
} from 'lucide-react';
import { Card3D } from '../../../components/ui/Card3D';
import { BackButton } from '../../../components/common/BackButton';
import { OwnersService, FarmOwner } from '../ownersService';
import { FarmsService } from '../../farms/farmsService';
import { OwnerFormModal } from './OwnerFormModal';

interface OwnersViewProps {
  onBack?: () => void;
}

export function OwnersView({ onBack }: OwnersViewProps) {
  const [activeTab, setActiveTab] = useState<'approved' | 'pending'>('pending');
  const [owners, setOwners] = useState<FarmOwner[]>([]);
  const [pendingSubmissions, setPendingSubmissions] = useState<any[]>([]);
  const [filteredOwners, setFilteredOwners] = useState<FarmOwner[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState<FarmOwner | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterRegion, setFilterRegion] = useState<string>('all');
  const [showDetailsPanel, setShowDetailsPanel] = useState(false);
  const [selectedOwnerDetails, setSelectedOwnerDetails] = useState<any>(null);
  const [ownerFarms, setOwnerFarms] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [owners, searchTerm, filterStatus, filterRegion]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ownersData, statsData, pendingData] = await Promise.all([
        OwnersService.getOwnersList().catch(err => {
          console.error('Error loading owners:', err);
          return [];
        }),
        OwnersService.getStatistics().catch(err => {
          console.error('Error loading stats:', err);
          return { total: 0, active: 0, frozen: 0 };
        }),
        OwnersService.getPendingSubmissions().catch(err => {
          console.error('Error loading pending submissions:', err);
          return [];
        })
      ]);
      setOwners(ownersData);
      setStats(statsData);
      setPendingSubmissions(pendingData);
      console.log('✅ Loaded data:', {
        owners: ownersData.length,
        pending: pendingData.length,
        stats: statsData
      });
    } catch (err) {
      console.error('❌ Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...owners];

    if (searchTerm) {
      filtered = filtered.filter(owner =>
        owner.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        owner.mobile_number.includes(searchTerm) ||
        owner.city?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(owner => owner.status === filterStatus);
    }

    if (filterRegion !== 'all') {
      filtered = filtered.filter(owner => owner.region === filterRegion);
    }

    setFilteredOwners(filtered);
  };

  const getUniqueRegions = () => {
    const regions = owners.map(o => o.region).filter(Boolean);
    return [...new Set(regions)];
  };

  const handleCreateOwner = () => {
    setSelectedOwner(null);
    setModalMode('create');
    setShowModal(true);
  };

  const handleEditOwner = (owner: FarmOwner, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedOwner(owner);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleViewDetails = async (owner: FarmOwner, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedOwnerDetails(owner);
    setShowDetailsPanel(true);

    try {
      const farms = await FarmsService.getAll();
      const ownerFarmsData = farms.filter(f => f.owner_id === owner.id);
      setOwnerFarms(ownerFarmsData);
    } catch (error) {
      console.error('Error loading farms:', error);
      setOwnerFarms([]);
    }
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

  const handleToggleStatus = async (owner: FarmOwner, e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = owner.status === 'active' ? 'frozen' : 'active';

    try {
      await OwnersService.toggleStatus(owner.id, newStatus, 'تغيير الحالة من لوحة التحكم');
      await loadData();
    } catch (err: any) {
      alert('حدث خطأ: ' + err.message);
    }
  };

  const handleDeleteOwner = async (owner: FarmOwner, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`هل أنت متأكد من حذف المالك "${owner.full_name}" نهائياً؟\n\nسيتم حفظ نسخة احتياطية JSON تلقائياً.`)) {
      return;
    }

    try {
      await OwnersService.deleteOwnerPermanently(owner.id, 'حذف نهائي من لوحة التحكم');
      alert('تم حذف المالك نهائياً مع حفظ نسخة احتياطية');
      await loadData();
    } catch (err: any) {
      alert('حدث خطأ: ' + err.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'border-green-400 bg-green-50';
      case 'frozen':
        return 'border-blue-400 bg-blue-50';
      case 'under_review':
        return 'border-yellow-400 bg-yellow-50';
      default:
        return 'border-gray-400 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'frozen':
        return <Snowflake className="h-4 w-4 text-blue-600" />;
      case 'under_review':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'نشط';
      case 'frozen':
        return 'مجمد';
      case 'under_review':
        return 'تحت المراجعة';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F1E8] to-[#E8DCC4] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#C9A962] mx-auto mb-4"></div>
          <p className="text-[#2C2C2C] font-medium">جارٍ تحميل أصحاب المزارع...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F1E8] to-[#E8DCC4] p-8" dir="rtl">
      <div className="max-w-[1400px] mx-auto">
        {onBack && <BackButton onClick={onBack} />}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-[#2C2C2C] mb-2 flex items-center gap-3">
            <Users className="h-10 w-10 text-[#C9A962]" />
            إدارة أصحاب المزارع
          </h1>
          <p className="text-[#2C2C2C]/70">إدارة متكاملة لأصحاب المزارع ومتابعة مزارعهم المرتبطة</p>
        </div>

        {/* Statistics Bar */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card3D>
            <div className="p-6 bg-gradient-to-br from-[#C9A962]/10 to-[#D4B574]/10">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#C9A962] to-[#D4B574] rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="text-3xl font-black text-[#C9A962] mb-1">{stats?.total || 0}</p>
              <p className="text-sm text-[#2C2C2C]/70">إجمالي الملاك</p>
            </div>
          </Card3D>

          <Card3D>
            <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <UserCheck className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="text-3xl font-black text-green-600 mb-1">{stats?.active || 0}</p>
              <p className="text-sm text-[#2C2C2C]/70">النشطون</p>
            </div>
          </Card3D>

          <Card3D>
            <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Snowflake className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="text-3xl font-black text-blue-600 mb-1">{stats?.frozen || 0}</p>
              <p className="text-sm text-[#2C2C2C]/70">المجمدون</p>
            </div>
          </Card3D>

          <Card3D>
            <div className="p-6 bg-gradient-to-br from-yellow-50 to-amber-50">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="text-3xl font-black text-yellow-600 mb-1">{pendingSubmissions.length}</p>
              <p className="text-sm text-[#2C2C2C]/70">تحت المراجعة</p>
            </div>
          </Card3D>

          <Card3D>
            <div className="p-6 bg-gradient-to-br from-[#3D5B4B]/10 to-[#4A6F5C]/10">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#3D5B4B] to-[#4A6F5C] rounded-xl flex items-center justify-center shadow-lg">
                  <Home className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="text-3xl font-black text-[#3D5B4B] mb-1">{stats?.total_farms || 0}</p>
              <p className="text-sm text-[#2C2C2C]/70">إجمالي المزارع</p>
            </div>
          </Card3D>
                )}
              </div>
            </div>
          </div>
        </div>
          </>
        )}

      {/* Owner Form Modal */}
      <OwnerFormModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmitOwner}
        initialData={selectedOwner}
        mode={modalMode}
      />
    </div>
  );
}
