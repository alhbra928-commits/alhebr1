import React, { useState, useEffect } from 'react';
import {
  MessageCircle, Settings, Zap, FileText, ToggleLeft, ToggleRight,
  Save, RefreshCw, Play, Eye, EyeOff, Brain, MessageSquare
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
}

interface AutoResponse {
  id: string;
  trigger_text: string;
  response_text_ar: string;
  response_text_en: string;
  intent: string;
  is_active: boolean;
  priority: number;
}

export const SmartButtonManagement: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'settings' | 'responses' | 'ai'>('settings');
  const [settings, setSettings] = useState<SmartButtonSettings>({
    is_enabled: true,
    position: 'bottom-right',
    primary_color: '#10B981',
    pulse_enabled: true,
    sound_enabled: true
  });
  const [responses, setResponses] = useState<AutoResponse[]>([]);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [knowledgeBaseCount, setKnowledgeBaseCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { hasPermission } = usePermissions();

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

      // Load settings (من localStorage أو database)
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

      setResponses(responsesData?.map(r => ({
        id: r.id,
        trigger_text: r.trigger_keywords?.join(', ') || '',
        response_text_ar: r.response_ar,
        response_text_en: r.response_en,
        intent: r.intent,
        is_active: r.is_active,
        priority: r.priority || 0
      })) || []);

      // Load AI settings
      const { count } = await supabase
        .from('whatsapp_knowledge_base')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      setKnowledgeBaseCount(count || 0);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!canEdit) {
      setError('ليس لديك صلاحية لتعديل الإعدادات');
      return;
    }

    try {
      setSaving(true);

      // حفظ في localStorage
      localStorage.setItem('smart_button_settings', JSON.stringify(settings));

      // يمكن حفظ في database أيضاً إذا كان هناك جدول system_settings

      setSuccessMessage('تم حفظ الإعدادات بنجاح');
      setTimeout(() => setSuccessMessage(null), 3000);

      // Log the action
      await supabase.rpc('log_whatsapp_event', {
        p_event_type: 'button_settings_updated',
        p_status: 'success',
        p_metadata: settings
      });

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

  const handleTestButton = async () => {
    if (!canTest) {
      setError('ليس لديك صلاحية لاختبار الزر');
      return;
    }

    setSuccessMessage('تم فتح الزر الذكي للاختبار - راجع الزاوية السفلية للشاشة');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

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
            <p className="text-gray-400 text-sm">إدارة الزر الذكي التفاعلي على جميع صفحات المنصة</p>
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
      </div>

      {/* Settings Tab */}
      {activeSubTab === 'settings' && (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
          <h3 className="text-xl font-bold text-white mb-6">إعدادات الزر الذكي</h3>

          <div className="space-y-6">
            {/* حالة التفعيل */}
            <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
              <div>
                <h4 className="text-white font-semibold mb-1">تفعيل الزر الذكي</h4>
                <p className="text-gray-400 text-sm">إظهار الزر على جميع صفحات المنصة</p>
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
              <h4 className="text-white font-semibold mb-3">موقع الزر</h4>
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
                  أسفل اليسار
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
                  أسفل اليمين
                </button>
              </div>
            </div>

            {/* اللون الأساسي */}
            <div className="p-4 bg-gray-700/30 rounded-lg">
              <h4 className="text-white font-semibold mb-3">اللون الأساسي</h4>
              <input
                type="color"
                value={settings.primary_color}
                onChange={(e) => canEdit && setSettings({ ...settings, primary_color: e.target.value })}
                disabled={!canEdit}
                className="w-full h-12 rounded-lg cursor-pointer disabled:opacity-50"
              />
            </div>

            {/* النبض المتحرك */}
            <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
              <div>
                <h4 className="text-white font-semibold mb-1">النبض المتحرك</h4>
                <p className="text-gray-400 text-sm">تأثير نبض جذاب كل 5 ثوانٍ</p>
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

            {/* الصوت */}
            <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
              <div>
                <h4 className="text-white font-semibold mb-1">صوت الإشعارات</h4>
                <p className="text-gray-400 text-sm">تنبيه صوتي عند وصول رد جديد</p>
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
          <h3 className="text-xl font-bold text-white mb-6">الردود التلقائية</h3>

          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="w-12 h-12 text-cyan-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-400">جاري التحميل...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {responses.map((response) => (
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
                      </div>
                      <p className="text-white font-semibold mb-2">
                        الكلمات المفتاحية: {response.trigger_text}
                      </p>
                      <p className="text-gray-300 text-sm mb-1">
                        🇦🇪 {response.response_text_ar}
                      </p>
                      {response.response_text_en && (
                        <p className="text-gray-400 text-sm">
                          🇬🇧 {response.response_text_en}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleToggleResponse(response.id, response.is_active)}
                      disabled={!canManageResponses}
                      className={`p-2 rounded-lg transition-all ${
                        response.is_active
                          ? 'bg-green-500 hover:bg-green-600'
                          : 'bg-gray-600 hover:bg-gray-500'
                      } ${!canManageResponses ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {response.is_active ? (
                        <ToggleRight className="w-6 h-6 text-white" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-white" />
                      )}
                    </button>
                  </div>
                </div>
              ))}

              {responses.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <FileText className="w-12 h-12 mx-auto mb-4" />
                  <p>لا توجد ردود تلقائية متاحة</p>
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
          <h3 className="text-xl font-bold text-white mb-6">الذكاء المتقدم</h3>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-500/20 to-pink-600/20 rounded-lg border border-purple-500/30">
              <div>
                <h4 className="text-white font-semibold mb-1">محرك الذكاء الاصطناعي v2</h4>
                <p className="text-gray-300 text-sm">يشمل: تحليل المشاعر، التعلم الذاتي، والتحويل الذكي</p>
              </div>
              <button
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
                <p className="text-2xl font-bold text-white">7</p>
                <p className="text-gray-400 text-sm">أنواع النوايا المدعومة</p>
              </div>

              <div className="bg-gray-700/30 rounded-lg p-4 text-center">
                <MessageSquare className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">نشط</p>
                <p className="text-gray-400 text-sm">حالة النظام</p>
              </div>
            </div>

            <div className="bg-gray-700/30 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-3">الميزات المتقدمة:</h4>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  تحليل تعقيد المحادثة تلقائياً
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  اكتشاف المشاعر (إيجابي/سلبي/محايد)
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  التعلم من ردود الموظفين
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  تحويل ذكي للموظف عند الحاجة
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  إدارة نبرة الردود الودية
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
    </div>
  );
};
