"use client";

import { AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/motion-variants";

export function RiskFlagCard({ title, body, severity }: { title: string, body: string, severity: 'MEDIUM' | 'HIGH' }) {
  const isHigh = severity === 'HIGH';
  const colorVar = isHigh ? 'var(--danger)' : 'var(--warning)';
  const bgVar = isHigh ? 'var(--danger-bg)' : 'var(--warning-bg)';
  
  return (
    <motion.div 
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -2, boxShadow: "var(--shadow-md)" }}
      transition={{ duration: 0.2 }}
      className="rounded-xl p-5 mb-4 border-l-4"
      style={{ backgroundColor: bgVar, borderColor: colorVar }}
    >
      <div className="flex items-center gap-2 mb-2">
        <motion.span 
          className="px-2 py-0.5 rounded text-xs font-bold tracking-wider"
          style={{ backgroundColor: colorVar, color: 'white' }}
          animate={isHigh ? { opacity: [1, 0.65, 1] } : {}}
          transition={isHigh ? { duration: 2.5, repeat: Infinity, ease: "easeInOut" } : {}}
        >
          {severity}
        </motion.span>
        <AlertTriangle size={16} style={{ color: colorVar }} />
      </div>
      <h4 className="font-semibold text-[var(--text-primary)] mb-1">{title}</h4>
      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
        {body}
      </p>
    </motion.div>
  );
}
