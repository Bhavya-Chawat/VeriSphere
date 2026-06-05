/**
 * @file outputs.ts
 * @package @verisphere/ai-layer
 * @purpose Defines the Zod schemas matching the shared-types interface specifications to force structured JSON parsing from Gemini.
 * @dependencies zod, @verisphere/shared-types
 * @security Schema structures must strictly define fields to avoid unstructured text spilling over into JSON keys.
 * @future_implementation Sync changes to packages/shared-types automatically to prevent schemas from getting out of sync with models.
 */

import { z } from "zod";

export const RiskIndicatorSchema = z.object({
  category: z.enum([
    "METADATA_MISMATCH",
    "CLONED_REPOSITORY",
    "IDENTITY_MISMATCH",
    "TIMELINE_ANOMALY",
    "SUSPICIOUS_PROVIDER"
  ]),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  description: z.string().describe("Detail of what was flagged."),
  evidence: z.string().describe("Exact proof/logs where this discrepancy was found.")
});

export const SemanticMatchSchema = z.object({
  claimedSkill: z.string(),
  matchedRepo: z.string().optional(),
  evidenceLevel: z.enum(["STRONG", "MODERATE", "NONE", "CONTRADICTORY"]),
  notes: z.string()
});

export const AcademicProfileSchema = z.object({
  institutionName: z.string(),
  degreeName: z.string(),
  branchOrSpecialization: z.string(),
  cgpaOrPercentage: z.string(),
  graduationYear: z.string(),
  enrollmentYear: z.string(),
  honors: z.array(z.string()),
  certifications: z.array(z.string())
});

export const TrustScoreBreakdownSchema = z.object({
  overallScore: z.number().min(0).max(100),
  resumeConsistency: z.number().min(0).max(100),
  githubEvidence: z.number().min(0).max(100),
  academicScore: z.number().min(0).max(100),
  certificateValidity: z.number().min(0).max(100),
  contributionConfidence: z.number().min(0).max(100),
  activityConfidence: z.number().min(0).max(100)
});

export const AuditReportSchema = z.object({
  findingsSummary: z.string(),
  academicProfile: AcademicProfileSchema.optional(),
  semanticMatches: z.array(SemanticMatchSchema),
  contradictions: z.array(z.string()),
  riskIndicators: z.array(RiskIndicatorSchema),
  trustScore: TrustScoreBreakdownSchema
});

export const InterviewQuestionSchema = z.object({
  question: z.string(),
  expectedAnswerOutline: z.string().describe("A technical checklist of topics the candidate should hit in their answer."),
  targetedSkillOrClaim: z.string().describe("The specific claim from the resume that is being probed."),
  severityReason: z.string().describe("Why this question was generated (e.g. lack of github commits, suspicious modification dates)."),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"])
});

export const GeneratedQuestionsListSchema = z.object({
  questions: z.array(InterviewQuestionSchema)
});
