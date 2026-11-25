/**
 * @file mongo-evidence-store.ts
 * @package apps/api
 * @purpose Fail-open MongoDB evidence repository & aggregation analytics service.
 *
 * Responsibilities:
 *  - Write raw resumes, certificate forensics reports, GitHub snapshots, LLM traces, and job events
 *    to their respective schema-validated MongoDB collections (all keyed by PostgreSQL `jobId`).
 *  - Build compact `mongoRef` manifest stored on PostgreSQL `VerificationJob.mongoRef`.
 *  - Mark MongoDB documents `orphaned: true` across all 5 collections if the PostgreSQL
 *    transaction fails (cross-database compensating rollback).
 *  - Never throw or block verification if MongoDB is unreachable.
 *  - Attach MongoDB evidence on read requests (`getEvidenceForJob`).
 *  - Execute MongoDB aggregation pipelines (top failing forensic rules, LLM token/latency stats,
 *    pipeline step timings).
 */

import { MONGO_COLLECTIONS, mongoManager } from "./mongo-client";

export interface MongoEvidenceManifest {
  db: string;
  jobId: string;
  rawResumeDocId?: string | null;
  githubSnapshotDocId?: string | null;
  forensicsReportDocId?: string | null;
  llmTraceDocIds?: string[];
  recordedAt: string;
}

export interface LlmTraceInput {
  jobId: string;
  candidateId?: string;
  provider: string;
  model: string;
  prompt: string;
  response: string;
  promptTokens?: number | null;
  completionTokens?: number | null;
  totalTokens?: number | null;
  latencyMs: number;
  status: "SUCCESS" | "ERROR";
  errorMessage?: string;
}

class MongoEvidenceStore {
  public async saveRawResume(params: {
    jobId: string;
    candidateId: string;
    fileUrl?: string | null;
    rawText: string;
    skills?: string[];
    academicProfile?: any;
  }): Promise<string | null> {
    try {
      const db = await mongoManager.getDb();
      if (!db) return null;

      const res = await db.collection(MONGO_COLLECTIONS.RAW_RESUMES).insertOne({
        jobId: params.jobId,
        candidateId: params.candidateId,
        fileUrl: params.fileUrl ?? null,
        rawText: params.rawText || "",
        charCount: (params.rawText || "").length,
        skills: Array.isArray(params.skills) ? params.skills : [],
        academicProfile: params.academicProfile || null,
        orphaned: false,
        createdAt: new Date(),
      });
      return res.insertedId.toString();
    } catch (err: any) {
      console.warn("[MongoEvidenceStore] saveRawResume skipped:", err?.message || err);
      return null;
    }
  }

  public async saveForensicsReport(params: {
    jobId: string;
    candidateId: string;
    certificateValidityScore: number;
    certificateAnalyses?: any[];
  }): Promise<string | null> {
    try {
      const db = await mongoManager.getDb();
      if (!db) return null;

      const normalizedCertificates = (params.certificateAnalyses || []).map((cert: any, idx: number) => {
        const rawFindings = Array.isArray(cert?.findings) ? cert.findings : [];
        return {
          index: idx,
          fileName: cert?.fileName || cert?.metadata?.title || `certificate_${idx + 1}.pdf`,
          issuer:
            cert?.metadata?.author ||
            cert?.metadata?.creator ||
            cert?.metadata?.producer ||
            cert?.issuer ||
            "Unknown",
          sha256: cert?.sha256 || null,
          trustScore: typeof cert?.trustScore === "number" ? cert.trustScore : null,
          metadata: cert?.metadata || {},
          findings: rawFindings.map((f: any) => ({
            rule: String(f?.rule || f?.code || f?.type || f?.category || "METADATA_CHECK"),
            description: String(f?.description || f?.message || "Forensic check"),
            severity: String(f?.severity || "LOW").toUpperCase(),
            isAnomaly: Boolean(f?.isAnomaly || f?.severity === "HIGH" || f?.severity === "CRITICAL"),
          })),
        };
      });

      const res = await db.collection(MONGO_COLLECTIONS.FORENSICS_REPORTS).insertOne({
        jobId: params.jobId,
        candidateId: params.candidateId,
        certificateValidityScore: params.certificateValidityScore,
        certificates: normalizedCertificates,
        orphaned: false,
        createdAt: new Date(),
      });
      return res.insertedId.toString();
    } catch (err: any) {
      console.warn("[MongoEvidenceStore] saveForensicsReport skipped:", err?.message || err);
      return null;
    }
  }

  public async saveGithubSnapshot(params: {
    jobId: string;
    candidateId: string;
    githubMetrics: any;
  }): Promise<string | null> {
    try {
      const db = await mongoManager.getDb();
      if (!db) return null;

      const m = params.githubMetrics || {};
      const res = await db.collection(MONGO_COLLECTIONS.GITHUB_SNAPSHOTS).insertOne({
        jobId: params.jobId,
        candidateId: params.candidateId,
        githubUsername: String(m.githubUsername || "unknown"),
        publicReposCount: Number(m.publicReposCount || 0),
        accountAgeMonths: Number(m.accountAgeMonths || 0),
        totalCommitsCollected: Number(m.totalCommitsCollected || 0),
        verifiedSkills: Array.isArray(m.verifiedSkills) ? m.verifiedSkills : [],
        verifiedLanguages: Array.isArray(m.verifiedLanguages) ? m.verifiedLanguages : [],
        languageDistribution: m.languageDistribution || {},
        hasTimelineGaps: Boolean(m.hasTimelineGaps),
        timelineAnomalyAlerts: Array.isArray(m.timelineAnomalyAlerts) ? m.timelineAnomalyAlerts : [],
        analyzedRepos: Array.isArray(m.analyzedRepos) ? m.analyzedRepos : [],
        orphaned: false,
        createdAt: new Date(),
      });
      return res.insertedId.toString();
    } catch (err: any) {
      console.warn("[MongoEvidenceStore] saveGithubSnapshot skipped:", err?.message || err);
      return null;
    }
  }

  public async saveLlmTrace(trace: LlmTraceInput): Promise<string | null> {
    try {
      const db = await mongoManager.getDb();
      if (!db) return null;

      const res = await db.collection(MONGO_COLLECTIONS.LLM_TRACES).insertOne({
        jobId: trace.jobId,
        candidateId: trace.candidateId || null,
        provider: trace.provider,
        model: trace.model,
        prompt: trace.prompt.slice(0, 30_000),
        response: trace.response.slice(0, 30_000),
        promptTokens: trace.promptTokens ?? null,
        completionTokens: trace.completionTokens ?? null,
        totalTokens: trace.totalTokens ?? null,
        latencyMs: Math.max(0, Math.round(trace.latencyMs)),
        status: trace.status,
        errorMessage: trace.errorMessage || null,
        orphaned: false,
        createdAt: new Date(),
      });
      return res.insertedId.toString();
    } catch (err: any) {
      console.warn("[MongoEvidenceStore] saveLlmTrace skipped:", err?.message || err);
      return null;
    }
  }

  public async logJobEvent(params: {
    jobId: string;
    step: string;
    status: "STARTED" | "COMPLETED" | "FAILED" | "SKIPPED";
    durationMs?: number | null;
    details?: Record<string, any>;
  }): Promise<void> {
    try {
      const db = await mongoManager.getDb();
      if (!db) return;

      await db.collection(MONGO_COLLECTIONS.JOB_EVENTS).insertOne({
        jobId: params.jobId,
        step: params.step,
        status: params.status,
        durationMs: params.durationMs != null ? Math.max(0, Math.round(params.durationMs)) : null,
        details: params.details || {},
        orphaned: false,
        createdAt: new Date(),
      });
    } catch (err: any) {
      // Never block pipeline for event logging
      console.warn("[MongoEvidenceStore] logJobEvent skipped:", err?.message || err);
    }
  }

  public buildEvidenceManifest(params: {
    jobId: string;
    rawResumeDocId?: string | null;
    githubSnapshotDocId?: string | null;
    forensicsReportDocId?: string | null;
    llmTraceDocIds?: string[];
  }): string | null {
    const hasAnyDoc =
      Boolean(params.rawResumeDocId) ||
      Boolean(params.githubSnapshotDocId) ||
      Boolean(params.forensicsReportDocId) ||
      Boolean(params.llmTraceDocIds && params.llmTraceDocIds.length > 0);

    if (!hasAnyDoc) return null;

    const manifest: MongoEvidenceManifest = {
      db: mongoManager.getStatus().dbName,
      jobId: params.jobId,
      rawResumeDocId: params.rawResumeDocId || null,
      githubSnapshotDocId: params.githubSnapshotDocId || null,
      forensicsReportDocId: params.forensicsReportDocId || null,
      llmTraceDocIds: params.llmTraceDocIds || [],
      recordedAt: new Date().toISOString(),
    };
    return JSON.stringify(manifest);
  }

  /**
   * Compensating rollback: if the PostgreSQL transaction fails after MongoDB writes succeeded,
   * mark all MongoDB documents for this jobId as `orphaned: true`.
   */
  public async markJobDocumentsOrphaned(jobId: string, reason: string): Promise<number> {
    try {
      const db = await mongoManager.getDb();
      if (!db) return 0;

      const update = {
        $set: {
          orphaned: true,
          orphanedAt: new Date(),
          orphanReason: reason.slice(0, 500),
        },
      };

      const collections = Object.values(MONGO_COLLECTIONS);
      const results = await Promise.all(
        collections.map((name) => db.collection(name).updateMany({ jobId }, update))
      );

      const totalModified = results.reduce((sum, r) => sum + (r.modifiedCount || 0), 0);
      console.warn(
        `[MongoEvidenceStore] ⚠️ PostgreSQL transaction failed for job ${jobId} — marked ${totalModified} MongoDB document(s) as orphaned.`
      );
      return totalModified;
    } catch (err: any) {
      console.warn("[MongoEvidenceStore] markJobDocumentsOrphaned failed:", err?.message || err);
      return 0;
    }
  }

  /**
   * On-demand read: fetches all non-orphaned MongoDB evidence documents linked to a PostgreSQL jobId.
   */
  public async getEvidenceForJob(jobId: string): Promise<{
    available: boolean;
    jobId: string;
    rawResume: any | null;
    githubSnapshot: any | null;
    forensicsReport: any | null;
    llmTraces: any[];
    jobEvents: any[];
  }> {
    try {
      const db = await mongoManager.getDb();
      if (!db) {
        return {
          available: false,
          jobId,
          rawResume: null,
          githubSnapshot: null,
          forensicsReport: null,
          llmTraces: [],
          jobEvents: [],
        };
      }

      const activeFilter = { jobId, orphaned: { $ne: true } };
      const [rawResume, githubSnapshot, forensicsReport, llmTraces, jobEvents] = await Promise.all([
        db.collection(MONGO_COLLECTIONS.RAW_RESUMES).findOne(activeFilter, { sort: { createdAt: -1 } }),
        db.collection(MONGO_COLLECTIONS.GITHUB_SNAPSHOTS).findOne(activeFilter, { sort: { createdAt: -1 } }),
        db.collection(MONGO_COLLECTIONS.FORENSICS_REPORTS).findOne(activeFilter, { sort: { createdAt: -1 } }),
        db.collection(MONGO_COLLECTIONS.LLM_TRACES).find(activeFilter).sort({ createdAt: 1 }).toArray(),
        db.collection(MONGO_COLLECTIONS.JOB_EVENTS).find(activeFilter).sort({ createdAt: 1 }).toArray(),
      ]);

      return {
        available: true,
        jobId,
        rawResume,
        githubSnapshot,
        forensicsReport,
        llmTraces,
        jobEvents,
      };
    } catch (err: any) {
      console.warn("[MongoEvidenceStore] getEvidenceForJob failed:", err?.message || err);
      return {
        available: false,
        jobId,
        rawResume: null,
        githubSnapshot: null,
        forensicsReport: null,
        llmTraces: [],
        jobEvents: [],
      };
    }
  }

  /**
   * MongoDB Aggregation Pipeline #1:
   * Answers "Which forensic rules fail most often across candidates?"
   */
  public async getTopFailingForensicRules(limit: number = 15): Promise<any[]> {
    try {
      const db = await mongoManager.getDb();
      if (!db) return [];

      return await db
        .collection(MONGO_COLLECTIONS.FORENSICS_REPORTS)
        .aggregate([
          { $match: { orphaned: { $ne: true } } },
          { $unwind: "$certificates" },
          { $unwind: "$certificates.findings" },
          { $match: { "certificates.findings.isAnomaly": true } },
          {
            $group: {
              _id: {
                rule: "$certificates.findings.rule",
                severity: "$certificates.findings.severity",
              },
              failureCount: { $sum: 1 },
              affectedCandidates: { $addToSet: "$candidateId" },
              sampleDescription: { $first: "$certificates.findings.description" },
            },
          },
          {
            $project: {
              _id: 0,
              rule: "$_id.rule",
              severity: "$_id.severity",
              failureCount: 1,
              uniqueCandidatesAffected: { $size: "$affectedCandidates" },
              sampleDescription: 1,
            },
          },
          { $sort: { failureCount: -1, uniqueCandidatesAffected: -1 } },
          { $limit: limit },
        ])
        .toArray();
    } catch (err: any) {
      console.warn("[MongoEvidenceStore] getTopFailingForensicRules failed:", err?.message || err);
      return [];
    }
  }

  /**
   * MongoDB Aggregation Pipeline #2:
   * Provider/model latency and token consumption analytics across `llm_traces`.
   */
  public async getLlmUsageAnalytics(): Promise<any[]> {
    try {
      const db = await mongoManager.getDb();
      if (!db) return [];

      return await db
        .collection(MONGO_COLLECTIONS.LLM_TRACES)
        .aggregate([
          { $match: { orphaned: { $ne: true } } },
          {
            $group: {
              _id: { provider: "$provider", model: "$model" },
              totalCalls: { $sum: 1 },
              successCalls: {
                $sum: { $cond: [{ $eq: ["$status", "SUCCESS"] }, 1, 0] },
              },
              avgLatencyMs: { $avg: "$latencyMs" },
              maxLatencyMs: { $max: "$latencyMs" },
              totalPromptTokens: { $sum: { $ifNull: ["$promptTokens", 0] } },
              totalCompletionTokens: { $sum: { $ifNull: ["$completionTokens", 0] } },
              totalTokens: { $sum: { $ifNull: ["$totalTokens", 0] } },
            },
          },
          {
            $project: {
              _id: 0,
              provider: "$_id.provider",
              model: "$_id.model",
              totalCalls: 1,
              successCalls: 1,
              avgLatencyMs: { $round: ["$avgLatencyMs", 0] },
              maxLatencyMs: 1,
              totalPromptTokens: 1,
              totalCompletionTokens: 1,
              totalTokens: 1,
            },
          },
          { $sort: { totalCalls: -1 } },
        ])
        .toArray();
    } catch (err: any) {
      console.warn("[MongoEvidenceStore] getLlmUsageAnalytics failed:", err?.message || err);
      return [];
    }
  }

  /**
   * MongoDB Aggregation Pipeline #3:
   * Average duration per verification pipeline step from `job_events`.
   */
  public async getPipelineStepTimings(): Promise<any[]> {
    try {
      const db = await mongoManager.getDb();
      if (!db) return [];

      return await db
        .collection(MONGO_COLLECTIONS.JOB_EVENTS)
        .aggregate([
          { $match: { status: "COMPLETED", durationMs: { $ne: null } } },
          {
            $group: {
              _id: "$step",
              executions: { $sum: 1 },
              avgDurationMs: { $avg: "$durationMs" },
              minDurationMs: { $min: "$durationMs" },
              maxDurationMs: { $max: "$durationMs" },
            },
          },
          {
            $project: {
              _id: 0,
              step: "$_id",
              executions: 1,
              avgDurationMs: { $round: ["$avgDurationMs", 0] },
              minDurationMs: 1,
              maxDurationMs: 1,
            },
          },
          { $sort: { avgDurationMs: -1 } },
        ])
        .toArray();
    } catch (err: any) {
      console.warn("[MongoEvidenceStore] getPipelineStepTimings failed:", err?.message || err);
      return [];
    }
  }

  /**
   * Collection counts + orphan counts for MongoDB health/overview inspection.
   */
  public async getStatusSummary(): Promise<any> {
    const status = mongoManager.getStatus();
    const db = await mongoManager.getDb();
    if (!db) {
      return { ...status, collections: {} };
    }

    const entries = await Promise.all(
      Object.values(MONGO_COLLECTIONS).map(async (name) => {
        const col = db.collection(name);
        const [total, orphaned] = await Promise.all([
          col.countDocuments({}),
          col.countDocuments({ orphaned: true }),
        ]);
        return [name, { total, active: total - orphaned, orphaned }] as const;
      })
    );

    return {
      ...mongoManager.getStatus(),
      collections: Object.fromEntries(entries),
    };
  }
}

export const mongoEvidenceStore = new MongoEvidenceStore();
