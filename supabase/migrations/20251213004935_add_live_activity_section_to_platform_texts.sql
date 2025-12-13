/*
  # إضافة قسم شريط النشاط المباشر إلى نظام النصوص

  1. Changes
    - تحديث قيد الأقسام المسموح بها في جدول platform_texts
    - إضافة 'live_activity' إلى قائمة الأقسام المتاحة
    - إدراج نصوص افتراضية شاملة لشريط النشاط المباشر

  2. Security
    - لا تغيير في صلاحيات RLS
*/

-- حذف القيد القديم
ALTER TABLE platform_texts DROP CONSTRAINT IF EXISTS platform_texts_section_check;

-- إضافة القيد الجديد مع live_activity
ALTER TABLE platform_texts ADD CONSTRAINT platform_texts_section_check
CHECK (section = ANY (ARRAY[
  'header', 'footer', 'home', 'about', 'contact', 'features', 'hero', 'stats',
  'cta', 'buttons', 'farm_cards', 'navigation', 'steps', 'benefits', 'messages',
  'contact_bar', 'side_dock', 'loader', 'live_activity',
  'booking', 'forms', 'modals', 'notifications', 'errors', 'success', 'filters',
  'search', 'profile', 'settings', 'help', 'legal', 'seo', 'farm_details',
  'certificate', 'payment', 'dashboard', 'auth'
]));

-- إدراج نصوص شريط النشاط المباشر
INSERT INTO platform_texts (section, key, text_ar, text_en, description, editable, display_order) VALUES
  -- نصوص عامة
  ('live_activity', 'section_title', 'شريط النشاط المباشر', 'Live Activity Bar', 'عنوان قسم شريط النشاط', true, 1),
  ('live_activity', 'section_description', 'عرض الأنشطة والتحديثات المباشرة', 'Display live activities and updates', 'وصف القسم', true, 2),

  -- أوضاع المحتوى
  ('live_activity', 'mode_auto', 'تلقائي', 'Automatic', 'وضع المحتوى التلقائي', true, 10),
  ('live_activity', 'mode_manual', 'يدوي', 'Manual', 'وضع المحتوى اليدوي', true, 11),
  ('live_activity', 'mode_both', 'كلاهما', 'Both', 'وضع المحتوى المدمج', true, 12),

  -- نصوص الأنشطة التلقائية
  ('live_activity', 'new_reservation', 'حجز جديد من {name}', 'New reservation from {name}', 'رسالة الحجز الجديد', true, 20),
  ('live_activity', 'new_certificate', 'تم إصدار شهادة تملك جديدة', 'New ownership certificate issued', 'رسالة الشهادة الجديدة', true, 21),
  ('live_activity', 'new_farm', 'مزرعة {farm} متاحة للاستثمار', 'Farm {farm} available for investment', 'رسالة المزرعة الجديدة', true, 22),

  -- نصوص الإعدادات
  ('live_activity', 'settings_general', 'الإعدادات العامة', 'General Settings', 'تبويب الإعدادات العامة', true, 30),
  ('live_activity', 'settings_content', 'إدارة المحتوى', 'Content Management', 'تبويب إدارة المحتوى', true, 31),
  ('live_activity', 'settings_appearance', 'المظهر والألوان', 'Appearance & Colors', 'تبويب المظهر', true, 32),
  ('live_activity', 'settings_advanced', 'متقدم', 'Advanced', 'تبويب الإعدادات المتقدمة', true, 33),
  ('live_activity', 'settings_messages', 'الرسائل المخصصة', 'Custom Messages', 'تبويب الرسائل المخصصة', true, 34),

  -- نصوص الحالة
  ('live_activity', 'status_enabled', 'مفعل', 'Enabled', 'حالة التفعيل', true, 40),
  ('live_activity', 'status_disabled', 'معطل', 'Disabled', 'حالة التعطيل', true, 41),
  ('live_activity', 'status_active', 'نشط', 'Active', 'حالة النشاط', true, 42),
  ('live_activity', 'status_inactive', 'غير نشط', 'Inactive', 'حالة عدم النشاط', true, 43),

  -- نصوص السرعة
  ('live_activity', 'speed_slow', 'بطيء', 'Slow', 'سرعة الحركة البطيئة', true, 50),
  ('live_activity', 'speed_medium', 'متوسط', 'Medium', 'سرعة الحركة المتوسطة', true, 51),
  ('live_activity', 'speed_fast', 'سريع', 'Fast', 'سرعة الحركة السريعة', true, 52),

  -- نصوص الخلفية
  ('live_activity', 'bg_gradient', 'متدرج', 'Gradient', 'نمط الخلفية المتدرجة', true, 60),
  ('live_activity', 'bg_solid', 'صلب', 'Solid', 'نمط الخلفية الصلبة', true, 61),
  ('live_activity', 'bg_glass', 'زجاجي', 'Glass', 'نمط الخلفية الزجاجية', true, 62),

  -- نصوص الأزرار
  ('live_activity', 'btn_save', 'حفظ الإعدادات', 'Save Settings', 'زر حفظ الإعدادات', true, 70),
  ('live_activity', 'btn_reset', 'إعادة تعيين', 'Reset', 'زر إعادة التعيين', true, 71),
  ('live_activity', 'btn_preview', 'معاينة', 'Preview', 'زر المعاينة', true, 72),
  ('live_activity', 'btn_add_message', 'إضافة رسالة', 'Add Message', 'زر إضافة رسالة مخصصة', true, 73),
  ('live_activity', 'btn_edit', 'تعديل', 'Edit', 'زر التعديل', true, 74),
  ('live_activity', 'btn_delete', 'حذف', 'Delete', 'زر الحذف', true, 75),
  ('live_activity', 'btn_apply_preset', 'تطبيق القالب', 'Apply Preset', 'زر تطبيق القالب', true, 76),

  -- نصوص النماذج
  ('live_activity', 'form_message_ar', 'النص بالعربية', 'Arabic Text', 'حقل النص العربي', true, 80),
  ('live_activity', 'form_message_en', 'النص بالإنجليزية', 'English Text', 'حقل النص الإنجليزي', true, 81),
  ('live_activity', 'form_icon', 'الأيقونة', 'Icon', 'حقل اختيار الأيقونة', true, 82),
  ('live_activity', 'form_priority', 'الأولوية', 'Priority', 'حقل الأولوية', true, 83),
  ('live_activity', 'form_active', 'نشط', 'Active', 'حقل الحالة النشطة', true, 84),

  -- نصوص الرسائل
  ('live_activity', 'msg_save_success', 'تم حفظ الإعدادات بنجاح', 'Settings saved successfully', 'رسالة النجاح', true, 90),
  ('live_activity', 'msg_save_error', 'فشل حفظ الإعدادات', 'Failed to save settings', 'رسالة الخطأ', true, 91),
  ('live_activity', 'msg_delete_confirm', 'هل تريد حذف هذه الرسالة؟', 'Are you sure you want to delete this message?', 'رسالة تأكيد الحذف', true, 92),
  ('live_activity', 'msg_no_messages', 'لا توجد رسائل مخصصة', 'No custom messages', 'رسالة عدم وجود رسائل', true, 93),
  ('live_activity', 'msg_message_required', 'يرجى إدخال نص الرسالة', 'Please enter message text', 'رسالة خطأ حقل مطلوب', true, 94),

  -- نصوص المساعدة والتوضيحات
  ('live_activity', 'help_content_mode', 'اختر وضع عرض المحتوى في الشريط', 'Choose how to display content in the bar', 'مساعدة وضع المحتوى', true, 100),
  ('live_activity', 'help_animation_speed', 'سرعة تحرك العناصر في الشريط', 'Speed of elements movement in the bar', 'مساعدة السرعة', true, 101),
  ('live_activity', 'help_max_items', 'الحد الأقصى لعدد الأنشطة المعروضة', 'Maximum number of activities to display', 'مساعدة الحد الأقصى', true, 102),
  ('live_activity', 'help_refresh_interval', 'فترة التحديث التلقائي بالثواني', 'Auto refresh interval in seconds', 'مساعدة فترة التحديث', true, 103),
  ('live_activity', 'help_height', 'ارتفاع الشريط بالبكسل (40-80)', 'Bar height in pixels (40-80)', 'مساعدة الارتفاع', true, 104),
  ('live_activity', 'help_colors', 'تخصيص ألوان النصوص والأيقونات', 'Customize text and icon colors', 'مساعدة الألوان', true, 105),

  -- نصوص الإحصائيات
  ('live_activity', 'stats_total', 'إجمالي الأنشطة', 'Total Activities', 'عنوان إجمالي الأنشطة', true, 110),
  ('live_activity', 'stats_reservations', 'الحجوزات', 'Reservations', 'عنوان الحجوزات', true, 111),
  ('live_activity', 'stats_certificates', 'الشهادات', 'Certificates', 'عنوان الشهادات', true, 112),
  ('live_activity', 'stats_farms', 'المزارع', 'Farms', 'عنوان المزارع', true, 113),
  ('live_activity', 'stats_custom', 'الرسائل المخصصة', 'Custom Messages', 'عنوان الرسائل المخصصة', true, 114),
  ('live_activity', 'stats_auto', 'الأنشطة التلقائية', 'Auto Activities', 'عنوان الأنشطة التلقائية', true, 115),

  -- نصوص القوالب المعدة
  ('live_activity', 'preset_classic', 'الكلاسيكي', 'Classic', 'قالب الكلاسيكي', true, 120),
  ('live_activity', 'preset_dynamic', 'الديناميكي', 'Dynamic', 'قالب الديناميكي', true, 121),
  ('live_activity', 'preset_elegant', 'الأنيق', 'Elegant', 'قالب الأنيق', true, 122),
  ('live_activity', 'preset_professional', 'الاحترافي', 'Professional', 'قالب الاحترافي', true, 123),

  -- نصوص التبويبات
  ('live_activity', 'tab_general', 'عام', 'General', 'تبويب عام', true, 130),
  ('live_activity', 'tab_content', 'المحتوى', 'Content', 'تبويب المحتوى', true, 131),
  ('live_activity', 'tab_appearance', 'المظهر', 'Appearance', 'تبويب المظهر', true, 132),
  ('live_activity', 'tab_advanced', 'متقدم', 'Advanced', 'تبويب متقدم', true, 133),
  ('live_activity', 'tab_messages', 'الرسائل', 'Messages', 'تبويب الرسائل', true, 134),

  -- نصوص العناوين
  ('live_activity', 'title_enable_bar', 'تفعيل الشريط', 'Enable Bar', 'عنوان تفعيل الشريط', true, 140),
  ('live_activity', 'title_content_settings', 'إعدادات المحتوى', 'Content Settings', 'عنوان إعدادات المحتوى', true, 141),
  ('live_activity', 'title_appearance_settings', 'إعدادات المظهر', 'Appearance Settings', 'عنوان إعدادات المظهر', true, 142),
  ('live_activity', 'title_custom_messages', 'الرسائل المخصصة', 'Custom Messages', 'عنوان الرسائل المخصصة', true, 143),
  ('live_activity', 'title_preview', 'معاينة مباشرة', 'Live Preview', 'عنوان المعاينة', true, 144),

  -- نصوص الوصف
  ('live_activity', 'desc_enable_bar', 'تشغيل أو إيقاف عرض شريط النشاط', 'Enable or disable the activity bar', 'وصف تفعيل الشريط', true, 150),
  ('live_activity', 'desc_content_mode', 'اختر مصدر المحتوى المعروض', 'Choose the content source to display', 'وصف وضع المحتوى', true, 151),
  ('live_activity', 'desc_animation', 'تحكم في سرعة وطريقة الحركة', 'Control animation speed and style', 'وصف الحركة', true, 152),
  ('live_activity', 'desc_colors', 'تخصيص الألوان والمظهر', 'Customize colors and appearance', 'وصف الألوان', true, 153)
ON CONFLICT (section, key) DO NOTHING;
