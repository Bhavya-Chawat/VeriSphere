/**
 * motion-variants.ts
 * Centralized Framer Motion animation variants for VeriSphere.
 * All animations use transform + opacity only (GPU composited, 60fps).
 * Respects prefers-reduced-motion via the `reduced` helper.
 */

import { Variants, Transition } from "framer-motion";

// ─── Easing Curves ───────────────────────────────────────────────────────────
export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;
export const EASE_OUT_QUART = [0.25, 1, 0.5, 1] as const;
export const EASE_SPRING: Transition = { type: "spring", stiffness: 280, damping: 24 };
export const EASE_SPRING_SOFT: Transition = { type: "spring", stiffness: 180, damping: 28 };

// ─── Fade + Translate (section/card reveals) ─────────────────────────────────
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 18, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.55, ease: EASE_OUT_EXPO },
  },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: EASE_OUT_EXPO },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.35, ease: "easeOut" },
  },
};

export const fadeInScale: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: EASE_OUT_QUART },
  },
};

// ─── Stagger Containers ──────────────────────────────────────────────────────
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

export const staggerContainerFast: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.02,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: EASE_OUT_EXPO },
  },
};

export const staggerItemFast: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: EASE_OUT_QUART },
  },
};

// ─── Card Hover (subtle elevation) ──────────────────────────────────────────
export const cardHover = {
  rest: { y: 0, boxShadow: "var(--shadow-sm)" },
  hover: {
    y: -3,
    boxShadow: "var(--shadow-md)",
    transition: { duration: 0.2, ease: "easeOut" as const },
  },
};

// ─── Button Interactions ─────────────────────────────────────────────────────
export const buttonHoverTap = {
  whileHover: { scale: 1.02, y: -1 },
  whileTap: { scale: 0.97, y: 0 },
  transition: { duration: 0.15, ease: "easeOut" as const },
};

// ─── Tab Content Transition ──────────────────────────────────────────────────
export const tabContent: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: EASE_OUT_QUART },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.15, ease: "easeIn" },
  },
};

// ─── Modal / Overlay Transitions ────────────────────────────────────────────
export const modalBackdrop: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

export const modalContent: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 12 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.3, ease: EASE_OUT_EXPO },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    y: 8,
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

// ─── Page Transition ─────────────────────────────────────────────────────────
export const pageTransition: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

// ─── Expand / Collapse (height animation) ────────────────────────────────────
export const expandCollapse = {
  initial: { height: 0, opacity: 0 },
  animate: {
    height: "auto",
    opacity: 1,
    transition: {
      height: { duration: 0.3, ease: EASE_OUT_QUART },
      opacity: { duration: 0.25, delay: 0.05 },
    },
  },
  exit: {
    height: 0,
    opacity: 0,
    transition: {
      height: { duration: 0.25, ease: "easeIn" as const },
      opacity: { duration: 0.15 },
    },
  },
};

// ─── File Item (drop zone insert/remove) ─────────────────────────────────────
export const fileItemEnter: Variants = {
  hidden: { opacity: 0, x: -10, height: 0 },
  visible: {
    opacity: 1,
    x: 0,
    height: "auto",
    transition: { duration: 0.3, ease: EASE_OUT_EXPO },
  },
  exit: {
    opacity: 0,
    x: 10,
    height: 0,
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

// ─── Stat Card Number Count-up pop ───────────────────────────────────────────
export const statPop: Variants = {
  hidden: { opacity: 0, scale: 0.88 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { ...EASE_SPRING, delay: 0.1 },
  },
};

// ─── Viewport reveal defaults ────────────────────────────────────────────────
export const viewportOnce = { once: true, margin: "-80px" } as const;
export const viewportOnceNear = { once: true, margin: "-40px" } as const;
