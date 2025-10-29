import { useState, useEffect } from 'react';
import {
  Play, Pause, Settings, Palette, Zap, Eye, EyeOff,
  Plus, Trash2, GripVertical, Save, RotateCcw,
  TrendingUp, BarChart3, Calendar, Users, Sparkles
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { brandColors } from '../../finance/styles/brandColors';

interface TickerSettings {
  id: string;
  is_enabled: boolean;
  speed: number;
  background_color: string;
  text_color: string;
  height: number;
  animation_style: 'scroll' | 'fade' | 'slide';
  show_demo_data: boolean;
}

interface TickerItem {
  id: string;
  label: string;
  icon: string;
  color: string;
  data_source: 'farms' | 'reservations' | 'investors' | 'trees' | 'custom';
  custom_value: number;
  show_percentage: boolean;
  percentage_value: string;
  sort_order: number;
  is_active: boolean;
}

const iconOptions = [
  { value: 'TrendingUp', label: 'TrendingUp', icon: TrendingUp },
  { value: 'BarChart3', label: 'BarChart3', icon: BarChart3 },
  { value: 'Calendar', label: 'Calendar', icon: Calendar },
  { value: 'Users', label: 'Users', icon: Users },
  { value: 'Sparkles', label: 'Sparkles', icon: Sparkles },
];

const colorPresets = [
  { name: 'ذهبي', value: '#D4AF37' },
  { name: 'أخضر', value: '#10b981' },
  { name: 'أزرق', value: '#3b82f6' },
  { name: 'برتقالي', value: '#f59e0b' },
  { name: 'بنفسجي', value: '#8b5cf6' },
  { name: 'أحمر', value: '#ef4444' },
];

const backgroundPresets = [
  { name: 'ذهبي متدرج', value: 'linear-gradient(90deg, rgba(212, 175, 55, 0.85) 0%, rgba(184, 134, 11, 0.85) 100%)' },
  { name: 'داكن', value: 'linear-gradient(to right, #0f172a, #1e293b, #0f172a)' },
  { name: 'أزرق', value: 'linear-gradient(90deg, #1e3a8a 0%, #3b82f6 100%)' },
  { name: 'أخضر', value: 'linear-gradient(90deg, #065f46 0%, #10b981 100%)' },
];

export function AdvancedTickerControl() {
  const [settings, setSettings] = useState<TickerSettings | null>(null);
  const [items, setItems] = useState<TickerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'items' | 'design'>('general');
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // تحميل الإعدادات
      const { data: settingsData, error: settingsError } = await supabase
        .from('ticker_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (settingsError) throw settingsError;

      if (settingsData) {
        setSettings(settingsData);
      }

      // تحميل العناصر
      const { data: itemsData, error: itemsError } = await supabase
        .from('ticker_items')
        .select('*')
        .order('sort_order');

      if (itemsError) throw itemsError;

      if (itemsData) {
        setItems(itemsData);
      }
    } catch (error) {
      console.error('Error loading ticker data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!settings) return;

    try {
      setSaving(true);

      const { error } = await supabase
        .from('ticker_settings')
        .update({
          is_enabled: settings.is_enabled,
          speed: settings.speed,
          background_color: settings.background_color,
          text_color: settings.text_color,
          height: settings.height,
          animation_style: settings.animation_style,
          show_demo_data: settings.show_demo_data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', settings.id);

      if (error) throw error;

      alert('تم حفظ الإعدادات بنجاح!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('حدث خطأ في حفظ الإعدادات');
    } finally {
      setSaving(false);
    }
  };

  const saveItems = async () => {
    try {
      setSaving(true);

      for (const item of items) {
        const { error } = await supabase
          .from('ticker_items')
          .update({
            label: item.label,
            icon: item.icon,
            color: item.color,
            data_source: item.data_source,
            custom_value: item.custom_value,
            show_percentage: item.show_percentage,
            percentage_value: item.percentage_value,
            sort_order: item.sort_order,
            is_active: item.is_active,
            updated_at: new Date().toISOString(),
          })
          .eq('id', item.id);

        if (error) throw error;
      }

      alert('تم حفظ العناصر بنجاح!');
    } catch (error) {
      console.error('Error saving items:', error);
      alert('حدث خطأ في حفظ العناصر');
    } finally {
      setSaving(false);
    }
  };

  const addNewItem = async () => {
    try {
      const newItem = {
        label: 'عنصر جديد',
        icon: 'TrendingUp',
        color: '#10b981',
        data_source: 'custom' as const,
        custom_value: 0,
        show_percentage: true,
        percentage_value: '+0.0%',
        sort_order: items.length + 1,
        is_active: true,
      };

      const { data, error } = await supabase
        .from('ticker_items')
        .insert([newItem])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setItems([...items, data]);
      }
    } catch (error) {
      console.error('Error adding item:', error);
      alert('حدث خطأ في إضافة العنصر');
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا العنصر؟')) return;

    try {
      const { error } = await supabase
        .from('ticker_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setItems(items.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('حدث خطأ في حذف العنصر');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
               style={{ borderColor: brandColors.primary.gold }}></div>
          <p style={{ color: brandColors.text.secondary }}>جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center p-8">
        <p style={{ color: brandColors.text.secondary }}>لم يتم العثور على إعدادات</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl" style={{ background: 'rgba(212, 175, 55, 0.1)' }}>
            <Settings className="h-6 w-6" style={{ color: brandColors.primary.gold }} />
          </div>
          <div>
            <h2 className="text-2xl font-bold" style={{ color: brandColors.text.primary }}>
              إدارة الشريط المتحرك المتقدمة
            </h2>
            <p className="text-sm" style={{ color: brandColors.text.secondary }}>
              تحكم كامل في المظهر والمحتوى والسلوك
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Preview Toggle */}
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
            style={{
              background: previewMode ? brandColors.primary.gold : 'white',
              color: previewMode ? 'white' : brandColors.text.primary,
              border: `2px solid ${brandColors.primary.gold}`,
            }}
          >
            {previewMode ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            <span className="font-bold">{previewMode ? 'إخفاء المعاينة' : 'معاينة مباشرة'}</span>
          </button>

          {/* Enable/Disable */}
          <button
            onClick={() => setSettings({ ...settings, is_enabled: !settings.is_enabled })}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
            style={{
              background: settings.is_enabled ? '#10b981' : '#ef4444',
              color: 'white',
            }}
          >
            {settings.is_enabled ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            <span className="font-bold">{settings.is_enabled ? 'مُفعّل' : 'مُعطّل'}</span>
          </button>
        </div>
      </div>

      {/* Live Preview */}
      {previewMode && (
        <div
          className="rounded-xl p-4 overflow-hidden relative"
          style={{
            background: settings.background_color,
            height: `${settings.height}px`,
            border: '2px solid rgba(212, 175, 55, 0.3)',
          }}
        >
          <div className="flex items-center h-full whitespace-nowrap overflow-hidden">
            {items.filter(item => item.is_active).map((item, index) => (
              <div
                key={item.id}
                className="flex items-center gap-2 px-6"
                style={{ color: settings.text_color }}
              >
                <span className="text-base">{item.icon === 'TrendingUp' ? '📈' : '📊'}</span>
                <span className="font-bold">{item.label}</span>
                {item.show_percentage && (
                  <span className="text-sm opacity-75">{item.percentage_value}</span>
                )}
                {index < items.filter(item => item.is_active).length - 1 && (
                  <span className="opacity-40 mx-2">•</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b" style={{ borderColor: 'rgba(212, 175, 55, 0.2)' }}>
        {[
          { id: 'general', label: 'الإعدادات العامة', icon: Settings },
          { id: 'items', label: 'العناصر', icon: BarChart3 },
          { id: 'design', label: 'التصميم', icon: Palette },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className="flex items-center gap-2 px-6 py-3 font-bold transition-all"
            style={{
              color: activeTab === tab.id ? brandColors.primary.gold : brandColors.text.secondary,
              borderBottom: activeTab === tab.id ? `3px solid ${brandColors.primary.gold}` : '3px solid transparent',
            }}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl p-6" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        {activeTab === 'general' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: brandColors.text.primary }}>
              <Zap className="h-5 w-5" style={{ color: brandColors.primary.gold }} />
              السرعة والحركة
            </h3>

            {/* Speed Control */}
            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: brandColors.text.primary }}>
                سرعة الحركة: {settings.speed} ثانية
              </label>
              <input
                type="range"
                min="10"
                max="60"
                value={settings.speed}
                onChange={(e) => setSettings({ ...settings, speed: parseInt(e.target.value) })}
                className="w-full"
                style={{ accentColor: brandColors.primary.gold }}
              />
              <div className="flex justify-between text-xs mt-1" style={{ color: brandColors.text.secondary }}>
                <span>سريع (10s)</span>
                <span>بطيء (60s)</span>
              </div>
            </div>

            {/* Height Control */}
            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: brandColors.text.primary }}>
                الارتفاع: {settings.height}px
              </label>
              <input
                type="range"
                min="36"
                max="80"
                value={settings.height}
                onChange={(e) => setSettings({ ...settings, height: parseInt(e.target.value) })}
                className="w-full"
                style={{ accentColor: brandColors.primary.gold }}
              />
            </div>

            {/* Animation Style */}
            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: brandColors.text.primary }}>
                نوع الحركة
              </label>
              <div className="grid grid-cols-3 gap-3">
                {['scroll', 'fade', 'slide'].map((style) => (
                  <button
                    key={style}
                    onClick={() => setSettings({ ...settings, animation_style: style as any })}
                    className="px-4 py-3 rounded-lg font-bold transition-all"
                    style={{
                      background: settings.animation_style === style
                        ? brandColors.primary.gold
                        : 'white',
                      color: settings.animation_style === style
                        ? 'white'
                        : brandColors.text.primary,
                      border: `2px solid ${brandColors.primary.gold}`,
                    }}
                  >
                    {style === 'scroll' ? 'تمرير' : style === 'fade' ? 'تلاشي' : 'انزلاق'}
                  </button>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={saveSettings}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-bold transition-all"
              style={{
                background: brandColors.primary.gold,
                color: 'white',
                opacity: saving ? 0.6 : 1,
              }}
            >
              <Save className="h-5 w-5" />
              {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
            </button>
          </div>
        )}

        {activeTab === 'items' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold" style={{ color: brandColors.text.primary }}>
                العناصر المعروضة ({items.length})
              </h3>
              <button
                onClick={addNewItem}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all"
                style={{
                  background: brandColors.primary.gold,
                  color: 'white',
                }}
              >
                <Plus className="h-4 w-4" />
                إضافة عنصر
              </button>
            </div>

            {items.map((item, index) => (
              <div
                key={item.id}
                className="p-4 rounded-lg"
                style={{
                  background: 'rgba(248, 250, 252, 0.5)',
                  border: '1px solid rgba(212, 175, 55, 0.2)',
                }}
              >
                <div className="flex items-start gap-4">
                  <GripVertical className="h-5 w-5 mt-2" style={{ color: brandColors.text.secondary }} />

                  <div className="flex-1 grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold mb-1" style={{ color: brandColors.text.secondary }}>
                        النص
                      </label>
                      <input
                        type="text"
                        value={item.label}
                        onChange={(e) => {
                          const updated = [...items];
                          updated[index].label = e.target.value;
                          setItems(updated);
                        }}
                        className="w-full px-3 py-2 rounded-lg border"
                        style={{ borderColor: 'rgba(212, 175, 55, 0.3)' }}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold mb-1" style={{ color: brandColors.text.secondary }}>
                        اللون
                      </label>
                      <div className="flex gap-2">
                        {colorPresets.slice(0, 4).map((preset) => (
                          <button
                            key={preset.value}
                            onClick={() => {
                              const updated = [...items];
                              updated[index].color = preset.value;
                              setItems(updated);
                            }}
                            className="w-10 h-10 rounded-lg border-2 transition-all"
                            style={{
                              background: preset.value,
                              borderColor: item.color === preset.value ? brandColors.primary.gold : 'transparent',
                            }}
                            title={preset.name}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const updated = [...items];
                        updated[index].is_active = !updated[index].is_active;
                        setItems(updated);
                      }}
                      className="p-2 rounded-lg transition-all"
                      style={{
                        background: item.is_active ? '#10b981' : '#ef4444',
                        color: 'white',
                      }}
                    >
                      {item.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>

                    <button
                      onClick={() => deleteItem(item.id)}
                      className="p-2 rounded-lg transition-all hover:scale-110"
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={saveItems}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-bold transition-all"
              style={{
                background: brandColors.primary.gold,
                color: 'white',
                opacity: saving ? 0.6 : 1,
              }}
            >
              <Save className="h-5 w-5" />
              {saving ? 'جاري الحفظ...' : 'حفظ العناصر'}
            </button>
          </div>
        )}

        {activeTab === 'design' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: brandColors.text.primary }}>
              <Palette className="h-5 w-5" style={{ color: brandColors.primary.gold }} />
              الألوان والتصميم
            </h3>

            {/* Background Color */}
            <div>
              <label className="block text-sm font-bold mb-3" style={{ color: brandColors.text.primary }}>
                لون الخلفية
              </label>
              <div className="grid grid-cols-2 gap-3">
                {backgroundPresets.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => setSettings({ ...settings, background_color: preset.value })}
                    className="h-16 rounded-lg border-2 transition-all font-bold text-white text-sm"
                    style={{
                      background: preset.value,
                      borderColor: settings.background_color === preset.value ? 'white' : 'transparent',
                      boxShadow: settings.background_color === preset.value ? '0 4px 20px rgba(212, 175, 55, 0.4)' : 'none',
                    }}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Text Color */}
            <div>
              <label className="block text-sm font-bold mb-3" style={{ color: brandColors.text.primary }}>
                لون النص
              </label>
              <div className="flex gap-3">
                {['#ffffff', '#000000', brandColors.primary.gold].map((color) => (
                  <button
                    key={color}
                    onClick={() => setSettings({ ...settings, text_color: color })}
                    className="w-16 h-16 rounded-lg border-2 transition-all"
                    style={{
                      background: color,
                      borderColor: settings.text_color === color ? brandColors.primary.gold : 'transparent',
                    }}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={saveSettings}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-bold transition-all"
              style={{
                background: brandColors.primary.gold,
                color: 'white',
                opacity: saving ? 0.6 : 1,
              }}
            >
              <Save className="h-5 w-5" />
              {saving ? 'جاري الحفظ...' : 'حفظ التصميم'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
