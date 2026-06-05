import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import * as dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

import { createVerificationRouter } from "./infrastructure/routes/verification-routes";
import { createForensicsRouter } from "./modules/forensics/forensics.routes";
import { UploadCandidateUseCase } from "./application/use-cases/upload-candidate";
import { VerificationOrchestrator } from "./application/verification-orchestrator";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(morgan("combined"));

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Real Database Implementations for Testing
const mockCandidateRepo = {
  findById: async (id: string) => null,
  findByEmail: async (email: string) => null,
  create: async (c: any) => {
    const candidate = await prisma.candidate.create({
      data: {
        firstName: c.firstName || "John",
        lastName: c.lastName || "Doe",
        email: c.email || "test@example.com",
        institutionalEmail: c.institutionalEmail || null,
        githubUrl: c.githubUrl || null
      }
    });
    return candidate as any;
  },
  listAll: async (org: string) => []
};

const mockJobRepo = {
  findById: async (id: string) => {
    return prisma.verificationJob.findUnique({
      where: { id },
      include: { report: true, candidate: true }
    });
  },
  create: async (cId: string) => {
    const job = await prisma.verificationJob.create({
      data: {
        candidateId: cId,
        status: "QUEUED"
      }
    });
    return job as any;
  },
  updateStatus: async (jId: string, status: string, error?: string) => {},
  saveResults: async () => {}
} as any;

const orchestrator = new VerificationOrchestrator();
const uploadUseCase = new UploadCandidateUseCase(mockCandidateRepo, mockJobRepo, orchestrator);

// Health Check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Route mount
app.use("/api/verification", createVerificationRouter(uploadUseCase, mockJobRepo));
app.use("/api/forensics", createForensicsRouter());

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("[Global Error]", err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal Server Error"
  });
});

app.listen(PORT, () => {
  console.log(`[VeriSphere API] Running on http://localhost:${PORT}`);
});
