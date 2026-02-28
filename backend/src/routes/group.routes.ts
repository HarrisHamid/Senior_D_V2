import { Router } from "express";
import {
  createNewGroup,
  joinGroup,
  leaveGroup,
  getGroupById,
  getAllGroupsByCourse,
  toggleStatus,
  addInterestedProject,
  removeInterestedProject,
  getAllInterestedGroups,
} from "../controllers/group.controller";
import { authenticate, requireRole } from "../middleware/auth.middleware";
import { validateRequest } from "../middleware/validation.middleware";
import { groupSchemas } from "../validation/group.validation";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Student-only routes
router.post(
  "/",
  requireRole("Student"),
  validateRequest(groupSchemas.create),
  createNewGroup,
);

router.patch(
  "/join",
  requireRole("Student"),
  validateRequest(groupSchemas.join),
  joinGroup,
);

// Shared routes (any authenticated user)
// NOTE: static paths before /:groupId to avoid route collision
router.get(
  "/course/:courseId",
  validateRequest(groupSchemas.courseId),
  getAllGroupsByCourse,
);

router.get(
  "/interested/:projectId",
  validateRequest(groupSchemas.projectId),
  getAllInterestedGroups,
);

router.get("/:groupId", validateRequest(groupSchemas.groupId), getGroupById);

// Student-only routes with :groupId param
router.delete(
  "/:groupId/leave",
  requireRole("Student"),
  validateRequest(groupSchemas.groupId),
  leaveGroup,
);

router.patch(
  "/:groupId/toggle-status",
  requireRole("Student"),
  validateRequest(groupSchemas.groupId),
  toggleStatus,
);

router.post(
  "/:groupId/interested-projects",
  requireRole("Student"),
  validateRequest(groupSchemas.interestedProject),
  addInterestedProject,
);

router.delete(
  "/:groupId/interested-projects",
  requireRole("Student"),
  validateRequest(groupSchemas.interestedProject),
  removeInterestedProject,
);

export default router;
