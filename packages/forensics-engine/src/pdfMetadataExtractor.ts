/**
 * @file pdfMetadataExtractor.ts
 * @package @verisphere/forensics-engine
 * @purpose Extracts PDF metadata attributes (Title, Author, Creator, Producer, Dates) from a buffer.
 */

import { PDFParse } from "pdf-parse";
import * as crypto from "crypto";
import { PdfMetadata } from "@verisphere/shared-types";

/**
 * Extracts metadata information, calculates SHA256 signature, and page count for a PDF file buffer.
 *
 * @param pdfBuffer - Buffer of the target PDF file.
 * @returns Promise<PdfMetadata>
 */
export async function extractPdfMetadata(pdfBuffer: Buffer): Promise<PdfMetadata> {
  if (!pdfBuffer || pdfBuffer.length === 0) {
    throw new Error("Invalid input: pdfBuffer is empty or undefined.");
  }

  try {
    // Generate secure SHA-256 cryptographic hash
    const sha256Hash = crypto.createHash("sha256").update(pdfBuffer).digest("hex");
    const fileSize = pdfBuffer.length;

    // Load PDF using the modern typed PDFParse class
    const parser = new PDFParse({ data: new Uint8Array(pdfBuffer) });
    const infoResult = await parser.getInfo();
    const info = infoResult.info || {};
    const dateNode = infoResult.getDateNode();

    // Standard fields: Title, Author, Creator, Producer
    const title = info.Title || info.title || undefined;
    const author = info.Author || info.author || undefined;
    const creator = info.Creator || info.creator || undefined;
    const producer = info.Producer || info.producer || undefined;

    // Dates collected by the library's DateNode helper
    const creationDate = dateNode.CreationDate || undefined;
    const modificationDate = dateNode.ModDate || undefined;

    // Document characteristics
    const pageCount = infoResult.total || 1;
    const pdfVersion = info.PDFFormatVersion || "unknown";

    // Release parser worker resources
    await parser.destroy();

    return {
      title,
      author,
      producer,
      creator,
      creationDate,
      modificationDate,
      pageCount,
      pdfVersion,
      sha256Hash,
      fileSize,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown extraction error";
    throw new Error(`Failed to extract PDF metadata: ${message}`);
  }
}
