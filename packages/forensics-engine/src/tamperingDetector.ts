/**
 * @file tamperingDetector.ts
 * @package @verisphere/forensics-engine
 * @purpose Evaluates PDF metadata anomalies (creator mismatches, modification history, editing software flags) to flag tampering.
 * @dependencies @verisphere/shared-types
 * @security Define clear heuristics for tamper scoring (0-100) and flag signatures to avoid false positives on legitimate PDF exports.
 * @future_implementation Parse PDF incremental updates to detect if content was injected after signing. Check digital signatures if present.
 */

import { DocumentMetadata, RiskLevel } from "@verisphere/shared-types";

export interface TamperReport {
  isTampered: boolean;
  tamperScore: number; // 0 to 100 indicator of tampering risk
  tamperSignals: string[];
  riskIndicators: Array<{
    category: "METADATA_MISMATCH" | "SUSPICIOUS_PROVIDER";
    severity: RiskLevel;
    description: string;
    evidence: string;
  }>;
}

/**
 * Evaluates document metadata metrics to run heuristic forensics checks.
 * 
 * @param metadata - Extracted DocumentMetadata descriptor
 * @returns TamperReport
 */
export function detectDocumentTampering(metadata: DocumentMetadata): TamperReport {
  const signals: string[] = [];
  const risks: TamperReport["riskIndicators"] = [];
  let score = 0;

  // Rule 1: PDF was modified after creation using suspicious editor tool chains (e.g. Canva/Nitro PDF instead of original software)
  if (metadata.modificationDate && metadata.creationDate) {
    const deltaMs = metadata.modificationDate.getTime() - metadata.creationDate.getTime();
    const isModified = deltaMs > 1000 * 60 * 5; // Modified > 5 minutes after creation

    if (isModified && metadata.producer?.toLowerCase().includes("pdf editor")) {
      signals.push("PDF modified with external editing software.");
      score += 40;
      risks.push({
        category: "METADATA_MISMATCH",
        severity: RiskLevel.MEDIUM,
        description: "The certificate PDF has been modified using edit-heavy PDF tools after original generation.",
        evidence: `Creation: ${metadata.creationDate.toISOString()}, Modification: ${metadata.modificationDate.toISOString()}, Producer: ${metadata.producer}`
      });
    }
  }

  // Rule 2: Creator and Producer software mismatch
  if (metadata.creator && metadata.producer && metadata.creator !== metadata.producer) {
    // Some discrepancy is normal, but high discrepancy triggers signals
    if (metadata.creator.includes("Word") && metadata.producer.includes("Adobe Acrobat")) {
      // Normal print-to-pdf flow
    } else if (metadata.producer.includes("ilovepdf") || metadata.producer.includes("pdf2go")) {
      signals.push("Used web-based PDF editor/compressor tool.");
      score += 30;
      risks.push({
        category: "SUSPICIOUS_PROVIDER",
        severity: RiskLevel.LOW,
        description: "Document processed by a web utility indicating modification.",
        evidence: `Producer tag: ${metadata.producer}`
      });
    }
  }

  return {
    isTampered: score >= 50,
    tamperScore: Math.min(score, 100),
    tamperSignals: signals,
    riskIndicators: risks
  };
}
