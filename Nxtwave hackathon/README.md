# SevaSetu AI · Citizen Welfare & Scholarship Command Center

A human-governed, explainable scholarship discovery and application engine built with **Next.js 14 (App Router)**, **FastAPI**, **GSAP**, **Anime.js**, and vector icons following **Hallmark 2.0 Design System Principles**.

---

## Architecture Overview

- **Frontend (`frontend/`)**: Next.js 14 (React 18, TypeScript, Tailwind CSS)
  - **GSAP**: Choreographed hero timelines, entrance stagger transitions, and interactive review card reveals.
  - **Anime.js**: Numeric counter roll-ups, micro-interaction pulses, and live compliance indicators.
  - **Vector Icons**: Lucide / Framer-style iconography with **zero emojis**.
  - **Design Floor**: Strict Hallmark design floor compliance (token-based colors at `:root`, no `transition: all`, `overflow-x: clip`, instant `:focus-visible`, `prefers-reduced-motion` fallbacks, capped & centered containers).
- **Backend (`backend/`)**: FastAPI + Pydantic v2
  - Multi-scheme welfare registry with authentic eligibility guidelines.
  - Explainable multi-factor qualification engine with diagnostic rule evaluations.
  - Human-in-the-loop approval gate with cryptographic digital token generation (SHA-256).
  - Simulated portal submission adapter issuing verifiable tracking receipts.
  - Live explainable audit trail and timestamped execution log.
  - JWT account sessions, applicant profiles, document upload hashing, and administrator overview/audit endpoints.
  - Built-in scheme information chatbot available through `POST /api/chat`.

---

## Getting Started

### 1. Start the FastAPI Backend

```powershell
cd "A:\Nxtwave hackathon"
uvicorn backend.app.main:app --reload --port 8000
```

The interactive API documentation is accessible at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

### 2. Start the Next.js Frontend

```powershell
cd "A:\Nxtwave hackathon\frontend"
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### PostgreSQL and account features

Set `DATABASE_URL` before starting the backend to enable PostgreSQL schema creation and persistence:

```powershell
$env:DATABASE_URL = "postgresql://user:password@localhost:5432/sevasetu"
$env:SEVASETU_JWT_SECRET = "replace-with-a-long-random-secret"
$env:SEVASETU_ADMIN_EMAIL = "admin@example.com"
uvicorn backend.app.main:app --reload --port 8000
```

Set `NEXT_PUBLIC_API_URL` when the API is not running on the local default:

```powershell
$env:NEXT_PUBLIC_API_URL = "http://127.0.0.1:8000"
```

Configure outbound source-update webhooks:

```powershell
$env:SEVASETU_WEBHOOK_TARGET_URL = "https://your-service.example.com/sevasetu/source-updates"
$env:SEVASETU_WEBHOOK_SECRET = "replace-with-a-random-long-secret"
```

Source syncs sign payloads with `HMAC-SHA256` in the `X-SevaSetu-Signature` header. Incoming events can be received at `POST /api/webhooks/source-update`, which validates the same signature and rejects duplicate delivery IDs.

The Account control supports registration/login, profile updates, and document uploads. The Admin control is available to the configured administrator email and exposes operational metrics plus the audit ledger. Without `DATABASE_URL`, the API remains usable as an explicit in-memory local demo.

---

## Features & User Journey

1. **Scheme Explorer**: Search, filter, and inspect verified central & state welfare programs (National Merit Scholarship, AICTE Pragati for Girls, Post-Matric Excellence Grant).
2. **Explainable Eligibility Evaluation**: Evaluates course criteria, income ceilings, academic performance, and community categories with instant diagnostic breakdowns.
3. **Verified Document Vault**: Prepares synthetic verified document packets (Aadhaar, income certificate, college bonafide) with verifiable SHA-256 hashes.
4. **Human-in-the-Loop Approval Modal**: Nothing is dispatched without explicit citizen consent. Generates a cryptographic digital signature and simulates portal submission with tracking acknowledgement.
5. **Real-time Audit Trail**: Staggered GSAP-animated immutable timeline tracing every system check and citizen action.
6. **Scheme Assistant**: Chat with the registry-aware assistant about eligibility, benefits, documents, application status, and approval.
7. **Official Source Monitor**: Sync and inspect public updates from the National Scholarship Portal and MyScheme sitemap; source health is also shown for India.gov.in and AICTE.
