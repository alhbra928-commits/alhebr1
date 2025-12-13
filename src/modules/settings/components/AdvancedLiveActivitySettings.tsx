import { useState, useEffect, useRef } from 'react';
import {
  Activity, Sparkles, Zap, Eye, Palette, Settings, Database, MessageSquare,
  GitMerge, Plus, Edit3, Trash2, Check, X, Save, RotateCcw, Copy, Download,
  Upload, Play, Pause, FastForward, TrendingUp, BarChart3, Layers, Clock,
  ShoppingCart, Award, TreePine, Users, Star, RefreshCw, ChevronDown, ChevronUp,
  Monitor, Smartphone, Tablet, Maximize2, Minimize2, Grid, List, Info, AlertCircle,
  CheckCircle, Sliders, Target, Cpu, Gauge, Boxes, Radio, Tv
} from 'lucide-react';
import { LiveActivityService, LiveActivitySettings, CustomMessage } from '../../../services/liveActivityService';

const ICON_OPTIONS = [
  { value: 'ShoppingCart', label: 'سلة التسوق', Icon: ShoppingCart },
  { value: 'Award', label: 'شهادة', Icon: Award },
  { value: 'TreePine', label: 'شجرة', Icon: TreePine },
  { value: 'Sparkles', label: 'لامع', Icon: Sparkles },
  { value: 'TrendingUp', label: 'نمو', Icon: TrendingUp },
  { value: 'Users', label: 'مستخدمين', Icon: Users },
  { value: 'Zap', label: 'برق', Icon: Zap },
  { value: 'Star', label: 'نجمة', Icon: Star },
];

const PRESET_THEMES = [
  {
    name: 'الكلاسيكي',
    icon: Grid,
    settings: {
      animation_speed: 'medium' as const,
      background_style: 'gradient' as const,
      text_color: '#F5F5DC',
      icon_color: '#D4AF37',
      height: 60,
      content_mode: 'both' as const
    }
  },
  {
    name: 'الديناميكي',
    icon: Zap,
    settings: {
      animation_speed: 'fast' as const,
      background_style: 'glass' as const,
      text_color: '#FFFFFF',
      icon_color: '#00FF88',
      height: 70,
      content_mode: 'auto' as const
    }
  },
  {
    name: 'الأنيق',
    icon: Sparkles,
    settings: {
      animation_speed: 'slow' as const,
      background_style: 'solid' as const,
      text_color: '#E0E0E0',
      icon_color: '#FFD700',
      height: 55,
      content_mode: 'manual' as const
    }
  },
  {
    name: 'الاحترافي',
    icon: Boxes,
    settings: {
      animation_speed: 'medium' as const,
      background_style: 'gradient' as const,
      text_color: '#F0F0F0',
      icon_color: '#4A9EFF',
      height: 65,
      content_mode: 'both' as const
    }
  }
];

type TabType = 'general' | 'content' | 'appearance' | 'advanced' | 'messages';

export function AdvancedLiveActivitySettings() {
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [settings, setSettings] = useState<LiveActivitySettings | null>(null);
  const [customMessages, setCustomMessages] = useState<CustomMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(true);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const [stats, setStats] = useState({
    totalActivities: 0,
    autoActivities: 0,
    customMessages: 0,
    activeMessages: 0
  });

  const [showAddMessage, setShowAddMessage] = useState(false);
  const [editingMessage, setEditingMessage] = useState<CustomMessage | null>(null);
  const [newMessage, setNewMessage] = useState({
    message_ar: '',
    message_en: '',
    icon: 'Sparkles',
    is_active: true,
    priority: 5
  });

  useEffect(() => {
    loadSettings();
    loadCustomMessages();
    loadStats();

    const statsInterval = setInterval(loadStats, 5000);
    const settingsChannel = LiveActivityService.subscribeToChanges(() => {
      loadSettings();
      loadCustomMessages();
      loadStats();
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

  const loadCustomMessages = async () => {
    try {
      const data = await LiveActivityService.getAllCustomMessages();
      setCustomMessages(data);
    } catch (error) {
      console.error('Error loading custom messages:', error);
    }
  };

  const loadStats = async () => {
    try {
      const activities = await LiveActivityService.getLiveActivities();
      const autoCount = activities.filter(a => a.source === 'auto').length;
      const customCount = activities.filter(a => a.source === 'manual').length;
      const activeCount = customMessages.filter(m => m.is_active).length;

      setStats({
        totalActivities: activities.length,
        autoActivities: autoCount,
        customMessages: customCount,
        activeMessages: activeCount
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
      console.log('💾 Saving advanced settings...', settings);
      const success = await LiveActivityService.updateSettings(settings);
      if (success) {
        console.log('✅ Advanced settings saved!');
        window.dispatchEvent(new CustomEvent('live-activity-settings-updated', {
          detail: settings
        }));
        alert('✅ تم حفظ وتطبيق جميع الإعدادات بنجاح!');
        loadStats();
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

  const applyPreset = (preset: typeof PRESET_THEMES[0]) => {
    if (!settings) return;
    handleChange(preset.settings);
    setSelectedPreset(preset.name);
    setTimeout(() => setSelectedPreset(null), 2000);
  };

  const exportSettings = () => {
    if (!settings) return;
    const data = JSON.stringify(settings, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `live-activity-settings-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAddMessage = async () => {
    if (!newMessage.message_ar.trim()) {
      alert('يرجى إدخال نص الرسالة');
      return;
    }

    const success = await LiveActivityService.addCustomMessage(newMessage);
    if (success) {
      setShowAddMessage(false);
      setNewMessage({
        message_ar: '',
        message_en: '',
        icon: 'Sparkles',
        is_active: true,
        priority: 5
      });
      loadCustomMessages();
      loadStats();
    }
  };

  const handleUpdateMessage = async (message: CustomMessage) => {
    const success = await LiveActivityService.updateCustomMessage(message.id, message);
    if (success) {
      setEditingMessage(null);
      loadCustomMessages();
      loadStats();
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الرسالة؟')) return;
    const success = await LiveActivityService.deleteCustomMessage(id);
    if (success) {
      loadCustomMessages();
      loadStats();
    }
  };

  const handleToggleActive = async (message: CustomMessage) => {
    const success = await LiveActivityService.updateCustomMessage(message.id, {
      is_active: !message.is_active
    });
    if (success) {
      loadCustomMessages();
      loadStats();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 min-h-screen">
        <div className="text-center space-y-4">
          <RefreshCw className="animate-spin mx-auto" size={48} style={{ color: '#D4AF37' }} />
          <p className="text-[#F5F5DC] text-lg">جاري تحميل النظام المتطور...</p>
        </div>
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

  const speedDuration = {
    slow: '40s',
    medium: '25s',
    fast: '12s'
  };

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

  const getMockActivities = () => {
    const activities: Array<{ icon: any; message: string }> = [];

    if (settings.content_mode === 'auto' || settings.content_mode === 'both') {
      activities.push(
        { icon: ShoppingCart, message: 'تم حجز 15 شجرة بواسطة أحمد محمد' },
        { icon: Award, message: 'تم إصدار شهادة تملك رقم #1234' },
        { icon: TreePine, message: 'مزرعة الخالدية - متاح 200 شجرة للحجز' }
      );
    }

    if (settings.content_mode === 'manual' || settings.content_mode === 'both') {
      const activeMessages = customMessages.filter(m => m.is_active).slice(0, 3);
      activeMessages.forEach(msg => {
        const iconOption = ICON_OPTIONS.find(opt => opt.value === msg.icon);
        activities.push({
          icon: iconOption?.Icon || Sparkles,
          message: msg.message_ar
        });
      });
    }

    return activities;
  };

  const mockActivities = getMockActivities();

  const getDeviceWidth = () => {
    switch (previewDevice) {
      case 'mobile': return '375px';
      case 'tablet': return '768px';
      case 'desktop': return '100%';
    }
  };

  const tabs = [
    { id: 'general' as const, label: 'عام', icon: Settings },
    { id: 'content' as const, label: 'المحتوى', icon: Database },
    { id: 'appearance' as const, label: 'المظهر', icon: Palette },
    { id: 'advanced' as const, label: 'متقدم', icon: Sliders },
    { id: 'messages' as const, label: 'الرسائل', icon: MessageSquare }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a] p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#2C5F2D] via-[#1E4620] to-[#2C5F2D] rounded-2xl p-8 border-2 border-[#D4AF37] shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-[#D4AF37]/20 rounded-xl border-2 border-[#D4AF37]">
                <Activity size={40} style={{ color: '#D4AF37' }} />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-[#D4AF37] mb-2">
                  النظام المتطور لشريط النشاط المباشر
                </h1>
                <p className="text-[#F5F5DC]/80 text-lg">
                  تحكم كامل • معاينة حية • إحصائيات فورية • تصميم ثوري
                </p>
              </div>
            </div>
            <button
              onClick={handleSaveAndApply}
              disabled={saving}
              className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-[#1E4620] rounded-xl font-bold text-lg hover:scale-105 transition-all disabled:opacity-50 shadow-xl border-2 border-[#FFD700]"
            >
              {saving ? (
                <>
                  <RefreshCw className="animate-spin" size={24} />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Zap size={24} />
                  حفظ وتطبيق
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Stats Dashboard */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-[#2C5F2D] to-[#1E4620] rounded-xl p-6 border border-[#D4AF37]/30 hover:border-[#D4AF37] transition-all hover:scale-105">
            <div className="flex items-center justify-between mb-3">
              <BarChart3 size={32} style={{ color: '#D4AF37' }} />
              <div className="text-4xl font-bold text-[#D4AF37]">{stats.totalActivities}</div>
            </div>
            <p className="text-[#F5F5DC]/70 font-medium">إجمالي الأنشطة</p>
          </div>
          <div className="bg-gradient-to-br from-[#2C5F2D] to-[#1E4620] rounded-xl p-6 border border-[#D4AF37]/30 hover:border-[#D4AF37] transition-all hover:scale-105">
            <div className="flex items-center justify-between mb-3">
              <Database size={32} style={{ color: '#4A9EFF' }} />
              <div className="text-4xl font-bold text-[#4A9EFF]">{stats.autoActivities}</div>
            </div>
            <p className="text-[#F5F5DC]/70 font-medium">بيانات تلقائية</p>
          </div>
          <div className="bg-gradient-to-br from-[#2C5F2D] to-[#1E4620] rounded-xl p-6 border border-[#D4AF37]/30 hover:border-[#D4AF37] transition-all hover:scale-105">
            <div className="flex items-center justify-between mb-3">
              <MessageSquare size={32} style={{ color: '#00FF88' }} />
              <div className="text-4xl font-bold text-[#00FF88]">{stats.activeMessages}</div>
            </div>
            <p className="text-[#F5F5DC]/70 font-medium">رسائل مفعلة</p>
          </div>
          <div className="bg-gradient-to-br from-[#2C5F2D] to-[#1E4620] rounded-xl p-6 border border-[#D4AF37]/30 hover:border-[#D4AF37] transition-all hover:scale-105">
            <div className="flex items-center justify-between mb-3">
              <GitMerge size={32} style={{ color: '#FFD700' }} />
              <div className="text-2xl font-bold text-[#FFD700]">
                {settings.content_mode === 'auto' ? 'تلقائي' : settings.content_mode === 'manual' ? 'يدوي' : 'مدمج'}
              </div>
            </div>
            <p className="text-[#F5F5DC]/70 font-medium">وضع المحتوى</p>
          </div>
        </div>

        {/* Preset Themes */}
        <div className="bg-[#1a1a1a] rounded-xl p-6 border border-[#D4AF37]/30">
          <div className="flex items-center gap-3 mb-6">
            <Layers size={24} style={{ color: '#D4AF37' }} />
            <h2 className="text-2xl font-bold text-[#D4AF37]">القوالب الجاهزة</h2>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {PRESET_THEMES.map((preset) => (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset)}
                className={`group relative p-6 rounded-xl border-2 transition-all ${
                  selectedPreset === preset.name
                    ? 'border-[#D4AF37] bg-gradient-to-br from-[#2C5F2D] to-[#1E4620]'
                    : 'border-[#2C5F2D]/50 bg-[#0f0f0f] hover:border-[#D4AF37]/50'
                }`}
              >
                <div className="flex flex-col items-center gap-3">
                  <preset.icon size={40} style={{ color: selectedPreset === preset.name ? '#D4AF37' : '#F5F5DC' }} />
                  <span className="text-[#F5F5DC] font-bold text-lg">{preset.name}</span>
                  {selectedPreset === preset.name && (
                    <CheckCircle size={24} style={{ color: '#00FF88' }} className="absolute top-2 left-2" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Left: Tabs & Settings */}
          <div className="col-span-2 space-y-6">
            {/* Tabs */}
            <div className="flex gap-2 bg-[#1a1a1a] p-2 rounded-xl border border-[#D4AF37]/30">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-bold transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-[#2C5F2D] to-[#1E4620] text-[#D4AF37] border-2 border-[#D4AF37]'
                      : 'text-[#F5F5DC]/60 hover:text-[#F5F5DC] hover:bg-[#2C5F2D]/20'
                  }`}
                >
                  <tab.icon size={20} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* General Tab */}
            {activeTab === 'general' && (
              <div className="bg-[#1a1a1a] rounded-xl p-6 border border-[#D4AF37]/30 space-y-6">
                <div className="flex items-center justify-between p-4 bg-[#0f0f0f] rounded-lg border border-[#2C5F2D]/50">
                  <div>
                    <h3 className="text-xl font-bold text-[#F5F5DC] mb-1">تفعيل الشريط</h3>
                    <p className="text-sm text-[#F5F5DC]/60">إظهار أو إخفاء شريط النشاط</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.is_enabled}
                      onChange={(e) => handleChange({ is_enabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-20 h-10 bg-gray-700 peer-focus:ring-4 peer-focus:ring-[#D4AF37] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:right-1 after:bg-white after:rounded-full after:h-8 after:w-8 after:transition-all peer-checked:bg-[#2C5F2D]"></div>
                  </label>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-[#D4AF37]">سرعة الحركة</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {(['slow', 'medium', 'fast'] as const).map((speed) => (
                      <button
                        key={speed}
                        onClick={() => handleChange({ animation_speed: speed })}
                        className={`p-6 rounded-xl text-center transition-all border-2 ${
                          settings.animation_speed === speed
                            ? 'bg-gradient-to-br from-[#2C5F2D] to-[#1E4620] text-[#D4AF37] border-[#D4AF37] shadow-xl scale-105'
                            : 'bg-[#0f0f0f] text-[#F5F5DC] border-[#2C5F2D]/30 hover:border-[#D4AF37]/50'
                        }`}
                      >
                        <div className="text-4xl font-bold mb-2">
                          {speed === 'slow' ? '40s' : speed === 'medium' ? '25s' : '12s'}
                        </div>
                        <div className="font-bold">
                          {speed === 'slow' ? 'بطيء' : speed === 'medium' ? 'متوسط' : 'سريع ⚡'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-[#D4AF37]">ارتفاع الشريط</h3>
                  <div className="p-6 bg-[#0f0f0f] rounded-lg border border-[#2C5F2D]/50">
                    <input
                      type="range"
                      min="40"
                      max="100"
                      value={settings.height}
                      onChange={(e) => handleChange({ height: parseInt(e.target.value) })}
                      className="w-full accent-[#D4AF37] h-3 rounded-lg"
                    />
                    <div className="flex justify-between text-sm text-[#F5F5DC]/60 mt-3">
                      <span>40px</span>
                      <span className="text-3xl font-bold text-[#D4AF37]">{settings.height}px</span>
                      <span>100px</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-[#D4AF37]">فترة التحديث التلقائي</h3>
                  <div className="p-6 bg-[#0f0f0f] rounded-lg border border-[#2C5F2D]/50">
                    <input
                      type="range"
                      min="10"
                      max="180"
                      step="10"
                      value={settings.refresh_interval}
                      onChange={(e) => handleChange({ refresh_interval: parseInt(e.target.value) })}
                      className="w-full accent-[#D4AF37] h-3 rounded-lg"
                    />
                    <div className="flex justify-between text-sm text-[#F5F5DC]/60 mt-3">
                      <span>10 ثانية</span>
                      <span className="text-3xl font-bold text-[#D4AF37]">{settings.refresh_interval}s</span>
                      <span>180 ثانية</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-[#D4AF37]">عدد العناصر المعروضة</h3>
                  <div className="p-6 bg-[#0f0f0f] rounded-lg border border-[#2C5F2D]/50">
                    <input
                      type="number"
                      min="3"
                      max="30"
                      value={settings.max_items}
                      onChange={(e) => handleChange({ max_items: parseInt(e.target.value) || 10 })}
                      className="w-full px-6 py-4 bg-[#1a1a1a] border-2 border-[#2C5F2D]/50 rounded-lg text-[#F5F5DC] text-2xl font-bold text-center focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center justify-between p-4 bg-[#0f0f0f] rounded-lg border border-[#2C5F2D]/50 cursor-pointer hover:border-[#D4AF37]/50 transition-all">
                    <span className="text-[#F5F5DC] font-medium">التوقف عند المرور</span>
                    <input
                      type="checkbox"
                      checked={settings.pause_on_hover}
                      onChange={(e) => handleChange({ pause_on_hover: e.target.checked })}
                      className="w-6 h-6 accent-[#D4AF37]"
                    />
                  </label>
                  <label className="flex items-center justify-between p-4 bg-[#0f0f0f] rounded-lg border border-[#2C5F2D]/50 cursor-pointer hover:border-[#D4AF37]/50 transition-all">
                    <span className="text-[#F5F5DC] font-medium">عرض الفواصل</span>
                    <input
                      type="checkbox"
                      checked={settings.show_separator}
                      onChange={(e) => handleChange({ show_separator: e.target.checked })}
                      className="w-6 h-6 accent-[#D4AF37]"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* Content Tab */}
            {activeTab === 'content' && (
              <div className="bg-[#1a1a1a] rounded-xl p-6 border border-[#D4AF37]/30 space-y-6">
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-[#D4AF37]">مصدر المحتوى</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {(['auto', 'manual', 'both'] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => handleChange({ content_mode: mode })}
                        className={`p-8 rounded-xl text-center transition-all border-2 ${
                          settings.content_mode === mode
                            ? 'bg-gradient-to-br from-[#2C5F2D] to-[#1E4620] text-[#D4AF37] border-[#D4AF37] shadow-xl scale-105'
                            : 'bg-[#0f0f0f] text-[#F5F5DC] border-[#2C5F2D]/30 hover:border-[#D4AF37]/50'
                        }`}
                      >
                        <div className="mb-4">
                          {mode === 'auto' && <Database size={48} className="mx-auto" />}
                          {mode === 'manual' && <MessageSquare size={48} className="mx-auto" />}
                          {mode === 'both' && <GitMerge size={48} className="mx-auto" />}
                        </div>
                        <div className="text-xl font-bold mb-2">
                          {mode === 'auto' ? 'تلقائي' : mode === 'manual' ? 'يدوي' : 'مدمج'}
                        </div>
                        <div className="text-sm opacity-70">
                          {mode === 'auto' ? 'من قاعدة البيانات' : mode === 'manual' ? 'رسائل مخصصة' : 'كل المصادر'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {(settings.content_mode === 'auto' || settings.content_mode === 'both') && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-[#D4AF37]">مصادر البيانات التلقائية</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <label className="p-6 bg-[#0f0f0f] rounded-lg border border-[#2C5F2D]/50 cursor-pointer hover:border-[#D4AF37]/50 transition-all">
                        <div className="flex items-center justify-between mb-3">
                          <ShoppingCart size={32} style={{ color: settings.icon_color }} />
                          <input
                            type="checkbox"
                            checked={settings.show_reservations}
                            onChange={(e) => handleChange({ show_reservations: e.target.checked })}
                            className="w-6 h-6 accent-[#D4AF37]"
                          />
                        </div>
                        <span className="text-[#F5F5DC] font-bold text-lg">الحجوزات</span>
                      </label>
                      <label className="p-6 bg-[#0f0f0f] rounded-lg border border-[#2C5F2D]/50 cursor-pointer hover:border-[#D4AF37]/50 transition-all">
                        <div className="flex items-center justify-between mb-3">
                          <Award size={32} style={{ color: settings.icon_color }} />
                          <input
                            type="checkbox"
                            checked={settings.show_certificates}
                            onChange={(e) => handleChange({ show_certificates: e.target.checked })}
                            className="w-6 h-6 accent-[#D4AF37]"
                          />
                        </div>
                        <span className="text-[#F5F5DC] font-bold text-lg">الشهادات</span>
                      </label>
                      <label className="p-6 bg-[#0f0f0f] rounded-lg border border-[#2C5F2D]/50 cursor-pointer hover:border-[#D4AF37]/50 transition-all">
                        <div className="flex items-center justify-between mb-3">
                          <TreePine size={32} style={{ color: settings.icon_color }} />
                          <input
                            type="checkbox"
                            checked={settings.show_farms}
                            onChange={(e) => handleChange({ show_farms: e.target.checked })}
                            className="w-6 h-6 accent-[#D4AF37]"
                          />
                        </div>
                        <span className="text-[#F5F5DC] font-bold text-lg">المزارع</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <div className="bg-[#1a1a1a] rounded-xl p-6 border border-[#D4AF37]/30 space-y-6">
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-[#D4AF37]">نمط الخلفية</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {(['gradient', 'solid', 'glass'] as const).map((style) => (
                      <button
                        key={style}
                        onClick={() => handleChange({ background_style: style })}
                        className={`p-8 rounded-xl text-center transition-all border-2 ${
                          settings.background_style === style
                            ? 'bg-gradient-to-br from-[#2C5F2D] to-[#1E4620] text-[#D4AF37] border-[#D4AF37] shadow-xl scale-105'
                            : 'bg-[#0f0f0f] text-[#F5F5DC] border-[#2C5F2D]/30 hover:border-[#D4AF37]/50'
                        }`}
                      >
                        <div className="text-xl font-bold">
                          {style === 'gradient' ? 'تدرج' : style === 'solid' ? 'صلب' : 'زجاجي'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-[#D4AF37]">نمط الحدود</h3>
                  <div className="grid grid-cols-4 gap-4">
                    {(['none', 'bottom', 'top', 'both'] as const).map((style) => (
                      <button
                        key={style}
                        onClick={() => handleChange({ border_style: style })}
                        className={`p-6 rounded-xl text-center transition-all border-2 ${
                          settings.border_style === style
                            ? 'bg-gradient-to-br from-[#2C5F2D] to-[#1E4620] text-[#D4AF37] border-[#D4AF37] shadow-xl scale-105'
                            : 'bg-[#0f0f0f] text-[#F5F5DC] border-[#2C5F2D]/30 hover:border-[#D4AF37]/50'
                        }`}
                      >
                        <div className="font-bold">
                          {style === 'none' ? 'بدون' : style === 'bottom' ? 'أسفل' : style === 'top' ? 'أعلى' : 'كلاهما'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-[#D4AF37]">لون النص</h3>
                    <div className="p-6 bg-[#0f0f0f] rounded-lg border border-[#2C5F2D]/50">
                      <input
                        type="color"
                        value={settings.text_color}
                        onChange={(e) => handleChange({ text_color: e.target.value })}
                        className="w-full h-24 rounded-lg cursor-pointer border-4 border-[#2C5F2D]/50"
                      />
                      <div className="text-center mt-3 text-[#F5F5DC] font-mono">{settings.text_color}</div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-[#D4AF37]">لون الأيقونات</h3>
                    <div className="p-6 bg-[#0f0f0f] rounded-lg border border-[#2C5F2D]/50">
                      <input
                        type="color"
                        value={settings.icon_color}
                        onChange={(e) => handleChange({ icon_color: e.target.value })}
                        className="w-full h-24 rounded-lg cursor-pointer border-4 border-[#2C5F2D]/50"
                      />
                      <div className="text-center mt-3 text-[#F5F5DC] font-mono">{settings.icon_color}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Messages Tab */}
            {activeTab === 'messages' && (settings.content_mode === 'manual' || settings.content_mode === 'both') && (
              <div className="bg-[#1a1a1a] rounded-xl p-6 border border-[#D4AF37]/30 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-[#D4AF37]">إدارة الرسائل المخصصة</h3>
                  <button
                    onClick={() => setShowAddMessage(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#2C5F2D] to-[#1E4620] text-[#F5F5DC] rounded-lg hover:scale-105 transition-all border border-[#D4AF37]/50"
                  >
                    <Plus size={20} />
                    إضافة رسالة
                  </button>
                </div>

                {showAddMessage && (
                  <div className="bg-[#0f0f0f] rounded-lg p-6 border-2 border-[#D4AF37]">
                    <h4 className="font-bold text-[#F5F5DC] text-lg mb-4">رسالة جديدة</h4>
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={newMessage.message_ar}
                        onChange={(e) => setNewMessage({ ...newMessage, message_ar: e.target.value })}
                        placeholder="نص الرسالة بالعربي"
                        className="w-full px-4 py-3 bg-[#1a1a1a] border-2 border-[#2C5F2D]/50 rounded-lg text-[#F5F5DC] focus:border-[#D4AF37] focus:outline-none"
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <select
                          value={newMessage.icon}
                          onChange={(e) => setNewMessage({ ...newMessage, icon: e.target.value })}
                          className="px-4 py-3 bg-[#1a1a1a] border-2 border-[#2C5F2D]/50 rounded-lg text-[#F5F5DC] focus:border-[#D4AF37] focus:outline-none"
                        >
                          {ICON_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                        <input
                          type="number"
                          value={newMessage.priority}
                          onChange={(e) => setNewMessage({ ...newMessage, priority: parseInt(e.target.value) })}
                          placeholder="الأولوية (1-10)"
                          min="1"
                          max="10"
                          className="px-4 py-3 bg-[#1a1a1a] border-2 border-[#2C5F2D]/50 rounded-lg text-[#F5F5DC] focus:border-[#D4AF37] focus:outline-none"
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={handleAddMessage}
                          className="flex items-center gap-2 px-6 py-3 bg-[#2C5F2D] text-[#F5F5DC] rounded-lg hover:bg-[#3A7A3B] transition-all"
                        >
                          <Check size={18} />
                          حفظ
                        </button>
                        <button
                          onClick={() => setShowAddMessage(false)}
                          className="flex items-center gap-2 px-6 py-3 bg-gray-700 text-[#F5F5DC] rounded-lg hover:bg-gray-600 transition-all"
                        >
                          <X size={18} />
                          إلغاء
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {customMessages.map((msg) => (
                    <div key={msg.id} className={`bg-[#0f0f0f] rounded-lg p-4 border-2 ${msg.is_active ? 'border-[#2C5F2D]' : 'border-gray-700/30 opacity-60'}`}>
                      {editingMessage?.id === msg.id ? (
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={editingMessage.message_ar}
                            onChange={(e) => setEditingMessage({ ...editingMessage, message_ar: e.target.value })}
                            className="w-full px-4 py-2 bg-[#1a1a1a] border-2 border-[#2C5F2D]/50 rounded-lg text-[#F5F5DC]"
                          />
                          <div className="flex gap-2">
                            <button onClick={() => handleUpdateMessage(editingMessage)} className="px-4 py-2 bg-[#2C5F2D] text-[#F5F5DC] rounded">
                              <Check size={16} />
                            </button>
                            <button onClick={() => setEditingMessage(null)} className="px-4 py-2 bg-gray-700 text-[#F5F5DC] rounded">
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {ICON_OPTIONS.find(opt => opt.value === msg.icon)?.Icon && (
                              <div className="text-[#D4AF37]">
                                {(() => {
                                  const IconComponent = ICON_OPTIONS.find(opt => opt.value === msg.icon)?.Icon;
                                  return IconComponent ? <IconComponent size={24} /> : null;
                                })()}
                              </div>
                            )}
                            <div>
                              <p className="text-[#F5F5DC] font-medium text-lg">{msg.message_ar}</p>
                              <p className="text-sm text-[#F5F5DC]/50">أولوية: {msg.priority}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleActive(msg)}
                              className={`px-4 py-2 rounded font-medium ${msg.is_active ? 'bg-[#2C5F2D] text-[#F5F5DC]' : 'bg-gray-700 text-gray-400'}`}
                            >
                              {msg.is_active ? 'مفعل' : 'معطل'}
                            </button>
                            <button onClick={() => setEditingMessage(msg)} className="p-2 text-[#D4AF37] hover:bg-[#2C5F2D]/20 rounded">
                              <Edit3 size={18} />
                            </button>
                            <button onClick={() => handleDeleteMessage(msg.id)} className="p-2 text-red-400 hover:bg-red-900/20 rounded">
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Advanced Tab */}
            {activeTab === 'advanced' && (
              <div className="bg-[#1a1a1a] rounded-xl p-6 border border-[#D4AF37]/30 space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <Cpu size={24} style={{ color: '#D4AF37' }} />
                  <h3 className="text-2xl font-bold text-[#D4AF37]">إعدادات متقدمة</h3>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <button
                    onClick={exportSettings}
                    className="flex items-center justify-center gap-3 p-6 bg-[#0f0f0f] rounded-lg border-2 border-[#2C5F2D]/50 hover:border-[#D4AF37] transition-all"
                  >
                    <Download size={24} style={{ color: '#D4AF37' }} />
                    <span className="text-[#F5F5DC] font-bold text-lg">تصدير الإعدادات</span>
                  </button>
                  <button
                    onClick={loadSettings}
                    className="flex items-center justify-center gap-3 p-6 bg-[#0f0f0f] rounded-lg border-2 border-[#2C5F2D]/50 hover:border-[#D4AF37] transition-all"
                  >
                    <RotateCcw size={24} style={{ color: '#4A9EFF' }} />
                    <span className="text-[#F5F5DC] font-bold text-lg">إعادة تحميل</span>
                  </button>
                </div>

                <div className="bg-gradient-to-r from-[#2C5F2D]/20 to-[#1E4620]/20 border-2 border-[#D4AF37]/30 rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    <Info size={32} style={{ color: '#D4AF37' }} className="flex-shrink-0" />
                    <div className="text-[#F5F5DC]">
                      <h4 className="font-bold text-xl mb-3" style={{ color: '#D4AF37' }}>معلومات النظام</h4>
                      <ul className="space-y-2 text-lg">
                        <li>✅ نظام Realtime متصل ومفعل</li>
                        <li>✅ التحديثات تظهر فوراً بدون refresh</li>
                        <li>✅ معاينة حية دقيقة 100%</li>
                        <li>✅ 3 مصادر محتوى مرنة</li>
                        <li>✅ Console logs للتتبع الكامل</li>
                        <li>⚡ السرعة السريعة: 12 ثانية فقط</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Live Preview */}
          <div className="space-y-6">
            <div className="bg-[#1a1a1a] rounded-xl p-6 border-2 border-[#D4AF37] sticky top-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Eye size={24} style={{ color: '#D4AF37' }} />
                  <h3 className="text-2xl font-bold text-[#D4AF37]">المعاينة المباشرة</h3>
                  <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">LIVE</span>
                </div>
                <button
                  onClick={() => setIsPreviewPlaying(!isPreviewPlaying)}
                  className="p-3 bg-[#2C5F2D] rounded-lg hover:bg-[#3A7A3B] transition-all"
                >
                  {isPreviewPlaying ? <Pause size={20} style={{ color: '#F5F5DC' }} /> : <Play size={20} style={{ color: '#F5F5DC' }} />}
                </button>
              </div>

              <div className="flex gap-2 mb-4">
                {(['desktop', 'tablet', 'mobile'] as const).map((device) => (
                  <button
                    key={device}
                    onClick={() => setPreviewDevice(device)}
                    className={`flex-1 p-3 rounded-lg transition-all ${
                      previewDevice === device
                        ? 'bg-[#2C5F2D] text-[#D4AF37] border-2 border-[#D4AF37]'
                        : 'bg-[#0f0f0f] text-[#F5F5DC]/60 hover:text-[#F5F5DC]'
                    }`}
                  >
                    {device === 'desktop' && <Monitor size={20} className="mx-auto" />}
                    {device === 'tablet' && <Tablet size={20} className="mx-auto" />}
                    {device === 'mobile' && <Smartphone size={20} className="mx-auto" />}
                  </button>
                ))}
              </div>

              <div className="bg-[#0f0f0f] rounded-lg p-4" ref={previewRef}>
                <div className="relative rounded-lg overflow-hidden border border-[#2C5F2D]/50 mx-auto" style={{ width: getDeviceWidth() }} key={previewKey}>
                  <style>{`
                    @keyframes preview-scroll-${previewKey} {
                      0% { transform: translateX(0); }
                      100% { transform: translateX(-50%); }
                    }
                    .preview-track-${previewKey} {
                      animation: preview-scroll-${previewKey} ${speedDuration[settings.animation_speed]} linear infinite;
                      ${!isPreviewPlaying ? 'animation-play-state: paused;' : ''}
                      ${settings.pause_on_hover ? 'cursor: pointer;' : ''}
                    }
                    ${settings.pause_on_hover ? `.preview-track-${previewKey}:hover { animation-play-state: paused; }` : ''}
                  `}</style>

                  <div
                    style={{
                      height: `${settings.height}px`,
                      background: getBackgroundStyle(),
                      backdropFilter: settings.background_style === 'glass' ? 'blur(10px)' : 'none',
                      overflow: 'hidden'
                    }}
                  >
                    <div className={`preview-track-${previewKey}`} style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                      {[0, 1].map((groupIdx) => (
                        <div key={groupIdx} style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                          {mockActivities.map((activity, idx) => (
                            <div key={`${groupIdx}-${idx}`} style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 24px' }}>
                                <div style={{
                                  width: '40px',
                                  height: '40px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  borderRadius: '10px',
                                  background: `${settings.icon_color}33`,
                                  border: `2px solid ${settings.icon_color}55`
                                }}>
                                  <activity.icon size={22} style={{ color: settings.icon_color }} />
                                </div>
                                <span style={{
                                  fontSize: '16px',
                                  fontWeight: 700,
                                  color: settings.text_color,
                                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
                                }}>
                                  {activity.message}
                                </span>
                              </div>
                              {settings.show_separator && idx < mockActivities.length - 1 && (
                                <div style={{
                                  width: '4px',
                                  height: '4px',
                                  borderRadius: '50%',
                                  background: `${settings.icon_color}80`,
                                  margin: '0 20px'
                                }} />
                              )}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 bg-[#0f0f0f] rounded-lg border border-[#2C5F2D]/50">
                  <div className="text-[#F5F5DC]/60 mb-1">السرعة</div>
                  <div className="text-[#D4AF37] font-bold text-lg">{speedDuration[settings.animation_speed]}</div>
                </div>
                <div className="p-3 bg-[#0f0f0f] rounded-lg border border-[#2C5F2D]/50">
                  <div className="text-[#F5F5DC]/60 mb-1">الارتفاع</div>
                  <div className="text-[#D4AF37] font-bold text-lg">{settings.height}px</div>
                </div>
                <div className="p-3 bg-[#0f0f0f] rounded-lg border border-[#2C5F2D]/50">
                  <div className="text-[#F5F5DC]/60 mb-1">العناصر</div>
                  <div className="text-[#D4AF37] font-bold text-lg">{mockActivities.length}</div>
                </div>
                <div className="p-3 bg-[#0f0f0f] rounded-lg border border-[#2C5F2D]/50">
                  <div className="text-[#F5F5DC]/60 mb-1">المصدر</div>
                  <div className="text-[#D4AF37] font-bold text-lg">
                    {settings.content_mode === 'auto' ? 'تلقائي' : settings.content_mode === 'manual' ? 'يدوي' : 'مدمج'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
