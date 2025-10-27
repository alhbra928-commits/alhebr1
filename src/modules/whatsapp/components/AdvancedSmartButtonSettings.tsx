import React, { useState, useEffect } from 'react';
import {
  Settings, Eye, Save, RotateCcw, Lock, Unlock, TestTube, CheckCircle2,
  Zap, Palette, MessageCircle, Bell, MapPin, Clock, Users, Shield,
  Sparkles, Volume2, VolumeX, Radio, Smartphone, Monitor, RefreshCw
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { SmartErrorModal } from '../../../components/common/SmartErrorModal';

interface ButtonSettings {
  // الإعدادات العامة
  is_enabled: boolean;
  position: 'bottom-right' | 'bottom-left' | 'bottom-center' | 'auto-mobile';
  display_timing: 'immediate' | 'after_5s' | 'on_scroll';
  show_for_visitors: boolean;
  show_for_investors: boolean;
  show_for_owners: boolean;
  connection_type: 'ai_only' | 'staff_only' | 'hybrid';
  require_authentication: boolean;

  // المظهر والتصميم
  primary_color: string;
  glow_intensity: 'light' | 'medium' | 'strong' | 'none';
  icon_shape: 'circle' | 'square' | '3d';
  pulse_enabled: boolean;
  button_text: string;
  button_text_enabled: boolean;
  mobile_scroll_trigger: boolean;

  // الرسائل الترحيبية
  welcome_message_visitor: string;
  welcome_message_investor: string;
  welcome_message_owner: string;

  // التنبيهات والتفاعل
  notification_enabled: boolean;
  notification_text: string;
  sound_enabled: boolean;
  auto_close_minutes: number;
  save_conversation: boolean;
  show_online_indicator: boolean;

  // الإدارة
  is_locked: boolean;
  last_tested_at: string | null;
}

export const AdvancedSmartButtonSettings: React.FC = () => {
  const [settings, setSettings] = useState<ButtonSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeGroup, setActiveGroup] = useState<'general' | 'appearance' | 'messages' | 'notifications'>('general');
  const [showPreview, setShowPreview] = useState(false);
  const [testingButton, setTestingButton] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('whatsapp_button_settings')
        .select('*')
        .eq('id', '00000000-0000-0000-0000-000000000001')
        .single();

      if (fetchError) throw fetchError;
      setSettings(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;

    if (settings.is_locked) {
      setError('⚠️ الإعدادات مقفلة حالياً. يرجى فك القفل أولاً.');
      return;
    }

    try {
      setSaving(true);
      const adminSession = JSON.parse(localStorage.getItem('admin_data') || '{}');

      const { error: updateError } = await supabase
        .from('whatsapp_button_settings')
        .update({
          ...settings,
          last_modified_by: adminSession.phone || 'system',
          updated_at: new Date().toISOString()
        })
        .eq('id', '00000000-0000-0000-0000-000000000001');

      if (updateError) throw updateError;

      setSuccessMessage('✅ تم حفظ الإعدادات بنجاح');
      setTimeout(() => setSuccessMessage(null), 3000);

      // إشعار التغيير
      window.dispatchEvent(new Event('smart-button-settings-changed'));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefault = async () => {
    if (!confirm('هل أنت متأكد من إعادة جميع الإعدادات للحالة الافتراضية؟')) return;

    try {
      setSaving(true);
      const adminSession = JSON.parse(localStorage.getItem('admin_data') || '{}');

      const { error: resetError } = await supabase
        .rpc('reset_button_settings_to_default', {
          modified_by_phone: adminSession.phone || 'system'
        });

      if (resetError) throw resetError;

      await loadSettings();
      setSuccessMessage('✅ تم إعادة الإعدادات للحالة الافتراضية');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleLock = async () => {
    if (!settings) return;

    try {
      const adminSession = JSON.parse(localStorage.getItem('admin_data') || '{}');

      const { error: lockError } = await supabase
        .rpc('toggle_button_settings_lock', {
          should_lock: !settings.is_locked,
          modified_by_phone: adminSession.phone || 'system'
        });

      if (lockError) throw lockError;

      await loadSettings();
      setSuccessMessage(settings.is_locked ? '🔓 تم فتح الإعدادات' : '🔒 تم قفل الإعدادات');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleTestButton = async () => {
    try {
      setTestingButton(true);
      const adminSession = JSON.parse(localStorage.getItem('admin_data') || '{}');

      await supabase.rpc('record_button_test', {
        tested_by_phone: adminSession.phone || 'system'
      });

      setShowPreview(true);
      setSuccessMessage('✅ تم تسجيل الاختبار');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setTestingButton(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-cyan-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {error && <SmartErrorModal error={error} onClose={() => setError(null)} />}

      {successMessage && (
        <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-4 text-green-400 text-center animate-pulse">
          {successMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-3 rounded-xl">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">⚙️ إعدادات الزر الذكي الشاملة</h2>
            <p className="text-gray-400 text-sm">تخصيص كامل لسلوك ومظهر الزر على المنصة</p>
          </div>
        </div>

        <div className="flex gap-2">
          {settings.is_locked && (
            <div className="px-4 py-2 bg-red-600/20 border border-red-500/50 rounded-lg text-red-400 flex items-center gap-2">
              <Lock className="w-5 h-5" />
              <span>مقفل</span>
            </div>
          )}

          <button
            onClick={handleToggleLock}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
              settings.is_locked
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
            }`}
          >
            {settings.is_locked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
            {settings.is_locked ? 'فك القفل' : 'قفل'}
          </button>

          <button
            onClick={handleTestButton}
            disabled={testingButton}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <TestTube className="w-5 h-5" />
            {testingButton ? 'جاري الاختبار...' : 'اختبار الزر'}
          </button>

          <button
            onClick={handleResetToDefault}
            disabled={settings.is_locked}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <RotateCcw className="w-5 h-5" />
            استعادة الافتراضي
          </button>

          <button
            onClick={handleSaveSettings}
            disabled={saving || settings.is_locked}
            className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </button>
        </div>
      </div>

      {/* Group Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveGroup('general')}
          className={`flex items-center gap-2 px-4 py-3 rounded-lg whitespace-nowrap transition-all ${
            activeGroup === 'general'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
              : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
          }`}
        >
          <Zap className="w-5 h-5" />
          الإعدادات العامة
        </button>

        <button
          onClick={() => setActiveGroup('appearance')}
          className={`flex items-center gap-2 px-4 py-3 rounded-lg whitespace-nowrap transition-all ${
            activeGroup === 'appearance'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
              : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
          }`}
        >
          <Palette className="w-5 h-5" />
          المظهر والتصميم
        </button>

        <button
          onClick={() => setActiveGroup('messages')}
          className={`flex items-center gap-2 px-4 py-3 rounded-lg whitespace-nowrap transition-all ${
            activeGroup === 'messages'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
              : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
          }`}
        >
          <MessageCircle className="w-5 h-5" />
          الرسائل الترحيبية
        </button>

        <button
          onClick={() => setActiveGroup('notifications')}
          className={`flex items-center gap-2 px-4 py-3 rounded-lg whitespace-nowrap transition-all ${
            activeGroup === 'notifications'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
              : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
          }`}
        >
          <Bell className="w-5 h-5" />
          التنبيهات والتفاعل
        </button>
      </div>

      {/* General Settings */}
      {activeGroup === 'general' && (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 space-y-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Zap className="w-6 h-6 text-cyan-400" />
            الإعدادات العامة
          </h3>

          {/* تفعيل الزر */}
          <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
            <div className="flex-1">
              <h4 className="text-white font-semibold mb-1 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                تفعيل الزر الذكي
              </h4>
              <p className="text-gray-400 text-sm">إظهار الزر على جميع صفحات المنصة</p>
              <p className="text-xs text-cyan-400 mt-1">
                الحالة: {settings.is_enabled ? '✅ نشط' : '❌ معطل'}
              </p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, is_enabled: !settings.is_enabled })}
              disabled={settings.is_locked}
              className={`px-6 py-3 rounded-lg font-bold transition-all disabled:opacity-50 ${
                settings.is_enabled
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-gray-600 hover:bg-gray-500 text-white'
              }`}
            >
              {settings.is_enabled ? 'مُفعّل' : 'معطّل'}
            </button>
          </div>

          {/* موقع الزر */}
          <div className="p-4 bg-gray-700/30 rounded-lg">
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-orange-400" />
              📍 موقع الزر في الشاشة
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { value: 'bottom-right', label: 'أسفل اليسار ⬋', icon: '⬋' },
                { value: 'bottom-left', label: 'أسفل اليمين ⬊', icon: '⬊' },
                { value: 'bottom-center', label: 'أسفل المنتصف ⬇', icon: '⬇' },
                { value: 'auto-mobile', label: 'تلقائي للجوال 📱', icon: '📱' }
              ].map((pos) => (
                <button
                  key={pos.value}
                  onClick={() => setSettings({ ...settings, position: pos.value as any })}
                  disabled={settings.is_locked}
                  className={`p-3 rounded-lg transition-all disabled:opacity-50 ${
                    settings.position === pos.value
                      ? 'bg-cyan-500 text-white'
                      : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                  }`}
                >
                  {pos.label}
                </button>
              ))}
            </div>
          </div>

          {/* توقيت الظهور */}
          <div className="p-4 bg-gray-700/30 rounded-lg">
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-400" />
              ⏱️ توقيت ظهور الزر
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { value: 'immediate', label: 'فوري ⚡', desc: 'يظهر مباشرة' },
                { value: 'after_5s', label: 'بعد 5 ثوانٍ ⏱️', desc: 'تأخير 5 ثوانٍ' },
                { value: 'on_scroll', label: 'عند التمرير 📜', desc: 'عند تحريك الصفحة' }
              ].map((timing) => (
                <button
                  key={timing.value}
                  onClick={() => setSettings({ ...settings, display_timing: timing.value as any })}
                  disabled={settings.is_locked}
                  className={`p-4 rounded-lg transition-all disabled:opacity-50 ${
                    settings.display_timing === timing.value
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                  }`}
                >
                  <div className="font-semibold">{timing.label}</div>
                  <div className="text-xs mt-1 opacity-75">{timing.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* الفئات المستهدفة */}
          <div className="p-4 bg-gray-700/30 rounded-lg">
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Users className="w-5 h-5 text-green-400" />
              🧭 الفئات التي يظهر لها الزر
            </h4>
            <div className="space-y-3">
              {[
                { key: 'show_for_visitors', label: '👤 الزوار', desc: 'الزوار غير المسجلين' },
                { key: 'show_for_investors', label: '💼 المستثمرين', desc: 'المستثمرون المسجلون' },
                { key: 'show_for_owners', label: '🌴 أصحاب المزارع', desc: 'ملاك المزارع' }
              ].map((category) => (
                <div key={category.key} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div>
                    <p className="text-white font-semibold">{category.label}</p>
                    <p className="text-gray-400 text-sm">{category.desc}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={(settings as any)[category.key]}
                    onChange={(e) => setSettings({ ...settings, [category.key]: e.target.checked })}
                    disabled={settings.is_locked}
                    className="w-6 h-6 rounded text-cyan-500 disabled:opacity-50"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* نوع الاتصال */}
          <div className="p-4 bg-gray-700/30 rounded-lg">
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Radio className="w-5 h-5 text-blue-400" />
              🧩 نوع الاتصال
            </h4>
            <div className="space-y-3">
              {[
                { value: 'ai_only', label: '🤖 ذكاء آلي فقط', desc: 'ردود تلقائية بالكامل' },
                { value: 'staff_only', label: '👨‍💼 موظف مباشر', desc: 'تحويل لموظف فوراً' },
                { value: 'hybrid', label: '🔄 مزيج بين الاثنين', desc: 'ذكي ثم موظف عند الحاجة' }
              ].map((type) => (
                <button
                  key={type.value}
                  onClick={() => setSettings({ ...settings, connection_type: type.value as any })}
                  disabled={settings.is_locked}
                  className={`w-full p-4 rounded-lg transition-all text-right disabled:opacity-50 ${
                    settings.connection_type === type.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                  }`}
                >
                  <div className="font-semibold">{type.label}</div>
                  <div className="text-sm mt-1 opacity-75">{type.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* خيارات الأمان */}
          <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
            <div>
              <h4 className="text-white font-semibold mb-1 flex items-center gap-2">
                <Shield className="w-5 h-5 text-yellow-400" />
                🔒 يتطلب مصادقة
              </h4>
              <p className="text-gray-400 text-sm">إظهار الزر فقط للمستخدمين المسجلين</p>
            </div>
            <input
              type="checkbox"
              checked={settings.require_authentication}
              onChange={(e) => setSettings({ ...settings, require_authentication: e.target.checked })}
              disabled={settings.is_locked}
              className="w-6 h-6 rounded text-cyan-500 disabled:opacity-50"
            />
          </div>

          {/* معلومة الجوال */}
          <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
            <div>
              <h4 className="text-white font-semibold mb-1 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-purple-400" />
                📱 إظهار بعد التمرير (للجوال)
              </h4>
              <p className="text-gray-400 text-sm">يظهر الزر بعد تمرير المستخدم لمنتصف الصفحة على الجوال</p>
            </div>
            <input
              type="checkbox"
              checked={settings.mobile_scroll_trigger}
              onChange={(e) => setSettings({ ...settings, mobile_scroll_trigger: e.target.checked })}
              disabled={settings.is_locked}
              className="w-6 h-6 rounded text-cyan-500 disabled:opacity-50"
            />
          </div>
        </div>
      )}

      {/* Appearance Settings */}
      {activeGroup === 'appearance' && (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 space-y-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Palette className="w-6 h-6 text-cyan-400" />
            المظهر والتصميم
          </h3>

          {/* اللون الأساسي */}
          <div className="p-4 bg-gray-700/30 rounded-lg">
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              🎨 اللون الأساسي
            </h4>
            <div className="flex items-center gap-4">
              <input
                type="color"
                value={settings.primary_color}
                onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                disabled={settings.is_locked}
                className="w-24 h-16 rounded-lg cursor-pointer disabled:opacity-50"
              />
              <div className="flex-1">
                <p className="text-gray-300 mb-2">اللون المختار: {settings.primary_color}</p>
                <div
                  className="h-12 rounded-lg transition-all"
                  style={{ background: settings.primary_color }}
                />
                <p className="text-xs text-gray-500 mt-2">الافتراضي: #D4AF37 (ذهبي زيتوني)</p>
              </div>
            </div>
          </div>

          {/* درجة التوهج */}
          <div className="p-4 bg-gray-700/30 rounded-lg">
            <h4 className="text-white font-semibold mb-3">🌈 درجة التوهج</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { value: 'none', label: 'بدون', emoji: '⚫' },
                { value: 'light', label: 'خفيف', emoji: '💫' },
                { value: 'medium', label: 'متوسط', emoji: '✨' },
                { value: 'strong', label: 'قوي', emoji: '🌟' }
              ].map((glow) => (
                <button
                  key={glow.value}
                  onClick={() => setSettings({ ...settings, glow_intensity: glow.value as any })}
                  disabled={settings.is_locked}
                  className={`p-3 rounded-lg transition-all disabled:opacity-50 ${
                    settings.glow_intensity === glow.value
                      ? 'bg-cyan-500 text-white'
                      : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                  }`}
                >
                  <div className="text-2xl mb-1">{glow.emoji}</div>
                  <div className="text-sm">{glow.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* شكل الأيقونة */}
          <div className="p-4 bg-gray-700/30 rounded-lg">
            <h4 className="text-white font-semibold mb-3">💫 شكل الأيقونة</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { value: 'circle', label: '⭕ دائري', desc: 'الشكل الكلاسيكي' },
                { value: 'square', label: '🔲 مربع', desc: 'حواف حادة' },
                { value: '3d', label: '🎲 ثلاثي الأبعاد', desc: 'مظهر متقدم' }
              ].map((shape) => (
                <button
                  key={shape.value}
                  onClick={() => setSettings({ ...settings, icon_shape: shape.value as any })}
                  disabled={settings.is_locked}
                  className={`p-4 rounded-lg transition-all disabled:opacity-50 ${
                    settings.icon_shape === shape.value
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                  }`}
                >
                  <div className="font-semibold">{shape.label}</div>
                  <div className="text-xs mt-1 opacity-75">{shape.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* حركة النبض */}
          <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
            <div>
              <h4 className="text-white font-semibold mb-1">🪞 تفعيل حركة النبض</h4>
              <p className="text-gray-400 text-sm">تأثير نبض متحرك كل 5 ثوانٍ لجذب الانتباه</p>
            </div>
            <input
              type="checkbox"
              checked={settings.pulse_enabled}
              onChange={(e) => setSettings({ ...settings, pulse_enabled: e.target.checked })}
              disabled={settings.is_locked}
              className="w-6 h-6 rounded text-cyan-500 disabled:opacity-50"
            />
          </div>

          {/* نص بجانب الزر */}
          <div className="p-4 bg-gray-700/30 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-white font-semibold">✍️ نص بجانب الزر</h4>
              <input
                type="checkbox"
                checked={settings.button_text_enabled}
                onChange={(e) => setSettings({ ...settings, button_text_enabled: e.target.checked })}
                disabled={settings.is_locked}
                className="w-6 h-6 rounded text-cyan-500 disabled:opacity-50"
              />
            </div>
            {settings.button_text_enabled && (
              <input
                type="text"
                value={settings.button_text}
                onChange={(e) => setSettings({ ...settings, button_text: e.target.value })}
                disabled={settings.is_locked}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500 disabled:opacity-50"
                placeholder="مثال: تحدث معنا 🌿"
              />
            )}
          </div>
        </div>
      )}

      {/* Messages Settings */}
      {activeGroup === 'messages' && (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 space-y-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-cyan-400" />
            الرسائل الترحيبية المخصصة
          </h3>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
            <p className="text-blue-300 text-sm">
              💡 يمكنك استخدام الوسوم الذكية: <code className="bg-blue-900/50 px-2 py-1 rounded">{'{{user_name}}'}</code> و <code className="bg-blue-900/50 px-2 py-1 rounded">{'{{page_name}}'}</code>
            </p>
          </div>

          {/* رسالة الزائر */}
          <div className="p-4 bg-gray-700/30 rounded-lg">
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              👤 رسالة الزائر
            </h4>
            <textarea
              value={settings.welcome_message_visitor}
              onChange={(e) => setSettings({ ...settings, welcome_message_visitor: e.target.value })}
              disabled={settings.is_locked}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500 min-h-[100px] disabled:opacity-50"
              placeholder="مرحباً! كيف نقدر نساعدك اليوم؟ 🌿"
            />
            <p className="text-gray-400 text-xs mt-2">للزوار غير المسجلين</p>
          </div>

          {/* رسالة المستثمر */}
          <div className="p-4 bg-gray-700/30 rounded-lg">
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              💼 رسالة المستثمر
            </h4>
            <textarea
              value={settings.welcome_message_investor}
              onChange={(e) => setSettings({ ...settings, welcome_message_investor: e.target.value })}
              disabled={settings.is_locked}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500 min-h-[100px] disabled:opacity-50"
              placeholder="أهلاً بك! تقدر تتابع حجوزاتك أو تستفسر عن أي مزرعة 💬"
            />
            <p className="text-gray-400 text-xs mt-2">للمستثمرين المسجلين</p>
          </div>

          {/* رسالة صاحب المزرعة */}
          <div className="p-4 bg-gray-700/30 rounded-lg">
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              🌴 رسالة صاحب المزرعة
            </h4>
            <textarea
              value={settings.welcome_message_owner}
              onChange={(e) => setSettings({ ...settings, welcome_message_owner: e.target.value })}
              disabled={settings.is_locked}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500 min-h-[100px] disabled:opacity-50"
              placeholder="مرحباً بك، يمكنك متابعة مزارعك أو التواصل مع الإدارة مباشرة 🌱"
            />
            <p className="text-gray-400 text-xs mt-2">لأصحاب المزارع</p>
          </div>

          {/* زر اختبار */}
          <button
            onClick={() => alert(`معاينة رسالة الزائر:\n\n${settings.welcome_message_visitor}`)}
            className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all flex items-center justify-center gap-2"
          >
            <Eye className="w-5 h-5" />
            🧠 اختبار الرسائل الترحيبية
          </button>
        </div>
      )}

      {/* Notifications Settings */}
      {activeGroup === 'notifications' && (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 space-y-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Bell className="w-6 h-6 text-cyan-400" />
            التنبيهات والتفاعل
          </h3>

          {/* تفعيل الإشعارات */}
          <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
            <div>
              <h4 className="text-white font-semibold mb-1">🔔 تفعيل الإشعارات</h4>
              <p className="text-gray-400 text-sm">إظهار إشعار للمستخدم عند وصول رد جديد</p>
            </div>
            <input
              type="checkbox"
              checked={settings.notification_enabled}
              onChange={(e) => setSettings({ ...settings, notification_enabled: e.target.checked })}
              disabled={settings.is_locked}
              className="w-6 h-6 rounded text-cyan-500 disabled:opacity-50"
            />
          </div>

          {/* نص الإشعار */}
          {settings.notification_enabled && (
            <div className="p-4 bg-gray-700/30 rounded-lg">
              <h4 className="text-white font-semibold mb-3">📝 نص الإشعار</h4>
              <input
                type="text"
                value={settings.notification_text}
                onChange={(e) => setSettings({ ...settings, notification_text: e.target.value })}
                disabled={settings.is_locked}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500 disabled:opacity-50"
              />
            </div>
          )}

          {/* تفعيل الصوت */}
          <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
            <div>
              <h4 className="text-white font-semibold mb-1 flex items-center gap-2">
                {settings.sound_enabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                🔉 تفعيل صوت الإشعار
              </h4>
              <p className="text-gray-400 text-sm">تشغيل صوت بسيط عند وصول رد جديد</p>
            </div>
            <input
              type="checkbox"
              checked={settings.sound_enabled}
              onChange={(e) => setSettings({ ...settings, sound_enabled: e.target.checked })}
              disabled={settings.is_locked}
              className="w-6 h-6 rounded text-cyan-500 disabled:opacity-50"
            />
          </div>

          {/* الإغلاق التلقائي */}
          <div className="p-4 bg-gray-700/30 rounded-lg">
            <h4 className="text-white font-semibold mb-3">🕐 إغلاق تلقائي بعد خمول (بالدقائق)</h4>
            <input
              type="number"
              min="1"
              max="60"
              value={settings.auto_close_minutes}
              onChange={(e) => setSettings({ ...settings, auto_close_minutes: parseInt(e.target.value) || 5 })}
              disabled={settings.is_locked}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500 disabled:opacity-50"
            />
            <p className="text-gray-400 text-xs mt-2">من 1 إلى 60 دقيقة</p>
          </div>

          {/* حفظ المحادثة */}
          <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
            <div>
              <h4 className="text-white font-semibold mb-1">💾 حفظ آخر محادثة</h4>
              <p className="text-gray-400 text-sm">استئناف المحادثة عند عودة المستخدم</p>
            </div>
            <input
              type="checkbox"
              checked={settings.save_conversation}
              onChange={(e) => setSettings({ ...settings, save_conversation: e.target.checked })}
              disabled={settings.is_locked}
              className="w-6 h-6 rounded text-cyan-500 disabled:opacity-50"
            />
          </div>

          {/* مؤشر الاتصال */}
          <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
            <div>
              <h4 className="text-white font-semibold mb-1">👀 مؤشر حالة الزر</h4>
              <p className="text-gray-400 text-sm">نقطة خضراء تُظهر الاتصال بالنظام</p>
            </div>
            <input
              type="checkbox"
              checked={settings.show_online_indicator}
              onChange={(e) => setSettings({ ...settings, show_online_indicator: e.target.checked })}
              disabled={settings.is_locked}
              className="w-6 h-6 rounded text-cyan-500 disabled:opacity-50"
            />
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-6 max-w-2xl w-full border border-cyan-500/30">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Eye className="w-6 h-6 text-cyan-400" />
              معاينة الزر الذكي
            </h3>

            <div className="bg-gray-900 rounded-xl p-8 min-h-[400px] relative">
              <div className="text-center text-gray-500 mb-8">
                هذه معاينة تقريبية للزر
              </div>

              {/* معاينة الزر */}
              <div
                className={`absolute ${
                  settings.position === 'bottom-right' ? 'bottom-8 left-8' :
                  settings.position === 'bottom-left' ? 'bottom-8 right-8' :
                  settings.position === 'bottom-center' ? 'bottom-8 left-1/2 transform -translate-x-1/2' :
                  'bottom-8 left-8'
                }`}
              >
                <button
                  style={{ backgroundColor: settings.primary_color }}
                  className={`p-4 text-white shadow-2xl transition-all ${
                    settings.icon_shape === 'circle' ? 'rounded-full' :
                    settings.icon_shape === 'square' ? 'rounded-lg' :
                    'rounded-2xl'
                  } ${settings.pulse_enabled ? 'animate-pulse' : ''} ${
                    settings.glow_intensity === 'light' ? 'shadow-lg' :
                    settings.glow_intensity === 'medium' ? 'shadow-xl shadow-cyan-500/50' :
                    settings.glow_intensity === 'strong' ? 'shadow-2xl shadow-cyan-500' :
                    ''
                  }`}
                >
                  <MessageCircle className="w-6 h-6" />
                  {settings.show_online_indicator && (
                    <div className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
                  )}
                </button>
                {settings.button_text_enabled && (
                  <div className="mt-2 text-center text-white text-sm">
                    {settings.button_text}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setShowPreview(false)}
              className="w-full mt-6 px-6 py-3 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-all"
            >
              إغلاق المعاينة
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
