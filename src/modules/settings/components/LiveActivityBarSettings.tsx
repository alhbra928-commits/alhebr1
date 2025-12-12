import { useState, useEffect } from 'react';
import {
  Activity, Settings, Save, RefreshCw, Eye, Palette, Zap,
  Clock, Volume2, BarChart3, Sparkles, ShoppingCart, Award, TreePine
} from 'lucide-react';
import { LiveActivityService, LiveActivitySettings } from '../../../services/liveActivityService';

export function LiveActivityBarSettings() {
  const [settings, setSettings] = useState<LiveActivitySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [stats, setStats] = useState({
    totalActivities: 0,
    reservations: 0,
    certificates: 0,
    farms: 0
  });

  useEffect(() => {
    loadSettings();
    loadStats();

    const statsInterval = setInterval(loadStats, 5000);
    const settingsChannel = LiveActivityService.subscribeToChanges(() => {
      loadSettings();
    });

    return () => {
      clearInterval(statsInterval);
      settingsChannel();
    };
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await LiveActivityService.getSettings();
      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const activities = await LiveActivityService.getLiveActivities();
      const reservations = activities.filter(a => a.type === 'reservation').length;
      const certificates = activities.filter(a => a.type === 'certificate').length;
      const farms = activities.filter(a => a.type === 'farm').length;

      setStats({
        totalActivities: activities.length,
        reservations,
        certificates,
        farms
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleChange = (updates: Partial<LiveActivitySettings>) => {
    if (!settings) return;
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    setPreviewKey(prev => prev + 1);
  };

  const handleSaveAndApply = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      const success = await LiveActivityService.updateSettings(settings);
      if (success) {
        window.dispatchEvent(new CustomEvent('live-activity-settings-updated', {
          detail: settings
        }));
        alert('✅ تم حفظ الإعدادات وتطبيقها مباشرة!');
      } else {
        alert('❌ فشل حفظ الإعدادات');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('❌ حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <RefreshCw className="animate-spin" size={32} style={{ color: '#D4AF37' }} />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center p-12 text-red-400">
        فشل تحميل الإعدادات
      </div>
    );
  }

  const getBackgroundStyle = () => {
    switch (settings.background_style) {
      case 'gradient':
        return 'linear-gradient(135deg, rgba(30, 70, 32, 0.95) 0%, rgba(44, 95, 45, 0.95) 50%, rgba(30, 70, 32, 0.95) 100%)';
      case 'solid':
        return 'rgba(30, 70, 32, 0.95)';
      case 'glass':
        return 'rgba(30, 70, 32, 0.7)';
      default:
        return 'linear-gradient(135deg, rgba(30, 70, 32, 0.95) 0%, rgba(44, 95, 45, 0.95) 50%, rgba(30, 70, 32, 0.95) 100%)';
    }
  };

  const getBorderStyle = () => {
    const border = '1px solid rgba(212, 175, 55, 0.25)';
    switch (settings.border_style) {
      case 'none': return '';
      case 'bottom': return `border-bottom: ${border};`;
      case 'top': return `border-top: ${border};`;
      case 'both': return `border-top: ${border}; border-bottom: ${border};`;
      default: return `border-bottom: ${border};`;
    }
  };

  const speedDuration = {
    slow: '50s',
    medium: '35s',
    fast: '22s'
  };

  const mockActivities = [
    { icon: ShoppingCart, message: 'تم حجز أشجار جديدة بواسطة أحمد محمد', color: settings.icon_color },
    { icon: Award, message: 'تم إصدار شهادة تملك جديدة', color: settings.icon_color },
    { icon: TreePine, message: 'مزرعة الخالدية متاحة للاستثمار', color: settings.icon_color },
    { icon: Sparkles, message: 'مستثمر جديد انضم إلى المنصة', color: settings.icon_color },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity size={32} style={{ color: '#D4AF37' }} />
          <div>
            <h2 className="text-2xl font-bold" style={{ color: '#D4AF37' }}>
              شريط النشاط المباشر المتطور
            </h2>
            <p className="text-sm text-[#F5F5DC]/60">تحكم كامل مع معاينة لحظية</p>
          </div>
        </div>
        <button
          onClick={handleSaveAndApply}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#2C5F2D] to-[#1E4620] text-[#F5F5DC] rounded-lg font-semibold hover:from-[#3A7A3B] hover:to-[#2A5A2C] transition-all disabled:opacity-50 border border-[#D4AF37]/30"
        >
          {saving ? (
            <>
              <RefreshCw className="animate-spin" size={20} />
              جاري الحفظ...
            </>
          ) : (
            <>
              <Zap size={20} />
              حفظ وتطبيق مباشرة
            </>
          )}
        </button>
      </div>

      {/* Live Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-[#2C5F2D] to-[#1E4620] rounded-lg p-4 border border-[#D4AF37]/20">
          <div className="flex items-center gap-3">
            <BarChart3 size={24} style={{ color: '#D4AF37' }} />
            <div>
              <p className="text-sm text-[#F5F5DC]/60">إجمالي الأنشطة</p>
              <p className="text-2xl font-bold text-[#D4AF37]">{stats.totalActivities}</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-[#2C5F2D] to-[#1E4620] rounded-lg p-4 border border-[#D4AF37]/20">
          <div className="flex items-center gap-3">
            <ShoppingCart size={24} style={{ color: '#D4AF37' }} />
            <div>
              <p className="text-sm text-[#F5F5DC]/60">الحجوزات</p>
              <p className="text-2xl font-bold text-[#D4AF37]">{stats.reservations}</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-[#2C5F2D] to-[#1E4620] rounded-lg p-4 border border-[#D4AF37]/20">
          <div className="flex items-center gap-3">
            <Award size={24} style={{ color: '#D4AF37' }} />
            <div>
              <p className="text-sm text-[#F5F5DC]/60">الشهادات</p>
              <p className="text-2xl font-bold text-[#D4AF37]">{stats.certificates}</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-[#2C5F2D] to-[#1E4620] rounded-lg p-4 border border-[#D4AF37]/20">
          <div className="flex items-center gap-3">
            <TreePine size={24} style={{ color: '#D4AF37' }} />
            <div>
              <p className="text-sm text-[#F5F5DC]/60">المزارع</p>
              <p className="text-2xl font-bold text-[#D4AF37]">{stats.farms}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Live Preview */}
      <div className="bg-[#1a1a1a] rounded-lg p-6 border border-[#D4AF37]/30">
        <div className="flex items-center gap-2 mb-4">
          <Eye size={20} style={{ color: '#D4AF37' }} />
          <h3 className="font-bold text-[#D4AF37]">المعاينة المباشرة</h3>
          <span className="text-xs bg-[#2C5F2D] text-[#D4AF37] px-2 py-1 rounded">LIVE</span>
        </div>

        <div className="relative rounded-lg overflow-hidden border border-[#2C5F2D]/50" key={previewKey}>
          <style>{`
            @keyframes preview-scroll {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .preview-track {
              animation: preview-scroll ${speedDuration[settings.animation_speed]} linear infinite;
              ${settings.pause_on_hover ? 'cursor: pointer;' : ''}
            }
            ${settings.pause_on_hover ? '.preview-track:hover { animation-play-state: paused; }' : ''}
          `}</style>

          <div
            style={{
              height: `${settings.height}px`,
              background: getBackgroundStyle(),
              backdropFilter: settings.background_style === 'glass' ? 'blur(10px)' : 'none',
              overflow: 'hidden',
              position: 'relative',
              width: '100%',
              ...({} as any)
            }}
          >
            <div
              className="preview-track"
              style={{
                display: 'flex',
                alignItems: 'center',
                height: '100%',
                willChange: 'transform'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                {mockActivities.map((activity, idx) => (
                  <div key={`a-${idx}`} style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 24px', height: '100%' }}>
                      <div style={{
                        width: '34px',
                        height: '34px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '8px',
                        background: `${settings.icon_color}33`,
                        border: `1px solid ${settings.icon_color}55`
                      }}>
                        <activity.icon size={18} style={{ color: settings.icon_color }} />
                      </div>
                      <span style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: settings.text_color,
                        textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
                      }}>
                        {activity.message}
                      </span>
                    </div>
                    {settings.show_separator && idx < mockActivities.length - 1 && (
                      <div style={{
                        width: '3px',
                        height: '3px',
                        borderRadius: '50%',
                        background: `${settings.icon_color}80`,
                        margin: '0 16px'
                      }} />
                    )}
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                {mockActivities.map((activity, idx) => (
                  <div key={`b-${idx}`} style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 24px', height: '100%' }}>
                      <div style={{
                        width: '34px',
                        height: '34px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '8px',
                        background: `${settings.icon_color}33`,
                        border: `1px solid ${settings.icon_color}55`
                      }}>
                        <activity.icon size={18} style={{ color: settings.icon_color }} />
                      </div>
                      <span style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: settings.text_color,
                        textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
                      }}>
                        {activity.message}
                      </span>
                    </div>
                    {settings.show_separator && idx < mockActivities.length - 1 && (
                      <div style={{
                        width: '3px',
                        height: '3px',
                        borderRadius: '50%',
                        background: `${settings.icon_color}80`,
                        margin: '0 16px'
                      }} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Basic Settings */}
        <div className="bg-[#1a1a1a] rounded-lg p-6 space-y-4 border border-[#2C5F2D]/30">
          <div className="flex items-center gap-2 mb-4">
            <Settings size={20} style={{ color: '#D4AF37' }} />
            <h3 className="font-bold text-[#D4AF37]">الإعدادات الأساسية</h3>
          </div>

          <div className="flex items-center justify-between p-4 bg-[#0f0f0f] rounded-lg">
            <div>
              <h4 className="font-semibold text-[#F5F5DC]">تفعيل الشريط</h4>
              <p className="text-xs text-[#F5F5DC]/60">إظهار/إخفاء الشريط</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.is_enabled}
                onChange={(e) => handleChange({ is_enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-gray-700 peer-focus:ring-2 peer-focus:ring-[#D4AF37] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:right-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#2C5F2D]"></div>
            </label>
          </div>

          <div className="p-4 bg-[#0f0f0f] rounded-lg">
            <h4 className="font-semibold text-[#F5F5DC] mb-3">سرعة الحركة</h4>
            <div className="grid grid-cols-3 gap-2">
              {(['slow', 'medium', 'fast'] as const).map((speed) => (
                <button
                  key={speed}
                  onClick={() => handleChange({ animation_speed: speed })}
                  className={`p-2 rounded-lg text-sm font-medium transition-all ${
                    settings.animation_speed === speed
                      ? 'bg-[#2C5F2D] text-[#D4AF37] border-2 border-[#D4AF37]'
                      : 'bg-[#1a1a1a] text-[#F5F5DC] border border-[#2C5F2D]/30 hover:border-[#D4AF37]/50'
                  }`}
                >
                  {speed === 'slow' ? 'بطيء' : speed === 'medium' ? 'متوسط' : 'سريع'}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 bg-[#0f0f0f] rounded-lg">
            <h4 className="font-semibold text-[#F5F5DC] mb-3">ارتفاع الشريط</h4>
            <input
              type="range"
              min="40"
              max="80"
              value={settings.height}
              onChange={(e) => handleChange({ height: parseInt(e.target.value) })}
              className="w-full accent-[#2C5F2D]"
            />
            <div className="flex justify-between text-xs text-[#F5F5DC]/60 mt-1">
              <span>40px</span>
              <span className="font-bold text-[#D4AF37]">{settings.height}px</span>
              <span>80px</span>
            </div>
          </div>

          <div className="p-4 bg-[#0f0f0f] rounded-lg">
            <h4 className="font-semibold text-[#F5F5DC] mb-3">فترة التحديث</h4>
            <input
              type="range"
              min="10"
              max="120"
              step="10"
              value={settings.refresh_interval}
              onChange={(e) => handleChange({ refresh_interval: parseInt(e.target.value) })}
              className="w-full accent-[#2C5F2D]"
            />
            <div className="flex justify-between text-xs text-[#F5F5DC]/60 mt-1">
              <span>10 ثانية</span>
              <span className="font-bold text-[#D4AF37]">{settings.refresh_interval} ثانية</span>
              <span>120 ثانية</span>
            </div>
          </div>

          <div className="p-4 bg-[#0f0f0f] rounded-lg">
            <h4 className="font-semibold text-[#F5F5DC] mb-3">العدد الأقصى</h4>
            <input
              type="number"
              min="3"
              max="20"
              value={settings.max_items}
              onChange={(e) => handleChange({ max_items: parseInt(e.target.value) || 10 })}
              className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#2C5F2D]/30 rounded-lg text-[#F5F5DC] focus:border-[#D4AF37] focus:outline-none"
            />
          </div>
        </div>

        {/* Appearance Settings */}
        <div className="bg-[#1a1a1a] rounded-lg p-6 space-y-4 border border-[#2C5F2D]/30">
          <div className="flex items-center gap-2 mb-4">
            <Palette size={20} style={{ color: '#D4AF37' }} />
            <h3 className="font-bold text-[#D4AF37]">المظهر والتصميم</h3>
          </div>

          <div className="p-4 bg-[#0f0f0f] rounded-lg">
            <h4 className="font-semibold text-[#F5F5DC] mb-3">نمط الخلفية</h4>
            <div className="grid grid-cols-3 gap-2">
              {(['gradient', 'solid', 'glass'] as const).map((style) => (
                <button
                  key={style}
                  onClick={() => handleChange({ background_style: style })}
                  className={`p-2 rounded-lg text-sm font-medium transition-all ${
                    settings.background_style === style
                      ? 'bg-[#2C5F2D] text-[#D4AF37] border-2 border-[#D4AF37]'
                      : 'bg-[#1a1a1a] text-[#F5F5DC] border border-[#2C5F2D]/30 hover:border-[#D4AF37]/50'
                  }`}
                >
                  {style === 'gradient' ? 'تدرج' : style === 'solid' ? 'صلب' : 'زجاجي'}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 bg-[#0f0f0f] rounded-lg">
            <h4 className="font-semibold text-[#F5F5DC] mb-3">نمط الحدود</h4>
            <div className="grid grid-cols-4 gap-2">
              {(['none', 'bottom', 'top', 'both'] as const).map((style) => (
                <button
                  key={style}
                  onClick={() => handleChange({ border_style: style })}
                  className={`p-2 rounded-lg text-xs font-medium transition-all ${
                    settings.border_style === style
                      ? 'bg-[#2C5F2D] text-[#D4AF37] border-2 border-[#D4AF37]'
                      : 'bg-[#1a1a1a] text-[#F5F5DC] border border-[#2C5F2D]/30 hover:border-[#D4AF37]/50'
                  }`}
                >
                  {style === 'none' ? 'بدون' : style === 'bottom' ? 'أسفل' : style === 'top' ? 'أعلى' : 'كلاهما'}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 bg-[#0f0f0f] rounded-lg">
            <h4 className="font-semibold text-[#F5F5DC] mb-2">لون النص</h4>
            <input
              type="color"
              value={settings.text_color}
              onChange={(e) => handleChange({ text_color: e.target.value })}
              className="w-full h-12 rounded-lg cursor-pointer border-2 border-[#2C5F2D]/30"
            />
          </div>

          <div className="p-4 bg-[#0f0f0f] rounded-lg">
            <h4 className="font-semibold text-[#F5F5DC] mb-2">لون الأيقونات</h4>
            <input
              type="color"
              value={settings.icon_color}
              onChange={(e) => handleChange({ icon_color: e.target.value })}
              className="w-full h-12 rounded-lg cursor-pointer border-2 border-[#2C5F2D]/30"
            />
          </div>

          <div className="p-4 bg-[#0f0f0f] rounded-lg space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-[#F5F5DC]">التوقف عند المرور</span>
              <input
                type="checkbox"
                checked={settings.pause_on_hover}
                onChange={(e) => handleChange({ pause_on_hover: e.target.checked })}
                className="w-5 h-5 accent-[#2C5F2D]"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-[#F5F5DC]">عرض الفواصل</span>
              <input
                type="checkbox"
                checked={settings.show_separator}
                onChange={(e) => handleChange({ show_separator: e.target.checked })}
                className="w-5 h-5 accent-[#2C5F2D]"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Content Settings */}
      <div className="bg-[#1a1a1a] rounded-lg p-6 border border-[#2C5F2D]/30">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={20} style={{ color: '#D4AF37' }} />
          <h3 className="font-bold text-[#D4AF37]">المحتوى المعروض</h3>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <label className="flex items-center justify-between p-4 bg-[#0f0f0f] rounded-lg hover:bg-[#1a1a1a] cursor-pointer transition-colors">
            <div className="flex items-center gap-3">
              <ShoppingCart size={20} style={{ color: settings.icon_color }} />
              <span className="text-[#F5F5DC] font-medium">الحجوزات</span>
            </div>
            <input
              type="checkbox"
              checked={settings.show_reservations}
              onChange={(e) => handleChange({ show_reservations: e.target.checked })}
              className="w-5 h-5 accent-[#2C5F2D]"
            />
          </label>
          <label className="flex items-center justify-between p-4 bg-[#0f0f0f] rounded-lg hover:bg-[#1a1a1a] cursor-pointer transition-colors">
            <div className="flex items-center gap-3">
              <Award size={20} style={{ color: settings.icon_color }} />
              <span className="text-[#F5F5DC] font-medium">الشهادات</span>
            </div>
            <input
              type="checkbox"
              checked={settings.show_certificates}
              onChange={(e) => handleChange({ show_certificates: e.target.checked })}
              className="w-5 h-5 accent-[#2C5F2D]"
            />
          </label>
          <label className="flex items-center justify-between p-4 bg-[#0f0f0f] rounded-lg hover:bg-[#1a1a1a] cursor-pointer transition-colors">
            <div className="flex items-center gap-3">
              <TreePine size={20} style={{ color: settings.icon_color }} />
              <span className="text-[#F5F5DC] font-medium">المزارع</span>
            </div>
            <input
              type="checkbox"
              checked={settings.show_farms}
              onChange={(e) => handleChange({ show_farms: e.target.checked })}
              className="w-5 h-5 accent-[#2C5F2D]"
            />
          </label>
        </div>
      </div>

      {/* Info */}
      <div className="bg-gradient-to-r from-[#2C5F2D]/20 to-[#1E4620]/20 border border-[#D4AF37]/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Clock size={20} style={{ color: '#D4AF37', marginTop: '2px' }} />
          <div className="text-sm text-[#F5F5DC]/80">
            <p className="font-semibold mb-2" style={{ color: '#D4AF37' }}>معلومات التحديث اللحظي:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>التغييرات تظهر في المعاينة فوراً</li>
              <li>الحفظ يطبق التغييرات على الشريط الرئيسي مباشرة</li>
              <li>الإحصائيات تتحدث تلقائياً كل 5 ثواني</li>
              <li>نظام Realtime متصل ومفعل</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
