/**
 * @file page.tsx
 * @package apps/web
 * @purpose Renders the candidate verification audit report detailing risk markers, trust scores, and interview questions.
 * @dependencies react, lucide-react, TrustScoreCard, RiskIndicatorCard, Widgets
 * @security Ensure parameters (jobId) are validated. Limit accessibility to internal recruiter teams only.
 * @future_implementation Hook data payload bindings to React Query fetching from /api/verification/reports/[jobId].
 */

import React from "react";
import { TrustScoreCard } from "@/components/trust-score-card";
import { RiskIndicatorWidget } from "@/components/risk-indicator";
import { RepositoryAnalysisWidget, CertificateAnalysisWidget, AuditTimeline, InterviewQuestionCard, VerificationStatusBanner } from "@/components/widgets";
import { FileText, Github, HelpCircle, ShieldAlert } from "lucide-react";

export default function ReportPage({ params }: { params: { jobId: string } }) {
  // Mock verification result payload
  const mockReport = {
    candidate: {
      firstName: "David",
      lastName: "Chen",
      email: "david.c@outlook.com",
      githubUrl: "https://github.com/davidc-dev"
    },
    trustScore: {
      overallScore: 32,
      resumeConsistency: 45,
      githubEvidence: 20,
      certificateValidity: 90,
      contributionConfidence: 10,
      activityConfidence: 15
    },
    risks: [
      { id: "r1", category: "CLONED_REPOSITORY", severity: "HIGH", description: "Repository 'e-commerce-backend' shares 98% code duplication with public template 'express-shop-starter'.", evidence: "Matched identical git blobs across file trees." },
      { id: "r2", category: "TIMELINE_ANOMALY", severity: "HIGH", description: "Repository timeline contains 80 commits backdated artificially to 2022 inside a 2-hour push block.", evidence: "Git push event timestamp (June 3, 2026) contradicts commit timestamps (November 2022)." }
    ],
    repos: [
      { name: "e-commerce-backend", stars: 0, forks: 0, commits: 80, language: "TypeScript", suspicion: "High Risk" }
    ],
    questions: [
      { id: "q1", question: "Can you walk through your design decisions on the database indexing strategy inside your 'e-commerce-backend' repository?", target: "Database performance claim", difficulty: "HARD" },
      { id: "q2", question: "Your commit records show intense back-to-back uploads spanning multiple months inside a single afternoon. Can you describe your code refactoring process during that period?", target: "GitHub History Anomaly", difficulty: "MEDIUM" }
    ]
  };

  return (
    <div className="space-y-8">
      {/* Status Banner */}
      <VerificationStatusBanner status="COMPLETED" score={mockReport.trustScore.overallScore} />

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-900 pb-6 gap-4">
        <div>
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">Audit ID: {params.jobId}</span>
          <h1 className="text-3xl font-bold text-white">
            {mockReport.candidate.firstName} {mockReport.candidate.lastName}
          </h1>
          <p className="text-sm text-slate-400">{mockReport.candidate.email} • {mockReport.candidate.githubUrl}</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 border border-slate-800 bg-slate-900/40 rounded-lg hover:bg-slate-900 text-sm font-semibold text-slate-200">
            Export PDF Audit
          </button>
          <button className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-sm font-semibold text-slate-950">
            Share Report
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Trust Scores & Risks) */}
        <div className="lg:col-span-1 space-y-6">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-emerald-400" /> Trust Matrix
          </h3>
          <TrustScoreCard scores={mockReport.trustScore} />
          
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 pt-4">
            <ShieldAlert className="w-4 h-4 text-red-400" /> Risk Flags
          </h3>
          <RiskIndicatorWidget risks={mockReport.risks} />
        </div>

        {/* Right Column (Evidence Analysis & Interview questions) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Timeline verification flow */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Audit Process Timeline</h3>
            <AuditTimeline />
          </div>

          {/* Repo & Certificate Analysis Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <RepositoryAnalysisWidget repos={mockReport.repos} />
            <CertificateAnalysisWidget />
          </div>

          {/* Interview Question Engine Widgets */}
          <div className="space-y-4 pt-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-teal-400" /> targeted Interview Questionnaire
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {mockReport.questions.map(q => (
                <InterviewQuestionCard key={q.id} question={q.question} target={q.target} difficulty={q.difficulty} />
              ))}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
