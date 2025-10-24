/*
  # إضافة Indexes لتحسين الأداء
  
  ## الهدف
  تحسين سرعة تحميل الصفحات من 30 ثانية إلى أقل من 3 ثوان
  
  ## Indexes المضافة
  
  ### 1. farms table
  - `farm_barcode` - للبحث السريع بالباركود
  - `farm_code` - للبحث السريع بالكود
  - `status` - لتصفية المزارع النشطة
  - `deleted_at` - لاستبعاد المحذوفات
  - `city` - للبحث حسب المدينة
  - `tree_type` - لتصنيف المزارع
  - `created_at` - للترتيب
  
  ### 2. farm_tree_varieties table
  - `farm_id` - للربط مع المزارع (الأهم!)
  - `deleted_at` - لاستبعاد المحذوفات
  - `available_quantity` - للتصفية حسب التوفر
  
  ### 3. reservations table
  - `farm_id` - للربط مع المزارع
  - `customer_phone` - للبحث بالجوال
  - `status` - لتصفية الحجوزات
  - `payment_status` - لتصفية حسب الدفع
  - `deleted_at` - لاستبعاد المحذوفات
  
  ### 4. booking_items table
  - `reservation_id` - للربط مع الحجوزات
  - `variety_id` - للربط مع الأصناف
  
  ### 5. investors table
  - `phone` - للبحث السريع بالجوال
  - `deleted_at` - لاستبعاد المحذوفات
  
  ## ملاحظات أمان
  - جميع الـ indexes تُنشأ بـ IF NOT EXISTS
  - لا تأثير على البيانات الموجودة
  - تحسين القراءة فقط
  - لا توجد عمليات حذف أو تعديل
*/

-- Farms table indexes
CREATE INDEX IF NOT EXISTS idx_farms_barcode ON farms(farm_barcode) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_farms_code ON farms(farm_code) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_farms_status ON farms(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_farms_deleted_at ON farms(deleted_at);
CREATE INDEX IF NOT EXISTS idx_farms_city ON farms(city) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_farms_tree_type ON farms(tree_type) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_farms_created_at ON farms(created_at DESC) WHERE deleted_at IS NULL;

-- Farm tree varieties indexes (الأهم للأداء!)
CREATE INDEX IF NOT EXISTS idx_farm_varieties_farm_id ON farm_tree_varieties(farm_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_farm_varieties_deleted_at ON farm_tree_varieties(deleted_at);
CREATE INDEX IF NOT EXISTS idx_farm_varieties_available ON farm_tree_varieties(available_quantity) WHERE deleted_at IS NULL AND available_quantity > 0;
CREATE INDEX IF NOT EXISTS idx_farm_varieties_farm_available ON farm_tree_varieties(farm_id, available_quantity) WHERE deleted_at IS NULL;

-- Reservations table indexes
CREATE INDEX IF NOT EXISTS idx_reservations_farm_id ON reservations(farm_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_reservations_phone ON reservations(customer_phone) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_reservations_payment_status ON reservations(payment_status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_reservations_deleted_at ON reservations(deleted_at);
CREATE INDEX IF NOT EXISTS idx_reservations_created_at ON reservations(created_at DESC) WHERE deleted_at IS NULL;

-- Booking items indexes
CREATE INDEX IF NOT EXISTS idx_booking_items_reservation_id ON booking_items(reservation_id);
CREATE INDEX IF NOT EXISTS idx_booking_items_variety_id ON booking_items(variety_id);

-- Investors table indexes
CREATE INDEX IF NOT EXISTS idx_investors_phone ON investors(phone) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_investors_deleted_at ON investors(deleted_at);
CREATE INDEX IF NOT EXISTS idx_investors_status ON investors(status) WHERE deleted_at IS NULL;

-- Composite indexes لتحسين الاستعلامات المعقدة
CREATE INDEX IF NOT EXISTS idx_farms_status_city ON farms(status, city) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_reservations_farm_status ON reservations(farm_id, status) WHERE deleted_at IS NULL;
