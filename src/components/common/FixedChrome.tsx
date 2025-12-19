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
      <div className="fc-header">{header}</div>
      <div className="fc-footer">{footer}</div>
    </>,
    mount
  );
}
