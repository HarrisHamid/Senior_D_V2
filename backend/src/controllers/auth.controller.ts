import crypto from "crypto";
import { Request, Response } from "express";
import User from "../models/User.model"; // User model, how does it work here
import PasswordResetToken from "../models/PasswordResetToken.model";
import { generateToken, sendTokenCookie } from "../utils/jwt.utils";
import { AuthRequest } from "../types";
import {
  issueVerificationCode,
  validateVerificationCode,
} from "../services/verification.service";
import { sendPasswordResetEmail } from "../services/email.service";
import { env } from "../config/env";

// Register a new user
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, school, major } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        success: false,
        error: "User with this email already exists",
      });
      return;
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      role,
      school: school || null,
      major: major || null,
      verificationNeeded: true,
    });

    await issueVerificationCode(user._id, user.email);

    // Generate JWT token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Send token as cookie
    sendTokenCookie(res, token);

    // Send response
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          school: user.school,
          major: user.major,
          verificationNeeded: user.verificationNeeded,
          course: user.course,
          groupId: user.groupId,
        },
        token,
      },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Error registering user";
    res.status(500).json({
      success: false,
      error: message,
    });
  }
};

// Login user
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user and include password field
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
      return;
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
      return;
    }

    // Generate JWT token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Send token as cookie
    sendTokenCookie(res, token);

    // Send response
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          school: user.school,
          major: user.major,
          verificationNeeded: user.verificationNeeded,
          course: user.course,
          groupId: user.groupId,
        },
        token,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error logging in";
    res.status(500).json({
      success: false,
      error: message,
    });
  }
};

// Logout user
export const logout = (_req: Request, res: Response): void => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
    secure: env.NODE_ENV === "production",
    sameSite: "strict" as const,
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

// Get current user
export const getCurrentUser = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: "Not authenticated",
      });
      return;
    }

    // Fetch fresh user data from database
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      res.status(404).json({
        success: false,
        error: "User not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          school: user.school,
          major: user.major,
          verificationNeeded: user.verificationNeeded,
          course: user.course,
          groupId: user.groupId,
        },
      },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Error fetching user";
    res.status(500).json({
      success: false,
      error: message,
    });
  }
};

export const resendVerificationCode = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: "Not authenticated",
      });
      return;
    }

    if (!req.user.verificationNeeded) {
      res.status(400).json({
        success: false,
        error: "Email is already verified",
      });
      return;
    }

    await issueVerificationCode(req.user._id, req.user.email);

    res.status(200).json({
      success: true,
      message: "Verification code sent",
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Error sending verification code";

    res.status(500).json({
      success: false,
      error: message,
    });
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email } = req.body as { email: string };

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    console.log(
      "[forgotPassword] email lookup:",
      email.toLowerCase().trim(),
      "found:",
      !!user,
    );

    // Always respond 200 to avoid leaking whether an email exists
    if (!user) {
      res.status(200).json({
        success: true,
        message:
          "If an account with that email exists, a reset link has been sent.",
      });
      return;
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    const ttlMinutes = parseInt(env.PASSWORD_RESET_TOKEN_EXPIRES_MINUTES, 10);
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

    await PasswordResetToken.findOneAndUpdate(
      { userId: user._id },
      { userId: user._id, tokenHash, expiresAt },
      { upsert: true, setDefaultsOnInsert: true, new: true },
    );

    const resetLink = `${env.FRONTEND_URL}/reset-password/${rawToken}`;
    await sendPasswordResetEmail(user.email, resetLink, ttlMinutes);

    res.status(200).json({
      success: true,
      message:
        "If an account with that email exists, a reset link has been sent.",
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Error processing request";
    res.status(500).json({ success: false, error: message });
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { token } = req.params as { token: string };
    const { password } = req.body as { password: string };

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    // tokenHash is select:false but can still be used as a filter
    const record = await PasswordResetToken.findOne({ tokenHash });

    if (!record || record.expiresAt.getTime() < Date.now()) {
      if (record) await PasswordResetToken.deleteOne({ _id: record._id });
      res.status(400).json({
        success: false,
        error: "Reset link is invalid or has expired.",
      });
      return;
    }

    const user = await User.findById(record.userId).select("+password");
    if (!user) {
      res.status(400).json({ success: false, error: "User not found." });
      return;
    }

    user.password = password;
    await user.save();

    await PasswordResetToken.deleteOne({ _id: record._id });

    res.status(200).json({
      success: true,
      message: "Password reset successfully. You can now log in.",
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Error resetting password";
    res.status(500).json({ success: false, error: message });
  }
};

export const verifyEmailCode = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: "Not authenticated",
      });
      return;
    }

    const { code } = req.body as { code?: string };
    if (!code || typeof code !== "string") {
      res.status(400).json({
        success: false,
        error: "Verification code is required",
      });
      return;
    }

    const isValid = await validateVerificationCode(
      req.user._id,
      req.user.email,
      code,
    );

    if (!isValid) {
      res.status(400).json({
        success: false,
        error: "Invalid or expired verification code",
      });
      return;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { verificationNeeded: false },
      { new: true },
    );

    if (!updatedUser) {
      res.status(404).json({
        success: false,
        error: "User not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      data: {
        user: {
          id: updatedUser._id,
          email: updatedUser.email,
          verificationNeeded: updatedUser.verificationNeeded,
        },
      },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Error verifying email";
    res.status(500).json({
      success: false,
      error: message,
    });
  }
};
