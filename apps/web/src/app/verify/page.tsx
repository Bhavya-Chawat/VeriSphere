"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, ArrowRight, Github, CheckCircle2 } from "lucide-react";
import { FileDropZone } from "@/components/ui/FileDropZone";
import { ProcessingStage } from "@/components/ui/ProcessingStage";
import { motion, AnimatePresence } from "framer-motion";

const steps = ["Upload", "Processing", "Report"] as const;

export default function VerifyPage() {
  const router = useRouter();
  const [resumeFiles, setResumeFiles] = useState<File[]>([]);
  const [githubUsername, setGithubUsername] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isFocused, setIsFocused] = useState(false);

  const canSubmit = resumeFiles.length > 0 && githubUsername.trim() !== "";

  const handleSubmit = () => {
    setIsProcessing(true);
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 5;
      if (currentProgress > 85) currentProgress = 85;
      setProgress(currentProgress);
    }, 200);

    setTimeout(() => {
      clearInterval(interval);
      setProgress(100);
      setTimeout(() => {
        router.push("/report/VSP-2024-00847");
      }, 600);
    }, 5500); 
  };

  const currentStep = isProcessing ? 1 : 0;

  return (
    <div className="min-h-screen bg-[var(--bg-subtle)]">
      <div className="max-w-2xl mx-auto py-16 px-6">
        
        {/* Breadcrumb Steps */}
        <div className="flex items-center justify-center gap-3 mb-12">
          {steps.map((step, i) => {
            const isActive = i === currentStep;
            const isDone = i < currentStep;
            return (
              <div key={step} className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{
                      backgroundColor: isDone
                        ? "var(--verified)"
                        : isActive
                        ? "var(--brand-blue)"
                        : "var(--bg-muted)",
                      scale: isActive ? 1.1 : 1,
                    }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="w-6 h-6 rounded-full flex items-center justify-center"
                  >
                    <AnimatePresence mode="wait">
                      {isDone ? (
                        <motion.span key="done" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300 }}>
                          <CheckCircle2 size={14} className="text-white" />
                        </motion.span>
                      ) : (
                        <motion.span key="num" className={`text-[10px] font-bold ${isActive ? "text-white" : "text-[var(--text-tertiary)]"}`}>
                          {i + 1}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.div>
                  <motion.span
                    animate={{
                      color: isActive ? "var(--brand-blue)" : isDone ? "var(--verified)" : "var(--text-tertiary)",
                      fontWeight: isActive ? 600 : 400,
                    }}
                    transition={{ duration: 0.2 }}
                    className="text-sm"
                  >
                    {step}
                  </motion.span>
                </div>
                {i < steps.length - 1 && (
                  <div className="w-8 h-px relative overflow-hidden bg-[var(--border-strong)]">
                    <motion.div
                      className="absolute inset-y-0 left-0 bg-[var(--brand-blue)]"
                      animate={{ width: i < currentStep ? "100%" : "0%" }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {!isProcessing ? (
            <motion.div 
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="bg-[var(--bg-surface)] shadow-[var(--shadow-lg)] rounded-3xl p-10 border border-[var(--border)]"
            >
              <div className="mb-8">
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                  className="text-2xl font-semibold text-[var(--text-primary)] mb-2 tracking-tight"
                >
                  Submit a candidate for verification
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.18, duration: 0.4 }}
                  className="text-[var(--text-secondary)]"
                >
                  We'll cross-reference their resume, GitHub, and certificates in under 90 seconds.
                </motion.p>
              </div>

              <div className="space-y-6">
                <div className="border-b border-[var(--border)] pb-6">
                  <FileDropZone 
                    label="Resume PDF" 
                    required 
                    onFilesChange={setResumeFiles} 
                  />
                </div>

                <div className="border-b border-[var(--border)] pb-6">
                  <FileDropZone 
                    label="Certificates (optional)" 
                    multiple 
                  />
                </div>

                <div className="pt-2">
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">GitHub Username</label>
                  <div className="relative flex items-center">
                    <div className="absolute left-4 text-[var(--text-tertiary)] flex items-center gap-2">
                      <Github size={18} />
                      <span className="font-heading text-sm">github.com/</span>
                    </div>
                    <motion.input 
                      type="text" 
                      value={githubUsername}
                      onChange={(e) => setGithubUsername(e.target.value)}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      animate={{
                        boxShadow: isFocused
                          ? "0 0 0 3px rgba(37,99,235,0.12), inset 0 0 0 1px var(--brand-blue)"
                          : "none",
                        borderColor: isFocused ? "var(--brand-blue)" : "var(--border)",
                      }}
                      transition={{ duration: 0.18 }}
                      className="w-full bg-[var(--bg-subtle)] border border-[var(--border)] rounded-xl py-3 pl-[125px] pr-4 text-[var(--text-primary)] font-heading outline-none transition-colors"
                      placeholder="username"
                    />
                  </div>
                </div>

                <div className="pt-6">
                  <motion.button 
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                    whileHover={canSubmit ? { scale: 1.01, y: -1 } : {}}
                    whileTap={canSubmit ? { scale: 0.98, y: 0 } : {}}
                    transition={{ duration: 0.15 }}
                    className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-200 ${canSubmit ? 'bg-[var(--brand-blue)] text-white hover:bg-blue-700 shadow-sm' : 'bg-[var(--bg-muted)] text-[var(--text-tertiary)] cursor-not-allowed'}`}
                  >
                    Initialize Verification <ArrowRight size={18} />
                  </motion.button>
                  <AnimatePresence>
                    {!canSubmit && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-center text-xs text-[var(--text-tertiary)] mt-3"
                      >
                        Add resume and GitHub username to continue
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="processing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="bg-[var(--bg-surface)] shadow-[var(--shadow-lg)] rounded-3xl p-10 border border-[var(--border)] relative overflow-hidden"
            >
              {/* Scanning beam */}
              <motion.div
                className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--brand-blue)] to-transparent opacity-40 pointer-events-none"
                animate={{ top: ["10%", "90%", "10%"] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              />

              <div className="flex items-center gap-3 mb-10">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-10 h-10 rounded-full bg-[var(--brand-blue-light)] flex items-center justify-center"
                >
                  <ShieldCheck className="text-[var(--brand-blue)]" size={20} />
                </motion.div>
                <div>
                  <h2 className="text-xl font-bold text-[var(--text-primary)]">Analyzing candidate...</h2>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">Forensic verification in progress</p>
                </div>
              </div>

              <div className="flex flex-col gap-1 mb-12">
                <ProcessingStage label="Parsing resume claims" delay={0} isActive={isProcessing} onComplete={() => {}} />
                <ProcessingStage label="Fetching GitHub repositories" delay={1200} isActive={isProcessing} onComplete={() => {}} />
                <ProcessingStage label="Cross-referencing skill evidence" delay={2400} isActive={isProcessing} onComplete={() => {}} />
                <ProcessingStage label="Validating certificate metadata" delay={3600} isActive={isProcessing} onComplete={() => {}} />
                <ProcessingStage label="Generating trust report" delay={4800} isActive={isProcessing} onComplete={() => {}} />
              </div>

              <motion.div
                key={progress < 100 ? "scanning" : "done"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-[13px] font-mono text-[var(--text-tertiary)] mb-4 h-5"
              >
                {progress < 100 ? "Scanning commits across repositories..." : "Verification complete. Redirecting..."}
              </motion.div>

              {/* Progress Bar */}
              <div className="h-1.5 bg-[var(--bg-subtle)] rounded-full overflow-hidden">
                <motion.div 
                  className="h-full rounded-full bg-gradient-to-r from-[var(--brand-blue)] to-blue-400"
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: "linear", duration: 0.2 }}
                />
              </div>
              <div className="flex justify-between mt-1.5 text-[10px] font-mono text-[var(--text-tertiary)]">
                <span>0%</span>
                <motion.span animate={{ opacity: progress > 0 ? 1 : 0 }}>{Math.round(progress)}%</motion.span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
