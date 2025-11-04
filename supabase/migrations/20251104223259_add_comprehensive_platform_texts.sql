/*
  # إضافة نصوص شاملة للمنصة

  1. الأقسام:
    - hero, features, benefits, steps, stats
    - farm_cards, buttons, messages, navigation, footer
    - booking, forms, filters, search
    - errors, success, seo

  2. ملاحظة:
    - حذف النصوص القديمة من home وإعادة تنظيمها
    - الحفاظ على loader, side_dock, contact_bar
*/

-- حذف النصوص القديمة فقط من الأقسام التي سنعيد كتابتها
DELETE FROM platform_texts 
WHERE section IN ('home', 'hero', 'features', 'benefits', 'steps', 'stats', 'farm_cards', 'buttons', 'messages', 'navigation', 'footer');

-- HERO
INSERT INTO platform_texts (section, key, text_ar, text_en, description, editable, display_order) VALUES
('hero', 'main_title', 'استثمر في أشجار النخيل والزيتون', 'Invest in Palm and Olive Trees', 'العنوان الرئيسي', true, 1),
('hero', 'subtitle', 'تملك أشجارك وحقق عوائد سنوية مستدامة', 'Own your trees and achieve sustainable annual returns', 'النص الفرعي', true, 2),
('hero', 'cta_primary', 'ابدأ الاستثمار الآن', 'Start Investing Now', 'زر رئيسي', true, 3),
('hero', 'cta_secondary', 'استكشف المزارع', 'Explore Farms', 'زر ثانوي', true, 4),
('hero', 'badge_text', 'مشروع استثماري موثوق', 'Trusted Investment Project', 'شارة', true, 5);

-- FEATURES
INSERT INTO platform_texts (section, key, text_ar, text_en, description, editable, display_order) VALUES
('features', 'title', 'لماذا تستثمر معنا؟', 'Why Invest With Us?', 'عنوان المميزات', true, 10),
('features', 'subtitle', 'نوفر لك فرصة استثمارية فريدة وآمنة', 'We offer you a unique and safe investment opportunity', 'وصف', true, 11),
('features', 'feature_1_title', 'عوائد مضمونة', 'Guaranteed Returns', 'ميزة 1', true, 12),
('features', 'feature_1_desc', 'عوائد سنوية ثابتة من محاصيل أشجارك', 'Fixed annual returns from your tree crops', 'وصف 1', true, 13),
('features', 'feature_2_title', 'إدارة احترافية', 'Professional Management', 'ميزة 2', true, 14),
('features', 'feature_2_desc', 'فريق متخصص يهتم بأشجارك على مدار العام', 'Specialized team takes care of your trees year-round', 'وصف 2', true, 15),
('features', 'feature_3_title', 'شفافية كاملة', 'Full Transparency', 'ميزة 3', true, 16),
('features', 'feature_3_desc', 'تتبع حالة أشجارك ومحاصيلك لحظياً', 'Track your trees and crops status in real-time', 'وصف 3', true, 17),
('features', 'feature_4_title', 'استثمار آمن', 'Safe Investment', 'ميزة 4', true, 18),
('features', 'feature_4_desc', 'ملكية موثقة ومحمية قانونياً', 'Documented and legally protected ownership', 'وصف 4', true, 19);

-- BENEFITS
INSERT INTO platform_texts (section, key, text_ar, text_en, description, editable, display_order) VALUES
('benefits', 'title', 'فوائد الاستثمار الزراعي', 'Agricultural Investment Benefits', 'عنوان', true, 20),
('benefits', 'item_1', 'دخل سنوي ثابت ومستدام', 'Stable and sustainable annual income', 'فائدة 1', true, 21),
('benefits', 'item_2', 'استثمار طويل الأمد بعوائد متنامية', 'Long-term investment with growing returns', 'فائدة 2', true, 22),
('benefits', 'item_3', 'مساهمة في الاستدامة البيئية', 'Contributing to environmental sustainability', 'فائدة 3', true, 23),
('benefits', 'item_4', 'تنويع المحفظة الاستثمارية', 'Investment portfolio diversification', 'فائدة 4', true, 24),
('benefits', 'item_5', 'حماية من التضخم', 'Protection from inflation', 'فائدة 5', true, 25);

-- STEPS
INSERT INTO platform_texts (section, key, text_ar, text_en, description, editable, display_order) VALUES
('steps', 'title', 'كيف تبدأ الاستثمار؟', 'How to Start Investing?', 'عنوان', true, 30),
('steps', 'step_1_title', 'اختر مزرعتك', 'Choose Your Farm', 'خطوة 1', true, 31),
('steps', 'step_1_desc', 'تصفح المزارع المتاحة واختر الأنسب لك', 'Browse available farms and choose the best for you', 'وصف 1', true, 32),
('steps', 'step_2_title', 'حدد عدد الأشجار', 'Select Number of Trees', 'خطوة 2', true, 33),
('steps', 'step_2_desc', 'اختر عدد الأشجار التي ترغب بتملكها', 'Choose the number of trees you want to own', 'وصف 2', true, 34),
('steps', 'step_3_title', 'أكمل الحجز', 'Complete Booking', 'خطوة 3', true, 35),
('steps', 'step_3_desc', 'أدخل بياناتك وأكمل عملية الدفع', 'Enter your details and complete payment', 'وصف 3', true, 36),
('steps', 'step_4_title', 'احصل على شهادتك', 'Get Your Certificate', 'خطوة 4', true, 37),
('steps', 'step_4_desc', 'استلم شهادة الملكية وابدأ في الحصول على العوائد', 'Receive ownership certificate and start earning returns', 'وصف 4', true, 38);

-- STATS
INSERT INTO platform_texts (section, key, text_ar, text_en, description, editable, display_order) VALUES
('stats', 'total_farms', 'مزرعة متاحة', 'Available Farms', 'عدد المزارع', true, 40),
('stats', 'total_trees', 'شجرة مستثمرة', 'Invested Trees', 'عدد الأشجار', true, 41),
('stats', 'total_investors', 'مستثمر سعيد', 'Happy Investors', 'عدد المستثمرين', true, 42),
('stats', 'success_rate', 'نسبة النجاح', 'Success Rate', 'نسبة النجاح', true, 43);

-- FARM CARDS
INSERT INTO platform_texts (section, key, text_ar, text_en, description, editable, display_order) VALUES
('farm_cards', 'available_trees', 'شجرة متاحة', 'Available Trees', 'الأشجار المتاحة', true, 50),
('farm_cards', 'tree_price', 'سعر الشجرة', 'Tree Price', 'سعر الشجرة', true, 51),
('farm_cards', 'expected_return', 'العائد المتوقع', 'Expected Return', 'العائد المتوقع', true, 52),
('farm_cards', 'location', 'الموقع', 'Location', 'الموقع', true, 53),
('farm_cards', 'view_details', 'عرض التفاصيل', 'View Details', 'زر التفاصيل', true, 54),
('farm_cards', 'book_now', 'احجز الآن', 'Book Now', 'زر الحجز', true, 55),
('farm_cards', 'sold_out', 'نفذت الكمية', 'Sold Out', 'نفذت', true, 56),
('farm_cards', 'limited_stock', 'كمية محدودة', 'Limited Stock', 'محدودة', true, 57),
('farm_cards', 'farm_name', 'اسم المزرعة', 'Farm Name', 'الاسم', true, 58),
('farm_cards', 'tree_type', 'نوع الشجرة', 'Tree Type', 'النوع', true, 59);

-- BUTTONS
INSERT INTO platform_texts (section, key, text_ar, text_en, description, editable, display_order) VALUES
('buttons', 'save', 'حفظ', 'Save', 'حفظ', true, 60),
('buttons', 'cancel', 'إلغاء', 'Cancel', 'إلغاء', true, 61),
('buttons', 'confirm', 'تأكيد', 'Confirm', 'تأكيد', true, 62),
('buttons', 'back', 'رجوع', 'Back', 'رجوع', true, 63),
('buttons', 'next', 'التالي', 'Next', 'التالي', true, 64),
('buttons', 'previous', 'السابق', 'Previous', 'السابق', true, 65),
('buttons', 'submit', 'إرسال', 'Submit', 'إرسال', true, 66),
('buttons', 'close', 'إغلاق', 'Close', 'إغلاق', true, 67),
('buttons', 'edit', 'تعديل', 'Edit', 'تعديل', true, 68),
('buttons', 'delete', 'حذف', 'Delete', 'حذف', true, 69),
('buttons', 'search', 'بحث', 'Search', 'بحث', true, 70),
('buttons', 'filter', 'تصفية', 'Filter', 'تصفية', true, 71),
('buttons', 'reset', 'إعادة تعيين', 'Reset', 'إعادة', true, 72),
('buttons', 'download', 'تحميل', 'Download', 'تحميل', true, 73),
('buttons', 'upload', 'رفع', 'Upload', 'رفع', true, 74),
('buttons', 'view', 'عرض', 'View', 'عرض', true, 75);

-- MESSAGES
INSERT INTO platform_texts (section, key, text_ar, text_en, description, editable, display_order) VALUES
('messages', 'loading', 'جاري التحميل...', 'Loading...', 'تحميل', true, 80),
('messages', 'no_data', 'لا توجد بيانات', 'No data available', 'لا بيانات', true, 81),
('messages', 'error_occurred', 'حدث خطأ ما', 'An error occurred', 'خطأ', true, 82),
('messages', 'success_saved', 'تم الحفظ بنجاح', 'Saved successfully', 'نجاح', true, 83),
('messages', 'confirm_action', 'هل أنت متأكد؟', 'Are you sure?', 'تأكيد', true, 84),
('messages', 'processing', 'جاري المعالجة...', 'Processing...', 'معالجة', true, 85),
('messages', 'please_wait', 'يرجى الانتظار', 'Please wait', 'انتظار', true, 86),
('messages', 'try_again', 'حاول مرة أخرى', 'Try again', 'إعادة', true, 87);

-- NAVIGATION
INSERT INTO platform_texts (section, key, text_ar, text_en, description, editable, display_order) VALUES
('navigation', 'home', 'الرئيسية', 'Home', 'الرئيسية', true, 90),
('navigation', 'farms', 'المزارع', 'Farms', 'المزارع', true, 91),
('navigation', 'about', 'من نحن', 'About Us', 'من نحن', true, 92),
('navigation', 'contact', 'اتصل بنا', 'Contact Us', 'اتصل', true, 93),
('navigation', 'login', 'تسجيل الدخول', 'Login', 'دخول', true, 94),
('navigation', 'my_account', 'حسابي', 'My Account', 'حسابي', true, 95),
('navigation', 'logout', 'تسجيل الخروج', 'Logout', 'خروج', true, 96),
('navigation', 'dashboard', 'لوحة التحكم', 'Dashboard', 'لوحة', true, 97);

-- FOOTER
INSERT INTO platform_texts (section, key, text_ar, text_en, description, editable, display_order) VALUES
('footer', 'about_title', 'عن المنصة', 'About Platform', 'عن', true, 100),
('footer', 'about_desc', 'منصة رائدة في مجال الاستثمار الزراعي', 'Leading platform in agricultural investment', 'وصف', true, 101),
('footer', 'quick_links', 'روابط سريعة', 'Quick Links', 'روابط', true, 102),
('footer', 'contact_info', 'معلومات الاتصال', 'Contact Information', 'اتصال', true, 103),
('footer', 'follow_us', 'تابعنا', 'Follow Us', 'تابعنا', true, 104),
('footer', 'copyright', 'جميع الحقوق محفوظة', 'All Rights Reserved', 'حقوق', true, 105),
('footer', 'privacy_policy', 'سياسة الخصوصية', 'Privacy Policy', 'خصوصية', true, 106),
('footer', 'terms', 'الشروط والأحكام', 'Terms & Conditions', 'شروط', true, 107),
('footer', 'email', 'البريد الإلكتروني', 'Email', 'بريد', true, 108),
('footer', 'phone', 'الهاتف', 'Phone', 'هاتف', true, 109),
('footer', 'address', 'العنوان', 'Address', 'عنوان', true, 110);

-- BOOKING
INSERT INTO platform_texts (section, key, text_ar, text_en, description, editable, display_order) VALUES
('booking', 'title', 'إتمام الحجز', 'Complete Booking', 'عنوان', true, 120),
('booking', 'personal_info', 'المعلومات الشخصية', 'Personal Information', 'معلومات', true, 121),
('booking', 'full_name', 'الاسم الكامل', 'Full Name', 'اسم', true, 122),
('booking', 'phone', 'رقم الهاتف', 'Phone Number', 'هاتف', true, 123),
('booking', 'email', 'البريد الإلكتروني', 'Email', 'بريد', true, 124),
('booking', 'national_id', 'رقم الهوية', 'National ID', 'هوية', true, 125),
('booking', 'order_summary', 'ملخص الطلب', 'Order Summary', 'ملخص', true, 126),
('booking', 'tree_count', 'عدد الأشجار', 'Number of Trees', 'عدد', true, 127),
('booking', 'price_per_tree', 'سعر الشجرة', 'Price per Tree', 'سعر', true, 128),
('booking', 'total_price', 'المبلغ الإجمالي', 'Total Amount', 'إجمالي', true, 129),
('booking', 'complete', 'إتمام الحجز', 'Complete Booking', 'إتمام', true, 130);

-- FORMS
INSERT INTO platform_texts (section, key, text_ar, text_en, description, editable, display_order) VALUES
('forms', 'required_field', 'هذا الحقل مطلوب', 'This field is required', 'مطلوب', true, 140),
('forms', 'invalid_email', 'البريد الإلكتروني غير صحيح', 'Invalid email address', 'بريد خاطئ', true, 141),
('forms', 'invalid_phone', 'رقم الهاتف غير صحيح', 'Invalid phone number', 'هاتف خاطئ', true, 142),
('forms', 'select_option', 'اختر من القائمة', 'Select an option', 'اختيار', true, 143);

-- FILTERS
INSERT INTO platform_texts (section, key, text_ar, text_en, description, editable, display_order) VALUES
('filters', 'all', 'الكل', 'All', 'الكل', true, 150),
('filters', 'filter_by', 'تصفية حسب', 'Filter by', 'تصفية', true, 151),
('filters', 'sort_by', 'ترتيب حسب', 'Sort by', 'ترتيب', true, 152),
('filters', 'price_low_high', 'السعر: الأقل للأعلى', 'Price: Low to High', 'سعر تصاعدي', true, 153),
('filters', 'price_high_low', 'السعر: الأعلى للأقل', 'Price: High to Low', 'سعر تنازلي', true, 154),
('filters', 'newest', 'الأحدث', 'Newest', 'أحدث', true, 155),
('filters', 'tree_type', 'نوع الشجرة', 'Tree Type', 'نوع', true, 156),
('filters', 'location', 'الموقع', 'Location', 'موقع', true, 157);

-- SEARCH
INSERT INTO platform_texts (section, key, text_ar, text_en, description, editable, display_order) VALUES
('search', 'placeholder', 'ابحث عن مزرعة...', 'Search for a farm...', 'بحث', true, 160),
('search', 'no_results', 'لم يتم العثور على نتائج', 'No results found', 'لا نتائج', true, 161),
('search', 'searching', 'جاري البحث...', 'Searching...', 'يبحث', true, 162);

-- ERRORS
INSERT INTO platform_texts (section, key, text_ar, text_en, description, editable, display_order) VALUES
('errors', 'network_error', 'خطأ في الاتصال', 'Network error', 'شبكة', true, 170),
('errors', 'server_error', 'خطأ في الخادم', 'Server error', 'خادم', true, 171),
('errors', 'not_found', 'غير موجود', 'Not found', 'غير موجود', true, 172),
('errors', 'unauthorized', 'غير مصرح', 'Unauthorized', 'غير مصرح', true, 173);

-- SUCCESS
INSERT INTO platform_texts (section, key, text_ar, text_en, description, editable, display_order) VALUES
('success', 'booking_completed', 'تم الحجز بنجاح', 'Booking completed successfully', 'حجز', true, 180),
('success', 'payment_received', 'تم استلام الدفعة', 'Payment received', 'دفع', true, 181),
('success', 'data_saved', 'تم الحفظ بنجاح', 'Saved successfully', 'حفظ', true, 182);

-- SEO
INSERT INTO platform_texts (section, key, text_ar, text_en, description, editable, display_order) VALUES
('seo', 'meta_title', 'منصة مزاد - استثمر في أشجار النخيل والزيتون', 'Mazad Platform - Invest in Palm and Olive Trees', 'عنوان', true, 190),
('seo', 'meta_description', 'منصة استثمارية رائدة لتملك أشجار النخيل والزيتون وتحقيق عوائد سنوية مستدامة', 'Leading investment platform for owning palm and olive trees', 'وصف', true, 191);
