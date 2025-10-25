import React, { useState, useEffect } from 'react';
import { Package, CheckCircle, AlertCircle, AlertTriangle, XCircle, RefreshCw, Calendar, GitBranch } from 'lucide-react';

interface TestResult {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'success' | 'warning' | 'error';
  result: string;
}

interface VersionManifest {
  version: string;
  timestamp: number;
  date: string;
  build: string;
  environment: string;
}

export const CacheSystemDiagnostics: React.FC = () => {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [running, setRunning] = useState(false);
  const [summary, setSummary] = useState({ passed: 0, warnings: 0, failed: 0, total: 0 });
  const [manifest, setManifest] = useState<VersionManifest | null>(null);

  const updateTest = (id: string, status: TestResult['status'], result: string, description?: string) => {
    setTests(prev => prev.map(test =>
      test.id === id
        ? { ...test, status, result, description: description || test.description }
        : test
    ));
  };

  const runAllTests = async () => {
    setRunning(true);
    setSummary({ passed: 0, warnings: 0, failed: 0, total: 0 });

    const initialTests: TestResult[] = [
      { id: 'test1', title: 'فحص Cache-Buster Meta Tag', description: 'جاري الفحص...', status: 'pending', result: '' },
      { id: 'test2', title: 'فحص قيمة Cache-Buster', description: 'جاري الفحص...', status: 'pending', result: '' },
      { id: 'test3', title: 'فحص Cache Control Headers', description: 'جاري الفحص...', status: 'pending', result: '' },
      { id: 'test4', title: 'فحص Version Manifest', description: 'جاري الفحص...', status: 'pending', result: '' },
      { id: 'test5', title: 'فحص Build Files', description: 'جاري الفحص...', status: 'pending', result: '' },
    ];

    setTests(initialTests);

    await new Promise(resolve => setTimeout(resolve, 500));

    let results = { passed: 0, warnings: 0, failed: 0, total: 5 };

    // Test 1: Cache-Buster Meta Tag
    await new Promise(resolve => setTimeout(resolve, 300));
    const meta = document.querySelector('meta[name="cache-buster"]');
    if (meta) {
      const content = meta.getAttribute('content');
      updateTest('test1', 'success', `✅ موجود: ${content}`, 'Cache-Buster Meta Tag موجود بشكل صحيح');
      results.passed++;
    } else {
      updateTest('test1', 'error', '❌ غير موجود!', 'Cache-Buster Meta Tag مفقود - النظام لا يعمل!');
      results.failed++;
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
      } else {
        updateTest('test2', 'warning',
          `⚠️ القيمة موجودة لكن التنسيق غير صحيح\n\nالقيمة الحالية: ${content}\nالتنسيق المتوقع: v20251025_1234567890`,
          'قد يؤثر على عمل النظام'
        );
        results.warnings++;
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
    } else {
      updateTest('test3', 'warning', headerResults.join('\n'), 'بعض Headers مفقودة - قد يسبب مشاكل في الكاش');
      results.warnings++;
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
      } else {
        throw new Error('File not found');
      }
    } catch (error) {
      updateTest('test4', 'error',
        `❌ ملف version-manifest.json غير موجود\n\nهذا يعني أن سكربت generate-cache لم يعمل بشكل صحيح.\n\nتأكد من تشغيل: npm run build`,
        'Version Manifest مفقود'
      );
      results.failed++;
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
    } else if (hasHashes) {
      updateTest('test5', 'success',
        `✅ جميع الملفات لها hash فريد\n\nعدد الملفات: ${files.length}\n\n${files.slice(0, 5).join('\n')}${files.length > 5 ? '\n...' : ''}\n\nهذا يضمن أن المتصفح يجلب النسخة الجديدة دائماً!`,
        'Build files صحيحة'
      );
      results.passed++;
    } else {
      updateTest('test5', 'error',
        `❌ بعض الملفات لا تحتوي على hash\n\n${files.join('\n')}\n\nهذا يعني أن إعدادات Vite غير صحيحة!`,
        'مشكلة في Build configuration'
      );
      results.failed++;
    }

    setSummary(results);
    setRunning(false);
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-xl">
              <Package className="text-blue-600" size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">تشخيص نظام الكاش الذكي</h2>
              <p className="text-gray-600">فحص شامل للتأكد من أن نظام الكاش يعمل بشكل فعلي</p>
            </div>
          </div>

          <button
            onClick={runAllTests}
            disabled={running}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all ${
              running
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 hover:shadow-lg'
            }`}
          >
            <RefreshCw size={20} className={running ? 'animate-spin' : ''} />
            {running ? 'جاري الفحص...' : 'بدء الفحص الشامل'}
          </button>
        </div>
      </div>

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
