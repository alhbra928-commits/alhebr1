import { HeroFarmCard } from './HeroFarmCard';

interface LuxuryShowcaseProps {
  onViewDetails?: () => void;
}

export function LuxuryShowcase({ onViewDetails }: LuxuryShowcaseProps) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(160deg, #F7F5F0 0%, #EDE6D9 100%)',
        }}
      />

      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(212, 175, 55, 0.4) 0%, transparent 70%)',
          animation: 'glow 8s ease-in-out infinite',
        }}
      />

      <div
        className="absolute bottom-0 right-0 w-96 h-96 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='80' font-size='80' opacity='0.3'%3E🌴%3C/text%3E%3C/svg%3E")`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
        }}
      />

      <div
        className="absolute top-20 left-20 w-64 h-64 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='80' font-size='80' opacity='0.3'%3E🫒%3C/text%3E%3C/svg%3E")`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
        }}
      />

      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          background: 'radial-gradient(circle at 30% 40%, rgba(212, 175, 55, 0.15) 0%, transparent 50%)',
          animation: 'moveLight 12s ease-in-out infinite',
        }}
      />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-20">
        <div
          className="w-full max-w-2xl"
          style={{
            animation: 'fadeInUp 1.2s ease-out',
          }}
        >
          <div className="text-center mb-12">
            <h1
              className="text-5xl md:text-6xl font-black mb-4"
              style={{
                background: 'linear-gradient(135deg, #D4AF37 0%, #C9A962 50%, #B8964A 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: '0 4px 20px rgba(212, 175, 55, 0.2)',
                animation: 'shimmerText 3s ease-in-out infinite',
              }}
            >
              منصة النخلة والزيتون
            </h1>
            <p
              className="text-xl md:text-2xl font-bold"
              style={{
                color: '#6B6B6B',
                animation: 'fadeIn 1.5s ease-out 0.3s both',
              }}
            >
              استثمار راقٍ يثمر خيرًا
            </p>
          </div>

          <div
            style={{
              animation: 'fadeIn 1.8s ease-out 0.6s both',
            }}
          >
            <HeroFarmCard
              farmName="مزرعة الواحة الشمالية"
              farmType="نخيل فاخر"
              pricePerTree={250}
              location="القصيم، المملكة العربية السعودية"
              onViewDetails={onViewDetails}
            />
          </div>

          <div
            className="text-center mt-12"
            style={{
              animation: 'fadeIn 2s ease-out 1s both',
            }}
          >
            <p
              className="text-sm md:text-base font-medium"
              style={{ color: '#999999' }}
            >
              منصة تملك النخيل والزيتون – استثمار راقٍ يثمر خيرًا
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes glow {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.2;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.1);
            opacity: 0.3;
          }
        }

        @keyframes moveLight {
          0%, 100% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(20%, 20%);
          }
        }

        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(40px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }

        @keyframes shimmerText {
          0%, 100% {
            filter: brightness(1);
          }
          50% {
            filter: brightness(1.2);
          }
        }
      `}</style>
    </div>
  );
}
