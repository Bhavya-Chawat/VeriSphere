"use client";

import { useState } from "react";
import { ChevronDown, Github, GitCommit, Code2 } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { motion, AnimatePresence } from "framer-motion";
import { expandCollapse } from "@/lib/motion-variants";

export function RepoRow({ repoName, language, commits, date, skills, sparklineData, recentCommits }: any) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-subtle)] transition-colors">
      <div 
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1 grid grid-cols-12 gap-4 items-center">
          <div className="col-span-3 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--bg-surface)] border border-[var(--border)] flex items-center justify-center shadow-sm">
              <Github size={14} className="text-[var(--text-primary)]" />
            </div>
            <a href="#" className="font-semibold text-sm text-[var(--text-primary)] hover:text-[var(--brand-blue)] hover:underline truncate transition-colors" onClick={(e) => e.stopPropagation()}>
              {repoName}
            </a>
          </div>
          <div className="col-span-2 flex items-center gap-2">
            {language && language !== "Unknown" ? (
              <span className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--bg-surface)] px-2.5 py-0.5 text-xs font-semibold text-[var(--text-secondary)] shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-blue)] mr-1.5" />
                {language}
              </span>
            ) : (
              <span className="text-xs text-[var(--text-tertiary)] italic">Unknown</span>
            )}
          </div>
          <div className="col-span-2 flex items-center gap-1.5 text-sm text-[var(--text-primary)] font-mono">
            <GitCommit size={14} className="text-[var(--text-tertiary)]" />
            {commits.toLocaleString()}
          </div>
          <div className="col-span-2 text-xs text-[var(--text-secondary)]">
            {date}
          </div>
          <div className="col-span-3 flex gap-1.5 flex-wrap items-center">
            {(!skills || skills.length === 0) ? (
              <span className="text-xs text-[var(--text-tertiary)] italic">No Specific Skill Detected</span>
            ) : (
              <>
                {skills.slice(0, 3).map((s: string, i: number) => (
                  <span key={i} className="inline-flex items-center rounded-md border border-[var(--border)] bg-[var(--bg-page)] px-2 py-0.5 text-[10px] font-semibold text-[var(--text-secondary)]">
                    {s}
                  </span>
                ))}
                {skills.length > 3 && (
                  <span className="inline-flex items-center rounded-md border border-[var(--border)] bg-[var(--bg-page)] px-2 py-0.5 text-[10px] font-semibold text-[var(--text-tertiary)]">
                    +{skills.length - 3}
                  </span>
                )}
              </>
            )}
          </div>
        </div>
        
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="ml-4 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <ChevronDown size={16} />
        </motion.div>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="expand"
            initial={expandCollapse.initial}
            animate={expandCollapse.animate}
            exit={expandCollapse.exit}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border)] p-5 grid grid-cols-2 gap-8 shadow-sm">
                <div>
                  <h5 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Code2 size={14} /> Commit Activity
                  </h5>
                  <div className="h-24 w-full">
                    {sparklineData && sparklineData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={sparklineData}>
                          <YAxis domain={['dataMin', 'dataMax']} hide />
                          <Line type="monotone" dataKey="value" stroke="var(--brand-blue)" strokeWidth={2.5} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-xs text-[var(--text-tertiary)] italic bg-[var(--bg-page)] rounded-lg border border-dashed border-[var(--border)]">
                        No activity data available
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <h5 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-4 flex items-center gap-2">
                    <GitCommit size={14} /> Recent Evidence Log
                  </h5>
                  <div className="relative pl-3 space-y-3 before:absolute before:inset-y-0 before:left-[5px] before:w-px before:bg-[var(--border)]">
                    {recentCommits && recentCommits.length > 0 ? (
                      recentCommits.slice(0, 4).map((msg: string, i: number) => (
                        <div key={i} className="relative text-xs text-[var(--text-primary)]">
                          <span className="absolute -left-[15px] top-1.5 w-1.5 h-1.5 rounded-full bg-[var(--border-strong)]" />
                          <span className="truncate block font-mono bg-[var(--bg-page)] p-1.5 rounded border border-[var(--border)]" title={msg}>
                            {msg}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-[var(--text-secondary)] italic">No recent commits found.</div>
                    )}
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
