# ISDS — Final Build Report

**Date:** 2026-07-31
**Status:** ✅ Build verified, backend hardened, tests + CI in place

This report tracks the state of every item in `PROJECT_AUDIT.md` (Phase 1) at project completion.

## Verification summary

| Check | Result |
| ----- | ------ |
| `npm run build` (Vite production) | ✅ Passes — 3208 modules, no unresolved imports |
| `npm run lint` (ESLint flat config) | ✅ 0 errors, 5 pre-existing warnings |
| `npm test` (server unit tests, Node `node:test`) | ✅ 9/9 pass |
| `npm audit` | ✅ 0 production vulns (1 RSC-mode advisory, non-applicable — see below) |
| Backend smoke tests (all roles + RBAC + IDOR) | ✅ Pass (see `role-smoke.ps1`, `admin-quiz-smoke.ps1`) |
| Health check `/api/health` | ✅ `{"status":"ok"}` |

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

- No production SMTP/Firebase/Anthropic credentials → email, Firebase login, and AI features degrade gracefully until configured.
- MySQL is the supported database (dev instance `localhost:3307`; helper `scripts/dev-db.ps1`). No managed DB or hosting credentials.
- `certificateGenerator` signatories hardcoded (item 18, low).
