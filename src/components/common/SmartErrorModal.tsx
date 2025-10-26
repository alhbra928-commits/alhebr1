import React, { useState } from 'react';
import { AlertCircle, Copy, CheckCircle, X, FileText, Code, Database, Wifi, Bug } from 'lucide-react';

interface ErrorDetail {
  timestamp: Date;
  userAction?: string;
  errorStack?: string;
  apiEndpoint?: string;
  statusCode?: number;
  requestData?: any;
  responseData?: any;
  supabaseError?: any;
}

interface SmartErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  error?: Error | any;
  errorDetails?: ErrorDetail;
  errorType?: 'validation' | 'database' | 'network' | 'constraint' | 'rls' | 'general';
  missingFields?: { section: string; fields: string[] }[];
  suggestions?: string[];
}

export const SmartErrorModal: React.FC<SmartErrorModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  error,
  errorDetails,
  errorType = 'general',
  missingFields = [],
  suggestions = []
}) => {
  const [copied, setCopied] = useState(false);
  const [showTechnical, setShowTechnical] = useState(false);
  const [showRawData, setShowRawData] = useState(false);

  if (!isOpen) return null;

  const parseSupabaseError = (err: any) => {
    const details: any = {};

    if (err?.code) details.code = err.code;
    if (err?.message) details.message = err.message;
    if (err?.details) details.details = err.details;
    if (err?.hint) details.hint = err.hint;

    if (err?.response) {
      details.status = err.response.status;
      details.statusText = err.response.statusText;
    }

    return details;
  };

  const detectErrorType = () => {
    if (!error && !errorDetails) return errorType;

    const errorMsg = error?.message?.toLowerCase() || '';
    const errorCode = error?.code || errorDetails?.supabaseError?.code || '';

    if (errorMsg.includes('constraint') || errorCode === '23505' || errorCode === '23514') {
      return 'constraint';
    }
    if (errorMsg.includes('row level security') || errorMsg.includes('rls') || errorCode === '42501') {
      return 'rls';
    }
    if (errorMsg.includes('database') || errorCode.startsWith('2') || errorCode.startsWith('4')) {
      return 'database';
    }
    if (errorMsg.includes('network') || errorMsg.includes('fetch')) {
      return 'network';
    }
    if (errorMsg.includes('validation') || errorMsg.includes('required')) {
      return 'validation';
    }

    return errorType;
  };

  const actualErrorType = detectErrorType();

  const getStyles = () => {
    switch (actualErrorType) {
      case 'validation':
        return {
          icon: <FileText className="h-12 w-12 text-white" />,
          headerBg: 'bg-gradient-to-r from-amber-500 to-amber-600',
          contentBg: 'bg-amber-50 border-amber-200',
          buttonBg: 'bg-gradient-to-r from-amber-500 to-amber-600',
          iconBg: 'bg-amber-100 text-amber-600'
        };
      case 'database':
        return {
          icon: <Database className="h-12 w-12 text-white" />,
          headerBg: 'bg-gradient-to-r from-red-500 to-red-600',
          contentBg: 'bg-red-50 border-red-200',
          buttonBg: 'bg-gradient-to-r from-red-500 to-red-600',
          iconBg: 'bg-red-100 text-red-600'
        };
      case 'constraint':
        return {
          icon: <AlertCircle className="h-12 w-12 text-white" />,
          headerBg: 'bg-gradient-to-r from-purple-500 to-purple-600',
          contentBg: 'bg-purple-50 border-purple-200',
          buttonBg: 'bg-gradient-to-r from-purple-500 to-purple-600',
          iconBg: 'bg-purple-100 text-purple-600'
        };
      case 'rls':
        return {
          icon: <AlertCircle className="h-12 w-12 text-white" />,
          headerBg: 'bg-gradient-to-r from-orange-500 to-orange-600',
          contentBg: 'bg-orange-50 border-orange-200',
          buttonBg: 'bg-gradient-to-r from-orange-500 to-orange-600',
          iconBg: 'bg-orange-100 text-orange-600'
        };
      case 'network':
        return {
          icon: <Wifi className="h-12 w-12 text-white" />,
          headerBg: 'bg-gradient-to-r from-blue-500 to-blue-600',
          contentBg: 'bg-blue-50 border-blue-200',
          buttonBg: 'bg-gradient-to-r from-blue-500 to-blue-600',
          iconBg: 'bg-blue-100 text-blue-600'
        };
      default:
        return {
          icon: <Bug className="h-12 w-12 text-white" />,
          headerBg: 'bg-gradient-to-r from-gray-500 to-gray-600',
          contentBg: 'bg-gray-50 border-gray-200',
          buttonBg: 'bg-gradient-to-r from-gray-500 to-gray-600',
          iconBg: 'bg-gray-100 text-gray-600'
        };
    }
  };

  const styles = getStyles();

  const formatFullReport = () => {
    const timestamp = errorDetails?.timestamp || new Date();
    const supabaseError = error ? parseSupabaseError(error) : errorDetails?.supabaseError;

    let report = `╔═══════════════════════════════════════════════════════════════════════════════╗
║                                                                               ║
║                    📋 تقرير تفصيلي كامل عن المشكلة                           ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 معلومات أساسية
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🏷️  العنوان: ${title}
⏰ التاريخ والوقت: ${timestamp.toLocaleString('ar-SA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })}
🔖 نوع المشكلة: ${actualErrorType}
${errorDetails?.userAction ? `👤 الإجراء الذي قام به المستخدم: ${errorDetails.userAction}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 وصف المشكلة
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${message}

`;

    if (missingFields.length > 0) {
      report += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  الحقول الناقصة
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

`;
      missingFields.forEach((section) => {
        if (section.fields.length > 0) {
          report += `📂 ${section.section}:\n`;
          section.fields.forEach((field) => {
            report += `   • ${field}\n`;
          });
          report += '\n';
        }
      });
    }

    if (suggestions.length > 0) {
      report += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 الحلول المقترحة
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

`;
      suggestions.forEach((suggestion, idx) => {
        report += `${idx + 1}. ${suggestion}\n`;
      });
      report += '\n';
    }

    if (supabaseError || error) {
      report += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔧 التفاصيل التقنية
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

`;

      if (supabaseError?.code) {
        report += `📍 Supabase Error Code: ${supabaseError.code}\n`;
      }

      if (supabaseError?.message) {
        report += `📄 Error Message: ${supabaseError.message}\n`;
      }

      if (supabaseError?.details) {
        report += `📋 Details: ${supabaseError.details}\n`;
      }

      if (supabaseError?.hint) {
        report += `💭 Hint: ${supabaseError.hint}\n`;
      }

      if (errorDetails?.statusCode) {
        report += `🔢 HTTP Status Code: ${errorDetails.statusCode}\n`;
      }

      if (errorDetails?.apiEndpoint) {
        report += `🌐 API Endpoint: ${errorDetails.apiEndpoint}\n`;
      }

      if (error?.stack || errorDetails?.errorStack) {
        report += `\n📚 Stack Trace:\n${error?.stack || errorDetails?.errorStack}\n`;
      }

      report += '\n';
    }

    if (errorDetails?.requestData) {
      report += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📤 بيانات الطلب (Request Data)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${JSON.stringify(errorDetails.requestData, null, 2)}

`;
    }

    if (errorDetails?.responseData) {
      report += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📥 بيانات الاستجابة (Response Data)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${JSON.stringify(errorDetails.responseData, null, 2)}

`;
    }

    report += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌐 معلومات البيئة
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🖥️  User Agent: ${navigator.userAgent}
📱 Platform: ${navigator.platform}
🌍 Language: ${navigator.language}
🔗 URL: ${window.location.href}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 نصيحة: انسخ هذا التقرير بالكامل وأرسله للدعم الفني للحصول على مساعدة دقيقة وسريعة

╚═══════════════════════════════════════════════════════════════════════════════╝`;

    return report;
  };

  const handleCopy = async () => {
    const report = formatFullReport();
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const supabaseError = error ? parseSupabaseError(error) : errorDetails?.supabaseError;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-slideUp"
      >
        <div className={`${styles.headerBg} p-6 text-white relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative flex items-start gap-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              {styles.icon}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">{title}</h2>
              <p className="text-white/90 text-sm">
                نظام الإبلاغ الذكي عن الأخطاء - جميع التفاصيل متوفرة للنسخ
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto" dir="rtl">
          <div className={`${styles.contentBg} border-2 rounded-xl p-4 mb-6`}>
            <p className="text-gray-800 text-lg leading-relaxed whitespace-pre-line">
              {message}
            </p>
          </div>

          {missingFields.length > 0 && (
            <div className="space-y-4 mb-6">
              <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                <FileText className="h-5 w-5 text-amber-500" />
                الحقول الناقصة:
              </h3>
              {missingFields.map((section, idx) => (
                section.fields.length > 0 && (
                  <div
                    key={idx}
                    className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-4"
                  >
                    <h4 className="font-bold text-amber-800 mb-3 text-lg">
                      📋 {section.section}
                    </h4>
                    <ul className="space-y-2">
                      {section.fields.map((field, fieldIdx) => (
                        <li
                          key={fieldIdx}
                          className="flex items-center gap-2 text-gray-700 bg-white/60 rounded-lg px-3 py-2"
                        >
                          <span className="text-amber-500">▸</span>
                          <span>{field}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              ))}
            </div>
          )}

          {suggestions.length > 0 && (
            <div className="mb-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
              <h3 className="font-bold text-lg text-blue-800 mb-3 flex items-center gap-2">
                💡 الحلول المقترحة:
              </h3>
              <ol className="space-y-2">
                {suggestions.map((suggestion, idx) => (
                  <li key={idx} className="flex gap-3 text-gray-700">
                    <span className="font-bold text-blue-600">{idx + 1}.</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {(supabaseError || error) && (
            <div className="mb-6">
              <button
                onClick={() => setShowTechnical(!showTechnical)}
                className="w-full bg-gray-100 hover:bg-gray-200 rounded-xl p-4 transition-colors flex items-center justify-between"
              >
                <span className="font-semibold text-gray-800 flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  التفاصيل التقنية (للمطورين)
                </span>
                <span className="text-gray-600">
                  {showTechnical ? '▼' : '◀'}
                </span>
              </button>

              {showTechnical && (
                <div className="mt-3 space-y-3">
                  {supabaseError?.code && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3">
                      <div className="font-mono text-sm">
                        <span className="font-bold text-red-800">Error Code:</span>{' '}
                        <span className="text-red-600">{supabaseError.code}</span>
                      </div>
                    </div>
                  )}

                  {supabaseError?.message && (
                    <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-3">
                      <div className="font-mono text-sm">
                        <span className="font-bold text-gray-800">Message:</span>{' '}
                        <span className="text-gray-600">{supabaseError.message}</span>
                      </div>
                    </div>
                  )}

                  {(error?.stack || errorDetails?.errorStack) && (
                    <div className="bg-gray-900 text-green-400 rounded-xl p-4 font-mono text-xs overflow-x-auto">
                      <pre className="whitespace-pre-wrap break-words">
                        {error?.stack || errorDetails?.errorStack}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {(errorDetails?.requestData || errorDetails?.responseData) && (
            <div className="mb-6">
              <button
                onClick={() => setShowRawData(!showRawData)}
                className="w-full bg-purple-100 hover:bg-purple-200 rounded-xl p-4 transition-colors flex items-center justify-between"
              >
                <span className="font-semibold text-purple-800 flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  البيانات الخام (Request/Response)
                </span>
                <span className="text-purple-600">
                  {showRawData ? '▼' : '◀'}
                </span>
              </button>

              {showRawData && (
                <div className="mt-3 space-y-3">
                  {errorDetails?.requestData && (
                    <div>
                      <div className="text-sm font-bold text-purple-800 mb-2">📤 Request Data:</div>
                      <div className="bg-purple-900 text-purple-200 rounded-xl p-4 font-mono text-xs overflow-x-auto">
                        <pre>{JSON.stringify(errorDetails.requestData, null, 2)}</pre>
                      </div>
                    </div>
                  )}

                  {errorDetails?.responseData && (
                    <div>
                      <div className="text-sm font-bold text-purple-800 mb-2">📥 Response Data:</div>
                      <div className="bg-purple-900 text-purple-200 rounded-xl p-4 font-mono text-xs overflow-x-auto">
                        <pre>{JSON.stringify(errorDetails.responseData, null, 2)}</pre>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="bg-gray-50 rounded-xl p-3 text-center text-sm text-gray-600">
            ⏰ {(errorDetails?.timestamp || new Date()).toLocaleString('ar-SA', {
              dateStyle: 'full',
              timeStyle: 'medium'
            })}
          </div>
        </div>

        <div className="border-t-2 border-gray-100 p-6 bg-gray-50">
          <div className="flex gap-3">
            <button
              onClick={handleCopy}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all transform active:scale-95 ${
                copied
                  ? 'bg-green-500 text-white'
                  : `${styles.buttonBg} text-white hover:shadow-lg`
              }`}
            >
              {copied ? (
                <>
                  <CheckCircle className="h-5 w-5" />
                  تم النسخ بنجاح!
                </>
              ) : (
                <>
                  <Copy className="h-5 w-5" />
                  نسخ التقرير الكامل
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-bold transition-colors"
            >
              إغلاق
            </button>
          </div>

          <p className="text-center text-sm text-gray-600 mt-4">
            💡 هذا التقرير يحتوي على جميع التفاصيل اللازمة للدعم الفني
          </p>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};
