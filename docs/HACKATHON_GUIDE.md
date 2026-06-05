# VeriSphere Hackathon Playbook

This document defines the hackathon strategy, team alignment slices, integration schedules, feature scopes, and demo preparation.

---

## 🏆 The Winning Pitch

Don't sell VeriSphere as an "AI Resume Analyzer." Judges see dozens of those.
Sell it as:
> **"We don't score résumés. We verify evidence."**
> *(GitHub and certificate-backed candidate verification)*

---

## 📊 Feature Priority Matrix

### Must Have (Focus 80% effort)
- [x] **Resume PDF Extraction**: Extract candidate skills and project claims.
- [x] **GitHub Evidence Analysis**: Match claims against package tags and code files.
- [x] **Trust Score Engine**: Weight score metrics objectively.
- [x] **Interview Question Engine**: Generate targeted questions for risk areas.
- [x] **Dashboard Portal**: Upload screens and visual report outputs.

### Nice to Have (Only build if ahead of schedule)
- [ ] **Certificate Metadata**: Parse PDF modification history.
- [ ] **Risk Flags**: Visual anomaly items.
- [ ] **Contribution Timeline**: Commit pacing graphs.

### Don't Build (Strictly Out of Scope)
- ❌ Blockchain or token integrations.
- ❌ OCR engines (rely on digitally generated PDFs).
- ❌ LinkedIn or social web scrapers.
- ❌ Database servers, authentication sessions, or Docker containers.

---

## 👥 Detailed Parallel Work Breakdown

To ensure everyone can code in parallel without waiting on other teammates, work is divided into four self-contained, end-to-end vertical slices.

### 👤 Person 1: Core Verification Engine (The Logic Core)
* **Goal**: Build the core reasoning engine that takes parsed resume texts + github details and audits claims.
* **Workspace Boundaries**: 
  - `packages/ai-layer/`
  - `apps/api/src/application/verification-orchestrator.ts`
* **Direct Inputs**: Raw text strings, Git commit timeline data lists.
* **Direct Outputs**: Structured verification JSON matching the `AuditReport` interface.
* **Step-by-Step Developer Launch Tasks**:
  1. Initialize connection with Google Gen AI SDK inside `packages/ai-layer/src/providers/gemini.ts`.
  2. Implement local fallback JSON payloads in case the Gemini model reaches rate boundaries.
  3. Formulate prompt templates under `packages/ai-layer/src/prompts/verification.ts` linking text parameters.
  4. Test extraction performance on sample resume text blocks directly from command line.
  5. Implement weighted calculations for the 0-100 overall trust score breakdown.

---

### 👤 Person 2: GitHub Evidence Scraper
* **Goal**: Build the evidence collection pipeline from the GitHub API.
* **Workspace Boundaries**: 
  - `packages/github-engine/`
* **Direct Inputs**: Candidate's GitHub Profile URL.
* **Direct Outputs**: Detailed JSON containing list of files, languages, total commits, push schedules, and ownership scores.
* **Step-by-Step Developer Launch Tasks**:
  1. Authenticate with Octokit client using personal access tokens.
  2. Fetch list of repositories. For each repo, run file requests retrieving contents of `package.json` to verify technology strings.
  3. Compute contributor distributions: count commits authored by candidate vs total commits.
  4. Build timeline flags that scan if commits were backdated artificially (e.g. dozens of commits matching historical dates pushed in a single block).
  5. Test outputs independently using node command runners.

---

### 👤 Person 3: Presentation, Visuals & UI
* **Goal**: Build the portal interface.
* **Workspace Boundaries**:
  - `apps/web/`
* **Direct Inputs**: Mocked static report JSON structure.
* **Direct Outputs**: Landing page, file upload forms, audit results view.
* **Step-by-Step Developer Launch Tasks**:
  1. Style the main marketing layout matching premium design principles (Inter/Outfit fonts, vibrant gradients, glassmorphism overlays).
  2. Build custom component wrappers: `UploadZone`, `TrustScoreCard`, `RiskIndicator`.
  3. Populate Zustand store hooks mapping filter scopes.
  4. Use fake candidate mock JSON data to verify dashboard renders before integrating backend APIs.

---

### 👤 Person 4: Certificate Forensics & Demo Preparation
* **Goal**: Document extraction and pitch rehearsals.
* **Workspace Boundaries**:
  - `packages/forensics-engine/`
  - Compile demo candidate portfolios.
* **Direct Inputs**: Certification PDF.
* **Direct Outputs**: PDF creator fields, creation/modification times, tamper scores.
* **Step-by-Step Developer Launch Tasks**:
  1. Extract PDF info fields using `pdf-parse` or node file checkers.
  2. Compare `CreationDate` vs `ModificationDate` tags. If they differ by more than 5 minutes and include editors like Canva, flag as suspicious.
  3. **Prepare the Demo Files**:
     - *David (Fraud)*: modified Canva certificates, cloned repo, artificial git history.
     - *Sarah (Genuine)*: unmodified certificates, original repositories, long-term consistent commits.
  4. Assemble the presentation pitch slides and script step-by-step.

---

## ⚡ Parallel Development Risks & Mitigations

When 4 developers push code rapidly to a monorepo, standard blocks occur. Here is how to prevent them:

### 🚩 Pitfall 1: Teammates block each other due to changing database/API schemas
- **Risk**: Person 3 cannot code frontend because Person 1 changed the result JSON structure, breaking all component fields.
- **Solution (Contract Freeze)**: Freeze `packages/shared-types/src/index.ts` during **Hour 4**. Once frozen, nobody can add or rename parameters in database models or API payloads without consensus. Teammates mock their outputs to conform strictly to this file.

### 🚩 Pitfall 2: Local Git Merge Conflicts in Package dependencies
- **Risk**: Teammates modify the root `package.json` at the same time to add libraries, resulting in block conflicts.
- **Solution (Isolation of Packages)**: Each developer must operate within their assigned folders. Only run npm commands restricted to your module (e.g. `pnpm --filter web add lucide-react`). Do not touch other team members' configuration trees.

### 🚩 Pitfall 3: Throttled by API Rate Limits on Gemini or GitHub during tests
- **Risk**: Running local server checks exhausts Gemini or GitHub API limits, halting progress.
- **Solution (Mock Switch Flags)**: Add environment switches (e.g. `MOCK_AI=true` and `MOCK_GITHUB=true`) in backend code. If enabled, bypass REST calls entirely and read sample responses from a local JSON mock folder instantly.

### 🚩 Pitfall 4: "Works on my machine" during final integration
- **Risk**: During Hour 16 integration, the database credentials or relative folders fail to resolve on some machines.
- **Solution (Standardized Environments)**: Standardize on a local database schema wrapper or use a shared hosted PostgreSQL test database (e.g., Neon free tier) from Hour 0. Everyone uses the exact same database string to keep datasets synchronized.

---

## ⏱️ Timeline Schedule

- **Hour 0–3 (Sandboxing)**: Build individual libraries using mock constants.
- **Hour 4 (Freeze)**: Establish final JSON format.
- **Hour 8–16 (Feature Coding)**: Run isolated loops inside packages.
- **Hour 16–20 (Integration)**: Merge code branches. Resolve configuration conflicts.
- **Hour 20–24 (Polish)**: Prepare walkthrough script and pitch slides.
