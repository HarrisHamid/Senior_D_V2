import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { validateRequest } from "../middleware/validation.middleware";
import {
  getProfile,
  updateProfile,
  changePassword,
} from "../controllers/user.controller";
import { userSchemas } from "../validation/user.validation";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Profile routes
router.get("/", getProfile);
router.patch("/", validateRequest(userSchemas.updateProfile), updateProfile);
router.patch(
  "/password",
  validateRequest(userSchemas.changePassword),
  changePassword,
);

export default router;
