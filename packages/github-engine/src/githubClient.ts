/**
 * @file githubClient.ts
 * @package @verisphere/github-engine
 * @purpose Octokit singleton. Centralizes GitHub API authentication.
 *          Reads GITHUB_TOKEN from environment. Gracefully handles missing token.
 */

import { Octokit } from "@octokit/rest";

// Load .env file from the package root (useful for local test runner)
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("dotenv").config();
} catch {
  // dotenv is optional — environment variables may be pre-set
}

let _octokitInstance: Octokit | null = null;

/**
 * Returns a shared, lazily-initialized Octokit instance.
 *
 * If GITHUB_TOKEN is missing, the client operates in unauthenticated mode
 * (60 requests/hour rate limit). A warning is emitted but no error is thrown.
 *
 * @returns Authenticated (or unauthenticated) Octokit client
 */
export function getOctokit(): Octokit {
  if (_octokitInstance) {
    return _octokitInstance;
  }

  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    console.warn(
      "[github-engine] WARNING: GITHUB_TOKEN is not set. " +
        "Operating in unauthenticated mode (60 req/hr rate limit). " +
        "Set GITHUB_TOKEN in .env to increase limits."
    );
  }

  _octokitInstance = new Octokit({
    auth: token || undefined,
  });

  return _octokitInstance;
}

/**
 * Resets the cached Octokit instance. Useful for testing.
 */
export function resetOctokitInstance(): void {
  _octokitInstance = null;
}
