/**
 * @file metadataRules.ts
 * @package @verisphere/forensics-engine
 * @purpose Evaluates PDF metadata against structured verification rules to identify anomalies.
 */

import { PdfMetadata, ForensicFinding, Severity } from "@verisphere/shared-types";

/**
 * Checks metadata of a PDF against standard forensics rules and returns any findings.
 * 
 * @param metadata - The extracted PDF metadata.
 * @returns An array of ForensicFindings.
 */
export function checkMetadataRules(metadata: PdfMetadata): ForensicFinding[] {
  const findings: ForensicFinding[] = [];

  // Rule 1: Suspicious Software
  // Trigger if Creator or Producer contains Canva, Photoshop, Illustrator, or GIMP
  const suspiciousSoftware = ["canva", "photoshop", "illustrator", "gimp"];
  const creatorLower = (metadata.creator || "").toLowerCase();
  const producerLower = (metadata.producer || "").toLowerCase();

  const creatorSuspicious = suspiciousSoftware.find(sw => creatorLower.includes(sw));
  const producerSuspicious = suspiciousSoftware.find(sw => producerLower.includes(sw));

  if (creatorSuspicious || producerSuspicious) {
    const softwareName = creatorSuspicious || producerSuspicious;
    findings.push({
      category: "SUSPICIOUS_PROVIDER",
      severity: Severity.MEDIUM,
      description: "Document was generated or edited using software frequently associated with certificate template alteration.",
      evidence: `Found suspicious software reference: "${softwareName}" in metadata (Creator: "${metadata.creator || ""}", Producer: "${metadata.producer || ""}")`
    });
  }

  // Rule 2: Large modification gap
  // Trigger if modification date exceeds creation date by 30 days
  if (metadata.creationDate && metadata.modificationDate) {
    const diffTime = metadata.modificationDate.getTime() - metadata.creationDate.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    if (diffDays > 30) {
      findings.push({
        category: "METADATA_MISMATCH",
        severity: Severity.HIGH,
        description: "The document's modification date is significantly later than its creation date, indicating potential post-issuance tampering.",
        evidence: `Modification date (${metadata.modificationDate.toISOString()}) is ${Math.round(diffDays)} days after creation date (${metadata.creationDate.toISOString()})`
      });
    }
  }

  // Rule 3: Missing metadata
  // Trigger if creator or producer is missing
  if (!metadata.creator || !metadata.producer) {
    const missingFields: string[] = [];
    if (!metadata.creator) missingFields.push("Creator");
    if (!metadata.producer) missingFields.push("Producer");

    findings.push({
      category: "METADATA_MISMATCH",
      severity: Severity.LOW,
      description: "The document is missing standard PDF metadata fields, which is common in sanitized or stripped files.",
      evidence: `Missing metadata field(s): ${missingFields.join(", ")}`
    });
  }

  // Rule 4: Creator Producer Mismatch
  // Trigger if creator and producer come from different vendors
  if (metadata.creator && metadata.producer) {
    const getVendor = (name: string): string => {
      const lower = name.toLowerCase();
      if (lower.includes("adobe") || lower.includes("acrobat") || lower.includes("photoshop") || lower.includes("illustrator") || lower.includes("distiller") || lower.includes("pdf library")) return "Adobe";
      if (lower.includes("microsoft") || lower.includes("word") || lower.includes("office") || lower.includes("powerpoint") || lower.includes("excel")) return "Microsoft";
      if (lower.includes("google") || lower.includes("chrome") || lower.includes("sheets") || lower.includes("docs")) return "Google";
      if (lower.includes("apple") || lower.includes("pages") || lower.includes("keynote") || lower.includes("quartz") || lower.includes("preview") || lower.includes("macos")) return "Apple";
      if (lower.includes("canva")) return "Canva";
      if (lower.includes("gimp")) return "GIMP";
      if (lower.includes("nitro")) return "Nitro";
      if (lower.includes("libreoffice") || lower.includes("openoffice") || lower.includes("writer")) return "LibreOffice";
      return lower.trim();
    };

    const creatorVendor = getVendor(metadata.creator);
    const producerVendor = getVendor(metadata.producer);

    // Trigger mismatch if vendors are resolved and do not match
    if (creatorVendor !== producerVendor) {
      findings.push({
        category: "METADATA_MISMATCH",
        severity: Severity.MEDIUM,
        description: "The document's Creator and Producer metadata point to different software vendors, indicating post-processing or modification.",
        evidence: `Creator vendor is "${creatorVendor}" (from "${metadata.creator}") but Producer vendor is "${producerVendor}" (from "${metadata.producer}")`
      });
    }
  }

  return findings;
}
