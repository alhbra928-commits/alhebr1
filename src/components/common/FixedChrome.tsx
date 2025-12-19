import { useEffect, useMemo } from "react";
import { createPortal } from "react-dom";

type Props = {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  headerHeight?: number; // px
  footerHeight?: number; // px
};

export default function FixedChrome({
  header,
  footer,
  headerHeight = 72,
  footerHeight = 72,
}: Props) {
  const mount = useMemo(() => {
    const el = document.createElement("div");
    el.id = "fixed-chrome";
    return el;
  }, []);

  useEffect(() => {
    document.body.appendChild(mount);

    // reserve space so content doesn't go under fixed header/footer
    document.documentElement.style.setProperty("--header-h", `${headerHeight}px`);
    document.documentElement.style.setProperty("--footer-h", `${footerHeight}px`);

    return () => {
      mount.remove();
    };
  }, [mount, headerHeight, footerHeight]);

  return createPortal(
    <>
      {/* DEBUG: Red bar to verify Portal is mounted */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: 'red',
        zIndex: 2147483647,
        pointerEvents: 'none'
      }} />

      <div className="fc-header">{header}</div>
      <div className="fc-footer">{footer}</div>

      {/* DEBUG: Blue bar to verify Portal is mounted */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: 'blue',
        zIndex: 2147483647,
        pointerEvents: 'none'
      }} />
    </>,
    mount
  );
}
