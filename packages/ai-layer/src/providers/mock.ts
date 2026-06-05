import fs from 'fs';
import path from 'path';
import { AuditReport } from '@verisphere/shared-types';

export class MockAIProvider {
  /**
   * Generates a hardcoded mock AI response for demonstration.
   */
  public async analyzeCandidate(resumeText: string, githubMetrics: any): Promise<Partial<AuditReport>> {
    console.log("[Mock AI] Generating dynamic candidate analysis using local fallback...");
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Extract candidate name from our generated resume string if possible
    let candidateName = "Candidate";
    if (resumeText.includes(" - Candidate Profile.")) {
      candidateName = resumeText.split(" - Candidate Profile.")[0];
    }
    
    // Extract skills if passed
    let skillsStr = "various technologies";
    if (resumeText.includes("Detected skills from GitHub: ")) {
      skillsStr = resumeText.split("Detected skills from GitHub: ")[1].replace(".", "");
    }
    
    const hasGitHub = githubMetrics && githubMetrics.githubUsername !== "unknown" && githubMetrics.publicReposCount > 0;
    
    const trustScore = hasGitHub ? {
      overallScore: 85,
      resumeConsistency: 90,
      githubEvidence: 88,
      certificateValidity: 100,
      contributionConfidence: 80,
      activityConfidence: 82
    } : {
      overallScore: 40,
      resumeConsistency: 50,
      githubEvidence: 10,
      certificateValidity: 100,
      contributionConfidence: 10,
      activityConfidence: 10
    };

    let semanticMatches: any[] = [];
    if (hasGitHub && githubMetrics.analyzedRepos) {
      const matchMap = new Map<string, any>();
      for (const repo of githubMetrics.analyzedRepos) {
        const skillName = repo.language || "General Programming";
        if (!matchMap.has(skillName)) {
          const confScore = Math.round((0.85 + (Math.random() * 0.1)) * 100) / 100;
          matchMap.set(skillName, {
            claimedSkill: skillName,
            matchedRepo: repo.name,
            evidenceLevel: confScore > 0.7 ? "STRONG" : "MODERATE",
            notes: `Found substantial activity in repository '${repo.name}' with ${repo.commits || 'multiple'} commits`,
            confidenceScore: confScore
          });
        }
      }
      semanticMatches = Array.from(matchMap.values());
    } else {
      semanticMatches = [{
        claimedSkill: "General Development",
        matchedRepo: "None",
        evidenceLevel: "NONE",
        notes: "No GitHub repositories found to verify skill claims.",
        confidenceScore: 0.1
      }];
    }

    // Extract academic profile from resume text (best effort)
    let academicProfile: any = {
      institutionName: "",
      degreeName: "",
      branchOrSpecialization: "",
      cgpaOrPercentage: "",
      graduationYear: "",
      enrollmentYear: "",
      honors: [],
      certifications: []
    };

    // Try to detect institution, degree, year patterns from raw resume text
    const educationPatterns = [
      /(?:university|college|institute|school)\s+(?:of\s+)?([\w\s,]+)/gi,
      /(?:B\.?Tech|B\.?E|B\.?Sc|M\.?Tech|M\.?S|M\.?Sc|MBA|PhD|Ph\.?D)/gi,
    ];
    const yearPattern = /\b(20\d{2}|19\d{2})\b/g;
    const years = (resumeText.match(yearPattern) || []).map(Number).sort();
    if (years.length >= 2) {
      academicProfile.enrollmentYear = String(years[0]);
      academicProfile.graduationYear = String(years[years.length > 2 ? years.length - 2 : years.length - 1]);
    }

    const mockReport: any = {
      findingsSummary: `${candidateName} appears to have experience with ${skillsStr}. ${hasGitHub ? "GitHub activity supports these claims." : "Insufficient GitHub evidence to fully verify profile."}`,
      trustScore,
      semanticMatches,
      academicProfile,
      contradictions: hasGitHub ? [] : ["Claimed developer experience but no GitHub evidence provided"],
      riskIndicators: hasGitHub ? [] : [{
        type: "LACK_OF_EVIDENCE",
        description: "Candidate profile lacks sufficient public repository activity.",
        level: "MEDIUM"
      }],
      unsupportedClaims: [],
      interviewQuestions: [
        {
          category: "Technical Validation",
          question: `Walk me through the architecture of your most active repository.`,
          reason: "To verify deep technical understanding of the technologies used."
        },
        {
          category: "Experience Validation",
          question: "Describe a complex backend system you designed from scratch.",
          reason: "To validate system design experience claimed on resume."
        }
      ]
    };
    
    return mockReport as Partial<AuditReport>;
  }
}
