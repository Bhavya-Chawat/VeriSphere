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
  router.post("/intake", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await uploadCandidateUseCase.execute(req.body);
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
        orderBy: { createdAt: "desc" },
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

    return res.status(500).json({ error: "Internal server error.", details: err.message, stack: err.stack });
  });

  return router;
}
