/**
 * @file sha256Extractor.ts
 * @package @verisphere/forensics-engine
 * @purpose Generates SHA-256 cryptographic hashes for binary files.
 */

import * as crypto from "crypto";

/**
 * Generates a SHA-256 hash in hexadecimal format for a given binary Buffer.
 * 
 * @param buffer - The file buffer to hash.
 * @returns The SHA-256 hash string.
 */
export function generateSHA256(buffer: Buffer): string {
  if (!buffer) {
    throw new Error("Invalid buffer: Input buffer must be defined.");
  }
  return crypto.createHash("sha256").update(buffer).digest("hex");
}
