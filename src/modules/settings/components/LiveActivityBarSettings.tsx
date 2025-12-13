import { useState, useEffect } from 'react';
import {
  Activity, Settings, Save, RefreshCw, Eye, Palette, Zap, Plus, Trash2, Edit3,
  Clock, BarChart3, Sparkles, ShoppingCart, Award, TreePine, TrendingUp, Users, Star,
  Database, MessageSquare, GitMerge, Check, X
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

export function LiveActivityBarSettings() {
  const [settings, setSettings] = useState<LiveActivitySettings | null>(null);
  const [customMessages, setCustomMessages] = useState<CustomMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [stats, setStats] = useState({
    totalActivities: 0,
    reservations: 0,
    certificates: 0,
    farms: 0
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
    } else {
      alert('فشل إضافة الرسالة');
    }
  };

  const handleUpdateMessage = async (message: CustomMessage) => {
    const success = await LiveActivityService.updateCustomMessage(message.id, message);
    if (success) {
      setEditingMessage(null);
      loadCustomMessages();
      loadStats();
    } else {
      alert('فشل تحديث الرسالة');
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الرسالة؟')) return;

    const success = await LiveActivityService.deleteCustomMessage(id);
    if (success) {
      loadCustomMessages();
      loadStats();
    } else {
      alert('فشل حذف الرسالة');
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

  const speedDuration = {
    slow: '50s',
    medium: '35s',
    fast: '22s'
  };

  const getMockActivities = () => {
    const activities: Array<{ icon: any; message: string; color: string; source: string }> = [];

    if (settings.content_mode === 'auto' || settings.content_mode === 'both') {
      activities.push(
        { icon: ShoppingCart, message: 'تم حجز أشجار جديدة بواسطة أحمد محمد', color: settings.icon_color, source: 'auto' },
        { icon: Award, message: 'تم إصدار شهادة تملك جديدة', color: settings.icon_color, source: 'auto' },
        { icon: TreePine, message: 'مزرعة الخالدية متاحة للاستثمار', color: settings.icon_color, source: 'auto' }
      );
    }

    if (settings.content_mode === 'manual' || settings.content_mode === 'both') {
      const activeMessages = customMessages.filter(m => m.is_active).slice(0, 3);
      activeMessages.forEach(msg => {
        const iconOption = ICON_OPTIONS.find(opt => opt.value === msg.icon);
        activities.push({
          icon: iconOption?.Icon || Sparkles,
          message: msg.message_ar,
          color: settings.icon_color,
          source: 'manual'
        });
      });
    }

    return activities;
  };

  const mockActivities = getMockActivities();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity size={32} style={{ color: '#D4AF37' }} />
          <div>
            <h2 className="text-2xl font-bold" style={{ color: '#D4AF37' }}>
              نظام شريط النشاط المباشر المتطور
            </h2>
            <p className="text-sm text-[#F5F5DC]/60">تحكم كامل مع معاينة لحظية ورسائل مخصصة</p>
          </div>
        </div>
        <button
          onClick={handleSaveAndApply}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#2C5F2D] to-[#1E4620] text-[#F5F5DC] rounded-lg font-semibold hover:from-[#3A7A3B] hover:to-[#2A5A2C] transition-all disabled:opacity-50 border border-[#D4AF37]/30 shadow-lg"
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
            <MessageSquare size={24} style={{ color: '#D4AF37' }} />
            <div>
              <p className="text-sm text-[#F5F5DC]/60">رسائل مخصصة</p>
              <p className="text-2xl font-bold text-[#D4AF37]">{customMessages.filter(m => m.is_active).length}</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-[#2C5F2D] to-[#1E4620] rounded-lg p-4 border border-[#D4AF37]/20">
          <div className="flex items-center gap-3">
            <Database size={24} style={{ color: '#D4AF37' }} />
            <div>
              <p className="text-sm text-[#F5F5DC]/60">بيانات تلقائية</p>
              <p className="text-2xl font-bold text-[#D4AF37]">{stats.reservations + stats.certificates + stats.farms}</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-[#2C5F2D] to-[#1E4620] rounded-lg p-4 border border-[#D4AF37]/20">
          <div className="flex items-center gap-3">
            <GitMerge size={24} style={{ color: '#D4AF37' }} />
            <div>
              <p className="text-sm text-[#F5F5DC]/60">وضع المحتوى</p>
              <p className="text-lg font-bold text-[#D4AF37]">
                {settings.content_mode === 'auto' ? 'تلقائي' : settings.content_mode === 'manual' ? 'يدوي' : 'مدمج'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Mode Selection */}
      <div className="bg-[#1a1a1a] rounded-lg p-6 border border-[#D4AF37]/30">
        <div className="flex items-center gap-2 mb-4">
          <GitMerge size={20} style={{ color: '#D4AF37' }} />
          <h3 className="font-bold text-[#D4AF37]">مصدر المحتوى</h3>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {(['auto', 'manual', 'both'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => handleChange({ content_mode: mode })}
              className={`p-4 rounded-lg text-center transition-all ${
                settings.content_mode === mode
                  ? 'bg-gradient-to-br from-[#2C5F2D] to-[#1E4620] text-[#D4AF37] border-2 border-[#D4AF37] shadow-lg'
                  : 'bg-[#0f0f0f] text-[#F5F5DC] border border-[#2C5F2D]/30 hover:border-[#D4AF37]/50'
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                {mode === 'auto' && <Database size={24} />}
                {mode === 'manual' && <MessageSquare size={24} />}
                {mode === 'both' && <GitMerge size={24} />}
                <div>
                  <div className="font-bold">
                    {mode === 'auto' ? 'تلقائي' : mode === 'manual' ? 'يدوي' : 'مدمج'}
                  </div>
                  <div className="text-xs opacity-70 mt-1">
                    {mode === 'auto' ? 'من قاعدة البيانات' : mode === 'manual' ? 'رسائل مخصصة' : 'كل المصادر'}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Messages Management */}
      {(settings.content_mode === 'manual' || settings.content_mode === 'both') && (
        <div className="bg-[#1a1a1a] rounded-lg p-6 border border-[#D4AF37]/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MessageSquare size={20} style={{ color: '#D4AF37' }} />
              <h3 className="font-bold text-[#D4AF37]">إدارة الرسائل المخصصة</h3>
            </div>
            <button
              onClick={() => setShowAddMessage(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#2C5F2D] text-[#F5F5DC] rounded-lg hover:bg-[#3A7A3B] transition-all"
            >
              <Plus size={18} />
              إضافة رسالة
            </button>
          </div>

          {showAddMessage && (
            <div className="bg-[#0f0f0f] rounded-lg p-4 mb-4 border border-[#2C5F2D]/50">
              <h4 className="font-semibold text-[#F5F5DC] mb-3">رسالة جديدة</h4>
              <div className="space-y-3">
                <input
                  type="text"
                  value={newMessage.message_ar}
                  onChange={(e) => setNewMessage({ ...newMessage, message_ar: e.target.value })}
                  placeholder="نص الرسالة بالعربي"
                  className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#2C5F2D]/30 rounded-lg text-[#F5F5DC] focus:border-[#D4AF37] focus:outline-none"
                />
                <select
                  value={newMessage.icon}
                  onChange={(e) => setNewMessage({ ...newMessage, icon: e.target.value })}
                  className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#2C5F2D]/30 rounded-lg text-[#F5F5DC] focus:border-[#D4AF37] focus:outline-none"
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
                  className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#2C5F2D]/30 rounded-lg text-[#F5F5DC] focus:border-[#D4AF37] focus:outline-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddMessage}
                    className="flex items-center gap-2 px-4 py-2 bg-[#2C5F2D] text-[#F5F5DC] rounded-lg hover:bg-[#3A7A3B] transition-all"
                  >
                    <Check size={18} />
                    حفظ
                  </button>
                  <button
                    onClick={() => setShowAddMessage(false)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-[#F5F5DC] rounded-lg hover:bg-gray-600 transition-all"
                  >
                    <X size={18} />
                    إلغاء
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {customMessages.map((msg) => (
              <div key={msg.id} className={`bg-[#0f0f0f] rounded-lg p-4 border ${msg.is_active ? 'border-[#2C5F2D]/50' : 'border-gray-700/30 opacity-50'}`}>
                {editingMessage?.id === msg.id ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editingMessage.message_ar}
                      onChange={(e) => setEditingMessage({ ...editingMessage, message_ar: e.target.value })}
                      className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#2C5F2D]/30 rounded-lg text-[#F5F5DC] focus:border-[#D4AF37] focus:outline-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateMessage(editingMessage)}
                        className="flex items-center gap-2 px-3 py-1 bg-[#2C5F2D] text-[#F5F5DC] rounded text-sm"
                      >
                        <Check size={16} />
                        حفظ
                      </button>
                      <button
                        onClick={() => setEditingMessage(null)}
                        className="flex items-center gap-2 px-3 py-1 bg-gray-700 text-[#F5F5DC] rounded text-sm"
                      >
                        <X size={16} />
                        إلغاء
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
                            return IconComponent ? <IconComponent size={20} /> : null;
                          })()}
                        </div>
                      )}
                      <div>
                        <p className="text-[#F5F5DC] font-medium">{msg.message_ar}</p>
                        <p className="text-xs text-[#F5F5DC]/50">أولوية: {msg.priority}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleActive(msg)}
                        className={`px-3 py-1 rounded text-xs font-medium ${
                          msg.is_active
                            ? 'bg-[#2C5F2D] text-[#F5F5DC]'
                            : 'bg-gray-700 text-gray-400'
                        }`}
                      >
                        {msg.is_active ? 'مفعل' : 'معطل'}
                      </button>
                      <button
                        onClick={() => setEditingMessage(msg)}
                        className="p-2 text-[#D4AF37] hover:bg-[#2C5F2D]/20 rounded transition-all"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="p-2 text-red-400 hover:bg-red-900/20 rounded transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

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
              width: '100%'
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
              {[0, 1].map((groupIdx) => (
                <div key={groupIdx} style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                  {mockActivities.map((activity, idx) => (
                    <div key={`${groupIdx}-${idx}`} style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
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
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Rest of the settings (continued in same pattern...) */}
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

      {/* Auto Content Settings */}
      {(settings.content_mode === 'auto' || settings.content_mode === 'both') && (
        <div className="bg-[#1a1a1a] rounded-lg p-6 border border-[#2C5F2D]/30">
          <div className="flex items-center gap-2 mb-4">
            <Database size={20} style={{ color: '#D4AF37' }} />
            <h3 className="font-bold text-[#D4AF37]">المحتوى التلقائي</h3>
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
      )}

      {/* Info */}
      <div className="bg-gradient-to-r from-[#2C5F2D]/20 to-[#1E4620]/20 border border-[#D4AF37]/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Clock size={20} style={{ color: '#D4AF37', marginTop: '2px' }} />
          <div className="text-sm text-[#F5F5DC]/80">
            <p className="font-semibold mb-2" style={{ color: '#D4AF37' }}>معلومات النظام المتطور:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>التغييرات تظهر في المعاينة فوراً</li>
              <li>الحفظ يطبق التغييرات على الشريط الرئيسي مباشرة</li>
              <li>3 مصادر محتوى: تلقائي، يدوي، أو مدمج</li>
              <li>إدارة كاملة للرسائل المخصصة</li>
              <li>نظام Realtime متصل ومفعل</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
