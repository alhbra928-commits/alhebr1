import React, { useState, useEffect } from 'react';
import {
  Brain, TrendingUp, Zap, Target, MessageSquare, Award,
  Activity, Database, Lightbulb, BarChart3, Eye, Settings,
  RefreshCw, Check, X, AlertCircle
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface AIStats {
  total_conversations: number;
  successful_resolutions: number;
  average_confidence: number;
  total_intents_detected: number;
  top_intents: Array<{ intent: string; count: number }>;
  sentiment_breakdown: { positive: number; neutral: number; negative: number };
  suggestions_used: number;
  learning_data_count: number;
}

interface IntentConfig {
  intent: string;
  label_ar: string;
  enabled: boolean;
  confidence_threshold: number;
  keywords: string[];
}

export const AdvancedAIEngine: React.FC = () => {
  const [stats, setStats] = useState<AIStats>({
    total_conversations: 0,
    successful_resolutions: 0,
    average_confidence: 0,
    total_intents_detected: 0,
    top_intents: [],
    sentiment_breakdown: { positive: 0, neutral: 0, negative: 0 },
    suggestions_used: 0,
    learning_data_count: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'overview' | 'intents' | 'learning' | 'suggestions'>('overview');

  useEffect(() => {
    loadAIStats();
  }, []);

  const loadAIStats = async () => {
    try {
      setLoading(true);

      // Get conversation learning stats
      const { data: learningData, error: learningError } = await supabase
        .from('conversation_learning')
        .select('*');

      if (learningError) throw learningError;

      // Get context data
      const { data: contextData, error: contextError } = await supabase
        .from('smart_button_context')
        .select('*');

      if (contextError) throw contextError;

      // Get suggestions
      const { data: suggestionsData, error: suggestionsError } = await supabase
        .from('smart_suggestions')
        .select('*');

      if (suggestionsError) throw suggestionsError;

      // Calculate stats
      const totalConversations = contextData?.length || 0;
      const successfulResolutions = learningData?.filter(l => l.resolution_successful).length || 0;

      const avgConfidence = learningData && learningData.length > 0
        ? learningData.reduce((sum, l) => {
            const confidence = l.context_snapshot?.intent_data?.confidence || 0;
            return sum + parseFloat(confidence);
          }, 0) / learningData.length
        : 0;

      // Intent breakdown
      const intentCounts: Record<string, number> = {};
      learningData?.forEach(l => {
        const intent = l.intent || 'unknown';
        intentCounts[intent] = (intentCounts[intent] || 0) + 1;
      });

      const topIntents = Object.entries(intentCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([intent, count]) => ({ intent, count }));

      // Sentiment breakdown
      const sentimentCounts = { positive: 0, neutral: 0, negative: 0 };
      learningData?.forEach(l => {
        const sentiment = l.context_snapshot?.intent_data?.sentiment || 'neutral';
        if (sentiment in sentimentCounts) {
          sentimentCounts[sentiment as keyof typeof sentimentCounts]++;
        }
      });

      const suggestionsUsed = suggestionsData?.reduce((sum, s) => sum + (s.usage_count || 0), 0) || 0;

      setStats({
        total_conversations: totalConversations,
        successful_resolutions: successfulResolutions,
        average_confidence: avgConfidence,
        total_intents_detected: learningData?.length || 0,
        top_intents: topIntents,
        sentiment_breakdown: sentimentCounts,
        suggestions_used: suggestionsUsed,
        learning_data_count: learningData?.length || 0
      });
    } catch (err) {
      console.error('Failed to load AI stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSuccessRate = () => {
    if (stats.total_intents_detected === 0) return 0;
    return ((stats.successful_resolutions / stats.total_intents_detected) * 100).toFixed(1);
  };

  const getSentimentEmoji = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return '😊';
      case 'negative': return '😔';
      default: return '😐';
    }
  };

  const getIntentLabel = (intent: string) => {
    const labels: Record<string, string> = {
      greeting: 'تحية',
      booking: 'حجز',
      pricing: 'أسعار',
      certificate: 'شهادة',
      payment: 'دفع',
      profits: 'أرباح',
      refund: 'استرداد',
      technical_issue: 'مشكلة تقنية',
      how_to: 'استفسار',
      timing: 'موعد',
      thanks: 'شكر',
      goodbye: 'وداع',
      question: 'سؤال',
      unknown: 'غير معروف'
    };
    return labels[intent] || intent;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-400">جاري تحميل بيانات الذكاء الاصطناعي...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500/20 to-pink-600/20 rounded-xl border border-purple-500/30 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Brain className="w-10 h-10 text-purple-400" />
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white">محرك الذكاء الاصطناعي المتقدم v2.0</h2>
            <p className="text-gray-300 text-sm">نظام ذكي متكامل للتعلم والتحليل والتفاعل</p>
          </div>
          <button
            onClick={loadAIStats}
            className="px-4 py-2 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            تحديث
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
            <MessageSquare className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats.total_conversations}</p>
            <p className="text-gray-400 text-xs">جلسات محادثة</p>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
            <Target className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{getSuccessRate()}%</p>
            <p className="text-gray-400 text-xs">معدل النجاح</p>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
            <Zap className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{(stats.average_confidence * 100).toFixed(0)}%</p>
            <p className="text-gray-400 text-xs">متوسط الثقة</p>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
            <Lightbulb className="w-6 h-6 text-orange-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats.suggestions_used}</p>
            <p className="text-gray-400 text-xs">اقتراحات مستخدمة</p>
          </div>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveView('overview')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
            activeView === 'overview'
              ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
              : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
          }`}
        >
          <Eye className="w-5 h-5" />
          نظرة عامة
        </button>

        <button
          onClick={() => setActiveView('intents')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
            activeView === 'intents'
              ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
              : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
          }`}
        >
          <Target className="w-5 h-5" />
          النوايا المكتشفة
        </button>

        <button
          onClick={() => setActiveView('learning')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
            activeView === 'learning'
              ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
              : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
          }`}
        >
          <Database className="w-5 h-5" />
          بيانات التعلم
        </button>

        <button
          onClick={() => setActiveView('suggestions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
            activeView === 'suggestions'
              ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
              : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
          }`}
        >
          <Lightbulb className="w-5 h-5" />
          الاقتراحات الذكية
        </button>
      </div>

      {/* Overview View */}
      {activeView === 'overview' && (
        <div className="space-y-6">
          {/* AI Features */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Zap className="w-6 h-6 text-yellow-400" />
              المميزات الذكية المتقدمة
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-500/20 to-cyan-600/20 rounded-lg p-5 border border-blue-500/30">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Brain className="w-6 h-6 text-blue-400" />
                  </div>
                  <h4 className="text-white font-semibold">كشف النية المتقدم</h4>
                </div>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    15+ نية مختلفة
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    دقة عالية (85-95%)
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    تحليل الكلمات المفتاحية
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-purple-500/20 to-pink-600/20 rounded-lg p-5 border border-purple-500/30">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Activity className="w-6 h-6 text-purple-400" />
                  </div>
                  <h4 className="text-white font-semibold">تحليل المشاعر</h4>
                </div>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    إيجابي / سلبي / محايد
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    كشف مستوى الإلحاح
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    ردود مخصصة
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-lg p-5 border border-green-500/30">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-400" />
                  </div>
                  <h4 className="text-white font-semibold">التعلم الذاتي</h4>
                </div>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    يحفظ كل محادثة
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    يحسن الردود تلقائياً
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    يتتبع معدل النجاح
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Sentiment Analysis */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Activity className="w-6 h-6 text-purple-400" />
              تحليل المشاعر
            </h3>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-lg p-6 border border-green-500/30 text-center">
                <div className="text-4xl mb-2">😊</div>
                <p className="text-3xl font-bold text-white mb-1">{stats.sentiment_breakdown.positive}</p>
                <p className="text-gray-300 text-sm">إيجابي</p>
              </div>

              <div className="bg-gradient-to-br from-gray-500/20 to-gray-600/20 rounded-lg p-6 border border-gray-500/30 text-center">
                <div className="text-4xl mb-2">😐</div>
                <p className="text-3xl font-bold text-white mb-1">{stats.sentiment_breakdown.neutral}</p>
                <p className="text-gray-300 text-sm">محايد</p>
              </div>

              <div className="bg-gradient-to-br from-red-500/20 to-orange-600/20 rounded-lg p-6 border border-red-500/30 text-center">
                <div className="text-4xl mb-2">😔</div>
                <p className="text-3xl font-bold text-white mb-1">{stats.sentiment_breakdown.negative}</p>
                <p className="text-gray-300 text-sm">سلبي</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Intents View */}
      {activeView === 'intents' && (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Target className="w-6 h-6 text-blue-400" />
            النوايا الأكثر كشفاً
          </h3>

          {stats.top_intents.length > 0 ? (
            <div className="space-y-3">
              {stats.top_intents.map((item, index) => {
                const percentage = stats.total_intents_detected > 0
                  ? ((item.count / stats.total_intents_detected) * 100).toFixed(1)
                  : 0;

                return (
                  <div key={item.intent} className="bg-gray-700/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-white font-semibold">{getIntentLabel(item.intent)}</p>
                          <p className="text-gray-400 text-xs">{item.intent}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-white">{item.count}</p>
                        <p className="text-gray-400 text-xs">{percentage}%</p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-600/30 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-cyan-600 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">لا توجد بيانات نوايا بعد</p>
              <p className="text-gray-500 text-sm mt-2">ابدأ باستخدام الزر الذكي لجمع البيانات</p>
            </div>
          )}
        </div>
      )}

      {/* Learning View */}
      {activeView === 'learning' && (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Database className="w-6 h-6 text-green-400" />
            بيانات التعلم
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-500/20 to-cyan-600/20 rounded-lg p-6 border border-blue-500/30 text-center">
              <Database className="w-12 h-12 text-blue-400 mx-auto mb-3" />
              <p className="text-3xl font-bold text-white mb-2">{stats.learning_data_count}</p>
              <p className="text-gray-300 text-sm">محادثات محفوظة</p>
              <p className="text-gray-400 text-xs mt-2">يتم استخدامها للتحسين المستمر</p>
            </div>

            <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-lg p-6 border border-green-500/30 text-center">
              <Check className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <p className="text-3xl font-bold text-white mb-2">{stats.successful_resolutions}</p>
              <p className="text-gray-300 text-sm">حلول ناجحة</p>
              <p className="text-gray-400 text-xs mt-2">تم حل المشكلة تلقائياً</p>
            </div>

            <div className="bg-gradient-to-br from-orange-500/20 to-red-600/20 rounded-lg p-6 border border-orange-500/30 text-center">
              <X className="w-12 h-12 text-orange-400 mx-auto mb-3" />
              <p className="text-3xl font-bold text-white mb-2">
                {stats.total_intents_detected - stats.successful_resolutions}
              </p>
              <p className="text-gray-300 text-sm">تحويل للدعم</p>
              <p className="text-gray-400 text-xs mt-2">لم يجد رد مناسب</p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-blue-400 mt-1" />
              <div>
                <p className="text-white font-semibold mb-1">💡 نصيحة ذكية</p>
                <p className="text-gray-300 text-sm">
                  كل محادثة يتم حفظها وتحليلها لتحسين دقة الذكاء الاصطناعي.
                  النظام يتعلم من كل تفاعل ويصبح أكثر ذكاءً مع الوقت!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Suggestions View */}
      {activeView === 'suggestions' && (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-yellow-400" />
            الاقتراحات الذكية
          </h3>

          <div className="mb-6">
            <div className="bg-gradient-to-r from-yellow-500/20 to-orange-600/20 rounded-lg p-6 border border-yellow-500/30">
              <div className="flex items-center gap-3 mb-4">
                <Award className="w-10 h-10 text-yellow-400" />
                <div>
                  <h4 className="text-white font-semibold text-lg">40+ اقتراح ذكي</h4>
                  <p className="text-gray-300 text-sm">يتم عرضها تلقائياً حسب سياق المحادثة</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <p className="text-2xl font-bold text-white mb-1">{stats.suggestions_used}</p>
                  <p className="text-gray-300 text-sm">مرات الاستخدام</p>
                </div>
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <p className="text-2xl font-bold text-white mb-1">40+</p>
                  <p className="text-gray-300 text-sm">اقتراحات متاحة</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-700/50 rounded-lg p-5">
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-400" />
                أمثلة على الاقتراحات
              </h4>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 bg-blue-500/20 text-blue-200 text-sm rounded-lg border border-blue-500/30">
                  🌿 استعرض المزارع المتاحة
                </span>
                <span className="px-3 py-1.5 bg-blue-500/20 text-blue-200 text-sm rounded-lg border border-blue-500/30">
                  💰 تعرف على الأسعار
                </span>
                <span className="px-3 py-1.5 bg-blue-500/20 text-blue-200 text-sm rounded-lg border border-blue-500/30">
                  📋 خطوات الحجز بالتفصيل
                </span>
                <span className="px-3 py-1.5 bg-blue-500/20 text-blue-200 text-sm rounded-lg border border-blue-500/30">
                  💳 طرق الدفع المتاحة
                </span>
                <span className="px-3 py-1.5 bg-blue-500/20 text-blue-200 text-sm rounded-lg border border-blue-500/30">
                  📜 كيف أحصل على الشهادة؟
                </span>
                <span className="px-3 py-1.5 bg-blue-500/20 text-blue-200 text-sm rounded-lg border border-blue-500/30">
                  💵 كيف يتم توزيع الأرباح؟
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
