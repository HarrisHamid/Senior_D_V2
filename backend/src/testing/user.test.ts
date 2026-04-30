process.env.JWT_SECRET = "test-jwt-secret-key-for-testing";
process.env.MONGO_URI = "mongodb://localhost:27017/test-placeholder";
process.env.NODE_ENV = "test";
process.env.EMAIL_PROVIDER = "disabled";

import request from "supertest";
import app from "../server";
import { connectTestDB, disconnectTestDB, clearTestDB } from "./helpers/db";
import {
  registerAndGetToken,
  authHeader,
  defaultStudent,
  defaultCoordinator,
} from "./helpers/auth";

beforeAll(() => connectTestDB());
afterAll(() => disconnectTestDB());
afterEach(() => clearTestDB());

describe("PATCH /api/users — role field rejection", () => {
  it("rejects role: 'course coordinator' with 400", async () => {
    const { token } = await registerAndGetToken(defaultStudent);
    const res = await request(app)
      .patch("/api/users")
      .set(authHeader(token))
      .send({ role: "course coordinator" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("rejects role: 'student' with 400 (no role field allowed at all)", async () => {
    const { token } = await registerAndGetToken(defaultStudent);
    const res = await request(app)
      .patch("/api/users")
      .set(authHeader(token))
      .send({ role: "student" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("rejects any unknown body field with 400", async () => {
    const { token } = await registerAndGetToken(defaultStudent);
    const res = await request(app)
      .patch("/api/users")
      .set(authHeader(token))
      .send({ groupId: "000000000000000000000001" });

    expect(res.status).toBe(400);
  });

  it("allows valid name update and preserves student role", async () => {
    const { token } = await registerAndGetToken(defaultStudent);
    const res = await request(app)
      .patch("/api/users")
      .set(authHeader(token))
      .send({ name: "Alice Updated" });

    expect(res.status).toBe(200);
    expect(res.body.data.user.role).toBe("student");
    expect(res.body.data.user.name).toBe("Alice Updated");
  });

  it("allows valid name update as coordinator and preserves coordinator role", async () => {
    const { token } = await registerAndGetToken(defaultCoordinator);
    const res = await request(app)
      .patch("/api/users")
      .set(authHeader(token))
      .send({ name: "Coord Updated" });

    expect(res.status).toBe(200);
    expect(res.body.data.user.role).toBe("course coordinator");
  });
});
