import { Router } from "express";
import {
  createProject,
  getProjectsByCourse,
  getProjectById,
  updateProject,
  deleteProject,
  assignGroupToProject,
  unassignGroupFromProject,
} from "../controllers/project.controller";
import { authenticate, requireRole } from "../middleware/auth.middleware";
import { validateRequest } from "../middleware/validation.middleware";
import { projectSchemas } from "../validation/project.validation";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Coordinator-only routes
router.post(
  "/",
  requireRole("Course Coordinator"),
  validateRequest(projectSchemas.create),
  createProject,
);

router.patch(
  "/:id",
  requireRole("Course Coordinator"),
  validateRequest(projectSchemas.update),
  updateProject,
);

router.delete(
  "/:id",
  requireRole("Course Coordinator"),
  validateRequest(projectSchemas.projectId),
  deleteProject,
);

router.post(
  "/:id/assign-group",
  requireRole("Course Coordinator"),
  validateRequest(projectSchemas.assignGroup),
  assignGroupToProject,
);

router.patch(
  "/:id/unassign-group",
  requireRole("Course Coordinator"),
  validateRequest(projectSchemas.assignGroup),
  unassignGroupFromProject,
);

// Shared routes (any authenticated user)
// NOTE: /course/:courseId must come before /:id to avoid route collision
router.get(
  "/course/:courseId",
  validateRequest(projectSchemas.getProjectsQuery),
  getProjectsByCourse,
);

router.get("/:id", validateRequest(projectSchemas.projectId), getProjectById);

export default router;
