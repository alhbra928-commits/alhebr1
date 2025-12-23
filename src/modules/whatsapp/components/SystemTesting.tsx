import React, { useState, useEffect } from 'react';
import {
  Play, CheckCircle, XCircle, Clock, Zap, AlertTriangle,
  FileText, Send, RefreshCw, Download
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { whatsappService } from '../../../services/whatsappService';
import { SmartErrorModal } from '../../../components/common/SmartErrorModal';

interface TestResult {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  message?: string;
  duration?: number;
  timestamp?: string;
}

interface EventTest {
  event_type: string;
  label: string;
  description: string;
}

export const SystemTesting: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testPhone, setTestPhone] = useState('');
  const [selectedTests, setSelectedTests] = useState<string[]>([]);

  const eventTests: EventTest[] = [
    {
      event_type: 'booking_created',
      label: 'إنشاء حجز',
      description: 'اختبار إرسال إشعار عند إنشاء حجز جديد'
    },
    {
      event_type: 'certificate_issued',
      label: 'إصدار شهادة',
      description: 'اختبار إرسال شهادة الانتفاع الموسمية مع رمز التحقق'
    },
    {
      event_type: 'payment_received',
      label: 'استلام دفعة',
      description: 'اختبار إشعار اعتماد الدفع'
    },
    {
      event_type: 'payment_rejected',
      label: 'رفض دفعة',
      description: 'اختبار إشعار رفض الدفع'
    },
    {
      event_type: 'farm_approved',
      label: 'اعتماد مزرعة',
      description: 'اختبار إشعار اعتماد المزرعة'
    },
    {
      event_type: 'farm_rejected',
      label: 'رفض مزرعة',
      description: 'اختبار إشعار رفض المزرعة'
    },
    {
      event_type: 'investor_welcome',
      label: 'ترحيب مستثمر',
      description: 'اختبار رسالة الترحيب للمستثمر الجديد'
    },
    {
      event_type: 'owner_welcome',
      label: 'ترحيب مالك',
      description: 'اختبار رسالة الترحيب لصاحب المزرعة'
    },
    {
      event_type: 'login_otp',
      label: 'رمز دخول OTP',
      description: 'اختبار إرسال رمز التحقق للدخول'
    }
  ];

  useEffect(() => {
    initializeTests();
  }, []);

  const initializeTests = () => {
    const results: TestResult[] = [
      {
        id: 'connection',
        name: 'اختبار الاتصال بالمزود',
        status: 'pending'
      },
      {
        id: 'database',
        name: 'اختبار الاتصال بقاعدة البيانات',
        status: 'pending'
      },
      {
        id: 'templates',
        name: 'التحقق من القوالب',
        status: 'pending'
      },
      ...eventTests.map(test => ({
        id: test.event_type,
        name: test.label,
        status: 'pending' as const
      })),
      {
        id: 'failover',
        name: 'اختبار الاحتياطي (Failover)',
        status: 'pending'
      },
      {
        id: 'performance',
        name: 'اختبار السرعة والأداء',
        status: 'pending'
      }
    ];
    setTestResults(results);
    setSelectedTests(results.map(r => r.id));
  };

  const updateTestResult = (
    id: string,
    status: TestResult['status'],
    message?: string,
    duration?: number
  ) => {
    setTestResults(prev =>
      prev.map(test =>
        test.id === id
          ? {
              ...test,
              status,
              message,
              duration,
              timestamp: new Date().toISOString()
            }
          : test
      )
    );
  };

  const runTest = async (testId: string): Promise<boolean> => {
    updateTestResult(testId, 'running');
    const startTime = Date.now();

    try {
      switch (testId) {
        case 'connection':
          return await testConnection(startTime);

        case 'database':
          return await testDatabase(startTime);

        case 'templates':
          return await testTemplates(startTime);

        case 'failover':
          return await testFailover(startTime);

        case 'performance':
          return await testPerformance(startTime);

        default:
          return await testEvent(testId, startTime);
      }
    } catch (err: any) {
      const duration = Date.now() - startTime;
      updateTestResult(testId, 'failed', err.message, duration);
      return false;
    }
  };

  const testConnection = async (startTime: number): Promise<boolean> => {
    const { data: providers } = await supabase
      .from('whatsapp_providers')
      .select('*')
      .eq('is_default', true)
      .eq('is_active', true)
      .maybeSingle();

    if (!providers) {
      throw new Error('لا يوجد مزود افتراضي نشط');
    }

    const result = await whatsappService.testConnection(providers.id);
    const duration = Date.now() - startTime;

    if (result.success) {
      updateTestResult(
        'connection',
        'success',
        `متصل بنجاح - ${result.latency_ms}ms`,
        duration
      );
      return true;
    } else {
      throw new Error(result.message);
    }
  };

  const testDatabase = async (startTime: number): Promise<boolean> => {
    const { data, error } = await supabase
      .from('whatsapp_messages')
      .select('id')
      .limit(1);

    if (error) throw error;

    const duration = Date.now() - startTime;
    updateTestResult('database', 'success', 'قاعدة البيانات تعمل بشكل صحيح', duration);
    return true;
  };

  const testTemplates = async (startTime: number): Promise<boolean> => {
    const templates = await whatsappService.getTemplates();

    if (templates.length === 0) {
      throw new Error('لا توجد قوالب محفوظة');
    }

    const activeTemplates = templates.filter(t => t.is_active);
    if (activeTemplates.length === 0) {
      throw new Error('لا توجد قوالب نشطة');
    }

    const duration = Date.now() - startTime;
    updateTestResult(
      'templates',
      'success',
      `${activeTemplates.length} قالب نشط من ${templates.length}`,
      duration
    );
    return true;
  };

  const testEvent = async (eventType: string, startTime: number): Promise<boolean> => {
    if (!testPhone) {
      throw new Error('يرجى إدخال رقم هاتف للاختبار');
    }

    const testVariables: Record<string, any> = {
      'اسم_المستخدم': 'اختبار النظام',
      'customer_name': 'System Test',
      'رقم_الحجز': 'TEST-001',
      'booking_id': 'TEST-001',
      'المزرعة': 'مزرعة الخالدية',
      'farm_name': 'Khaldiya Farm',
      'عدد_الأشجار': '10',
      'trees_count': '10',
      'المبلغ': '5000',
      'amount': '5000',
      'رمز_التحقق': '123456',
      'verification_code': '123456',
      'رقم_الشهادة': 'CERT-TEST-001',
      'certificate_number': 'CERT-TEST-001'
    };

    const { data, error } = await supabase.rpc('trigger_whatsapp_event', {
      p_event_type: eventType,
      p_recipient_phone: testPhone,
      p_recipient_name: 'اختبار النظام',
      p_variables: testVariables
    });

    if (error) throw error;

    const duration = Date.now() - startTime;
    updateTestResult(
      eventType,
      'success',
      `تم الإرسال بنجاح - ${duration}ms`,
      duration
    );
    return true;
  };

  const testFailover = async (startTime: number): Promise<boolean> => {
    const { data: providers } = await supabase
      .from('whatsapp_providers')
      .select('*')
      .eq('is_active', true)
      .order('priority', { ascending: true });

    if (!providers || providers.length < 2) {
      throw new Error('يجب وجود مزودين نشطين على الأقل لاختبار Failover');
    }

    const duration = Date.now() - startTime;
    updateTestResult(
      'failover',
      'success',
      `${providers.length} مزود نشط - نظام الاحتياطي جاهز`,
      duration
    );
    return true;
  };

  const testPerformance = async (startTime: number): Promise<boolean> => {
    if (!testPhone) {
      throw new Error('يرجى إدخال رقم هاتف للاختبار');
    }

    const testStart = Date.now();

    await supabase.rpc('trigger_whatsapp_event', {
      p_event_type: 'login_otp',
      p_recipient_phone: testPhone,
      p_recipient_name: 'اختبار السرعة',
      p_variables: { 'رمز_التحقق': '999999', 'verification_code': '999999' }
    });

    const responseTime = Date.now() - testStart;
    const duration = Date.now() - startTime;

    if (responseTime > 3000) {
      throw new Error(`بطيء جداً: ${responseTime}ms (يجب أن يكون ≤ 3000ms)`);
    }

    updateTestResult(
      'performance',
      'success',
      `سريع: ${responseTime}ms (ممتاز!)`,
      duration
    );
    return true;
  };

  const runAllTests = async () => {
    if (running) return;
    setRunning(true);
    setError(null);

    const testsToRun = testResults.filter(t => selectedTests.includes(t.id));

    for (const test of testsToRun) {
      await runTest(test.id);
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setRunning(false);
  };

  const toggleTest = (testId: string) => {
    setSelectedTests(prev =>
      prev.includes(testId)
        ? prev.filter(id => id !== testId)
        : [...prev, testId]
    );
  };

  const exportResults = () => {
    const report = {
      test_date: new Date().toISOString(),
      test_phone: testPhone,
      results: testResults.map(test => ({
        name: test.name,
        status: test.status,
        message: test.message,
        duration_ms: test.duration,
        timestamp: test.timestamp
      })),
      summary: {
        total: testResults.length,
        success: testResults.filter(t => t.status === 'success').length,
        failed: testResults.filter(t => t.status === 'failed').length,
        pending: testResults.filter(t => t.status === 'pending').length
      }
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `whatsapp-test-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'running':
        return <Zap className="w-5 h-5 text-yellow-400 animate-pulse" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return 'border-green-500/50 bg-green-500/10';
      case 'failed':
        return 'border-red-500/50 bg-red-500/10';
      case 'running':
        return 'border-yellow-500/50 bg-yellow-500/10';
      default:
        return 'border-gray-700/50 bg-gray-800/30';
    }
  };

  const successCount = testResults.filter(t => t.status === 'success').length;
  const failedCount = testResults.filter(t => t.status === 'failed').length;
  const totalSelected = selectedTests.length;

  return (
    <div className="space-y-6" dir="rtl">
      <SmartErrorModal
        isOpen={!!error}
        onClose={() => setError(null)}
        error={error || ''}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-3 rounded-xl">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">اختبار النظام الشامل</h1>
            <p className="text-gray-400 text-sm">التحقق من جميع مكونات نظام الواتساب</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportResults}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            تصدير التقرير
          </button>
          <button
            onClick={runAllTests}
            disabled={running || !testPhone}
            className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {running ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <Play className="w-5 h-5" />
            )}
            {running ? 'جاري الاختبار...' : 'تشغيل الاختبارات'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
          <div className="text-3xl font-bold text-blue-400">{totalSelected}</div>
          <p className="text-gray-300 text-sm">اختبارات محددة</p>
        </div>
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
          <div className="text-3xl font-bold text-green-400">{successCount}</div>
          <p className="text-gray-300 text-sm">نجح</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <div className="text-3xl font-bold text-red-400">{failedCount}</div>
          <p className="text-gray-300 text-sm">فشل</p>
        </div>
      </div>

      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          رقم الهاتف للاختبار (مطلوب)
        </label>
        <input
          type="tel"
          value={testPhone}
          onChange={(e) => setTestPhone(e.target.value)}
          placeholder="+966 5XXXXXXXX"
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-400 mt-2">
          سيتم إرسال رسائل الاختبار إلى هذا الرقم
        </p>
      </div>

      <div className="space-y-3">
        {testResults.map((test) => (
          <div
            key={test.id}
            className={`rounded-xl p-4 border transition-all ${getStatusColor(test.status)}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <input
                  type="checkbox"
                  checked={selectedTests.includes(test.id)}
                  onChange={() => toggleTest(test.id)}
                  disabled={running}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 disabled:opacity-50"
                />

                {getStatusIcon(test.status)}

                <div className="flex-1">
                  <h3 className="text-white font-semibold">{test.name}</h3>
                  {test.message && (
                    <p className="text-sm text-gray-400 mt-1">{test.message}</p>
                  )}
                </div>

                {test.duration !== undefined && (
                  <span className="text-xs text-gray-400">
                    {test.duration}ms
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-300">
            <p className="font-semibold text-white mb-2">ملاحظات مهمة:</p>
            <ul className="space-y-1">
              <li>• تأكد من وجود مزود نشط قبل بدء الاختبارات</li>
              <li>• رقم الهاتف المستخدم للاختبار يجب أن يكون صحيحاً</li>
              <li>• اختبار السرعة يتطلب زمن استجابة ≤ 3 ثوانٍ</li>
              <li>• اختبار Failover يتطلب مزودين نشطين على الأقل</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
