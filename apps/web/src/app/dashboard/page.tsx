"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck, Plus, Search, CheckCircle2, Clock, AlertTriangle,
  XCircle, ChevronRight, BarChart2, Users, TrendingUp, Zap
} from "lucide-react";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
    COMPLETED: { color: "bg-emerald-100 text-emerald-700", icon: <CheckCircle2 size={12} />, label: "Completed" },
    FAILED: { color: "bg-red-100 text-red-700", icon: <XCircle size={12} />, label: "Failed" },
    ANALYZING: { color: "bg-blue-100 text-blue-700", icon: <Zap size={12} />, label: "Analyzing" },
    QUEUED: { color: "bg-slate-100 text-slate-600", icon: <Clock size={12} />, label: "Queued" },
    DOWNLOADING: { color: "bg-amber-100 text-amber-700", icon: <Clock size={12} />, label: "Downloading" },
  };
  const s = map[status] || map["QUEUED"];
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${s.color}`}>
      {s.icon} {s.label}
    </span>
  );
}

function ScoreRing({ score }: { score: number }) {
  const color = score >= 75 ? "#10B981" : score >= 50 ? "#F59E0B" : "#EF4444";
  return (
    <div className="relative w-12 h-12">
      <svg viewBox="0 0 44 44" className="w-full h-full -rotate-90">
        <circle cx="22" cy="22" r="18" fill="none" stroke="var(--border)" strokeWidth="4" />
        <motion.circle
          cx="22" cy="22" r="18" fill="none" stroke={color} strokeWidth="4"
          strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 18}`}
          initial={{ strokeDashoffset: 2 * Math.PI * 18 }}
          animate={{ strokeDashoffset: 2 * Math.PI * 18 * (1 - score / 100) }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold" style={{ color }}>{score}</span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    const key = localStorage.getItem("verisphere_api_key");
    if (!key) { router.push("/login"); return; }
    setApiKey(key);

    fetch("http://localhost:4000/api/verification/dashboard", {
      headers: { "x-api-key": key }
    })
      .then(res => res.json())
      .then(data => {
        setJobs(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  const filtered = jobs.filter(job => {
    const name = `${job.candidate?.firstName || ""} ${job.candidate?.lastName || ""}`.toLowerCase();
    const email = (job.candidate?.email || "").toLowerCase();
    const q = searchQuery.toLowerCase();
    const matchesSearch = name.includes(q) || email.includes(q);
    const matchesStatus = statusFilter === "ALL" || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Stats
  const completedJobs = jobs.filter(j => j.status === "COMPLETED");
  const avgScore = completedJobs.length > 0
    ? Math.round(completedJobs.reduce((acc, j) => acc + (j.report?.trustScore || 0), 0) / completedJobs.length)
    : 0;
  const highRisk = completedJobs.filter(j => (j.report?.trustScore || 0) < 60).length;

  const statCards = [
    { label: "Total Verifications", value: jobs.length, icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Completed", value: completedJobs.length, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50" },
    { label: "Avg Trust Score", value: avgScore ? `${avgScore}%` : "—", icon: TrendingUp, color: "text-purple-500", bg: "bg-purple-50" },
    { label: "High Risk Flags", value: highRisk, icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-50" },
  ];

  if (apiKey === null) return null;

  return (
    <div className="min-h-screen bg-[var(--bg-page)]">

      {/* Top Nav */}
      <div className="bg-[var(--bg-surface)] border-b border-[var(--border)] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[var(--brand-blue)] rounded-lg flex items-center justify-center">
              <ShieldCheck size={16} className="text-white" />
            </div>
            <span className="font-bold text-[var(--text-primary)] text-lg">VeriSphere</span>
            <span className="text-[var(--text-tertiary)]">/</span>
            <span className="text-[var(--text-secondary)] text-sm">Dashboard</span>
          </div>
          <Link href="/verify">
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--brand-blue)] text-white rounded-xl text-sm font-semibold shadow-sm hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} /> New Verification
            </motion.button>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* Stats */}
        <motion.div
          initial="hidden" animate="visible"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10"
        >
          {statCards.map((s) => (
            <motion.div
              key={s.label}
              variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
              className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-5 shadow-[var(--shadow-sm)]"
            >
              <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
                <s.icon size={20} className={s.color} />
              </div>
              <div className="text-2xl font-bold text-[var(--text-primary)] mb-0.5">{s.value}</div>
              <div className="text-xs text-[var(--text-secondary)]">{s.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" size={16} />
            <input
              type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl text-sm text-[var(--text-primary)] outline-none focus:border-[var(--brand-blue)] transition-colors"
            />
          </div>
          <div className="flex gap-2">
            {["ALL", "COMPLETED", "ANALYZING", "FAILED"].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${statusFilter === s ? "bg-[var(--brand-blue)] text-white" : "bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}
              >
                {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl shadow-[var(--shadow-sm)] overflow-hidden"
        >
          <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-[var(--bg-subtle)] border-b border-[var(--border)] text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
            <div className="col-span-4">Candidate</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Trust Score</div>
            <div className="col-span-2">Submitted</div>
            <div className="col-span-2 text-right">Action</div>
          </div>

          <AnimatePresence mode="popLayout">
            {loading ? (
              <div className="px-6 py-16 text-center text-[var(--text-secondary)]">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} className="w-8 h-8 border-2 border-[var(--brand-blue)] border-t-transparent rounded-full mx-auto mb-3" />
                Loading verifications from database...
              </div>
            ) : filtered.length === 0 ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-6 py-20 text-center">
                <BarChart2 className="mx-auto text-[var(--text-tertiary)] mb-4" size={40} />
                <p className="text-[var(--text-secondary)] font-medium mb-1">No verifications found</p>
                <p className="text-sm text-[var(--text-tertiary)] mb-6">
                  {jobs.length === 0 ? "Submit your first candidate to get started." : "Try adjusting your search or filter."}
                </p>
                {jobs.length === 0 && (
                  <Link href="/verify">
                    <button className="px-5 py-2.5 bg-[var(--brand-blue)] text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
                      Start First Verification
                    </button>
                  </Link>
                )}
              </motion.div>
            ) : (
              filtered.map((job, i) => {
                const name = `${job.candidate?.firstName || "Unknown"} ${job.candidate?.lastName || ""}`;
                const email = job.candidate?.email || "N/A";
                const score = job.report?.trustScore;
                const date = new Date(job.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

                return (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-[var(--border)] last:border-0 items-center hover:bg-[var(--bg-subtle)] transition-colors group"
                  >
                    <div className="col-span-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                          {name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-[var(--text-primary)] text-sm">{name}</p>
                          <p className="text-xs text-[var(--text-secondary)]">{email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <StatusBadge status={job.status} />
                    </div>
                    <div className="col-span-2">
                      {score != null ? <ScoreRing score={score} /> : <span className="text-xs text-[var(--text-tertiary)]">—</span>}
                    </div>
                    <div className="col-span-2">
                      <span className="text-sm text-[var(--text-secondary)]">{date}</span>
                    </div>
                    <div className="col-span-2 flex justify-end">
                      {job.status === "COMPLETED" ? (
                        <Link href={`/report/${job.id}`}>
                          <motion.button
                            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--brand-blue)] text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors"
                          >
                            View Report <ChevronRight size={12} />
                          </motion.button>
                        </Link>
                      ) : (
                        <span className="text-xs text-[var(--text-tertiary)]">
                          {job.status === "FAILED" ? "Failed" : "In Progress..."}
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </motion.div>

      </div>
    </div>
  );
}
