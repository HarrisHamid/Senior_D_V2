import { Router } from "express";
import {
  register,
  login,
  logout,
  getCurrentUser,
  resendVerificationCode,
  verifyEmailCode,
} from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authLimiter, verificationLimiter } from "../middleware/rateLimiter";

const router = Router();

// Public routes
router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login); // requires authentication
router.post("/logout", logout);

// Protected routes (require authentication)
router.get("/me", authenticate, getCurrentUser);
router.post(
  "/verification/resend",
  authenticate,
  verificationLimiter,
  resendVerificationCode,
);
router.post("/verification/verify", authenticate, verifyEmailCode);

export default router;
