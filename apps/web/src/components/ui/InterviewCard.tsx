"use client";

import { useState } from "react";
import { CheckSquare, Square } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { staggerItem } from "@/lib/motion-variants";

export function InterviewCard({ question, hint, difficulty }: { question: string, hint: string, difficulty: 'EASY' | 'MEDIUM' | 'HARD' }) {
  const [checked, setChecked] = useState(false);
  
  let diffColor = "var(--verified)";
  let diffBg = "var(--verified-bg)";
  if (difficulty === "MEDIUM") {
    diffColor = "var(--warning)";
    diffBg = "var(--warning-bg)";
  } else if (difficulty === "HARD") {
    diffColor = "var(--danger)";
    diffBg = "var(--danger-bg)";
  }

  return (
    <motion.div
      variants={staggerItem}
      whileHover={!checked ? { y: -2, boxShadow: "var(--shadow-md)" } : {}}
      animate={{ opacity: checked ? 0.55 : 1 }}
      transition={{ duration: 0.2 }}
      className={`p-5 rounded-xl border transition-colors duration-200 ${
        checked ? 'bg-[var(--bg-subtle)] border-[var(--border)]' : 'bg-[var(--bg-surface)] border-[var(--border-strong)]'
      }`}
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <p className={`text-[15px] font-semibold leading-snug mb-2 transition-all duration-300 ${
            checked ? 'text-[var(--text-secondary)] line-through decoration-[var(--border-strong)]' : 'text-[var(--text-primary)]'
          }`}>
            {question}
          </p>
          <p className="text-xs text-[var(--text-secondary)]">
            <span className="font-bold text-[var(--text-tertiary)] mr-1">Why we ask:</span>
            {hint}
          </p>
        </div>
        <div className="flex flex-col items-end gap-3 shrink-0">
          <div 
            className="px-2.5 py-1 rounded text-[10px] font-bold tracking-wider"
            style={{ backgroundColor: diffBg, color: diffColor }}
          >
            {difficulty}
          </div>
          <motion.button 
            className="flex items-center gap-1.5 text-xs text-[var(--text-tertiary)] hover:text-[var(--brand-blue)] transition-colors"
            onClick={() => setChecked(!checked)}
            whileTap={{ scale: 0.92 }}
          >
            <AnimatePresence mode="wait">
              {checked ? (
                <motion.span
                  key="checked"
                  initial={{ scale: 0, rotate: -15 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0 }}
                  transition={{ type: "spring", stiffness: 320, damping: 20 }}
                  className="flex items-center gap-1.5 text-[var(--brand-blue)]"
                >
                  <CheckSquare size={16} className="text-[var(--brand-blue)]" /> Asked
                </motion.span>
              ) : (
                <motion.span
                  key="unchecked"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center gap-1.5"
                >
                  <Square size={16} /> Mark asked
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
