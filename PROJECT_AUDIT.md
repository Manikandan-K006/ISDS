# ISDS — Full Repository Audit (Phase 1)

**Date:** 31 Jul 2026
**Scope:** Entire repository (frontend, backend, config, deployment, docs).
**Method:** Manual inspection of every route/page/service/middleware + `npm run build` verification + Prisma client generation + runtime smoke tests + `npm audit`.

---

## 1. Architecture

- **Frontend:** React 19 + Vite 8 (rolldown) + Tailwind 4 (via `@tailwindcss/vite`) + framer-motion + recharts + react-router-dom v7 + axios + Firebase web SDK (optional). SPA with code-split pages (`React.lazy`).
  - Entry: `src/main.jsx` → `src/App.jsx` (all routes + layouts) → `index.html`.
  - Layouts: `StudentLayout`, `AdminLayout`, `ParentLayout` (all near-identical: Navbar + Sidebar + Outlet + AIChatbot), `AuthLayout`.
  - UI kit: `src/components/ui/index.jsx` (Button, Input, Select, Card, Badge, KpiCard, ProgressBar, Modal, Tabs, Switch, Table, Tooltip, Skeleton, StatsGrid, etc.) + `Skeleton.jsx`.
  - Theme system: CSS custom props in `src/index.css` (`@theme` block: `--primary`, `--card-bg`, `--text`, etc.) with utility classes `theme-bg/theme-card/theme-border/theme-text/theme-text-muted`, `gradient-accent`, `ambient-bg`. Dark/light via `ThemeContext`.
  - API layer: `src/api/client.js` (axios instance + token/refresh interceptor, localStorage keys `sidts_token`, `sidts_refresh_token`, `sidts_user`), plus per-domain modules.

- **Backend:** Node/Express (CommonJS), `server/` directory.
  - **Two entrypoints (conflict):**
    - `server/index.js` — **modern/main**: helmet, CORS, global rate limit (100/15min), 50mb JSON, `/uploads` static, mounts 18 route groups (auth, students, teachers, parents, admin, courses, assignments, attendance, quizzes, certificates, notifications, messages, analytics, achievements, calendar, uploads, ai), `/api/health`, error handler. Port 5000.
    - `server/server.js` — **legacy**: bare `cors()`, mounts a smaller/older set (auth, students, courses, assignments, attendance, certificates, trophies, analytics, chatbot, calls, notifications, messages). Port 5000 (conflict if both run).
  - Persistence: **Prisma 7.8 + PostgreSQL** (primary), plus **Firebase Admin SDK (Firestore)** for legacy features (trophies, calls, notify service, seed).
  - Services: `email.js` (nodemailer SMTP), `notify.js` (Firestore-based notification helper, **unused by routes**), `certificateGenerator.js` (jsPDF/DOCX/QR, **defined but not wired into any route**).
  - Middleware: `server/middleware/auth.js` (authenticate/authorize/optionalAuth).
  - DB client: `server/prisma.js` (`new PrismaClient()`).

- **Deployment:** Vercel (frontend only). `vercel.json` rewrites all routes to `index.html`. `vite.config.js` proxies `/api → http://localhost:5000` in dev. No backend deploy config (no `api/` serverless, no Docker, no `server` in vercel config). `README.md` is still Vite boilerplate.

- **Secrets/env:** Root `.env` (untracked) holds `VITE_FIREBASE_*`, `VITE_API_URL`, `DATABASE_URL`. `server/.env` (untracked) holds `JWT_SECRET`, `ANTHROPIC_API_KEY`, `PORT`, `FIREBASE_*`, `FRONTEND_URL`, `SMTP_*`. `.gitignore` covers `.env`, `dist`, `node_modules`, `server/uploads/*`. Good.

---

## 2. Existing Features (working)

### Backend (Prisma-backed, largely functional logic)
- **Auth:** register (email/password; admin gated by secret key), login, Firebase idToken login, refresh-token rotation (30d, one-time use), logout, `/me`, change-password. ActivityLog written on login/logout.
- **Students** (`routes/students.js`): dashboard (enrollments, submissions, attendance, quiz results, notifications, upcoming assignments), courses, per-course progress, lesson progress + auto enrollment progress, attendance, assignments list + submit (late-flagging, notifications), leaderboard, achievements, skills, calendar, quiz results, certificates, analytics, profile update.
- **Teachers** (`routes/teachers.js`): dashboard (courses, pending submissions, today's attendance), courses, students, analytics, gradebook per course, grade submission (+ notification), announcements (+ notify enrolled students).
- **Parents** (`routes/parents.js`): dashboard (linked students), per-student performance, report, AI summary (ownership-checked via `parent.studentIds`).
- **Admin** (`routes/admin.js`): dashboard KPIs, user CRUD (soft delete), departments CRUD, analytics, audit-logs, settings (SystemSetting upsert), announcements (broadcast), database-health. Writes AuditLog on user update/deactivate/department create.
- **Courses** (`routes/courses.js`): public catalog (optionalAuth), course detail (published only), enroll (student), create/update/delete (teacher/admin, owner check on update/delete), modules & lessons CRUD, announcements. Version increments on update.
- **Assignments** (`routes/assignments.js`): list per course, create (notifies enrolled students), update, delete.
- **Attendance** (`routes/attendance.js`): mark (batch upsert, teacher/admin), by student, by course, stats.
- **Quizzes** (`routes/quizzes.js`): list per course, create (nested questions), take (published only, attempt-limit check), submit (auto-grade, upsert result + save per-question responses), update, delete.
- **Certificates** (`routes/certificates.js`): list (student-scoped or all), issue (unique student+course, notifies), verify (auth-protected). NOTE: `certificateGenerator.js` service is NOT called by this route — no file generation today.
- **Notifications / Messages / Calendar / Achievements / Analytics / AI** (`routes/*.js`): functional Prisma CRUD + aggregate endpoints; `ai.js` builds study plans, insights, weakness/prediction/dashboard-insights from real data.

### Frontend (functional, high-quality UI)
- Premium design system (glass navbar, gradient sidebar, KPI cards, ambient backgrounds, Skeleton loaders, charts).
- **Student dashboard** (hero, KPIs, enrolled courses, assignments, attendance), CourseCatalog, LearningPage, Assignments, Certificates (download/share/print UI), Attendance, Leaderboard, Achievements, Skills, Schedule, StudyPlan, StudentAnalytics, QuizList/QuizTake, KnowledgeHub, TrophySession, StudentProfile (avatar upload, inline editing, password change).
- **Teacher**: TeacherDashboard, ManageCourses, CourseBuilder (modules/lessons/resources), ManageAssignments, ManageQuizzes, StudentAnalytics, GradeBook, TeacherResources, TeacherProfile.
- **Parent**: ParentDashboard (linked students with stats, courses, recent grades).
- **Admin**: AdminDashboard (8 KPIs, charts, course table, quick actions), StudentList, StudentDetailAdmin (private notes), ManageCourses, ManageAssignments, AdminCertificates, CallModule, Analytics, TeacherProfile.
- **Auth**: Login, Register (Firebase), ForgotPassword, AuthLanding; public VerifyCertificate page with QR + search.
- **Shared**: Messages (chat UI), Notifications (polling, click-to-navigate).
- Certificate PDF/DOCX/QR generation + verification feature set was recently committed (frontend + generator service).

### Certificates feature (partial)
- Generator service (`certificateGenerator.js`) produces PDF, DOCX, and QR PNG with verification URL. **Not called by `routes/certificates.js`** — currently the route just inserts a DB row.

---

## 3. Broken / Incomplete / Placeholder

### BLOCKERS (app cannot build/run)
1. **Frontend build FAILS** — `npm run build` errors with 5 unresolved lazy imports (rolldown aborts after listing these; 15 pages total are missing):
   - `teacher/TeacherAttendance`, `teacher/TeacherMessages`
   - `parent/ParentAttendance`, `parent/ParentPerformance`, `parent/ParentAssignments`, `parent/ParentReports`, `parent/ParentMessages`, `parent/ParentNotifications`
   - `admin/TeacherList`, `admin/ParentList`, `admin/AdminCourses`, `admin/DepartmentManagement`, `admin/AuditLogs`, `admin/AdminSettings`, `admin/DatabaseHealth`
   - (App.jsx routes reference all of them; files do not exist.)
2. **Prisma client broken at runtime** — `new PrismaClient()` throws `PrismaClientInitializationError: PrismaClient needs to be constructed with a non-empty, valid PrismaClientOptions`. Root cause: schema `datasource` block has **no `url = env("DATABASE_URL")`** and Prisma 7.8 requires it for client construction; also `DATABASE_URL` in `.env` uses the **`prisma+postgres://` scheme** (driver-adapter style) which needs `@prisma/adapter-pg` + `PrismaPg` — not installed, and `prisma-client-js` classic client cannot parse it. Backend cannot start or query anything until resolved.
   - Additional: `server/prisma.js` was temporarily re-pointed at a broken `./generated/prisma/client` path (stale artifact from an earlier `prisma-client` generator attempt). `server/generated/` should be deleted. `.gitignore` already lists `/src/generated/prisma`.
   - `prisma/migrations/` does not exist — schema has never been migrated/pushed; no tables are guaranteed present.

### Integration mismatches (frontend ↔ backend contracts)
3. **`src/api/certificates.js` calls endpoints that don't exist in `server/routes/certificates.js`**: `GET /certificates/:id`, `POST /certificates`, `PUT /certificates/:id/revoke|restore|regenerate|download|share`, `GET /certificates/admin/stats|logs`, `GET /certificates/file/:type/:id`. Backend only has `GET /`, `POST /issue`, `GET /verify/:id`. Certificates UI (download/share/print/verify/manage) will 404 at runtime.
4. **VerifyCertificate page expects a flat payload** (`result.certificateId`, `studentName`, `courseName`, `grade`, `completionDate`, `instructor`, `director`, `valid`) but `/certificates/verify/:id` returns `{ certificate: {...}, valid: true }` with nested `student:{name}`/`course:{title}`. Also `GET /certificates/verify/:id` sits **behind `authenticate`** (router.use at top) yet the page is public — unauthenticated verification will always 401.
5. **Auth flow inconsistency:** `Login.jsx` posts email/password to backend `/api/auth/login` (works with DB). `Register.jsx` + `ForgotPassword.jsx` use **Firebase SDK** (`signInWithEmailAndPassword`, `createUserWithEmailAndPassword`, `sendPasswordResetEmail`) and throw "Firebase is not configured" when `VITE_FIREBASE_*` is missing. So register/forgot-password are dead without Firebase, while login is not. `src/api/auth.js` also sends `adminAuthorizationPassword` but backend `/auth/register` expects `adminSecretKey` (role gating breaks for admin signup via Firebase path).
6. **AI chatbot wiring:** `src/components/AIChatbot.jsx` → `src/api/chatbot.js` posts to `/api/chatbot` (legacy `server/routes/chatbot.js`, mounted only in `server/server.js`, and it returns a canned "not configured" reply unless `ANTHROPIC_API_KEY` is set). The modern server mounts `/api/ai` instead. Chatbot is effectively non-functional.
7. **`notify.js` is broken & unused:** `const { sendEmail, templates } = require('./services/email')` — `email.js` exports only `sendEmail`, no `templates`. Any call would throw `TypeError`. No route imports `notify.js` (it's dead code). Email templates referenced (`templates.certificateIssued`, etc.) don't exist.

### Placeholder pages ("coming soon")
- `teacher/TeacherResources`, `teacher/TeacherProfile`, `teacher/StudentAnalytics`, `teacher/ManageQuizzes`, `teacher/ManageAssignments`, `teacher/GradeBook`
- `student/TrophySession`, `student/StudentAnalytics`, `student/QuizTake`, `student/QuizList`, `student/KnowledgeHub`
- All 8 missing parent pages and 7 missing admin pages (listed above).

### Auth / RBAC issues (see §5)

### Legacy / Firestore islands
- `server/routes/trophies.js`, `server/routes/calls.js`, `server/services/notify.js`, `server/seed.js` are Firestore-only. Not mounted in modern server (except seed which is Firestore too). These will 500 if Firebase creds absent (gracefully return empty in some cases).

---

## 4. Security Issues

| # | Severity | Issue | Location |
|---|----------|-------|----------|
| S1 | **Critical** | Hardcoded JWT fallback secret `'sidts_jwt_secret_key_2024'` — any deployment without `JWT_SECRET` uses a publicly-known key; tokens forgeable. | `server/middleware/auth.js:4`, `server/routes/auth.js:9`, `server/config/firestore.js:72` (different literal `'isds_jwt_secret_key_2024'`) |
| S2 | **Critical** | Hardcoded admin registration secret `'mani@2006'` — anyone can create an admin account if `ADMIN_SECRET_KEY` unset. | `server/routes/auth.js:10` |
| S3 | **High** | CORS `origin: process.env.CORS_ORIGIN || '*'` with `credentials: true` — reflects any origin when env unset. | `server/index.js:31-34`; legacy `server/server.js` uses bare `cors()` |
| S4 | **High** | Public unauthenticated certificate verification returns full cert data (no expiry/revocation check, no rate limit). | `server/routes/certificates.js:44` |
| S5 | **High** | `POST /api/chatbot` has **no auth** and no rate limit beyond global; exposes Anthropic API key indirectly (prompt injection) and free API spend. | `server/routes/chatbot.js` |
| S6 | **High** | **IDOR / missing ownership checks:** `PUT /api/notifications/:id/read`, `DELETE /api/notifications/:id`, `PUT /api/calendar/:id`, `DELETE /api/calendar/:id` operate on any ID without verifying ownership. | `routes/notifications.js:30,48`, `routes/calendar.js:32,41` |
| S7 | **High** | `GET /api/attendance/student/:studentId` and `GET /api/attendance/stats/:studentId` allow **any teacher/admin/parent** to read any student's attendance (no link check; students only for stats). | `routes/attendance.js:27,58` |
| S8 | **High** | `GET /api/certificates` non-student roles see **all** certificates. Assignment/quiz/gradebook endpoints don't restrict teacher to own courses. | `routes/certificates.js:8-20`, `routes/assignments.js`, `routes/quizzes.js` |
| S9 | **High** | Uploads: any authenticated user can upload 100MB files; no per-role quota, no path traversal risk but no user-boundary; served statically with no auth. | `server/routes/uploads.js` |
| S10 | **Med** | Weak global rate limit (100 req/15min per IP) — login/register/forgot-password/refresh need stricter, dedicated limits. | `server/index.js:37-41` |
| S11 | **Med** | Refresh token has no rotation race protection beyond delete-on-use; no revocation on password change; stored in plaintext DB (acceptable, but no hashing). | `routes/auth.js:239-269` |
| S12 | **Med** | `forgot-password` generates a token, never persists it, and always returns 404 for unknown emails (user enumeration). | `routes/auth.js:272-309` |
| S13 | **Med** | Admin registration/`firebase` paths accept role from request body; admin gated by secret but teacher/parent roles are self-assignable at registration. | `routes/auth.js:57-58,199` |
| S14 | **Med** | `express.json({ limit: '50mb' })` unbounded-ish payloads; error handler leaks `err.message` (may expose DB/stack info) in production. | `server/index.js:44,75` |
| S15 | **Low/Med** | AuditLog only written for a few admin actions; no login/logout/role-change audit coverage, no user agent. | `routes/admin.js` |
| S16 | **Low** | `certificateGenerator.js` hardcodes instructor/director names ("Manikandan", "Mani K") and default frontend URL `https://isds-kappa.vercel.app`. | `services/certificateGenerator.js:7,177-192` |

---

## 5. Auth Issues

- JWT: access token 7d (long), stored in **localStorage** (XSS-exposed), refresh 30d. No `jti`/logout-all, no device binding.
- Firebase path (`/auth/firebase`) requires Firebase Admin creds; without them login via Google/Register fails — but email/password login bypasses Firebase entirely (works). Inconsistent story for a "Firebase-authenticated" app.
- `optionalAuth` silently swallows invalid tokens (by design).
- Frontend `ProtectedRoute` redirect map sends **teacher → `/admin/dashboard`** while the teacher layout lives at `/teacher/*`; login redirects teacher → `/teacher/dashboard`. Inconsistent → teachers may bounce between `/admin` and `/teacher`.
- `AdminLayout` is reused for teacher routes (`/teacher` wraps `AdminLayout`), and Sidebar `teacherNav` points to `/admin/*` paths. Teacher pages mostly live under `/teacher/*`. Nav dead-ends.
- No email verification enforcement (`isVerified` exists but never required); no password strength beyond 6 chars; no account lockout.
- `refresh-token` does not rotate the *access* token to a new secret epoch or invalidate old sessions on password change.

---

## 6. Database Structure

Prisma schema (`prisma/schema.prisma`, 789 lines) — PostgreSQL, no migrations yet. Enums: UserRole (student/teacher/parent/admin — **no recruiter**), AttendanceStatus, AssignmentStatus, SubmissionStatus, QuizStatus, NotificationPriority/Category, ResourceType, CourseStatus, Difficulty, AchievementType.

Models (mapped names):
- **users** — User (email unique, password?, role, class, rollNumber, departmentId, enrollmentYear, employeeId, subject, studentIds[] for parents, isVerified, isActive, firebaseUid)
- **refresh_tokens** — RefreshToken
- **user_settings** — UserSettings (theme, language, email/push notifications, timezone)
- **departments** — Department
- **courses** — Course (+instructor, department), **modules** — Module, **lessons** — Lesson, **resources** — Resource
- **enrollments** — Enrollment (unique student+course, progress, isCompleted, grade, score), **lesson_progress** — LessonProgress
- **assignments** — Assignment (rubrics Json, late-submission), **assignment_submissions** — AssignmentSubmission (unique assignment+student, marks, feedback, gradedBy)
- **attendance** — Attendance (unique student+date, courseId, markedById)
- **quizzes** — Quiz, **questions** — Question (options Json incl. isCorrect — client-side grading trust note), **quiz_results** — QuizResult, **quiz_responses** — QuizResponse
- **certificates** — Certificate (unique student+course, certificateUrl, expiresAt, metadata)
- **notifications** — Notification, **messages** — Message (threads via parentId)
- **announcements** — Announcement, **calendar_events** — CalendarEvent
- **achievements** — Achievement, **user_achievements** — UserAchievement
- **skills** — Skill, **user_skills** — UserSkill (level 1-100, xp)
- **leaderboard_entries** — LeaderboardEntry (unique user+period)
- **activity_logs** — ActivityLog (user actions), **audit_logs** — AuditLog (admin actions)
- **analytics_snapshots** — AnalyticsSnapshot
- **ai_study_plans** — AIStudyPlan, **ai_insights** — AIInsight
- **system_settings** — SystemSetting

Firestore collections (legacy): users, courses, enrollments, assignments, submissions, certificates, attendance, trophies, notes, notifications, callLogs.

Notes:
- Prisma 7.8 requires **driver adapter** (`@prisma/adapter-pg`) + `prisma+postgres://` URL, OR revert datasource to `url = env("DATABASE_URL")` with a plain `postgresql://` URL. Currently **unusable**.
- No `prisma/migrations`; `DATABASE_URL` scheme mismatch (see §3 blocker).
- Duplicated "audit" concepts: `ActivityLog` (user events) vs `AuditLog` (admin) — fine but naming overlap is confusing.

---

## 7. API Structure

Modern server (`server/index.js`) mounts under `/api`:

| Group | Path prefix | Auth | Notes |
|---|---|---|---|
| auth | `/api/auth` | public (some authed) | register/login/firebase/refresh/forgot/change-password/logout/me |
| students | `/api/students` | authenticate (+role) | dashboard, courses, progress, lessons, attendance, assignments, submit, leaderboard, achievements, skills, calendar, quiz-results, certificates, analytics, profile |
| teachers | `/api/teachers` | teacher/admin | dashboard, courses, students, analytics, gradebook, grade submission, announcements |
| parents | `/api/parents` | parent | dashboard, performance, report, ai-summary (ownership checked) |
| admin | `/api/admin` | admin | dashboard, users, departments, analytics, audit-logs, settings, announcements, database-health |
| courses | `/api/courses` | optionalAuth public / teacher/admin writes | catalog, detail, enroll, CRUD, modules, lessons, announcements |
| assignments | `/api/assignments` | auth / teacher-admin writes | per-course list, create/update/delete |
| attendance | `/api/attendance` | auth + roles | mark, by student/course, stats |
| quizzes | `/api/quizzes` | auth | list, create, take, submit, update, delete |
| certificates | `/api/certificates` | auth (all) | list, issue, verify (auth!) |
| notifications | `/api/notifications` | auth | list, read, read-all, delete |
| messages | `/api/messages` | auth | list, conversation, send |
| analytics | `/api/analytics` | admin/teacher | trends, completion, productivity, student performance, quiz stats, monthly reports |
| achievements | `/api/achievements` | auth / award by teacher-admin | list, award |
| calendar | `/api/calendar` | auth | CRUD (ownership gaps) |
| uploads | `/api/uploads` | auth | single/multiple file upload (type-based dirs) |
| ai | `/api/ai` | auth | study-plan, insights, weaknesses, prediction, dashboard-insights |
| health | `/api/health` | public | ok + timestamp |

Legacy server (`server/server.js`) additionally mounts: `/api/trophies` (Firestore), `/api/chatbot` (Anthropic), `/api/calls` (Firestore).

Response shape: inconsistent — mostly `{ error: msg }` for errors; success shapes vary per endpoint (`{user}`, `{data}`, arrays, etc.). No standardized envelope. No centralized validation (manual per-route checks). Error handler returns `err.message` (may leak internals).

---

## 8. Dependency Issues

- `npm audit --omit=dev`: **11 vulnerabilities** (4 high, 7 moderate, 0 critical).
  - **axios** (direct, high/moderate, ≤1.17.x): DoS via formDataToJSON recursion, prototype pollution, auth-subfield injection, maxBodyLength bypasses → upgrade to **≥1.18.0**.
  - **react-router / react-router-dom** (direct, high/moderate, <7.18): open redirect via backslash, route-matching DoS, RSC hydration constructor injection, CSRF bypass (v7.12–8.2) → upgrade.
  - **prisma** (moderate via `@prisma/dev`) → update.
  - **dompurify** (moderate via transitive), **form-data** (high, <4.0.6), **fast-uri** (high), **protobufjs** (moderate), **valibot** (moderate), **@hono/node-server** (moderate) — mostly transitive; resolve via dependency updates.
- Frontend pins versions like `lucide-react ^1.22.0`, `react ^19.2.6`, `react-router-dom ^7.16.0` — several majors ahead of ecosystem norms but consistent internally.
- Backend deps fine (express 4, helmet 8, jsonwebtoken 9, bcryptjs 2, multer 1.4.5-lts). `multer` on 1.x-lts is old; watch for advisories.
- Missing dep for Prisma 7 runtime: `@prisma/adapter-pg` (and `pg`) — required for driver-adapter mode currently configured.
- **jspdf / jspdf-autotable / docx / qrcode** are only in **server** package.json? Verify: `certificateGenerator.js` requires `jspdf`, `jspdf-autotable`, `docx`, `qrcode` — check they're in `server/package.json` deps (they are NOT listed in the server deps seen; this will crash at require-time). **Server deps seen:** @prisma/client, bcryptjs, cors, dotenv, express, express-rate-limit, firebase-admin, helmet, jsonwebtoken, multer, nodemailer. `jspdf`, `docx`, `qrcode` are missing → certificate generator service cannot load.

---

## 9. UI Issues

- **15 missing pages** referenced by App.jsx → build fails (see §3). Teacher/parent/admin areas largely incomplete.
- Teacher pages under `/teacher/*` use `AdminLayout` + `Sidebar` whose `teacherNav` links to `/admin/*` — navigation broken for teachers.
- `ProtectedRoute` teacher redirect → `/admin/dashboard` (wrong area).
- Many pages are "coming soon" placeholders (TeacherResources, GradeBook, ManageQuizzes, ManageAssignments, TeacherProfile, TeacherAttendance, all parent pages except dashboard, QuizList/Take placeholders, KnowledgeHub, TrophySession, StudentAnalytics).
- AIChatbot floating button on every authenticated layout — hits dead endpoint.
- Design system is strong (premium glass/gradient theme) but fragmented: some pages use `theme-*` utilities, others hardcode `bg-white/50 dark:bg-slate-900/50` (e.g., VerifyCertificate) — inconsistent dark-mode handling.
- Certificates UI (AdminCertificates, My Certificates) expects backend endpoints that don't exist (see §3).
- No responsive audit beyond sidebar; `lg:` breakpoints used but parent pages untested.

---

## 10. Recommended Fixes (ordered)

### Critical
1. **Fix Prisma 7 runtime:** pick one path — (a) restore `url = env("DATABASE_URL")` in `datasource` + plain `postgresql://` URL + `prisma-client-js` (classic, no extra deps), or (b) keep `prisma+postgres://` and install `@prisma/adapter-pg` and construct `new PrismaClient({ adapter: new PrismaPg({ connectionString }) })`. Then `prisma db push` (no migrations exist). Delete stale `server/generated/`. Confirm `server/prisma.js` uses `@prisma/client`.
2. **Create the 15 missing frontend pages** so `npm run build` passes (App.jsx is the source of truth; wire each to existing backend endpoints; non-functional ones get honest empty states, not fakes).
3. **Fix certificate integration:** extend `server/routes/certificates.js` to match `src/api/certificates.js` contract (file download via generator, admin stats/logs, revoke/restore/regenerate, share/download tracking) OR align the API client to existing endpoints. Make `/verify/:id` public (move above `authenticate`), return flat shape, add rate limiting + expiry/revocation checks. Add missing `jspdf`, `jspdf-autotable`, `docx`, `qrcode` to server deps.

### High
4. **Remove hardcoded secrets:** centralized `server/config/env.js` that throws at startup if `JWT_SECRET`/`ADMIN_SECRET_KEY` missing in production; no fallbacks. Rotate `ADMIN_SECRET_KEY`; gate admin creation off via env or a first-admin bootstrap instead of body-supplied secret.
5. **Fix CORS:** allowlist `CORS_ORIGIN` (comma-separated), no `*` with credentials.
6. **Close IDOR gaps:** ownership checks on notification read/delete, calendar update/delete, attendance-by-student (parent link / teacher-course), certificate list scoping.
7. **Harden auth:** dedicated rate limits on `/auth/login|register|forgot-password|refresh-token`; persist + one-time-use password-reset tokens; invalidate refresh tokens on password change; optional `isVerified` gating; reject self-registered teacher/parent roles via a restricted signup flow.
8. **Make AI chatbot functional or remove:** mount chatbot on the modern server behind auth with per-user rate limits + role-aware system prompt, or drop the component/route. `ANTHROPIC_API_KEY` is set in env — wire `ai.js` to real inference or keep deterministic local responses and document.
9. **Unify entrypoints:** keep `server/index.js`, retire/port `server.js` (or vice versa); single start script (`npm run server` in root) + document.

### Medium
10. **RBAC + routing consistency:** `ProtectedRoute` teacher → `/teacher/dashboard`; align Sidebar `teacherNav` to `/teacher/*`; teacher routes should use a TeacherLayout (or fix AdminLayout reuse); admin-only guard on `/admin/*` (currently allows teacher).
11. **Centralized error handling/validation:** add `server/middleware/errorHandler.js` (never leak stack in prod), a small validator (or zod) for request bodies, consistent `{ success, error }` shape.
12. **Audit coverage:** middleware to log auth events + admin mutations (user, user-agent, IP); use `AuditLog` consistently.
13. **Remove dead/legacy code:** `server/server.js` (unless kept as entry), `notify.js` (broken), Firestore-based trophies/calls/seed — replace `seed.js` with Prisma seed; drop Firestore deps if Firebase Admin unused.
14. **Upload hardening:** per-role size/quota limits, sanitize filenames, store under user-scoped dirs, signed/session checks for serving.

### Low
15. `npm audit` remediation: upgrade axios ≥1.18, react-router ≥7.18, prisma, dompurify, form-data, fast-uri, valibot, protobufjs, @hono/node-server. Re-run `npm audit` to zero.
16. Replace boilerplate `README.md` with real setup/run/deploy docs (root + server). Note the `prisma+postgres` vs `postgresql` URL decision so `.env` examples are correct.
17. De-duplicate Firebase init (`config/firebaseAdmin.js` vs `config/firestore.js`), unify `verifyFirebaseToken`.
18. Parameterize `certificateGenerator` signatories + base URL via env (`FRONTEND_URL` already exists; add INSTRUCTOR_NAME/DIRECTOR_NAME).
19. Add tests (backend route/smoke tests, frontend build CI) + GitHub Actions CI (build, lint, `prisma validate`, `npm audit` gate). Add `vercel.json` note that backend must be hosted separately (or add serverless adapter).
20. Replace all "coming soon" placeholders with real pages or remove nav entries; standardize theme utility usage (no raw `bg-white/50 dark:` in new pages).

---

## Files inspected (representative)
- Frontend: `src/App.jsx`, `main.jsx`, `index.css`, `vite.config.js`, `vercel.json`, all layouts, `components/ui/index.jsx`, `components/AIChatbot.jsx`, `Sidebar.jsx`, `ProtectedRoute.jsx`, `context/AuthContext.jsx`, `context/ThemeContext.jsx`, `api/*.js` (client, auth, certificates, chatbot), `pages/` (Login, Register, ForgotPassword, VerifyCertificate, StudentDashboard, TeacherDashboard, ParentDashboard, TeacherResources/Profile/StudentAnalytics/ManageQuizzes/ManageAssignments/GradeBook, student placeholders), `utils/constants.js`.
- Backend: `server/index.js`, `server/server.js`, `server/prisma.js`, `server/seed.js`, `server/middleware/auth.js`, all 20 `server/routes/*.js`, `server/services/{email,notify,certificateGenerator}.js`, `server/config/{firebaseAdmin,firestore}.js`.
- Config/DB: `prisma/schema.prisma`, `prisma.config.ts`, `.gitignore`, root + server `package.json`, `.env` key names (values not logged), `README.md`.

## Commands executed
- `npx prisma generate` (schema generator switched `prisma-client` → `prisma-client-js`; success: generated to `node_modules/@prisma/client`)
- `node dbcheck*.js` / `.cjs` (Prisma client construction smoke tests → confirmed `PrismaClientInitializationError`)
- `npm run build` (frontend → failed: 5+ unresolved imports, rolldown)
- `npm audit --omit=dev --json` (11 vulns; 4 high)
- PowerShell `Test-Path`, `ConvertFrom-Json` for deps/env/migrations/git state; grep scans for TODO/"coming soon"/hardcoded `process.env.X || 'fallback'` patterns.

## Failures encountered
- `new PrismaClient()` → `PrismaClientInitializationError: needs to be constructed with a non-empty, valid PrismaClientOptions` (Prisma 7.8 driver-adapter requirement + missing datasource `url` + `prisma+postgres` scheme).
- `npm run build` → 5× `[UNRESOLVED_IMPORT] Could not resolve './pages/...'` (15 files missing total).
- `node dbcheck*.js` intermittently hit ESM/CJS `type: module` resolution and PowerShell `NativeCommandError` noise — worked around with `.cjs` temp files under `%TEMP%\opencode`.
- Earlier generator attempt (`prisma-client` with CJS output) emitted TS `export type` into `.js` → syntax crash; reverted to `prisma-client-js`.

## Top 10 highest-priority issues
1. Prisma 7 runtime broken — backend cannot start/query (adapter/datasource fix required).
2. Frontend build fails — 15 missing page modules in `src/App.jsx`.
3. Hardcoded JWT + admin secrets (publicly known fallbacks) — authentication forgeable.
4. Certificate API contract mismatch (frontend calls nonexistent endpoints; verify endpoint auth-protected; generator service unwired; missing `jspdf/docx/qrcode` server deps).
5. CORS wide open (`*` + credentials) with no allowlist.
6. IDOR/missing ownership checks (notifications, calendar, attendance, certificates list).
7. Auth flow inconsistency (backend email login vs Firebase-only register/forgot; param name mismatch `adminAuthorizationPassword` vs `adminSecretKey`; teacher redirect/nav routing broken).
8. Unauthenticated chatbot endpoint with live Anthropic key access + no per-endpoint rate limits on auth routes.
9. 11 npm vulnerabilities (axios, react-router, form-data, fast-uri, etc.).
10. No DB migrations (`prisma/migrations` absent), stale `server/generated/`, legacy Firestore islands + broken `seed.js`/`notify.js`.

---

*End of Phase 1 audit. Phase 2 work not started.*
