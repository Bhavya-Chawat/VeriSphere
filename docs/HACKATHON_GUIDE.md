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

## 👥 Vertical Slice Team Structure

Each team member owns a complete vertical slice from data parsing to output representation.

### 👤 Person 1: Core Verification Engine (Heart of the Product)
- **Role**: Build the cognitive audit engine comparing claims against proof.
- **Start Strategy**:
  1. Set up a quick Express route `POST /api/verify/resume` that takes a local resume PDF file.
  2. Implement text parsing using `pdf-parse`.
  3. Write prompt templates comparing extracted resume text with fake/mock GitHub metadata using Gemini.
  4. Write JSON outputs schema validators for:
     ```json
     {
       "verifiedSkills": [],
       "unsupportedClaims": [],
       "riskFlags": [],
       "interviewQuestions": []
     }
     ```
  5. Code files to create: `resumeAnalyzer.js` and `auditEngine.js`.

### 👤 Person 2: GitHub Intelligence Engine
- **Role**: Build the evidence collection pipeline.
- **Start Strategy**:
  1. Query GitHub APIs for a username's public repositories, languages, and commit activities.
  2. Write code that scans repository file structures (looking for `package.json`, React import tags, JSX file extensions).
  3. Formulate scores for **Project Ownership** (ratio of candidate commits vs total commits) and **Activity Pacing** (to spot burst commit drops).
  4. Code files to create: `githubAnalyzer.js` and `githubEvidence.js`.

### 👤 Person 3: Frontend & Dashboard Presentation
- **Role**: Build the user experience judges see first.
- **Start Strategy**:
  1. Design a clean, responsive layout using Next.js, TailwindCSS, and lucide icons.
  2. Build **Upload Screen** prompting for Resume PDF, Certification PDF, and GitHub profile URL.
  3. Build **Results Dashboard** presenting the 0-100 Trust Score Gauge, Audit Timelines, Risk Badges, and generated Interview Cards.
  4. Work with static mock JSON datasets first to finalize UI look-and-feel.

### 👤 Person 4: Certificate Forensics & Demo Engineering
- **Role**: Forensics metadata extraction and script coordinator.
- **Start Strategy**:
  1. Implement PDF parsing to extract document metadata (CreationDate, ModificationDate, Creator, Producer).
  2. Write rules flagging modifications made by Canva or Adobe Acrobat after original creation.
  3. **Build the Demo Dataset**: Compile three candidate files:
     - **Candidate A (Excellent)**: Natural commits, original repo ownership, unmodified AWS certificate. (Score 91)
     - **Candidate B (Tampered)**: Resume modified, cloned GitHub template repository with 1 commit, certificate modified in Canva. (Score 43)
     - **Candidate C (Mixed)**: Valid credentials but low GitHub evidence. (Score 67)
  4. Write the pitch slide script and run verification walk-throughs.

---

## ⏱️ Hourly Schedule (24-Hour Timeline)

```
┌────────────────────────────────────────────────────────────────────────┐
│ HOUR 0-3: Isolated Sandboxing                                          │
│ - P1: Write Gemini prompts and parse local resumes.                    │
│ - P2: Query GitHub Octokit API and parse files.                        │
│ - P3: Design frontend UI templates.                                    │
│ - P4: Extract certificate metadata.                                    │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│ HOUR 4-8: Scheme Alignment                                             │
│ - Establish a shared JSON data payload format.                         │
│ - Freeze API contracts. No schema changes allowed after this point!    │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│ HOUR 8-16: Core Build                                                  │
│ - Focus 100% on raw functionality. No styling refactors.              │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│ HOUR 16-20: Integration                                                │
│ - Connect frontends and backends together. Expect things to break.     │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│ HOUR 20-24: Freeze & Polish                                            │
│ - Zero major code changes. Bug fixes and demo walkthrough rehearsals. │
└────────────────────────────────────────────────────────────────────────┘
```
