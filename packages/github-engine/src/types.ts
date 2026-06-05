/**
 * @file types.ts
 * @package @verisphere/github-engine
 * @purpose Central TypeScript contracts for the GitHub Evidence Scraper.
 *          Zero runtime dependencies — pure type definitions.
 */

// ---------------------------------------------------------------------------
// Raw GitHub API shapes (subset of what Octokit returns)
// ---------------------------------------------------------------------------

export interface RawRepo {
  name: string;
  full_name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  created_at: string | null;
  updated_at: string | null;
  pushed_at: string | null;
  fork: boolean;
  archived: boolean;
}

export interface RawContributor {
  login: string | undefined;
  contributions: number;
}

export interface RawCommit {
  commit: {
    author: {
      name: string | null | undefined;
      email: string | null | undefined;
      date: string | null | undefined;
    } | null;
    committer: {
      date: string | null | undefined;
    } | null;
  };
}

// ---------------------------------------------------------------------------
// Evidence output shapes (per spec)
// ---------------------------------------------------------------------------

/** One repository's raw metadata as returned from the scraper. */
export interface RepositoryEvidence {
  name: string;
  description?: string;
  language?: string;
  stars: number;
  forks: number;
  createdAt: string;
  updatedAt: string;
  pushedAt: string;
  isFork: boolean;
}

/** Per-repo aggregated evidence for downstream AI analysis. */
export interface RepoEvidence {
  repoName: string;
  technologies: string[];
  ownershipPercent: number;
  totalCommits: number;
  primaryLanguage: string;
  flags: string[];
}

/** A timeline anomaly flag detected in a repository's commit history. */
export interface TimelineFlag {
  type: "SUSPICIOUS_BURST" | "DORMANCY_BREAK" | "BACKDATED_PATTERN";
  severity: "low" | "medium" | "high";
  repoName: string;
  detail: string;
}

/** Contributor analysis result for a single repository. */
export interface ContributorResult {
  repoName: string;
  candidateContributions: number;
  totalContributions: number;
  ownershipPercent: number;
}

/** Commit activity metrics aggregated across a repository. */
export interface ActivityMetrics {
  repoName: string;
  totalCommits: number;
  activeMonths: number;
  avgCommitsPerMonth: number;
  lastActiveDate: string;
  /** Parsed commit author dates, used for timeline analysis. */
  commitDates: Date[];
}

// ---------------------------------------------------------------------------
// Top-level output contract (matches spec exactly)
// ---------------------------------------------------------------------------

/**
 * The final structured output produced by the GitHub Evidence Scraper.
 * Consumed by the AI Layer for resume claim verification.
 *
 * Rules (from spec):
 *  - Scores must be between 0 and 100.
 *  - No null values.
 *  - Empty arrays instead of null.
 *  - Deterministic JSON output only.
 */
export interface GithubEvidenceReport {
  /** Normalized GitHub username. */
  username: string;
  /** Raw repository metadata list, sorted by most recent push. */
  repositories: RepositoryEvidence[];
  /** Technologies detected from actual repo file contents (sorted, deduped). */
  verifiedSkills: string[];
  /** Languages with >= 5% share across all repos (sorted by share descending). */
  verifiedLanguages: string[];
  /** Language name → integer percentage (0-100). Only languages >= 5% included. */
  languageDistribution: Record<string, number>;
  /** Weighted average ownership score across all repos (0-100). */
  ownershipScore: number;
  /** Activity quality score based on consistency, frequency, recency (0-100). */
  activityScore: number;
  /** List of detected timeline anomaly flags across all repos. */
  timelineFlags: TimelineFlag[];
  /** One entry per analyzed repository. */
  repoEvidence: RepoEvidence[];
}
