import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare, Plus, Search, Brain, Edit2, Trash2, Eye, EyeOff,
  TrendingUp, BarChart3, Zap, CheckCircle2, XCircle, Clock, Users,
  Star, Filter, Download, RefreshCw, Sparkles, Target, Award, Upload,
  Copy, MoreVertical, Power, PowerOff, Trash
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { SmartErrorModal } from '../../../components/common/SmartErrorModal';

interface AutoResponse {
  id: string;
  keyword: string;
  response_ar: string;
  response_en: string | null;
  intent: string;
  priority: number;
  usage_count: number;
  ai_generated: boolean;
  status: string;
  created_by: string;
  last_used_at: string | null;
  effectiveness_score: number;
  created_at: string;
  is_default_fallback?: boolean;
  fallback_enabled?: boolean;
}

interface ResponseStats {
  total_responses: number;
  active_responses: number;
  total_usage: number;
  most_used_keyword: string;
  most_common_intent: string;
  avg_effectiveness: number;
}

export const SmartAutoResponsesManager: React.FC = () => {
  const [responses, setResponses] = useState<AutoResponse[]>([]);
  const [filteredResponses, setFilteredResponses] = useState<AutoResponse[]>([]);
  const [stats, setStats] = useState<ResponseStats | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'greeting' | 'question' | 'financial' | 'technical'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showStatsView, setShowStatsView] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState<AutoResponse | null>(null);
  const [showBulkMenu, setShowBulkMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // بيانات النموذج
  const [formData, setFormData] = useState({
    keyword: '',
    response_ar: '',
    response_en: '',
    intent: 'question',
    priority: 3
  });

  // محرك الذكاء - لتوليد الردود
  const [aiInput, setAiInput] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<any>(null);

  useEffect(() => {
    loadResponses();
    loadStats();
  }, []);

  useEffect(() => {
    filterResponses();
  }, [responses, searchQuery, activeTab]);

  const loadResponses = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('whatsapp_auto_responses')
        .select('*')
        .is('deleted_at', null)
        .order('priority', { ascending: false })
        .order('usage_count', { ascending: false });

      if (fetchError) throw fetchError;
      setResponses(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const { data, error: statsError } = await supabase
        .from('whatsapp_auto_responses')
        .select('intent, usage_count, effectiveness_score, status')
        .is('deleted_at', null);

      if (statsError) throw statsError;

      if (data) {
        const totalResponses = data.length;
        const activeResponses = data.filter(r => r.status === 'active').length;
        const totalUsage = data.reduce((sum, r) => sum + r.usage_count, 0);

        // أكثر نية تكراراً
        const intentCount: any = {};
        data.forEach(r => {
          intentCount[r.intent] = (intentCount[r.intent] || 0) + 1;
        });
        const mostCommonIntent = Object.keys(intentCount).reduce((a, b) =>
          intentCount[a] > intentCount[b] ? a : b, 'question'
        );

        // متوسط الفاعلية
        const avgEffectiveness = data.reduce((sum, r) => sum + (r.effectiveness_score || 0), 0) / totalResponses;

        setStats({
          total_responses: totalResponses,
          active_responses: activeResponses,
          total_usage: totalUsage,
          most_used_keyword: 'حجز',
          most_common_intent: mostCommonIntent,
          avg_effectiveness: avgEffectiveness
        });
      }
    } catch (err) {
      console.error('Stats error:', err);
    }
  };

  const filterResponses = () => {
    let filtered = [...responses];

    // تصفية حسب التبويب
    if (activeTab !== 'all') {
      filtered = filtered.filter(r => r.intent === activeTab);
    }

    // تصفية حسب البحث
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r =>
        r.keyword.toLowerCase().includes(query) ||
        r.response_ar.toLowerCase().includes(query)
      );
    }

    setFilteredResponses(filtered);
  };

  const handleAddResponse = async () => {
    try {
      const adminSession = JSON.parse(localStorage.getItem('admin_session') || '{}');
      const currentUser = adminSession.admin?.phone || 'system';

      console.log('Adding response, user:', currentUser);

      const { error: insertError } = await supabase
        .from('whatsapp_auto_responses')
        .insert([{
          ...formData,
          created_by: currentUser,
          status: 'active'
        }]);

      if (insertError) {
        console.error('Insert error:', insertError);
        throw insertError;
      }

      await loadResponses();
      await loadStats();
      setShowAddModal(false);
      resetForm();
      alert('✅ تم إضافة الرد بنجاح!');
    } catch (err: any) {
      console.error('Add response error:', err);
      setError(err.message);
      alert(`❌ خطأ: ${err.message}`);
    }
  };

  const handleUpdateResponse = async (id: string, updates: any) => {
    try {
      console.log('Updating response:', id, updates);

      const { error: updateError } = await supabase
        .from('whatsapp_auto_responses')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (updateError) {
        console.error('Update error:', updateError);
        throw updateError;
      }

      await loadResponses();
      await loadStats();

      // Close modal if edit mode
      if (selectedResponse) {
        setShowAddModal(false);
        setSelectedResponse(null);
        resetForm();
      }

      alert('✅ تم تحديث الرد بنجاح!');
    } catch (err: any) {
      console.error('Update response error:', err);
      setError(err.message);
      alert(`❌ خطأ: ${err.message}`);
    }
  };

  const handleDeleteResponse = async (id: string) => {
    console.log('🗑️ Delete button clicked for ID:', id);

    if (!confirm('هل أنت متأكد من حذف هذا الرد؟')) {
      console.log('❌ Delete cancelled by user');
      return;
    }

    try {
      const adminSession = JSON.parse(localStorage.getItem('admin_session') || '{}');
      const currentUser = adminSession.admin?.phone || 'system';

      console.log('🔄 Starting delete process...');
      console.log('User:', currentUser);
      console.log('Response ID:', id);

      const { data, error: deleteError } = await supabase
        .from('whatsapp_auto_responses')
        .update({
          deleted_at: new Date().toISOString(),
          deleted_by: currentUser
        })
        .eq('id', id)
        .select();

      console.log('📊 Delete result:', { data, error: deleteError });

      if (deleteError) {
        console.error('❌ Delete error:', deleteError);
        throw deleteError;
      }

      console.log('✅ Delete successful, reloading...');
      await loadResponses();
      await loadStats();

      alert('✅ تم حذف الرد بنجاح!');
    } catch (err: any) {
      console.error('❌ Delete response error:', err);
      setError(err.message);
      alert(`❌ خطأ: ${err.message}`);
    }
  };

  const handleToggleStatus = async (response: AutoResponse) => {
    const newStatus = response.status === 'active' ? 'inactive' : 'active';
    await handleUpdateResponse(response.id, { status: newStatus });
  };

  // تعيين رد كافتراضي
  const handleSetAsDefaultFallback = async (responseId: string) => {
    try {
      const { data, error } = await supabase.rpc('set_as_default_fallback', {
        p_response_id: responseId,
        p_enabled: true
      });

      if (error) throw error;

      setError(null);
      await loadResponses();
      alert('تم تعيين الرد كرد افتراضي بنجاح!');
    } catch (err: any) {
      console.error('Error setting default fallback:', err);
      setError(err.message || 'فشل تعيين الرد الافتراضي');
    }
  };

  // تفعيل/تعطيل الرد الافتراضي
  const handleToggleFallback = async (responseId: string) => {
    try {
      const { data, error } = await supabase.rpc('toggle_fallback_status', {
        p_response_id: responseId
      });

      if (error) throw error;

      setError(null);
      await loadResponses();

      if (data && data.enabled !== undefined) {
        alert(data.enabled ? 'تم تفعيل الرد الافتراضي' : 'تم تعطيل الرد الافتراضي');
      }
    } catch (err: any) {
      console.error('Error toggling fallback:', err);
      setError(err.message || 'فشل تغيير حالة الرد الافتراضي');
    }
  };

  // محرك الذكاء الاصطناعي
  const handleAIGenerate = () => {
    if (!aiInput.trim()) return;

    setAiGenerating(true);

    // محاكاة الذكاء الاصطناعي (يمكن ربطه بـ API حقيقي لاحقاً)
    setTimeout(() => {
      const keywords = aiInput.split(' ');
      const mainKeyword = keywords[0];

      let intent = 'question';
      let suggestedResponse = '';

      // تحليل بسيط للنية
      if (aiInput.includes('حجز') || aiInput.includes('شراء')) {
        intent = 'request';
        suggestedResponse = `للحجز، يرجى اختيار المزرعة المناسبة وتحديد عدد الأشجار. ستحصل على شهادة ملكية فوراً بعد الدفع 📜✨`;
      } else if (aiInput.includes('تحويل') || aiInput.includes('دفع') || aiInput.includes('سعر')) {
        intent = 'financial';
        suggestedResponse = `التحويل المالي يتم خلال 24 ساعة عمل. ستصلك رسالة تأكيد فور اكتمال العملية 💰`;
      } else if (aiInput.includes('مشكلة') || aiInput.includes('خطأ')) {
        intent = 'technical';
        suggestedResponse = `نعتذر عن أي إزعاج. فريق الدعم الفني جاهز لمساعدتك. يرجى وصف المشكلة بالتفصيل 🔧`;
      } else if (aiInput.includes('شكر') || aiInput.includes('تسلم')) {
        intent = 'thanks';
        suggestedResponse = `العفو! سعداء بخدمتك دائماً 🌟`;
      } else {
        suggestedResponse = `شكراً لتواصلك معنا! سيتم الرد على استفسارك في أقرب وقت ممكن ✉️`;
      }

      setAiSuggestion({
        keyword: mainKeyword,
        response_ar: suggestedResponse,
        intent: intent,
        priority: 4,
        confidence: 0.85
      });

      setAiGenerating(false);
    }, 1500);
  };

  const handleUseAISuggestion = () => {
    if (aiSuggestion) {
      setFormData({
        keyword: aiSuggestion.keyword,
        response_ar: aiSuggestion.response_ar,
        response_en: '',
        intent: aiSuggestion.intent,
        priority: aiSuggestion.priority
      });
      setShowAIModal(false);
      setShowAddModal(true);
      setAiSuggestion(null);
      setAiInput('');
    }
  };

  const resetForm = () => {
    setFormData({
      keyword: '',
      response_ar: '',
      response_en: '',
      intent: 'question',
      priority: 3
    });
  };

  // 🔄 تكرار رد موجود
  const handleDuplicateResponse = async (response: AutoResponse) => {
    try {
      const adminSession = JSON.parse(localStorage.getItem('admin_session') || '{}');
      const currentUser = adminSession.admin?.phone || 'system';

      console.log('Duplicating response:', response.keyword);

      const { error: insertError } = await supabase
        .from('whatsapp_auto_responses')
        .insert([{
          keyword: `${response.keyword} (نسخة)`,
          response_ar: response.response_ar,
          response_en: response.response_en,
          intent: response.intent,
          priority: response.priority,
          created_by: currentUser,
          status: 'inactive' // نسخة جديدة غير نشطة
        }]);

      if (insertError) {
        console.error('Duplicate error:', insertError);
        throw insertError;
      }

      await loadResponses();
      await loadStats();
      alert('✅ تم تكرار الرد بنجاح!');
    } catch (err: any) {
      console.error('Duplicate response error:', err);
      setError(err.message);
      alert(`❌ خطأ: ${err.message}`);
    }
  };

  // 📥 تصدير الردود إلى JSON
  const handleExportResponses = () => {
    try {
      const exportData = responses.map(r => ({
        keyword: r.keyword,
        response_ar: r.response_ar,
        response_en: r.response_en,
        intent: r.intent,
        priority: r.priority,
        status: r.status
      }));

      const dataStr = JSON.stringify(exportData, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `whatsapp-responses-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      alert('✅ تم تصدير الردود بنجاح!');
    } catch (err: any) {
      setError('فشل تصدير الردود');
    }
  };

  // 📤 استيراد الردود من JSON
  const handleImportResponses = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      console.log('Importing responses from file:', file.name);

      const text = await file.text();
      const importedData = JSON.parse(text);

      if (!Array.isArray(importedData)) {
        throw new Error('صيغة الملف غير صحيحة');
      }

      const adminSession = JSON.parse(localStorage.getItem('admin_session') || '{}');
      const currentUser = adminSession.admin?.phone || 'system';

      const dataToInsert = importedData.map((item: any) => ({
        ...item,
        created_by: currentUser,
        status: item.status || 'inactive'
      }));

      console.log('Inserting responses:', dataToInsert.length);

      const { error: insertError } = await supabase
        .from('whatsapp_auto_responses')
        .insert(dataToInsert);

      if (insertError) {
        console.error('Import error:', insertError);
        throw insertError;
      }

      await loadResponses();
      await loadStats();
      alert(`✅ تم استيراد ${importedData.length} رد بنجاح!`);
    } catch (err: any) {
      console.error('Import responses error:', err);
      setError(`فشل الاستيراد: ${err.message}`);
      alert(`❌ خطأ في الاستيراد: ${err.message}`);
    }

    // Reset input
    event.target.value = '';
  };

  // 🗑️ حذف جماعي للردود غير النشطة
  const handleBulkDeleteInactive = async () => {
    const inactiveCount = responses.filter(r => r.status === 'inactive').length;

    if (inactiveCount === 0) {
      alert('لا توجد ردود غير نشطة للحذف');
      return;
    }

    if (!confirm(`هل تريد حذف جميع الردود غير النشطة (${inactiveCount} رد)؟`)) return;

    try {
      const adminSession = JSON.parse(localStorage.getItem('admin_session') || '{}');
      const currentUser = adminSession.admin?.phone || 'system';
      const inactiveIds = responses.filter(r => r.status === 'inactive').map(r => r.id);

      console.log('Bulk deleting inactive responses:', inactiveCount);

      const { error: deleteError } = await supabase
        .from('whatsapp_auto_responses')
        .update({
          deleted_at: new Date().toISOString(),
          deleted_by: currentUser
        })
        .in('id', inactiveIds);

      if (deleteError) {
        console.error('Bulk delete error:', deleteError);
        throw deleteError;
      }

      await loadResponses();
      await loadStats();
      alert(`✅ تم حذف ${inactiveCount} رد بنجاح!`);
    } catch (err: any) {
      console.error('Bulk delete error:', err);
      setError(err.message);
      alert(`❌ خطأ: ${err.message}`);
    }
  };

  // ✅ تفعيل/تعطيل جماعي حسب النية
  const handleBulkToggleByIntent = async (intent: string, newStatus: 'active' | 'inactive') => {
    const count = responses.filter(r => r.intent === intent).length;

    if (count === 0) {
      alert(`لا توجد ردود من نوع "${getIntentLabel(intent)}"`);
      return;
    }

    if (!confirm(`هل تريد ${newStatus === 'active' ? 'تفعيل' : 'تعطيل'} جميع ردود "${getIntentLabel(intent)}" (${count} رد)؟`)) return;

    try {
      const intentIds = responses.filter(r => r.intent === intent).map(r => r.id);

      const { error: updateError } = await supabase
        .from('whatsapp_auto_responses')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .in('id', intentIds);

      if (updateError) throw updateError;

      await loadResponses();
      await loadStats();
      alert(`✅ تم ${newStatus === 'active' ? 'تفعيل' : 'تعطيل'} ${count} رد بنجاح!`);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getIntentLabel = (intent: string) => {
    const labels: any = {
      greeting: 'تحية',
      question: 'سؤال',
      financial: 'مالي',
      technical: 'تقني',
      request: 'طلب',
      thanks: 'شكر',
      general: 'عام'
    };
    return labels[intent] || intent;
  };

  const getIntentColor = (intent: string) => {
    const colors: any = {
      greeting: 'from-purple-500 to-pink-600',
      question: 'from-blue-500 to-cyan-600',
      financial: 'from-green-500 to-emerald-600',
      technical: 'from-orange-500 to-red-600',
      request: 'from-indigo-500 to-purple-600',
      thanks: 'from-yellow-500 to-orange-600',
      general: 'from-gray-500 to-gray-600'
    };
    return colors[intent] || 'from-gray-500 to-gray-600';
  };

  if (loading) {
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

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-3 rounded-xl">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">إدارة الردود التلقائية الذكية</h1>
            <p className="text-gray-400 text-sm">نظام متقدم لإدارة ردود الواتساب مع الذكاء الاصطناعي</p>
          </div>
        </div>

        <div className="flex gap-2">
          {/* Export Button */}
          <button
            onClick={handleExportResponses}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-all"
            title="تصدير الردود"
          >
            <Download className="w-5 h-5" />
          </button>

          {/* Import Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition-all"
            title="استيراد ردود"
          >
            <Upload className="w-5 h-5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImportResponses}
            className="hidden"
          />

          {/* Bulk Actions Menu */}
          <div className="relative">
            <button
              onClick={() => setShowBulkMenu(!showBulkMenu)}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg flex items-center gap-2 transition-all"
              title="إجراءات جماعية"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {showBulkMenu && (
              <div className="absolute left-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl z-50">
                <div className="p-2 space-y-1">
                  <button
                    onClick={() => {
                      handleBulkDeleteInactive();
                      setShowBulkMenu(false);
                    }}
                    className="w-full px-3 py-2 text-right text-red-400 hover:bg-red-500/20 rounded-lg flex items-center gap-2 transition-all"
                  >
                    <Trash className="w-4 h-4" />
                    حذف الردود غير النشطة
                  </button>

                  <div className="border-t border-gray-700 my-1"></div>

                  <div className="px-3 py-1 text-xs text-gray-500">تفعيل حسب النوع</div>

                  {['greeting', 'question', 'financial', 'technical'].map(intent => (
                    <button
                      key={intent}
                      onClick={() => {
                        handleBulkToggleByIntent(intent, 'active');
                        setShowBulkMenu(false);
                      }}
                      className="w-full px-3 py-2 text-right text-green-400 hover:bg-green-500/20 rounded-lg flex items-center gap-2 transition-all text-sm"
                    >
                      <Power className="w-4 h-4" />
                      تفعيل: {getIntentLabel(intent)}
                    </button>
                  ))}

                  <div className="border-t border-gray-700 my-1"></div>

                  <div className="px-3 py-1 text-xs text-gray-500">تعطيل حسب النوع</div>

                  {['greeting', 'question', 'financial', 'technical'].map(intent => (
                    <button
                      key={intent}
                      onClick={() => {
                        handleBulkToggleByIntent(intent, 'inactive');
                        setShowBulkMenu(false);
                      }}
                      className="w-full px-3 py-2 text-right text-gray-400 hover:bg-gray-700 rounded-lg flex items-center gap-2 transition-all text-sm"
                    >
                      <PowerOff className="w-4 h-4" />
                      تعطيل: {getIntentLabel(intent)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setShowStatsView(!showStatsView)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 transition-all"
          >
            <BarChart3 className="w-5 h-5" />
            الإحصاءات
          </button>
          <button
            onClick={() => setShowAIModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white rounded-lg flex items-center gap-2 transition-all"
          >
            <Brain className="w-5 h-5" />
            توليد بالذكاء
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg flex items-center gap-2 transition-all"
          >
            <Plus className="w-5 h-5" />
            إضافة رد يدوي
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && !showStatsView && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <MessageSquare className="w-8 h-8 text-cyan-400" />
              <span className="text-2xl font-bold text-white">{stats.total_responses}</span>
            </div>
            <p className="text-gray-300 text-sm">إجمالي الردود</p>
          </div>

          <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 border border-green-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle2 className="w-8 h-8 text-green-400" />
              <span className="text-2xl font-bold text-white">{stats.active_responses}</span>
            </div>
            <p className="text-gray-300 text-sm">الردود النشطة</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500/20 to-pink-600/20 border border-purple-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-purple-400" />
              <span className="text-2xl font-bold text-white">{stats.total_usage}</span>
            </div>
            <p className="text-gray-300 text-sm">مرات الاستخدام</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500/20 to-red-600/20 border border-orange-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-8 h-8 text-orange-400" />
              <span className="text-2xl font-bold text-white">
                {Math.round(stats.avg_effectiveness * 100)}%
              </span>
            </div>
            <p className="text-gray-300 text-sm">معدل الفاعلية</p>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 البحث بالكلمات المفتاحية أو نص الرد..."
            className="w-full pr-12 pl-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {['all', 'greeting', 'question', 'financial', 'technical', 'request'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
              }`}
            >
              {tab === 'all' ? '🌐 الكل' : `${getIntentLabel(tab)}`}
            </button>
          ))}
        </div>
      </div>

      {/* Responses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResponses.map((response) => (
          <div
            key={response.id}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-5 border border-gray-700/50 hover:border-cyan-500/50 transition-all group"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg font-bold text-white">🔑 {response.keyword}</span>
                  {response.ai_generated && (
                    <span className="px-2 py-1 bg-purple-600/30 text-purple-400 text-xs rounded">
                      <Sparkles className="w-3 h-3 inline mr-1" />
                      AI
                    </span>
                  )}
                  {response.is_default_fallback && (
                    <span className="px-2 py-1 bg-amber-600/30 text-amber-400 text-xs rounded font-bold flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      رد افتراضي
                    </span>
                  )}
                </div>
                <div className={`inline-block px-3 py-1 bg-gradient-to-r ${getIntentColor(response.intent)} rounded-lg text-white text-xs font-semibold`}>
                  {getIntentLabel(response.intent)}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleToggleStatus(response)}
                  className={`p-2 rounded-lg transition-all ${
                    response.status === 'active'
                      ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                      : 'bg-gray-700/30 text-gray-500 hover:bg-gray-600/30'
                  }`}
                  title={response.status === 'active' ? 'نشط' : 'معطل'}
                >
                  {response.status === 'active' ? (
                    <Eye className="w-5 h-5" />
                  ) : (
                    <EyeOff className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Response Text */}
            <p className="text-gray-300 text-sm mb-4 line-clamp-3">
              💬 {response.response_ar}
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-gray-700/30 rounded-lg p-2 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < response.priority ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-400">الأولوية</p>
              </div>

              <div className="bg-gray-700/30 rounded-lg p-2 text-center">
                <p className="text-cyan-400 font-bold">{response.usage_count}</p>
                <p className="text-xs text-gray-400">استخدام</p>
              </div>

              <div className="bg-gray-700/30 rounded-lg p-2 text-center">
                <p className="text-green-400 font-bold">
                  {Math.round((response.effectiveness_score || 0) * 100)}%
                </p>
                <p className="text-xs text-gray-400">فاعلية</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {response.is_default_fallback && (
                <button
                  onClick={() => handleToggleFallback(response.id)}
                  className={`flex-1 px-3 py-2 rounded-lg transition-all flex items-center justify-center gap-2 font-bold ${
                    response.fallback_enabled
                      ? 'bg-amber-600/20 text-amber-400 hover:bg-amber-600/30'
                      : 'bg-gray-700/30 text-gray-500 hover:bg-gray-600/30'
                  }`}
                  title={response.fallback_enabled ? 'تعطيل الرد الافتراضي' : 'تفعيل الرد الافتراضي'}
                >
                  {response.fallback_enabled ? (
                    <>
                      <Power className="w-4 h-4" />
                      مفعّل
                    </>
                  ) : (
                    <>
                      <PowerOff className="w-4 h-4" />
                      معطّل
                    </>
                  )}
                </button>
              )}

              {!response.is_default_fallback && (
                <button
                  onClick={() => handleSetAsDefaultFallback(response.id)}
                  className="px-3 py-2 bg-amber-600/20 text-amber-400 rounded-lg hover:bg-amber-600/30 transition-all flex items-center gap-2"
                  title="تعيين كرد افتراضي"
                >
                  <Zap className="w-4 h-4" />
                  <span className="text-xs">افتراضي</span>
                </button>
              )}

              <button
                onClick={() => {
                  setSelectedResponse(response);
                  setFormData({
                    keyword: response.keyword,
                    response_ar: response.response_ar,
                    response_en: response.response_en || '',
                    intent: response.intent,
                    priority: response.priority
                  });
                  setShowAddModal(true);
                }}
                className="flex-1 px-3 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-all flex items-center justify-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                تعديل
              </button>

              <button
                onClick={() => handleDuplicateResponse(response)}
                className="px-3 py-2 bg-cyan-600/20 text-cyan-400 rounded-lg hover:bg-cyan-600/30 transition-all"
                title="تكرار الرد"
              >
                <Copy className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleDeleteResponse(response.id)}
                className="px-3 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Last Used */}
            {response.last_used_at && (
              <div className="mt-3 pt-3 border-t border-gray-700/50 flex items-center gap-2 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                آخر استخدام: {new Date(response.last_used_at).toLocaleDateString('ar-SA')}
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredResponses.length === 0 && (
        <div className="text-center py-16">
          <MessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">لا توجد ردود مطابقة للبحث</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-6 max-w-2xl w-full border border-gray-700">
            <h3 className="text-2xl font-bold text-white mb-6">
              {selectedResponse ? '✏️ تعديل الرد' : '➕ إضافة رد جديد'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">🔑 الكلمة المفتاحية</label>
                <input
                  type="text"
                  value={formData.keyword}
                  onChange={(e) => setFormData({ ...formData, keyword: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  placeholder="مثال: حجز، تحويل، سعر..."
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">💬 نص الرد (بالعربي)</label>
                <textarea
                  value={formData.response_ar}
                  onChange={(e) => setFormData({ ...formData, response_ar: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500 min-h-[100px]"
                  placeholder="اكتب الرد التلقائي هنا..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-2">🎯 نوع النية</label>
                  <select
                    value={formData.intent}
                    onChange={(e) => setFormData({ ...formData, intent: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="greeting">تحية</option>
                    <option value="question">سؤال</option>
                    <option value="financial">مالي</option>
                    <option value="technical">تقني</option>
                    <option value="request">طلب</option>
                    <option value="thanks">شكر</option>
                    <option value="general">عام</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">⭐ الأولوية (1-5)</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="1">1 - نادر</option>
                    <option value="2">2 - قليل</option>
                    <option value="3">3 - متوسط</option>
                    <option value="4">4 - عالي</option>
                    <option value="5">5 - حرج</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={selectedResponse ?
                  () => handleUpdateResponse(selectedResponse.id, formData) :
                  handleAddResponse
                }
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all"
              >
                {selectedResponse ? 'تحديث' : 'حفظ'}
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedResponse(null);
                  resetForm();
                }}
                className="px-6 py-3 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-all"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Generation Modal */}
      {showAIModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 max-w-2xl w-full border border-purple-500/30">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-br from-pink-500 to-purple-600 p-3 rounded-xl">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">🧠 محرك الذكاء الاصطناعي</h3>
                <p className="text-gray-400 text-sm">اكتب مثالاً لرسالة المستخدم وسيقترح النظام الرد المناسب</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">💭 مثال لرسالة المستخدم</label>
                <textarea
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500 min-h-[100px]"
                  placeholder='مثال: "متى يتم التحويل المالي؟" أو "كيف أحجز أشجار؟"'
                />
              </div>

              <button
                onClick={handleAIGenerate}
                disabled={aiGenerating || !aiInput.trim()}
                className="w-full px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg hover:from-pink-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {aiGenerating ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    جاري التوليد...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    توليد الرد بالذكاء
                  </>
                )}
              </button>

              {aiSuggestion && (
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-white font-semibold">✨ الاقتراح الذكي</h4>
                    <span className="px-3 py-1 bg-green-600/30 text-green-400 text-xs rounded-lg">
                      دقة: {Math.round(aiSuggestion.confidence * 100)}%
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <span className="text-gray-400 text-sm">الكلمة المفتاحية:</span>
                      <p className="text-white font-semibold">🔑 {aiSuggestion.keyword}</p>
                    </div>

                    <div>
                      <span className="text-gray-400 text-sm">الرد المقترح:</span>
                      <p className="text-white">💬 {aiSuggestion.response_ar}</p>
                    </div>

                    <div className="flex gap-4">
                      <div>
                        <span className="text-gray-400 text-sm">النية:</span>
                        <p className="text-cyan-400">{getIntentLabel(aiSuggestion.intent)}</p>
                      </div>
                      <div>
                        <span className="text-gray-400 text-sm">الأولوية:</span>
                        <p className="text-yellow-400">⭐ {aiSuggestion.priority}/5</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleUseAISuggestion}
                    className="w-full px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    استخدام هذا الاقتراح
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setShowAIModal(false);
                setAiInput('');
                setAiSuggestion(null);
              }}
              className="w-full mt-4 px-6 py-3 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-all"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
