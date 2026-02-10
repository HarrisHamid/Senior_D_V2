# Senior Design Marketplace

A full-stack web application for managing senior design courses, student groups, and project assignments. Built with TypeScript, React, Express, and MongoDB.

## Prerequisites

- [Node.js](https://nodejs.org/) v22+
- [MongoDB](https://www.mongodb.com/) running locally or a remote connection string
- npm

## Project Structure

```
Senior_D_V2/
├── backend/                # Express API server
│   └── src/
│       ├── config/         # Environment & DB config
│       ├── controllers/    # Route handlers
│       ├── middleware/     # Auth & validation middleware
│       ├── models/         # Mongoose schemas
│       ├── routes/         # Express route definitions
│       ├── types/          # TypeScript type definitions
│       ├── utils/          # Utility functions
│       ├── validation/     # Zod validation schemas
│       └── server.ts       # Server entry point
├── frontend/               # React + Vite application
│   └── src/
│       ├── components/     # React components
│       ├── contexts/       # React Context (Auth)
│       ├── pages/          # Page components
│       ├── services/       # API service layer
│       ├── styles/         # CSS files
│       ├── types/          # TypeScript type definitions
│       ├── App.tsx         # Root component with routes
│       └── main.tsx        # Entry point
└── .github/workflows/      # CI/CD pipeline
```

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/HarrisHamid/Senior_D_V2.git
cd Senior_D_V2
```

### 2. Set up the backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/senior_d
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# JWT Configuration
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d
JWT_COOKIE_EXPIRE=7
```

> **Required:** `JWT_SECRET` and `MONGO_URI` must be set. All other variables have defaults.

Start the backend dev server:

```bash
npm run dev
```

The API will be available at `http://localhost:5000`. Health check at `GET http://localhost:5000/`.

### 3. Set up the frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`.

## Available Scripts

### Backend (`/backend`)

| Script       | Command                | Description                                     |
| ------------ | ---------------------- | ----------------------------------------------- |
| Dev server   | `npm run dev`          | Runs with ts-node-dev (auto-restart on changes) |
| Build        | `npm run build`        | Compiles TypeScript to `dist/`                  |
| Start        | `npm start`            | Runs compiled server from `dist/server.js`      |
| Lint         | `npm run lint`         | ESLint checks on `src/`                         |
| Format       | `npm run format`       | Prettier format (write)                         |
| Format check | `npm run format:check` | Prettier check (no write)                       |
| Test         | `npm test`             | Run test suite                                  |

### Frontend (`/frontend`)

| Script     | Command           | Description                              |
| ---------- | ----------------- | ---------------------------------------- |
| Dev server | `npm run dev`     | Starts Vite dev server                   |
| Build      | `npm run build`   | TypeScript check + Vite production build |
| Preview    | `npm run preview` | Preview production build locally         |
| Lint       | `npm run lint`    | ESLint checks                            |
