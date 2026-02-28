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
import { validCourseData, validProjectData } from "./helpers/fixtures";
import { Group } from "../models/Group.model";

describe("Project Routes - /api/projects", () => {
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

  // Helper: register coordinator + create course + create project
  const setupProject = async (coordinator?: TestUser) => {
    const { coordToken, userId, course } = await setupCourse(coordinator);
    const projectRes = await request(app)
      .post("/api/projects/")
      .set(authHeader(coordToken))
      .send({ ...validProjectData, courseId: course._id });
    return {
      coordToken,
      userId,
      course,
      project: projectRes.body.data.project,
    };
  };

  // Helper: create a group directly in DB (group routes not wired yet)
  const createGroupInDB = async (
    courseId: string,
    extraFields: Record<string, unknown> = {},
  ) => {
    return Group.create({
      groupNumber: 1,
      courseId,
      groupMembers: [],
      groupCode: Math.random().toString(36).substring(2, 12),
      isOpen: true,
      interestedProjects: [],
      assignedProject: null,
      ...extraFields,
    });
  };

  // =====================================================================
  // POST /api/projects/ - Create Project
  // =====================================================================
  describe("POST /api/projects/ - Create Project", () => {
    it("should create a project as Coordinator and return 201", async () => {
      const { coordToken, course } = await setupCourse();

      const res = await request(app)
        .post("/api/projects/")
        .set(authHeader(coordToken))
        .send({ ...validProjectData, courseId: course._id });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.project.name).toBe(validProjectData.name);
      expect(res.body.data.project.sponsor).toBe(validProjectData.sponsor);
      expect(res.body.data.project.courseId).toBe(course._id);
    });

    it("should set isOpen=true and assignedGroup=null by default", async () => {
      const { project } = await setupProject();

      expect(project.isOpen).toBe(true);
      expect(project.assignedGroup).toBeNull();
    });

    it("should return 401 when no token is provided", async () => {
      const { course } = await setupCourse();

      const res = await request(app)
        .post("/api/projects/")
        .send({ ...validProjectData, courseId: course._id });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should return 403 when called by a Student", async () => {
      const { course } = await setupCourse();
      const { token: studentToken } = await registerAndGetToken(defaultStudent);

      const res = await request(app)
        .post("/api/projects/")
        .set(authHeader(studentToken))
        .send({ ...validProjectData, courseId: course._id });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it("should return 403 when coordinator creates project for another coordinators course", async () => {
      const { course } = await setupCourse();
      const coord2: TestUser = {
        name: "Coordinator Two",
        email: "coord2@test.com",
        password: "Password123!",
        role: "Course Coordinator",
      };
      const { token: token2 } = await registerAndGetToken(coord2);

      const res = await request(app)
        .post("/api/projects/")
        .set(authHeader(token2))
        .send({ ...validProjectData, courseId: course._id });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it("should return 404 when courseId does not match any course", async () => {
      const { coordToken } = await setupCourse();
      const fakeId = new mongoose.Types.ObjectId().toString();

      const res = await request(app)
        .post("/api/projects/")
        .set(authHeader(coordToken))
        .send({ ...validProjectData, courseId: fakeId });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it("should return 400 when courseId format is invalid", async () => {
      const { coordToken } = await setupCourse();

      const res = await request(app)
        .post("/api/projects/")
        .set(authHeader(coordToken))
        .send({ ...validProjectData, courseId: "not-an-objectid" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 400 when name is missing", async () => {
      const { coordToken, course } = await setupCourse();
      const { name: _name, ...noName } = validProjectData;

      const res = await request(app)
        .post("/api/projects/")
        .set(authHeader(coordToken))
        .send({ ...noName, courseId: course._id });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 400 when description is missing", async () => {
      const { coordToken, course } = await setupCourse();
      const { description: _desc, ...noDesc } = validProjectData;

      const res = await request(app)
        .post("/api/projects/")
        .set(authHeader(coordToken))
        .send({ ...noDesc, courseId: course._id });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 400 when sponsor is missing", async () => {
      const { coordToken, course } = await setupCourse();
      const { sponsor: _sponsor, ...noSponsor } = validProjectData;

      const res = await request(app)
        .post("/api/projects/")
        .set(authHeader(coordToken))
        .send({ ...noSponsor, courseId: course._id });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 400 when year is below 2020", async () => {
      const { coordToken, course } = await setupCourse();

      const res = await request(app)
        .post("/api/projects/")
        .set(authHeader(coordToken))
        .send({ ...validProjectData, courseId: course._id, year: 2019 });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // =====================================================================
  // GET /api/projects/course/:courseId - Get Projects by Course
  // =====================================================================
  describe("GET /api/projects/course/:courseId - Get Projects by Course", () => {
    it("should return all projects with pagination metadata", async () => {
      const { coordToken, course } = await setupProject();

      const res = await request(app)
        .get(`/api/projects/course/${course._id}`)
        .set(authHeader(coordToken));

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.projects).toHaveLength(1);
      expect(res.body.data.count).toBe(1);
      expect(res.body.data.pagination).toBeDefined();
      expect(res.body.data.pagination.total).toBe(1);
      expect(res.body.data.pagination.page).toBe(1);
    });

    it("should return empty array when course has no projects", async () => {
      const { coordToken, course } = await setupCourse();

      const res = await request(app)
        .get(`/api/projects/course/${course._id}`)
        .set(authHeader(coordToken));

      expect(res.status).toBe(200);
      expect(res.body.data.projects).toHaveLength(0);
      expect(res.body.data.pagination.total).toBe(0);
    });

    it("should filter by search term matching project name", async () => {
      const { coordToken, course } = await setupProject();
      await request(app)
        .post("/api/projects/")
        .set(authHeader(coordToken))
        .send({
          ...validProjectData,
          courseId: course._id,
          name: "Completely Different Project",
        });

      const res = await request(app)
        .get(`/api/projects/course/${course._id}?search=Smart+Campus`)
        .set(authHeader(coordToken));

      expect(res.status).toBe(200);
      expect(res.body.data.projects).toHaveLength(1);
      expect(res.body.data.projects[0].name).toBe(validProjectData.name);
    });

    it("should filter by search term matching sponsor", async () => {
      const { coordToken, course } = await setupProject();
      await request(app)
        .post("/api/projects/")
        .set(authHeader(coordToken))
        .send({
          ...validProjectData,
          courseId: course._id,
          sponsor: "Other Corp",
        });

      const res = await request(app)
        .get(`/api/projects/course/${course._id}?search=Stevens`)
        .set(authHeader(coordToken));

      expect(res.status).toBe(200);
      expect(res.body.data.projects).toHaveLength(1);
      expect(res.body.data.projects[0].sponsor).toBe(validProjectData.sponsor);
    });

    it("should filter by major", async () => {
      const { coordToken, course } = await setupProject();
      await request(app)
        .post("/api/projects/")
        .set(authHeader(coordToken))
        .send({
          ...validProjectData,
          courseId: course._id,
          majors: [{ major: "Mechanical Engineering" }],
        });

      const res = await request(app)
        .get(`/api/projects/course/${course._id}?major=Computer+Science`)
        .set(authHeader(coordToken));

      expect(res.status).toBe(200);
      expect(res.body.data.projects).toHaveLength(1);
      expect(res.body.data.projects[0].majors).toContainEqual(
        expect.objectContaining({ major: "Computer Science" }),
      );
    });

    it("should filter by status=open", async () => {
      const { coordToken, course, project } = await setupProject();
      await request(app)
        .patch(`/api/projects/${project._id}`)
        .set(authHeader(coordToken))
        .send({ isOpen: false });
      await request(app)
        .post("/api/projects/")
        .set(authHeader(coordToken))
        .send({ ...validProjectData, courseId: course._id });

      const res = await request(app)
        .get(`/api/projects/course/${course._id}?status=open`)
        .set(authHeader(coordToken));

      expect(res.status).toBe(200);
      expect(res.body.data.projects).toHaveLength(1);
      expect(res.body.data.projects[0].isOpen).toBe(true);
    });

    it("should filter by status=closed", async () => {
      const { coordToken, course, project } = await setupProject();
      await request(app)
        .patch(`/api/projects/${project._id}`)
        .set(authHeader(coordToken))
        .send({ isOpen: false });

      const res = await request(app)
        .get(`/api/projects/course/${course._id}?status=closed`)
        .set(authHeader(coordToken));

      expect(res.status).toBe(200);
      expect(res.body.data.projects).toHaveLength(1);
      expect(res.body.data.projects[0].isOpen).toBe(false);
    });

    it("should filter by project_type=internal", async () => {
      const { coordToken, course } = await setupProject();
      await request(app)
        .post("/api/projects/")
        .set(authHeader(coordToken))
        .send({ ...validProjectData, courseId: course._id, internal: true });

      const res = await request(app)
        .get(`/api/projects/course/${course._id}?project_type=internal`)
        .set(authHeader(coordToken));

      expect(res.status).toBe(200);
      expect(res.body.data.projects).toHaveLength(1);
      expect(res.body.data.projects[0].internal).toBe(true);
    });

    it("should filter by project_type=external", async () => {
      const { coordToken, course } = await setupProject();
      await request(app)
        .post("/api/projects/")
        .set(authHeader(coordToken))
        .send({ ...validProjectData, courseId: course._id, internal: true });

      const res = await request(app)
        .get(`/api/projects/course/${course._id}?project_type=external`)
        .set(authHeader(coordToken));

      expect(res.status).toBe(200);
      expect(res.body.data.projects).toHaveLength(1);
      expect(res.body.data.projects[0].internal).toBe(false);
    });

    it("should filter by year", async () => {
      const { coordToken, course } = await setupProject();
      await request(app)
        .post("/api/projects/")
        .set(authHeader(coordToken))
        .send({ ...validProjectData, courseId: course._id, year: 2026 });

      const res = await request(app)
        .get(`/api/projects/course/${course._id}?year=2026`)
        .set(authHeader(coordToken));

      expect(res.status).toBe(200);
      expect(res.body.data.projects).toHaveLength(1);
      expect(res.body.data.projects[0].year).toBe(2026);
    });

    it("should respect pagination: page=1&limit=1 returns 1 of 2 results", async () => {
      const { coordToken, course } = await setupProject();
      await request(app)
        .post("/api/projects/")
        .set(authHeader(coordToken))
        .send({ ...validProjectData, courseId: course._id });

      const res = await request(app)
        .get(`/api/projects/course/${course._id}?page=1&limit=1`)
        .set(authHeader(coordToken));

      expect(res.status).toBe(200);
      expect(res.body.data.projects).toHaveLength(1);
      expect(res.body.data.pagination.page).toBe(1);
      expect(res.body.data.pagination.limit).toBe(1);
      expect(res.body.data.pagination.total).toBe(2);
      expect(res.body.data.pagination.totalPages).toBe(2);
    });

    it("should be accessible by a Student", async () => {
      const { course } = await setupProject();
      const { token: studentToken } = await registerAndGetToken(defaultStudent);

      const res = await request(app)
        .get(`/api/projects/course/${course._id}`)
        .set(authHeader(studentToken));

      expect(res.status).toBe(200);
    });

    it("should return 400 when courseId format is invalid", async () => {
      const { coordToken } = await setupProject();

      const res = await request(app)
        .get("/api/projects/course/invalid-id")
        .set(authHeader(coordToken));

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 401 when no token is provided", async () => {
      const { course } = await setupProject();

      const res = await request(app).get(
        `/api/projects/course/${course._id}`,
      );

      expect(res.status).toBe(401);
    });
  });

  // =====================================================================
  // GET /api/projects/:id - Get Project by ID
  // =====================================================================
  describe("GET /api/projects/:id - Get Project by ID", () => {
    it("should return project by ID when called by Coordinator", async () => {
      const { coordToken, project } = await setupProject();

      const res = await request(app)
        .get(`/api/projects/${project._id}`)
        .set(authHeader(coordToken));

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.project._id).toBe(project._id);
      expect(res.body.data.project.name).toBe(validProjectData.name);
    });

    it("should return project when called by a Student", async () => {
      const { project } = await setupProject();
      const { token: studentToken } = await registerAndGetToken(defaultStudent);

      const res = await request(app)
        .get(`/api/projects/${project._id}`)
        .set(authHeader(studentToken));

      expect(res.status).toBe(200);
      expect(res.body.data.project._id).toBe(project._id);
    });

    it("should return 404 when project ID does not exist", async () => {
      const { coordToken } = await setupProject();
      const fakeId = new mongoose.Types.ObjectId().toString();

      const res = await request(app)
        .get(`/api/projects/${fakeId}`)
        .set(authHeader(coordToken));

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it("should return 400 when project ID is not a valid ObjectId", async () => {
      const { coordToken } = await setupProject();

      const res = await request(app)
        .get("/api/projects/invalid-id")
        .set(authHeader(coordToken));

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 401 when no token is provided", async () => {
      const { project } = await setupProject();

      const res = await request(app).get(`/api/projects/${project._id}`);

      expect(res.status).toBe(401);
    });
  });

  // =====================================================================
  // PATCH /api/projects/:id - Update Project
  // =====================================================================
  describe("PATCH /api/projects/:id - Update Project", () => {
    it("should update project fields and return updated document", async () => {
      const { coordToken, project } = await setupProject();

      const res = await request(app)
        .patch(`/api/projects/${project._id}`)
        .set(authHeader(coordToken))
        .send({ name: "Updated Project Name", sponsor: "New Sponsor" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.project.name).toBe("Updated Project Name");
      expect(res.body.data.project.sponsor).toBe("New Sponsor");
    });

    it("should return 401 when no token is provided", async () => {
      const { project } = await setupProject();

      const res = await request(app)
        .patch(`/api/projects/${project._id}`)
        .send({ name: "Updated" });

      expect(res.status).toBe(401);
    });

    it("should return 403 when called by a Student", async () => {
      const { project } = await setupProject();
      const { token: studentToken } = await registerAndGetToken(defaultStudent);

      const res = await request(app)
        .patch(`/api/projects/${project._id}`)
        .set(authHeader(studentToken))
        .send({ name: "Updated" });

      expect(res.status).toBe(403);
    });

    it("should return 403 when called by a different Coordinator", async () => {
      const { project } = await setupProject();
      const coord2: TestUser = {
        name: "Coordinator Two",
        email: "coord2@test.com",
        password: "Password123!",
        role: "Course Coordinator",
      };
      const { token: token2 } = await registerAndGetToken(coord2);

      const res = await request(app)
        .patch(`/api/projects/${project._id}`)
        .set(authHeader(token2))
        .send({ name: "Updated" });

      expect(res.status).toBe(403);
    });

    it("should return 404 when project ID does not exist", async () => {
      const { coordToken } = await setupProject();
      const fakeId = new mongoose.Types.ObjectId().toString();

      const res = await request(app)
        .patch(`/api/projects/${fakeId}`)
        .set(authHeader(coordToken))
        .send({ name: "Updated" });

      expect(res.status).toBe(404);
    });

    it("should return 400 when project ID is not a valid ObjectId", async () => {
      const { coordToken } = await setupProject();

      const res = await request(app)
        .patch("/api/projects/invalid-id")
        .set(authHeader(coordToken))
        .send({ name: "Updated" });

      expect(res.status).toBe(400);
    });
  });

  // =====================================================================
  // DELETE /api/projects/:id - Delete Project
  // =====================================================================
  describe("DELETE /api/projects/:id - Delete Project", () => {
    it("should delete a project and return 200", async () => {
      const { coordToken, project } = await setupProject();

      const res = await request(app)
        .delete(`/api/projects/${project._id}`)
        .set(authHeader(coordToken));

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const checkRes = await request(app)
        .get(`/api/projects/${project._id}`)
        .set(authHeader(coordToken));
      expect(checkRes.status).toBe(404);
    });

    it("should remove project from groups interestedProjects on delete", async () => {
      const { coordToken, course, project } = await setupProject();
      const group = await createGroupInDB(course._id, {
        interestedProjects: [new mongoose.Types.ObjectId(project._id)],
      });

      await request(app)
        .delete(`/api/projects/${project._id}`)
        .set(authHeader(coordToken));

      const updatedGroup = await Group.findById(group._id);
      expect(updatedGroup?.interestedProjects).toHaveLength(0);
    });

    it("should return 401 when no token is provided", async () => {
      const { project } = await setupProject();

      const res = await request(app).delete(`/api/projects/${project._id}`);

      expect(res.status).toBe(401);
    });

    it("should return 403 when called by a Student", async () => {
      const { project } = await setupProject();
      const { token: studentToken } = await registerAndGetToken(defaultStudent);

      const res = await request(app)
        .delete(`/api/projects/${project._id}`)
        .set(authHeader(studentToken));

      expect(res.status).toBe(403);
    });

    it("should return 403 when called by a different Coordinator", async () => {
      const { project } = await setupProject();
      const coord2: TestUser = {
        name: "Coordinator Two",
        email: "coord2@test.com",
        password: "Password123!",
        role: "Course Coordinator",
      };
      const { token: token2 } = await registerAndGetToken(coord2);

      const res = await request(app)
        .delete(`/api/projects/${project._id}`)
        .set(authHeader(token2));

      expect(res.status).toBe(403);
    });

    it("should return 404 when project ID does not exist", async () => {
      const { coordToken } = await setupProject();
      const fakeId = new mongoose.Types.ObjectId().toString();

      const res = await request(app)
        .delete(`/api/projects/${fakeId}`)
        .set(authHeader(coordToken));

      expect(res.status).toBe(404);
    });
  });

  // =====================================================================
  // POST /api/projects/:id/assign-group - Assign Group to Project
  // =====================================================================
  describe("POST /api/projects/:id/assign-group - Assign Group", () => {
    it("should assign a group to a project and return 200", async () => {
      const { coordToken, course, project } = await setupProject();
      const group = await createGroupInDB(course._id);

      const res = await request(app)
        .post(`/api/projects/${project._id}/assign-group`)
        .set(authHeader(coordToken))
        .send({ groupId: group._id.toString() });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.project.assignedGroup).toBe(group._id.toString());
      expect(res.body.data.group.assignedProject).toBe(project._id);
    });

    it("should close both project and group on assignment", async () => {
      const { coordToken, course, project } = await setupProject();
      const group = await createGroupInDB(course._id);

      const res = await request(app)
        .post(`/api/projects/${project._id}/assign-group`)
        .set(authHeader(coordToken))
        .send({ groupId: group._id.toString() });

      expect(res.body.data.project.isOpen).toBe(false);
      expect(res.body.data.group.isOpen).toBe(false);
    });

    it("should clear the groups interestedProjects on assignment", async () => {
      const { coordToken, course, project } = await setupProject();
      const group = await createGroupInDB(course._id, {
        interestedProjects: [new mongoose.Types.ObjectId(project._id)],
      });

      const res = await request(app)
        .post(`/api/projects/${project._id}/assign-group`)
        .set(authHeader(coordToken))
        .send({ groupId: group._id.toString() });

      expect(res.status).toBe(200);
      expect(res.body.data.group.interestedProjects).toHaveLength(0);
    });

    it("should return 400 when project is already assigned to a group", async () => {
      const { coordToken, course, project } = await setupProject();
      const group1 = await createGroupInDB(course._id);
      const group2 = await createGroupInDB(course._id, { groupNumber: 2 });

      await request(app)
        .post(`/api/projects/${project._id}/assign-group`)
        .set(authHeader(coordToken))
        .send({ groupId: group1._id.toString() });

      const res = await request(app)
        .post(`/api/projects/${project._id}/assign-group`)
        .set(authHeader(coordToken))
        .send({ groupId: group2._id.toString() });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("already assigned");
    });

    it("should return 400 when group is already assigned to a project", async () => {
      const { coordToken, course, project } = await setupProject();
      const group = await createGroupInDB(course._id);

      await request(app)
        .post(`/api/projects/${project._id}/assign-group`)
        .set(authHeader(coordToken))
        .send({ groupId: group._id.toString() });

      const project2Res = await request(app)
        .post("/api/projects/")
        .set(authHeader(coordToken))
        .send({ ...validProjectData, courseId: course._id });
      const project2 = project2Res.body.data.project;

      const res = await request(app)
        .post(`/api/projects/${project2._id}/assign-group`)
        .set(authHeader(coordToken))
        .send({ groupId: group._id.toString() });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("already assigned");
    });

    it("should return 400 when group and project are from different courses", async () => {
      const { coordToken, project } = await setupProject();
      const course2Res = await request(app)
        .post("/api/courses/")
        .set(authHeader(coordToken))
        .send({ ...validCourseData, courseSection: "002" });
      const course2 = course2Res.body.data.course;
      const groupInCourse2 = await createGroupInDB(course2._id);

      const res = await request(app)
        .post(`/api/projects/${project._id}/assign-group`)
        .set(authHeader(coordToken))
        .send({ groupId: groupInCourse2._id.toString() });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("same course");
    });

    it("should return 401 when no token is provided", async () => {
      const { course, project } = await setupProject();
      const group = await createGroupInDB(course._id);

      const res = await request(app)
        .post(`/api/projects/${project._id}/assign-group`)
        .send({ groupId: group._id.toString() });

      expect(res.status).toBe(401);
    });

    it("should return 403 when called by a Student", async () => {
      const { course, project } = await setupProject();
      const { token: studentToken } = await registerAndGetToken(defaultStudent);
      const group = await createGroupInDB(course._id);

      const res = await request(app)
        .post(`/api/projects/${project._id}/assign-group`)
        .set(authHeader(studentToken))
        .send({ groupId: group._id.toString() });

      expect(res.status).toBe(403);
    });

    it("should return 404 when project ID does not exist", async () => {
      const { coordToken, course } = await setupProject();
      const group = await createGroupInDB(course._id);
      const fakeId = new mongoose.Types.ObjectId().toString();

      const res = await request(app)
        .post(`/api/projects/${fakeId}/assign-group`)
        .set(authHeader(coordToken))
        .send({ groupId: group._id.toString() });

      expect(res.status).toBe(404);
    });

    it("should return 404 when group ID does not exist", async () => {
      const { coordToken, project } = await setupProject();
      const fakeGroupId = new mongoose.Types.ObjectId().toString();

      const res = await request(app)
        .post(`/api/projects/${project._id}/assign-group`)
        .set(authHeader(coordToken))
        .send({ groupId: fakeGroupId });

      expect(res.status).toBe(404);
    });
  });

  // =====================================================================
  // PATCH /api/projects/:id/unassign-group - Unassign Group from Project
  // =====================================================================
  describe("PATCH /api/projects/:id/unassign-group - Unassign Group", () => {
    // Helper: create project, create group, assign them
    const setupAssignment = async () => {
      const { coordToken, course, project } = await setupProject();
      const group = await createGroupInDB(course._id);
      await request(app)
        .post(`/api/projects/${project._id}/assign-group`)
        .set(authHeader(coordToken))
        .send({ groupId: group._id.toString() });
      return { coordToken, course, project, group };
    };

    it("should unassign group from project and return 200", async () => {
      const { coordToken, project, group } = await setupAssignment();

      const res = await request(app)
        .patch(`/api/projects/${project._id}/unassign-group`)
        .set(authHeader(coordToken))
        .send({ groupId: group._id.toString() });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should reopen both project and group after unassigning", async () => {
      const { coordToken, project, group } = await setupAssignment();

      const res = await request(app)
        .patch(`/api/projects/${project._id}/unassign-group`)
        .set(authHeader(coordToken))
        .send({ groupId: group._id.toString() });

      expect(res.body.data.project.isOpen).toBe(true);
      expect(res.body.data.group.isOpen).toBe(true);
      expect(res.body.data.project.assignedGroup).toBeNull();
      expect(res.body.data.group.assignedProject).toBeNull();
    });

    it("should return 401 when no token is provided", async () => {
      const { project, group } = await setupAssignment();

      const res = await request(app)
        .patch(`/api/projects/${project._id}/unassign-group`)
        .send({ groupId: group._id.toString() });

      expect(res.status).toBe(401);
    });

    it("should return 403 when called by a Student", async () => {
      const { project, group } = await setupAssignment();
      const { token: studentToken } = await registerAndGetToken(defaultStudent);

      const res = await request(app)
        .patch(`/api/projects/${project._id}/unassign-group`)
        .set(authHeader(studentToken))
        .send({ groupId: group._id.toString() });

      expect(res.status).toBe(403);
    });

    it("should return 403 when called by a different Coordinator", async () => {
      const { project, group } = await setupAssignment();
      const coord2: TestUser = {
        name: "Coordinator Two",
        email: "coord2@test.com",
        password: "Password123!",
        role: "Course Coordinator",
      };
      const { token: token2 } = await registerAndGetToken(coord2);

      const res = await request(app)
        .patch(`/api/projects/${project._id}/unassign-group`)
        .set(authHeader(token2))
        .send({ groupId: group._id.toString() });

      expect(res.status).toBe(403);
    });

    it("should return 404 when project ID does not exist", async () => {
      const { coordToken, group } = await setupAssignment();
      const fakeId = new mongoose.Types.ObjectId().toString();

      const res = await request(app)
        .patch(`/api/projects/${fakeId}/unassign-group`)
        .set(authHeader(coordToken))
        .send({ groupId: group._id.toString() });

      expect(res.status).toBe(404);
    });
  });
});
