import request from "supertest";
import app from "../../server";

export interface TestUser {
  name: string;
  email: string;
  password: string;
  role: "student" | "course coordinator";
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
};

export const registerAndGetToken = async (
  user: TestUser = defaultCoordinator,
): Promise<{ token: string; userId: string }> => {
  const res = await request(app).post("/api/auth/register").send(user);

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
