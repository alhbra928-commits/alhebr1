/**
 * iOS Viewport Lock - قفل نهائي لمنع قفز الهيدر والفوتر
 *
 * يقرأ الارتفاع الحقيقي من visualViewport ويثبته في CSS variable
 * مما يمنع القفز عند ظهور/إخفاء شريط Safari
 *
 * يتضمن لوحة تشخيص مباشرة لمراقبة القيم في الوقت الفعلي
 */

export function lockIOSViewport() {
  const vv = window.visualViewport;

  const update = () => {
    const height = vv?.height ?? window.innerHeight;
    // نثبت ارتفاع التطبيق على ارتفاع الـ visual viewport الحقيقي
    document.documentElement.style.setProperty("--app-vh", `${height}px`);

    // أيضاً نثبت العرض للتأكد
    const width = vv?.width ?? window.innerWidth;
    document.documentElement.style.setProperty("--app-vw", `${width}px`);

    // Debug badge - لوحة تشخيص مباشرة
    let el = document.getElementById("vv-debug") as HTMLDivElement | null;
    if (!el) {
      el = document.createElement("div");
      el.id = "vv-debug";
      el.style.cssText =
        "position:fixed;left:8px;bottom:8px;z-index:2147483647;" +
        "background:rgba(0,0,0,.75);color:#fff;padding:6px 8px;" +
        "font:12px/1.2 system-ui;border-radius:8px;pointer-events:none";
      document.body.appendChild(el);
    }

    const appShell = document.querySelector(".appShell") as HTMLElement | null;
    const computedVh = getComputedStyle(document.documentElement).getPropertyValue("--app-vh").trim();
    const shellHeight = appShell?.getBoundingClientRect().height;

    el.textContent =
      `vv.height=${Math.round(vv?.height ?? 0)} ` +
      `innerH=${window.innerHeight} ` +
      `--app-vh=${computedVh} ` +
      `shellH=${shellHeight ? Math.round(shellHeight) : "?"}`;
  };

  // تحديث فوري عند التحميل
  update();

  // الاستماع لجميع التغييرات في iOS
  if (vv) {
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update); // مهم في iOS لأن شريط المتصفح يتغير مع السحب
  }

  window.addEventListener("resize", update);
  window.addEventListener("orientationchange", update);

  // تحديث إضافي بعد قليل للتأكد
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
