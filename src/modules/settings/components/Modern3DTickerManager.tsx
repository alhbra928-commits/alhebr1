import { useState, useEffect } from 'react';
import {
  Plus, Edit2, Trash2, Eye, EyeOff, Save, X, GripVertical,
  Sparkles, TreePine, Leaf, Award, TrendingUp, Shield, Users, Target, CheckCircle, Star, Settings, Play, Pause
} from 'lucide-react';
import { modern3DTickerService, TickerMessage, TickerSettings } from '../../../services/modern3DTickerService';
import { Modern3DTicker } from '../../../components/common/Modern3DTicker';

const iconOptions = [
  { value: 'sparkles', label: 'Sparkles', icon: Sparkles },
  { value: 'tree', label: 'Tree', icon: TreePine },
  { value: 'leaf', label: 'Leaf', icon: Leaf },
  { value: 'award', label: 'Award', icon: Award },
  { value: 'trending', label: 'Trending', icon: TrendingUp },
  { value: 'shield', label: 'Shield', icon: Shield },
  { value: 'users', label: 'Users', icon: Users },
  { value: 'target', label: 'Target', icon: Target },
  { value: 'check', label: 'Check', icon: CheckCircle },
  { value: 'star', label: 'Star', icon: Star },
];

const colorOptions = [
  { value: '#10b981', label: 'Emerald' },
  { value: '#059669', label: 'Green' },
  { value: '#047857', label: 'Dark Green' },
  { value: '#065f46', label: 'Deep Green' },
  { value: '#0ea5e9', label: 'Sky Blue' },
  { value: '#3b82f6', label: 'Blue' },
  { value: '#8b5cf6', label: 'Purple' },
  { value: '#ec4899', label: 'Pink' },
  { value: '#f59e0b', label: 'Amber' },
  { value: '#ef4444', label: 'Red' },
];

export function Modern3DTickerManager() {
  const [messages, setMessages] = useState<TickerMessage[]>([]);
  const [settings, setSettings] = useState<TickerSettings>({
    id: '1',
    enabled: true,
    speed: 40,
    height: '80px'
  });
  const [loading, setLoading] = useState(true);
  const [editingMessage, setEditingMessage] = useState<TickerMessage | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const [formData, setFormData] = useState({
    text_ar: '',
    icon_name: 'star',
    color: '#10b981',
    is_active: true,
    order_index: 1
  });

  useEffect(() => {
    loadData();

    const unsubscribeMessages = modern3DTickerService.subscribeToMessages((newMessages) => {
      setMessages(newMessages);
    });

    const unsubscribeSettings = modern3DTickerService.subscribeToSettings((newSettings) => {
      setSettings(newSettings);
    });

    return () => {
      unsubscribeMessages();
      unsubscribeSettings();
    };
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [messagesData, settingsData] = await Promise.all([
        modern3DTickerService.getMessages(),
        modern3DTickerService.getSettings()
      ]);
      setMessages(messagesData);
      setSettings(settingsData);
    } catch (error) {
      console.error('Error loading ticker data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    const success = await modern3DTickerService.addMessage({
      ...formData,
      order_index: messages.length + 1
    });

    if (success) {
      setShowAddModal(false);
      resetForm();
      loadData();
    }
  };

  const handleUpdate = async () => {
    if (!editingMessage) return;

    const success = await modern3DTickerService.updateMessage(editingMessage.id, formData);

    if (success) {
      setEditingMessage(null);
      resetForm();
      loadData();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الرسالة؟')) return;

    const success = await modern3DTickerService.deleteMessage(id);
    if (success) loadData();
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    const success = await modern3DTickerService.toggleMessage(id, !isActive);
    if (success) loadData();
  };

  const handleUpdateSettings = async () => {
    const success = await modern3DTickerService.updateSettings(settings);
    if (success) {
      setShowSettingsModal(false);
      loadData();
    }
  };

  const resetForm = () => {
    setFormData({
      text_ar: '',
      icon_name: 'star',
      color: '#10b981',
      is_active: true,
      order_index: 1
    });
  };

  const openEditModal = (message: TickerMessage) => {
    setEditingMessage(message);
    setFormData({
      text_ar: message.text_ar,
      icon_name: message.icon_name,
      color: message.color,
      is_active: message.is_active,
      order_index: message.order_index
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Preview Section */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-emerald-600 to-green-600">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Eye className="w-6 h-6" />
            معاينة الشريط المتحرك
          </h3>
        </div>
        <div className="p-6">
          <Modern3DTicker
            messages={messages}
            speed={settings.speed}
            height={settings.height}
            enabled={settings.enabled}
          />
          {!settings.enabled && (
            <div className="text-center text-gray-500 py-8">
              الشريط المتحرك معطل حالياً
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          إضافة رسالة جديدة
        </button>

        <button
          onClick={() => setShowSettingsModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
        >
          <Settings className="w-5 h-5" />
          إعدادات الشريط
        </button>

        <button
          onClick={() => modern3DTickerService.updateSettings({ ...settings, enabled: !settings.enabled })}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all ${
            settings.enabled
              ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white'
              : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
          }`}
        >
          {settings.enabled ? (
            <>
              <Pause className="w-5 h-5" />
              إيقاف الشريط
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              تفعيل الشريط
            </>
          )}
        </button>
      </div>

      {/* Messages List */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-emerald-600 to-green-600">
          <h3 className="text-xl font-bold text-white">الرسائل المتحركة</h3>
        </div>

        <div className="p-6">
          {messages.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              لا توجد رسائل حالياً
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((message) => {
                const IconComponent = iconOptions.find(opt => opt.value === message.icon_name)?.icon || Star;

                return (
                  <div
                    key={message.id}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all"
                  >
                    <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />

                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${message.color}20`, color: message.color }}
                    >
                      <IconComponent className="w-6 h-6" />
                    </div>

                    <div className="flex-1">
                      <p className="font-bold text-gray-900">{message.text_ar}</p>
                      <p className="text-sm text-gray-500">الترتيب: {message.order_index}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggle(message.id, message.is_active)}
                        className={`p-2 rounded-lg transition-all ${
                          message.is_active
                            ? 'bg-green-100 text-green-600 hover:bg-green-200'
                            : 'bg-gray-200 text-gray-400 hover:bg-gray-300'
                        }`}
                      >
                        {message.is_active ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                      </button>

                      <button
                        onClick={() => openEditModal(message)}
                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>

                      <button
                        onClick={() => handleDelete(message.id)}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingMessage) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 bg-gradient-to-r from-emerald-600 to-green-600 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">
                {editingMessage ? 'تعديل الرسالة' : 'إضافة رسالة جديدة'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingMessage(null);
                  resetForm();
                }}
                className="p-2 hover:bg-white/20 rounded-lg transition-all"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  النص بالعربية
                </label>
                <input
                  type="text"
                  value={formData.text_ar}
                  onChange={(e) => setFormData({ ...formData, text_ar: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none"
                  placeholder="أدخل النص..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  الأيقونة
                </label>
                <div className="grid grid-cols-5 gap-3">
                  {iconOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        onClick={() => setFormData({ ...formData, icon_name: option.value })}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          formData.icon_name === option.value
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-gray-200 hover:border-emerald-300'
                        }`}
                      >
                        <Icon className="w-6 h-6 mx-auto" />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  اللون
                </label>
                <div className="grid grid-cols-5 gap-3">
                  {colorOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setFormData({ ...formData, color: option.value })}
                      className={`h-12 rounded-xl border-2 transition-all ${
                        formData.color === option.value
                          ? 'border-gray-900 scale-110'
                          : 'border-gray-200 hover:scale-105'
                      }`}
                      style={{ backgroundColor: option.value }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-5 h-5 text-emerald-600 rounded"
                />
                <label htmlFor="is_active" className="text-sm font-bold text-gray-700">
                  تفعيل الرسالة
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={editingMessage ? handleUpdate : handleAdd}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                >
                  <Save className="w-5 h-5" />
                  {editingMessage ? 'حفظ التعديلات' : 'إضافة'}
                </button>

                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingMessage(null);
                    resetForm();
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
            <div className="p-6 bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">إعدادات الشريط المتحرك</h3>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-all"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  السرعة (ثانية)
                </label>
                <input
                  type="number"
                  value={settings.speed}
                  onChange={(e) => setSettings({ ...settings, speed: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  min="10"
                  max="100"
                />
                <p className="text-xs text-gray-500 mt-1">كلما كان الرقم أكبر، كانت السرعة أبطأ</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  الارتفاع
                </label>
                <select
                  value={settings.height}
                  onChange={(e) => setSettings({ ...settings, height: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                >
                  <option value="60px">صغير (60px)</option>
                  <option value="80px">متوسط (80px)</option>
                  <option value="100px">كبير (100px)</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleUpdateSettings}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                >
                  <Save className="w-5 h-5" />
                  حفظ الإعدادات
                </button>

                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
