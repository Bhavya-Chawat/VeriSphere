/**
 * @file forensics.ts
 * @package @verisphere/shared-types
 * @purpose Defines the shared forensic analysis TypeScript structures for document verification.
 */
export declare enum Severity {
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
    tamperScore: number;
    tamperSignals: string[];
    metadata: PdfMetadata;
    findings: ForensicFinding[];
}
export interface TrustScoreBreakdown {
    overallScore: number;
    resumeConsistency: number;
    githubEvidence: number;
    certificateValidity: number;
    contributionConfidence: number;
    activityConfidence: number;
}
//# sourceMappingURL=forensics.d.ts.map