"use client";

import { motion } from "framer-motion";
import { GraduationCap, CheckCircle2, AlertTriangle, XCircle, Shield, Clock, Mail, Building2 } from "lucide-react";
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
    fail: "border-red-400 bg-red-50",
    warn: "border-amber-400 bg-amber-50",
    skip: "border-gray-300 bg-gray-50"
  };
  const icons = {
    pass: <CheckCircle2 size={14} className="text-emerald-600" />,
    fail: <XCircle size={14} className="text-red-600" />,
    warn: <AlertTriangle size={14} className="text-amber-600" />,
    skip: <Clock size={14} className="text-gray-400" />
  };

  return (
    <motion.div variants={staggerItem} className={`flex items-start gap-3 p-3 rounded-lg border-l-[3px] ${colors[status]}`}>
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
      {data.map((acad, i) => (
        <motion.div
          key={i}
          variants={staggerItem}
          className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border)] shadow-[var(--shadow-sm)] overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
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
            <div className="grid grid-cols-2 gap-6 mb-6">
              {/* Institution */}
              <div className="flex items-start gap-3">
                <Building2 size={16} className="text-[var(--text-tertiary)] mt-0.5 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Claimed Institution</span>
                  <p className="text-sm text-[var(--text-primary)] font-medium">{acad.claimedInstitution}</p>
                  {acad.institutionVerified && acad.normalizedInstitution !== acad.claimedInstitution && (
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                      Matched to: <span className="font-medium text-[var(--brand-blue)]">{acad.normalizedInstitution}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Timeline */}
              <div className="flex items-start gap-3">
                <Clock size={16} className="text-[var(--text-tertiary)] mt-0.5 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Timeline</span>
                  <p className="text-sm text-[var(--text-primary)] font-medium">{acad.graduationTimeline}</p>
                  {acad.specialization && (
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">{acad.specialization}</p>
                  )}
                </div>
              </div>

              {/* Email Domain */}
              <div className="flex items-start gap-3">
                <Mail size={16} className="text-[var(--text-tertiary)] mt-0.5 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Email Domain</span>
                  <p className="text-sm text-[var(--text-primary)] font-medium">
                    {acad.domainMatch ? (
                      <span className="text-emerald-600">✓ Domain verified</span>
                    ) : (
                      <span className="text-[var(--text-secondary)]">Not verified</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Institution Status */}
              <div className="flex items-start gap-3">
                <Shield size={16} className="text-[var(--text-tertiary)] mt-0.5 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Institution DB</span>
                  <p className="text-sm text-[var(--text-primary)] font-medium">
                    {acad.institutionVerified ? (
                      <span className="text-emerald-600">✓ Found in database</span>
                    ) : (
                      <span className="text-amber-600">⚠ Not in database</span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Verification Layers */}
            <h4 className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-3">Verification Layers</h4>
            <motion.div variants={staggerContainer} className="flex flex-col gap-2 mb-4">
              <VerificationLayer
                label="Layer 1: Institution Name"
                status={acad.institutionVerified ? "pass" : "warn"}
                detail={acad.institutionVerified
                  ? `Matched "${acad.claimedInstitution}" → "${acad.normalizedInstitution}" via fuzzy search (35+ institutions)`
                  : `"${acad.claimedInstitution}" not found in institution database`
                }
              />
              <VerificationLayer
                label="Layer 2: Email Domain"
                status={acad.domainMatch ? "pass" : (acad.institutionVerified ? "skip" : "skip")}
                detail={acad.domainMatch
                  ? "Candidate's institutional email domain matches the institution's known domains"
                  : "No institutional email provided or domain did not match"
                }
              />
              <VerificationLayer
                label="Layer 3: CGPA/GPA Requirement"
                status={acad.riskFlags.some(f => f.includes("CGPA") || f.includes("GPA") || f.includes("score")) ? "fail" : "pass"}
                detail={acad.riskFlags.find(f => f.includes("CGPA") || f.includes("GPA") || f.includes("score"))
                  || "CGPA/GPA meets the minimum requirement"
                }
              />
              <VerificationLayer
                label="Layer 4: Degree Consistency"
                status={acad.riskFlags.some(f => f.includes("degree") || f.includes("major")) ? "fail" : "pass"}
                detail={acad.riskFlags.find(f => f.includes("degree") || f.includes("major"))
                  || "No inconsistencies detected in degree data"
                }
              />
            </motion.div>

            {/* Risk Flags */}
            {acad.riskFlags.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Risk Flags</h4>
                <div className="flex flex-col gap-1.5">
                  {acad.riskFlags.map((flag, j) => (
                    <div key={j} className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 p-2 rounded-lg">
                      <AlertTriangle size={12} className="shrink-0 mt-0.5" />
                      <span>{flag}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
