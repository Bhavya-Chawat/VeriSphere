"use client";

import { AlertTriangle, CheckCircle, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeInUp } from "@/lib/motion-variants";

export function CertificateCard({ title, issuer, isSuspicious, metadata, findings }: any) {
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -2, boxShadow: "var(--shadow-md)" }}
      transition={{ duration: 0.2 }}
      className="flex bg-[var(--bg-surface)] rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden mb-6"
    >
      {/* Certificate Preview Placeholder */}
      <div className="w-1/3 bg-[var(--bg-subtle)] border-r border-[var(--border)] p-6 flex flex-col items-center justify-center">
        <div className="w-full aspect-[1/1.4] bg-[var(--bg-surface)] shadow-sm border border-[var(--border-strong)] flex items-center justify-center relative p-4 text-center overflow-hidden">
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at center, var(--brand-navy) 0, transparent 100%)' }}></div>
          <div>
            <FileText size={48} className="mx-auto text-[var(--brand-navy)] opacity-20 mb-4" />
            <div className="font-serif text-lg font-bold text-[var(--brand-navy)]">{title}</div>
            <div className="text-xs text-[var(--text-tertiary)] mt-2 uppercase tracking-widest">{issuer}</div>
          </div>
        </div>
      </div>
      
      {/* Audit Data */}
      <div className="w-2/3 p-8 flex flex-col">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-1">{title}</h3>
            <p className="text-[var(--text-secondary)]">{issuer}</p>
          </div>
          {isSuspicious ? (
            <motion.div
              className="flex items-center gap-1.5 bg-[var(--danger-bg)] text-[var(--danger)] px-3 py-1.5 rounded-lg border border-[var(--danger)]/20 font-bold tracking-wide text-xs"
              animate={{ opacity: [1, 0.7, 1] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            >
              <AlertTriangle size={14} strokeWidth={3} />
              SUSPICIOUS
            </motion.div>
          ) : (
            <div className="flex items-center gap-1.5 bg-[var(--verified-bg)] text-[var(--verified)] px-3 py-1.5 rounded-lg border border-[var(--verified)]/20 font-bold tracking-wide text-xs">
              <CheckCircle size={14} strokeWidth={3} />
              AUTHENTIC
            </div>
          )}
        </div>

        <h4 className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-3">Forensic Metadata</h4>
        <motion.div
          className="grid grid-cols-2 gap-4 mb-6"
          initial="hidden"
          animate="visible"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } } }}
        >
          {Object.entries(metadata).map(([key, value]) => (
            <motion.div
              key={key}
              variants={{ hidden: { opacity: 0, y: 6 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } }}
              className="bg-[var(--bg-page)] rounded-lg p-3 border border-[var(--border)]"
            >
              <div className="text-xs text-[var(--text-secondary)] mb-1">{key}</div>
              <div className="text-sm font-mono text-[var(--text-primary)] truncate" title={value as string}>{value as string}</div>
            </motion.div>
          ))}
        </motion.div>

        <h4 className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-3">Analysis Findings</h4>
        <motion.div
          className="flex flex-col gap-2"
          initial="hidden"
          animate="visible"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } } }}
        >
          {findings.map((finding: any, i: number) => (
            <motion.div
              key={i}
              variants={{ hidden: { opacity: 0, x: -8 }, visible: { opacity: 1, x: 0, transition: { duration: 0.3 } } }}
              className="flex items-start gap-3 p-3 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)]"
            >
              <div className="mt-0.5">
                {finding.type === 'risk' ? (
                  <AlertTriangle size={16} className="text-[var(--warning)]" />
                ) : (
                  <CheckCircle size={16} className="text-[var(--verified)]" />
                )}
              </div>
              <span className="text-sm text-[var(--text-secondary)] leading-tight">{finding.text}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
