import React, { useEffect, useState } from 'react';
import {
  MapPin,
  Trees,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Home,
  DollarSign,
  Eye,
  Sprout,
  Search,
  Filter,
  Snowflake,
  Clock,
  Map,
  Wifi
} from 'lucide-react';
import { Card3D } from '../../../components/ui/Card3D';
import { BackButton } from '../../../components/common/BackButton';
import { SmartPriceDisplay } from '../../../components/common/SmartPriceDisplay';
import { FarmsService, Farm } from '../farmsService';
import { OwnersService } from '../../owners/ownersService';
import { FarmFormModal } from './FarmFormModal';
import { useRealtimeTables } from '../../../lib/realtimeSync';

interface FarmsViewProps {
  onBack?: () => void;
}

export function FarmsView({ onBack }: FarmsViewProps) {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [filteredFarms, setFilteredFarms] = useState<Farm[]>([]);
  const [owners, setOwners] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadData();

    const unsubscribe = useRealtimeTables([
      {
        name: 'farms',
        callbacks: {
          onInsert: () => {
            console.log('🔄 New farm detected, reloading...');
            loadData();
          },
          onUpdate: () => {
            console.log('🔄 Farm updated, reloading...');
            loadData();
          },
          onDelete: () => {
            console.log('🔄 Farm deleted, reloading...');
            loadData();
          }
        }
      },
      {
        name: 'reservations',
        callbacks: {
          onInsert: () => loadData(),
          onUpdate: () => loadData()
        }
      }
    ]);

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [farms, searchTerm, filterType, filterStatus]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [farmsResult, ownersData, statsData] = await Promise.all([
        FarmsService.getAll(100, 0),
        OwnersService.getOwnersList(),
        FarmsService.getStatistics()
      ]);
      setFarms(farmsResult?.data || []);
      setOwners(ownersData || []);
      setStats(statsData || {
        total: 0,
        active: 0,
        frozen: 0,
        total_trees: 0,
        avg_marketing_price: 0
      });
    } catch (err: any) {
      console.error('Load data error:', err);
      alert('حدث خطأ أثناء تحميل البيانات: ' + (err.message || 'خطأ غير معروف'));
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...farms];

    if (searchTerm) {
      filtered = filtered.filter(farm =>
        farm.name_ar.toLowerCase().includes(searchTerm.toLowerCase()) ||
        farm.crop_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        farm.city?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(farm => farm.farm_type === filterType);
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(farm => farm.status === filterStatus);
    }

    setFilteredFarms(filtered);
  };

  const handleCreateFarm = () => {
    setSelectedFarm(null);
    setModalMode('create');
    setShowModal(true);
  };

  const handleEditFarm = (farm: Farm, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFarm(farm);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleDeleteFarm = async (farm: Farm, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`هل أنت متأكد من حذف المزرعة "${farm.name_ar}"؟`)) return;

    try {
      await FarmsService.deletePermanently(farm.id, 'حذف من لوحة التحكم');
      await loadData();
      alert('تم حذف المزرعة بنجاح');
    } catch (error) {
      console.error('Delete error:', error);
      alert('حدث خطأ أثناء حذف المزرعة');
    }
  };

  const handleToggleStatus = async (farm: Farm, e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = farm.status === 'active' ? 'frozen' : 'active';

    try {
      await FarmsService.update(farm.id, { status: newStatus } as any);
      await loadData();
    } catch (error) {
      console.error('Status update error:', error);
      alert('حدث خطأ أثناء تحديث الحالة');
    }
  };

  const handleToggleSalesStatus = async (farm: Farm, e: React.MouseEvent) => {
    e.stopPropagation();
    const currentStatus = (farm as any).sales_status || 'open';
    const newStatus = currentStatus === 'open' ? 'closed' : 'open';
    const statusText = newStatus === 'closed' ? 'إغلاق المبيعات' : 'فتح المبيعات';

    if (!confirm(`هل أنت متأكد من ${statusText} لمزرعة "${farm.name_ar}"؟`)) return;

    try {
      await FarmsService.updateSalesStatus(farm.id, newStatus, 'admin');
      await loadData();
      alert(`تم ${statusText} بنجاح`);
    } catch (error) {
      console.error('Sales status update error:', error);
      alert('حدث خطأ أثناء تحديث حالة المبيعات');
    }
  };

  const handleSubmit = async (data: any, varieties: any[]) => {
    try {
      if (modalMode === 'create') {
        const newFarm = await FarmsService.create(data);

        if (newFarm && newFarm.id) {
          if (varieties && varieties.length > 0) {
            await FarmsService.saveVarieties(newFarm.id, varieties, data.farm_type);
          }

          await new Promise(resolve => setTimeout(resolve, 1000));

          const farmWithCode = await FarmsService.getById(newFarm.id);

          if (farmWithCode?.farm_code) {
            const barcodeUrl = await FarmsService.generateBarcode(
              farmWithCode.farm_code,
              farmWithCode.name_ar
            );

            await FarmsService.updateBarcodeInfo(newFarm.id, barcodeUrl);

            const treeCodes = await FarmsService.getTreeCodes(newFarm.id);

            alert(
              `✅ تم إنشاء المزرعة بنجاح!\n\n` +
              `🔢 رقم المزرعة: ${farmWithCode.farm_code}\n` +
              `📷 تم توليد الباركود بنجاح\n` +
              `🌳 تم إنشاء ${treeCodes.length} كود للأشجار\n` +
              `🌱 تم حفظ ${varieties.length} صنف`
            );
          }
        }
      } else if (selectedFarm) {
        await FarmsService.update(selectedFarm.id, data);

        if (varieties && varieties.length > 0) {
          await FarmsService.saveVarieties(selectedFarm.id, varieties, data.farm_type);
        }
      }
      await loadData();
      setShowModal(false);
      setSelectedFarm(null);
    } catch (error) {
      console.error('Submit error:', error);
      throw error;
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
        return 'نشطة';
      case 'frozen':
        return 'مجمدة';
      case 'under_review':
        return 'تحت المراجعة';
      default:
        return status;
    }
  };

  const getFarmIcon = (type: string) => {
    switch (type) {
      case 'نخيل':
        return '🌴';
      case 'زيتون':
        return '🫒';
      case 'مختلط':
        return '🌾';
      default:
        return '🌱';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F1E8] to-[#E8DCC4] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#C9A962] mx-auto mb-4"></div>
          <p className="text-[#2C2C2C] font-medium">جارٍ تحميل المزارع...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F1E8] to-[#E8DCC4] p-8" dir="rtl">
      <div className="max-w-[1400px] mx-auto">
        {onBack && <BackButton onClick={onBack} />}

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-[#2C2C2C] mb-2">إدارة المزارع</h1>
            <p className="text-[#2C2C2C]/70">إدارة ومتابعة جميع المزارع المضافة للنظام</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg border border-green-200">
            <Wifi className="w-5 h-5 text-green-600 animate-pulse" />
            <span className="text-sm font-bold text-green-600">مزامنة لحظية</span>
          </div>
        </div>

        {/* Statistics Bar */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card3D>
            <div className="p-6 bg-gradient-to-br from-[#3D5B4B]/10 to-[#4A6F5C]/10">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#3D5B4B] to-[#4A6F5C] rounded-xl flex items-center justify-center shadow-lg">
                  <Home className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="text-3xl font-black text-[#3D5B4B] mb-1">{stats?.total || 0}</p>
              <p className="text-sm text-[#2C2C2C]/70">إجمالي المزارع</p>
            </div>
          </Card3D>

          <Card3D>
            <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="text-3xl font-black text-green-600 mb-1">{stats?.active || 0}</p>
              <p className="text-sm text-[#2C2C2C]/70">المزارع النشطة</p>
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
              <p className="text-sm text-[#2C2C2C]/70">المزارع المجمدة</p>
            </div>
          </Card3D>

          <Card3D>
            <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Trees className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="text-3xl font-black text-amber-600 mb-1">{stats?.total_trees || 0}</p>
              <p className="text-sm text-[#2C2C2C]/70">إجمالي الأشجار</p>
            </div>
          </Card3D>

          <Card3D>
            <div className="p-6 bg-gradient-to-br from-[#C9A962]/10 to-[#D4B574]/10">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#C9A962] to-[#D4B574] rounded-xl flex items-center justify-center shadow-lg">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="text-2xl font-black text-[#C9A962] mb-1">
                {(stats?.avg_marketing_price || 0).toLocaleString('ar-SA')} ر.س
              </p>
              <p className="text-sm text-[#2C2C2C]/70">متوسط السعر</p>
            </div>
          </Card3D>
        </div>

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
                  placeholder="البحث باسم المزرعة أو الصنف أو المدينة..."
                  className="w-full pr-10 pl-4 py-3 bg-[#F5F1E8] border-2 border-transparent rounded-xl focus:outline-none focus:border-[#C9A962] transition-colors"
                />
              </div>
            </div>

            {/* Filter by Type */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-3 bg-[#F5F1E8] border-2 border-transparent rounded-xl focus:outline-none focus:border-[#C9A962] transition-colors font-medium"
            >
              <option value="all">كل الأنواع</option>
              <option value="نخيل">نخيل 🌴</option>
              <option value="زيتون">زيتون 🫒</option>
              <option value="مختلط">مختلط 🌾</option>
            </select>

            {/* Filter by Status */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 bg-[#F5F1E8] border-2 border-transparent rounded-xl focus:outline-none focus:border-[#C9A962] transition-colors font-medium"
            >
              <option value="all">كل الحالات</option>
              <option value="active">نشطة ✅</option>
              <option value="frozen">مجمدة 🧊</option>
              <option value="under_review">تحت المراجعة 🕐</option>
            </select>

            {/* Add Button */}
            <button
              onClick={handleCreateFarm}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-[#3D5B4B] to-[#4A6F5C] text-white rounded-xl hover:shadow-xl transform hover:-translate-y-0.5 transition-all font-bold"
            >
              <Plus className="h-5 w-5" />
              إضافة مزرعة جديدة
            </button>
          </div>
        </div>

        {/* Farms Grid */}
        {filteredFarms.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🌾</div>
            <p className="text-xl text-[#2C2C2C]/70 font-medium">
              {searchTerm || filterType !== 'all' || filterStatus !== 'all'
                ? 'لا توجد مزارع تطابق معايير البحث'
                : 'لا توجد مزارع مضافة بعد'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFarms.map((farm) => (
              <Card3D key={farm.id}>
                <div
                  className={`relative bg-white rounded-2xl overflow-hidden border-4 ${getStatusColor(
                    farm.status
                  )} group cursor-pointer transition-all duration-300`}
                >
                  {/* Aerial Map Image */}
                  {farm.aerial_map_url ? (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={farm.aerial_map_url}
                        alt={farm.name_ar}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-lg">
                        <Map className="h-3 w-3 text-[#C9A962]" />
                        خريطة جوية
                      </div>
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <div className="text-center text-gray-400">
                        <Map className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm font-medium">لم تُرفع خريطة جوية</p>
                      </div>
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-black text-[#2C2C2C] mb-2 flex items-center gap-2">
                          <span className="text-2xl">{getFarmIcon(farm.farm_type)}</span>
                          {farm.name_ar}
                        </h3>
                        <div
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border-2`}
                        >
                          {getStatusIcon(farm.status)}
                          {getStatusLabel(farm.status)}
                        </div>
                      </div>
                    </div>

                    {/* Farm Code Badge */}
                    {farm.farm_code && (
                      <div className="mb-4 bg-gradient-to-r from-[#C9A962]/20 to-[#D4B574]/20 rounded-lg p-3 border-2 border-[#C9A962]/30">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-[#C9A962] rounded-lg flex items-center justify-center">
                              <span className="text-white text-xs font-bold">#</span>
                            </div>
                            <div>
                              <p className="text-xs text-[#2C2C2C]/60">رقم المزرعة</p>
                              <p className="font-mono font-black text-sm text-[#C9A962]">{farm.farm_code}</p>
                            </div>
                          </div>
                          {farm.farm_barcode && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(farm.farm_barcode, '_blank');
                              }}
                              className="px-3 py-1.5 bg-[#C9A962] text-white text-xs rounded-lg hover:bg-[#B8894E] transition-colors font-bold"
                            >
                              QR
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Details */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-2 text-sm text-[#2C2C2C]/80">
                        <Sprout className="h-4 w-4 text-[#3D5B4B]" />
                        <span className="font-semibold">النوع:</span>
                        <span>
                          {farm.farm_type === 'نخيل' ? 'نخيل' : farm.farm_type === 'زيتون' ? 'أشجار زيتون' : farm.farm_type || 'غير محدد'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-[#2C2C2C]/80">
                        <Trees className="h-4 w-4 text-amber-600" />
                        <span className="font-semibold">عدد الأشجار:</span>
                        <span className="font-black text-amber-600">{farm.total_trees}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-[#2C2C2C]/80">
                        <MapPin className="h-4 w-4 text-blue-600" />
                        <span>{farm.region} - {farm.city}</span>
                      </div>
                    </div>

                    {/* Smart Price Display */}
                    <div className="bg-gradient-to-br from-[#C9A962]/10 to-[#D4B574]/10 rounded-xl p-4 mb-4">
                      <SmartPriceDisplay
                        farmType={farm.farm_type}
                        unitPrice={farm.unit_marketing_price || 0}
                        size="medium"
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 pt-4 border-t-2 border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => handleEditFarm(farm, e)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-bold"
                        >
                          <Edit className="h-4 w-4" />
                          تعديل
                        </button>

                        <button
                          onClick={(e) => handleToggleStatus(farm, e)}
                          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-colors text-sm font-bold ${
                            farm.status === 'active'
                              ? 'bg-blue-500 text-white hover:bg-blue-600'
                              : 'bg-green-500 text-white hover:bg-green-600'
                          }`}
                        >
                          {farm.status === 'active' ? (
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
                          onClick={(e) => handleDeleteFarm(farm, e)}
                          className="px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <button
                      onClick={(e) => handleToggleSalesStatus(farm, e)}
                      className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-colors text-sm font-bold ${
                        (farm as any).sales_status === 'closed'
                          ? 'bg-green-500 text-white hover:bg-green-600'
                          : 'bg-amber-500 text-white hover:bg-amber-600'
                      }`}
                    >
                      {(farm as any).sales_status === 'closed' ? (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          فتح المبيعات
                        </>
                      ) : (
                        <>
                          <DollarSign className="h-4 w-4" />
                          إغلاق المبيعات
                        </>
                      )}
                    </button>
                  </div>
                  </div>
                </div>
              </Card3D>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <FarmFormModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedFarm(null);
          }}
          onSubmit={handleSubmit}
          owners={owners}
          initialData={selectedFarm}
          mode={modalMode}
        />
      )}
    </div>
  );
}
