import { useState, useEffect } from 'react';
import {
  Settings, Plus, Trash2, Eye, EyeOff, RefreshCw, Save, Sparkles,
  TrendingUp, Users, MapPin, Award, Calendar, TreePine, Zap,
  AlertCircle, CheckCircle, Clock
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface PlatformActivity {
  id: string;
  activity_type: string;
  activity_title_ar: string;
  activity_title_en: string;
  icon: string;
  farm_name?: string;
  location?: string;
  investor_name?: string;
  timestamp: string;
  is_visible: boolean;
  priority: number;
  created_at: string;
}

interface SimulatedActivity {
  id: string;
  template_ar: string;
  template_en: string;
  icon: string;
  activity_category: string;
  weight: number;
  is_active: boolean;
  created_at: string;
}

interface TickerSettings {
  id: string;
  mode: 'simulation' | 'real' | 'hybrid';
  simulation_enabled: boolean;
  real_enabled: boolean;
  scroll_speed: 'slow' | 'medium' | 'fast';
  items_per_cycle: number;
  simulation_interval_seconds: number;
  show_timestamps: boolean;
  background_color: string;
  text_color: string;
  icon_color: string;
}

const ICON_OPTIONS = ['🌴', '🫒', '👤', '👥', '📈', '📜', '🏡', '✨', '⭐', '🔥', '💳', '🔍', '📊', '🎯', '💰', '🌟'];
const ACTIVITY_TYPES = ['booking', 'investor_join', 'farm_added', 'certificate', 'payment', 'trending', 'milestone', 'stats'];
const CATEGORIES = ['booking', 'trending', 'stats', 'milestone', 'interest'];

export function SmartActivityTickerManager() {
  const [activeTab, setActiveTab] = useState<'real' | 'simulated' | 'settings'>('real');
  const [platformActivities, setPlatformActivities] = useState<PlatformActivity[]>([]);
  const [simulatedActivities, setSimulatedActivities] = useState<SimulatedActivity[]>([]);
  const [settings, setSettings] = useState<TickerSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // New Activity Form State
  const [newActivity, setNewActivity] = useState({
    type: 'manual',
    titleAr: '',
    titleEn: '',
    icon: '✨',
    priority: 5,
    category: 'stats',
    weight: 10,
  });

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'real') {
        const { data } = await supabase
          .from('platform_activities')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(50);
        if (data) setPlatformActivities(data);
      } else if (activeTab === 'simulated') {
        const { data } = await supabase
          .from('simulated_activities')
          .select('*')
          .order('created_at', { ascending: false });
        if (data) setSimulatedActivities(data);
      } else {
        const { data } = await supabase
          .from('activity_ticker_settings')
          .select('*')
          .single();
        if (data) setSettings(data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addManualActivity = async () => {
    if (!newActivity.titleAr || !newActivity.titleEn) {
      alert('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('platform_activities').insert({
        activity_type: 'stats',
        activity_title_ar: newActivity.titleAr,
        activity_title_en: newActivity.titleEn,
        icon: newActivity.icon,
        priority: newActivity.priority,
        is_visible: true,
        timestamp: new Date().toISOString(),
      });

      if (error) throw error;

      setSuccessMessage('✅ تم إضافة النشاط بنجاح!');
      setTimeout(() => setSuccessMessage(''), 3000);
      setShowAddForm(false);
      setNewActivity({
        type: 'manual',
        titleAr: '',
        titleEn: '',
        icon: '✨',
        priority: 5,
        category: 'stats',
        weight: 10,
      });
      loadData();
    } catch (error) {
      console.error('Error adding activity:', error);
      alert('حدث خطأ عند إضافة النشاط');
    } finally {
      setLoading(false);
    }
  };

  const addSimulatedTemplate = async () => {
    if (!newActivity.titleAr || !newActivity.titleEn) {
      alert('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('simulated_activities').insert({
        template_ar: newActivity.titleAr,
        template_en: newActivity.titleEn,
        icon: newActivity.icon,
        activity_category: newActivity.category,
        weight: newActivity.weight,
        is_active: true,
      });

      if (error) throw error;

      setSuccessMessage('✅ تم إضافة القالب الوهمي بنجاح!');
      setTimeout(() => setSuccessMessage(''), 3000);
      setShowAddForm(false);
      setNewActivity({
        type: 'manual',
        titleAr: '',
        titleEn: '',
        icon: '✨',
        priority: 5,
        category: 'stats',
        weight: 10,
      });
      loadData();
    } catch (error) {
      console.error('Error adding template:', error);
      alert('حدث خطأ عند إضافة القالب');
    } finally {
      setLoading(false);
    }
  };

  const toggleActivityVisibility = async (id: string, currentState: boolean) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('platform_activities')
        .update({ is_visible: !currentState })
        .eq('id', id);

      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error toggling visibility:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSimulatedActivity = async (id: string, currentState: boolean) => {
    setLoading(true);
    try {
      const newState = !currentState;
      const { error } = await supabase
        .from('simulated_activities')
        .update({ is_active: newState })
        .eq('id', id);

      if (error) throw error;

      // Update local state immediately for instant feedback
      setSimulatedActivities(prev =>
        prev.map(activity =>
          activity.id === id
            ? { ...activity, is_active: newState }
            : activity
        )
      );

      setSuccessMessage(
        newState
          ? '✅ تم تفعيل القالب بنجاح'
          : '⏸️ تم تعطيل القالب بنجاح'
      );
      setTimeout(() => setSuccessMessage(''), 3000);

      // Reload data to ensure consistency
      setTimeout(() => loadData(), 500);
    } catch (error) {
      console.error('Error toggling activity:', error);
      alert('حدث خطأ عند تحديث القالب');
      loadData(); // Reload on error to restore correct state
    } finally {
      setLoading(false);
    }
  };

  const deleteActivity = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا النشاط؟')) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('platform_activities')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setSuccessMessage('🗑️ تم حذف النشاط بنجاح');
      setTimeout(() => setSuccessMessage(''), 3000);
      loadData();
    } catch (error) {
      console.error('Error deleting activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteSimulatedActivity = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا القالب؟')) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('simulated_activities')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setSuccessMessage('🗑️ تم حذف القالب بنجاح');
      setTimeout(() => setSuccessMessage(''), 3000);
      loadData();
    } catch (error) {
      console.error('Error deleting template:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async () => {
    if (!settings) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('activity_ticker_settings')
        .update({
          mode: settings.mode,
          simulation_enabled: settings.simulation_enabled,
          real_enabled: settings.real_enabled,
          scroll_speed: settings.scroll_speed,
          items_per_cycle: settings.items_per_cycle,
          show_timestamps: settings.show_timestamps,
        })
        .eq('id', settings.id);

      if (error) throw error;

      setSuccessMessage('✅ تم حفظ الإعدادات بنجاح!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error updating settings:', error);
      alert('حدث خطأ عند حفظ الإعدادات');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              إدارة الشريط المتحرك الذكي
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              أضف، عدّل، واحذف الأنشطة في الشريط المتحرك
            </p>
          </div>
        </div>

        <button
          onClick={() => loadData()}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:scale-105 transition-transform"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>تحديث</span>
        </button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700">
          <CheckCircle className="w-5 h-5" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {[
          { id: 'real' as const, label: 'الأحداث الحقيقية', icon: Sparkles, count: platformActivities.length },
          { id: 'simulated' as const, label: 'القوالب الوهمية', icon: TrendingUp, count: simulatedActivities.length },
          { id: 'settings' as const, label: 'الإعدادات', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-6 py-3 border-b-2 transition-all
                ${
                  activeTab === tab.id
                    ? 'border-emerald-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-emerald-600'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span className="font-medium">{tab.label}</span>
              {tab.count !== undefined && (
                <span className="px-2 py-0.5 text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {activeTab === 'real' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              الأحداث الحقيقية ({platformActivities.length})
            </h2>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl hover:scale-105 transition-transform"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة نشاط يدوي</span>
            </button>
          </div>

          {/* Add Form */}
          {showAddForm && (
            <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl border-2 border-blue-200 dark:border-blue-800 shadow-lg space-y-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-500" />
                إضافة نشاط تسويقي جديد
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    النص بالعربية *
                  </label>
                  <input
                    type="text"
                    value={newActivity.titleAr}
                    onChange={(e) => setNewActivity({ ...newActivity, titleAr: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="مثال: حجز 5 أشجار في مزرعة النخيل الذهبية"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    النص بالإنجليزية *
                  </label>
                  <input
                    type="text"
                    value={newActivity.titleEn}
                    onChange={(e) => setNewActivity({ ...newActivity, titleEn: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Example: 5 trees booked in Golden Palm Farm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    الأيقونة
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {ICON_OPTIONS.map((icon) => (
                      <button
                        key={icon}
                        onClick={() => setNewActivity({ ...newActivity, icon })}
                        className={`
                          p-2 text-2xl rounded-lg border-2 transition-all
                          ${
                            newActivity.icon === icon
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 scale-110'
                              : 'border-gray-200 dark:border-gray-700 hover:scale-105'
                          }
                        `}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    الأولوية (1-10)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={newActivity.priority}
                    onChange={(e) => setNewActivity({ ...newActivity, priority: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">أعلى رقم = أولوية أعلى</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={addManualActivity}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl hover:scale-105 transition-transform disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{loading ? 'جاري الإضافة...' : 'إضافة النشاط'}</span>
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  إلغاء
                </button>
              </div>
            </div>
          )}

          {/* Activities List */}
          <div className="grid grid-cols-1 gap-3">
            {platformActivities.map((activity) => (
              <div
                key={activity.id}
                className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{activity.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 dark:text-white">
                      {activity.activity_title_ar}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(activity.timestamp).toLocaleString('ar-SA')}</span>
                      <span className="mx-1">•</span>
                      <span>الأولوية: {activity.priority}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleActivityVisibility(activity.id, activity.is_visible)}
                    className={`
                      p-2 rounded-lg transition-colors
                      ${
                        activity.is_visible
                          ? 'bg-green-50 dark:bg-green-900/20 text-green-600'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
                      }
                    `}
                    title={activity.is_visible ? 'مرئي' : 'مخفي'}
                  >
                    {activity.is_visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => deleteActivity(activity.id)}
                    className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {platformActivities.length === 0 && (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>لا توجد أحداث حقيقية بعد</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'simulated' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              القوالب الوهمية ({simulatedActivities.length})
            </h2>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:scale-105 transition-transform"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة قالب وهمي</span>
            </button>
          </div>

          {/* Add Form */}
          {showAddForm && (
            <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl border-2 border-purple-200 dark:border-purple-800 shadow-lg space-y-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-purple-500" />
                إضافة قالب وهمي للحركة التلقائية
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    القالب بالعربية *
                  </label>
                  <input
                    type="text"
                    value={newActivity.titleAr}
                    onChange={(e) => setNewActivity({ ...newActivity, titleAr: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="مثال: حجز 3 أشجار في منطقة الأحساء"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    القالب بالإنجليزية *
                  </label>
                  <input
                    type="text"
                    value={newActivity.titleEn}
                    onChange={(e) => setNewActivity({ ...newActivity, titleEn: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Example: 3 trees booked in Al-Ahsa"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    الأيقونة
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {ICON_OPTIONS.map((icon) => (
                      <button
                        key={icon}
                        onClick={() => setNewActivity({ ...newActivity, icon })}
                        className={`
                          p-2 text-2xl rounded-lg border-2 transition-all
                          ${
                            newActivity.icon === icon
                              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 scale-110'
                              : 'border-gray-200 dark:border-gray-700 hover:scale-105'
                          }
                        `}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    التصنيف
                  </label>
                  <select
                    value={newActivity.category}
                    onChange={(e) => setNewActivity({ ...newActivity, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    الوزن (1-100)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={newActivity.weight}
                    onChange={(e) => setNewActivity({ ...newActivity, weight: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">أعلى وزن = احتمالية ظهور أكبر</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={addSimulatedTemplate}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:scale-105 transition-transform disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{loading ? 'جاري الإضافة...' : 'إضافة القالب'}</span>
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  إلغاء
                </button>
              </div>
            </div>
          )}

          {/* Simulated Activities List */}
          <div className="grid grid-cols-1 gap-3">
            {simulatedActivities.map((activity) => (
              <div
                key={activity.id}
                className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{activity.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 dark:text-white">
                      {activity.template_ar}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span>{activity.activity_category}</span>
                      <span className="mx-1">•</span>
                      <span>الوزن: {activity.weight}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleSimulatedActivity(activity.id, activity.is_active)}
                    className={`
                      p-2 rounded-lg transition-colors
                      ${
                        activity.is_active
                          ? 'bg-green-50 dark:bg-green-900/20 text-green-600'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
                      }
                    `}
                    title={activity.is_active ? 'مفعّل' : 'معطّل'}
                  >
                    {activity.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => deleteSimulatedActivity(activity.id)}
                    className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {simulatedActivities.length === 0 && (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>لا توجد قوالب وهمية بعد</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'settings' && settings && (
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            إعدادات الشريط المتحرك
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-4">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-emerald-500" />
                وضع العرض
              </h3>

              <div className="space-y-2">
                {[
                  { value: 'real', label: 'حقيقي فقط', desc: 'أحداث حقيقية من المنصة' },
                  { value: 'simulation', label: 'وهمي فقط', desc: 'قوالب تسويقية مبرمجة' },
                  { value: 'hybrid', label: 'هجين', desc: 'حقيقي + وهمي معاً' },
                ].map((mode) => (
                  <label
                    key={mode.value}
                    className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <input
                      type="radio"
                      name="mode"
                      value={mode.value}
                      checked={settings.mode === mode.value}
                      onChange={(e) => setSettings({ ...settings, mode: e.target.value as any })}
                      className="w-4 h-4 text-emerald-600"
                    />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{mode.label}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{mode.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-4">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-500" />
                سرعة التمرير
              </h3>

              <div className="space-y-2">
                {[
                  { value: 'slow', label: 'بطيء', icon: '🐢' },
                  { value: 'medium', label: 'متوسط', icon: '🚶' },
                  { value: 'fast', label: 'سريع', icon: '🚀' },
                ].map((speed) => (
                  <label
                    key={speed.value}
                    className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <input
                      type="radio"
                      name="speed"
                      value={speed.value}
                      checked={settings.scroll_speed === speed.value}
                      onChange={(e) => setSettings({ ...settings, scroll_speed: e.target.value as any })}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-xl">{speed.icon}</span>
                    <div className="font-medium text-gray-900 dark:text-white">{speed.label}</div>
                  </label>
                ))}
              </div>
            </div>

            <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-4">
              <h3 className="font-bold text-gray-900 dark:text-white">عدد العناصر في الدورة</h3>
              <input
                type="number"
                min="5"
                max="50"
                value={settings.items_per_cycle}
                onChange={(e) => setSettings({ ...settings, items_per_cycle: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">من 5 إلى 50 عنصر</p>
            </div>

            <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.show_timestamps}
                  onChange={(e) => setSettings({ ...settings, show_timestamps: e.target.checked })}
                  className="w-5 h-5 text-emerald-600 rounded"
                />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">إظهار الأوقات</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">عرض "منذ X دقيقة"</div>
                </div>
              </label>
            </div>
          </div>

          <button
            onClick={updateSettings}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:scale-105 transition-transform disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            <span>{loading ? 'جاري الحفظ...' : 'حفظ الإعدادات'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
