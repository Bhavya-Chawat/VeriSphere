"use client";

import { AlertTriangle, CheckCircle, FileText, ShieldCheck, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/motion-variants";

export function CertificateCard({ title, issuer, isSuspicious, metadata, findings, score }: any) {
  // If no score is provided, we default to a generic parsing from metadata if possible, otherwise null.
  const displayScore = score !== undefined ? score : (metadata["Trust Score"] ? parseInt(metadata["Trust Score"].split('/')[0]) : null);
  
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -2, boxShadow: "var(--shadow-md)" }}
      transition={{ duration: 0.2 }}
      className={`flex bg-[var(--bg-surface)] rounded-2xl border ${isSuspicious ? 'border-red-300 shadow-red-100/50' : 'border-[var(--border)]'} shadow-sm overflow-hidden mb-6`}
    >
      {/* Certificate Preview Placeholder */}
      <div className={`w-1/3 border-r border-[var(--border)] p-6 flex flex-col items-center justify-center relative overflow-hidden ${isSuspicious ? 'bg-red-50/50' : 'bg-emerald-50/30'}`}>
        {/* Large faint background icon */}
        {isSuspicious ? (
          <ShieldAlert size={120} className="absolute text-red-100 opacity-50 -right-4 -bottom-4" />
        ) : (
          <ShieldCheck size={120} className="absolute text-emerald-100 opacity-50 -right-4 -bottom-4" />
        )}
        
        <div className="w-full aspect-[1/1.4] bg-[var(--bg-surface)] shadow-md border border-[var(--border-strong)] flex items-center justify-center relative p-4 text-center overflow-hidden z-10 rounded-sm">
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at center, var(--brand-navy) 0, transparent 100%)' }}></div>
          <div>
            <FileText size={48} className="mx-auto text-[var(--brand-navy)] opacity-20 mb-4" />
            <div className="font-serif text-lg font-bold text-[var(--brand-navy)]">{title}</div>
            <div className="text-xs text-[var(--text-tertiary)] mt-2 uppercase tracking-widest">{issuer}</div>
          </div>
        </div>

        {/* Big Score Display */}
        {displayScore !== null && (
          <div className="mt-6 text-center z-10">
            <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">Authenticity Score</div>
            <div className={`text-4xl font-bold tracking-tighter ${isSuspicious ? 'text-red-600' : 'text-emerald-600'}`}>
              {displayScore}
              <span className="text-lg text-[var(--text-tertiary)] font-normal ml-1">/100</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Audit Data */}
      <div className="w-2/3 p-8 flex flex-col">
        <div className="flex justify-between items-start mb-6">
          <div className="pr-4">
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-1">{title}</h3>
            <p className="text-[var(--text-secondary)]">{issuer}</p>
          </div>
          {isSuspicious ? (
            <motion.div
              className="shrink-0 flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-xl border border-red-200 font-black tracking-widest text-sm shadow-sm"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <AlertTriangle size={18} strokeWidth={3} />
              FAKE / SUSPICIOUS
            </motion.div>
          ) : (
            <div className="shrink-0 flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-xl border border-emerald-200 font-black tracking-widest text-sm shadow-sm">
              <CheckCircle size={18} strokeWidth={3} />
              GENUINE
            </div>
          )}
        </div>

        <h4 className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-3">Forensic Metadata</h4>
        <motion.div
          className="grid grid-cols-2 gap-4 mb-8"
          initial="hidden"
          animate="visible"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } } }}
        >
          {Object.entries(metadata).filter(([key]) => key !== "Trust Score").map(([key, value]) => (
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
          className="flex flex-col gap-2.5"
          initial="hidden"
          animate="visible"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } } }}
        >
          {findings.map((finding: any, i: number) => (
            <motion.div
              key={i}
              variants={{ hidden: { opacity: 0, x: -8 }, visible: { opacity: 1, x: 0, transition: { duration: 0.3 } } }}
              className={`flex items-start gap-3 p-3.5 rounded-xl border ${finding.type === 'risk' ? 'border-red-200 bg-red-50/50' : 'border-[var(--border)] bg-[var(--bg-surface)]'}`}
            >
              <div className="mt-0.5 shrink-0">
                {finding.type === 'risk' ? (
                  <AlertTriangle size={16} className="text-red-600" />
                ) : (
                  <CheckCircle size={16} className="text-emerald-600" />
                )}
              </div>
              <span className={`text-sm leading-tight ${finding.type === 'risk' ? 'text-red-900 font-medium' : 'text-[var(--text-secondary)]'}`}>
                {finding.text}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
