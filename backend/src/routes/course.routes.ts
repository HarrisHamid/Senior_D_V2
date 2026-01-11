import { Router } from "express";
import {
  createCourse,
  getCourseById,
  getMyCourses,
  joinCourse,
  closeCourse,
  reopenCourse,
  getCourseStats,
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
  requireRole("Course Coordinator"),
  validateRequest(courseSchemas.create),
  createCourse
);

router.get(
  "/my-courses",
  requireRole("Course Coordinator"),
  getMyCourses
);

router.patch(
  "/:id/close",
  requireRole("Course Coordinator"),
  validateRequest(courseSchemas.courseId),
  closeCourse
);

router.patch(
  "/:id/open",
  requireRole("Course Coordinator"),
  validateRequest(courseSchemas.courseId),
  reopenCourse
);

router.get(
  "/:id/stats",
  requireRole("Course Coordinator"),
  validateRequest(courseSchemas.courseId),
  getCourseStats
);

// Student routes
router.post(
  "/join",
  requireRole("Student"),
  validateRequest(courseSchemas.join),
  joinCourse
);

// Shared routes
router.get("/:id", validateRequest(courseSchemas.courseId), getCourseById);

export default router;
