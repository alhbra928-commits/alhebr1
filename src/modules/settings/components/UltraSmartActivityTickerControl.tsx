import { useState, useEffect, useRef } from 'react';
import {
  Settings, Plus, Trash2, Eye, EyeOff, RefreshCw, Save, Sparkles,
  TrendingUp, Zap, CheckCircle, Clock, Play, Pause,
  BarChart3, Activity, Search,
  AlertTriangle, Star, Calendar, Layers, Maximize2, Minimize2, XCircle
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface PlatformActivity {
  id: string;
  activity_type: string;
  activity_data: {
    title_ar: string;
    title_en: string;
    icon: string;
    farm_name?: string;
    tree_count?: number;
    timestamp?: string;
  };
  priority: number;
  is_active: boolean;
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
}

interface ActivityStats {
  total: number;
  active: number;
  inactive: number;
  today: number;
  thisWeek: number;
  avgPriority: number;
}

const ICON_OPTIONS = [
  '🌴', '🫒', '👤', '👥', '📈', '📜', '🏡', '✨', '⭐', '🔥',
  '💳', '🔍', '📊', '🎯', '💰', '🌟', '🎉', '🚀', '💎', '🏆',
  '📱', '🌍', '🌱', '🎨', '💡', '⚡', '🎁', '🔔', '📌', '🎪'
];

const CATEGORIES = [
  { id: 'booking', label: 'حجوزات', icon: '🏡', color: 'blue' },
  { id: 'trending', label: 'رائج', icon: '🔥', color: 'red' },
  { id: 'stats', label: 'إحصائيات', icon: '📊', color: 'green' },
  { id: 'milestone', label: 'إنجازات', icon: '🏆', color: 'yellow' },
  { id: 'interest', label: 'اهتمام', icon: '💡', color: 'purple' },
];

export function UltraSmartActivityTickerControl() {
  const [activeTab, setActiveTab] = useState<'real' | 'simulated' | 'settings'>('real');
  const [platformActivities, setPlatformActivities] = useState<PlatformActivity[]>([]);
  const [simulatedActivities, setSimulatedActivities] = useState<SimulatedActivity[]>([]);
  const [settings, setSettings] = useState<TickerSettings | null>(null);
  const [stats, setStats] = useState<ActivityStats>({
    total: 0,
    active: 0,
    inactive: 0,
    today: 0,
    thisWeek: 0,
    avgPriority: 0,
  });

  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'name'>('date');
  const [liveMode, setLiveMode] = useState(true);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const [newActivity, setNewActivity] = useState({
    type: 'manual',
    titleAr: '',
    titleEn: '',
    icon: '✨',
    priority: 5,
    category: 'stats',
    weight: 10,
  });

  const subscriptionRef = useRef<any>(null);

  useEffect(() => {
    loadAllData();
    if (liveMode) setupRealtimeSubscription();
    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
      }
    };
  }, [liveMode]);

  useEffect(() => {
    calculateStats();
  }, [platformActivities]);

  const setupRealtimeSubscription = () => {
    subscriptionRef.current = supabase
      .channel('ticker_control_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'platform_activities' }, () => {
        loadPlatformActivities();
        showNotification('info', '🔄 تحديث تلقائي للأنشطة');
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'simulated_activities' }, () => {
        loadSimulatedActivities();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activity_ticker_settings' }, () => {
        loadSettings();
      })
      .subscribe();
  };

  const loadAllData = async () => {
    await Promise.all([loadPlatformActivities(), loadSimulatedActivities(), loadSettings()]);
  };

  const loadPlatformActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('platform_activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      if (data) setPlatformActivities(data);
    } catch (error) {
      console.error('Error loading platform activities:', error);
    }
  };

  const loadSimulatedActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('simulated_activities')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setSimulatedActivities(data);
    } catch (error) {
      console.error('Error loading simulated activities:', error);
    }
  };

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('activity_ticker_settings')
        .select('*')
        .single();

      if (error) throw error;
      if (data) setSettings(data);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const calculateStats = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const active = platformActivities.filter(a => a.is_active).length;
    const inactive = platformActivities.filter(a => !a.is_active).length;
    const todayCount = platformActivities.filter(a => new Date(a.created_at) >= today).length;
    const weekCount = platformActivities.filter(a => new Date(a.created_at) >= weekAgo).length;
    const avgPriority = platformActivities.length > 0
      ? platformActivities.reduce((sum, a) => sum + a.priority, 0) / platformActivities.length
      : 0;

    setStats({
      total: platformActivities.length,
      active,
      inactive,
      today: todayCount,
      thisWeek: weekCount,
      avgPriority: Math.round(avgPriority * 10) / 10,
    });
  };

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const addActivity = async () => {
    if (!newActivity.titleAr || !newActivity.titleEn) {
      showNotification('error', 'يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    setLoading(true);
    try {
      if (activeTab === 'real') {
        const { error } = await supabase.from('platform_activities').insert({
          activity_type: 'stats',
          activity_data: {
            title_ar: newActivity.titleAr,
            title_en: newActivity.titleEn,
            icon: newActivity.icon,
          },
          priority: newActivity.priority,
          is_active: true,
        });
        if (error) throw error;
        showNotification('success', '✅ تم إضافة النشاط بنجاح!');
      } else {
        const { error } = await supabase.from('simulated_activities').insert({
          template_ar: newActivity.titleAr,
          template_en: newActivity.titleEn,
          icon: newActivity.icon,
          activity_category: newActivity.category,
          weight: newActivity.weight,
          is_active: true,
        });
        if (error) throw error;
        showNotification('success', '✅ تم إضافة القالب بنجاح!');
      }

      setShowAddModal(false);
      resetForm();
      loadAllData();
    } catch (error) {
      console.error('Error adding activity:', error);
      showNotification('error', 'حدث خطأ عند الإضافة');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNewActivity({
      type: 'manual',
      titleAr: '',
      titleEn: '',
      icon: '✨',
      priority: 5,
      category: 'stats',
      weight: 10,
    });
  };

  const toggleActive = async (id: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from('platform_activities')
        .update({ is_active: !currentState })
        .eq('id', id);

      if (error) throw error;
      showNotification('success', currentState ? '🙈 تم إخفاء النشاط' : '👁️ تم إظهار النشاط');
      loadPlatformActivities();
    } catch (error) {
      console.error('Error toggling active:', error);
    }
  };

  const toggleSimulated = async (id: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from('simulated_activities')
        .update({ is_active: !currentState })
        .eq('id', id);

      if (error) throw error;
      showNotification('success', currentState ? '⏸️ تم تعطيل القالب' : '▶️ تم تفعيل القالب');
      loadSimulatedActivities();
    } catch (error) {
      console.error('Error toggling simulated:', error);
    }
  };

  const deleteActivity = async (id: string) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return;

    try {
      const table = activeTab === 'real' ? 'platform_activities' : 'simulated_activities';
      const { error } = await supabase.from(table).delete().eq('id', id);

      if (error) throw error;
      showNotification('success', '🗑️ تم الحذف بنجاح');
      loadAllData();
    } catch (error) {
      console.error('Error deleting:', error);
      showNotification('error', 'حدث خطأ عند الحذف');
    }
  };

  const bulkToggleActive = async (active: boolean) => {
    if (selectedItems.length === 0) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('platform_activities')
        .update({ is_active: active })
        .in('id', selectedItems);

      if (error) throw error;
      showNotification('success', `✅ تم ${active ? 'إظهار' : 'إخفاء'} ${selectedItems.length} نشاط`);
      setSelectedItems([]);
      loadPlatformActivities();
    } catch (error) {
      console.error('Error bulk toggle:', error);
    } finally {
      setLoading(false);
    }
  };

  const bulkDelete = async () => {
    if (selectedItems.length === 0) return;
    if (!confirm(`هل أنت متأكد من حذف ${selectedItems.length} نشاط؟`)) return;

    setLoading(true);
    try {
      const table = activeTab === 'real' ? 'platform_activities' : 'simulated_activities';
      const { error } = await supabase.from(table).delete().in('id', selectedItems);

      if (error) throw error;
      showNotification('success', `🗑️ تم حذف ${selectedItems.length} نشاط`);
      setSelectedItems([]);
      loadAllData();
    } catch (error) {
      console.error('Error bulk delete:', error);
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
      showNotification('success', '✅ تم حفظ الإعدادات بنجاح!');
    } catch (error) {
      console.error('Error updating settings:', error);
      showNotification('error', 'حدث خطأ عند الحفظ');
    } finally {
      setLoading(false);
    }
  };

  const filteredActivities = platformActivities
    .filter(activity => {
      const titleAr = activity.activity_data?.title_ar || '';
      const titleEn = activity.activity_data?.title_en || '';
      const matchesSearch =
        titleAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        titleEn.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === 'all' || activity.activity_type === filterCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else if (sortBy === 'priority') {
        return b.priority - a.priority;
      } else {
        const aTitle = a.activity_data?.title_ar || '';
        const bTitle = b.activity_data?.title_ar || '';
        return aTitle.localeCompare(bTitle);
      }
    });

  const filteredSimulated = simulatedActivities
    .filter(activity => {
      const matchesSearch =
        activity.template_ar.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.template_en.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === 'all' || activity.activity_category === filterCategory;
      return matchesSearch && matchesCategory;
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 p-6" dir="rtl">
      {notification && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 animate-[slideDown_0.3s_ease-out]">
          <div className={`
            px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border-2 flex items-center gap-3
            ${notification.type === 'success' ? 'bg-green-500/90 border-green-300 text-white' :
              notification.type === 'error' ? 'bg-red-500/90 border-red-300 text-white' :
              'bg-blue-500/90 border-blue-300 text-white'}
          `}>
            {notification.type === 'success' && <CheckCircle className="w-5 h-5" />}
            {notification.type === 'error' && <AlertTriangle className="w-5 h-5" />}
            {notification.type === 'info' && <Activity className="w-5 h-5" />}
            <span className="font-bold">{notification.message}</span>
          </div>
        </div>
      )}

      <div className="container max-w-[1400px] mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl blur-xl opacity-50 animate-pulse"></div>
                <div className="relative p-4 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-3xl shadow-2xl">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-1">
                  لوحة التحكم الذكية
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">
                  إدارة الشريط المتحرك مع معاينة مباشرة
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setLiveMode(!liveMode);
                  if (!liveMode) setupRealtimeSubscription();
                  else if (subscriptionRef.current) supabase.removeChannel(subscriptionRef.current);
                }}
                className={`flex items-center gap-2 px-4 py-3 rounded-2xl font-bold transition-all shadow-lg
                  ${liveMode
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white animate-pulse'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}
              >
                {liveMode ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                <span>{liveMode ? 'مباشر' : 'متوقف'}</span>
                {liveMode && <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>}
              </button>

              <button
                onClick={loadAllData}
                className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-bold hover:scale-105 transition-transform shadow-lg"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                <span>تحديث</span>
              </button>

              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-2xl font-bold hover:scale-105 transition-transform shadow-lg"
              >
                {showPreview ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                <span>{showPreview ? 'إخفاء المعاينة' : 'إظهار المعاينة'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {[
              { label: 'الإجمالي', value: stats.total, icon: Layers, color: 'from-blue-500 to-cyan-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
              { label: 'نشطة', value: stats.active, icon: Eye, color: 'from-green-500 to-emerald-600', bg: 'bg-green-50 dark:bg-green-900/20' },
              { label: 'متوقفة', value: stats.inactive, icon: EyeOff, color: 'from-gray-500 to-slate-600', bg: 'bg-gray-50 dark:bg-gray-900/20' },
              { label: 'اليوم', value: stats.today, icon: Calendar, color: 'from-yellow-500 to-orange-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
              { label: 'هذا الأسبوع', value: stats.thisWeek, icon: TrendingUp, color: 'from-purple-500 to-pink-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
              { label: 'متوسط الأولوية', value: stats.avgPriority, icon: Star, color: 'from-red-500 to-rose-600', bg: 'bg-red-50 dark:bg-red-900/20' },
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className={`${stat.bg} p-4 rounded-2xl border-2 border-white/50 dark:border-gray-800/50 backdrop-blur-sm`}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 bg-gradient-to-br ${stat.color} rounded-xl shadow-lg`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-bold text-gray-600 dark:text-gray-400">{stat.label}</span>
                  </div>
                  <div className="text-3xl font-black text-gray-900 dark:text-white">{stat.value}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className={`grid ${showPreview ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'} gap-6`}>
          <div className="space-y-6">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-white/50 dark:border-gray-700/50 p-2">
              <div className="flex gap-2">
                {[
                  { id: 'real' as const, label: 'الأحداث الحقيقية', icon: Sparkles, count: platformActivities.length, gradient: 'from-blue-500 to-cyan-600' },
                  { id: 'simulated' as const, label: 'القوالب الوهمية', icon: TrendingUp, count: simulatedActivities.length, gradient: 'from-purple-500 to-pink-600' },
                  { id: 'settings' as const, label: 'الإعدادات', icon: Settings, gradient: 'from-green-500 to-emerald-600' },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-bold transition-all
                        ${isActive
                          ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg scale-105`
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="hidden md:inline">{tab.label}</span>
                      {tab.count !== undefined && (
                        <span className={`px-2 py-0.5 text-xs rounded-full font-black
                          ${isActive ? 'bg-white/30' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
                          {tab.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-white/50 dark:border-gray-700/50 p-6">
              {(activeTab === 'real' || activeTab === 'simulated') && (
                <>
                  <div className="flex flex-col gap-4 mb-6">
                    <div className="flex gap-3">
                      <div className="flex-1 relative">
                        <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="ابحث في الأنشطة..."
                          className="w-full pr-12 pl-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                      </div>

                      <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-bold hover:scale-105 transition-transform shadow-lg"
                      >
                        <Plus className="w-5 h-5" />
                        <span className="hidden md:inline">إضافة جديد</span>
                      </button>
                    </div>

                    {selectedItems.length > 0 && (
                      <div className="flex gap-2 flex-wrap">
                        <span className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-xl font-bold flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          {selectedItems.length} محدد
                        </span>
                        {activeTab === 'real' && (
                          <>
                            <button
                              onClick={() => bulkToggleActive(true)}
                              className="px-4 py-2 bg-green-500 text-white rounded-xl font-bold hover:scale-105 transition-transform"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => bulkToggleActive(false)}
                              className="px-4 py-2 bg-gray-500 text-white rounded-xl font-bold hover:scale-105 transition-transform"
                            >
                              <EyeOff className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={bulkDelete}
                          className="px-4 py-2 bg-red-500 text-white rounded-xl font-bold hover:scale-105 transition-transform"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setSelectedItems([])}
                          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:scale-105 transition-transform"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    {activeTab === 'real' && filteredActivities.map((activity) => (
                      <div
                        key={activity.id}
                        className={`p-4 rounded-2xl border-2 transition-all hover:shadow-lg
                          ${selectedItems.includes(activity.id)
                            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'
                            : 'bg-gray-50 dark:bg-gray-900/30 border-gray-200 dark:border-gray-700'}`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(activity.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedItems([...selectedItems, activity.id]);
                              } else {
                                setSelectedItems(selectedItems.filter(id => id !== activity.id));
                              }
                            }}
                            className="w-5 h-5 text-blue-600 rounded-lg"
                          />
                          <span className="text-3xl">{activity.activity_data?.icon || '✨'}</span>
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 dark:text-white mb-1">
                              {activity.activity_data?.title_ar || 'نشاط'}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                              <Clock className="w-3 h-3" />
                              <span>{new Date(activity.created_at).toLocaleString('ar-SA', { dateStyle: 'short', timeStyle: 'short' })}</span>
                              <span className="mx-1">•</span>
                              <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                              <span>{activity.priority}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleActive(activity.id, activity.is_active)}
                              className={`p-2 rounded-xl transition-all hover:scale-110
                                ${activity.is_active
                                  ? 'bg-green-500 text-white shadow-lg'
                                  : 'bg-gray-300 dark:bg-gray-700 text-gray-500'}`}
                            >
                              {activity.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => deleteActivity(activity.id)}
                              className="p-2 rounded-xl bg-red-500 text-white hover:scale-110 transition-all shadow-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {activeTab === 'simulated' && filteredSimulated.map((activity) => (
                      <div
                        key={activity.id}
                        className={`p-4 rounded-2xl border-2 transition-all hover:shadow-lg
                          ${selectedItems.includes(activity.id)
                            ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-700'
                            : 'bg-gray-50 dark:bg-gray-900/30 border-gray-200 dark:border-gray-700'}`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(activity.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedItems([...selectedItems, activity.id]);
                              } else {
                                setSelectedItems(selectedItems.filter(id => id !== activity.id));
                              }
                            }}
                            className="w-5 h-5 text-purple-600 rounded-lg"
                          />
                          <span className="text-3xl">{activity.icon}</span>
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 dark:text-white mb-1">
                              {activity.template_ar}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                              <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg font-bold">
                                {activity.activity_category}
                              </span>
                              <span className="mx-1">•</span>
                              <span>وزن: {activity.weight}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleSimulated(activity.id, activity.is_active)}
                              className={`p-2 rounded-xl transition-all hover:scale-110
                                ${activity.is_active
                                  ? 'bg-green-500 text-white shadow-lg'
                                  : 'bg-gray-300 dark:bg-gray-700 text-gray-500'}`}
                            >
                              {activity.is_active ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => deleteActivity(activity.id)}
                              className="p-2 rounded-xl bg-red-500 text-white hover:scale-110 transition-all shadow-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {((activeTab === 'real' && filteredActivities.length === 0) ||
                      (activeTab === 'simulated' && filteredSimulated.length === 0)) && (
                      <div className="text-center py-16">
                        <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center">
                          <Activity className="w-10 h-10 text-gray-400" />
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 font-bold text-lg">لا توجد أنشطة</p>
                        <button
                          onClick={() => setShowAddModal(true)}
                          className="mt-4 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-bold hover:scale-105 transition-transform"
                        >
                          إضافة نشاط جديد
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}

              {activeTab === 'settings' && settings && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                    <Settings className="w-6 h-6" />
                    إعدادات الشريط المتحرك
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border-2 border-blue-200 dark:border-blue-800">
                      <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-blue-500" />
                        وضع العرض
                      </h3>
                      <div className="space-y-2">
                        {[
                          { value: 'real', label: 'حقيقي', icon: '📊', desc: 'أحداث حقيقية فقط' },
                          { value: 'simulation', label: 'وهمي', icon: '🎭', desc: 'قوالب تسويقية' },
                          { value: 'hybrid', label: 'هجين', icon: '🔄', desc: 'حقيقي + وهمي' },
                        ].map((mode) => (
                          <label
                            key={mode.value}
                            className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl cursor-pointer hover:scale-105 transition-all border-2 border-transparent hover:border-blue-300"
                          >
                            <input
                              type="radio"
                              name="mode"
                              value={mode.value}
                              checked={settings.mode === mode.value}
                              onChange={(e) => setSettings({ ...settings, mode: e.target.value as any })}
                              className="w-5 h-5 text-blue-600"
                            />
                            <span className="text-2xl">{mode.icon}</span>
                            <div className="flex-1">
                              <div className="font-bold text-gray-900 dark:text-white">{mode.label}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{mode.desc}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border-2 border-green-200 dark:border-green-800">
                      <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-green-500" />
                        سرعة التمرير
                      </h3>
                      <div className="space-y-2">
                        {[
                          { value: 'slow', label: 'بطيء', icon: '🐢', pixels: '1.0px/frame' },
                          { value: 'medium', label: 'متوسط', icon: '🚶', pixels: '2.2px/frame' },
                          { value: 'fast', label: 'سريع', icon: '🚀', pixels: '3.0px/frame' },
                        ].map((speed) => (
                          <label
                            key={speed.value}
                            className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl cursor-pointer hover:scale-105 transition-all border-2 border-transparent hover:border-green-300"
                          >
                            <input
                              type="radio"
                              name="speed"
                              value={speed.value}
                              checked={settings.scroll_speed === speed.value}
                              onChange={(e) => setSettings({ ...settings, scroll_speed: e.target.value as any })}
                              className="w-5 h-5 text-green-600"
                            />
                            <span className="text-2xl">{speed.icon}</span>
                            <div className="flex-1">
                              <div className="font-bold text-gray-900 dark:text-white">{speed.label}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{speed.pixels}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl border-2 border-purple-200 dark:border-purple-800">
                      <h3 className="font-bold text-gray-900 dark:text-white mb-4">عدد العناصر في الدورة</h3>
                      <input
                        type="number"
                        min="5"
                        max="50"
                        value={settings.items_per_cycle}
                        onChange={(e) => setSettings({ ...settings, items_per_cycle: parseInt(e.target.value) || 5 })}
                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-purple-200 dark:border-purple-700 rounded-xl text-gray-900 dark:text-white font-bold text-lg text-center"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">من 5 إلى 50 عنصر</p>
                    </div>

                    <div className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-2xl border-2 border-yellow-200 dark:border-yellow-800">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.show_timestamps}
                          onChange={(e) => setSettings({ ...settings, show_timestamps: e.target.checked })}
                          className="w-6 h-6 text-yellow-600 rounded-lg"
                        />
                        <div>
                          <div className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Clock className="w-5 h-5 text-yellow-500" />
                            إظهار الأوقات
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">عرض "منذ X دقيقة"</div>
                        </div>
                      </label>
                    </div>
                  </div>

                  <button
                    onClick={updateSettings}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-black text-lg hover:scale-105 transition-transform disabled:opacity-50 shadow-2xl"
                  >
                    <Save className="w-6 h-6" />
                    <span>{loading ? 'جاري الحفظ...' : 'حفظ جميع الإعدادات'}</span>
                    <CheckCircle className="w-6 h-6" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {showPreview && (
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-white/50 dark:border-gray-700/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                  <Eye className="w-6 h-6 text-purple-500" />
                  معاينة مباشرة
                </h2>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-green-500 text-white text-sm font-bold rounded-full flex items-center gap-2 animate-pulse">
                    <span className="w-2 h-2 bg-white rounded-full"></span>
                    مباشر
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {settings && (
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border-2 border-blue-200 dark:border-blue-800">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-blue-500" />
                      الإعدادات الحالية
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-white dark:bg-gray-800 rounded-xl">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">الوضع</div>
                        <div className="font-bold text-gray-900 dark:text-white">
                          {settings.mode === 'real' ? '📊 حقيقي' :
                           settings.mode === 'simulation' ? '🎭 وهمي' : '🔄 هجين'}
                        </div>
                      </div>
                      <div className="p-3 bg-white dark:bg-gray-800 rounded-xl">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">السرعة</div>
                        <div className="font-bold text-gray-900 dark:text-white">
                          {settings.scroll_speed === 'slow' ? '🐢 بطيء' :
                           settings.scroll_speed === 'medium' ? '🚶 متوسط' : '🚀 سريع'}
                        </div>
                      </div>
                      <div className="p-3 bg-white dark:bg-gray-800 rounded-xl">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">عدد العناصر</div>
                        <div className="font-bold text-gray-900 dark:text-white">{settings.items_per_cycle}</div>
                      </div>
                      <div className="p-3 bg-white dark:bg-gray-800 rounded-xl">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">الأوقات</div>
                        <div className="font-bold text-gray-900 dark:text-white">
                          {settings.show_timestamps ? '✅ مفعّل' : '❌ معطّل'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl border-2 border-purple-200 dark:border-purple-800">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-purple-500" />
                    الأنشطة النشطة
                  </h3>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                    {platformActivities
                      .filter(a => a.is_active)
                      .slice(0, 10)
                      .map((activity) => (
                        <div
                          key={activity.id}
                          className="p-3 bg-white dark:bg-gray-800 rounded-xl flex items-center gap-3 hover:scale-105 transition-transform"
                        >
                          <span className="text-2xl">{activity.activity_data?.icon || '✨'}</span>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-gray-900 dark:text-white text-sm truncate">
                              {activity.activity_data?.title_ar || 'نشاط'}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                              <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                              <span>{activity.priority}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border-2 border-green-200 dark:border-green-800">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-gray-900 dark:text-white mb-1">تحديث تلقائي</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        الشريط يتحدث تلقائياً عند أي تغيير في الأنشطة أو الإعدادات
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                <Plus className="w-6 h-6 text-blue-500" />
                {activeTab === 'real' ? 'إضافة نشاط حقيقي' : 'إضافة قالب وهمي'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
              >
                <XCircle className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  النص بالعربية *
                </label>
                <input
                  type="text"
                  value={newActivity.titleAr}
                  onChange={(e) => setNewActivity({ ...newActivity, titleAr: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500"
                  placeholder="مثال: حجز 5 أشجار في مزرعة النخيل الذهبية"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  النص بالإنجليزية *
                </label>
                <input
                  type="text"
                  value={newActivity.titleEn}
                  onChange={(e) => setNewActivity({ ...newActivity, titleEn: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500"
                  placeholder="Example: 5 trees booked in Golden Palm Farm"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  اختر الأيقونة
                </label>
                <div className="grid grid-cols-10 gap-2 max-h-40 overflow-y-auto p-2 bg-gray-50 dark:bg-gray-900 rounded-xl">
                  {ICON_OPTIONS.map((icon) => (
                    <button
                      key={icon}
                      onClick={() => setNewActivity({ ...newActivity, icon })}
                      className={`p-2 text-2xl rounded-lg border-2 transition-all hover:scale-110
                        ${newActivity.icon === icon
                          ? 'border-blue-500 bg-blue-100 dark:bg-blue-900/30 scale-110 shadow-lg'
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'}`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    {activeTab === 'real' ? 'الأولوية (1-10)' : 'الوزن (1-100)'}
                  </label>
                  <input
                    type="number"
                    min={activeTab === 'real' ? 1 : 1}
                    max={activeTab === 'real' ? 10 : 100}
                    value={activeTab === 'real' ? newActivity.priority : newActivity.weight}
                    onChange={(e) => activeTab === 'real'
                      ? setNewActivity({ ...newActivity, priority: parseInt(e.target.value) || 1 })
                      : setNewActivity({ ...newActivity, weight: parseInt(e.target.value) || 1 })
                    }
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-bold text-center text-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {activeTab === 'simulated' && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      التصنيف
                    </label>
                    <select
                      value={newActivity.category}
                      onChange={(e) => setNewActivity({ ...newActivity, category: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.icon} {cat.label}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={addActivity}
                  disabled={loading || !newActivity.titleAr || !newActivity.titleEn}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-black text-lg hover:scale-105 transition-transform disabled:opacity-50 shadow-2xl"
                >
                  <CheckCircle className="w-6 h-6" />
                  <span>{loading ? 'جاري الإضافة...' : 'إضافة النشاط'}</span>
                </button>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="px-6 py-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-2xl font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #3b82f6, #6366f1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #2563eb, #4f46e5);
        }
        @keyframes slideDown {
          from {
            transform: translate(-50%, -100%);
            opacity: 0;
          }
          to {
            transform: translate(-50%, 0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
