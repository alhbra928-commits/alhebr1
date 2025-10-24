export function SmartMotionTicker() {
  return (
    <div
      className="relative overflow-hidden py-4"
      style={{
        background: 'linear-gradient(90deg, rgba(212, 175, 55, 0.1) 0%, rgba(212, 175, 55, 0.2) 50%, rgba(212, 175, 55, 0.1) 100%)',
        backgroundSize: '200% 100%',
        animation: 'gradientMove 8s ease-in-out infinite',
      }}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)',
            animation: 'lightMove 5s ease-in-out infinite',
          }}
        />
      </div>

      <div className="relative">
        <div
          className="whitespace-nowrap flex items-center gap-8"
          style={{
            animation: 'marquee 30s linear infinite',
          }}
        >
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <span
                className="text-2xl animate-bounce"
                style={{ animationDelay: `${i * 0.3}s` }}
              >
                🌴
              </span>
              <span
                className="text-xl md:text-2xl font-black"
                style={{
                  background: 'linear-gradient(135deg, #D4AF37 0%, #F4E4A6 50%, #D4AF37 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  textShadow: '0 2px 10px rgba(212, 175, 55, 0.3)',
                  filter: 'drop-shadow(0 0 8px rgba(212, 175, 55, 0.4))',
                }}
              >
                استثمر في نخيلك… وازرع مستقبلك مع منصة تملك النخيل والزيتون
              </span>
              <span
                className="text-2xl animate-bounce"
                style={{ animationDelay: `${i * 0.3 + 0.15}s` }}
              >
                🌿
              </span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }

        @keyframes gradientMove {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes lightMove {
          0%, 100% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}
