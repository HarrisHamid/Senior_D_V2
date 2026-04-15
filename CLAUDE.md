# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Backend (`/backend`)
```bash
npm run dev          # Start dev server with ts-node-dev (hot reload)
npm run build        # Compile TypeScript to dist/
npm start            # Run compiled output
npm test             # Run all tests (Jest, in-memory MongoDB)
npm run test:watch   # Watch mode
npm run lint         # ESLint
npm run format       # Prettier (write)
npm run seed         # Seed database via ts-node src/seed.ts
```

Run a single test file:
```bash
npx jest --config jest.config.cjs src/testing/auth.test.ts --forceExit
```

### Frontend (`/frontend`)
```bash
npm run dev    # Vite dev server
npm run build  # tsc + vite build
npm run lint   # ESLint
```

## Architecture

### Backend — Express + MongoDB

`server.ts` bootstraps Express with CORS (credentials allowed), cookie-parser, and mounts all routes under `/api` behind a global rate limiter. The server skips DB connection and env validation when `NODE_ENV=test`.

**Request lifecycle:** Route → `validate(schema)` middleware (Zod) → `authenticate` middleware (JWT from cookie or `Authorization: Bearer`) → `requireRole(...roles)` → Controller

- **Routes** (`src/routes/index.ts`): `/api/auth`, `/api/courses`, `/api/users`, `/api/projects`, `/api/groups`, `/api/uploads`
- **Auth** (`src/middleware/auth.middleware.ts`): Extracts JWT from `req.cookies.token` or `Authorization: Bearer`. Fetches full user from DB, attaches as `req.user` (typed as `AuthRequest`). Never attach the password—`User.model.ts` has `select: false` on the password field.
- **Validation** (`src/middleware/validation.middleware.ts`): Wraps Zod schemas; all schemas live in `src/validation/` and validate `body`, `params`, and/or `query` together.
- **Rate limiting** (`src/middleware/rateLimiter.ts`): In-memory, no Redis. `authLimiter` (10 req / 15 min), `verificationLimiter` (5 req / 15 min), `generalLimiter` (100 req / 15 min). `resetRateLimiters()` is called in `clearTestDB()` so tests start clean.
- **Email** (`src/services/email.service.ts`): Controlled by `EMAIL_PROVIDER` env var. `"console"` (default dev) logs to stderr and appends to `/tmp/dev-emails.log`. `"disabled"` is a no-op (used in tests).
- **File uploads** (`src/middleware/upload.middleware.ts`, `src/routes/upload.routes.ts`): Uses multer. Uploaded file metadata is stored in the `UploadedFile` model.

**Data model relationships:**
- `User` → belongs to one `Course` (via `user.course`), one `Group` (via `user.groupId`)
- `Course` → has a unique `courseCode` (7-char, auto-generated), `lastGroupNumber` counter, `closed` flag
- `Group` → belongs to a `Course`, has up to 4 `interestedProjects`, one `assignedProject`
- `Project` → belongs to a `Course`, tracks `assignedGroup`, `isOpen`

**Roles:** `"student"` | `"course coordinator"`. Students join courses via `courseCode` and can have a group. Course coordinators create courses and projects. `verificationNeeded` on `User` tracks whether email verification is pending.

### Backend — Testing

Tests use `mongodb-memory-server` (real Mongoose, no mocks). Pattern for every test file:
```ts
// Must set env vars BEFORE importing app
process.env.JWT_SECRET = "test-jwt-secret-key-for-testing";
process.env.MONGO_URI = "mongodb://localhost:27017/test-placeholder";
process.env.NODE_ENV = "test";
process.env.EMAIL_PROVIDER = "disabled";

import app from "../server";
import { connectTestDB, disconnectTestDB, clearTestDB } from "./helpers/db";

beforeAll(() => connectTestDB());
afterAll(() => disconnectTestDB());
afterEach(() => clearTestDB()); // also resets rate limiters
```

Helper fixtures live in `src/testing/helpers/` (`fixtures.ts`, `auth.ts`).

### Frontend — React + Vite

**Auth state** is managed entirely in `AuthContext` (`src/contexts/AuthContext.tsx`). On mount it calls `GET /api/auth/me`. Exposes `user`, `isAuthenticated`, `isLoading`, `login`, `register`, `logout`, `updateUser`, `refreshUser`. Roles are normalized to lowercase on the client: always `"student"` or `"course coordinator"`.

**Routing** (`App.tsx`):
- `PublicOnlyRoute` — redirects authenticated users away from `/login`, `/signup`
- `ProtectedRoute` — redirects unauthenticated users to `/login`, preserving `location.state.from`
- `RoleRoute` — restricts by role; `/group` is student-only; `/course/create` and `/project/add` are coordinator-only

**API layer** (`src/services/api.ts`): Single Axios instance with `withCredentials: true` and a response interceptor that normalizes errors to `new Error(message)`. Base URL is `VITE_API_URL` or `http://localhost:5000/api`. Each domain has its own service file (`auth.service.ts`, `course.service.ts`, etc.).

**UI:** Tailwind CSS v4 (via `@tailwindcss/vite`), Radix UI primitives, `lucide-react` icons, `sonner` toasts, `motion` for animations. Shadcn-style component wrappers live in `src/components/ui/`.

## Environment Variables

Backend `.env` (required):
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/senior_d
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=<secret>
JWT_EXPIRES_IN=7d
JWT_COOKIE_EXPIRE=7
```

Optional (all have defaults):
```
EMAIL_PROVIDER=console     # "console" | "disabled"
FRONTEND_URL=http://localhost:5173
VERIFICATION_CODE_TTL_MINUTES=10
PASSWORD_RESET_TOKEN_EXPIRES_MINUTES=60
```

Frontend: `VITE_API_URL` (optional, defaults to `http://localhost:5000/api`).
