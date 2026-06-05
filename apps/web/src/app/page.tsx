/**
 * @file page.tsx
 * @package apps/web
 * @purpose Renders the marketing landing page of VeriSphere featuring rich dark modes, neon gradients, and value props.
 * @dependencies react, lucide-react
 * @security Standard static rendering. Links to secure Clerk Auth dashboard path.
 * @future_implementation Include scroll-driven slide-in animations or mock video interactions.
 */

import React from "react";
import { CheckCircle2, ShieldAlert, GitBranch, Cpu, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden flex flex-col items-center py-12 lg:py-24">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 w-full max-w-7xl h-[500px] pointer-events-none opacity-20 filter blur-3xl bg-gradient-to-r from-emerald-500 via-cyan-500 to-purple-600 rounded-full" />

      {/* Hero Header */}
      <div className="text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-xs font-semibold tracking-wide uppercase">
          <CheckCircle2 className="w-4 h-4" /> Verify Evidence, Don't Trust Claims
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
          AI Academic Profile & <br />
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-500 bg-clip-text text-transparent">
            Skill Verification Platform
          </span>
        </h1>
        <p className="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto">
          Detect PDF modifications, cloned repositories, and backdated commits. Generate authentic candidate trust ratings and targeted interview questions with Gemini.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
          <a
            href="/dashboard"
            className="w-full sm:w-auto px-8 py-3 rounded-lg font-semibold bg-emerald-500 hover:bg-emerald-600 text-slate-950 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10"
          >
            Enter Dashboard <ArrowRight className="w-4 h-4" />
          </a>
          <a
            href="https://github.com"
            target="_blank"
            className="w-full sm:w-auto px-8 py-3 rounded-lg font-semibold border border-slate-800 bg-slate-900/50 hover:bg-slate-900 text-slate-200 transition-all flex items-center justify-center gap-2"
          >
            View GitHub Project
          </a>
        </div>
      </div>

      {/* Problem & Feature Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 w-full">
        {/* Card 1 */}
        <div className="border border-slate-800/80 bg-slate-900/30 backdrop-blur-sm rounded-xl p-6 hover:border-emerald-500/30 transition-all group">
          <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Forensic Document Check</h3>
          <p className="text-sm text-slate-400">
            Audit certificate PDF hashes and toolchain metadata. Stop modified PDF grades and fabricated accomplishments.
          </p>
        </div>

        {/* Card 2 */}
        <div className="border border-slate-800/80 bg-slate-900/30 backdrop-blur-sm rounded-xl p-6 hover:border-emerald-500/30 transition-all group">
          <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 transition-transform">
            <GitBranch className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">GitHub Analysis</h3>
          <p className="text-sm text-slate-400">
            Detect timeline anomalies, authorship mismatches, and cloned forks. Evaluate true candidate contributions.
          </p>
        </div>

        {/* Card 3 */}
        <div className="border border-slate-800/80 bg-slate-900/30 backdrop-blur-sm rounded-xl p-6 hover:border-emerald-500/30 transition-all group">
          <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 transition-transform">
            <Cpu className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Gemini Audit & Scoring</h3>
          <p className="text-sm text-slate-400">
            Quantify reliability with a 0–100 Trust Score. Produce tailored, skill-probing interview questionnaires.
          </p>
        </div>
      </div>
    </div>
  );
}
