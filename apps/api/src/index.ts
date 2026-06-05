import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import * as dotenv from "dotenv";
import path from "path";

// Load environment from root
dotenv.config({ path: path.join(__dirname, "../../../.env") });

import { VerificationOrchestrator } from "./application/verification-orchestrator";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

const orchestrator = new VerificationOrchestrator();

// Health Check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Test endpoint to manually trigger the orchestrator
app.post("/api/test-verify", async (req, res) => {
  try {
    const { resumeText, githubMetrics } = req.body;
    
    // Create dummy wrapper objects required by our Orchestrator signature
    const dummyJob = { id: `test-job-${Date.now()}`, candidateId: "test-cand-1", status: "QUEUED", startedAt: new Date() };
    const dummyResume = { id: "res-1", candidateId: "test-cand-1", fileUrl: "test", rawText: resumeText, skills: [], education: [], experience: [], projects: [] };
    
    console.log("Triggering Orchestrator...");
    const report = await orchestrator.executeVerification(
      dummyJob as any, 
      dummyResume as any, 
      githubMetrics as any
    );
    
    res.status(200).json({ success: true, report });
  } catch (error: any) {
    console.error("Verification error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`[VeriSphere API] Running on http://localhost:${PORT}`);
  console.log(`[Test] Send POST to http://localhost:${PORT}/api/test-verify with JSON { "resumeText": "...", "githubMetrics": {} }`);
});
