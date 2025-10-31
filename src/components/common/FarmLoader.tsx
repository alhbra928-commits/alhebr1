import { Leaf, Droplets, Sun } from 'lucide-react';

interface FarmLoaderProps {
  farmType?: 'palm' | 'olive' | 'نخيل' | 'زيتون';
  message?: string;
}

export function FarmLoader({ farmType = 'palm', message = 'جاري التحميل...' }: FarmLoaderProps) {
  // تحديد نوع الشجرة
  const isPalm = farmType === 'palm' || farmType === 'نخيل';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 overflow-hidden">
      {/* خلفية متحركة */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 animate-float">
          <Leaf className="w-32 h-32 text-emerald-600" style={{ animationDelay: '0s' }} />
        </div>
        <div className="absolute top-1/4 right-20 animate-float">
          <Droplets className="w-24 h-24 text-teal-600" style={{ animationDelay: '1s' }} />
        </div>
        <div className="absolute bottom-20 left-1/4 animate-float">
          <Sun className="w-28 h-28 text-amber-600" style={{ animationDelay: '0.5s' }} />
        </div>
        <div className="absolute bottom-1/4 right-1/3 animate-float">
          <Leaf className="w-20 h-20 text-green-600" style={{ animationDelay: '1.5s' }} />
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4">
        {/* صورة الشجرة المثمرة */}
        <div className="relative mb-8 animate-scale-pulse">
          {isPalm ? (
            // شجرة نخيل مثمرة
            <div className="relative">
              {/* جذع النخلة */}
              <div className="relative mx-auto" style={{ width: '80px' }}>
                <div className="w-20 h-48 mx-auto bg-gradient-to-b from-amber-700 via-amber-800 to-amber-900 rounded-t-3xl rounded-b-lg shadow-2xl relative overflow-hidden">
                  {/* خطوط الجذع */}
                  <div className="absolute inset-0 flex flex-col justify-around py-2">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="h-0.5 bg-amber-900/30 mx-2"></div>
                    ))}
                  </div>
                </div>
              </div>

              {/* الرأس - السعف والتمور */}
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-64 h-64 flex items-center justify-center">
                {/* السعف (الأوراق) - 8 اتجاهات */}
                {[...Array(8)].map((_, i) => {
                  const angle = (i * 360) / 8;
                  const rotation = angle;
                  const x = Math.cos((angle * Math.PI) / 180) * 20;
                  const y = Math.sin((angle * Math.PI) / 180) * 20;

                  return (
                    <div
                      key={i}
                      className="absolute"
                      style={{
                        transform: `translate(${x}px, ${y}px) rotate(${rotation}deg)`,
                        animation: `sway-${i % 2} 3s ease-in-out infinite`,
                        animationDelay: `${i * 0.15}s`
                      }}
                    >
                      <div className="relative w-3 h-32 bg-gradient-to-t from-emerald-600 via-green-500 to-emerald-400 rounded-full shadow-lg transform origin-bottom">
                        {/* الأوراق الجانبية */}
                        {[...Array(6)].map((_, j) => (
                          <div
                            key={j}
                            className="absolute w-8 h-1.5 bg-gradient-to-r from-emerald-600 to-transparent rounded-full"
                            style={{
                              top: `${j * 15 + 10}px`,
                              left: j % 2 === 0 ? '-7px' : 'auto',
                              right: j % 2 === 1 ? '-7px' : 'auto',
                              transform: j % 2 === 0 ? 'rotate(-45deg)' : 'rotate(45deg)'
                            }}
                          ></div>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {/* التمور (الثمار) */}
                <div className="absolute top-20 left-1/2 -translate-x-1/2 w-32 h-32">
                  {[...Array(6)].map((_, i) => {
                    const clusterAngle = (i * 60);
                    const clusterX = Math.cos((clusterAngle * Math.PI) / 180) * 25;
                    const clusterY = Math.sin((clusterAngle * Math.PI) / 180) * 25;

                    return (
                      <div
                        key={i}
                        className="absolute"
                        style={{
                          left: `50%`,
                          top: `50%`,
                          transform: `translate(calc(-50% + ${clusterX}px), calc(-50% + ${clusterY}px))`,
                          animation: `float-dates ${2 + (i * 0.3)}s ease-in-out infinite`,
                          animationDelay: `${i * 0.2}s`
                        }}
                      >
                        {/* عنقود التمر */}
                        <div className="flex flex-col gap-1">
                          {[...Array(3)].map((_, j) => (
                            <div
                              key={j}
                              className="w-3 h-4 bg-gradient-to-b from-amber-600 to-amber-800 rounded-full shadow-lg animate-pulse"
                              style={{
                                animationDelay: `${(i + j) * 0.15}s`,
                                marginLeft: j === 1 ? '3px' : j === 2 ? '-3px' : '0'
                              }}
                            ></div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            // شجرة زيتون مثمرة
            <div className="relative">
              {/* جذع الزيتون */}
              <div className="w-16 h-40 mx-auto bg-gradient-to-b from-stone-600 via-stone-700 to-stone-800 rounded-t-2xl rounded-b-lg shadow-2xl relative">
                {/* تفاصيل اللحاء */}
                <div className="absolute inset-0 opacity-30">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-px bg-stone-900 my-6"></div>
                  ))}
                </div>
              </div>

              {/* التاج - الأوراق والزيتون */}
              <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-64">
                {/* الأوراق */}
                {[...Array(12)].map((_, i) => {
                  const angle = (i * 360) / 12;
                  const x = Math.cos((angle * Math.PI) / 180) * 30;
                  const y = Math.sin((angle * Math.PI) / 180) * 30;

                  return (
                    <div
                      key={i}
                      className="absolute top-1/2 left-1/2"
                      style={{
                        transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) rotate(${angle}deg)`,
                        animation: `gentle-sway ${3 + (i % 3) * 0.5}s ease-in-out infinite`,
                        animationDelay: `${i * 0.1}s`
                      }}
                    >
                      <div className="w-2 h-20 bg-gradient-to-t from-green-700 via-green-600 to-green-500 rounded-full shadow-md">
                        {/* أوراق صغيرة */}
                        {[...Array(5)].map((_, j) => (
                          <div
                            key={j}
                            className="absolute w-6 h-2 bg-green-600 rounded-full"
                            style={{
                              top: `${j * 12 + 5}px`,
                              left: j % 2 === 0 ? '-4px' : 'auto',
                              right: j % 2 === 1 ? '-4px' : 'auto',
                              transform: `rotate(${j % 2 === 0 ? '-30deg' : '30deg'})`
                            }}
                          ></div>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {/* حبات الزيتون */}
                {[...Array(8)].map((_, i) => {
                  const oliveAngle = (i * 45);
                  const oliveX = Math.cos((oliveAngle * Math.PI) / 180) * 20;
                  const oliveY = Math.sin((oliveAngle * Math.PI) / 180) * 20;

                  return (
                    <div
                      key={i}
                      className="absolute top-1/2 left-1/2"
                      style={{
                        transform: `translate(calc(-50% + ${oliveX}px), calc(-50% + ${oliveY}px))`,
                        animation: `float-olive ${2.5 + (i * 0.2)}s ease-in-out infinite`,
                        animationDelay: `${i * 0.15}s`
                      }}
                    >
                      <div className="w-3 h-4 bg-gradient-to-b from-green-800 to-green-900 rounded-full shadow-lg animate-pulse"
                           style={{ animationDelay: `${i * 0.1}s` }}>
                        <div className="w-1 h-1 bg-green-700 rounded-full mt-1 ml-1"></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* نص التحميل */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm px-8 py-4 rounded-2xl shadow-xl border border-emerald-200">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
              <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
              <div className="w-2 h-2 bg-teal-600 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
            </div>
            <p className="text-emerald-800 font-bold text-lg sm:text-xl">{message}</p>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes scale-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        @keyframes sway-0 {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(5deg); }
        }

        @keyframes sway-1 {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-5deg); }
        }

        @keyframes float-dates {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }

        @keyframes float-olive {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }

        @keyframes gentle-sway {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(3deg); }
          75% { transform: rotate(-3deg); }
        }

        .animate-float {
          animation: float 4s ease-in-out infinite;
        }

        .animate-scale-pulse {
          animation: scale-pulse 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
