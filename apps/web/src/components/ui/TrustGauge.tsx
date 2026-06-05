"use client";

import { motion } from "framer-motion";
import { useCountUp } from "@/hooks/useCountUp";

export function TrustGauge({ score, showSubtext = true }: { score: number, showSubtext?: boolean }) {
  const { count: animatedScore, ref } = useCountUp(score, 1.5);
  
  const radius = 80;
  const circumference = Math.PI * radius;
  const dashoffset = circumference - (score / 100) * circumference;

  let color = "var(--verified)";
  let label = "HIGH CONFIDENCE";
  let labelColor = "var(--verified)";
  let badgeBg = "var(--verified-bg)";
  if (score < 50) {
    color = "var(--danger)";
    label = "LOW CONFIDENCE";
    labelColor = "var(--danger)";
    badgeBg = "var(--danger-bg)";
  } else if (score < 80) {
    color = "var(--warning)";
    label = "MODERATE CONFIDENCE";
    labelColor = "var(--warning)";
    badgeBg = "var(--warning-bg)";
  }

  return (
    <div className="flex flex-col items-center justify-center relative" ref={ref as React.RefObject<HTMLDivElement>}>
      <div className="relative w-[200px] h-[110px] overflow-hidden">
        <svg className="w-full h-[200px]" viewBox="0 0 200 200">
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="var(--bg-muted)"
            strokeWidth="16"
            strokeLinecap="round"
          />
          <motion.path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke={color}
            strokeWidth="16"
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: dashoffset }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            strokeDasharray={circumference}
          />
        </svg>
        <div className="absolute bottom-0 left-0 right-0 flex justify-center pb-2">
          <span className="font-mono text-6xl font-bold" style={{ color: "var(--brand-navy)" }}>
            {animatedScore}
          </span>
        </div>
      </div>
      <motion.div 
        className="mt-4 px-3 py-1 rounded-full text-xs font-bold tracking-wider"
        style={{ backgroundColor: badgeBg, color: labelColor }}
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8, duration: 0.3, type: "spring", stiffness: 200 }}
      >
        {label}
      </motion.div>
      {showSubtext && (
        <motion.div
          className="text-[13px] text-[var(--text-tertiary)] mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.4 }}
        >
          Based on 3-layer verification
        </motion.div>
      )}
    </div>
  );
}
