import React from 'react';

export function AgriculturalFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-r from-[#1a4d2e] to-[#2d5f3f] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-sm text-gray-200">
          <p>© {currentYear} منصة النخيل والزيتون - جميع الحقوق محفوظة</p>
        </div>
      </div>
    </footer>
  );
}
