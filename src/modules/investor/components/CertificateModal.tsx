import { X, Download, Share2, Printer } from 'lucide-react';
import { brandColors } from '../../finance/styles/brandColors';
import { OwnershipCertificate } from './OwnershipCertificate';

interface CertificateModalProps {
  certificate: any;
  isOpen: boolean;
  onClose: () => void;
}

export function CertificateModal({ certificate, isOpen, onClose }: CertificateModalProps) {
  if (!isOpen) return null;

  const handleDownload = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `شهادة تملك - ${certificate.certificate_code}`,
        text: `شهادة تملك ${certificate.reserved_trees} شجرة في ${certificate.farm_name}`,
        url: window.location.href
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-3xl"
        style={{ background: '#fdfbf7' }}
      >
        {/* شريط الأدوات */}
        <div
          className="sticky top-0 z-10 flex items-center justify-between p-4 border-b"
          style={{
            background: 'linear-gradient(135deg, #fdfbf7 0%, #f8f5ed 100%)',
            borderColor: 'rgba(212,175,55,0.2)'
          }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownload}
              className="p-3 rounded-xl transition-all hover:scale-105"
              style={{
                background: brandColors.primary.gold,
                color: 'white'
              }}
              title="طباعة / تحميل PDF"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={handleShare}
              className="p-3 rounded-xl transition-all hover:scale-105"
              style={{
                background: 'rgba(212,175,55,0.1)',
                color: brandColors.primary.gold
              }}
              title="مشاركة"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <button
              onClick={() => window.print()}
              className="p-3 rounded-xl transition-all hover:scale-105"
              style={{
                background: 'rgba(212,175,55,0.1)',
                color: brandColors.primary.gold
              }}
              title="طباعة"
            >
              <Printer className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-3 rounded-xl transition-all hover:scale-105 hover:bg-red-50"
            style={{ color: brandColors.text.secondary }}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* محتوى الشهادة */}
        <div className="p-6 md:p-12">
          <OwnershipCertificate certificate={certificate} />
        </div>
      </div>

      {/* CSS للطباعة */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .fixed.inset-0 {
            position: static !important;
          }
          .fixed.inset-0 * {
            visibility: visible;
          }
          .fixed.inset-0 {
            background: white !important;
          }
          .sticky.top-0 {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
