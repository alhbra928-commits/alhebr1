import { useState, useEffect } from 'react';
import { FileText, Download, Filter, Search, CheckCircle, XCircle, Clock } from 'lucide-react';
import { brandColors, brandGradients } from '../../finance/styles/brandColors';
import { AdminSessionService } from '../services/adminSessionService';

interface ActionLog {
  id: string;
  admin_phone: string;
  admin_name: string;
  action_type: string;
  action_details: string;
  device_info: string;
  ip_address: string;
  action_status: string;
  created_at: string;
}

export function ActionLogsViewer() {
  const [logs, setLogs] = useState<ActionLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<ActionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    loadLogs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [logs, searchTerm, filterStatus, filterType]);

  const loadLogs = async () => {
    try {
      const data = await AdminSessionService.getAccessLog(undefined, 500);
      setLogs(data);
    } catch (error) {
      console.error('Error loading logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...logs];

    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.admin_name.includes(searchTerm) ||
        log.admin_phone.includes(searchTerm) ||
        log.action_details.includes(searchTerm)
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(log => log.action_status === filterStatus);
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(log => log.action_type === filterType);
    }

    setFilteredLogs(filtered);
  };

  const getActionTypeText = (type: string): string => {
    const types: Record<string, string> = {
      login: 'تسجيل دخول',
      logout: 'خروج',
      session_terminated: 'إنهاء جلسة',
      explore_platform: 'استكشاف المنصة',
      freeze_user: 'تجميد مستخدم',
      activate_user: 'تفعيل مستخدم',
      delete_user: 'حذف مستخدم',
      update_permissions: 'تحديث صلاحيات',
      terminate_session_from_control: 'إنهاء جلسة من الرقابة',
      create: 'إنشاء',
      update: 'تعديل',
      delete: 'حذف',
      approve: 'اعتماد',
      transfer: 'تحويل',
    };
    return types[type] || type;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const exportToCSV = () => {
    const headers = ['التاريخ', 'المستخدم', 'رقم الجوال', 'نوع الإجراء', 'التفاصيل', 'الحالة'];
    const rows = filteredLogs.map(log => [
      formatDate(log.created_at),
      log.admin_name,
      log.admin_phone,
      getActionTypeText(log.action_type),
      log.action_details,
      log.action_status === 'success' ? 'ناجح' : 'فشل',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `action_logs_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const uniqueActionTypes = Array.from(new Set(logs.map(log => log.action_type)));

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: 'linear-gradient(135deg, #2E2A26 0%, #3D5B4B 100%)' }}>
        <div className="text-center">
          <div
            className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-t-transparent"
            style={{ borderColor: brandColors.primary.gold }}
          />
          <p className="text-lg font-bold text-white">جاري تحميل السجل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-8" style={{ background: 'linear-gradient(135deg, #2E2A26 0%, #3D5B4B 100%)' }}>
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{ background: brandGradients.gold }}
            >
              <FileText className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white">
                سجل الإجراءات
              </h1>
              <p className="mt-1 text-sm text-white/70">
                الذاكرة التاريخية لجميع الأحداث الإدارية
              </p>
            </div>
          </div>

          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 rounded-xl px-6 py-3 font-black text-white transition-all hover:scale-105"
            style={{ background: brandGradients.gold }}
          >
            <Download className="h-5 w-5" />
            <span>تصدير CSV</span>
          </button>
        </div>

        <div
          className="mb-6 rounded-2xl p-6"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
          }}
        >
          <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/50" />
              <input
                type="text"
                placeholder="بحث في السجل..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl bg-white/10 py-3 pr-12 pl-4 font-bold text-white placeholder-white/50 transition-all focus:bg-white/20 focus:outline-none"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-xl bg-white/10 px-4 py-3 font-bold text-white transition-all focus:bg-white/20 focus:outline-none"
            >
              <option value="all">جميع الحالات</option>
              <option value="success">ناجح</option>
              <option value="failed">فشل</option>
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="rounded-xl bg-white/10 px-4 py-3 font-bold text-white transition-all focus:bg-white/20 focus:outline-none"
            >
              <option value="all">جميع الأنواع</option>
              {uniqueActionTypes.map(type => (
                <option key={type} value={type}>
                  {getActionTypeText(type)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4 text-sm font-bold text-white/70">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>إجمالي السجلات: {filteredLogs.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span>ناجح: {filteredLogs.filter(l => l.action_status === 'success').length}</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-400" />
              <span>فشل: {filteredLogs.filter(l => l.action_status === 'failed').length}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className="group rounded-xl p-4 transition-all hover:scale-[1.01]"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
                border: log.action_status === 'success'
                  ? '2px solid rgba(16, 185, 129, 0.2)'
                  : '2px solid rgba(239, 68, 68, 0.2)',
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full"
                      style={{
                        background: log.action_status === 'success'
                          ? 'rgba(16, 185, 129, 0.3)'
                          : 'rgba(239, 68, 68, 0.3)',
                      }}
                    >
                      {log.action_status === 'success' ? (
                        <CheckCircle className="h-5 w-5 text-green-400" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-400" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-white">{log.admin_name}</h3>
                        <span className="text-sm text-white/70">({log.admin_phone})</span>
                        <span
                          className="rounded-full px-3 py-0.5 text-xs font-black text-white"
                          style={{ background: brandGradients.gold }}
                        >
                          {getActionTypeText(log.action_type)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm font-bold text-white/90">{log.action_details}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 text-right">
                  <div className="flex items-center gap-2 text-xs font-bold text-white/70">
                    <Clock className="h-3 w-3" />
                    <span>{formatDate(log.created_at)}</span>
                  </div>
                  <div className="text-xs font-bold text-white/50">
                    ID: {log.id.slice(0, 8)}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredLogs.length === 0 && (
            <div
              className="rounded-2xl p-12 text-center"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
              }}
            >
              <FileText className="mx-auto mb-4 h-16 w-16 text-white/30" />
              <p className="text-lg font-bold text-white/70">لا توجد سجلات مطابقة للبحث</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
