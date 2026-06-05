/**
 * @file index.ts
 * @package @verisphere/shared-types
 * @purpose Defines the shared TypeScript interfaces, enums, types, and DTOs used across frontend (web) and backend (api).
 * @dependencies None (pure TypeScript contract file)
 * @security Consider scrubbing PII (e.g. candidate name, raw emails) before transmitting logs containing these payloads.
 * @future_implementation Include runtime validators (like Zod or io-ts) generated from these interfaces.
 */
export declare enum VerificationStatus {
    QUEUED = "QUEUED",
    DOWNLOADING = "DOWNLOADING",
    EXTRACTING = "EXTRACTING",
    ANALYZING = "ANALYZING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED"
}
export declare enum RiskLevel {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
    CRITICAL = "CRITICAL"
}
export declare enum FileType {
    RESUME = "RESUME",
    CERTIFICATE = "CERTIFICATE"
}
export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    organizationId?: string;
    role: "USER" | "ADMIN" | "ORGANIZATION_ADMIN";
    createdAt: Date;
}
export interface Organization {
    id: string;
    name: string;
    slug: string;
    createdAt: Date;
}
export interface Candidate {
    id: string;
    organizationId: string;
    firstName: string;
    lastName: string;
    email: string;
    githubUrl?: string;
    createdAt: Date;
}
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
export interface CertificateVerification {
    id: string;
    candidateId: string;
    fileUrl: string;
    fileName: string;
    extractedMetadata: DocumentMetadata;
    issuerName?: string;
    recipientName?: string;
    issueDate?: Date;
    expiryDate?: Date;
    isTampered: boolean;
    tamperScore: number;
    tamperSignals: string[];
}
export interface ResumeData {
    id: string;
    candidateId: string;
    fileUrl: string;
    rawText: string;
    skills: string[];
    education: Array<{
        institution: string;
        degree: string;
        startYear?: number;
        endYear?: number;
    }>;
    experience: Array<{
        company: string;
        role: string;
        startDate?: string;
        endDate?: string;
        description: string;
    }>;
    projects: Array<{
        name: string;
        description: string;
        technologies: string[];
    }>;
}
export interface CommitActivityMetrics {
    totalCommits: number;
    additions: number;
    deletions: number;
    weeklyTimeline: Array<{
        weekTimestamp: number;
        commitCount: number;
    }>;
    hourlyDistribution: number[];
    authorEmails: string[];
}
export interface GithubRepoMetrics {
    repoName: string;
    fullName: string;
    isFork: boolean;
    forkSourceUrl?: string;
    starsCount: number;
    forksCount: number;
    primaryLanguage: string;
    languagesBreakdown: Record<string, number>;
    createdAt: Date;
    updatedAt: Date;
    pushedAt: Date;
    contributorsList: string[];
    candidateCommitsCount: number;
    isOwnershipSuspicious: boolean;
    ownershipConfidenceScore: number;
    anomalyIndicators: string[];
}
export interface GithubProfileMetrics {
    id: string;
    candidateId: string;
    githubUsername: string;
    publicReposCount: number;
    followersCount: number;
    followingCount: number;
    accountAgeMonths: number;
    totalCommitsCollected: number;
    analyzedRepos: GithubRepoMetrics[];
    timelineAnomalyAlerts: string[];
    hasTimelineGaps: boolean;
}
export interface RiskIndicator {
    category: "METADATA_MISMATCH" | "CLONED_REPOSITORY" | "IDENTITY_MISMATCH" | "TIMELINE_ANOMALY" | "SUSPICIOUS_PROVIDER";
    severity: RiskLevel;
    description: string;
    evidence: string;
}
export interface TrustScoreBreakdown {
    overallScore: number;
    resumeConsistency: number;
    githubEvidence: number;
    certificateValidity: number;
    contributionConfidence: number;
    activityConfidence: number;
}
export interface SemanticMatchResult {
    claimedSkill: string;
    matchedRepo?: string;
    evidenceLevel: "STRONG" | "MODERATE" | "NONE" | "CONTRADICTORY";
    notes: string;
}
export interface AuditReport {
    id: string;
    jobId: string;
    generatedAt: Date;
    findingsSummary: string;
    semanticMatches: SemanticMatchResult[];
    contradictions: string[];
    riskIndicators: RiskIndicator[];
    trustScore: TrustScoreBreakdown;
}
export interface InterviewQuestion {
    id: string;
    question: string;
    expectedAnswerOutline: string;
    targetedSkillOrClaim: string;
    severityReason: string;
    difficulty: "EASY" | "MEDIUM" | "HARD";
}
export interface VerificationJob {
    id: string;
    candidateId: string;
    status: VerificationStatus;
    startedAt: Date;
    completedAt?: Date;
    errorMessage?: string;
    report?: AuditReport;
    questions?: InterviewQuestion[];
}
export interface CreateCandidateRequest {
    firstName: string;
    lastName: string;
    email: string;
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
    questions: InterviewQuestion[];
}
export * from "./forensics";
//# sourceMappingURL=index.d.ts.map