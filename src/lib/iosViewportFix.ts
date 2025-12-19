export function applyIOSViewportFix() {
  const vv = window.visualViewport;

  const setVars = () => {
    const h = vv ? vv.height : window.innerHeight;
    const top = vv?.offsetTop ?? 0;

    document.documentElement.style.setProperty("--vvh", `${h}px`);
    document.documentElement.style.setProperty("--vvtop", `${top}px`);

    console.log('[iOS Viewport Fix]', {
      height: h,
      offsetTop: top,
      pageTop: vv?.pageTop ?? 0,
      pageLeft: vv?.pageLeft ?? 0,
      scale: vv?.scale ?? 1
    });
  };

  setVars();

  if (vv) {
    vv.addEventListener("resize", setVars);
    vv.addEventListener("scroll", setVars);
  }

  window.addEventListener("orientationchange", setVars);

  window.addEventListener("resize", setVars);

  console.log('[iOS Viewport Fix] Initialized ✓');
}
