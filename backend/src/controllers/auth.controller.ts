import { Request, Response } from "express";
import User from "../models/User.model"; // User model, how does it work here
import { generateToken, sendTokenCookie } from "../utils/jwt.utils";
import { AuthRequest } from "../types";
import {
  issueVerificationCode,
  validateVerificationCode,
} from "../services/verification.service";

// Register a new user
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

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
