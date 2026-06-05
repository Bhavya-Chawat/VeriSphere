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

/**
 * Verification Pipeline Steps (sequential):
 * ──────────────────────────────────────────
 * Step 1: PARSE — Extract text from uploaded resume PDF
 * Step 2: GITHUB — Scrape live GitHub repositories for evidence
 * Step 3: AI_ANALYZE — Send resume text + GitHub metrics to AI for semantic matching
 * Step 4: ACADEMIC — Verify institution name, domain email, graduation timeline
 * Step 5: CERTIFICATES — Score certificate forensics results (from intake)
 * Step 6: TRUST_SCORE — Calculate weighted trust score from all sub-scores
 * Step 7: PERSIST — Save AuditReport and update job status in database
 */

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
   * STEP 6+7: Assemble the final report and persist it.
   */
  public async executeVerification(
    job: VerificationJob, 
    resume: ResumeData, 
    githubMetrics: GithubProfileMetrics,
    certificateValidityScore: number = 100,
    institutionalEmail?: string,
    certificateAnalyses?: any[],
    riskIndicatorsFromCerts: any[] = []
  ): Promise<AuditReport> {
    
    console.log(`[Orchestrator] Starting verification for Job ID: ${job.id}`);
    
    // --- STEP 3: AI Layer Analysis ---
    console.log(`[Orchestrator] STEP 3: Calling AI Layer for semantic analysis...`);
    const aiResponse: any = await this.aiLayer.analyzeCandidate(
      resume.rawText, 
      githubMetrics, 
      SYSTEM_PROMPT_VERIFICATION
    );

    if (!aiResponse) {
      throw new Error("AI Layer returned an empty response.");
    }

    // --- STEP 4: Academic Verification ---
    console.log(`[Orchestrator] STEP 4: Running Academic Verification...`);
    const academicProfile = aiResponse.academicProfile || resume.academicProfile;
    const academicVerificationResults = verifyAcademicProfile(
      academicProfile,
      institutionalEmail
    );
    
    const academicScore = academicVerificationResults.length > 0 
      ? academicVerificationResults[0].confidenceScore * 100 
      : 50; // Default 50 if no academic data found

    // --- STEP 5: Certificate Scoring ---
    console.log(`[Orchestrator] STEP 5: Scoring certificates (${certificateAnalyses?.length || 0} provided)...`);

    // --- STEP 6: Trust Score Calculation ---
    const aiTrustScore = aiResponse.trustScore || {};
    const rawScores = {
      resumeConsistency: typeof aiTrustScore === 'object' ? (aiTrustScore.resumeConsistency ?? 70) : 70,
      githubEvidence: typeof aiTrustScore === 'object' ? (aiTrustScore.githubEvidence ?? 70) : 70,
      contributionConfidence: typeof aiTrustScore === 'object' ? (aiTrustScore.contributionConfidence ?? 70) : 70,
      activityConfidence: typeof aiTrustScore === 'object' ? (aiTrustScore.activityConfidence ?? 70) : 70,
      academicScore: academicScore,
      certificateValidity: certificateValidityScore
    };

    console.log(`[Orchestrator] STEP 6: Calculating final trust score...`);
    const finalTrustScore = this.trustCalculator.calculateOverallScore(rawScores);
    
    const trustScoreValue = finalTrustScore.overallScore > 0 
      ? finalTrustScore.overallScore 
      : (typeof aiTrustScore === 'object' ? (aiTrustScore.overallScore ?? 70) : 70);

    // Merge certificate risk flags with AI-detected ones
    const allRiskIndicators = [
      ...(aiResponse.riskIndicators || []),
      ...riskIndicatorsFromCerts
    ];

    // Add academic risk flags
    if (academicVerificationResults.length > 0) {
      const acadResult = academicVerificationResults[0];
      acadResult.riskFlags.forEach((flag: string) => {
        allRiskIndicators.push({
          type: 'ACADEMIC_RISK',
          description: flag,
          level: 'MEDIUM'
        });
      });
    }

    // Assemble final report
    const finalReport: AuditReport = {
      id: `rep_${Date.now()}`,
      jobId: job.id,
      createdAt: new Date(),
      findingsSummary: aiResponse.findingsSummary || "No summary provided.",
      semanticMatchJson: JSON.stringify(aiResponse.semanticMatches || []),
      academicVerificationJson: JSON.stringify(academicVerificationResults),
      contradictions: aiResponse.contradictions || [],
      riskIndicatorsJson: JSON.stringify(allRiskIndicators),
      trustScore: trustScoreValue
    };

    // --- STEP 7: Persist to Database ---
    try {
      console.log(`[Orchestrator] STEP 7: Saving Report to database...`);
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

      await this.prisma.verificationJob.update({
        where: { id: job.id },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
          githubMetricsJson: JSON.stringify(githubMetrics),
          resumeDataJson: JSON.stringify(resume),
          certificateDataJson: certificateAnalyses ? JSON.stringify(certificateAnalyses) : undefined
        }
      });
      
      console.log(`[Orchestrator] ✅ Verification complete. Final Score: ${trustScoreValue}`);
    } catch (dbError: any) {
      console.warn(`[Orchestrator] Failed to save to database:`, dbError.message);
      throw dbError;
    }
    
    return finalReport;
  }

  /**
   * Triggers the full verification pipeline asynchronously.
   */
  public async triggerVerification(
    jobId: string, 
    candidateId: string, 
    resumeFileUrl?: string,
    certificateAnalyses?: any[]
  ): Promise<void> {
    (async () => {
      try {
        console.log(`[Orchestrator] ═══════════════════════════════════════`);
        console.log(`[Orchestrator] Starting pipeline for Job ${jobId}`);
        console.log(`[Orchestrator] ═══════════════════════════════════════`);
        
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

        // --- STEP 1: Parse Resume PDF ---
        let rawText = `${candidateRecord.firstName} ${candidateRecord.lastName} - Candidate Profile.`;
        
        if (resumeFileUrl && fs.existsSync(resumeFileUrl)) {
          console.log(`[Orchestrator] STEP 1: Parsing uploaded PDF resume: ${resumeFileUrl}`);
          const pdfBuffer = fs.readFileSync(resumeFileUrl);
          const parsedPdf = await parsePdfBuffer(pdfBuffer);
          rawText = parsedPdf.rawText;
        } else {
          console.log(`[Orchestrator] STEP 1: No PDF file found, using candidate name as context.`);
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

        // --- STEP 2: Fetch GitHub Evidence ---
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
            console.log(`[Orchestrator] STEP 2: Fetching live GitHub evidence for ${candidateRecord.githubUrl}`);
            const { scrapeGithubEvidence } = await import('@verisphere/github-engine');
            const githubEvidenceReport = await scrapeGithubEvidence(candidateRecord.githubUrl);
            
            githubMetrics = {
              id: `git_${Date.now()}`,
              candidateId,
              githubUsername: githubEvidenceReport.username,
              publicReposCount: githubEvidenceReport.repositories.length,
              followersCount: 0,
              followingCount: 0,
              accountAgeMonths: 12,
              totalCommitsCollected: githubEvidenceReport.repoEvidence.reduce((acc, r) => acc + r.totalCommits, 0),
              analyzedRepos: githubEvidenceReport.repoEvidence.map(r => ({
                name: r.repoName,
                language: r.primaryLanguage,
                commits: r.totalCommits,
                stars: 0,
                recentCommits: r.recentCommits
              })),
              timelineAnomalyAlerts: githubEvidenceReport.timelineFlags.map(f => f.type),
              hasTimelineGaps: githubEvidenceReport.timelineFlags.length > 0
            };
            
            resume.skills = githubEvidenceReport.verifiedSkills;
          } catch (githubErr) {
            console.error(`[Orchestrator] STEP 2: GitHub scraping failed:`, githubErr);
          }
        } else {
          console.log(`[Orchestrator] STEP 2: No GitHub URL provided, skipping.`);
        }

        // --- STEP 5: Certificate scoring ---
        let certificateValidityScore = 100;
        let riskIndicatorsFromCerts: any[] = [];
        
        if (certificateAnalyses && certificateAnalyses.length > 0) {
          console.log(`[Orchestrator] STEP 5: Processing ${certificateAnalyses.length} certificate analyses...`);
          const totalScore = certificateAnalyses.reduce((acc, analysis) => acc + (analysis.trustScore || 0), 0);
          certificateValidityScore = Math.round(totalScore / certificateAnalyses.length);
          
          certificateAnalyses.forEach(analysis => {
            if (analysis.findings) {
              analysis.findings.forEach((f: any) => {
                if (f.isAnomaly || f.severity === 'HIGH' || f.severity === 'CRITICAL') {
                  riskIndicatorsFromCerts.push({
                    type: 'CERTIFICATE_ANOMALY',
                    description: f.description,
                    level: f.severity
                  });
                }
              });
            }
          });
        }

        // Execute steps 3-7
        await this.executeVerification(
          job, 
          resume, 
          githubMetrics, 
          certificateValidityScore,
          candidateRecord.institutionalEmail || undefined,
          certificateAnalyses,
          riskIndicatorsFromCerts
        );
      } catch (error: any) {
        console.error(`[Orchestrator] ❌ Pipeline failed for Job ${jobId}:`, error);
        try {
          await this.prisma.verificationJob.update({
            where: { id: jobId },
            data: { 
              status: "FAILED",
              errorMsg: error instanceof Error ? error.message : String(error),
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
