# 🤖 AGENT_USAGE.md

This document details the agentic AI workflow, tools, prompts, delegated tasks, corrections made during development, and verification steps applied while building the **Grant Application Completeness Assistant**.

---

## 1. Tools & Runtimes Used

- **Development Agent:** Antigravity Agentic Pair Programmer (DeepMind Advanced Agentic Coding Engine).
- **Tooling Utilized:**
  - `run_command`: Automated environment checks, package installations (`concurrently`, `sqlite3`, `lucide-react`, `vitest`), server execution, and curl validation.
  - `write_to_file` & `replace_file_content`: Modular component scaffolding, TypeScript type definitions, scoring algorithms, and database migrations.
  - `vitest`: Automated unit testing for deterministic mathematical scoring and SHA-256 staleness detection.

---

## 2. Representative Prompts & System Instructions

### A. Core AI Prompt for Guideline Requirement Extraction & Citation Mapping
```text
System:
You are the Grant Application Completeness Assistant.
Your task is to thoroughly analyze a draft funding application against a supplied grant guideline document.
SAFETY INSTRUCTION: You MUST NOT make an authoritative legal or funding-eligibility decision. Frame all evaluations as advisory completeness assessments.

Tasks:
1. Extract all eligibility and submission requirements from the guideline.
2. Distinguish Mandatory requirements ("must", "shall", "required", "eligibility gate") from Recommendations ("should", "encouraged", "bonus", "preferred").
3. Map draft application content to each requirement.
4. Cite exact source quotes from both the guideline and application.
5. Identify missing, weak, or ambiguous evidence.
6. Generate targeted clarification questions for the applicant.
7. Identify unsubstantiated claims made in the draft application that lack supporting evidence.
8. Output strictly valid JSON conforming to the defined schema.
```

### B. Heuristic & NLP Semantic Parser Prompting
- Pattern extraction for 5 core domain categories: `Eligibility`, `Technical Approach`, `Budget & Financials`, `Impact & Sustainability`, and `Governance & Compliance`.
- Hyperbole and unsubstantiated assertion detection regexes targeting unsupported commitments (*e.g., "guarantees zero risk", "100% zero degradation over 10 years", "exclusive partnership"*).

---

## 3. Delegated Work vs Autonomous Agent Execution

| Task | Execution Mode | Details |
|---|---|---|
| **Project Architecture & Stack Design** | Autonomous Agent | Chose React 19 + TypeScript + Express + SQLite + Vitest for zero-dependency standalone evaluation. |
| **Deterministic Scoring Algorithm** | Autonomous Agent | Designed 75% Mandatory / 25% Recommended weighting with document penalty deductions. |
| **Human-in-the-Loop Review Modal** | Autonomous Agent | Created override workflow allowing reviewers to confirm, correct citations, or reject AI decisions. |
| **Document Versioning & Staleness Engine** | Autonomous Agent | Implemented SHA-256 content hashing to automatically detect document mutations and trigger stale banners. |
| **Pre-loaded Scenarios** | Autonomous Agent | Created 3 realistic, high-fidelity grant proposals (CleanTech, NIH SBIR, Urban Forestry). |

---

## 4. Important Mistakes, Edge Cases & Corrected Decisions

1. **Initial Weighting Edge Case in Scoring Engine:**
   - *Issue Identified:* In the initial scoring calculation, when an assessment scenario had 0 recommended requirements, the raw percentage defaulted to `100% * 0.25 = 25%` base credit, even if all mandatory items were rejected.
   - *Correction:* Refactored `ScoringService.ts` to dynamically normalize weights: if only mandatory requirements exist, mandatory weight scales to 100%; if both exist, 75/25 weighting is applied. Vitest unit tests caught this and confirmed the fix.

2. **TypeScript 5.6+ `verbatimModuleSyntax` and Type-Only Imports:**
   - *Issue Identified:* Modern Vite template configured strict `verbatimModuleSyntax: true` and `noUnusedLocals: true`, causing type imports across components to reject standard interface syntax during bundle build.
   - *Correction:* Adjusted `tsconfig.app.json` with standard Vite compiler settings (`useDefineForClassFields: true`, `types: ["vite/client"]`) and cleaned unused imports across modals, achieving a zero-error production build.

3. **Advisory Framing & Legal Disclaimer Safety Constraint:**
   - *Requirement:* The prompt explicitly mandated: *"The tool must not make an authoritative legal or funding-eligibility decision."*
   - *Implementation:* Built a persistent amber advisory banner with explicit acknowledgment, framed readiness as advisory ratings (*High Readiness*, *Moderate Readiness*, *Action Required*), and included legal disclaimers on both the web UI and exported Markdown reports.

---

## 5. How Outputs Were Verified

1. **Automated Unit Tests:**
   - Executed `npm test` verifying 5 distinct test cases covering scoring calculations, penalties, human overrides, and SHA-256 hash matching.
2. **API Endpoint Integration Testing:**
   - Tested `/api/health`, `/api/assessments/scenarios`, `/api/assessments/:id`, and `/api/export/summary/:id` using HTTP requests.
3. **Staleness Cycle Verification:**
   - Updated draft application text via `PUT /api/applications/:id`, verified `is_stale: 1` was immediately set with detailed reason, and triggered `POST /api/assessments/analyze` to verify `is_stale: 0` and version bump.
4. **Interactive Human Review Verification:**
   - Sent confirmation and correction payloads via `POST /api/assessments/:id/requirements/:reqId/review` and verified live deterministic score changes and audit log entries.
