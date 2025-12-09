import React, { useEffect, useState } from 'react';
import { Activity, CheckCircle, XCircle, Zap, Clock, Eye, Palette, Plus, Trash2, BarChart3, Settings as SettingsIcon, PlayCircle, PauseCircle } from 'lucide-react';
import { liveActivityTickerService, TickerSettings } from '../../../services/liveActivityTickerService';

export const LiveActivityTickerSettings: React.FC = () => {
  const [settings, setSettings] = useState<TickerSettings | null>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualActivity, setManualActivity] = useState({
    type: 'stats',
    titleAr: '',
    titleEn: '',
    icon: '⭐',
    priority: 5
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [settingsData, activitiesData] = await Promise.all([
        liveActivityTickerService.getSettings(),
        liveActivityTickerService.getActivities()
      ]);
      setSettings(settingsData);
      setActivities(activitiesData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading ticker settings:', error);
      setLoading(false);
    }
  };

  const handleUpdateSettings = async (updates: Partial<TickerSettings>) => {
    setSaving(true);
    try {
      await liveActivityTickerService.updateSettings(updates);
      setSettings({ ...settings!, ...updates });
      setTimeout(() => setSaving(false), 500);
    } catch (error) {
      console.error('Error updating settings:', error);
      setSaving(false);
    }
  };

  const handleCreateManualActivity = async () => {
    console.log('🔘 Add button clicked!');
    console.log('📝 Manual activity data:', manualActivity);

    if (!manualActivity.titleAr.trim()) {
      console.warn('⚠️ Empty title, aborting');
      alert('يرجى إدخال النص بالعربية');
      return;
    }

    try {
      console.log('⏳ Creating activity...');

      await liveActivityTickerService.createManualActivity(
        manualActivity.type,
        manualActivity.titleAr,
        manualActivity.titleEn || manualActivity.titleAr,
        manualActivity.icon,
        manualActivity.priority
      );

      console.log('✅ Activity created, resetting form...');

      setManualActivity({
        type: 'stats',
        titleAr: '',
        titleEn: '',
        icon: '⭐',
        priority: 5
      });
      setShowManualForm(false);

      console.log('🔄 Reloading data...');
      await loadData();

      console.log('🎉 All done!');
      alert('تم إضافة النشاط بنجاح!');
    } catch (error) {
      console.error('❌ Error creating activity:', error);
      alert('حدث خطأ عند إضافة النشاط: ' + (error as any).message);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('هل أنت متأكد من حذف جميع الأنشطة؟')) return;

    try {
      await liveActivityTickerService.clearAllActivities();
      await loadData();
    } catch (error) {
      console.error('Error clearing activities:', error);
    }
  };

  if (loading || !settings) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <Activity style={{ width: '28px', height: '28px', color: '#1e8449' }} />
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#1a4d2e', margin: 0 }}>
            إعدادات شريط النشاط المباشر
          </h2>
        </div>
        <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
          تحكم بشريط الأنشطة المتحركة في أعلى المنصة
        </p>
      </div>

      {saving && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#10b981',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle style={{ width: '20px', height: '20px' }} />
          تم الحفظ بنجاح
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '16px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <SettingsIcon style={{ width: '20px', height: '20px', color: '#1e8449' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1a4d2e', margin: 0 }}>
              وضع التشغيل
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {['simulation', 'real', 'hybrid'].map((mode) => (
              <button
                key={mode}
                onClick={() => handleUpdateSettings({ mode: mode as any })}
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  border: `2px solid ${settings.mode === mode ? '#1e8449' : '#e5e7eb'}`,
                  background: settings.mode === mode ? '#f0fdf4' : 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textAlign: 'right'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {settings.mode === mode ? (
                    <CheckCircle style={{ width: '20px', height: '20px', color: '#1e8449' }} />
                  ) : (
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid #d1d5db' }} />
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '16px', fontWeight: 600, color: '#1a4d2e', marginBottom: '4px' }}>
                      {mode === 'simulation' && 'وضع وهمي'}
                      {mode === 'real' && 'وضع حقيقي'}
                      {mode === 'hybrid' && 'وضع هجين (مزدوج)'}
                    </div>
                    <div style={{ fontSize: '13px', color: '#6b7280' }}>
                      {mode === 'simulation' && 'عرض أنشطة مبرمجة فقط'}
                      {mode === 'real' && 'عرض أنشطة حقيقية فقط'}
                      {mode === 'hybrid' && 'مزيج من الحقيقي والوهمي'}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '16px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <Zap style={{ width: '20px', height: '20px', color: '#1e8449' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1a4d2e', margin: 0 }}>
              سرعة التمرير
            </h3>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            {['slow', 'medium', 'fast'].map((speed) => (
              <button
                key={speed}
                onClick={() => handleUpdateSettings({ scroll_speed: speed as any })}
                style={{
                  flex: 1,
                  padding: '14px',
                  borderRadius: '12px',
                  border: `2px solid ${settings.scroll_speed === speed ? '#1e8449' : '#e5e7eb'}`,
                  background: settings.scroll_speed === speed ? '#f0fdf4' : 'white',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: 600,
                  color: settings.scroll_speed === speed ? '#1e8449' : '#6b7280',
                  transition: 'all 0.2s'
                }}
              >
                {speed === 'slow' && 'بطيء'}
                {speed === 'medium' && 'متوسط'}
                {speed === 'fast' && 'سريع'}
              </button>
            ))}
          </div>

          <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e5e7eb' }}>
            <label style={{ fontSize: '14px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '8px' }}>
              عدد العناصر في الدورة
            </label>
            <input
              type="range"
              min="5"
              max="30"
              value={settings.items_per_cycle}
              onChange={(e) => handleUpdateSettings({ items_per_cycle: parseInt(e.target.value) })}
              style={{ width: '100%' }}
            />
            <div style={{ textAlign: 'center', fontSize: '18px', fontWeight: 700, color: '#1e8449', marginTop: '8px' }}>
              {settings.items_per_cycle} عنصر
            </div>
          </div>

          <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e5e7eb' }}>
            <label style={{ fontSize: '14px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '8px' }}>
              فترة التحديث (ثواني)
            </label>
            <input
              type="range"
              min="5"
              max="60"
              value={settings.simulation_interval_seconds}
              onChange={(e) => handleUpdateSettings({ simulation_interval_seconds: parseInt(e.target.value) })}
              style={{ width: '100%' }}
            />
            <div style={{ textAlign: 'center', fontSize: '18px', fontWeight: 700, color: '#1e8449', marginTop: '8px' }}>
              {settings.simulation_interval_seconds} ثانية
            </div>
          </div>
        </div>
      </div>

      <div style={{
        background: 'white',
        padding: '24px',
        borderRadius: '16px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        border: '1px solid #e5e7eb',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <Palette style={{ width: '20px', height: '20px', color: '#1e8449' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1a4d2e', margin: 0 }}>
            الألوان والمظهر
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '14px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '8px' }}>
              لون الخلفية
            </label>
            <input
              type="color"
              value={settings.background_color}
              onChange={(e) => handleUpdateSettings({ background_color: e.target.value })}
              style={{ width: '100%', height: '48px', borderRadius: '8px', border: '2px solid #e5e7eb', cursor: 'pointer' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '14px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '8px' }}>
              لون النص
            </label>
            <input
              type="color"
              value={settings.text_color}
              onChange={(e) => handleUpdateSettings({ text_color: e.target.value })}
              style={{ width: '100%', height: '48px', borderRadius: '8px', border: '2px solid #e5e7eb', cursor: 'pointer' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '14px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '8px' }}>
              لون الأيقونة
            </label>
            <input
              type="color"
              value={settings.icon_color}
              onChange={(e) => handleUpdateSettings({ icon_color: e.target.value })}
              style={{ width: '100%', height: '48px', borderRadius: '8px', border: '2px solid #e5e7eb', cursor: 'pointer' }}
            />
          </div>
        </div>

        <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e5e7eb' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={settings.show_timestamps}
              onChange={(e) => handleUpdateSettings({ show_timestamps: e.target.checked })}
              style={{ width: '20px', height: '20px', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '15px', fontWeight: 600, color: '#374151' }}>
              إظهار الأوقات مع الأنشطة
            </span>
          </label>
        </div>
      </div>

      <div style={{
        background: 'white',
        padding: '24px',
        borderRadius: '16px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <BarChart3 style={{ width: '20px', height: '20px', color: '#1e8449' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1a4d2e', margin: 0 }}>
              إدارة الأنشطة الحالية
            </h3>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setShowManualForm(!showManualForm)}
              style={{
                padding: '10px 20px',
                background: '#1e8449',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Plus style={{ width: '18px', height: '18px' }} />
              إضافة نشاط يدوي
            </button>
            <button
              onClick={handleClearAll}
              style={{
                padding: '10px 20px',
                background: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Trash2 style={{ width: '18px', height: '18px' }} />
              حذف الكل
            </button>
          </div>
        </div>

        {showManualForm && (
          <div style={{
            background: '#f9fafb',
            padding: '20px',
            borderRadius: '12px',
            marginBottom: '20px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ fontSize: '14px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '8px' }}>
                  النص بالعربية
                </label>
                <input
                  type="text"
                  value={manualActivity.titleAr}
                  onChange={(e) => setManualActivity({ ...manualActivity, titleAr: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    fontSize: '14px'
                  }}
                  placeholder="مثال: تم حجز 3 أشجار"
                />
              </div>
              <div>
                <label style={{ fontSize: '14px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '8px' }}>
                  الأيقونة
                </label>
                <input
                  type="text"
                  value={manualActivity.icon}
                  onChange={(e) => setManualActivity({ ...manualActivity, icon: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    fontSize: '14px'
                  }}
                  placeholder="⭐"
                />
              </div>
            </div>
            <button
              onClick={handleCreateManualActivity}
              style={{
                padding: '12px 24px',
                background: '#1e8449',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600,
                width: '100%'
              }}
            >
              إضافة
            </button>
          </div>
        )}

        <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '12px' }}>
          عدد الأنشطة الحالية: <strong>{activities.length}</strong>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '400px', overflowY: 'auto' }}>
          {activities.map((activity) => (
            <div
              key={activity.id}
              style={{
                padding: '12px 16px',
                background: '#f9fafb',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <span style={{ fontSize: '20px' }}>{activity.icon}</span>
              <span style={{ flex: 1, fontSize: '14px', fontWeight: 500, color: '#374151' }}>
                {activity.title}
              </span>
              <span style={{
                fontSize: '12px',
                padding: '4px 12px',
                background: '#dbeafe',
                color: '#1e40af',
                borderRadius: '6px',
                fontWeight: 600
              }}>
                {activity.priority}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
