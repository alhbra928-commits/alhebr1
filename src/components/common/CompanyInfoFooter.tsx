import React from 'react';
import { Phone, Mail, MessageCircle, Building2, FileText, Shield } from 'lucide-react';

interface CompanyInfoFooterProps {
  companyName?: string;
  commercialRegister?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  city?: string;
  workingHours?: string;
}

export function CompanyInfoFooter({
  companyName = 'منصة الاستثمار الزراعي الملكية',
  commercialRegister = '1234567890',
  phone = '+966500000000',
  whatsapp = '+966500000000',
  email = 'info@palmolive.sa',
  city = 'الرياض، المملكة العربية السعودية',
  workingHours = 'الأحد - الخميس: 9 صباحاً - 6 مساءً',
}: CompanyInfoFooterProps) {
  return (
    <footer className="relative bg-gradient-to-br from-emerald-900 via-green-800 to-emerald-900 text-white mt-12 sm:mt-16">
      {/* خط علوي ذهبي */}
      <div className="h-1 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400"></div>

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-10">
        {/* معلومات المؤسسة الرئيسية */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center gap-3 mb-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
              <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" strokeWidth={2.5} />
            </div>
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-amber-300 leading-tight">
              {companyName}
            </h3>
          </div>

          <div className="flex items-center justify-center gap-2 text-emerald-100 text-xs sm:text-sm mb-3 flex-wrap">
            <Shield className="w-4 h-4 flex-shrink-0 text-amber-400" />
            <span>السجل التجاري: {commercialRegister}</span>
          </div>

          <div className="text-emerald-200 text-xs sm:text-sm space-y-1">
            <p>{city}</p>
            <p>{workingHours}</p>
          </div>
        </div>

        {/* أزرار التواصل - بسيطة ونظيفة */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-6">
          <a
            href={`tel:${phone}`}
            className="group flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-300 border border-white/20"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <div className="w-8 h-8 bg-emerald-700/50 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Phone className="w-4 h-4 text-amber-300" />
            </div>
            <div className="text-right">
              <p className="text-emerald-200 text-[10px] leading-none mb-0.5">الهاتف</p>
              <p className="text-white font-semibold text-xs sm:text-sm" dir="ltr">
                {phone}
              </p>
            </div>
          </a>

          <a
            href={`https://wa.me/${whatsapp.replace(/\D/g, '')}?text=مرحباً! أود الاستفسار عن فرص الاستثمار`}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 px-4 py-2.5 bg-green-600/30 hover:bg-green-600/50 rounded-xl transition-all duration-300 border border-green-500/30"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <div className="w-8 h-8 bg-green-600/50 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <MessageCircle className="w-4 h-4 text-white" />
            </div>
            <div className="text-right">
              <p className="text-green-200 text-[10px] leading-none mb-0.5">واتساب</p>
              <p className="text-white font-semibold text-xs sm:text-sm" dir="ltr">
                {whatsapp}
              </p>
            </div>
          </a>

          <a
            href={`mailto:${email}`}
            className="group flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-300 border border-white/20"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <div className="w-8 h-8 bg-emerald-700/50 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Mail className="w-4 h-4 text-amber-300" />
            </div>
            <div className="text-right">
              <p className="text-emerald-200 text-[10px] leading-none mb-0.5">البريد</p>
              <p className="text-white font-semibold text-xs sm:text-sm break-all" dir="ltr">
                {email}
              </p>
            </div>
          </a>
        </div>

        {/* روابط السياسات - صغيرة جداً في الأسفل */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs text-emerald-300/70 mb-4">
          <a
            href="#"
            className="hover:text-amber-300 transition-colors inline-flex items-center gap-1"
          >
            <FileText className="w-3 h-3" />
            <span>سياسة الخصوصية</span>
          </a>
          <span className="text-emerald-700">•</span>
          <a
            href="#"
            className="hover:text-amber-300 transition-colors inline-flex items-center gap-1"
          >
            <FileText className="w-3 h-3" />
            <span>الشروط والأحكام</span>
          </a>
        </div>

        {/* حقوق الطبع */}
        <div className="text-center pt-4 border-t border-emerald-700/30">
          <p className="text-emerald-300/80 text-xs sm:text-sm">
            © {new Date().getFullYear()} {companyName}. جميع الحقوق محفوظة.
          </p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-emerald-200/70 text-xs">استثمار موثوق ومضمون</span>
          </div>
        </div>
      </div>

      {/* خط سفلي ذهبي */}
      <div className="h-1 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400"></div>
    </footer>
  );
}
