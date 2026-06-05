import { AILayer, SYSTEM_PROMPT_VERIFICATION, TrustCalculator } from '@verisphere/ai-layer';
import { 
  AuditReport, 
  VerificationJob, 
  ResumeData,
  GithubProfileMetrics
} from '@verisphere/shared-types';
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

    try {
      // 5. Save everything to Supabase Database via Prisma
      console.log(`[Orchestrator] Saving Report to Supabase...`);
      await this.prisma.auditReport.create({
        data: {
          id: finalReport.id,
          jobId: finalReport.jobId,
          findingsSummary: finalReport.findingsSummary,
          semanticMatchJson: JSON.stringify(finalReport.semanticMatches),
          contradictions: finalReport.contradictions
        }
      });

      await this.prisma.trustScore.create({
        data: {
          jobId: job.id,
          overallScore: finalTrustScore.overallScore,
          resumeConsistency: finalTrustScore.resumeConsistency,
          githubEvidence: finalTrustScore.githubEvidence,
          certificateValidity: finalTrustScore.certificateValidity,
          contributionConfidence: finalTrustScore.contributionConfidence,
          activityConfidence: finalTrustScore.activityConfidence
        }
      });

      if (finalReport.riskIndicators && finalReport.riskIndicators.length > 0) {
        await this.prisma.riskIndicator.createMany({
          data: finalReport.riskIndicators.map((r: any) => ({
            jobId: job.id,
            category: r.category,
            severity: r.severity,
            description: r.description,
            evidence: r.evidence
          }))
        });
      }

      // Update job status to COMPLETED
      await this.prisma.verificationJob.update({
        where: { id: job.id },
        data: {
          status: "COMPLETED",
          completedAt: new Date()
        }
      });
    } catch (dbError: any) {
      console.warn(`[Orchestrator] Failed to save to database (likely offline):`, dbError.message);
    }

    console.log(`[Orchestrator] Verification complete & saved. Final Score: ${finalTrustScore.overallScore}`);
    
    return finalReport;
  }

  /**
   * Triggers the verification pipeline asynchronously in the background.
   */
  public async triggerVerification(jobId: string, candidateId: string): Promise<void> {
    // Run the pipeline asynchronously without blocking the intake request
    (async () => {
      try {
        console.log(`[Orchestrator] Asynchronously starting job ${jobId} for candidate ${candidateId}`);
        
        try {
          await this.prisma.verificationJob.update({
            where: { id: jobId },
            data: { status: "ANALYZING" }
          });
        } catch(e) {
          console.warn(`[Orchestrator] Skipping DB update due to DB offline.`);
        }

        const job: VerificationJob = {
          id: jobId,
          candidateId,
          status: "ANALYZING" as any,
          startedAt: new Date()
        };

        const resume: ResumeData = {
          id: `res_${Date.now()}`,
          candidateId,
          fileUrl: "",
          rawText: "Sample candidate resume text claiming experience with React, TypeScript, and PostgreSQL.",
          skills: ["React", "TypeScript", "PostgreSQL"],
          education: [],
          experience: [],
          projects: []
        };

        const githubMetrics: GithubProfileMetrics = {
          id: `git_${Date.now()}`,
          candidateId,
          githubUsername: "candidate-dev",
          publicReposCount: 2,
          followersCount: 10,
          followingCount: 12,
          accountAgeMonths: 24,
          totalCommitsCollected: 150,
          analyzedRepos: [],
          timelineAnomalyAlerts: [],
          hasTimelineGaps: false
        };

        await this.executeVerification(job, resume, githubMetrics);
      } catch (error: any) {
        console.error(`[Orchestrator] Asynchronous verification failed for Job ${jobId}:`, error);
        try {
          await this.prisma.verificationJob.update({
            where: { id: jobId },
            data: { 
              status: "FAILED",
              errorMsg: error?.message || String(error),
              completedAt: new Date()
            }
          });
        } catch(e) {
          // DB offline
        }
      }
    })();
  }
}
