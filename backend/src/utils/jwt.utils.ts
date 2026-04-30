import jwt from "jsonwebtoken";
import { Response } from "express";
import { env } from "../config/env";

// Interface for JWT payload
export interface JwtPayload {
  userId: string;
  email: string;
  role: "student" | "course coordinator";
  tokenVersion: number;
}

// Generate JWT token
export const generateToken = (payload: JwtPayload): string => {
  // No need for checks or type assertions - env.JWT_SECRET is guaranteed to be a string!
  if (!env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }

  return jwt.sign(payload as object, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRE,
  } as jwt.SignOptions);
};

//Verify and decode JWT token

export const verifyToken = (token: string): JwtPayload => {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    return decoded;
  } catch {
    throw new Error("Invalid or expired token");
  }
};

// Send token in HTTP-only cookie
export const sendTokenCookie = (res: Response, token: string): void => {
  const cookieExpire = parseInt(env.JWT_COOKIE_EXPIRE, 10);

  const options = {
    expires: new Date(Date.now() + cookieExpire * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict" as const,
  };

  res.cookie("token", token, options);
};
