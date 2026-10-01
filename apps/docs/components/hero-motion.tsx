"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

const easeOut = [0.23, 1, 0.32, 1] as const;

const floatOrbs = [
  {
    className:
      "absolute -left-24 top-[-10%] size-[28rem] rounded-full bg-[radial-gradient(circle,rgb(243_128_32_/_0.22),transparent_65%)] blur-2xl",
    keyframes: [
      "translate3d(0px, 0px, 0) scale(1)",
      "translate3d(48px, 36px, 0) scale(1.08)",
      "translate3d(-24px, 20px, 0) scale(0.96)",
      "translate3d(0px, 0px, 0) scale(1)",
    ],
    duration: 18,
  },
  {
    className:
      "absolute -right-16 top-1/4 size-[22rem] rounded-full bg-[radial-gradient(circle,rgb(243_128_32_/_0.16),transparent_65%)] blur-2xl",
    keyframes: [
      "translate3d(0px, 0px, 0) scale(1)",
      "translate3d(-40px, -28px, 0) scale(1.1)",
      "translate3d(20px, 32px, 0) scale(0.94)",
      "translate3d(0px, 0px, 0) scale(1)",
    ],
    duration: 22,
  },
  {
    className:
      "absolute bottom-[-20%] left-[20%] size-[26rem] rounded-full bg-[radial-gradient(circle,rgb(243_128_32_/_0.1),transparent_70%)] blur-3xl",
    keyframes: [
      "translate3d(0px, 0px, 0) scale(1)",
      "translate3d(36px, -40px, 0) scale(1.06)",
      "translate3d(-24px, 16px, 0) scale(0.98)",
      "translate3d(0px, 0px, 0) scale(1)",
    ],
    duration: 26,
  },
  {
    className:
      "absolute right-[18%] top-[8%] size-[14rem] rounded-full bg-[radial-gradient(circle,rgb(243_128_32_/_0.12),transparent_70%)] blur-xl",
    keyframes: [
      "translate3d(0px, 0px, 0) scale(1)",
      "translate3d(-28px, 24px, 0) scale(1.12)",
      "translate3d(16px, -12px, 0) scale(0.92)",
      "translate3d(0px, 0px, 0) scale(1)",
    ],
    duration: 14,
  },
] as const;

const sparks = [
  { left: "12%", top: "28%", size: 3, delay: 0, duration: 4.2 },
  { left: "22%", top: "62%", size: 2, delay: 0.8, duration: 5.1 },
  { left: "38%", top: "18%", size: 2.5, delay: 1.4, duration: 3.8 },
  { left: "58%", top: "34%", size: 2, delay: 0.3, duration: 4.6 },
  { left: "72%", top: "22%", size: 3, delay: 1.1, duration: 5.4 },
  { left: "84%", top: "48%", size: 2, delay: 1.8, duration: 3.6 },
  { left: "68%", top: "68%", size: 2.5, delay: 0.5, duration: 4.9 },
  { left: "46%", top: "72%", size: 2, delay: 2.1, duration: 5.2 },
] as const;

/** Soft ambient field behind the hero - transform/opacity only, gated for reduced motion. */
export function HeroBackdrop() {
  const reduce = useReducedMotion();

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* Static base wash - always present */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(243,128,32,0.14),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgb(243_128_32_/_0.06),transparent_55%)]" />

      {/* Soft grid that fades in */}
      <motion.div
        className="absolute inset-0 [background-image:linear-gradient(to_right,rgb(243_128_32_/_0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgb(243_128_32_/_0.08)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)]"
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 0.35 }}
        transition={{ duration: 0.8, ease: easeOut }}
      />

      {/* Finer secondary grid */}
      <motion.div
        className="absolute inset-0 [background-image:linear-gradient(to_right,rgb(243_128_32_/_0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgb(243_128_32_/_0.05)_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_at_center,black_10%,transparent_65%)]"
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 0.45 }}
        transition={{ duration: 1, delay: 0.15, ease: easeOut }}
      />

      {/* Horizon glow line */}
      <div className="absolute inset-x-0 top-[72%] h-px bg-gradient-to-r from-transparent via-[rgb(243_128_32_/_0.35)] to-transparent opacity-70" />
      <div className="absolute inset-x-[18%] top-[72%] h-24 -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,rgb(243_128_32_/_0.12),transparent_70%)] blur-md" />

      {!reduce ? (
        <>
          {/* Drifting brand orbs */}
          {floatOrbs.map((orb) => (
            <motion.div
              key={orb.duration}
              className={orb.className}
              animate={{ transform: [...orb.keyframes] }}
              transition={{ duration: orb.duration, ease: "linear", repeat: Infinity }}
            />
          ))}

          {/* Slow-drifting fine grid for depth */}
          <motion.div
            className="absolute -inset-[10%] opacity-40 [background-image:linear-gradient(to_right,rgb(243_128_32_/_0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgb(243_128_32_/_0.06)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_at_top,black_15%,transparent_75%)]"
            animate={{
              transform: [
                "translate3d(0px, 0px, 0)",
                "translate3d(-24px, 16px, 0)",
                "translate3d(0px, 0px, 0)",
              ],
            }}
            transition={{ duration: 28, ease: "linear", repeat: Infinity }}
          />

          {/* Diagonal light beams */}
          <motion.div
            className="absolute left-1/2 top-[-30%] h-[140%] w-[38%] bg-gradient-to-b from-[rgb(243_128_32_/_0.1)] via-[rgb(243_128_32_/_0.03)] to-transparent blur-2xl"
            animate={{
              opacity: [0.35, 0.7, 0.35],
              transform: [
                "translate3d(-50%, 0px, 0) rotate(12deg)",
                "translate3d(calc(-50% + 24px), 18px, 0) rotate(12deg)",
                "translate3d(-50%, 0px, 0) rotate(12deg)",
              ],
            }}
            transition={{ duration: 10, ease: [0.77, 0, 0.175, 1], repeat: Infinity }}
          />
          <motion.div
            className="absolute left-[30%] top-[-40%] h-[130%] w-[22%] bg-gradient-to-b from-[rgb(243_128_32_/_0.07)] via-transparent to-transparent blur-xl"
            animate={{
              opacity: [0.2, 0.5, 0.2],
              transform: [
                "translate3d(0px, 0px, 0) rotate(-6deg)",
                "translate3d(-18px, 24px, 0) rotate(-6deg)",
                "translate3d(0px, 0px, 0) rotate(-6deg)",
              ],
            }}
            transition={{ duration: 14, ease: [0.77, 0, 0.175, 1], repeat: Infinity }}
          />

          {/* Soft rotating rings */}
          <motion.div
            className="absolute left-1/2 top-[38%] size-[36rem] rounded-full border border-[rgb(243_128_32_/_0.12)] [mask-image:linear-gradient(to_bottom,black,transparent_80%)]"
            animate={{
              transform: [
                "translate3d(-50%, -50%, 0) rotate(0deg)",
                "translate3d(-50%, -50%, 0) rotate(360deg)",
              ],
              opacity: [0.25, 0.45, 0.25],
            }}
            transition={{
              transform: { duration: 60, ease: "linear", repeat: Infinity },
              opacity: { duration: 8, ease: [0.77, 0, 0.175, 1], repeat: Infinity },
            }}
          />
          <motion.div
            className="absolute left-1/2 top-[38%] size-[28rem] rounded-full border border-dashed border-[rgb(243_128_32_/_0.1)] [mask-image:linear-gradient(to_bottom,black,transparent_75%)]"
            animate={{
              transform: [
                "translate3d(-50%, -50%, 0) rotate(0deg)",
                "translate3d(-50%, -50%, 0) rotate(-360deg)",
              ],
            }}
            transition={{ duration: 80, ease: "linear", repeat: Infinity }}
          />

          {/* Twinkling sparks */}
          {sparks.map((spark) => (
            <motion.span
              key={`${spark.left}-${spark.top}`}
              className="absolute rounded-full bg-brand shadow-[0_0_8px_rgb(243_128_32_/_0.55)]"
              style={{
                left: spark.left,
                top: spark.top,
                width: spark.size,
                height: spark.size,
              }}
              animate={{
                opacity: [0.15, 0.9, 0.15],
                transform: [
                  "translate3d(0px, 0px, 0) scale(1)",
                  "translate3d(0px, -6px, 0) scale(1.35)",
                  "translate3d(0px, 0px, 0) scale(1)",
                ],
              }}
              transition={{
                duration: spark.duration,
                delay: spark.delay,
                ease: [0.77, 0, 0.175, 1],
                repeat: Infinity,
              }}
            />
          ))}
        </>
      ) : null}

      {/* Bottom vignette so content sections stay readable */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-fd-background to-transparent" />
    </div>
  );
}

/** One-shot entrance for hero content. Marketing tier - ease-out, short stagger. */
export function HeroReveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, transform: "translateY(12px)" }}
      animate={{ opacity: 1, transform: "translateY(0px)" }}
      transition={{ duration: 0.45, delay, ease: easeOut }}
    >
      {children}
    </motion.div>
  );
}
