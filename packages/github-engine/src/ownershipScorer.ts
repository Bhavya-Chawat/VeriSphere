/**
 * @file ownershipScorer.ts
 * @package @verisphere/github-engine
 * @purpose Computes a single weighted-average ownership score across all
 *          analyzed repositories for the candidate.
 *
 * Formula (from spec):
 *   Σ(ownershipPercent × repoWeight) / Σ(repoWeight)
 *   Where repoWeight = totalContributions for that repo
 */

import { ContributorResult } from "./types";

/**
 * Computes a weighted-average ownership score (0–100) across all repositories.
 *
 * Repos with more total contributions exert more influence on the score,
 * reflecting that high-activity repos are more significant evidence.
 *
 * @param results - Array of per-repo ContributorResult objects
 * @returns Integer ownership score between 0 and 100 (inclusive)
 */
export function computeOwnershipScore(results: ContributorResult[]): number {
  if (results.length === 0) {
    return 0;
  }

  let weightedSum = 0;
  let totalWeight = 0;

  for (const result of results) {
    const weight = result.totalContributions;
    weightedSum += result.ownershipPercent * weight;
    totalWeight += weight;
  }

  if (totalWeight === 0) {
    // All repos have zero contributions — default to simple average
    const simpleAvg =
      results.reduce((sum, r) => sum + r.ownershipPercent, 0) / results.length;
    return Math.round(Math.max(0, Math.min(100, simpleAvg)));
  }

  const score = weightedSum / totalWeight;
  return Math.round(Math.max(0, Math.min(100, score)));
}
