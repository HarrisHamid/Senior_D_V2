// Set env vars BEFORE importing app (env.ts reads these at import time)
process.env.JWT_SECRET = "test-jwt-secret-key-for-testing";
process.env.MONGO_URI = "mongodb://localhost:27017/test-placeholder";
process.env.NODE_ENV = "test";

import request from "supertest";
import mongoose from "mongoose";
import path from "path";
import fs from "fs";
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

const FIXTURES = path.join(__dirname, "fixtures");
const PDF_PATH = path.join(FIXTURES, "test.pdf");
const TXT_PATH = path.join(FIXTURES, "test.txt");
const BAD_PATH = path.join(FIXTURES, "bad.js");

describe("Upload Routes - /api/uploads", () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await disconnectTestDB();
    // Clean up any uploaded files created during tests
    const uploadsDir = path.join(process.cwd(), "uploads");
    if (fs.existsSync(uploadsDir)) {
      fs.rmSync(uploadsDir, { recursive: true, force: true });
    }
  });

  afterEach(async () => {
    await clearTestDB();
  });

  // Helper: register coordinator + create course + create project
  const setupProject = async (coordinator?: TestUser) => {
    const { token: coordToken, userId } = await registerAndGetToken(
      coordinator || defaultCoordinator,
    );
    const courseRes = await request(app)
      .post("/api/courses/")
      .set(authHeader(coordToken))
      .send(validCourseData);
    const course = courseRes.body.data.course;

    const projectRes = await request(app)
      .post("/api/projects/")
      .set(authHeader(coordToken))
      .send({ ...validProjectData, courseId: course._id });
    const project = projectRes.body.data.project;

    return { coordToken, userId, course, project };
  };

  // =====================================================================
  // POST /api/uploads/:projectId - Upload File
  // =====================================================================
  describe("POST /api/uploads/:projectId - Upload File", () => {
    it("should upload a PDF and return 201", async () => {
      const { coordToken, project } = await setupProject();

      const res = await request(app)
        .post(`/api/uploads/${project._id}`)
        .set(authHeader(coordToken))
        .attach("file", PDF_PATH, { contentType: "application/pdf" });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.file.originalName).toBe("test.pdf");
      expect(res.body.data.file.mimetype).toBe("application/pdf");
    });

    it("should upload a TXT file and return 201", async () => {
      const { coordToken, project } = await setupProject();

      const res = await request(app)
        .post(`/api/uploads/${project._id}`)
        .set(authHeader(coordToken))
        .attach("file", TXT_PATH, { contentType: "text/plain" });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.file.mimetype).toBe("text/plain");
    });

    it("should allow a Student to upload and return 201", async () => {
      const { project } = await setupProject();
      const { token: studentToken } = await registerAndGetToken(defaultStudent);

      const res = await request(app)
        .post(`/api/uploads/${project._id}`)
        .set(authHeader(studentToken))
        .attach("file", TXT_PATH, { contentType: "text/plain" });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it("should return 400 for a disallowed file type", async () => {
      const { coordToken, project } = await setupProject();

      const res = await request(app)
        .post(`/api/uploads/${project._id}`)
        .set(authHeader(coordToken))
        .attach("file", BAD_PATH, { contentType: "application/javascript" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 400 when no file is provided", async () => {
      const { coordToken, project } = await setupProject();

      const res = await request(app)
        .post(`/api/uploads/${project._id}`)
        .set(authHeader(coordToken))
        .send();

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 404 when project does not exist", async () => {
      const { coordToken } = await setupProject();
      const fakeId = new mongoose.Types.ObjectId().toString();

      const res = await request(app)
        .post(`/api/uploads/${fakeId}`)
        .set(authHeader(coordToken))
        .attach("file", TXT_PATH, { contentType: "text/plain" });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it("should return 400 for an invalid projectId", async () => {
      const { coordToken } = await setupProject();

      const res = await request(app)
        .post("/api/uploads/not-an-id")
        .set(authHeader(coordToken))
        .attach("file", TXT_PATH, { contentType: "text/plain" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 401 when unauthenticated", async () => {
      const { project } = await setupProject();

      const res = await request(app)
        .post(`/api/uploads/${project._id}`)
        .attach("file", TXT_PATH, { contentType: "text/plain" });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  // =====================================================================
  // GET /api/uploads/:projectId - List Files
  // =====================================================================
  describe("GET /api/uploads/:projectId - List Files", () => {
    it("should return 200 with empty array when no files uploaded", async () => {
      const { coordToken, project } = await setupProject();

      const res = await request(app)
        .get(`/api/uploads/${project._id}`)
        .set(authHeader(coordToken));

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.files).toHaveLength(0);
      expect(res.body.data.count).toBe(0);
    });

    it("should return 200 with files after upload", async () => {
      const { coordToken, project } = await setupProject();

      await request(app)
        .post(`/api/uploads/${project._id}`)
        .set(authHeader(coordToken))
        .attach("file", TXT_PATH, { contentType: "text/plain" });

      const res = await request(app)
        .get(`/api/uploads/${project._id}`)
        .set(authHeader(coordToken));

      expect(res.status).toBe(200);
      expect(res.body.data.files).toHaveLength(1);
      expect(res.body.data.count).toBe(1);
      expect(res.body.data.files[0].originalName).toBe("test.txt");
    });

    it("should return 404 when project does not exist", async () => {
      const { coordToken } = await setupProject();
      const fakeId = new mongoose.Types.ObjectId().toString();

      const res = await request(app)
        .get(`/api/uploads/${fakeId}`)
        .set(authHeader(coordToken));

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it("should return 401 when unauthenticated", async () => {
      const { project } = await setupProject();

      const res = await request(app).get(`/api/uploads/${project._id}`);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  // =====================================================================
  // GET /api/uploads/:projectId/:fileId - Download File
  // =====================================================================
  describe("GET /api/uploads/:projectId/:fileId - Download File", () => {
    // Helper: upload a file and return its ID
    const uploadFile = async (coordToken: string, projectId: string) => {
      const res = await request(app)
        .post(`/api/uploads/${projectId}`)
        .set(authHeader(coordToken))
        .attach("file", TXT_PATH, { contentType: "text/plain" });
      return res.body.data.file._id as string;
    };

    it("should return 200 with Content-Disposition attachment header", async () => {
      const { coordToken, project } = await setupProject();
      const fileId = await uploadFile(coordToken, project._id);

      const res = await request(app)
        .get(`/api/uploads/${project._id}/${fileId}`)
        .set(authHeader(coordToken));

      expect(res.status).toBe(200);
      expect(res.headers["content-disposition"]).toMatch(/attachment/);
      expect(res.headers["content-disposition"]).toMatch(/test\.txt/);
    });

    it("should return 404 when file does not exist", async () => {
      const { coordToken, project } = await setupProject();
      const fakeFileId = new mongoose.Types.ObjectId().toString();

      const res = await request(app)
        .get(`/api/uploads/${project._id}/${fakeFileId}`)
        .set(authHeader(coordToken));

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it("should return 401 when unauthenticated", async () => {
      const { coordToken, project } = await setupProject();
      const fileId = await uploadFile(coordToken, project._id);

      const res = await request(app).get(
        `/api/uploads/${project._id}/${fileId}`,
      );

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  // =====================================================================
  // DELETE /api/uploads/:projectId/:fileId - Delete File
  // =====================================================================
  describe("DELETE /api/uploads/:projectId/:fileId - Delete File", () => {
    // Helper: upload a file and return its ID
    const uploadFile = async (token: string, projectId: string) => {
      const res = await request(app)
        .post(`/api/uploads/${projectId}`)
        .set(authHeader(token))
        .attach("file", TXT_PATH, { contentType: "text/plain" });
      return res.body.data.file._id as string;
    };

    it("should return 200 when uploader deletes their own file", async () => {
      const { coordToken, project } = await setupProject();
      const fileId = await uploadFile(coordToken, project._id);

      const res = await request(app)
        .delete(`/api/uploads/${project._id}/${fileId}`)
        .set(authHeader(coordToken));

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should return 200 when owning coordinator deletes a file", async () => {
      const { coordToken, project } = await setupProject();
      const { token: studentToken } = await registerAndGetToken(defaultStudent);
      const fileId = await uploadFile(studentToken, project._id);

      const res = await request(app)
        .delete(`/api/uploads/${project._id}/${fileId}`)
        .set(authHeader(coordToken));

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should return 403 when a different student tries to delete", async () => {
      const { coordToken, project } = await setupProject();
      const { token: studentToken } = await registerAndGetToken(defaultStudent);
      const fileId = await uploadFile(coordToken, project._id);

      const res = await request(app)
        .delete(`/api/uploads/${project._id}/${fileId}`)
        .set(authHeader(studentToken));

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it("should return 403 when a non-owning coordinator tries to delete", async () => {
      const { project } = await setupProject();
      const coord2: TestUser = {
        name: "Coordinator Two",
        email: "coord2@test.com",
        password: "Password123!",
        role: "course coordinator",
      };
      const { token: coord2Token } = await registerAndGetToken(coord2);

      // Upload using supertest with coord2 token (they are authenticated but not owner)
      // First upload with a valid user (student) so we have a file to try to delete
      const { token: studentToken } = await registerAndGetToken(defaultStudent);
      const fileId = await uploadFile(studentToken, project._id);

      const res = await request(app)
        .delete(`/api/uploads/${project._id}/${fileId}`)
        .set(authHeader(coord2Token));

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it("should return 404 when file does not exist", async () => {
      const { coordToken, project } = await setupProject();
      const fakeFileId = new mongoose.Types.ObjectId().toString();

      const res = await request(app)
        .delete(`/api/uploads/${project._id}/${fakeFileId}`)
        .set(authHeader(coordToken));

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it("should return 401 when unauthenticated", async () => {
      const { coordToken, project } = await setupProject();
      const fileId = await uploadFile(coordToken, project._id);

      const res = await request(app).delete(
        `/api/uploads/${project._id}/${fileId}`,
      );

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
