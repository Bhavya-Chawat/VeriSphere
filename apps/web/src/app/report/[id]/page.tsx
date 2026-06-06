"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Download, Flag, ShieldAlert, CheckCircle2, AlertTriangle, XCircle, Info, Github } from "lucide-react";
import { TrustGauge } from "@/components/ui/TrustGauge";
import { ScoreBar } from "@/components/ui/ScoreBar";
import { SkillPill } from "@/components/ui/SkillPill";
import { RiskFlagCard } from "@/components/ui/RiskFlagCard";
import { EvidenceRow } from "@/components/ui/EvidenceRow";
import { RepoRow } from "@/components/ui/RepoRow";
import { CertificateCard } from "@/components/ui/CertificateCard";
import { InterviewCard } from "@/components/ui/InterviewCard";
import { AcademicVerificationCard } from "@/components/ui/AcademicVerificationCard";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { staggerContainer, staggerItem, fadeInUp, viewportOnce, tabContent } from "@/lib/motion-variants";

const COLORS = ['#2563EB', '#3B82F6', '#60A5FA', '#93C5FD'];

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "academic", label: "Academic" },
  { key: "github", label: "GitHub Intelligence" },
  { key: "certificates", label: "Certificates" },
];

export default function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [jobData, setJobData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const key = localStorage.getItem("verisphere_api_key");
    if (!key) {
      router.push("/login");
      return;
    }
    setApiKey(key);

    fetch(`http://localhost:4000/api/verification/jobs/${resolvedParams.id}/status`, {
      headers: { "x-api-key": key }
    })
      .then(res => res.json())
      .then(data => {
        setJobData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [resolvedParams.id, router]);

  if (loading) {
    return <div className="min-h-screen bg-[var(--bg-page)] flex items-center justify-center text-[var(--text-secondary)]">Loading report data...</div>;
  }

  if (!jobData || !jobData.report) {
    return <div className="min-h-screen bg-[var(--bg-page)] flex items-center justify-center text-[var(--text-secondary)]">Report not found or not completed.</div>;
  }

  const { candidate, report, githubMetricsJson } = jobData;
  const fullName = `${candidate.firstName} ${candidate.lastName}`;
  const dateStr = new Date(report.createdAt).toLocaleDateString();

  // Parse JSONs safely
  let githubMetrics = { publicReposCount: 0, totalCommitsCollected: 0, analyzedRepos: [] as any[] };
  try { if (githubMetricsJson) githubMetrics = JSON.parse(githubMetricsJson); } catch (e) {}
  
  let semanticMatches: any[] = [];
  try { 
    if (report.semanticMatchJson) {
      const parsedMatches = JSON.parse(report.semanticMatchJson);
      const uniqueMatches = new Map();
      parsedMatches.forEach((m: any) => {
        const skill = m.claimedSkill || m.skill || "Unknown";
        if (skill === "Unknown") return; // Cut off unknown evidence
        
        if (!uniqueMatches.has(skill) || uniqueMatches.get(skill).confidenceScore < m.confidenceScore) {
          uniqueMatches.set(skill, { ...m, claimedSkill: skill });
        }
      });
      semanticMatches = Array.from(uniqueMatches.values());
    }
  } catch(e) {}

  let riskIndicators = [];
  try { if (report.riskIndicatorsJson) riskIndicators = JSON.parse(report.riskIndicatorsJson); } catch(e) {}

  let academicVerification: any[] = [];
  try { if (report.academicVerificationJson) academicVerification = JSON.parse(report.academicVerificationJson); } catch(e) {}

  let certificateAnalyses: any[] = [];
  try { if (jobData.certificateDataJson) certificateAnalyses = JSON.parse(jobData.certificateDataJson); } catch(e) {}


  // Calculate dynamic pie chart data
  const languageCounts: Record<string, number> = {};
  githubMetrics.analyzedRepos?.forEach((r: any) => {
    if (r.language) {
      languageCounts[r.language] = (languageCounts[r.language] || 0) + r.commits;
    }
  });
  
  const pieData = Object.keys(languageCounts).map(lang => ({
    name: lang,
    value: Math.round((languageCounts[lang] / (githubMetrics.totalCommitsCollected || 1)) * 100)
  })).sort((a,b) => b.value - a.value).slice(0,4);

  const handleDownloadPDF = async () => {
    try {
      const res = await fetch(`http://localhost:4000/api/verification/jobs/${resolvedParams.id}/report/pdf`, {
        headers: { "x-api-key": apiKey || "" }
      });
      if (!res.ok) throw new Error("Failed to generate PDF");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `VeriSphere_Report_${candidate.firstName}_${candidate.lastName}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      alert("Failed to generate PDF report.");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-page)] pb-24">
      {/* Report Sub-Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="bg-[var(--bg-surface)] border-b border-[var(--border)]"
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div whileHover={{ x: -2 }} whileTap={{ scale: 0.95 }}>
              <Link href="/verify" className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">
                <ArrowLeft size={20} />
              </Link>
            </motion.div>
            <div className="h-6 w-px bg-[var(--border)]" />
            <div>
              <h1 className="font-semibold text-[var(--text-primary)] text-sm">{fullName}</h1>
              <p className="text-xs text-[var(--text-secondary)]">Candidate Verification</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <motion.button onClick={handleDownloadPDF} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--brand-blue)] text-white hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm print:hidden">
              <Download size={14} /> Download Report
            </motion.button>
          </div>
        </div>
      </motion.div>

      <main className="max-w-6xl mx-auto px-6 pt-8">
        {/* Hero Score Banner */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--bg-surface)] rounded-2xl shadow-[var(--shadow-md)] p-8 border border-[var(--border)] mb-8 flex gap-8"
        >
          <div className="w-1/3 flex flex-col items-center justify-center border-r border-[var(--border)] pr-8">
            <TrustGauge score={report.trustScore} />
          </div>
          
          <div className="w-1/3 flex flex-col justify-center border-r border-[var(--border)] px-8 gap-4">
            <ScoreBar label="Skill Verification" score={Math.min(report.trustScore + 10, 100)} colorClass="bg-[var(--verified)]" />
            <ScoreBar label="Academic Match" score={academicVerification.length > 0 ? Math.round(academicVerification[0].confidenceScore * 100) : 50} colorClass="bg-[var(--brand-blue)]" />
            <ScoreBar label="GitHub Evidence" score={Math.max(report.trustScore - 5, 0)} colorClass="bg-[var(--warning)]" />
          </div>

          <div className="w-1/3 pl-8 flex flex-col justify-center">
            <div className="bg-[var(--bg-subtle)] rounded-xl border border-[var(--border)] p-4">
              <h3 className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-3">Report Details</h3>
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <span className="text-[var(--text-secondary)]">Candidate</span>
                <span className="font-medium text-[var(--text-primary)]">{fullName}</span>
                <span className="text-[var(--text-secondary)]">Email</span>
                <span className="font-medium text-[var(--text-primary)] text-xs truncate">{candidate.email}</span>
                <span className="text-[var(--text-secondary)]">Generated</span>
                <span className="text-[var(--text-primary)]">{dateStr}</span>
                <span className="text-[var(--text-secondary)]">Repos Scanned</span>
                <span className="font-mono text-[var(--text-primary)]">{githubMetrics.publicReposCount}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Verdict Banner */}
        {riskIndicators.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[var(--warning-bg)] border-l-4 border-[var(--warning)] rounded-r-xl p-4 mb-8 flex items-start gap-3"
          >
            <ShieldAlert className="text-[var(--warning)] mt-0.5 shrink-0" size={20} />
            <div>
              <h4 className="font-semibold text-[var(--text-primary)] mb-1">{riskIndicators.length} risk flags detected</h4>
              <p className="text-sm text-[var(--text-secondary)]">{report.findingsSummary}</p>
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <div className="relative flex border-b border-[var(--border)] mb-8">
          {TABS.map((tab) => (
            <button 
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative px-6 py-3 text-sm font-medium transition-colors ${activeTab === tab.key ? 'text-[var(--brand-blue)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
            >
              {tab.label}
              {activeTab === tab.key && <motion.div layoutId="tab-indicator" className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-[var(--brand-blue)] rounded-full" transition={{ type: "spring", stiffness: 400, damping: 30 }} />}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} variants={tabContent} initial="hidden" animate="visible" exit="exit">
            
            {activeTab === 'academic' && (
              <div>
                <AcademicVerificationCard data={academicVerification} />
              </div>
            )}

            {activeTab === 'overview' && (
              <div className="grid grid-cols-12 gap-8">
                <div className="col-span-8">
                  <motion.div variants={fadeInUp} className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border)] shadow-[var(--shadow-sm)] p-6 mb-8">
                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">Evidence Trail</h3>
                    <motion.div variants={staggerContainer} className="flex flex-col">
                      {academicVerification.map((av: any, i: number) => {
                        const confScore = av.confidenceScore ?? 0;
                        return (
                          <EvidenceRow 
                            key={`acad-${i}`} 
                            claim={`${av.degree} at ${av.claimedInstitution}`} 
                            source={`Confidence: ${Math.round(confScore * 100)}%`} 
                            status={av.domainMatch ? "VERIFIED" : (confScore > 0.4 ? "PARTIAL" : "UNVERIFIED")} 
                            href={undefined}
                          />
                        );
                      })}
                      {semanticMatches.map((match: any, i: number) => {
                        const href = candidate.githubUrl && match.matchedRepo && match.matchedRepo !== "None" 
                          ? `${candidate.githubUrl}/${match.matchedRepo}`
                          : undefined;
                        const confScore = match.confidenceScore ?? 
                          (match.evidenceLevel === 'STRONG' ? 0.95 : 
                           match.evidenceLevel === 'MODERATE' ? 0.6 : 
                           match.evidenceLevel === 'NONE' ? 0.1 : 0);
                        return (
                          <EvidenceRow 
                            key={i} 
                            claim={`${match.claimedSkill} claimed`} 
                            source={`Confidence: ${Math.round(confScore * 100)}%`} 
                            status={confScore > 0.7 ? "VERIFIED" : "UNVERIFIED"} 
                            href={href}
                          />
                        );
                      })}
                    </motion.div>
                  </motion.div>
                </div>

                <div className="col-span-4 flex flex-col gap-8">
                  <motion.div variants={staggerItem}>
                    <h3 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-3">Skills ({semanticMatches.length})</h3>
                    <div className="flex flex-wrap gap-2">
                      {semanticMatches.map((m: any, i: number) => (
                        <SkillPill key={i} name={m.claimedSkill} status={m.confidenceScore > 0.7 ? "verified" : "unverified"} />
                      ))}
                    </div>
                  </motion.div>
                  
                  <motion.div variants={staggerItem}>
                    <h3 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-3">Risk Flags</h3>
                    {riskIndicators.length === 0 ? <p className="text-sm text-[var(--text-secondary)]">No significant risks detected.</p> : null}
                    {riskIndicators.map((risk: any, i: number) => (
                      <RiskFlagCard key={i} title={risk.type} body={risk.description} severity={risk.level} />
                    ))}
                  </motion.div>
                </div>
              </div>
            )}

            {activeTab === 'github' && (
              <div className="flex flex-col gap-8">
                {/* Metrics */}
                <motion.div variants={staggerContainer} className="grid grid-cols-4 gap-6">
                  <motion.div variants={staggerItem} className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border)] p-6 shadow-sm flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-[var(--bg-subtle)] flex items-center justify-center text-[var(--text-secondary)]">
                        <Github size={16} />
                      </div>
                      <div className="text-xs text-[var(--text-secondary)] font-semibold uppercase tracking-wider">Repositories</div>
                    </div>
                    <div className="text-3xl font-bold text-[var(--text-primary)]">{githubMetrics.publicReposCount}</div>
                  </motion.div>
                  <motion.div variants={staggerItem} className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border)] p-6 shadow-sm flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-[var(--bg-subtle)] flex items-center justify-center text-[var(--text-secondary)]">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                      </div>
                      <div className="text-xs text-[var(--text-secondary)] font-semibold uppercase tracking-wider">Total Commits</div>
                    </div>
                    <div className="text-3xl font-bold text-[var(--text-primary)]">{githubMetrics.totalCommitsCollected}</div>
                  </motion.div>
                  <motion.div variants={staggerItem} className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border)] p-6 shadow-sm flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-[var(--bg-subtle)] flex items-center justify-center text-[var(--text-secondary)]">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                      </div>
                      <div className="text-xs text-[var(--text-secondary)] font-semibold uppercase tracking-wider">Languages</div>
                    </div>
                    <div className="text-3xl font-bold text-[var(--text-primary)]">{Object.keys(languageCounts).length}</div>
                  </motion.div>
                  <motion.div variants={staggerItem} className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border)] p-6 shadow-sm flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                        <CheckCircle2 size={16} />
                      </div>
                      <div className="text-xs text-[var(--text-secondary)] font-semibold uppercase tracking-wider">Skills Validated</div>
                    </div>
                    <div className="flex items-end gap-2">
                      <div className="text-3xl font-bold text-[var(--text-primary)]">{semanticMatches.filter((m: any) => m.evidenceLevel === 'STRONG' || m.evidenceLevel === 'MODERATE' || m.confidenceScore > 0.5).length}</div>
                      <div className="text-sm text-[var(--text-tertiary)] mb-1">/ {semanticMatches.length}</div>
                    </div>
                  </motion.div>
                </motion.div>

                <div className="grid grid-cols-12 gap-8">
                  {/* Language Distribution */}
                  <div className="col-span-4 flex flex-col gap-8">
                    <div className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border)] shadow-sm p-6 flex flex-col h-full">
                      <h3 className="text-sm font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
                        Language Distribution
                      </h3>
                      <div className="h-48 relative mb-6">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={pieData} innerRadius={65} outerRadius={85} paddingAngle={3} dataKey="value" stroke="none">
                              {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                          <span className="text-2xl font-bold text-[var(--text-primary)]">{pieData[0]?.name || "N/A"}</span>
                          <span className="text-xs text-[var(--text-secondary)]">Top Language</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-4 mt-auto">
                        {pieData.map((lang, idx) => (
                          <div key={idx} className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2 font-medium text-[var(--text-primary)]">
                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                                {lang.name}
                              </div>
                              <span className="text-[var(--text-secondary)]">{lang.value}%</span>
                            </div>
                            <div className="w-full bg-[var(--bg-subtle)] rounded-full h-1.5 overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }} animate={{ width: `${lang.value}%` }} transition={{ duration: 1, delay: 0.2 }}
                                className="h-full rounded-full" 
                                style={{ backgroundColor: COLORS[idx % COLORS.length] }} 
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Skills Validation Judgments */}
                  <div className="col-span-8 bg-[var(--bg-surface)] rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden flex flex-col h-full">
                    <div className="px-6 py-5 border-b border-[var(--border)] bg-[var(--bg-subtle)]">
                      <h3 className="text-sm font-bold text-[var(--text-primary)]">Skill Validation & AI Judgments</h3>
                      <p className="text-xs text-[var(--text-secondary)] mt-1">Showing how the AI mapped claimed skills to GitHub repositories.</p>
                    </div>
                    <div className="flex flex-col overflow-y-auto max-h-[500px]">
                      {semanticMatches.length === 0 ? (
                        <div className="p-8 text-center text-[var(--text-secondary)] text-sm">No skill judgments available.</div>
                      ) : (
                        semanticMatches.map((match: any, idx: number) => {
                          const isVerified = match.evidenceLevel === 'STRONG' || match.evidenceLevel === 'MODERATE' || match.confidenceScore > 0.5;
                          const isStrong = match.evidenceLevel === 'STRONG' || match.confidenceScore > 0.8;
                          return (
                            <div key={idx} className="p-5 border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-page)] transition-colors grid grid-cols-12 gap-6">
                              <div className="col-span-3 flex flex-col gap-2">
                                <span className="font-semibold text-sm text-[var(--text-primary)]">{match.claimedSkill}</span>
                                {isStrong ? (
                                  <span className="inline-flex items-center gap-1 w-fit rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                                    <CheckCircle2 size={10} /> Strong Evidence
                                  </span>
                                ) : isVerified ? (
                                  <span className="inline-flex items-center gap-1 w-fit rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                                    <AlertTriangle size={10} /> Moderate Evidence
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 w-fit rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                                    <XCircle size={10} /> No Evidence
                                  </span>
                                )}
                              </div>
                              <div className="col-span-9 flex flex-col gap-3">
                                <div className="text-sm text-[var(--text-secondary)] leading-relaxed">
                                  {match.notes || match.reasoning || "The AI verified this skill based on repository analysis."}
                                </div>
                                {match.matchedRepo && match.matchedRepo !== "None" && (
                                  <div className="flex items-center gap-2 text-xs font-mono bg-[var(--bg-subtle)] w-fit px-3 py-1.5 rounded-lg border border-[var(--border)] text-[var(--text-primary)] shadow-sm">
                                    <Github size={12} className="text-[var(--text-tertiary)]" /> {match.matchedRepo}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

                {/* Repositories Table */}
                <div className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden mt-2">
                  <div className="px-6 py-5 border-b border-[var(--border)] bg-[var(--bg-subtle)] flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-[var(--text-primary)]">Repository Analysis</h3>
                      <p className="text-xs text-[var(--text-secondary)] mt-1">Deep dive into {githubMetrics.analyzedRepos?.length || 0} repositories scanned.</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-[var(--bg-page)] border-b border-[var(--border)] text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                    <div className="col-span-3 pl-4">Repository</div>
                    <div className="col-span-2">Language</div>
                    <div className="col-span-2">Commits</div>
                    <div className="col-span-2">Last Active</div>
                    <div className="col-span-3">Skills Detected</div>
                  </div>
                  {githubMetrics.analyzedRepos?.length > 0 ? (
                    githubMetrics.analyzedRepos.map((repo: any, i: number) => {
                      // Find skills mapped to this repo
                      const mappedSkills = semanticMatches
                        .filter((m: any) => m.matchedRepo === repo.name || m.matchedRepo?.includes(repo.name))
                        .map((m: any) => m.claimedSkill);
                      
                      return (
                        <RepoRow 
                          key={i} 
                          repoName={repo.name} 
                          language={repo.language || "Unknown"} 
                          commits={repo.commits} 
                          date="Recently" 
                          skills={mappedSkills.length > 0 ? mappedSkills : []} 
                          sparklineData={[]} 
                          recentCommits={repo.recentCommits} 
                        />
                      );
                    })
                  ) : (
                    <div className="p-8 text-center text-[var(--text-secondary)] text-sm">No repositories were analyzed for this candidate.</div>
                  )}
                </div>
              </div>
            )}
            
            {activeTab === 'certificates' && (
              <div className="flex flex-col gap-6">
                {certificateAnalyses.length === 0 ? (
                  <div className="text-center py-10 text-[var(--text-secondary)]">No certificates uploaded for this candidate.</div>
                ) : (
                  certificateAnalyses.map((analysis, i) => (
                    <CertificateCard 
                      key={i} 
                      title={analysis.title || "Certificate"} 
                      issuer={analysis.issuer || "Unknown Issuer"} 
                      isSuspicious={analysis.trustScore < 70} 
                      score={analysis.trustScore}
                      metadata={{
                        ...analysis.metadata,
                        "SHA-256 Checksum": analysis.sha256,
                        "Trust Score": `${analysis.trustScore}/100`
                      }} 
                      findings={analysis.findings?.map((f: any) => ({
                        type: f.severity === 'HIGH' || f.severity === 'CRITICAL' || f.isAnomaly ? 'risk' : 'verified',
                        text: f.description
                      })) || []} 
                    />
                  ))
                )}
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
