/**
 * @file forensics.controller.ts
 * @package apps/api
 * @purpose Implements controller layer validating inputs and dispatching tasks to ForensicsService.
 */

import { Request, Response, NextFunction } from "express";
import { ForensicsService } from "./forensics.service";

export class ForensicsController {
  private service: ForensicsService;

  constructor() {
    this.service = new ForensicsService();
  }

  /**
   * Endpoint handler to accept and run forensics analysis on an uploaded PDF certificate.
   */
  public analyze = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const file = req.file;

      if (!file) {
        res.status(400).json({ error: "Certificate file is required in 'certificate' field." });
        return;
      }

      // Check for PDF file signature or extensions to validate file type
      const isPdfMime = file.mimetype === "application/pdf";
      const isPdfExtension = file.originalname.toLowerCase().endsWith(".pdf");

      if (!isPdfMime && !isPdfExtension) {
        res.status(400).json({ error: "Invalid file format. Only digitally generated PDF documents are supported." });
        return;
      }

      const analysisResult = await this.service.analyze(file.buffer);

      res.status(200).json({
        success: true,
        data: analysisResult
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error during forensics analysis";
      res.status(500).json({
        success: false,
        error: errorMsg
      });
    }
  };
}
