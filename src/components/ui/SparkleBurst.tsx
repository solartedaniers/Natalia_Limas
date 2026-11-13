"use client";
import { useCallback, useRef, useState, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "framer-motion";
import { SPARKLES } from "@/config/effects";

interface Burst {
  id: number;
  x: number;
  y: number;
}

const FULL_TURN = Math.PI * 2;

export function useSparkles() {
  const reduceMotion = useReducedMotion();
  const nextId = useRef(0);
  const [bursts, setBursts] = useState<Burst[]>([]);

  const trigger = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      if (reduceMotion) return;
      let x = event.clientX;
      let y = event.clientY;
      // Con teclado no hay coordenadas del clic: el destello sale del centro del botón
      if (event.detail === 0) {
        const rect = event.currentTarget.getBoundingClientRect();
        x = rect.left + rect.width / 2;
        y = rect.top + rect.height / 2;
      }
      const id = nextId.current++;
      setBursts((current) => [...current, { id, x, y }]);
      window.setTimeout(() => setBursts((current) => current.filter((burst) => burst.id !== id)), SPARKLES.durationMs);
    },
    [reduceMotion],
  );

  return { bursts, trigger };
}

// Se pinta en body para que ningún contenedor del encabezado recorte las chispas
export function SparkleBurst({ bursts }: { bursts: Burst[] }) {
  if (bursts.length === 0) return null;

  return createPortal(
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[60]">
      {bursts.map((burst) =>
        Array.from({ length: SPARKLES.count }, (_, index) => {
          const angle = (index / SPARKLES.count) * FULL_TURN;
          return (
            <motion.span
              key={`${burst.id}-${index}`}
              className="sparkle absolute"
              style={{
                left: burst.x - SPARKLES.sizePx / 2,
                top: burst.y - SPARKLES.sizePx / 2,
                width: SPARKLES.sizePx,
                height: SPARKLES.sizePx,
                background: SPARKLES.colors[index % SPARKLES.colors.length],
              }}
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{
                x: Math.cos(angle) * SPARKLES.distancePx,
                y: Math.sin(angle) * SPARKLES.distancePx,
                opacity: 0,
                scale: 0,
              }}
              transition={{ duration: SPARKLES.durationMs / 1000, ease: "easeOut" }}
            />
          );
        }),
      )}
    </div>,
    document.body,
  );
}
