/**
 * @file timelineAnalyzer.ts
 * @package @verisphere/github-engine
 * @purpose Detects suspicious commit timeline patterns.
 *          Three detectors: SUSPICIOUS_BURST, DORMANCY_BREAK, BACKDATED_PATTERN.
 *          All findings are heuristic — never claim certainty.
 */

import { TimelineFlag } from "./types";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const DORMANCY_THRESHOLD_DAYS = 180;
const BURST_THRESHOLD_PERCENT = 0.4; // 40% of commits in one 7-day window

// ---------------------------------------------------------------------------
// Detector: SUSPICIOUS_BURST
// ---------------------------------------------------------------------------

/**
 * Detects when more than 40% of a repo's commits occur within a single
 * 7-day window — a pattern consistent with bulk code uploads.
 */
function detectSuspiciousBurst(
  repoName: string,
  commitDates: Date[]
): TimelineFlag | null {
  if (commitDates.length < 5) {
    // Too few commits to be meaningful
    return null;
  }

  const sorted = [...commitDates].sort((a, b) => a.getTime() - b.getTime());
  const total = sorted.length;

  for (let i = 0; i < sorted.length; i++) {
    const windowStart = sorted[i].getTime();
    const windowEnd = windowStart + SEVEN_DAYS_MS;
    const inWindow = sorted.filter(
      (d) => d.getTime() >= windowStart && d.getTime() <= windowEnd
    ).length;

    if (inWindow / total > BURST_THRESHOLD_PERCENT) {
      return {
        type: "SUSPICIOUS_BURST",
        severity: "medium",
        repoName,
        detail: `${inWindow} of ${total} commits (${Math.round((inWindow / total) * 100)}%) occurred within a single 7-day window starting ${sorted[i].toISOString().split("T")[0]}.`,
      };
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Detector: DORMANCY_BREAK
// ---------------------------------------------------------------------------

/**
 * Detects repositories with a gap of >180 days followed by a commit spike.
 * This can indicate a previously abandoned project being suddenly revived
 * with bulk activity.
 */
function detectDormancyBreak(
  repoName: string,
  commitDates: Date[]
): TimelineFlag | null {
  if (commitDates.length < 3) {
    return null;
  }

  const sorted = [...commitDates].sort((a, b) => a.getTime() - b.getTime());
  const dormancyThresholdMs = DORMANCY_THRESHOLD_DAYS * 24 * 60 * 60 * 1000;

  for (let i = 1; i < sorted.length; i++) {
    const gap = sorted[i].getTime() - sorted[i - 1].getTime();

    if (gap > dormancyThresholdMs) {
      // Found a gap > 180 days — check for a spike after the break
      const afterBreak = sorted.slice(i);
      if (afterBreak.length < 2) continue;

      const spikeWindow = SEVEN_DAYS_MS * 2; // 14-day window after break
      const breakPoint = sorted[i].getTime();
      const inSpike = afterBreak.filter(
        (d) => d.getTime() <= breakPoint + spikeWindow
      ).length;

      const spikeRatio = inSpike / afterBreak.length;
      if (spikeRatio > 0.5) {
        const gapDays = Math.round(gap / (24 * 60 * 60 * 1000));
        return {
          type: "DORMANCY_BREAK",
          severity: "medium",
          repoName,
          detail: `${gapDays}-day dormancy period detected. Activity resumed with a burst of ${inSpike} commits within 14 days.`,
        };
      }
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Detector: BACKDATED_PATTERN (heuristic)
// ---------------------------------------------------------------------------

/**
 * Heuristic: compares commit author dates vs commit committer dates.
 * A large systematic delta (author date much earlier than committer date)
 * across many commits may indicate that commits were force-pushed or
 * amended to appear older.
 *
 * This is LOW confidence — do not assert certainty.
 *
 * @param repoName     - Repository name for flag label
 * @param authorDates  - Array of commit author dates
 * @param committerDates - Array of commit committer dates (same order)
 */
function detectBackdatedPattern(
  repoName: string,
  authorDates: Date[],
  committerDates: Date[]
): TimelineFlag | null {
  if (authorDates.length < 5 || committerDates.length !== authorDates.length) {
    return null;
  }

  const SUSPICIOUS_DELTA_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
  let suspiciousCount = 0;

  for (let i = 0; i < authorDates.length; i++) {
    const delta = committerDates[i].getTime() - authorDates[i].getTime();
    if (delta > SUSPICIOUS_DELTA_MS) {
      suspiciousCount++;
    }
  }

  const suspiciousRatio = suspiciousCount / authorDates.length;
  if (suspiciousRatio > 0.3) {
    return {
      type: "BACKDATED_PATTERN",
      severity: "low",
      repoName,
      detail: `Heuristic only: ${Math.round(suspiciousRatio * 100)}% of commits have author dates more than 30 days before their committer dates. May indicate amended or force-pushed history.`,
    };
  }

  return null;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface CommitDatePair {
  authorDate: Date;
  committerDate: Date;
}

/**
 * Analyzes commit timeline data for a repository and returns any detected
 * anomaly flags.
 *
 * @param repoName    - Repository name (used for flag labeling)
 * @param commitPairs - Array of { authorDate, committerDate } per commit
 * @returns Array of TimelineFlag (may be empty if nothing suspicious found)
 */
export function analyzeTimeline(
  repoName: string,
  commitPairs: CommitDatePair[]
): TimelineFlag[] {
  if (commitPairs.length === 0) {
    return [];
  }

  const authorDates = commitPairs.map((p) => p.authorDate);
  const committerDates = commitPairs.map((p) => p.committerDate);
  const flags: TimelineFlag[] = [];

  const burst = detectSuspiciousBurst(repoName, authorDates);
  if (burst) flags.push(burst);

  const dormancy = detectDormancyBreak(repoName, authorDates);
  if (dormancy) flags.push(dormancy);

  const backdated = detectBackdatedPattern(repoName, authorDates, committerDates);
  if (backdated) flags.push(backdated);

  return flags;
}
