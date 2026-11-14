"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { ContentRepository } from "@/lib/ContentRepository";
import { ASSISTANT_MOTION, ASSISTANT_TIMING } from "@/config/assistant";
import type { RobotPose } from "@/types/content";

interface AssistantRobotProps {
  pose: RobotPose;
  // El robot flotante se mueve; el del encabezado del chat solo cambia de pose
  animated?: boolean;
  className?: string;
}

const POSES = Object.keys(ContentRepository.assistant().images) as RobotPose[];
// Mismo tamaño en ambos robots para que el navegador descargue cada pose una sola vez
const IMAGE_SIZES = "96px";

export function AssistantRobot({ pose, animated = false, className = "" }: AssistantRobotProps) {
  const images = ContentRepository.assistant().images;
  const reduceMotion = useReducedMotion();
  const live = animated && !reduceMotion;
  const ref = useRef<HTMLDivElement>(null);

  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const rotateX = useSpring(tiltX, ASSISTANT_MOTION.tiltSpring);
  const rotateY = useSpring(tiltY, ASSISTANT_MOTION.tiltSpring);

  // Se inclina en 3D hacia donde está el mouse (solo con mouse, no en pantallas táctiles)
  useEffect(() => {
    if (!live) {
      tiltX.set(0);
      tiltY.set(0);
      return;
    }
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const dx = (event.clientX - (rect.left + rect.width / 2)) / window.innerWidth;
      const dy = (event.clientY - (rect.top + rect.height / 2)) / window.innerHeight;
      tiltY.set(dx * ASSISTANT_MOTION.tiltDeg);
      tiltX.set(-dy * ASSISTANT_MOTION.tiltDeg);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [live, tiltX, tiltY]);

  const loop = (duration: number) => ({ duration, repeat: Infinity, ease: "easeInOut" as const });

  return (
    <motion.div ref={ref} style={{ rotateX, rotateY, transformPerspective: 600 }} className={`relative aspect-[466/494] ${className}`}>
      <motion.div
        className="absolute inset-0"
        animate={live ? { y: [0, -ASSISTANT_MOTION.floatOffsetPx, 0] } : { y: 0 }}
        transition={live ? loop(ASSISTANT_TIMING.floatDurationS) : undefined}
      >
        <motion.div
          className="absolute inset-0 origin-bottom"
          animate={live ? { rotate: [-ASSISTANT_MOTION.swayDeg, ASSISTANT_MOTION.swayDeg, -ASSISTANT_MOTION.swayDeg] } : { rotate: 0 }}
          transition={live ? loop(ASSISTANT_TIMING.swayDurationS) : undefined}
        >
          {/* Brillo del remolino de la base */}
          <motion.span
            aria-hidden="true"
            className="assistant-glow absolute bottom-[1%] left-[33%] h-[18%] w-[34%] rounded-full"
            initial={{ opacity: ASSISTANT_MOTION.glowOpacity[0] }}
            animate={live ? { opacity: [...ASSISTANT_MOTION.glowOpacity], scale: [...ASSISTANT_MOTION.glowScale] } : { opacity: ASSISTANT_MOTION.glowOpacity[0] }}
            transition={live ? { ...loop(ASSISTANT_TIMING.glowDurationS), repeatType: "mirror" } : undefined}
          />
          {/* Las 6 poses quedan montadas y precargadas; solo cambia la opacidad (fundido cruzado) */}
          {POSES.map((name) => (
            <Image
              key={name}
              src={images[name]}
              alt=""
              fill
              sizes={IMAGE_SIZES}
              loading="eager"
              draggable={false}
              className="object-contain transition-opacity ease-in-out select-none"
              style={{ opacity: name === pose ? 1 : 0, transitionDuration: `${ASSISTANT_TIMING.poseFadeMs}ms` }}
            />
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
