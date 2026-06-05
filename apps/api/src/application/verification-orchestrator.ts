import { AILayer, SYSTEM_PROMPT_VERIFICATION, TrustCalculator } from '../../../../packages/ai-layer/src/index';
import { 
  AuditReport, 
  VerificationJob, 
  ResumeData,
  GithubProfileMetrics
} from '../../../../packages/shared-types/src/index';
import { PrismaClient } from '@prisma/client';

export class VerificationOrchestrator {
  private aiLayer: AILayer;
  private trustCalculator: TrustCalculator;
  private prisma: PrismaClient;

  constructor() {
    this.aiLayer = new AILayer();
    this.trustCalculator = new TrustCalculator();
    this.prisma = new PrismaClient();
  }

  /**
   * Orchestrates the verification process for a given job.
   * Takes the raw evidence (Resume, GitHub) and passes it to the AI Layer,
   * then applies scoring algorithms, and FINALLY saves it to Supabase.
   */
  public async executeVerification(
    job: VerificationJob, 
    resume: ResumeData, 
    githubMetrics: GithubProfileMetrics,
    certificateValidityScore: number = 100 // Default to 100 if no cert is provided
  ): Promise<AuditReport> {
    
    console.log(`[Orchestrator] Starting verification for Job ID: ${job.id}`);
    
    // 1. Send data to AI Layer for extraction and semantic matching
    console.log(`[Orchestrator] Calling AI Layer...`);
    const aiResponse = await this.aiLayer.analyzeCandidate(
      resume.rawText, 
      githubMetrics, 
      SYSTEM_PROMPT_VERIFICATION
    );

    if (!aiResponse || !aiResponse.trustScore) {
      throw new Error("AI Layer returned an invalid or incomplete report.");
    }

    // 2. Inject the Certificate Validity Score (from Forensics Engine - Person 4)
    const rawScores = {
      resumeConsistency: aiResponse.trustScore.resumeConsistency,
      githubEvidence: aiResponse.trustScore.githubEvidence,
      contributionConfidence: aiResponse.trustScore.contributionConfidence,
      activityConfidence: aiResponse.trustScore.activityConfidence,
      certificateValidity: certificateValidityScore
    };

    // 3. Calculate final mathematically-sound trust scores
    console.log(`[Orchestrator] Calculating final trust score...`);
    const finalTrustScore = this.trustCalculator.calculateOverallScore(rawScores);

    // 4. Assemble final Audit Report
    const finalReport: AuditReport = {
      id: `rep_${Date.now()}`,
      jobId: job.id,
      generatedAt: new Date(),
      findingsSummary: aiResponse.findingsSummary || "No summary provided.",
      semanticMatches: aiResponse.semanticMatches || [],
      contradictions: aiResponse.contradictions || [],
      riskIndicators: aiResponse.riskIndicators || [],
      trustScore: finalTrustScore
    };

    // 5. Save everything to Supabase Database via Prisma
    console.log(`[Orchestrator] Saving Report to Supabase...`);
    await this.prisma.auditReport.create({
      data: {
        id: finalReport.id,
        jobId: finalReport.jobId,
        findingsSummary: finalReport.findingsSummary,
        semanticMatches: JSON.stringify(finalReport.semanticMatches),
        contradictions: JSON.stringify(finalReport.contradictions),
        riskIndicators: JSON.stringify(finalReport.riskIndicators),
        trustScore: JSON.stringify(finalReport.trustScore)
      }
    });

    // STEP 7: Save everything to DB and set status to COMPLETED
    await this.jobRepo.saveResults(
      jobId,
      {
        findingsSummary: auditResults.findingsSummary,
        semanticMatches: auditResults.semanticMatches,
        contradictions: auditResults.contradictions,
        riskIndicators: auditResults.riskIndicators as any,
        trustScore: auditResults.trustScore
      },
      scoreBreakdown,
      questionsResults.questions
    );

    console.log(`[Orchestrator] Verification complete & saved. Final Score: ${finalTrustScore.overallScore}`);
    
    return finalReport;
  }
}
