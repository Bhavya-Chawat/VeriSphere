/**
 * @file mongo-client.ts
 * @package apps/api
 * @purpose Singleton MongoDB client with graceful fail-open degradation, JSON Schema
 *          validation for all 5 evidence collections, jobId indexes, and a 90-day TTL
 *          index on `job_events`.
 *
 * Collections managed:
 *   1. raw_resumes       — full parsed resume payloads
 *   2. forensics_reports — rule-by-rule certificate checks & PDF metadata
 *   3. github_snapshots  — raw GitHub API payloads & commit timelines
 *   4. llm_traces        — prompt, response, model, tokens, and latency per LLM call
 *   5. job_events        — pipeline step timeline with 90-day TTL expiration
 */

import { MongoClient, Db, Document } from "mongodb";

export const MONGO_COLLECTIONS = {
  RAW_RESUMES: "raw_resumes",
  FORENSICS_REPORTS: "forensics_reports",
  GITHUB_SNAPSHOTS: "github_snapshots",
  LLM_TRACES: "llm_traces",
  JOB_EVENTS: "job_events",
} as const;

export type MongoCollectionName =
  (typeof MONGO_COLLECTIONS)[keyof typeof MONGO_COLLECTIONS];

const NINETY_DAYS_SECONDS = 90 * 24 * 60 * 60; // 7,776,000 seconds

interface CollectionSpec {
  name: MongoCollectionName;
  validator: Document;
  indexes: Array<{
    key: Record<string, 1 | -1>;
    options?: { name?: string; expireAfterSeconds?: number };
  }>;
}

const COLLECTION_SPECS: CollectionSpec[] = [
  {
    name: MONGO_COLLECTIONS.RAW_RESUMES,
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["jobId", "candidateId", "rawText", "orphaned", "createdAt"],
        properties: {
          jobId: { bsonType: "string", description: "PostgreSQL VerificationJob.id" },
          candidateId: { bsonType: "string", description: "PostgreSQL Candidate.id" },
          fileUrl: { bsonType: ["string", "null"] },
          rawText: { bsonType: "string" },
          charCount: { bsonType: ["int", "double", "long"] },
          skills: { bsonType: "array", items: { bsonType: "string" } },
          orphaned: { bsonType: "bool" },
          createdAt: { bsonType: "date" },
        },
      },
    },
    indexes: [
      { key: { jobId: 1 }, options: { name: "idx_raw_resumes_jobId" } },
      { key: { candidateId: 1, createdAt: -1 }, options: { name: "idx_raw_resumes_candidate_created" } },
    ],
  },
  {
    name: MONGO_COLLECTIONS.FORENSICS_REPORTS,
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["jobId", "candidateId", "certificates", "orphaned", "createdAt"],
        properties: {
          jobId: { bsonType: "string", description: "PostgreSQL VerificationJob.id" },
          candidateId: { bsonType: "string", description: "PostgreSQL Candidate.id" },
          certificateValidityScore: { bsonType: ["int", "double", "long"] },
          certificates: { bsonType: "array" },
          orphaned: { bsonType: "bool" },
          createdAt: { bsonType: "date" },
        },
      },
    },
    indexes: [
      { key: { jobId: 1 }, options: { name: "idx_forensics_reports_jobId" } },
      { key: { "certificates.findings.rule": 1 }, options: { name: "idx_forensics_rule" } },
      { key: { "certificates.findings.isAnomaly": 1 }, options: { name: "idx_forensics_anomaly" } },
    ],
  },
  {
    name: MONGO_COLLECTIONS.GITHUB_SNAPSHOTS,
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["jobId", "candidateId", "githubUsername", "orphaned", "createdAt"],
        properties: {
          jobId: { bsonType: "string", description: "PostgreSQL VerificationJob.id" },
          candidateId: { bsonType: "string", description: "PostgreSQL Candidate.id" },
          githubUsername: { bsonType: "string" },
          publicReposCount: { bsonType: ["int", "double", "long"] },
          totalCommitsCollected: { bsonType: ["int", "double", "long"] },
          orphaned: { bsonType: "bool" },
          createdAt: { bsonType: "date" },
        },
      },
    },
    indexes: [
      { key: { jobId: 1 }, options: { name: "idx_github_snapshots_jobId" } },
      { key: { githubUsername: 1, createdAt: -1 }, options: { name: "idx_github_snapshots_user" } },
    ],
  },
  {
    name: MONGO_COLLECTIONS.LLM_TRACES,
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["jobId", "provider", "model", "latencyMs", "orphaned", "createdAt"],
        properties: {
          jobId: { bsonType: "string", description: "PostgreSQL VerificationJob.id" },
          provider: { bsonType: "string" },
          model: { bsonType: "string" },
          prompt: { bsonType: "string" },
          response: { bsonType: "string" },
          promptTokens: { bsonType: ["int", "double", "long", "null"] },
          completionTokens: { bsonType: ["int", "double", "long", "null"] },
          totalTokens: { bsonType: ["int", "double", "long", "null"] },
          latencyMs: { bsonType: ["int", "double", "long"] },
          status: { bsonType: "string" },
          orphaned: { bsonType: "bool" },
          createdAt: { bsonType: "date" },
        },
      },
    },
    indexes: [
      { key: { jobId: 1 }, options: { name: "idx_llm_traces_jobId" } },
      { key: { provider: 1, model: 1, createdAt: -1 }, options: { name: "idx_llm_traces_provider_model" } },
    ],
  },
  {
    name: MONGO_COLLECTIONS.JOB_EVENTS,
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["jobId", "step", "status", "createdAt"],
        properties: {
          jobId: { bsonType: "string", description: "PostgreSQL VerificationJob.id" },
          step: { bsonType: "string" },
          status: { bsonType: "string" },
          durationMs: { bsonType: ["int", "double", "long", "null"] },
          orphaned: { bsonType: "bool" },
          createdAt: { bsonType: "date" },
        },
      },
    },
    indexes: [
      { key: { jobId: 1, createdAt: 1 }, options: { name: "idx_job_events_jobId_created" } },
      {
        key: { createdAt: 1 },
        options: {
          name: "ttl_job_events_90d",
          expireAfterSeconds: NINETY_DAYS_SECONDS,
        },
      },
    ],
  },
];

class MongoConnectionManager {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private initialized = false;
  private connectingPromise: Promise<Db | null> | null = null;
  private lastFailureAt = 0;
  private lastError: string | null = null;

  // Retry cooldown after a connection failure so outages never slow down requests
  private readonly retryCooldownMs = 30_000;

  public isConfigured(): boolean {
    const uri = process.env.MONGODB_URI;
    return Boolean(uri && uri.trim().length > 10);
  }

  public getStatus(): {
    configured: boolean;
    connected: boolean;
    dbName: string;
    lastError: string | null;
  } {
    return {
      configured: this.isConfigured(),
      connected: this.db !== null,
      dbName: process.env.MONGODB_DB_NAME?.trim() || "verisphere",
      lastError: this.lastError,
    };
  }

  public async getDb(): Promise<Db | null> {
    if (!this.isConfigured()) {
      return null;
    }

    if (this.db && this.initialized) {
      return this.db;
    }

    if (this.lastFailureAt > 0 && Date.now() - this.lastFailureAt < this.retryCooldownMs) {
      return null;
    }

    if (!this.connectingPromise) {
      this.connectingPromise = this.connectAndBootstrap().finally(() => {
        this.connectingPromise = null;
      });
    }

    return this.connectingPromise;
  }

  private async connectAndBootstrap(): Promise<Db | null> {
    const uri = process.env.MONGODB_URI?.trim();
    const dbName = process.env.MONGODB_DB_NAME?.trim() || "verisphere";
    if (!uri) return null;

    try {
      const client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 4000,
        connectTimeoutMS: 4000,
        socketTimeoutMS: 10000,
        maxPoolSize: 10,
      });

      await client.connect();
      const db = client.db(dbName);
      await db.command({ ping: 1 });

      this.client = client;
      this.db = db;
      this.lastFailureAt = 0;
      this.lastError = null;

      await this.ensureCollectionsAndIndexes(db);
      this.initialized = true;
      console.log(`[MongoDB] ✅ Connected to database "${dbName}" (5 schema-validated collections + 90d TTL ready).`);
      return db;
    } catch (err: any) {
      this.lastFailureAt = Date.now();
      this.lastError = err?.message || String(err);
      this.db = null;
      this.initialized = false;
      console.warn(
        `[MongoDB] ⚠️ Unavailable (${this.lastError}). Verification will continue using PostgreSQL only.`
      );
      return null;
    }
  }

  private async ensureCollectionsAndIndexes(db: Db): Promise<void> {
    const existingList = await db.listCollections({}, { nameOnly: true }).toArray();
    const existingNames = new Set(existingList.map((c) => c.name));

    for (const spec of COLLECTION_SPECS) {
      if (!existingNames.has(spec.name)) {
        await db.createCollection(spec.name, {
          validator: spec.validator,
          validationLevel: "moderate",
          validationAction: "error",
        });
      } else {
        // Keep validator up to date on existing collections
        try {
          await db.command({
            collMod: spec.name,
            validator: spec.validator,
            validationLevel: "moderate",
            validationAction: "error",
          });
        } catch (collModErr: any) {
          // Some managed tiers restrict collMod; safe to warn and continue
          console.warn(`[MongoDB] collMod skipped for ${spec.name}:`, collModErr?.message || collModErr);
        }
      }

      const col = db.collection(spec.name);
      for (const idx of spec.indexes) {
        try {
          await col.createIndex(idx.key, idx.options);
        } catch (idxErr: any) {
          console.warn(`[MongoDB] Index creation note on ${spec.name}:`, idxErr?.message || idxErr);
        }
      }
    }
  }

  public async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
      this.initialized = false;
    }
  }
}

export const mongoManager = new MongoConnectionManager();

/**
 * Non-blocking startup initializer called from apps/api/src/index.ts.
 */
export async function initMongoDb(): Promise<void> {
  if (!mongoManager.isConfigured()) {
    console.log("[MongoDB] MONGODB_URI not set — running in PostgreSQL-only mode (MongoDB evidence disabled).");
    return;
  }
  await mongoManager.getDb();
}
