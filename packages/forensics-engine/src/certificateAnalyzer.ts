/**
 * @file certificateAnalyzer.ts
 * @package @verisphere/forensics-engine
 * @purpose Integrates metadata extraction, hashing, rule checks, and score calculation for certificate verification.
 */

import { extractPdfMetadata } from "./pdfMetadataExtractor";
import { generateSHA256 } from "./sha256Extractor";
import { checkMetadataRules } from "./metadataRules";
import { calculateForensicScore } from "./scoreCalculator";
import { PdfMetadata, ForensicFinding } from "@verisphere/shared-types";

export interface CertificateAnalysis {
  metadata: PdfMetadata;
  sha256: string;
  findings: ForensicFinding[];
  trustScore: number;
}

/**
 * Performs full forensic analysis on a certificate PDF buffer.
 * 
 * @param buffer - Binary buffer of the certificate PDF.
 * @returns Promise<CertificateAnalysis> analysis outcome.
 */
export async function analyzeCertificate(buffer: Buffer): Promise<CertificateAnalysis> {
  if (!buffer || buffer.length === 0) {
    throw new Error("Invalid input: Buffer is empty or undefined.");
  }

  // 1. Extract metadata
  const metadata = await extractPdfMetadata(buffer);

  // 2. Generate SHA256 hash
  const sha256 = generateSHA256(buffer);

  // 3. Run metadata rules
  const findings = checkMetadataRules(metadata);

  // 4. Calculate trust score
  const { trustScore } = calculateForensicScore(findings);

  return {
    metadata,
    sha256,
    findings,
    trustScore,
  };
}
