/**
 * @file verification-routes.ts
 * @package apps/api
 * @purpose Defines the Express routing endpoints for candidate intake, status checks, audit reports, and analytics.
 * @dependencies express, @verisphere/shared-types, UploadCandidateUseCase
 * @security Access strictly constrained via authMiddleware (requires jwt or valid x-api-key header).
 */

import { Router, Request, Response, NextFunction } from "express";
import { UploadCandidateUseCase } from "../../application/use-cases/upload-candidate";
import { ValidationError, ResourceNotFoundError } from "../../domain/entities";
import { authMiddleware } from "../middleware/auth-middleware";
import { PrismaClient } from "@prisma/client";
import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "../../../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for PDF uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + '.pdf');
    }
  })
});

const prisma = new PrismaClient();

export function createVerificationRouter(
  uploadCandidateUseCase: UploadCandidateUseCase,
  jobRepository: any
): Router {
  const router = Router();

  // Apply Auth Middleware to all routes in this router context
  router.use(authMiddleware);

  /**
   * POST /api/verification/intake
   * Ingests candidate profile and triggers background scan job.
   */
  router.post("/intake", upload.single("resumeFile"), async (req: Request, res: Response, next: NextFunction) => {
    try {
      // req.body contains text fields, req.file contains the uploaded file
      const githubUrl = req.body.githubUsername ? `https://github.com/${req.body.githubUsername}` : req.body.githubUrl;
      
      // Parse certificateAnalyses if provided as JSON string in FormData
      let certificateAnalyses: any[] = [];
      if (req.body.certificateAnalyses) {
        try {
          certificateAnalyses = JSON.parse(req.body.certificateAnalyses);
        } catch (e) {
          console.warn("[Intake] Failed to parse certificateAnalyses:", e);
        }
      }

      const candidateData = {
        ...req.body,
        githubUrl,
        resumeFileUrl: req.file ? req.file.path : undefined,
        certificateUrls: [],
        certificateAnalyses
      };
      
      const result = await uploadCandidateUseCase.execute(candidateData);
      return res.status(202).json(result);
    } catch (error) {
      next(error);
    }
  });

  /**
   * GET /api/verification/jobs/:jobId/status
   * Returns the full VerificationJob with Candidate and AuditReport for polling and report display.
   */
  router.get("/jobs/:jobId/status", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { jobId } = req.params;
      const job = await jobRepository.findById(jobId);
      
      if (!job) {
        throw new ResourceNotFoundError("VerificationJob", jobId);
      }

      return res.status(200).json(job);
    } catch (error) {
      next(error);
    }
  });

  /**
   * GET /api/verification/jobs/:jobId/report/pdf
   * Generates and returns a professionally formatted PDF verification report.
   */
  router.get("/jobs/:jobId/report/pdf", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { jobId } = req.params;
      const job = await jobRepository.findById(jobId);
      
      if (!job || !job.report) {
        throw new ResourceNotFoundError("AuditReport", jobId);
      }

      // We dynamically import or instantiate the service
      // Better to require it here to avoid circular deps if any, or just import it at the top
      const { PdfGeneratorService } = require("../../application/services/pdf-generator");
      const pdfService = new PdfGeneratorService();
      
      const pdfBuffer = await pdfService.generateReport(job);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="VeriSphere_Report_${jobId}.pdf"`);
      return res.send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  });

  /**
   * GET /api/verification/dashboard
   * Returns all recent verification jobs with their candidates and reports for the dashboard.
   */
  router.get("/dashboard", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const jobs = await prisma.verificationJob.findMany({
        orderBy: { startedAt: "desc" },
        take: 50,
        include: {
          candidate: true,
          report: true
        }
      });
      return res.status(200).json(jobs);
    } catch (error) {
      next(error);
    }
  });

  // Global Error Handler for the verification router
  router.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(`[API ERROR] ${err.name}: ${err.message}`);

    if (err instanceof ValidationError) {
      return res.status(400).json({ error: err.message });
    }
    if (err instanceof ResourceNotFoundError) {
      return res.status(404).json({ error: err.message });
    }

    return res.status(500).json({ error: "Internal server error.", details: err.message });
  });

  return router;
}
