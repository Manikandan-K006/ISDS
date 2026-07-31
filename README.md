# ISDS — Intelligent Student Development System

A full-stack student management platform: dashboards for **admin, teachers, students, and parents**, with course catalog, assignments, quizzes, attendance, certificates, achievements/skills, messages, notifications, an AI assistant, and audit logging.

## Stack

| Layer    | Technology |
| -------- | ---------- |
| Frontend | React 19, Vite 8, Tailwind CSS 4, React Router 7, lucide-react, recharts |
| Backend  | Node.js 24, Express (CommonJS) |
| Database | MySQL 8 via Prisma 7.8 (driver adapter `@prisma/adapter-mariadb`) |
| Security | JWT (rotating refresh tokens), helmet, strict CORS allowlist, rate limiting, RBAC + ownership checks, audit log middleware |

## Project layout

```
prisma/schema.prisma    Prisma schema (MySQL)
prisma.config.ts        Prisma CLI config (DATABASE_URL)
server/                 Express API (CommonJS)
  index.js              Entrypoint; mounts all /api routes
  config/env.js         Central env config (fails fast in production)
  middleware/           auth (JWT), audit, error
  routes/               auth, students, teachers, parents, admin, courses,
                        assignments, attendance, quizzes, certificates,
                        notifications, messages, analytics, achievements,
                        calendar, uploads, ai, chatbot
  utils/                access (ownership), json (MySQL Json-string parsing)
  services/             certificate generator, email, notifications
  seed.js               Dev seed (run from repo root)
  test/                 Node built-in test runner unit tests
src/                    React app (Vite)
scripts/dev-db.ps1      Dev MySQL lifecycle helper (Windows)
```

## Prerequisites

- Node.js **24+** (root `package.json` is ESM; `server/` is CommonJS — do not install `@prisma/client` inside `server/`)
- MySQL 8 server reachable on the port in `DATABASE_URL` (local dev default: `localhost:3307`, see `scripts/dev-db.ps1`)

## Setup

```bash
npm install                 # installs frontend + server deps (server resolves deps from root node_modules)

# 1. Configure environment
#    Root .env:        DATABASE_URL=mysql://root:<pass>@localhost:3307/isds
#    server/.env:      DATABASE_URL=...  +  ADMIN_SECRET_KEY=...  (see .env.example style below)

# 2. Prepare the database
npx prisma generate
npx prisma db push         # apply schema (dev)

# 3. (Optional) Seed demo data
node server/seed.js
```

### Environment variables (`server/.env`)

| Variable | Required | Notes |
| -------- | -------- | ----- |
| `DATABASE_URL` | yes | `mysql://user:pass@host:port/dbname` |
| `JWT_SECRET` | production | Dev fallback only; **must** be set in production |
| `ADMIN_SECRET_KEY` | production | Gate for admin registration; dev prints one at startup if unset |
| `FRONTEND_URL` | no | Default `http://localhost:5173`; added to the CORS allowlist |
| `CORS_ORIGINS` | no | Comma-separated extra origins |
| `ANTHROPIC_API_KEY` | no | Enables the AI assistant / chatbot; degraded response without it |
| `FIREBASE_PROJECT_ID`, `FIREBASE_SERVICE_ACCOUNT_BASE64` | no | Enables Firebase-token login |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | no | Email (forgot-password etc.) |

Placeholder values (`your_value_here`, `your_anthropic_api_key_here`) are treated as unset.

## Running

```bash
# Backend (from server/)
node index.js              # listens on :5000 (set PORT to change); health check: /api/health

# Frontend (from repo root)
npm run dev                # Vite dev server on :5173
```

## Scripts

| Script | Description |
| ------ | ----------- |
| `npm run dev` | Vite dev server |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint` | ESLint (flat config; 0 errors expected) |
| `npm test` | Server unit tests (Node `node:test`, no DB required) |

## Demo accounts (after `node server/seed.js`)

All passwords are `password123`.

| Role    | Email |
| ------- | ----- |
| Admin   | `admin@school.com` |
| Teacher | `verma@school.com` |
| Student | `arjun@school.com` |
| Parent  | `parent-arjun@school.com` |

## API notes

- Auth: `POST /api/auth/login` → `{ token, refreshToken, user }`. Refresh: `POST /api/auth/refresh-token`. Logout revokes via `tokenVersion`.
- All non-auth routes require `Authorization: Bearer <token>`.
- RBAC: `authorize('teacher','admin')` middleware; ownership checks (e.g. parents only see their linked students, teachers only manage their own courses) live in `server/utils/access.js`.
- MySQL `Json` columns come back as strings — use `parseJson` (`server/utils/json.js`) before reading `.options` / `.metadata` / `studentIds`.
- Uploads are MIME/extension filtered and size limited (15 MB single, 50 MB batch); served from `/uploads`.

## Security hardening (already applied)

- JWT secrets, admin secret, and CORS origins centralized in `server/config/env.js`; production fails on missing `JWT_SECRET`/`ADMIN_SECRET_KEY`.
- Strict CORS allowlist (no wildcard with credentials), helmet headers, global + auth rate limits.
- IDOR fixes: notifications, calendar, attendance, certificates, parents, messages all enforce ownership.
- Teacher-course ownership enforced on assignment/quiz create/update/delete.
- Audit log middleware records all non-GET requests and failures.
- Legacy Firestore-only routes removed; API is fully Prisma/MySQL.
