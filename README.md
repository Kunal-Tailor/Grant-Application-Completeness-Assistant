# 📋 Grant Application Completeness Assistant

An AI-powered paired workflow application that evaluates draft grant funding applications against official grant solicitation guidelines with **source-grounded citations**, **deterministic readiness scoring**, **unsubstantiated claim detection**, and **human-in-the-loop review**.

> ⚠️ **Advisory Notice:** This system is an advisory completeness and compliance verification tool. It does **not** make authoritative legal or funding-eligibility decisions. All determinations remain with the funding authority.

---

## 🌟 Key Features & Capabilities

### 1. AI Requirement Extraction & Citation Mapping
- Automatically extracts eligibility criteria and submission requirements from raw grant guidelines.
- Distinguishes **Mandatory Gates** (*"Must", "Shall", "Required"*) from **Recommended Best Practices** (*"Should", "Encouraged", "Bonus"*).
- Maps draft application content to each requirement with **bidirectional source citations** (exact guideline clauses and application evidence paragraphs).
- Assigns AI confidence ratings and evidence strength tiers (*Strong, Moderate, Weak, None*).

### 2. Deterministic Checklist Scoring Engine
- Computes readiness percentages using transparent, deterministic mathematical formulas:
  - **Mandatory Requirements:** 75% base weighting.
  - **Recommended Considerations:** 25% base weighting.
  - **Penalties:** Dynamic point deductions for missing mandatory supporting documents and active high-severity unsubstantiated claims.
  - Categorizes readiness into: *High Readiness*, *Moderate Readiness*, or *Action Required (Critical Gaps)*.

### 3. Human-in-the-Loop Review & Overrides
- Reviewers can **Confirm** (thumbs up), **Edit / Correct** (modify mapped quote, status, evidence strength, or auditor notes), or **Reject** any AI finding.
- Deterministic score instantly recalculates in real-time upon any reviewer adjustment.

### 4. Unsubstantiated Claims & Evidence Gap Inspector
- Automatically flags hyperbolic or unsupported assertions (e.g., *"100% zero degradation over 10 years without maintenance"*, *"signed LOIs with all tier-1 partners"*) lacking empirical proof.
- Formulates actionable "Recommended Proof" guidance for the applicant.

### 5. Applicant Clarification Questions Generator
- Generates targeted, context-aware clarification questions addressing ambiguous methodology, vague KPIs, or missing operational details.
- Interactive response logger allows applicants to draft and save clarifications.

### 6. Supporting Documents Tracker
- Tracks required vs optional attachments (Consortium MOUs, Bank Guarantees, ISO Certifications, IRB Approvals, GIS Maps).
- Interactive 1-click attachment toggling dynamically updates completeness penalties.

### 7. Document Versioning & Staleness Engine
- Tracks document snapshots with SHA-256 cryptographic hashing on every revision.
- Detects when guideline criteria or draft application text has changed and flags the active assessment as **Stale** with an amber alert and 1-click re-assessment.

### 8. Immutable Audit Trail & Export
- Structured JSON and timeline stream of all events (AI extractions, human overrides, document edits, staleness triggers).
- 1-click export of complete completeness review report to Markdown (`.md`) or JSON format.

---

## 🏗️ Architecture & Technology Stack

```
Grant Application Completeness Assistant
│
├── client/                     # Frontend (Vite + React 19 + TypeScript)
│   ├── src/
│   │   ├── components/         # Scorecard, RequirementCards, HumanReviewModal, Docs, Claims
│   │   ├── services/api.ts     # REST API Client
│   │   ├── types/index.ts      # Domain Interfaces
│   │   ├── App.tsx             # Main Workbench & Tab Navigation
│   │   └── index.css           # Glassmorphism Design System & Dark Mode Palette
│
├── server/                     # Backend (Node.js + Express + TypeScript)
│   ├── src/
│   │   ├── db/database.ts      # SQLite Persistent Storage & Schema Migrations
│   │   ├── services/
│   │   │   ├── aiService.ts    # Multi-provider LLM (OpenAI) & Semantic Fallback Analyzer
│   │   │   ├── scoringService.ts # Deterministic Calculation Engine
│   │   │   ├── versionService.ts # SHA-256 Hashing & Staleness State Manager
│   │   │   └── sampleData.ts   # 3 Built-in Realistic Grant Scenarios
│   │   ├── routes/             # Assessment, Guideline, Application, Export Endpoints
│   │   └── logger.ts           # Structured Audit Event Logger
│   └── tests/                  # Vitest Unit & Integration Test Suite
│
├── package.json                # Root Concurrently Runner
├── Dockerfile                  # Container Deployment Manifest
├── AGENT_USAGE.md              # AI Agent Log & Workflow Documentation
└── .env.example                # Configuration Template
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (tested with Node v20/v26)
- npm 9+

### Quick Start (Development Mode)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Kunal-Tailor/Snake-Game.git
   cd Snake-Game
   ```

2. **Install all dependencies:**
   ```bash
   npm install
   cd client && npm install
   cd ../server && npm install
   cd ..
   ```

3. **Start both Frontend and Backend concurrently:**
   ```bash
   npm run dev
   ```
   - **Frontend UI:** [http://localhost:5173](http://localhost:5173)
   - **Backend API:** [http://localhost:3001](http://localhost:3001)
   - **API Health Check:** [http://localhost:3001/api/health](http://localhost:3001/api/health)

---

## 🧪 Running Automated Tests

The test suite validates deterministic score calculation, mandatory vs recommended weighting, doc penalty deductions, human confirmation adjustments, and SHA-256 staleness hashing.

Run backend tests:
```bash
npm test
```

Expected output:
```
✓ src/tests/scoring.test.ts (4 tests)
✓ src/tests/staleness.test.ts (1 test)
Test Files  2 passed (2)
Tests       5 passed (5)
```

---

## 📚 Built-in Sample Scenarios (One-Click Demo)

The application includes 3 realistic pre-loaded scenarios accessible directly from the top dropdown:

| Scenario | Domain | Highlights |
|---|---|---|
| **1. CleanTech Horizon 2026** | Green Hydrogen Electrolyzer | 8 criteria, missing ISO 9001 doc penalty, 1 high-severity unsupported degradation claim, match funding verification. |
| **2. NIH SBIR Phase I** | AI Pediatric Oncology Diagnostics | Strict IRB human subject gate, HIPAA data encryption protocol, 51% PI employment requirement. |
| **3. Urban Climate Resilience** | Municipal Forestry & Stormwater | 501(c)(3) municipal partnership, GIS parcel mapping, community consultation workshop minutes. |

---

## 🚢 Deployment

### Docker Deployment
```bash
docker build -t grant-assistant .
docker run -p 3001:3001 grant-assistant
```
Open [http://localhost:3001](http://localhost:3001) in your browser.

---

## 🔒 Scope & Boundaries

### Completed Scope
- ✅ Automated requirement extraction & distinction of mandatory gates vs recommendations.
- ✅ Application content-to-guideline citation mapping with confidence scores and exact quotes.
- ✅ Missing, weak, and ambiguous evidence detection.
- ✅ Actionable clarification questions generator for the applicant.
- ✅ Unsubstantiated claims & hyperbole detection with recommended proof.
- ✅ Deterministic completeness score engine (75/25 weighting + penalty deduction).
- ✅ Interactive human-in-the-loop review (Confirm, Correct, Reject) with instant recalculation.
- ✅ Supporting documents checklist with missing attachment penalties.
- ✅ Document version snapshots and cryptographic SHA-256 staleness tracking.
- ✅ Exportable Markdown/JSON completeness review report.
- ✅ Structured audit trail logger.

### Excluded Scope (By Design)
- ❌ External grant-database web scrapers.
- ❌ Automatic grant application submission.
- ❌ Financial forecasting or actuarial modeling.
- ❌ Automated generative document writing.
- ❌ Authoritative legal eligibility decisions.

---

## 📄 License
MIT License. © 2026 Kunal Tailor. All rights reserved.
