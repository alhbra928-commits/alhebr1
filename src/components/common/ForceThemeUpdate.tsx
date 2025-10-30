import React, { useEffect, useState } from 'react';
import { RefreshCw, Sparkles } from 'lucide-react';

export function ForceThemeUpdate() {
  const [show, setShow] = useState(false);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    const lastVersion = localStorage.getItem('app-theme-version');
    const currentVersion = 'royal-green-v2-force';

    if (lastVersion !== currentVersion) {
      setShow(true);
    }
  }, []);

  const handleForceUpdate = async () => {
    setClearing(true);

    try {
      localStorage.clear();
      sessionStorage.clear();

      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }

      const databases = await indexedDB.databases();
      for (const db of databases) {
        if (db.name) {
          indexedDB.deleteDatabase(db.name);
        }
      }

      document.cookie.split(";").forEach(function(c) {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });

      localStorage.setItem('app-theme-version', 'royal-green-v2-force');

      setTimeout(() => {
        window.location.href = window.location.pathname + '?v=' + Date.now() + '&force-green=true';
        setTimeout(() => {
          location.reload(true);
        }, 100);
      }, 500);

    } catch (error) {
      console.error('Error clearing cache:', error);
      setClearing(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 border-4 border-emerald-500 animate-fadeIn">
        <div className="text-center">
          <div className="mb-6 relative">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 rounded-3xl flex items-center justify-center shadow-lg animate-pulse-slow">
              <Sparkles className="w-12 h-12 text-white" />
            </div>
            <div className="absolute inset-0 w-24 h-24 mx-auto bg-gradient-to-br from-emerald-400 to-teal-400 rounded-3xl blur-xl opacity-50 animate-pulse"></div>
          </div>

          <h2 className="text-3xl font-black mb-4 bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent">
            🌿 تحديث مهم!
          </h2>

          <p className="text-gray-700 text-lg mb-6 leading-relaxed">
            تم تطبيق <strong className="text-emerald-600">النمط الأخضر الملكي</strong> الجديد على المنصة!
          </p>

          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-6 mb-6 border-2 border-emerald-200">
            <h3 className="font-bold text-emerald-900 mb-3 text-right">✨ ما الجديد:</h3>
            <ul className="text-right space-y-2 text-gray-700">
              <li className="flex items-center gap-2">
                <span className="text-emerald-500">●</span>
                <span>خلفية خضراء فاتحة متدرجة</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-500">●</span>
                <span>بطاقات بيضاء بحواف خضراء</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-500">●</span>
                <span>أزرار وعناوين بتدرج أخضر</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-500">●</span>
                <span>تأثيرات hover خضراء ناعمة</span>
              </li>
            </ul>
          </div>

          {clearing ? (
            <div className="text-center">
              <div className="inline-flex items-center gap-3 bg-emerald-100 text-emerald-700 px-6 py-4 rounded-xl font-bold">
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>جاري التحديث...</span>
              </div>
            </div>
          ) : (
            <button
              onClick={handleForceUpdate}
              className="w-full bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
            >
              <RefreshCw className="w-5 h-5" />
              <span>تحديث المنصة الآن</span>
            </button>
          )}

          <p className="text-sm text-gray-500 mt-4">
            سيتم مسح الكاش وإعادة التحميل تلقائياً
          </p>
        </div>
      </div>
    </div>
  );
}
