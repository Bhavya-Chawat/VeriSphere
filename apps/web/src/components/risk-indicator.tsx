/**
 * @file risk-indicator.tsx
 * @package apps/web
 * @purpose Renders the list of structural risk flags detected during evaluations.
 * @dependencies react, lucide-react
 * @security None
 * @future_implementation Include expand/collapse details or filter toggles by severity.
 */

import React from "react";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";

interface RiskItem {
  id: string;
  category: string;
  severity: string; // LOW, MEDIUM, HIGH, CRITICAL
  description: string;
  evidence: string;
}

interface RiskWidgetProps {
  risks: RiskItem[];
}

export function RiskIndicatorWidget({ risks }: RiskWidgetProps) {
  const getSeverityStyles = (severity: string) => {
    switch (severity.toUpperCase()) {
      case "CRITICAL":
        return "border-red-500/30 bg-red-500/5 text-red-400";
      case "HIGH":
        return "border-orange-500/30 bg-orange-500/5 text-orange-400";
      case "MEDIUM":
        return "border-yellow-500/30 bg-yellow-500/5 text-yellow-400";
      default:
        return "border-blue-500/30 bg-blue-500/5 text-blue-400";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity.toUpperCase()) {
      case "CRITICAL":
      case "HIGH":
        return <AlertCircle className="w-5 h-5 flex-shrink-0" />;
      case "MEDIUM":
        return <AlertTriangle className="w-5 h-5 flex-shrink-0" />;
      default:
        return <Info className="w-5 h-5 flex-shrink-0" />;
    }
  };

  if (risks.length === 0) {
    return (
      <div className="border border-slate-800 bg-slate-900/10 rounded-xl p-6 text-center text-slate-500 text-sm">
        No risks detected in current verification job.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {risks.map((risk) => (
        <div
          key={risk.id}
          className={`border p-5 rounded-xl space-y-3 transition-colors ${getSeverityStyles(risk.severity)}`}
        >
          <div className="flex items-center gap-3">
            {getSeverityIcon(risk.severity)}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">{risk.category}</div>
              <h4 className="font-semibold text-white text-sm mt-0.5">{risk.description}</h4>
            </div>
            <span className="ml-auto text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border border-current bg-[var(--bg-surface)]/5">
              {risk.severity}
            </span>
          </div>

          <div className="bg-slate-950/80 border border-slate-900 p-3 rounded-lg text-xs font-mono text-slate-400">
            <span className="font-bold text-slate-200 block mb-1">Evidence Reference:</span>
            {risk.evidence}
          </div>
        </div>
      ))}
    </div>
  );
}
