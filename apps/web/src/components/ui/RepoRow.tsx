"use client";

import { useState } from "react";
import { ChevronDown, Github } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { motion, AnimatePresence } from "framer-motion";
import { expandCollapse } from "@/lib/motion-variants";

export function RepoRow({ repoName, language, commits, date, skills, sparklineData }: any) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-b border-[var(--border)] last:border-0">
      <motion.div 
        className="flex items-center justify-between p-4 cursor-pointer"
        whileHover={{ backgroundColor: "var(--bg-subtle)" }}
        transition={{ duration: 0.15 }}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1 grid grid-cols-12 gap-4 items-center">
          <div className="col-span-3 flex items-center gap-2">
            <Github size={16} className="text-[var(--text-tertiary)] shrink-0" />
            <a href="#" className="font-medium text-[var(--brand-blue)] hover:underline truncate" onClick={(e) => e.stopPropagation()}>
              {repoName}
            </a>
          </div>
          <div className="col-span-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--bg-muted)] text-[var(--text-secondary)]">
              {language}
            </span>
          </div>
          <div className="col-span-2 font-mono text-sm text-[var(--text-primary)]">
            {commits.toLocaleString()}
          </div>
          <div className="col-span-2 text-sm text-[var(--text-secondary)]">
            {date}
          </div>
          <div className="col-span-3">
            <div className="flex gap-1 flex-wrap">
              {skills.map((s: string, i: number) => (
                <span key={i} className="text-[10px] px-1.5 py-0.5 rounded border border-[var(--border)] text-[var(--text-secondary)] bg-[var(--bg-surface)]">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
        
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="ml-4 text-[var(--text-tertiary)]"
        >
          <ChevronDown size={20} />
        </motion.div>
      </motion.div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="expand"
            initial={expandCollapse.initial}
            animate={expandCollapse.animate}
            exit={expandCollapse.exit}
            className="overflow-hidden"
          >
            <div className="p-4 bg-[var(--bg-page)] border-t border-[var(--border)] grid grid-cols-2 gap-8">
              <div>
                <h5 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-3">Commit Frequency</h5>
                <div className="h-16 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sparklineData}>
                      <YAxis domain={['dataMin', 'dataMax']} hide />
                      <Line type="monotone" dataKey="value" stroke="var(--brand-blue)" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div>
                <h5 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-3">Recent Evidence</h5>
                <div className="flex flex-col gap-2">
                  <div className="text-xs text-[var(--text-primary)] truncate font-mono bg-[var(--bg-surface)] p-1.5 rounded border border-[var(--border)] shadow-sm">
                    feat: implement react-query caching for dashboard
                  </div>
                  <div className="text-xs text-[var(--text-primary)] truncate font-mono bg-[var(--bg-surface)] p-1.5 rounded border border-[var(--border)] shadow-sm">
                    fix: resolve hydration error in strict mode
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
