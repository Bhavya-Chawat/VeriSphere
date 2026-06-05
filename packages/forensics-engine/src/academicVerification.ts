import { AcademicProfile, AcademicVerificationResult } from "@verisphere/shared-types";

// Mock authoritative institution database
const INSTITUTION_DB = [
  {
    normalizedName: "Massachusetts Institute of Technology",
    aliases: ["MIT", "Mass Tech"],
    domains: ["mit.edu"]
  },
  {
    normalizedName: "R V College of Engineering",
    aliases: ["RVCE", "Rashtreeya Vidyalaya College of Engineering"],
    domains: ["rvce.edu.in"]
  },
  {
    normalizedName: "Stanford University",
    aliases: ["Stanford"],
    domains: ["stanford.edu"]
  },
  {
    normalizedName: "Indian Institute of Technology Bombay",
    aliases: ["IIT Bombay", "IITB"],
    domains: ["iitb.ac.in"]
  }
];

/**
 * Fuzzy matches an extracted institution name against the authoritative database.
 * Returns the matched institution or null if no strong match is found.
 */
function fuzzyMatchInstitution(claimedName: string) {
  const lowerClaim = claimedName.toLowerCase().trim();
  
  for (const inst of INSTITUTION_DB) {
    if (inst.normalizedName.toLowerCase() === lowerClaim) {
      return inst;
    }
    for (const alias of inst.aliases) {
      if (alias.toLowerCase() === lowerClaim || lowerClaim.includes(alias.toLowerCase())) {
        return inst;
      }
    }
    // Partial match on normalized name (e.g. "Massachusetts Institute" -> "Massachusetts Institute of Technology")
    if (inst.normalizedName.toLowerCase().includes(lowerClaim) || lowerClaim.includes(inst.normalizedName.toLowerCase())) {
        return inst;
    }
  }
  return null;
}

/**
 * Validates the academic profile against the provided institutional email.
 * @param profile The academic profile extracted from the resume
 * @param institutionalEmail The official email provided by the candidate
 * @returns AcademicVerificationResult containing confidence scores and flags
 */
export function verifyAcademicProfile(
  profile: AcademicProfile | undefined,
  institutionalEmail?: string
): AcademicVerificationResult[] {
  if (!profile || !profile.institutionName) {
    return [];
  }

  const result: AcademicVerificationResult = {
    claimedInstitution: profile.institutionName,
    normalizedInstitution: profile.institutionName,
    degree: profile.degreeName || "Unknown Degree",
    specialization: profile.branchOrSpecialization,
    graduationTimeline: `${profile.enrollmentYear || 'Unknown'} - ${profile.graduationYear || 'Unknown'}`,
    domainMatch: false,
    institutionVerified: false,
    confidenceScore: 0.1,
    evidenceLevel: "NONE",
    riskFlags: []
  };

  // 1. Institution Verification (Fuzzy Matching)
  const matchedInstitution = fuzzyMatchInstitution(profile.institutionName);
  
  if (matchedInstitution) {
    result.institutionVerified = true;
    result.normalizedInstitution = matchedInstitution.normalizedName;
    result.confidenceScore = 0.5;
    result.evidenceLevel = "MODERATE";
  } else {
    result.riskFlags.push("Unrecognized institution name");
  }

  // 2. Domain Match Verification
  if (institutionalEmail && matchedInstitution) {
    const emailDomain = institutionalEmail.split("@")[1]?.toLowerCase();
    if (emailDomain) {
      if (matchedInstitution.domains.includes(emailDomain)) {
        result.domainMatch = true;
        result.confidenceScore = 0.95;
        result.evidenceLevel = "STRONG";
      } else {
        result.riskFlags.push(`Email domain (${emailDomain}) does not match institution domains`);
        // We do not fail it entirely, it just goes to manual review
        result.evidenceLevel = "CONTRADICTORY";
        result.confidenceScore = 0.2;
      }
    }
  } else if (institutionalEmail && !matchedInstitution) {
      result.riskFlags.push("Provided institutional email but institution could not be verified");
  } else if (!institutionalEmail) {
      // It's okay to not provide an email, but confidence is capped
  }

  // 3. Timeline checks (basic heuristics)
  if (profile.enrollmentYear && profile.graduationYear) {
    const start = parseInt(profile.enrollmentYear, 10);
    const end = parseInt(profile.graduationYear, 10);
    if (!isNaN(start) && !isNaN(end)) {
      if (end < start) {
        result.riskFlags.push("Conflicting graduation timeline (graduates before enrolling)");
        result.confidenceScore = Math.max(0, result.confidenceScore - 0.4);
      } else if (end - start > 10) {
        result.riskFlags.push("Unusually long degree timeline (>10 years)");
        result.confidenceScore = Math.max(0, result.confidenceScore - 0.2);
      }
    }
  }

  return [result];
}
