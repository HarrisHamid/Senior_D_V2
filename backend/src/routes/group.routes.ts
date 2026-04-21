import { Router } from "express";
import {
  createNewGroup,
  joinGroup,
  leaveGroup,
  removeMember,
  getGroupById,
  getAllGroupsByCourse,
  toggleStatus,
  toggleVisibility,
  respondToJoinRequest,
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
  requireRole("student"),
  validateRequest(groupSchemas.create),
  createNewGroup,
);

router.patch(
  "/join",
  requireRole("student"),
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
  requireRole("student"),
  validateRequest(groupSchemas.groupId),
  leaveGroup,
);

router.patch(
  "/:groupId/toggle-status",
  requireRole("student"),
  validateRequest(groupSchemas.groupId),
  toggleStatus,
);

router.patch(
  "/:groupId/toggle-visibility",
  requireRole("student"),
  validateRequest(groupSchemas.groupId),
  toggleVisibility,
);

router.patch(
  "/:groupId/join-requests/:requestId",
  requireRole("student"),
  validateRequest(groupSchemas.respondJoinRequest),
  respondToJoinRequest,
);

router.post(
  "/:groupId/interested-projects",
  requireRole("student"),
  validateRequest(groupSchemas.interestedProject),
  addInterestedProject,
);

router.delete(
  "/:groupId/interested-projects",
  requireRole("student"),
  validateRequest(groupSchemas.interestedProject),
  removeInterestedProject,
);

router.delete(
  "/:groupId/members/:memberId",
  requireRole("student"),
  validateRequest(groupSchemas.removeMember),
  removeMember,
);

export default router;
