/**
 * @file activityScorer.ts
 * @package @verisphere/github-engine
 * @purpose Fetches commit history per repository and computes an activity
 *          quality score based on consistency, frequency, and recency.
 */

import { Octokit } from "@octokit/rest";
import { ActivityMetrics } from "./types";

// ---------------------------------------------------------------------------
// Commit Fetching
// ---------------------------------------------------------------------------

/**
 * Fetches up to 100 commits authored by the candidate in a repository.
 * Returns parsed ActivityMetrics including the raw commit dates needed
 * for timeline analysis.
 *
 * @param username - GitHub username (used as commit author filter)
 * @param repoName - Repository name
 * @param octokit  - Authenticated Octokit client
 * @returns ActivityMetrics for this repository
 */
export async function fetchCommitActivity(
  username: string,
  repoName: string,
  octokit: Octokit
): Promise<ActivityMetrics> {
  const fallback: ActivityMetrics = {
    repoName,
    totalCommits: 0,
    activeMonths: 0,
    avgCommitsPerMonth: 0,
    lastActiveDate: new Date(0).toISOString(),
    commitDates: [],
    recentCommits: [],
  };

  try {
    const response = await octokit.rest.repos.listCommits({
      owner: username,
      repo: repoName,
      author: username,
      per_page: 100,
    });

    const commits = response.data;
    if (!commits || commits.length === 0) {
      return fallback;
    }

    // Parse commit dates (author date preferred, committer date as fallback)
    const commitDates: Date[] = commits
      .map((c) => {
        const dateStr =
          c.commit.author?.date ?? c.commit.committer?.date ?? null;
        return dateStr ? new Date(dateStr) : null;
      })
      .filter((d): d is Date => d !== null && !isNaN(d.getTime()))
      .sort((a, b) => a.getTime() - b.getTime()); // ascending

    if (commitDates.length === 0) {
      return fallback;
    }

    // Count distinct year-month combinations where commits occurred
    const monthSet = new Set<string>();
    for (const d of commitDates) {
      monthSet.add(`${d.getFullYear()}-${d.getMonth()}`);
    }
    const activeMonths = monthSet.size;

    // Span in months from first to last commit (minimum 1 to avoid division by zero)
    const firstDate = commitDates[0];
    const lastDate = commitDates[commitDates.length - 1];
    const spanMonths = Math.max(
      1,
      (lastDate.getFullYear() - firstDate.getFullYear()) * 12 +
        (lastDate.getMonth() - firstDate.getMonth()) +
        1
    );

    const avgCommitsPerMonth = commitDates.length / spanMonths;

    return {
      repoName,
      totalCommits: commitDates.length,
      activeMonths,
      avgCommitsPerMonth,
      lastActiveDate: lastDate.toISOString(),
      commitDates,
      recentCommits: commits
        .slice(0, 5)
        .map((c: any) => c.commit?.message?.split('\n')[0] || "")
        .filter((msg: string) => msg.trim() !== ""),
    };
  } catch (error) {
    console.warn(
      `[activityScorer] Could not fetch commits for ${username}/${repoName}:`,
      (error as Error).message
    );
    return fallback;
  }
}

// ---------------------------------------------------------------------------
// Activity Score Computation
// ---------------------------------------------------------------------------

/**
 * Computes a composite activity score (0–100) across all repositories.
 *
 * Three factors (each up to a max, summing to 100):
 *
 * 1. **Consistency** (40 pts): Ratio of active months to total span months.
 *    A developer with steady monthly commits scores higher than one with
 *    irregular bursts.
 *
 * 2. **Frequency** (30 pts): Average commits per month, capped at 30/month
 *    to normalize hyper-active contributors.
 *
 * 3. **Recency** (30 pts):
 *    - Last active within 90 days  → 30 pts
 *    - Last active within 180 days → 15 pts
 *    - Older                       → 0 pts
 *
 * @param allMetrics - ActivityMetrics from all analyzed repositories
 * @returns Integer activity score 0–100
 */
export function computeActivityScore(allMetrics: ActivityMetrics[]): number {
  const nonEmptyMetrics = allMetrics.filter((m) => m.totalCommits > 0);
  if (nonEmptyMetrics.length === 0) {
    return 0;
  }

  // --- Factor 1: Consistency ---
  // Aggregate: sum activeMonths / sum span months across repos
  let totalActiveMonths = 0;
  let totalSpanMonths = 0;

  for (const m of nonEmptyMetrics) {
    totalActiveMonths += m.activeMonths;
    // Reconstruct span from commit dates
    const dates = m.commitDates;
    if (dates.length > 1) {
      const first = dates[0];
      const last = dates[dates.length - 1];
      const span =
        (last.getFullYear() - first.getFullYear()) * 12 +
        (last.getMonth() - first.getMonth()) +
        1;
      totalSpanMonths += Math.max(1, span);
    } else {
      totalSpanMonths += 1;
    }
  }

  const consistencyRatio = Math.min(1, totalActiveMonths / totalSpanMonths);
  const consistencyScore = consistencyRatio * 40;

  // --- Factor 2: Frequency ---
  const overallAvgPerMonth =
    nonEmptyMetrics.reduce((sum, m) => sum + m.avgCommitsPerMonth, 0) /
    nonEmptyMetrics.length;
  const frequencyScore = Math.min(30, (overallAvgPerMonth / 30) * 30);

  // --- Factor 3: Recency ---
  const mostRecentDate = nonEmptyMetrics
    .map((m) => new Date(m.lastActiveDate))
    .reduce((latest, d) => (d > latest ? d : latest), new Date(0));

  const daysSinceActive = Math.floor(
    (Date.now() - mostRecentDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  let recencyScore = 0;
  if (daysSinceActive <= 90) {
    recencyScore = 30;
  } else if (daysSinceActive <= 180) {
    recencyScore = 15;
  }

  const total = consistencyScore + frequencyScore + recencyScore;
  return Math.round(Math.max(0, Math.min(100, total)));
}
