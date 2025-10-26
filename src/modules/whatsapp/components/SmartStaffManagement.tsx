import { useState, useEffect } from 'react';
import {
  Users, Plus, Edit2, Trash2, Check, X, Phone, Mail, Briefcase,
  Clock, MessageCircle, Activity, TrendingUp, UserCheck, UserX,
  AlertCircle, Save, Building2, Sparkles, Zap, Target, Award,
  Calendar, Filter, Search
} from 'lucide-react';
import { SmartWhatsAppStaffService, Department, Staff } from '../../../services/smartWhatsAppStaffService';
import { brandColors, brandGradients } from '../../finance/styles/brandColors';

export function SmartStaffManagement() {
  const [activeTab, setActiveTab] = useState<'departments' | 'staff' | 'analytics'>('staff');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Partial<Staff> | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [depts, staffList] = await Promise.all([
      SmartWhatsAppStaffService.getDepartments(),
      SmartWhatsAppStaffService.getStaff(true),
    ]);
    setDepartments(depts);
    setStaff(staffList);
    setLoading(false);
  };

  const handleSaveStaff = async () => {
    if (!editingStaff) return;

    const success = editingStaff.id
      ? await SmartWhatsAppStaffService.updateStaff(editingStaff.id, editingStaff)
      : await SmartWhatsAppStaffService.createStaff(editingStaff);

    if (success) {
      setShowModal(false);
      setEditingStaff(null);
      loadData();
    }
  };

  const toggleAvailability = async (staffId: string, currentStatus: boolean) => {
    await SmartWhatsAppStaffService.toggleStaffAvailability(staffId, !currentStatus);
    loadData();
  };

  const getIcon = (iconName: string) => {
    const icons: Record<string, any> = {
      ShoppingCart: MessageCircle,
      Headphones: Phone,
      DollarSign: TrendingUp,
      TrendingUp: TrendingUp,
      Tractor: Building2,
      UserCog: Users,
    };
    return icons[iconName] || MessageCircle;
  };

  // Filtering
  const filteredStaff = staff.filter(s => {
    const matchesSearch = s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         s.phone_number.includes(searchTerm);
    const matchesDepartment = filterDepartment === 'all' || s.department_id === filterDepartment;
    const matchesStatus = filterStatus === 'all' ||
                         (filterStatus === 'active' && s.is_active && s.is_available) ||
                         (filterStatus === 'busy' && s.is_active && !s.is_available) ||
                         (filterStatus === 'inactive' && !s.is_active);
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const getStatusBadge = (staff: Staff) => {
    if (!staff.is_active) {
      return <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-200 text-gray-600">معطل</span>;
    }
    if (staff.is_available) {
      return <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 flex items-center gap-1">
        <Activity className="h-3 w-3 animate-pulse" />
        متاح
      </span>;
    }
    return <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700">مشغول</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-12 w-12 mx-auto mb-4 animate-spin" style={{ color: brandColors.primary.gold }} />
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9f5e9 100%)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="rounded-3xl p-8 shadow-2xl mb-6" style={{ background: brandGradients.olive }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 backdrop-blur rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(255, 255, 255, 0.2)' }}
              >
                <Users className="h-8 w-8 text-white" />
              </div>
              <div className="text-white">
                <h1 className="text-3xl font-black">إدارة الموظفين الذكية</h1>
                <p className="text-green-100">نظام الربط المباشر مع الواتساب</p>
              </div>
            </div>
            <div className="text-white text-right">
              <div className="text-3xl font-black">{staff.length}</div>
              <div className="text-sm">إجمالي الموظفين</div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-green-100">
            <div className="flex items-center justify-between mb-2">
              <UserCheck className="h-8 w-8 text-green-600" />
              <span className="text-3xl font-black text-green-600">
                {staff.filter(s => s.is_active && s.is_available).length}
              </span>
            </div>
            <div className="text-sm font-bold text-gray-600">متاحون الآن</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-orange-100">
            <div className="flex items-center justify-between mb-2">
              <UserX className="h-8 w-8 text-orange-600" />
              <span className="text-3xl font-black text-orange-600">
                {staff.filter(s => s.is_active && !s.is_available).length}
              </span>
            </div>
            <div className="text-sm font-bold text-gray-600">مشغولون</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <Building2 className="h-8 w-8 text-blue-600" />
              <span className="text-3xl font-black text-blue-600">{departments.length}</span>
            </div>
            <div className="text-sm font-bold text-gray-600">الأقسام</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-purple-100">
            <div className="flex items-center justify-between mb-2">
              <MessageCircle className="h-8 w-8 text-purple-600" />
              <span className="text-3xl font-black text-purple-600">
                {staff.reduce((sum, s) => sum + s.current_active_chats, 0)}
              </span>
            </div>
            <div className="text-sm font-bold text-gray-600">محادثات نشطة</div>
          </div>
        </div>

        {/* Filters & Actions */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[250px]">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="بحث بالاسم أو رقم الجوال..."
                  className="w-full pr-10 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 outline-none"
                />
              </div>
            </div>

            {/* Filter by Department */}
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 outline-none font-bold"
            >
              <option value="all">جميع الأقسام</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name_ar}</option>
              ))}
            </select>

            {/* Filter by Status */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 outline-none font-bold"
            >
              <option value="all">جميع الحالات</option>
              <option value="active">متاح</option>
              <option value="busy">مشغول</option>
              <option value="inactive">معطل</option>
            </select>

            {/* Add Button */}
            <button
              onClick={() => {
                setEditingStaff({
                  full_name: '',
                  job_title: '',
                  phone_number: '966',
                  is_active: true,
                  is_available: true,
                  max_concurrent_chats: 5,
                  current_active_chats: 0,
                  auto_reply_enabled: false,
                });
                setShowModal(true);
              }}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white hover:shadow-lg transition-all"
              style={{ background: brandGradients.olive }}
            >
              <Plus className="h-5 w-5" />
              إضافة موظف
            </button>
          </div>
        </div>

        {/* Staff List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStaff.map((staffMember) => {
            const dept = departments.find(d => d.id === staffMember.department_id);
            const Icon = dept ? getIcon(dept.icon) : Users;

            return (
              <div
                key={staffMember.id}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all border-2 border-gray-100 hover:border-green-200"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center"
                      style={{
                        background: dept ? `linear-gradient(135deg, ${dept.color} 0%, ${brandColors.primary.gold} 100%)` : brandGradients.olive
                      }}
                    >
                      {staffMember.avatar_url ? (
                        <img src={staffMember.avatar_url} className="w-full h-full rounded-xl object-cover" />
                      ) : (
                        <Icon className="h-7 w-7 text-white" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-black text-gray-900">{staffMember.full_name}</h3>
                      <p className="text-sm text-gray-600">{staffMember.job_title}</p>
                    </div>
                  </div>
                  {getStatusBadge(staffMember)}
                </div>

                {/* Department */}
                {dept && (
                  <div className="flex items-center gap-2 mb-3 p-2 rounded-lg" style={{ background: `${dept.color}10` }}>
                    <Building2 className="h-4 w-4" style={{ color: dept.color }} />
                    <span className="text-sm font-bold" style={{ color: dept.color }}>
                      {dept.name_ar}
                    </span>
                  </div>
                )}

                {/* Contact */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <a
                      href={`https://wa.me/${staffMember.phone_number}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:underline font-medium"
                    >
                      {staffMember.phone_number}
                    </a>
                  </div>
                  {staffMember.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{staffMember.email}</span>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-black text-gray-900">
                      {staffMember.current_active_chats}
                    </div>
                    <div className="text-xs text-gray-600">محادثات حالية</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-black text-gray-900">
                      {staffMember.max_concurrent_chats}
                    </div>
                    <div className="text-xs text-gray-600">الحد الأقصى</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleAvailability(staffMember.id, staffMember.is_available)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${
                      staffMember.is_available
                        ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {staffMember.is_available ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                    {staffMember.is_available ? 'مشغول' : 'متاح'}
                  </button>
                  <button
                    onClick={() => {
                      setEditingStaff(staffMember);
                      setShowModal(true);
                    }}
                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredStaff.length === 0 && (
          <div className="bg-white rounded-2xl p-12 shadow-lg text-center">
            <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 text-lg">لا توجد نتائج</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && editingStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-black mb-6">
              {editingStaff.id ? 'تعديل موظف' : 'إضافة موظف جديد'}
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-gray-700 mb-2 block">الاسم الكامل</label>
                  <input
                    type="text"
                    value={editingStaff.full_name}
                    onChange={(e) => setEditingStaff({...editingStaff, full_name: e.target.value})}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 mb-2 block">المسمى الوظيفي</label>
                  <input
                    type="text"
                    value={editingStaff.job_title}
                    onChange={(e) => setEditingStaff({...editingStaff, job_title: e.target.value})}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-gray-700 mb-2 block">رقم الواتساب</label>
                  <input
                    type="text"
                    value={editingStaff.phone_number}
                    onChange={(e) => setEditingStaff({...editingStaff, phone_number: e.target.value})}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 outline-none"
                    placeholder="966500000000"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 mb-2 block">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={editingStaff.email || ''}
                    onChange={(e) => setEditingStaff({...editingStaff, email: e.target.value})}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 mb-2 block">القسم</label>
                <select
                  value={editingStaff.department_id || ''}
                  onChange={(e) => setEditingStaff({...editingStaff, department_id: e.target.value})}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 outline-none font-bold"
                >
                  <option value="">اختر القسم</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name_ar}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-gray-700 mb-2 block">الحد الأقصى للمحادثات</label>
                  <input
                    type="number"
                    value={editingStaff.max_concurrent_chats}
                    onChange={(e) => setEditingStaff({...editingStaff, max_concurrent_chats: parseInt(e.target.value)})}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 outline-none"
                  />
                </div>
                <div className="flex items-center gap-4 pt-8">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingStaff.is_active}
                      onChange={(e) => setEditingStaff({...editingStaff, is_active: e.target.checked})}
                      className="w-5 h-5"
                    />
                    <span className="font-bold">مفعل</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingStaff.is_available}
                      onChange={(e) => setEditingStaff({...editingStaff, is_available: e.target.checked})}
                      className="w-5 h-5"
                    />
                    <span className="font-bold">متاح</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSaveStaff}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                  style={{ background: brandGradients.olive }}
                >
                  <Save className="h-5 w-5" />
                  حفظ
                </button>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingStaff(null);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all"
                >
                  <X className="h-5 w-5" />
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
