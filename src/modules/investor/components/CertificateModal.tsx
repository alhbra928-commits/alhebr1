import { X, Download, Share2, Printer, Award, CheckCircle, Info, Sparkles } from 'lucide-react';
import { brandColors } from '../../finance/styles/brandColors';
import { OwnershipCertificate } from './OwnershipCertificate';
import { useState, useEffect } from 'react';

interface CertificateModalProps {
  certificate: any;
  isOpen: boolean;
  onClose: () => void;
}

export function CertificateModal({ certificate, isOpen, onClose }: CertificateModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setIsVisible(true), 50);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDownload = () => {
    setIsPrinting(true);
    // الانتظار حتى يتم تحديث DOM قبل الطباعة
    setTimeout(() => {
      window.print();
      setTimeout(() => setIsPrinting(false), 1000);
    }, 500);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `شهادة انتفاع - ${certificate.certificate_code}`,
        text: `شهادة انتفاع موسمية - ${certificate.reserved_trees} شجرة في ${certificate.farm_name}`,
        url: window.location.href
      });
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <>
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(50px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }

        .cert-modal-backdrop {
          animation: fadeIn 0.3s ease-out;
        }

        .cert-modal-content {
          animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .cert-action-btn {
          position: relative;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .cert-action-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          transition: left 0.5s;
        }

        .cert-action-btn:hover::before {
          left: 100%;
        }

        .cert-action-btn:hover {
          transform: translateY(-3px) scale(1.05);
        }

        .cert-action-btn:active {
          transform: translateY(0) scale(0.98);
        }

        .shimmer-bg {
          background: linear-gradient(90deg,
            rgba(212,175,55,0.05) 0%,
            rgba(212,175,55,0.15) 50%,
            rgba(212,175,55,0.05) 100%);
          background-size: 1000px 100%;
          animation: shimmer 3s infinite linear;
        }

        .float-animation {
          animation: float 3s ease-in-out infinite;
        }

        .pulse-ring {
          animation: pulse-ring 2s ease-in-out infinite;
        }

        .glass-effect {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }

        @media print {
          .cert-print-hide {
            display: none !important;
          }
        }

        @media (max-width: 640px) {
          .cert-modal-content {
            max-height: 100vh !important;
            border-radius: 0 !important;
          }
        }
      `}</style>

      <div
        className={`fixed inset-0 z-50 cert-modal-backdrop cert-print-hide ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        style={{
          background: 'linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(34,34,34,0.8) 100%)',
          backdropFilter: 'blur(10px)',
          transition: 'opacity 0.3s ease-out'
        }}
        onClick={handleClose}
      >
        <div className="flex items-center justify-center min-h-screen p-2 sm:p-4">
          <div
            className={`cert-modal-content relative w-full max-w-6xl ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            style={{
              maxHeight: '95vh',
              transition: 'opacity 0.3s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header الفاخر */}
            <div
              className="glass-effect rounded-t-3xl sm:rounded-t-[2rem] p-4 sm:p-6 border-b-2"
              style={{
                borderColor: 'rgba(212,175,55,0.3)',
                boxShadow: '0 10px 40px rgba(212,175,55,0.2)'
              }}
            >
              {/* العنوان الرئيسي */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div
                    className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center pulse-ring"
                    style={{
                      background: `linear-gradient(135deg, ${brandColors.primary.gold}, #b8860b)`,
                      boxShadow: '0 8px 25px rgba(212,175,55,0.4)'
                    }}
                  >
                    <Award className="w-7 h-7 sm:w-8 sm:h-8 text-white" strokeWidth={2.5} />
                    <div
                      className="absolute inset-0 rounded-2xl"
                      style={{
                        background: 'linear-gradient(135deg, transparent, rgba(255,255,255,0.2))'
                      }}
                    />
                  </div>
                  <div>
                    <h2
                      className="text-xl sm:text-2xl md:text-3xl font-bold"
                      style={{
                        color: brandColors.primary.gold,
                        textShadow: '0 2px 10px rgba(212,175,55,0.3)'
                      }}
                    >
                      شهادة الانتفاع الموسمية
                    </h2>
                    <p className="text-xs sm:text-sm" style={{ color: brandColors.text.secondary }}>
                      منصة النخيل والزيتون للاستثمار الزراعي
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleClose}
                  className="cert-action-btn p-2 sm:p-3 rounded-xl"
                  style={{
                    background: 'rgba(239,68,68,0.1)',
                    color: '#ef4444',
                    border: '2px solid rgba(239,68,68,0.2)'
                  }}
                  title="إغلاق"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>

              {/* معلومات سريعة */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <div
                  className="flex items-center gap-3 p-3 rounded-xl shimmer-bg"
                  style={{
                    border: '1px solid rgba(212,175,55,0.2)'
                  }}
                >
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs" style={{ color: brandColors.text.secondary }}>الحالة</p>
                    <p className="text-sm font-bold text-green-600 truncate">معتمد ومصادق</p>
                  </div>
                </div>

                <div
                  className="flex items-center gap-3 p-3 rounded-xl shimmer-bg"
                  style={{
                    border: '1px solid rgba(212,175,55,0.2)'
                  }}
                >
                  <Sparkles className="w-5 h-5 flex-shrink-0" style={{ color: brandColors.primary.gold }} />
                  <div className="min-w-0">
                    <p className="text-xs" style={{ color: brandColors.text.secondary }}>عدد الأشجار</p>
                    <p className="text-sm font-bold truncate" style={{ color: brandColors.primary.gold }}>
                      {certificate.reserved_trees?.toLocaleString('ar-SA')} شجرة
                    </p>
                  </div>
                </div>

                <div
                  className="flex items-center gap-3 p-3 rounded-xl shimmer-bg"
                  style={{
                    border: '1px solid rgba(212,175,55,0.2)'
                  }}
                >
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs" style={{ color: brandColors.text.secondary }}>رقم الشهادة</p>
                    <p className="text-sm font-bold text-blue-600 truncate">
                      {certificate.certificate_code}
                    </p>
                  </div>
                </div>
              </div>

              {/* أزرار الإجراءات */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <button
                  onClick={handleDownload}
                  disabled={isPrinting}
                  className="cert-action-btn flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-xl font-bold text-sm sm:text-base disabled:opacity-50"
                  style={{
                    background: `linear-gradient(135deg, ${brandColors.primary.gold}, #b8860b)`,
                    color: 'white',
                    boxShadow: '0 4px 15px rgba(212,175,55,0.4)',
                    border: '2px solid rgba(255,255,255,0.3)'
                  }}
                >
                  {isPrinting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>جاري التحضير...</span>
                    </>
                  ) : (
                    <>
                      <Printer className="w-5 h-5" />
                      <span>طباعة الشهادة</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleDownload}
                  className="cert-action-btn flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-xl font-bold text-sm sm:text-base"
                  style={{
                    background: 'rgba(212,175,55,0.1)',
                    color: brandColors.primary.gold,
                    border: '2px solid rgba(212,175,55,0.3)'
                  }}
                >
                  <Download className="w-5 h-5" />
                  <span>تحميل PDF</span>
                </button>

                {navigator.share && (
                  <button
                    onClick={handleShare}
                    className="cert-action-btn flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-xl font-bold text-sm sm:text-base"
                    style={{
                      background: 'rgba(59,130,246,0.1)',
                      color: '#3b82f6',
                      border: '2px solid rgba(59,130,246,0.3)'
                    }}
                  >
                    <Share2 className="w-5 h-5" />
                    <span className="hidden sm:inline">مشاركة</span>
                  </button>
                )}
              </div>
            </div>

            {/* محتوى الشهادة */}
            <div
              className="overflow-y-auto rounded-b-3xl sm:rounded-b-[2rem]"
              style={{
                maxHeight: 'calc(95vh - 280px)',
                background: 'linear-gradient(to bottom, #fdfbf7, #f8f5ed)',
                boxShadow: '0 -5px 30px rgba(212,175,55,0.1)'
              }}
            >
              <div className="p-4 sm:p-6 md:p-12">
                <OwnershipCertificate certificate={certificate} />
              </div>

              {/* ملاحظة في الأسفل */}
              <div
                className="p-4 sm:p-6 text-center text-xs sm:text-sm border-t"
                style={{
                  background: 'rgba(212,175,55,0.05)',
                  color: brandColors.text.secondary,
                  borderColor: 'rgba(212,175,55,0.2)'
                }}
              >
                <p className="flex items-center justify-center gap-2 flex-wrap">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>هذه الشهادة معتمدة ومصادق عليها رسمياً من منصة النخيل والزيتون</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS للطباعة */}
      <style>{`
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }

          /* إخفاء كل شيء ما عدا الشهادة */
          body * {
            visibility: hidden !important;
          }

          /* إظهار الشهادة وكل محتوياتها */
          #certificate-print,
          #certificate-print * {
            visibility: visible !important;
          }

          /* وضع الشهادة في أعلى الصفحة */
          #certificate-print {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            background: white !important;
            padding: 20px !important;
            margin: 0 !important;
          }

          /* إخفاء العناصر غير الضرورية بشكل نهائي */
          .cert-print-hide {
            display: none !important;
            visibility: hidden !important;
          }
        }
      `}</style>
    </>
  );
}
