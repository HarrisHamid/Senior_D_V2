import { Router } from "express";
import {
  register,
  login,
  logout,
  getCurrentUser,
} from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// Public routes
router.post("/register", register);
router.post("/login", login); // requires authentication
router.post("/logout", logout);

// Protected routes (require authentication)
router.get("/me", authenticate, getCurrentUser);

export default router;
