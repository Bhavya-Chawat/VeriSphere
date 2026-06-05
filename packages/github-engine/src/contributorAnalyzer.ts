/**
 * @file contributorAnalyzer.ts
 * @package @verisphere/github-engine
 * @purpose Fetches contributor statistics for a repository and computes
 *          the candidate's ownership percentage based on commit count.
 */

import { Octokit } from "@octokit/rest";
import { ContributorResult } from "./types";

/**
 * Fetches contributor data for a repository and calculates the candidate's
 * share of total contributions.
 *
 * Formula:
 *   ownershipPercent = Math.round((candidateContributions / totalContributions) * 100)
 *
 * Edge cases:
 *  - If the candidate has no commits in this repo → ownershipPercent = 0
 *  - If the repo has no contributors (e.g., empty repo) → all fields = 0
 *  - API failures return a zero-ownership result gracefully.
 *
 * @param username - GitHub username of the candidate
 * @param repoName - Repository name
 * @param octokit  - Authenticated Octokit client
 * @returns ContributorResult with per-repo ownership data
 */
export async function analyzeContributors(
  username: string,
  repoName: string,
  octokit: Octokit
): Promise<ContributorResult> {
  const fallback: ContributorResult = {
    repoName,
    candidateContributions: 0,
    totalContributions: 0,
    ownershipPercent: 0,
  };

  try {
    const response = await octokit.rest.repos.listContributors({
      owner: username,
      repo: repoName,
      per_page: 100,
      anon: "false",
    });

    if (!response.data || response.data.length === 0) {
      return fallback;
    }

    let totalContributions = 0;
    let candidateContributions = 0;
    const candidateLoginLower = username.toLowerCase();

    for (const contributor of response.data) {
      const count = contributor.contributions ?? 0;
      totalContributions += count;

      const login = (contributor.login ?? "").toLowerCase();
      if (login === candidateLoginLower) {
        candidateContributions = count;
      }
    }

    const ownershipPercent =
      totalContributions > 0
        ? Math.round((candidateContributions / totalContributions) * 100)
        : 0;

    return {
      repoName,
      candidateContributions,
      totalContributions,
      ownershipPercent,
    };
  } catch (error) {
    console.warn(
      `[contributorAnalyzer] Could not fetch contributors for ${username}/${repoName}:`,
      (error as Error).message
    );
    return fallback;
  }
}
