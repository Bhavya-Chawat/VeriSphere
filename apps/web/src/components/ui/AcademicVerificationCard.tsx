"use client";

import { motion } from "framer-motion";
import { GraduationCap, CheckCircle2, AlertTriangle, XCircle, Shield, Mail, Building2, BookOpen } from "lucide-react";
import { staggerContainer, staggerItem } from "@/lib/motion-variants";

interface AcademicVerificationData {
  claimedInstitution: string;
  normalizedInstitution: string;
  degree: string;
  specialization?: string;
  graduationTimeline: string;
  domainMatch: boolean;
  institutionVerified: boolean;
  confidenceScore: number;
  evidenceLevel: "STRONG" | "MODERATE" | "NONE" | "CONTRADICTORY";
  riskFlags: string[];
}

function ConfidenceBadge({ score, evidenceLevel }: { score: number; evidenceLevel: string }) {
  const pct = Math.round(score * 100);
  let color = "bg-red-100 text-red-700 border-red-200";
  let icon = <XCircle size={12} />;
  
  if (evidenceLevel === "STRONG") {
    color = "bg-emerald-100 text-emerald-700 border-emerald-200";
    icon = <CheckCircle2 size={12} />;
  } else if (evidenceLevel === "MODERATE") {
    color = "bg-amber-100 text-amber-700 border-amber-200";
    icon = <AlertTriangle size={12} />;
  } else if (evidenceLevel === "CONTRADICTORY") {
    color = "bg-red-100 text-red-700 border-red-200";
    icon = <XCircle size={12} />;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border ${color}`}>
      {icon} {pct}% — {evidenceLevel}
    </span>
  );
}

function VerificationLayer({ label, status, detail }: { label: string; status: "pass" | "fail" | "warn" | "skip"; detail: string }) {
  const colors = {
    pass: "border-emerald-400 bg-emerald-50",
    fail: "border-red-500 bg-red-50",
    warn: "border-amber-400 bg-amber-50",
    skip: "border-gray-300 bg-gray-50"
  };
  const icons = {
    pass: <CheckCircle2 size={14} className="text-emerald-600" />,
    fail: <XCircle size={14} className="text-red-600" />,
    warn: <AlertTriangle size={14} className="text-amber-600" />,
    skip: <Shield size={14} className="text-gray-400" />
  };

  return (
    <motion.div variants={staggerItem} className={`flex items-start gap-3 p-3 rounded-lg border-l-[4px] ${colors[status]} shadow-sm`}>
      <div className="mt-0.5">{icons[status]}</div>
      <div>
        <span className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">{label}</span>
        <p className="text-xs text-[var(--text-secondary)] mt-0.5">{detail}</p>
      </div>
    </motion.div>
  );
}

export function AcademicVerificationCard({ data }: { data: AcademicVerificationData[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border)] shadow-[var(--shadow-sm)] p-8 text-center">
        <GraduationCap className="mx-auto text-[var(--text-tertiary)] mb-3" size={32} />
        <p className="text-[var(--text-secondary)] font-medium">No academic claims detected</p>
        <p className="text-xs text-[var(--text-tertiary)] mt-1">
          The resume did not contain identifiable academic information, or the AI could not extract it.
        </p>
      </div>
    );
  }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="flex flex-col gap-6">
      {data.map((acad, i) => {
        const hasCgpaRisk = acad.riskFlags.some(f => f.toLowerCase().includes("cgpa") || f.toLowerCase().includes("gpa") || f.toLowerCase().includes("score"));
        const cgpaStatusText = hasCgpaRisk ? "Does Not Meet Criteria" : "Meets Requirement";
        
        return (
          <motion.div
            key={i}
            variants={staggerItem}
            className={`bg-[var(--bg-surface)] rounded-2xl border ${acad.riskFlags.length > 0 ? 'border-amber-300 shadow-amber-100/50' : 'border-[var(--border)]'} shadow-sm overflow-hidden`}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-[var(--border)] bg-[var(--bg-subtle)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
                  <GraduationCap className="text-[var(--brand-blue)]" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--text-primary)] text-sm">{acad.degree}</h3>
                  <p className="text-xs text-[var(--text-secondary)]">{acad.claimedInstitution}</p>
                </div>
              </div>
              <ConfidenceBadge score={acad.confidenceScore} evidenceLevel={acad.evidenceLevel} />
            </div>

            {/* Body */}
            <div className="p-6">
              <div className="grid grid-cols-2 gap-8 mb-8">
                {/* Institution */}
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-[var(--bg-page)] border border-[var(--border)] shrink-0 mt-0.5">
                    <Building2 size={16} className="text-[var(--text-secondary)]" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Institution</span>
                    <p className="text-sm text-[var(--text-primary)] font-medium mt-1">{acad.claimedInstitution}</p>
                    {acad.institutionVerified && acad.normalizedInstitution !== acad.claimedInstitution && (
                      <p className="text-xs text-[var(--text-secondary)] mt-1 bg-[var(--bg-page)] px-2 py-1 rounded border border-[var(--border)] inline-block">
                        Matched: <span className="font-medium text-[var(--brand-blue)]">{acad.normalizedInstitution}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* CGPA / GPA */}
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg border shrink-0 mt-0.5 ${hasCgpaRisk ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
                    <BookOpen size={16} className={hasCgpaRisk ? 'text-red-600' : 'text-emerald-600'} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Academic Performance</span>
                    <p className={`text-sm font-bold mt-1 ${hasCgpaRisk ? 'text-red-600' : 'text-emerald-600'}`}>
                      {cgpaStatusText}
                    </p>
                    {acad.specialization && (
                      <p className="text-xs text-[var(--text-secondary)] mt-1">{acad.specialization}</p>
                    )}
                  </div>
                </div>

                {/* Email Domain */}
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-[var(--bg-page)] border border-[var(--border)] shrink-0 mt-0.5">
                    <Mail size={16} className="text-[var(--text-secondary)]" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Email Domain Match</span>
                    <p className="text-sm text-[var(--text-primary)] font-medium mt-1">
                      {acad.domainMatch ? (
                        <span className="flex items-center gap-1.5 text-emerald-600"><CheckCircle2 size={14}/> Domain verified</span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-[var(--text-secondary)]"><XCircle size={14}/> Not verified</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Institution Status */}
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-[var(--bg-page)] border border-[var(--border)] shrink-0 mt-0.5">
                    <Shield size={16} className="text-[var(--text-secondary)]" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Database Validation</span>
                    <p className="text-sm text-[var(--text-primary)] font-medium mt-1">
                      {acad.institutionVerified ? (
                        <span className="flex items-center gap-1.5 text-emerald-600"><CheckCircle2 size={14}/> Found in registry</span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-amber-600"><AlertTriangle size={14}/> Unverified institution</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Risk Flags - Emphasized */}
              {acad.riskFlags.length > 0 && (
                <div className="mb-6 bg-red-50/50 border border-red-200 rounded-xl p-4">
                  <h4 className="text-xs font-bold text-red-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <AlertTriangle size={14} className="text-red-600" /> Detected Risk Flags
                  </h4>
                  <div className="flex flex-col gap-2">
                    {acad.riskFlags.map((flag, j) => (
                      <div key={j} className="flex items-start gap-2.5 text-sm font-medium text-red-900 bg-red-100/50 p-2.5 rounded-lg border border-red-200/50">
                        <AlertTriangle size={14} className="shrink-0 mt-0.5 text-red-600" />
                        <span>{flag}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Verification Layers */}
              <h4 className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-3">Verification Pipeline</h4>
              <motion.div variants={staggerContainer} className="flex flex-col gap-2">
                <VerificationLayer
                  label="Layer 1: Institution Registry"
                  status={acad.institutionVerified ? "pass" : "warn"}
                  detail={acad.institutionVerified
                    ? `Matched "${acad.claimedInstitution}" to an accredited database`
                    : `"${acad.claimedInstitution}" could not be found in known accredited lists`
                  }
                />
                <VerificationLayer
                  label="Layer 2: Email Domain Verification"
                  status={acad.domainMatch ? "pass" : (acad.institutionVerified ? "skip" : "skip")}
                  detail={acad.domainMatch
                    ? "Candidate's email matches known institutional domains"
                    : "No institutional email matched the official domains"
                  }
                />
                <VerificationLayer
                  label="Layer 3: CGPA/GPA Requirements"
                  status={hasCgpaRisk ? "fail" : "pass"}
                  detail={acad.riskFlags.find(f => f.toLowerCase().includes("cgpa") || f.toLowerCase().includes("gpa") || f.toLowerCase().includes("score"))
                    || "No anomalies detected in CGPA/GPA claims"
                  }
                />
                <VerificationLayer
                  label="Layer 4: Degree Consistency"
                  status={acad.riskFlags.some(f => f.toLowerCase().includes("degree") || f.toLowerCase().includes("major")) ? "fail" : "pass"}
                  detail={acad.riskFlags.find(f => f.toLowerCase().includes("degree") || f.toLowerCase().includes("major"))
                    || "Degree details are structurally consistent"
                  }
                />
              </motion.div>

            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
