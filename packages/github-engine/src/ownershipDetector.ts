/**
 * @file ownershipDetector.ts
 * @package @verisphere/github-engine
 * @purpose Analyzes code ownership, detection of cloned public repos, and fork status anomalies.
 * @dependencies @verisphere/shared-types
 * @security Identify indicators where candidates clone popular templates (like standard React/Next starter files) and claim original architecture.
 * @future_implementation Interface with search API / GitHub code search to locate identical source code files across GitHub.
 */

import { GithubRepoMetrics, RiskLevel } from "@verisphere/shared-types";

export interface OwnershipAnalysis {
  isOwnershipSuspicious: boolean;
  ownershipConfidenceScore: number; // 0-100 rating of ownership genuineness
  anomalies: string[];
  riskIndicators: Array<{
    category: "CLONED_REPOSITORY";
    severity: RiskLevel;
    description: string;
    evidence: string;
  }>;
}

/**
 * Checks metadata of a repository to verify ownership and plagiarism indicators.
 * 
 * @param repo - Repository metrics
 * @returns OwnershipAnalysis
 */
export function verifyRepositoryOwnership(repo: GithubRepoMetrics): OwnershipAnalysis {
  const anomalies: string[] = [];
  const risks: OwnershipAnalysis["riskIndicators"] = [];
  let confidence = 100;

  // Rule 1: Repository is a direct fork but claims are represented as original creation
  if (repo.isFork) {
    anomalies.push("Repository is a fork of another public repository.");
    confidence -= 50;
    risks.push({
      category: "CLONED_REPOSITORY",
      severity: RiskLevel.MEDIUM,
      description: "Candidate repository is a fork, suggesting the candidate may not have authored the initial codebase.",
      evidence: `Forked from: ${repo.forkSourceUrl || "unknown source"}`
    });
  }

  // Rule 2: Low contribution to a high-profile repo (stolen credit)
  if (repo.starsCount > 100 && repo.candidateCommitsCount < 3) {
    anomalies.push("Candidate has extremely low commit contributions on a high-star repository.");
    confidence -= 40;
    risks.push({
      category: "CLONED_REPOSITORY",
      severity: RiskLevel.HIGH,
      description: "The repository has high popularity but almost zero work contributions from the candidate.",
      evidence: `Stars: ${repo.starsCount}, Candidate Commits: ${repo.candidateCommitsCount}`
    });
  }

  return {
    isOwnershipSuspicious: confidence < 70,
    ownershipConfidenceScore: Math.max(confidence, 0),
    anomalies,
    riskIndicators: risks
  };
}
