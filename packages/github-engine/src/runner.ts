/**
 * @file runner.ts
 * @package @verisphere/github-engine
 * @purpose CLI test runner. Accepts a GitHub username/URL as argv[2] and
 *          pretty-prints the full GithubEvidenceReport JSON.
 *
 * Usage:
 *   pnpm github:test johndoe
 *   pnpm github:test https://github.com/johndoe
 *   MOCK_GITHUB=true pnpm github:test johndoe
 */

import { scrapeGithubEvidence } from "./index";

async function main(): Promise<void> {
  const input = process.argv[2];

  if (!input) {
    console.error(
      "Usage: pnpm github:test <github-username-or-url>\n" +
        "Example: pnpm github:test johndoe\n" +
        "Example: MOCK_GITHUB=true pnpm github:test johndoe"
    );
    process.exit(1);
  }

  console.log(`\n[runner] Starting evidence scrape for: ${input}`);
  console.log("[runner] MOCK_GITHUB =", process.env.MOCK_GITHUB ?? "false");
  console.log("─".repeat(60));

  try {
    const report = await scrapeGithubEvidence(input);
    console.log("\n[runner] ✅ GithubEvidenceReport:\n");
    console.log(JSON.stringify(report, null, 2));
    console.log("\n[runner] Done.");
  } catch (error) {
    console.error("\n[runner] ❌ Error:", (error as Error).message);
    process.exit(1);
  }
}

main();
