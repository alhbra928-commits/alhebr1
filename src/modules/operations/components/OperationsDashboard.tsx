import React, { useState, useEffect } from 'react';
import {
  Activity,
  Server,
  Database,
  Shield,
  RefreshCw,
  Download,
  Clock,
  Users,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  XCircle,
  Info
} from 'lucide-react';
import { OperationsService } from '../services/operationsService';
import type {
  VersionInfo,
  BackupInfo,
  DeploymentLog,
  SystemNotification
} from '../services/operationsService';

export function OperationsDashboard() {
  const [loading, setLoading] = useState(true);
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);
  const [backups, setBackups] = useState<BackupInfo[]>([]);
  const [deploymentLogs, setDeploymentLogs] = useState<DeploymentLog[]>([]);
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [visitorStats, setVisitorStats] = useState<any>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // تحميل جميع البيانات
  const loadAllData = async () => {
    try {
      setLoading(true);

      const [
        version,
        backupsData,
        logs,
        health,
        notifs,
        visitors
      ] = await Promise.all([
        OperationsService.getCurrentVersion(),
        OperationsService.getBackups(),
        OperationsService.getDeploymentLogs(),
        OperationsService.getSystemHealth(),
        OperationsService.getSystemNotifications(),
        OperationsService.getVisitorStats(24)
      ]);

      setVersionInfo(version);
      setBackups(backupsData);
      setDeploymentLogs(logs);
      setSystemHealth(health);
      setNotifications(notifs);
      setVisitorStats(visitors);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error loading operations data:', error);
    } finally {
      setLoading(false);
    }
  };

  // تحميل أولي
  useEffect(() => {
    loadAllData();
  }, []);

  // تحديث تلقائي كل 30 ثانية
  useEffect(() => {
    const interval = setInterval(() => {
      loadAllData();
    }, 30000); // 30 ثانية

    return () => clearInterval(interval);
  }, []);

  if (loading && !versionInfo) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">جاري تحميل لوحة التشغيل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent flex items-center gap-3">
            <Activity className="h-8 w-8 text-gray-700" />
            لوحة التشغيل
          </h1>
          <p className="text-gray-600 mt-1">
            مراقبة شاملة لحالة المنصة والإصدارات
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-left">
            <p className="text-xs text-gray-500">آخر تحديث</p>
            <p className="text-sm font-medium text-gray-700">
              {lastUpdate.toLocaleTimeString('ar-SA')}
            </p>
          </div>
          <button
            onClick={loadAllData}
            disabled={loading}
            className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            تحديث
          </button>
        </div>
      </div>

      {/* الصف الأول: معلومات النسخة + حالة النظام */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* معلومات النسخة */}
        <VersionInfoCard versionInfo={versionInfo} />

        {/* حالة النظام */}
        <SystemHealthCard systemHealth={systemHealth} />
      </div>

      {/* الصف الثاني: النسخ الاحتياطية + إحصائيات الزوار */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* النسخ الاحتياطية */}
        <BackupsCard backups={backups} />

        {/* إحصائيات الزوار */}
        <VisitorStatsCard visitorStats={visitorStats} />
      </div>

      {/* الصف الثالث: سجل النشر + الإشعارات */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* سجل النشر */}
        <DeploymentLogsCard logs={deploymentLogs} />

        {/* الإشعارات */}
        <NotificationsCard notifications={notifications} />
      </div>
    </div>
  );
}

// بطاقة معلومات النسخة
function VersionInfoCard({ versionInfo }: { versionInfo: VersionInfo | null }) {
  if (!versionInfo) return null;

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border-2 border-gray-200 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Server className="h-6 w-6 text-gray-600" />
          معلومات النسخة
        </h2>
        <div className={`px-3 py-1 rounded-full text-xs font-bold ${
          versionInfo.channel === 'blue' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
        }`}>
          {versionInfo.channel}
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">رقم الإصدار</div>
          <div className="text-lg font-mono font-bold text-gray-800 break-all">
            {versionInfo.version}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Build ID</div>
            <div className="text-base font-mono font-bold text-gray-800">
              {versionInfo.buildId.slice(0, 10)}...
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">وقت النشر</div>
            <div className="text-base font-bold text-gray-800">
              {new Date(versionInfo.deployedAt).toLocaleTimeString('ar-SA', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200 flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-600 mb-1">Service Worker</div>
            <div className={`text-base font-bold ${
              versionInfo.serviceWorkerActive ? 'text-green-600' : 'text-red-600'
            }`}>
              {versionInfo.serviceWorkerActive ? 'نشط ويعمل' : 'غير نشط'}
            </div>
          </div>
          <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
            versionInfo.serviceWorkerActive
              ? 'bg-green-100'
              : 'bg-red-100'
          }`}>
            {versionInfo.serviceWorkerActive ? (
              <CheckCircle className="h-6 w-6 text-green-600" />
            ) : (
              <XCircle className="h-6 w-6 text-red-600" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// بطاقة حالة النظام
function SystemHealthCard({ systemHealth }: { systemHealth: any }) {
  if (!systemHealth) return null;

  const checks = [
    {
      label: 'HTTPS',
      value: systemHealth.https,
      icon: Shield,
      description: 'اتصال آمن'
    },
    {
      label: 'Service Worker',
      value: systemHealth.serviceWorker,
      icon: Activity,
      description: 'نظام الكاش'
    },
    {
      label: 'قاعدة البيانات',
      value: systemHealth.database,
      icon: Database,
      description: 'Supabase'
    },
    {
      label: 'CDN',
      value: systemHealth.cdn,
      icon: TrendingUp,
      description: 'شبكة التوصيل'
    }
  ];

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border-2 border-emerald-200 shadow-lg">
      <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-6">
        <Shield className="h-6 w-6 text-emerald-600" />
        حالة النظام
      </h2>

      <div className="grid grid-cols-2 gap-4">
        {checks.map((check, index) => {
          const Icon = check.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl p-4 border-2 border-emerald-100"
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={`h-5 w-5 ${
                  check.value ? 'text-emerald-600' : 'text-red-600'
                }`} />
                {check.value ? (
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
              </div>
              <div className="font-bold text-gray-800 mb-1">{check.label}</div>
              <div className="text-xs text-gray-600">{check.description}</div>
              <div className={`text-xs font-bold mt-2 ${
                check.value ? 'text-emerald-600' : 'text-red-600'
              }`}>
                {check.value ? '✅ يعمل' : '❌ معطل'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// بطاقة النسخ الاحتياطية
function BackupsCard({ backups }: { backups: BackupInfo[] }) {
  const latestBackup = backups[0];

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200 shadow-lg">
      <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-6">
        <Database className="h-6 w-6 text-blue-600" />
        النسخ الاحتياطية
      </h2>

      {latestBackup ? (
        <>
          <div className="bg-white rounded-xl p-4 border-2 border-blue-100 mb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-gray-600">آخر نسخة احتياطية</div>
              <div className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                {latestBackup.status}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-500 mb-1">الحجم</div>
                <div className="text-lg font-bold text-gray-800">
                  {latestBackup.size_mb} MB
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">التوقيت</div>
                <div className="text-sm font-bold text-gray-800">
                  {new Date(latestBackup.created_at).toLocaleTimeString('ar-SA', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>

            <button className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2">
              <Download className="h-4 w-4" />
              تحميل النسخة
            </button>
          </div>

          <div className="bg-white rounded-xl p-4 border border-blue-100">
            <div className="text-sm font-bold text-gray-700 mb-3">آخر 5 نسخ</div>
            <div className="space-y-2">
              {backups.slice(0, 5).map((backup, index) => (
                <div
                  key={backup.id}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-xs text-gray-600">
                      {new Date(backup.created_at).toLocaleDateString('ar-SA')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-700">
                      {backup.size_mb} MB
                    </span>
                    {backup.status === 'success' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <Database className="h-12 w-12 mx-auto mb-3 text-gray-400" />
          <p>لا توجد نسخ احتياطية متاحة</p>
        </div>
      )}
    </div>
  );
}

// بطاقة إحصائيات الزوار
function VisitorStatsCard({ visitorStats }: { visitorStats: any }) {
  if (!visitorStats) return null;

  const sources = [
    { name: 'تيك توك', value: visitorStats.sources.tiktok, color: 'from-pink-500 to-red-500', icon: '🎵' },
    { name: 'إنستغرام', value: visitorStats.sources.instagram, color: 'from-purple-500 to-pink-500', icon: '📸' },
    { name: 'جوجل', value: visitorStats.sources.google, color: 'from-blue-500 to-green-500', icon: '🔍' },
    { name: 'مباشر', value: visitorStats.sources.direct, color: 'from-gray-500 to-gray-600', icon: '🌐' }
  ];

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200 shadow-lg">
      <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-6">
        <Users className="h-6 w-6 text-purple-600" />
        إحصائيات الزوار (24 ساعة)
      </h2>

      <div className="bg-white rounded-xl p-6 border-2 border-purple-100 mb-4 text-center">
        <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
          {visitorStats.total.toLocaleString('ar-SA')}
        </div>
        <div className="text-sm text-gray-600">إجمالي الزوار</div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {sources.map((source, index) => (
          <div
            key={index}
            className="bg-white rounded-xl p-4 border border-purple-100"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{source.icon}</span>
              <span className="text-sm font-bold text-gray-700">{source.name}</span>
            </div>
            <div className={`text-2xl font-bold bg-gradient-to-r ${source.color} bg-clip-text text-transparent`}>
              {source.value.toLocaleString('ar-SA')}
            </div>
            <div className="text-xs text-gray-500 mt-1">زائر</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// بطاقة سجل النشر
function DeploymentLogsCard({ logs }: { logs: DeploymentLog[] }) {
  return (
    <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 border-2 border-orange-200 shadow-lg">
      <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-6">
        <TrendingUp className="h-6 w-6 text-orange-600" />
        سجل النشر (آخر 5 عمليات)
      </h2>

      <div className="space-y-3">
        {logs.map((log, index) => (
          <div
            key={log.id}
            className="bg-white rounded-xl p-4 border-2 border-orange-100 hover:border-orange-300 transition-all"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="font-mono text-sm font-bold text-gray-800 mb-1">
                  {log.version}
                </div>
                {log.notes && (
                  <div className="text-xs text-gray-600">{log.notes}</div>
                )}
              </div>
              {log.status === 'success' ? (
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              {new Date(log.deployed_at).toLocaleString('ar-SA')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// بطاقة الإشعارات
function NotificationsCard({ notifications }: { notifications: SystemNotification[] }) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning': return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'error': return <XCircle className="h-5 w-5 text-red-600" />;
      default: return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      case 'error': return 'bg-red-50 border-red-200';
      default: return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-6 border-2 border-teal-200 shadow-lg">
      <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-6">
        <Info className="h-6 w-6 text-teal-600" />
        إشعارات النظام (آخر 10)
      </h2>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={`rounded-xl p-4 border-2 ${getBgColor(notif.type)}`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {getIcon(notif.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-gray-800 mb-1">
                  {notif.title}
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  {notif.message}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  {new Date(notif.timestamp).toLocaleString('ar-SA')}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
