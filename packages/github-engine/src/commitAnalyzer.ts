/**
 * @file commitAnalyzer.ts
 * @package @verisphere/github-engine
 * @purpose Analyzes commit histories, weekly pacing, daily times, and author email patterns to detect spoofed activity.
 * @dependencies @verisphere/shared-types
 * @security Scrape or mask email domains to comply with GDPR/PII constraints unless explicitly required for ownership matching.
 * @future_implementation Parse Git ref logs or compare commit dates against GitHub API push events to detect backdated git commit spoofs.
 */

import { CommitActivityMetrics, RiskLevel } from "@verisphere/shared-types";

export interface CommitTimelineAnalysis {
  isAnomalyDetected: boolean;
  anomalyReasons: string[];
  timelineGaps: boolean;
  activityScore: number; // 0-100 rating of commit pacing realism
  detectedRisks: Array<{
    category: "TIMELINE_ANOMALY" | "IDENTITY_MISMATCH";
    severity: RiskLevel;
    description: string;
    evidence: string;
  }>;
}

/**
 * Evaluates commit timelines and metrics to determine if the activity is authentic.
 * 
 * @param metrics - Aggregated CommitActivityMetrics
 * @param candidateEmail - Email address of the candidate to verify author match
 * @returns CommitTimelineAnalysis
 */
export function analyzeCommitTimeline(
  metrics: CommitActivityMetrics,
  candidateEmail: string
): CommitTimelineAnalysis {
  const reasons: string[] = [];
  const risks: CommitTimelineAnalysis["detectedRisks"] = [];
  let score = 100;

  // Rule 1: Backdated commits / Instant code drops (e.g. 100 commits in 1 day, then silence)
  const totalWeeks = metrics.weeklyTimeline.length;
  const activeWeeks = metrics.weeklyTimeline.filter(w => w.commitCount > 0).length;
  
  if (totalWeeks > 4 && activeWeeks <= 1) {
    reasons.push("Bulk of commits occurred within a single week on an otherwise dead repository.");
    score -= 40;
    risks.push({
      category: "TIMELINE_ANOMALY",
      severity: RiskLevel.HIGH,
      description: "Codebase was uploaded in a single burst with artificial timeline intervals.",
      evidence: `Total Commits: ${metrics.totalCommits}, Active Weeks: ${activeWeeks}/${totalWeeks}`
    });
  }

  // Rule 2: Commit email mismatch (e.g. Git commit author email does not match candidate's email domain or name)
  const candidateDomain = candidateEmail.split("@")[1];
  const matchingEmails = metrics.authorEmails.filter(email => {
    const cleanEmail = email.toLowerCase();
    const cleanCandidate = candidateEmail.toLowerCase();
    return cleanEmail === cleanCandidate || cleanEmail.includes(cleanCandidate.split("@")[0]);
  });

  if (matchingEmails.length === 0 && metrics.authorEmails.length > 0) {
    reasons.push("None of the git commit author emails match the candidate's name or email address.");
    score -= 30;
    risks.push({
      category: "IDENTITY_MISMATCH",
      severity: RiskLevel.CRITICAL,
      description: "The repository contains commits authored by a different identity, indicating potential cloning or copyright transfer.",
      evidence: `Candidate Email: ${candidateEmail}, Git Authors: ${metrics.authorEmails.join(", ")}`
    });
  }

  return {
    isAnomalyDetected: score < 70,
    anomalyReasons: reasons,
    timelineGaps: activeWeeks / totalWeeks < 0.2,
    activityScore: Math.max(score, 0),
    detectedRisks: risks
  };
}
