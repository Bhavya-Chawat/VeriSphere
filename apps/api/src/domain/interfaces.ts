/**
 * @file interfaces.ts
 * @package apps/api
 * @purpose Defines repositories and infrastructure adapter contracts (interfaces). Domain Layer.
 * @dependencies @verisphere/shared-types
 * @security Clean interfaces decoupling business rules from PostgreSQL or Neon storage specifics.
 * @future_implementation Implement mock repositories conforming to these schemas to allow instant unit testing of business logic.
 */

import { Candidate, VerificationJob, AuditReport, TrustScoreBreakdown } from "@verisphere/shared-types";

export interface ICandidateRepository {
  findById(id: string): Promise<Candidate | null>;
  findByEmail(email: string): Promise<Candidate | null>;
  create(candidate: Omit<Candidate, "id" | "createdAt">): Promise<Candidate>;
  listAll(organizationId: string): Promise<Candidate[]>;
}

export interface IVerificationJobRepository {
  findById(id: string): Promise<VerificationJob | null>;
  create(candidateId: string): Promise<VerificationJob>;
  updateStatus(jobId: string, status: string, errorMsg?: string): Promise<void>;
  saveResults(
    jobId: string, 
    report: AuditReport, 
    trustScore: TrustScoreBreakdown
  ): Promise<void>;
}

export interface IDocumentStorageService {
  /**
   * Fetches the binary buffer of a file from UploadThing / S3 storage.
   */
  fetchFileBuffer(url: string): Promise<Buffer>;
}
