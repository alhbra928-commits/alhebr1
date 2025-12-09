import React, { useState } from 'react';
import { Settings, Map, Video, Mail, Key, Globe, Bell, Shield, Database, BarChart3, Package, Activity, Type, PanelLeftClose, Loader2 } from 'lucide-react';
import { Card3D } from '../../../components/ui/Card3D';
import { BackButton } from '../../../components/common/BackButton';
import { BackupCenter } from '../../backups/components/BackupCenter';
import { VersionHistoryPanel } from './VersionHistoryPanel';
import { AdvancedCacheSystemDiagnostics } from './AdvancedCacheSystemDiagnostics';
import { CompletePlatformTextsManager } from './CompletePlatformTextsManager';
import { SideDockSettings } from './SideDockSettings';
import { InnovativeLoaderSettings } from './InnovativeLoaderSettings';

interface SettingsViewProps {
  onBack?: () => void;
}

export function SettingsView({ onBack }: SettingsViewProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'backup' | 'versions' | 'diagnostics' | 'texts' | 'side-dock' | 'loader'>('general');
  const [settings, setSettings] = useState({
    mapApiKey: 'AIza*********************',
    videoService: 'youtube',
    companyEmail: 'info@palmolive.com',
    companyPhone: '+966 50 123 4567',
    enableNotifications: true,
    enableMarketing: true,
    maintenanceMode: false,
  });

  return (
    <div className="min-h-screen bg-[#F9F8F6] p-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {onBack && (
          <div className="mb-6">
            <BackButton onBack={onBack} />
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-4xl font-black text-[#3D5B4B] mb-2">
            إعدادات النظام
          </h1>
          <p className="text-[#2C2C2C]/70">إدارة وتخصيص إعدادات المنصة</p>
        </div>

        <div className="mb-8 flex gap-4 flex-wrap">
          <button
            onClick={() => setActiveTab('general')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'general'
                ? 'bg-gradient-to-r from-[#3D5B4B] to-[#4A6F5C] text-white shadow-lg'
                : 'bg-white text-[#2C2C2C] hover:bg-[#F4EBDD]'
            }`}
          >
            <Settings className="h-5 w-5" />
            الإعدادات العامة
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'backup'
                ? 'bg-gradient-to-r from-[#C89B3C] to-[#D4AF37] text-white shadow-lg'
                : 'bg-white text-[#2C2C2C] hover:bg-[#F4EBDD]'
            }`}
          >
            <Database className="h-5 w-5" />
            مركز النسخ الاحتياطي
          </button>
          <button
            onClick={() => setActiveTab('versions')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'versions'
                ? 'bg-gradient-to-r from-[#10B981] to-[#059669] text-white shadow-lg'
                : 'bg-white text-[#2C2C2C] hover:bg-[#F4EBDD]'
            }`}
          >
            <Package className="h-5 w-5" />
            سجل الإصدارات
          </button>
          <button
            onClick={() => setActiveTab('diagnostics')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'diagnostics'
                ? 'bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-white shadow-lg'
                : 'bg-white text-[#2C2C2C] hover:bg-[#F4EBDD]'
            }`}
          >
            <Activity className="h-5 w-5" />
            تشخيص الكاش
          </button>
          <button
            onClick={() => setActiveTab('texts')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'texts'
                ? 'bg-gradient-to-r from-[#8B7355] to-[#A0916A] text-white shadow-lg'
                : 'bg-white text-[#2C2C2C] hover:bg-[#F4EBDD]'
            }`}
          >
            <Type className="h-5 w-5" />
            إدارة النصوص
          </button>
          <button
            onClick={() => setActiveTab('side-dock')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'side-dock'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
                : 'bg-white text-[#2C2C2C] hover:bg-[#F4EBDD]'
            }`}
          >
            <PanelLeftClose className="h-5 w-5" />
            الشريط الجانبي
          </button>
          <button
            onClick={() => setActiveTab('loader')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'loader'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                : 'bg-white text-[#2C2C2C] hover:bg-[#F4EBDD]'
            }`}
          >
            <Loader2 className="h-5 w-5" />
            شاشة التحميل المبتكرة
          </button>
        </div>

        {activeTab === 'backup' ? (
          <BackupCenter />
        ) : activeTab === 'versions' ? (
          <VersionHistoryPanel />
        ) : activeTab === 'diagnostics' ? (
          <AdvancedCacheSystemDiagnostics />
        ) : activeTab === 'texts' ? (
          <CompletePlatformTextsManager />
        ) : activeTab === 'side-dock' ? (
          <SideDockSettings />
        ) : activeTab === 'loader' ? (
          <InnovativeLoaderSettings />
        ) : (

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card3D interactive={false}>
            <div className="p-6 bg-white">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Map className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">إعدادات الخرائط</h3>
                  <p className="text-sm text-gray-600">تكوين خدمات الخرائط</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    مفتاح Google Maps API
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="password"
                      value={settings.mapApiKey}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      readOnly
                    />
                    <button className="p-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100">
                      <Key className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    حفظ التغييرات
                  </button>
                </div>
              </div>
            </div>
          </Card3D>

          <Card3D interactive={false}>
            <div className="p-6 bg-white">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <Video className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">إعدادات الفيديو</h3>
                  <p className="text-sm text-gray-600">خدمات بث الفيديو</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    منصة البث
                  </label>
                  <select
                    value={settings.videoService}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="youtube">YouTube</option>
                    <option value="vimeo">Vimeo</option>
                    <option value="custom">خدمة مخصصة</option>
                  </select>
                </div>

                <div className="pt-4 border-t">
                  <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    حفظ التغييرات
                  </button>
                </div>
              </div>
            </div>
          </Card3D>

          <Card3D interactive={false}>
            <div className="p-6 bg-white">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">بيانات التواصل</h3>
                  <p className="text-sm text-gray-600">معلومات الشركة الرسمية</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    value={settings.companyEmail}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رقم الهاتف
                  </label>
                  <input
                    type="tel"
                    value={settings.companyPhone}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="pt-4 border-t">
                  <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    حفظ التغييرات
                  </button>
                </div>
              </div>
            </div>
          </Card3D>

          <Card3D interactive={false}>
            <div className="p-6 bg-white">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <Settings className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">إعدادات الميزات</h3>
                  <p className="text-sm text-gray-600">تفعيل أو إيقاف الميزات</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">الإشعارات</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.enableNotifications}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">التسويق</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.enableMarketing}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">وضع الصيانة</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.maintenanceMode}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                  </label>
                </div>
              </div>
            </div>
          </Card3D>
        </div>
        )}
      </div>
    </div>
  );
}
