import React, { useState, useEffect } from 'react';
import { TrendingUp, Bell, Sparkles, ArrowLeft } from 'lucide-react';
import { brandColors, brandGradients } from '../../finance/styles/brandColors';
import { FarmSuggestion } from '../types/farm.types';

interface SmartAssistantSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  suggestions?: FarmSuggestion[];
  onSuggestionClick?: (barcode: string) => void;
}

interface Notification {
  id: string;
  message: string;
  timestamp: Date;
}

export function SmartAssistantSidebar({
  isOpen,
  onClose,
  suggestions = [],
  onSuggestionClick = () => {},
}: SmartAssistantSidebarProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Scroll behavior للإخفاء في الجوال
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // في الجوال فقط (< 1024px)
      if (window.innerWidth < 1024) {
        // إخفاء عند Scroll للأعلى
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
          setIsVisible(false);
        } else if (currentScrollY < lastScrollY) {
          setIsVisible(true);
        }
      } else {
        // في Desktop دائماً ظاهر
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    const initialNotifications: Notification[] = [
      {
        id: '1',
        message: '🌿 افتُتح حجز مزرعة جديدة في المدينة المنورة!',
        timestamp: new Date(),
      },
    ];
    setNotifications(initialNotifications);

    const interval = setInterval(() => {
      const messages = [
        '🎉 تم حجز 5 أشجار في آخر ساعة',
        '⭐ مزرعة الطائف وصلت 80% من الحجوزات',
        '🌱 عرض خاص: خصم 10% على الدفعة الأولى',
      ];
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      setNotifications((prev) => [
        {
          id: Date.now().toString(),
          message: randomMessage,
          timestamp: new Date(),
        },
        ...prev.slice(0, 4),
      ]);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fadeIn"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 overflow-y-auto animate-slideInRight shadow-2xl"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: brandGradients.gold }}
              >
                <Sparkles className="h-5 w-5" style={{ color: brandColors.text.white }} />
              </div>
              <h3 className="text-xl font-black" style={{ color: brandColors.text.primary }}>
                المساعد الذكي
              </h3>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" style={{ color: brandColors.text.primary }} />
            </button>
          </div>

        <div
          className="rounded-3xl p-6 backdrop-blur-lg"
          style={{
            background: 'rgba(245, 243, 238, 0.8)',
            border: `2px solid ${brandColors.border.light}`,
            boxShadow: `0 10px 40px ${brandColors.shadow.dark}`,
          }}
        >

        <div className="space-y-3 mb-6">
          <h4 className="text-sm font-bold mb-3" style={{ color: brandColors.text.secondary }}>
            مزارع مقترحة لك
          </h4>
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.barcode}
              onClick={() => onSuggestionClick(suggestion.barcode)}
              className="w-full p-4 rounded-xl text-right transition-all duration-300 hover:scale-105 animate-fadeInUp"
              style={{
                background: 'rgba(255, 255, 255, 0.6)',
                border: `1px solid ${brandColors.border.light}`,
                animationDelay: `${index * 0.1}s`,
              }}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-black text-sm mb-1" style={{ color: brandColors.text.primary }}>
                    {suggestion.farm_name}
                  </p>
                  <p className="text-xs" style={{ color: brandColors.text.secondary }}>
                    {suggestion.barcode}
                  </p>
                </div>
                <ArrowLeft className="h-4 w-4" style={{ color: brandColors.primary.gold }} />
              </div>
              <div
                className="inline-block px-3 py-1 rounded-full text-xs font-bold"
                style={{
                  background: brandColors.primary.goldLight,
                  color: brandColors.text.primary,
                }}
              >
                {suggestion.badge}
              </div>
            </button>
          ))}
        </div>

        {suggestions.length === 0 && (
          <div className="text-center py-6">
            <TrendingUp className="h-12 w-12 mx-auto mb-3" style={{ color: brandColors.primary.gold }} />
            <p className="text-sm" style={{ color: brandColors.text.secondary }}>
              لا توجد اقتراحات حالياً
            </p>
          </div>
        )}
      </div>

      <div
        className="rounded-3xl p-6 backdrop-blur-lg animate-fadeIn"
        style={{
          background: 'rgba(245, 243, 238, 0.8)',
          border: `2px solid ${brandColors.border.light}`,
          boxShadow: `0 10px 40px ${brandColors.shadow.dark}`,
          animationDelay: '0.2s',
        }}
      >
        <div className="flex items-center gap-3 mb-4">
          <Bell className="h-5 w-5" style={{ color: brandColors.primary.gold }} />
          <h3 className="text-lg font-black" style={{ color: brandColors.text.primary }}>
            التنبيهات
          </h3>
        </div>

        <div className="space-y-3">
          {notifications.map((notification, index) => (
            <div
              key={notification.id}
              className="p-3 rounded-xl animate-slideIn"
              style={{
                background: 'rgba(212, 175, 55, 0.1)',
                border: `1px solid ${brandColors.border.light}`,
                animationDelay: `${index * 0.1}s`,
              }}
            >
              <p className="text-sm font-bold mb-1" style={{ color: brandColors.text.primary }}>
                {notification.message}
              </p>
              <p className="text-xs" style={{ color: brandColors.text.secondary }}>
                {notification.timestamp.toLocaleTimeString('ar-SA', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          ))}
        </div>

        {notifications.length === 0 && (
          <div className="text-center py-6">
            <Bell className="h-12 w-12 mx-auto mb-3 opacity-30" style={{ color: brandColors.text.secondary }} />
            <p className="text-sm" style={{ color: brandColors.text.secondary }}>
              لا توجد تنبيهات جديدة
            </p>
          </div>
        )}
      </div>

      <div
        className="rounded-3xl p-6 text-center backdrop-blur-lg animate-fadeIn"
        style={{
          background: brandGradients.gold,
          boxShadow: `0 10px 40px ${brandColors.shadow.gold}`,
          animationDelay: '0.4s',
        }}
      >
        <p className="text-2xl font-black mb-2" style={{ color: brandColors.text.white }}>
          🌟 عرض خاص
        </p>
        <p className="text-sm mb-4" style={{ color: brandColors.text.white }}>
          خصم 15% على أول حجز لك
        </p>
        <button
          className="w-full py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105"
          style={{
            background: brandColors.text.white,
            color: brandColors.primary.gold,
          }}
        >
          استفد الآن
        </button>
      </div>
        </div>
      </div>
    </>
  );
}
