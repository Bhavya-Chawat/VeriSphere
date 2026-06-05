/**
 * @file forensics.ts
 * @package @verisphere/shared-types
 * @purpose Defines the shared forensic analysis TypeScript structures for document verification.
 */

export enum Severity {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL"
}

export interface ForensicFinding {
  category: "METADATA_MISMATCH" | "CLONED_REPOSITORY" | "IDENTITY_MISMATCH" | "TIMELINE_ANOMALY" | "SUSPICIOUS_PROVIDER";
  severity: Severity;
  description: string;
  evidence: string;
}

export interface PdfMetadata {
  title?: string;
  author?: string;
  producer?: string;
  creator?: string;
  creationDate?: Date;
  modificationDate?: Date;
  pageCount: number;
  pdfVersion: string;
  sha256Hash: string;
  fileSize: number;
}

export interface CertificateAnalysisResult {
  isTampered: boolean;
  tamperScore: number; // 0 to 100
  tamperSignals: string[];
  metadata: PdfMetadata;
  findings: ForensicFinding[];
}

export interface TrustScoreBreakdown {
  overallScore: number; // 0 to 100
  resumeConsistency: number; // 0 to 100
  githubEvidence: number; // 0 to 100
  certificateValidity: number; // 0 to 100
  contributionConfidence: number; // 0 to 100
  activityConfidence: number; // 0 to 100
}
