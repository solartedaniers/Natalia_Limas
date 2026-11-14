"use client";
import { useEffect, useState, type CSSProperties } from "react";
import { ASSISTANT_PANEL } from "@/config/assistant";

// En celular el chat es una hoja inferior: bloquea el scroll de la página de atrás
// y se acomoda sobre el teclado usando el visualViewport (Android e iOS)
export function useMobileSheet(open: boolean): CSSProperties | undefined {
  const [frame, setFrame] = useState<CSSProperties>();

  useEffect(() => {
    if (!open) return;
    const query = window.matchMedia(`(max-width: ${ASSISTANT_PANEL.mobileBreakpointPx - 1}px)`);
    const viewport = window.visualViewport;
    const root = document.documentElement;
    const previous = { html: root.style.overflow, body: document.body.style.overflow };

    const update = () => {
      const mobile = query.matches;
      root.style.overflow = mobile ? "hidden" : previous.html;
      document.body.style.overflow = mobile ? "hidden" : previous.body;
      if (!mobile || !viewport) {
        setFrame(undefined);
        return;
      }
      const keyboard = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
      const height = Math.min(window.innerHeight * ASSISTANT_PANEL.mobileHeightRatio, viewport.height - ASSISTANT_PANEL.mobileTopGapPx);
      setFrame({ bottom: keyboard, height });
    };

    update();
    viewport?.addEventListener("resize", update);
    viewport?.addEventListener("scroll", update);
    query.addEventListener("change", update);
    return () => {
      viewport?.removeEventListener("resize", update);
      viewport?.removeEventListener("scroll", update);
      query.removeEventListener("change", update);
      root.style.overflow = previous.html;
      document.body.style.overflow = previous.body;
    };
  }, [open]);

  return open ? frame : undefined;
}
