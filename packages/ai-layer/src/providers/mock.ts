import fs from 'fs';
import path from 'path';
import { AuditReport } from '@verisphere/shared-types';

export class MockAIProvider {
  /**
   * Reads from the dummy-data folder to simulate an AI response.
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
          matchMap.set(skillName, {
            claimedSkill: skillName,
            matchedRepo: repo.name,
            evidenceLevel: "STRONG",
            notes: `Found substantial activity in repository ${repo.name}`,
            confidenceScore: 0.85 + (Math.random() * 0.1)
          });
        }
      }
      semanticMatches = Array.from(matchMap.values());
    } else {
      semanticMatches = [{
        claimedSkill: "General Development",
        matchedRepo: "None",
        evidenceLevel: "NONE",
        notes: "No GitHub repositories found.",
        confidenceScore: 0.1
      }];
    }

    const mockReport: any = {
      findingsSummary: `${candidateName} appears to have experience with ${skillsStr}. ${hasGitHub ? "GitHub activity supports these claims." : "Insufficient GitHub evidence to fully verify profile."}`,
      trustScore,
      semanticMatches,
      contradictions: hasGitHub ? [] : ["Claimed developer experience but no GitHub evidence provided"],
      riskIndicators: hasGitHub ? [] : [{
        type: "LACK_OF_EVIDENCE",
        description: "Candidate profile lacks sufficient public repository activity.",
        level: "MEDIUM"
      }],
      unsupportedClaims: [
        {
          claim: "10+ years of advanced system design",
          reason: "No architectural documentation or high-complexity repos found in public GitHub profile."
        },
        {
          claim: "Kubernetes expert",
          reason: "No k8s manifests, helm charts, or related configurations found in evidence."
        }
      ],
      interviewQuestions: [
        {
          category: "Technical Validation",
          question: "Can you walk me through the architecture of the 'ecommerce-platform' repository?",
          reason: "To verify deep technical understanding of the Next.js and Prisma stack used in their most active repo."
        },
        {
          category: "Experience Validation",
          question: "You mentioned 10+ years of system design experience, but your public repos are mostly frontend. Can you describe a complex backend system you designed?",
          reason: "To cover the evidence gap found in the 'Unsupported Claims' section."
        },
        {
          category: "Behavioral Assessment",
          question: "How do you handle disagreements on technical design within a team?",
          reason: "Standard behavioral question to assess collaboration skills."
        }
      ]
    };
    
    return mockReport as Partial<AuditReport>;
  }
}
