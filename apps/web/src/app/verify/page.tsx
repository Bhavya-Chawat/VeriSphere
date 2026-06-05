"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, ArrowRight, Github, CheckCircle2, User, Mail } from "lucide-react";
import { FileDropZone } from "@/components/ui/FileDropZone";
import { ProcessingStage } from "@/components/ui/ProcessingStage";
import { motion, AnimatePresence } from "framer-motion";

const steps = ["Upload", "Processing", "Report"] as const;

export default function VerifyPage() {
  const router = useRouter();
  const [apiKey, setApiKey] = useState<string | null>(null);

  const [resumeFiles, setResumeFiles] = useState<File[]>([]);
  const [certificateFiles, setCertificateFiles] = useState<File[]>([]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [institutionalEmail, setInstitutionalEmail] = useState("");
  const [githubUsername, setGithubUsername] = useState("");
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [certWarnings, setCertWarnings] = useState<string[]>([]);
  const [generalError, setGeneralError] = useState<string | null>(null);

  useEffect(() => {
    const key = localStorage.getItem("verisphere_api_key");
    if (!key) {
      router.push("/login");
    } else {
      setApiKey(key);
    }
  }, [router]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!firstName.trim()) newErrors.firstName = "First name is required";
    if (!lastName.trim()) newErrors.lastName = "Last name is required";
    
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (institutionalEmail.trim() && !/\S+@\S+\.\S+/.test(institutionalEmail)) {
      newErrors.institutionalEmail = "Please enter a valid institutional email address";
    }

    if (resumeFiles.length === 0) {
      newErrors.resume = "Resume PDF is required for verification";
    }

    if (!githubUsername.trim()) {
      newErrors.github = "GitHub username is required for skill validation";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    setGeneralError(null);
    setCertWarnings([]);
    
    if (!validate()) {
      return;
    }

    setIsProcessing(true);
    setProgress(10); // Start progress

    try {
      // 0. Process Certificates through forensics API
      const certWarningsList: string[] = [];
      const certPromises = certificateFiles.map(async (file) => {
        try {
          const certFormData = new FormData();
          certFormData.append("certificate", file);
          
          const certRes = await fetch("http://localhost:4000/api/forensics/analyze", {
            method: "POST",
            body: certFormData,
            headers: {
              "x-api-key": apiKey || ""
            }
          });
          
          if (!certRes.ok) {
            let errMsg = `Certificate "${file.name}" ignored`;
            try {
              const textData = await certRes.text();
              try {
                const errData = JSON.parse(textData);
                if (errData.error) errMsg += `: ${errData.error}`;
              } catch {
                const match = textData.match(/<pre>([\s\S]*?)<\/pre>/) || textData.match(/Error: (.*?)(?:<br|\n)/);
                if (match && match[1]) {
                  errMsg += `: ${match[1].trim()}`;
                } else {
                  errMsg += ` (HTTP ${certRes.status})`;
                }
              }
            } catch(e) {}
            certWarningsList.push(errMsg);
            return null;
          }
          
          const certData = await certRes.json();
          if (certData.success && certData.data) {
            certData.data.title = file.name;
            certData.data.issuer = certData.data.metadata?.creator || "Unknown Issuer";
            return certData.data;
          }
          certWarningsList.push(`Invalid response format for "${file.name}".`);
          return null;
        } catch (e: any) {
          certWarningsList.push(`Could not process "${file.name}": ${e.message || e}`);
          return null;
        }
      });

      const certResults = certificateFiles.length > 0
        ? await Promise.all(certPromises)
        : [];

      const certificateAnalyses = certResults.filter(Boolean);
      if (certWarningsList.length > 0) {
        setCertWarnings(certWarningsList);
      }

      // 1. Submit to Intake API using FormData to support file uploads
      const formData = new FormData();
      formData.append("firstName", firstName);
      formData.append("lastName", lastName);
      formData.append("email", email);
      if (institutionalEmail.trim() !== "") {
        formData.append("institutionalEmail", institutionalEmail.trim());
      }
      formData.append("githubUsername", githubUsername);
      if (resumeFiles.length > 0) {
        formData.append("resumeFile", resumeFiles[0]);
      }
      if (certificateAnalyses.length > 0) {
        formData.append("certificateAnalyses", JSON.stringify(certificateAnalyses));
      }

      const res = await fetch("http://localhost:4000/api/verification/intake", {
        method: "POST",
        headers: {
          "x-api-key": apiKey || ""
        },
        body: formData
      });

      if (!res.ok) {
        let intakeError = "Failed to submit candidate for verification.";
        try {
          const errJson = await res.json();
          if (errJson.error) intakeError = errJson.error;
        } catch {}
        throw new Error(intakeError);
      }

      const data = await res.json();
      const jobId = data.jobId;

      setProgress(30);

      // 2. Poll for Completion
      const pollInterval = setInterval(async () => {
        try {
          setProgress(p => Math.min(p + 5, 90)); // Simulate slow progress
          const statusRes = await fetch(`http://localhost:4000/api/verification/jobs/${jobId}/status`, {
            headers: { "x-api-key": apiKey || "" }
          });
          const statusData = await statusRes.json();

          if (statusData.status === "COMPLETED") {
            clearInterval(pollInterval);
            setProgress(100);
            setTimeout(() => {
              router.push(`/report/${jobId}`);
            }, 600);
          } else if (statusData.status === "FAILED") {
            clearInterval(pollInterval);
            setGeneralError("Verification job failed: " + (statusData.errorMsg || "An unknown error occurred."));
            setIsProcessing(false);
          }
        } catch (e) {
          console.error("Polling error", e);
        }
      }, 2000);

    } catch (err: any) {
      console.error(err);
      setGeneralError(err.message || "An unexpected error occurred during submission.");
      setIsProcessing(false);
    }
  };

  const currentStep = isProcessing ? 1 : 0;

  if (apiKey === null) return null; // Prevent flash

  return (
    <div className="min-h-screen bg-[var(--bg-subtle)]">
      {/* Top Nav */}
      <div className="bg-[var(--bg-surface)] border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-[var(--brand-blue)] rounded-lg flex items-center justify-center">
              <ShieldCheck size={14} className="text-white" />
            </div>
            <span className="font-bold text-[var(--text-primary)]">VeriSphere</span>
            <span className="text-[var(--text-tertiary)]">/</span>
            <a href="/dashboard" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Dashboard</a>
            <span className="text-[var(--text-tertiary)]">/</span>
            <span className="text-sm text-[var(--text-primary)]">New Verification</span>
          </div>
        </div>
      </div>
      <div className="max-w-2xl mx-auto py-12 px-6">
        
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
                      backgroundColor: isDone ? "var(--verified)" : isActive ? "var(--brand-blue)" : "var(--bg-muted)",
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
                    animate={{ color: isActive ? "var(--brand-blue)" : isDone ? "var(--verified)" : "var(--text-tertiary)", fontWeight: isActive ? 600 : 400 }}
                    transition={{ duration: 0.2 }}
                    className="text-sm"
                  >
                    {step}
                  </motion.span>
                </div>
                {i < steps.length - 1 && (
                  <div className="w-8 h-px relative overflow-hidden bg-[var(--border-strong)]">
                    <motion.div className="absolute inset-y-0 left-0 bg-[var(--brand-blue)]" animate={{ width: i < currentStep ? "100%" : "0%" }} transition={{ duration: 0.4, ease: "easeOut" }} />
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
                <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }} className="text-2xl font-semibold text-[var(--text-primary)] mb-2 tracking-tight">
                  Submit a candidate for verification
                </motion.h1>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.18, duration: 0.4 }} className="text-[var(--text-secondary)]">
                  We'll cross-reference their resume, GitHub, and certificates in under 90 seconds.
                </motion.p>
              </div>

              <div className="space-y-6">
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">First Name</label>
                    <div className="relative flex items-center">
                      <User className="absolute left-4 text-[var(--text-tertiary)]" size={18} />
                      <input type="text" value={firstName} onChange={(e) => { setFirstName(e.target.value); if (errors.firstName) setErrors(prev => ({ ...prev, firstName: "" })); }} className="w-full bg-[var(--bg-subtle)] border border-[var(--border)] rounded-xl py-3 pl-12 pr-4 text-[var(--text-primary)] outline-none focus:border-[var(--brand-blue)] transition-colors" placeholder="John" />
                    </div>
                    {errors.firstName && <p className="text-xs text-[var(--danger)] mt-1.5 ml-1">{errors.firstName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Last Name</label>
                    <input type="text" value={lastName} onChange={(e) => { setLastName(e.target.value); if (errors.lastName) setErrors(prev => ({ ...prev, lastName: "" })); }} className="w-full bg-[var(--bg-subtle)] border border-[var(--border)] rounded-xl py-3 px-4 text-[var(--text-primary)] outline-none focus:border-[var(--brand-blue)] transition-colors" placeholder="Doe" />
                    {errors.lastName && <p className="text-xs text-[var(--danger)] mt-1.5 ml-1">{errors.lastName}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Email</label>
                  <div className="relative flex items-center mb-1">
                    <Mail className="absolute left-4 text-[var(--text-tertiary)]" size={18} />
                    <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors(prev => ({ ...prev, email: "" })); }} className="w-full bg-[var(--bg-subtle)] border border-[var(--border)] rounded-xl py-3 pl-12 pr-4 text-[var(--text-primary)] outline-none focus:border-[var(--brand-blue)] transition-colors" placeholder="john@example.com" />
                  </div>
                  {errors.email && <p className="text-xs text-[var(--danger)] mt-1.5 mb-3 ml-1">{errors.email}</p>}
                  
                  <label className="block text-sm font-medium text-[var(--text-primary)] mt-4 mb-2">Institutional Email (Optional)</label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-4 text-[var(--text-tertiary)]" size={18} />
                    <input type="email" value={institutionalEmail} onChange={(e) => { setInstitutionalEmail(e.target.value); if (errors.institutionalEmail) setErrors(prev => ({ ...prev, institutionalEmail: "" })); }} className="w-full bg-[var(--bg-subtle)] border border-[var(--border)] rounded-xl py-3 pl-12 pr-4 text-[var(--text-primary)] outline-none focus:border-[var(--brand-blue)] transition-colors" placeholder="john@university.edu" />
                  </div>
                  {errors.institutionalEmail ? (
                    <p className="text-xs text-[var(--danger)] mt-1.5 ml-1">{errors.institutionalEmail}</p>
                  ) : (
                    <p className="text-xs text-[var(--text-tertiary)] mt-2">Providing a .edu or institutional email speeds up academic verification.</p>
                  )}
                </div>

                <div className="border-y border-[var(--border)] py-6 space-y-6">
                  <div>
                    <FileDropZone label="Resume PDF" required onFilesChange={(files) => { setResumeFiles(files); if (errors.resume) setErrors(prev => ({ ...prev, resume: "" })); }} />
                    {errors.resume && <p className="text-xs text-[var(--danger)] mt-1 ml-1">{errors.resume}</p>}
                  </div>
                  
                  <div>
                    <FileDropZone label="Certificates (optional)" multiple onFilesChange={setCertificateFiles} />
                    {certWarnings.length > 0 && (
                      <div className="mt-3 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 space-y-1.5 text-xs text-amber-500">
                        <p className="font-semibold text-amber-400 mb-1">Some certificates had warnings but submission will proceed:</p>
                        {certWarnings.map((w, idx) => (
                          <div key={idx} className="flex items-start gap-1.5">
                            <span>•</span>
                            <span>{w}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
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
                      onChange={(e) => { setGithubUsername(e.target.value); if (errors.github) setErrors(prev => ({ ...prev, github: "" })); }}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      animate={{ boxShadow: isFocused ? "0 0 0 3px rgba(37,99,235,0.12), inset 0 0 0 1px var(--brand-blue)" : "none", borderColor: isFocused ? "var(--brand-blue)" : "var(--border)" }}
                      transition={{ duration: 0.18 }}
                      className="w-full bg-[var(--bg-subtle)] border border-[var(--border)] rounded-xl py-3 pl-[125px] pr-4 text-[var(--text-primary)] font-heading outline-none transition-colors"
                      placeholder="username"
                    />
                  </div>
                  {errors.github && <p className="text-xs text-[var(--danger)] mt-1.5 ml-1">{errors.github}</p>}
                </div>

                {generalError && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-[var(--danger)]"
                  >
                    {generalError}
                  </motion.div>
                )}

                <div className="pt-6">
                  <motion.button 
                    onClick={handleSubmit}
                    disabled={isProcessing}
                    whileHover={!isProcessing ? { scale: 1.01, y: -1 } : {}}
                    whileTap={!isProcessing ? { scale: 0.98, y: 0 } : {}}
                    className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-200 ${
                      isProcessing 
                        ? 'bg-[var(--bg-muted)] text-[var(--text-tertiary)] cursor-not-allowed' 
                        : 'bg-[var(--brand-blue)] text-white hover:bg-blue-700 shadow-sm'
                    }`}
                  >
                    {isProcessing ? "Processing..." : "Initialize Verification"} <ArrowRight size={18} />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="processing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[var(--bg-surface)] shadow-[var(--shadow-lg)] rounded-3xl p-10 border border-[var(--border)] relative overflow-hidden"
            >
              <div className="flex items-center gap-3 mb-10">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="w-10 h-10 rounded-full bg-[var(--brand-blue-light)] flex items-center justify-center">
                  <ShieldCheck className="text-[var(--brand-blue)]" size={20} />
                </motion.div>
                <div>
                  <h2 className="text-xl font-bold text-[var(--text-primary)]">Analyzing candidate...</h2>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">Forensic verification in progress</p>
                </div>
              </div>

              <div className="flex flex-col gap-1 mb-12">
                <ProcessingStage label="Parsing resume claims" delay={0} isActive={isProcessing} />
                <ProcessingStage label="Fetching GitHub repositories" delay={1200} isActive={isProcessing} />
                <ProcessingStage label="Cross-referencing skill evidence" delay={2400} isActive={isProcessing} />
                <ProcessingStage label="Generating trust report" delay={3600} isActive={isProcessing} />
              </div>

              {/* Progress Bar */}
              <div className="h-1.5 bg-[var(--bg-subtle)] rounded-full overflow-hidden">
                <motion.div className="h-full rounded-full bg-gradient-to-r from-[var(--brand-blue)] to-blue-400" initial={{ width: "0%" }} animate={{ width: `${progress}%` }} transition={{ ease: "linear", duration: 0.2 }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
