"use client";

import { useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Flag, ShieldAlert } from "lucide-react";
import { TrustGauge } from "@/components/ui/TrustGauge";
import { ScoreBar } from "@/components/ui/ScoreBar";
import { SkillPill } from "@/components/ui/SkillPill";
import { RiskFlagCard } from "@/components/ui/RiskFlagCard";
import { EvidenceRow } from "@/components/ui/EvidenceRow";
import { RepoRow } from "@/components/ui/RepoRow";
import { CertificateCard } from "@/components/ui/CertificateCard";
import { InterviewCard } from "@/components/ui/InterviewCard";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { staggerContainer, staggerItem, fadeInUp, viewportOnce, tabContent } from "@/lib/motion-variants";

const mockRepoData = [
  { repoName: "portfolio-app", language: "TypeScript", commits: 847, date: "2 days ago", skills: ["React", "Node.js", "Tailwind"], sparklineData: [{ value: 10 }, { value: 25 }, { value: 15 }, { value: 40 }, { value: 30 }, { value: 50 }, { value: 45 }] },
  { repoName: "ecommerce-api", language: "JavaScript", commits: 412, date: "1 week ago", skills: ["Express", "MongoDB", "Docker"], sparklineData: [{ value: 5 }, { value: 10 }, { value: 8 }, { value: 20 }, { value: 15 }, { value: 25 }, { value: 20 }] },
  { repoName: "data-pipeline", language: "Python", commits: 156, date: "3 months ago", skills: ["Pandas", "PostgreSQL"], sparklineData: [{ value: 2 }, { value: 5 }, { value: 3 }, { value: 8 }, { value: 6 }, { value: 10 }, { value: 8 }] },
];

const mockPieData = [
  { name: 'TypeScript', value: 45 },
  { name: 'JavaScript', value: 30 },
  { name: 'Python', value: 15 },
  { name: 'Other', value: 10 },
];
const COLORS = ['#2563EB', '#3B82F6', '#60A5FA', '#93C5FD'];

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "github", label: "GitHub Intelligence" },
  { key: "certificates", label: "Certificates" },
  { key: "interview", label: "Interview Prep" },
];

export default function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [activeTab, setActiveTab] = useState("overview");

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
              <Link href="/" className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">
                <ArrowLeft size={20} />
              </Link>
            </motion.div>
            <div className="h-6 w-px bg-[var(--border)]" />
            <div>
              <h1 className="font-semibold text-[var(--text-primary)] text-sm">Arjun Mehta</h1>
              <p className="text-xs text-[var(--text-secondary)]">Senior Full Stack Engineer</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: "var(--warning-bg)" }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--warning)] text-[var(--warning)] transition-colors text-sm font-medium"
            >
              <Flag size={14} /> Flag for Review
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.97, y: 0 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--brand-blue)] text-white hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
            >
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
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="bg-[var(--bg-surface)] rounded-2xl shadow-[var(--shadow-md)] p-8 border border-[var(--border)] mb-8 flex gap-8"
        >
          <div className="w-1/3 flex flex-col items-center justify-center border-r border-[var(--border)] pr-8">
            <TrustGauge score={74} />
          </div>
          
          <div className="w-1/3 flex flex-col justify-center border-r border-[var(--border)] px-8 gap-4">
            <ScoreBar label="Skill Verification" score={88} colorClass="bg-[var(--verified)]" />
            <ScoreBar label="GitHub Evidence" score={71} colorClass="bg-[var(--warning)]" />
            <ScoreBar label="Certificate Integrity" score={67} colorClass="bg-[var(--warning)]" />
          </div>

          <div className="w-1/3 pl-8 flex flex-col justify-center">
            <div className="bg-[var(--bg-subtle)] rounded-xl border border-[var(--border)] p-4">
              <h3 className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-3">Report Details</h3>
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <span className="text-[var(--text-secondary)]">Candidate</span>
                <span className="font-medium text-[var(--text-primary)]">Arjun Mehta</span>
                
                <span className="text-[var(--text-secondary)]">Report ID</span>
                <span className="font-mono text-[var(--text-primary)] text-xs">VSP-2024-00847</span>
                
                <span className="text-[var(--text-secondary)]">Generated</span>
                <span className="text-[var(--text-primary)]">Oct 24, 2024</span>
                
                <span className="text-[var(--text-secondary)]">Repos Scanned</span>
                <span className="font-mono text-[var(--text-primary)]">14</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Verdict Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="bg-[var(--warning-bg)] border-l-4 border-[var(--warning)] rounded-r-xl p-4 mb-8 flex items-start gap-3"
        >
          <ShieldAlert className="text-[var(--warning)] mt-0.5 shrink-0" size={20} />
          <div>
            <h4 className="font-semibold text-[var(--text-primary)] mb-1">2 risk flags detected</h4>
            <p className="text-sm text-[var(--text-secondary)]">Additional interview verification recommended for AWS and System Design claims due to lack of evidence.</p>
          </div>
        </motion.div>

        {/* Tabs — with animated sliding indicator */}
        <div className="relative flex border-b border-[var(--border)] mb-8">
          {TABS.map((tab) => (
            <button 
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.key 
                  ? 'text-[var(--brand-blue)]' 
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {tab.label}
              {/* Animated underline indicator */}
              {activeTab === tab.key && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-[var(--brand-blue)] rounded-full"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={tabContent}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {activeTab === 'overview' && (
              <div className="grid grid-cols-12 gap-8">
                <div className="col-span-8">
                  <motion.div
                    variants={fadeInUp}
                    initial="hidden"
                    animate="visible"
                    className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border)] shadow-[var(--shadow-sm)] p-6 mb-8"
                  >
                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">Evidence Trail</h3>
                    <motion.div 
                      variants={staggerContainer}
                      initial="hidden"
                      animate="visible"
                      className="flex flex-col"
                    >
                      <EvidenceRow claim="React (5 years)" source="github.com/arjun/portfolio-app" status="VERIFIED" />
                      <EvidenceRow claim="Node.js (3 years)" source="github.com/arjun/ecommerce-api" status="VERIFIED" />
                      <EvidenceRow claim="PostgreSQL" source="github.com/arjun/data-pipeline" status="VERIFIED" />
                      <EvidenceRow claim="AWS Architecture" source="No usage found in 14 repositories" status="UNVERIFIED" />
                    </motion.div>
                  </motion.div>
                </div>

                <div className="col-span-4 flex flex-col gap-8">
                  <motion.div variants={staggerItem} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
                    <h3 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-3">Verified Skills (6)</h3>
                    <div className="flex flex-wrap gap-2">
                      <SkillPill name="React" status="verified" />
                      <SkillPill name="Node.js" status="verified" />
                      <SkillPill name="PostgreSQL" status="verified" />
                      <SkillPill name="Docker" status="verified" />
                      <SkillPill name="TypeScript" status="verified" />
                      <SkillPill name="Express" status="verified" />
                    </div>
                  </motion.div>
                  <motion.div variants={staggerItem} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
                    <h3 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-3">Unverified Claims (3)</h3>
                    <div className="flex flex-wrap gap-2">
                      <SkillPill name="AWS" status="unverified" />
                      <SkillPill name="System Design" status="unverified" />
                      <SkillPill name="Kubernetes" status="unverified" />
                    </div>
                  </motion.div>
                  <motion.div variants={staggerItem} initial="hidden" animate="visible" transition={{ delay: 0.3 }}>
                    <h3 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-3">Risk Flags</h3>
                    <RiskFlagCard title="AWS expertise not evidenced" body="Resume claims 3 years of AWS experience. No AWS SDK usage, CloudFormation configs, or infrastructure code found across 14 scanned repositories." severity="MEDIUM" />
                    <RiskFlagCard title="Certificate modified" body="AWS Certified Developer PDF shows a modified timestamp inconsistent with the issuer signature." severity="HIGH" />
                  </motion.div>
                </div>
              </div>
            )}

            {activeTab === 'github' && (
              <div>
                {/* Stat Cards — staggered */}
                <motion.div 
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-3 gap-6 mb-8"
                >
                  {[
                    { label: "Repositories Scanned", value: "14" },
                    { label: "Total Commits", value: "2,847" },
                    { label: "Primary Languages", value: "4" },
                  ].map((stat) => (
                    <motion.div
                      key={stat.label}
                      variants={staggerItem}
                      whileHover={{ y: -4, boxShadow: "var(--shadow-md)" }}
                      transition={{ duration: 0.2 }}
                      className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border)] p-6 shadow-[var(--shadow-sm)]"
                    >
                      <div className="text-xs text-[var(--text-secondary)] uppercase tracking-wider font-bold mb-1">{stat.label}</div>
                      <div className="text-3xl font-mono text-[var(--brand-navy)] font-bold">{stat.value}</div>
                    </motion.div>
                  ))}
                </motion.div>

                <div className="grid grid-cols-12 gap-8 mb-8">
                  <div className="col-span-8 bg-[var(--bg-surface)] rounded-2xl border border-[var(--border)] shadow-[var(--shadow-sm)] overflow-hidden">
                    <div className="grid grid-cols-12 gap-4 p-4 bg-[var(--bg-subtle)] border-b border-[var(--border)] text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                      <div className="col-span-3">Repository</div>
                      <div className="col-span-2">Language</div>
                      <div className="col-span-2">Commits</div>
                      <div className="col-span-2">Last Active</div>
                      <div className="col-span-3">Skill Match</div>
                    </div>
                    {mockRepoData.map((repo, i) => <RepoRow key={i} {...repo} />)}
                  </div>
                  <div className="col-span-4 bg-[var(--bg-surface)] rounded-2xl border border-[var(--border)] shadow-[var(--shadow-sm)] p-6">
                    <h3 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-6">Language Distribution</h3>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={mockPieData} innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value">
                            {mockPieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <motion.div
                      variants={staggerContainer}
                      initial="hidden"
                      animate="visible"
                      className="mt-4 flex flex-col gap-2"
                    >
                      {mockPieData.map((entry, index) => (
                        <motion.div key={index} variants={staggerItem} className="flex justify-between items-center text-sm">
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                            <span className="text-[var(--text-primary)]">{entry.name}</span>
                          </div>
                          <span className="font-mono text-[var(--text-secondary)]">{entry.value}%</span>
                        </motion.div>
                      ))}
                    </motion.div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'certificates' && (
              <motion.div variants={fadeInUp} initial="hidden" animate="visible">
                <CertificateCard 
                  title="AWS Certified Developer - Associate" 
                  issuer="Amazon Web Services" 
                  isSuspicious={true}
                  metadata={{
                    "Creator Software": "Adobe Acrobat Pro",
                    "Producer": "macOS Version 13.2",
                    "Created Date": "2023-05-12 14:22:00 UTC",
                    "Modified Date": "2024-01-08 09:15:33 UTC",
                  }}
                  findings={[
                    { type: 'risk', text: 'Modified timestamp is 8 months after original creation.' },
                    { type: 'risk', text: 'Editing software detected (Acrobat Pro) instead of standard issuer generator.' },
                    { type: 'safe', text: 'Document structure remains valid PDF/A.' }
                  ]}
                />
              </motion.div>
            )}

            {activeTab === 'interview' && (
              <div>
                <div className="mb-6 flex gap-2">
                  <span className="px-4 py-1.5 rounded-full bg-[var(--brand-navy)] text-white text-sm font-medium cursor-pointer">All (4)</span>
                  <span className="px-4 py-1.5 rounded-full bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-secondary)] text-sm font-medium cursor-pointer hover:bg-[var(--bg-subtle)]">Technical (3)</span>
                  <span className="px-4 py-1.5 rounded-full bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-secondary)] text-sm font-medium cursor-pointer hover:bg-[var(--bg-subtle)]">Verification (1)</span>
                </div>
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  className="flex flex-col gap-4"
                >
                  <InterviewCard 
                    question="Can you describe a complex issue you encountered with AWS CloudFormation and how you resolved it?"
                    hint="Candidate claims 3 years AWS but has no CloudFormation or SDK evidence in public repositories."
                    difficulty="HARD"
                  />
                  <InterviewCard 
                    question="How do you handle scaling a Node.js application across multiple instances? What challenges have you faced?"
                    hint="Node.js is verified, but System Design skills are unverified."
                    difficulty="MEDIUM"
                  />
                  <InterviewCard 
                    question="What specific AWS services did you use on the ecommerce-api project?"
                    hint="Cross-reference resume claim with specific repository evidence."
                    difficulty="MEDIUM"
                  />
                  <InterviewCard 
                    question="Can you walk me through the process you took to earn your AWS Certified Developer certificate last year?"
                    hint="Certificate PDF metadata shows unusual modification dates."
                    difficulty="EASY"
                  />
                </motion.div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
