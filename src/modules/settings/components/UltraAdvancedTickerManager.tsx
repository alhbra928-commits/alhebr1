import { useState, useEffect } from 'react';
import {
  BarChart3, Plus, Trash2, Edit2, Save, X, Power, Zap, Clock,
  TrendingUp, Check, MoveUp, MoveDown, Eye, EyeOff, Copy, RefreshCw,
  Sparkles, Settings, PlayCircle, PauseCircle, Crown, Star,
  AlertCircle, Layout, Monitor, Smartphone, Activity,
  ChevronDown, ChevronUp, Maximize2, Minimize2, Gauge,
  FastForward, Rewind, SkipForward, SkipBack
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface TickerSettings {
  id?: string;
  ticker_type: 'header' | 'main';
  is_enabled: boolean;
  animation_speed: number; // seconds
  animation_direction: 'rtl' | 'ltr';
  pause_on_hover: boolean;
  auto_start: boolean;
  loop_seamless: boolean;
  background_color: string;
  text_size: 'sm' | 'base' | 'lg' | 'xl';
  icon_size: 'sm' | 'base' | 'lg';
  padding_y: number;
  border_top: boolean;
  border_bottom: boolean;
  gradient_edges: boolean;
  edge_width: number;
  updated_at?: string;
}

interface TickerMessage {
  id?: string;
  ticker_type: 'header' | 'main';
  content_ar: string;
  content_en?: string;
  icon_name: string;
  icon_color: string;
  text_color: string;
  is_active: boolean;
  sort_order: number;
  created_at?: string;
}

const iconOptions = [
  { value: 'Star', label: 'نجمة', icon: Star },
  { value: 'Crown', label: 'تاج', icon: Crown },
  { value: 'Sparkles', label: 'بريق', icon: Sparkles },
  { value: 'Zap', label: 'برق', icon: Zap },
  { value: 'TrendingUp', label: 'نمو', icon: TrendingUp },
  { value: 'Activity', label: 'نشاط', icon: Activity },
];

const colorOptions = [
  { value: 'emerald-600', label: 'أخضر زمردي', color: '#059669' },
  { value: 'green-600', label: 'أخضر', color: '#16a34a' },
  { value: 'teal-600', label: 'تيل', color: '#0d9488' },
  { value: 'blue-600', label: 'أزرق', color: '#2563eb' },
  { value: 'purple-600', label: 'بنفسجي', color: '#9333ea' },
  { value: 'amber-600', label: 'كهرماني', color: '#d97706' },
];

export function UltraAdvancedTickerManager() {
  const [activeTickerType, setActiveTickerType] = useState<'header' | 'main'>('main');
  const [settings, setSettings] = useState<TickerSettings | null>(null);
  const [messages, setMessages] = useState<TickerMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingMessage, setEditingMessage] = useState<TickerMessage | null>(null);
  const [showNewMessageForm, setShowNewMessageForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'settings' | 'messages' | 'preview'>('settings');

  useEffect(() => {
    loadData();
  }, [activeTickerType]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load settings
      const { data: settingsData } = await supabase
        .from('ticker_settings')
        .select('*')
        .eq('ticker_type', activeTickerType)
        .single();

      if (settingsData) {
        setSettings(settingsData);
      } else {
        // Create default settings
        const defaultSettings: TickerSettings = {
          ticker_type: activeTickerType,
          is_enabled: true,
          animation_speed: activeTickerType === 'header' ? 30 : 35,
          animation_direction: 'rtl',
          pause_on_hover: true,
          auto_start: true,
          loop_seamless: true,
          background_color: 'emerald-50',
          text_size: activeTickerType === 'header' ? 'sm' : 'base',
          icon_size: activeTickerType === 'header' ? 'sm' : 'base',
          padding_y: activeTickerType === 'header' ? 2.5 : 3,
          border_top: true,
          border_bottom: true,
          gradient_edges: true,
          edge_width: 20,
        };
        setSettings(defaultSettings);
      }

      // Load messages
      const { data: messagesData } = await supabase
        .from('ticker_items')
        .select('*')
        .eq('ticker_type', activeTickerType)
        .order('sort_order');

      setMessages(messagesData || []);
    } catch (error) {
      console.error('Error loading ticker data:', error);
    }
    setLoading(false);
  };

  const handleUpdateSettings = async (updates: Partial<TickerSettings>) => {
    if (!settings) return;
    setSaving(true);

    try {
      const updatedSettings = { ...settings, ...updates };

      const { error } = await supabase
        .from('ticker_settings')
        .upsert({
          ...updatedSettings,
          updated_at: new Date().toISOString(),
        });

      if (!error) {
        setSettings(updatedSettings);
        setTimeout(() => setSaving(false), 1000);
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      setSaving(false);
    }
  };

  const handleSaveMessage = async (message: TickerMessage) => {
    setSaving(true);
    try {
      if (message.id) {
        // Update existing
        const { error } = await supabase
          .from('ticker_items')
          .update({
            label: message.content_ar, // Keep label in sync
            label_en: message.content_en || null,
            icon: message.icon_name || 'Star',
            color: message.icon_color || 'emerald-600',
            content_ar: message.content_ar,
            content_en: message.content_en,
            icon_name: message.icon_name,
            icon_color: message.icon_color,
            text_color: message.text_color,
            is_active: message.is_active,
            sort_order: message.sort_order,
          })
          .eq('id', message.id);

        if (error) {
          console.error('Error updating message:', error);
          alert('حدث خطأ في تحديث الرسالة: ' + error.message);
          return;
        }
        console.log('✅ Message updated successfully');
      } else {
        // Insert new
        const { data, error } = await supabase
          .from('ticker_items')
          .insert([{
            ticker_type: message.ticker_type,
            label: message.content_ar, // Required NOT NULL field
            label_en: message.content_en || null,
            icon: message.icon_name || 'Star',
            color: message.icon_color || 'emerald-600',
            content_ar: message.content_ar,
            content_en: message.content_en || null,
            icon_name: message.icon_name,
            icon_color: message.icon_color,
            text_color: message.text_color,
            is_active: message.is_active,
            sort_order: messages.length,
          }])
          .select()
          .single();

        if (error) {
          console.error('Error inserting message:', error);
          alert('حدث خطأ في إضافة الرسالة: ' + error.message);
          return;
        }

        if (data) {
          console.log('✅ Message inserted successfully:', data);
          setMessages([...messages, data]);
        }
      }

      // Reload messages only (without triggering loading state)
      const { data: messagesData } = await supabase
        .from('ticker_items')
        .select('*')
        .eq('ticker_type', activeTickerType)
        .order('sort_order');

      setMessages(messagesData || []);
      setEditingMessage(null);
      setShowNewMessageForm(false);
      alert('تم حفظ الرسالة بنجاح!');
    } catch (error) {
      console.error('Error saving message:', error);
      alert('حدث خطأ غير متوقع');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الرسالة؟')) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('ticker_items')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting message:', error);
        alert('حدث خطأ في حذف الرسالة: ' + error.message);
        return;
      }

      console.log('✅ Message deleted successfully');
      setMessages(messages.filter(m => m.id !== id));
      alert('تم حذف الرسالة بنجاح!');
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('حدث خطأ غير متوقع');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleMessage = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('ticker_items')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) {
        console.error('Error toggling message:', error);
        alert('حدث خطأ في تغيير حالة الرسالة: ' + error.message);
        return;
      }

      console.log('✅ Message toggled successfully');
      setMessages(messages.map(m =>
        m.id === id ? { ...m, is_active: isActive } : m
      ));
    } catch (error) {
      console.error('Error toggling message:', error);
      alert('حدث خطأ غير متوقع');
    }
  };

  const handleMoveMessage = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === messages.length - 1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const newMessages = [...messages];
    [newMessages[index], newMessages[newIndex]] = [newMessages[newIndex], newMessages[index]];

    // Update sort_order
    const updates = newMessages.map((msg, idx) => ({
      id: msg.id,
      sort_order: idx,
    }));

    setSaving(true);
    try {
      for (const update of updates) {
        const { error } = await supabase
          .from('ticker_items')
          .update({ sort_order: update.sort_order })
          .eq('id', update.id);

        if (error) {
          console.error('Error updating sort order:', error);
          alert('حدث خطأ في إعادة ترتيب الرسائل: ' + error.message);
          return;
        }
      }

      console.log('✅ Messages reordered successfully');
      setMessages(newMessages.map((msg, idx) => ({ ...msg, sort_order: idx })));
    } catch (error) {
      console.error('Error reordering messages:', error);
      alert('حدث خطأ غير متوقع');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">إدارة الشريط المتحرك المتطورة</h2>
            <p className="text-emerald-50">تحكم كامل في الرسائل والحركة والتصميم</p>
          </div>
          <Activity className="w-12 h-12 opacity-50" />
        </div>
      </div>

      {/* Ticker Type Selector */}
      <div className="bg-white rounded-xl shadow-sm border-2 border-gray-100 p-4">
        <div className="flex items-center gap-3">
          <Monitor className="w-5 h-5 text-gray-400" />
          <span className="text-sm font-bold text-gray-700">اختر الشريط:</span>
          <div className="flex gap-2 flex-1">
            <button
              onClick={() => setActiveTickerType('header')}
              className={`flex-1 px-4 py-2.5 rounded-lg font-bold transition-all ${
                activeTickerType === 'header'
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Layout className="w-4 h-4" />
                <span>شريط الهيدر</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTickerType('main')}
              className={`flex-1 px-4 py-2.5 rounded-lg font-bold transition-all ${
                activeTickerType === 'main'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Crown className="w-4 h-4" />
                <span>شريط المنصة الرئيسية</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border-2 border-gray-100 overflow-hidden">
        <div className="flex border-b-2 border-gray-100">
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 px-6 py-4 font-bold transition-colors ${
              activeTab === 'settings'
                ? 'bg-emerald-50 text-emerald-700 border-b-2 border-emerald-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Settings className="w-5 h-5" />
              <span>الإعدادات العامة</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`flex-1 px-6 py-4 font-bold transition-colors ${
              activeTab === 'messages'
                ? 'bg-emerald-50 text-emerald-700 border-b-2 border-emerald-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5" />
              <span>الرسائل ({messages.length})</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex-1 px-6 py-4 font-bold transition-colors ${
              activeTab === 'preview'
                ? 'bg-emerald-50 text-emerald-700 border-b-2 border-emerald-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Eye className="w-5 h-5" />
              <span>معاينة مباشرة</span>
            </div>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'settings' && (
            <SettingsTab settings={settings} onUpdate={handleUpdateSettings} saving={saving} />
          )}

          {activeTab === 'messages' && (
            <MessagesTab
              messages={messages}
              onAdd={() => setShowNewMessageForm(true)}
              onEdit={setEditingMessage}
              onDelete={handleDeleteMessage}
              onToggle={handleToggleMessage}
              onMove={handleMoveMessage}
            />
          )}

          {activeTab === 'preview' && (
            <PreviewTab settings={settings} messages={messages.filter(m => m.is_active)} />
          )}
        </div>
      </div>

      {/* Message Form Modal */}
      {(showNewMessageForm || editingMessage) && (
        <MessageFormModal
          message={editingMessage}
          tickerType={activeTickerType}
          onSave={handleSaveMessage}
          onClose={() => {
            setShowNewMessageForm(false);
            setEditingMessage(null);
          }}
        />
      )}
    </div>
  );
}

// Settings Tab Component
function SettingsTab({
  settings,
  onUpdate,
  saving
}: {
  settings: TickerSettings;
  onUpdate: (updates: Partial<TickerSettings>) => void;
  saving: boolean;
}) {
  return (
    <div className="space-y-6">
      {/* Enable/Disable */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border-2 border-emerald-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">تفعيل الشريط</h3>
            <p className="text-sm text-gray-600">تشغيل أو إيقاف عرض الشريط المتحرك</p>
          </div>
          <button
            onClick={() => onUpdate({ is_enabled: !settings.is_enabled })}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
              settings.is_enabled ? 'bg-emerald-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                settings.is_enabled ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Animation Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Speed Control */}
        <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Gauge className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">سرعة الحركة</h3>
              <p className="text-xs text-gray-500">مدة الدورة الكاملة (بالثواني)</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => onUpdate({ animation_speed: Math.max(10, settings.animation_speed - 5) })}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <FastForward className="w-4 h-4 text-gray-700 transform rotate-180" />
              </button>

              <input
                type="range"
                min="10"
                max="60"
                step="5"
                value={settings.animation_speed}
                onChange={(e) => onUpdate({ animation_speed: parseInt(e.target.value) })}
                className="flex-1"
              />

              <button
                onClick={() => onUpdate({ animation_speed: Math.min(60, settings.animation_speed + 5) })}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Rewind className="w-4 h-4 text-gray-700 transform rotate-180" />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-emerald-600">{settings.animation_speed}s</span>
              <div className="flex gap-2">
                <button
                  onClick={() => onUpdate({ animation_speed: 15 })}
                  className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-bold"
                >
                  سريع (15s)
                </button>
                <button
                  onClick={() => onUpdate({ animation_speed: 30 })}
                  className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-bold"
                >
                  متوسط (30s)
                </button>
                <button
                  onClick={() => onUpdate({ animation_speed: 45 })}
                  className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 font-bold"
                >
                  بطيء (45s)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Direction */}
        <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <SkipForward className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">اتجاه الحركة</h3>
              <p className="text-xs text-gray-500">من اليمين لليسار أو العكس</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onUpdate({ animation_direction: 'rtl' })}
              className={`p-4 rounded-xl font-bold transition-all ${
                settings.animation_direction === 'rtl'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <SkipBack className="w-6 h-6" />
                <span>← من اليمين</span>
              </div>
            </button>
            <button
              onClick={() => onUpdate({ animation_direction: 'ltr' })}
              className={`p-4 rounded-xl font-bold transition-all ${
                settings.animation_direction === 'ltr'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <SkipForward className="w-6 h-6" />
                <span>من اليسار →</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Behavior Settings */}
      <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <PlayCircle className="w-5 h-5 text-emerald-600" />
          <span>سلوك الحركة</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <ToggleOption
            label="توقف عند التمرير"
            description="يتوقف عند وضع المؤشر"
            icon={PauseCircle}
            checked={settings.pause_on_hover}
            onChange={(checked) => onUpdate({ pause_on_hover: checked })}
          />

          <ToggleOption
            label="تشغيل تلقائي"
            description="يبدأ مباشرة عند التحميل"
            icon={PlayCircle}
            checked={settings.auto_start}
            onChange={(checked) => onUpdate({ auto_start: checked })}
          />

          <ToggleOption
            label="دوران سلس"
            description="بدون توقف بين الدورات"
            icon={RefreshCw}
            checked={settings.loop_seamless}
            onChange={(checked) => onUpdate({ loop_seamless: checked })}
          />

          <ToggleOption
            label="حواف متدرجة"
            description="تأثير fade على الأطراف"
            icon={Sparkles}
            checked={settings.gradient_edges}
            onChange={(checked) => onUpdate({ gradient_edges: checked })}
          />
        </div>
      </div>

      {/* Design Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Text Size */}
        <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
          <h3 className="font-bold text-gray-800 mb-4">حجم النص</h3>
          <div className="grid grid-cols-4 gap-2">
            {['sm', 'base', 'lg', 'xl'].map((size) => (
              <button
                key={size}
                onClick={() => onUpdate({ text_size: size as any })}
                className={`p-3 rounded-lg font-bold transition-all ${
                  settings.text_size === size
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Icon Size */}
        <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
          <h3 className="font-bold text-gray-800 mb-4">حجم الأيقونات</h3>
          <div className="grid grid-cols-3 gap-2">
            {['sm', 'base', 'lg'].map((size) => (
              <button
                key={size}
                onClick={() => onUpdate({ icon_size: size as any })}
                className={`p-3 rounded-lg font-bold transition-all ${
                  settings.icon_size === size
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Borders */}
      <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
        <h3 className="font-bold text-gray-800 mb-4">الحدود</h3>
        <div className="flex gap-4">
          <label className="flex items-center gap-3 flex-1 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.border_top}
              onChange={(e) => onUpdate({ border_top: e.target.checked })}
              className="w-5 h-5 text-emerald-600"
            />
            <span className="font-medium text-gray-700">حد علوي</span>
          </label>
          <label className="flex items-center gap-3 flex-1 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.border_bottom}
              onChange={(e) => onUpdate({ border_bottom: e.target.checked })}
              className="w-5 h-5 text-emerald-600"
            />
            <span className="font-medium text-gray-700">حد سفلي</span>
          </label>
        </div>
      </div>

      {/* Save Indicator */}
      {saving && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-emerald-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 animate-bounce">
          <Check className="w-5 h-5" />
          <span className="font-bold">تم الحفظ بنجاح!</span>
        </div>
      )}
    </div>
  );
}

// Messages Tab Component
function MessagesTab({
  messages,
  onAdd,
  onEdit,
  onDelete,
  onToggle,
  onMove
}: {
  messages: TickerMessage[];
  onAdd: () => void;
  onEdit: (message: TickerMessage) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, isActive: boolean) => void;
  onMove: (index: number, direction: 'up' | 'down') => void;
}) {
  return (
    <div className="space-y-4">
      {/* Add Button */}
      <button
        onClick={onAdd}
        className="w-full p-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
      >
        <Plus className="w-5 h-5" />
        <span>إضافة رسالة جديدة</span>
      </button>

      {/* Messages List */}
      {messages.length === 0 ? (
        <div className="text-center py-12">
          <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">لا توجد رسائل بعد</p>
          <p className="text-sm text-gray-400">ابدأ بإضافة رسالة جديدة</p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((message, index) => (
            <MessageCard
              key={message.id}
              message={message}
              index={index}
              total={messages.length}
              onEdit={() => onEdit(message)}
              onDelete={() => onDelete(message.id!)}
              onToggle={(isActive) => onToggle(message.id!, isActive)}
              onMoveUp={() => onMove(index, 'up')}
              onMoveDown={() => onMove(index, 'down')}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Message Card Component
function MessageCard({
  message,
  index,
  total,
  onEdit,
  onDelete,
  onToggle,
  onMoveUp,
  onMoveDown
}: {
  message: TickerMessage;
  index: number;
  total: number;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: (isActive: boolean) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const IconComponent = iconOptions.find(opt => opt.value === message.icon_name)?.icon || Star;

  return (
    <div className={`bg-white rounded-xl p-4 border-2 transition-all ${
      message.is_active ? 'border-emerald-200' : 'border-gray-200 opacity-60'
    }`}>
      <div className="flex items-center gap-4">
        {/* Icon Preview */}
        <div className={`p-3 rounded-lg bg-${message.icon_color.replace('-600', '-100')}`}>
          <IconComponent className={`w-6 h-6 text-${message.icon_color}`} />
        </div>

        {/* Content */}
        <div className="flex-1">
          <p className={`font-bold text-${message.text_color}`}>{message.content_ar}</p>
          {message.content_en && (
            <p className="text-sm text-gray-500">{message.content_en}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Move Buttons */}
          <div className="flex flex-col gap-1">
            <button
              onClick={onMoveUp}
              disabled={index === 0}
              className="p-1 bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronUp className="w-4 h-4 text-gray-700" />
            </button>
            <button
              onClick={onMoveDown}
              disabled={index === total - 1}
              className="p-1 bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronDown className="w-4 h-4 text-gray-700" />
            </button>
          </div>

          {/* Toggle */}
          <button
            onClick={() => onToggle(!message.is_active)}
            className={`p-2 rounded-lg transition-colors ${
              message.is_active
                ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
            }`}
          >
            {message.is_active ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
          </button>

          {/* Edit */}
          <button
            onClick={onEdit}
            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
          >
            <Edit2 className="w-5 h-5" />
          </button>

          {/* Delete */}
          <button
            onClick={onDelete}
            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Preview Tab Component
function PreviewTab({
  settings,
  messages
}: {
  settings: TickerSettings;
  messages: TickerMessage[];
}) {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
        <div className="flex items-center gap-3 mb-4">
          <Eye className="w-6 h-6 text-blue-600" />
          <div>
            <h3 className="font-bold text-gray-800">معاينة مباشرة</h3>
            <p className="text-sm text-gray-600">هذا شكل الشريط على المنصة</p>
          </div>
        </div>

        {/* Live Preview */}
        <div className="bg-white rounded-xl overflow-hidden shadow-lg">
          <div className={`relative overflow-hidden ${
            settings.border_top ? 'border-t-2' : ''
          } ${
            settings.border_bottom ? 'border-b-2' : ''
          } border-emerald-200 bg-gradient-to-r from-emerald-50/80 via-green-50/80 to-teal-50/80`}
          style={{ padding: `${settings.padding_y * 0.25}rem 0` }}>
            <div className="ticker-preview-container">
              <div
                className="ticker-preview-content"
                style={{
                  animationDuration: `${settings.animation_speed}s`,
                  animationPlayState: settings.auto_start ? 'running' : 'paused',
                  animationDirection: settings.animation_direction === 'rtl' ? 'normal' : 'reverse',
                }}
              >
                {messages.concat(messages).map((msg, idx) => {
                  const IconComponent = iconOptions.find(opt => opt.value === msg.icon_name)?.icon || Star;
                  const iconSizeClass = settings.icon_size === 'sm' ? 'w-4 h-4' : settings.icon_size === 'base' ? 'w-5 h-5' : 'w-6 h-6';
                  const textSizeClass = settings.text_size === 'sm' ? 'text-sm' : settings.text_size === 'base' ? 'text-base' : settings.text_size === 'lg' ? 'text-lg' : 'text-xl';

                  return (
                    <div key={idx} className="ticker-preview-item">
                      <IconComponent className={`${iconSizeClass} text-${msg.icon_color}`} />
                      <span className={`${textSizeClass} font-bold text-${msg.text_color}`}>
                        {msg.content_ar}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Gradient Edges */}
            {settings.gradient_edges && (
              <>
                <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-white/90 to-transparent pointer-events-none"
                  style={{ width: `${settings.edge_width}px` }} />
                <div className="absolute inset-y-0 right-0 bg-gradient-to-l from-white/90 to-transparent pointer-events-none"
                  style={{ width: `${settings.edge_width}px` }} />
              </>
            )}
          </div>
        </div>

        <style>{`
          .ticker-preview-container {
            width: 100%;
            overflow: hidden;
          }

          .ticker-preview-content {
            display: flex;
            animation: ticker-preview ${settings.animation_speed}s linear infinite;
            will-change: transform;
          }

          .ticker-preview-content:hover {
            animation-play-state: ${settings.pause_on_hover ? 'paused' : 'running'};
          }

          .ticker-preview-item {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0 3rem;
            white-space: nowrap;
            flex-shrink: 0;
          }

          @keyframes ticker-preview {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }
        `}</style>
      </div>

      {/* Settings Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border-2 border-gray-200 text-center">
          <Clock className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-800">{settings.animation_speed}s</p>
          <p className="text-xs text-gray-500">سرعة الدورة</p>
        </div>
        <div className="bg-white rounded-lg p-4 border-2 border-gray-200 text-center">
          <Sparkles className="w-6 h-6 text-blue-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-800">{messages.length}</p>
          <p className="text-xs text-gray-500">عدد الرسائل</p>
        </div>
        <div className="bg-white rounded-lg p-4 border-2 border-gray-200 text-center">
          <Activity className="w-6 h-6 text-purple-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-800">{settings.animation_direction.toUpperCase()}</p>
          <p className="text-xs text-gray-500">الاتجاه</p>
        </div>
        <div className="bg-white rounded-lg p-4 border-2 border-gray-200 text-center">
          {settings.is_enabled ? (
            <Power className="w-6 h-6 text-green-600 mx-auto mb-2" />
          ) : (
            <PauseCircle className="w-6 h-6 text-gray-400 mx-auto mb-2" />
          )}
          <p className="text-2xl font-bold text-gray-800">{settings.is_enabled ? 'مفعّل' : 'متوقف'}</p>
          <p className="text-xs text-gray-500">الحالة</p>
        </div>
      </div>
    </div>
  );
}

// Toggle Option Component
function ToggleOption({
  label,
  description,
  icon: Icon,
  checked,
  onChange
}: {
  label: string;
  description: string;
  icon: any;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
      checked
        ? 'bg-emerald-50 border-emerald-300'
        : 'bg-gray-50 border-gray-200 hover:border-gray-300'
    }`}
    onClick={() => onChange(!checked)}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 mt-0.5 ${checked ? 'text-emerald-600' : 'text-gray-400'}`} />
        <div className="flex-1">
          <p className={`font-bold text-sm ${checked ? 'text-emerald-800' : 'text-gray-700'}`}>
            {label}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        </div>
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
          checked ? 'bg-emerald-600 border-emerald-600' : 'border-gray-300'
        }`}>
          {checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
        </div>
      </div>
    </div>
  );
}

// Message Form Modal Component
function MessageFormModal({
  message,
  tickerType,
  onSave,
  onClose
}: {
  message: TickerMessage | null;
  tickerType: 'header' | 'main';
  onSave: (message: TickerMessage) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState<TickerMessage>(
    message || {
      ticker_type: tickerType,
      content_ar: '',
      content_en: '',
      icon_name: 'Star',
      icon_color: 'emerald-600',
      text_color: 'emerald-800',
      is_active: true,
      sort_order: 0,
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const IconComponent = iconOptions.find(opt => opt.value === formData.icon_name)?.icon || Star;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">
              {message ? 'تعديل الرسالة' : 'رسالة جديدة'}
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Preview */}
          <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
            <p className="text-xs font-bold text-gray-500 mb-3">معاينة:</p>
            <div className="flex items-center gap-3 justify-center">
              <IconComponent className={`w-6 h-6 text-${formData.icon_color}`} />
              <span className={`text-lg font-bold text-${formData.text_color}`}>
                {formData.content_ar || 'النص العربي'}
              </span>
            </div>
          </div>

          {/* Arabic Content */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              النص بالعربية <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.content_ar}
              onChange={(e) => setFormData({ ...formData, content_ar: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-emerald-500 outline-none"
              placeholder="مثال: استثمر في مستقبل أخضر مستدام"
              required
            />
          </div>

          {/* English Content */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              النص بالإنجليزية (اختياري)
            </label>
            <input
              type="text"
              value={formData.content_en || ''}
              onChange={(e) => setFormData({ ...formData, content_en: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-emerald-500 outline-none"
              placeholder="Example: Invest in a sustainable green future"
            />
          </div>

          {/* Icon Selection */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              الأيقونة
            </label>
            <div className="grid grid-cols-3 gap-3">
              {iconOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon_name: option.value })}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.icon_name === option.value
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-6 h-6 mx-auto mb-2" />
                    <p className="text-xs font-bold">{option.label}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Colors */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                لون الأيقونة
              </label>
              <div className="grid grid-cols-3 gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon_color: color.value })}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      formData.icon_color === color.value
                        ? 'border-gray-800 ring-2 ring-gray-300'
                        : 'border-gray-200'
                    }`}
                    style={{ backgroundColor: color.color + '20' }}
                  >
                    <div
                      className="w-6 h-6 rounded-full mx-auto"
                      style={{ backgroundColor: color.color }}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                لون النص
              </label>
              <div className="grid grid-cols-3 gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, text_color: color.value.replace('-600', '-800') })}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      formData.text_color === color.value.replace('-600', '-800')
                        ? 'border-gray-800 ring-2 ring-gray-300'
                        : 'border-gray-200'
                    }`}
                    style={{ backgroundColor: color.color + '20' }}
                  >
                    <div
                      className="w-6 h-6 rounded-full mx-auto"
                      style={{ backgroundColor: color.color }}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Active Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="font-bold text-gray-800">تفعيل الرسالة</p>
              <p className="text-sm text-gray-500">عرض في الشريط المتحرك</p>
            </div>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                formData.is_active ? 'bg-emerald-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  formData.is_active ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
            >
              {message ? 'تحديث' : 'إضافة'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
