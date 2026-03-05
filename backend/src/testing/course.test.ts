// Set env vars BEFORE importing app (env.ts reads these at import time)
process.env.JWT_SECRET = "test-jwt-secret-key-for-testing";
process.env.MONGO_URI = "mongodb://localhost:27017/test-placeholder";
process.env.NODE_ENV = "test";

import request from "supertest";
import mongoose from "mongoose";
import app from "../server";
import { connectTestDB, disconnectTestDB, clearTestDB } from "./helpers/db";
import {
  defaultCoordinator,
  defaultStudent,
  registerAndGetToken,
  authHeader,
  TestUser,
} from "./helpers/auth";
import { validCourseData } from "./helpers/fixtures";
import { Group } from "../models/Group.model";
import { Project } from "../models/Project.model";
import User from "../models/User.model";

describe("Course Routes - /api/courses", () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  afterEach(async () => {
    await clearTestDB();
  });

  // Helper: create a course and return its data + coordinator token
  const createCourse = async (coordinator?: TestUser) => {
    const { token, userId } = await registerAndGetToken(
      coordinator || defaultCoordinator,
    );
    const res = await request(app)
      .post("/api/courses/")
      .set(authHeader(token))
      .send(validCourseData);
    return { token, userId, course: res.body.data.course, res };
  };

  // POST /api/courses/ - Create Course
  describe("POST /api/courses/ - Create Course", () => {
    it("should create a course as Coordinator and return 201", async () => {
      const { token } = await registerAndGetToken(defaultCoordinator);

      const res = await request(app)
        .post("/api/courses/")
        .set(authHeader(token))
        .send(validCourseData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.course.program).toBe(validCourseData.program);
      expect(res.body.data.course.courseNumber).toBe(
        validCourseData.courseNumber,
      );
      expect(res.body.data.course.season).toBe(validCourseData.season);
    });

    it("should auto-generate a unique 7-character courseCode", async () => {
      const { course } = await createCourse();

      expect(course.courseCode).toBeDefined();
      expect(course.courseCode).toHaveLength(7);
    });

    it("should set closed=false and lastGroupNumber=0 by default", async () => {
      const { course } = await createCourse();

      expect(course.closed).toBe(false);
      expect(course.lastGroupNumber).toBe(0);
    });

    it("should return 401 when no token is provided", async () => {
      const res = await request(app)
        .post("/api/courses/")
        .send(validCourseData);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should return 403 when called by a Student", async () => {
      const { token } = await registerAndGetToken(defaultStudent);

      const res = await request(app)
        .post("/api/courses/")
        .set(authHeader(token))
        .send(validCourseData);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it("should return 400 when program is missing", async () => {
      const { token } = await registerAndGetToken(defaultCoordinator);
      const { program: _program, ...noProgram } = validCourseData;

      const res = await request(app)
        .post("/api/courses/")
        .set(authHeader(token))
        .send(noProgram);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 400 when season is invalid", async () => {
      const { token } = await registerAndGetToken(defaultCoordinator);

      const res = await request(app)
        .post("/api/courses/")
        .set(authHeader(token))
        .send({ ...validCourseData, season: "Autumn" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 400 when year is below 2020", async () => {
      const { token } = await registerAndGetToken(defaultCoordinator);

      const res = await request(app)
        .post("/api/courses/")
        .set(authHeader(token))
        .send({ ...validCourseData, year: 2019 });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 400 when maxGroupSize is less than minGroupSize", async () => {
      const { token } = await registerAndGetToken(defaultCoordinator);

      const res = await request(app)
        .post("/api/courses/")
        .set(authHeader(token))
        .send({ ...validCourseData, minGroupSize: 5, maxGroupSize: 2 });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 400 when body is empty", async () => {
      const { token } = await registerAndGetToken(defaultCoordinator);

      const res = await request(app)
        .post("/api/courses/")
        .set(authHeader(token))
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // GET /api/courses/my-courses
  describe("GET /api/courses/my-courses", () => {
    it("should return all courses for the authenticated coordinator", async () => {
      const { token } = await createCourse();
      // Create a second course
      await request(app)
        .post("/api/courses/")
        .set(authHeader(token))
        .send({ ...validCourseData, courseSection: "002" });

      const res = await request(app)
        .get("/api/courses/my-courses")
        .set(authHeader(token));

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.courses).toHaveLength(2);
      expect(res.body.data.count).toBe(2);
    });

    it("should return empty array when coordinator has no courses", async () => {
      const { token } = await registerAndGetToken(defaultCoordinator);

      const res = await request(app)
        .get("/api/courses/my-courses")
        .set(authHeader(token));

      expect(res.status).toBe(200);
      expect(res.body.data.courses).toHaveLength(0);
      expect(res.body.data.count).toBe(0);
    });

    it("should not return courses created by a different coordinator", async () => {
      // First coordinator creates a course
      await createCourse();

      // Second coordinator
      const coord2: TestUser = {
        name: "Coordinator Two",
        email: "coord2@test.com",
        password: "Password123!",
        role: "Course Coordinator",
      };
      const { token: token2 } = await registerAndGetToken(coord2);

      const res = await request(app)
        .get("/api/courses/my-courses")
        .set(authHeader(token2));

      expect(res.status).toBe(200);
      expect(res.body.data.courses).toHaveLength(0);
    });

    it("should return 401 when no token is provided", async () => {
      const res = await request(app).get("/api/courses/my-courses");

      expect(res.status).toBe(401);
    });

    it("should return 403 when called by a Student", async () => {
      const { token } = await registerAndGetToken(defaultStudent);

      const res = await request(app)
        .get("/api/courses/my-courses")
        .set(authHeader(token));

      expect(res.status).toBe(403);
    });
  });

  // GET /api/courses/:id - Get Course by ID
  describe("GET /api/courses/:id", () => {
    it("should return the course when called by a Coordinator", async () => {
      const { token, course } = await createCourse();

      const res = await request(app)
        .get(`/api/courses/${course._id}`)
        .set(authHeader(token));

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.course._id).toBe(course._id);
    });

    it("should return the course when called by an enrolled Student", async () => {
      const { course } = await createCourse();
      const { token: studentToken } = await registerAndGetToken(defaultStudent);

      await request(app)
        .post("/api/courses/join")
        .set(authHeader(studentToken))
        .send({ courseCode: course.courseCode });

      const res = await request(app)
        .get(`/api/courses/${course._id}`)
        .set(authHeader(studentToken));

      expect(res.status).toBe(200);
      expect(res.body.data.course._id).toBe(course._id);
    });

    it("should return 403 when student is not enrolled in the course", async () => {
      const { course } = await createCourse();
      const { token: studentToken } = await registerAndGetToken(defaultStudent);

      const res = await request(app)
        .get(`/api/courses/${course._id}`)
        .set(authHeader(studentToken));

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it("should return 404 when course ID does not exist", async () => {
      const { token } = await registerAndGetToken(defaultCoordinator);
      const fakeId = new mongoose.Types.ObjectId().toString();

      const res = await request(app)
        .get(`/api/courses/${fakeId}`)
        .set(authHeader(token));

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it("should return 400 when course ID is not a valid ObjectId", async () => {
      const { token } = await registerAndGetToken(defaultCoordinator);

      const res = await request(app)
        .get("/api/courses/invalid-id")
        .set(authHeader(token));

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 401 when no token is provided", async () => {
      const { course } = await createCourse();

      const res = await request(app).get(`/api/courses/${course._id}`);

      expect(res.status).toBe(401);
    });
  });

  // PATCH /api/courses/:id/close
  describe("PATCH /api/courses/:id/close", () => {
    it("should close an open course when called by its coordinator", async () => {
      const { token, course } = await createCourse();

      const res = await request(app)
        .patch(`/api/courses/${course._id}/close`)
        .set(authHeader(token));

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.course.closed).toBe(true);
    });

    it("should close all related projects and groups", async () => {
      const { token, userId, course } = await createCourse();

      const openGroup = await Group.create({
        groupNumber: 1,
        courseId: course._id,
        groupMembers: [],
        isOpen: true,
        interestedProjects: [],
        assignedProject: null,
      });

      const assignedProject = await Project.create({
        courseId: course._id,
        userId,
        name: "Assigned Project",
        description: "Assigned",
        advisors: [],
        sponsor: "Sponsor",
        contacts: [],
        majors: [],
        year: validCourseData.year,
        internal: true,
        assignedGroup: openGroup._id,
        isOpen: false,
      });

      await Group.findByIdAndUpdate(openGroup._id, {
        assignedProject: assignedProject._id,
      });

      await Project.create({
        courseId: course._id,
        userId,
        name: "Unassigned Project",
        description: "Unassigned",
        advisors: [],
        sponsor: "Sponsor",
        contacts: [],
        majors: [],
        year: validCourseData.year,
        internal: true,
        assignedGroup: null,
        isOpen: true,
      });

      const openGroup2 = await Group.create({
        groupNumber: 2,
        courseId: course._id,
        groupMembers: [],
        isOpen: true,
        interestedProjects: [],
        assignedProject: null,
      });

      await request(app)
        .patch(`/api/courses/${course._id}/close`)
        .set(authHeader(token));

      const [groups, projects] = await Promise.all([
        Group.find({ courseId: course._id }),
        Project.find({ courseId: course._id }),
      ]);

      expect(groups).toHaveLength(2);
      expect(projects).toHaveLength(2);
      expect(groups.every((g) => g.isOpen === false)).toBe(true);
      expect(projects.every((p) => p.isOpen === false)).toBe(true);
      expect(openGroup2.isOpen).toBe(true);
    });

    it("should return 401 when no token is provided", async () => {
      const { course } = await createCourse();

      const res = await request(app).patch(`/api/courses/${course._id}/close`);

      expect(res.status).toBe(401);
    });

    it("should return 403 when called by a Student", async () => {
      const { course } = await createCourse();
      const { token: studentToken } = await registerAndGetToken(defaultStudent);

      const res = await request(app)
        .patch(`/api/courses/${course._id}/close`)
        .set(authHeader(studentToken));

      expect(res.status).toBe(403);
    });

    it("should return 403 when coordinator tries to close another coordinators course", async () => {
      const { course } = await createCourse();

      const coord2: TestUser = {
        name: "Coordinator Two",
        email: "coord2@test.com",
        password: "Password123!",
        role: "Course Coordinator",
      };
      const { token: token2 } = await registerAndGetToken(coord2);

      const res = await request(app)
        .patch(`/api/courses/${course._id}/close`)
        .set(authHeader(token2));

      expect(res.status).toBe(403);
    });

    it("should return 400 when course is already closed", async () => {
      const { token, course } = await createCourse();

      // Close it first
      await request(app)
        .patch(`/api/courses/${course._id}/close`)
        .set(authHeader(token));

      // Try closing again
      const res = await request(app)
        .patch(`/api/courses/${course._id}/close`)
        .set(authHeader(token));

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("already closed");
    });

    it("should return 404 when course ID does not exist", async () => {
      const { token } = await registerAndGetToken(defaultCoordinator);
      const fakeId = new mongoose.Types.ObjectId().toString();

      const res = await request(app)
        .patch(`/api/courses/${fakeId}/close`)
        .set(authHeader(token));

      expect(res.status).toBe(404);
    });
  });

  // PATCH /api/courses/:id/open
  describe("PATCH /api/courses/:id/open", () => {
    it("should reopen a closed course when called by its coordinator", async () => {
      const { token, course } = await createCourse();

      // Close first
      await request(app)
        .patch(`/api/courses/${course._id}/close`)
        .set(authHeader(token));

      // Reopen
      const res = await request(app)
        .patch(`/api/courses/${course._id}/open`)
        .set(authHeader(token));

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.course.closed).toBe(false);
    });

    it("should only reopen unassigned projects and groups", async () => {
      const { token, userId, course } = await createCourse();

      const assignedGroup = await Group.create({
        groupNumber: 1,
        courseId: course._id,
        groupMembers: [],
        isOpen: true,
        interestedProjects: [],
        assignedProject: null,
      });

      const assignedProject = await Project.create({
        courseId: course._id,
        userId,
        name: "Assigned Project",
        description: "Assigned",
        advisors: [],
        sponsor: "Sponsor",
        contacts: [],
        majors: [],
        year: validCourseData.year,
        internal: true,
        assignedGroup: assignedGroup._id,
        isOpen: false,
      });

      await Group.findByIdAndUpdate(assignedGroup._id, {
        assignedProject: assignedProject._id,
      });

      const unassignedGroup = await Group.create({
        groupNumber: 2,
        courseId: course._id,
        groupMembers: [],
        isOpen: true,
        interestedProjects: [],
        assignedProject: null,
      });

      const unassignedProject = await Project.create({
        courseId: course._id,
        userId,
        name: "Unassigned Project",
        description: "Unassigned",
        advisors: [],
        sponsor: "Sponsor",
        contacts: [],
        majors: [],
        year: validCourseData.year,
        internal: true,
        assignedGroup: null,
        isOpen: true,
      });

      await request(app)
        .patch(`/api/courses/${course._id}/close`)
        .set(authHeader(token));

      await request(app)
        .patch(`/api/courses/${course._id}/open`)
        .set(authHeader(token));

      const [freshAssignedGroup, freshUnassignedGroup] = await Promise.all([
        Group.findById(assignedGroup._id),
        Group.findById(unassignedGroup._id),
      ]);
      const [freshAssignedProject, freshUnassignedProject] = await Promise.all([
        Project.findById(assignedProject._id),
        Project.findById(unassignedProject._id),
      ]);

      expect(freshAssignedGroup?.isOpen).toBe(false);
      expect(freshAssignedProject?.isOpen).toBe(false);
      expect(freshUnassignedGroup?.isOpen).toBe(true);
      expect(freshUnassignedProject?.isOpen).toBe(true);
    });

    it("should return 401 when no token is provided", async () => {
      const { course } = await createCourse();

      const res = await request(app).patch(`/api/courses/${course._id}/open`);

      expect(res.status).toBe(401);
    });

    it("should return 403 when called by a Student", async () => {
      const { course } = await createCourse();
      const { token: studentToken } = await registerAndGetToken(defaultStudent);

      const res = await request(app)
        .patch(`/api/courses/${course._id}/open`)
        .set(authHeader(studentToken));

      expect(res.status).toBe(403);
    });

    it("should return 403 when coordinator tries to reopen another coordinators course", async () => {
      const { token, course } = await createCourse();

      // Close the course first
      await request(app)
        .patch(`/api/courses/${course._id}/close`)
        .set(authHeader(token));

      const coord2: TestUser = {
        name: "Coordinator Two",
        email: "coord2@test.com",
        password: "Password123!",
        role: "Course Coordinator",
      };
      const { token: token2 } = await registerAndGetToken(coord2);

      const res = await request(app)
        .patch(`/api/courses/${course._id}/open`)
        .set(authHeader(token2));

      expect(res.status).toBe(403);
    });

    it("should return 400 when course is already open", async () => {
      const { token, course } = await createCourse();

      const res = await request(app)
        .patch(`/api/courses/${course._id}/open`)
        .set(authHeader(token));

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("already open");
    });

    it("should return 404 when course ID does not exist", async () => {
      const { token } = await registerAndGetToken(defaultCoordinator);
      const fakeId = new mongoose.Types.ObjectId().toString();

      const res = await request(app)
        .patch(`/api/courses/${fakeId}/open`)
        .set(authHeader(token));

      expect(res.status).toBe(404);
    });
  });

  // GET /api/courses/:id/stats
  describe("GET /api/courses/:id/stats", () => {
    it("should return stats for a course with no students", async () => {
      const { token, course } = await createCourse();

      const res = await request(app)
        .get(`/api/courses/${course._id}/stats`)
        .set(authHeader(token));

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.stats.totalStudents).toBe(0);
      expect(res.body.data.stats.studentsInGroups).toBe(0);
      expect(res.body.data.stats.studentsWithoutGroups).toBe(0);
    });

    it("should return correct totalStudents after students join", async () => {
      const { token, course } = await createCourse();

      // Register and join as student
      const { token: studentToken } = await registerAndGetToken(defaultStudent);
      await request(app)
        .post("/api/courses/join")
        .set(authHeader(studentToken))
        .send({ courseCode: course.courseCode });

      const res = await request(app)
        .get(`/api/courses/${course._id}/stats`)
        .set(authHeader(token));

      expect(res.status).toBe(200);
      expect(res.body.data.stats.totalStudents).toBe(1);
      expect(res.body.data.stats.studentsWithoutGroups).toBe(1);
    });

    it("should include course metadata in the response", async () => {
      const { token, course } = await createCourse();

      const res = await request(app)
        .get(`/api/courses/${course._id}/stats`)
        .set(authHeader(token));

      expect(res.body.data.course.program).toBe(validCourseData.program);
      expect(res.body.data.course.courseNumber).toBe(
        validCourseData.courseNumber,
      );
    });

    it("should include group/project and match counts", async () => {
      const { token, userId, course } = await createCourse();

      const studentA: TestUser = {
        name: "Student A",
        email: "studA@test.com",
        password: "Password123!",
        role: "Student",
      };
      const studentB: TestUser = {
        name: "Student B",
        email: "studB@test.com",
        password: "Password123!",
        role: "Student",
      };

      const [
        { token: studentAToken, userId: studentAId },
        { userId: studentBId },
      ] = await Promise.all([
        registerAndGetToken(studentA),
        registerAndGetToken(studentB),
      ]);

      await request(app)
        .post("/api/courses/join")
        .set(authHeader(studentAToken))
        .send({ courseCode: course.courseCode });

      await User.findByIdAndUpdate(studentBId, {
        course: course._id,
      });

      const matchedGroup = await Group.create({
        groupNumber: 1,
        courseId: course._id,
        groupMembers: [studentAId],
        isOpen: false,
        interestedProjects: [],
        assignedProject: null,
      });

      const matchedProject = await Project.create({
        courseId: course._id,
        userId,
        name: "Matched",
        description: "Matched",
        advisors: [],
        sponsor: "Sponsor",
        contacts: [],
        majors: [],
        year: validCourseData.year,
        internal: true,
        assignedGroup: matchedGroup._id,
        isOpen: false,
      });

      await Group.findByIdAndUpdate(matchedGroup._id, {
        assignedProject: matchedProject._id,
      });

      await Group.create({
        groupNumber: 2,
        courseId: course._id,
        groupMembers: [],
        isOpen: true,
        interestedProjects: [],
        assignedProject: null,
      });

      await Project.create({
        courseId: course._id,
        userId,
        name: "Open",
        description: "Open",
        advisors: [],
        sponsor: "Sponsor",
        contacts: [],
        majors: [],
        year: validCourseData.year,
        internal: true,
        assignedGroup: null,
        isOpen: true,
      });

      await User.findByIdAndUpdate(studentAId, { groupId: matchedGroup._id });

      const res = await request(app)
        .get(`/api/courses/${course._id}/stats`)
        .set(authHeader(token));

      expect(res.status).toBe(200);
      expect(res.body.data.stats.totalGroups).toBe(2);
      expect(res.body.data.stats.openGroups).toBe(1);
      expect(res.body.data.stats.matchedGroups).toBe(1);
      expect(res.body.data.stats.totalProjects).toBe(2);
      expect(res.body.data.stats.openProjects).toBe(1);
      expect(res.body.data.stats.matchedProjects).toBe(1);
      expect(res.body.data.stats.totalStudents).toBe(2);
      expect(res.body.data.stats.studentsInGroups).toBe(1);
      expect(res.body.data.stats.studentsWithoutGroups).toBe(1);
    });

    it("should return 401 when no token is provided", async () => {
      const { course } = await createCourse();

      const res = await request(app).get(`/api/courses/${course._id}/stats`);

      expect(res.status).toBe(401);
    });

    it("should return 403 when called by a Student", async () => {
      const { course } = await createCourse();
      const { token: studentToken } = await registerAndGetToken(defaultStudent);

      const res = await request(app)
        .get(`/api/courses/${course._id}/stats`)
        .set(authHeader(studentToken));

      expect(res.status).toBe(403);
    });

    it("should return 403 when coordinator requests stats for another coordinators course", async () => {
      const { course } = await createCourse();

      const coord2: TestUser = {
        name: "Coordinator Two",
        email: "coord2@test.com",
        password: "Password123!",
        role: "Course Coordinator",
      };
      const { token: token2 } = await registerAndGetToken(coord2);

      const res = await request(app)
        .get(`/api/courses/${course._id}/stats`)
        .set(authHeader(token2));

      expect(res.status).toBe(403);
    });

    it("should return 404 when course ID does not exist", async () => {
      const { token } = await registerAndGetToken(defaultCoordinator);
      const fakeId = new mongoose.Types.ObjectId().toString();

      const res = await request(app)
        .get(`/api/courses/${fakeId}/stats`)
        .set(authHeader(token));

      expect(res.status).toBe(404);
    });
  });

  // POST /api/courses/join - Student Joins Course
  describe("POST /api/courses/join", () => {
    it("should allow a student to join an open course with valid courseCode", async () => {
      const { course } = await createCourse();
      const { token: studentToken } = await registerAndGetToken(defaultStudent);

      const res = await request(app)
        .post("/api/courses/join")
        .set(authHeader(studentToken))
        .send({ courseCode: course.courseCode });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.course._id).toBe(course._id);
    });

    it("should update the students course field in the database", async () => {
      const { course, token: _coordToken } = await createCourse();
      const { token: studentToken } = await registerAndGetToken(defaultStudent);

      await request(app)
        .post("/api/courses/join")
        .set(authHeader(studentToken))
        .send({ courseCode: course.courseCode });

      // Verify by fetching the student's profile
      const meRes = await request(app)
        .get("/api/auth/me")
        .set(authHeader(studentToken));

      expect(meRes.body.data.user.course).toBe(course._id);
    });

    it("should be case-insensitive for courseCode", async () => {
      const { course } = await createCourse();
      const { token: studentToken } = await registerAndGetToken(defaultStudent);

      const res = await request(app)
        .post("/api/courses/join")
        .set(authHeader(studentToken))
        .send({ courseCode: course.courseCode.toLowerCase() });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should return 401 when no token is provided", async () => {
      const res = await request(app)
        .post("/api/courses/join")
        .send({ courseCode: "ABCDEFG" });

      expect(res.status).toBe(401);
    });

    it("should return 403 when called by a Course Coordinator", async () => {
      const { token, course } = await createCourse();

      const res = await request(app)
        .post("/api/courses/join")
        .set(authHeader(token))
        .send({ courseCode: course.courseCode });

      expect(res.status).toBe(403);
    });

    it("should return 400 when courseCode is missing", async () => {
      const { token: studentToken } = await registerAndGetToken(defaultStudent);

      const res = await request(app)
        .post("/api/courses/join")
        .set(authHeader(studentToken))
        .send({});

      expect(res.status).toBe(400);
    });

    it("should return 400 when courseCode is not 7 characters", async () => {
      const { token: studentToken } = await registerAndGetToken(defaultStudent);

      const res = await request(app)
        .post("/api/courses/join")
        .set(authHeader(studentToken))
        .send({ courseCode: "ABC" });

      expect(res.status).toBe(400);
    });

    it("should return 404 when courseCode does not match any course", async () => {
      const { token: studentToken } = await registerAndGetToken(defaultStudent);

      const res = await request(app)
        .post("/api/courses/join")
        .set(authHeader(studentToken))
        .send({ courseCode: "ZZZZZZZ" });

      expect(res.status).toBe(404);
    });

    it("should return 400 when student is already enrolled in a course", async () => {
      const { course } = await createCourse();
      const { token: studentToken } = await registerAndGetToken(defaultStudent);

      // Join first course
      await request(app)
        .post("/api/courses/join")
        .set(authHeader(studentToken))
        .send({ courseCode: course.courseCode });

      // Create a second course and try to join it
      const coord2: TestUser = {
        name: "Coordinator Two",
        email: "coord2@test.com",
        password: "Password123!",
        role: "Course Coordinator",
      };
      const { course: course2 } = await createCourse(coord2);

      const res = await request(app)
        .post("/api/courses/join")
        .set(authHeader(studentToken))
        .send({ courseCode: course2.courseCode });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("already enrolled");
    });

    it("should return 400 when the course is closed", async () => {
      const { token: coordToken, course } = await createCourse();

      // Close the course
      await request(app)
        .patch(`/api/courses/${course._id}/close`)
        .set(authHeader(coordToken));

      const { token: studentToken } = await registerAndGetToken(defaultStudent);

      const res = await request(app)
        .post("/api/courses/join")
        .set(authHeader(studentToken))
        .send({ courseCode: course.courseCode });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("closed");
    });
  });
});
