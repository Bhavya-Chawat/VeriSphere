/**
 * @file pdfMetadataExtractor.ts
 * @package @verisphere/forensics-engine
 * @purpose Extracts PDF metadata attributes (Title, Author, Creator, Producer, Dates) from a buffer.
 */

import pdf = require("pdf-parse");
import * as crypto from "crypto";
import { PdfMetadata } from "@verisphere/shared-types";

/**
 * Parses a PDF format date string (e.g. "D:20240110120000Z" or "D:20201220163907-08'00'")
 * and returns a JavaScript Date object, or undefined if parsing fails.
 *
 * @param dateStr - The raw date string from the PDF Info dictionary.
 */
function parsePdfDate(dateStr: unknown): Date | undefined {
  if (!dateStr || typeof dateStr !== "string") {
    return undefined;
  }

  // Check if it is already a standard recognizable date string
  const timestamp = Date.parse(dateStr);
  if (!isNaN(timestamp)) {
    return new Date(timestamp);
  }

  // Parse the standard PDF Date format: D:YYYYMMDDHHmmSSOHH'mm'
  // Regex matches: D:YYYYMMDDHHmmSS followed optionally by UTC (Z) or timezone offset (e.g. -08'00')
  const pdfDatePattern = /^D:(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})?(?:(Z)|([+-]\d{2})'(\d{2})')?/;
  const match = dateStr.match(pdfDatePattern);

  if (match) {
    const [_, year, month, day, hour, minute, second, utc, tzSignHour, tzMin] = match;
    let isoStr = `${year}-${month}-${day}T${hour}:${minute}:${second || "00"}`;

    if (utc) {
      isoStr += "Z";
    } else if (tzSignHour) {
      isoStr += `${tzSignHour}:${tzMin || "00"}`;
    }

    const date = new Date(isoStr);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }

  // Fallback cleanup by removing D: and single quotes
  const cleaned = dateStr.replace(/^D:/, "").replace(/'/g, "");
  const fallbackDate = new Date(cleaned);
  if (!isNaN(fallbackDate.getTime())) {
    return fallbackDate;
  }

  return undefined;
}

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

    // Parse the PDF content and retrieve the Info dictionary
    const parsePdf = pdf as any;
    const data = await parsePdf(pdfBuffer);
    const info = data.info || {};

    // Standard fields: Title, Author, Creator, Producer
    const title = info.Title || info.title || undefined;
    const author = info.Author || info.author || undefined;
    const creator = info.Creator || info.creator || undefined;
    const producer = info.Producer || info.producer || undefined;

    // Standard date fields: CreationDate, ModDate
    const creationDate = parsePdfDate(info.CreationDate || info.creationdate);
    const modificationDate = parsePdfDate(info.ModDate || info.moddate || info.ModificationDate || info.modificationdate);

    // Document characteristics
    const pageCount = data.numpages || 1;
    const pdfVersion = data.version || "unknown";

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
