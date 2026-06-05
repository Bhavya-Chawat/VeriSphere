/**
 * @file techDetector.ts
 * @package @verisphere/github-engine
 * @purpose Evidence-based technology detection per repository.
 *          Uses actual repo file contents (package.json + config files).
 *          Never uses repository descriptions.
 */

import { Octokit } from "@octokit/rest";

// ---------------------------------------------------------------------------
// Mapping tables (from spec)
// ---------------------------------------------------------------------------

/** npm package name → human-readable technology label */
const PACKAGE_NAME_MAP: Record<string, string> = {
  react: "React",
  "react-dom": "React",
  next: "Next.js",
  express: "Express.js",
  fastify: "Fastify",
  mongoose: "MongoDB",
  prisma: "Prisma",
  "@prisma/client": "Prisma",
  tailwindcss: "Tailwind CSS",
  vue: "Vue.js",
  "@vue/core": "Vue.js",
  nuxt: "Nuxt.js",
  svelte: "Svelte",
  angular: "Angular",
  "@angular/core": "Angular",
  nestjs: "NestJS",
  "@nestjs/core": "NestJS",
  graphql: "GraphQL",
  "apollo-server": "GraphQL",
  socket: "Socket.io",
  "socket.io": "Socket.io",
  redis: "Redis",
  ioredis: "Redis",
  knex: "SQL",
  sequelize: "SQL",
  typeorm: "TypeORM",
  drizzle: "Drizzle ORM",
  jest: "Jest",
  vitest: "Vitest",
  webpack: "Webpack",
  vite: "Vite",
  astro: "Astro",
  trpc: "tRPC",
  "@trpc/server": "tRPC",
  zod: "Zod",
};

/** Config file name → technology label */
const FILE_TECH_MAP: Record<string, string> = {
  Dockerfile: "Docker",
  "docker-compose.yml": "Docker",
  "docker-compose.yaml": "Docker",
  "next.config.js": "Next.js",
  "next.config.mjs": "Next.js",
  "next.config.ts": "Next.js",
  "angular.json": "Angular",
  "vite.config.js": "Vite",
  "vite.config.ts": "Vite",
  "requirements.txt": "Python",
  "pyproject.toml": "Python",
  "pom.xml": "Java / Spring",
  "Cargo.toml": "Rust",
  "go.mod": "Go",
  "pubspec.yaml": "Flutter",
  "flutter.yaml": "Flutter",
};

interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

export async function detectTechnologies(
  username: string,
  repoName: string,
  octokit: Octokit
): Promise<string[]> {
  const techs = new Set<string>();

  try {
    // Fetch root directory contents in a single call to check for files
    const response = await octokit.rest.repos.getContent({
      owner: username,
      repo: repoName,
      path: "",
    });

    const rootItems = response.data;
    if (Array.isArray(rootItems)) {
      const rootFiles = new Set(rootItems.map((item) => item.name));

      // 1. Check for config files from the mapping table
      for (const [fileName, techName] of Object.entries(FILE_TECH_MAP)) {
        if (rootFiles.has(fileName)) {
          techs.add(techName);
        }
      }

      // 2. Check for package.json and parse it if it exists
      if (rootFiles.has("package.json")) {
        const pkgResponse = await octokit.rest.repos.getContent({
          owner: username,
          repo: repoName,
          path: "package.json",
        });

        const fileData = pkgResponse.data;
        if (!Array.isArray(fileData) && fileData.type === "file") {
          const decoded = Buffer.from(fileData.content, "base64").toString("utf-8");
          try {
            const pkg = JSON.parse(decoded) as PackageJson;
            const allDeps = {
              ...pkg.dependencies,
              ...pkg.devDependencies,
              ...pkg.peerDependencies,
            };

            for (const pkgName of Object.keys(allDeps)) {
              if (PACKAGE_NAME_MAP[pkgName]) {
                techs.add(PACKAGE_NAME_MAP[pkgName]);
                continue;
              }
              const prefix = pkgName.split("/")[0];
              if (PACKAGE_NAME_MAP[prefix]) {
                techs.add(PACKAGE_NAME_MAP[prefix]);
              }
            }
          } catch {
            // Ignore JSON parse errors
          }
        }
      }
    }
  } catch (error) {
    console.warn(
      `[techDetector] Could not detect technologies for ${username}/${repoName}:`,
      (error as Error).message
    );
  }

  return Array.from(techs).sort();
}

