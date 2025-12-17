import { useState } from 'react';
import { Shield, Search, CheckCircle, XCircle, Award, ArrowRight, Loader } from 'lucide-react';
import { brandColors, brandGradients } from '../../finance/styles/brandColors';
import { CertificateVerificationService, VerifiedCertificate } from '../services/certificateVerificationService';
import { OwnershipCertificate } from '../../investor/components/OwnershipCertificate';
import { SmartActivityTicker } from '../../../components/common/SmartActivityTicker';

interface CertificateVerificationPageProps {
  onBack: () => void;
}

export function CertificateVerificationPage({ onBack }: CertificateVerificationPageProps) {
  const [certificateCode, setCertificateCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifiedCertificate | null>(null);
  const [searched, setSearched] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);

  const handleVerify = async () => {
    if (!certificateCode.trim()) {
      alert('⚠️ الرجاء إدخال رقم الشهادة');
      return;
    }

    try {
      setLoading(true);
      setSearched(false);
      const certificate = await CertificateVerificationService.verifyCertificate(certificateCode);
      setResult(certificate);
      setSearched(true);
    } catch (error) {
      console.error('Error:', error);
      setResult(null);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleVerify();
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #fdfbf7 0%, #f8f5ed 100%)' }}>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <button
          onClick={onBack}
          className="flex items-center gap-2 mb-8 px-4 py-2 rounded-xl transition-all hover:scale-105"
          style={{
            background: 'rgba(212,175,55,0.1)',
            color: brandColors.primary.gold
          }}
        >
          <ArrowRight className="w-5 h-5" />
          <span className="font-bold">العودة للرئيسية</span>
        </button>

        <div className="text-center mb-12">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{
              background: brandGradients.gold,
              boxShadow: '0 8px 30px rgba(212,175,55,0.4)'
            }}
          >
            <Shield className="w-12 h-12 text-white" />
          </div>

          <h1
            className="text-4xl md:text-5xl font-black mb-4"
            style={{ color: brandColors.primary.gold }}
          >
            التحقق من صحة الشهادة
          </h1>
          <p className="text-lg" style={{ color: brandColors.text.secondary }}>
            أدخل رقم الشهادة للتأكد من صحتها وصلاحيتها
          </p>
        </div>

        <div
          className="p-8 rounded-3xl shadow-2xl mb-8"
          style={{
            background: 'white',
            border: `2px solid ${brandColors.primary.gold}`
          }}
        >
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              value={certificateCode}
              onChange={(e) => setCertificateCode(e.target.value.toUpperCase())}
              onKeyPress={handleKeyPress}
              placeholder="أدخل رقم الشهادة (مثال: CERT-2024-001)"
              className="flex-1 px-6 py-4 text-lg font-bold text-center rounded-xl border-2 focus:outline-none focus:ring-4 transition-all"
              style={{
                borderColor: brandColors.primary.gold,
                color: brandColors.text.primary,
                background: 'rgba(212,175,55,0.05)'
              }}
              disabled={loading}
            />
            <button
              onClick={handleVerify}
              disabled={loading}
              className="px-8 py-4 rounded-xl font-black text-lg text-white transition-all hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: brandGradients.gold,
                boxShadow: '0 4px 15px rgba(212,175,55,0.3)'
              }}
            >
              {loading ? (
                <>
                  <Loader className="w-6 h-6 animate-spin" />
                  جاري البحث...
                </>
              ) : (
                <>
                  <Search className="w-6 h-6" />
                  التحقق
                </>
              )}
            </button>
          </div>
        </div>

        {searched && (
          <div className="animate-fadeIn">
            {result && result.is_valid ? (
              <div
                className="p-8 rounded-3xl shadow-2xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(34,197,94,0.1) 0%, rgba(34,197,94,0.05) 100%)',
                  border: '3px solid #22c55e'
                }}
              >
                <div className="flex items-center justify-center gap-3 mb-6">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                  <h2 className="text-3xl font-black text-green-700">
                    ✓ شهادة صحيحة ومعتمدة
                  </h2>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center p-4 bg-white/50 rounded-xl">
                    <span className="font-bold text-gray-600">رقم الشهادة:</span>
                    <span className="font-black text-xl" style={{ color: brandColors.primary.gold }}>
                      {result.certificate_code}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-white/50 rounded-xl">
                    <span className="font-bold text-gray-600">اسم المالك:</span>
                    <span className="font-black text-xl" style={{ color: brandColors.text.primary }}>
                      {result.investor_name}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-white/50 rounded-xl">
                    <span className="font-bold text-gray-600">المزرعة:</span>
                    <span className="font-black" style={{ color: brandColors.text.primary }}>
                      {result.farm_name}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-white/50 rounded-xl">
                    <span className="font-bold text-gray-600">عدد الأشجار:</span>
                    <span className="font-black text-xl text-green-600">
                      {result.reserved_trees.toLocaleString('ar-SA')} شجرة
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-white/50 rounded-xl">
                    <span className="font-bold text-gray-600">تاريخ الإصدار:</span>
                    <span className="font-bold text-gray-700">
                      {new Date(result.created_at).toLocaleDateString('ar-SA')}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setShowCertificate(true)}
                  className="w-full py-4 rounded-xl font-black text-lg text-white transition-all hover:scale-105 flex items-center justify-center gap-2"
                  style={{
                    background: brandGradients.gold,
                    boxShadow: '0 4px 15px rgba(212,175,55,0.3)'
                  }}
                >
                  <Award className="w-6 h-6" />
                  عرض الشهادة الكاملة
                </button>
              </div>
            ) : (
              <div
                className="p-8 rounded-3xl shadow-2xl text-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(239,68,68,0.1) 0%, rgba(239,68,68,0.05) 100%)',
                  border: '3px solid #ef4444'
                }}
              >
                <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
                <h2 className="text-3xl font-black text-red-700 mb-3">
                  ✗ شهادة غير صحيحة
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  لم يتم العثور على شهادة بهذا الرقم، أو أن الشهادة غير صالحة
                </p>
                <div
                  className="p-4 rounded-xl"
                  style={{ background: 'rgba(239,68,68,0.1)' }}
                >
                  <p className="text-sm font-bold text-gray-700">
                    ⚠️ إذا كنت تعتقد أن هذا خطأ، يرجى التواصل مع إدارة المنصة
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {showCertificate && result && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div
            className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 md:p-12"
            style={{ background: '#fdfbf7' }}
          >
            <button
              onClick={() => setShowCertificate(false)}
              className="absolute top-4 left-4 p-3 rounded-xl transition-all hover:scale-105"
              style={{
                background: 'rgba(239,68,68,0.1)',
                color: '#ef4444'
              }}
            >
              <XCircle className="w-6 h-6" />
            </button>

            <OwnershipCertificate certificate={result} />
          </div>
        </div>
      )}

      {/* شريط الإحصائيات المتحرك */}
      <AdvancedStatsFooter />
    </div>
  );
}
