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

describe("Group Routes - /api/groups", () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  afterEach(async () => {
    await clearTestDB();
  });

  // Helper: register coordinator + create course
  const setupCourse = async (coordinator?: TestUser) => {
    const { token: coordToken, userId } = await registerAndGetToken(
      coordinator || defaultCoordinator,
    );
    const courseRes = await request(app)
      .post("/api/courses/")
      .set(authHeader(coordToken))
      .send(validCourseData);
    return { coordToken, userId, course: courseRes.body.data.course };
  };

  // Helper: register coordinator + course + register student + student creates group
  const setupGroup = async (student?: TestUser, coordinator?: TestUser) => {
    const {
      coordToken,
      userId: coordUserId,
      course,
    } = await setupCourse(coordinator);
    const { token: studentToken, userId: studentId } =
      await registerAndGetToken(student || defaultStudent);

    const groupRes = await request(app)
      .post("/api/groups/")
      .set(authHeader(studentToken))
      .send({ courseId: course._id });

    return {
      coordToken,
      coordUserId,
      studentToken,
      studentId,
      course,
      group: groupRes.body.data,
    };
  };

  // Helper: create a project directly in DB for interested-project tests
  const createProjectInDB = async (courseId: string, userId: string) => {
    return Project.create({
      courseId,
      userId,
      name: "Test Project",
      description: "Test description",
      sponsor: "Test Sponsor",
      advisors: [],
      contacts: [],
      majors: [],
      year: 2025,
      internal: false,
      assignedGroup: null,
      isOpen: true,
    });
  };

  // =====================================================================
  // POST /api/groups/ - Create Group
  // =====================================================================
  describe("POST /api/groups/ - Create Group", () => {
    it("should create a group as Student and return 201", async () => {
      const { studentToken, course } = await setupGroup();

      // setupGroup already created one; verify via a fresh call
      const { token: student2Token } = await registerAndGetToken({
        name: "Student Two",
        email: "student2@test.com",
        password: "Password123!",
        role: "Student",
      });

      const res = await request(app)
        .post("/api/groups/")
        .set(authHeader(student2Token))
        .send({ courseId: course._id });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.courseId).toBe(course._id);
      expect(res.body.data.isOpen).toBe(true);
      expect(res.body.data.interestedProjects).toHaveLength(0);
      void studentToken;
    });

    it("should auto-generate a 10-character groupCode", async () => {
      const { group } = await setupGroup();

      expect(group.groupCode).toBeDefined();
      expect(group.groupCode).toHaveLength(10);
    });

    it("should return 401 when no token is provided", async () => {
      const { course } = await setupCourse();

      const res = await request(app)
        .post("/api/groups/")
        .send({ courseId: course._id });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should return 403 when called by a Coordinator", async () => {
      const { coordToken, course } = await setupCourse();

      const res = await request(app)
        .post("/api/groups/")
        .set(authHeader(coordToken))
        .send({ courseId: course._id });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it("should return 400 when courseId is missing", async () => {
      const { token: studentToken } = await registerAndGetToken(defaultStudent);

      const res = await request(app)
        .post("/api/groups/")
        .set(authHeader(studentToken))
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 400 when courseId format is invalid", async () => {
      const { token: studentToken } = await registerAndGetToken(defaultStudent);

      const res = await request(app)
        .post("/api/groups/")
        .set(authHeader(studentToken))
        .send({ courseId: "not-an-objectid" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // =====================================================================
  // PATCH /api/groups/join - Join Group
  // =====================================================================
  describe("PATCH /api/groups/join - Join Group", () => {
    it("should allow a student to join an open group and return 200", async () => {
      const { group } = await setupGroup();
      const { token: student2Token } = await registerAndGetToken({
        name: "Student Two",
        email: "student2@test.com",
        password: "Password123!",
        role: "Student",
      });

      const res = await request(app)
        .patch("/api/groups/join")
        .set(authHeader(student2Token))
        .send({ groupCode: group.groupCode });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.groupMembers).toHaveLength(2);
    });

    it("should return 400 when group is closed", async () => {
      const { studentToken, group } = await setupGroup();

      // Close the group
      await request(app)
        .patch(`/api/groups/${group._id}/toggle-status`)
        .set(authHeader(studentToken));

      const { token: student2Token } = await registerAndGetToken({
        name: "Student Two",
        email: "student2@test.com",
        password: "Password123!",
        role: "Student",
      });

      const res = await request(app)
        .patch("/api/groups/join")
        .set(authHeader(student2Token))
        .send({ groupCode: group.groupCode });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 400 when student is already in the group", async () => {
      const { studentToken, group } = await setupGroup();

      const res = await request(app)
        .patch("/api/groups/join")
        .set(authHeader(studentToken))
        .send({ groupCode: group.groupCode });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 404 when groupCode does not match any group", async () => {
      const { token: studentToken } = await registerAndGetToken(defaultStudent);

      const res = await request(app)
        .patch("/api/groups/join")
        .set(authHeader(studentToken))
        .send({ groupCode: "AAAAAAAAAA" });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it("should return 401 when no token is provided", async () => {
      const { group } = await setupGroup();

      const res = await request(app)
        .patch("/api/groups/join")
        .send({ groupCode: group.groupCode });

      expect(res.status).toBe(401);
    });

    it("should return 403 when called by a Coordinator", async () => {
      const { coordToken, group } = await setupGroup();

      const res = await request(app)
        .patch("/api/groups/join")
        .set(authHeader(coordToken))
        .send({ groupCode: group.groupCode });

      expect(res.status).toBe(403);
    });

    it("should return 400 when groupCode is missing", async () => {
      const { token: studentToken } = await registerAndGetToken(defaultStudent);

      const res = await request(app)
        .patch("/api/groups/join")
        .set(authHeader(studentToken))
        .send({});

      expect(res.status).toBe(400);
    });

    it("should return 400 when groupCode is not 10 characters", async () => {
      const { token: studentToken } = await registerAndGetToken(defaultStudent);

      const res = await request(app)
        .patch("/api/groups/join")
        .set(authHeader(studentToken))
        .send({ groupCode: "SHORT" });

      expect(res.status).toBe(400);
    });
  });

  // =====================================================================
  // DELETE /api/groups/:groupId/leave - Leave Group
  // =====================================================================
  describe("DELETE /api/groups/:groupId/leave - Leave Group", () => {
    it("should allow a student to leave a group with remaining members", async () => {
      const { studentToken, group } = await setupGroup();

      // Add a second member directly
      await Group.findByIdAndUpdate(group._id, {
        $push: { groupMembers: new mongoose.Types.ObjectId() },
      });

      const res = await request(app)
        .delete(`/api/groups/${group._id}/leave`)
        .set(authHeader(studentToken));

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.groupMembers).toHaveLength(1);
    });

    it("should delete the group when the last member leaves", async () => {
      const { studentToken, group } = await setupGroup();

      const res = await request(app)
        .delete(`/api/groups/${group._id}/leave`)
        .set(authHeader(studentToken));

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain("deleted");

      const deleted = await Group.findById(group._id);
      expect(deleted).toBeNull();
    });

    it("should return 404 when group does not exist", async () => {
      const { token: studentToken } = await registerAndGetToken(defaultStudent);
      const fakeId = new mongoose.Types.ObjectId().toString();

      const res = await request(app)
        .delete(`/api/groups/${fakeId}/leave`)
        .set(authHeader(studentToken));

      expect(res.status).toBe(404);
    });

    it("should return 400 when groupId is not a valid ObjectId", async () => {
      const { token: studentToken } = await registerAndGetToken(defaultStudent);

      const res = await request(app)
        .delete("/api/groups/invalid-id/leave")
        .set(authHeader(studentToken));

      expect(res.status).toBe(400);
    });

    it("should return 401 when no token is provided", async () => {
      const { group } = await setupGroup();

      const res = await request(app).delete(`/api/groups/${group._id}/leave`);

      expect(res.status).toBe(401);
    });
  });

  // =====================================================================
  // GET /api/groups/:groupId - Get Group by ID
  // =====================================================================
  describe("GET /api/groups/:groupId - Get Group by ID", () => {
    it("should return group with populated members when called by Student", async () => {
      const { studentToken, group } = await setupGroup();

      const res = await request(app)
        .get(`/api/groups/${group._id}`)
        .set(authHeader(studentToken));

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe(group._id);
      expect(res.body.data.groupMembers).toBeDefined();
    });

    it("should return group when called by a Coordinator", async () => {
      const { coordToken, group } = await setupGroup();

      const res = await request(app)
        .get(`/api/groups/${group._id}`)
        .set(authHeader(coordToken));

      expect(res.status).toBe(200);
      expect(res.body.data._id).toBe(group._id);
    });

    it("should return 404 when groupId does not exist", async () => {
      const { coordToken } = await setupGroup();
      const fakeId = new mongoose.Types.ObjectId().toString();

      const res = await request(app)
        .get(`/api/groups/${fakeId}`)
        .set(authHeader(coordToken));

      expect(res.status).toBe(404);
    });

    it("should return 400 when groupId is not a valid ObjectId", async () => {
      const { coordToken } = await setupGroup();

      const res = await request(app)
        .get("/api/groups/invalid-id")
        .set(authHeader(coordToken));

      expect(res.status).toBe(400);
    });

    it("should return 401 when no token is provided", async () => {
      const { group } = await setupGroup();

      const res = await request(app).get(`/api/groups/${group._id}`);

      expect(res.status).toBe(401);
    });
  });

  // =====================================================================
  // GET /api/groups/course/:courseId - Get All Groups by Course
  // =====================================================================
  describe("GET /api/groups/course/:courseId - Get All Groups by Course", () => {
    it("should return all groups for a course with numberOfMembers", async () => {
      const { coordToken, course } = await setupGroup();

      const res = await request(app)
        .get(`/api/groups/course/${course._id}`)
        .set(authHeader(coordToken));

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].numberOfMembers).toBe(1);
    });

    it("should return empty array when course has no groups", async () => {
      const { coordToken, course } = await setupCourse();

      const res = await request(app)
        .get(`/api/groups/course/${course._id}`)
        .set(authHeader(coordToken));

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(0);
    });

    it("should be accessible by a Coordinator", async () => {
      const { coordToken, course } = await setupGroup();

      const res = await request(app)
        .get(`/api/groups/course/${course._id}`)
        .set(authHeader(coordToken));

      expect(res.status).toBe(200);
    });

    it("should return 400 when courseId is not a valid ObjectId", async () => {
      const { coordToken } = await setupGroup();

      const res = await request(app)
        .get("/api/groups/course/invalid-id")
        .set(authHeader(coordToken));

      expect(res.status).toBe(400);
    });

    it("should return 401 when no token is provided", async () => {
      const { course } = await setupGroup();

      const res = await request(app).get(`/api/groups/course/${course._id}`);

      expect(res.status).toBe(401);
    });
  });

  // =====================================================================
  // PATCH /api/groups/:groupId/toggle-status - Toggle Group Status
  // =====================================================================
  describe("PATCH /api/groups/:groupId/toggle-status - Toggle Status", () => {
    it("should close an open group (isOpen: true → false)", async () => {
      const { studentToken, group } = await setupGroup();

      const res = await request(app)
        .patch(`/api/groups/${group._id}/toggle-status`)
        .set(authHeader(studentToken));

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBe(false);
    });

    it("should reopen a closed group (isOpen: false → true)", async () => {
      const { studentToken, group } = await setupGroup();

      // First close it
      await request(app)
        .patch(`/api/groups/${group._id}/toggle-status`)
        .set(authHeader(studentToken));

      // Then reopen
      const res = await request(app)
        .patch(`/api/groups/${group._id}/toggle-status`)
        .set(authHeader(studentToken));

      expect(res.status).toBe(200);
      expect(res.body.data).toBe(true);
    });

    it("should return 401 when no token is provided", async () => {
      const { group } = await setupGroup();

      const res = await request(app).patch(
        `/api/groups/${group._id}/toggle-status`,
      );

      expect(res.status).toBe(401);
    });

    it("should return 403 when called by a Coordinator", async () => {
      const { coordToken, group } = await setupGroup();

      const res = await request(app)
        .patch(`/api/groups/${group._id}/toggle-status`)
        .set(authHeader(coordToken));

      expect(res.status).toBe(403);
    });

    it("should return 404 when group does not exist", async () => {
      const { token: studentToken } = await registerAndGetToken(defaultStudent);
      const fakeId = new mongoose.Types.ObjectId().toString();

      const res = await request(app)
        .patch(`/api/groups/${fakeId}/toggle-status`)
        .set(authHeader(studentToken));

      expect(res.status).toBe(404);
    });
  });

  // =====================================================================
  // POST /api/groups/:groupId/interested-projects - Add Interested Project
  // =====================================================================
  describe("POST /api/groups/:groupId/interested-projects - Add Interest", () => {
    it("should add a project to interestedProjects and return 200", async () => {
      const { studentToken, coordUserId, course, group } = await setupGroup();
      const project = await createProjectInDB(course._id, coordUserId);

      const res = await request(app)
        .post(`/api/groups/${group._id}/interested-projects`)
        .set(authHeader(studentToken))
        .send({ projectId: project._id.toString() });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.interestedProjects).toHaveLength(1);
    });

    it("should return 400 when project is already in interestedProjects", async () => {
      const { studentToken, coordUserId, course, group } = await setupGroup();
      const project = await createProjectInDB(course._id, coordUserId);

      await request(app)
        .post(`/api/groups/${group._id}/interested-projects`)
        .set(authHeader(studentToken))
        .send({ projectId: project._id.toString() });

      const res = await request(app)
        .post(`/api/groups/${group._id}/interested-projects`)
        .set(authHeader(studentToken))
        .send({ projectId: project._id.toString() });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 400 when interestedProjects already has 4 entries", async () => {
      const { studentToken, coordUserId, course, group } = await setupGroup();

      // Add 4 projects directly
      const projectIds = await Promise.all(
        Array.from({ length: 4 }, () =>
          createProjectInDB(course._id, coordUserId),
        ),
      );
      await Group.findByIdAndUpdate(group._id, {
        interestedProjects: projectIds.map((p) => p._id),
      });

      const fifthProject = await createProjectInDB(course._id, coordUserId);

      const res = await request(app)
        .post(`/api/groups/${group._id}/interested-projects`)
        .set(authHeader(studentToken))
        .send({ projectId: fifthProject._id.toString() });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 401 when no token is provided", async () => {
      const { coordUserId, course, group } = await setupGroup();
      const project = await createProjectInDB(course._id, coordUserId);

      const res = await request(app)
        .post(`/api/groups/${group._id}/interested-projects`)
        .send({ projectId: project._id.toString() });

      expect(res.status).toBe(401);
    });

    it("should return 403 when called by a Coordinator", async () => {
      const { coordToken, coordUserId, course, group } = await setupGroup();
      const project = await createProjectInDB(course._id, coordUserId);

      const res = await request(app)
        .post(`/api/groups/${group._id}/interested-projects`)
        .set(authHeader(coordToken))
        .send({ projectId: project._id.toString() });

      expect(res.status).toBe(403);
    });

    it("should return 404 when group does not exist", async () => {
      const { studentToken, coordUserId, course } = await setupGroup();
      const project = await createProjectInDB(course._id, coordUserId);
      const fakeGroupId = new mongoose.Types.ObjectId().toString();

      const res = await request(app)
        .post(`/api/groups/${fakeGroupId}/interested-projects`)
        .set(authHeader(studentToken))
        .send({ projectId: project._id.toString() });

      expect(res.status).toBe(404);
    });
  });

  // =====================================================================
  // DELETE /api/groups/:groupId/interested-projects - Remove Interested Project
  // =====================================================================
  describe("DELETE /api/groups/:groupId/interested-projects - Remove Interest", () => {
    it("should remove a project from interestedProjects and return 200", async () => {
      const { studentToken, coordUserId, course, group } = await setupGroup();
      const project = await createProjectInDB(course._id, coordUserId);

      // Add first
      await request(app)
        .post(`/api/groups/${group._id}/interested-projects`)
        .set(authHeader(studentToken))
        .send({ projectId: project._id.toString() });

      const res = await request(app)
        .delete(`/api/groups/${group._id}/interested-projects`)
        .set(authHeader(studentToken))
        .send({ projectId: project._id.toString() });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.interestedProjects).toHaveLength(0);
    });

    it("should return 401 when no token is provided", async () => {
      const { coordUserId, course, group } = await setupGroup();
      const project = await createProjectInDB(course._id, coordUserId);

      const res = await request(app)
        .delete(`/api/groups/${group._id}/interested-projects`)
        .send({ projectId: project._id.toString() });

      expect(res.status).toBe(401);
    });

    it("should return 403 when called by a Coordinator", async () => {
      const { coordToken, coordUserId, course, group } = await setupGroup();
      const project = await createProjectInDB(course._id, coordUserId);

      const res = await request(app)
        .delete(`/api/groups/${group._id}/interested-projects`)
        .set(authHeader(coordToken))
        .send({ projectId: project._id.toString() });

      expect(res.status).toBe(403);
    });

    it("should return 404 when group does not exist", async () => {
      const { studentToken, coordUserId, course } = await setupGroup();
      const project = await createProjectInDB(course._id, coordUserId);
      const fakeGroupId = new mongoose.Types.ObjectId().toString();

      const res = await request(app)
        .delete(`/api/groups/${fakeGroupId}/interested-projects`)
        .set(authHeader(studentToken))
        .send({ projectId: project._id.toString() });

      expect(res.status).toBe(404);
    });
  });

  // =====================================================================
  // GET /api/groups/interested/:projectId - Get Groups Interested in Project
  // =====================================================================
  describe("GET /api/groups/interested/:projectId - Get Interested Groups", () => {
    it("should return groups interested in a project with numberOfMembers", async () => {
      const { studentToken, coordToken, coordUserId, course, group } =
        await setupGroup();
      const project = await createProjectInDB(course._id, coordUserId);

      await request(app)
        .post(`/api/groups/${group._id}/interested-projects`)
        .set(authHeader(studentToken))
        .send({ projectId: project._id.toString() });

      const res = await request(app)
        .get(`/api/groups/interested/${project._id}`)
        .set(authHeader(coordToken));

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].numberOfMembers).toBe(1);
    });

    it("should return empty array when no groups are interested", async () => {
      const { coordToken, coordUserId, course } = await setupGroup();
      const project = await createProjectInDB(course._id, coordUserId);

      const res = await request(app)
        .get(`/api/groups/interested/${project._id}`)
        .set(authHeader(coordToken));

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(0);
    });

    it("should return 400 when projectId is not a valid ObjectId", async () => {
      const { coordToken } = await setupGroup();

      const res = await request(app)
        .get("/api/groups/interested/invalid-id")
        .set(authHeader(coordToken));

      expect(res.status).toBe(400);
    });

    it("should return 401 when no token is provided", async () => {
      const { coordUserId, course } = await setupGroup();
      const project = await createProjectInDB(course._id, coordUserId);

      const res = await request(app).get(
        `/api/groups/interested/${project._id}`,
      );

      expect(res.status).toBe(401);
    });
  });
});
