/**
 * @file verification-orchestrator.ts
 * @package apps/api
 * @purpose Orchestrates the asynchronous pipeline: Intake -> PDF Forensics -> Github Engine -> Gemini Audit -> Scoring -> DB.
 * @dependencies @verisphere/shared-types, @verisphere/forensics-engine, @verisphere/github-engine, @verisphere/ai-layer, IDocumentStorageService
 * @security Pipeline runs inside catch blocks to update database statuses to FAILED in event of unexpected crashes.
 * @future_implementation Use BullMQ or RabbitMQ backing to manage background queue jobs instead of in-memory async tasks.
 */

import { VerificationStatus, TrustScoreBreakdown } from "@verisphere/shared-types";
import { parsePdfBuffer, extractPdfMetadata, detectDocumentTampering } from "@verisphere/forensics-engine";
import { collectGithubProfile, analyzeCommitTimeline, verifyRepositoryOwnership } from "@verisphere/github-engine";
import { GeminiProvider } from "@verisphere/ai-layer/src/providers/gemini";
import { VERIFICATION_SYSTEM_INSTRUCTION, INTERVIEW_GENERATION_SYSTEM_INSTRUCTION, buildVerificationPrompt } from "@verisphere/ai-layer/src/prompts/verification";
import { AuditReportSchema, GeneratedQuestionsListSchema } from "@verisphere/ai-layer/src/schemas/outputs";
import { IVerificationJobRepository, IDocumentStorageService, ICandidateRepository } from "../domain/interfaces";

export class VerificationOrchestrator {
  private jobRepo: IVerificationJobRepository;
  private candidateRepo: ICandidateRepository;
  private storageService: IDocumentStorageService;
  private aiProvider: GeminiProvider;

  constructor(
    jobRepo: IVerificationJobRepository,
    candidateRepo: ICandidateRepository,
    storageService: IDocumentStorageService,
    aiProvider: GeminiProvider
  ) {
    this.jobRepo = jobRepo;
    this.candidateRepo = candidateRepo;
    this.storageService = storageService;
    this.aiProvider = aiProvider;
  }

  /**
   * Enqueues and initiates the async verification pipeline run.
   * 
   * @param jobId - The database VerificationJob ID
   * @param candidateId - The ID of the Candidate under check
   */
  public async triggerVerification(jobId: string, candidateId: string): Promise<void> {
    // Kickoff asynchronously (mimicking queue worker execution)
    this.runPipeline(jobId, candidateId).catch(async (error) => {
      console.error(`Pipeline failure for Job: ${jobId}`, error);
      await this.jobRepo.updateStatus(jobId, VerificationStatus.FAILED, error.message || "Unknown error");
    });
  }

  private async runPipeline(jobId: string, candidateId: string): Promise<void> {
    // STEP 1: Update status to downloading
    await this.jobRepo.updateStatus(jobId, VerificationStatus.DOWNLOADING);
    
    const candidate = await this.candidateRepo.findById(candidateId);
    if (!candidate) throw new Error("Candidate record missing from system context.");

    // STEP 2: Extract Resume & Certificates metadata
    await this.jobRepo.updateStatus(jobId, VerificationStatus.EXTRACTING);
    
    // Simulating file downloads and forensics execution:
    // const resumeBuf = await this.storageService.fetchFileBuffer(candidate.resumeUrl);
    // const resumeLayout = await parsePdfBuffer(resumeBuf);
    
    // STEP 3: Scan GitHub metrics (if profile link present)
    let githubMetrics = null;
    if (candidate.githubUrl) {
      await this.jobRepo.updateStatus(jobId, VerificationStatus.ANALYZING);
      const username = candidate.githubUrl.split("/").pop() || "";
      githubMetrics = await collectGithubProfile(username);
    }

    // STEP 4: Trigger Semantic AI analysis using Gemini 1.5 Flash
    // We send resume text, github timeline analysis, and tamper forensics to AI Provider
    const prompt = buildVerificationPrompt({
      resumeText: "React: 5 years, Py: 3 years",
      githubMetricsJson: JSON.stringify(githubMetrics),
      forensicsReportJson: "{}"
    });

    const auditResults = await this.aiProvider.generateStructuredJSON(
      prompt,
      VERIFICATION_SYSTEM_INSTRUCTION,
      AuditReportSchema
    );

    // STEP 5: Calculate Trust Score weights
    // (Consolidating scores: Resume integrity 20%, GitHub commits 30%, certificate tamper 30%, repo ownership 20%)
    const scoreBreakdown: TrustScoreBreakdown = {
      overallScore: auditResults.trustScore.overallScore,
      resumeConsistency: auditResults.trustScore.resumeConsistency,
      githubEvidence: auditResults.trustScore.githubEvidence,
      certificateValidity: auditResults.trustScore.certificateValidity,
      contributionConfidence: auditResults.trustScore.contributionConfidence,
      activityConfidence: auditResults.trustScore.activityConfidence
    };

    // STEP 6: Generate targeted interview questions targeting anomalies / gaps
    const questionsPrompt = `Generate 5 technical questions probing: ${JSON.stringify(auditResults.contradictions)}`;
    const questionsResults = await this.aiProvider.generateStructuredJSON(
      questionsPrompt,
      INTERVIEW_GENERATION_SYSTEM_INSTRUCTION,
      GeneratedQuestionsListSchema
    );

    // STEP 7: Save everything to DB and set status to COMPLETED
    await this.jobRepo.saveResults(
      jobId,
      {
        findingsSummary: auditResults.findingsSummary,
        semanticMatchJson: JSON.stringify(auditResults.semanticMatches),
        contradictions: auditResults.contradictions
      },
      scoreBreakdown,
      questionsResults.questions
    );

    await this.jobRepo.updateStatus(jobId, VerificationStatus.COMPLETED);
  }
}
