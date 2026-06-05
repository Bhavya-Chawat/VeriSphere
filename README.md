# VeriSphere | AI Candidate Verification Platform

VeriSphere is a production-grade monorepo scaffold designed to automate candidate profile checks, detecting resume exaggeration, fake certificates, and stolen or plagiarized GitHub portfolios using Google Gemini 1.5 Flash.

---

## 📂 Repository Roadmap

```
verisphere/
├── apps/
│   ├── api/                 # Node.js + Express Clean Architecture Server
│   └── web/                 # Next.js 15 App Router Dashboard Portal
├── packages/
│   ├── shared-types/        # Consolidated domain model & API DTO type boundaries
│   ├── shared-config/       # Prisma schemas & database config parameters
│   ├── forensics-engine/    # PDF parsing & modifications checker
│   ├── github-engine/       # Git history timelines and ownership verifier
│   └── ai-layer/            # Gemini connection config & prompt templates
├── docs/
│   ├── ARCHITECTURE.md      # Data pipeline orchestration & layers map
│   ├── API_DOCS.md          # REST API payloads schemas
│   └── AI_PIPELINE.md       # Prompts configuration & Structured Output schemas
├── infrastructure/
│   └── docker/              # Dockerfiles & compose files
└── .github/
    └── workflows/           # CI-CD continuous integration settings
```

---

## 🛠️ Setup Instructions

### Prerequisites
- Node.js >= 18.0.0
- pnpm >= 8.0.0 (or npm)
- Docker Desktop

### 1. Configure Local Environment
Create `.env` inside `apps/api/` and fill:
```env
PORT=4000
DATABASE_URL="postgresql://postgres:local_secret_password@localhost:5432/verisphere?schema=public"
GEMINI_API_KEY="your-gemini-generative-ai-token"
CLERK_SECRET_KEY="your-clerk-jwt-token"
```

### 2. Run Local Development Server
Boot components simultaneously using the pnpm run scripts:
```bash
# Install all workspace dependencies
pnpm install

# Run database migration checks
pnpm prisma:generate

# Boot API and Web Frontends
pnpm dev
```
- Web Portal running at: http://localhost:3000
- API Server running at: http://localhost:4000

---

## 🚀 Future Implementation Notes
- **Antivirus Scans**: Incorporate ClamAV checking middleware for uploaded PDFs before running parsing blocks.
- **Queue Backing**: Replace in-memory async promise calls in `VerificationOrchestrator` with BullMQ redis-backed workers to prevent memory crashes on heavy parallel operations.
