import Course, { ICourse } from "../models/Course.model";
import User from "../models/User.model";
import { Project } from "../models/Project.model";
import { Group } from "../models/Group.model";
import { generateUniqueCourseCode } from "../utils/codeGenerator";
import { buildXlsxBuffer } from "../utils/xlsxBuilder";

export class CourseServiceError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "CourseServiceError";
  }
}

export interface CreateCourseInput {
  program: string;
  courseNumber: string;
  courseSection: string;
  season: string;
  year: number;
  minGroupSize: number;
  maxGroupSize: number;
}

export interface CourseStatsData {
  course: {
    _id: unknown;
    program: string;
    courseNumber: string;
    courseSection: string;
    season: string;
    year: number;
    closed: boolean;
  };
  stats: {
    totalStudents: number;
    studentsInGroups: number;
    studentsWithoutGroups: number;
    totalGroups: number;
    openGroups: number;
    matchedGroups: number;
    totalProjects: number;
    openProjects: number;
    matchedProjects: number;
    minGroupSize: number;
    maxGroupSize: number;
  };
}

export interface ExportData {
  buffer: Buffer;
  fileName: string;
}

export const createCourse = async (
  userId: string,
  name: string,
  email: string,
  data: CreateCourseInput,
): Promise<ICourse> => {
  const courseCode = await generateUniqueCourseCode();

  const course = await Course.create({
    userId,
    name,
    email,
    ...data,
    courseCode,
    lastGroupNumber: 0,
    closed: false,
  });

  return course;
};

export const getMyCourses = async (
  userId: string,
): Promise<{ courses: ICourse[]; count: number }> => {
  const courses = await Course.find({ userId }).sort({
    year: -1,
    createdAt: -1,
  });
  return { courses, count: courses.length };
};

export const getCourseById = async (
  id: string,
  userId: string,
  userRole: string,
  userCourseId?: string,
): Promise<ICourse> => {
  const course = await Course.findById(id);

  if (!course) {
    throw new CourseServiceError(404, "Course not found");
  }

  const isCoordinatorOwner =
    userRole === "Course Coordinator" && course.userId === userId;
  const isEnrolledStudent = userRole === "Student" && userCourseId === id;

  if (!isCoordinatorOwner && !isEnrolledStudent) {
    throw new CourseServiceError(403, "You do not have access to this course");
  }

  return course;
};

export const joinCourse = async (
  userId: string,
  alreadyEnrolled: boolean,
  courseCode: string,
): Promise<ICourse> => {
  if (alreadyEnrolled) {
    throw new CourseServiceError(400, "You are already enrolled in a course");
  }

  const course = await Course.findOne({ courseCode: courseCode.toUpperCase() });

  if (!course) {
    throw new CourseServiceError(404, "Invalid course code");
  }

  if (course.closed) {
    throw new CourseServiceError(400, "This course is closed for enrollment");
  }

  await User.findByIdAndUpdate(userId, { course: course._id.toString() });

  return course;
};

export const closeCourse = async (
  id: string,
  userId: string,
): Promise<ICourse> => {
  const course = await Course.findById(id);

  if (!course) {
    throw new CourseServiceError(404, "Course not found");
  }

  if (course.userId !== userId) {
    throw new CourseServiceError(403, "You can only close your own courses");
  }

  if (course.closed) {
    throw new CourseServiceError(400, "Course is already closed");
  }

  course.closed = true;

  await Promise.all([
    course.save(),
    Project.updateMany({ courseId: id }, { isOpen: false }),
    Group.updateMany({ courseId: id }, { isOpen: false }),
  ]);

  return course;
};

export const reopenCourse = async (
  id: string,
  userId: string,
): Promise<ICourse> => {
  const course = await Course.findById(id);

  if (!course) {
    throw new CourseServiceError(404, "Course not found");
  }

  if (course.userId !== userId) {
    throw new CourseServiceError(403, "You can only reopen your own courses");
  }

  if (!course.closed) {
    throw new CourseServiceError(400, "Course is already open");
  }

  course.closed = false;

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
    Group.updateMany({ courseId: id, assignedProject: null }, { isOpen: true }),
  ]);

  return course;
};

export const getCourseStats = async (
  id: string,
  userId: string,
): Promise<CourseStatsData> => {
  const course = await Course.findById(id);

  if (!course) {
    throw new CourseServiceError(404, "Course not found");
  }

  if (course.userId !== userId) {
    throw new CourseServiceError(
      403,
      "You can only view stats for your own courses",
    );
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
    User.countDocuments({ course: courseId, groupId: { $nin: [null, ""] } }),
    Group.countDocuments({ courseId }),
    Group.countDocuments({ courseId, isOpen: true }),
    Group.countDocuments({ courseId, assignedProject: { $ne: null } }),
    Project.countDocuments({ courseId }),
    Project.countDocuments({ courseId, isOpen: true }),
    Project.countDocuments({ courseId, assignedGroup: { $ne: null } }),
  ]);

  return {
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
      studentsWithoutGroups: enrolledStudents - studentsInGroups,
      totalGroups,
      openGroups,
      matchedGroups,
      totalProjects,
      openProjects,
      matchedProjects,
      minGroupSize: course.minGroupSize,
      maxGroupSize: course.maxGroupSize,
    },
  };
};

export const exportCourseData = async (
  id: string,
  userId: string,
): Promise<ExportData> => {
  const course = await Course.findById(id);

  if (!course) {
    throw new CourseServiceError(404, "Course not found");
  }

  if (course.userId !== userId) {
    throw new CourseServiceError(403, "You can only export your own courses");
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

  return { buffer, fileName };
};
