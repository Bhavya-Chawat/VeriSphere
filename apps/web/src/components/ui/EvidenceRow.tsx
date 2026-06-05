"use client";

import { Check, AlertTriangle, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { staggerItem } from "@/lib/motion-variants";

export function EvidenceRow({ claim, source, status, href }: { claim: string, source: string, status: 'VERIFIED' | 'UNVERIFIED', href?: string }) {
  const isVerified = status === 'VERIFIED';
  
  return (
    <motion.div
      variants={staggerItem}
      whileHover={{ backgroundColor: "var(--bg-subtle)", x: 2 }}
      transition={{ duration: 0.15 }}
      className="flex items-center justify-between py-4 border-b border-[var(--border)] last:border-0 px-2 -mx-2 rounded-lg"
    >
      <div className="flex items-center gap-4 flex-1">
        <div className="w-1/3">
          <span className="font-semibold text-sm text-[var(--text-primary)]">{claim}</span>
        </div>
        <div className="text-[var(--text-tertiary)] mx-2">→</div>
        <div className="flex-1 flex items-center gap-2">
          <span className="text-sm text-[var(--text-secondary)]">{source}</span>
          {href && (
            <motion.a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ color: "var(--brand-blue)", scale: 1.1 }}
              className="text-[var(--text-tertiary)] transition-colors"
            >
              <ExternalLink size={14} />
            </motion.a>
          )}
        </div>
      </div>
      <div className="ml-4">
        <motion.span
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 250, damping: 20, delay: 0.05 }}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold tracking-wider ${
            isVerified 
              ? "bg-[var(--verified-bg)] text-[var(--verified)]"
              : "bg-[var(--warning-bg)] text-[var(--warning)]"
          }`}
        >
          {isVerified 
            ? <Check size={12} strokeWidth={3} /> 
            : <AlertTriangle size={12} strokeWidth={3} />
          } {status}
        </motion.span>
      </div>
    </motion.div>
  );
}
