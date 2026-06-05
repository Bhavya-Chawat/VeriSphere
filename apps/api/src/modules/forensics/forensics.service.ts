/**
 * @file forensics.service.ts
 * @package apps/api
 * @purpose Implements service layer for certificate forensics analysis.
 */

import { analyzeCertificate, CertificateAnalysis } from "@verisphere/forensics-engine";

export class ForensicsService {
  /**
   * Processes the binary PDF buffer using the forensics engine.
   * 
   * @param buffer - File binary buffer.
   * @returns Promise<CertificateAnalysis> analysis outcome.
   */
  public async analyze(buffer: Buffer): Promise<CertificateAnalysis> {
    if (!buffer || buffer.length === 0) {
      throw new Error("Cannot analyze empty buffer.");
    }
    return await analyzeCertificate(buffer);
  }
}
