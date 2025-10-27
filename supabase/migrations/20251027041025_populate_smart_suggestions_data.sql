/*
  # إضافة بيانات الاقتراحات الذكية
  
  1. البيانات
    - اقتراحات سريعة لكل نوع من الاستفسارات
    - أزرار إجراءات سريعة
    - روابط مفيدة
    - أسئلة متوقعة
*/

-- Insert smart suggestions for different intents
INSERT INTO smart_suggestions (trigger_intent, trigger_keywords, suggestion_text_ar, suggestion_type, action_data, priority, user_type)
VALUES
  -- Greeting suggestions
  ('greeting', ARRAY['مرحبا', 'هلا'], '🌿 استعرض المزارع المتاحة', 'action', '{"action": "browse_farms"}'::jsonb, 5, 'all'),
  ('greeting', ARRAY['مرحبا', 'هلا'], '💰 تعرف على الأسعار', 'action', '{"action": "view_pricing"}'::jsonb, 5, 'all'),
  ('greeting', ARRAY['مرحبا', 'هلا'], '📞 تواصل معنا', 'action', '{"action": "contact_us"}'::jsonb, 4, 'all'),
  ('greeting', ARRAY['مرحبا', 'هلا'], '❓ الأسئلة الشائعة', 'action', '{"action": "view_faq"}'::jsonb, 4, 'all'),
  
  -- Booking suggestions
  ('booking', ARRAY['حجز', 'احجز'], '📋 خطوات الحجز بالتفصيل', 'quick_reply', '{"message": "كيف أحجز شجرة؟"}'::jsonb, 5, 'all'),
  ('booking', ARRAY['حجز', 'احجز'], '🌴 أنواع الأشجار المتاحة', 'quick_reply', '{"message": "ما أنواع الأشجار المتاحة؟"}'::jsonb, 5, 'all'),
  ('booking', ARRAY['حجز', 'احجز'], '💳 طرق الدفع المتاحة', 'quick_reply', '{"message": "ما طرق الدفع؟"}'::jsonb, 4, 'all'),
  ('booking', ARRAY['حجز', 'احجز'], '📜 متطلبات الحجز', 'quick_reply', '{"message": "ما المطلوب للحجز؟"}'::jsonb, 4, 'all'),
  
  -- Pricing suggestions
  ('pricing', ARRAY['سعر', 'أسعار'], '🌴 أسعار النخيل', 'quick_reply', '{"message": "كم سعر النخيل؟"}'::jsonb, 5, 'all'),
  ('pricing', ARRAY['سعر', 'أسعار'], '🫒 أسعار الزيتون', 'quick_reply', '{"message": "كم سعر الزيتون؟"}'::jsonb, 5, 'all'),
  ('pricing', ARRAY['سعر', 'أسعار'], '💰 العروض والباقات', 'quick_reply', '{"message": "هل توجد عروض خاصة؟"}'::jsonb, 4, 'all'),
  ('pricing', ARRAY['سعر', 'أسعار'], '📊 مقارنة الأسعار', 'action', '{"action": "compare_prices"}'::jsonb, 4, 'all'),
  
  -- Payment suggestions
  ('payment', ARRAY['دفع', 'تحويل'], '💳 طرق الدفع المتاحة', 'quick_reply', '{"message": "ما طرق الدفع المتاحة؟"}'::jsonb, 5, 'all'),
  ('payment', ARRAY['دفع', 'تحويل'], '🏦 معلومات التحويل البنكي', 'quick_reply', '{"message": "أريد معلومات التحويل البنكي"}'::jsonb, 5, 'all'),
  ('payment', ARRAY['دفع', 'تحويل'], '📸 رفع إيصال الدفع', 'action', '{"action": "upload_receipt"}'::jsonb, 4, 'investor'),
  ('payment', ARRAY['دفع', 'تحويل'], '⏱️ متى يتم تأكيد الدفع؟', 'quick_reply', '{"message": "متى يتم تأكيد الدفع؟"}'::jsonb, 4, 'all'),
  
  -- Certificate suggestions
  ('certificate', ARRAY['شهادة', 'ملكية'], '📜 كيف أحصل على الشهادة؟', 'quick_reply', '{"message": "كيف أحصل على شهادة الملكية؟"}'::jsonb, 5, 'all'),
  ('certificate', ARRAY['شهادة', 'ملكية'], '📥 تحميل شهادتي', 'action', '{"action": "download_certificate"}'::jsonb, 5, 'investor'),
  ('certificate', ARRAY['شهادة', 'ملكية'], '✅ التحقق من الشهادة', 'action', '{"action": "verify_certificate"}'::jsonb, 4, 'all'),
  ('certificate', ARRAY['شهادة', 'ملكية'], '📋 محتوى الشهادة', 'quick_reply', '{"message": "ماذا تتضمن الشهادة؟"}'::jsonb, 4, 'all'),
  
  -- Profits suggestions
  ('profits', ARRAY['ارباح', 'عائد'], '💵 كيف يتم توزيع الأرباح؟', 'quick_reply', '{"message": "كيف يتم توزيع الأرباح؟"}'::jsonb, 5, 'investor'),
  ('profits', ARRAY['ارباح', 'عائد'], '📅 مواعيد التوزيع', 'quick_reply', '{"message": "متى يتم توزيع الأرباح؟"}'::jsonb, 5, 'investor'),
  ('profits', ARRAY['ارباح', 'عائد'], '📊 أرباحي الحالية', 'action', '{"action": "view_profits"}'::jsonb, 5, 'investor'),
  ('profits', ARRAY['ارباح', 'عائد'], '📈 العائد المتوقع', 'quick_reply', '{"message": "ما العائد المتوقع؟"}'::jsonb, 4, 'all'),
  
  -- Refund suggestions
  ('refund', ARRAY['استرداد', 'الغاء'], '📋 شروط الاسترداد', 'quick_reply', '{"message": "ما شروط الاسترداد؟"}'::jsonb, 5, 'all'),
  ('refund', ARRAY['استرداد', 'الغاء'], '⏱️ مدة معالجة الاسترداد', 'quick_reply', '{"message": "كم مدة معالجة الاسترداد؟"}'::jsonb, 5, 'all'),
  ('refund', ARRAY['استرداد', 'الغاء'], '📞 التواصل مع الدعم', 'action', '{"action": "contact_support"}'::jsonb, 4, 'all'),
  
  -- Technical Issue suggestions
  ('technical_issue', ARRAY['مشكلة', 'خطأ'], '🔧 المشاكل الشائعة', 'quick_reply', '{"message": "ما المشاكل الشائعة؟"}'::jsonb, 5, 'all'),
  ('technical_issue', ARRAY['مشكلة', 'خطأ'], '📞 التواصل مع الدعم الفني', 'action', '{"action": "contact_technical"}'::jsonb, 5, 'all'),
  ('technical_issue', ARRAY['مشكلة', 'خطأ'], '🔄 مسح البيانات المؤقتة', 'action', '{"action": "clear_cache"}'::jsonb, 4, 'all'),
  
  -- How-to suggestions
  ('how_to', ARRAY['كيف', 'طريقة'], '📖 دليل المستخدم', 'link', '{"url": "/help/guide"}'::jsonb, 5, 'all'),
  ('how_to', ARRAY['كيف', 'طريقة'], '🎥 فيديوهات تعليمية', 'link', '{"url": "/help/videos"}'::jsonb, 5, 'all'),
  ('how_to', ARRAY['كيف', 'طريقة'], '❓ الأسئلة الشائعة', 'link', '{"url": "/help/faq"}'::jsonb, 4, 'all'),
  
  -- Thanks suggestions
  ('thanks', ARRAY['شكر', 'ممنون'], '⭐ قيّم تجربتك', 'action', '{"action": "rate_experience"}'::jsonb, 5, 'all'),
  ('thanks', ARRAY['شكر', 'ممنون'], '📢 شارك تجربتك', 'action', '{"action": "share_experience"}'::jsonb, 4, 'all'),
  ('thanks', ARRAY['شكر', 'ممنون'], '🎁 اكتشف المزيد', 'action', '{"action": "explore_more"}'::jsonb, 4, 'all')
ON CONFLICT DO NOTHING;