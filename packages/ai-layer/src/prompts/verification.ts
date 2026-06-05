/**
 * @file verification.ts
 * @package @verisphere/ai-layer
 * @purpose Contains string-template prompt generators for the semantic verification and interview question generation engines.
 * @dependencies None
 * @security Ensure resume claims and repo texts are clean of script injection characters before inserting into prompts.
 * @future_implementation Store prompt versions in database or CMS to enable hot-swapping templates without redeploying backend.
 */

export const VERIFICATION_SYSTEM_INSTRUCTION = `
You are the VeriSphere AI Core Verification engine. Your task is to act as a principal technical auditor.
You will evaluate:
1. Candidate's Resume Claims (skills, experiences, dates, projects)
2. Document Forensics Report (metadata anomalies, tampering scores)
3. GitHub Profile & Repo Metrics (ownership scores, commit distribution, contributors, push activities)

Guidelines:
- Compare resume claims against hard evidence from GitHub and PDF Forensics.
- Identify contradictions: (e.g. candidate claims 4 years of Kubernetes, but the only repo with K8s is a 2-day-old fork with 1 commit).
- Determine confidence levels (STRONG, MODERATE, NONE, CONTRADICTORY) for each claimed technology.
- List risk items indicating if repositories were cloned, modified with artificial timelines, or certificates tampered.
- Keep comments objective, strictly factual, and professional. Avoid subjective assumptions.
- Output MUST be valid JSON conforming to the requested response schema.
`;

/**
 * Builds the verification payload prompt.
 */
export function buildVerificationPrompt(payload: {
  resumeText: string;
  githubMetricsJson: string;
  forensicsReportJson: string;
}): string {
  return `
--- CANDIDATE RESUME CLAIMS ---
${payload.resumeText}

--- GITHUB CODEBASE METRICS ---
${payload.githubMetricsJson}

--- DOCUMENT FORENSICS METADATA ---
${payload.forensicsReportJson}

--- INSTRUCTIONS ---
Please audit the above evidence against the claims. Generate:
1. Overall Findings Summary
2. Semantic Skill Matches
3. Contradictions Identified
4. Risk Indicators
`;
}

export const INTERVIEW_GENERATION_SYSTEM_INSTRUCTION = `
You are the VeriSphere Interview Question Generator. Your job is to output targeted technical interview questions to verify candidate competencies.
You will receive:
1. The candidate's resume claims.
2. The verification audit report (mismatch anomalies, risk flags, gaps).

Instructions:
- Target specific gaps or suspicious claims (e.g., if a candidate claims Go proficiency but Go repositories show suspicious ownership, generate deep, specific Go questions testing actual building details).
- Avoid generic trivia (e.g., "what is a closure?"). Instead, formulate situational or code-review questions matching the context of their listed projects.
- Map each question to a targeted skill/claim and explain why it was asked.
- Conform exactly to the JSON response schema.
`;
