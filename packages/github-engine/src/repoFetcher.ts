/**
 * @file repoFetcher.ts
 * @package @verisphere/github-engine
 * @purpose Fetches repository list and aggregated language distribution
 *          for a GitHub user. Excludes archived repos. Sorts by push date.
 */

import { Octokit } from "@octokit/rest";
import { RepositoryEvidence } from "./types";

// ---------------------------------------------------------------------------
// Repository Fetching
// ---------------------------------------------------------------------------

/**
 * Fetches all non-archived public repositories for a GitHub user.
 * Results are sorted by most recent push date (descending).
 *
 * @param username - GitHub username
 * @param octokit  - Authenticated Octokit client
 * @returns Sorted list of RepositoryEvidence
 */
export async function fetchRepositories(
  username: string,
  octokit: Octokit
): Promise<RepositoryEvidence[]> {
  try {
    const response = await octokit.rest.repos.listForUser({
      username,
      type: "owner",
      sort: "pushed",
      direction: "desc",
      per_page: 100,
    });

    return response.data
      .filter((repo) => !repo.archived)
      .map((repo) => ({
        name: repo.name,
        description: repo.description ?? undefined,
        language: repo.language ?? undefined,
        stars: repo.stargazers_count ?? 0,
        forks: repo.forks_count ?? 0,
        createdAt: repo.created_at ?? new Date(0).toISOString(),
        updatedAt: repo.updated_at ?? new Date(0).toISOString(),
        pushedAt: repo.pushed_at ?? new Date(0).toISOString(),
        isFork: repo.fork,
      }))
      .sort(
        (a, b) =>
          new Date(b.pushedAt).getTime() - new Date(a.pushedAt).getTime()
      );
  } catch (error) {
    console.error(`[repoFetcher] Failed to fetch repos for ${username}:`, error);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Language Aggregation
// ---------------------------------------------------------------------------

/**
 * Fetches per-repo language bytes and aggregates them into a percentage
 * distribution across all repositories.
 *
 * Only languages with >= 5% share are included in the result.
 *
 * @param username - GitHub username (repo owner)
 * @param repos    - List of repositories to analyze
 * @param octokit  - Authenticated Octokit client
 * @returns Record<languageName, percentageInteger>
 */
export async function fetchLanguageDistribution(
  username: string,
  repos: RepositoryEvidence[],
  octokit: Octokit
): Promise<Record<string, number>> {
  const byteTotals: Record<string, number> = {};
  let grandTotal = 0;

  const results: PromiseSettledResult<Record<string, number>>[] = [];
  const limit = 4;
  for (let i = 0; i < repos.length; i += limit) {
    const chunk = repos.slice(i, i + limit);
    const chunkResults = await Promise.allSettled(
      chunk.map(async (repo) => {
        try {
          const response = await octokit.rest.repos.listLanguages({
            owner: username,
            repo: repo.name,
          });
          return response.data as Record<string, number>;
        } catch {
          return {} as Record<string, number>;
        }
      })
    );
    results.push(...chunkResults);
  }

  for (const result of results) {
    if (result.status === "fulfilled") {
      for (const [lang, bytes] of Object.entries(result.value)) {
        byteTotals[lang] = (byteTotals[lang] ?? 0) + bytes;
        grandTotal += bytes;
      }
    }
  }

  if (grandTotal === 0) {
    return {};
  }

  // Convert bytes → integer percentages, filter < 5%
  const distribution: Record<string, number> = {};
  for (const [lang, bytes] of Object.entries(byteTotals)) {
    const pct = Math.round((bytes / grandTotal) * 100);
    if (pct >= 5) {
      distribution[lang] = pct;
    }
  }

  return distribution;
}
