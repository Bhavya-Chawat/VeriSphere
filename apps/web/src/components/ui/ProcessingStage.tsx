"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

const stageDetails: Record<string, string> = {
  "Parsing resume claims": "Extracting skills, experience, and education...",
  "Fetching GitHub repositories": "Scanning public repositories and commit history...",
  "Cross-referencing skill evidence": "Matching claims against code evidence...",
  "Validating certificate metadata": "Running PDF forensic signature analysis...",
  "Generating trust report": "Synthesizing evidence into final trust score...",
};

export function ProcessingStage({ label, delay, isActive, onComplete }: { label: string, delay: number, isActive: boolean, onComplete: () => void }) {
  const [status, setStatus] = useState<'pending' | 'active' | 'complete'>('pending');

  useEffect(() => {
    if (!isActive) return;
    
    const timer = setTimeout(() => {
      setStatus('active');
      const activeTimer = setTimeout(() => {
        setStatus('complete');
        onComplete();
      }, 1500);
      return () => clearTimeout(activeTimer);
    }, delay);

    return () => clearTimeout(timer);
  }, [isActive, delay, onComplete]);

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* Active left border — slides in */}
      <AnimatePresence>
        {status === 'active' && (
          <motion.div
            className="absolute left-0 top-0 bottom-0 w-[3px] bg-[var(--brand-blue)] rounded-full origin-bottom"
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: 1, opacity: 1 }}
            exit={{ scaleY: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          />
        )}
        {status === 'complete' && (
          <motion.div
            className="absolute left-0 top-0 bottom-0 w-[3px] bg-[var(--verified)] rounded-full"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>

      <div className={`flex items-start gap-4 p-3 rounded-lg ml-[3px] transition-colors duration-300 ${
        status === 'active' ? 'bg-[var(--brand-blue-light)]' : ''
      }`}>
        {/* Status icon */}
        <div className="w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
          <AnimatePresence mode="wait">
            {status === 'pending' && (
              <motion.div
                key="pending"
                animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                className="w-2.5 h-2.5 rounded-full bg-[var(--bg-muted)]"
              />
            )}
            {status === 'active' && (
              <motion.div
                key="active"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <motion.circle
                    cx="9" cy="9" r="7"
                    stroke="var(--brand-blue)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray="44"
                    animate={{ strokeDashoffset: [44, 0, -44] }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
                  />
                </svg>
              </motion.div>
            )}
            {status === 'complete' && (
              <motion.div
                key="complete"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 280, damping: 18 }}
              >
                <div className="w-5 h-5 rounded-full bg-[var(--verified)] flex items-center justify-center text-white">
                  <Check size={11} strokeWidth={3} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Label + detail */}
        <div className="flex flex-col min-w-0 flex-1">
          <span className={`text-sm font-medium transition-colors duration-300 ${
            status === 'active' ? 'text-[var(--brand-blue)]' : 
            status === 'complete' ? 'text-[var(--text-primary)]' : 
            'text-[var(--text-tertiary)]'
          }`}>
            {label}
          </span>
          <AnimatePresence>
            {status === 'active' && (
              <motion.span
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="text-[11px] text-[var(--brand-blue)] opacity-70 mt-0.5 font-mono"
              >
                {stageDetails[label] ?? "Processing..."}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Elapsed shimmer badge on complete */}
        <AnimatePresence>
          {status === 'complete' && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.2 }}
              className="text-[10px] font-mono text-[var(--verified)] bg-[var(--verified-bg)] px-2 py-0.5 rounded-full shrink-0 border border-[var(--verified)]/10"
            >
              done
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
