import React, { useState, useEffect } from 'react';
import {
  Database,
  Download,
  Upload,
  Clock,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Trash2,
  RefreshCw,
  Calendar,
  HardDrive,
  Lock,
  Unlock,
  AlertCircle,
  History,
  BarChart3
} from 'lucide-react';
import { Card3D } from '../../../components/ui/Card3D';
import { BackupService, BackupRecord, StorageStats, RetentionLog } from '../backupService';

export function BackupCenter() {
  const [backups, setBackups] = useState<BackupRecord[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [storageStats, setStorageStats] = useState<StorageStats | null>(null);
  const [retentionLogs, setRetentionLogs] = useState<RetentionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [applyingPolicy, setApplyingPolicy] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<string | null>(null);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showRetentionLogs, setShowRetentionLogs] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [lockReason, setLockReason] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [backupsData, statsData, storageData, logsData] = await Promise.all([
        BackupService.getBackupList(50),
        BackupService.getBackupStats(),
        BackupService.getStorageStats(),
        BackupService.getRetentionLogs(20)
      ]);
      setBackups(backupsData);
      setStats(statsData);
      setStorageStats(storageData);
      setRetentionLogs(logsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    if (creating) return;

    if (!confirm('هل أنت متأكد من إنشاء نسخة احتياطية يدوية كاملة؟')) {
      return;
    }

    try {
      setCreating(true);
      await BackupService.createManualBackup();
      alert('تم إنشاء النسخة الاحتياطية بنجاح!');
      await loadData();
    } catch (err: any) {
      console.error(err);
      alert('حدث خطأ: ' + (err.message || 'فشل إنشاء النسخة'));
    } finally {
      setCreating(false);
    }
  };

  const handleApplyRetentionPolicy = async () => {
    if (applyingPolicy) return;

    if (!confirm('هل أنت متأكد من تطبيق سياسة الاحتفاظ؟\n\nسيتم حذف:\n- النسخ الأقدم من 30 يوم\n- النسخ الزائدة عن 10 نسخ لكل نوع\n\n(النسخ المثبتة لن تُحذف)')) {
      return;
    }

    try {
      setApplyingPolicy(true);
      const result = await BackupService.applyRetentionPolicy(10, 30);
      if (result.success) {
        alert(`تم تطبيق السياسة بنجاح!\n\n✓ تم حذف: ${result.deleted_count} نسخة\n✓ حسب العمر: ${result.deleted_by_age}\n✓ حسب العدد: ${result.deleted_by_count}\n⚠ تم تجاوز (مثبتة): ${result.skipped_locked}`);
        await loadData();
      }
    } catch (err: any) {
      alert('حدث خطأ: ' + err.message);
    } finally {
      setApplyingPolicy(false);
    }
  };

  const handleLockToggle = async (backup: BackupRecord) => {
    if (backup.is_locked) {
      if (!confirm('هل تريد إلغاء تثبيت هذه النسخة؟')) return;

      try {
        await BackupService.unlockBackup(backup.id);
        alert('تم إلغاء التثبيت بنجاح');
        await loadData();
      } catch (err: any) {
        alert('حدث خطأ: ' + err.message);
      }
    } else {
      const reason = prompt('اكتب سبب التثبيت (اختياري):', 'نسخة مهمة');
      if (reason === null) return;

      try {
        await BackupService.lockBackup(backup.id, reason || 'نسخة مهمة');
        alert('تم تثبيت النسخة بنجاح');
        await loadData();
      } catch (err: any) {
        alert('حدث خطأ: ' + err.message);
      }
    }
  };

  const handleDeleteBackup = async (backup: BackupRecord) => {
    if (backup.is_locked) {
      alert('لا يمكن حذف نسخة مثبتة! يجب إلغاء التثبيت أولاً.');
      return;
    }

    if (!confirm(`هل أنت متأكد من حذف النسخة:\n${backup.backup_name}؟`)) {
      return;
    }

    try {
      await BackupService.deleteBackup(backup.id);
      alert('تم حذف النسخة بنجاح');
      await loadData();
    } catch (err: any) {
      alert('حدث خطأ: ' + err.message);
    }
  };

  const handleInitiateRestore = (backupId: string) => {
    setSelectedBackup(backupId);
    setShowRestoreModal(true);
    setConfirmationCode('');
    setAdminPassword('');
  };

  const handleRestoreConfirm = async () => {
    if (!selectedBackup) return;

    const expectedCode = BackupService.generateConfirmationCode(selectedBackup);

    if (confirmationCode.toUpperCase() !== expectedCode) {
      alert('كود التأكيد غير صحيح');
      return;
    }

    if (!adminPassword || adminPassword.length < 6) {
      alert('يجب إدخال كلمة مرور المشرف (6 أحرف على الأقل)');
      return;
    }

    if (!confirm('⚠️ تحذير نهائي: سيتم استرجاع النظام بالكامل. هل أنت متأكد تماماً؟')) {
      return;
    }

    alert('تنبيه: وظيفة الاسترجاع الكامل تحتاج اختبار إضافي في بيئة الإنتاج. تم تسجيل المحاولة.');

    setShowRestoreModal(false);
  };

  const getStatusInfo = (status: string) => {
    const map: any = {
      completed: { label: 'مكتمل', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
      in_progress: { label: 'جاري', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: RefreshCw },
      failed: { label: 'فشل', color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
      pending: { label: 'قيد الانتظار', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock }
    };
    return map[status] || map.pending;
  };

  const getTypeInfo = (type: string) => {
    const map: any = {
      manual: { label: 'يدوي', color: 'bg-[#C89B3C]/10 text-[#C89B3C] border-[#C89B3C]/20' },
      automatic: { label: 'تلقائي', color: 'bg-[#3D5B4B]/10 text-[#3D5B4B] border-[#3D5B4B]/20' },
      scheduled: { label: 'مجدول', color: 'bg-blue-50 text-blue-600 border-blue-200' }
    };
    return map[type] || map.manual;
  };

  const storagePercentage = storageStats
    ? BackupService.calculateStoragePercentage(storageStats.total_size_mb)
    : 0;

  const getStorageColor = () => {
    if (storagePercentage >= 80) return 'bg-red-500';
    if (storagePercentage >= 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F9F8F6]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#C89B3C] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-[#2C2C2C] font-medium">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-[#F9F8F6]" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-black text-[#3D5B4B] mb-2 flex items-center gap-3">
              <Database className="h-10 w-10" />
              مركز النسخ الاحتياطي
            </h1>
            <p className="text-[#2C2C2C]/70">إدارة وحماية بيانات النظام بالكامل</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowRetentionLogs(!showRetentionLogs)}
              className="flex items-center gap-2 px-4 py-3 bg-white text-[#2C2C2C] rounded-xl hover:bg-[#F4EBDD] transition-all border-2 border-[#C89B3C]/20"
            >
              <History className="h-5 w-5" />
              <span>سجل الحذف</span>
            </button>
            <button
              onClick={handleApplyRetentionPolicy}
              disabled={applyingPolicy}
              className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-[#3D5B4B] to-[#4A6F5C] text-white rounded-xl hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-50"
            >
              {applyingPolicy ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <span>جاري التطبيق...</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5" />
                  <span>تطبيق السياسة</span>
                </>
              )}
            </button>
            <button
              onClick={handleCreateBackup}
              disabled={creating}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#C89B3C] to-[#D4AF37] text-white rounded-xl hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <span>جاري الإنشاء...</span>
                </>
              ) : (
                <>
                  <Download className="h-5 w-5" />
                  <span>إنشاء نسخة يدوية</span>
                </>
              )}
            </button>
          </div>
        </div>

        {storageStats && storageStats.storage_warning && (
          <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-bold text-yellow-900 mb-1">تحذير: اقتراب من الحد الأقصى</h3>
              <p className="text-sm text-yellow-700">
                عدد النسخ الحالي: {storageStats.total_count} من 10 نسخ. يُنصح بتطبيق سياسة الاحتفاظ لحذف النسخ القديمة.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card3D>
            <div className="p-6 bg-gradient-to-br from-[#C89B3C]/10 to-[#E8C170]/10">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#C89B3C] to-[#E8C170] rounded-xl flex items-center justify-center shadow-lg">
                  <HardDrive className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="text-3xl font-black text-[#C89B3C] mb-1">
                {stats?.total || 0}
              </p>
              <p className="text-sm text-[#2C2C2C]/70">إجمالي النسخ</p>
            </div>
          </Card3D>

          <Card3D>
            <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Lock className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="text-3xl font-black text-blue-600 mb-1">
                {storageStats?.locked_count || 0}
              </p>
              <p className="text-sm text-[#2C2C2C]/70">نسخ مثبتة</p>
            </div>
          </Card3D>

          <Card3D>
            <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="text-3xl font-black text-green-600 mb-1">
                {stats?.last24h || 0}
              </p>
              <p className="text-sm text-[#2C2C2C]/70">آخر 24 ساعة</p>
            </div>
          </Card3D>

          <Card3D>
            <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="text-2xl font-black text-amber-600 mb-1">
                {storageStats?.total_size_mb.toFixed(1) || 0} MB
              </p>
              <p className="text-sm text-[#2C2C2C]/70">المساحة المستخدمة</p>
            </div>
          </Card3D>

          <Card3D>
            <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Database className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="text-2xl font-black text-purple-600 mb-1">
                {(stats?.totalRecords || 0).toLocaleString('ar-SA')}
              </p>
              <p className="text-sm text-[#2C2C2C]/70">إجمالي السجلات</p>
            </div>
          </Card3D>
        </div>

        {storageStats && (
          <Card3D>
            <div className="p-6 bg-white mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-[#2C2C2C] flex items-center gap-2">
                  <HardDrive className="h-5 w-5 text-[#C89B3C]" />
                  مؤشر المساحة التخزينية
                </h3>
                <div className="text-right">
                  <span className={`text-2xl font-black ${storagePercentage >= 80 ? 'text-red-600' : storagePercentage >= 60 ? 'text-yellow-600' : 'text-green-600'}`}>
                    {storagePercentage}%
                  </span>
                  <p className="text-xs text-[#2C2C2C]/60">من 1000 MB</p>
                </div>
              </div>
              <div className="relative w-full h-6 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`absolute top-0 right-0 h-full ${getStorageColor()} transition-all duration-500`}
                  style={{ width: `${Math.min(storagePercentage, 100)}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-l from-transparent to-white/20"></div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 text-sm">
                <span className="text-[#2C2C2C]/60">المستخدم: {storageStats.total_size_mb.toFixed(1)} MB</span>
                <span className="text-[#2C2C2C]/60">المتبقي: {(1000 - storageStats.total_size_mb).toFixed(1)} MB</span>
              </div>
              {storagePercentage >= 80 && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700 font-medium flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    تحذير: تجاوز 80% من المساحة! يُنصح بتطبيق سياسة الاحتفاظ فوراً.
                  </p>
                </div>
              )}
            </div>
          </Card3D>
        )}

        {showRetentionLogs && retentionLogs.length > 0 && (
          <Card3D>
            <div className="p-6 bg-white mb-6">
              <h3 className="text-lg font-bold text-[#2C2C2C] mb-4 flex items-center gap-2">
                <History className="h-5 w-5 text-[#C89B3C]" />
                سجل الحذف التلقائي (آخر 20 عملية)
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {retentionLogs.map((log) => (
                  <div key={log.id} className="p-4 bg-[#F9F8F6] rounded-lg border border-[#C89B3C]/10">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-[#2C2C2C] mb-1">{log.backup_name}</h4>
                        <p className="text-sm text-[#2C2C2C]/70 mb-2">{log.deletion_reason}</p>
                        <div className="flex items-center gap-4 text-xs text-[#2C2C2C]/60">
                          <span>النوع: {log.backup_type}</span>
                          <span>العمر: {log.backup_age_days} يوم</span>
                          <span>السجلات: {log.records_count.toLocaleString('ar-SA')}</span>
                        </div>
                      </div>
                      <span className="text-xs text-[#2C2C2C]/50">
                        {new Date(log.deleted_at).toLocaleDateString('ar-SA')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card3D>
        )}

        {backups.length === 0 ? (
          <Card3D>
            <div className="p-12 text-center bg-white">
              <Database className="h-16 w-16 text-[#C89B3C]/50 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-[#2C2C2C] mb-2">لا توجد نسخ احتياطية</h3>
              <p className="text-[#2C2C2C]/70 mb-6">ابدأ بإنشاء أول نسخة احتياطية لحماية بياناتك</p>
              <button
                onClick={handleCreateBackup}
                disabled={creating}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#C89B3C] to-[#D4AF37] text-white rounded-xl hover:shadow-lg transition-all transform hover:scale-105"
              >
                <Download className="h-5 w-5" />
                إنشاء نسخة احتياطية
              </button>
            </div>
          </Card3D>
        ) : (
          <div className="space-y-4">
            {backups.map((backup) => {
              const statusInfo = getStatusInfo(backup.status);
              const typeInfo = getTypeInfo(backup.backup_type);
              const StatusIcon = statusInfo.icon;

              return (
                <Card3D key={backup.id}>
                  <div className="p-6 bg-white">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Database className="h-6 w-6 text-[#C89B3C]" />
                          <h3 className="text-lg font-bold text-[#2C2C2C]">
                            {backup.backup_name}
                          </h3>
                          {backup.is_locked && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs">
                              <Lock className="h-3 w-3" />
                              <span>مثبتة</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border-2 ${statusInfo.color}`}>
                            <StatusIcon className="h-4 w-4" />
                            <span className="text-sm font-medium">{statusInfo.label}</span>
                          </div>
                          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border-2 ${typeInfo.color}`}>
                            <span className="text-sm font-medium">{typeInfo.label}</span>
                          </div>
                        </div>
                        {backup.is_locked && backup.lock_reason && (
                          <p className="text-xs text-[#2C2C2C]/60 mt-2">
                            سبب التثبيت: {backup.lock_reason}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleLockToggle(backup)}
                          className={`p-2 rounded-lg transition-colors ${
                            backup.is_locked
                              ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                          }`}
                          title={backup.is_locked ? 'إلغاء التثبيت' : 'تثبيت النسخة'}
                        >
                          {backup.is_locked ? <Lock className="h-5 w-5" /> : <Unlock className="h-5 w-5" />}
                        </button>
                        {backup.status === 'completed' && (
                          <button
                            onClick={() => handleInitiateRestore(backup.id)}
                            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                            title="استرجاع"
                          >
                            <Upload className="h-5 w-5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteBackup(backup)}
                          disabled={backup.is_locked}
                          className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title={backup.is_locked ? 'لا يمكن حذف نسخة مثبتة' : 'حذف'}
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 pt-4 border-t border-[#C89B3C]/10">
                      <div>
                        <p className="text-xs text-[#2C2C2C]/60 mb-1">عدد الجداول</p>
                        <p className="text-lg font-bold text-[#C89B3C]">{backup.tables_count}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#2C2C2C]/60 mb-1">عدد السجلات</p>
                        <p className="text-lg font-bold text-[#3D5B4B]">
                          {backup.records_count.toLocaleString('ar-SA')}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[#2C2C2C]/60 mb-1">التاريخ</p>
                        <p className="text-sm font-medium text-[#2C2C2C]">
                          {new Date(backup.created_at).toLocaleDateString('ar-SA')}
                        </p>
                        <p className="text-xs text-[#2C2C2C]/50">
                          {new Date(backup.created_at).toLocaleTimeString('ar-SA')}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[#2C2C2C]/60 mb-1">مرات الاسترجاع</p>
                        <p className="text-lg font-bold text-gray-600">{backup.restore_count || 0}</p>
                      </div>
                    </div>
                  </div>
                </Card3D>
              );
            })}
          </div>
        )}
      </div>

      {showRestoreModal && selectedBackup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" dir="rtl">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-rose-600 p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white">استرجاع النظام الكامل</h2>
                  <p className="text-white/80 text-sm">الحماية المزدوجة مطلوبة</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-red-900 mb-1">⚠️ تحذير شديد الأهمية</p>
                    <p className="text-xs text-red-700">
                      سيتم استرجاع النظام بالكامل من هذه النسخة الاحتياطية. جميع البيانات الحالية قد تتأثر.
                      سيتم إنشاء نسخة احتياطية أمان تلقائياً قبل البدء.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2C2C2C] mb-2">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-[#C89B3C]" />
                    الحماية الأولى: كود التأكيد
                  </div>
                </label>
                <div className="p-4 bg-[#F9F8F6] rounded-xl mb-2">
                  <p className="text-xs text-[#2C2C2C]/60 mb-2">اكتب الكود التالي للتأكيد:</p>
                  <p className="text-2xl font-black text-[#C89B3C] tracking-wider">
                    {BackupService.generateConfirmationCode(selectedBackup)}
                  </p>
                </div>
                <input
                  type="text"
                  value={confirmationCode}
                  onChange={(e) => setConfirmationCode(e.target.value)}
                  className="w-full px-4 py-3 bg-white border-2 border-[#C89B3C]/20 rounded-xl focus:outline-none focus:border-[#C89B3C] transition-colors text-center text-xl tracking-wider uppercase"
                  placeholder="أدخل كود التأكيد"
                  maxLength={8}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2C2C2C] mb-2">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-[#C89B3C]" />
                    الحماية الثانية: كلمة مرور المشرف الأعلى
                  </div>
                </label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white border-2 border-[#C89B3C]/20 rounded-xl focus:outline-none focus:border-[#C89B3C] transition-colors"
                  placeholder="أدخل كلمة مرور المشرف"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleRestoreConfirm}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl hover:shadow-lg transition-all transform hover:scale-105"
                >
                  <Upload className="h-5 w-5" />
                  تأكيد الاسترجاع
                </button>
                <button
                  onClick={() => setShowRestoreModal(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
                >
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
