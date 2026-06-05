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
   */
  public async executeVerification(
    job: VerificationJob, 
    resume: ResumeData, 
    githubMetrics: GithubProfileMetrics,
    certificateValidityScore: number = 100
  ): Promise<AuditReport> {
    
    console.log(`[Orchestrator] Starting verification for Job ID: ${job.id}`);
    
    // 1. Send data to AI Layer for extraction and semantic matching
    console.log(`[Orchestrator] Calling AI Layer...`);
    const aiResponse: any = await this.aiLayer.analyzeCandidate(
      resume.rawText, 
      githubMetrics, 
      SYSTEM_PROMPT_VERIFICATION
    );

    if (!aiResponse) {
      throw new Error("AI Layer returned an empty response.");
    }

    // 2. Extract trust score sub-fields from the nested trustScore object
    const aiTrustScore = aiResponse.trustScore || {};
    const rawScores = {
      resumeConsistency: typeof aiTrustScore === 'object' ? (aiTrustScore.resumeConsistency ?? 70) : 70,
      githubEvidence: typeof aiTrustScore === 'object' ? (aiTrustScore.githubEvidence ?? 70) : 70,
      contributionConfidence: typeof aiTrustScore === 'object' ? (aiTrustScore.contributionConfidence ?? 70) : 70,
      activityConfidence: typeof aiTrustScore === 'object' ? (aiTrustScore.activityConfidence ?? 70) : 70,
      certificateValidity: certificateValidityScore
    };

    // 3. Calculate final mathematically-sound trust score
    console.log(`[Orchestrator] Calculating final trust score...`);
    const finalTrustScore = this.trustCalculator.calculateOverallScore(rawScores);
    
    // Use overallScore from AI if calculator gives 0 (fallback)
    const trustScoreValue = finalTrustScore.overallScore > 0 
      ? finalTrustScore.overallScore 
      : (typeof aiTrustScore === 'object' ? (aiTrustScore.overallScore ?? 70) : 70);

    // 4. Assemble final Audit Report
    const finalReport: AuditReport = {
      id: `rep_${Date.now()}`,
      jobId: job.id,
      createdAt: new Date(),
      findingsSummary: aiResponse.findingsSummary || "No summary provided.",
      semanticMatchJson: JSON.stringify(aiResponse.semanticMatches || []),
      contradictions: aiResponse.contradictions || [],
      riskIndicatorsJson: JSON.stringify(aiResponse.riskIndicators || []),
      trustScore: trustScoreValue
    };

    try {
      // 5. Save everything to Supabase Database via Prisma
      console.log(`[Orchestrator] Saving Report to Supabase...`);
      await this.prisma.auditReport.create({
        data: {
          jobId: finalReport.jobId,
          findingsSummary: finalReport.findingsSummary,
          semanticMatchJson: finalReport.semanticMatchJson,
          contradictions: finalReport.contradictions,
          trustScore: finalReport.trustScore,
          riskIndicatorsJson: finalReport.riskIndicatorsJson
        }
      });

      // Update job status to COMPLETED and attach raw JSON data
      await this.prisma.verificationJob.update({
        where: { id: job.id },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
          githubMetricsJson: JSON.stringify(githubMetrics),
          resumeDataJson: JSON.stringify(resume)
        }
      });
      
      console.log(`[Orchestrator] Verification complete & saved. Final Score: ${trustScoreValue}`);
    } catch (dbError: any) {
      console.warn(`[Orchestrator] Failed to save to database:`, dbError.message);
      throw dbError; // Re-throw so job status gets set to FAILED properly
    }
    
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
        
        await this.prisma.verificationJob.update({
          where: { id: jobId },
          data: { status: "ANALYZING" }
        });

        const job: VerificationJob = {
          id: jobId,
          candidateId,
          status: "ANALYZING" as any,
          startedAt: new Date(),
          createdAt: new Date()
        };

        // In a real app, extract from the uploaded resume file.
        // For the demo, use mock resume text that matches the mock AI response profile.
        const resume: ResumeData = {
          id: `res_${Date.now()}`,
          candidateId,
          fileUrl: "",
          rawText: "Arjun Sharma - Senior Software Engineer. 5 years of experience with Node.js, React, TypeScript, PostgreSQL, Docker, and AWS. Built fintrack-api and fintrack-frontend. Holds AWS Solutions Architect certification.",
          skills: ["Node.js", "React", "TypeScript", "PostgreSQL", "Docker", "AWS"],
          education: [{ degree: "B.Tech Computer Science", institution: "IIT Bombay", year: 2018 }],
          experience: [
            { title: "Senior Engineer", company: "Razorpay", years: 2 },
            { title: "Software Engineer", company: "Flipkart", years: 2 }
          ],
          projects: [{ name: "fintrack-api" }, { name: "fintrack-frontend" }]
        };

        const githubMetrics: GithubProfileMetrics = {
          id: `git_${Date.now()}`,
          candidateId,
          githubUsername: "arjun-sharma-dev",
          publicReposCount: 12,
          followersCount: 89,
          followingCount: 45,
          accountAgeMonths: 36,
          totalCommitsCollected: 847,
          analyzedRepos: [
            { name: "fintrack-api", language: "TypeScript", commits: 340, stars: 23 },
            { name: "fintrack-frontend", language: "React", commits: 210, stars: 18 },
            { name: "devops-playground", language: "Shell", commits: 45, stars: 3 },
            { name: "algo-practice", language: "Python", commits: 180, stars: 7 },
            { name: "portfolio-site", language: "JavaScript", commits: 72, stars: 5 }
          ],
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
          console.error(`[Orchestrator] Could not update job to FAILED status:`, e);
        }
      }
    })();
  }
}
