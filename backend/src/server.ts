import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db";
import routes from "./routes";
import { env, validateEnv } from "./config/env";
import { generalLimiter } from "./middleware/rateLimiter";

const app = express();

// Middleware
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// API Routes
app.use("/api", generalLimiter, routes);

// Health check endpoint
app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Senior Design Marketplace API",
    version: "1.0.0",
  });
});

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Error Handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Server error:", err);
  res.status(500).json({
    success: false,
    error: "Internal server error",
    message: env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Only start the server when not in test mode
if (process.env.NODE_ENV !== "test") {
  validateEnv();
  connectDB();

  const PORT = parseInt(env.PORT, 10);
  app.listen(PORT, () => {
    console.log(`Server running in ${env.NODE_ENV} mode on port ${PORT}`);
    console.log(`API available at http://localhost:${PORT}`);
  });
}

export default app;
