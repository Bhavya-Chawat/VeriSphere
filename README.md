# 🛡️ VeriSphere | Forensic AI Candidate Verification Platform

VeriSphere is a cutting-edge, production-grade monorepo platform designed to bring forensic intelligence to the hiring process. By cross-referencing candidate resumes, analyzing deep GitHub repository metadata, and validating certificate authenticity, VeriSphere automates background checks to detect resume exaggeration, falsified credentials, and plagiarized portfolios in under 90 seconds.

Powered by **Groq's high-speed AI models**, VeriSphere generates a unified **Trust Score** and a comprehensive verification report for recruiters and technical hiring managers.

---

## ✨ Core Features

- **📄 AI Resume Forensics**: Extracts claims from uploaded resumes and cross-references them against real-world data points. Identifies timeline gaps, exaggerated tenures, and unverified skills.
- **🐙 Deep GitHub Analysis**: Goes beyond simple commit counts. Analyzes repository ownership patterns, languages used, activity consistency, and flags signs of plagiarized or cloned "portfolio" projects.
- **🎓 Certificate Verification**: Scans uploaded certificates for metadata tampering and validates authenticity.
- **🧠 Intelligent Trust Scoring**: Aggregates all forensic data into a proprietary **Trust Score (0-100)**, clearly categorizing candidates into confidence tiers.
- **📊 Comprehensive PDF Reports**: Generates professional, downloadable PDF audit reports using Puppeteer, summarizing the AI's findings.

---

## 🏗️ Technology Stack

- **Frontend (Web Portal)**: Next.js 15 (App Router), React, Tailwind CSS, Framer Motion for micro-animations, Lucide React icons.
- **Backend (API Server)**: Node.js, Express, Puppeteer (PDF Generation), Clean Architecture patterns.
- **AI & Reasoning**: Groq AI Platform, specialized prompt engineering, and structured JSON output.
- **Database & ORM**: PostgreSQL (Supabase), Prisma ORM.
- **Monorepo Management**: pnpm Workspaces, TypeScript across all boundaries.

---

## 📂 Repository Roadmap (Monorepo Structure)

```text
verisphere/
├── apps/
│   ├── api/                 # Node.js + Express Clean Architecture Server
│   └── web/                 # Next.js 15 App Router Dashboard Portal
├── packages/
│   ├── shared-types/        # Consolidated domain models & API DTO type boundaries
│   ├── shared-config/       # Prisma schemas & database config parameters
│   ├── forensics-engine/    # PDF parsing & modifications checker
│   ├── github-engine/       # Git history timelines and ownership verifier
│   └── ai-layer/            # AI connection config (Groq) & prompt templates
├── docs/
│   ├── ARCHITECTURE.md      # Data pipeline orchestration & layers map
│   ├── API_DOCS.md          # REST API payloads schemas
│   └── AI_PIPELINE.md       # Prompts configuration & Structured Output schemas
└── .github/
    └── workflows/           # CI-CD continuous integration settings
```

---

## 🛠️ Setup Instructions

### Prerequisites
- Node.js >= 18.0.0
- pnpm >= 8.0.0
- A Supabase PostgreSQL Database
- A Groq API Key
- A GitHub Personal Access Token (for fetching repo data without strict rate limits)

### 1. Configure Local Environment
Create a `.env` file in the root of the project and fill it with your credentials:

```env
PORT=4000
GROQ_API_KEY="your-groq-api-key"
GITHUB_TOKEN="your-github-personal-access-token"
DATABASE_URL="your-supabase-connection-pooler-url"
DIRECT_URL="your-supabase-direct-url"
```

*(Note: You can also use `MOCK_AI=true` to test the UI without hitting the Groq API).*

### 2. Run Local Development Server
Boot up all components simultaneously using the pnpm workspace scripts:

```bash
# Install all workspace dependencies
pnpm install

# Run database migrations to sync your Prisma schema
pnpm --filter @verisphere/shared-config prisma:generate
pnpm --filter @verisphere/shared-config prisma db push

# Build necessary packages (e.g., AI layer)
pnpm --filter @verisphere/ai-layer build

# Boot API and Web Frontends concurrently
pnpm dev
```

- **Web Portal** running at: `http://localhost:3000`
- **API Server** running at: `http://localhost:4000`

---

## 🚀 Future Implementation Notes

- **Antivirus Scans**: Incorporate ClamAV checking middleware for uploaded PDFs before running parsing blocks to prevent malware injection.
- **Queue Backing**: Replace in-memory async promise calls in the `VerificationOrchestrator` with Redis-backed BullMQ workers. This will prevent memory crashes on heavy parallel operations and provide better retry mechanisms.
- **Automated Reference Checks**: Integrate automated email outreach to verify specific job titles with past employers.
