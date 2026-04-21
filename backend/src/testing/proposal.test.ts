process.env.JWT_SECRET = "test-jwt-secret-key-for-testing";
process.env.MONGO_URI = "mongodb://localhost:27017/test-placeholder";
process.env.NODE_ENV = "test";
process.env.EMAIL_PROVIDER = "disabled";

import request from "supertest";
import mongoose from "mongoose";
import app from "../server";
import { Proposal } from "../models/Proposal.model";
import { Project } from "../models/Project.model";
import { connectTestDB, disconnectTestDB, clearTestDB } from "./helpers/db";
import {
  authHeader,
  defaultCoordinator,
  defaultStudent,
  registerAndGetToken,
} from "./helpers/auth";
import { validCourseData } from "./helpers/fixtures";

const longDescription =
  "This project proposal describes a meaningful senior design opportunity with enough detail for reviewers to understand the scope, user need, and intended outcome.";

const validStudentProposal = {
  fullName: "Student Proposer",
  email: "student.proposer@stevens.edu",
  department: "Computer Science",
  title: "Campus Accessibility Route Planner",
  description: longDescription,
  problemStatement: "Students need reliable accessible routes across campus.",
  desiredSkills: "React, maps, user research, accessibility testing.",
  preferredFacultyAdvisor: "Dr. Ada Lovelace",
};

const validFacultyProposal = {
  fullName: "Faculty Proposer",
  email: "faculty.proposer@stevens.edu",
  department: "Software Engineering",
  title: "AI Assisted Maintenance Triage",
  description: longDescription,
  industryPartner: "Facilities Team",
  requiredSkills: "Backend development, data analysis, human-centered design.",
  expectedDeliverables: "Prototype dashboard, evaluation report, deployment guide.",
  availableResources: "Access to anonymized ticket exports.",
};

describe("Proposal Routes - /api/proposals", () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  afterEach(async () => {
    await clearTestDB();
  });

  const setupCoordinator = async () => {
    const { token, userId } = await registerAndGetToken(defaultCoordinator);
    return { token, userId };
  };

  const setupCourse = async () => {
    const { token, userId } = await setupCoordinator();
    const courseRes = await request(app)
      .post("/api/courses/")
      .set(authHeader(token))
      .send(validCourseData);
    return { token, userId, course: courseRes.body.data.course };
  };

  describe("public submission", () => {
    it("creates a student proposal without authentication", async () => {
      const res = await request(app)
        .post("/api/proposals/student")
        .send(validStudentProposal);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.proposal.role).toBe("student");
      expect(res.body.data.proposal.status).toBe("Pending Review");
      expect(res.body.data.proposal.proposalId).toMatch(/^STU-/);
    });

    it("creates a faculty proposal without authentication", async () => {
      const res = await request(app)
        .post("/api/proposals/faculty")
        .send(validFacultyProposal);

      expect(res.status).toBe(201);
      expect(res.body.data.proposal.role).toBe("faculty");
      expect(res.body.data.proposal.proposalId).toMatch(/^FAC-/);
    });

    it("rejects short descriptions", async () => {
      const res = await request(app)
        .post("/api/proposals/student")
        .send({ ...validStudentProposal, description: "Too short" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("admin review", () => {
    it("requires coordinator auth to list proposals", async () => {
      await Proposal.create({
        ...validStudentProposal,
        role: "student",
        proposalId: "STU-20260421-ABC123",
        status: "Pending Review",
      });

      const noAuth = await request(app).get("/api/proposals");
      expect(noAuth.status).toBe(401);

      const { token: studentToken } = await registerAndGetToken(defaultStudent);
      const student = await request(app)
        .get("/api/proposals")
        .set(authHeader(studentToken));
      expect(student.status).toBe(403);
    });

    it("lists and filters proposals for coordinators", async () => {
      const { token } = await setupCoordinator();
      await Proposal.create([
        {
          ...validStudentProposal,
          role: "student",
          proposalId: "STU-20260421-ABC123",
          status: "Pending Review",
        },
        {
          ...validFacultyProposal,
          role: "faculty",
          proposalId: "FAC-20260421-ABC123",
          status: "Approved",
        },
      ]);

      const res = await request(app)
        .get("/api/proposals?role=faculty&status=Approved")
        .set(authHeader(token));

      expect(res.status).toBe(200);
      expect(res.body.data.proposals).toHaveLength(1);
      expect(res.body.data.proposals[0].role).toBe("faculty");
    });

    it("updates proposal status and internal notes", async () => {
      const { token } = await setupCoordinator();
      const proposal = await Proposal.create({
        ...validStudentProposal,
        role: "student",
        proposalId: "STU-20260421-ABC123",
        status: "Pending Review",
      });

      const res = await request(app)
        .patch(`/api/proposals/${proposal._id}`)
        .set(authHeader(token))
        .send({ status: "Under Review", internalNotes: "Needs advisor follow-up." });

      expect(res.status).toBe(200);
      expect(res.body.data.proposal.status).toBe("Under Review");
      expect(res.body.data.proposal.internalNotes).toBe("Needs advisor follow-up.");
    });

    it("matches student and faculty proposals", async () => {
      const { token } = await setupCoordinator();
      const studentProposal = await Proposal.create({
        ...validStudentProposal,
        role: "student",
        proposalId: "STU-20260421-ABC123",
        status: "Under Review",
      });
      const facultyProposal = await Proposal.create({
        ...validFacultyProposal,
        role: "faculty",
        proposalId: "FAC-20260421-ABC123",
        status: "Under Review",
      });

      const res = await request(app)
        .post(`/api/proposals/${studentProposal._id}/match`)
        .set(authHeader(token))
        .send({ matchedProposalId: facultyProposal._id.toString() });

      expect(res.status).toBe(200);
      expect(res.body.data.proposal.status).toBe("Matched");

      const updatedFaculty = await Proposal.findById(facultyProposal._id);
      expect(updatedFaculty?.status).toBe("Matched");
      expect(updatedFaculty?.matchedProposal?.toString()).toBe(
        studentProposal._id.toString(),
      );
    });

    it("converts an approved proposal into a project with audit links", async () => {
      const { token, course } = await setupCourse();
      const proposal = await Proposal.create({
        ...validFacultyProposal,
        role: "faculty",
        proposalId: "FAC-20260421-ABC123",
        status: "Approved",
      });

      const res = await request(app)
        .post(`/api/proposals/${proposal._id}/convert-to-project`)
        .set(authHeader(token))
        .send({ courseId: course._id });

      expect(res.status).toBe(201);
      expect(res.body.data.project.name).toBe(validFacultyProposal.title);
      expect(res.body.data.project.sourceProposal).toBe(proposal._id.toString());

      const updatedProposal = await Proposal.findById(proposal._id);
      expect(updatedProposal?.createdProject?.toString()).toBe(
        res.body.data.project._id,
      );
      const project = await Project.findById(res.body.data.project._id);
      expect(project?.sourceProposal?.toString()).toBe(proposal._id.toString());
    });

    it("rejects conversion for a proposal that is not approved or matched", async () => {
      const { token, course } = await setupCourse();
      const proposal = await Proposal.create({
        ...validStudentProposal,
        role: "student",
        proposalId: "STU-20260421-ABC123",
        status: "Pending Review",
      });

      const res = await request(app)
        .post(`/api/proposals/${proposal._id}/convert-to-project`)
        .set(authHeader(token))
        .send({ courseId: course._id });

      expect(res.status).toBe(400);
    });

    it("exports filtered proposals as CSV", async () => {
      const { token } = await setupCoordinator();
      await Proposal.create({
        ...validStudentProposal,
        role: "student",
        proposalId: "STU-20260421-ABC123",
        status: "Pending Review",
      });

      const res = await request(app)
        .get("/api/proposals/export?role=student")
        .set(authHeader(token));

      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toContain("text/csv");
      expect(res.text).toContain("STU-20260421-ABC123");
    });

    it("returns 400 for invalid proposal ids", async () => {
      const { token } = await setupCoordinator();

      const res = await request(app)
        .patch("/api/proposals/not-an-id")
        .set(authHeader(token))
        .send({ status: "Approved" });

      expect(res.status).toBe(400);
    });

    it("returns 404 for missing proposal ids", async () => {
      const { token } = await setupCoordinator();
      const fakeId = new mongoose.Types.ObjectId().toString();

      const res = await request(app)
        .patch(`/api/proposals/${fakeId}`)
        .set(authHeader(token))
        .send({ status: "Approved" });

      expect(res.status).toBe(404);
    });
  });
});
