import { Router } from "express";
import {
  createProject,
  getAllProjects,
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
  requireRole("course coordinator"),
  validateRequest(projectSchemas.create),
  createProject,
);

router.patch(
  "/:id",
  requireRole("course coordinator"),
  validateRequest(projectSchemas.update),
  updateProject,
);

router.delete(
  "/:id",
  requireRole("course coordinator"),
  validateRequest(projectSchemas.projectId),
  deleteProject,
);

router.post(
  "/:id/assign-group",
  requireRole("course coordinator"),
  validateRequest(projectSchemas.assignGroup),
  assignGroupToProject,
);

router.patch(
  "/:id/unassign-group",
  requireRole("course coordinator"),
  validateRequest(projectSchemas.assignGroup),
  unassignGroupFromProject,
);

// Shared routes (any authenticated user)
// NOTE: static paths must come before /:id to avoid route collision
router.get(
  "/",
  validateRequest(projectSchemas.getAllProjectsQuery),
  getAllProjects,
);

router.get(
  "/course/:courseId",
  validateRequest(projectSchemas.getProjectsQuery),
  getProjectsByCourse,
);

router.get("/:id", validateRequest(projectSchemas.projectId), getProjectById);

export default router;
