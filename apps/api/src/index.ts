/**
 * @file index.ts
 * @package apps/api
 * @purpose Boots the Express HTTP server, mounts configurations, attaches routers, and monitors health status.
 * @dependencies express, cors, helmet, morgan, dotenv
 * @security Configures secure CORS origins and sets Helmet HTTP security headers.
 * @future_implementation Spin up server under PM2 cluster mode or scale inside Kubernetes clusters.
 */

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import * as dotenv from "dotenv";

import { createVerificationRouter } from "./infrastructure/routes/verification-routes";
import { UploadCandidateUseCase } from "./application/use-cases/upload-candidate";
import { VerificationOrchestrator } from "./application/verification-orchestrator";
import { GeminiProvider } from "@verisphere/ai-layer/src/providers/gemini";

// Load local environment settings
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Security & utility middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(",") || "http://localhost:3000",
  credentials: true
}));
app.use(express.json());
app.use(morgan("combined"));

// Mock Repository Implementations conforming to domain contracts
const mockCandidateRepo = {
  findById: async (id: string) => null,
  findByEmail: async (email: string) => null,
  create: async (c: any) => ({ id: "mock-cand-id", ...c }),
  listAll: async (org: string) => []
};

const mockJobRepo = {
  findById: async (id: string) => null,
  create: async (cId: string) => ({ id: "mock-job-id", candidateId: cId, status: "QUEUED", startedAt: new Date() }),
  updateStatus: async (jId: string, status: string, error?: string) => {},
  saveResults: async () => {}
};

const mockStorageService = {
  fetchFileBuffer: async (url: string) => Buffer.from("pdf-data")
};

// Initialize providers
const geminiProvider = new GeminiProvider({
  apiKey: process.env.GEMINI_API_KEY || "mock-api-key",
  defaultModel: "gemini-1.5-flash",
  maxRetries: 3
});

// Configure orchestration layers
const orchestrator = new VerificationOrchestrator(
  mockJobRepo,
  mockCandidateRepo as any,
  mockStorageService,
  geminiProvider
);

const uploadUseCase = new UploadCandidateUseCase(
  mockCandidateRepo as any,
  mockJobRepo,
  orchestrator
);

// Health Checks
app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Route mount
app.use("/api/verification", createVerificationRouter(uploadUseCase, mockJobRepo));

// Start server
app.listen(PORT, () => {
  console.log(`[VeriSphere API] Running securely on port: ${PORT}`);
});
