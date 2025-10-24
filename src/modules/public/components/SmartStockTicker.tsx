import { useEffect, useState } from 'react';
import * as Icons from 'lucide-react';
import { tickerService, TickerSettings, TickerItem } from '../../settings/services/tickerService';

export function SmartStockTicker() {
  const [settings, setSettings] = useState<TickerSettings | null>(null);
  const [items, setItems] = useState<TickerItem[]>([]);
  const [liveData, setLiveData] = useState<any>({});
  const [demoData, setDemoData] = useState<any>({});

  // =====================================
  // تحميل الإعدادات والعناصر
  // =====================================

  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    const config = await tickerService.getConfiguration();
    if (config) {
      setSettings(config.settings);
      setItems(config.items);
    }
  };

  // =====================================
  // تحميل البيانات الحية
  // =====================================

  useEffect(() => {
    if (!settings) return;

    loadLiveData();
    const interval = setInterval(loadLiveData, settings.update_interval);
    return () => clearInterval(interval);
  }, [settings]);

  const loadLiveData = async () => {
    const data = await tickerService.getLiveData();
    setLiveData(data);
  };

  // =====================================
  // البيانات التجريبية المتحركة
  // =====================================

  useEffect(() => {
    if (!settings?.show_demo_data) return;

    setDemoData({
      farms: 12,
      reservations: 245,
      investors: 89,
      trees: 1540,
    });

    const interval = setInterval(() => {
      setDemoData((prev: any) => ({
        farms: Math.max(1, prev.farms + Math.floor(Math.random() * 3) - 1),
        reservations: Math.max(1, prev.reservations + Math.floor(Math.random() * 5) - 2),
        investors: Math.max(1, prev.investors + Math.floor(Math.random() * 3) - 1),
        trees: Math.max(1, prev.trees + Math.floor(Math.random() * 10) - 5),
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, [settings?.show_demo_data]);

  // =====================================
  // الحصول على القيمة للعنصر
  // =====================================

  const getItemValue = (item: TickerItem): number => {
    if (item.data_source === 'custom') {
      return item.custom_value;
    }

    if (settings?.show_demo_data) {
      return demoData[item.data_source] || 0;
    }

    return liveData[item.data_source] || 0;
  };

  // عدم عرض الشريط إذا كان مُعطلاً
  if (!settings?.is_enabled) {
    return null;
  }

  // عدم عرض الشريط إذا لم توجد عناصر نشطة
  if (items.length === 0) {
    return null;
  }

  // =====================================
  // تكرار العناصر 3 مرات للحركة السلسة
  // =====================================

  const repeatedItems = [...items, ...items, ...items];

  return (
    <div
      className="fixed top-16 md:top-20 left-0 right-0 w-full overflow-hidden border-y shadow-2xl z-40"
      style={{
        height: `${settings.height}px`,
        background: settings.background_color,
        borderColor: settings.border_color,
      }}
    >
      <div className="relative h-full flex items-center">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-blue-500/5 to-amber-500/5 animate-pulse"></div>

        <div className="ticker-wrapper w-full">
          <div
            className="ticker-content flex items-center gap-8"
            style={{
              animation: `ticker ${settings.speed}s linear infinite`,
            }}
          >
            {repeatedItems.map((item, index) => {
              // الحصول على الأيقونة ديناميكياً
              const IconComponent = (Icons as any)[item.icon] || Icons.TrendingUp;
              const value = getItemValue(item);

              return (
                <div
                  key={`${item.id}-${index}`}
                  className="flex items-center gap-2 md:gap-3 px-3 md:px-6 py-1.5 md:py-2 rounded-lg backdrop-blur-sm whitespace-nowrap"
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <div
                    className="p-1.5 md:p-2 rounded-lg"
                    style={{
                      background: `${item.color}15`,
                      border: `1px solid ${item.color}30`,
                    }}
                  >
                    <IconComponent
                      size={16}
                      className="md:w-[18px] md:h-[18px]"
                      style={{ color: item.color }}
                    />
                  </div>

                  <div className="flex flex-col">
                    <span
                      className="text-[10px] md:text-xs font-medium"
                      style={{ color: settings.text_color, opacity: 0.7 }}
                    >
                      {item.label}
                    </span>
                    <div className="flex items-center gap-1.5 md:gap-2">
                      <span
                        className="text-sm md:text-lg font-bold transition-all duration-300"
                        style={{ color: item.color }}
                      >
                        {value.toLocaleString('ar-SA')}
                      </span>
                      {item.show_percentage && (
                        <span
                          className="text-[9px] md:text-[10px] font-semibold px-1 md:px-1.5 py-0.5 rounded"
                          style={{
                            color: item.percentage_value.startsWith('+') ? '#10b981' : '#ef4444',
                            background: item.percentage_value.startsWith('+')
                              ? 'rgba(16, 185, 129, 0.1)'
                              : 'rgba(239, 68, 68, 0.1)',
                          }}
                        >
                          {item.percentage_value}
                        </span>
                      )}
                    </div>
                  </div>

                  <div
                    className="w-px h-8 bg-gradient-to-b from-transparent via-slate-600 to-transparent"
                    style={{ opacity: 0.3 }}
                  ></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style>{`
        .ticker-wrapper {
          position: relative;
          overflow: hidden;
        }

        .ticker-content {
          display: flex;
          width: max-content;
        }

        @keyframes ticker {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }

        .ticker-content:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
