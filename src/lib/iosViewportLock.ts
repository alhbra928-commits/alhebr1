/**
 * iOS Viewport Lock - قفل نهائي لمنع قفز الهيدر والفوتر
 *
 * يقرأ الارتفاع الحقيقي من visualViewport ويثبته في CSS variable
 * مما يمنع القفز عند ظهور/إخفاء شريط Safari
 *
 * CLEAN VERSION - بدون أي debug rectangles
 */

export function lockIOSViewport() {
  const vv = window.visualViewport;

  const update = () => {
    const height = vv?.height ?? window.innerHeight;
    document.documentElement.style.setProperty("--app-vh", `${height}px`);

    const width = vv?.width ?? window.innerWidth;
    document.documentElement.style.setProperty("--app-vw", `${width}px`);
  };

  // تحديث فوري
  update();

  // الاستماع لجميع التغييرات
  if (vv) {
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
  }

  window.addEventListener("resize", update);
  window.addEventListener("orientationchange", update);

  // تحديثات تأكيدية
  setTimeout(update, 100);
  setTimeout(update, 300);
  setTimeout(update, 500);
}

/**
 * تطبيق حماية إضافية ضد scroll bouncing في iOS
 */
export function preventIOSBounce() {
  // منع الـ bounce effect على مستوى الـ body
  document.body.style.overscrollBehavior = 'contain';

  // منع سحب الصفحة للخلف في Safari
  let startX = 0;
  let startY = 0;

  document.addEventListener('touchstart', (e) => {
    startX = e.touches[0].pageX;
    startY = e.touches[0].pageY;
  }, { passive: true });

  document.addEventListener('touchmove', (e) => {
    const diffX = Math.abs(e.touches[0].pageX - startX);
    const diffY = Math.abs(e.touches[0].pageY - startY);

    // إذا كان السحب أفقي أكثر من العمودي (محاولة رجوع)
    if (diffX > diffY && diffX > 10) {
      // لا نمنع السحب الأفقي داخل المحتوى
    }
  }, { passive: true });
}
