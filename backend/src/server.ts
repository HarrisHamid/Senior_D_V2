import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db";
import routes from "./routes";

// Load environment variables
dotenv.config();

const app = express();

connectDB();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// API Routes
app.use("/api", routes);

// Health check endpoint
app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Senior Design Marketplace API",
    version: "1.0.0"
  });
});

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Error Handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Server error:", err);
  res.status(500).json({
    success: false,
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}`);
});
