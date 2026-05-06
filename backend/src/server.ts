import express, { Request, Response, NextFunction } from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import compression from "compression";
import morgan from "morgan";
import connectDB from "./config/db";
import routes from "./routes";
import { env, validateEnv } from "./config/env";
import { generalLimiter } from "./middleware/rateLimiter";
import { pruneOrphanedFileRecords } from "./utils/pruneOrphanedFiles";

const app = express();

app.set("trust proxy", 1);

// Security
app.use(helmet());

// Comma-separated origin allowlist. Exact-match only.
const allowedOrigins = env.CORS_ORIGIN.split(",")
  .map((o) => o.trim())
  .filter(Boolean);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // same-origin / curl
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
  }),
);

// Body + cookies
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());

// Response compression
app.use(compression());

// HTTP access logs (skip noisy output during tests)
if (env.NODE_ENV !== "test") {
  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
}

// API routes (rate-limited at the namespace root)
app.use("/api", generalLimiter, routes);

// Health check
app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Senior Design Marketplace API",
    version: "1.0.0",
  });
});

// Liveness probe for uptime monitors / orchestrators
app.get("/healthz", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

// 404
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (env.NODE_ENV !== "test") {
    console.error("Server error:", err);
  }
  res.status(500).json({
    success: false,
    error: "Internal server error",
    message: env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Only start the server when not in test mode
if (process.env.NODE_ENV !== "test") {
  validateEnv();
  connectDB().then(() => pruneOrphanedFileRecords());

  const PORT = parseInt(env.PORT, 10);
  app.listen(PORT, () => {
    console.log(`Server running in ${env.NODE_ENV} mode on port ${PORT}`);
    console.log(`API available at http://localhost:${PORT}`);
  });
}

export default app;
