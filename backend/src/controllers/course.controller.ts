import { Response } from "express";
import { AuthRequest } from "../types";
import Course from "../models/Course.model";
import User from "../models/User.model";
import { generateUniqueCourseCode } from "../utils/codeGenerator";
import { Project } from "../models/Project.model";
import { Group } from "../models/Group.model";
import { buildXlsxBuffer } from "../utils/xlsxBuilder";

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
    const { id } = req.params;

    const course = await Course.findById(id);

    if (!course) {
      res.status(404).json({
        success: false,
        error: "Course not found",
      });
      return;
    }

    const user = req.user;
    if (!user) {
      res.status(401).json({
        success: false,
        error: "Not authenticated",
      });
      return;
    }

    const isCoordinatorOwner =
      user.role === "Course Coordinator" && course.userId === user._id;
    const isEnrolledStudent = user.role === "Student" && user.course === id;

    if (!isCoordinatorOwner && !isEnrolledStudent) {
      res.status(403).json({
        success: false,
        error: "You do not have access to this course",
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
    if (course.userId !== user._id) {
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

    // Close the course
    course.closed = true;

    await Promise.all([
      course.save(),
      Project.updateMany({ courseId: id }, { isOpen: false }),
      Group.updateMany({ courseId: id }, { isOpen: false }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        course,
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
    if (course.userId !== user._id) {
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

    // Reopen the course
    course.closed = false;

    // Derive assigned project IDs from groups (source of truth for assignments)
    const assignedGroups = await Group.find(
      { courseId: id, assignedProject: { $ne: null } },
      { assignedProject: 1 },
    );
    const assignedProjectIds = assignedGroups.map((g) => g.assignedProject);

    await Promise.all([
      course.save(),
      Project.updateMany(
        { courseId: id, _id: { $nin: assignedProjectIds } },
        { isOpen: true },
      ),
      Group.updateMany(
        { courseId: id, assignedProject: null },
        { isOpen: true },
      ),
    ]);
    res.status(200).json({
      success: true,
      data: {
        course,
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
    if (course.userId !== user._id) {
      res.status(403).json({
        success: false,
        error: "You can only view stats for your own courses",
      });
      return;
    }

    const courseId = course._id.toString();

    const [
      enrolledStudents,
      studentsInGroups,
      totalGroups,
      openGroups,
      matchedGroups,
      totalProjects,
      openProjects,
      matchedProjects,
    ] = await Promise.all([
      User.countDocuments({ course: courseId }),
      User.countDocuments({
        course: courseId,
        groupId: { $nin: [null, ""] },
      }),
      Group.countDocuments({ courseId }),
      Group.countDocuments({ courseId, isOpen: true }),
      Group.countDocuments({
        courseId,
        assignedProject: { $ne: null },
      }),
      Project.countDocuments({ courseId }),
      Project.countDocuments({ courseId, isOpen: true }),
      Project.countDocuments({
        courseId,
        assignedGroup: { $ne: null },
      }),
    ]);

    // Count students without groups
    const studentsWithoutGroups = enrolledStudents - studentsInGroups;

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
          totalStudents: enrolledStudents,
          studentsInGroups,
          studentsWithoutGroups,
          totalGroups,
          openGroups,
          matchedGroups,
          totalProjects,
          openProjects,
          matchedProjects,
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

    if (course.userId !== user._id) {
      res.status(403).json({
        success: false,
        error: "You can only export your own courses",
      });
      return;
    }

    const [projects, groups] = await Promise.all([
      Project.find({ courseId: id })
        .sort({ createdAt: 1 })
        .populate({ path: "assignedGroup", select: "groupNumber" }),
      Group.find({ courseId: id })
        .sort({ groupNumber: 1 })
        .populate({ path: "groupMembers", select: "name email" })
        .populate({ path: "assignedProject", select: "name" })
        .populate({ path: "interestedProjects", select: "name" }),
    ]);

    const overviewRows: string[][] = [
      ["Field", "Value"],
      ["Program", course.program],
      ["Course Number", course.courseNumber],
      ["Course Section", course.courseSection],
      ["Season", course.season],
      ["Year", String(course.year)],
      ["Course Code", course.courseCode],
      ["Coordinator Name", course.name],
      ["Coordinator Email", course.email],
      ["Course Closed", course.closed ? "Yes" : "No"],
      ["Minimum Group Size", String(course.minGroupSize)],
      ["Maximum Group Size", String(course.maxGroupSize)],
      ["Total Projects", String(projects.length)],
      ["Total Groups", String(groups.length)],
    ];

    const projectRows: string[][] = [
      [
        "Project ID",
        "Project Name",
        "Description",
        "Sponsor",
        "Advisors",
        "Contacts",
        "Majors",
        "Year",
        "Internal",
        "Open",
        "Assigned Group",
      ],
    ];

    for (const project of projects) {
      const assignedGroupNumber =
        project.assignedGroup && typeof project.assignedGroup === "object"
          ? (project.assignedGroup as { groupNumber?: number }).groupNumber
          : null;

      projectRows.push([
        project._id.toString(),
        project.name,
        project.description,
        project.sponsor,
        project.advisors
          .map((advisor) => `${advisor.name} <${advisor.email}>`)
          .join("; "),
        project.contacts
          .map((contact) => `${contact.name} <${contact.email}>`)
          .join("; "),
        project.majors.map((major) => major.major).join(", "),
        String(project.year),
        project.internal ? "Yes" : "No",
        project.isOpen ? "Yes" : "No",
        typeof assignedGroupNumber === "number"
          ? `Group ${assignedGroupNumber}`
          : "Unassigned",
      ]);
    }

    const groupRows: string[][] = [
      [
        "Group ID",
        "Group Number",
        "Group Code",
        "Open",
        "Members",
        "Interested Projects",
        "Assigned Project",
      ],
    ];

    for (const group of groups) {
      const groupMembers = Array.isArray(group.groupMembers)
        ? group.groupMembers
            .map((member) => {
              if (typeof member === "object" && member !== null) {
                const maybeMember = member as { name?: string; email?: string };
                if (maybeMember.name && maybeMember.email) {
                  return `${maybeMember.name} <${maybeMember.email}>`;
                }
              }
              return "";
            })
            .filter(Boolean)
            .join("; ")
        : "";

      const interestedProjectNames = Array.isArray(group.interestedProjects)
        ? group.interestedProjects
            .map((project) => {
              if (typeof project === "object" && project !== null) {
                return (project as { name?: string }).name || "";
              }
              return "";
            })
            .filter(Boolean)
            .join("; ")
        : "";

      const assignedProjectName =
        group.assignedProject && typeof group.assignedProject === "object"
          ? ((group.assignedProject as { name?: string }).name ?? "Unassigned")
          : "Unassigned";

      groupRows.push([
        group._id.toString(),
        String(group.groupNumber),
        group.groupCode || "",
        group.isOpen ? "Yes" : "No",
        groupMembers,
        interestedProjectNames,
        assignedProjectName,
      ]);
    }

    const buffer = buildXlsxBuffer([
      { name: "Course Overview", rows: overviewRows },
      { name: "Projects", rows: projectRows },
      { name: "Groups", rows: groupRows },
    ]);

    const safeProgram = course.program.replace(/[^a-zA-Z0-9-_]/g, "_");
    const fileName = `${safeProgram}_${course.courseNumber}_${course.year}_export.xlsx`;

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

    res.status(200).send(buffer);
  } catch (error) {
    console.error("Export course data error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to export course data",
    });
  }
};
