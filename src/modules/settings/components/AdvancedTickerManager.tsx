import { useState, useEffect } from 'react';
import {
  BarChart3, Plus, Trash2, Edit2, Save, X, Power, Zap, Palette, Clock,
  TrendingUp, Check, MoveUp, MoveDown, Eye, EyeOff, Copy, RefreshCw,
  Sparkles, Settings, Layout, Wand2, PlayCircle, PauseCircle,
  Download, Upload, Monitor, Smartphone, Activity, Globe,
  ArrowUpDown, Filter, Search, Grid3x3, List, ChevronDown,
  AlertCircle, TrendingDown, DollarSign, Users, FileText,
  Calendar, Award, Target, Zap as Lightning
} from 'lucide-react';
import { tickerService, TickerSettings, TickerItem } from '../services/tickerService';
import {
  SettingToggle,
  SliderSetting,
  SelectSetting,
  ItemCard,
  ItemCardCompact,
  DesignSettingsTab,
  PreviewTestingTab,
  ItemFormModal,
  ItemEditModal
} from './TickerComponents';

export function AdvancedTickerManager() {
  const [settings, setSettings] = useState<TickerSettings | null>(null);
  const [items, setItems] = useState<TickerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<TickerItem | null>(null);
  const [showNewItemForm, setShowNewItemForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'items' | 'design' | 'preview'>('general');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [settingsData, itemsData] = await Promise.all([
      tickerService.getSettings(),
      tickerService.getItems()
    ]);
    setSettings(settingsData);
    setItems(itemsData);
    setLoading(false);
  };

  const handleUpdateSettings = async (updates: Partial<TickerSettings>) => {
    if (!settings) return;
    setSaving(true);
    const success = await tickerService.updateSettings(updates);
    if (success) {
      setSettings({ ...settings, ...updates });
      setTimeout(() => setSaving(false), 1500);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا العنصر؟')) return;
    const success = await tickerService.deleteItem(id);
    if (success) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const handleToggleItem = async (id: string, isActive: boolean) => {
    const success = await tickerService.toggleItemActive(id, isActive);
    if (success) {
      setItems(items.map(item =>
        item.id === id ? { ...item, is_active: isActive } : item
      ));
    }
  };

  const handleMoveItem = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === filteredItems.length - 1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const newItems = [...filteredItems];
    [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];

    const updates = newItems.map((item, idx) => ({
      id: item.id,
      sort_order: idx
    }));

    const success = await tickerService.reorderItems(updates);
    if (success) {
      loadData();
    }
  };

  const handleSaveItem = async (item: TickerItem) => {
    const success = await tickerService.updateItem(item.id, item);
    if (success) {
      setItems(items.map(i => i.id === item.id ? item : i));
      setEditingItem(null);
    }
  };

  const handleCreateItem = async (item: Omit<TickerItem, 'id' | 'created_at' | 'updated_at'>) => {
    const newItem = await tickerService.createItem(item);
    if (newItem) {
      setItems([...items, newItem]);
      setShowNewItemForm(false);
    }
  };

  const handleDuplicateItem = async (item: TickerItem) => {
    const { id, created_at, updated_at, ...itemData } = item;
    const newItem = await tickerService.createItem({
      ...itemData,
      label: `${item.label} (نسخة)`,
      sort_order: items.length
    });
    if (newItem) {
      setItems([...items, newItem]);
    }
  };

  const handleBulkActivate = async (activate: boolean) => {
    const updates = filteredItems.map(item =>
      tickerService.toggleItemActive(item.id, activate)
    );
    await Promise.all(updates);
    loadData();
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.label.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterStatus === 'all' ? true :
      filterStatus === 'active' ? item.is_active :
      !item.is_active;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mb-4"></div>
        <p className="text-gray-600 font-medium">جاري تحميل إعدادات الشريط المتحرك...</p>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <p className="text-gray-600 font-medium">لم يتم العثور على إعدادات الشريط</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Status */}
      <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 rounded-2xl p-8 text-white shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black mb-2 flex items-center gap-3">
              <Sparkles className="h-8 w-8" />
              مدير الشريط المتحرك المتقدم
            </h2>
            <p className="text-blue-100 text-lg">إدارة شاملة للشريط الإخباري مع معاينة حية</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl backdrop-blur-sm transition-all font-bold"
            >
              {showPreview ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              {showPreview ? 'إخفاء المعاينة' : 'معاينة حية'}
            </button>
            <div className="flex items-center gap-3 px-6 py-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Activity className={`h-5 w-5 ${settings.is_enabled ? 'animate-pulse' : ''}`} />
              <span className="font-bold">
                {settings.is_enabled ? 'نشط' : 'متوقف'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="text-3xl font-black mb-1">{items.length}</div>
            <div className="text-sm text-blue-100">إجمالي العناصر</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="text-3xl font-black mb-1">{items.filter(i => i.is_active).length}</div>
            <div className="text-sm text-blue-100">العناصر النشطة</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="text-3xl font-black mb-1">{settings.speed}s</div>
            <div className="text-sm text-blue-100">سرعة الحركة</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="text-3xl font-black mb-1">{settings.update_interval / 1000}s</div>
            <div className="text-sm text-blue-100">تحديث البيانات</div>
          </div>
        </div>
      </div>

      {/* Live Preview */}
      {showPreview && settings.is_enabled && (
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-4 shadow-2xl">
          <div className="flex items-center gap-2 mb-3">
            <Monitor className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-bold text-gray-400">معاينة حية للشريط</span>
          </div>
          <div
            className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl overflow-hidden"
            style={{ height: `${settings.height}px` }}
          >
            <div className="flex items-center h-full px-6 gap-8 animate-scroll">
              {items.filter(i => i.is_active).map((item, index) => (
                <div key={index} className="flex items-center gap-3 whitespace-nowrap">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${item.color}20`, color: item.color }}
                  >
                    <BarChart3 className="h-4 w-4" />
                  </div>
                  <span className="font-bold text-gray-800">{item.label}</span>
                  <span className="text-2xl font-black text-gray-900">
                    {item.custom_value.toLocaleString('ar-SA')}
                  </span>
                  {item.show_percentage && (
                    <span
                      className="px-2 py-1 rounded-full text-xs font-bold"
                      style={{
                        backgroundColor: item.percentage_value.startsWith('+') ? '#10b98120' : '#ef444420',
                        color: item.percentage_value.startsWith('+') ? '#10b981' : '#ef4444'
                      }}
                    >
                      {item.percentage_value}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
        {[
          { id: 'general', label: 'الإعدادات العامة', icon: Settings },
          { id: 'items', label: 'إدارة العناصر', icon: Grid3x3 },
          { id: 'design', label: 'التصميم والألوان', icon: Palette },
          { id: 'preview', label: 'المعاينة والاختبار', icon: Monitor }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-lg'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="h-5 w-5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* General Settings Tab */}
      {activeTab === 'general' && (
        <GeneralSettingsTab
          settings={settings}
          onUpdate={handleUpdateSettings}
        />
      )}

      {/* Items Management Tab */}
      {activeTab === 'items' && (
        <ItemsManagementTab
          items={filteredItems}
          searchQuery={searchQuery}
          filterStatus={filterStatus}
          viewMode={viewMode}
          onSearchChange={setSearchQuery}
          onFilterChange={setFilterStatus}
          onViewModeChange={setViewMode}
          onAddNew={() => setShowNewItemForm(true)}
          onEdit={setEditingItem}
          onDelete={handleDeleteItem}
          onToggle={handleToggleItem}
          onDuplicate={handleDuplicateItem}
          onMove={handleMoveItem}
          onBulkActivate={handleBulkActivate}
        />
      )}

      {/* Design Tab */}
      {activeTab === 'design' && (
        <DesignSettingsTab
          settings={settings}
          onUpdate={handleUpdateSettings}
        />
      )}

      {/* Preview Tab */}
      {activeTab === 'preview' && (
        <PreviewTestingTab
          settings={settings}
          items={items.filter(i => i.is_active)}
        />
      )}

      {/* Modals */}
      {showNewItemForm && (
        <ItemFormModal
          onSave={handleCreateItem}
          onCancel={() => setShowNewItemForm(false)}
        />
      )}

      {editingItem && (
        <ItemEditModal
          item={editingItem}
          onSave={handleSaveItem}
          onCancel={() => setEditingItem(null)}
        />
      )}

      {/* Success Toast */}
      {saving && (
        <div className="fixed bottom-8 right-8 bg-green-500 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
          <Check className="h-6 w-6" />
          <span className="font-bold text-lg">تم الحفظ بنجاح!</span>
        </div>
      )}
    </div>
  );
}

// ========================================
// General Settings Tab
// ========================================

function GeneralSettingsTab({
  settings,
  onUpdate
}: {
  settings: TickerSettings;
  onUpdate: (updates: Partial<TickerSettings>) => void;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* System Controls */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100">
        <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
          <Power className="h-6 w-6 text-blue-600" />
          التحكم في النظام
        </h3>

        <div className="space-y-4">
          <SettingToggle
            icon={<Power className="h-5 w-5" />}
            label="تفعيل الشريط المتحرك"
            description="إظهار الشريط في المنصة العامة"
            checked={settings.is_enabled}
            onChange={(checked) => onUpdate({ is_enabled: checked })}
            color="green"
          />

          <SettingToggle
            icon={<Zap className="h-5 w-5" />}
            label="البيانات التجريبية"
            description="عرض أرقام متحركة تجريبية"
            checked={settings.show_demo_data}
            onChange={(checked) => onUpdate({ show_demo_data: checked })}
            color="blue"
          />
        </div>
      </div>

      {/* Performance Settings */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100">
        <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
          <Activity className="h-6 w-6 text-purple-600" />
          الأداء والسرعة
        </h3>

        <div className="space-y-6">
          <SliderSetting
            icon={<TrendingUp className="h-5 w-5 text-orange-600" />}
            label="سرعة الحركة"
            description="مدة دورة كاملة للشريط"
            value={settings.speed}
            min={10}
            max={60}
            unit="ثانية"
            onChange={(value) => onUpdate({ speed: value })}
          />

          <SelectSetting
            icon={<Clock className="h-5 w-5 text-blue-600" />}
            label="تحديث البيانات"
            description="معدل تحديث الأرقام التلقائي"
            value={settings.update_interval}
            onChange={(value) => onUpdate({ update_interval: parseInt(value) })}
            options={[
              { value: 5000, label: '5 ثواني' },
              { value: 10000, label: '10 ثواني' },
              { value: 15000, label: '15 ثانية' },
              { value: 30000, label: '30 ثانية' },
              { value: 60000, label: 'دقيقة واحدة' }
            ]}
          />
        </div>
      </div>

      {/* Animation Style */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100">
        <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
          <Wand2 className="h-6 w-6 text-pink-600" />
          نمط الحركة
        </h3>

        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'scroll', label: 'انزلاق', icon: ArrowUpDown },
            { value: 'fade', label: 'تلاشي', icon: Sparkles },
            { value: 'slide', label: 'انسيابي', icon: TrendingUp }
          ].map(style => {
            const Icon = style.icon;
            return (
              <button
                key={style.value}
                onClick={() => onUpdate({ animation_style: style.value as any })}
                className={`p-4 rounded-xl border-2 transition-all ${
                  settings.animation_style === style.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Icon className={`h-8 w-8 mx-auto mb-2 ${
                  settings.animation_style === style.value ? 'text-blue-600' : 'text-gray-400'
                }`} />
                <div className="text-sm font-bold text-center">{style.label}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Size Settings */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100">
        <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
          <Layout className="h-6 w-6 text-green-600" />
          الأبعاد والحجم
        </h3>

        <SliderSetting
          icon={<Monitor className="h-5 w-5 text-green-600" />}
          label="ارتفاع الشريط"
          description="الارتفاع بالبكسل"
          value={settings.height}
          min={40}
          max={100}
          unit="px"
          onChange={(value) => onUpdate({ height: value })}
        />
      </div>
    </div>
  );
}

// ========================================
// Items Management Tab
// ========================================

function ItemsManagementTab({
  items,
  searchQuery,
  filterStatus,
  viewMode,
  onSearchChange,
  onFilterChange,
  onViewModeChange,
  onAddNew,
  onEdit,
  onDelete,
  onToggle,
  onDuplicate,
  onMove,
  onBulkActivate
}: any) {
  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Search */}
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="البحث عن عنصر..."
                className="w-full pr-12 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Filter */}
          <select
            value={filterStatus}
            onChange={(e) => onFilterChange(e.target.value)}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">جميع العناصر</option>
            <option value="active">النشطة فقط</option>
            <option value="inactive">المعطلة فقط</option>
          </select>

          {/* View Mode */}
          <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow' : ''}`}
            >
              <List className="h-5 w-5" />
            </button>
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow' : ''}`}
            >
              <Grid3x3 className="h-5 w-5" />
            </button>
          </div>

          {/* Bulk Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => onBulkActivate(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 font-medium"
            >
              <PlayCircle className="h-4 w-4" />
              تفعيل الكل
            </button>
            <button
              onClick={() => onBulkActivate(false)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 font-medium"
            >
              <PauseCircle className="h-4 w-4" />
              إيقاف الكل
            </button>
          </div>

          {/* Add New */}
          <button
            onClick={onAddNew}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all font-bold"
          >
            <Plus className="h-5 w-5" />
            إضافة عنصر جديد
          </button>
        </div>
      </div>

      {/* Items List/Grid */}
      {items.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium text-lg mb-4">لا توجد عناصر</p>
          <button
            onClick={onAddNew}
            className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 font-bold"
          >
            إضافة العنصر الأول
          </button>
        </div>
      ) : viewMode === 'list' ? (
        <div className="space-y-3">
          {items.map((item: TickerItem, index: number) => (
            <ItemCard
              key={item.id}
              item={item}
              index={index}
              totalItems={items.length}
              onEdit={() => onEdit(item)}
              onDelete={() => onDelete(item.id)}
              onToggle={() => onToggle(item.id, !item.is_active)}
              onDuplicate={() => onDuplicate(item)}
              onMoveUp={() => onMove(index, 'up')}
              onMoveDown={() => onMove(index, 'down')}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item: TickerItem) => (
            <ItemCardCompact
              key={item.id}
              item={item}
              onEdit={() => onEdit(item)}
              onDelete={() => onDelete(item.id)}
              onToggle={() => onToggle(item.id, !item.is_active)}
              onDuplicate={() => onDuplicate(item)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
