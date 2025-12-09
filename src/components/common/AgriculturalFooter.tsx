import React from 'react';
import { Phone, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

interface AgriculturalFooterProps {
  platformName?: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
}

export function AgriculturalFooter({
  platformName = 'منصة النخيل والزيتون',
  phoneNumber = '+966 56 933 5257',
  email = 'info@palmolive.sa',
  address = 'المملكة العربية السعودية'
}: AgriculturalFooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-[#1a4d2e] to-[#2d5f3f] text-white mt-auto">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">

          {/* Column 1: About */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-[#4ade80] rounded-lg flex items-center justify-center">
                <span className="text-[#1a4d2e] text-lg">🌴</span>
              </div>
              {platformName}
            </h3>
            <p className="text-gray-200 leading-relaxed text-sm">
              منصة متخصصة في الاستثمار الزراعي، نقدم فرص استثمارية موثوقة في مزارع النخيل والزيتون بأعلى معايير الجودة والشفافية.
            </p>
            <div className="flex gap-3 pt-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 hover:bg-[#4ade80] rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 hover:bg-[#4ade80] rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 hover:bg-[#4ade80] rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 hover:bg-[#4ade80] rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-4">روابط سريعة</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="#home"
                  className="text-gray-200 hover:text-[#4ade80] transition-colors duration-200 flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 bg-[#4ade80] rounded-full group-hover:scale-150 transition-transform"></span>
                  الرئيسية
                </a>
              </li>
              <li>
                <a
                  href="#about"
                  className="text-gray-200 hover:text-[#4ade80] transition-colors duration-200 flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 bg-[#4ade80] rounded-full group-hover:scale-150 transition-transform"></span>
                  من نحن
                </a>
              </li>
              <li>
                <a
                  href="#services"
                  className="text-gray-200 hover:text-[#4ade80] transition-colors duration-200 flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 bg-[#4ade80] rounded-full group-hover:scale-150 transition-transform"></span>
                  خدماتنا
                </a>
              </li>
              <li>
                <a
                  href="#terms"
                  className="text-gray-200 hover:text-[#4ade80] transition-colors duration-200 flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 bg-[#4ade80] rounded-full group-hover:scale-150 transition-transform"></span>
                  الشروط والأحكام
                </a>
              </li>
              <li>
                <a
                  href="#privacy"
                  className="text-gray-200 hover:text-[#4ade80] transition-colors duration-200 flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 bg-[#4ade80] rounded-full group-hover:scale-150 transition-transform"></span>
                  سياسة الخصوصية
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-4">تواصل معنا</h3>
            <div className="space-y-4">
              <a
                href={`tel:${phoneNumber.replace(/\s/g, '')}`}
                className="flex items-start gap-3 text-gray-200 hover:text-[#4ade80] transition-colors duration-200 group"
              >
                <div className="w-10 h-10 bg-white/10 group-hover:bg-[#4ade80] rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-gray-300 mb-1">اتصل بنا</div>
                  <div className="font-medium text-sm" dir="ltr">{phoneNumber}</div>
                </div>
              </a>

              <a
                href={`mailto:${email}`}
                className="flex items-start gap-3 text-gray-200 hover:text-[#4ade80] transition-colors duration-200 group"
              >
                <div className="w-10 h-10 bg-white/10 group-hover:bg-[#4ade80] rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-gray-300 mb-1">البريد الإلكتروني</div>
                  <div className="font-medium text-sm" dir="ltr">{email}</div>
                </div>
              </a>

              <div className="flex items-start gap-3 text-gray-200">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-gray-300 mb-1">الموقع</div>
                  <div className="font-medium text-sm">{address}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-300">
            <p className="text-center md:text-right">
              جميع الحقوق محفوظة © {currentYear} {platformName}
            </p>
            <p className="text-center md:text-left flex items-center gap-2">
              <span>صُنع بكل</span>
              <span className="text-red-400 animate-pulse">❤️</span>
              <span>في المملكة العربية السعودية</span>
            </p>
          </div>
        </div>
      </div>

      {/* WhatsApp Floating Button */}
      <a
        href={`https://wa.me/${phoneNumber.replace(/[\s+-]/g, '')}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 left-6 w-14 h-14 bg-[#25d366] hover:bg-[#20bd5a] text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 z-50 group"
        aria-label="تواصل عبر واتساب"
      >
        <svg
          className="w-8 h-8"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
      </a>
    </footer>
  );
}
