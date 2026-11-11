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
  mongodb: "MongoDB",
  "@supabase/supabase-js": "Supabase",
  supabase: "Supabase",
  firebase: "Firebase",
  "firebase-admin": "Firebase",
  pg: "PostgreSQL",
  postgres: "PostgreSQL",
  mysql: "MySQL",
  mysql2: "MySQL",
  sqlite3: "SQLite",
  jest: "Jest",
  vitest: "Vitest",
  webpack: "Webpack",
  vite: "Vite",
  astro: "Astro",
  trpc: "tRPC",
  "@trpc/server": "tRPC",
  zod: "Zod",
  ethers: "Blockchain",
  web3: "Blockchain",
  solc: "Blockchain",
  "@openzeppelin/contracts": "Blockchain",
  hardhat: "Blockchain",
  truffle: "Blockchain",
  "framer-motion": "Framer Motion",
  axios: "Axios",
};

/** Python requirement name → human-readable technology label */
const PYTHON_PACKAGE_MAP: Record<string, string> = {
  flask: "Flask",
  "flask-cors": "Flask",
  django: "Django",
  fastapi: "FastAPI",
  torch: "PyTorch",
  torchvision: "PyTorch",
  tensorflow: "TensorFlow",
  keras: "Keras",
  timm: "Deep Learning",
  numpy: "NumPy",
  pandas: "Pandas",
  scipy: "SciPy",
  "scikit-learn": "Scikit-Learn",
  sklearn: "Scikit-Learn",
  opencv: "OpenCV",
  "opencv-python": "OpenCV",
  pillow: "Pillow / Image Processing",
  gunicorn: "Gunicorn",
  celery: "Celery",
  pytest: "Pytest",
  sqlalchemy: "SQLAlchemy",
  pydantic: "Pydantic",
  pymongo: "MongoDB",
  supabase: "Supabase",
  firebase_admin: "Firebase",
  transformers: "Hugging Face / Transformers",
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
  "build.gradle": "Java / Gradle",
  "build.gradle.kts": "Kotlin / Gradle",
  "Cargo.toml": "Rust",
  "go.mod": "Go",
  "pubspec.yaml": "Flutter",
  "flutter.yaml": "Flutter",
  "hardhat.config.js": "Blockchain",
  "hardhat.config.ts": "Blockchain",
  "truffle-config.js": "Blockchain",
  "truffle-config.ts": "Blockchain",
  "foundry.toml": "Blockchain",
  "anchor.toml": "Blockchain",
  "brownie-config.yaml": "Blockchain",
  "Makefile": "Makefile",
  "CMakeLists.txt": "C / C++",
};

interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

function parsePackageJsonContent(content: string, techs: Set<string>) {
  try {
    const pkg = JSON.parse(content) as PackageJson;
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

function parseRequirementsContent(content: string, techs: Set<string>) {
  try {
    const lines = content.split(/\r?\n/);
    for (const line of lines) {
      const cleanLine = line.trim().split("#")[0].trim();
      if (!cleanLine) continue;
      const match = cleanLine.match(/^([a-zA-Z0-9_\-]+)/);
      if (match) {
        const pkgName = match[1].toLowerCase();
        if (PYTHON_PACKAGE_MAP[pkgName]) {
          techs.add(PYTHON_PACKAGE_MAP[pkgName]);
        }
      }
    }
  } catch {
    // Ignore parse errors
  }
}

export async function detectTechnologies(
  username: string,
  repoName: string,
  octokit: Octokit,
  primaryLanguage?: string
): Promise<string[]> {
  const techs = new Set<string>();

  if (primaryLanguage) {
    const langLower = primaryLanguage.toLowerCase();
    if (langLower === "solidity") {
      techs.add("Solidity");
      techs.add("Blockchain");
    } else if (langLower === "python") {
      techs.add("Python");
    } else if (langLower === "c") {
      techs.add("C");
    } else if (langLower === "c++" || langLower === "cpp") {
      techs.add("C++");
    } else if (langLower === "kotlin") {
      techs.add("Kotlin");
    } else if (langLower !== "unknown" && langLower !== "undefined") {
      techs.add(primaryLanguage);
    }
  }

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
      const subdirs = rootItems.filter((item) => item.type === "dir").map((item) => item.name);

      // Scan root files for extensions
      for (const fileName of rootFiles) {
        if (fileName.endsWith(".sol")) {
          techs.add("Solidity");
          techs.add("Blockchain");
        } else if (fileName.endsWith(".py")) {
          techs.add("Python");
        } else if (fileName.endsWith(".c") || fileName.endsWith(".h")) {
          techs.add("C");
        } else if (fileName.endsWith(".cpp") || fileName.endsWith(".hpp")) {
          techs.add("C++");
        } else if (fileName.endsWith(".kt")) {
          techs.add("Kotlin");
        }
      }

      // 1. Check for config files from the mapping table
      for (const [fileName, techName] of Object.entries(FILE_TECH_MAP)) {
        if (rootFiles.has(fileName)) {
          techs.add(techName);
        }
      }

      // 2. Parse requirements.txt if present
      if (rootFiles.has("requirements.txt")) {
        try {
          const reqRes = await octokit.rest.repos.getContent({
            owner: username,
            repo: repoName,
            path: "requirements.txt",
          });
          const fileData = reqRes.data;
          if (!Array.isArray(fileData) && fileData.type === "file") {
            const decoded = Buffer.from(fileData.content, "base64").toString("utf-8");
            parseRequirementsContent(decoded, techs);
          }
        } catch {
          // ignore
        }
      }

      // 3. Parse root package.json if it exists
      if (rootFiles.has("package.json")) {
        try {
          const pkgResponse = await octokit.rest.repos.getContent({
            owner: username,
            repo: repoName,
            path: "package.json",
          });
          const fileData = pkgResponse.data;
          if (!Array.isArray(fileData) && fileData.type === "file") {
            const decoded = Buffer.from(fileData.content, "base64").toString("utf-8");
            parsePackageJsonContent(decoded, techs);
          }
        } catch {
          // ignore
        }
      }

      // 4. Check subdirectories (frontend, client, web, backend, api) for package.json or requirements.txt
      const targetSubdirs = ["frontend", "client", "web", "backend", "api", "server"];
      for (const dir of subdirs) {
        if (targetSubdirs.includes(dir.toLowerCase())) {
          try {
            const subPkg = await octokit.rest.repos.getContent({
              owner: username,
              repo: repoName,
              path: `${dir}/package.json`,
            });
            const subData = subPkg.data;
            if (!Array.isArray(subData) && subData.type === "file") {
              const decoded = Buffer.from(subData.content, "base64").toString("utf-8");
              parsePackageJsonContent(decoded, techs);
            }
          } catch {
            // sub package.json not found, try requirements.txt
            try {
              const subReq = await octokit.rest.repos.getContent({
                owner: username,
                repo: repoName,
                path: `${dir}/requirements.txt`,
              });
              const subReqData = subReq.data;
              if (!Array.isArray(subReqData) && subReqData.type === "file") {
                const decoded = Buffer.from(subReqData.content, "base64").toString("utf-8");
                parseRequirementsContent(decoded, techs);
              }
            } catch {
              // ignore
            }
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

