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
import { validateRequest } from "../middleware/validation.middleware";
import {
  registerSchema,
  loginSchema,
  verifyCodeSchema,
} from "../validation/user.validation";

const router = Router();

// Public routes
router.post(
  "/register",
  authLimiter,
  validateRequest(registerSchema),
  register,
);
router.post("/login", authLimiter, validateRequest(loginSchema), login);
router.post("/logout", logout);

// Protected routes (require authentication)
router.get("/me", authenticate, getCurrentUser);
router.post(
  "/verification/resend",
  authenticate,
  verificationLimiter,
  resendVerificationCode,
);
router.post(
  "/verification/verify",
  authenticate,
  verificationLimiter,
  validateRequest(verifyCodeSchema),
  verifyEmailCode,
);

export default router;
