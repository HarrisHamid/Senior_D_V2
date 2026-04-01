import { Router } from "express";
import {
  createCourse,
  getCourseById,
  getMyCourses,
  joinCourse,
  closeCourse,
  reopenCourse,
  getCourseStats,
  exportCourseData,
} from "../controllers/course.controller";
import { authenticate, requireRole } from "../middleware/auth.middleware";
import { validateRequest } from "../middleware/validation.middleware";
import { courseSchemas } from "../validation/course.validation";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Coordinator routes
router.post(
  "/",
  requireRole("course coordinator"),
  validateRequest(courseSchemas.create),
  createCourse,
);

router.get("/my-courses", requireRole("course coordinator"), getMyCourses);

router.patch(
  "/:id/close",
  requireRole("course coordinator"),
  validateRequest(courseSchemas.courseId),
  closeCourse,
);

router.patch(
  "/:id/open",
  requireRole("course coordinator"),
  validateRequest(courseSchemas.courseId),
  reopenCourse,
);

router.get(
  "/:id/stats",
  requireRole("course coordinator"),
  validateRequest(courseSchemas.courseId),
  getCourseStats,
);

router.get(
  "/:id/export",
  requireRole("course coordinator"),
  validateRequest(courseSchemas.courseId),
  exportCourseData,
);

// Student routes
router.post(
  "/join",
  requireRole("student"),
  validateRequest(courseSchemas.join),
  joinCourse,
);

// Shared routes
router.get("/:id", validateRequest(courseSchemas.courseId), getCourseById);

export default router;
