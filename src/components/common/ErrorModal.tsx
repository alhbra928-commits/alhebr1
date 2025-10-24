import React, { useState } from 'react';
import { AlertCircle, Copy, CheckCircle, X, FileText } from 'lucide-react';

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  technicalDetails?: string;
  errorType?: 'validation' | 'database' | 'network' | 'general';
  missingFields?: { section: string; fields: string[] }[];
}

export const ErrorModal: React.FC<ErrorModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  technicalDetails,
  errorType = 'general',
  missingFields = []
}) => {
  const [copied, setCopied] = useState(false);
  const [showTechnical, setShowTechnical] = useState(false);

  if (!isOpen) return null;

  const getStyles = () => {
    switch (errorType) {
      case 'validation':
        return {
          icon: <AlertCircle className="h-12 w-12 text-white" />,
          headerBg: 'bg-gradient-to-r from-amber-500 to-amber-600',
          contentBg: 'bg-amber-50 border-amber-200',
          buttonBg: 'bg-gradient-to-r from-amber-500 to-amber-600'
        };
      case 'database':
        return {
          icon: <AlertCircle className="h-12 w-12 text-white" />,
          headerBg: 'bg-gradient-to-r from-red-500 to-red-600',
          contentBg: 'bg-red-50 border-red-200',
          buttonBg: 'bg-gradient-to-r from-red-500 to-red-600'
        };
      case 'network':
        return {
          icon: <AlertCircle className="h-12 w-12 text-white" />,
          headerBg: 'bg-gradient-to-r from-blue-500 to-blue-600',
          contentBg: 'bg-blue-50 border-blue-200',
          buttonBg: 'bg-gradient-to-r from-blue-500 to-blue-600'
        };
      default:
        return {
          icon: <AlertCircle className="h-12 w-12 text-white" />,
          headerBg: 'bg-gradient-to-r from-gray-500 to-gray-600',
          contentBg: 'bg-gray-50 border-gray-200',
          buttonBg: 'bg-gradient-to-r from-gray-500 to-gray-600'
        };
    }
  };

  const styles = getStyles();

  const formatErrorReport = () => {
    let report = `═══════════════════════════════════════════════════
📋 تقرير تفصيلي عن المشكلة
═══════════════════════════════════════════════════

📌 العنوان: ${title}

📝 الوصف:
${message}

`;

    if (missingFields.length > 0) {
      report += `⚠️ الحقول الناقصة:\n\n`;
      missingFields.forEach((section) => {
        if (section.fields.length > 0) {
          report += `📂 ${section.section}:\n`;
          section.fields.forEach((field) => {
            report += `   ${field}\n`;
          });
          report += '\n';
        }
      });
    }

    if (technicalDetails) {
      report += `🔧 التفاصيل التقنية:\n${technicalDetails}\n\n`;
    }

    report += `⏰ وقت الخطأ: ${new Date().toLocaleString('ar-SA', {
      dateStyle: 'full',
      timeStyle: 'medium'
    })}\n`;

    report += `\n═══════════════════════════════════════════════════
💡 نصيحة: انسخ هذا التقرير وأرسله للدعم الفني
═══════════════════════════════════════════════════`;

    return report;
  };

  const handleCopy = async () => {
    const report = formatErrorReport();
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-slideUp"
        style={{
          animation: 'slideUp 0.3s ease-out'
        }}
      >
        {/* Header */}
        <div className={`${styles.headerBg} p-6 text-white relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative flex items-start gap-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              {styles.icon}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">{title}</h2>
              <p className="text-white/90 text-sm">
                يرجى مراجعة التفاصيل أدناه لحل المشكلة
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

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto" dir="rtl">
          {/* Main Message */}
          <div className={`${styles.contentBg} border-2 rounded-xl p-4 mb-6`}>
            <p className="text-gray-800 text-lg leading-relaxed whitespace-pre-line">
              {message}
            </p>
          </div>

          {/* Missing Fields */}
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

          {/* Technical Details Toggle */}
          {technicalDetails && (
            <div className="mb-6">
              <button
                onClick={() => setShowTechnical(!showTechnical)}
                className="w-full bg-gray-100 hover:bg-gray-200 rounded-xl p-4 transition-colors flex items-center justify-between"
              >
                <span className="font-semibold text-gray-800">
                  🔧 التفاصيل التقنية (للمطورين)
                </span>
                <span className="text-gray-600">
                  {showTechnical ? '▼' : '◀'}
                </span>
              </button>

              {showTechnical && (
                <div className="mt-3 bg-gray-900 text-green-400 rounded-xl p-4 font-mono text-sm overflow-x-auto">
                  <pre className="whitespace-pre-wrap break-words">
                    {technicalDetails}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Time Stamp */}
          <div className="bg-gray-50 rounded-xl p-3 text-center text-sm text-gray-600">
            ⏰ وقت الخطأ: {new Date().toLocaleString('ar-SA', {
              dateStyle: 'full',
              timeStyle: 'medium'
            })}
          </div>
        </div>

        {/* Footer */}
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
            💡 انسخ التقرير وأرسله للدعم الفني للحصول على مساعدة أسرع
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
