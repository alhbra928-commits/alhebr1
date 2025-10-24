import { useState } from 'react';
import { Info, X, Play } from 'lucide-react';
import { brandGradients } from '../../finance/styles/brandColors';

export function Interactive3DButton() {
  const [isHovered, setIsHovered] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="flex justify-center py-12">
        <button
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={() => setModalOpen(true)}
          className="relative px-12 py-6 rounded-2xl font-black text-2xl text-white transition-all duration-500 overflow-hidden group"
          style={{
            background: brandGradients.gold,
            boxShadow: isHovered
              ? '0 20px 60px rgba(212, 175, 55, 0.6), 0 0 40px rgba(212, 175, 55, 0.4), inset 0 -4px 8px rgba(0, 0, 0, 0.2)'
              : '0 10px 40px rgba(212, 175, 55, 0.4), inset 0 -3px 6px rgba(0, 0, 0, 0.15)',
            transform: isHovered ? 'translateY(-4px) scale(1.05)' : 'translateY(0) scale(1)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
          }}
        >
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
            style={{
              background: 'linear-gradient(135deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)',
              animation: 'reflectionMove 3s ease-in-out infinite',
            }}
          />

          <div className="relative z-10 flex items-center gap-3">
            <Info className="h-7 w-7" />
            <span>تعرف على المنصة</span>
          </div>

          <div
            className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              boxShadow: '0 0 30px rgba(212, 175, 55, 0.8)',
              animation: 'pulse 2s ease-in-out infinite',
            }}
          />
        </button>
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            animation: 'fadeIn 0.3s ease-out',
          }}
          onClick={() => setModalOpen(false)}
        >
          <div
            className="relative max-w-4xl w-full rounded-3xl overflow-hidden"
            style={{
              background: 'linear-gradient(160deg, #FFFFFF 0%, #F7F5F0 100%)',
              boxShadow: '0 30px 100px rgba(0, 0, 0, 0.5)',
              animation: 'modalZoomIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-6 left-6 z-10 p-3 rounded-full transition-all duration-300 hover:scale-110"
              style={{
                background: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <X className="h-6 w-6 text-white" />
            </button>

            <div className="p-12">
              <div className="text-center mb-8">
                <h2
                  className="text-5xl font-black mb-4"
                  style={{
                    background: brandGradients.gold,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  منصة النخلة والزيتون
                </h2>
                <p className="text-2xl font-bold text-gray-700">
                  استثمار راقٍ في الزراعة المستدامة
                </p>
              </div>

              <div
                className="aspect-video rounded-2xl mb-8 flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #F0EDE5 0%, #E8E3D8 100%)',
                  border: '3px solid rgba(212, 175, 55, 0.3)',
                }}
              >
                <div className="text-center">
                  <div
                    className="w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110"
                    style={{
                      background: brandGradients.gold,
                      boxShadow: '0 10px 40px rgba(212, 175, 55, 0.5)',
                    }}
                  >
                    <Play className="h-12 w-12 text-white ml-2" />
                  </div>
                  <p className="text-xl font-bold text-gray-600">
                    فيديو تعريفي قادم قريبًا
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { icon: '🌴', title: 'تملك حقيقي', desc: 'ملكية موثقة لأشجارك' },
                  { icon: '💰', title: 'عائد مستدام', desc: 'دخل سنوي من المحاصيل' },
                  { icon: '📊', title: 'شفافية كاملة', desc: 'تتبع استثمارك مباشرة' },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="text-center p-6 rounded-2xl transition-all duration-300 hover:scale-105"
                    style={{
                      background: 'rgba(212, 175, 55, 0.1)',
                      border: '2px solid rgba(212, 175, 55, 0.2)',
                    }}
                  >
                    <div className="text-5xl mb-3">{item.icon}</div>
                    <h3 className="text-xl font-black mb-2 text-gray-800">{item.title}</h3>
                    <p className="text-gray-600 font-medium">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes reflectionMove {
          0%, 100% {
            transform: translateX(-100%) rotate(-10deg);
          }
          50% {
            transform: translateX(100%) rotate(-10deg);
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

        @keyframes modalZoomIn {
          from {
            opacity: 0;
            transform: scale(0.8) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </>
  );
}
