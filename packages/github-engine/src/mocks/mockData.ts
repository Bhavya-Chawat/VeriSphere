/**
 * @file mocks/mockData.ts
 * @package @verisphere/github-engine
 * @purpose Deterministic mock GithubEvidenceReport for development and
 *          integration testing. Used when MOCK_GITHUB=true.
 *
 * Profile: "Sarah Chen" — a genuine developer profile matching the
 * demo candidate defined in the hackathon playbook.
 */

import { GithubEvidenceReport } from "../types";

export const MOCK_GITHUB_EVIDENCE_REPORT: GithubEvidenceReport = {
  username: "sarah-chen-dev",

  repositories: [
    {
      name: "ecommerce-platform",
      description: "Full-stack e-commerce app with Next.js and Prisma",
      language: "TypeScript",
      stars: 34,
      forks: 8,
      createdAt: "2022-03-10T08:00:00Z",
      updatedAt: "2024-11-20T15:30:00Z",
      pushedAt: "2024-11-20T15:30:00Z",
      isFork: false,
    },
    {
      name: "ml-pipeline-toolkit",
      description: "Reusable data pipeline utilities for ML workflows",
      language: "Python",
      stars: 17,
      forks: 3,
      createdAt: "2021-07-22T09:00:00Z",
      updatedAt: "2024-08-05T11:00:00Z",
      pushedAt: "2024-08-05T11:00:00Z",
      isFork: false,
    },
    {
      name: "realtime-chat-api",
      description: "WebSocket-based real-time messaging API",
      language: "TypeScript",
      stars: 9,
      forks: 2,
      createdAt: "2023-01-15T07:00:00Z",
      updatedAt: "2024-06-12T10:00:00Z",
      pushedAt: "2024-06-12T10:00:00Z",
      isFork: false,
    },
    {
      name: "devops-playbook",
      description: "Terraform and Docker configs for personal infrastructure",
      language: "HCL",
      stars: 5,
      forks: 1,
      createdAt: "2022-09-01T08:00:00Z",
      updatedAt: "2024-04-30T08:00:00Z",
      pushedAt: "2024-04-30T08:00:00Z",
      isFork: false,
    },
  ],

  verifiedSkills: [
    "Docker",
    "Express.js",
    "Next.js",
    "Prisma",
    "Python",
    "React",
    "Socket.io",
    "Tailwind CSS",
    "TypeScript",
  ],

  verifiedLanguages: ["TypeScript", "Python", "JavaScript"],

  languageDistribution: {
    TypeScript: 58,
    Python: 27,
    JavaScript: 12,
  },

  ownershipScore: 91,

  activityScore: 84,

  timelineFlags: [],

  repoEvidence: [
    {
      repoName: "ecommerce-platform",
      technologies: ["Next.js", "Prisma", "React", "Tailwind CSS"],
      ownershipPercent: 94,
      totalCommits: 187,
      primaryLanguage: "TypeScript",
      flags: [],
      recentCommits: ["feat: add user authentication", "fix: resolve cart calculation bug"],
    },
    {
      repoName: "ml-pipeline-toolkit",
      technologies: ["Python"],
      ownershipPercent: 100,
      totalCommits: 63,
      primaryLanguage: "Python",
      flags: [],
      recentCommits: ["feat: update pandas dependency"],
    },
    {
      repoName: "realtime-chat-api",
      technologies: ["Express.js", "Socket.io"],
      ownershipPercent: 88,
      totalCommits: 54,
      primaryLanguage: "TypeScript",
      flags: [],
      recentCommits: ["fix: socket disconnect issue"],
    },
    {
      repoName: "devops-playbook",
      technologies: ["Docker"],
      ownershipPercent: 100,
      totalCommits: 29,
      primaryLanguage: "HCL",
      flags: [],
      recentCommits: ["chore: update terraform providers"],
    },
  ],
};
