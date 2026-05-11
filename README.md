# Senior Design Marketplace

A full-stack web application for managing senior design project assignments and group formation. Built with MERN techstack.

## Features

- **Project marketplace** — browse, search, and filter senior design projects by school, major, sponsor, and status
- **Group management** — create or join groups, manage membership, toggle open/closed and public/private status
- **Interest system** — student groups express interest in up to 4 projects; coordinators assign groups to projects
- **Email verification** — numeric code sent on registration via Resend

## Roles

| Role                   | How created                 | Capabilities                                                            |
| ---------------------- | --------------------------- | ----------------------------------------------------------------------- |
| **Student**            | Self-register via `/signup` | Join a course, create/join groups, browse marketplace, express interest |
| **Course Coordinator** | Created directly in DB      | Create courses & projects, manage assignments, view stats, export       |

## Prerequisites

- [Node.js](https://nodejs.org/) v22+
- [MongoDB](https://www.mongodb.com/) running locally or a remote connection string
- npm

## Project Structure

```
Senior_D_V2/
├── backend/                # Express API server
│   ├── Dockerfile
│   └── src/
│       ├── config/         # Environment & DB config
│       ├── controllers/    # Route handlers
│       ├── middleware/     # Auth, validation, rate limiting, uploads
│       ├── models/         # Mongoose schemas
│       ├── routes/         # Express route definitions
│       ├── services/       # Email & verification services
│       ├── testing/        # Jest test suite & helpers
│       ├── types/          # TypeScript type definitions
│       ├── utils/          # Utility functions (XLSX builder, etc.)
│       ├── validation/     # Zod validation schemas
│       ├── seed.ts         # Database seeder
│       └── server.ts       # Server entry point
├── frontend/               # React + Vite application
│   ├── Dockerfile
│   └── src/
│       ├── components/     # Shared React components
│       ├── contexts/       # Auth context
│       ├── pages/          # Page components
│       ├── services/       # Axios API service layer
│       ├── styles/         # CSS files
│       ├── types/          # TypeScript type definitions
│       ├── App.tsx         # Root component & route definitions
│       └── main.tsx        # Entry point
├── docker-compose.yml      # Full-stack container setup
└── .github/workflows/      # CI pipeline (lint, build, test)
```

## Available Scripts

### Backend (`/backend`)

| Script       | Command                | Description                                     |
| ------------ | ---------------------- | ----------------------------------------------- |
| Dev server   | `npm run dev`          | Runs with ts-node-dev (auto-restart on changes) |
| Build        | `npm run build`        | Compiles TypeScript to `dist/`                  |
| Start        | `npm start`            | Runs compiled server from `dist/server.js`      |
| Seed         | `npm run seed`         | Seeds the database via `src/seed.ts`            |
| Test         | `npm test`             | Runs full Jest test suite                       |
| Test (watch) | `npm run test:watch`   | Jest in watch mode                              |
| Lint         | `npm run lint`         | ESLint checks on `src/`                         |
| Format       | `npm run format`       | Prettier format (write)                         |
| Format check | `npm run format:check` | Prettier check (no write — used in CI)          |

### Frontend (`/frontend`)

| Script     | Command           | Description                              |
| ---------- | ----------------- | ---------------------------------------- |
| Dev server | `npm run dev`     | Starts Vite dev server                   |
| Build      | `npm run build`   | TypeScript check + Vite production build |
| Preview    | `npm run preview` | Preview production build locally         |
| Lint       | `npm run lint`    | ESLint checks                            |

## Docker

A `docker-compose.yml` is included that runs MongoDB, the backend API, and the frontend (served via Nginx) as a single stack.

## CI

GitHub Actions runs on every push and pull request to `main`/`develop`:

- **Backend:** Prettier check → ESLint → TypeScript build → Jest tests
- **Frontend:** ESLint → Vite build (with `VITE_API_URL` set)
