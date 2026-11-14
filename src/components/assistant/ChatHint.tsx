"use client";
import { motion, useReducedMotion } from "framer-motion";
import { ASSISTANT_HINT } from "@/config/assistant";

const DOT_COLORS = ["var(--assistant-dot-lilac)", "var(--assistant-dot-navy)", "var(--assistant-dot-lilac)"];

// Globito decorativo arriba a la izquierda de la cabeza del robot, con la colita hacia él.
// Va dentro del botón del robot: el clic abre el chat y el aria-label ya lo da el botón
export function ChatHint() {
  const reduceMotion = useReducedMotion();
  const hint = ASSISTANT_HINT;

  return (
    <motion.span
      aria-hidden="true"
      initial={{ opacity: 0, scale: 0.6 }}
      // La entrada espera un momento; la salida es inmediata para no cruzarse con el chat o la burbuja
      animate={{ opacity: 1, scale: 1, transition: { duration: hint.enterDurationS, delay: hint.enterDelayS, ease: [0.22, 1, 0.36, 1] } }}
      exit={{ opacity: 0, scale: 0.6, transition: { duration: hint.exitDurationS } }}
      style={{ width: `${hint.widthPct}%`, height: `${hint.heightPct}%`, left: `${hint.leftPct}%`, top: `${hint.topPct}%` }}
      className="absolute z-10 flex origin-bottom-right items-center justify-center rounded-full rounded-br-md border border-line bg-card shadow-[0_6px_14px_var(--shadow)]"
    >
      {/* Colita que apunta hacia la cabeza del robot */}
      <span className="absolute right-[6%] -bottom-[18%] aspect-square w-[16%] rotate-45 border-r border-b border-line bg-card" />
      <span className="relative flex w-full items-center justify-center gap-[9%]">
        {DOT_COLORS.map((color, index) => (
          <motion.span
            key={index}
            className="aspect-square rounded-full"
            style={{ width: `${hint.dotSizePct}%`, background: color }}
            animate={reduceMotion ? { y: "0%", opacity: 1 } : { y: ["0%", `-${hint.dotLiftPct}%`, "0%"], opacity: [0.45, 1, 0.45] }}
            transition={reduceMotion ? undefined : { duration: hint.dotDurationS, repeat: Infinity, delay: index * hint.dotStaggerS, ease: "easeInOut" }}
          />
        ))}
      </span>
    </motion.span>
  );
}
