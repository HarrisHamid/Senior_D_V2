import { Response } from "express";
import { AuthRequest } from "../types";
import * as courseService from "../services/course.service";
import { CourseServiceError } from "../services/course.service";

const handleServiceError = (
  error: unknown,
  res: Response,
  fallbackMessage: string,
): void => {
  if (error instanceof CourseServiceError) {
    res.status(error.statusCode).json({ success: false, error: error.message });
  } else {
    console.error(fallbackMessage, error);
    res.status(500).json({ success: false, error: fallbackMessage });
  }
};

/**
 * Create a new course (Course Coordinator only)
 * POST /api/courses
 */
export const createCourse = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, error: "Not authenticated" });
      return;
    }

    const course = await courseService.createCourse(
      user._id,
      user.name,
      user.email,
      req.body,
    );

    res.status(201).json({
      success: true,
      data: { course },
      message: "Course created successfully",
    });
  } catch (error) {
    handleServiceError(error, res, "Failed to create course");
  }
};

/**
 * Get course by ID
 * GET /api/courses/:id
 */
export const getCourseById = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, error: "Not authenticated" });
      return;
    }

    const course = await courseService.getCourseById(
      req.params.id,
      user._id,
      user.role,
      user.course,
    );

    res.status(200).json({ success: true, data: { course } });
  } catch (error) {
    handleServiceError(error, res, "Failed to retrieve course");
  }
};

/**
 * Get all courses created by the coordinator
 * GET /api/courses/my-courses
 */
export const getMyCourses = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, error: "Not authenticated" });
      return;
    }

    const { courses, count } = await courseService.getMyCourses(user._id);

    res.status(200).json({ success: true, data: { courses, count } });
  } catch (error) {
    handleServiceError(error, res, "Failed to retrieve courses");
  }
};

/**
 * Join a course (Student only)
 * POST /api/courses/join
 */
export const joinCourse = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, error: "Not authenticated" });
      return;
    }

    const course = await courseService.joinCourse(
      user._id,
      !!user.course,
      req.body.courseCode,
    );

    res.status(200).json({
      success: true,
      data: { course },
      message: "Successfully joined course",
    });
  } catch (error) {
    handleServiceError(error, res, "Failed to join course");
  }
};

/**
 * Close a course (Course Coordinator only)
 * PATCH /api/courses/:id/close
 */
export const closeCourse = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, error: "Not authenticated" });
      return;
    }

    const course = await courseService.closeCourse(req.params.id, user._id);

    res.status(200).json({
      success: true,
      data: { course },
      message: "Course closed successfully",
    });
  } catch (error) {
    handleServiceError(error, res, "Failed to close course");
  }
};

/**
 * Reopen a course (Course Coordinator only)
 * PATCH /api/courses/:id/open
 */
export const reopenCourse = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, error: "Not authenticated" });
      return;
    }

    const course = await courseService.reopenCourse(req.params.id, user._id);

    res.status(200).json({
      success: true,
      data: { course },
      message: "Course reopened successfully",
    });
  } catch (error) {
    handleServiceError(error, res, "Failed to reopen course");
  }
};

/**
 * Get course statistics (Course Coordinator only)
 * GET /api/courses/:id/stats
 */
export const getCourseStats = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, error: "Not authenticated" });
      return;
    }

    const statsData = await courseService.getCourseStats(
      req.params.id,
      user._id,
    );

    res.status(200).json({ success: true, data: statsData });
  } catch (error) {
    handleServiceError(error, res, "Failed to retrieve course statistics");
  }
};

/**
 * Export course data to Excel (Course Coordinator only)
 * GET /api/courses/:id/export
 */
export const exportCourseData = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, error: "Not authenticated" });
      return;
    }

    const { buffer, fileName } = await courseService.exportCourseData(
      req.params.id,
      user._id,
    );

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${fileName}"`,
    );

    res.status(200).send(buffer);
  } catch (error) {
    handleServiceError(error, res, "Failed to export course data");
  }
};
