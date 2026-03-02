// Set env vars BEFORE importing app (env.ts reads these at import time)
process.env.JWT_SECRET = "test-jwt-secret-key-for-testing";
process.env.MONGO_URI = "mongodb://localhost:27017/test-placeholder";
process.env.NODE_ENV = "test";

import jwt from "jsonwebtoken";
import request from "supertest";
import app from "../server";
import { connectTestDB, disconnectTestDB, clearTestDB } from "./helpers/db";
import { defaultCoordinator, defaultStudent } from "./helpers/auth";
import { generateToken, verifyToken, JwtPayload } from "../utils/jwt.utils";
import { env } from "../config/env";

const samplePayload: JwtPayload = {
  userId: "64abc123def456789012abcd",
  email: "jwt-test@example.com",
  role: "Student",
};

describe("JWT Token - generateToken / verifyToken", () => {
  describe("Valid token generation", () => {
    it("should return a non-empty JWT string with three base64url segments", () => {
      const token = generateToken(samplePayload);
      expect(typeof token).toBe("string");
      expect(token.length).toBeGreaterThan(0);
      expect(token.split(".")).toHaveLength(3);
    });
  });

  describe("Token contains required claims", () => {
    it("should include exp and iat standard claims", () => {
      const token = generateToken(samplePayload);
      const decoded = jwt.decode(token) as Record<string, unknown>;
      expect(decoded).toHaveProperty("exp");
      expect(decoded).toHaveProperty("iat");
      expect(typeof decoded.exp).toBe("number");
      expect(typeof decoded.iat).toBe("number");
    });
  });

  describe("Custom payload inclusion", () => {
    it("should encode userId, email, and role in the token", () => {
      const token = generateToken(samplePayload);
      const decoded = jwt.decode(token) as Record<string, unknown>;
      expect(decoded.userId).toBe(samplePayload.userId);
      expect(decoded.email).toBe(samplePayload.email);
      expect(decoded.role).toBe(samplePayload.role);
    });

    it("should round-trip correctly through verifyToken", () => {
      const token = generateToken(samplePayload);
      const verified = verifyToken(token);
      expect(verified.userId).toBe(samplePayload.userId);
      expect(verified.email).toBe(samplePayload.email);
      expect(verified.role).toBe(samplePayload.role);
    });
  });

  describe("Token expiration setting", () => {
    it("should set exp to 7 days after iat", () => {
      const token = generateToken(samplePayload);
      const decoded = jwt.decode(token) as Record<string, unknown>;
      const exp = decoded.exp as number;
      const iat = decoded.iat as number;
      const sevenDaysInSeconds = 7 * 24 * 60 * 60;
      expect(exp - iat).toBe(sevenDaysInSeconds);
    });

    it("should set iat to approximately the current time", () => {
      const before = Math.floor(Date.now() / 1000);
      const token = generateToken(samplePayload);
      const after = Math.floor(Date.now() / 1000);
      const decoded = jwt.decode(token) as Record<string, unknown>;
      expect(decoded.iat as number).toBeGreaterThanOrEqual(before);
      expect(decoded.iat as number).toBeLessThanOrEqual(after);
    });
  });

  describe("Invalid secret handling", () => {
    it("should throw when verifying a token signed with a different secret", () => {
      const token = generateToken(samplePayload);
      expect(() => jwt.verify(token, "wrong-secret")).toThrow();
    });

    it("verifyToken should throw 'Invalid or expired token' for a tampered signature", () => {
      const token = generateToken(samplePayload);
      const [header, payload] = token.split(".");
      const tampered = `${header}.${payload}.invalidsignature`;
      expect(() => verifyToken(tampered)).toThrow("Invalid or expired token");
    });

    it("verifyToken should throw 'Invalid or expired token' for a token signed with the wrong secret", () => {
      const forgedToken = jwt.sign(samplePayload as object, "wrong-secret", {
        expiresIn: "7d",
      });
      expect(() => verifyToken(forgedToken)).toThrow(
        "Invalid or expired token",
      );
    });

    it("generateToken should throw when JWT_SECRET is missing", () => {
      const original = (env as { JWT_SECRET: string }).JWT_SECRET;
      (env as { JWT_SECRET: string }).JWT_SECRET = "";
      expect(() => generateToken(samplePayload)).toThrow(
        "JWT_SECRET is not defined",
      );
      (env as { JWT_SECRET: string }).JWT_SECRET = original;
    });
  });
});

describe("Auth Routes - /api/auth", () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  afterEach(async () => {
    await clearTestDB();
  });

  // POST /api/auth/register
  describe("POST /api/auth/register", () => {
    it("should register a new Student and return 201", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send(defaultStudent);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(defaultStudent.email);
      expect(res.body.data.user.role).toBe("Student");
      expect(res.body.data.token).toBeDefined();
    });

    it("should register a new Course Coordinator and return 201", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send(defaultCoordinator);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe("Course Coordinator");
      expect(res.body.data.token).toBeDefined();
    });

    it("should not return password in the response", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send(defaultStudent);

      expect(res.status).toBe(201);
      expect(res.body.data.user.password).toBeUndefined();
    });

    it("should set a token cookie in the response", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send(defaultStudent);

      const cookies = res.headers["set-cookie"] as unknown as string[];
      expect(cookies).toBeDefined();
      expect(cookies.some((c: string) => c.startsWith("token="))).toBe(true);
    });

    it("should return 400 when email is already registered", async () => {
      await request(app).post("/api/auth/register").send(defaultStudent);

      const res = await request(app)
        .post("/api/auth/register")
        .send(defaultStudent);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain("already exists");
    });

    it("should return 500 when name is missing", async () => {
      const { name: _name, ...noName } = defaultStudent;
      const res = await request(app).post("/api/auth/register").send(noName);

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });

    it("should return 500 when email is missing", async () => {
      const { email: _email, ...noEmail } = defaultStudent;
      const res = await request(app).post("/api/auth/register").send(noEmail);

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });

    it("should return 500 when password is missing", async () => {
      const { password: _password, ...noPassword } = defaultStudent;
      const res = await request(app)
        .post("/api/auth/register")
        .send(noPassword);

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });

    it("should return 500 when role is missing", async () => {
      const { role: _role, ...noRole } = defaultStudent;
      const res = await request(app).post("/api/auth/register").send(noRole);

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });

    it("should return 500 when password is shorter than 8 characters", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ ...defaultStudent, password: "short" });

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  // POST /api/auth/login
  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      await request(app).post("/api/auth/register").send(defaultStudent);
    });

    it("should login with correct credentials and return 200", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: defaultStudent.email,
        password: defaultStudent.password,
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe(defaultStudent.email);
      expect(res.body.data.user.role).toBe("Student");
    });

    it("should not return password in the login response", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: defaultStudent.email,
        password: defaultStudent.password,
      });

      expect(res.body.data.user.password).toBeUndefined();
    });

    it("should set a token cookie on login", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: defaultStudent.email,
        password: defaultStudent.password,
      });

      const cookies = res.headers["set-cookie"] as unknown as string[];
      expect(cookies).toBeDefined();
      expect(cookies.some((c: string) => c.startsWith("token="))).toBe(true);
    });

    it("should return 401 when email does not exist", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "nonexistent@test.com", password: "Password123!" });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe("Invalid email or password");
    });

    it("should return 401 when password is incorrect", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: defaultStudent.email, password: "WrongPassword123!" });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe("Invalid email or password");
    });

    it("should return same error message for wrong email and wrong password", async () => {
      const wrongEmail = await request(app)
        .post("/api/auth/login")
        .send({ email: "nonexistent@test.com", password: "Password123!" });

      const wrongPassword = await request(app)
        .post("/api/auth/login")
        .send({ email: defaultStudent.email, password: "WrongPassword123!" });

      expect(wrongEmail.body.error).toBe(wrongPassword.body.error);
    });
  });

  // POST /api/auth/logout
  describe("POST /api/auth/logout", () => {
    it("should return 200 and clear the token cookie", async () => {
      const res = await request(app).post("/api/auth/logout");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Logged out successfully");

      const cookies = res.headers["set-cookie"] as unknown as string[];
      expect(cookies).toBeDefined();
      // Cookie should be cleared (set to empty with past expiry)
      expect(cookies.some((c: string) => c.startsWith("token=;"))).toBe(true);
    });
  });

  // GET /api/auth/me
  describe("GET /api/auth/me", () => {
    it("should return current user when authenticated via Bearer token", async () => {
      const registerRes = await request(app)
        .post("/api/auth/register")
        .send(defaultStudent);
      const token = registerRes.body.data.token;

      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(defaultStudent.email);
      expect(res.body.data.user.role).toBe("Student");
      expect(res.body.data.user.name).toBe(defaultStudent.name);
    });

    it("should return user data including verificationNeeded, course, and groupId fields", async () => {
      const registerRes = await request(app)
        .post("/api/auth/register")
        .send(defaultStudent);
      const token = registerRes.body.data.token;

      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${token}`);

      expect(res.body.data.user).toHaveProperty("verificationNeeded");
      expect(res.body.data.user).toHaveProperty("course");
      expect(res.body.data.user).toHaveProperty("groupId");
    });

    it("should return 401 when no token is provided", async () => {
      const res = await request(app).get("/api/auth/me");

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should return 401 when token is invalid", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", "Bearer invalid-token-here");

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should return 401 when token is malformed (no Bearer prefix)", async () => {
      const registerRes = await request(app)
        .post("/api/auth/register")
        .send(defaultStudent);
      const token = registerRes.body.data.token;

      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", token);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
