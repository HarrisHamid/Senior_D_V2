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

**Routes** (`src/routes/index.ts`):

| Prefix | File | Key endpoints |
|---|---|---|
| `/api/auth` | `auth.routes.ts` | `POST /register`, `POST /login`, `POST /logout`, `GET /me`, `POST /forgot-password`, `POST /reset-password/:token`, `POST /verification/resend`, `POST /verification/verify` |
| `/api/courses` | `course.routes.ts` | `POST /` (coordinator), `GET /my-courses` (coordinator), `POST /join` (student), `GET /:id`, `PATCH /:id/close`, `PATCH /:id/open`, `GET /:id/stats`, `GET /:id/export` (XLSX) |
| `/api/projects` | `project.routes.ts` | `POST /`, `GET /course/:courseId`, `GET /:id`, `PATCH /:id`, `DELETE /:id`, `POST /:id/assign-group`, `PATCH /:id/unassign-group` |
| `/api/groups` | `group.routes.ts` | `POST /` (create), `PATCH /join`, `GET /course/:courseId`, `GET /interested/:projectId`, `GET /:groupId`, `DELETE /:groupId/leave`, `PATCH /:groupId/toggle-status`, `PATCH /:groupId/toggle-visibility`, `PATCH /:groupId/join-requests/:requestId`, `POST /:groupId/interested-projects`, `DELETE /:groupId/interested-projects` |
| `/api/users` | `user.routes.ts` | `GET /`, `PATCH /`, `PATCH /password` |
| `/api/uploads` | `upload.routes.ts` | `POST /:projectId` (upload), `GET /:projectId` (list), `GET /:projectId/:fileId` (download), `DELETE /:projectId/:fileId` (delete) |

**Important route ordering:** Static paths (e.g. `/course/:courseId`) must be registered before dynamic paths (e.g. `/:id`) to avoid route collision. This pattern is consistent across all route files.

- **Auth** (`src/middleware/auth.middleware.ts`): Extracts JWT from `req.cookies.token` or `Authorization: Bearer`. Fetches full user from DB, attaches as `req.user` (typed as `AuthRequest`). Never attach the password—`User.model.ts` has `select: false` on the password field.
- **Validation** (`src/middleware/validation.middleware.ts`): Wraps Zod schemas; all schemas live in `src/validation/` and validate `body`, `params`, and/or `query` together.
- **Rate limiting** (`src/middleware/rateLimiter.ts`): In-memory, no Redis. `authLimiter` (10 req / 15 min), `verificationLimiter` (5 req / 15 min), `generalLimiter` (100 req / 15 min). `resetRateLimiters()` is called in `clearTestDB()` so tests start clean.
- **Email** (`src/services/email.service.ts`): Controlled by `EMAIL_PROVIDER` env var. `"console"` (default dev) logs to stderr and appends to `/tmp/dev-emails.log`. `"disabled"` is a no-op (used in tests). `"resend"` uses the Resend API (requires `RESEND_API_KEY` and `EMAIL_FROM`). Beyond auth emails, event-driven functions notify coordinators of group interest / student joins, notify group members of assignment/unassignment, and handle join-request approval/rejection notifications.
- **Verification service** (`src/services/verification.service.ts`): Generates a random numeric code, hashes it with SHA-256, upserts a `VerificationCode` document, and sends the email. `validateVerificationCode` does a constant-time hash comparison and deletes the record on success.
- **File uploads** (`src/middleware/upload.middleware.ts`, `src/routes/upload.routes.ts`): Uses multer. Uploaded file metadata (originalName, filename, path, mimetype, size, projectId, uploadedBy) stored in `UploadedFile` model. Delete permission: uploader or the project-owning coordinator.
- **Schools/majors** (`src/constants/schools.ts`): Static list of schools and their majors. Export `ALL_MAJORS` and `MAJORS_BY_SCHOOL` for filtering; used when creating/filtering projects.
- **XLSX export** (`src/utils/xlsxBuilder.ts`): Zero-dependency XLSX builder (hand-rolled XML). Used by `GET /api/courses/:id/export` to export course assignment data.

### Backend — Data Models

**Relationships:**
- `User` → belongs to one `Course` (via `user.course`), one `Group` (via `user.groupId`)
- `Course` → has a unique `courseCode` (7-char, auto-generated), `lastGroupNumber` counter, `closed` flag, `minGroupSize`/`maxGroupSize`
- `Group` → belongs to a `Course`, `groupMembers[]` (ObjectId refs), up to 4 `interestedProjects`, one `assignedProject`, optional `groupCode` (sparse unique, for future invite links), `isOpen` status
- `Project` → belongs to a `Course`, created by a `User` (`userId`), fields: `name`, `description`, `sponsor` (string), `advisors[]` `{name, email}`, `contacts[]` `{name, email}`, `majors[]` `{major}`, `year`, `internal` (boolean), `assignedGroup`, `isOpen`
- `VerificationCode` → linked to `User`, stores hashed code with TTL for email verification
- `PasswordResetToken` → linked to `User`, stores hashed token with TTL for password reset

**Roles:** `"student"` | `"course coordinator"`. Students join courses via `courseCode` and can have a group. Course coordinators create courses and projects. `verificationNeeded` on `User` tracks whether email verification is pending.

**Auth flows:**
- *Email verification*: After register, `verificationNeeded=true`. `POST /verification/resend` sends a new code; `POST /verification/verify` checks it and sets `verificationNeeded=false`.
- *Password reset*: `POST /forgot-password` emails a reset link; `POST /reset-password/:token` validates the token and updates the password.

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

Helper fixtures live in `src/testing/helpers/` (`fixtures.ts` — shared test data, `auth.ts` — auth helpers).

### Frontend — React + Vite

**Auth state** is managed entirely in `AuthContext` (`src/contexts/AuthContext.tsx`). On mount it calls `GET /api/auth/me`. Exposes `user`, `isAuthenticated`, `isLoading`, `login`, `register`, `logout`, `updateUser`, `refreshUser`. Roles are normalized to lowercase on the client: always `"student"` or `"course coordinator"`.

**Routing** (`App.tsx`):
- `PublicOnlyRoute` — redirects authenticated users away from `/login`, `/signup`
- `ProtectedRoute` — redirects unauthenticated users to `/login`, preserving `location.state.from`
- `RoleRoute` — restricts by role; `/group` is student-only; `/course/create` and `/project/add` are coordinator-only
- `/forgot-password` and `/reset-password/:token` are accessible regardless of auth state

**Page inventory:**

| Route | Page | Who |
|---|---|---|
| `/` | `Home` | Public — landing page |
| `/login`, `/signup` | `Login`, `Signup` | Public only |
| `/forgot-password`, `/reset-password/:token` | `ForgotPassword`, `ResetPassword` | Any |
| `/dashboard` | `Dashboard` | Authenticated |
| `/course` | `Course` | Authenticated — course detail for current user's course |
| `/marketplace` | `Marketplace` | Authenticated — browse/filter projects |
| `/project/:id` | `ProjectDetail` | Authenticated |
| `/profile` | `Profile` | Authenticated |
| `/group` | `Group` | Student only |
| `/course/create` | `CreateCourse` | Coordinator only |
| `/project/add` | `CreateProject` | Coordinator only |
| `/verify-email` | `VerifyEmail` | Authenticated — email verification code entry |
| `/logout` | `LogoutScreen` | Authenticated |

**API layer** (`src/services/api.ts`): Single Axios instance with `withCredentials: true` and a response interceptor that normalizes errors to `new Error(message)`. Base URL is `VITE_API_URL` or `http://localhost:5000/api`. Each domain has its own service file (`auth.service.ts`, `course.service.ts`, `group.service.ts`, `project.service.ts`, `upload.service.ts`, `user.service.ts`).

**UI:** Tailwind CSS v4 (via `@tailwindcss/vite`), Radix UI primitives, `lucide-react` icons, `sonner` toasts, `motion` for animations. Shadcn-style component wrappers live in `src/components/ui/`. Static seed/mock data lives in `src/data/mockData.ts`.

## Environment Variables

Backend `.env` (required):
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/senior_d
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=<secret>
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7
```

Optional (all have defaults):
```
EMAIL_PROVIDER=console     # "console" | "disabled" | "resend"
EMAIL_FROM=no-reply@seniordesignmarketplace.local
RESEND_API_KEY=            # required when EMAIL_PROVIDER=resend
FRONTEND_URL=http://localhost:5173
VERIFICATION_CODE_LENGTH=6
VERIFICATION_CODE_TTL_MINUTES=10
PASSWORD_RESET_TOKEN_EXPIRES_MINUTES=60
```

Frontend: `VITE_API_URL` (optional, defaults to `http://localhost:5000/api`).
