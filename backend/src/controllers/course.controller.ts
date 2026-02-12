import { Response } from "express";
import mongoose from "mongoose";
import { AuthRequest } from "../types";
import Course from "../models/Course.model";
import User from "../models/User.model";
import { Group } from "../models/Group.model";
import { Project } from "../models/Project.model";
import { generateUniqueCourseCode } from "../utils/codeGenerator";

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
      res.status(401).json({
        success: false,
        error: "Not authenticated",
      });
      return;
    }

    const {
      program,
      courseNumber,
      courseSection,
      season,
      year,
      minGroupSize,
      maxGroupSize,
    } = req.body;

    // Generate unique course code
    const courseCode = await generateUniqueCourseCode();

    // Create course
    const course = await Course.create({
      userId: user._id,
      name: user.name,
      email: user.email,
      program,
      courseNumber,
      courseSection,
      season,
      year,
      minGroupSize,
      maxGroupSize,
      courseCode,
      lastGroupNumber: 0,
      closed: false,
    });

    res.status(201).json({
      success: true,
      data: {
        course,
      },
      message: "Course created successfully",
    });
  } catch (error) {
    console.error("Create course error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create course",
    });
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
      res.status(401).json({
        success: false,
        error: "Not authenticated",
      });
      return;
    }

    const { id } = req.params;

    const course = await Course.findById(id);

    if (!course) {
      res.status(404).json({
        success: false,
        error: "Course not found",
      });
      return;
    }

    const isCoordinatorOwner =
      user.role === "Course Coordinator" && String(course.userId) === user._id;

    let isEnrolledStudent = false;
    if (user.role === "Student") {
      const dbUser = await User.findById(user._id).select("course");
      isEnrolledStudent = dbUser?.course === id;
    }

    if (!isCoordinatorOwner && !isEnrolledStudent) {
      res.status(403).json({
        success: false,
        error: "You are not authorized to view this course",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        course,
      },
    });
  } catch (error) {
    console.error("Get course error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve course",
    });
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
      res.status(401).json({
        success: false,
        error: "Not authenticated",
      });
      return;
    }

    const courses = await Course.find({ userId: user._id }).sort({
      year: -1,
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      data: {
        courses,
        count: courses.length,
      },
    });
  } catch (error) {
    console.error("Get my courses error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve courses",
    });
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
      res.status(401).json({
        success: false,
        error: "Not authenticated",
      });
      return;
    }

    const { courseCode } = req.body;

    // Check if student is already in a course
    if (user.course) {
      res.status(400).json({
        success: false,
        error: "You are already enrolled in a course",
      });
      return;
    }

    // Find course by code
    const course = await Course.findOne({
      courseCode: courseCode.toUpperCase(),
    });

    if (!course) {
      res.status(404).json({
        success: false,
        error: "Invalid course code",
      });
      return;
    }

    // Check if course is closed
    if (course.closed) {
      res.status(400).json({
        success: false,
        error: "This course is closed for enrollment",
      });
      return;
    }

    // Update user's course
    await User.findByIdAndUpdate(user._id, {
      course: course._id.toString(),
    });

    res.status(200).json({
      success: true,
      data: {
        course,
      },
      message: "Successfully joined course",
    });
  } catch (error) {
    console.error("Join course error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to join course",
    });
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
      res.status(401).json({
        success: false,
        error: "Not authenticated",
      });
      return;
    }

    const { id } = req.params;

    // Find course
    const course = await Course.findById(id);

    if (!course) {
      res.status(404).json({
        success: false,
        error: "Course not found",
      });
      return;
    }

    // Verify ownership
    if (String(course.userId) !== user._id) {
      res.status(403).json({
        success: false,
        error: "You can only close your own courses",
      });
      return;
    }

    // Check if already closed
    if (course.closed) {
      res.status(400).json({
        success: false,
        error: "Course is already closed",
      });
      return;
    }

    // Close course and all related projects/groups atomically
    const session = await mongoose.startSession();

    let updatedCourse = null;
    let updatedProjects = 0;
    let updatedGroups = 0;

    await session.withTransaction(async () => {
      updatedCourse = await Course.findByIdAndUpdate(
        id,
        { closed: true },
        { new: true, session },
      );

      const projectsResult = await Project.updateMany(
        { courseId: id },
        { isOpen: false },
        { session },
      );

      const groupsResult = await Group.updateMany(
        { courseId: id },
        { isOpen: false },
        { session },
      );

      updatedProjects = projectsResult.modifiedCount;
      updatedGroups = groupsResult.modifiedCount;
    });

    session.endSession();

    res.status(200).json({
      success: true,
      data: {
        course: updatedCourse,
        updatedProjects,
        updatedGroups,
      },
      message: "Course closed successfully",
    });
  } catch (error) {
    console.error("Close course error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to close course",
    });
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
      res.status(401).json({
        success: false,
        error: "Not authenticated",
      });
      return;
    }

    const { id } = req.params;

    // Find course
    const course = await Course.findById(id);

    if (!course) {
      res.status(404).json({
        success: false,
        error: "Course not found",
      });
      return;
    }

    // Verify ownership
    if (String(course.userId) !== user._id) {
      res.status(403).json({
        success: false,
        error: "You can only reopen your own courses",
      });
      return;
    }

    // Check if already open
    if (!course.closed) {
      res.status(400).json({
        success: false,
        error: "Course is already open",
      });
      return;
    }

    // Reopen the course and only reopen unassigned projects/groups atomically
    const session = await mongoose.startSession();

    let updatedCourse = null;
    let reopenedProjects = 0;
    let reopenedGroups = 0;

    await session.withTransaction(async () => {
      updatedCourse = await Course.findByIdAndUpdate(
        id,
        { closed: false },
        { new: true, session },
      );

      const projectsResult = await Project.updateMany(
        { courseId: id, assignedGroup: null },
        { isOpen: true },
        { session },
      );

      const groupsResult = await Group.updateMany(
        { courseId: id, assignedProject: null },
        { isOpen: true },
        { session },
      );

      reopenedProjects = projectsResult.modifiedCount;
      reopenedGroups = groupsResult.modifiedCount;
    });

    session.endSession();

    res.status(200).json({
      success: true,
      data: {
        course: updatedCourse,
        reopenedProjects,
        reopenedGroups,
      },
      message: "Course reopened successfully",
    });
  } catch (error) {
    console.error("Reopen course error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to reopen course",
    });
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
      res.status(401).json({
        success: false,
        error: "Not authenticated",
      });
      return;
    }

    const { id } = req.params;

    // Find course
    const course = await Course.findById(id);

    if (!course) {
      res.status(404).json({
        success: false,
        error: "Course not found",
      });
      return;
    }

    // Verify ownership
    if (String(course.userId) !== user._id) {
      res.status(403).json({
        success: false,
        error: "You can only view stats for your own courses",
      });
      return;
    }

    const courseId = course._id.toString();

    const [
      totalStudents,
      studentsInGroups,
      totalGroups,
      openGroups,
      matchedGroups,
      totalProjects,
      openProjects,
      matchedProjects,
    ] = await Promise.all([
      User.countDocuments({ course: courseId }),
      User.countDocuments({ course: courseId, groupId: { $ne: null } }),
      Group.countDocuments({ courseId }),
      Group.countDocuments({ courseId, isOpen: true }),
      Group.countDocuments({ courseId, assignedProject: { $ne: null } }),
      Project.countDocuments({ courseId }),
      Project.countDocuments({ courseId, isOpen: true }),
      Project.countDocuments({ courseId, assignedGroup: { $ne: null } }),
    ]);

    const studentsWithoutGroups = totalStudents - studentsInGroups;
    const closedGroups = totalGroups - openGroups;
    const closedProjects = totalProjects - openProjects;

    res.status(200).json({
      success: true,
      data: {
        course: {
          _id: course._id,
          program: course.program,
          courseNumber: course.courseNumber,
          courseSection: course.courseSection,
          season: course.season,
          year: course.year,
          closed: course.closed,
        },
        stats: {
          totalStudents,
          studentsInGroups,
          studentsWithoutGroups,
          totalGroups,
          openGroups,
          closedGroups,
          matchedGroups,
          unmatchedGroups: totalGroups - matchedGroups,
          totalProjects,
          openProjects,
          closedProjects,
          matchedProjects,
          unmatchedProjects: totalProjects - matchedProjects,
          totalMatches: Math.min(matchedProjects, matchedGroups),
          minGroupSize: course.minGroupSize,
          maxGroupSize: course.maxGroupSize,
        },
      },
    });
  } catch (error) {
    console.error("Get course stats error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve course statistics",
    });
  }
};
