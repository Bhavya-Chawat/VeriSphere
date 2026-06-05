/**
 * @file scoreCalculator.ts
 * @package @verisphere/forensics-engine
 * @purpose Calculates verification trust scores based on forensic finding severities.
 */

import { ForensicFinding, Severity } from "@verisphere/shared-types";

export interface ScoreDeduction {
  category: string;
  severity: Severity;
  points: number;
  description: string;
}

export interface ScoreCalculationResult {
  trustScore: number;
  deductions: ScoreDeduction[];
}

/**
 * Calculates the trust score and details the applied deductions based on forensic findings.
 * 
 * @param findings - Array of forensic findings identified in the document check.
 * @returns ScoreCalculationResult with final clamped score and deductions list.
 */
export function calculateForensicScore(findings: ForensicFinding[]): ScoreCalculationResult {
  let score = 100;
  const deductions: ScoreDeduction[] = [];

  for (const finding of findings) {
    let deductionPoints = 0;

    switch (finding.severity) {
      case Severity.CRITICAL:
        deductionPoints = 40;
        break;
      case Severity.HIGH:
        deductionPoints = 25;
        break;
      case Severity.MEDIUM:
        deductionPoints = 15;
        break;
      case Severity.LOW:
        deductionPoints = 5;
        break;
      default:
        deductionPoints = 0;
        break;
    }

    if (deductionPoints > 0) {
      score -= deductionPoints;
      deductions.push({
        category: finding.category,
        severity: finding.severity,
        points: deductionPoints,
        description: finding.description,
      });
    }
  }

  // Clamp the score between 0 and 100
  const trustScore = Math.max(0, Math.min(100, score));

  return {
    trustScore,
    deductions,
  };
}
