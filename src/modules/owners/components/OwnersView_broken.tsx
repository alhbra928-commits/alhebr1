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
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-xl p-2 mb-8">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex-1 px-6 py-4 rounded-xl font-bold transition-all ${
                activeTab === 'pending'
                  ? 'bg-gradient-to-br from-yellow-500 to-amber-600 text-white shadow-lg'
                  : 'text-[#2C2C2C]/60 hover:bg-[#F5F1E8]'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Clock className="h-5 w-5" />
                <span>طلبات المراجعة</span>
                {pendingSubmissions.length > 0 && (
                  <span className="px-2 py-1 bg-white text-yellow-600 rounded-full text-xs font-black">
                    {pendingSubmissions.length}
                  </span>
                )}
              </div>
            </button>
            <button
              onClick={() => setActiveTab('approved')}
              className={`flex-1 px-6 py-4 rounded-xl font-bold transition-all ${
                activeTab === 'approved'
                  ? 'bg-gradient-to-br from-[#C9A962] to-[#D4B574] text-white shadow-lg'
                  : 'text-[#2C2C2C]/60 hover:bg-[#F5F1E8]'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Users className="h-5 w-5" />
                <span>الملاك المعتمدون</span>
                <span className="px-2 py-1 bg-white text-[#C9A962] rounded-full text-xs font-black">
                  {owners.length}
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Pending Submissions Tab */}
        {activeTab === 'pending' && (
          <div className="space-y-6">
            {pendingSubmissions.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-2xl font-black text-[#2C2C2C] mb-2">لا توجد طلبات معلقة</h3>
                <p className="text-[#2C2C2C]/60">جميع الطلبات تمت مراجعتها</p>
              </div>
            ) : (
              pendingSubmissions.map((submission) => (
                <Card3D key={submission.id}>
                  <div className="bg-white rounded-2xl p-6 border-4 border-yellow-500/20">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-1">
                        <h3 className="text-2xl font-black text-[#2C2C2C] mb-2">
                          {submission.submitted_data?.full_name || submission.farm_owner_profiles?.full_name}
                        </h3>
                        <div className="flex items-center gap-3">
                          <span className="px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-bold">
                            🕐 قيد المراجعة
                          </span>
                          <span className="text-[#2C2C2C]/60">
                            {submission.submitted_data?.farm_type}
                          </span>
                        </div>
                      </div>
                      <div className="text-left text-sm text-[#2C2C2C]/60">
                        {new Date(submission.submitted_at).toLocaleString('ar-SA')}
                      </div>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-[#F5F1E8] rounded-xl p-4">
                        <div className="flex items-center gap-2 text-[#C9A962] mb-1">
                          <Phone className="h-4 w-4" />
                          <span className="text-xs font-medium">الجوال</span>
                        </div>
                        <p className="font-mono font-bold text-[#2C2C2C]" dir="ltr">
                          {submission.farm_owner_profiles?.mobile_number}
                        </p>
                      </div>

                      <div className="bg-[#F5F1E8] rounded-xl p-4">
                        <div className="flex items-center gap-2 text-[#C9A962] mb-1">
                          <MapPin className="h-4 w-4" />
                          <span className="text-xs font-medium">المنطقة</span>
                        </div>
                        <p className="font-bold text-[#2C2C2C]">
                          {submission.submitted_data?.region}
                        </p>
                      </div>

                      <div className="bg-[#F5F1E8] rounded-xl p-4">
                        <div className="flex items-center gap-2 text-[#C9A962] mb-1">
                          <Building className="h-4 w-4" />
                          <span className="text-xs font-medium">المدينة</span>
                        </div>
                        <p className="font-bold text-[#2C2C2C]">
                          {submission.submitted_data?.city}
                        </p>
                      </div>

                      <div className="bg-[#F5F1E8] rounded-xl p-4">
                        <div className="flex items-center gap-2 text-[#C9A962] mb-1">
                          <DollarSign className="h-4 w-4" />
                          <span className="text-xs font-medium">السعر الإجمالي</span>
                        </div>
                        <p className="font-bold text-green-600">
                          {submission.submitted_data?.actual_total_price?.toLocaleString('ar-SA')} ريال
                        </p>
                      </div>

                      <div className="bg-[#F5F1E8] rounded-xl p-4">
                        <div className="flex items-center gap-2 text-[#C9A962] mb-1">
                          <TreePine className="h-4 w-4" />
                          <span className="text-xs font-medium">عدد الأشجار</span>
                        </div>
                        <p className="font-bold text-[#2C2C2C]">
                          {submission.submitted_data?.total_trees?.toLocaleString('ar-SA')}
                        </p>
                      </div>

                      <div className="bg-[#F5F1E8] rounded-xl p-4">
                        <div className="flex items-center gap-2 text-[#C9A962] mb-1">
                          <MapPin className="h-4 w-4" />
                          <span className="text-xs font-medium">المساحة</span>
                        </div>
                        <p className="font-bold text-[#2C2C2C]">
                          {submission.submitted_data?.total_farm_area?.toLocaleString('ar-SA')} {submission.submitted_data?.farm_area_unit}
                        </p>
                      </div>
                    </div>

                    {/* Varieties */}
                    {submission.varieties_data && submission.varieties_data.length > 0 && (
                      <div className="bg-green-50 rounded-xl p-4 mb-6">
                        <h4 className="font-bold text-[#2C2C2C] mb-3 flex items-center gap-2">
                          <TreePine className="h-4 w-4 text-green-600" />
                          الأصناف المتوفرة:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {submission.varieties_data.map((variety: any, idx: number) => (
                            <span
                              key={idx}
                              className="px-4 py-2 bg-white rounded-lg border-2 border-green-200 text-sm"
                            >
                              <span className="font-bold text-[#2C2C2C]">{variety.name}</span>
                              <span className="text-green-600 mx-2">•</span>
                              <span className="text-[#2C2C2C]/70">{variety.count} شجرة</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t-2 border-[#F5F1E8]">
                      <button
                        onClick={async () => {
                          if (confirm('هل أنت متأكد من الموافقة على هذا الطلب؟')) {
                            try {
                              await OwnersService.approveSubmission(submission.id);
                              alert('✅ تمت الموافقة على الطلب بنجاح!');
                              loadData();
                            } catch (err) {
                              console.error(err);
                              alert('❌ حدث خطأ أثناء الموافقة');
                            }
                          }
                        }}
                        className="flex-1 px-6 py-3 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl font-bold hover:shadow-xl transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="h-5 w-5" />
                        الموافقة على الطلب
                      </button>
                      <button
                        onClick={async () => {
                          const reason = prompt('أدخل سبب الرفض:');
                          if (reason) {
                            try {
                              await OwnersService.rejectSubmission(submission.id, reason);
                              alert('✅ تم رفض الطلب');
                              loadData();
                            } catch (err) {
                              console.error(err);
                              alert('❌ حدث خطأ أثناء الرفض');
                            }
                          }
                        }}
                        className="flex-1 px-6 py-3 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl font-bold hover:shadow-xl transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                      >
                        <XCircle className="h-5 w-5" />
                        رفض الطلب
                      </button>
                    </div>
                  </div>
                </Card3D>
              ))
            )}
          </div>
        )}

        {/* Approved Owners Tab */}
        {activeTab === 'approved' && (
          <>
            {/* Toolbar */}
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[250px]">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#2C2C2C]/40" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="البحث بالاسم أو رقم الجوال أو المدينة..."
                  className="w-full pr-10 pl-4 py-3 bg-[#F5F1E8] border-2 border-transparent rounded-xl focus:outline-none focus:border-[#C9A962] transition-colors"
                />
              </div>
            </div>

            {/* Filter by Status */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 bg-[#F5F1E8] border-2 border-transparent rounded-xl focus:outline-none focus:border-[#C9A962] transition-colors font-medium"
            >
              <option value="all">كل الحالات</option>
              <option value="active">نشط ✅</option>
              <option value="frozen">مجمد 🧊</option>
              <option value="under_review">تحت المراجعة 🕐</option>
            </select>

            {/* Filter by Region */}
            <select
              value={filterRegion}
              onChange={(e) => setFilterRegion(e.target.value)}
              className="px-4 py-3 bg-[#F5F1E8] border-2 border-transparent rounded-xl focus:outline-none focus:border-[#C9A962] transition-colors font-medium"
            >
              <option value="all">كل المناطق</option>
              {getUniqueRegions().map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>

            {/* Add Button */}
            <button
              onClick={handleCreateOwner}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-[#C9A962] to-[#D4B574] text-white rounded-xl hover:shadow-xl transform hover:-translate-y-0.5 transition-all font-bold"
            >
              <Plus className="h-5 w-5" />
              إضافة مالك جديد
            </button>
          </div>
        </div>

            {/* Owners Grid */}
        {filteredOwners.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">👤</div>
            <p className="text-xl text-[#2C2C2C]/70 font-medium">
              {searchTerm || filterStatus !== 'all' || filterRegion !== 'all'
                ? 'لا يوجد ملاك تطابق معايير البحث'
                : 'لا يوجد ملاك مسجلين بعد'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOwners.map((owner) => (
              <Card3D key={owner.id}>
                <div
                  className={`relative bg-white rounded-2xl overflow-hidden border-4 ${getStatusColor(
                    owner.status
                  )} group cursor-pointer transition-all duration-300`}
                  onClick={(e) => handleViewDetails(owner, e)}
                >
                  {/* Header Section */}
                  <div className="p-6 bg-gradient-to-br from-[#F5F1E8] to-white">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#C9A962] to-[#D4B574] rounded-full flex items-center justify-center shadow-lg">
                            <Users className="h-5 w-5 text-white" />
                          </div>
                          <h3 className="text-xl font-black text-[#2C2C2C]">
                            {owner.full_name}
                          </h3>
                        </div>
                        <div
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border-2`}
                        >
                          {getStatusIcon(owner.status)}
                          {getStatusLabel(owner.status)}
                        </div>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-[#2C2C2C]/80">
                        <Phone className="h-4 w-4 text-[#C9A962]" />
                        <a
                          href={`tel:${owner.mobile_number}`}
                          className="font-mono hover:text-[#C9A962] transition-colors"
                          dir="ltr"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {owner.mobile_number}
                        </a>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-[#2C2C2C]/80">
                        <MapPin className="h-4 w-4 text-[#C9A962]" />
                        <span>{owner.region} - {owner.city}</span>
                      </div>

                      {owner.national_id && (
                        <div className="flex items-center gap-2 text-sm text-[#2C2C2C]/80">
                          <CreditCard className="h-4 w-4 text-[#C9A962]" />
                          <span className="font-mono">{owner.national_id}</span>
                        </div>
                      )}
                    </div>

                    {/* Stats Badge */}
                    <div className="bg-gradient-to-br from-[#3D5B4B]/10 to-[#4A6F5C]/10 rounded-xl p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Home className="h-4 w-4 text-[#3D5B4B]" />
                          <span className="text-sm font-semibold text-[#2C2C2C]">المزارع المسجلة</span>
                        </div>
                        <span className="text-2xl font-black text-[#3D5B4B]">
                          {owner.farms_count || 0}
                        </span>
                      </div>
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-2 mt-3 text-xs text-[#2C2C2C]/50">
                      <Calendar className="h-3 w-3" />
                      <span>تاريخ الإضافة: {new Date(owner.created_at).toLocaleDateString('ar-SA')}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 p-4 bg-[#F5F1E8] border-t-2 border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={(e) => handleViewDetails(owner, e)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#C9A962] text-white rounded-lg hover:bg-[#B8894E] transition-colors text-sm font-bold"
                    >
                      <Eye className="h-4 w-4" />
                      عرض
                    </button>

                    <button
                      onClick={(e) => handleEditOwner(owner, e)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-bold"
                    >
                      <Edit className="h-4 w-4" />
                      تعديل
                    </button>

                    <button
                      onClick={(e) => handleToggleStatus(owner, e)}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-colors text-sm font-bold ${
                        owner.status === 'active'
                          ? 'bg-blue-500 text-white hover:bg-blue-600'
                          : 'bg-green-500 text-white hover:bg-green-600'
                      }`}
                    >
                      {owner.status === 'active' ? (
                        <>
                          <Snowflake className="h-4 w-4" />
                          تجميد
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          تفعيل
                        </>
                      )}
                    </button>

                    <button
                      onClick={(e) => handleDeleteOwner(owner, e)}
                      className="px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </Card3D>
            ))}
          </div>
        )}

      {/* Owner Details Side Panel */}
      {showDetailsPanel && selectedOwnerDetails && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-end"
          onClick={() => setShowDetailsPanel(false)}
        >
          <div
            className="w-full max-w-2xl bg-white shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Panel Header */}
            <div className="sticky top-0 bg-gradient-to-r from-[#C9A962] to-[#D4B574] p-6 text-white z-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-black flex items-center gap-3">
                  <Users className="h-7 w-7" />
                  تفاصيل المالك
                </h2>
                <button
                  onClick={() => setShowDetailsPanel(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <p className="text-white/90">{selectedOwnerDetails.full_name}</p>
            </div>

            {/* Panel Content */}
            <div className="p-6 space-y-6">
              {/* Owner Info */}
              <div className="bg-gradient-to-br from-[#F5F1E8] to-white rounded-xl p-6 border-2 border-[#C9A962]/20">
                <h3 className="text-lg font-black text-[#2C2C2C] mb-4 flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-[#C9A962]" />
                  البيانات الشخصية
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[#2C2C2C]/70">الاسم الكامل:</span>
                    <span className="font-bold text-[#2C2C2C]">{selectedOwnerDetails.full_name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#2C2C2C]/70">رقم الجوال:</span>
                    <span className="font-mono font-bold text-[#2C2C2C]" dir="ltr">{selectedOwnerDetails.mobile_number}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#2C2C2C]/70">المنطقة / المدينة:</span>
                    <span className="font-bold text-[#2C2C2C]">{selectedOwnerDetails.region} - {selectedOwnerDetails.city}</span>
                  </div>
                  {selectedOwnerDetails.national_id && (
                    <div className="flex items-center justify-between">
                      <span className="text-[#2C2C2C]/70">رقم الهوية:</span>
                      <span className="font-mono font-bold text-[#2C2C2C]">{selectedOwnerDetails.national_id}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-[#2C2C2C]/70">الحالة:</span>
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border-2 ${getStatusColor(selectedOwnerDetails.status)}`}>
                      {getStatusIcon(selectedOwnerDetails.status)}
                      {getStatusLabel(selectedOwnerDetails.status)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#2C2C2C]/70">تاريخ التسجيل:</span>
                    <span className="font-bold text-[#2C2C2C]">{new Date(selectedOwnerDetails.created_at).toLocaleDateString('ar-SA')}</span>
                  </div>
                </div>
              </div>

              {/* Owner's Farms */}
              <div className="bg-gradient-to-br from-[#3D5B4B]/5 to-white rounded-xl p-6 border-2 border-[#3D5B4B]/20">
                <h3 className="text-lg font-black text-[#2C2C2C] mb-4 flex items-center gap-2">
                  <Home className="h-5 w-5 text-[#3D5B4B]" />
                  المزارع المرتبطة ({ownerFarms.length})
                </h3>
                {ownerFarms.length === 0 ? (
                  <p className="text-center text-[#2C2C2C]/60 py-8">لا توجد مزارع مرتبطة بهذا المالك</p>
                ) : (
                  <div className="space-y-3">
                    {ownerFarms.map((farm) => (
                      <div
                        key={farm.id}
                        className="bg-white rounded-lg p-4 border-2 border-gray-100 hover:border-[#3D5B4B]/30 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-bold text-[#2C2C2C]">{farm.name_ar}</h4>
                          <span className={`text-xs px-2 py-1 rounded ${farm.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                            {farm.status === 'active' ? 'نشطة' : 'مجمدة'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm text-[#2C2C2C]/70">
                          <div>النوع: {farm.farm_type}</div>
                          <div>الأشجار: {farm.total_trees}</div>
                          <div>المنطقة: {farm.region}</div>
                          <div>المدينة: {farm.city}</div>
                        </div>
                      </div>
                    ))}
                  </div>
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
