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

  // Rejection modal state
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [submissionToReject, setSubmissionToReject] = useState<any>(null);
  const [selectedRejectionReason, setSelectedRejectionReason] = useState('');
  const [customRejectionReason, setCustomRejectionReason] = useState('');

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
          <Card3D interactive={false}>
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

          <Card3D interactive={false}>
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

          <Card3D interactive={false}>
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

          <Card3D interactive={false}>
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

          <Card3D interactive={false}>
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

        {/* Simple Pending Submissions Display */}
        {pendingSubmissions.length > 0 && (
          <div className="bg-yellow-50 border-4 border-yellow-200 rounded-2xl p-6 mb-8">
            <h2 className="text-2xl font-black text-yellow-800 mb-4 flex items-center gap-2">
              <Clock className="h-6 w-6" />
              طلبات المراجعة المعلقة ({pendingSubmissions.length})
            </h2>
            <div className="space-y-4">
              {pendingSubmissions.map((sub: any) => (
                <div key={sub.id} className="bg-white rounded-xl p-4 border-2 border-yellow-300">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-lg">{sub.submitted_data?.full_name}</h3>
                      <p className="text-sm text-gray-600">{sub.farm_owner_profiles?.mobile_number}</p>
                    </div>
                    <span className="text-xs px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full font-bold">
                      معلق
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        if (confirm('الموافقة على الطلب؟')) {
                          try {
                            await OwnersService.approveSubmission(sub.id);
                            alert('تم بنجاح');
                            loadData();
                          } catch (e) {
                            alert('خطأ');
                          }
                        }
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold"
                    >
                      موافقة
                    </button>
                    <button
                      onClick={() => {
                        setSubmissionToReject(sub);
                        setShowRejectModal(true);
                        setSelectedRejectionReason('');
                        setCustomRejectionReason('');
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold"
                    >
                      رفض
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Toolbar */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex gap-4 items-center">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="البحث..."
              className="flex-1 px-4 py-3 rounded-xl border-2"
            />
            <button
              onClick={handleCreateOwner}
              className="px-6 py-3 bg-gradient-to-br from-[#C9A962] to-[#D4B574] text-white rounded-xl font-bold"
            >
              + إضافة مالك
            </button>
          </div>
        </div>

        {/* Owners Grid */}
        {filteredOwners.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-[#C9A962]/20 to-[#D4B574]/20 mb-6">
              <Users className="h-12 w-12 text-[#C9A962]" />
            </div>
            <h3 className="text-2xl font-black text-[#2C2C2C] mb-2">لا يوجد ملاك</h3>
            <p className="text-[#2C2C2C]/60 mb-6">ابدأ بإضافة أول مالك مزرعة</p>
            <button
              onClick={handleCreateOwner}
              className="px-8 py-3 bg-gradient-to-br from-[#C9A962] to-[#D4B574] text-white rounded-xl font-bold hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
            >
              <Plus className="h-5 w-5 inline-block ml-2" />
              إضافة مالك جديد
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOwners.map((owner) => {
              const statusConfig = {
                active: {
                  bg: 'from-green-500 to-emerald-600',
                  badge: 'bg-green-100 text-green-800 border-green-300',
                  icon: CheckCircle,
                  label: 'نشط',
                  dot: 'bg-green-500'
                },
                frozen: {
                  bg: 'from-blue-400 to-blue-600',
                  badge: 'bg-blue-100 text-blue-800 border-blue-300',
                  icon: Snowflake,
                  label: 'مجمد',
                  dot: 'bg-blue-500'
                },
                under_review: {
                  bg: 'from-yellow-400 to-amber-500',
                  badge: 'bg-yellow-100 text-yellow-800 border-yellow-300',
                  icon: Clock,
                  label: 'تحت المراجعة',
                  dot: 'bg-yellow-500'
                }
              };

              const config = statusConfig[owner.status as keyof typeof statusConfig] || statusConfig.active;
              const StatusIcon = config.icon;

              return (
                <Card3D key={owner.id}>
                  <div className="bg-white rounded-2xl overflow-hidden border-2 border-gray-100 hover:border-[#C9A962] transition-all duration-300 group">
                    {/* Header with Gradient */}
                    <div className={`bg-gradient-to-br ${config.bg} p-6 relative overflow-hidden`}>
                      <div className="absolute top-0 left-0 w-full h-full opacity-10">
                        <div className="absolute top-4 left-4 w-32 h-32 bg-white rounded-full blur-2xl"></div>
                        <div className="absolute bottom-4 right-4 w-24 h-24 bg-white rounded-full blur-2xl"></div>
                      </div>

                      <div className="relative flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border-2 border-white/30">
                            <Users className="h-7 w-7 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-black text-white mb-1 line-clamp-1">
                              {owner.full_name}
                            </h3>
                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border-2 ${config.badge}`}>
                              <div className={`w-2 h-2 rounded-full ${config.dot} animate-pulse`}></div>
                              <span className="text-xs font-bold">{config.label}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-4">
                      {/* Contact Info */}
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-[#F5F1E8] transition-colors">
                          <div className="w-9 h-9 bg-gradient-to-br from-[#C9A962] to-[#D4B574] rounded-lg flex items-center justify-center flex-shrink-0">
                            <Phone className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-[#2C2C2C]/60 mb-0.5">رقم الجوال</p>
                            <a
                              href={`tel:${owner.mobile_number}`}
                              className="font-mono font-bold text-[#2C2C2C] hover:text-[#C9A962] transition-colors"
                              dir="ltr"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {owner.mobile_number}
                            </a>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-[#F5F1E8] transition-colors">
                          <div className="w-9 h-9 bg-gradient-to-br from-[#3D5B4B] to-[#4A6F5C] rounded-lg flex items-center justify-center flex-shrink-0">
                            <MapPin className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-[#2C2C2C]/60 mb-0.5">الموقع</p>
                            <p className="font-bold text-[#2C2C2C] truncate">{owner.region} - {owner.city}</p>
                          </div>
                        </div>

                        {owner.national_id && (
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-[#F5F1E8] transition-colors">
                            <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                              <FileText className="h-4 w-4 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-[#2C2C2C]/60 mb-0.5">الهوية الوطنية</p>
                              <p className="font-mono font-bold text-[#2C2C2C]" dir="ltr">{owner.national_id}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-3 rounded-xl border-2 border-blue-100">
                          <div className="flex items-center gap-2 mb-1">
                            <Home className="h-4 w-4 text-blue-600" />
                            <span className="text-xs text-blue-900/70">المزارع</span>
                          </div>
                          <p className="text-2xl font-black text-blue-600">
                            {owner.farms_count || 0}
                          </p>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 rounded-xl border-2 border-green-100">
                          <div className="flex items-center gap-2 mb-1">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <span className="text-xs text-green-900/70">الإيرادات</span>
                          </div>
                          <p className="text-sm font-black text-green-600">
                            {owner.total_revenue ? `${(owner.total_revenue / 1000).toFixed(0)}k` : '0'}
                          </p>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="pt-3 border-t-2 border-gray-100 space-y-2">
                        {/* Primary Actions */}
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDetails(owner, e);
                            }}
                            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-br from-[#C9A962] to-[#D4B574] text-white rounded-xl font-bold hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
                          >
                            <Eye className="h-4 w-4" />
                            <span>عرض</span>
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditOwner(owner, e);
                            }}
                            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl font-bold hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
                          >
                            <Edit className="h-4 w-4" />
                            <span>تعديل</span>
                          </button>
                        </div>

                        {/* Secondary Actions */}
                        <div className="grid grid-cols-3 gap-2">
                          {owner.status === 'active' ? (
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (confirm(`هل تريد تجميد حساب ${owner.full_name}؟`)) {
                                  try {
                                    await OwnersService.updateOwner(owner.id, { status: 'frozen' });
                                    alert('✅ تم تجميد الحساب');
                                    loadData();
                                  } catch (err) {
                                    alert('❌ حدث خطأ');
                                  }
                                }
                              }}
                              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg font-bold hover:bg-blue-200 transition-all text-sm"
                              title="تجميد الحساب"
                            >
                              <Snowflake className="h-3.5 w-3.5" />
                              <span>تجميد</span>
                            </button>
                          ) : owner.status === 'frozen' ? (
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (confirm(`هل تريد تفعيل حساب ${owner.full_name}؟`)) {
                                  try {
                                    await OwnersService.updateOwner(owner.id, { status: 'active' });
                                    alert('✅ تم تفعيل الحساب');
                                    loadData();
                                  } catch (err) {
                                    alert('❌ حدث خطأ');
                                  }
                                }
                              }}
                              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-green-100 text-green-700 rounded-lg font-bold hover:bg-green-200 transition-all text-sm"
                              title="تفعيل الحساب"
                            >
                              <CheckCircle className="h-3.5 w-3.5" />
                              <span>تفعيل</span>
                            </button>
                          ) : (
                            <div className="flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-400 rounded-lg text-sm">
                              <Clock className="h-3.5 w-3.5" />
                            </div>
                          )}

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(`tel:${owner.mobile_number}`, '_self');
                            }}
                            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-green-100 text-green-700 rounded-lg font-bold hover:bg-green-200 transition-all text-sm"
                            title="اتصال مباشر"
                          >
                            <Phone className="h-3.5 w-3.5" />
                            <span>اتصال</span>
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteOwner(owner, e);
                            }}
                            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-red-100 text-red-700 rounded-lg font-bold hover:bg-red-200 transition-all text-sm"
                            title="حذف المالك"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>حذف</span>
                          </button>
                        </div>
                      </div>

                      {/* Footer Info */}
                      {owner.created_at && (
                        <div className="pt-2 border-t border-gray-100">
                          <div className="flex items-center justify-between text-xs text-[#2C2C2C]/50">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-3 w-3" />
                              <span>مضاف منذ: {new Date(owner.created_at).toLocaleDateString('ar-SA')}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                              <span>متصل</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card3D>
              );
            })}
          </div>
        )}

        {/* Rejection Reason Modal */}
        {showRejectModal && submissionToReject && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-t-3xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur">
                      <XCircle className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-white">رفض الطلب</h2>
                      <p className="text-red-100 text-sm">اختر سبب الرفض من القائمة أو أدخل سبباً مخصصاً</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowRejectModal(false);
                      setSubmissionToReject(null);
                    }}
                    className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  >
                    <X className="h-5 w-5 text-white" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Submission Info */}
                <div className="bg-red-50 rounded-2xl p-4 border-2 border-red-200">
                  <h3 className="font-bold text-lg text-[#2C2C2C] mb-2">
                    {submissionToReject.submitted_data?.full_name}
                  </h3>
                  <p className="text-sm text-[#2C2C2C]/70">
                    {submissionToReject.farm_owner_profiles?.mobile_number}
                  </p>
                </div>

                {/* Predefined Reasons */}
                <div>
                  <label className="block text-sm font-bold text-[#2C2C2C] mb-3">
                    اختر سبب الرفض:
                  </label>
                  <div className="space-y-2">
                    {[
                      'معلومات غير كاملة أو ناقصة',
                      'بيانات غير صحيحة أو مزورة',
                      'عدم توافق المزرعة مع الشروط المطلوبة',
                      'المستندات المرفقة غير واضحة',
                      'تكرار الطلب',
                      'موقع المزرعة غير مناسب',
                      'عدد الأشجار غير مطابق للواقع',
                      'السعر المطلوب غير معقول',
                      'سبب آخر (أدخل تفاصيل أدناه)'
                    ].map((reason, idx) => (
                      <label
                        key={idx}
                        className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          selectedRejectionReason === reason
                            ? 'bg-red-50 border-red-500 shadow-lg'
                            : 'bg-gray-50 border-gray-200 hover:border-red-300 hover:bg-red-50/50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="rejectionReason"
                          value={reason}
                          checked={selectedRejectionReason === reason}
                          onChange={(e) => setSelectedRejectionReason(e.target.value)}
                          className="mt-1 w-5 h-5 text-red-600"
                        />
                        <span className="flex-1 font-medium text-[#2C2C2C]">{reason}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Custom Reason Input */}
                {selectedRejectionReason === 'سبب آخر (أدخل تفاصيل أدناه)' && (
                  <div>
                    <label className="block text-sm font-bold text-[#2C2C2C] mb-2">
                      تفاصيل سبب الرفض:
                    </label>
                    <textarea
                      value={customRejectionReason}
                      onChange={(e) => setCustomRejectionReason(e.target.value)}
                      placeholder="اكتب سبب الرفض بالتفصيل..."
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-red-500 focus:outline-none resize-none"
                    />
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t-2">
                  <button
                    onClick={() => {
                      setShowRejectModal(false);
                      setSubmissionToReject(null);
                    }}
                    className="flex-1 px-6 py-3 bg-gray-200 text-[#2C2C2C] rounded-xl font-bold hover:bg-gray-300 transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={async () => {
                      let finalReason = selectedRejectionReason;

                      if (!finalReason) {
                        alert('⚠️ الرجاء اختيار سبب الرفض');
                        return;
                      }

                      if (finalReason === 'سبب آخر (أدخل تفاصيل أدناه)') {
                        if (!customRejectionReason.trim()) {
                          alert('⚠️ الرجاء إدخال تفاصيل سبب الرفض');
                          return;
                        }
                        finalReason = customRejectionReason.trim();
                      }

                      try {
                        await OwnersService.rejectSubmission(submissionToReject.id, finalReason);
                        alert('✅ تم رفض الطلب بنجاح');
                        setShowRejectModal(false);
                        setSubmissionToReject(null);
                        loadData();
                      } catch (e) {
                        console.error(e);
                        alert('❌ حدث خطأ أثناء رفض الطلب');
                      }
                    }}
                    disabled={!selectedRejectionReason}
                    className={`flex-1 px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                      selectedRejectionReason
                        ? 'bg-gradient-to-br from-red-500 to-red-600 text-white hover:shadow-xl transform hover:-translate-y-0.5'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <XCircle className="h-5 w-5" />
                    تأكيد الرفض
                  </button>
                </div>
              </div>
            </div>
          </div>
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
    </div>
  );
}
