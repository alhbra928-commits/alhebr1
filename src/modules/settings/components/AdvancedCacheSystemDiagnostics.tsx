import React, { useState, useEffect } from 'react';
import { Package, CheckCircle, AlertCircle, AlertTriangle, XCircle, RefreshCw, Calendar, GitBranch, Trash2, RotateCcw, Zap, Shield, Database, HardDrive } from 'lucide-react';

interface TestResult {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'success' | 'warning' | 'error';
  result: string;
  canFix?: boolean;
  fixAction?: () => Promise<void>;
}

interface VersionManifest {
  version: string;
  timestamp: number;
  date: string;
  build: string;
  environment: string;
}

interface CacheStats {
  totalCaches: number;
  cacheNames: string[];
  totalSize: number;
  serviceWorkers: number;
  localStorageSize: number;
  sessionStorageSize: number;
}

export const AdvancedCacheSystemDiagnostics: React.FC = () => {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [running, setRunning] = useState(false);
  const [fixing, setFixing] = useState<string | null>(null);
  const [summary, setSummary] = useState({ passed: 0, warnings: 0, failed: 0, total: 0 });
  const [manifest, setManifest] = useState<VersionManifest | null>(null);
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null);
  const [actionLog, setActionLog] = useState<string[]>([]);

  const addLog = (message: string) => {
    setActionLog(prev => [...prev, `[${new Date().toLocaleTimeString('ar-SA')}] ${message}`]);
  };

  const updateTest = (id: string, status: TestResult['status'], result: string, description?: string, canFix?: boolean, fixAction?: () => Promise<void>) => {
    setTests(prev => prev.map(test =>
      test.id === id
        ? { ...test, status, result, description: description || test.description, canFix, fixAction }
        : test
    ));
  };

  // إجراء 1: مسح كل Caches
  const clearAllCaches = async (): Promise<boolean> => {
    try {
      addLog('🔄 بدء مسح جميع Caches...');

      if ('caches' in window) {
        const cacheNames = await caches.keys();
        addLog(`📦 تم العثور على ${cacheNames.length} cache`);

        for (const name of cacheNames) {
          await caches.delete(name);
          addLog(`✅ تم حذف cache: ${name}`);
        }

        addLog('✅ تم مسح جميع Caches بنجاح');
        return true;
      } else {
        addLog('⚠️ Cache API غير مدعوم في هذا المتصفح');
        return false;
      }
    } catch (error) {
      addLog(`❌ خطأ في مسح Caches: ${error}`);
      return false;
    }
  };

  // إجراء 2: إلغاء جميع Service Workers
  const unregisterAllServiceWorkers = async (): Promise<boolean> => {
    try {
      addLog('🔄 بدء إلغاء تسجيل Service Workers...');

      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        addLog(`📦 تم العثور على ${registrations.length} service worker`);

        for (const registration of registrations) {
          await registration.unregister();
          addLog(`✅ تم إلغاء تسجيل SW: ${registration.scope}`);
        }

        addLog('✅ تم إلغاء جميع Service Workers بنجاح');
        return true;
      } else {
        addLog('⚠️ Service Workers غير مدعومة في هذا المتصفح');
        return false;
      }
    } catch (error) {
      addLog(`❌ خطأ في إلغاء Service Workers: ${error}`);
      return false;
    }
  };

  // إجراء 3: مسح localStorage (مع الحفاظ على بيانات مهمة)
  const cleanLocalStorage = async (): Promise<boolean> => {
    try {
      addLog('🔄 بدء تنظيف localStorage...');

      const keysToKeep = [
        'auth-token',
        'user-session',
        'admin-session',
        'investor-session',
        'farm-owner-session',
        'selected-farm'
      ];

      const allKeys = Object.keys(localStorage);
      let removed = 0;

      allKeys.forEach(key => {
        if (!keysToKeep.some(keep => key.includes(keep))) {
          localStorage.removeItem(key);
          removed++;
          addLog(`🗑️ حذف: ${key}`);
        }
      });

      addLog(`✅ تم حذف ${removed} عنصر من localStorage`);
      addLog(`✅ تم الحفاظ على ${keysToKeep.length} عناصر مهمة`);
      return true;
    } catch (error) {
      addLog(`❌ خطأ في تنظيف localStorage: ${error}`);
      return false;
    }
  };

  // إجراء 4: مسح sessionStorage
  const clearSessionStorage = async (): Promise<boolean> => {
    try {
      addLog('🔄 بدء مسح sessionStorage...');
      const count = sessionStorage.length;
      sessionStorage.clear();
      addLog(`✅ تم مسح ${count} عنصر من sessionStorage`);
      return true;
    } catch (error) {
      addLog(`❌ خطأ في مسح sessionStorage: ${error}`);
      return false;
    }
  };

  // إجراء 5: مسح شامل + إعادة تحميل
  const performDeepClean = async () => {
    setFixing('deep-clean');
    addLog('🚀 بدء التنظيف الشامل...');

    await clearAllCaches();
    await unregisterAllServiceWorkers();
    await cleanLocalStorage();
    await clearSessionStorage();

    addLog('✅ اكتمل التنظيف الشامل!');
    addLog('🔄 سيتم إعادة تحميل الصفحة خلال 3 ثواني...');

    setTimeout(() => {
      window.location.reload();
    }, 3000);
  };

  // إجراء 6: إعادة تعيين الإصدار
  const resetVersion = async () => {
    addLog('🔄 إعادة تعيين رقم الإصدار...');
    localStorage.removeItem('app-version');
    addLog('✅ تم إعادة تعيين رقم الإصدار');
    addLog('🔄 سيتم إعادة تحميل الصفحة...');
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  // قراءة إحصائيات Cache
  const getCacheStats = async (): Promise<CacheStats> => {
    const stats: CacheStats = {
      totalCaches: 0,
      cacheNames: [],
      totalSize: 0,
      serviceWorkers: 0,
      localStorageSize: 0,
      sessionStorageSize: 0
    };

    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        stats.totalCaches = cacheNames.length;
        stats.cacheNames = cacheNames;
      }

      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        stats.serviceWorkers = registrations.length;
      }

      stats.localStorageSize = new Blob(Object.values(localStorage)).size;
      stats.sessionStorageSize = new Blob(Object.values(sessionStorage)).size;
    } catch (error) {
      console.error('Error getting cache stats:', error);
    }

    return stats;
  };

  const runAllTests = async () => {
    setRunning(true);
    setSummary({ passed: 0, warnings: 0, failed: 0, total: 0 });
    setActionLog([]);
    addLog('🚀 بدء الفحص الشامل...');

    const initialTests: TestResult[] = [
      { id: 'test1', title: 'فحص Cache-Buster Meta Tag', description: 'جاري الفحص...', status: 'pending', result: '' },
      { id: 'test2', title: 'فحص قيمة Cache-Buster', description: 'جاري الفحص...', status: 'pending', result: '' },
      { id: 'test3', title: 'فحص Cache Control Headers', description: 'جاري الفحص...', status: 'pending', result: '' },
      { id: 'test4', title: 'فحص Version Manifest', description: 'جاري الفحص...', status: 'pending', result: '' },
      { id: 'test5', title: 'فحص Build Files', description: 'جاري الفحص...', status: 'pending', result: '' },
      { id: 'test6', title: 'فحص Cache Storage', description: 'جاري الفحص...', status: 'pending', result: '' },
      { id: 'test7', title: 'فحص Service Workers', description: 'جاري الفحص...', status: 'pending', result: '' },
      { id: 'test8', title: 'فحص localStorage', description: 'جاري الفحص...', status: 'pending', result: '' },
    ];

    setTests(initialTests);

    const stats = await getCacheStats();
    setCacheStats(stats);

    await new Promise(resolve => setTimeout(resolve, 500));

    let results = { passed: 0, warnings: 0, failed: 0, total: 8 };

    // Test 1: Cache-Buster Meta Tag
    await new Promise(resolve => setTimeout(resolve, 300));
    const meta = document.querySelector('meta[name="cache-buster"]');
    if (meta) {
      const content = meta.getAttribute('content');
      updateTest('test1', 'success', `✅ موجود: ${content}`, 'Cache-Buster Meta Tag موجود بشكل صحيح');
      results.passed++;
      addLog('✅ Test 1 نجح: Cache-Buster موجود');
    } else {
      updateTest('test1', 'error', '❌ غير موجود!', 'Cache-Buster Meta Tag مفقود - النظام لا يعمل!', true, async () => {
        addLog('⚠️ Cache-Buster مفقود - يجب إعادة build المشروع');
        alert('يجب تشغيل: npm run build\n\nالمشكلة: index.html لا يحتوي على cache-buster meta tag');
      });
      results.failed++;
      addLog('❌ Test 1 فشل: Cache-Buster مفقود');
    }

    // Test 2: Cache-Buster Value
    await new Promise(resolve => setTimeout(resolve, 300));
    if (meta) {
      const content = meta.getAttribute('content') || '';
      const pattern = /^v\d{8}_\d+$/;
      if (pattern.test(content)) {
        const timestamp = parseInt(content.split('_')[1]);
        const date = new Date(timestamp);
        updateTest('test2', 'success',
          `✅ القيمة صحيحة وفريدة\n\nالقيمة: ${content}\nالتاريخ: ${date.toLocaleString('ar-SA')}\n\nهذا يعني أن النظام يعمل ويولد أرقام فريدة!`,
          'Cache-Buster يعمل بشكل صحيح'
        );
        results.passed++;
        addLog(`✅ Test 2 نجح: القيمة ${content}`);
      } else {
        updateTest('test2', 'warning',
          `⚠️ القيمة موجودة لكن التنسيق غير صحيح\n\nالقيمة الحالية: ${content}\nالتنسيق المتوقع: v20251025_1234567890`,
          'قد يؤثر على عمل النظام',
          true,
          resetVersion
        );
        results.warnings++;
        addLog(`⚠️ Test 2 تحذير: تنسيق غير صحيح ${content}`);
      }
    } else {
      updateTest('test2', 'error', '❌ لا يمكن الفحص - Meta Tag مفقود', '');
      results.failed++;
    }

    // Test 3: Cache Headers
    await new Promise(resolve => setTimeout(resolve, 300));
    const cacheControl = document.querySelector('meta[http-equiv="Cache-Control"]');
    const pragma = document.querySelector('meta[http-equiv="Pragma"]');
    const expires = document.querySelector('meta[http-equiv="Expires"]');

    const headerResults = [];
    let allPresent = true;

    if (cacheControl) {
      headerResults.push('✅ Cache-Control: ' + cacheControl.getAttribute('content'));
    } else {
      headerResults.push('❌ Cache-Control: مفقود');
      allPresent = false;
    }

    if (pragma) {
      headerResults.push('✅ Pragma: ' + pragma.getAttribute('content'));
    } else {
      headerResults.push('❌ Pragma: مفقود');
      allPresent = false;
    }

    if (expires) {
      headerResults.push('✅ Expires: ' + expires.getAttribute('content'));
    } else {
      headerResults.push('❌ Expires: مفقود');
      allPresent = false;
    }

    if (allPresent) {
      updateTest('test3', 'success', headerResults.join('\n'), 'جميع Headers موجودة - الكاش معطل بشكل صحيح');
      results.passed++;
      addLog('✅ Test 3 نجح: جميع Headers موجودة');
    } else {
      updateTest('test3', 'warning', headerResults.join('\n'), 'بعض Headers مفقودة - قد يسبب مشاكل في الكاش');
      results.warnings++;
      addLog('⚠️ Test 3 تحذير: بعض Headers مفقودة');
    }

    // Test 4: Version Manifest
    await new Promise(resolve => setTimeout(resolve, 300));
    try {
      const response = await fetch('/version-manifest.json?t=' + Date.now());
      if (response.ok) {
        const data = await response.json();
        setManifest(data);
        const date = new Date(data.timestamp);
        updateTest('test4', 'success',
          `✅ ملف Manifest موجود ويعمل\n\nVersion: ${data.version}\nBuild: ${data.build}\nEnvironment: ${data.environment}\nDate: ${date.toLocaleString('ar-SA')}\n\nهذا دليل على أن نظام التتبع يعمل!`,
          'Version Manifest يعمل بشكل ممتاز'
        );
        results.passed++;
        addLog(`✅ Test 4 نجح: Manifest ${data.version}`);
      } else {
        throw new Error('File not found');
      }
    } catch (error) {
      updateTest('test4', 'error',
        `❌ ملف version-manifest.json غير موجود\n\nهذا يعني أن سكربت generate-cache لم يعمل بشكل صحيح.\n\nتأكد من تشغيل: npm run build`,
        'Version Manifest مفقود',
        true,
        async () => {
          alert('يجب تشغيل: npm run build\n\nالمشكلة: version-manifest.json مفقود');
        }
      );
      results.failed++;
      addLog('❌ Test 4 فشل: Manifest مفقود');
    }

    // Test 5: Build Files
    await new Promise(resolve => setTimeout(resolve, 300));
    const scripts = document.querySelectorAll('script[src]');
    const styles = document.querySelectorAll('link[rel="stylesheet"]');

    let hasHashes = true;
    const files: string[] = [];

    scripts.forEach(script => {
      const src = script.getAttribute('src');
      if (src && src.includes('assets')) {
        const hasHash = /\-[a-zA-Z0-9]{8,}\.(js|css)/.test(src);
        files.push(`${hasHash ? '✅' : '❌'} ${src}`);
        if (!hasHash) hasHashes = false;
      }
    });

    styles.forEach(style => {
      const href = style.getAttribute('href');
      if (href && href.includes('assets')) {
        const hasHash = /\-[a-zA-Z0-9]{8,}\.(js|css)/.test(href);
        files.push(`${hasHash ? '✅' : '❌'} ${href}`);
        if (!hasHash) hasHashes = false;
      }
    });

    if (files.length === 0) {
      updateTest('test5', 'warning',
        '⚠️ لم يتم العثور على ملفات assets\n\nقد يكون هذا لأن المنصة لم تُبنَ بعد أو يتم تشغيلها في وضع التطوير.',
        'Build files غير موجودة'
      );
      results.warnings++;
      addLog('⚠️ Test 5 تحذير: لا يوجد assets');
    } else if (hasHashes) {
      updateTest('test5', 'success',
        `✅ جميع الملفات لها hash فريد\n\nعدد الملفات: ${files.length}\n\n${files.slice(0, 5).join('\n')}${files.length > 5 ? '\n...' : ''}\n\nهذا يضمن أن المتصفح يجلب النسخة الجديدة دائماً!`,
        'Build files صحيحة'
      );
      results.passed++;
      addLog(`✅ Test 5 نجح: ${files.length} ملف مع hash`);
    } else {
      updateTest('test5', 'error',
        `❌ بعض الملفات لا تحتوي على hash\n\n${files.join('\n')}\n\nهذا يعني أن إعدادات Vite غير صحيحة!`,
        'مشكلة في Build configuration'
      );
      results.failed++;
      addLog('❌ Test 5 فشل: ملفات بدون hash');
    }

    // Test 6: Cache Storage
    await new Promise(resolve => setTimeout(resolve, 300));
    if (stats.totalCaches > 0) {
      updateTest('test6', 'warning',
        `⚠️ يوجد ${stats.totalCaches} cache مخزن\n\nالأسماء:\n${stats.cacheNames.join('\n')}\n\nقد يحتوي على بيانات قديمة - يُنصح بالتنظيف`,
        'Cache Storage يحتاج تنظيف',
        true,
        clearAllCaches
      );
      results.warnings++;
      addLog(`⚠️ Test 6 تحذير: ${stats.totalCaches} cache موجود`);
    } else {
      updateTest('test6', 'success',
        '✅ لا توجد caches مخزنة\n\nهذا يعني أن المتصفح سيجلب أحدث الملفات دائماً!',
        'Cache Storage نظيف'
      );
      results.passed++;
      addLog('✅ Test 6 نجح: لا يوجد cache');
    }

    // Test 7: Service Workers
    await new Promise(resolve => setTimeout(resolve, 300));
    if (stats.serviceWorkers > 0) {
      updateTest('test7', 'warning',
        `⚠️ يوجد ${stats.serviceWorkers} service worker مسجل\n\nقد يسبب مشاكل في الكاش - يُنصح بإلغاء التسجيل`,
        'Service Workers نشطة',
        true,
        unregisterAllServiceWorkers
      );
      results.warnings++;
      addLog(`⚠️ Test 7 تحذير: ${stats.serviceWorkers} SW نشط`);
    } else {
      updateTest('test7', 'success',
        '✅ لا توجد service workers مسجلة\n\nهذا يعني عدم وجود تعارضات في الكاش!',
        'Service Workers نظيف'
      );
      results.passed++;
      addLog('✅ Test 7 نجح: لا يوجد SW');
    }

    // Test 8: localStorage
    await new Promise(resolve => setTimeout(resolve, 300));
    const lsSize = (stats.localStorageSize / 1024).toFixed(2);
    const lsItems = Object.keys(localStorage).length;

    if (lsItems > 20) {
      updateTest('test8', 'warning',
        `⚠️ localStorage يحتوي على ${lsItems} عنصر (${lsSize} KB)\n\nقد يحتاج تنظيف - سيتم الحفاظ على البيانات المهمة`,
        'localStorage يحتاج تنظيف',
        true,
        cleanLocalStorage
      );
      results.warnings++;
      addLog(`⚠️ Test 8 تحذير: ${lsItems} عنصر في localStorage`);
    } else {
      updateTest('test8', 'success',
        `✅ localStorage نظيف (${lsItems} عنصر، ${lsSize} KB)\n\nلا يوجد بيانات زائدة!`,
        'localStorage نظيف'
      );
      results.passed++;
      addLog(`✅ Test 8 نجح: ${lsItems} عنصر فقط`);
    }

    setSummary(results);
    setRunning(false);
    addLog('✅ اكتمل الفحص الشامل!');
  };

  const handleFix = async (test: TestResult) => {
    if (!test.fixAction) return;

    setFixing(test.id);
    addLog(`🔧 بدء إصلاح: ${test.title}`);

    try {
      await test.fixAction();
      addLog(`✅ تم الإصلاح: ${test.title}`);
    } catch (error) {
      addLog(`❌ فشل الإصلاح: ${error}`);
    } finally {
      setFixing(null);
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="text-green-600" size={24} />;
      case 'warning':
        return <AlertTriangle className="text-amber-600" size={24} />;
      case 'error':
        return <XCircle className="text-red-600" size={24} />;
      default:
        return <RefreshCw className="text-gray-400 animate-spin" size={24} />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return 'border-green-300 bg-green-50';
      case 'warning':
        return 'border-amber-300 bg-amber-50';
      case 'error':
        return 'border-red-300 bg-red-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  const successRate = summary.total > 0 ? Math.round((summary.passed / summary.total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-4 md:p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl flex-shrink-0">
              <Shield className="text-white" size={28} />
            </div>
            <div>
              <h2 className="text-xl md:text-3xl font-bold leading-tight">تشخيص نظام الكاش الذكي</h2>
              <p className="text-sm md:text-base text-white/90 mt-1">فحص شامل مع إجراءات فعلية</p>
            </div>
          </div>

          <button
            onClick={runAllTests}
            disabled={running}
            className={`flex items-center justify-center gap-2 px-6 py-4 md:py-3 rounded-xl font-bold text-base transition-all touch-manipulation active:scale-95 w-full md:w-auto ${
              running
                ? 'bg-white/20 cursor-not-allowed'
                : 'bg-white text-blue-600 hover:bg-white/90 hover:shadow-lg'
            }`}
          >
            <RefreshCw size={20} className={running ? 'animate-spin' : ''} />
            {running ? 'جاري الفحص...' : 'بدء الفحص الشامل'}
          </button>
        </div>
      </div>

      {/* Quick Actions - محسّن للموبايل */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Zap className="text-blue-600" size={20} />
          إجراءات سريعة
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            onClick={clearAllCaches}
            disabled={fixing !== null}
            className="flex items-center gap-3 bg-white border-2 border-blue-200 rounded-xl p-4 hover:border-blue-400 hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
          >
            <div className="bg-blue-100 p-3 rounded-lg flex-shrink-0">
              <Trash2 className="text-blue-600" size={24} />
            </div>
            <div className="text-right flex-1">
              <div className="font-bold text-gray-900 text-base">مسح Caches</div>
              <div className="text-sm text-gray-600">حذف جميع Caches</div>
            </div>
          </button>

          <button
            onClick={unregisterAllServiceWorkers}
            disabled={fixing !== null}
            className="flex items-center gap-3 bg-white border-2 border-purple-200 rounded-xl p-4 hover:border-purple-400 hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
          >
            <div className="bg-purple-100 p-3 rounded-lg flex-shrink-0">
              <RotateCcw className="text-purple-600" size={24} />
            </div>
            <div className="text-right flex-1">
              <div className="font-bold text-gray-900 text-base">إلغاء SW</div>
              <div className="text-sm text-gray-600">إلغاء Service Workers</div>
            </div>
          </button>

          <button
            onClick={cleanLocalStorage}
            disabled={fixing !== null}
            className="flex items-center gap-3 bg-white border-2 border-amber-200 rounded-xl p-4 hover:border-amber-400 hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
          >
            <div className="bg-amber-100 p-3 rounded-lg flex-shrink-0">
              <Database className="text-amber-600" size={24} />
            </div>
            <div className="text-right flex-1">
              <div className="font-bold text-gray-900 text-base">تنظيف localStorage</div>
              <div className="text-sm text-gray-600">حذف البيانات غير الضرورية</div>
            </div>
          </button>

          <button
            onClick={performDeepClean}
            disabled={fixing !== null}
            className="flex items-center gap-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl p-4 hover:from-red-600 hover:to-red-700 hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation md:col-span-2"
          >
            <div className="bg-white/20 p-3 rounded-lg flex-shrink-0">
              <Zap size={24} />
            </div>
            <div className="text-right flex-1">
              <div className="font-bold text-base">تنظيف شامل</div>
              <div className="text-sm opacity-90">مسح كل شيء + إعادة تحميل</div>
            </div>
          </button>
        </div>
      </div>

      {/* Cache Stats */}
      {cacheStats && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <HardDrive className="text-blue-600" size={24} />
            إحصائيات التخزين
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-blue-600">{cacheStats.totalCaches}</div>
              <div className="text-sm text-gray-600">Caches</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-purple-600">{cacheStats.serviceWorkers}</div>
              <div className="text-sm text-gray-600">Service Workers</div>
            </div>
            <div className="bg-amber-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-amber-600">{Object.keys(localStorage).length}</div>
              <div className="text-sm text-gray-600">localStorage Items</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-green-600">{((cacheStats.localStorageSize + cacheStats.sessionStorageSize) / 1024).toFixed(0)}</div>
              <div className="text-sm text-gray-600">KB Storage</div>
            </div>
          </div>
        </div>
      )}

      {/* Current Version Info */}
      {manifest && (
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
          <h3 className="text-xl font-bold mb-4">معلومات الإصدار الحالي</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <GitBranch size={18} />
                <span className="text-sm opacity-90">رقم الإصدار</span>
              </div>
              <div className="font-mono font-bold text-lg">{manifest.version}</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Package size={18} />
                <span className="text-sm opacity-90">رقم البناء</span>
              </div>
              <div className="font-mono font-bold text-lg">{manifest.build}</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar size={18} />
                <span className="text-sm opacity-90">تاريخ النشر</span>
              </div>
              <div className="font-bold text-sm">
                {new Date(manifest.timestamp).toLocaleString('ar-SA')}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Test Results */}
      {tests.length > 0 && (
        <div className="space-y-4">
          {tests.map(test => (
            <div
              key={test.id}
              className={`bg-white rounded-xl border-2 ${getStatusColor(test.status)} p-6 transition-all`}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0">
                  {getStatusIcon(test.status)}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{test.title}</h3>
                  <p className="text-sm text-gray-600">{test.description}</p>
                </div>
                {test.canFix && test.fixAction && (
                  <button
                    onClick={() => handleFix(test)}
                    disabled={fixing !== null}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {fixing === test.id ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" />
                        <span>جاري الإصلاح...</span>
                      </>
                    ) : (
                      <>
                        <Zap size={16} />
                        <span>إصلاح الآن</span>
                      </>
                    )}
                  </button>
                )}
              </div>
              {test.result && (
                <div className="bg-white rounded-lg p-4 font-mono text-sm whitespace-pre-wrap border border-gray-200">
                  {test.result}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Action Log */}
      {actionLog.length > 0 && (
        <div className="bg-gray-900 rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <AlertCircle className="text-blue-400" size={24} />
            سجل الإجراءات
          </h3>
          <div className="bg-black/50 rounded-lg p-4 max-h-64 overflow-y-auto">
            <div className="font-mono text-sm text-green-400 space-y-1">
              {actionLog.map((log, index) => (
                <div key={index}>{log}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      {summary.total > 0 && !running && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-8 text-white">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold mb-2">
              {successRate >= 80 ? '✅ النظام يعمل بشكل ممتاز!' :
               successRate >= 50 ? '⚠️ النظام يعمل لكن يحتاج تحسينات' :
               '❌ النظام لا يعمل بشكل صحيح'}
            </h2>
            <p className="text-xl opacity-90">نسبة النجاح: {successRate}%</p>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 text-center">
              <div className="text-4xl font-bold mb-2">{summary.passed}</div>
              <div className="text-sm opacity-90">نجح ✅</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 text-center">
              <div className="text-4xl font-bold mb-2">{summary.warnings}</div>
              <div className="text-sm opacity-90">تحذيرات ⚠️</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 text-center">
              <div className="text-4xl font-bold mb-2">{summary.failed}</div>
              <div className="text-sm opacity-90">فشل ❌</div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      {tests.length === 0 && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-8 text-center">
          <AlertCircle className="mx-auto text-blue-600 mb-4" size={48} />
          <h3 className="text-xl font-bold text-blue-900 mb-2">جاهز للفحص</h3>
          <p className="text-blue-700">
            اضغط على زر "بدء الفحص الشامل" أعلاه لفحص نظام الكاش الذكي
          </p>
        </div>
      )}
    </div>
  );
};
