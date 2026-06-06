# 🛡️ VeriSphere — Forensic AI Candidate Verification Platform

> **"We don't score résumés. We verify evidence."**

VeriSphere is a production-grade monorepo platform that brings forensic intelligence to the hiring process. It cross-references candidate resumes against live GitHub repository data, validates certificate authenticity through PDF forensics, verifies academic claims, and uses AI to detect resume exaggeration, falsified credentials, and plagiarized portfolios — all in under 90 seconds.

The platform generates a unified **Trust Score (0–100)** and a comprehensive, downloadable PDF audit report for recruiters and technical hiring managers.

---

## ✨ Core Features

- **📄 AI Resume Forensics** — Extracts text from uploaded PDF resumes and cross-references claims against real-world evidence. Identifies timeline gaps, exaggerated tenures, and unverifiable skills.
- **🐙 Deep GitHub Analysis** — Goes beyond commit counts. Analyzes repository ownership patterns, language distributions, commit timeline anomalies, contributor ratios, technology detection from actual file contents, and flags signs of cloned or backdated repositories.
- **🎓 Academic Verification** — Validates institution names against a known university database, checks domain email matches, verifies graduation timelines, and flags unrecognized institutions.
- **📜 Certificate Forensics** — Extracts PDF metadata (producer, creator, creation/modification dates), computes SHA-256 hashes, detects tampering signals from editor fingerprints (e.g., Canva, Photoshop), and scores document integrity.
- **🧠 Intelligent Trust Scoring** — Aggregates all forensic data into a weighted **Trust Score** across six dimensions: resume consistency, GitHub evidence, academic score, certificate validity, contribution confidence, and activity confidence.
- **📊 Professional PDF Reports** — Generates downloadable PDF audit reports via Puppeteer + Handlebars templating, with AI-generated executive summaries, skill verification dashboards, and highlighted risk indicators.
- **🔍 Interview Question Generation** — AI generates targeted technical questions based on detected gaps and anomalies in the candidate's profile.

---

## 🏗️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js 15 (App Router), React 19, Tailwind CSS, Framer Motion, Recharts, Lucide React, Zustand, TanStack React Query, Sonner (toasts) |
| **Backend** | Node.js, Express 4, Multer (in-memory file uploads), Puppeteer (PDF generation), Handlebars (report templates), Helmet, Morgan, CORS |
| **AI & Reasoning** | Groq SDK (primary provider), Google Generative AI / Gemini (secondary provider), Zod (schema validation), structured JSON output with retry logic |
| **Database** | PostgreSQL (Supabase), Prisma ORM |
| **Monorepo** | pnpm Workspaces, TypeScript 5 (strict mode) across all packages |

---

## 📂 Monorepo Structure

```
verisphere/
├── apps/
│   ├── api/                        # Express backend server (Clean Architecture)
│   │   ├── src/
│   │   │   ├── application/        # Use cases, orchestrator, services
│   │   │   │   ├── use-cases/      # UploadCandidateUseCase
│   │   │   │   ├── services/       # PdfGeneratorService (Puppeteer + Handlebars)
│   │   │   │   └── verification-orchestrator.ts  # 7-step pipeline coordinator
│   │   │   ├── domain/             # Entities, validators, error classes (zero deps)
│   │   │   ├── infrastructure/     # Express routes, Prisma client, auth middleware
│   │   │   ├── modules/            # Feature modules (forensics controller/service/routes)
│   │   │   └── templates/          # Handlebars report template (report.hbs)
│   │   └── prisma/                 # Prisma schema reference
│   ├── web/                        # Next.js 15 dashboard portal
│   │   └── src/
│   │       ├── app/                # App Router pages (landing, login, dashboard, verify, report)
│   │       ├── components/         # Reusable UI (UploadZone, TrustScoreCard, RiskIndicator, etc.)
│   │       │   └── ui/             # Core UI widgets (Navbar, FileDropZone, TrustGauge, charts)
│   │       ├── hooks/              # Zustand store, animation hooks
│   │       └── lib/                # Demo data, motion variants
│   └── uploads/                    # Runtime file upload directory
├── packages/
│   ├── shared-types/               # TypeScript interfaces, enums, DTOs shared across all packages
│   ├── shared-config/              # Prisma schema & database configuration
│   ├── ai-layer/                   # AI provider abstraction (Groq + Gemini + Mock)
│   │   └── src/
│   │       ├── providers/          # GroqAIProvider, GeminiProvider, MockAIProvider
│   │       ├── prompts/            # System prompt templates for verification
│   │       ├── schemas/            # Zod output schemas for structured AI responses
│   │       └── scoring/            # TrustCalculator (weighted score aggregation)
│   ├── forensics-engine/           # PDF parsing, metadata extraction, tampering detection
│   │   └── src/                    # pdfParser, metadataExtractor, tamperingDetector,
│   │                               # certificateAnalyzer, academicVerification, scoreCalculator
│   └── github-engine/              # GitHub API evidence scraper via Octokit
│       └── src/                    # githubClient, repoFetcher, contributorAnalyzer,
│                                   # timelineAnalyzer, activityScorer, ownershipScorer, techDetector
├── docs/                           # Extended documentation
├── .env.example                    # Environment variable template
├── pnpm-workspace.yaml             # Workspace package definitions
├── tsconfig.json                   # Root TypeScript configuration
├── start-demo.bat                  # Windows demo launcher script
└── package.json                    # Root workspace scripts & dev dependencies
```

---

## 🏛️ Architecture

VeriSphere follows **Clean Architecture** principles with four concentric layers:

```
┌─────────────────────────────────────────────────────────┐
│                   Presentation Layer                    │
│   Next.js 15 App Router — Pages, Components, Zustand   │
└────────────────────────────┬────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────┐
│                  Infrastructure Layer                   │
│   Express Routes, Multer Uploads, Prisma Client,        │
│   Auth Middleware, Puppeteer PDF Generation             │
└────────────────────────────┬────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────┐
│                   Application Layer                     │
│   UploadCandidateUseCase, VerificationOrchestrator,     │
│   PdfGeneratorService                                   │
└────────────────────────────┬────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────┐
│                     Domain Layer                        │
│   Entities, Validation Rules, Custom Error Classes      │
│   (zero external dependencies)                          │
└─────────────────────────────────────────────────────────┘
```

### Package Dependency Graph

```
shared-types ─────────────────┐
    │                         │
shared-config (Prisma)        │
    │                         │
    ├── ai-layer ◄────────────┤
    ├── forensics-engine ◄────┤
    ├── github-engine ◄───────┘
    │
    └── apps/api (consumes all packages)
        apps/web (consumes shared-types)
```

---

## 🔄 Verification Pipeline

When a candidate is submitted, the `VerificationOrchestrator` runs a sequential 7-step pipeline:

```
Step 1: PARSE         → Extract text from uploaded resume PDF (via forensics-engine)
Step 2: GITHUB        → Scrape live GitHub repositories for evidence (via github-engine)
Step 3: AI_ANALYZE    → Send resume text + GitHub metrics to AI for semantic matching
Step 4: ACADEMIC      → Verify institution name, domain email, graduation timeline
Step 5: CERTIFICATES  → Score certificate forensics results from intake analysis
Step 6: TRUST_SCORE   → Calculate weighted trust score from all sub-scores
Step 7: PERSIST       → Save AuditReport and update job status in PostgreSQL
```

The pipeline runs **asynchronously** after returning a `202 Accepted` response to the client. The frontend polls job status until completion.

---

## 🗄️ Database Schema

Three Prisma models backed by Supabase PostgreSQL:

| Model | Purpose | Key Fields |
|---|---|---|
| **Candidate** | Stores candidate profile data | `firstName`, `lastName`, `email`, `githubUrl` |
| **VerificationJob** | Tracks pipeline execution state | `status` (QUEUED → ANALYZING → COMPLETED/FAILED), `githubMetricsJson`, `resumeDataJson` |
| **AuditReport** | Stores AI verification results | `trustScore` (0–100), `findingsSummary`, `semanticMatchJson`, `contradictions[]`, `riskIndicatorsJson` |

**Relations**: `Candidate` → has many `VerificationJob` → has one `AuditReport`

---

## 📡 API Endpoints

**Base URL**: `http://localhost:4000`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check (no auth required) |
| `POST` | `/api/verification/intake` | Submit candidate for verification (multipart/form-data) |
| `GET` | `/api/verification/jobs/:jobId/status` | Poll job status and retrieve full report |
| `GET` | `/api/verification/jobs/:jobId/report/pdf` | Download generated PDF audit report |
| `GET` | `/api/verification/dashboard` | List recent verification jobs with candidates and reports |
| `POST` | `/api/forensics/analyze` | Analyze a certificate PDF for tampering (multipart/form-data) |

### Authentication

All `/api/verification/*` endpoints require one of:
- `Authorization: Bearer <token>` header
- `x-api-key: <key>` header

> **Note**: Authentication is currently placeholder stubs accepting any valid header value. Production implementation should integrate a proper auth provider.

### Intake Request Format

```
POST /api/verification/intake
Content-Type: multipart/form-data

Fields:
  firstName        (string, required)
  lastName         (string, required)
  email            (string, required — validated)
  githubUsername    (string, optional — converted to GitHub URL)
  institutionalEmail (string, optional — used for academic verification)
  resumeFile       (file, required — PDF binary)
  certificateAnalyses (string, optional — JSON array of pre-analyzed certificate results)
```

**Response** (`202 Accepted`):
```json
{
  "success": true,
  "candidateId": "uuid",
  "jobId": "uuid"
}
```

---

## 🛠️ Setup Instructions

### Prerequisites

- Node.js ≥ 18.0.0
- pnpm ≥ 8.0.0
- Supabase PostgreSQL database
- Groq API Key (or set `MOCK_AI=true` for testing without AI)
- GitHub Personal Access Token (for repository scraping without rate limits)

### 1. Clone & Install

```bash
git clone https://github.com/your-username/verisphere.git
cd verisphere
pnpm install
```

### 2. Configure Environment

Create a `.env` file in the project root:

```env
PORT=4000
GROQ_API_KEY="your-groq-api-key"
GITHUB_TOKEN="your-github-personal-access-token"
DATABASE_URL="your-supabase-connection-pooler-url"
DIRECT_URL="your-supabase-direct-url"

# Optional: bypass AI/GitHub APIs with mock data for UI testing
MOCK_AI=false
```

### 3. Setup Database

```bash
# Generate Prisma client
pnpm --filter @verisphere/shared-config prisma:generate

# Push schema to database
pnpm --filter @verisphere/shared-config prisma db push
```

### 4. Build Packages

Packages must be built before starting the dev servers since they are consumed as compiled output:

```bash
# Build shared types (dependency of all other packages)
pnpm --filter @verisphere/shared-types build

# Build AI layer
pnpm --filter @verisphere/ai-layer build

# Build forensics engine
pnpm --filter @verisphere/forensics-engine build

# Build GitHub engine
pnpm --filter @verisphere/github-engine build
```

### 5. Start Development Servers

```bash
# Start both API and Web servers concurrently
pnpm dev
```

- **Web Portal**: [http://localhost:3000](http://localhost:3000)
- **API Server**: [http://localhost:4000](http://localhost:4000)
- **Health Check**: [http://localhost:4000/health](http://localhost:4000/health)

### Quick Demo (Windows)

```bash
# Launches both servers in separate terminal windows
start-demo.bat
```

---

## 🤖 AI Provider System

The `ai-layer` package abstracts AI model access through a dual-provider architecture:

| Provider | SDK | Usage |
|---|---|---|
| **Groq** (`GroqAIProvider`) | `groq-sdk` | Primary provider — used when `GROQ_API_KEY` is set |
| **Gemini** (`GeminiProvider`) | `@google/generative-ai` | Secondary provider — available as alternative |
| **Mock** (`MockAIProvider`) | None | Activated by `MOCK_AI=true` — returns hardcoded responses for UI testing |

The AI performs two functions:
1. **Semantic Audit** — Compares resume claims against GitHub evidence, outputs structured findings with risk indicators and trust scores
2. **Professional Report Generation** — Generates executive summaries, skill verification dashboards, and hiring recommendations for PDF export

Output schemas are enforced via **Zod validation** with up to 3 retry attempts on malformed responses.

---

## 🔒 Security Notes

- **File Uploads**: PDF files are processed via Multer in-memory storage (never written to disk during analysis). Certificate uploads are capped at 10MB.
- **Document Integrity**: SHA-256 hashes are computed for all uploaded documents to prevent forgery.
- **Secrets Management**: Database URLs and API keys are loaded from `.env` files and never committed to version control.
- **Input Validation**: Email and GitHub URL formats are validated at the domain layer before processing.

---

## 🚀 Future Roadmap

- **Production Authentication** — Replace placeholder auth middleware with a production identity provider (Clerk, Auth.js, etc.)
- **Queue Infrastructure** — Replace in-memory async pipeline execution with Redis-backed BullMQ workers for resilience and retry mechanisms
- **Antivirus Scanning** — Integrate ClamAV middleware for uploaded PDFs before processing
- **Automated Reference Checks** — Email outreach to verify job titles with past employers
- **Contribution Timelines** — Visual commit pacing graphs on the dashboard
