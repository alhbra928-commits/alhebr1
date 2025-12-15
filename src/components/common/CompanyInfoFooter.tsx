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
    <footer className="bg-gradient-to-br from-emerald-900 via-green-800 to-emerald-900 text-white mt-16">
      <div className="h-1 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400"></div>

      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
                <Building2 className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl font-bold text-amber-300 mb-2 leading-tight">
                  {companyName}
                </h3>
                <div className="flex items-center gap-2 text-emerald-100 text-sm">
                  <Shield className="w-4 h-4 flex-shrink-0" />
                  <span className="break-words">السجل التجاري: {commercialRegister}</span>
                </div>
              </div>
            </div>

            <div className="text-emerald-200 text-sm leading-relaxed pr-15">
              <p>{city}</p>
              <p className="mt-1">{workingHours}</p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-amber-300 font-bold text-lg mb-4">تواصل معنا</h4>

            <a
              href={`tel:${phone}`}
              className="flex items-center gap-3 group hover:bg-white/10 p-3 rounded-xl transition-all duration-300"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <div className="w-10 h-10 bg-emerald-700/50 rounded-lg flex items-center justify-center group-hover:bg-emerald-600/50 transition-colors">
                <Phone className="w-5 h-5 text-amber-300" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-emerald-200 text-xs">الهاتف</p>
                <p className="text-white font-semibold text-sm sm:text-base break-all" dir="ltr">
                  {phone}
                </p>
              </div>
            </a>

            <a
              href={`https://wa.me/${whatsapp.replace(/\D/g, '')}?text=مرحباً! أود الاستفسار عن فرص الاستثمار`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 group hover:bg-white/10 p-3 rounded-xl transition-all duration-300"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <div className="w-10 h-10 bg-green-600/50 rounded-lg flex items-center justify-center group-hover:bg-green-500/50 transition-colors">
                <MessageCircle className="w-5 h-5 text-amber-300" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-emerald-200 text-xs">واتساب</p>
                <p className="text-white font-semibold text-sm sm:text-base break-all" dir="ltr">
                  {whatsapp}
                </p>
              </div>
            </a>

            <a
              href={`mailto:${email}`}
              className="flex items-center gap-3 group hover:bg-white/10 p-3 rounded-xl transition-all duration-300"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <div className="w-10 h-10 bg-emerald-700/50 rounded-lg flex items-center justify-center group-hover:bg-emerald-600/50 transition-colors">
                <Mail className="w-5 h-5 text-amber-300" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-emerald-200 text-xs">البريد الإلكتروني</p>
                <p className="text-white font-semibold text-sm break-all" dir="ltr">
                  {email}
                </p>
              </div>
            </a>
          </div>

          <div className="space-y-3">
            <h4 className="text-amber-300 font-bold text-lg mb-4">الوثائق والسياسات</h4>

            <div className="space-y-2">
              <a
                href="#"
                className="flex items-center gap-2 text-emerald-200 hover:text-amber-300 transition-colors text-sm group"
              >
                <FileText className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>سياسة الخصوصية</span>
              </a>

              <a
                href="#"
                className="flex items-center gap-2 text-emerald-200 hover:text-amber-300 transition-colors text-sm group"
              >
                <FileText className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>الشروط والأحكام</span>
              </a>

              <a
                href="#"
                className="flex items-center gap-2 text-emerald-200 hover:text-amber-300 transition-colors text-sm group"
              >
                <Shield className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>سياسة الاسترجاع</span>
              </a>
            </div>

            <div className="mt-6 p-4 bg-white/5 rounded-xl border border-amber-400/30">
              <div className="flex items-center justify-center gap-2 text-amber-300">
                <Shield className="w-5 h-5" />
                <span className="text-sm font-semibold">استثمار موثوق ومضمون</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-emerald-700/50">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-right">
            <p className="text-emerald-300 text-sm">
              © {new Date().getFullYear()} {companyName}. جميع الحقوق محفوظة.
            </p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-emerald-200 text-xs">منصة فعالة ومعتمدة</span>
            </div>
          </div>
        </div>
      </div>

      <div className="h-1 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400"></div>
    </footer>
  );
}
