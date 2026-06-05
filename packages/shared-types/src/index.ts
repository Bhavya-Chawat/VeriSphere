/**
 * @file index.ts
 * @package @verisphere/shared-types
 * @purpose Defines the highly simplified TypeScript interfaces, enums, types, and DTOs used across frontend (web) and backend (api).
 */

// --- ENUMS ---

export enum VerificationStatus {
  QUEUED = "QUEUED",
  DOWNLOADING = "DOWNLOADING",
  EXTRACTING = "EXTRACTING",
  ANALYZING = "ANALYZING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED"
}

export enum RiskLevel {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL"
}

// --- CORE INTERFACES ---

export interface DocumentMetadata {
  producer?: string;
  creator?: string;
  creationDate?: Date;
  modificationDate?: Date;
  pageCount: number;
  pdfVersion: string;
  sha256Hash: string;
  fileSize: number;
}

export interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  institutionalEmail?: string;
  githubUrl?: string;
  createdAt: Date;
}

export interface VerificationJob {
  id: string;
  candidateId: string;
  status: VerificationStatus;
  startedAt: Date;
  completedAt?: Date;
  errorMsg?: string;
  githubMetricsJson?: string;
  resumeDataJson?: string;
  report?: AuditReport;
  createdAt: Date;
}

export interface AcademicVerificationResult {
  claimedInstitution: string;
  normalizedInstitution: string;
  degree: string;
  specialization?: string;
  graduationTimeline: string;
  domainMatch: boolean;
  institutionVerified: boolean;
  confidenceScore: number; // 0-1
  evidenceLevel: "STRONG" | "MODERATE" | "NONE" | "CONTRADICTORY";
  riskFlags: string[];
}

export interface AuditReport {
  id: string;
  jobId: string;
  trustScore: number; // 0-100 overall score
  findingsSummary: string;
  semanticMatchJson: string; // Stores the detailed matches
  academicVerificationJson?: string; // Stores AcademicVerificationResult[] as JSON
  contradictions: string[];
  riskIndicatorsJson: string; // Stores risks as JSON
  createdAt: Date;
}

// --- API DATA TRANSFER OBJECTS (DTOs) ---

export interface CreateCandidateRequest {
  firstName: string;
  lastName: string;
  email: string;
  institutionalEmail?: string;
  githubUrl?: string;
  resumeFileUrl: string;
  certificateUrls: string[];
}

export interface CreateCandidateResponse {
  success: boolean;
  candidateId: string;
  jobId: string;
}

export interface GetJobStatusResponse {
  jobId: string;
  candidateId: string;
  status: VerificationStatus;
  progressPercent: number;
  startedAt: Date;
  completedAt?: Date;
  errors?: string[];
}

export interface VerificationReportResponse {
  candidate: Candidate;
  job: VerificationJob;
  report: AuditReport;
}

// Need to keep these so that the AI layer doesn't break
export interface GithubProfileMetrics {
  id: string;
  candidateId: string;
  githubUsername: string;
  publicReposCount: number;
  followersCount: number;
  followingCount: number;
  accountAgeMonths: number;
  totalCommitsCollected: number;
  analyzedRepos: any[];
  timelineAnomalyAlerts: string[];
  hasTimelineGaps: boolean;
}

export interface AcademicProfile {
  institutionName: string;
  degreeName: string;
  branchOrSpecialization: string;
  cgpaOrPercentage: string;
  graduationYear: string;
  enrollmentYear: string;
  honors: string[];
  certifications: string[];
}

export interface ResumeData {
  id: string;
  candidateId: string;
  fileUrl: string;
  rawText: string;
  skills: string[];
  education: Array<any>;
  academicProfile?: AcademicProfile; // Extracted academic claims
  experience: Array<any>;
  projects: Array<any>;
}

export interface TrustScoreBreakdown {
  overallScore: number; // 0-100
  resumeConsistency: number; // 0-100
  githubEvidence: number; // 0-100
  academicScore: number; // 0-100
  certificateValidity: number; // 0-100
  contributionConfidence: number; // 0-100
  activityConfidence: number; // 0-100
}

export interface SemanticMatchResult {
  claimedSkill: string;
  matchedRepo?: string;
  evidenceLevel: "STRONG" | "MODERATE" | "NONE" | "CONTRADICTORY";
  notes: string;
}

export * from "./forensics";
