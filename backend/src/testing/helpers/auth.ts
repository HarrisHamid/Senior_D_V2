import request from "supertest";
import app from "../../server";
import User from "../../models/User.model";
import { generateToken } from "../../utils/jwt.utils";

export interface TestUser {
  name: string;
  email: string;
  password: string;
  role: "student" | "course coordinator";
  major?: string;
}

export const defaultCoordinator: TestUser = {
  name: "Test Coordinator",
  email: "coordinator@stevens.edu",
  password: "Password123!",
  role: "course coordinator",
};

export const defaultStudent: TestUser = {
  name: "Test Student",
  email: "student@stevens.edu",
  password: "Password123!",
  role: "student",
  major: "Computer Science",
};

export const registerAndGetToken = async (
  user: TestUser = defaultCoordinator,
): Promise<{ token: string; userId: string }> => {
  if (user.role === "course coordinator") {
    // Coordinators cannot self-register via the API — create directly in DB
    const created = await User.create({
      name: user.name,
      email: user.email,
      password: user.password,
      role: "course coordinator",
      verificationNeeded: false,
    });
    const token = generateToken({
      userId: created._id.toString(),
      email: created.email,
      role: "course coordinator",
      tokenVersion: created.tokenVersion,
    });
    return { token, userId: created._id.toString() };
  }

  const res = await request(app)
    .post("/api/auth/register")
    .send({
      name: user.name,
      email: user.email,
      password: user.password,
      major: user.major ?? "Computer Science",
    });

  return {
    token: res.body.data.token,
    userId: res.body.data.user.id,
  };
};

export const loginAndGetToken = async (
  email: string,
  password: string,
): Promise<{ token: string; userId: string }> => {
  const res = await request(app)
    .post("/api/auth/login")
    .send({ email, password });

  return {
    token: res.body.data.token,
    userId: res.body.data.user.id,
  };
};

export const authHeader = (token: string) => ({
  Authorization: `Bearer ${token}`,
});
