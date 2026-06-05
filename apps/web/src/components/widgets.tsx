/**
 * @file widgets.tsx
 * @package apps/web
 * @purpose Implements supplementary micro-widgets: Repository list audits, PDF checks, verification flows, and status banners.
 * @dependencies react, lucide-react
 * @security None
 * @future_implementation Hook states to active Redux or Zustand parameters.
 */

import React from "react";
import { GitFork, Star, CheckCircle, AlertTriangle, AlertCircle, PlayCircle, ShieldAlert } from "lucide-react";

// --- 1. VERIFICATION STATUS BANNER ---
interface StatusBannerProps {
  status: string;
  score: number;
}

export function VerificationStatusBanner({ status, score }: StatusBannerProps) {
  const isSuspicious = score < 50;

  return (
    <div
      className={`border rounded-xl p-4 flex items-center justify-between gap-4 ${
        isSuspicious
          ? "border-red-500/30 bg-red-500/5 text-red-400"
          : "border-emerald-500/30 bg-emerald-500/5 text-emerald-400"
      }`}
    >
      <div className="flex items-center gap-3">
        {isSuspicious ? <ShieldAlert className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider">Verification Status: {status}</span>
          <p className="text-sm font-medium text-white mt-0.5">
            {isSuspicious
              ? "Multiple anomalies detected. Review risk indicators carefully."
              : "Profile matches claimed skills with strong evidence alignment."}
          </p>
        </div>
      </div>
      <span className="text-2xl font-extrabold uppercase">{score}/100</span>
    </div>
  );
}

// --- 2. REPOSITORY ANALYSIS WIDGET ---
interface RepoItem {
  name: string;
  stars: number;
  forks: number;
  commits: number;
  language: string;
  suspicion: string;
}

interface RepoWidgetProps {
  repos: RepoItem[];
}

export function RepositoryAnalysisWidget({ repos }: RepoWidgetProps) {
  return (
    <div className="border border-slate-800 bg-slate-900/40 rounded-2xl p-6 space-y-4">
      <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wide flex items-center gap-2">
        <GitFork className="w-4 h-4 text-emerald-400" /> Repositories Audited
      </h4>
      <div className="space-y-3">
        {repos.map((repo, idx) => (
          <div key={idx} className="bg-slate-950/60 p-4 rounded-xl space-y-2 border border-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-white truncate max-w-[150px]">{repo.name}</span>
              <span className="text-[10px] uppercase font-bold text-red-400 px-2 py-0.5 rounded border border-red-500/20 bg-red-500/5">
                {repo.suspicion}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span>{repo.language}</span>
              <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-yellow-500" /> {repo.stars}</span>
              <span>{repo.commits} commits</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- 3. CERTIFICATE ANALYSIS WIDGET ---
export function CertificateAnalysisWidget() {
  return (
    <div className="border border-slate-800 bg-slate-900/40 rounded-2xl p-6 space-y-4">
      <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wide">Certificate Forensics</h4>
      <div className="space-y-3 text-xs">
        <div className="flex justify-between border-b border-slate-900 pb-2 text-slate-400">
          <span>Metadata Creator</span>
          <span className="font-semibold text-white">AWS CertiPort System</span>
        </div>
        <div className="flex justify-between border-b border-slate-900 pb-2 text-slate-400">
          <span>Metadata Producer</span>
          <span className="font-semibold text-white">Acrobat Web Tool</span>
        </div>
        <div className="flex justify-between border-b border-slate-900 pb-2 text-slate-400">
          <span>PDF Header Version</span>
          <span className="font-semibold text-white">1.7 Extension 8</span>
        </div>
        <div className="flex justify-between pb-2 text-slate-400">
          <span>SHA-256 Fingerprint</span>
          <span className="font-mono text-emerald-400 truncate max-w-[120px]">ab5e8fbc9901adff...</span>
        </div>
      </div>
    </div>
  );
}

// --- 4. AUDIT TIMELINE ---
export function AuditTimeline() {
  const steps = [
    { label: "Document Ingested", time: "12:00:01 PM", done: true },
    { label: "PDF Forensics Completed", time: "12:00:04 PM", done: true },
    { label: "GitHub Timeline Collected", time: "12:00:08 PM", done: true },
    { label: "Gemini Audit Analysis Executed", time: "12:00:15 PM", done: true }
  ];

  return (
    <div className="relative border-l border-slate-800 ml-3 pl-6 space-y-6">
      {steps.map((step, idx) => (
        <div key={idx} className="relative">
          <span className="absolute -left-[31px] top-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-slate-950" />
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-slate-200">{step.label}</span>
            <span className="text-xs text-slate-500 font-mono">{step.time}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// --- 5. INTERVIEW QUESTION CARD ---
interface QuestionProps {
  question: string;
  target: string;
  difficulty: string;
}

export function InterviewQuestionCard({ question, target, difficulty }: QuestionProps) {
  const getDiffColor = (diff: string) => {
    switch (diff.toUpperCase()) {
      case "HARD": return "text-red-400 border-red-500/20 bg-red-500/5";
      case "MEDIUM": return "text-yellow-400 border-yellow-500/20 bg-yellow-500/5";
      default: return "text-emerald-400 border-emerald-500/20 bg-emerald-500/5";
    }
  };

  return (
    <div className="border border-slate-800 bg-slate-900/30 rounded-xl p-5 space-y-3">
      <div className="flex items-center justify-between text-xs font-semibold">
        <span className="text-slate-400">Probing: <span className="text-teal-400">{target}</span></span>
        <span className={`px-2 py-0.5 rounded border ${getDiffColor(difficulty)}`}>{difficulty}</span>
      </div>
      <p className="text-sm font-medium text-white leading-relaxed">{question}</p>
    </div>
  );
}
