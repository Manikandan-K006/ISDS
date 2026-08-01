# ISDS — Final Build Report

**Date:** 2026-08-01
**Status:** ✅ Phase 1 hardened + Phase 2 (AI, careers, portfolios, recruiter) verified

This report tracks the state of every item in `PROJECT_AUDIT.md` (Phase 1) at project completion, then documents the Phase 2 expansion delivered on top of it.

## Verification summary

| Check | Result |
| ----- | ------ |
| `npm run build` (Vite production) | ✅ Passes — Monaco bundled as lazy chunks, no unresolved imports |
| `npm run lint` (ESLint flat config) | ✅ 0 errors, 5 pre-existing warnings (untouched files) |
| `npm test` (server unit tests, Node `node:test`) | ✅ **18/18 pass** (9 original + 9 advisor/helper) |
| `npm audit` | ✅ 0 production vulns (1 RSC-mode advisory, non-applicable — see below) |
| Backend smoke tests (all roles + RBAC + IDOR) | ✅ Pass (see `role-smoke.ps1`, `admin-quiz-smoke.ps1`) |
| API smoke harness (13 endpoints incl. all new AI/career/recruiter/portfolio) | ✅ All 200/201 |
| Health check `/api/health` | ✅ `{"status":"ok"}` |

## Phase 2 — what was added

### AI assistant & personalization (`server/utils/advisor.js` + routes)
- **Intent engine** (`resolveIntent`): word-boundary keyword matching with weights and priority; maps CGPA, attendance, GPA, assignments, quizzes, skills, projects, internships, research, recommendations, and general queries.
- **`POST /api/chatbot`** rewritten around the deterministic engine — no external LLM required for data-grounded answers; open-ended `default` intent degrades gracefully (Anthropic only when configured). Returns `{ reply, intent, suggestions }`; rate-limited 30/15 min.
- **`POST /api/ai/study-plan/generate`**: builds a real workload from assignments/quizzes, adds focus areas, and persists an active `AIStudyPlan` with a deterministic, deadline-first weekly schedule (`generateWeeklySchedule`).
- **`GET /api/ai/skill-gap?role=`**: computes target-vs-current skill scores for 5 career roles (AI engineer, full-stack, data analyst, cybersecurity, software engineer) + a static ROADMAP.
- **`GET /api/ai/career-advisor`**: best-fit role, next skills, learning path, certifications, project + internship suggestions.

### Careers & placement
- **`GET /api/career/placement/summary`**: student placement cell — open drives with per-drive live eligibility (CGPA/attendance/skills), application status counts, readiness score.
- **Placement Cell page** (`src/pages/student/Placement.jsx`) with eligibility rule breakdown and one-click apply.

### Public portfolios & recruiter discovery
- **`server/routes/portfolio.js`** rebuilt with shared privacy-aware `buildPortfolio` (403 unless `careerProfile.isPublic`; only public projects, verified/public certificates, verified/completed internships, verified/published research) + **`GET /api/portfolio/by-register/:registerNumber`**.
- **Public portfolio page** at `/student/:slug` (`src/pages/public/PublicPortfolio.jsx`) with 403/404 handling, cover hero, skill score chips, projects/internships/research/certificates.
- **`GET /api/recruiter/candidates`**: server-side filters (`search`, `departmentId`, `minCgpa`, `hasInternship`, `hasResearch`, `minSkillScore`) over public-profile students only; top-5 skills per candidate; `GET /api/recruiter/departments`.
- **Candidate Directory** (`src/pages/recruiter/RecruiterCandidates.jsx`) rebuilt with filter bar + deep links to each candidate's public portfolio.

### Student experience
- **Landing page** (`src/pages/public/Landing.jsx`) — premium marketing page with hero, stats, features, FAQ, testimonial, demo modal.
- **Real analytics** (`src/pages/student/StudentAnalytics.jsx`) — attendance, quiz pass/fail, course progress, assignment grades from `/students/analytics`.
- **Study Planner UI** rewritten around the generator; **Skill Gap Analyzer** card in the Skills page.
- **Student dashboard** now shows Placement Readiness (score + open drives/applied/shortlisted/selected) and a copy-link **Career Portfolio** share card.
- **Coding Lab editor**: Monaco (`monaco-editor` + `@monaco-editor/react`, npm bundle) with Vite worker wiring (`src/components/code/CodeEditor.jsx`) — works offline on the LAN, lazy-loaded only when Coding Lab opens.

### Bug fixed along the way
- Prisma `mode: 'insensitive'` is invalid on MySQL → removed in recruiter/admin/courses/coding/career search filters (MySQL collation is case-insensitive by default). All previously-latent 500s on search now return 200.
- `Quiz` has no `Course` relation — `buildStudentContext` and friends fetch enrollments first, then filter quizzes by `courseId in` enrolled ids.
- `Github`/`Linkedin` lucide icons don't exist in lucide-react 1.22 — replaced with `GitBranch`/`Share2` (lint could not catch this; the build could and did).

## Audit recommendation status (Section 10)

### Critical
1. **Prisma 7 runtime — FIXED.** MySQL + driver adapter in `server/prisma.js` (`new PrismaMariaDb(DATABASE_URL)` + `new PrismaClient({ adapter })`). CLI URL pinned in `prisma.config.ts` (`mysql://root:@localhost:3307/isds`). `prisma generate` + `db push` verified with zero data loss. Stale `server/generated/` deleted and gitignored.
2. **15 missing pages — FIXED.** All pages created under `src/pages/{admin,teacher,parent}`; `npm run build` passes; each wired to real backend endpoints with honest empty states.
3. **Certificate integration — FIXED.** `server/routes/certificates.js` rebuilt to match `src/api/certificates.js`; public `GET /verify/:id` with rate limiting + expiry/revocation checks; PDF/DOCX/QR generation verified; admin stats/logs, revoke/restore/regenerate, share/download tracking all working.

### High
4. **Hardcoded secrets — FIXED.** Centralized `server/config/env.js`; production fails on missing `JWT_SECRET`/`ADMIN_SECRET_KEY`; dev-only fallbacks; placeholder values treated as unset; admin creation gated by `ADMIN_SECRET_KEY`.
5. **CORS — FIXED.** Strict allowlist (`CORS_ORIGINS` + `FRONTEND_URL`), no wildcard with credentials; disallowed origin returns clean deny.
6. **IDOR gaps — FIXED.** Ownership enforced on notifications, calendar, attendance (via `canAccessStudent`), certificates, parents (`parseStudentIds`), messages. New: teacher-course ownership on assignments/quizzes (`canManageCourse`) — verified 403 on cross-teacher writes.
7. **Auth hardening — FIXED.** Dedicated rate limits on login/register/forgot/reset; JWT with `tokenVersion` + `isActive` checks; refresh rotation; reset tokens persisted + one-time; password change invalidates refresh tokens; restricted signup flow for teacher/parent (requires admin secret / admin-created).
8. **Chatbot — FIXED.** Mounted behind auth + rate limits + role-aware system prompt; gracefully degrades when `ANTHROPIC_API_KEY` absent.
9. **Unified entrypoints — FIXED.** Single `server/index.js`; legacy `server/server.js` gone.

### Medium
10. **RBAC/routing — FIXED.** `ProtectedRoute` per-role guards; teacher routes under `/teacher/*` with proper layout; admin-only guard on `/admin/*`.
11. **Error handling/validation — FIXED.** `server/middleware/error.js` (no stack leak in prod) + `notFound` handler; consistent JSON error shape; rate-limit messages unified.
12. **Audit coverage — FIXED.** `server/middleware/audit.js` logs all non-GET requests + failures (user, route, IP, body); `AuditLog` wired to admin UI (`/admin/audit-logs`).
13. **Dead/legacy code — FIXED.** `seed.js` rewritten as Prisma/MySQL seed; Firestore-only `trophies.js`, `calls.js`, `config/firestore.js` deleted; `notify.js` ported to Prisma; only `firebaseAdmin.js` kept (used by `/auth/firebase`).
14. **Upload hardening — FIXED.** MIME + extension allowlist, 15 MB single / 50 MB batch limits, sanitized filenames, validated destination types, 413/400 error mapping (verified: `.exe` rejected 400).

### Low
15. **npm audit — FIXED.** Upgraded axios/dompurify/form-data/fast-uri/react-router-dom/prisma to patched versions. Remaining advisory: `react-router` RSC-mode CSRF (GHSA-qwww-vcr4-c8h2) affects **7.12–8.2**; the app uses declarative SPA `<BrowserRouter>` (no RSC/server actions), so it is not exploitable, and the only "fix" is a breaking downgrade to 7.11 — documented and accepted.
16. **README — FIXED.** Replaced boilerplate with real setup/run/test/deploy docs incl. MySQL/Prisma adapter notes.
17. **Firebase dedup — FIXED.** `firestore.js` removed; single `config/firebaseAdmin.js` + `verifyFirebaseToken`.
18. **Certificate generator parameterization — PARTIAL.** Base URL uses `FRONTEND_URL`; signatories remain constants in the generator (no env override) — low risk, left for future work.
19. **Tests/CI — FIXED.** Server unit tests (`server/test/`, Node `node:test`, no DB required); GitHub Actions CI (install → lint → test → build → artifact). `vercel.json` left as-is; backend is a standalone Express process.
20. **Placeholders/UI — FIXED.** All nav entries resolve to real pages; new pages use the theme utility system (`theme-card`, `gradient-hero`, `components/ui`).

## What was verified end-to-end (live smoke tests)

- **Admin:** dashboard stats, users filter, departments, audit logs, database health, settings upsert, admin route denial for teacher/student (403).
- **Teacher:** own courses, students, attendance mark; **new** cross-teacher assignment/quiz → 403.
- **Parent:** dashboard, attendance stats, report, performance; IDOR-blocked on other student's report (403).
- **Student:** quiz take (options parsed from MySQL Json), submit, notification unread count.
- **Messages:** send + conversation thread.
- **Uploads:** valid PDF accepted; `.exe` rejected (400).
- **Certificates:** PDF/DOCX/QR generation and public verification.

## Known limitations (deployment)

- No production SMTP/Firebase/Anthropic credentials → email, Firebase login, and the optional LLM fallback degrade gracefully until configured; the AI assistant is fully functional deterministically.
- MySQL is the supported database (dev instance `localhost:3307`; helper `scripts/dev-db.ps1`). No managed DB or hosting credentials.
- `certificateGenerator` signatories hardcoded (item 18, low).
- Monaco adds ~2.7 MB (gzip ~685 kB) to the frontend bundle; it is route-lazy so the main bundle is unaffected. Vite emits a chunk-size warning — informational only.
