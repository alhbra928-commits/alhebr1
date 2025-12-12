import { useState, useEffect } from 'react';
import { Activity, Settings, Save, RefreshCw } from 'lucide-react';
import { LiveActivityService, LiveActivitySettings } from '../../../services/liveActivityService';

export function LiveActivityBarSettings() {
  const [settings, setSettings] = useState<LiveActivitySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
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

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      const success = await LiveActivityService.updateSettings(settings);
      if (success) {
        alert('تم حفظ الإعدادات بنجاح');
        window.location.reload();
      } else {
        alert('فشل حفظ الإعدادات');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('حدث خطأ أثناء الحفظ');
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Activity size={28} style={{ color: '#D4AF37' }} />
        <h2 className="text-2xl font-bold" style={{ color: '#D4AF37' }}>
          إعدادات شريط النشاط المباشر
        </h2>
      </div>

      <div className="bg-[#1a1a1a] rounded-lg p-6 space-y-6 border border-[#2C5F2D]/30">
        <div className="flex items-center justify-between p-4 bg-[#0f0f0f] rounded-lg">
          <div>
            <h3 className="font-semibold text-[#F5F5DC]">تفعيل الشريط</h3>
            <p className="text-sm text-[#F5F5DC]/60">إظهار شريط النشاط في المنصة</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.is_enabled}
              onChange={(e) => setSettings({ ...settings, is_enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-14 h-7 bg-gray-700 peer-focus:ring-2 peer-focus:ring-[#D4AF37] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:right-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#2C5F2D]"></div>
          </label>
        </div>

        <div className="p-4 bg-[#0f0f0f] rounded-lg">
          <h3 className="font-semibold text-[#F5F5DC] mb-3">سرعة الحركة</h3>
          <div className="grid grid-cols-3 gap-3">
            {['slow', 'medium', 'fast'].map((speed) => (
              <button
                key={speed}
                onClick={() => setSettings({ ...settings, animation_speed: speed as any })}
                className={`p-3 rounded-lg font-medium transition-all ${
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
          <h3 className="font-semibold text-[#F5F5DC] mb-4">عرض الأنشطة</h3>
          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-lg hover:bg-[#1a1a1a] cursor-pointer">
              <span className="text-[#F5F5DC]">عرض الحجوزات</span>
              <input
                type="checkbox"
                checked={settings.show_reservations}
                onChange={(e) => setSettings({ ...settings, show_reservations: e.target.checked })}
                className="w-5 h-5 accent-[#2C5F2D]"
              />
            </label>
            <label className="flex items-center justify-between p-3 rounded-lg hover:bg-[#1a1a1a] cursor-pointer">
              <span className="text-[#F5F5DC]">عرض الشهادات</span>
              <input
                type="checkbox"
                checked={settings.show_certificates}
                onChange={(e) => setSettings({ ...settings, show_certificates: e.target.checked })}
                className="w-5 h-5 accent-[#2C5F2D]"
              />
            </label>
            <label className="flex items-center justify-between p-3 rounded-lg hover:bg-[#1a1a1a] cursor-pointer">
              <span className="text-[#F5F5DC]">عرض المزارع</span>
              <input
                type="checkbox"
                checked={settings.show_farms}
                onChange={(e) => setSettings({ ...settings, show_farms: e.target.checked })}
                className="w-5 h-5 accent-[#2C5F2D]"
              />
            </label>
          </div>
        </div>

        <div className="p-4 bg-[#0f0f0f] rounded-lg">
          <h3 className="font-semibold text-[#F5F5DC] mb-3">العدد الأقصى للعناصر</h3>
          <input
            type="number"
            min="3"
            max="20"
            value={settings.max_items}
            onChange={(e) => setSettings({ ...settings, max_items: parseInt(e.target.value) || 10 })}
            className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2C5F2D]/30 rounded-lg text-[#F5F5DC] focus:border-[#D4AF37] focus:outline-none"
          />
          <p className="text-sm text-[#F5F5DC]/60 mt-2">بين 3 و 20 عنصر</p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-[#2C5F2D] to-[#1E4620] text-[#F5F5DC] rounded-lg font-semibold hover:from-[#3A7A3B] hover:to-[#2A5A2C] transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-[#D4AF37]/30"
        >
          {saving ? (
            <>
              <RefreshCw className="animate-spin" size={20} />
              جاري الحفظ...
            </>
          ) : (
            <>
              <Save size={20} />
              حفظ الإعدادات
            </>
          )}
        </button>
      </div>

      <div className="bg-[#2C5F2D]/10 border border-[#D4AF37]/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Settings size={20} style={{ color: '#D4AF37', marginTop: '2px' }} />
          <div className="text-sm text-[#F5F5DC]/80">
            <p className="font-semibold mb-2" style={{ color: '#D4AF37' }}>ملاحظات:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>يتم تحديث الأنشطة تلقائياً كل 30 ثانية</li>
              <li>يتم عرض الأنشطة الحقيقية من قاعدة البيانات</li>
              <li>الشريط يتوقف عند المرور عليه بالماوس</li>
              <li>متوافق مع جميع الأجهزة والشاشات</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
