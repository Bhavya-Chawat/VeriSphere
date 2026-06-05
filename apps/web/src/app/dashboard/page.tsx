/**
 * @file page.tsx
 * @package apps/web
 * @purpose Recruiter analytics overview dashboard. Displays verification queues, activity graphs, and metrics.
 * @dependencies react, lucide-react
 * @security Ensure client checks auth session parameters before requesting DB payloads.
 * @future_implementation Bind with TanStack Query hooks fetching metrics directly from /api/verification/analytics endpoints.
 */

import React from "react";
import { UserCheck, AlertTriangle, Play, HelpCircle, CheckCircle2, Clock } from "lucide-react";

export default function Dashboard() {
  const recentJobs = [
    { id: "j1", name: "Sarah Jenkins", email: "sarah@gmail.com", score: 88, status: "COMPLETED", date: "June 4, 2026" },
    { id: "j2", name: "David Chen", email: "david.c@outlook.com", score: 32, status: "COMPLETED", date: "June 3, 2026" },
    { id: "j3", name: "Elena Rostova", email: "elena.r@yandex.com", score: 0, status: "ANALYZING", date: "June 5, 2026" }
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Verification Dashboard</h1>
          <p className="text-sm text-slate-400">Monitor candidate trust ratings and forensic evaluation pipelines.</p>
        </div>
        <a
          href="/candidates/verify"
          className="px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 font-semibold text-slate-950 transition-all text-sm flex items-center justify-center gap-2"
        >
          <Play className="w-4 h-4 fill-current" /> Start New Verification
        </a>
      </div>

      {/* Aggregate Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-xl space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase">Total Candidates</span>
          <div className="text-3xl font-extrabold text-white">1,482</div>
          <span className="text-xs text-emerald-400">+12% from last month</span>
        </div>
        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-xl space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase">Integrity Flag Rate</span>
          <div className="text-3xl font-extrabold text-red-400">8.4%</div>
          <span className="text-xs text-slate-500">125 tampered assets blocked</span>
        </div>
        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-xl space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase">Average Trust Score</span>
          <div className="text-3xl font-extrabold text-teal-400">74.2</div>
          <span className="text-xs text-slate-500">Industry average: 71.0</span>
        </div>
        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-xl space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase">Active Scans</span>
          <div className="text-3xl font-extrabold text-cyan-400">3</div>
          <span className="text-xs text-slate-500">Processing in background</span>
        </div>
      </div>

      {/* Recent Jobs Queue */}
      <div className="border border-slate-800 bg-slate-900/20 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 bg-slate-900/40">
          <h3 className="text-lg font-semibold text-white">Recent Audits</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="p-4 font-semibold">Candidate</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Score</th>
                <th className="p-4 font-semibold">Triggered Date</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentJobs.map(job => (
                <tr key={job.id} className="border-b border-slate-900 hover:bg-slate-900/20 transition-colors">
                  <td className="p-4">
                    <div className="font-semibold text-white">{job.name}</div>
                    <div className="text-xs text-slate-400">{job.email}</div>
                  </td>
                  <td className="p-4">
                    {job.status === "COMPLETED" ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-400 animate-pulse">
                        <Clock className="w-3.5 h-3.5" /> Analyzing
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    {job.status === "COMPLETED" ? (
                      <span className={`font-bold ${job.score >= 70 ? "text-emerald-400" : job.score >= 40 ? "text-yellow-400" : "text-red-400"}`}>
                        {job.score}/100
                      </span>
                    ) : (
                      <span className="text-slate-500">--</span>
                    )}
                  </td>
                  <td className="p-4 text-slate-400">{job.date}</td>
                  <td className="p-4 text-right">
                    <a
                      href={`/reports/${job.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:underline"
                    >
                      View Report
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
