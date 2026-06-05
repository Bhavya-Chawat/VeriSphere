import { AILayer, SYSTEM_PROMPT_VERIFICATION, TrustCalculator } from '@verisphere/ai-layer';
import { 
  AuditReport, 
  VerificationJob, 
  ResumeData,
  GithubProfileMetrics
} from '@verisphere/shared-types';
import { PrismaClient } from '@prisma/client';
import { parsePdfBuffer, verifyAcademicProfile } from '@verisphere/forensics-engine';
import fs from 'fs';

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
    certificateValidityScore: number = 100,
    institutionalEmail?: string
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

    // Academic Verification
    console.log(`[Orchestrator] Running Academic Verification...`);
    const academicVerificationResults = verifyAcademicProfile(
      aiResponse.academicProfile,
      institutionalEmail
    );
    
    const academicScore = academicVerificationResults.length > 0 
      ? academicVerificationResults[0].confidenceScore * 100 
      : 50;

    // 2. Extract trust score sub-fields from the nested trustScore object
    const aiTrustScore = aiResponse.trustScore || {};
    const rawScores = {
      resumeConsistency: typeof aiTrustScore === 'object' ? (aiTrustScore.resumeConsistency ?? 70) : 70,
      githubEvidence: typeof aiTrustScore === 'object' ? (aiTrustScore.githubEvidence ?? 70) : 70,
      contributionConfidence: typeof aiTrustScore === 'object' ? (aiTrustScore.contributionConfidence ?? 70) : 70,
      activityConfidence: typeof aiTrustScore === 'object' ? (aiTrustScore.activityConfidence ?? 70) : 70,
      academicScore: academicScore,
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
      academicVerificationJson: JSON.stringify(academicVerificationResults),
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
          academicVerificationJson: finalReport.academicVerificationJson,
          contradictions: finalReport.contradictions,
          trustScore: Math.round(trustScoreValue),
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
  public async triggerVerification(jobId: string, candidateId: string, resumeFileUrl?: string): Promise<void> {
    // Run the pipeline asynchronously without blocking the intake request
    (async () => {
      try {
        console.log(`[Orchestrator] Asynchronously starting job ${jobId} for candidate ${candidateId}`);
        
        await this.prisma.verificationJob.update({
          where: { id: jobId },
          data: { status: "ANALYZING" }
        });

        const candidateRecord = await this.prisma.candidate.findUnique({
          where: { id: candidateId }
        });
        
        if (!candidateRecord) {
          throw new Error(`Candidate ${candidateId} not found`);
        }

        const job: VerificationJob = {
          id: jobId,
          candidateId,
          status: "ANALYZING" as any,
          startedAt: new Date(),
          createdAt: new Date()
        };

        let rawText = `${candidateRecord.firstName} ${candidateRecord.lastName} - Candidate Profile.`;
        
        // Parse the actual uploaded PDF resume if provided
        if (resumeFileUrl && fs.existsSync(resumeFileUrl)) {
          console.log(`[Orchestrator] Parsing uploaded PDF resume: ${resumeFileUrl}`);
          const pdfBuffer = fs.readFileSync(resumeFileUrl);
          const parsedPdf = await parsePdfBuffer(pdfBuffer);
          rawText = parsedPdf.rawText;
        }

        const resume: ResumeData = {
          id: `res_${Date.now()}`,
          candidateId,
          fileUrl: resumeFileUrl || "",
          rawText,
          skills: [],
          education: [],
          experience: [],
          projects: []
        };

        let githubMetrics: GithubProfileMetrics = {
          id: `git_${Date.now()}`,
          candidateId,
          githubUsername: "unknown",
          publicReposCount: 0,
          followersCount: 0,
          followingCount: 0,
          accountAgeMonths: 0,
          totalCommitsCollected: 0,
          analyzedRepos: [],
          timelineAnomalyAlerts: [],
          hasTimelineGaps: false
        };

        if (candidateRecord.githubUrl) {
          try {
            console.log(`[Orchestrator] Fetching live GitHub evidence for ${candidateRecord.githubUrl}`);
            const { scrapeGithubEvidence } = await import('@verisphere/github-engine');
            const githubEvidenceReport = await scrapeGithubEvidence(candidateRecord.githubUrl);
            
            githubMetrics = {
              id: `git_${Date.now()}`,
              candidateId,
              githubUsername: githubEvidenceReport.username,
              publicReposCount: githubEvidenceReport.repositories.length,
              followersCount: 0, // Mocked for now since not returned by engine
              followingCount: 0, // Mocked for now
              accountAgeMonths: 12, // Mocked for now
              totalCommitsCollected: githubEvidenceReport.repoEvidence.reduce((acc, r) => acc + r.totalCommits, 0),
              analyzedRepos: githubEvidenceReport.repoEvidence.map(r => ({
                name: r.repoName,
                language: r.primaryLanguage,
                commits: r.totalCommits,
                stars: 0, // Mocked for now
                recentCommits: r.recentCommits
              })),
              timelineAnomalyAlerts: githubEvidenceReport.timelineFlags.map(f => f.type),
              hasTimelineGaps: githubEvidenceReport.timelineFlags.length > 0
            };
            
            // Remove fake skill injection; actual resume parsing handles skills now.
            resume.skills = githubEvidenceReport.verifiedSkills;
            
          } catch (githubErr) {
            console.error(`[Orchestrator] GitHub Scraping failed:`, githubErr);
            // We proceed with empty githubMetrics if scraping fails
          }
        }

        await this.executeVerification(
          job, 
          resume, 
          githubMetrics, 
          100, // certificateValidityScore
          candidateRecord.institutionalEmail || undefined
        );
      } catch (error: any) {
        console.error(`[Orchestrator] Asynchronous verification failed for Job ${jobId}:`, error);
        try {
          await this.prisma.verificationJob.update({
            where: { id: jobId },
            data: { 
              status: "FAILED",
              errorMsg: error instanceof Error ? error.message : "Unknown error occurred",
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
