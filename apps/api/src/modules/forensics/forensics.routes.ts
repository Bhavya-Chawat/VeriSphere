/**
 * @file forensics.routes.ts
 * @package apps/api
 * @purpose Registers Express routes for certificate forensics endpoints using multer middleware.
 */

import { Router } from "express";
import multer from "multer";
import { ForensicsController } from "./forensics.controller";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB maximum size limit
  }
});

export function createForensicsRouter(): Router {
  const router = Router();
  const controller = new ForensicsController();

  /**
   * POST /api/forensics/analyze
   * Receives certificate PDF and performs forensics scan.
   */
  router.post("/analyze", upload.single("certificate"), controller.analyze);

  return router;
}
