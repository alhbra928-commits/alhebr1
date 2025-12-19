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
      <div
        className="fc-header"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 2147483647,
          pointerEvents: "auto",
        }}
      >
        <div style={{ fontSize: 12, padding: 6, background: '#ffd', textAlign: 'center', fontWeight: 'bold' }}>
          [PORTAL HEADER]
        </div>
        {header}
        <div style={{ height: 4, background: "red" }} />
      </div>

      <div
        className="fc-footer"
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 2147483647,
          pointerEvents: "auto",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <div style={{ height: 4, background: "blue" }} />
        {footer}
        <div style={{ fontSize: 12, padding: 6, background: '#dfd', textAlign: 'center', fontWeight: 'bold' }}>
          [PORTAL FOOTER]
        </div>
      </div>
    </>,
    mount
  );
}
