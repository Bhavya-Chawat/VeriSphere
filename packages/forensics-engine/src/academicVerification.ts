import { AcademicProfile, AcademicVerificationResult } from "@verisphere/shared-types";

// ═══════════════════════════════════════════════════════════════
// Authoritative Institution Database
// Each entry has: canonical name, known aliases, email domains
// ═══════════════════════════════════════════════════════════════
const INSTITUTION_DB = [
  // --- INDIA ---
  { normalizedName: "R V College of Engineering", aliases: ["RVCE", "Rashtreeya Vidyalaya College of Engineering", "RV College", "R.V. College of Engineering"], domains: ["rvce.edu.in"] },
  { normalizedName: "Visvesvaraya Technological University", aliases: ["VTU"], domains: ["vtu.ac.in"] },
  { normalizedName: "Indian Institute of Technology Bombay", aliases: ["IIT Bombay", "IITB", "IIT-B"], domains: ["iitb.ac.in"] },
  { normalizedName: "Indian Institute of Technology Delhi", aliases: ["IIT Delhi", "IITD", "IIT-D"], domains: ["iitd.ac.in"] },
  { normalizedName: "Indian Institute of Technology Madras", aliases: ["IIT Madras", "IITM", "IIT-M"], domains: ["iitm.ac.in"] },
  { normalizedName: "Indian Institute of Technology Kanpur", aliases: ["IIT Kanpur", "IITK"], domains: ["iitk.ac.in"] },
  { normalizedName: "Indian Institute of Technology Kharagpur", aliases: ["IIT Kharagpur", "IIT KGP", "IITKGP"], domains: ["iitkgp.ac.in"] },
  { normalizedName: "Indian Institute of Technology Roorkee", aliases: ["IIT Roorkee", "IITR"], domains: ["iitr.ac.in"] },
  { normalizedName: "Indian Institute of Technology Hyderabad", aliases: ["IIT Hyderabad", "IITH"], domains: ["iith.ac.in"] },
  { normalizedName: "Birla Institute of Technology and Science", aliases: ["BITS", "BITS Pilani", "BITS-Pilani"], domains: ["bits-pilani.ac.in", "pilani.bits-pilani.ac.in"] },
  { normalizedName: "National Institute of Technology Karnataka", aliases: ["NIT Surathkal", "NITK", "NIT Karnataka"], domains: ["nitk.ac.in"] },
  { normalizedName: "National Institute of Technology Trichy", aliases: ["NIT Trichy", "NITT", "NIT Tiruchirappalli"], domains: ["nitt.edu"] },
  { normalizedName: "National Institute of Technology Warangal", aliases: ["NIT Warangal", "NITW"], domains: ["nitw.ac.in"] },
  { normalizedName: "Delhi Technological University", aliases: ["DTU", "Delhi College of Engineering", "DCE"], domains: ["dtu.ac.in"] },
  { normalizedName: "Anna University", aliases: ["Anna Univ", "AU Chennai"], domains: ["annauniv.edu"] },
  { normalizedName: "PES University", aliases: ["PES", "PESU", "PES Institute of Technology", "PESIT"], domains: ["pes.edu"] },
  { normalizedName: "MS Ramaiah Institute of Technology", aliases: ["MSRIT", "Ramaiah", "M.S. Ramaiah"], domains: ["msrit.edu"] },
  { normalizedName: "BMS College of Engineering", aliases: ["BMSCE", "BMS"], domains: ["bmsce.ac.in"] },
  { normalizedName: "Manipal Institute of Technology", aliases: ["MIT Manipal", "Manipal University"], domains: ["manipal.edu"] },
  { normalizedName: "SRM Institute of Science and Technology", aliases: ["SRM", "SRM University", "SRMIST"], domains: ["srmist.edu.in", "srm.edu.in"] },
  { normalizedName: "Vellore Institute of Technology", aliases: ["VIT", "VIT Vellore", "VIT University"], domains: ["vit.ac.in"] },
  // --- USA ---
  { normalizedName: "Massachusetts Institute of Technology", aliases: ["MIT"], domains: ["mit.edu"] },
  { normalizedName: "Stanford University", aliases: ["Stanford"], domains: ["stanford.edu"] },
  { normalizedName: "Harvard University", aliases: ["Harvard"], domains: ["harvard.edu"] },
  { normalizedName: "Carnegie Mellon University", aliases: ["CMU", "Carnegie Mellon"], domains: ["cmu.edu", "andrew.cmu.edu"] },
  { normalizedName: "University of California, Berkeley", aliases: ["UC Berkeley", "Berkeley", "UCB", "Cal"], domains: ["berkeley.edu"] },
  { normalizedName: "Georgia Institute of Technology", aliases: ["Georgia Tech", "GT", "GaTech"], domains: ["gatech.edu"] },
  { normalizedName: "University of Illinois Urbana-Champaign", aliases: ["UIUC", "U of I"], domains: ["illinois.edu"] },
  { normalizedName: "University of Michigan", aliases: ["UMich", "Michigan"], domains: ["umich.edu"] },
  { normalizedName: "University of Texas at Austin", aliases: ["UT Austin", "UTA"], domains: ["utexas.edu"] },
  { normalizedName: "California Institute of Technology", aliases: ["Caltech"], domains: ["caltech.edu"] },
  // --- UK ---
  { normalizedName: "University of Oxford", aliases: ["Oxford", "Oxford University"], domains: ["ox.ac.uk"] },
  { normalizedName: "University of Cambridge", aliases: ["Cambridge", "Cambridge University"], domains: ["cam.ac.uk"] },
  { normalizedName: "Imperial College London", aliases: ["Imperial", "ICL"], domains: ["imperial.ac.uk"] },
  { normalizedName: "University College London", aliases: ["UCL"], domains: ["ucl.ac.uk"] },
  { normalizedName: "University of Edinburgh", aliases: ["Edinburgh"], domains: ["ed.ac.uk"] },
];

/**
 * Computes Levenshtein edit distance between two strings.
 * Used for typo-tolerant institution matching.
 */
function levenshteinDistance(a: string, b: string): number {
  const m = a.length, n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

/**
 * Normalized similarity score between two strings (0 to 1).
 */
function similarity(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - levenshteinDistance(a, b) / maxLen;
}

/**
 * Fuzzy matches an extracted institution name against the authoritative database.
 * Uses exact match, alias match, substring match, and Levenshtein similarity.
 * Returns { institution, matchConfidence } or null.
 */
function fuzzyMatchInstitution(claimedName: string): { institution: typeof INSTITUTION_DB[0]; matchConfidence: number } | null {
  const lowerClaim = claimedName.toLowerCase().trim();
  
  // Pass 1: Exact match on normalized name
  for (const inst of INSTITUTION_DB) {
    if (inst.normalizedName.toLowerCase() === lowerClaim) {
      return { institution: inst, matchConfidence: 1.0 };
    }
  }

  // Pass 2: Exact match on aliases
  for (const inst of INSTITUTION_DB) {
    for (const alias of inst.aliases) {
      if (alias.toLowerCase() === lowerClaim) {
        return { institution: inst, matchConfidence: 0.95 };
      }
    }
  }

  // Pass 3: Substring match (claim contains alias or alias contains claim)
  for (const inst of INSTITUTION_DB) {
    if (lowerClaim.includes(inst.normalizedName.toLowerCase()) || inst.normalizedName.toLowerCase().includes(lowerClaim)) {
      return { institution: inst, matchConfidence: 0.85 };
    }
    for (const alias of inst.aliases) {
      if (lowerClaim.includes(alias.toLowerCase()) || alias.toLowerCase().includes(lowerClaim)) {
        return { institution: inst, matchConfidence: 0.80 };
      }
    }
  }

  // Pass 4: Levenshtein fuzzy match (threshold: >0.7 similarity)
  let bestMatch: typeof INSTITUTION_DB[0] | null = null;
  let bestScore = 0;

  for (const inst of INSTITUTION_DB) {
    const nameScore = similarity(lowerClaim, inst.normalizedName.toLowerCase());
    if (nameScore > bestScore) {
      bestScore = nameScore;
      bestMatch = inst;
    }
    for (const alias of inst.aliases) {
      const aliasScore = similarity(lowerClaim, alias.toLowerCase());
      if (aliasScore > bestScore) {
        bestScore = aliasScore;
        bestMatch = inst;
      }
    }
  }

  if (bestMatch && bestScore > 0.7) {
    return { institution: bestMatch, matchConfidence: bestScore * 0.9 }; // Discount fuzzy matches slightly
  }

  return null;
}

/**
 * Validates an academic profile against the institution database and institutional email.
 * 
 * Verification layers:
 *   Layer 1: Institution name fuzzy matching (against 35+ institutions)
 *   Layer 2: Email domain cross-reference
 *   Layer 3: Graduation timeline plausibility checks
 *   Layer 4: Degree timeline consistency
 * 
 * @returns AcademicVerificationResult[] (one per institution claim)
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

  // === LAYER 1: Institution Name Verification (Fuzzy Matching) ===
  const match = fuzzyMatchInstitution(profile.institutionName);
  
  if (match) {
    result.institutionVerified = true;
    result.normalizedInstitution = match.institution.normalizedName;
    result.confidenceScore = Math.min(match.matchConfidence * 0.6, 0.6); // Cap at 0.6 from name match alone
    result.evidenceLevel = "MODERATE";
  } else {
    result.riskFlags.push("Institution not found in verification database — manual review recommended");
  }

  // === LAYER 2: Email Domain Cross-Reference ===
  if (institutionalEmail && match) {
    const emailDomain = institutionalEmail.split("@")[1]?.toLowerCase();
    if (emailDomain) {
      if (match.institution.domains.includes(emailDomain)) {
        result.domainMatch = true;
        result.confidenceScore = 0.95;
        result.evidenceLevel = "STRONG";
      } else {
        result.riskFlags.push(`Email domain (${emailDomain}) does not match expected institution domains (${match.institution.domains.join(', ')})`);
        result.evidenceLevel = "CONTRADICTORY";
        result.confidenceScore = 0.2;
      }
    }
  } else if (institutionalEmail && !match) {
    result.riskFlags.push("Institutional email provided but institution could not be verified");
  }
  // No email is OK, confidence stays at name-match level

  // === LAYER 3: Graduation Timeline Plausibility ===
  const currentYear = new Date().getFullYear();
  
  if (profile.enrollmentYear && profile.graduationYear) {
    const start = parseInt(profile.enrollmentYear, 10);
    const end = parseInt(profile.graduationYear, 10);
    
    if (!isNaN(start) && !isNaN(end)) {
      // Check impossible timelines
      if (end < start) {
        result.riskFlags.push("Graduation year is before enrollment year");
        result.confidenceScore = Math.max(0, result.confidenceScore - 0.4);
        result.evidenceLevel = "CONTRADICTORY";
      } else if (end - start > 8) {
        result.riskFlags.push(`Unusually long degree timeline (${end - start} years)`);
        result.confidenceScore = Math.max(0, result.confidenceScore - 0.15);
      } else if (end - start < 2) {
        result.riskFlags.push(`Unusually short degree timeline (${end - start} year${end - start === 1 ? '' : 's'})`);
        result.confidenceScore = Math.max(0, result.confidenceScore - 0.1);
      }
      
      // Check future graduation
      if (end > currentYear + 1) {
        result.riskFlags.push(`Graduation year (${end}) is in the future`);
        result.confidenceScore = Math.max(0, result.confidenceScore - 0.2);
      }
      
      // Check impossibly old dates
      if (start < 1950) {
        result.riskFlags.push(`Enrollment year (${start}) seems implausibly old`);
        result.confidenceScore = Math.max(0, result.confidenceScore - 0.3);
      }
    }
  }

  // === LAYER 4: Degree Consistency ===
  if (profile.cgpaOrPercentage) {
    const gpa = parseFloat(profile.cgpaOrPercentage);
    if (!isNaN(gpa)) {
      if (gpa > 10 && gpa <= 100) {
        // Percentage system — valid
      } else if (gpa >= 0 && gpa <= 10) {
        // GPA system — valid
      } else if (gpa > 100) {
        result.riskFlags.push(`CGPA/Percentage value (${gpa}) exceeds maximum possible score`);
        result.confidenceScore = Math.max(0, result.confidenceScore - 0.2);
      }
    }
  }

  return [result];
}
