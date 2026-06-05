"use client";

import { motion } from "framer-motion";
import { useCountUp } from "@/hooks/useCountUp";

export function ScoreBar({ label, score, colorClass }: { label: string, score: number, colorClass: string }) {
  const { count: animatedScore, ref } = useCountUp(score, 1.2);

  return (
    <div className="flex flex-col gap-2 mb-4 w-full" ref={ref as React.RefObject<HTMLDivElement>}>
      <div className="flex justify-between items-end">
        <span className="text-sm font-medium text-[var(--text-secondary)]">{label}</span>
        <motion.span
          className="font-mono font-semibold text-sm text-[var(--text-primary)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {animatedScore}%
        </motion.span>
      </div>
      <div className="h-2 w-full bg-[var(--bg-muted)] rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${colorClass}`}
          initial={{ width: 0 }}
          whileInView={{ width: `${score}%` }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
}
