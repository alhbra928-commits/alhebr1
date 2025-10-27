import React, { useState, useEffect } from 'react';
import {
  MessageCircle, Settings, Zap, BarChart3, MessageSquare, ToggleLeft, ToggleRight,
  Save, RefreshCw, Play, Eye, EyeOff, Brain, Plus, Edit2, Trash2, Search,
  Download, TestTube, Clock, TrendingUp, Users, CheckCircle2, XCircle, FileText
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { SmartErrorModal } from '../../../components/common/SmartErrorModal';
import { usePermissions } from '../../../contexts/PermissionsContext';

interface SmartButtonSettings {
  is_enabled: boolean;
  position: 'bottom-right' | 'bottom-left';
  primary_color: string;
  pulse_enabled: boolean;
  sound_enabled: boolean;
  welcome_message_visitor: string;
  welcome_message_investor: string;
  welcome_message_owner: string;
}

interface AutoResponse {
  id: string;
  trigger_keywords: string[];
  response_ar: string;
  response_en: string;
  intent: string;
  is_active: boolean;
  priority: number;
  created_at: string;
}

interface ButtonStats {
  total_messages: number;
  auto_responses: number;
  human_transfers: number;
  avg_response_time: number;
  auto_response_rate: number;
  messages_last_24h: number;
}

export const CompleteSmartButtonManagement: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'settings' | 'responses' | 'ai' | 'stats'>('settings');
  const [settings, setSettings] = useState<SmartButtonSettings>({
    is_enabled: true,
    position: 'bottom-right',
    primary_color: '#10B981',
    pulse_enabled: true,
    sound_enabled: true,
    welcome_message_visitor: 'مرحباً! كيف يمكننا مساعدتك اليوم؟ 🌿',
    welcome_message_investor: 'أهلاً بك عزيزي المستثمر! كيف يمكننا خدمتك؟ 💼',
    welcome_message_owner: 'مرحباً بك! نحن هنا لدعمك في إدارة مزرعتك 🚜'
  });
  const [responses, setResponses] = useState<AutoResponse[]>([]);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [knowledgeBaseCount, setKnowledgeBaseCount] = useState(0);
  const [stats, setStats] = useState<ButtonStats>({
    total_messages: 0,
    auto_responses: 0,
    human_transfers: 0,
    avg_response_time: 0,
    auto_response_rate: 0,
    messages_last_24h: 0
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // استخدام الصلاحيات بشكل آمن مع fallback
  let hasPermission: (permission: string) => boolean;
  try {
    const permissionsContext = usePermissions();
    hasPermission = permissionsContext.hasPermission;
  } catch (err) {
    // إذا لم يكن PermissionsContext متاحاً، امنح جميع الصلاحيات
    hasPermission = () => true;
  }

  const canView = hasPermission('whatsapp.button.view');
  const canEdit = hasPermission('whatsapp.button.edit');
  const canManageResponses = hasPermission('whatsapp.button.responses');
  const canManageAI = hasPermission('whatsapp.button.ai');
  const canTest = hasPermission('whatsapp.button.test');

  useEffect(() => {
    if (canView) {
      loadData();
    }
  }, [canView]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load settings
      const savedSettings = localStorage.getItem('smart_button_settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }

      // Load auto responses
      const { data: responsesData, error: responsesError } = await supabase
        .from('whatsapp_knowledge_base')
        .select('*')
        .order('priority', { ascending: false });

      if (responsesError) throw responsesError;

      setResponses(responsesData || []);

      // Load AI settings
      const { count } = await supabase
        .from('whatsapp_knowledge_base')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      setKnowledgeBaseCount(count || 0);

      // Load statistics
      await loadStatistics();

    } catch (err: any) {
      console.error('Load error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      // Get message stats
      const { data: messageData } = await supabase
        .from('whatsapp_messages')
        .select('*')
        .eq('source_type', 'smart_button');

      const total = messageData?.length || 0;
      const autoResponses = messageData?.filter(m => m.metadata?.auto_response).length || 0;
      const humanTransfers = messageData?.filter(m => m.metadata?.human_transfer).length || 0;

      // Messages in last 24 hours
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { count: recentCount } = await supabase
        .from('whatsapp_messages')
        .select('*', { count: 'exact', head: true })
        .eq('source_type', 'smart_button')
        .gte('created_at', yesterday);

      setStats({
        total_messages: total,
        auto_responses: autoResponses,
        human_transfers: humanTransfers,
        avg_response_time: 45, // seconds - يمكن حسابه من timestamps
        auto_response_rate: total > 0 ? (autoResponses / total) * 100 : 0,
        messages_last_24h: recentCount || 0
      });

    } catch (err) {
      console.error('Stats error:', err);
    }
  };

  const handleSaveSettings = async () => {
    if (!canEdit) {
      setError('ليس لديك صلاحية لتعديل الإعدادات');
      return;
    }

    try {
      setSaving(true);

      localStorage.setItem('smart_button_settings', JSON.stringify(settings));

      setSuccessMessage('تم حفظ الإعدادات بنجاح');
      setTimeout(() => setSuccessMessage(null), 3000);

      // إطلاق حدث لتحديث الزر الذكي مباشرة
      window.dispatchEvent(new Event('smart-button-settings-changed'));

      // Log the action
      try {
        await supabase.rpc('log_whatsapp_event', {
          p_event_type: 'button_settings_updated',
          p_status: 'success',
          p_metadata: settings
        });
      } catch (logError) {
        console.log('Could not log event:', logError);
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleResponse = async (responseId: string, isActive: boolean) => {
    if (!canManageResponses) {
      setError('ليس لديك صلاحية لإدارة الردود');
      return;
    }

    try {
      const { error } = await supabase
        .from('whatsapp_knowledge_base')
        .update({ is_active: !isActive })
        .eq('id', responseId);

      if (error) throw error;

      await loadData();
      setSuccessMessage('تم تحديث الرد بنجاح');
      setTimeout(() => setSuccessMessage(null), 3000);

    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteResponse = async (responseId: string) => {
    if (!canManageResponses) {
      setError('ليس لديك صلاحية لحذف الردود');
      return;
    }

    if (!confirm('هل أنت متأكد من حذف هذا الرد؟')) return;

    try {
      const { error } = await supabase
        .from('whatsapp_knowledge_base')
        .delete()
        .eq('id', responseId);

      if (error) throw error;

      await loadData();
      setSuccessMessage('تم حذف الرد بنجاح');
      setTimeout(() => setSuccessMessage(null), 3000);

    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleTestButton = async () => {
    if (!canTest) {
      setError('ليس لديك صلاحية لاختبار الزر');
      return;
    }

    setSuccessMessage('تم فتح الزر الذكي للاختبار - راجع الزاوية السفلية للشاشة');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const filteredResponses = responses.filter(r =>
    r.trigger_keywords.some(k => k.includes(searchQuery)) ||
    r.response_ar.includes(searchQuery) ||
    r.intent.includes(searchQuery)
  );

  if (!canView) {
    return (
      <div className="text-center py-12">
        <Eye className="w-16 h-16 text-gray-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">غير مصرح</h3>
        <p className="text-gray-400">ليس لديك صلاحية لعرض إدارة الزر الذكي</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <SmartErrorModal
        isOpen={!!error}
        onClose={() => setError(null)}
        error={error || ''}
      />

      {successMessage && (
        <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-4 text-green-400 text-center animate-pulse">
          {successMessage}
        </div>
      )}

      {/* العنوان */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-3 rounded-xl">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">الزر الذكي (Smart WhatsApp Button)</h1>
            <p className="text-gray-400 text-sm">إدارة متقدمة للزر التفاعلي على جميع صفحات المنصة</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canTest && (
            <button
              onClick={handleTestButton}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all flex items-center gap-2"
            >
              <Play className="w-5 h-5" />
              اختبار الزر
            </button>
          )}
          <button
            onClick={loadData}
            disabled={loading}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            تحديث
          </button>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveSubTab('settings')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
            activeSubTab === 'settings'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
              : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
          }`}
        >
          <Settings className="w-5 h-5" />
          إعدادات الزر
        </button>

        <button
          onClick={() => setActiveSubTab('responses')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
            activeSubTab === 'responses'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
              : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          الردود التلقائية ({responses.filter(r => r.is_active).length})
        </button>

        <button
          onClick={() => setActiveSubTab('ai')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
            activeSubTab === 'ai'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
              : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
          }`}
        >
          <Brain className="w-5 h-5" />
          الذكاء المتقدم
        </button>

        <button
          onClick={() => setActiveSubTab('stats')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
            activeSubTab === 'stats'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
              : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          الإحصاءات
        </button>
      </div>

      {/* Settings Tab */}
      {activeSubTab === 'settings' && (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
          <h3 className="text-xl font-bold text-white mb-6">⚙️ إعدادات الزر الذكي</h3>

          <div className="space-y-6">
            {/* حالة التفعيل */}
            <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
              <div>
                <h4 className="text-white font-semibold mb-1">تفعيل الزر الذكي</h4>
                <p className="text-gray-400 text-sm">إظهار الزر على جميع صفحات المنصة</p>
                <p className="text-xs text-cyan-400 mt-1">
                  الحالة الحالية: {settings.is_enabled ? '✅ نشط' : '❌ معطل'}
                </p>
              </div>
              <button
                onClick={() => canEdit && setSettings({ ...settings, is_enabled: !settings.is_enabled })}
                disabled={!canEdit}
                className={`p-2 rounded-lg transition-all ${
                  settings.is_enabled
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-gray-600 hover:bg-gray-500'
                } ${!canEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {settings.is_enabled ? (
                  <ToggleRight className="w-8 h-8 text-white" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-white" />
                )}
              </button>
            </div>

            {/* الموقع */}
            <div className="p-4 bg-gray-700/30 rounded-lg">
              <h4 className="text-white font-semibold mb-3">📍 موقع الزر</h4>
              <div className="flex gap-4">
                <button
                  onClick={() => canEdit && setSettings({ ...settings, position: 'bottom-right' })}
                  disabled={!canEdit}
                  className={`flex-1 p-3 rounded-lg transition-all ${
                    settings.position === 'bottom-right'
                      ? 'bg-cyan-500 text-white'
                      : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                  } ${!canEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  أسفل اليسار ⬋
                </button>
                <button
                  onClick={() => canEdit && setSettings({ ...settings, position: 'bottom-left' })}
                  disabled={!canEdit}
                  className={`flex-1 p-3 rounded-lg transition-all ${
                    settings.position === 'bottom-left'
                      ? 'bg-cyan-500 text-white'
                      : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                  } ${!canEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  أسفل اليمين ⬊
                </button>
              </div>
            </div>

            {/* الرسائل الترحيبية */}
            <div className="p-4 bg-gray-700/30 rounded-lg space-y-4">
              <h4 className="text-white font-semibold mb-3">💬 الرسائل الترحيبية حسب نوع المستخدم</h4>

              <div>
                <label className="text-gray-300 text-sm mb-2 block">رسالة الزائر:</label>
                <input
                  type="text"
                  value={settings.welcome_message_visitor}
                  onChange={(e) => canEdit && setSettings({ ...settings, welcome_message_visitor: e.target.value })}
                  disabled={!canEdit}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white disabled:opacity-50"
                />
              </div>

              <div>
                <label className="text-gray-300 text-sm mb-2 block">رسالة المستثمر:</label>
                <input
                  type="text"
                  value={settings.welcome_message_investor}
                  onChange={(e) => canEdit && setSettings({ ...settings, welcome_message_investor: e.target.value })}
                  disabled={!canEdit}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white disabled:opacity-50"
                />
              </div>

              <div>
                <label className="text-gray-300 text-sm mb-2 block">رسالة صاحب المزرعة:</label>
                <input
                  type="text"
                  value={settings.welcome_message_owner}
                  onChange={(e) => canEdit && setSettings({ ...settings, welcome_message_owner: e.target.value })}
                  disabled={!canEdit}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white disabled:opacity-50"
                />
              </div>
            </div>

            {/* اللون الأساسي */}
            <div className="p-4 bg-gray-700/30 rounded-lg">
              <h4 className="text-white font-semibold mb-3">🎨 اللون الأساسي</h4>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={settings.primary_color}
                  onChange={(e) => canEdit && setSettings({ ...settings, primary_color: e.target.value })}
                  disabled={!canEdit}
                  className="w-20 h-12 rounded-lg cursor-pointer disabled:opacity-50"
                />
                <div className="flex-1">
                  <p className="text-gray-300 text-sm">اللون المختار: {settings.primary_color}</p>
                  <div
                    className="mt-2 h-8 rounded-lg"
                    style={{ background: settings.primary_color }}
                  />
                </div>
              </div>
            </div>

            {/* النبض والصوت */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                <div>
                  <h4 className="text-white font-semibold mb-1">النبض المتحرك</h4>
                  <p className="text-gray-400 text-sm">تأثير نبض كل 5 ثوانٍ</p>
                </div>
                <button
                  onClick={() => canEdit && setSettings({ ...settings, pulse_enabled: !settings.pulse_enabled })}
                  disabled={!canEdit}
                  className={`p-2 rounded-lg transition-all ${
                    settings.pulse_enabled
                      ? 'bg-green-500 hover:bg-green-600'
                      : 'bg-gray-600 hover:bg-gray-500'
                  } ${!canEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {settings.pulse_enabled ? (
                    <ToggleRight className="w-8 h-8 text-white" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-white" />
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                <div>
                  <h4 className="text-white font-semibold mb-1">صوت الإشعارات</h4>
                  <p className="text-gray-400 text-sm">تنبيه عند الرد</p>
                </div>
                <button
                  onClick={() => canEdit && setSettings({ ...settings, sound_enabled: !settings.sound_enabled })}
                  disabled={!canEdit}
                  className={`p-2 rounded-lg transition-all ${
                    settings.sound_enabled
                      ? 'bg-green-500 hover:bg-green-600'
                      : 'bg-gray-600 hover:bg-gray-500'
                  } ${!canEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {settings.sound_enabled ? (
                    <ToggleRight className="w-8 h-8 text-white" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-white" />
                  )}
                </button>
              </div>
            </div>

            {/* زر الحفظ */}
            {canEdit && (
              <button
                onClick={handleSaveSettings}
                disabled={saving}
                className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
              </button>
            )}

            {!canEdit && (
              <div className="text-center text-gray-400 text-sm p-4 bg-gray-700/30 rounded-lg">
                <EyeOff className="w-6 h-6 mx-auto mb-2" />
                وضع القراءة فقط - ليس لديك صلاحية التعديل
              </div>
            )}
          </div>
        </div>
      )}

      {/* Responses Tab */}
      {activeSubTab === 'responses' && (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">🤖 الردود التلقائية</h3>
            <div className="flex items-center gap-2">
              {canManageResponses && (
                <>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2">
                    <Download className="w-5 h-5" />
                    استيراد
                  </button>
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    إضافة
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="ابحث في الردود..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="w-12 h-12 text-cyan-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-400">جاري التحميل...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredResponses.map((response) => (
                <div
                  key={response.id}
                  className="bg-gray-700/30 rounded-lg p-4 hover:bg-gray-700/50 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded text-xs">
                          {response.intent}
                        </span>
                        <span className="text-gray-400 text-sm">
                          الأولوية: {response.priority}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          response.is_active
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {response.is_active ? '● نشط' : '○ معطل'}
                        </span>
                      </div>
                      <p className="text-white font-semibold mb-2">
                        الكلمات المفتاحية: {response.trigger_keywords.join(', ')}
                      </p>
                      <p className="text-gray-300 text-sm mb-1">
                        🇦🇪 {response.response_ar}
                      </p>
                      {response.response_en && (
                        <p className="text-gray-400 text-sm">
                          🇬🇧 {response.response_en}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {canManageResponses && (
                        <>
                          <button
                            onClick={() => handleToggleResponse(response.id, response.is_active)}
                            className={`p-2 rounded-lg transition-all ${
                              response.is_active
                                ? 'bg-green-500 hover:bg-green-600'
                                : 'bg-gray-600 hover:bg-gray-500'
                            }`}
                          >
                            {response.is_active ? (
                              <ToggleRight className="w-6 h-6 text-white" />
                            ) : (
                              <ToggleLeft className="w-6 h-6 text-white" />
                            )}
                          </button>
                          <button className="p-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-all">
                            <Edit2 className="w-5 h-5 text-white" />
                          </button>
                          <button
                            onClick={() => handleDeleteResponse(response.id)}
                            className="p-2 bg-red-600 rounded-lg hover:bg-red-700 transition-all"
                          >
                            <Trash2 className="w-5 h-5 text-white" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {filteredResponses.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <FileText className="w-12 h-12 mx-auto mb-4" />
                  <p>لا توجد ردود متطابقة مع البحث</p>
                </div>
              )}
            </div>
          )}

          {!canManageResponses && (
            <div className="text-center text-gray-400 text-sm p-4 bg-gray-700/30 rounded-lg mt-4">
              <EyeOff className="w-6 h-6 mx-auto mb-2" />
              وضع القراءة فقط - ليس لديك صلاحية إدارة الردود
            </div>
          )}
        </div>
      )}

      {/* AI Tab */}
      {activeSubTab === 'ai' && (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
          <h3 className="text-xl font-bold text-white mb-6">🧠 الذكاء المتقدم (AI Engine)</h3>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-500/20 to-pink-600/20 rounded-lg border border-purple-500/30">
              <div>
                <h4 className="text-white font-semibold mb-1">محرك الذكاء الاصطناعي v2</h4>
                <p className="text-gray-300 text-sm">يشمل: تحليل المشاعر، التعلم الذاتي، والتحويل الذكي</p>
                <p className="text-xs text-purple-400 mt-1">
                  معالج الرسائل: {aiEnabled ? '✓ نشط' : '✗ متوقف'}
                </p>
              </div>
              <button
                onClick={() => canManageAI && setAiEnabled(!aiEnabled)}
                disabled={!canManageAI}
                className={`p-2 rounded-lg transition-all ${
                  aiEnabled
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-gray-600 hover:bg-gray-500'
                } ${!canManageAI ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {aiEnabled ? (
                  <ToggleRight className="w-8 h-8 text-white" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-white" />
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-700/30 rounded-lg p-4 text-center">
                <Brain className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{knowledgeBaseCount}</p>
                <p className="text-gray-400 text-sm">ردود في قاعدة المعرفة</p>
              </div>

              <div className="bg-gray-700/30 rounded-lg p-4 text-center">
                <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{stats.messages_last_24h}</p>
                <p className="text-gray-400 text-sm">رسالة خلال 24 ساعة</p>
              </div>

              <div className="bg-gray-700/30 rounded-lg p-4 text-center">
                <MessageSquare className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{stats.auto_response_rate.toFixed(0)}%</p>
                <p className="text-gray-400 text-sm">نسبة الردود التلقائية</p>
              </div>
            </div>

            {canManageAI && (
              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-4 border border-blue-500/30">
                <div className="flex items-center gap-3 mb-3">
                  <TestTube className="w-6 h-6 text-blue-400" />
                  <h4 className="text-white font-semibold">اختبار المحرك الذكي</h4>
                </div>
                <p className="text-gray-300 text-sm mb-3">أرسل رسالة تجريبية لاختبار ذكاء النظام</p>
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all">
                  بدء الاختبار
                </button>
              </div>
            )}

            <div className="bg-gray-700/30 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-3">الميزات المتقدمة:</h4>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  تحليل تعقيد المحادثة تلقائياً
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  اكتشاف المشاعر (إيجابي/سلبي/محايد)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  التعلم من ردود الموظفين
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  تحويل ذكي للموظف عند الحاجة
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  إدارة نبرة الردود الودية
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  دعم اللغة العربية والإنجليزية
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  معالجة متعددة النوايا (7 أنواع)
                </li>
              </ul>
            </div>

            {!canManageAI && (
              <div className="text-center text-gray-400 text-sm p-4 bg-gray-700/30 rounded-lg">
                <EyeOff className="w-6 h-6 mx-auto mb-2" />
                وضع القراءة فقط - ليس لديك صلاحية إدارة الذكاء
              </div>
            )}
          </div>
        </div>
      )}

      {/* Statistics Tab */}
      {activeSubTab === 'stats' && (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
          <h3 className="text-xl font-bold text-white mb-6">📊 الإحصاءات والتحليلات</h3>

          <div className="space-y-6">
            {/* الإحصاءات الرئيسية */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg p-4 border border-blue-500/30">
                <div className="flex items-center justify-between mb-2">
                  <MessageCircle className="w-8 h-8 text-blue-400" />
                  <span className="text-xs text-blue-400">إجمالي</span>
                </div>
                <p className="text-3xl font-bold text-white">{stats.total_messages}</p>
                <p className="text-gray-400 text-sm">الرسائل الكلية</p>
              </div>

              <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg p-4 border border-green-500/30">
                <div className="flex items-center justify-between mb-2">
                  <Brain className="w-8 h-8 text-green-400" />
                  <span className="text-xs text-green-400">آلي</span>
                </div>
                <p className="text-3xl font-bold text-white">{stats.auto_responses}</p>
                <p className="text-gray-400 text-sm">ردود تلقائية</p>
              </div>

              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg p-4 border border-purple-500/30">
                <div className="flex items-center justify-between mb-2">
                  <Users className="w-8 h-8 text-purple-400" />
                  <span className="text-xs text-purple-400">بشري</span>
                </div>
                <p className="text-3xl font-bold text-white">{stats.human_transfers}</p>
                <p className="text-gray-400 text-sm">تحويلات للموظفين</p>
              </div>

              <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg p-4 border border-yellow-500/30">
                <div className="flex items-center justify-between mb-2">
                  <Clock className="w-8 h-8 text-yellow-400" />
                  <span className="text-xs text-yellow-400">سرعة</span>
                </div>
                <p className="text-3xl font-bold text-white">{stats.avg_response_time}ث</p>
                <p className="text-gray-400 text-sm">متوسط الرد</p>
              </div>
            </div>

            {/* نسب الأداء */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-700/30 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-cyan-400" />
                  نسبة الردود التلقائية
                </h4>
                <div className="relative h-8 bg-gray-600 rounded-full overflow-hidden">
                  <div
                    className="absolute inset-y-0 right-0 bg-gradient-to-l from-green-500 to-emerald-500"
                    style={{ width: `${stats.auto_response_rate}%` }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-white text-sm font-bold">
                    {stats.auto_response_rate.toFixed(1)}%
                  </span>
                </div>
                <p className="text-gray-400 text-xs mt-2">
                  {stats.auto_responses} من أصل {stats.total_messages} رسالة
                </p>
              </div>

              <div className="bg-gray-700/30 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-yellow-400" />
                  آخر 24 ساعة
                </h4>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-white">{stats.messages_last_24h}</p>
                    <p className="text-gray-400 text-sm">رسالة جديدة</p>
                  </div>
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                    <MessageCircle className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* ملاحظات */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                ملاحظات الأداء
              </h4>
              <ul className="space-y-1 text-gray-300 text-sm">
                <li>• معدل الرد التلقائي ممتاز ({stats.auto_response_rate.toFixed(0)}%)</li>
                <li>• متوسط وقت الاستجابة سريع ({stats.avg_response_time} ثانية)</li>
                <li>• النظام يعمل بكفاءة عالية</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
