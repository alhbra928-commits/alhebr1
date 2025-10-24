import { Phone, Mail, MapPin, Clock } from 'lucide-react';

export function FixedBottomBar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-[#4a5d3e] via-[#5a6d4e] to-[#4a5d3e] border-t-2 border-[#8BA574] shadow-2xl">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-3">
        {/* Desktop Layout */}
        <div className="hidden md:flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2 text-white">
              <div className="p-1.5 rounded-lg bg-[#8BA574]/20 border border-[#8BA574]/40">
                <Phone className="h-4 w-4 text-[#D4AF37]" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] opacity-75">اتصل بنا</span>
                <span className="text-sm font-bold">920000000</span>
              </div>
            </div>

            <div className="h-8 w-px bg-[#8BA574]/40"></div>

            <div className="flex items-center gap-2 text-white">
              <div className="p-1.5 rounded-lg bg-[#8BA574]/20 border border-[#8BA574]/40">
                <Mail className="h-4 w-4 text-[#D4AF37]" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] opacity-75">راسلنا</span>
                <span className="text-sm font-bold">info@palmolive.sa</span>
              </div>
            </div>

            <div className="h-8 w-px bg-[#8BA574]/40"></div>

            <div className="flex items-center gap-2 text-white">
              <div className="p-1.5 rounded-lg bg-[#8BA574]/20 border border-[#8BA574]/40">
                <MapPin className="h-4 w-4 text-[#D4AF37]" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] opacity-75">الموقع</span>
                <span className="text-sm font-bold">الرياض، السعودية</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-white bg-[#8BA574]/20 px-4 py-2 rounded-lg border border-[#8BA574]/40">
            <Clock className="h-4 w-4 text-[#D4AF37] animate-pulse" />
            <div className="flex flex-col">
              <span className="text-[10px] opacity-75">ساعات العمل</span>
              <span className="text-sm font-bold">8 صباحاً - 8 مساءً</span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-white bg-gradient-to-r from-[#D4AF37] to-[#F4E4A6] px-5 py-2 rounded-lg shadow-lg">
            <span className="text-sm font-black text-[#2E2A26]">🌴 استثمر في مستقبل مستدام 🫒</span>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden flex items-center justify-between gap-2">
          <a href="tel:920000000" className="flex items-center gap-1.5 text-white bg-[#8BA574]/20 px-2 py-1.5 rounded-lg border border-[#8BA574]/40 flex-1">
            <Phone className="h-3.5 w-3.5 text-[#D4AF37]" />
            <div className="flex flex-col">
              <span className="text-[9px] opacity-75">اتصل</span>
              <span className="text-[11px] font-bold">920000000</span>
            </div>
          </a>

          <a href="mailto:info@palmolive.sa" className="flex items-center gap-1.5 text-white bg-[#8BA574]/20 px-2 py-1.5 rounded-lg border border-[#8BA574]/40 flex-1">
            <Mail className="h-3.5 w-3.5 text-[#D4AF37]" />
            <div className="flex flex-col">
              <span className="text-[9px] opacity-75">راسلنا</span>
              <span className="text-[11px] font-bold truncate">palmolive.sa</span>
            </div>
          </a>

          <div className="flex items-center gap-1.5 text-white bg-[#8BA574]/20 px-2 py-1.5 rounded-lg border border-[#8BA574]/40">
            <Clock className="h-3.5 w-3.5 text-[#D4AF37] animate-pulse" />
            <div className="flex flex-col">
              <span className="text-[9px] opacity-75">العمل</span>
              <span className="text-[11px] font-bold">8ص-8م</span>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"></div>
      </div>
    </div>
  );
}
