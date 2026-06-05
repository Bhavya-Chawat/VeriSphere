/**
 * @file page.tsx
 * @package apps/web
 * @purpose Form view to upload resumes, certificates, and github parameters to launch a verification job.
 * @dependencies react, lucide-react, UploadZone (internal component)
 * @security Ensure file uploads are size-limited. Scrub sensitive inputs before payload post.
 * @future_implementation Wire state values with Next.js Server Actions or API routes.
 */

"use client";

import React, { useState } from "react";
import { UploadZone } from "@/components/upload-zone";
import { Send, Sparkles, ShieldCheck } from "lucide-react";

export default function VerifyCandidatePage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [certificates, setCertificates] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Future API call logic mapping:
    // await fetch('/api/verification/intake', { method: 'POST', body: JSON.stringify({...}) });
    setTimeout(() => {
      setIsSubmitting(false);
      alert("Verification Job triggered! Redirecting to dashboard...");
    }, 1500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
          <Sparkles className="w-8 h-8 text-emerald-400" /> Verify Profile
        </h1>
        <p className="text-sm text-slate-400">
          Upload documents and GitHub parameters. VeriSphere forensic engines will process credentials in parallel.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-slate-900/20 border border-slate-800 p-8 rounded-2xl">
        <h3 className="text-lg font-semibold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" /> Candidate Profile Information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase">First Name</label>
            <input
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
              placeholder="E.g. Sarah"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase">Last Name</label>
            <input
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
              placeholder="E.g. Jenkins"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
              placeholder="candidate@email.com"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase">GitHub Profile URL</label>
            <input
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
              placeholder="https://github.com/username"
            />
          </div>
        </div>

        {/* Upload Zone Component mount points */}
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase">Resume Document (PDF)</label>
            <UploadZone
              label="Upload Resume PDF (Max 5MB)"
              accept=".pdf"
              onUploadComplete={(url) => setResumeUrl(url)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase">Certifications (Multiple PDFs)</label>
            <UploadZone
              label="Upload Certification PDFs (Max 5MB each)"
              accept=".pdf"
              onUploadComplete={(url) => setCertificates((prev) => [...prev, url])}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !resumeUrl}
          className="w-full mt-8 py-3 rounded-lg font-bold bg-emerald-500 hover:bg-emerald-600 text-slate-950 disabled:opacity-40 disabled:hover:bg-emerald-500 transition-all flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            "Launching Forensic Audit..."
          ) : (
            <>
              Submit for Verification <Send className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
