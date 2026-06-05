/**
 * @file trust-score-card.tsx
 * @package apps/web
 * @purpose Visualizes overall and sub-category trust metrics (0-100 scales).
 * @dependencies react
 * @security None
 * @future_implementation Use circular SVG dials or animated progress bars for premium dashboards.
 */

import React from "react";

interface TrustScoreProps {
  scores: {
    overallScore: number;
    resumeConsistency: number;
    githubEvidence: number;
    certificateValidity: number;
    contributionConfidence: number;
    activityConfidence: number;
  };
}

export function TrustScoreCard({ scores }: TrustScoreProps) {
  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-emerald-400 border-emerald-500/20 bg-emerald-500/5";
    if (score >= 40) return "text-yellow-400 border-yellow-500/20 bg-yellow-500/5";
    return "text-red-400 border-red-500/20 bg-red-500/5";
  };

  const getDialColor = (score: number) => {
    if (score >= 70) return "bg-emerald-500";
    if (score >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="border border-slate-800 bg-slate-900/40 rounded-2xl p-6 space-y-6">
      
      {/* Central Dial */}
      <div className="flex flex-col items-center justify-center space-y-2 py-4">
        <div className={`w-32 h-32 rounded-full border-4 flex flex-col items-center justify-center ${getScoreColor(scores.overallScore)}`}>
          <span className="text-4xl font-extrabold tracking-tight">{scores.overallScore}</span>
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Score</span>
        </div>
        <p className="text-xs text-slate-400 text-center font-medium">Confidence Weighted average</p>
      </div>

      {/* Sub Scores list */}
      <div className="space-y-4 border-t border-slate-900 pt-6">
        {[
          { label: "Resume Consistency", val: scores.resumeConsistency },
          { label: "GitHub Evidence", val: scores.githubEvidence },
          { label: "Certificate Validity", val: scores.certificateValidity },
          { label: "Contribution Level", val: scores.contributionConfidence },
          { label: "Timeline Credibility", val: scores.activityConfidence }
        ].map((item, index) => (
          <div key={index} className="space-y-1">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span>{item.label}</span>
              <span>{item.val}%</span>
            </div>
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${getDialColor(item.val)}`}
                style={{ width: `${item.val}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      
    </div>
  );
}
