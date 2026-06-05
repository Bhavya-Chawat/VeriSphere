"use client";

import { CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export function SkillPill({ name, status }: { name: string, status: 'verified' | 'unverified' }) {
  const isVerified = status === 'verified';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.06, y: -1 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border cursor-default ${
        isVerified
          ? 'bg-[var(--verified-bg)] text-[var(--verified)] border-[var(--verified)]/20'
          : 'bg-[var(--warning-bg)] text-[var(--warning)] border-[var(--warning)]/20'
      }`}
    >
      <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 380, damping: 18, delay: 0.05 }}
      >
        {isVerified 
          ? <CheckCircle2 size={11} strokeWidth={2.5} />
          : <AlertCircle size={11} strokeWidth={2.5} />
        }
      </motion.span>
      {name}
    </motion.div>
  );
}
